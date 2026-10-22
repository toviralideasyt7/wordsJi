// Build-time / request-time manifest of every PUBLISHED solve video.
//
// The daily-games repo (satwiksamanta77/daily-games) is the single source
// of truth: one record per game/day at database/<date>/<game>/result.json.
// This module enumerates the database tree once (GitHub git-trees API),
// fetches each record for the 19 video games, and keeps only records that
// are genuinely published (published === true, a YouTube id, and a real
// published_at timestamp). Watch pages and the video sitemap are generated
// exclusively from this manifest, so an unpublished game/date can never
// produce a watch page or a sitemap entry.
//
// Fail-soft by contract (same as game-videos.ts): any network/API failure
// resolves to an empty manifest and NEVER throws, so a database hiccup can
// at worst omit watch pages from one build — it cannot fail the build.
//
// The manifest promise is cached for the lifetime of the process:
// prerendering calls it once per build no matter how many routes ask.

import {
	GAME_DISPLAY_NAMES,
	answerPath,
	answerText,
	answersList,
	isVideoGameSlug,
	longDate,
	normalizeTimestamp,
	thumbnailUrl,
	videoDescription,
	videoTitle,
	watchPath,
	watchUrl,
	type VideoGameSlug
} from '$lib/video-seo';

export interface WatchChapter {
	start: number;
	label: string;
}

export interface WatchVideo {
	game: VideoGameSlug;
	gameName: string;
	/** YYYY-MM-DD the video belongs to (the DB record's own date). */
	date: string;
	/** "October 20, 2026" */
	dateStr: string;
	videoId: string;
	/** ISO 8601 with explicit timezone offset. */
	publishedAt: string;
	answer: string | null;
	answers: { mode: string; value: string }[] | null;
	/** Solver's own evidence line from the record, when present. */
	evidence: string | null;
	/** Whole seconds, when the record knows the duration. */
	durationS: number | null;
	chapters: WatchChapter[];
	/** Canonical artefacts, all derived from src/lib/video-seo.ts. */
	title: string;
	description: string;
	thumbnailUrl: string;
	watchPath: string;
	watchUrl: string;
	answerPath: string;
}

const DB_TREE_URL =
	'https://api.github.com/repos/satwiksamanta77/daily-games/git/trees/main?recursive=1';
const RAW_BASE = 'https://raw.githubusercontent.com/satwiksamanta77/daily-games/main';
const FETCH_HEADERS = { 'User-Agent': 'wordsolverx-site-build' };
const RECORD_CONCURRENCY = 16;

interface RawRecord {
	published?: unknown;
	youtube_video_id?: unknown;
	published_at?: unknown;
	answer?: unknown;
	answers?: unknown;
	evidence?: unknown;
	enrichment_context?: {
		game?: unknown;
		date_str?: unknown;
		duration_s?: unknown;
		chapters?: unknown;
	} | null;
}

function parseChapters(raw: unknown): WatchChapter[] {
	if (!Array.isArray(raw)) return [];
	const chapters: WatchChapter[] = [];
	for (const entry of raw) {
		if (!Array.isArray(entry) || entry.length < 2) continue;
		const [start, label] = entry as [unknown, unknown];
		if (typeof start !== 'number' || !Number.isFinite(start) || typeof label !== 'string') {
			continue;
		}
		chapters.push({ start: Math.max(0, Math.round(start)), label });
	}
	return chapters.sort((a, b) => a.start - b.start);
}

function toWatchVideo(game: VideoGameSlug, date: string, record: RawRecord): WatchVideo | null {
	if (record.published !== true) return null;
	if (typeof record.youtube_video_id !== 'string' || record.youtube_video_id.length === 0) {
		return null;
	}
	if (typeof record.published_at !== 'string' || record.published_at.length === 0) {
		// uploadDate is a required VideoObject property and the sitemap's
		// publication_date/lastmod source. Without a real publish timestamp
		// the record is incomplete — skip it rather than fabricate one.
		return null;
	}

	const context = record.enrichment_context ?? {};
	const gameName =
		typeof context.game === 'string' && context.game.length > 0
			? context.game
			: GAME_DISPLAY_NAMES[game];
	const dateStr =
		typeof context.date_str === 'string' && context.date_str.length > 0
			? context.date_str
			: longDate(date);
	const answer = answerText(record.answer, record.answers);
	const durationRaw = context.duration_s;
	const durationS =
		typeof durationRaw === 'number' && Number.isFinite(durationRaw) && durationRaw > 0
			? Math.round(durationRaw)
			: null;

	return {
		game,
		gameName,
		date,
		dateStr,
		videoId: record.youtube_video_id,
		publishedAt: normalizeTimestamp(record.published_at),
		answer,
		answers: answersList(record.answers),
		evidence:
			typeof record.evidence === 'string' && record.evidence.length > 0 ? record.evidence : null,
		durationS,
		chapters: parseChapters(context.chapters),
		title: videoTitle(gameName, dateStr),
		description: videoDescription(gameName, dateStr, answer),
		thumbnailUrl: thumbnailUrl(record.youtube_video_id),
		watchPath: watchPath(game, date),
		watchUrl: watchUrl(game, date),
		answerPath: answerPath(game, date)
	};
}

interface RecordTarget {
	game: VideoGameSlug;
	date: string;
}

