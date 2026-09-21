import { SEARCHLE_PUZZLES } from '$lib/searchle/searchleData';
import { getSearchlePuzzleForDate } from '$lib/searchle/daily';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	totalPuzzles: SEARCHLE_PUZZLES.length,
	todayPuzzle: getSearchlePuzzleForDate(getPuzzleDateForGame('searchle')),
	meta: {
		description: `Today's Searchle autocomplete answer is revealed on this page, with the prompt, the expected word, and all ${SEARCHLE_PUZZLES.length.toLocaleString('en-US')} past puzzles listed in the archive.`
	}
});
