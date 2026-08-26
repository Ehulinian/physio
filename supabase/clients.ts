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
	created_at: string;
}

/** What the form collects. The database fills in id and created_at. */
export type ClientDraft = Omit<Client, 'id' | 'created_at'>;

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
	const { data, error } = await supabase
		.from('clients')
		.insert(draft)
		.select()
		.single();

	if (error) throw error;
	return data;
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
