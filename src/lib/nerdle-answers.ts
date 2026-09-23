const DEFAULT_NERDLE_ANSWERS_API_BASE = 'https://nerdle-answers.nerdleapi.workers.dev';
// Override this in deployment env if your workers.dev subdomain is different.
const configuredNerdleAnswersApiBase =
	typeof import.meta.env.PUBLIC_NERDLE_ANSWERS_API_BASE === 'string'
		? import.meta.env.PUBLIC_NERDLE_ANSWERS_API_BASE
		: '';

export const NERDLE_ANSWERS_API_BASE = (
	configuredNerdleAnswersApiBase || DEFAULT_NERDLE_ANSWERS_API_BASE
).replace(/\/+$/, '');
const NERDLE_ANSWERS_CACHE_VERSION = '2';

export type NerdleModeId =
	| 'classic'
	| 'micro'
	| 'mini'
	| 'midi'
	| 'maxi'
	| 'minibi'
	| 'quad'
	| 'speed'
	| 'instant';

export interface NerdleModeAnswer {
	puzzleNumber: number;
	answer: string;
	type: 'equation' | 'hint';
}

export interface NerdleModeData {
	id: NerdleModeId;
	name: string;
	description: string;
	answerLength: number;
	available: boolean;
	puzzleNumbers: number[];
	answers: NerdleModeAnswer[];
}

export interface NerdleAllModeAnswerData {
	date: string;
	classicPuzzleNumber: number;
	modes: NerdleModeData[];
	generatedAt?: string;
	storedAt?: string | null;
}

export interface NerdleAnswerFetchOptions {
	platform?: unknown;
	fetchImpl?: typeof fetch;
}

interface NerdleWorkerResponse {
	success?: boolean;
	data?: NerdleAllModeAnswerData;
	error?: string;
}

interface NerdleAnswersServiceBinding {
	fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

function isValidNerdleAllModeData(data: unknown): data is NerdleAllModeAnswerData {
	if (!data || typeof data !== 'object') {
		return false;
	}

	const record = data as Partial<NerdleAllModeAnswerData>;
	return (
		typeof record.date === 'string' &&
		typeof record.classicPuzzleNumber === 'number' &&
		Array.isArray(record.modes)
	);
}

function getNerdleAnswersServiceBinding(platform: unknown): NerdleAnswersServiceBinding | null {
	if (!platform || typeof platform !== 'object') {
		return null;
	}

	const env = (platform as { env?: Record<string, unknown> }).env;
	const binding = env?.NERDLE_ANSWERS;

	if (!binding || typeof binding !== 'object') {
		return null;
	}

	const fetchMethod = (binding as { fetch?: unknown }).fetch;
	if (typeof fetchMethod !== 'function') {
		return null;
	}

	return binding as NerdleAnswersServiceBinding;
}

async function fetchNerdleWorker(
	path: string,
	options: NerdleAnswerFetchOptions = {}
): Promise<NerdleAllModeAnswerData | null> {
	const requestFetch = options.fetchImpl ?? fetch;
	const serviceBinding = getNerdleAnswersServiceBinding(options.platform);
	const pathWithVersion =
		path.includes('?')
			? `${path}&v=${NERDLE_ANSWERS_CACHE_VERSION}`
			: `${path}?v=${NERDLE_ANSWERS_CACHE_VERSION}`;
	const attempts: Array<() => Promise<Response>> = [];

	if (serviceBinding) {
		attempts.push(() => serviceBinding.fetch(`https://nerdle-answers.internal${pathWithVersion}`));
	}
	attempts.push(() => requestFetch(`${NERDLE_ANSWERS_API_BASE}${pathWithVersion}`));

	for (const attempt of attempts) {
		try {
			const response = await attempt();
			if (!response.ok) {
				continue;
			}

			const payload = (await response.json()) as NerdleWorkerResponse;
			if (payload?.success && isValidNerdleAllModeData(payload.data)) {
				return payload.data;
			}
		} catch {
			// Try the next fetch path.
		}
	}

	return null;
}

export async function getNerdleAllModeAnswerForToday(
	options: NerdleAnswerFetchOptions = {}
): Promise<NerdleAllModeAnswerData | null> {
	return fetchNerdleWorker('/today', options);
}

export async function getNerdleAllModeAnswerForDate(
	dateKey: string,
	options: NerdleAnswerFetchOptions = {}
): Promise<NerdleAllModeAnswerData | null> {
	return fetchNerdleWorker(`/${dateKey}`, options);
}
