import type { PageServerLoad } from './$types';
import { format } from 'date-fns';
import archiveJson from '../../../../static/worgle_archive.json';
import solutionsJson from '../../../../static/worgle_solutions.json';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import {
	formatWorgleDateKey,
	getWorgleEntryForDateKey,
	parseWorgleDateKey,
	type WorgleArchiveEntry
} from '$lib/worgle';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const archive = archiveJson as WorgleArchiveEntry[];
	const solutions = solutionsJson as string[];
	const todayDate = getPuzzleDateForGame('worgle');
	const todayKey = formatWorgleDateKey(todayDate);
	const todayEntry = getWorgleEntryForDateKey(todayKey, archive, solutions);
	const latestStoredEntry = archive[archive.length - 1] ?? null;
	const last30Entries = archive.filter((entry) => entry.date <= todayKey).slice(-30).reverse();
	const previousEntry =
		archive
			.filter((entry) => entry.date < todayKey)
			.slice(-1)
			.at(0) ?? null;
	const formattedDate = format(parseWorgleDateKey(todayKey), 'MMMM d, yyyy');
	const pageTitle = dailyAnswerTitle('Worgle', todayEntry.puzzle, formattedDate);
	const updatedStamp = updatedStampText('Worgle', todayEntry.puzzle, formattedDate);
	const aiHints = mergeHints(todayEntry.word, getAIHints('worgle', todayKey));
	const hintFaqs = [
		{ question: 'When was this page last updated?', answer: updatedStamp }
	];
	const yesterday = previousEntry
		? {
				number: previousEntry.puzzle,
				dateLong: format(parseWorgleDateKey(previousEntry.date), 'MMMM d, yyyy'),
				answer: previousEntry.word
			}
		: null;
	const factLetters = todayEntry.word.toLowerCase().replace(/[^a-z]/g, '');
	const factRepeatCount = factLetters.length - new Set(factLetters).size;
	const factData = {
		puzzleNumber: String(todayEntry.puzzle),
		dateLong: formattedDate,
		firstLetter: factLetters[0]?.toUpperCase() ?? '',
		lastLetter: factLetters[factLetters.length - 1]?.toUpperCase() ?? '',
		vowelCount: [...factLetters].filter((c: string) => 'aeiou'.includes(c)).length,
		repeatText: factRepeatCount === 0 ? 'None' : String(factRepeatCount)
	};

	setHeaders({
		'X-Puzzle-Date': todayKey
	});

	return {
		todayKey,
		formattedDate,
		todayEntry,
		previousEntry,
		last30Entries,
		updatedStamp,
		aiHints,
		hintFaqs,
		yesterday,
		factData,
		stats: {
			totalSolutions: solutions.length,
			totalArchived: archive.length,
			latestStoredDate: latestStoredEntry?.date ?? null
		},
		meta: {
			title: pageTitle,
			description: `Get the Worgle answer for ${formattedDate}, the live puzzle number, the letter hints, the full word list, and the recent answers archive, all on one page.`,
			keywords: `worgle answer today, worgle archive, worgle answer ${todayKey}`
		}
	};
};
