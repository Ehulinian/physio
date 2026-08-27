'use client';

/**
 * Password reset — request a link, then set a new password on the same page.
 *
 * Two states rather than two routes because Supabase brings the user back here
 * with a recovery session already established. Once that session exists the
 * form is simply "choose a new password"; before it, it is "where should we
 * send the link".
 *
 * Missing this was the single stupidest way to lose a pilot user: forget a
 * password in week two and there is no way back into your own records.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/supabase/client';

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPassword />
		</Suspense>
	);
}

function ResetPassword() {
	const router = useRouter();

	const [recovering, setRecovering] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		const supabase = createClient();

		// Supabase parses the recovery token out of the URL fragment and emits
		// PASSWORD_RECOVERY. Listening beats reading the URL ourselves — the
		// token format is theirs to change.
		const { data: sub } = supabase.auth.onAuthStateChange(event => {
			if (event === 'PASSWORD_RECOVERY') setRecovering(true);
		});

		// Also covers the case where the event fired before this listener
		// attached, which happens on a fast reload.
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) setRecovering(true);
		});

		return () => sub.subscription.unsubscribe();
	}, []);

	async function requestLink(e: React.FormEvent) {
		e.preventDefault();
		setBusy(true);
		setError(null);

		const supabase = createClient();
		await supabase.auth.resetPasswordForEmail(email.trim(), {
			redirectTo: `${window.location.origin}/reset-password`,
		});

		// Shown regardless of whether the address exists. A different message
		// for unknown emails would turn this form into a way to check which
		// addresses are registered.
		setSent(true);
		setBusy(false);
	}

	async function setNewPassword(e: React.FormEvent) {
		e.preventDefault();

		if (password.length < 8) {
			setError('Пароль має містити щонайменше 8 символів.');
			return;
		}

		setBusy(true);
		setError(null);

		const supabase = createClient();
		const { error: updateError } = await supabase.auth.updateUser({ password });

		if (updateError) {
			setError('Не вдалося змінити пароль. Можливо, посилання застаріло.');
			setBusy(false);
			return;
		}

		router.push('/clients');
		router.refresh();
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
			<div className="w-full max-w-sm space-y-8">
				<div className="text-center space-y-4">
					<div className="mx-auto w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center">
						<Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">
						{recovering ? 'Новий пароль' : 'Відновлення доступу'}
					</h1>
				</div>

				{recovering ? (
					<form onSubmit={setNewPassword} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="new-password" className="text-sm font-medium">
								Новий пароль
							</label>
							<Input
								id="new-password"
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								autoComplete="new-password"
								required
								disabled={busy}
							/>
							<p className="text-xs text-muted-foreground">
								Щонайменше 8 символів
							</p>
						</div>

						{error && (
							<p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
								{error}
							</p>
						)}

						<Button
							type="submit"
							disabled={busy || !password}
							className="w-full bg-violet-600 hover:bg-violet-700 text-white"
						>
							{busy ? 'Збереження...' : 'Зберегти пароль'}
						</Button>
					</form>
				) : sent ? (
					<div className="space-y-4 text-center">
						<p className="text-sm bg-green-50 text-green-800 rounded-md px-4 py-3">
							Якщо ця адреса зареєстрована, ми надіслали на неї посилання для
							відновлення.
						</p>
						<p className="text-xs text-muted-foreground">
							Лист може потрапити в спам. Посилання дійсне обмежений час.
						</p>
					</div>
				) : (
					<form onSubmit={requestLink} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								Пошта
							</label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder="you@example.com"
								autoComplete="email"
								required
								disabled={busy}
							/>
						</div>

						<Button
							type="submit"
							disabled={busy || !email}
							className="w-full bg-violet-600 hover:bg-violet-700 text-white"
						>
							{busy ? 'Надсилання...' : 'Надіслати посилання'}
						</Button>
					</form>
				)}

				<p className="text-sm text-center text-muted-foreground">
					<Link href="/sign-in" className="text-violet-600 hover:underline">
						Повернутись до входу
					</Link>
				</p>
			</div>
		</div>
	);
}
