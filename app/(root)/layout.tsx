import AppSidebar from '@/components/shared/sidebar';
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar />

				<SidebarTrigger />

				<SidebarInset className="flex-1">
					<div className="p-6">{children}</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
