// IDs only — labels come from i18n translations (lib/i18n)
export const SYMPTOMS = [
	{ id: 'headache' },
	{ id: 'neck_pain' },
	{ id: 'shoulder_pain' },
	{ id: 'lower_back_pain' },
	{ id: 'radiating_pain' },
	{ id: 'numbness_tingling' },
	{ id: 'reduced_mobility' },
	{ id: 'fatigue' },
] as const;

export const PAIN_TYPES = [
	{ id: 'sharp' },
	{ id: 'dull' },
	{ id: 'burning' },
	{ id: 'stabbing' },
	{ id: 'aching' },
] as const;

export const PAIN_LOCATIONS = [
	{ id: 'head' },
	{ id: 'neck' },
	{ id: 'left_shoulder' },
	{ id: 'right_shoulder' },
	{ id: 'upper_back' },
	{ id: 'lower_back' },
	{ id: 'left_arm' },
	{ id: 'right_arm' },
	{ id: 'left_hip' },
	{ id: 'right_hip' },
	{ id: 'left_leg' },
	{ id: 'right_leg' },
	{ id: 'left_knee' },
	{ id: 'right_knee' },
	{ id: 'left_foot' },
	{ id: 'right_foot' },
] as const;

export const FUNCTIONAL_LIMITATIONS = [
	{ id: 'walking' },
	{ id: 'bending' },
	{ id: 'lifting' },
	{ id: 'sitting' },
	{ id: 'sleeping' },
	{ id: 'sport_activity' },
] as const;

export type SymptomId = (typeof SYMPTOMS)[number]['id'];
export type PainTypeId = (typeof PAIN_TYPES)[number]['id'];
export type PainLocationId = (typeof PAIN_LOCATIONS)[number]['id'];
export type FunctionalLimitationId =
	(typeof FUNCTIONAL_LIMITATIONS)[number]['id'];

export interface PainData {
	present: boolean;
	intensity: number;
	locations: PainLocationId[];
	types: PainTypeId[];
}

export interface AssessmentNotes {
	patient_reported: string;
	clinician_observations: string;
}

export interface AssessmentProtocol {
	symptoms: SymptomId[];
	pain: PainData;
	functional_limitations: FunctionalLimitationId[];
	notes: AssessmentNotes;
}

export const DEFAULT_PROTOCOL: AssessmentProtocol = {
	symptoms: [],
	pain: {
		present: false,
		intensity: 0,
		locations: [],
		types: [],
	},
	functional_limitations: [],
	notes: {
		patient_reported: '',
		clinician_observations: '',
	},
};

// DB values — kept in Ukrainian to match stored data
export type AssessmentStatus = 'чернетка' | 'виконано';

// Centralized color map keyed by DB values
export const ASSESSMENT_STATUS_COLORS: Record<AssessmentStatus, string> = {
	чернетка: 'bg-yellow-100 text-yellow-700',
	виконано: 'bg-green-100 text-green-700',
};

export interface PhysioAssessment {
	id: string;
	client_id: string;
	clinician_id: string | null;
	status: AssessmentStatus;
	version: number;
	protocol: AssessmentProtocol;
	created_at: string;
	updated_at: string;
}
