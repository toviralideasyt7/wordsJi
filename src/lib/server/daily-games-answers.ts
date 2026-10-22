// Build-time answer state sourced from the daily-games automation repo.
//
// The daily-games repo (satwiksamanta77/daily-games) is the single source of
// truth for what the REAL games served each day: its solver bot plays every
// game and records the verified answer in database/<YYYY-MM-DD>/<game>/
// result.json. Pages must take their displayed answer from that record
// whenever one exists — a page must never derive an "answer" from a local
// seed, a bundled snapshot, or a day-index rotation, because those diverge
// from the live game (Worldle showed a seedrandom-picked country; Searchle
// rotated a stale bundled pool; both were wrong while the DB was right).
//
// Fail-soft by contract (same as game-videos.ts): any network error,
// non-200 response or malformed payload resolves to null and NEVER throws,
// so a database hiccup cannot fail a build. Callers fall back to their
// previous behaviour only for dates the database does not cover.
//
// Results are cached per (game, date) for the lifetime of the build
// process: prerendering runs every load in one Node process, so each
// record is fetched at most once per build.

export interface DailyGamesRecord {
	solved?: unknown;
	answer?: unknown;
	published?: unknown;
	youtube_video_id?: unknown;
	published_at?: unknown;
	evidence?: unknown;
}

const cache = new Map<string, Promise<DailyGamesRecord | null>>();

async function fetchDailyGamesRecord(
	game: string,
	dateKey: string
): Promise<DailyGamesRecord | null> {
	try {
		const url = `https://raw.githubusercontent.com/satwiksamanta77/daily-games/main/database/${dateKey}/${game}/result.json`;
		const response = await fetch(url, {
			headers: { 'User-Agent': 'wordsolverx-site-build' }
		});
		if (!response.ok) {
			return null;
		}
		const record = (await response.json()) as DailyGamesRecord | null;
		return record && typeof record === 'object' ? record : null;
	} catch {
		return null;
	}
}

export function getDailyGamesRecord(
	game: string,
	dateKey: string
): Promise<DailyGamesRecord | null> {
	const key = `${game}:${dateKey}`;
	let pending = cache.get(key);
	if (!pending) {
		pending = fetchDailyGamesRecord(game, dateKey);
		cache.set(key, pending);
	}
	return pending;
}

function nonEmptyString(value: unknown): string | null {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Worldle: the verified mystery country for a date, as an ISO 3166-1
 * alpha-2 code matching the site's bundled country dataset.
 *
 * The record's `answer` carries the country name once the bot solved the
 * day. The bot's `evidence` string always names the day's country with its
 * code ("worldle all-modes: Kazakhstan (KZ); ...") — including days the
 * bot did not fully clear (answer stays null when one of the 13 modes
 * blocked), where the country itself was still observed first-hand from
 * the real game. The evidence code is therefore accepted as the same
 * first-hand truth; the seeded local pick is never consulted for a date
 * the database covers.
 */
export async function getWorldleDbCountryCode(dateKey: string): Promise<string | null> {
	const record = await getDailyGamesRecord('worldle', dateKey);
	if (!record) return null;
	const evidence = nonEmptyString(record.evidence);
	if (evidence) {
		const match = evidence.match(/\(([A-Z]{2})\)/);
		if (match) return match[1];
	}
	return null;
}

/**
 * Worldle country name for a date: the record's `answer` once solved;
 * otherwise the country named in the bot's first-hand `evidence` string
 * ("worldle all-modes: Sudan (SD); ...") for days the bot observed but
 * did not fully clear.
 */
export async function getWorldleDbCountryName(dateKey: string): Promise<string | null> {
	const record = await getDailyGamesRecord('worldle', dateKey);
	if (!record) return null;
	const answer = nonEmptyString(record.answer);
	if (answer) return answer;
	const evidence = nonEmptyString(record.evidence);
	if (evidence) {
		const match = evidence.match(/worldle all-modes:\s*(.+?)\s*\([A-Z]{2}\)/i);
		if (match) return match[1].trim();
	}
	return null;
}

/** Searchle: the verified missing word for a date, when the bot solved it. */
export async function getSearchleDbAnswer(dateKey: string): Promise<string | null> {
	const record = await getDailyGamesRecord('searchle', dateKey);
	if (!record || record.solved !== true) return null;
	return nonEmptyString(record.answer);
}

/** Marveldle: the verified Comics-mode character name for a date. */
export async function getMarveldleDbAnswer(
	dateKey: string
): Promise<{ name: string; publishedAt: string | null } | null> {
	const record = await getDailyGamesRecord('marveldle', dateKey);
	if (!record || record.solved !== true) return null;
	const name = nonEmptyString(record.answer);
	if (!name) return null;
	return { name, publishedAt: nonEmptyString(record.published_at) };
}
