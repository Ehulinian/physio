'use client';

import { FUNCTIONAL_LIMITATIONS, type FunctionalLimitationId } from '@/lib/assessment-types';
import { useLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Props {
	selected: FunctionalLimitationId[];
	onChange: (selected: FunctionalLimitationId[]) => void;
}

export function FunctionalLimitationsBlock({ selected, onChange }: Props) {
	const { t } = useLocale();

	function toggle(id: FunctionalLimitationId) {
		onChange(
			selected.includes(id)
				? selected.filter(s => s !== id)
				: [...selected, id],
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
			{FUNCTIONAL_LIMITATIONS.map(({ id }) => {
				const active = selected.includes(id);
				return (
					<button
						key={id}
						type="button"
						onClick={() => toggle(id)}
						className={cn(
							'flex items-center gap-2.5 px-3 py-3 rounded-lg border text-sm text-left transition-colors',
							active
								? 'bg-violet-50 border-violet-400 text-violet-700 font-medium'
								: 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
						)}
					>
						<span
							className={cn(
								'w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors',
								active ? 'bg-violet-600 border-violet-600' : 'border-gray-300',
							)}
						>
							{active && (
								<svg
									className="w-2.5 h-2.5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
						</span>
						{t.functionalLimitations[id]}
					</button>
				);
			})}
		</div>
	);
}
