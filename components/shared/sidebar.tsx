'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from '@/components/ui/sidebar';

import { Activity, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, LanguageSwitcher } from '@/lib/i18n';
import { SignOutButton } from './sign-out-button';

/** "Erik Hulinian" → "EH". Two words, not the first two letters. */
function initials(name: string): string {
	return name
		.trim()
		.split(/[\s@.]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() ?? '')
		.join('');
}

export default function AppSidebar({ userName }: { userName?: string }) {
	const pathname = usePathname();
	const { t } = useLocale();

	return (
		// Colour comes from the --sidebar tokens in globals.css, not a utility
		// class here — the shadcn Sidebar sets its own background from those
		// variables, so a bg-* class on this element loses and the two would
		// drift apart anyway.
		<Sidebar>
			<SidebarHeader className="px-4 py-5">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
						<Activity size={17} className="text-white" strokeWidth={2.5} />
					</div>
					<span className="font-semibold tracking-tight">PhysioFlow</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{t.nav.main}</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={pathname.startsWith('/clients')}
									size="lg"
								>
									<Link href="/clients" className="flex items-center gap-2">
										<Users size={18} />
										{t.nav.clients}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-3 gap-2.5 border-t border-sidebar-border">
				{userName && (
					<div className="flex items-center gap-2.5 px-1">
						<div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
							{initials(userName)}
						</div>
						<span className="text-xs truncate font-medium">{userName}</span>
					</div>
				)}

				<div className="flex flex-row items-center justify-between">
					<SignOutButton />
					<LanguageSwitcher />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
