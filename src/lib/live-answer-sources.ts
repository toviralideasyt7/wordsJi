import CryptoJS from 'crypto-js';
import { getCountryById } from '$lib/countryle';
import type { CountryleTodayPayload } from '$lib/countryle-data';
import {
	GAME_TYPES,
	getPuzzleNumber,
	type FramedEntry,
	type FramedGameConfig,
	type FramedGameType
} from '$lib/framed';
import type { SpotleAnswer } from '$lib/spotle';

const CANUCKLE_FIRESTORE_URL =
	'https://firestore.googleapis.com/v1/projects/canuckle-c2157/databases/(default)/documents/canuckleGameData';
const CANUCKLE_ORIGINAL_START_DATE = '2022-02-10';
const CANUCKLE_CURRENT_START_DATE = '2022-10-04';
const CANUCKLE_RESTART_PUZZLE_INDEX = 143;
const CANUCKLE_RECENT_PAGE_SIZE = 200;

const COUNTRYLE_AES_KEY = '4%w!KpB+?FC<P9W*';
const COUNTRYLE_SOURCE_URL = 'https://www.countryle.com/hidden-api/get-daily-country-valid.php';
const COUNTRYLE_START_DATE = new Date(Date.UTC(2022, 10, 15));

const FRAMED_SOURCE_URL = 'https://titles.framed.wtf/v1/titles/top-ten';
const SPOTLE_SOURCE_URL = 'https://spotle.io/__data.json';

export interface LiveCanucklePuzzle {
	index: number;
	answer: string;
	date: string;
	fact: string[];
}

export interface LiveFramedEntry extends FramedEntry {
	game: FramedGameConfig;
}

function decodeBase64(value: string): string {
	return Buffer.from(value, 'base64').toString('utf-8');
}

function extractString(field: { stringValue?: string } | undefined): string {
	return field?.stringValue ?? '';
}

function extractInteger(field: { integerValue?: string } | undefined): number {
	return Number.parseInt(field?.integerValue ?? '0', 10);
}

function extractArray(field: { arrayValue?: { values?: Array<{ stringValue?: string }> } } | undefined): string[] {
	return (field?.arrayValue?.values ?? [])
		.map((entry) => entry.stringValue ?? '')
		.filter((entry) => entry.length > 0);
}

function getCanucklePuzzleDate(index: number): string {
	const startDate = new Date(
		`${index >= CANUCKLE_RESTART_PUZZLE_INDEX ? CANUCKLE_CURRENT_START_DATE : CANUCKLE_ORIGINAL_START_DATE}T12:00:00Z`
	);
	const dayOffset =
		index >= CANUCKLE_RESTART_PUZZLE_INDEX ? index - CANUCKLE_RESTART_PUZZLE_INDEX : index - 1;
	startDate.setUTCDate(startDate.getUTCDate() + dayOffset);
	return startDate.toISOString().slice(0, 10);
}

function parseCanucklePuzzleDocument(doc: {
	fields?: Record<string, unknown>;
}): LiveCanucklePuzzle | null {
	const fields = (doc.fields ?? {}) as Record<string, { stringValue?: string; integerValue?: string; arrayValue?: { values?: Array<{ stringValue?: string }> } }>;
	const index = extractInteger(fields.index);

	if (!index) {
		return null;
	}

	return {
		index,
		answer: decodeBase64(extractString(fields.answer)),
		date: getCanucklePuzzleDate(index),
		fact: extractArray(fields.fact)
	};
}

