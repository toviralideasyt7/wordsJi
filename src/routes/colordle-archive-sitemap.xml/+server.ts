import { COLORDLE_ARCHIVE_SITEMAP_ENTRIES } from '$lib/route-registry';
import { parseMonthDayYearKey, toArchiveDateKey } from '$lib/archive-page';

const DATED_PREFIX = '/colordle-answer-for-';

function getDatedLastModified(path: string): string | null {
	if (!path.startsWith(DATED_PREFIX)) {
		return null;
	}
	const date = parseMonthDayYearKey(path.slice(DATED_PREFIX.length));
	return date ? toArchiveDateKey(date) : null;
}

function generateArchiveSitemap(): string {
	const urls = COLORDLE_ARCHIVE_SITEMAP_ENTRIES.map((url: string) => {
		const fullUrl = `https://wordsolverx.com${url}`;
		const lastmod = getDatedLastModified(url);

		let entry = `  <url>\n    <loc>${fullUrl}</loc>`;
		if (lastmod) {
			entry += `\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>`;
		}
		entry += `\n  </url>`;
		return entry;
	}).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
	return new Response(generateArchiveSitemap(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
		}
	});
}
