import { SEARCHLE_PUZZLES, getDailyPuzzle } from '$lib/searchle/searchleData';
import { getSearchlePuzzleForDate } from '$lib/searchle/daily';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import { format, subDays } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const today = getPuzzleDateForGame('searchle');
	const todayPuzzle = getSearchlePuzzleForDate(today);
	const todayLabel = format(today, 'MMMM d, yyyy');
	// Searchle has no official puzzle number; use the puzzle's stable index
	// within the site's Searchle collection (1-based).
	const searchleNumber = SEARCHLE_PUZZLES.indexOf(getDailyPuzzle(today)) + 1;
	// Bing ranking components (2026-10-06): title built from the shared daily
	// title pattern, keyed on the puzzle-window date (todayLabel) so a "today"
	// page can never carry tomorrow's date or answer here.
	const pageTitle = dailyAnswerTitle('Searchle', searchleNumber, todayLabel);
	const updatedStamp = updatedStampText('Searchle', searchleNumber, todayLabel);
	const aiHints = mergeHints(todayPuzzle.answer, getAIHints('searchle', todayPuzzle.date));

	// Yesterday's entry from the site's own daily mapping.
	const yesterdayDate = subDays(today, 1);
	const yesterdayPuzzle = getSearchlePuzzleForDate(yesterdayDate);
	const yesterday = yesterdayPuzzle
		? {
				number: SEARCHLE_PUZZLES.indexOf(getDailyPuzzle(yesterdayDate)) + 1,
				dateLong: format(yesterdayDate, 'MMMM d, yyyy'),
				answer: yesterdayPuzzle.answer.toUpperCase()
			}
		: null;

	// FactBlock values from the answer.
	const answerLower = todayPuzzle.answer.toLowerCase();
	const vowelCount = answerLower.split('').filter((c: string) => 'aeiou'.includes(c)).length;
	const hasDouble = answerLower
		.split('')
		.some((c: string, i: number, a: string[]) => a.indexOf(c) !== a.lastIndexOf(c));
	const startLetter = todayPuzzle.answer[0]?.toUpperCase() || '';
	const endLetter = todayPuzzle.answer[todayPuzzle.answer.length - 1]?.toUpperCase() || '';

	return {
		totalPuzzles: SEARCHLE_PUZZLES.length,
		todayPuzzle,
		searchleNumber,
		updatedStamp,
		aiHints,
		yesterday,
		vowelCount,
		hasDouble,
		startLetter,
		endLetter,
		meta: {
			title: pageTitle,
			description: `Today's Searchle autocomplete answer is revealed on this page, with the prompt, the expected word, and all ${SEARCHLE_PUZZLES.length.toLocaleString('en-US')} past puzzles listed in the archive.`
		}
	};
};
