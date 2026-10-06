// Shared answer resolvers for per-date permanent archive pages
// ({game}-answer-for-{month}-{day}-{year}). Server-side only: every route that
// imports this is prerendered, so the bundled datasets below only run at build.
//
// Resolution math is ported 1:1 from scripts/generate-ai-hints.mjs (the verified
// hint-generation registry). A resolver returns null when the date has no answer
// (pre-launch, or a missed day like Batter Up's archive gaps) — the route then
// 404s, which is the correct behavior for those dates.

import { SECRET_WORDS } from '$lib/data/semantle-words';
import { SEARCHLE_PUZZLES } from '$lib/searchle/searchleData';
import { BETWEENLE_DAILY_WORDS } from '$lib/betweenle/data';
import { PHRASES } from '$lib/phrazle/phrases';
import { getDailyWorldleAnswer } from '$lib/worldle/logic';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { toArchiveDateKey, toMonthDayYearKey } from '$lib/archive-page';
import countriesData from '$lib/data/worldle/countries.json';
import citiesData from '$lib/data/worldle/cities.json';
import countryDetailsData from '$lib/data/worldle/country-details.json';
import canuckleRaw from '$lib/wordlebot-wasm/assets/generated/canuckle-data.json';
import batterupRaw from '$lib/data/batterup-answers.json';
import marveldleRaw from '$lib/data/marveldle-answers.json';
import spotleRaw from '../../static/spotle_data.json';
import worgleSolutionsRaw from '../../static/worgle_solutions.json';
import worgleArchiveRaw from '../../static/worgle_archive.json';
import type { BatterUpDayEntry } from '$lib/batterup/solver';
import type { WorldleCity, WorldleCountry, WorldleCountryDetailsMap } from '$lib/worldle/types';

export interface DatedAnswer {
	text: string;
	numberText: string;
}

export interface DatedGame {
	key: string;
	label: string;
	/** First puzzle date, YYYY-MM-DD. Dated pages before this 404. */
	launchDate: string;
	/** Resolved answer for an ISO dateKey, or null when the date has no answer. */
	answerForDate(dateKey: string): DatedAnswer | null;
}

/** Whole-day difference between two YYYY-MM-DD keys, computed on UTC midnights. */
function daysSince(dateKey: string, epochY: number, epochM: number, epochD: number): number {
	const [y, m, d] = dateKey.split('-').map(Number);
	const t = Date.UTC(y, m - 1, d);
	return Math.round((t - Date.UTC(epochY, epochM - 1, epochD)) / 86_400_000);
}

interface CanucklePuzzle {
	index: number;
	answer: string;
	date: string;
}

interface SpotleEntry {
	date: string;
	dayNumber: number;
	artist: string;
}

interface MarveldleEntry {
	date: string;
	dateId?: string;
	comics?: { name?: string } | null;
	mcu?: { name?: string } | null;
}

interface WorgleArchiveEntry {
	date: string;
	word: string;
	puzzle: number;
}

const canucklePuzzles = (canuckleRaw as { puzzles: CanucklePuzzle[] }).puzzles;
const spotleAnswers = (spotleRaw as { answers: SpotleEntry[] }).answers;
const batterupAnswers = batterupRaw as Record<string, BatterUpDayEntry>;
const marveldleAnswers = marveldleRaw as Record<string, MarveldleEntry>;
const worgleSolutions = worgleSolutionsRaw as string[];
const worgleArchive = worgleArchiveRaw as WorgleArchiveEntry[];
const worldleCountries = countriesData as WorldleCountry[];
const worldleCities = citiesData as WorldleCity[];
const worldleDetails = countryDetailsData as WorldleCountryDetailsMap;

const semantle: DatedGame = {
	key: 'semantle',
	label: 'Semantle',
	launchDate: '2022-01-29',
	answerForDate(dateKey) {
		const n = daysSince(dateKey, 2022, 1, 29);
		if (n < 0 || n >= SECRET_WORDS.length) return null;
		return { text: SECRET_WORDS[n], numberText: `#${n}` };
	}
};

const searchle: DatedGame = {
	key: 'searchle',
	label: 'Searchle',
	launchDate: '2023-06-22',
	answerForDate(dateKey) {
		const diff = daysSince(dateKey, 2023, 6, 22);
		if (diff < 0) return null;
		const index = diff % SEARCHLE_PUZZLES.length;
		const puzzle = SEARCHLE_PUZZLES[index];
		if (!puzzle || !puzzle.answer) return null;
		return { text: puzzle.answer, numberText: `#${index + 1}` };
	}
};

const betweenle: DatedGame = {
	key: 'betweenle',
	label: 'Betweenle',
	launchDate: '2023-03-17',
	answerForDate(dateKey) {
		const n = daysSince(dateKey, 2023, 3, 17) + 1;
		if (n < 1) return null;
		const word = BETWEENLE_DAILY_WORDS[(n - 1) % BETWEENLE_DAILY_WORDS.length];
		if (!word) return null;
		return { text: word, numberText: `#${n}` };
	}
};

