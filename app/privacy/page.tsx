/**
 * Public privacy notice.
 *
 * Deliberately readable rather than legally armoured. A page nobody
 * understands satisfies a checkbox, not a person — and the point of GDPR
 * transparency is that the person understands what happens to their data.
 *
 * Kept as a Server Component and outside the (root) group so it is reachable
 * without signing in: a patient deciding whether to register must be able to
 * read it first.
 */

export const metadata = {
	title: 'Приватність — PhysioFlow',
};

const SECTIONS = [
	{
		heading: 'Хто обробляє дані',
		body: 'Ваш фізіотерапевт вирішує, які дані збирати і навіщо — він є розпорядником. PhysioFlow надає йому інструмент і зберігає дані за його дорученням.',
	},
	{
		heading: 'Що зберігається',
		body: 'Для пацієнта: рівень болю, позначені зони тіла, рухи, після яких стає гірше, функціональні обмеження, ваші нотатки, цілі та вимірювання до них, електронна адреса. Для терапевта: імʼя, пошта, картки його пацієнтів і клінічні записи.',
	},
	{
		heading: 'Правова підстава',
		body: 'Дані про здоровʼя належать до особливої категорії за статтею 9 GDPR. Підставою для їх обробки є ваша явна згода, яку ви даєте при першому вході в застосунок і можете відкликати будь-коли.',
	},
	{
		heading: 'Хто має доступ',
		body: 'Пацієнт бачить лише власні записи. Терапевт бачить лише картки своїх пацієнтів. Це обмеження діє на рівні бази даних, а не лише в інтерфейсі — тобто воно працює навіть тоді, коли запит надходить в обхід застосунку.',
	},
	{
		heading: 'Де зберігаються дані',
		body: 'У Supabase — керованій базі PostgreSQL. Регіон сервера обирає власник проєкту при створенні; для практик у ЄС слід обирати європейський регіон.',
	},
	{
		heading: 'Ваші права',
		body: 'Ви можете отримати копію своїх даних, виправити їх, відкликати згоду і повністю видалити обліковий запис разом із записами. Видалення доступне з профілю в застосунку і виконується одразу, без звернень.',
	},
	{
		heading: 'Скільки зберігаються',
		body: 'Записи пацієнта зберігаються, доки він сам їх не видалить. Клінічна картка належить терапевту і підпадає під його власні правила зберігання медичної документації.',
	},
	{
		heading: 'Стан продукту',
		body: 'Це рання версія. Вона може містити помилки, і не варто розглядати її як єдине місце зберігання важливої медичної інформації.',
	},
];

export default function PrivacyPage() {
	return (
		<main className="min-h-screen bg-zinc-50 py-16 px-6">
			<div className="max-w-2xl mx-auto space-y-10">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Приватність і дані
					</h1>
					<p className="text-sm text-muted-foreground">
						Оновлено 27 серпня 2026
					</p>
				</div>

				<div className="space-y-7">
					{SECTIONS.map(section => (
						<section key={section.heading} className="space-y-1.5">
							<h2 className="font-semibold">{section.heading}</h2>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{section.body}
							</p>
						</section>
					))}
				</div>

				<p className="text-xs text-muted-foreground border-t pt-6">
					Питання щодо ваших даних варто адресувати спершу вашому
					фізіотерапевту — саме він вирішує, що і навіщо збирається.
				</p>
			</div>
		</main>
	);
}
