import { loadVideoSitemapForYear } from '$lib/server/video-sitemap';

// One yearly shard of the video sitemap: one <url> per watch page, one
// <video:video> per <url> (a watch page always has exactly one video).

export async function GET({ params }: { params: { year: string } }) {
	if (!/^\d{4}$/.test(params.year)) {
		return new Response('Not found', { status: 404 });
	}
	return new Response(await loadVideoSitemapForYear(params.year), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
		}
	});
}
