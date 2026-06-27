import { supabase } from './supabase';
import {
	DEFAULT_PROTOCOL,
	type AssessmentProtocol,
	type AssessmentStatus,
	type PhysioAssessment,
} from '@/lib/assessment-types';

export async function getAssessments(
	clientId: string,
): Promise<PhysioAssessment[]> {
	const { data, error } = await supabase
		.from('physio_assessments')
		.select('*')
		.eq('client_id', clientId)
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data ?? [];
}

export async function getAssessment(
	id: string,
): Promise<PhysioAssessment | null> {
	const { data, error } = await supabase
		.from('physio_assessments')
		.select('*')
		.eq('id', id)
		.single();

	if (error) return null;
	return data;
}

export async function createAssessment(
	clientId: string,
): Promise<PhysioAssessment> {
	const { data, error } = await supabase
		.from('physio_assessments')
		.insert({
			client_id: clientId,
			status: 'чернетка' as AssessmentStatus,
			version: 1,
			protocol: DEFAULT_PROTOCOL,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function saveAssessment(
	id: string,
	protocol: AssessmentProtocol,
	status: AssessmentStatus = 'чернетка',
): Promise<void> {
	const { error } = await supabase
		.from('physio_assessments')
		.update({ protocol, status, updated_at: new Date().toISOString() })
		.eq('id', id);

	if (error) throw error;
}

export async function deleteAssessment(id: string): Promise<void> {
	const { error } = await supabase
		.from('physio_assessments')
		.delete()
		.eq('id', id);

	if (error) throw error;
}
