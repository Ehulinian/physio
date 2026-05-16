'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Plus } from 'lucide-react';

function getInitials(firstName: string, lastName: string) {
	return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

const statusColors: Record<string, string> = {
	Active: 'bg-green-100 text-green-700',
	Paused: 'bg-yellow-100 text-yellow-700',
	Completed: 'bg-gray-100 text-gray-500',
};

export default function ClientPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [client, setClient] = useState<any>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [notes, setNotes] = useState<any[]>([]);
	const [text, setText] = useState('');

	useEffect(() => {
		if (!id) return;
		const load = async () => {
			const [{ data: clientData }, { data: notesData }] = await Promise.all([
				supabase.from('clients').select('*').eq('id', id).single(),
				supabase
					.from('notes')
					.select('*')
					.eq('client_id', id)
					.order('created_at', { ascending: false }),
			]);
			setClient(clientData);
			setNotes(notesData || []);
		};
		load();
	}, [id]);

	async function addNote() {
		if (!text.trim()) return;
		const { error } = await supabase
			.from('notes')
			.insert({ client_id: id, text });
		if (!error) {
			setText('');
			const { data } = await supabase
				.from('notes')
				.select('*')
				.eq('client_id', id)
				.order('created_at', { ascending: false });
			setNotes(data || []);
		}
	}

	if (!client)
		return <div className="text-sm text-muted-foreground p-4">Loading...</div>;

	return (
		<div className="space-y-5">
			{/* Back */}
			<Link
				href="/clients"
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-black transition-colors w-fit"
			>
				<ArrowLeft className="w-4 h-4" /> Back to clients
			</Link>

			{/* Profile header */}
			<div className="flex items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-semibold flex-shrink-0">
					{getInitials(client.first_name, client.last_name)}
				</div>
				<div>
					<div className="flex items-center gap-2 mb-1">
						<h1 className="text-xl font-bold">
							{client.first_name} {client.last_name}
						</h1>
						<span
							className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[client.status] ?? statusColors.Active}`}
						>
							{client.status}
						</span>
					</div>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						{client.gender && (
							<span className="flex items-center gap-1">
								<User className="w-3.5 h-3.5" />
								{client.gender}
								{client.age ? `, ${client.age}` : ''}
							</span>
						)}
						{client.started_at && (
							<span className="flex items-center gap-1">
								<Calendar className="w-3.5 h-3.5" />
								Started{' '}
								{new Date(client.started_at).toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
									year: 'numeric',
								})}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="notes">Notes</TabsTrigger>
				</TabsList>

				{/* OVERVIEW */}
				<TabsContent value="overview">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
						{/* Problem / Symptoms */}
						<div className="border rounded-xl p-4 space-y-3">
							<h3 className="font-semibold text-sm">Problem / Symptoms</h3>
							<div>
								<p className="text-xs text-muted-foreground">Main issue</p>
								<p className="text-sm mt-0.5">{client.main_problem || '—'}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Onset</p>
								<p className="text-sm mt-0.5">{client.onset || '—'}</p>
							</div>
						</div>

						{/* Quick Notes */}
						<div className="border rounded-xl p-4 space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-sm">Quick Notes</h3>
							</div>

							{/* Notes list */}
							<div className="space-y-3 max-h-48 overflow-y-auto">
								{notes.slice(0, 3).map(n => (
									<div key={n.id}>
										<p className="text-xs text-muted-foreground">
											{new Date(n.created_at).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric',
											})}
										</p>
										<p className="text-sm mt-0.5">{n.text}</p>
									</div>
								))}
								{notes.length === 0 && (
									<p className="text-xs text-muted-foreground">No notes yet</p>
								)}
							</div>

							{/* Add note inline */}
							<div className="flex gap-2 pt-1 border-t">
								<Input
									placeholder="Add note..."
									value={text}
									onChange={e => setText(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && addNote()}
									className="text-sm h-8"
								/>
								<Button
									size="sm"
									onClick={addNote}
									className="h-8 px-3 bg-violet-600"
								>
									<Plus className="w-4 h-4  " />
								</Button>
							</div>

							{notes.length > 3 && (
								<button
									onClick={() => {}}
									className="text-xs text-violet-600 hover:underline"
								>
									View all notes →
								</button>
							)}
						</div>
					</div>
				</TabsContent>

				{/* NOTES */}
				<TabsContent value="notes">
					<div className="mt-4 border rounded-xl p-4 space-y-4">
						<div className="flex gap-2">
							<Input
								placeholder="Add a note..."
								value={text}
								onChange={e => setText(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && addNote()}
							/>
							<Button onClick={addNote}>Add</Button>
						</div>
						<div className="space-y-3">
							{notes.map(n => (
								<div key={n.id} className="border rounded-lg p-3">
									<p className="text-sm">{n.text}</p>
									<p className="text-xs text-muted-foreground mt-1">
										{new Date(n.created_at).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</p>
								</div>
							))}
							{notes.length === 0 && (
								<p className="text-sm text-muted-foreground">No notes yet</p>
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
