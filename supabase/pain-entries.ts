/**
 * The patient's self-reports, read from the therapist's side.
 *
 * Written by the mobile app, read here. Nothing in the web app writes to this
 * table — a self-report is the patient's account of their own week, and a
 * clinician editing it would make the record meaningless.
 */

import { supabase } from './supabase';
import type {
	FunctionalLimitationId,
	PainTypeId,
} from '@/lib/assessment-types';

export interface PainEntry {
	id: string;
	client_id: string;
	/** YYYY-MM-DD */
	entry_date: string;
	intensity: number;
	/** Body-map region ids. Strings, not a union — old rows hold the former ids. */
	locations: string[];
	types: PainTypeId[];
	/** What the pain prevents — the effect. */
	limitations: FunctionalLimitationId[];
	/** What makes it worse — the cause. Null on rows written before migration 002. */
	triggers: string[] | null;
	note: string;
	created_at: string;
	updated_at: string;
}

export async function listPainEntries(clientId: string): Promise<PainEntry[]> {
	const { data, error } = await supabase
		.from('pain_entries')
		.select('*')
		.eq('client_id', clientId)
		.order('entry_date', { ascending: false })
		.limit(120);

	if (error) throw error;
	return data ?? [];
}

/** Colour per intensity 0–10, matching the mobile app exactly. */
export const INTENSITY_COLORS = [
	'#22C55E',
	'#4ADE80',
	'#A3E635',
	'#FACC15',
	'#FBBF24',
	'#F59E0B',
	'#F97316',
	'#EA580C',
	'#DC2626',
	'#B91C1C',
	'#7F1D1D',
] as const;

/**
 * Mean intensity over the most recent `days` entries, and the change against
 * the block before it.
 *
 * This is the number the therapist actually wants: not "how bad is it today"
 * but "is this going in the right direction". A single day is noise — someone
 * slept badly, or lifted something they should not have.
 */
export function trend(entries: PainEntry[], days = 7) {
	const recent = entries.slice(0, days);
	const previous = entries.slice(days, days * 2);

	if (recent.length === 0) return null;

	const mean = (list: PainEntry[]) =>
		list.reduce((sum, e) => sum + e.intensity, 0) / list.length;

	const current = mean(recent);
	// No comparison until there is a full previous block; a "change" measured
	// against two data points would be worse than showing nothing.
	const change = previous.length >= Math.min(3, days) ? current - mean(previous) : null;

	return { current, change, count: recent.length };
}

/**
 * How often each region was reported, as a fraction of the entries considered.
 *
 * Turns a month of diary into one picture: the region marked every day and the
 * one marked once are the same word in a list, but different shades here. That
 * difference is usually the first thing a therapist wants — which area is the
 * actual problem, and which was a bad day.
 */
export function regionFrequency(
	entries: PainEntry[],
	days = 30,
): { weights: Record<string, number>; ids: string[]; sampled: number } {
	const sample = entries.slice(0, days);
	const counts: Record<string, number> = {};

	for (const entry of sample) {
		// A region marked twice in one entry must not count twice.
		for (const id of new Set(entry.locations)) {
			counts[id] = (counts[id] ?? 0) + 1;
		}
	}

	const weights: Record<string, number> = {};
	for (const [id, n] of Object.entries(counts)) {
		weights[id] = sample.length === 0 ? 0 : n / sample.length;
	}

	// Most frequent first — the therapist reads the top of the list, not all of it.
	const ids = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

	return { weights, ids, sampled: sample.length };
}

/**
 * Seven-day rolling mean, plotted against real dates.
 *
 * Raw daily numbers are noisy — the same person on two consecutive days will
 * answer differently for reasons that have nothing to do with treatment. The
 * average is what shows direction; the raw points stay visible underneath so
 * the smoothing is not hiding anything.
 *
 * Averaged over a date window rather than a count of entries: someone who
 * recorded three times one week and once the next should not have those
 * weighted equally.
 */
export function rollingAverage(
	entries: PainEntry[],
	windowDays = 7,
): { date: string; value: number }[] {
	// Oldest first — the chart reads left to right.
	const ordered = [...entries].reverse();

	return ordered.map((entry, i) => {
		const end = new Date(entry.entry_date).getTime();
		const start = end - windowDays * 86_400_000;

		let sum = 0;
		let count = 0;
		for (let j = i; j >= 0; j--) {
			if (new Date(ordered[j].entry_date).getTime() < start) break;
			sum += ordered[j].intensity;
			count++;
		}

		return {
			date: entry.entry_date,
			value: count === 0 ? entry.intensity : sum / count,
		};
	});
}

/**
 * The comparison a therapist turns towards the patient.
 *
 * `todayIsOutlier` exists for the specific failure this is meant to prevent:
 * a patient arrives on a bad day, says nothing has changed, and a two-point
 * paper record agrees with them. If today sits above the person's own recent
 * average, that is worth saying out loud rather than letting one number stand
 * for the whole fortnight.
 */
export function comparison(entries: PainEntry[]) {
	if (entries.length < 2) return null;

	const latest = entries[0];
	const first = entries[entries.length - 1];

	const recent = entries.slice(0, 7);
	const recentMean = recent.reduce((s, e) => s + e.intensity, 0) / recent.length;

	const days = Math.round(
		(new Date(latest.entry_date).getTime() -
			new Date(first.entry_date).getTime()) /
			86_400_000,
	);

	return {
		first,
		latest,
		days,
		count: entries.length,
		recentMean,
		// A whole point above their own recent average — beyond the noise floor.
		todayIsOutlier: latest.intensity - recentMean >= 1,
		change: latest.intensity - first.intensity,
	};
}
