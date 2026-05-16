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

export default function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar className="bg-violet-600">
			<SidebarHeader className="p-4 font-semibold">PysioFlow</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Main</SidebarGroupLabel>

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
										Clients
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-3 text-xs text-muted-foreground">
				v1.0.0
			</SidebarFooter>
		</Sidebar>
	);
}
