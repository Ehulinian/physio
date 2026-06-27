'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/supabase/supabase';
import { getAssessments } from '@/supabase/assessments';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ArrowLeft, Calendar, ClipboardList, Plus, User } from 'lucide-react';
import type { PhysioAssessment } from '@/lib/assessment-types';

function getInitials(firstName: string, lastName: string) {
	return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

const statusColors: Record<string, string> = {
	Active: 'bg-green-100 text-green-700',
	Paused: 'bg-yellow-100 text-yellow-700',
	Completed: 'bg-gray-100 text-gray-500',
};

const assessmentStatusColors: Record<string, string> = {
	draft: 'bg-yellow-100 text-yellow-700',
	completed: 'bg-green-100 text-green-700',
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
	const [assessments, setAssessments] = useState<PhysioAssessment[]>([]);
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
			const aData = await getAssessments(id);
			setAssessments(aData);
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
		return (
			<div className="text-sm text-muted-foreground p-4">Завантаження...</div>
		);

	return (
		<div className="space-y-5">
			{/* Back */}
			<Link
				href="/clients"
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-black transition-colors w-fit"
			>
				<ArrowLeft className="w-4 h-4" /> Повернутись до клієнтів
			</Link>

			{/* Profile header */}
			<div className="flex items-center gap-4">
				<div className="w-16 h-16 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-semibold shrink-0">
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
					<TabsTrigger value="overview">Загальний огляд</TabsTrigger>
					<TabsTrigger value="assessments">
						Оцінки
						{assessments.length > 0 && (
							<span className="ml-1.5 text-xs bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5 font-medium">
								{assessments.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="notes">Нотатки</TabsTrigger>
				</TabsList>

				{/* OVERVIEW */}
				<TabsContent value="overview">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
						{/* Problem / Symptoms */}
						<div className="border rounded-xl p-4 space-y-3">
							<h3 className="font-semibold text-sm">Проблеми / Симптоми</h3>
							<div>
								<p className="text-xs text-muted-foreground">Головне питання</p>
								<p className="text-sm mt-0.5">{client.main_problem || '—'}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Початок</p>
								<p className="text-sm mt-0.5">{client.onset || '—'}</p>
							</div>
						</div>

						{/* Quick Notes */}
						<div className="border rounded-xl p-4 space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-sm">Швидкі нотатки</h3>
							</div>

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
									<p className="text-xs text-muted-foreground">
										Приміток ще немає
									</p>
								)}
							</div>

							<div className="flex gap-2 pt-1 border-t">
								<Input
									placeholder="Додати примітку..."
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
									<Plus className="w-4 h-4" />
								</Button>
							</div>

							{notes.length > 3 && (
								<button
									onClick={() => {}}
									className="text-xs text-violet-600 hover:underline"
								>
									Переглянути всі нотатки →
								</button>
							)}
						</div>
					</div>
				</TabsContent>

				{/* ASSESSMENTS */}
				<TabsContent value="assessments">
					<div className="mt-4 space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								{assessments.length === 0
									? 'No assessments yet'
									: `${assessments.length} assessment${assessments.length > 1 ? 's' : ''}`}
							</p>
							<Link href={`/clients/${id}/assessment/new`}>
								<Button
									size="sm"
									className="bg-violet-600 hover:bg-violet-700 text-white"
								>
									<Plus className="w-4 h-4 mr-1.5" />
									Нова оцінка
								</Button>
							</Link>
						</div>

						{assessments.length === 0 ? (
							<div className="border rounded-xl p-8 text-center space-y-3">
								<ClipboardList className="w-8 h-8 text-gray-300 mx-auto" />
								<div>
									<p className="text-sm font-medium text-gray-600">
										Оцінок ще немає
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Розпочніть структуровану фізіооцінку для відстеження
										симптомів та болю
									</p>
								</div>
								<Link href={`/clients/${id}/assessment/new`}>
									<Button
										size="sm"
										className="bg-violet-600 hover:bg-violet-700 text-white mt-2"
									>
										Почати перше оцінювання
									</Button>
								</Link>
							</div>
						) : (
							<div className="space-y-2">
								{assessments.map(a => (
									<Link key={a.id} href={`/clients/${id}/assessment/${a.id}`}>
										<div className="flex items-center gap-4 px-4 py-3 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
											<ClipboardList className="w-5 h-5 text-violet-400 shrink-0" />
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium">
													{new Date(a.created_at).toLocaleDateString('en-US', {
														month: 'long',
														day: 'numeric',
														year: 'numeric',
													})}
												</p>
												<p className="text-xs text-muted-foreground">
													{a.protocol.symptoms.length > 0
														? `${a.protocol.symptoms.length} symptom${a.protocol.symptoms.length > 1 ? 's' : ''}`
														: 'No symptoms recorded'}
													{a.protocol.pain.present
														? ` · Pain ${a.protocol.pain.intensity}/10`
														: ''}
												</p>
											</div>
											<span
												className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${assessmentStatusColors[a.status]}`}
											>
												{a.status}
											</span>
											<span className="text-gray-300">›</span>
										</div>
									</Link>
								))}
							</div>
						)}
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
							<Button
								className="bg-violet-600 hover:bg-violet-700"
								onClick={addNote}
							>
								Додати
							</Button>
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
								<p className="text-sm text-muted-foreground">
									Приміток ще немає
								</p>
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
