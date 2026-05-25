import {
	COLORS,
	WEIGHTS,
	hexToRgb,
	mixColors,
	rgbToHex,
	type ColorfleColorInfo,
	type RGB
} from '$lib/colorfle';

const DEFAULT_COLOR_ANSWERS_API_BASE = 'https://color-answers-worker.colordle.workers.dev';
type ColorAnswersEnv = {
	PUBLIC_COLOR_ANSWERS_API_BASE?: string;
	COLOR_ANSWERS_API_BASE?: string;
};

const colorAnswersEnv: ColorAnswersEnv =
	(typeof import.meta !== 'undefined' &&
		((import.meta as ImportMeta & { env?: ColorAnswersEnv }).env ?? {})) ||
	{};

export const COLOR_ANSWERS_API_BASE = (
	colorAnswersEnv.PUBLIC_COLOR_ANSWERS_API_BASE ??
	colorAnswersEnv.COLOR_ANSWERS_API_BASE ??
	DEFAULT_COLOR_ANSWERS_API_BASE
).replace(/\/+$/, '');

interface RawColordleAnswer {
	date: string;
	day_number: number;
	color_name: string;
	color_hex: string;
	created_at?: string | null;
}

interface RawColorfleAnswer {
	date: string;
	day_number: number;
	normal_answer: string;
	hard_answer: string;
	normal_names?: string | null;
	hard_names?: string | null;
	created_at?: string | null;
}

export interface ApiColordleAnswer {
	date: string;
	dayNumber: number;
	formattedDate: string;
	color: {
		name: string;
		hex: string;
	};
	createdAt: string | null;
}

export interface ApiColorfleModeAnswer {
	mode: 0 | 1;
	label: 'Normal' | 'Hard';
	colors: ColorfleColorInfo[];
	targetColor: {
		rgb: RGB;
		hex: string;
	};
}

export interface ApiColorfleAnswer {
	date: string;
	puzzleNumber: number;
	formattedDate: string;
	normal: ApiColorfleModeAnswer;
	hard: ApiColorfleModeAnswer;
	createdAt: string | null;
}

function formatAnswerDate(dateKey: string): string {
	return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

function assertDateKey(dateKey: string): void {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
		throw new Error(`Invalid date key: ${dateKey}`);
	}
}

function parseStringArray(raw: string | null | undefined): string[] {
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
	} catch {
		return [];
	}
}

function buildWeightedRgbTarget(hexes: string[], weights: number[]): { rgb: RGB; hex: string } {
	let r = 0;
	let g = 0;
	let b = 0;

	for (let index = 0; index < hexes.length; index += 1) {
		const rgb = hexToRgb(hexes[index]);
		if (!rgb) {
			continue;
		}

		r += rgb.r * weights[index];
		g += rgb.g * weights[index];
		b += rgb.b * weights[index];
	}

	const target = {
		r: Math.round(r),
		g: Math.round(g),
		b: Math.round(b)
	};

	return {
		rgb: target,
		hex: rgbToHex(target)
	};
}

function buildColorfleModeAnswer(
	mode: 0 | 1,
	hexes: string[],
	names: string[]
): ApiColorfleModeAnswer {
	const weights = WEIGHTS[mode];
	const colors = hexes.map((hex, index) => ({
		index: COLORS.findIndex((candidate) => candidate.toLowerCase() === hex.toLowerCase()),
		name: names[index] ?? hex,
		hex,
		weight: weights[index]
	}));

	const indices = colors.map((color) => color.index);
	const hasCanonicalIndices = indices.every((index) => index >= 0);
	const fallbackTarget = hasCanonicalIndices ? null : buildWeightedRgbTarget(hexes, weights);
	const targetRgb = hasCanonicalIndices
		? mixColors(indices, mode)
		: fallbackTarget!.rgb;
	const targetHex = hasCanonicalIndices
		? rgbToHex(targetRgb)
		: fallbackTarget!.hex;

	return {
		mode,
		label: mode === 0 ? 'Normal' : 'Hard',
		colors,
		targetColor: {
			rgb: targetRgb,
			hex: targetHex
		}
	};
}

