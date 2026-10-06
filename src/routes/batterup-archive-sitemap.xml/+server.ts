import { datedWindowEntries } from '$lib/dated-answer';

const GAME_KEY = 'batterup' as const;

// Per-game dated sitemap: one URL per prerendered {game}-answer-for-{month}-{day}-{year}
// page (rolling 120-day window, filtered to dates with a known answer). Each file
// stays far under the 50k-URL sitemap limit.
function generateArchiveSitemap(): string {
	const entries = datedWindowEntries(GAME_KEY);
	const urls = entries
		.map(({ date, dateKey }) => {
			const fullUrl = `https://wordsolverx.com/${GAME_KEY}-answer-for-${date}`;
			return `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${dateKey}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>`;
		})
		.join('\n');

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
