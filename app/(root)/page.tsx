'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users } from 'lucide-react';

export default function Home() {
	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center space-y-10">
				<div className="mx-auto w-20 h-20 bg-violet-600 rounded-2xl flex items-center justify-center">
					<Users className="w-10 h-10 text-white" />
				</div>

				<div className="space-y-4">
					<h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white">
						Ласкаво просимо
					</h1>
					<p className="text-xl text-zinc-600 dark:text-zinc-400">
						Керуйте своїми клієнтами легко та ефективно
					</p>
				</div>

				<div className="space-y-4">
					<Link href="/clients">
						<Button
							size="lg"
							className="w-full text-lg h-14 bg-violet-600 hover:bg-violet-700 text-white"
						>
							Перейти до клієнтів
							<ArrowRight className="ml-2 w-5 h-5" />
						</Button>
					</Link>
				</div>

				<p className="text-sm text-zinc-500 dark:text-zinc-500">
					Усі ваші клієнти в одному місці
				</p>
			</div>
		</div>
	);
}
