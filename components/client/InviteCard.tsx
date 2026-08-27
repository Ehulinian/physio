'use client';

/**
 * Generates the code a patient types into the mobile app.
 *
 * The code exists because a patient cannot be trusted to say which record is
 * theirs — that claim has to come from the therapist who created it. Handing
 * over a code in person is that claim, and it is the only reason the app can
 * safely let people register themselves.
 */

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	generateInvite,
	inviteState,
	listInvites,
	type Invite,
} from '@/supabase/invites';

export function InviteCard({
	clientId,
	linked,
	clientName,
}: {
	clientId: string;
	/** True once a patient account points at this record. */
	linked: boolean;
	clientName: string;
}) {
	const [invites, setInvites] = useState<Invite[]>([]);
	const [busy, setBusy] = useState(false);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setInvites(await listInvites(clientId));
		} catch {
			setInvites([]);
		}
	}, [clientId]);

	useEffect(() => {
		void load();
	}, [load]);

	const active = invites.find(i => inviteState(i) === 'active');

	async function create() {
		setBusy(true);
		setError(null);
		try {
			await generateInvite(clientId);
			await load();
		} catch {
			setError('Не вдалося створити код. Спробуйте ще раз.');
		} finally {
			setBusy(false);
		}
	}

	async function copy(code: string) {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard needs a secure context and permission. The code is on
			// screen either way, so failing here is not worth an error message.
		}
	}

	if (linked) {
		return (
			<div className="border rounded-xl p-4 flex items-start gap-3">
				<div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
					<Check className="w-4 h-4" />
				</div>
				<div>
					<p className="text-sm font-medium">Застосунок підключено</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						{clientName} веде щоденник у мобільному застосунку.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="border rounded-xl p-4 space-y-3">
			<div>
				<p className="text-sm font-medium">Запросити в застосунок</p>
				<p className="text-xs text-muted-foreground mt-0.5">
					Пацієнт встановлює PhysioFlow, реєструється сам і вводить цей код.
				</p>
			</div>

			{active ? (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						{/* Monospace and wide tracking because this gets read aloud
						    or copied off a screen — the alphabet already excludes
						    0/O and 1/I for the same reason. */}
						<code className="flex-1 font-mono text-lg tracking-[0.2em] bg-zinc-50 border rounded-lg px-3 py-2 text-center">
							{active.code}
						</code>
						<Button
							variant="outline"
							size="sm"
							onClick={() => copy(active.code)}
							className="h-10 px-3"
							aria-label="Скопіювати код"
						>
							{copied ? (
								<Check className="w-4 h-4 text-green-600" />
							) : (
								<Copy className="w-4 h-4" />
							)}
						</Button>
					</div>

					<p className="text-xs text-muted-foreground">
						Дійсний до{' '}
						{new Date(active.expires_at).toLocaleDateString('uk-UA', {
							day: 'numeric',
							month: 'long',
						})}
					</p>

					<button
						onClick={create}
						disabled={busy}
						className="text-xs text-violet-600 hover:underline flex items-center gap-1.5 disabled:opacity-50"
					>
						<RefreshCw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} />
						Створити новий код
					</button>
				</div>
			) : (
				<Button
					onClick={create}
					disabled={busy}
					size="sm"
					className="bg-violet-600 hover:bg-violet-700 text-white"
				>
					{busy ? 'Створення...' : 'Створити код'}
				</Button>
			)}

			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}
