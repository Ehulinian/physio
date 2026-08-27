'use client';

/**
 * The body map, read-only, for the therapist.
 *
 * Same paths as the mobile app — `lib/body-map.ts` is shared verbatim, so what
 * the patient tapped and what the therapist sees are the same geometry by
 * construction, not by two people drawing similar shapes.
 *
 * Two modes:
 *
 *   • one entry — a region is marked or it is not.
 *   • many entries — `weights` shades each region by how often it was
 *     reported, so a month of diary collapses into one picture. The region
 *     someone marks every day and the one they marked once should not look
 *     the same, and a list of labels cannot show that difference.
 *
 * Both views are always drawn. A view with nothing marked is dimmed rather
 * than hidden — "nothing on the back" is information.
 */

import {
	BACK_REGIONS,
	FRONT_REGIONS,
	VIEW_BOX,
	type BodyRegion,
	type BodyView,
} from '@/lib/body-map';

const MARKED = '#7C3AED';
const BODY = '#E9E9EC';
const EDGE = '#D1D1D6';

export function BodyMapView({
	locations,
	weights,
	showWeightLabel = false,
	width = 96,
}: {
	locations: string[];
	/** Region id → 0..1. When given, opacity encodes how often it was reported. */
	weights?: Record<string, number>;
	/** Put the percentage in the tooltip. Off until there are enough entries. */
	showWeightLabel?: boolean;
	width?: number;
}) {
	const marked = new Set(locations);

	// Ids with no path are listed by the caller alongside the other labels,
	// not here — repeating them under the drawing showed the same regions
	// twice on one row.
	return (
		<div className="flex gap-3 shrink-0">
			<Silhouette
				view="front"
				regions={FRONT_REGIONS}
				marked={marked}
				weights={weights}
				showWeightLabel={showWeightLabel}
				width={width}
				label="Спереду"
			/>
			<Silhouette
				view="back"
				regions={BACK_REGIONS}
				marked={marked}
				weights={weights}
				showWeightLabel={showWeightLabel}
				width={width}
				label="Ззаду"
			/>
		</div>
	);
}

function Silhouette({
	view,
	regions,
	marked,
	weights,
	showWeightLabel,
	width,
	label,
}: {
	view: BodyView;
	regions: BodyRegion[];
	marked: Set<string>;
	weights?: Record<string, number>;
	showWeightLabel?: boolean;
	width: number;
	label: string;
}) {
	const hit = regions.filter(r => marked.has(r.id));

	return (
		<div className={hit.length === 0 ? 'opacity-40' : ''}>
			<svg
				viewBox={VIEW_BOX[view]}
				width={width}
				height={width * 2}
				role="img"
				aria-label={`${label}: ${
					hit.map(r => r.label).join(', ') || 'нічого не позначено'
				}`}
			>
				{regions.map(region => {
					const on = marked.has(region.id);
					// Floor at 0.25 — a region reported once must still be clearly
					// visible, or "rare" reads as "never".
					const weight = weights ? Math.max(0.25, weights[region.id] ?? 0) : 1;

					return (
						<g key={region.id}>
							<title>
								{region.label}
								{on && showWeightLabel ? ` — ${Math.round(weight * 100)}%` : ''}
							</title>
							{region.paths.map((d, i) => (
								<path
									key={i}
									d={d}
									fill={on ? MARKED : BODY}
									fillOpacity={on ? weight : 1}
									stroke={on ? MARKED : EDGE}
									strokeOpacity={on ? weight : 1}
									strokeWidth={1}
								/>
							))}
						</g>
					);
				})}
			</svg>
			<p className="text-[11px] text-muted-foreground text-center mt-1">{label}</p>
		</div>
	);
}
