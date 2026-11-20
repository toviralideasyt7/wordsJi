import CryptoJS from 'crypto-js';
import { getPuzzleWindow } from '$lib/puzzle-window';

const DAY_MS = 24 * 60 * 60 * 1000;
export const NERDLE_START_DATE_KEY = '2022-01-20';
const NERDLE_START_DAY_UTC = Date.UTC(2022, 0, 20);
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface NerdleAnswerData {
	date: string;
	puzzleNumber: number;
	answer: string | null;
}

function toPublicPuzzleNumber(puzzleIndex: number): number {
	return puzzleIndex + 1;
}

function toPuzzleIndex(puzzleNumber: number): number {
	return puzzleNumber - 1;
}

function parseDateKeyToUtcDay(dateKey: string): number | null {
	if (!DATE_KEY_PATTERN.test(dateKey)) {
		return null;
	}

	const [yearString, monthString, dayString] = dateKey.split('-');
	const year = Number(yearString);
	const monthIndex = Number(monthString) - 1;
	const day = Number(dayString);
	const utcDay = Date.UTC(year, monthIndex, day);
	const date = new Date(utcDay);

	if (
		Number.isNaN(utcDay) ||
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== monthIndex ||
		date.getUTCDate() !== day
	) {
		return null;
	}

	return utcDay;
}

export function isValidNerdleDateKey(dateKey: string): boolean {
	return parseDateKeyToUtcDay(dateKey) !== null;
}

export function getNerdleTodayDateKey(now: Date = new Date()): string {
	return getPuzzleWindow('nerdle', { now }).effectivePuzzleDate;
}

export function isNerdleDateKeyAfterToday(dateKey: string, now: Date = new Date()): boolean {
	if (!isValidNerdleDateKey(dateKey)) {
		return false;
	}

	return dateKey > getNerdleTodayDateKey(now);
}

export function getNerdlePuzzleNumber(dateKey: string): number {
	const utcDay = parseDateKeyToUtcDay(dateKey);
	if (utcDay === null) {
		return Number.NaN;
	}

	return toPublicPuzzleNumber(Math.floor((utcDay - NERDLE_START_DAY_UTC) / DAY_MS));
}

export function getNerdleDateKeyFromPuzzleNumber(puzzleNumber: number): string {
	const utcDay = NERDLE_START_DAY_UTC + toPuzzleIndex(puzzleNumber) * DAY_MS;
	return new Date(utcDay).toISOString().slice(0, 10);
}

export function getNerdleFilename(puzzleNumber: number): string {
	return CryptoJS.MD5(String(toPuzzleIndex(puzzleNumber))).toString();
}

export function decodeNerdleAnswer(encoded: string): string {
	let result = '';
	for (const char of encoded) {
		const code = char.charCodeAt(0);
		if (code <= 126) {
			let decodedCode = (code - 13) % 126;
			if (decodedCode < 0) {
				decodedCode += 126;
			}
			result += String.fromCharCode(decodedCode);
		} else {
			result += char;
		}
	}

	return result;
}

export async function fetchNerdleAnswerByPuzzleNumber(puzzleNumber: number): Promise<string | null> {
	if (!Number.isInteger(puzzleNumber) || puzzleNumber < 1) {
		return null;
	}

	try {
		const filename = getNerdleFilename(puzzleNumber);
		const response = await fetch(`https://nerdlegame.com/words/${filename}`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 WordAuditor'
			}
		});

		if (!response.ok) {
			return null;
		}

		const encoded = await response.text();
		return decodeNerdleAnswer(encoded.trim());
	} catch (error) {
		console.error('Failed to fetch Nerdle answer:', error);
		return null;
	}
}

export async function getNerdleAnswerForDateKey(dateKey: string): Promise<NerdleAnswerData | null> {
	if (!isValidNerdleDateKey(dateKey)) {
		return null;
	}

	const puzzleNumber = getNerdlePuzzleNumber(dateKey);
	if (!Number.isFinite(puzzleNumber) || puzzleNumber < 1) {
		return null;
	}

	const answer = await fetchNerdleAnswerByPuzzleNumber(puzzleNumber);
	return {
		date: dateKey,
		puzzleNumber,
		answer
	};
}

export async function getNerdleAnswerForToday(now: Date = new Date()): Promise<NerdleAnswerData> {
	const dateKey = getNerdleTodayDateKey(now);
	const puzzleNumber = getNerdlePuzzleNumber(dateKey);
	const answer = await fetchNerdleAnswerByPuzzleNumber(puzzleNumber);

	return {
		date: dateKey,
		puzzleNumber,
		answer
	};
}

export async function getNerdleAnswerRange(days: number, startDateKey?: string): Promise<NerdleAnswerData[]> {
	const totalDays = Math.max(1, Math.min(days, 30));
	const baseDateKey = startDateKey ?? getNerdleTodayDateKey();
	const basePuzzleNumber = getNerdlePuzzleNumber(baseDateKey);

	if (!Number.isFinite(basePuzzleNumber) || basePuzzleNumber < 1) {
		return [];
	}

	const results: NerdleAnswerData[] = [];
	for (let offset = 0; offset < totalDays; offset++) {
		const puzzleNumber = basePuzzleNumber + offset;
		const answer = await fetchNerdleAnswerByPuzzleNumber(puzzleNumber);
		results.push({
			date: getNerdleDateKeyFromPuzzleNumber(puzzleNumber),
			puzzleNumber,
			answer
		});
	}

	return results;
}
