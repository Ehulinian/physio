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
import { ASSESSMENT_STATUS_COLORS } from '@/lib/assessment-types';
import { useLocale } from '@/lib/i18n';

function getInitials(firstName: string, lastName: string) {
	return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

const clientStatusColors: Record<string, string> = {
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
	const { t, locale } = useLocale();
	const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';

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
			<div className="text-sm text-muted-foreground p-4">{t.common.loading}</div>
		);

	const cl = t.clients;
	const ov = t.clients.overview;
	const al = t.clients.assessmentList;

	function assessmentCount(n: number) {
		if (locale === 'uk') {
			return `${n} оцінк${n === 1 ? 'а' : n < 5 ? 'и' : 'ок'}`;
		}
		return `${n} assessment${n === 1 ? '' : 's'}`;
	}

	function symptomCount(n: number) {
		if (locale === 'uk') {
			return `${n} симптом${n === 1 ? '' : n < 5 ? 'и' : 'ів'}`;
		}
		return `${n} symptom${n === 1 ? '' : 's'}`;
	}

	return (
		<div className="space-y-5">
			{/* Back */}
			<Link
				href="/clients"
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-black transition-colors w-fit"
			>
				<ArrowLeft className="w-4 h-4" /> {cl.backToClients}
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
							className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${clientStatusColors[client.status] ?? clientStatusColors.Active}`}
						>
							{cl.status[client.status] ?? client.status}
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
								{cl.startedAt}{' '}
								{new Date(client.started_at).toLocaleDateString(dateLocale, {
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
					<TabsTrigger value="overview">{cl.tabs.overview}</TabsTrigger>
					<TabsTrigger value="assessments">
						{cl.tabs.assessments}
						{assessments.length > 0 && (
							<span className="ml-1.5 text-xs bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5 font-medium">
								{assessments.length}
							</span>
						)}
					</TabsTrigger>
					<TabsTrigger value="notes">{cl.tabs.notes}</TabsTrigger>
				</TabsList>

				{/* OVERVIEW */}
				<TabsContent value="overview">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
						{/* Problem / Symptoms */}
						<div className="border rounded-xl p-4 space-y-3">
							<h3 className="font-semibold text-sm">{ov.problemsTitle}</h3>
							<div>
								<p className="text-xs text-muted-foreground">{ov.mainProblemLabel}</p>
								<p className="text-sm mt-0.5">{client.main_problem || '—'}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">{ov.onsetLabel}</p>
								<p className="text-sm mt-0.5">{client.onset || '—'}</p>
							</div>
						</div>

						{/* Quick Notes */}
						<div className="border rounded-xl p-4 space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-sm">{ov.quickNotes}</h3>
							</div>

							<div className="space-y-3 max-h-48 overflow-y-auto">
								{notes.slice(0, 3).map(n => (
									<div key={n.id}>
										<p className="text-xs text-muted-foreground">
											{new Date(n.created_at).toLocaleDateString(dateLocale, {
												month: 'long',
												day: 'numeric',
												year: 'numeric',
											})}
										</p>
										<p className="text-sm mt-0.5">{n.text}</p>
									</div>
								))}
								{notes.length === 0 && (
									<p className="text-xs text-muted-foreground">{ov.noNotes}</p>
								)}
							</div>

							<div className="flex gap-2 pt-1 border-t">
								<Input
									placeholder={ov.notePlaceholder}
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
									{ov.viewAllNotes}
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
									? al.noCount
									: assessmentCount(assessments.length)}
							</p>
							<Link href={`/clients/${id}/assessment/new`}>
								<Button
									size="sm"
									className="bg-violet-600 hover:bg-violet-700 text-white"
								>
									<Plus className="w-4 h-4 mr-1.5" />
									{al.newAssessment}
								</Button>
							</Link>
						</div>

						{assessments.length === 0 ? (
							<div className="border rounded-xl p-8 text-center space-y-3">
								<ClipboardList className="w-8 h-8 text-gray-300 mx-auto" />
								<div>
									<p className="text-sm font-medium text-gray-600">
										{al.noCount}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										{al.emptyDescription}
									</p>
								</div>
								<Link href={`/clients/${id}/assessment/new`}>
									<Button
										size="sm"
										className="bg-violet-600 hover:bg-violet-700 text-white mt-2"
									>
										{al.startFirst}
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
													{new Date(a.created_at).toLocaleDateString(dateLocale, {
														month: 'long',
														day: 'numeric',
														year: 'numeric',
													})}
												</p>
												<p className="text-xs text-muted-foreground">
													{a.protocol.symptoms.length > 0
														? symptomCount(a.protocol.symptoms.length)
														: al.noSymptoms}
													{a.protocol.pain.present
														? ` · ${al.pain} ${a.protocol.pain.intensity}/10`
														: ''}
												</p>
											</div>
											<span
												className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ASSESSMENT_STATUS_COLORS[a.status]}`}
											>
												{t.assessment.statusLabels[a.status] ?? a.status}
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
								placeholder={cl.notes.placeholder}
								value={text}
								onChange={e => setText(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && addNote()}
							/>
							<Button
								className="bg-violet-600 hover:bg-violet-700"
								onClick={addNote}
							>
								{cl.notes.add}
							</Button>
						</div>
						<div className="space-y-3">
							{notes.map(n => (
								<div key={n.id} className="border rounded-lg p-3">
									<p className="text-sm">{n.text}</p>
									<p className="text-xs text-muted-foreground mt-1">
										{new Date(n.created_at).toLocaleDateString(dateLocale, {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</p>
								</div>
							))}
							{notes.length === 0 && (
								<p className="text-sm text-muted-foreground">{cl.notes.noNotes}</p>
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
