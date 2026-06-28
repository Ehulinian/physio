'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';

export type Locale = 'uk' | 'en';

const uk = {
	nav: {
		main: 'Основна',
		clients: 'Клієнти',
	},
	common: {
		loading: 'Завантаження...',
		saving: 'Збереження...',
		saved: 'Збережено',
		add: 'Додати',
	},
	clients: {
		title: 'Клієнти',
		subtitle: 'Керуйте всіма своїми клієнтами в одному місці',
		newClient: '+ Новий клієнт',
		searchPlaceholder: 'Пошук клієнтів...',
		backToClients: 'Повернутись до клієнтів',
		backToClient: 'Повернутися до клієнта',
		startedAt: 'Початок',
		tabs: {
			overview: 'Загальний огляд',
			assessments: 'Оцінки',
			notes: 'Нотатки',
		},
		status: {
			Active: 'Активний',
			Paused: 'Призупинено',
			Completed: 'Завершено',
		} as Record<string, string>,
		form: {
			title: 'Додати нового клієнта',
			basicInfo: 'Основна інформація',
			firstName: "Ім'я",
			firstNamePlaceholder: "Введіть ім'я",
			lastName: 'Прізвище',
			lastNamePlaceholder: 'Введіть прізвище',
			email: 'Email (необов\'язково)',
			emailPlaceholder: 'Введіть email',
			age: 'Вік',
			agePlaceholder: 'Вік',
			gender: 'Стать',
			genderDefault: 'Оберіть стать',
			genderMale: 'Чоловік',
			genderFemale: 'Жінка',
			startedAt: 'Дата початку',
			mainProblem: 'Основна проблема',
			mainProblemLabel: 'У чому головна проблема?',
			mainProblemPlaceholder: 'Опишіть основну проблему',
			onsetLabel: 'Коли це почалося?',
			onsetPlaceholder: 'Як і коли це почалося?',
			creating: 'Створення...',
			create: 'Створити клієнта',
		},
		overview: {
			problemsTitle: 'Проблеми / Симптоми',
			mainProblemLabel: 'Головне питання',
			onsetLabel: 'Початок',
			quickNotes: 'Швидкі нотатки',
			noNotes: 'Приміток ще немає',
			viewAllNotes: 'Переглянути всі нотатки →',
			notePlaceholder: 'Додати примітку...',
		},
		assessmentList: {
			noCount: 'Оцінок ще немає',
			emptyDescription:
				'Розпочніть структуровану фізіооцінку для відстеження симптомів та болю',
			startFirst: 'Почати перше оцінювання',
			newAssessment: 'Нова оцінка',
			noSymptoms: 'Симптоми не записані',
			pain: 'Біль',
		},
		notes: {
			placeholder: 'Додати примітку...',
			noNotes: 'Приміток ще немає',
			add: 'Додати',
		},
	},
	assessment: {
		title: 'Оцінка',
		newTitle: 'Нова оцінка',
		autoSave:
			'Автоматичне збереження після кожної зміни — натисніть «Завершити», коли закінчите',
		readOnly: 'Це оцінювання завершене та доступне лише для читання',
		saveDraft: 'Зберегти чернетку',
		complete: 'Виконано',
		// Keys mirror DB values intentionally
		statusLabels: {
			чернетка: 'Чернетка',
			виконано: 'Виконано',
		} as Record<string, string>,
		sections: {
			symptoms: {
				title: 'Симптоми',
				subtitle: 'Виберіть усе, що підходить',
			},
			pain: {
				title: 'Оцінка болю',
				subtitle: 'Інтенсивність, місця та тип',
				present: 'Біль присутній',
				notPresent: 'Немає повідомлень про біль',
				intensity: 'Інтенсивність болю',
				locations: 'Локалізації болю',
				types: 'Тип болю',
				noPain: 'Без болю',
				moderate: 'Помірний',
				worst: 'Найгірший',
			},
			functional: {
				title: 'Функціональні обмеження',
				subtitle: 'Діяльність, на яку впливає стан',
			},
			notes: {
				title: 'Додаткові примітки',
				subtitle: 'Опис пацієнта та клінічні спостереження',
				patientReported: 'Пацієнт повідомив',
				clinicianObservations: 'Клінічні спостереження',
				patientPlaceholder: 'Те, що описує пацієнт...',
				clinicianPlaceholder: 'Клінічні дані, постава, діапазон рухів...',
			},
		},
	},
	symptoms: {
		headache: 'Головний біль',
		neck_pain: 'Біль у шиї',
		shoulder_pain: 'Біль у плечі',
		lower_back_pain: 'Біль у попереку',
		radiating_pain: 'Іррадіюючий біль',
		numbness_tingling: 'Оніміння / поколювання',
		reduced_mobility: 'Знижена рухливість',
		fatigue: 'Втома',
	},
	painTypes: {
		sharp: 'Гострий',
		dull: 'Тупий',
		burning: 'Пекучий',
		stabbing: 'Колючий',
		aching: 'Ниючий',
	},
	painLocations: {
		head: 'Голова',
		neck: 'Шия',
		left_shoulder: 'Ліве плече',
		right_shoulder: 'Праве плече',
		upper_back: 'Верхня частина спини',
		lower_back: 'Поперек',
		left_arm: 'Ліва рука',
		right_arm: 'Права рука',
		left_hip: 'Ліве стегно',
		right_hip: 'Праве стегно',
		left_leg: 'Ліва нога',
		right_leg: 'Права нога',
		left_knee: 'Ліве коліно',
		right_knee: 'Праве коліно',
		left_foot: 'Ліва стопа',
		right_foot: 'Права стопа',
	},
	functionalLimitations: {
		walking: 'Ходьба',
		bending: 'Нахили',
		lifting: 'Піднімання',
		sitting: 'Сидіння',
		sleeping: 'Сон',
		sport_activity: 'Спортивна активність',
	},
};

