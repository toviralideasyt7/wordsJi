import type { PageServerLoad } from './$types';
import {
	getNerdleAllModeAnswerForDate,
	type NerdleAllModeAnswerData,
	type NerdleAnswerFetchOptions
} from '$lib/nerdle-answers';
import { getNerdleDateKeyFromPuzzleNumber, getNerdlePuzzleNumber } from '$lib/nerdle';

export const prerender = true;

const RECENT_ENTRIES = 30;

interface RecentArchiveEntry {
	date: string;
	puzzleNumber: number | null;
	classicAnswer: string | null;
	modeCount: number;
}

function buildDateKeyList(todayKey: string, count: number): string[] {
	const result: string[] = [];
	const todayPuzzle = getNerdlePuzzleNumber(todayKey);
	if (!Number.isFinite(todayPuzzle) || todayPuzzle < 1) {
		return result;
	}
	for (let offset = 0; offset < count; offset += 1) {
		const puzzleNumber = todayPuzzle - offset;
		if (!Number.isFinite(puzzleNumber) || puzzleNumber < 1) {
			break;
		}
		result.push(getNerdleDateKeyFromPuzzleNumber(puzzleNumber));
	}
	return result;
}

export const load: PageServerLoad = async ({ setHeaders, fetch, platform }) => {
	const fetchOptions: NerdleAnswerFetchOptions = {
		fetchImpl: fetch,
		platform
	};

	const todayKey = new Date().toISOString().slice(0, 10);
	const baseTodayPuzzleNumber = getNerdlePuzzleNumber(todayKey);
	const dateKeys = buildDateKeyList(todayKey, RECENT_ENTRIES);

	const recent: RecentArchiveEntry[] = [];
	const fetchErrors: string[] = [];

	for (const dateKey of dateKeys) {
		try {
			const data: NerdleAllModeAnswerData | null = await getNerdleAllModeAnswerForDate(
				dateKey,
				fetchOptions
			);
			const classicMode = data?.modes?.find((mode) => mode.id === 'classic');
			const classicAnswer = classicMode?.answers?.map((entry) => entry.answer).join(', ') ?? null;
			recent.push({
				date: dateKey,
				puzzleNumber: Number.isFinite(data?.classicPuzzleNumber)
					? (data?.classicPuzzleNumber ?? null)
					: null,
				classicAnswer,
				modeCount: data?.modes?.length ?? 0
			});
		} catch (error) {
			fetchErrors.push(`${dateKey}: ${error instanceof Error ? error.message : 'unknown error'}`);
			recent.push({
				date: dateKey,
				puzzleNumber: getNerdlePuzzleNumber(dateKey),
				classicAnswer: null,
				modeCount: 0
			});
		}
	}

	setHeaders({
		'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	return {
		recent,
		totalEntries: recent.length,
		todayPuzzleNumber: Number.isFinite(baseTodayPuzzleNumber) ? baseTodayPuzzleNumber : null,
		fetchErrors,
		fetchError:
			fetchErrors.length > 0 ? 'Some recent entries could not be loaded at build time.' : null
	};
};