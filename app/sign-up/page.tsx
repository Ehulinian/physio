'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/supabase/client';
import { useLocale } from '@/lib/i18n';

export default function SignUpPage() {
	const { t } = useLocale();
	const router = useRouter();

	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setNotice(null);

		if (password.length < 8) {
			setError(t.auth.passwordTooShort);
			return;
		}

		setLoading(true);
		const supabase = createClient();

		const { data, error: signUpError } = await supabase.auth.signUp({
			email: email.trim(),
			password,
			options: {
				// Read by the handle_new_user trigger, which creates the profile
				// row. Metadata is client-supplied and therefore not trusted —
				// anyone can claim to be a clinician. That is survivable because
				// clients belong to a clinician: a false one gets an empty
				// workspace and can see nothing.
				data: { role: 'clinician', full_name: fullName.trim() },
			},
		});

		if (signUpError) {
			setError(t.auth.signUpFailed);
			setLoading(false);
			return;
		}

		// No session means the project requires email confirmation. Saying so
		// beats a silent redirect to a sign-in page that will reject them.
		if (!data.session) {
			setNotice(t.auth.confirmEmail);
			setLoading(false);
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
					<div className="space-y-1">
						<h1 className="text-2xl font-semibold tracking-tight">
							{t.auth.signUpTitle}
						</h1>
						<p className="text-sm text-muted-foreground">
							{t.auth.signUpSubtitle}
						</p>
					</div>
				</div>

				<form onSubmit={submit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="name" className="text-sm font-medium">
							{t.auth.fullName}
						</label>
						<Input
							id="name"
							value={fullName}
							onChange={e => setFullName(e.target.value)}
							placeholder={t.auth.fullNamePlaceholder}
							autoComplete="name"
							required
							disabled={loading}
						/>
					</div>

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
							autoComplete="email"
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
							autoComplete="new-password"
							required
							disabled={loading}
						/>
						<p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>
					</div>

					{error && (
						<p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
							{error}
						</p>
					)}
					{notice && (
						<p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
							{notice}
						</p>
					)}

					<Button
						type="submit"
						disabled={loading || !email || !password || !fullName}
						className="w-full bg-violet-600 hover:bg-violet-700 text-white"
					>
						{loading ? t.auth.submitting : t.auth.signUpSubmit}
					</Button>
				</form>

				<p className="text-sm text-center text-muted-foreground">
					{t.auth.haveAccount}{' '}
					<Link href="/sign-in" className="text-violet-600 hover:underline">
						{t.auth.submit}
					</Link>
				</p>
			</div>
		</div>
	);
}
