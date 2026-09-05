import type { PageServerLoad } from './$types';
import { getCanuckleArchivePageConfig } from '$lib/wordlebot-wasm/route-config';
import canuckleRaw from '$lib/wordlebot-wasm/assets/generated/canuckle-data.json';

interface CanucklePuzzle {
	index: number;
	answer: string;
	date: string;
	fact: string[];
}

interface CanuckleData {
	puzzles: CanucklePuzzle[];
}

const canuckleData = canuckleRaw as CanuckleData;
const sortedPuzzles = [...canuckleData.puzzles].sort((a, b) => a.index - b.index);
const RECENT_COUNT = 30;

function getLastNEntries(puzzles: CanucklePuzzle[], count: number): CanucklePuzzle[] {
	return puzzles.slice(Math.max(0, puzzles.length - count));
}

export const prerender = true;

export const load: PageServerLoad = async ({ setHeaders }) => {
	const lastEntries = getLastNEntries(sortedPuzzles, RECENT_COUNT).reverse();
	const totalPuzzles = sortedPuzzles.length;
	const latestPuzzle = sortedPuzzles[sortedPuzzles.length - 1] ?? null;
	const latestDateKey = latestPuzzle?.date ?? null;
	const latestIndex = latestPuzzle?.index ?? null;

	setHeaders({
		'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	return {
		config: getCanuckleArchivePageConfig(),
		recentEntries: lastEntries.map((puzzle) => ({
			index: puzzle.index,
			date: puzzle.date,
			answer: puzzle.answer
		})),
		totalPuzzles,
		latestDateKey,
		latestIndex,
		recentCount: lastEntries.length
	};
};
