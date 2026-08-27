'use client';

/**
 * What the patient reported, shown to the therapist.
 *
 * The chart comes first on purpose. A therapist opening this before a session
 * has about ten seconds, and the question is always the same — better or
 * worse than last time? The individual entries matter afterwards, to explain
 * a spike.
 */

import { useState } from 'react';
import { TrendingDown, TrendingUp, Minus, Presentation } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProgressReport } from './ProgressReport';

import {
	INTENSITY_COLORS,
	regionFrequency,
	trend,
	type PainEntry,
} from '@/supabase/pain-entries';
import { regionLabel, triggerLabel } from '@/lib/body-map';
import { lastEntriesLabel } from '@/lib/plural';
import { BodyMapView } from './BodyMapView';
import { useLocale } from '@/lib/i18n';

export function PainDiary({ entries }: { entries: PainEntry[] }) {
	const { t, locale } = useLocale();
	const d = t.clients.diary;
	const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';
	const [showReport, setShowReport] = useState(false);

	if (entries.length === 0) {
		return (
			<div className="border rounded-xl p-8 text-center mt-4">
				<p className="text-sm font-medium">{d.emptyTitle}</p>
				<p className="text-xs text-muted-foreground mt-1">{d.emptyBody}</p>
			</div>
		);
	}

	const summary = trend(entries);
	// Oldest on the left, so the chart reads left to right like a timeline.
	const chart = entries.slice(0, 30).reverse();
	// One or two bars is not a chart — it is a coloured rectangle that invites
	// the reader to see a trend in a single day.
	const showChart = chart.length >= 3;

	const frequency = regionFrequency(entries);
	// Same rule as the chart: a rate needs enough days behind it to mean
	// anything. Under seven, show which regions were marked and nothing more.
	const showPercentages = frequency.sampled >= 7;

	// With one or two entries the summary card is not a summary — it repeats
	// the single entry directly below it, with an average of one number and a
	// map of the same regions. Nothing is lost by leaving it out.
	const showSummary = summary !== null && entries.length >= 3;

	if (showReport) {
		return (
			<div className="mt-4 max-w-3xl">
				<ProgressReport entries={entries} onClose={() => setShowReport(false)} />
			</div>
		);
	}

	return (
		<div className="space-y-4 mt-4">
			{entries.length >= 2 && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowReport(true)}
					className="max-w-2xl"
				>
					<Presentation className="w-4 h-4 mr-1.5" />
					Показати пацієнту
				</Button>
			)}

			{showSummary && summary && (
				<div className="border rounded-xl p-5 max-w-2xl">
					{/* The overview map is the first thing on the tab and the largest
					    thing on it, because "which area is the actual problem" is the
					    question a therapist opens this with. */}
					<div className="flex gap-6 flex-wrap">
						<BodyMapView
							locations={frequency.ids}
							weights={frequency.weights}
							showWeightLabel={showPercentages}
							width={132}
						/>

						<div className="flex-1 min-w-[240px] space-y-4">
							<div className="flex items-baseline justify-between flex-wrap gap-2">
								<div className="flex items-baseline gap-3">
									<span
										className="text-3xl font-bold"
										style={{
											color: INTENSITY_COLORS[Math.round(summary.current)],
										}}
									>
										{summary.current.toFixed(1)}
									</span>
									<span className="text-sm text-muted-foreground">
										{d.averageOver.replace(
											'{period}',
											lastEntriesLabel(summary.count, locale),
										)}
									</span>
								</div>

								{summary.change !== null && (
									<Change value={summary.change} label={d} />
								)}
							</div>

							{frequency.ids.length > 0 && (
								<div>
									<p className="text-[11px] text-muted-foreground mb-1.5">
										{showPercentages ? 'Найчастіше болить' : 'Позначені зони'}
									</p>
									<div className="flex flex-wrap gap-1">
										{frequency.ids.slice(0, 6).map(id => (
											<span
												key={id}
												className="text-[11px] bg-violet-50 text-violet-700 rounded-full px-2 py-0.5"
											>
												{regionLabel(id)}
												{/* A percentage over five days reads as a finding.
												    "100% of 3 entries" is one week of one person and
												    should not be dressed up as a rate — below the
												    threshold the labels stand on their own. */}
												{showPercentages &&
													` ${Math.round(frequency.weights[id] * 100)}%`}
											</span>
										))}
									</div>
								</div>
							)}

							{showChart && (
								<div className="space-y-1">
									<div className="flex items-end gap-1 h-20">
										{chart.map(entry => (
											<div
												key={entry.id}
												// max-width so three entries read as three days
												// instead of one wide block filling the card.
												className="flex-1 max-w-[24px] flex flex-col justify-end h-full group"
												title={`${entry.entry_date} — ${entry.intensity}/10`}
											>
												<div
													className="w-full rounded-sm transition-opacity group-hover:opacity-70"
													style={{
														// Floor of 4% so a pain-free day is a visible
														// mark rather than a gap that reads as missing.
														height: `${Math.max(4, (entry.intensity / 10) * 100)}%`,
														backgroundColor: INTENSITY_COLORS[entry.intensity],
													}}
												/>
											</div>
										))}
									</div>

									<div className="flex justify-between text-[11px] text-muted-foreground">
										<span>
											{new Date(chart[0].entry_date).toLocaleDateString(
												dateLocale,
												{ day: 'numeric', month: 'short' },
											)}
										</span>
										<span>
											{new Date(
												chart[chart.length - 1].entry_date,
											).toLocaleDateString(dateLocale, {
												day: 'numeric',
												month: 'short',
											})}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<div className="space-y-2">
				{entries.map(entry => (
					<EntryRow key={entry.id} entry={entry} dateLocale={dateLocale} />
				))}
			</div>
		</div>
	);
}

function Change({
	value,
	label,
}: {
	value: number;
	label: { improving: string; worsening: string; steady: string };
}) {
	// Half a point on a 0–10 self-report is inside the noise floor: the same
	// person on the same day will not answer identically twice. Anything below
	// that is reported as steady rather than dressed up as a trend.
	const flat = Math.abs(value) < 0.5;

	const tone = flat
		? 'text-muted-foreground'
		: value < 0
			? 'text-green-600'
			: 'text-red-600';

	const Icon = flat ? Minus : value < 0 ? TrendingDown : TrendingUp;
	const text = flat ? label.steady : value < 0 ? label.improving : label.worsening;

	return (
		<span className={`flex items-center gap-1.5 text-sm font-medium ${tone}`}>
			<Icon className="w-4 h-4" />
			{text}
			{!flat && <span className="text-xs">({value > 0 ? '+' : ''}{value.toFixed(1)})</span>}
		</span>
	);
}

function EntryRow({
	entry,
	dateLocale,
}: {
	entry: PainEntry;
	dateLocale: string;
}) {
	const { t } = useLocale();

	const locations = entry.locations.map(regionLabel);
	const types = entry.types.map(id => t.painTypes[id]).filter(Boolean);
	const limitations = entry.limitations
		.map(id => t.functionalLimitations[id])
		.filter(Boolean);
	const triggers = (entry.triggers ?? []).map(triggerLabel);

	return (
		// max-w so a wide monitor does not stretch one entry across the screen
		// and leave the reader's eye travelling between the drawing and the text.
		<div className="border rounded-xl p-4 flex gap-4 max-w-2xl">
			<div
				className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
				style={{ backgroundColor: INTENSITY_COLORS[entry.intensity] }}
			>
				{entry.intensity}
			</div>

			<div className="flex-1 min-w-0 space-y-2">
				<p className="text-sm font-medium">
					{new Date(entry.entry_date).toLocaleDateString(dateLocale, {
						weekday: 'long',
						day: 'numeric',
						month: 'long',
					})}
				</p>

				{locations.length > 0 && (
					<div className="flex gap-4 items-start">
						<BodyMapView locations={entry.locations} width={92} />

						<div className="flex-1 min-w-0 space-y-1.5">
							<p className="text-xs text-muted-foreground">
								{locations.join(', ')}
								{types.length > 0 && ` · ${types.join(', ')}`}
							</p>

							{triggers.length > 0 && (
								<div>
									<p className="text-[11px] text-muted-foreground mb-1">
										Посилюється від
									</p>
									<div className="flex flex-wrap gap-1">
										{triggers.map(label => (
											<span
												key={label}
												className="text-[11px] bg-red-50 text-red-700 rounded-full px-2 py-0.5"
											>
												{label}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{limitations.length > 0 && (
					<div>
						<p className="text-[11px] text-muted-foreground mb-1">Було важко</p>
						<div className="flex flex-wrap gap-1">
							{limitations.map(label => (
								<span
									key={label}
									className="text-[11px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5"
								>
									{label}
								</span>
							))}
						</div>
					</div>
				)}

				{entry.note && (
					<p className="text-sm italic text-muted-foreground">“{entry.note}”</p>
				)}
			</div>
		</div>
	);
}
