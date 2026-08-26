'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { createClient } from '@/supabase/client';
import { useLocale } from '@/lib/i18n';

export function SignOutButton() {
	const { t } = useLocale();
	const router = useRouter();

	async function signOut() {
		await createClient().auth.signOut();
		// refresh() before push() so the server forgets the session; without it
		// the cached Server Component output for /clients can still be served.
		router.refresh();
		router.push('/sign-in');
	}

	return (
		<button
			onClick={signOut}
			className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
		>
			<LogOut size={14} />
			{t.auth.signOut}
		</button>
	);
}
