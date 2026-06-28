'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SymptomsChecklist } from '@/components/assessment/SymptomsChecklist';
import { PainAssessmentBlock } from '@/components/assessment/PainAssessmentBlock';
import { FunctionalLimitationsBlock } from '@/components/assessment/FunctionalLimitationsBlock';
import { NotesEditor } from '@/components/assessment/NotesEditor';
import { getAssessment, saveAssessment } from '@/supabase/assessments';
import {
	ASSESSMENT_STATUS_COLORS,
	DEFAULT_PROTOCOL,
	type AssessmentProtocol,
	type AssessmentStatus,
} from '@/lib/assessment-types';
import { useLocale } from '@/lib/i18n';

export default function AssessmentPage({
	params,
}: {
	params: Promise<{ id: string; assessmentId: string }>;
}) {
	const { id: clientId, assessmentId } = use(params);
	const router = useRouter();
	const { t } = useLocale();
	const a = t.assessment;

	const [protocol, setProtocol] =
		useState<AssessmentProtocol>(DEFAULT_PROTOCOL);
	const [status, setStatus] = useState<AssessmentStatus>('чернетка');
	const [loaded, setLoaded] = useState(false);
	const [saving, setSaving] = useState(false);
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [completing, setCompleting] = useState(false);
	const autosaveTimer = useRef<ReturnType<typeof setTimeout>>(null);

	useEffect(() => {
		getAssessment(assessmentId).then(data => {
			if (data) {
				setProtocol(data.protocol);
				setStatus(data.status);
			}
			setLoaded(true);
		});
	}, [assessmentId]);

	const persist = useCallback(
		async (proto: AssessmentProtocol, s: AssessmentStatus) => {
			await saveAssessment(assessmentId, proto, s);
		},
		[assessmentId],
	);

	function updateProtocol(patch: Partial<AssessmentProtocol>) {
		if (status === 'виконано') return;
		const next = { ...protocol, ...patch };
		setProtocol(next);

		if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
		autosaveTimer.current = setTimeout(() => {
			persist(next, 'чернетка').then(() => setSavedAt(new Date()));
		}, 1500);
	}

	async function handleSaveDraft() {
		setSaving(true);
		await persist(protocol, 'чернетка');
		setSaving(false);
		setSavedAt(new Date());
	}

	async function handleComplete() {
		setCompleting(true);
		await persist(protocol, 'виконано');
		setStatus('виконано');
		setCompleting(false);
		router.push(`/clients/${clientId}`);
	}

	if (!loaded) {
		return (
			<div className="text-sm text-muted-foreground p-4">{t.common.loading}</div>
		);
	}

	const isCompleted = status === 'виконано';
	const s = a.sections;

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-10">
			{/* Header */}
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<Link
					href={`/clients/${clientId}`}
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-black transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					{t.clients.backToClient}
				</Link>

				<div className="flex items-center gap-2">
					{isCompleted ? (
						<span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ASSESSMENT_STATUS_COLORS['виконано']}`}>
							{a.statusLabels['виконано']}
						</span>
					) : (
						<>
							{savedAt && (
								<span className="text-xs text-green-600">
									{t.common.saved}{' '}
									{savedAt.toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</span>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={handleSaveDraft}
								disabled={saving}
							>
								<Save className="w-4 h-4 mr-1.5" />
								{saving ? t.common.saving : a.saveDraft}
							</Button>
							<Button
								size="sm"
								onClick={handleComplete}
								disabled={completing}
								className="bg-violet-600 hover:bg-violet-700 text-white"
							>
								<CheckCircle className="w-4 h-4 mr-1.5" />
								{completing ? t.common.saving : a.complete}
							</Button>
						</>
					)}
				</div>
			</div>

			<div>
				<h1 className="text-xl font-semibold">{a.title}</h1>
				{isCompleted && (
					<p className="text-sm text-muted-foreground mt-0.5">
						{a.readOnly}
					</p>
				)}
			</div>

			{/* Symptoms */}
			<section className="border rounded-xl p-5 space-y-3">
				<div>
					<h2 className="font-semibold text-sm">{s.symptoms.title}</h2>
					<p className="text-xs text-muted-foreground">{s.symptoms.subtitle}</p>
				</div>
				<SymptomsChecklist
					selected={protocol.symptoms}
					onChange={
						isCompleted ? () => {} : symptoms => updateProtocol({ symptoms })
					}
				/>
			</section>

			{/* Pain */}
			<section className="border rounded-xl p-5 space-y-3">
				<div>
					<h2 className="font-semibold text-sm">{s.pain.title}</h2>
					<p className="text-xs text-muted-foreground">{s.pain.subtitle}</p>
				</div>
				<PainAssessmentBlock
					data={protocol.pain}
					onChange={isCompleted ? () => {} : pain => updateProtocol({ pain })}
				/>
			</section>

			{/* Functional Limitations */}
			<section className="border rounded-xl p-5 space-y-3">
				<div>
					<h2 className="font-semibold text-sm">{s.functional.title}</h2>
					<p className="text-xs text-muted-foreground">{s.functional.subtitle}</p>
				</div>
				<FunctionalLimitationsBlock
					selected={protocol.functional_limitations}
					onChange={
						isCompleted
							? () => {}
							: functional_limitations =>
									updateProtocol({ functional_limitations })
					}
				/>
			</section>

			{/* Notes */}
			<section className="border rounded-xl p-5 space-y-3">
				<div>
					<h2 className="font-semibold text-sm">{s.notes.title}</h2>
					<p className="text-xs text-muted-foreground">{s.notes.subtitle}</p>
				</div>
				<NotesEditor
					notes={protocol.notes}
					readOnly={isCompleted}
					onChange={isCompleted ? () => {} : notes => updateProtocol({ notes })}
				/>
			</section>
		</div>
	);
}
