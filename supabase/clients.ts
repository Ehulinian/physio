/**
 * Every query touching `clients` and `notes`, in one place.
 *
 * Screens import these functions and never see the Supabase client. When this
 * moves to a Node + Prisma backend, the bodies here become `fetch` calls and
 * nothing in `app/` changes — which is the whole point of the indirection.
 */

import { supabase } from './supabase';

export type ClientStatus = 'Active' | 'Paused' | 'Completed';

export interface Client {
	id: string;
	first_name: string;
	last_name: string;
	email: string | null;
	age: number | null;
	gender: string | null;
	status: ClientStatus;
	main_problem: string | null;
	onset: string | null;
	/** ISO date. */
	started_at: string | null;
	/** The therapist this record belongs to. Enforced by RLS, not by the app. */
	clinician_id: string;
	created_at: string;
}

/**
 * What the form collects. The database fills in id and created_at;
 * `createClient` fills in clinician_id from the session.
 */
export type ClientDraft = Omit<Client, 'id' | 'created_at' | 'clinician_id'>;

export interface Note {
	id: string;
	client_id: string;
	text: string;
	created_at: string;
}

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
	Active: 'bg-green-100 text-green-700',
	Paused: 'bg-yellow-100 text-yellow-700',
	Completed: 'bg-gray-100 text-gray-500',
};

export async function listClients(): Promise<Client[]> {
	const { data, error } = await supabase
		.from('clients')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export async function getClient(id: string): Promise<Client | null> {
	const { data, error } = await supabase
		.from('clients')
		.select('*')
		.eq('id', id)
		.maybeSingle();

	if (error) throw error;
	return data;
}

export async function createClient(draft: ClientDraft): Promise<Client> {
	// Filled in here rather than by the caller: the RLS policy on `clients`
	// requires clinician_id = auth.uid(), so an insert without it is rejected
	// by the database anyway. Doing it in one place means no screen can forget.
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) throw new Error('Not signed in');

	const { data, error } = await supabase
		.from('clients')
		.insert({ ...draft, clinician_id: user.id })
		.select()
		.single();

	if (error) throw error;
	return data;
}

/**
 * Whether a patient account is attached to this record.
 *
 * A count, not the profile row: the therapist has no business reading the
 * patient's account details, and the policy on `profiles` reflects that.
 */
export async function isClientLinked(clientId: string): Promise<boolean> {
	const { count, error } = await supabase
		.from('profiles')
		.select('id', { count: 'exact', head: true })
		.eq('client_id', clientId);

	if (error) return false;
	return (count ?? 0) > 0;
}

export async function listNotes(clientId: string): Promise<Note[]> {
	const { data, error } = await supabase
		.from('notes')
		.select('*')
		.eq('client_id', clientId)
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export async function addNote(clientId: string, text: string): Promise<Note> {
	const { data, error } = await supabase
		.from('notes')
		.insert({ client_id: clientId, text })
		.select()
		.single();

	if (error) throw error;
	return data;
}
