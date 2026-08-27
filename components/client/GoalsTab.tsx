'use client';

/**
 * The goals tab on a client card.
 *
 * Main goals carry their mini-goals underneath, because that is how Valik
 * described working: a target for the course of treatment, and the smaller
 * things a patient is actually doing between two appointments.
 *
 * Every goal shows progress measured from its baseline, not from zero — see
 * `goalProgress` for why that distinction matters to the person doing the work.
 */

import { useCallback, useEffect, useState } from 'react';
import { Check, Plus, Target, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoalForm } from './GoalForm';
import {
	addMeasurement,
	createGoal,
	daysLeft,
	goalProgress,
	listGoals,
	listMeasurements,
	updateGoalStatus,
	GOAL_STATUS_COLORS,
	GOAL_STATUS_LABELS,
	type Goal,
	type GoalDraft,
	type GoalMeasurement,
} from '@/supabase/goals';

export function GoalsTab({ clientId }: { clientId: string }) {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [measurements, setMeasurements] = useState<
		Record<string, GoalMeasurement[]>
	>({});
	const [loading, setLoading] = useState(true);
	const [adding, setAdding] = useState(false);

	const load = useCallback(async () => {
		try {
			const rows = await listGoals(clientId);
			setGoals(rows);
			setMeasurements(await listMeasurements(rows.map(g => g.id)));
		} catch {
			setGoals([]);
		} finally {
			setLoading(false);
		}
	}, [clientId]);

	useEffect(() => {
		void load();
	}, [load]);

	async function handleCreate(draft: GoalDraft) {
		await createGoal(clientId, draft);
		setAdding(false);
		await load();
	}

	if (loading) {
		return <p className="text-sm text-muted-foreground mt-4">Завантаження...</p>;
	}

	const mainGoals = goals.filter(g => g.kind === 'main');
	const orphanMinis = goals.filter(
		g => g.kind === 'mini' && !mainGoals.some(m => m.id === g.parent_id),
	);

	return (
		<div className="space-y-4 mt-4 max-w-2xl">
			{adding ? (
				<GoalForm
					mainGoals={mainGoals}
					onSubmit={handleCreate}
					onCancel={() => setAdding(false)}
				/>
			) : (
				<Button
					size="sm"
					onClick={() => setAdding(true)}
					className="bg-violet-600 hover:bg-violet-700 text-white"
				>
					<Plus className="w-4 h-4 mr-1.5" />
					Нова ціль
				</Button>
			)}

			{goals.length === 0 && !adding && (
				<div className="border rounded-xl p-8 text-center">
					<Target className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
					<p className="text-sm font-medium">Цілей ще немає</p>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Ціль із конкретним числом і датою дає пацієнту зрозуміти, куди він
						рухається, а вам — чи працює план.
					</p>
				</div>
			)}

			{mainGoals.map(goal => (
				<GoalCard
					key={goal.id}
					goal={goal}
					measurements={measurements[goal.id] ?? []}
					mini={goals.filter(g => g.parent_id === goal.id)}
					allMeasurements={measurements}
					onChanged={load}
				/>
			))}

			{orphanMinis.map(goal => (
				<GoalCard
					key={goal.id}
					goal={goal}
					measurements={measurements[goal.id] ?? []}
					mini={[]}
					allMeasurements={measurements}
					onChanged={load}
				/>
			))}
		</div>
	);
}

