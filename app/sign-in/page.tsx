'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/supabase/client';
import { useLocale } from '@/lib/i18n';

/**
 * useSearchParams() forces this subtree to render on the client, so Next
 * requires a Suspense boundary around it — otherwise the build fails rather
 * than silently opting the whole page out of static rendering.
 */
export default function SignInPage() {
	return (
		<Suspense>
			<SignInForm />
		</Suspense>
	);
}

function SignInForm() {
	const { t } = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const supabase = createClient();
		const { data, error: signInError } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password,
		});

		if (signInError || !data.user) {
			setError(t.auth.failed);
			setLoading(false);
			return;
		}

		// A patient account must not land in the clinician area. This check is
		// for the user's benefit, not for security — RLS is what actually stops
		// them reading anything. Without it they would get an empty, broken
		// dashboard and no explanation.
		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', data.user.id)
			.maybeSingle();

		if (profile?.role !== 'clinician') {
			await supabase.auth.signOut();
			setError(t.auth.notClinician);
			setLoading(false);
			return;
		}

		// refresh() so the Server Components re-render with the new cookie;
		// push() alone would navigate with the old, anonymous server state.
		router.push(searchParams.get('next') || '/clients');
		router.refresh();
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
			<div className="w-full max-w-sm space-y-8">
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center">
						<Users className="w-8 h-8 text-white" />
					</div>
					<div className="space-y-1">
						<h1 className="text-2xl font-semibold tracking-tight">
							{t.auth.title}
						</h1>
						<p className="text-sm text-muted-foreground">{t.auth.subtitle}</p>
					</div>
				</div>

				<form onSubmit={submit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							{t.auth.email}
						</label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder={t.auth.emailPlaceholder}
							autoComplete="username"
							required
							disabled={loading}
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							{t.auth.password}
						</label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder={t.auth.passwordPlaceholder}
							autoComplete="current-password"
							required
							disabled={loading}
						/>
					</div>

					{error && (
						<p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
							{error}
						</p>
					)}

					<Button
						type="submit"
						disabled={loading || !email || !password}
						className="w-full bg-violet-600 hover:bg-violet-700 text-white"
					>
						{loading ? t.auth.submitting : t.auth.submit}
					</Button>
				</form>
			</div>
		</div>
	);
}
