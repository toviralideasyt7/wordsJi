import { formatPuzzleDateKey, getPuzzleDateForGame, TODAY_ROUTE_GAME_MAP, ARCHIVE_ROUTE_GAME_MAP, type PuzzleGame } from '$lib/puzzle-window';
import { GENERATED_SITEMAP_LASTMOD } from '$lib/generated/sitemap-lastmod';
import { MAIN_SITEMAP_ENTRIES } from '$lib/route-registry';
import { parseMonthDayYearKey, toArchiveDateKey } from '$lib/archive-page';

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

// SEO audit chapter 4.2 housekeeping: cap static-page lastmod to min(value, now)
// so the homepage and other static URLs do not show a future date after the
// 16:30 UTC puzzle-window rollover. Answer-page lastmod is intentionally left
// tracking the NYT puzzle date (see chapter 4.2 design clarification).
function capToToday(value: string): string {
        const todayUtc = new Date();
        const todayStr = `${todayUtc.getUTCFullYear()}-${String(todayUtc.getUTCMonth() + 1).padStart(2, '0')}-${String(todayUtc.getUTCDate()).padStart(2, '0')}`;
        return value > todayStr ? todayStr : value;
}

function getDatedAnswerLastModified(path: string): string | null {
        const prefix = '/wordle-answer-for-';
        if (!path.startsWith(prefix)) {
                return null;
        }
        const date = parseMonthDayYearKey(path.slice(prefix.length));
        return date ? toArchiveDateKey(date) : null;
}

function getLastModified(path: string): string {
        // Hub pages (/, /today, /archive, /guides) and static content pages should
        // never have a future lastmod — cap to today's UTC date.
        if (HUB_PAGES.has(path) || CONTENT_PAGES.has(path) || path === '/') {
                return capToToday(getPuzzleRouteLastModified(path) ?? getGeneratedLastModified(path) ?? formatPuzzleDateKey(getPuzzleDateForGame(MAIN_DAILY_FALLBACK_GAME)));
        }

	// Answer-today and archive pages track the puzzle window, but a lastmod in the
	// future (the NYT puzzle date runs one day ahead of UTC after 16:30 UTC)
	// confuses Google freshness signals — cap everything to today's UTC date.
	return capToToday(getDatedAnswerLastModified(path) ?? getPuzzleRouteLastModified(path) ?? getGeneratedLastModified(path) ?? formatPuzzleDateKey(getPuzzleDateForGame(MAIN_DAILY_FALLBACK_GAME)));
}

function getPriority(path: string): string {
        if (path === '/' || path === '/wordle-answer-today' || path === '/wordle-solver') return '1.0';
        if (path.endsWith('-answer-today') || path.endsWith('-answer-today-updated')) return '0.9';
        if (HUB_PAGES.has(path)) return '0.8';
        if (path.endsWith('-solver')) return '0.7';
        if (path.endsWith('-archive') || path === '/wordle-answer-archive') return '0.5';
        if (CONTENT_PAGES.has(path)) return '0.4';
        return '0.5';
}

function getChangefreq(path: string): string {
        if (path === '/' || path === '/wordle-answer-today') return 'daily';
        if (path.endsWith('-answer-today') || path.endsWith('-answer-today-updated')) return 'daily';
        if (HUB_PAGES.has(path)) return 'daily';
        if (path.endsWith('-solver')) return 'weekly';
        if (path.endsWith('-archive')) return 'monthly';
        if (CONTENT_PAGES.has(path)) return 'monthly';
        return 'weekly';
}

function generateSitemap(): string {
        const urls = MAIN_SITEMAP_ENTRIES.filter(shouldIncludeUrl)
                .map((url: string) => {
                        const fullUrl = url.startsWith('http') ? url : `https://wordsolverx.com${url}`;
                        const lastmod = getLastModified(url);
                        const priority = getPriority(url);
                        const changefreq = getChangefreq(url);

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
                        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
                }
        });
}
