'use client';

/**
 * The body map, read-only, for the therapist.
 *
 * Same paths as the mobile app — `lib/body-map.ts` is shared verbatim, so what
 * the patient tapped and what the therapist sees are the same geometry by
 * construction, not by two people drawing similar shapes.
 *
 * Both views are drawn side by side rather than behind a toggle. The patient
 * fills this in one region at a time and benefits from focus; the therapist is
 * scanning and wants the whole picture at once. A view with nothing marked is
 * dimmed rather than hidden — "nothing on the back" is information.
 */

import {
	BACK_REGIONS,
	FRONT_REGIONS,
	VIEW_BOX,
	regionLabel,
	unmappedIds,
	type BodyRegion,
	type BodyView,
} from '@/lib/body-map';

const MARKED = '#7C3AED';
const BODY = '#E9E9EC';
const EDGE = '#D1D1D6';

export function BodyMapView({
	locations,
	width = 96,
}: {
	locations: string[];
	width?: number;
}) {
	const marked = new Set(locations);
	const legacy = unmappedIds(locations);

	return (
		<div className="space-y-1">
			<div className="flex gap-2">
				<Silhouette
					view="front"
					regions={FRONT_REGIONS}
					marked={marked}
					width={width}
					label="Спереду"
				/>
				<Silhouette
					view="back"
					regions={BACK_REGIONS}
					marked={marked}
					width={width}
					label="Ззаду"
				/>
			</div>

			{legacy.length > 0 && (
				<p className="text-[11px] text-muted-foreground max-w-[220px]">
					Записано до появи мапи: {legacy.map(regionLabel).join(', ')}
				</p>
			)}
		</div>
	);
}

function Silhouette({
	view,
	regions,
	marked,
	width,
	label,
}: {
	view: BodyView;
	regions: BodyRegion[];
	marked: Set<string>;
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
					return (
						<g key={region.id}>
							<title>{region.label}</title>
							{region.paths.map((d, i) => (
								<path
									key={i}
									d={d}
									fill={on ? MARKED : BODY}
									fillOpacity={on ? 0.95 : 1}
									stroke={on ? MARKED : EDGE}
									strokeWidth={1}
								/>
							))}
						</g>
					);
				})}
			</svg>
			<p className="text-[11px] text-muted-foreground text-center">{label}</p>
		</div>
	);
}
