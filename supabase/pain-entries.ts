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
