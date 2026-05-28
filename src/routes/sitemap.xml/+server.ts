import { formatPuzzleDateKey, getPuzzleDateForGame, TODAY_ROUTE_GAME_MAP, ARCHIVE_ROUTE_GAME_MAP, type PuzzleGame } from '$lib/puzzle-window';
import { GENERATED_SITEMAP_LASTMOD } from '$lib/generated/sitemap-lastmod';
import { SITEMAP_ENTRIES } from '$lib/route-registry';

const BLOCKED_URL_PATTERNS = ['/create-custom-wordle', '/custom-wordle', '/admin', '/api/', '/private'];

const CONTENT_PAGES = new Set(['/about', '/contact', '/privacy-policy', '/terms-of-service', '/disclaimer', '/editorial-policy']);
const HUB_PAGES = new Set(['/today', '/solver', '/archive', '/guides']);
const MAIN_DAILY_FALLBACK_GAME: PuzzleGame = 'wordle';
const ROUTE_LASTMOD_GAME_MAP: Record<string, PuzzleGame> = {
	...TODAY_ROUTE_GAME_MAP,
	...ARCHIVE_ROUTE_GAME_MAP
};

function shouldIncludeUrl(url: string): boolean {
	return !BLOCKED_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

interface SitemapEntry {
	priority: string;
	changefreq: string;
}

function classifyUrl(path: string): SitemapEntry {
	if (path === '/') {
		return { priority: '1.0', changefreq: 'daily' };
	}
	if (path.endsWith('-answer-today')) {
		return { priority: '0.9', changefreq: 'daily' };
	}
	if (path.endsWith('-archive')) {
		return { priority: '0.7', changefreq: 'weekly' };
	}
	if (path.endsWith('-solver') || path.endsWith('-analyzer')) {
		return { priority: '0.8', changefreq: 'weekly' };
	}
	if (CONTENT_PAGES.has(path)) {
		return { priority: '0.5', changefreq: 'monthly' };
	}
	if (HUB_PAGES.has(path)) {
		return { priority: '0.8', changefreq: 'daily' };
	}
	return { priority: '0.6', changefreq: 'weekly' };
}

function getPuzzleRouteLastModified(path: string): string | null {
	const game = ROUTE_LASTMOD_GAME_MAP[path];
	if (!game) {
		return null;
	}

	return formatPuzzleDateKey(getPuzzleDateForGame(game));
}

function getGeneratedLastModified(path: string): string | null {
	return GENERATED_SITEMAP_LASTMOD[path] ?? null;
}

function getLastModified(path: string): string {
	if (HUB_PAGES.has(path)) {
		return formatPuzzleDateKey(getPuzzleDateForGame(MAIN_DAILY_FALLBACK_GAME));
	}

	return getPuzzleRouteLastModified(path) ?? getGeneratedLastModified(path) ?? formatPuzzleDateKey(getPuzzleDateForGame(MAIN_DAILY_FALLBACK_GAME));
}

function generateSitemap(): string {
	const urls = SITEMAP_ENTRIES.filter(shouldIncludeUrl)
		.map((url: string) => {
			const fullUrl = url.startsWith('http') ? url : `https://wordsolverx.com${url}`;
			const { priority, changefreq } = classifyUrl(url);
			const lastmod = getLastModified(url);

			let entry = `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>`;

			if (url === '/') {
				entry += `\n    <image:image>\n      <image:loc>https://wordsolverx.com/wordsolverx.webp</image:loc>\n    </image:image>`;
			}

			entry += `\n  </url>`;
			return entry;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>`;
}

export async function GET() {
	return new Response(generateSitemap(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
		}
	});
}