function GoalCard({
	goal,
	measurements,
	mini,
	allMeasurements,
	onChanged,
}: {
	goal: Goal;
	measurements: GoalMeasurement[];
	mini: Goal[];
	allMeasurements: Record<string, GoalMeasurement[]>;
	onChanged: () => Promise<void>;
}) {
	const progress = goalProgress(goal, measurements);
	const left = daysLeft(goal.due_date);
	const overdue = left < 0 && goal.status === 'active';

	return (
		<div className="border rounded-xl p-4 space-y-3">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-medium text-sm">{goal.title}</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						{goal.metric}
						{goal.baseline !== null && goal.target !== null && (
							<>
								{' · '}
								{goal.baseline}
								{goal.unit} → {goal.target}
								{goal.unit}
							</>
						)}
					</p>
				</div>

				<span
					className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
						GOAL_STATUS_COLORS[goal.status]
					}`}
				>
					{GOAL_STATUS_LABELS[goal.status]}
				</span>
			</div>

			{progress && (
				<div className="space-y-1">
					<div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
						<div
							className="h-full bg-violet-600 rounded-full transition-all"
							style={{ width: `${progress.fraction * 100}%` }}
						/>
					</div>
					<div className="flex justify-between text-[11px] text-muted-foreground">
						<span>
							Зараз {progress.latest}
							{goal.unit} · {Math.round(progress.fraction * 100)}%
						</span>
						<span className={overdue ? 'text-red-600' : ''}>
							{overdue
								? `прострочено на ${Math.abs(left)} дн.`
								: `лишилось ${left} дн.`}
						</span>
					</div>
				</div>
			)}

			{goal.notes && (
				<p className="text-xs text-muted-foreground italic">{goal.notes}</p>
			)}

			{goal.status === 'active' && (
				<MeasurementRow goal={goal} onAdded={onChanged} />
			)}

			<div className="flex gap-2">
				{goal.status === 'active' ? (
					<button
						onClick={async () => {
							await updateGoalStatus(goal.id, 'achieved');
							await onChanged();
						}}
						className="text-xs text-green-700 hover:underline flex items-center gap-1"
					>
						<Check className="w-3 h-3" /> Досягнуто
					</button>
				) : (
					<button
						onClick={async () => {
							await updateGoalStatus(goal.id, 'active');
							await onChanged();
						}}
						className="text-xs text-muted-foreground hover:underline"
					>
						Повернути в роботу
					</button>
				)}
			</div>

			{mini.length > 0 && (
				<div className="pl-4 border-l-2 border-violet-100 space-y-2 mt-3">
					<p className="text-[11px] font-medium text-muted-foreground">Підцілі</p>
					{mini.map(m => (
						<MiniGoal
							key={m.id}
							goal={m}
							measurements={allMeasurements[m.id] ?? []}
							onChanged={onChanged}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function MiniGoal({
	goal,
	measurements,
	onChanged,
}: {
	goal: Goal;
	measurements: GoalMeasurement[];
	onChanged: () => Promise<void>;
}) {
	const progress = goalProgress(goal, measurements);

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between gap-2">
				<p className="text-xs">{goal.title}</p>
				<button
					onClick={async () => {
						await updateGoalStatus(
							goal.id,
							goal.status === 'achieved' ? 'active' : 'achieved',
						);
						await onChanged();
					}}
					className={`text-[11px] shrink-0 ${
						goal.status === 'achieved'
							? 'text-green-700'
							: 'text-muted-foreground hover:text-violet-600'
					}`}
				>
					{goal.status === 'achieved' ? '✓ виконано' : 'відмітити'}
				</button>
			</div>
			{progress && (
				<div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
					<div
						className="h-full bg-violet-400 rounded-full"
						style={{ width: `${progress.fraction * 100}%` }}
					/>
				</div>
			)}
		</div>
	);
}

/** Recording a new measurement — the therapist does this at an appointment. */
function MeasurementRow({
	goal,
	onAdded,
}: {
	goal: Goal;
	onAdded: () => Promise<void>;
}) {
	const [value, setValue] = useState('');
	const [busy, setBusy] = useState(false);

	async function submit() {
		if (value === '') return;
		setBusy(true);
		try {
			await addMeasurement(goal.id, Number(value));
			setValue('');
			await onAdded();
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex gap-2 items-center pt-1">
			<TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
			<Input
				type="number"
				value={value}
				onChange={e => setValue(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && submit()}
				placeholder={`Нове значення${goal.unit ? `, ${goal.unit}` : ''}`}
				className="h-8 text-xs flex-1"
				disabled={busy}
			/>
			<Button
				size="sm"
				variant="outline"
				onClick={submit}
				disabled={busy || value === ''}
				className="h-8 px-3 text-xs"
			>
				Записати
			</Button>
		</div>
	);
}
