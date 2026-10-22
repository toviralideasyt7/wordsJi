// XML helpers for the video sitemap (index + yearly shards).
//
// Kept separate from the routes so both endpoints share exactly the same
// escaping and entry shape. Field rules follow Google's video sitemap
// documentation: player_loc (never content_loc) for YouTube embeds,
// duration in whole seconds, a timezone-carrying publication_date, and a
// description that matches the watch page (it is generated from the same
// content record via src/lib/video-seo.ts).

import { playerLocUrl, SITE_ORIGIN } from '$lib/video-seo';
import { listWatchVideos, type WatchVideo } from '$lib/server/watch-videos';

export function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function cdata(value: string): string {
	return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

export function videoSitemapEntry(video: WatchVideo): string {
	const lines = [
		'  <url>',
		`    <loc>${escapeXml(`${SITE_ORIGIN}${video.watchPath}`)}</loc>`,
		`    <lastmod>${video.publishedAt}</lastmod>`,
		'    <video:video>',
		`      <video:thumbnail_loc>${escapeXml(video.thumbnailUrl)}</video:thumbnail_loc>`,
		`      <video:title>${cdata(video.title)}</video:title>`,
		`      <video:description>${cdata(video.description)}</video:description>`,
		`      <video:player_loc>${escapeXml(playerLocUrl(video.videoId))}</video:player_loc>`
	];
	if (video.durationS) {
		lines.push(`      <video:duration>${video.durationS}</video:duration>`);
	}
	lines.push(
		`      <video:publication_date>${video.publishedAt}</video:publication_date>`,
		'      <video:family_friendly>yes</video:family_friendly>',
		'      <video:live>no</video:live>',
		`      <video:tag>${escapeXml(video.gameName)}</video:tag>`,
		'    </video:video>',
		'  </url>'
	);
	return lines.join('\n');
}

export function videoSitemapForYear(videos: WatchVideo[], year: string): string {
	const entries = videos
		.filter((video) => video.date.startsWith(`${year}-`))
		.map(videoSitemapEntry)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${entries}\n</urlset>`;
}

export function videoSitemapIndex(videos: WatchVideo[]): string {
	const years = new Map<string, string>();
	for (const video of videos) {
		const year = video.date.slice(0, 4);
		const current = years.get(year);
		if (!current || video.publishedAt > current) {
			years.set(year, video.publishedAt);
		}
	}
	const entries = [...years.entries()]
		.sort((a, b) => b[0].localeCompare(a[0]))
		.map(
			([year, lastmod]) =>
				`  <sitemap>\n    <loc>${SITE_ORIGIN}/video-sitemap-${year}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
		)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
}

export async function loadVideoSitemapIndex(): Promise<string> {
	return videoSitemapIndex(await listWatchVideos());
}

export async function loadVideoSitemapForYear(year: string): Promise<string> {
	return videoSitemapForYear(await listWatchVideos(), year);
}
