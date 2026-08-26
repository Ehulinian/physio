import { redirect } from 'next/navigation';

import AppSidebar from '@/components/shared/sidebar';
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { getCurrentUser } from '@/supabase/server';

/**
 * A Server Component, so the session is resolved before anything renders —
 * no flash of a dashboard for someone who is not allowed to see it.
 *
 * The middleware already redirects anonymous requests; this second check
 * covers the role, and costs one query. Defence in depth is cheap here, and
 * the middleware matcher is easy to get subtly wrong.
 */
export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();

	if (!user) redirect('/sign-in');
	if (user.role !== 'clinician') redirect('/sign-in');

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar userName={user.fullName} />

				<SidebarTrigger />

				<SidebarInset className="flex-1">
					<div className="p-6">{children}</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
