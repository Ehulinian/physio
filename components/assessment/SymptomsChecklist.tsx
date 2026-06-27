import { SYMPTOMS, type SymptomId } from '@/lib/assessment-types';
import { cn } from '@/lib/utils';

interface Props {
	selected: SymptomId[];
	onChange: (selected: SymptomId[]) => void;
}

export function SymptomsChecklist({ selected, onChange }: Props) {
	function toggle(id: SymptomId) {
		onChange(
			selected.includes(id)
				? selected.filter(s => s !== id)
				: [...selected, id],
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
			{SYMPTOMS.map(({ id, label }) => {
				const checked = selected.includes(id);
				return (
					<button
						key={id}
						type="button"
						onClick={() => toggle(id)}
						className={cn(
							'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors',
							checked
								? 'bg-violet-50 border-violet-400 text-violet-700 font-medium'
								: 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
						)}
					>
						<span
							className={cn(
								'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
								checked ? 'bg-violet-600 border-violet-600' : 'border-gray-300',
							)}
						>
							{checked && (
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
						{label}
					</button>
				);
			})}
		</div>
	);
}
