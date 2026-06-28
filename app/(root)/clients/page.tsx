'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Title } from '@/components/shared/title';
import { useLocale } from '@/lib/i18n';

function getInitials(firstName: string, lastName: string) {
	return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

const statusColors: Record<string, string> = {
	Active: 'bg-green-100 text-green-700',
	Paused: 'bg-yellow-100 text-yellow-700',
	Completed: 'bg-gray-100 text-gray-500',
};

export default function ClientsPage() {
	const { t, locale } = useLocale();
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

	const f = t.clients.form;
	const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between mb-1">
				<div>
					<Title text={t.clients.title} className="font-semibold" size="xl" />
					<p className="text-sm text-muted-foreground mt-1">
						{t.clients.subtitle}
					</p>
				</div>
				<Button
					onClick={openPanel}
					className="bg-violet-600 hover:bg-violet-700 text-white"
				>
					{t.clients.newClient}
				</Button>
			</div>

			{/* Search */}
			<div className="relative my-4">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
				<Input
					placeholder={t.clients.searchPlaceholder}
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
							<div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm shrink-0">
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
								<p className="text-gray-400">{t.clients.startedAt}</p>
								<p>
									{c.started_at
										? new Date(c.started_at).toLocaleDateString(dateLocale, {
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
								{t.clients.status[c.status] ?? c.status}
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
							<h2 className="font-semibold text-base">{f.title}</h2>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
							{/* Basic info */}
							<div>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
									{f.basicInfo}
								</p>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.firstName}
										</label>
										<Input
											placeholder={f.firstNamePlaceholder}
											value={form.first_name}
											onChange={e =>
												setForm(p => ({ ...p, first_name: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.lastName}
										</label>
										<Input
											placeholder={f.lastNamePlaceholder}
											value={form.last_name}
											onChange={e =>
												setForm(p => ({ ...p, last_name: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.email}
										</label>
										<Input
											placeholder={f.emailPlaceholder}
											value={form.email}
											onChange={e =>
												setForm(p => ({ ...p, email: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.age}
										</label>
										<Input
											placeholder={f.agePlaceholder}
											type="number"
											value={form.age}
											onChange={e =>
												setForm(p => ({ ...p, age: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.gender}
										</label>
										<select
											className="w-full border rounded-md px-3 py-2 text-sm bg-white"
											value={form.gender}
											onChange={e =>
												setForm(p => ({ ...p, gender: e.target.value }))
											}
										>
											<option value="">{f.genderDefault}</option>
											<option value={f.genderMale}>{f.genderMale}</option>
											<option value={f.genderFemale}>{f.genderFemale}</option>
										</select>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.startedAt}
										</label>
										<Input
											type="date"
											value={form.started_at}
											onChange={e =>
												setForm(p => ({ ...p, started_at: e.target.value }))
											}
										/>
									</div>
								</div>
							</div>

							{/* Main problem */}
							<div>
								<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
									{f.mainProblem}
								</p>
								<div className="space-y-3">
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.mainProblemLabel}
										</label>
										<textarea
											className="w-full border rounded-md px-3 py-2 text-sm resize-none min-h-20"
											placeholder={f.mainProblemPlaceholder}
											value={form.main_problem}
											onChange={e =>
												setForm(p => ({ ...p, main_problem: e.target.value }))
											}
										/>
									</div>
									<div>
										<label className="text-xs text-muted-foreground mb-1 block">
											{f.onsetLabel}
										</label>
										<textarea
											className="w-full border rounded-md px-3 py-2 text-sm resize-none min-h-20"
											placeholder={f.onsetPlaceholder}
											value={form.onset}
											onChange={e =>
												setForm(p => ({ ...p, onset: e.target.value }))
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
								{loading ? f.creating : f.create}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
