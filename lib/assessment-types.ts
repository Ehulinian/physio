export const SYMPTOMS = [
	{ id: 'headache', label: 'Головний біль' },
	{ id: 'neck_pain', label: 'Біль у шиї' },
	{ id: 'shoulder_pain', label: 'Біль у плечі' },
	{ id: 'lower_back_pain', label: 'Біль у попереку' },
	{ id: 'radiating_pain', label: 'Іррадіюючий біль' },
	{ id: 'numbness_tingling', label: 'Оніміння / поколювання' },
	{ id: 'reduced_mobility', label: 'Знижена рухливість' },
	{ id: 'fatigue', label: 'Втома' },
] as const;

export const PAIN_TYPES = [
	{ id: 'sharp', label: 'Гострий' },
	{ id: 'dull', label: 'Тупий' },
	{ id: 'burning', label: 'Пекучий' },
	{ id: 'stabbing', label: 'Колючий' },
	{ id: 'aching', label: 'Ниючий' },
] as const;

export const PAIN_LOCATIONS = [
	{ id: 'head', label: 'Голова' },
	{ id: 'neck', label: 'Шия' },
	{ id: 'left_shoulder', label: 'Ліве плече' },
	{ id: 'right_shoulder', label: 'Праве плече' },
	{ id: 'upper_back', label: 'Верхня частина спини' },
	{ id: 'lower_back', label: 'Поперек' },
	{ id: 'left_arm', label: 'Ліва рука' },
	{ id: 'right_arm', label: 'Права рука' },
	{ id: 'left_hip', label: 'Ліве стегно' },
	{ id: 'right_hip', label: 'Праве стегно' },
	{ id: 'left_leg', label: 'Ліва нога' },
	{ id: 'right_leg', label: 'Права нога' },
	{ id: 'left_knee', label: 'Ліве коліно' },
	{ id: 'right_knee', label: 'Праве коліно' },
	{ id: 'left_foot', label: 'Ліва стопа' },
	{ id: 'right_foot', label: 'Права стопа' },
] as const;

export const FUNCTIONAL_LIMITATIONS = [
	{ id: 'walking', label: 'Ходьба' },
	{ id: 'bending', label: 'Нахили' },
	{ id: 'lifting', label: 'Піднімання' },
	{ id: 'sitting', label: 'Сидіння' },
	{ id: 'sleeping', label: 'Сон' },
	{ id: 'sport_activity', label: 'Спортивна активність' },
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

export type AssessmentStatus = 'чернетка' | 'виконано';

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
