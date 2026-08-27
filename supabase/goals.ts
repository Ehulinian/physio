/**
 * SMART goals and their measurements.
 *
 * The structure is what makes a goal SMART rather than a note: you cannot save
 * "почуватись краще" here, because there is nowhere to put it. A title, a
 * metric with a unit, a baseline, a target and a date are all required by the
 * shape of the row.
 *
 * Measurements are a log rather than a `current` column on the goal.
 * Overwriting one number loses the shape of the recovery — which is the thing
 * both the therapist and the patient actually want to see.
 */

import { supabase } from './supabase';

export type GoalKind = 'main' | 'mini';
export type GoalStatus = 'active' | 'achieved' | 'paused' | 'dropped';

export interface Goal {
	id: string;
	client_id: string;
	created_by: string;
	/** Set on a mini-goal to point at the main goal it serves. */
	parent_id: string | null;
	kind: GoalKind;
	title: string;
	metric: string;
	unit: string;
	baseline: number | null;
	target: number | null;
	due_date: string;
	status: GoalStatus;
	notes: string;
	created_at: string;
	updated_at: string;
}

export interface GoalMeasurement {
	id: string;
	goal_id: string;
	value: number;
	recorded_on: string;
	note: string;
	created_at: string;
}

export type GoalDraft = Pick<
	Goal,
	| 'title'
	| 'metric'
	| 'unit'
	| 'baseline'
	| 'target'
	| 'due_date'
	| 'kind'
	| 'parent_id'
	| 'notes'
>;

export const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
	active: 'bg-violet-100 text-violet-700',
	achieved: 'bg-green-100 text-green-700',
	paused: 'bg-yellow-100 text-yellow-700',
	dropped: 'bg-gray-100 text-gray-500',
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
	active: 'В роботі',
	achieved: 'Досягнуто',
	paused: 'Призупинено',
	dropped: 'Скасовано',
};

export async function listGoals(clientId: string): Promise<Goal[]> {
	const { data, error } = await supabase
		.from('goals')
		.select('*')
		.eq('client_id', clientId)
		.order('due_date', { ascending: true });

	if (error) throw error;
	return data ?? [];
}

export async function listMeasurements(
	goalIds: string[],
): Promise<Record<string, GoalMeasurement[]>> {
	if (goalIds.length === 0) return {};

	// One query for every goal on the page rather than one per goal — the
	// client card already fires several requests, and a per-goal fetch would
	// turn a five-goal patient into five more round trips.
	const { data, error } = await supabase
		.from('goal_measurements')
		.select('*')
		.in('goal_id', goalIds)
		.order('recorded_on', { ascending: true });

	if (error) throw error;

	const grouped: Record<string, GoalMeasurement[]> = {};
	for (const row of data ?? []) {
		(grouped[row.goal_id] ??= []).push(row);
	}
	return grouped;
}

export async function createGoal(
	clientId: string,
	draft: GoalDraft,
): Promise<Goal> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Not signed in');

	const { data, error } = await supabase
		.from('goals')
		.insert({ ...draft, client_id: clientId, created_by: user.id })
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function updateGoalStatus(
	goalId: string,
	status: GoalStatus,
): Promise<void> {
	const { error } = await supabase
		.from('goals')
		.update({ status })
		.eq('id', goalId);

	if (error) throw error;
}

export async function addMeasurement(
	goalId: string,
	value: number,
	note = '',
): Promise<GoalMeasurement> {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data, error } = await supabase
		.from('goal_measurements')
		.insert({ goal_id: goalId, value, note, recorded_by: user?.id ?? null })
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteGoal(goalId: string): Promise<void> {
	const { error } = await supabase.from('goals').delete().eq('id', goalId);
	if (error) throw error;
}

/**
 * How far along a goal is, 0–1.
 *
 * Measured from the baseline, not from zero. A patient who could walk 100 m
 * and needs to reach 500 m is not "20% done" on day one — they are at 0%, and
 * every metre after that is theirs. Showing progress from zero hands them a
 * fifth of the work for free and makes the rest look slower than it is.
 *
 * Works in both directions: pain going 8 → 2 and distance going 100 → 500 are
 * both "closer to target", and the arithmetic is the same.
 */
export function goalProgress(
	goal: Goal,
	measurements: GoalMeasurement[],
): { fraction: number; latest: number | null } | null {
	if (goal.baseline === null || goal.target === null) return null;
	if (goal.baseline === goal.target) return null;

	const latest = measurements.at(-1)?.value ?? goal.baseline;
	const span = goal.target - goal.baseline;
	const done = latest - goal.baseline;

	// Clamped: overshooting the target is a success, not 140% of a progress bar.
	const fraction = Math.max(0, Math.min(1, done / span));

	return { fraction, latest };
}

/** Days until the due date. Negative once it has passed. */
export function daysLeft(dueDate: string): number {
	const due = new Date(dueDate + 'T00:00:00');
	const now = new Date();
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return Math.round((due.getTime() - startOfDay.getTime()) / 86_400_000);
}