/** Fetch one record; `exists` distinguishes "no such record" (404) from a
 *  record that exists but is unpublished, which the fallback scan below
 *  needs for its stop condition. */
async function fetchRecord(
	target: RecordTarget
): Promise<{ exists: boolean; video: WatchVideo | null }> {
	try {
		const response = await fetch(
			`${RAW_BASE}/database/${target.date}/${target.game}/result.json`,
			{ headers: FETCH_HEADERS }
		);
		if (!response.ok) return { exists: false, video: null };
		const record = (await response.json()) as RawRecord | null;
		return { exists: true, video: record ? toWatchVideo(target.game, target.date, record) : null };
	} catch {
		return { exists: false, video: null };
	}
}

async function fetchRecords(targets: RecordTarget[]): Promise<WatchVideo[]> {
	const videos: WatchVideo[] = [];
	for (let i = 0; i < targets.length; i += RECORD_CONCURRENCY) {
		const batch = targets.slice(i, i + RECORD_CONCURRENCY);
		const settled = await Promise.all(batch.map(fetchRecord));
		for (const { video } of settled) {
			if (video) videos.push(video);
		}
	}
	return videos;
}

/** Primary listing: the git-trees API enumerates the whole database in one
 *  call. Returns null when the API is unavailable — including the common
 *  case of its 60/hour unauthenticated quota being exhausted on shared
 *  build IPs — so the caller can fall back to probing raw URLs, which are
 *  not quota-limited the same way. */
async function listTargetsViaTree(): Promise<RecordTarget[] | null> {
	try {
		const treeResponse = await fetch(DB_TREE_URL, { headers: FETCH_HEADERS });
		if (!treeResponse.ok) return null;
		const tree = (await treeResponse.json()) as {
			tree?: { path?: unknown }[];
		} | null;
		const targets: RecordTarget[] = [];
		for (const entry of tree?.tree ?? []) {
			const path = typeof entry?.path === 'string' ? entry.path : '';
			const parts = path.split('/');
			// database/<date>/<game>/result.json
			if (parts.length !== 4 || parts[0] !== 'database' || parts[3] !== 'result.json') continue;
			const [, date, game] = parts;
			if (!isVideoGameSlug(game)) continue;
			targets.push({ game, date });
		}
		return targets;
	} catch {
		return null;
	}
}

function dateKeyDaysAgo(daysAgo: number): string {
	const date = new Date();
	date.setUTCDate(date.getUTCDate() - daysAgo);
	return date.toISOString().slice(0, 10);
}

/** Fallback listing: probe raw record URLs backwards from today in
 *  31-day chunks, stopping after two consecutive chunks with no records
 *  at all (records exist for attempted days even when unpublished, so an
 *  empty chunk means "before the database began"). */
async function fetchViaScan(): Promise<WatchVideo[]> {
	const games = Object.keys(GAME_DISPLAY_NAMES).filter(isVideoGameSlug);
	const videos: WatchVideo[] = [];
	let emptyChunks = 0;
	for (let chunkStart = -1; emptyChunks < 2 && chunkStart < 400; chunkStart += 31) {
		const targets: RecordTarget[] = [];
		for (let offset = 0; offset < 31; offset += 1) {
			const date = dateKeyDaysAgo(chunkStart + offset);
			for (const game of games) {
				targets.push({ game, date });
			}
		}
		let chunkHasRecords = false;
		for (let i = 0; i < targets.length; i += RECORD_CONCURRENCY) {
			const batch = targets.slice(i, i + RECORD_CONCURRENCY);
			const settled = await Promise.all(batch.map(fetchRecord));
			for (const { exists, video } of settled) {
				if (exists) chunkHasRecords = true;
				if (video) videos.push(video);
			}
		}
		emptyChunks = chunkHasRecords ? 0 : emptyChunks + 1;
	}
	return videos;
}

async function fetchManifest(): Promise<WatchVideo[]> {
	try {
		const targets = await listTargetsViaTree();
		const videos = targets ? await fetchRecords(targets) : await fetchViaScan();
		// Newest first; stable secondary order by game for deterministic output.
		videos.sort((a, b) => b.date.localeCompare(a.date) || a.game.localeCompare(b.game));
		return videos;
	} catch {
		return [];
	}
}

let manifestPromise: Promise<WatchVideo[]> | null = null;

/** Every published solve video in the database, newest first. */
export function listWatchVideos(): Promise<WatchVideo[]> {
	if (!manifestPromise) {
		manifestPromise = fetchManifest();
	}
	return manifestPromise;
}

export async function getWatchVideo(game: string, date: string): Promise<WatchVideo | null> {
	const all = await listWatchVideos();
	return all.find((video) => video.game === game && video.date === date) ?? null;
}

/** Previous / next published watch video for the same game (by date). */
export async function getWatchNeighbours(
	game: string,
	date: string
): Promise<{ prev: WatchVideo | null; next: WatchVideo | null }> {
	const all = await listWatchVideos();
	const sameGame = all
		.filter((video) => video.game === game)
		.sort((a, b) => a.date.localeCompare(b.date));
	const index = sameGame.findIndex((video) => video.date === date);
	if (index === -1) return { prev: null, next: null };
	return {
		prev: index > 0 ? sameGame[index - 1] : null,
		next: index < sameGame.length - 1 ? sameGame[index + 1] : null
	};
}
