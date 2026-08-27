/**
 * Patient invites.
 *
 * Both calls go through `rpc`, not a table write. `client_invites` has no
 * policy that lets a patient read it — being able to list codes would mean
 * being able to attach yourself to any record — so the database functions are
 * the only door, and they check ownership themselves.
 */

import { supabase } from './supabase';

export interface Invite {
	code: string;
	client_id: string;
	created_at: string;
	expires_at: string;
	used_at: string | null;
}

export async function generateInvite(clientId: string): Promise<string> {
	const { data, error } = await supabase.rpc('generate_invite', {
		p_client_id: clientId,
	});

	if (error) throw error;
	return data as string;
}

/** Existing invites for a client, newest first. Clinician-only by policy. */
export async function listInvites(clientId: string): Promise<Invite[]> {
	const { data, error } = await supabase
		.from('client_invites')
		.select('code, client_id, created_at, expires_at, used_at')
		.eq('client_id', clientId)
		.order('created_at', { ascending: false })
		.limit(5);

	if (error) throw error;
	return data ?? [];
}

export function inviteState(invite: Invite): 'used' | 'expired' | 'active' {
	if (invite.used_at) return 'used';
	if (new Date(invite.expires_at) < new Date()) return 'expired';
	return 'active';
}
