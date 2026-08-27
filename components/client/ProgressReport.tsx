'use client';

/**
 * "Було / стало" — the screen a therapist turns towards the patient.
 *
 * This exists for one specific conversation, described by a physiotherapist:
 * a patient comes back after two weeks and says nothing has changed, it still
 * hurts. They are not lying. Recalled pain is coloured by present pain, so
 * gradual improvement is genuinely not felt — and a patient who believes
 * treatment is not working stops coming.
 *
 * A paper scale gives two numbers, first visit and today, and can lose that
 * argument: if the patient came in on a bad day, those two numbers agree with
 * them. Thirty daily entries cannot be argued with, and a bad day is visibly
 * a bad day rather than a result.
 *
 * So the design brief is unusual — this is not a dashboard. It is read once,
 * from a metre away, upside down, by someone who is not looking for detail.
 * Large numbers, one line, no tooltips, nothing that rewards study.
 */

import { X } from 'lucide-react';

import {
	INTENSITY_COLORS,
	comparison,
	rollingAverage,
	type PainEntry,
} from '@/supabase/pain-entries';
import { BodyMapView } from './BodyMapView';

const W = 640;
const H = 200;
const PAD = { left: 28, right: 16, top: 12, bottom: 24 };

export function ProgressReport({
	entries,
	onClose,
}: {
	entries: PainEntry[];
	onClose: () => void;
}) {
	const summary = comparison(entries);

	if (!summary) {
		return (
			<Frame onClose={onClose}>
				<p className="text-sm text-muted-foreground">
					Потрібно щонайменше два записи, щоб було що порівнювати.
				</p>
			</Frame>
		);
	}

	const improved = summary.change < 0;

	return (
		<Frame onClose={onClose}>
			<div className="space-y-8">
				<div className="flex items-end justify-center gap-8 flex-wrap">
					<Reading
						label={`${summary.days} днів тому`}
						value={summary.first.intensity}
						muted
					/>

					<div className="text-3xl text-muted-foreground pb-3">→</div>

					<Reading label="сьогодні" value={summary.latest.intensity} />
				</div>

				{summary.todayIsOutlier && (
					<p className="text-center text-sm bg-amber-50 text-amber-800 rounded-lg px-4 py-2.5 max-w-md mx-auto">
						Сьогодні гірше, ніж зазвичай останнім часом — у середньому за
						тиждень {summary.recentMean.toFixed(1)}. Один день не скасовує
						динаміку.
					</p>
				)}

				<Chart entries={entries} />

				<div className="flex items-start justify-center gap-10 flex-wrap">
					<Snapshot
						label={`Було — ${formatDate(summary.first.entry_date)}`}
						locations={summary.first.locations}
					/>
					<Snapshot
						label={`Зараз — ${formatDate(summary.latest.entry_date)}`}
						locations={summary.latest.locations}
					/>
				</div>

				<p className="text-center text-sm text-muted-foreground">
					{summary.count} записів за {summary.days} днів
					{improved && ' · біль зменшився'}
				</p>
			</div>
		</Frame>
	);
}

function Frame({
	children,
	onClose,
}: {
	children: React.ReactNode;
	onClose: () => void;
}) {
	return (
		<div className="border rounded-xl bg-white p-6 relative">
			<button
				onClick={onClose}
				className="absolute top-4 right-4 text-muted-foreground hover:text-black"
				aria-label="Закрити"
			>
				<X className="w-5 h-5" />
			</button>
			{children}
		</div>
	);
}

function Reading({
	label,
	value,
	muted,
}: {
	label: string;
	value: number;
	muted?: boolean;
}) {
	return (
		<div className="text-center">
			<div
				className={`font-bold leading-none ${muted ? 'text-5xl' : 'text-7xl'}`}
				style={{ color: INTENSITY_COLORS[value], opacity: muted ? 0.65 : 1 }}
			>
				{value}
			</div>
			<p className="text-sm text-muted-foreground mt-2">{label}</p>
		</div>
	);
}

/**
 * Daily points plus the seven-day average.
 *
 * The x axis is real time, not entry number. Someone who recorded ten times
 * across a month would otherwise appear on an evenly spaced axis, which
 * silently redraws a two-week gap as a single step and flatters the trend.
 */
function Chart({ entries }: { entries: PainEntry[] }) {
	const ordered = [...entries].reverse();
	const avg = rollingAverage(entries);

	const t0 = new Date(ordered[0].entry_date).getTime();
	const t1 = new Date(ordered[ordered.length - 1].entry_date).getTime();
	const span = Math.max(1, t1 - t0);

	const x = (date: string) =>
		PAD.left +
		((new Date(date).getTime() - t0) / span) * (W - PAD.left - PAD.right);
	const y = (value: number) =>
		PAD.top + ((10 - value) / 10) * (H - PAD.top - PAD.bottom);

	const line = avg
		.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.date).toFixed(1)} ${y(p.value).toFixed(1)}`)
		.join(' ');

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			className="w-full"
			role="img"
			aria-label="Динаміка болю"
		>
			{[0, 5, 10].map(v => (
				<g key={v}>
					<line
						x1={PAD.left}
						x2={W - PAD.right}
						y1={y(v)}
						y2={y(v)}
						stroke="#E4E4E7"
						strokeWidth={1}
					/>
					<text x={4} y={y(v) + 4} fontSize={11} fill="#A1A1AA">
						{v}
					</text>
				</g>
			))}

			{/* Raw entries, deliberately faint — the eye should follow the line,
			    but the underlying scatter stays visible so nothing looks smoothed
			    away. */}
			{ordered.map(e => (
				<circle
					key={e.id}
					cx={x(e.entry_date)}
					cy={y(e.intensity)}
					r={3}
					fill={INTENSITY_COLORS[e.intensity]}
					opacity={0.45}
				/>
			))}

			<path d={line} fill="none" stroke="#7C3AED" strokeWidth={3} strokeLinejoin="round" />

			<text x={PAD.left} y={H - 6} fontSize={11} fill="#A1A1AA">
				{formatDate(ordered[0].entry_date)}
			</text>
			<text x={W - PAD.right} y={H - 6} fontSize={11} fill="#A1A1AA" textAnchor="end">
				{formatDate(ordered[ordered.length - 1].entry_date)}
			</text>
		</svg>
	);
}

function Snapshot({
	label,
	locations,
}: {
	label: string;
	locations: string[];
}) {
	return (
		<div className="text-center">
			<BodyMapView locations={locations} width={84} />
			<p className="text-xs text-muted-foreground mt-2">{label}</p>
		</div>
	);
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('uk-UA', {
		day: 'numeric',
		month: 'short',
	});
}