const en: typeof uk = {
	nav: {
		main: 'Main',
		clients: 'Clients',
	},
	common: {
		loading: 'Loading...',
		saving: 'Saving...',
		saved: 'Saved',
		add: 'Add',
	},
	clients: {
		title: 'Clients',
		subtitle: 'Manage all your clients in one place',
		newClient: '+ New client',
		searchPlaceholder: 'Search clients...',
		backToClients: 'Back to clients',
		backToClient: 'Back to client',
		startedAt: 'Started',
		tabs: {
			overview: 'Overview',
			assessments: 'Assessments',
			notes: 'Notes',
		},
		status: {
			Active: 'Active',
			Paused: 'Paused',
			Completed: 'Completed',
		} as Record<string, string>,
		form: {
			title: 'Add new client',
			basicInfo: 'Basic information',
			firstName: 'First name',
			firstNamePlaceholder: 'Enter first name',
			lastName: 'Last name',
			lastNamePlaceholder: 'Enter last name',
			email: 'Email (optional)',
			emailPlaceholder: 'Enter email',
			age: 'Age',
			agePlaceholder: 'Age',
			gender: 'Gender',
			genderDefault: 'Select gender',
			genderMale: 'Male',
			genderFemale: 'Female',
			startedAt: 'Start date',
			mainProblem: 'Main problem',
			mainProblemLabel: 'What is the main problem?',
			mainProblemPlaceholder: 'Describe the main problem',
			onsetLabel: 'When did it start?',
			onsetPlaceholder: 'How and when did it start?',
			creating: 'Creating...',
			create: 'Create client',
		},
		overview: {
			problemsTitle: 'Problems / Symptoms',
			mainProblemLabel: 'Chief complaint',
			onsetLabel: 'Onset',
			quickNotes: 'Quick notes',
			noNotes: 'No notes yet',
			viewAllNotes: 'View all notes →',
			notePlaceholder: 'Add a note...',
		},
		assessmentList: {
			noCount: 'No assessments yet',
			emptyDescription:
				'Start a structured physiotherapy assessment to track symptoms and pain',
			startFirst: 'Start first assessment',
			newAssessment: 'New assessment',
			noSymptoms: 'No symptoms recorded',
			pain: 'Pain',
		},
		notes: {
			placeholder: 'Add a note...',
			noNotes: 'No notes yet',
			add: 'Add',
		},
	},
	assessment: {
		title: 'Assessment',
		newTitle: 'New assessment',
		autoSave:
			'Auto-saves after every change — click "Complete" when finished',
		readOnly: 'This assessment is complete and read-only',
		saveDraft: 'Save draft',
		complete: 'Complete',
		statusLabels: {
			чернетка: 'Draft',
			виконано: 'Completed',
		} as Record<string, string>,
		sections: {
			symptoms: {
				title: 'Symptoms',
				subtitle: 'Select all that apply',
			},
			pain: {
				title: 'Pain assessment',
				subtitle: 'Intensity, locations and type',
				present: 'Pain present',
				notPresent: 'No pain reported',
				intensity: 'Pain intensity',
				locations: 'Pain locations',
				types: 'Pain type',
				noPain: 'No pain',
				moderate: 'Moderate',
				worst: 'Worst',
			},
			functional: {
				title: 'Functional limitations',
				subtitle: 'Activities affected by the condition',
			},
			notes: {
				title: 'Additional notes',
				subtitle: "Patient description and clinician's observations",
				patientReported: 'Patient reported',
				clinicianObservations: 'Clinician observations',
				patientPlaceholder: 'What the patient describes...',
				clinicianPlaceholder: 'Clinical findings, posture, range of motion...',
			},
		},
	},
	symptoms: {
		headache: 'Headache',
		neck_pain: 'Neck pain',
		shoulder_pain: 'Shoulder pain',
		lower_back_pain: 'Lower back pain',
		radiating_pain: 'Radiating pain',
		numbness_tingling: 'Numbness / tingling',
		reduced_mobility: 'Reduced mobility',
		fatigue: 'Fatigue',
	},
	painTypes: {
		sharp: 'Sharp',
		dull: 'Dull',
		burning: 'Burning',
		stabbing: 'Stabbing',
		aching: 'Aching',
	},
	painLocations: {
		head: 'Head',
		neck: 'Neck',
		left_shoulder: 'Left shoulder',
		right_shoulder: 'Right shoulder',
		upper_back: 'Upper back',
		lower_back: 'Lower back',
		left_arm: 'Left arm',
		right_arm: 'Right arm',
		left_hip: 'Left hip',
		right_hip: 'Right hip',
		left_leg: 'Left leg',
		right_leg: 'Right leg',
		left_knee: 'Left knee',
		right_knee: 'Right knee',
		left_foot: 'Left foot',
		right_foot: 'Right foot',
	},
	functionalLimitations: {
		walking: 'Walking',
		bending: 'Bending',
		lifting: 'Lifting',
		sitting: 'Sitting',
		sleeping: 'Sleeping',
		sport_activity: 'Sport activity',
	},
};

export type Translations = typeof uk;

const translations: Record<Locale, Translations> = { uk, en };

interface LocaleContextValue {
	locale: Locale;
	t: Translations;
	setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
	locale: 'uk',
	t: uk,
	setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>('uk');

	useEffect(() => {
		const saved = localStorage.getItem('locale') as Locale;
		if (saved === 'uk' || saved === 'en') setLocaleState(saved);
	}, []);

	function setLocale(next: Locale) {
		setLocaleState(next);
		localStorage.setItem('locale', next);
	}

	return (
		<LocaleContext.Provider value={{ locale, t: translations[locale], setLocale }}>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocale() {
	return useContext(LocaleContext);
}

export function LanguageSwitcher() {
	const { locale, setLocale } = useLocale();
	return (
		<button
			onClick={() => setLocale(locale === 'uk' ? 'en' : 'uk')}
			className="text-xs px-2 py-1 rounded border border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
		>
			{locale === 'uk' ? 'EN' : 'УК'}
		</button>
	);
}
