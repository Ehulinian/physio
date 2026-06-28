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

export default function AppSidebar() {
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

			<SidebarFooter className="p-3 flex flex-row items-center justify-between">
				<span className="text-xs text-muted-foreground">v1.0.0</span>
				<LanguageSwitcher />
			</SidebarFooter>
		</Sidebar>
	);
}
