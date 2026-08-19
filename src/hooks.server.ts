import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { getLegacyDatedRedirect, getLegacyTodayRedirect } from '$lib/legacy-redirects';
import {
        ARCHIVE_ROUTE_GAME_MAP,
        TODAY_ROUTE_GAME_MAP,
        getPuzzleWindow,
        isLongCacheStaticPath,
        type PuzzleGame
} from '$lib/puzzle-window';

const RETIRED_SOLVER_PATH = /^\/(leddle-solver)\/?$/;
const LEGACY_SITEMAP_PATH = /^\/(sitemap-index|sitemap-today|sitemap-yesterday|sitemap-solvers|sitemap-games|sitemap-archive|newssitemap)\.xml\/?$/;
const YESTERDAY_REDIRECTS = {
        '/yesterday': '/today',
        '/wordle-answer-yesterday': '/wordle-answer-today',
        '/phoodle-answer-yesterday': '/phoodle-answer-today',
        '/semantle-answer-yesterday': '/semantle-answer-today',
        '/colordle-answer-yesterday': '/colordle-answer-today'
} as const;

const TODAY_CACHE_VERSION_BY_GAME: Partial<Record<PuzzleGame, string>> = {
        nerdle: 'v3'
};

type CacheContext = {
        cacheControl: string;
        lookupKeys: string[];
        storeKey: string;
        browserMaxAge: number;
};

type CloudflareContext = {
        waitUntil(promise: Promise<unknown>): void;
};

function buildCacheControl(
        sMaxage: number,
        browserMaxAge = 0,
        staleWhileRevalidate = 86400
): string {
        return `public, max-age=${browserMaxAge}, s-maxage=${sMaxage}, stale-while-revalidate=${staleWhileRevalidate}`;
}

