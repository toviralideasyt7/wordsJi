// Shared video-SEO builders for the daily solve videos.
//
// ONE source of truth for every artefact Google cross-checks against each
// other: the watch page's visible title/description, its VideoObject
// JSON-LD, the answer page's VideoObject, and the video sitemap entry are
// all generated from these functions so their title / description /
// thumbnail / player values can never drift apart (drift between sources
// is a named video-indexing-report error).
//
// This module is pure (no $lib/server imports) so it can be used from
// server loads, sitemap endpoints and Svelte components alike.

export const SITE_ORIGIN = 'https://wordsolverx.com';

/** The 19 games whose solve videos the daily-games repo publishes. */
export const VIDEO_GAME_SLUGS = [
	'betweenle',
	'colordle',
	'colorfle',
	'framed',
	'searchle',
	'phrazle',
	'phoodle',
	'contexto',
	'semantle',
	'worldle',
	'worgle',
	'countryle',
	'nerdle',
	'waffle',
	'canuckle',
	'globle',
	'batterup',
	'marveldle',
	'spotle'
] as const;

export type VideoGameSlug = (typeof VIDEO_GAME_SLUGS)[number];

/** Display names as used across the site (fallback when a DB record
 *  carries no display name of its own). */
export const GAME_DISPLAY_NAMES: Record<string, string> = {
	betweenle: 'Betweenle',
	colordle: 'Colordle',
	colorfle: 'Colorfle',
	framed: 'Framed',
	searchle: 'Searchle',
	phrazle: 'Phrazle',
	phoodle: 'Phoodle',
	contexto: 'Contexto',
	semantle: 'Semantle',
	worldle: 'Worldle',
	worgle: 'Worgle',
	countryle: 'Countryle',
	nerdle: 'Nerdle',
	waffle: 'Waffle',
	canuckle: 'Canuckle',
	globle: 'Globle',
	batterup: 'Batterup',
	marveldle: 'Marveldle',
	spotle: 'Spotle'
};

/** Games that have a dated answer route (/<game>-answer-for-<month-d-y>).
 *  Wordle has one too but is another publisher's game — never linked here
 *  because this module only ever sees the 19 slugs above. */
const DATED_ANSWER_GAMES = new Set([
	'batterup',
	'betweenle',
	'canuckle',
	'colordle',
	'marveldle',
	'phrazle',
	'searchle',
	'semantle',
	'spotle',
	'worgle',
	'worldle'
]);

const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export function isVideoGameSlug(value: string): value is VideoGameSlug {
	return (VIDEO_GAME_SLUGS as readonly string[]).includes(value);
}

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(value: string): boolean {
	return DATE_KEY_PATTERN.test(value);
}

/** "2026-10-20" -> "October 20, 2026" (matches the site's dateStr format). */
export function longDate(dateKey: string): string {
	const match = DATE_KEY_PATTERN.exec(dateKey);
	if (!match) return dateKey;
	const [, year, month, day] = match;
	return `${MONTH_NAMES[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/** "2026-10-20" -> "october-20-2026" (the dated-answer route key format). */
export function monthDayYearKey(dateKey: string): string {
	const match = DATE_KEY_PATTERN.exec(dateKey);
	if (!match) return dateKey;
	const [, year, month, day] = match;
	return `${MONTH_NAMES[Number(month) - 1].toLowerCase()}-${Number(day)}-${year}`;
}

/** Canonical watch-page path for one published video. */
export function watchPath(game: string, dateKey: string): string {
	return `/watch/${game}/${dateKey}`;
}

export function watchUrl(game: string, dateKey: string): string {
	return `${SITE_ORIGIN}${watchPath(game, dateKey)}`;
}

/** The answer page for the same game/date: the dated answer route when the
 *  game has one, otherwise its answer-today page. */
export function answerPath(game: string, dateKey: string): string {
	if (DATED_ANSWER_GAMES.has(game)) {
		return `/${game}-answer-for-${monthDayYearKey(dateKey)}`;
	}
	return `/${game}-answer-today`;
}

export function answerUrl(game: string, dateKey: string): string {
	return `${SITE_ORIGIN}${answerPath(game, dateKey)}`;
}

/**
 * The one thumbnail URL declared for a video in every source (VideoObject,
 * sitemap thumbnail_loc, Open Graph). hqdefault is guaranteed to exist for
 * every public YouTube video; maxresdefault 404s on some uploads, so it is
 * only ever used as a visual poster (with an hq fallback), never declared.
 */
export function thumbnailUrl(videoId: string): string {
	return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Player URL for the video sitemap's <video:player_loc> (Google's own
 *  example form for YouTube embeds). */
export function playerLocUrl(videoId: string): string {
	return `https://www.youtube.com/embed/${videoId}`;
}

