/**
 * Ukrainian plurals.
 *
 * Ukrainian has three forms, not two, and the rule is not "1 vs many":
 *
 *   1, 21, 31 …            → запис    (one)
 *   2–4, 22–24 …           → записи   (few)
 *   5–20, 25–30 …          → записів  (many)
 *
 * The exception in the middle matters: 11–14 take the "many" form despite
 * ending in 1–4, which is why the check is against `n % 100`. Interpolating a
 * number into a fixed string — "за {n} останніх днів" — is correct only for
 * the many form and reads as broken Ukrainian everywhere else.
 */

export function pluralUk(
	n: number,
	one: string,
	few: string,
	many: string,
): string {
	const mod10 = n % 10;
	const mod100 = n % 100;

	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
	return many;
}

/**
 * "останній запис" / "останні 3 записи" / "останні 7 записів".
 *
 * Entries, not days: the diary is not necessarily filled in daily, and calling
 * seven entries "seven days" would quietly overstate how much was measured.
 */
export function lastEntriesLabel(n: number, locale: 'uk' | 'en'): string {
	if (locale === 'en') {
		return n === 1 ? 'the last entry' : `the last ${n} entries`;
	}

	if (n === 1) return 'останній запис';

	const noun = pluralUk(n, 'запис', 'записи', 'записів');
	const adjective = pluralUk(n, 'останній', 'останні', 'останні');

	return `${adjective} ${n} ${noun}`;
}