function getNormalizedPathname(pathname: string): string {
        return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function buildCacheRequest(origin: string, cacheKey: string): Request {
        return new Request(`${origin}/__edge-cache__?key=${encodeURIComponent(cacheKey)}`, {
                method: 'GET',
                headers: {
                        accept: 'text/html'
                }
        });
}

function getCloudflareCache(): Cache | null {
        const globalCaches = (globalThis as typeof globalThis & {
                caches?: { default?: Cache };
        }).caches;

        if (!globalCaches?.default) {
                return null;
        }

        return globalCaches.default;
}

function getCloudflareContext(platform: App.Platform | undefined): CloudflareContext | null {
        const context = (platform as { context?: CloudflareContext } | undefined)?.context;
        return context ?? null;
}

function getArchiveCacheContext(url: URL, pathname: string, game: PuzzleGame): CacheContext {
        const selectedDate = url.searchParams.get('date');

        if (selectedDate) {
                const immutableKey = `html:${pathname}:archive-date:${selectedDate}`;
                return {
                        cacheControl: buildCacheControl(2592000, 3600),
                        lookupKeys: [immutableKey],
                        storeKey: immutableKey,
                        browserMaxAge: 3600
                };
        }

        const window = getPuzzleWindow(game);
        const lookupKeys = [`html:${pathname}:archive:${window.effectivePuzzleDate}`];
        if (window.sourceReadiness === 'latest-payload' && window.fallbackPuzzleDate) {
                lookupKeys.push(`html:${pathname}:archive:${window.fallbackPuzzleDate}`);
        }

        return {
                cacheControl: buildCacheControl(window.ttlSeconds, 3600),
                lookupKeys,
                storeKey: lookupKeys[0],
                browserMaxAge: 3600
        };
}

function getHtmlCacheContext(url: URL): CacheContext | null {
        const pathname = getNormalizedPathname(url.pathname);

        if (pathname === '/') {
                const window = getPuzzleWindow('wordle');
                const key = `html:home:${window.effectivePuzzleDate}`;
                return {
                        cacheControl: buildCacheControl(window.ttlSeconds, 86400),
                        lookupKeys: [key],
                        storeKey: key,
                        browserMaxAge: 86400
                };
        }

        if (pathname === '/today') {
                const window = getPuzzleWindow('wordle');
                const key = `html:today-hub:${window.effectivePuzzleDate}`;
                return {
                        cacheControl: buildCacheControl(window.ttlSeconds),
                        lookupKeys: [key],
                        storeKey: key,
                        browserMaxAge: 3600
                };
        }

        if (isLongCacheStaticPath(pathname)) {
                const key = `html:static:${pathname}`;
                return {
                        cacheControl: buildCacheControl(604800, 86400),
                        lookupKeys: [key],
                        storeKey: key,
                        browserMaxAge: 86400
                };
        }

        const todayGame = TODAY_ROUTE_GAME_MAP[pathname];
        if (todayGame) {
                const window = getPuzzleWindow(todayGame);
                const cacheVersion = TODAY_CACHE_VERSION_BY_GAME[todayGame];
                const cacheKey = cacheVersion
                        ? `html:${pathname}:today:${window.effectivePuzzleDate}:${cacheVersion}`
                        : `html:${pathname}:today:${window.effectivePuzzleDate}`;
                return {
                        cacheControl: buildCacheControl(window.ttlSeconds, 3600),
                        lookupKeys: [cacheKey],
                        storeKey: cacheKey,
                        browserMaxAge: 3600
                };
        }

        const archiveGame = ARCHIVE_ROUTE_GAME_MAP[pathname];
        if (archiveGame) {
                return getArchiveCacheContext(url, pathname, archiveGame);
        }

        return null;
}

function getCacheKeySuffix(storeKey: string, marker: string): string {
        const markerIndex = storeKey.indexOf(marker);
        if (markerIndex === -1) {
                return '';
        }

        const afterMarker = storeKey.slice(markerIndex + marker.length);
        const suffixIndex = afterMarker.indexOf(':');
        return suffixIndex === -1 ? '' : afterMarker.slice(suffixIndex);
}

function getStoreKeyFromResponse(pathname: string, cacheContext: CacheContext, response: Response): string {
        const actualPuzzleDate = response.headers.get('X-Puzzle-Date');
        if (!actualPuzzleDate) {
                return cacheContext.storeKey;
        }

        if (TODAY_ROUTE_GAME_MAP[pathname]) {
                const marker = `html:${pathname}:today:`;
                const suffix = getCacheKeySuffix(cacheContext.storeKey, marker);
                return `html:${pathname}:today:${actualPuzzleDate}${suffix}`;
        }

        if (ARCHIVE_ROUTE_GAME_MAP[pathname] && !cacheContext.storeKey.includes(':archive-date:')) {
                const marker = `html:${pathname}:archive:`;
                const suffix = getCacheKeySuffix(cacheContext.storeKey, marker);
                return `html:${pathname}:archive:${actualPuzzleDate}${suffix}`;
        }

        return cacheContext.storeKey;
}

export const handle: Handle = async ({ event, resolve }) => {
        const requestUrl = new URL(event.request.url);
        const pathname = requestUrl.pathname;
        const normalizedPathname = getNormalizedPathname(pathname);

        if (normalizedPathname in YESTERDAY_REDIRECTS) {
                throw redirect(301, YESTERDAY_REDIRECTS[normalizedPathname as keyof typeof YESTERDAY_REDIRECTS]);
        }

        if (RETIRED_SOLVER_PATH.test(normalizedPathname)) {
                throw redirect(301, '/');
        }

        if (LEGACY_SITEMAP_PATH.test(normalizedPathname)) {
                throw redirect(301, '/sitemap.xml');
        }

        const legacyDatedRedirect = getLegacyDatedRedirect(normalizedPathname);
        if (legacyDatedRedirect) {
                throw redirect(301, legacyDatedRedirect);
        }

        const legacyTodayRedirect = getLegacyTodayRedirect(normalizedPathname);
        if (legacyTodayRedirect) {
                throw redirect(301, legacyTodayRedirect);
        }

        const shouldAttemptEdgeCache = event.request.method === 'GET';
        const cacheContext = shouldAttemptEdgeCache ? getHtmlCacheContext(requestUrl) : null;
        const edgeCache = cacheContext ? getCloudflareCache() : null;

        if (cacheContext && edgeCache) {
                for (const cacheKey of cacheContext.lookupKeys) {
                        const cachedResponse = await edgeCache.match(buildCacheRequest(requestUrl.origin, cacheKey));
                        if (cachedResponse) {
                                const hitResponse = new Response(cachedResponse.body, cachedResponse);
                                hitResponse.headers.set('X-Edge-Cache', 'HIT');
                                return hitResponse;
                        }
                }
        }

        // Add Early Hints for Google Fonts preconnect
        const response = await resolve(event, {
                transformPageChunk: undefined
        });
        response.headers.append('Link', '<https://fonts.googleapis.com>; rel=preconnect');
        response.headers.append('Link', '<https://fonts.gstatic.com>; rel=preconnect; crossorigin');
        const contentType = response.headers.get('content-type') ?? '';

        if (contentType.includes('text/html')) {
                if (cacheContext) {
                        const shouldBypassEdgeCache = response.headers.get('X-Edge-Cache-Bypass') === '1';
                        const ttlOverrideHeader = response.headers.get('X-Edge-Cache-TTL');
                        const ttlOverrideSeconds =
                                ttlOverrideHeader !== null ? Number.parseInt(ttlOverrideHeader, 10) : Number.NaN;
                        const cacheControl =
                                Number.isInteger(ttlOverrideSeconds) && ttlOverrideSeconds >= 60
                                        ? buildCacheControl(ttlOverrideSeconds, cacheContext.browserMaxAge)
                                        : cacheContext.cacheControl;
                        response.headers.set('Cache-Control', shouldBypassEdgeCache ? 'no-store' : cacheControl);
                        response.headers.set('X-Edge-Cache', 'MISS');

                        if (!shouldBypassEdgeCache && response.status === 200 && edgeCache) {
                                const storeKey = getStoreKeyFromResponse(normalizedPathname, cacheContext, response);
                                const responseToCache = response.clone();
                                responseToCache.headers.set('Cache-Control', cacheControl);
                                const context = getCloudflareContext(event.platform);

                                if (context) {
                                        context.waitUntil(
                                                edgeCache.put(buildCacheRequest(requestUrl.origin, storeKey), responseToCache)
                                        );
                                } else {
                                        await edgeCache.put(buildCacheRequest(requestUrl.origin, storeKey), responseToCache);
                                }
                        }
                } else {
                        response.headers.set('Cache-Control', buildCacheControl(900, 86400));
                }
        }

        return response;
};

export const handleError: HandleServerError = ({ error, event }) => {
        console.error(`[handleError] ${event.request.method} ${event.url.pathname}${event.url.search}`, error);

        return {
                message: 'Internal Server Error'
        };
};
