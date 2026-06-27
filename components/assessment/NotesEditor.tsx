import { type AssessmentNotes } from '@/lib/assessment-types';

interface Props {
	notes: AssessmentNotes;
	onChange: (notes: AssessmentNotes) => void;
	readOnly?: boolean;
}

export function NotesEditor({ notes, onChange, readOnly = false }: Props) {
	return (
		<div className="space-y-4">
			<div>
				<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
					Пацієнт повідомив
				</label>
				{readOnly ? (
					<p className="text-sm text-gray-700 min-h-[60px]">
						{notes.patient_reported || <span className="text-gray-400">—</span>}
					</p>
				) : (
					<textarea
						className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
						placeholder="Те, що описує пацієнт..."
						value={notes.patient_reported}
						onChange={e =>
							onChange({ ...notes, patient_reported: e.target.value })
						}
					/>
				)}
			</div>
			<div>
				<label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
					Клінічні спостереження
				</label>
				{readOnly ? (
					<p className="text-sm text-gray-700 min-h-[60px]">
						{notes.clinician_observations || (
							<span className="text-gray-400">—</span>
						)}
					</p>
				) : (
					<textarea
						className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
						placeholder="Клінічні дані, постава, діапазон рухів..."
						value={notes.clinician_observations}
						onChange={e =>
							onChange({ ...notes, clinician_observations: e.target.value })
						}
					/>
				)}
			</div>
		</div>
	);
}