function mapColordleAnswer(raw: RawColordleAnswer): ApiColordleAnswer {
	return {
		date: raw.date,
		dayNumber: raw.day_number,
		formattedDate: formatAnswerDate(raw.date),
		color: {
			name: raw.color_name,
			hex: raw.color_hex
		},
		createdAt: raw.created_at ?? null
	};
}

function mapColorfleAnswer(raw: RawColorfleAnswer): ApiColorfleAnswer {
	const normalHexes = parseStringArray(raw.normal_answer);
	const hardHexes = parseStringArray(raw.hard_answer);
	const normalNames = parseStringArray(raw.normal_names);
	const hardNames = parseStringArray(raw.hard_names);

	return {
		date: raw.date,
		puzzleNumber: raw.day_number,
		formattedDate: formatAnswerDate(raw.date),
		normal: buildColorfleModeAnswer(0, normalHexes, normalNames),
		hard: buildColorfleModeAnswer(1, hardHexes, hardNames),
		createdAt: raw.created_at ?? null
	};
}

async function fetchApiJson<T>(fetchImpl: typeof fetch, path: string): Promise<T> {
	const response = await fetchImpl(`${COLOR_ANSWERS_API_BASE}${path}`, {
		headers: {
			Accept: 'application/json',
			'Cache-Control': 'no-cache'
		}
	});

	if (!response.ok) {
		const body = await response.text().catch(() => '');
		throw new Error(
			`Color answers API request failed (${response.status}) for ${path}${body ? `: ${body}` : ''}`
		);
	}

	return response.json() as Promise<T>;
}

export async function getColordleTodayFromApi(fetchImpl: typeof fetch): Promise<ApiColordleAnswer> {
	const raw = await fetchApiJson<RawColordleAnswer>(fetchImpl, '/api/colordle/today');
	return mapColordleAnswer(raw);
}

export async function getColordleDateFromApi(
	fetchImpl: typeof fetch,
	dateKey: string
): Promise<ApiColordleAnswer> {
	assertDateKey(dateKey);
	const raw = await fetchApiJson<RawColordleAnswer>(fetchImpl, `/api/colordle/date/${dateKey}`);
	return mapColordleAnswer(raw);
}

export async function getColordleRangeFromApi(
	fetchImpl: typeof fetch,
	fromDateKey: string,
	toDateKey: string
): Promise<ApiColordleAnswer[]> {
	assertDateKey(fromDateKey);
	assertDateKey(toDateKey);
	const raw = await fetchApiJson<RawColordleAnswer[]>(
		fetchImpl,
		`/api/colordle/range?from=${fromDateKey}&to=${toDateKey}`
	);
	return raw.map(mapColordleAnswer);
}

export async function getColorfleTodayFromApi(fetchImpl: typeof fetch): Promise<ApiColorfleAnswer> {
	const raw = await fetchApiJson<RawColorfleAnswer>(fetchImpl, '/api/colorfle/today');
	return mapColorfleAnswer(raw);
}

export async function getColorfleDateFromApi(
	fetchImpl: typeof fetch,
	dateKey: string
): Promise<ApiColorfleAnswer> {
	assertDateKey(dateKey);
	const raw = await fetchApiJson<RawColorfleAnswer>(fetchImpl, `/api/colorfle/date/${dateKey}`);
	return mapColorfleAnswer(raw);
}

export async function getColorfleRangeFromApi(
	fetchImpl: typeof fetch,
	fromDateKey: string,
	toDateKey: string
): Promise<ApiColorfleAnswer[]> {
	assertDateKey(fromDateKey);
	assertDateKey(toDateKey);
	const raw = await fetchApiJson<RawColorfleAnswer[]>(
		fetchImpl,
		`/api/colorfle/range?from=${fromDateKey}&to=${toDateKey}`
	);
	return raw.map(mapColorfleAnswer);
}

export function buildContinuousDateKeys(startDateKey: string, endDateKey: string): string[] {
	assertDateKey(startDateKey);
	assertDateKey(endDateKey);

	const keys: string[] = [];
	const current = new Date(`${startDateKey}T12:00:00Z`);
	const end = new Date(`${endDateKey}T12:00:00Z`);

	while (current <= end) {
		keys.push(current.toISOString().slice(0, 10));
		current.setUTCDate(current.getUTCDate() + 1);
	}

	return keys;
}
