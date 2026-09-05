import { COLORDLE_DATED_ANSWER_ROUTES } from '$lib/route-registry';

const MAX_URLS_PER_SITEMAP = 50000;

function todayUTCDateString(): string {
	const now = new Date();
	return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

function generateDatedSitemap(): string {
	const lastmod = todayUTCDateString();
	const routes = COLORDLE_DATED_ANSWER_ROUTES.slice(0, MAX_URLS_PER_SITEMAP);
	const urls = routes.map((url: string) => {
		const fullUrl = `https://wordsolverx.com${url}`;
		return `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>`;
	}).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
	return new Response(generateDatedSitemap(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
		}
	});
}