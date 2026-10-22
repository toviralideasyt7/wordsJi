import { loadVideoSitemapIndex } from '$lib/server/video-sitemap';

// Video sitemap index. Lists one shard per year (video-sitemap-<year>.xml)
// covering ONLY the watch pages of published solve videos. Referenced from
// robots.txt; submit this file's URL in Google Search Console.

export async function GET() {
	return new Response(await loadVideoSitemapIndex(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
		}
	});
}
