import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { getWatchNeighbours, getWatchVideo, listWatchVideos } from '$lib/server/watch-videos';
import { embedUrl, isDateKey, isVideoGameSlug, isoDuration, SITE_ORIGIN } from '$lib/video-seo';

// One watch page per PUBLISHED solve video — the video is the main content
// of the page, which is what makes it eligible for Google video indexing
// (the answer pages, where the same video is supplementary, are not).
// A game/date with no published video yields no page at all: entries()
// only enumerates published records, and load() 404s everything else.

// 'auto' rather than the true used by the dated answer routes: those are
// driven by bundled data that always exists, while these entries come
// from a remote manifest. With 'auto' the pages prerender whenever the
// manifest is reachable, and a database outage simply omits them from
// that build instead of failing it (kit only hard-fails unseen routes
// whose prerender is strictly true).
export const prerender = 'auto';

export const entries: EntryGenerator = async () => {
	const videos = await listWatchVideos();
	return videos.map((video) => ({ game: video.game, date: video.date }));
};

export const load: PageServerLoad = async ({ params }) => {
	if (!isVideoGameSlug(params.game) || !isDateKey(params.date)) {
		throw error(404, 'Unknown watch page');
	}
	const video = await getWatchVideo(params.game, params.date);
	if (!video) {
		throw error(404, 'No published video for this game and date');
	}
	const { prev, next } = await getWatchNeighbours(params.game, params.date);

	const videoObject: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: video.title,
		description: video.description,
		thumbnailUrl: [video.thumbnailUrl],
		uploadDate: video.publishedAt,
		embedUrl: embedUrl(video.videoId),
		creator: {
			'@type': 'Organization',
			name: 'WordSolverX',
			url: SITE_ORIGIN
		}
	};
	if (video.durationS) {
		videoObject.duration = isoDuration(video.durationS);
	}
	if (video.chapters.length > 1) {
		// Key moments. Each Clip deep-links to this page with ?t=<start>;
		// the page's head script honours ?t= by starting the player there.
		videoObject.hasPart = video.chapters.map((chapter, index) => {
			const nextChapter = video.chapters[index + 1];
			const clip: Record<string, unknown> = {
				'@type': 'Clip',
				name: chapter.label,
				startOffset: chapter.start,
				url: `${video.watchUrl}?t=${chapter.start}`
			};
			const end = nextChapter ? nextChapter.start : video.durationS;
			if (end && end > chapter.start) clip.endOffset = end;
			return clip;
		});
	}

	return {
		video,
		prev: prev ? { watchPath: prev.watchPath, dateStr: prev.dateStr, gameName: prev.gameName } : null,
		next: next ? { watchPath: next.watchPath, dateStr: next.dateStr, gameName: next.gameName } : null,
		schemaJson: JSON.stringify(videoObject),
		meta: {
			title: video.title,
			description: video.description
		}
	};
};
