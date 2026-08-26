'use client';

/**
 * What the patient reported, shown to the therapist.
 *
 * The chart comes first on purpose. A therapist opening this before a session
 * has about ten seconds, and the question is always the same — better or
 * worse than last time? The individual entries matter afterwards, to explain
 * a spike.
 */

import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

import {
	INTENSITY_COLORS,
	trend,
	type PainEntry,
} from '@/supabase/pain-entries';
import { regionLabel, triggerLabel } from '@/lib/body-map';
import { BodyMapView } from './BodyMapView';
import { useLocale } from '@/lib/i18n';

export function PainDiary({ entries }: { entries: PainEntry[] }) {
	const { t, locale } = useLocale();
	const d = t.clients.diary;
	const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';

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

	return (
		<div className="space-y-4 mt-4">
			{summary && (
				<div className="border rounded-xl p-4 space-y-4">
					<div className="flex items-baseline justify-between flex-wrap gap-2">
						<div className="flex items-baseline gap-3">
							<span
								className="text-3xl font-bold"
								style={{ color: INTENSITY_COLORS[Math.round(summary.current)] }}
							>
								{summary.current.toFixed(1)}
							</span>
							<span className="text-sm text-muted-foreground">
								{d.averageOver.replace('{n}', String(summary.count))}
							</span>
						</div>

						{summary.change !== null && <Change value={summary.change} label={d} />}
					</div>

					<div className="flex items-end gap-1 h-24">
						{chart.map(entry => (
							<div
								key={entry.id}
								className="flex-1 flex flex-col justify-end h-full group relative"
								title={`${entry.entry_date} — ${entry.intensity}/10`}
							>
								<div
									className="w-full rounded-sm transition-opacity group-hover:opacity-70"
									style={{
										// Floor of 4% so a pain-free day is a visible mark rather
										// than a gap that reads as a missing entry.
										height: `${Math.max(4, (entry.intensity / 10) * 100)}%`,
										backgroundColor: INTENSITY_COLORS[entry.intensity],
									}}
								/>
							</div>
						))}
					</div>

					<div className="flex justify-between text-[11px] text-muted-foreground">
						<span>
							{new Date(chart[0].entry_date).toLocaleDateString(dateLocale, {
								day: 'numeric',
								month: 'short',
							})}
						</span>
						<span>
							{new Date(chart[chart.length - 1].entry_date).toLocaleDateString(
								dateLocale,
								{ day: 'numeric', month: 'short' },
							)}
						</span>
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
		<div className="border rounded-xl p-4 flex gap-4">
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
						<BodyMapView locations={entry.locations} width={72} />

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
