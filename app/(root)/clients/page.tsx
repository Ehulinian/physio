'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Title } from '@/components/shared/title';

function getInitials(firstName: string, lastName: string) {
	return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

const statusColors: Record<string, string> = {
	Active: 'bg-green-100 text-green-700',
	Paused: 'bg-yellow-100 text-yellow-700',
	Completed: 'bg-gray-100 text-gray-500',
};

export default function ClientsPage() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [clients, setClients] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const [open, setOpen] = useState(false);
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		first_name: '',
		last_name: '',
		email: '',
		age: '',
		gender: '',
		main_problem: '',
		onset: '',
		started_at: '',
		status: 'Active',
	});

	const fetchClients = async () => {
		const { data } = await supabase
			.from('clients')
			.select('*')
			.order('created_at', { ascending: false });
		setClients(data || []);
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchClients();
	}, []);

	function openPanel() {
		setVisible(true);
		setTimeout(() => setOpen(true), 10);
	}

	function closePanel() {
		setOpen(false);
		setTimeout(() => setVisible(false), 300);
	}

	const filtered = clients.filter(c => {
		const full =
			`${c.first_name} ${c.last_name} ${c.email} ${c.main_problem}`.toLowerCase();
		return full.includes(search.toLowerCase());
	});

	async function createClient() {
		if (!form.first_name.trim()) return;
		setLoading(true);
		const { error } = await supabase.from('clients').insert({
			first_name: form.first_name,
			last_name: form.last_name,
			email: form.email,
			age: form.age ? parseInt(form.age) : null,
			gender: form.gender,
			status: form.status,
			main_problem: form.main_problem,
			onset: form.onset,
			started_at: form.started_at || new Date().toISOString().split('T')[0],
		});

		if (!error) {
			setForm({
				first_name: '',
				last_name: '',
				email: '',
				age: '',
				gender: '',
				main_problem: '',
				onset: '',
				started_at: '',
				status: 'Active',
			});
			closePanel();
			fetchClients();
		}
		setLoading(false);
	}

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between mb-1">
				<div>
					<Title text="Clients" className="font-semibold" size="xl" />
					<p className="text-sm text-muted-foreground mt-1">
						Manage all your clients in one place
					</p>
				</div>
				<Button
					onClick={openPanel}
					className="bg-violet-600 hover:bg-violet-700 text-white"
				>
					+ New client
				</Button>
			</div>

			{/* Search */}
			<div className="relative my-4">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<Input
					placeholder="Search clients..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					className="pl-9"
				/>
			</div>

			{/* List */}
			<div className="space-y-2">
				{filtered.map(c => (
					<Link key={c.id} href={`/clients/${c.id}`}>
						<div className="flex items-center gap-4 px-4 py-3 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
							<div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
								{getInitials(c.first_name, c.last_name)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm">
									{c.first_name} {c.last_name}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{c.main_problem || '—'}
								</p>
							</div>
							<div className="text-xs text-muted-foreground text-right hidden sm:block">
								<p className="text-gray-400">Started</p>
								<p>
									{c.started_at
										? new Date(c.started_at).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})
										: '—'}
								</p>
							</div>
							<span
								className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[c.status] ?? statusColors.Active}`}
							>
								{c.status}
							</span>
							<span className="text-gray-300">›</span>
						</div>
					</Link>
				))}
			</div>

			{/* Side Panel */}
			{visible && (
				<div
					className={`fixed inset-0 z-50 flex items-start justify-end transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
					style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
					onClick={closePanel}
				>
					<div
						className={`bg-white h-full w-full max-w-md shadow-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
						onClick={e => e.stopPropagation()}
					>
						{/* Panel header */}
						<div className="flex items-center gap-3 px-6 py-4 border-b">
							<button
								onClick={closePanel}
								className="text-muted-foreground hover:text-black"
							>
								<X className="w-5 h-5" />
							</button>
							<h2 className="font-semibold text-base">Add new client</h2>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
							{/* Basic info */}
							<div>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
									Basic information
								</p>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											First name
										</label>
										<Input
											placeholder="Enter first name"
											value={form.first_name}
											onChange={e =>
												setForm(f => ({ ...f, first_name: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											Last name
										</label>
										<Input
											placeholder="Enter last name"
											value={form.last_name}
											onChange={e =>
												setForm(f => ({ ...f, last_name: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											Email (optional)
										</label>
										<Input
											placeholder="Enter email"
											value={form.email}
											onChange={e =>
												setForm(f => ({ ...f, email: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											Age
										</label>
										<Input
											placeholder="Age"
											type="number"
											value={form.age}
											onChange={e =>
												setForm(f => ({ ...f, age: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											Gender
										</label>
										<select
											className="w-full border rounded-md px-3 py-2 text-sm bg-white"
											value={form.gender}
											onChange={e =>
												setForm(f => ({ ...f, gender: e.target.value }))
											}
										>
											<option value="">Select gender</option>
											<option value="Male">Male</option>
											<option value="Female">Female</option>
										</select>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											Started
										</label>
										<Input
											type="date"
											value={form.started_at}
											onChange={e =>
												setForm(f => ({ ...f, started_at: e.target.value }))
											}
										/>
									</div>
								</div>
							</div>

							{/* Main problem */}
							<div>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
									Main problem
								</p>
								<div className="space-y-3">
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											What is the main issue?
										</label>
										<textarea
											className="w-full border rounded-md px-3 py-2 text-sm resize-none min-h-[80px]"
											placeholder="Describe the main problem"
											value={form.main_problem}
											onChange={e =>
												setForm(f => ({ ...f, main_problem: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											When did it start?
										</label>
										<textarea
											className="w-full border rounded-md px-3 py-2 text-sm resize-none min-h-[80px]"
											placeholder="How and when did it start?"
											value={form.onset}
											onChange={e =>
												setForm(f => ({ ...f, onset: e.target.value }))
											}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t">
							<Button
								className="w-full bg-violet-600 hover:bg-violet-700 text-white"
								onClick={createClient}
								disabled={loading || !form.first_name.trim()}
							>
								{loading ? 'Creating...' : 'Create client'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
