import {
	PAIN_LOCATIONS,
	PAIN_TYPES,
	type PainData,
	type PainLocationId,
	type PainTypeId,
} from '@/lib/assessment-types';
import { cn } from '@/lib/utils';

interface Props {
	data: PainData;
	onChange: (data: PainData) => void;
}

function intensityColor(v: number) {
	if (v <= 3) return 'text-green-600';
	if (v <= 6) return 'text-yellow-600';
	return 'text-red-600';
}

export function PainAssessmentBlock({ data, onChange }: Props) {
	function toggleLocation(id: PainLocationId) {
		const locations = data.locations.includes(id)
			? data.locations.filter(l => l !== id)
			: [...data.locations, id];
		onChange({ ...data, locations });
	}

	function toggleType(id: PainTypeId) {
		const types = data.types.includes(id)
			? data.types.filter(t => t !== id)
			: [...data.types, id];
		onChange({ ...data, types });
	}

	return (
		<div className="space-y-5">
			{/* Pain presence toggle */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => onChange({ ...data, present: !data.present })}
					className={cn(
						'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
						data.present ? 'bg-violet-600' : 'bg-gray-200',
					)}
				>
					<span
						className={cn(
							'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
							data.present ? 'translate-x-5' : 'translate-x-0',
						)}
					/>
				</button>
				<span className="text-sm font-medium">
					{data.present ? 'Біль присутній' : 'Немає повідомлень про біль'}
				</span>
			</div>

			{data.present && (
				<>
					{/* Intensity */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
								Інтенсивність болю
							</p>
							<span
								className={cn(
									'text-2xl font-bold',
									intensityColor(data.intensity),
								)}
							>
								{data.intensity}
								<span className="text-sm font-normal text-gray-400">/10</span>
							</span>
						</div>
						<input
							type="range"
							min={0}
							max={10}
							step={1}
							value={data.intensity}
							onChange={e =>
								onChange({ ...data, intensity: Number(e.target.value) })
							}
							className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
						/>
						<div className="flex justify-between text-xs text-gray-400">
							<span>Без болю</span>
							<span>Помірний</span>
							<span>Найгірший</span>
						</div>
					</div>

					{/* Locations */}
					<div className="space-y-2">
						<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
							Локалізації болю
						</p>
						<div className="flex flex-wrap gap-2">
							{PAIN_LOCATIONS.map(({ id, label }) => {
								const active = data.locations.includes(id);
								return (
									<button
										key={id}
										type="button"
										onClick={() => toggleLocation(id)}
										className={cn(
											'px-3 py-1 rounded-full text-sm border transition-colors',
											active
												? 'bg-red-50 border-red-400 text-red-700 font-medium'
												: 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
										)}
									>
										{label}
									</button>
								);
							})}
						</div>
					</div>

					{/* Pain types */}
					<div className="space-y-2">
						<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
							Тип болю
						</p>
						<div className="flex flex-wrap gap-2">
							{PAIN_TYPES.map(({ id, label }) => {
								const active = data.types.includes(id);
								return (
									<button
										key={id}
										type="button"
										onClick={() => toggleType(id)}
										className={cn(
											'px-3 py-1.5 rounded-lg border text-sm transition-colors',
											active
												? 'bg-orange-50 border-orange-400 text-orange-700 font-medium'
												: 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
										)}
									>
										{label}
									</button>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