export async function fetchRecentCanucklePuzzles(): Promise<LiveCanucklePuzzle[]> {
	const response = await fetch(
		`${CANUCKLE_FIRESTORE_URL}?pageSize=${CANUCKLE_RECENT_PAGE_SIZE}&orderBy=index%20desc`,
		{
			headers: {
				accept: 'application/json',
				'user-agent': 'WordSolverX Daily Live Fetch'
			},
			signal: AbortSignal.timeout(15000)
		}
	);

	if (!response.ok) {
		throw new Error(`Canuckle source responded with ${response.status}`);
	}

	const payload = (await response.json()) as {
		documents?: Array<{ fields?: Record<string, unknown> }>;
	};

	return (payload.documents ?? [])
		.map((doc) => parseCanucklePuzzleDocument(doc))
		.filter((entry): entry is LiveCanucklePuzzle => entry !== null)
		.sort((left, right) => left.index - right.index);
}

export async function fetchLiveCanucklePuzzle(dateKey: string): Promise<LiveCanucklePuzzle | null> {
	const recentPuzzles = await fetchRecentCanucklePuzzles();

	for (let index = recentPuzzles.length - 1; index >= 0; index -= 1) {
		const puzzle = recentPuzzles[index];
		if (puzzle.date <= dateKey) {
			return puzzle;
		}
	}

	return null;
}

function formatCountryleApiDate(dateKey: string): string {
	const [year, month, day] = dateKey.split('-');
	return `${day}/${month}/${year}`;
}

function getCountryleGameNumber(dateKey: string): number {
	const targetDate = new Date(`${dateKey}T12:00:00Z`);
	const diffMs =
		Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()) -
		COUNTRYLE_START_DATE.getTime();
	return Math.floor(diffMs / 86400000) + 1;
}

function decryptCountryleCountryId(encryptedId: string): number {
	try {
		const bytes = CryptoJS.AES.decrypt(encryptedId, COUNTRYLE_AES_KEY);
		return Number.parseInt(bytes.toString(CryptoJS.enc.Utf8), 10);
	} catch {
		return Number.NaN;
	}
}

export async function fetchLiveCountryleToday(dateKey: string): Promise<CountryleTodayPayload | null> {
	const response = await fetch(`${COUNTRYLE_SOURCE_URL}?date=${formatCountryleApiDate(dateKey)}`, {
		headers: {
			accept: 'application/json',
			'user-agent': 'WordSolverX Daily Live Fetch'
		},
		signal: AbortSignal.timeout(15000)
	});

	if (!response.ok) {
		throw new Error(`Countryle source responded with ${response.status}`);
	}

	const payload = (await response.json()) as {
		country?: string | number;
		id?: string | number;
	};
	const rawCountryId = payload.country ?? payload.id ?? payload;
	const countryId =
		typeof rawCountryId === 'string'
			? decryptCountryleCountryId(rawCountryId)
			: Number.parseInt(String(rawCountryId), 10);
	const country = getCountryById(countryId);

	if (!country) {
		return null;
	}

	return {
		date: dateKey,
		gameNumber: getCountryleGameNumber(dateKey),
		updated: new Date().toISOString(),
		country
	};
}

async function fetchFramedAnswer(gameType: FramedGameType, puzzleNumber: number): Promise<string | null> {
	const response = await fetch(`${FRAMED_SOURCE_URL}/${puzzleNumber}?gameType=${gameType}`, {
		headers: {
			accept: 'application/json',
			'user-agent': 'WordSolverX Daily Live Fetch'
		},
		signal: AbortSignal.timeout(15000)
	});

	if (!response.ok) {
		return null;
	}

	const payload = (await response.json()) as {
		frames?: Array<{ items?: unknown }>;
	};
	const lastFrame = payload.frames?.[payload.frames.length - 1];
	const rawItems = lastFrame?.items;
	const items =
		typeof rawItems === 'string'
			? (JSON.parse(rawItems) as Array<{ title?: string }>)
			: Array.isArray(rawItems)
				? (rawItems as Array<{ title?: string }>)
				: rawItems && typeof rawItems === 'object'
					? (rawItems as Array<{ title?: string }>)
					: [];

	return items?.[0]?.title ?? null;
}

