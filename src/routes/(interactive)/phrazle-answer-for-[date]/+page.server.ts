import { error } from '@sveltejs/kit';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { getDatedGame, datedWindowEntries } from '$lib/dated-answer';
import { getDatedProse, deterministicProse } from '$lib/ai-hints';
import { parseMonthDayYearKey, toArchiveDateKey, toMonthDayYearKey } from '$lib/archive-page';
import { formatDate } from '$lib/utils';
import type { PageServerLoad } from './$types';

const GAME_KEY = 'phrazle' as const;

export const prerender = true;

// Rolling 120-day window ending yesterday (today lives on phrazle-answer-today).
// Dates without a resolvable answer are dropped so prerender never 404s.
export function entries() {
	return datedWindowEntries(GAME_KEY);
}

export const load: PageServerLoad = async ({ params }) => {
	const game = getDatedGame(GAME_KEY);
	if (!game) throw error(404, `Unknown game: ${GAME_KEY}`);

	const date = parseMonthDayYearKey(params.date);
	if (!date) throw error(404, `Invalid date slug: ${params.date}`);

	const dateKey = toArchiveDateKey(date);
	const todayPuzzle = getPuzzleDateForGame(GAME_KEY);
	const todayKey = toArchiveDateKey(todayPuzzle);
	const yesterday = new Date(todayPuzzle);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);
	const yesterdayKey = toArchiveDateKey(yesterday);

	// Dated pages run launch..yesterday; today lives on phrazle-answer-today.
	if (dateKey > yesterdayKey) throw error(404, 'Date is in the future');
	if (dateKey < game.launchDate) throw error(404, 'Date is before launch');

	const answer = game.answerForDate(dateKey);
	if (!answer) throw error(404, 'No answer for this date');

	const dateLong = formatDate(date);
	const prose =
		getDatedProse(GAME_KEY, dateKey) ??
		deterministicProse(game.label, dateLong, answer.numberText, answer.text);

	const prevDate = new Date(date);
	prevDate.setUTCDate(prevDate.getUTCDate() - 1);
	const nextDate = new Date(date);
	nextDate.setUTCDate(nextDate.getUTCDate() + 1);
	const prevKey = toArchiveDateKey(prevDate);
	const nextKey = toArchiveDateKey(nextDate);

	return {
		gameKey: GAME_KEY,
		gameLabel: game.label,
		dateKey,
		dateLong,
		numberText: answer.numberText,
		answerText: answer.text,
		prevDateParam: prevKey >= game.launchDate ? toMonthDayYearKey(prevDate) : null,
		// Newer is omitted on yesterday's page: today lives on phrazle-answer-today.
		nextDateParam: nextKey < todayKey ? toMonthDayYearKey(nextDate) : null,
		prose
	};
};