const phrazle: DatedGame = {
	key: 'phrazle',
	label: 'Phrazle',
	launchDate: '2022-04-18',
	answerForDate(dateKey) {
		const d = Math.ceil(daysSince(dateKey, 2022, 4, 18));
		if (d < 0) return null;
		const pick = (gameNumber: number) =>
			PHRASES[((gameNumber % PHRASES.length) + PHRASES.length) % PHRASES.length];
		const morning = pick(2 * d + 1);
		const afternoon = pick(2 * d + 2);
		if (!morning || !afternoon) return null;
		return { text: `${morning} / ${afternoon}`, numberText: dateKey };
	}
};

const worgle: DatedGame = {
	key: 'worgle',
	label: 'Worgle',
	launchDate: '2021-06-19',
	answerForDate(dateKey) {
		// Worgle's dateKey is the IST calendar date.
		const [y, m, d] = dateKey.split('-').map(Number);
		const targetUtcMs = Date.UTC(y, m - 1, d);
		const dayOffset = Math.round((targetUtcMs - Date.UTC(2021, 5, 19)) / 86_400_000);
		if (dayOffset < 207) return null;
		const index = (((dayOffset - 207) % worgleSolutions.length) + worgleSolutions.length) % worgleSolutions.length;
		const archived = worgleArchive.find((e) => e.date === dateKey);
		const word = archived?.word ?? worgleSolutions[index];
		if (!word) return null;
		const puzzleNum = archived?.puzzle ?? dayOffset - 207;
		return { text: word, numberText: `#${puzzleNum}` };
	}
};

const worldle: DatedGame = {
	key: 'worldle',
	label: 'Worldle',
	launchDate: '2022-01-21',
	answerForDate(dateKey) {
		if (dateKey < '2022-01-21') return null;
		const ans = getDailyWorldleAnswer(worldleCountries, worldleCities, worldleDetails, dateKey);
		if (!ans || !ans.country || !ans.country.name) return null;
		return { text: ans.country.name, numberText: `#${ans.worldleNumber}` };
	}
};

const canuckle: DatedGame = {
	key: 'canuckle',
	label: 'Canuckle',
	launchDate: '2022-02-10',
	answerForDate(dateKey) {
		const puzzle = canucklePuzzles.find((p) => p.date === dateKey);
		if (!puzzle || !puzzle.answer) return null;
		return { text: puzzle.answer, numberText: `#${puzzle.index}` };
	}
};

const spotle: DatedGame = {
	key: 'spotle',
	label: 'Spotle',
	launchDate: '2022-03-19',
	answerForDate(dateKey) {
		const entry = spotleAnswers.find((e) => e.date === dateKey);
		if (!entry || !entry.artist) return null;
		return { text: entry.artist, numberText: `Day ${entry.dayNumber}` };
	}
};

const batterup: DatedGame = {
	key: 'batterup',
	label: 'Batter Up',
	launchDate: '2026-09-25',
	answerForDate(dateKey) {
		const entry = batterupAnswers[dateKey];
		const name = entry?.player?.player_name;
		if (!entry || !name) return null;
		return { text: name, numberText: `Game #${entry.gameNumber}` };
	}
};

const marveldle: DatedGame = {
	key: 'marveldle',
	label: 'Marveldle',
	launchDate: '2026-09-24',
	answerForDate(dateKey) {
		const entry = marveldleAnswers[dateKey];
		const comics = entry?.comics?.name;
		const mcu = entry?.mcu?.name;
		if (!entry || !comics || !mcu) return null;
		return { text: `${comics} / ${mcu}`, numberText: entry.dateId || entry.date };
	}
};

export const DATED_GAMES: DatedGame[] = [
	semantle,
	searchle,
	betweenle,
	phrazle,
	worgle,
	worldle,
	canuckle,
	spotle,
	batterup,
	marveldle
];

export function getDatedGame(key: string): DatedGame | undefined {
	return DATED_GAMES.find((g) => g.key === key);
}

// ---------------------------------------------------------------------------
// Prerender window: rolling 120 days ending YESTERDAY (today always lives on
// {game}-answer-today). Dates without a resolvable answer are dropped so the
// build never prerenders a URL that would 404.
// ---------------------------------------------------------------------------

export const DATED_WINDOW_DAYS = 120;

export interface DatedRouteEntry {
	/** URL slug, e.g. "october-5-2026". */
	date: string;
	/** ISO dateKey, e.g. "2026-10-05". */
	dateKey: string;
}

export function datedWindowEntries(gameKey: string, now: Date = new Date()): DatedRouteEntry[] {
	const game = getDatedGame(gameKey);
	if (!game) return [];

	const todayPuzzle = getPuzzleDateForGame(gameKey as Parameters<typeof getPuzzleDateForGame>[0]);
	const end = new Date(todayPuzzle);
	end.setUTCDate(end.getUTCDate() - 1); // yesterday

	const start = new Date(end);
	start.setUTCDate(start.getUTCDate() - (DATED_WINDOW_DAYS - 1));
	if (toArchiveDateKey(start) < game.launchDate) {
		const [y, m, d] = game.launchDate.split('-').map(Number);
		start.setTime(Date.UTC(y, m - 1, d));
	}

	const entries: DatedRouteEntry[] = [];
	const cursor = new Date(start);
	while (cursor <= end) {
		const dateKey = toArchiveDateKey(cursor);
		if (game.answerForDate(dateKey)) {
			entries.push({ date: toMonthDayYearKey(cursor), dateKey });
		}
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return entries;
}