export async function fetchLiveFramedEntries(dateKey: string): Promise<LiveFramedEntry[]> {
	const targetDate = new Date(`${dateKey}T12:00:00Z`);
	const entries = await Promise.all(
		GAME_TYPES.map(async (game) => {
			const puzzleNumber = getPuzzleNumber(game.key, targetDate);
			const answer = await fetchFramedAnswer(game.key, puzzleNumber);
			if (!answer) {
				return null;
			}

			return {
				date: dateKey,
				puzzleNumber,
				answer,
				game
			} satisfies LiveFramedEntry;
		})
	);

	return entries.filter((entry): entry is LiveFramedEntry => entry !== null);
}

function toSpotleIsoDate(dateString: string): string {
	const [month, day, year] = dateString.split('/');
	return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function resolveSpotleRefs(flat: unknown[], value: unknown): unknown {
	if (
		typeof value === 'number' &&
		Number.isInteger(value) &&
		value >= 0 &&
		value < flat.length
	) {
		const resolved = flat[value];
		return resolved === undefined ? value : resolveSpotleRefs(flat, resolved);
	}

	if (Array.isArray(value)) {
		return value.map((entry) => resolveSpotleRefs(flat, entry));
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, entry]) => [key, resolveSpotleRefs(flat, entry)])
		);
	}

	return value;
}

function parseSpotleSourceEntry(raw: Record<string, unknown>): Omit<SpotleAnswer, 'dayNumber'> {
	const soundcloud =
		raw.soundcloud && typeof raw.soundcloud === 'object'
			? (raw.soundcloud as Record<string, unknown>)
			: {};

	return {
		date: toSpotleIsoDate(String(raw.date ?? '')),
		artist: String(raw.artist ?? ''),
		track: typeof soundcloud.track === 'string' ? soundcloud.track : '',
		image: typeof raw.image_uri === 'string' ? raw.image_uri : '',
		soundcloudUrl: typeof soundcloud.url === 'string' ? soundcloud.url : ''
	};
}

export async function fetchLiveSpotleAnswers(): Promise<SpotleAnswer[]> {
	const response = await fetch(SPOTLE_SOURCE_URL, {
		headers: {
			accept: 'application/json',
			'user-agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
		},
		signal: AbortSignal.timeout(15000)
	});

	if (!response.ok) {
		throw new Error(`Spotle source responded with ${response.status}`);
	}

	const payload = (await response.json()) as {
		nodes?: Array<{ data?: unknown[] }>;
	};
	const flat = Array.isArray(payload.nodes?.[1]?.data) ? payload.nodes?.[1]?.data : null;

	if (!flat?.length) {
		return [];
	}

	const descriptor = resolveSpotleRefs(flat, flat[0]) as {
		spotleNumber?: number;
		yesterdaysEntry?: Record<string, unknown>;
		rewindEntries?: Array<Record<string, unknown>>;
		todaysEntry?: Record<string, unknown>;
	};
	const spotleNumber = Number(descriptor.spotleNumber ?? 0);
	const rawEntries = [
		descriptor.yesterdaysEntry,
		...(Array.isArray(descriptor.rewindEntries) ? descriptor.rewindEntries : []),
		descriptor.todaysEntry
	].filter((entry): entry is Record<string, unknown> => Boolean(entry));

	return rawEntries
		.map((entry) => parseSpotleSourceEntry(entry))
		.filter((entry) => entry.date && entry.artist)
		.sort((left, right) => left.date.localeCompare(right.date))
		.map((entry, index, entries) => ({
			...entry,
			dayNumber: spotleNumber - (entries.length - 1 - index)
		}));
}

export async function fetchLiveSpotleToday(dateKey: string): Promise<SpotleAnswer | null> {
	const answers = await fetchLiveSpotleAnswers();
	const exact = answers.find((entry) => entry.date === dateKey);
	if (exact) {
		return exact;
	}

	return [...answers]
		.filter((entry) => entry.date <= dateKey)
		.sort((left, right) => right.date.localeCompare(left.date))[0] ?? null;
}
