// Build-time video state for the daily "answer today" pages.
//
// The daily-games automation repo (satwiksamanta77/daily-games) is the single
// source of truth for YouTube publications. Every game/day record lives at
// database/<YYYY-MM-DD>/<game>/result.json and carries { published,
// youtube_video_id, published_at }. This module reads the record for the
// EXACT date a page is displaying — never "the latest available" — so a
// video can never be attached to the wrong day's page.
//
// Fail-soft by contract: any network error, non-200 response or malformed
// payload resolves to "not published" (the page renders its reserved
// placeholder) and NEVER throws, so a database hiccup cannot fail a build.
//
// Results are cached per (date, game) for the lifetime of the build process:
// prerendering runs every load in one Node process, so each record is
// fetched at most once per build no matter how many pages ask for it.

import { watchPath } from '$lib/video-seo';

export interface GameVideo {
	/** YouTube video id when the video for this date is published, else null. */
	videoId: string | null;
	/** ISO timestamp from the database's published_at field, when known. */
	uploadDate: string | null;
	/** Path of the dedicated watch page for this video, when published. */
	watchUrl: string | null;
}

const NOT_PUBLISHED: GameVideo = { videoId: null, uploadDate: null, watchUrl: null };

const cache = new Map<string, Promise<GameVideo>>();

async function fetchGameVideo(game: string, dateKey: string): Promise<GameVideo> {
	try {
		const url = `https://raw.githubusercontent.com/satwiksamanta77/daily-games/main/database/${dateKey}/${game}/result.json`;
		const response = await fetch(url, {
			headers: { 'User-Agent': 'wordsolverx-site-build' }
		});
		if (!response.ok) {
			return NOT_PUBLISHED;
		}
		const record = (await response.json()) as {
			published?: unknown;
			youtube_video_id?: unknown;
			published_at?: unknown;
		} | null;
		if (
			record &&
			record.published === true &&
			typeof record.youtube_video_id === 'string' &&
			record.youtube_video_id.length > 0
		) {
			return {
				videoId: record.youtube_video_id,
				uploadDate:
					typeof record.published_at === 'string' && record.published_at.length > 0
						? record.published_at
						: null,
				watchUrl: watchPath(game, dateKey)
			};
		}
		return NOT_PUBLISHED;
	} catch {
		return NOT_PUBLISHED;
	}
}

/**
 * Video state for one game on one date (YYYY-MM-DD). Await it in a
 * +page.server.ts load and pass the result to <VideoSection />.
 */
export function getGameVideo(game: string, dateKey: string): Promise<GameVideo> {
	const key = `${dateKey}/${game}`;
	let pending = cache.get(key);
	if (!pending) {
		pending = fetchGameVideo(game, dateKey);
		cache.set(key, pending);
	}
	return pending;
}
