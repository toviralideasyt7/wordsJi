// src/lib/marveldle/api.ts
// Typed client for the upstream Marveldle API (https://api.marveldle.com/api).
// Ported from sujitbhai7710/marveldle-answers src/lib/marveldle.ts
// (read-only pull). Used by the answer-fetch tooling and by any future
// live-solve UI; the daily scheduled job currently runs the same calls from
// scripts/marveldle-solve.mjs (plain Node) instead.

import type { CharacterData, MarveldleMode } from './types';
import { UPSTREAM_MODE } from './types';

export const MARVELDLE_API = 'https://api.marveldle.com/api';

const HEADERS: Record<string, string> = {
	Origin: 'https://marveldle.com',
	Referer: 'https://marveldle.com/',
	userLanguage: 'en'
};

function createSessionId(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function call<T>(path: string, sessionId: string, timeoutMs = 30000): Promise<T> {
	const res = await fetch(`${MARVELDLE_API}${path}`, {
		headers: { ...HEADERS, sessionId },
		signal: AbortSignal.timeout(timeoutMs)
	});
	if (!res.ok) throw new Error(`Marveldle API ${res.status} on ${path}`);
	return (await res.json()) as T;
}

/** Open a server session; returns the server-issued id (or our fallback uuid). */
export async function getSession(): Promise<{ id: string } & Record<string, unknown>> {
	const sid = createSessionId();
	const data = await call<Record<string, unknown>>('/session', sid);
	return { id: (data.id as string) || sid, ...data };
}

/** Current daily pick-id, e.g. "9/25/2026 12:00:00 AM" — US-midnight release. */
export async function getLastPickId(sessionId: string): Promise<string> {
	const res = await fetch(`${MARVELDLE_API}/config/pick-id`, {
		headers: { ...HEADERS, sessionId },
		signal: AbortSignal.timeout(30000)
	});
	if (!res.ok) throw new Error(`Marveldle API ${res.status} on /config/pick-id`);
	return (await res.text()).trim();
}

export async function getPickDates(sessionId: string): Promise<string[]> {
	return call<string[]>('/config/pick-dates', sessionId);
}

export interface UpstreamGuessFeedback {
	id: string;
	gender: string;
	type: string;
	species: string;
	powerTypes: string;
	origin: string;
	apparitionYear: string;
	isExact: boolean;
	appearanceTypes?: string;
	affiliations?: string;
	appearances?: string;
	actorName?: string;
}

/** Submit a guess for a pick-id and get the attribute feedback grid. */
export async function guessCharacter(
	mode: MarveldleMode,
	characterId: string,
	dateId: string,
	sessionId: string
): Promise<UpstreamGuessFeedback> {
	const url = `/characters/${UPSTREAM_MODE[mode]}/guess/${characterId}?dateId=${encodeURIComponent(dateId)}`;
	return call<UpstreamGuessFeedback>(url, sessionId);
}

/** Cheap, reliable: yesterday's character per mode, one call each. */
export async function getYesterdayCharacter(
	mode: MarveldleMode,
	sessionId: string
): Promise<CharacterData> {
	return call<CharacterData>(`/characters/${UPSTREAM_MODE[mode]}/yesterday`, sessionId);
}

/** Full candidate list for a mode (458 comics / 338 MCU at last check). */
export async function getAllCharacters(
	mode: MarveldleMode,
	sessionId: string
): Promise<CharacterData[]> {
	return call<CharacterData[]>(`/characters/${UPSTREAM_MODE[mode]}`, sessionId, 60000);
}
