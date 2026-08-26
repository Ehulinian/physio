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

import { Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, LanguageSwitcher } from '@/lib/i18n';
import { SignOutButton } from './sign-out-button';

export default function AppSidebar({ userName }: { userName?: string }) {
	const pathname = usePathname();
	const { t } = useLocale();

	return (
		<Sidebar className="bg-violet-600">
			<SidebarHeader className="p-4 font-semibold">PysioFlow</SidebarHeader>

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

			<SidebarFooter className="p-3 gap-3">
				{userName && (
					<div className="flex items-center gap-2 px-1">
						<div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
							{userName.slice(0, 2).toUpperCase()}
						</div>
						<span className="text-xs truncate">{userName}</span>
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
