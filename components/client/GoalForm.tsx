'use client';

/**
 * Creating a goal.
 *
 * Every SMART element is a field, and the required ones cannot be skipped:
 * a title (specific), a metric with a unit and two numbers (measurable), and
 * a date (time-bound). Achievable and relevant stay the clinician's judgment —
 * a form cannot check those, and pretending otherwise would be theatre.
 *
 * The preview line at the bottom reads the goal back as a sentence. It is the
 * cheapest way to catch a goal that parses but means nothing.
 */

import { useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Goal, GoalDraft, GoalKind } from '@/supabase/goals';

/** Common physio metrics, offered so the unit does not get typed three ways. */
const METRIC_PRESETS = [
	{ metric: 'Дистанція без болю', unit: 'м' },
	{ metric: 'Рівень болю', unit: '/10' },
	{ metric: 'Амплітуда згинання', unit: '°' },
	{ metric: 'Час утримання', unit: 'с' },
	{ metric: 'Кількість повторень', unit: 'разів' },
	{ metric: 'Вага', unit: 'кг' },
];

function inDays(n: number): string {
	const d = new Date();
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
}

export function GoalForm({
	mainGoals,
	onSubmit,
	onCancel,
}: {
	/** Existing main goals, so a mini-goal can be attached to one. */
	mainGoals: Goal[];
	onSubmit: (draft: GoalDraft) => Promise<void>;
	onCancel: () => void;
}) {
	const [kind, setKind] = useState<GoalKind>('main');
	const [parentId, setParentId] = useState<string>('');
	const [title, setTitle] = useState('');
	const [metric, setMetric] = useState('');
	const [unit, setUnit] = useState('');
	const [baseline, setBaseline] = useState('');
	const [target, setTarget] = useState('');
	const [dueDate, setDueDate] = useState(inDays(28));
	const [notes, setNotes] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const baselineNum = baseline === '' ? null : Number(baseline);
	const targetNum = target === '' ? null : Number(target);

	const preview =
		title && metric && baselineNum !== null && targetNum !== null
			? `${title}: ${metric} з ${baselineNum}${unit} до ${targetNum}${unit} до ${new Date(
					dueDate,
				).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}`
			: null;

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (baselineNum !== null && targetNum !== null && baselineNum === targetNum) {
			setError('Вихідне та цільове значення однакові — рухатись нікуди.');
			return;
		}

		setSaving(true);
		try {
			await onSubmit({
				kind,
				parent_id: kind === 'mini' && parentId ? parentId : null,
				title: title.trim(),
				metric: metric.trim(),
				unit: unit.trim(),
				baseline: baselineNum,
				target: targetNum,
				due_date: dueDate,
				notes: notes.trim(),
			});
		} catch {
			setError('Не вдалося зберегти ціль.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form onSubmit={submit} className="border rounded-xl p-4 space-y-4 bg-zinc-50/50">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-sm">Нова ціль</h3>
				<button
					type="button"
					onClick={onCancel}
					className="text-muted-foreground hover:text-black"
					aria-label="Закрити"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			<div className="flex gap-2">
				<KindTab
					label="Основна"
					active={kind === 'main'}
					onClick={() => setKind('main')}
				/>
				<KindTab
					label="Підціль"
					active={kind === 'mini'}
					onClick={() => setKind('mini')}
					disabled={mainGoals.length === 0}
					hint={mainGoals.length === 0 ? 'Спершу створіть основну ціль' : undefined}
				/>
			</div>

			{kind === 'mini' && (
				<div className="space-y-1.5">
					<label className="text-xs font-medium">До якої основної цілі</label>
					<select
						value={parentId}
						onChange={e => setParentId(e.target.value)}
						className="w-full h-9 rounded-md border px-3 text-sm bg-white"
						required
					>
						<option value="">Оберіть ціль</option>
						{mainGoals.map(g => (
							<option key={g.id} value={g.id}>
								{g.title}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="space-y-1.5">
				<label className="text-xs font-medium">Що маємо досягти</label>
				<Input
					value={title}
					onChange={e => setTitle(e.target.value)}
					placeholder="Пройти 500 м без болю"
					required
				/>
			</div>

			<div className="space-y-1.5">
				<label className="text-xs font-medium">Що вимірюємо</label>
				<div className="flex flex-wrap gap-1.5 mb-2">
					{METRIC_PRESETS.map(p => (
						<button
							key={p.metric}
							type="button"
							onClick={() => {
								setMetric(p.metric);
								setUnit(p.unit);
							}}
							className={`text-[11px] rounded-full px-2.5 py-1 border transition-colors ${
								metric === p.metric
									? 'bg-violet-50 border-violet-300 text-violet-700'
									: 'hover:bg-zinc-100'
							}`}
						>
							{p.metric}
						</button>
					))}
				</div>
				<div className="flex gap-2">
					<Input
						value={metric}
						onChange={e => setMetric(e.target.value)}
						placeholder="Дистанція без болю"
						required
						className="flex-1"
					/>
					<Input
						value={unit}
						onChange={e => setUnit(e.target.value)}
						placeholder="м"
						className="w-20"
					/>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2">
				<div className="space-y-1.5">
					<label className="text-xs font-medium">Зараз</label>
					<Input
						type="number"
						value={baseline}
						onChange={e => setBaseline(e.target.value)}
						placeholder="100"
						required
					/>
				</div>
				<div className="space-y-1.5">
					<label className="text-xs font-medium">Ціль</label>
					<Input
						type="number"
						value={target}
						onChange={e => setTarget(e.target.value)}
						placeholder="500"
						required
					/>
				</div>
				<div className="space-y-1.5">
					<label className="text-xs font-medium">До дати</label>
					<Input
						type="date"
						value={dueDate}
						onChange={e => setDueDate(e.target.value)}
						required
					/>
				</div>
			</div>

			<div className="space-y-1.5">
				<label className="text-xs font-medium">Нотатка (необовʼязково)</label>
				<Input
					value={notes}
					onChange={e => setNotes(e.target.value)}
					placeholder="Що враховувати"
				/>
			</div>

			{preview && (
				<p className="text-xs text-muted-foreground bg-white border rounded-md px-3 py-2">
					{preview}
				</p>
			)}

			{error && <p className="text-xs text-red-600">{error}</p>}

			<div className="flex gap-2">
				<Button
					type="submit"
					size="sm"
					disabled={saving}
					className="bg-violet-600 hover:bg-violet-700 text-white"
				>
					{saving ? 'Збереження...' : 'Створити ціль'}
				</Button>
				<Button type="button" size="sm" variant="outline" onClick={onCancel}>
					Скасувати
				</Button>
			</div>
		</form>
	);
}

function KindTab({
	label,
	active,
	onClick,
	disabled,
	hint,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
	disabled?: boolean;
	hint?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={hint}
			className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
				active ? 'bg-violet-600 text-white border-violet-600' : 'hover:bg-zinc-100'
			}`}
		>
			{label}
		</button>
	);
}
