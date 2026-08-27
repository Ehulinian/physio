'use client';

/**
 * Generates the invite a patient uses to attach their phone to this record.
 *
 * Three ways out of the same code, because the handover happens in three
 * different situations:
 *
 *   • A link, for a conversation that is already open — Instagram, Telegram,
 *     SMS. One paste for the therapist, one tap for the patient, nothing typed.
 *   • A QR code, for the end of an appointment. The person is standing there
 *     with a phone; scanning beats dictating "S as in Sergiy".
 *   • The bare code, for the phone call and the scrap of paper.
 *
 * The code itself is what makes self-registration safe: a patient cannot be
 * trusted to say which record is theirs, so the claim comes from the therapist
 * who created it.
 */

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Link2, QrCode, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	generateInvite,
	inviteState,
	listInvites,
	type Invite,
} from '@/supabase/invites';

/**
 * Where the patient app lives. Without it only the bare code works — which is
 * still usable, just slower, so a missing variable degrades rather than breaks.
 */
const PATIENT_APP_URL = process.env.NEXT_PUBLIC_PATIENT_APP_URL;

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
	const [copied, setCopied] = useState<'code' | 'link' | null>(null);
	const [showQr, setShowQr] = useState(false);
	const [qr, setQr] = useState<string | null>(null);
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
	const joinUrl =
		active && PATIENT_APP_URL ? `${PATIENT_APP_URL}/join/${active.code}` : null;

	// Rendered to an SVG string rather than a canvas: it scales to any screen
	// without blurring, which matters when someone is scanning it from a metre
	// away at an angle.
	useEffect(() => {
		if (!showQr || !joinUrl) return;

		QRCode.toString(joinUrl, {
			type: 'svg',
			margin: 1,
			width: 200,
			errorCorrectionLevel: 'M',
		})
			.then(setQr)
			.catch(() => setQr(null));
	}, [showQr, joinUrl]);

	async function create() {
		setBusy(true);
		setError(null);
		try {
			await generateInvite(clientId);
			setShowQr(false);
			setQr(null);
			await load();
		} catch {
			setError('Не вдалося створити код. Спробуйте ще раз.');
		} finally {
			setBusy(false);
		}
	}

	async function copy(text: string, what: 'code' | 'link') {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(what);
			setTimeout(() => setCopied(null), 2000);
		} catch {
			// Clipboard needs a secure context and permission. The value is on
			// screen either way, so a failure here is not worth an error message.
		}
	}

	if (linked) {
		return (
			<div className="border rounded-xl p-4 flex items-start gap-3 max-w-2xl">
				<div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
					<Check className="w-4 h-4" />
				</div>
				<div>
					<p className="text-sm font-medium">Застосунок підключено</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						{clientName} веде щоденник, і записи зʼявляються у вкладці
						«Щоденник».
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="border rounded-xl p-4 space-y-3 max-w-2xl">
			<div>
				<p className="text-sm font-medium">Запросити в застосунок</p>
				<p className="text-xs text-muted-foreground mt-0.5">
					Надішліть посилання або покажіть QR — пацієнт зареєструється сам.
				</p>
			</div>

			{active ? (
				<div className="space-y-3">
					{joinUrl && (
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => copy(joinUrl, 'link')}
								className="flex-1"
							>
								{copied === 'link' ? (
									<Check className="w-4 h-4 mr-1.5 text-green-600" />
								) : (
									<Link2 className="w-4 h-4 mr-1.5" />
								)}
								{copied === 'link' ? 'Скопійовано' : 'Скопіювати посилання'}
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowQr(v => !v)}
								aria-label="Показати QR-код"
							>
								<QrCode className="w-4 h-4" />
							</Button>
						</div>
					)}

					{showQr && (
						<div className="flex flex-col items-center gap-2 py-2">
							{qr ? (
								<div
									className="bg-white p-2 rounded-lg border"
									// Trusted: the SVG is produced locally by the qrcode
									// library from a URL we built, never from user input.
									dangerouslySetInnerHTML={{ __html: qr }}
								/>
							) : (
								<p className="text-xs text-muted-foreground">Готуємо код...</p>
							)}
							<p className="text-xs text-muted-foreground">
								Наведіть камеру телефона
							</p>
						</div>
					)}

					<div className="flex items-center gap-2">
						{/* Monospace and wide tracking because this gets read aloud or
						    copied off a screen — the alphabet already excludes 0/O and
						    1/I for the same reason. */}
						<code className="flex-1 font-mono text-lg tracking-[0.2em] bg-zinc-50 border rounded-lg px-3 py-2 text-center">
							{active.code}
						</code>
						<Button
							variant="outline"
							size="sm"
							onClick={() => copy(active.code, 'code')}
							className="h-10 px-3"
							aria-label="Скопіювати код"
						>
							{copied === 'code' ? (
								<Check className="w-4 h-4 text-green-600" />
							) : (
								<Copy className="w-4 h-4" />
							)}
						</Button>
					</div>

					<div className="flex items-center justify-between">
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
							Новий код
						</button>
					</div>

					{!PATIENT_APP_URL && (
						<p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
							Посилання й QR недоступні: не задано NEXT_PUBLIC_PATIENT_APP_URL.
							Код працює й без цього.
						</p>
					)}
				</div>
			) : (
				<Button
					onClick={create}
					disabled={busy}
					size="sm"
					className="bg-violet-600 hover:bg-violet-700 text-white"
				>
					{busy ? 'Створення...' : 'Створити запрошення'}
				</Button>
			)}

			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}
