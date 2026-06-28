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
import { createAssessment, saveAssessment } from '@/supabase/assessments';
import {
	DEFAULT_PROTOCOL,
	type AssessmentProtocol,
} from '@/lib/assessment-types';
import { useLocale } from '@/lib/i18n';

export default function NewAssessmentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: clientId } = use(params);
	const router = useRouter();
	const { t } = useLocale();
	const a = t.assessment;

	const [assessmentId, setAssessmentId] = useState<string | null>(null);
	const [protocol, setProtocol] =
		useState<AssessmentProtocol>(DEFAULT_PROTOCOL);
	const [saving, setSaving] = useState(false);
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [completing, setCompleting] = useState(false);
	const autosaveTimer = useRef<ReturnType<typeof setTimeout>>(null);

	useEffect(() => {
		createAssessment(clientId).then(data => setAssessmentId(data.id));
	}, [clientId]);

	const persist = useCallback(
		async (
			proto: AssessmentProtocol,
			status: 'чернетка' | 'виконано' = 'чернетка',
		) => {
			if (!assessmentId) return;
			await saveAssessment(assessmentId, proto, status);
		},
		[assessmentId],
	);

	function updateProtocol(patch: Partial<AssessmentProtocol>) {
		const next = { ...protocol, ...patch };
		setProtocol(next);

		if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
		autosaveTimer.current = setTimeout(() => {
			persist(next).then(() => setSavedAt(new Date()));
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
		router.push(`/clients/${clientId}`);
	}

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
						disabled={saving || !assessmentId}
					>
						<Save className="w-4 h-4 mr-1.5" />
						{saving ? t.common.saving : a.saveDraft}
					</Button>
					<Button
						size="sm"
						onClick={handleComplete}
						disabled={completing || !assessmentId}
						className="bg-violet-600 hover:bg-violet-700 text-white"
					>
						<CheckCircle className="w-4 h-4 mr-1.5" />
						{completing ? t.common.saving : a.complete}
					</Button>
				</div>
			</div>

			<div>
				<h1 className="text-xl font-semibold">{a.newTitle}</h1>
				<p className="text-sm text-muted-foreground mt-0.5">{a.autoSave}</p>
			</div>

			{/* Symptoms */}
			<section className="border rounded-xl p-5 space-y-3">
				<div>
					<h2 className="font-semibold text-sm">{s.symptoms.title}</h2>
					<p className="text-xs text-muted-foreground">{s.symptoms.subtitle}</p>
				</div>
				<SymptomsChecklist
					selected={protocol.symptoms}
					onChange={symptoms => updateProtocol({ symptoms })}
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
					onChange={pain => updateProtocol({ pain })}
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
					onChange={functional_limitations =>
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
					onChange={notes => updateProtocol({ notes })}
				/>
			</section>
		</div>
	);
}