/** Player URL actually loaded by this site's iframes (privacy-enhanced
 *  host) — used as the iframe src and as VideoObject embedUrl so the
 *  markup describes the player the page really renders. */
export function embedUrl(videoId: string): string {
	return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/** Canonical video title, identical on the answer page, the watch page and
 *  in the video sitemap. Matches the string the answer pages already use. */
export function videoTitle(gameName: string, dateStr: string): string {
	return `${gameName} Answer Today — ${dateStr} (Video Solve)`;
}

/** Flatten a DB record's answer payload to display text. Handles the
 *  shapes the daily-games records actually use: a plain string (most
 *  games), an array of numbers (colorfle), or a per-mode answers object
 *  (framed). Returns null when there is nothing truthful to show. */
export function answerText(answer: unknown, answers: unknown): string | null {
	if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
		const parts = Object.entries(answers as Record<string, unknown>)
			.filter(([, value]) => typeof value === 'string' && value.length > 0)
			.map(([mode, value]) => `${prettifyMode(mode)}: ${value as string}`);
		if (parts.length > 0) return parts.join('; ');
	}
	if (typeof answer === 'string' && answer.length > 0) return answer;
	if (Array.isArray(answer) && answer.length > 0) {
		return answer.map((part) => String(part)).join(', ');
	}
	if (typeof answer === 'number') return String(answer);
	return null;
}

/** Per-mode answer lines for display (framed-style records), else null. */
export function answersList(answers: unknown): { mode: string; value: string }[] | null {
	if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return null;
	const list = Object.entries(answers as Record<string, unknown>)
		.filter(([, value]) => typeof value === 'string' && value.length > 0)
		.map(([mode, value]) => ({ mode: prettifyMode(mode), value: value as string }));
	return list.length > 0 ? list : null;
}

function prettifyMode(mode: string): string {
	return mode
		.split(/[-_]/g)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Canonical video description, identical on the watch page (visible text),
 * in its VideoObject and in the video sitemap. Capped well under the
 * sitemap's 2,048-character limit.
 */
export function videoDescription(gameName: string, dateStr: string, answer: string | null): string {
	const answerClause = answer ? ` The confirmed answer is ${answer}.` : '';
	const text = `Watch the full ${gameName} solve for ${dateStr}.${answerClause} Every guess, the clues, and how the puzzle was cracked — the complete solve, start to finish.`;
	return text.length > 2000 ? `${text.slice(0, 1997)}...` : text;
}

/** ISO 8601 timestamp with an explicit timezone offset. The DB stores
 *  published_at with a trailing "Z"; normalise to +00:00 so every emitted
 *  source carries the offset in the same explicit form. */
export function normalizeTimestamp(iso: string): string {
	return iso.endsWith('Z') ? `${iso.slice(0, -1)}+00:00` : iso;
}

/** Seconds (float ok) -> ISO 8601 duration for VideoObject, e.g. PT1M23S. */
export function isoDuration(totalSeconds: number): string {
	const s = Math.max(0, Math.round(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	return `PT${h > 0 ? `${h}H` : ''}${m > 0 ? `${m}M` : ''}${sec}S`;
}

/** Seconds -> "1:23" / "1:02:03" for chapter lists. */
export function clockTime(totalSeconds: number): string {
	const s = Math.max(0, Math.floor(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
	return `${h > 0 ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}
