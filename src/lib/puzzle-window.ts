import { DAILY_ROLLOVER_GRACE_SECONDS } from '$lib/rollover-grace';

export type PuzzleTimezone = 'JST' | 'IST' | 'UTC' | 'worker-latest';
export type PuzzleSourceReadiness = 'deterministic' | 'latest-payload';

export type PuzzleGame =
        | 'canuckle'
        | 'wordle'
        | 'quordle'
        | 'phoodle'
        | 'semantle'
        | 'colordle'
        | 'countryle'
        | 'framed'
        | 'globle'
        | 'waffle'
        | 'worldle'
        | 'betweenle'
        | 'contexto'
        | 'searchle'
        | 'phrazle'
        | 'spotle'
        | 'worgle'
        | 'dotadle'
        | 'loldle'
        | 'narutodle'
        | 'onepiecedle'
        | 'pokedle'
        | 'smashdle'
        | 'nerdle'
        | 'colorfle';

export interface PuzzleWindow {
        group: string;
        timezone: PuzzleTimezone;
        effectivePuzzleDate: string;
        nextInvalidationAt: Date;
        ttlSeconds: number;
        sourceReadiness: PuzzleSourceReadiness;
        fallbackPuzzleDate?: string | null;
}

interface PuzzleWindowConfig {
        group: string;
        timezone: PuzzleTimezone;
        sourceReadiness: PuzzleSourceReadiness;
        boundaryHourUtc?: number;
        boundaryMinuteUtc?: number;
        rolloverGraceSeconds?: number;
        visibleDateOffsetDays?: number;
}

const OFFSET_MINUTES = {
        JST: 9 * 60,
        IST: 5.5 * 60,
        UTC: 0
} as const;

export const PUZZLE_WINDOW_CONFIG: Record<PuzzleGame, PuzzleWindowConfig> = {
        canuckle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 5,
                boundaryMinuteUtc: 0,
                rolloverGraceSeconds: 300
        },
        wordle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        quordle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        phoodle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        semantle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        colordle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        countryle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        framed: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        // Globle is the one game in this table whose upstream only ever serves a single day:
        // https://globle-game.com/answer?day=YYYY-MM-DD returns 200 for today's country and 404
        // for every other date (checked 2026-09-21 06:46 UTC: 09-19 404, 09-20 404, 09-21 200,
        // 09-22 404). So the window date has to name the day upstream is serving, and the
        // boundary has to sit at (or after) the instant upstream swaps days.
        //
        // Evidence for the swap time. On 2026-09-21 the page built at ~03:30 UTC got 404 for both
        // 09-21 and 09-20, and at 06:30 UTC `day=2026-09-21` returned 200 while 09-20 and 09-22
        // returned 404 — so upstream swapped somewhere inside 03:30-06:30 UTC. That brackets
        // midnight US Eastern, which is 04:00 UTC during EDT and 05:00 UTC during EST.
        //
        // 06:00 UTC is the latest boundary that still satisfies that bracket: it is at least an
        // hour after the swap in either DST state, so the computed date is never ahead of what
        // upstream serves, and it is before the 06:30 observation that already had the new day
        // live, so the page is never a day behind by mid-morning either.
        //
        // The old 16:30 UTC boundary came from the shared Wordle row and flipped the label 11.5
        // hours before upstream had the answer, which is the whole bug: the page asked for
        // tomorrow, got a 404, and the loader below quietly published yesterday instead.
        //
        // visibleDateOffsetDays is 0 because for Globle the label is the date upstream serves
        // today, not tomorrow's date published a little early.
        //
        // Accepted cost: between the upstream swap and 06:00 UTC the window date is still the
        // previous day, which upstream has stopped serving. The page then falls back to its
        // declared fallbackPuzzleDate and, if that is gone too, redirects to /globle-archive.
        // That is a bounded one- to two-hour gap, deliberately chosen over publishing a date
        // upstream does not have yet.
        globle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 6,
                boundaryMinuteUtc: 0,
                visibleDateOffsetDays: 0
        },
        waffle: {
                group: 'waffle',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 0,
                boundaryMinuteUtc: 1
        },
        worldle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        betweenle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        nerdle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                rolloverGraceSeconds: 60,
                visibleDateOffsetDays: 1
        },
        contexto: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        searchle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        phrazle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        spotle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 16,
                boundaryMinuteUtc: 30,
                visibleDateOffsetDays: 1
        },
        worgle: {
                group: 'main',
                timezone: 'IST',
                sourceReadiness: 'deterministic'
        },
        dotadle: {
                group: 'gamedle',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 6,
                boundaryMinuteUtc: 2
        },
        loldle: {
                group: 'gamedle',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 6,
                boundaryMinuteUtc: 2
        },
        narutodle: {
                group: 'gamedle',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 6,
                boundaryMinuteUtc: 2
        },
        onepiecedle: {
                group: 'gamedle',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 6,
                boundaryMinuteUtc: 2
        },
        pokedle: {
                group: 'gamedle',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 6,
                boundaryMinuteUtc: 2
        },
        smashdle: {
                group: 'gamedle',
                timezone: 'worker-latest',
                sourceReadiness: 'latest-payload',
                boundaryHourUtc: 6,
                boundaryMinuteUtc: 2
        },
        colorfle: {
                group: 'main',
                timezone: 'worker-latest',
                sourceReadiness: 'deterministic',
                boundaryHourUtc: 15,
                boundaryMinuteUtc: 0,
                visibleDateOffsetDays: 1
        }
};

export const TODAY_ROUTE_GAME_MAP: Record<string, PuzzleGame> = {
        '/canuckle-answer-today': 'canuckle',
        '/wordle-answer-today': 'wordle',
        '/quordle-answer-today': 'quordle',
        '/phoodle-answer-today': 'phoodle',
        '/semantle-answer-today': 'semantle',
        '/colordle-answer-today': 'colordle',
        '/countryle-answer-today': 'countryle',
        '/framed-answer-today': 'framed',
        '/globle-answer-today': 'globle',
        '/waffle-answer-today': 'waffle',
        '/worldle-answer-today': 'worldle',
        '/betweenle-answer-today': 'betweenle',
        '/nerdle-answer-today': 'nerdle',
        '/contexto-answer-today': 'contexto',
        '/searchle-answer-today': 'searchle',
        '/phrazle-answer-today': 'phrazle',
        '/spotle-answer-today': 'spotle',
        '/worgle-answer-today': 'worgle',
        '/colorfle-answer-today': 'colorfle',
        '/dotadle-answer-today-updated': 'dotadle',
        '/loldle-answer-today-updated': 'loldle',
        '/narutodle-answer-today-updated': 'narutodle',
        '/onepiecedle-answer-today-updated': 'onepiecedle',
        '/pokedle-answer-today-updated': 'pokedle',
        '/smashdle-answer-today-updated': 'smashdle'
};

export const ARCHIVE_ROUTE_GAME_MAP: Record<string, PuzzleGame> = {
        '/canuckle-archive': 'canuckle',
        '/wordle-answer-archive': 'wordle',
        '/quordle-archive': 'quordle',
        '/phoodle-archive': 'phoodle',
        '/semantle-archive': 'semantle',
        '/colordle-archive': 'colordle',
        '/colorfle-archive': 'colorfle',
        '/countryle-archive': 'countryle',
        '/framed-archive': 'framed',
        '/globle-archive': 'globle',
        '/waffle-archive': 'waffle',
        '/worldle-archive': 'worldle',
        '/nerdle-archive': 'nerdle',
        '/contexto-archive': 'contexto',
        '/searchle-archive': 'searchle',
        '/phrazle-archive': 'phrazle',
        '/spotle-archive': 'spotle',
        '/worgle-archive': 'worgle'
};

export const LONG_CACHE_STATIC_PATHS = new Set([
        '/about',
        '/archive',
        '/canuckle',
        '/canuckle-answer-today',
        '/canuckle-archive',
        '/canuckle-solver',
        '/contact',
        '/dmca-policy',
        '/disclaimer',
        '/guides',
        '/privacy-policy',
        '/solver',
        '/terms-of-service',
        '/wordle-solver',
        '/3-letter-wordle-solver',
        '/4-letter-wordle-solver',
        '/6-letter-wordle-solver',
        '/7-letter-wordle-solver',
        '/8-letter-wordle-solver',
        '/9-letter-wordle-solver',
        '/10-letter-wordle-solver',
        '/11-letter-wordle-solver',
        '/dordle-solver',
        '/octordle-solver',
        '/hardle-solver',
        '/warmle-solver',
        '/woodle-solver',
        '/w-peaks-solver',
        '/xordle-solver',
        '/fibble-solver',
        '/hangman-solver',
        '/light-out-solver',
        '/phoodle-solver',
        '/quordle-solver',
        '/squaredle-solver',
        '/waffle-solver',
        '/colordle-solver',
        '/searchle-solver',
        '/soundmap-solver',
        '/spotle-wordle-solver',
        '/spotle-solver',
        '/worgle-answer-today',
        '/worgle-archive',
        '/weaver-solver',
        '/worldle-solver',
        '/betweenle-solver',
        '/boggle-solver',
        '/kanoodle-solver',
        '/minesweeper-solver',
        '/nerdle-solver',
        '/word-ladder-solver',
        '/dotadle-solver',
        '/loldle-solver',
        '/narutodle-solver',
        '/onepiecedle-solver',
        '/smashdle-solver',
        '/pokedle-solver',
]);

function formatDateKeyFromUtcParts(year: number, month: number, day: number): string {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDateKeyFromFixedOffset(
        offsetMinutes: number,
        now: Date,
        rolloverGraceSeconds = DAILY_ROLLOVER_GRACE_SECONDS
): string {
        const localMs = now.getTime() + offsetMinutes * 60_000;
        const local = new Date(localMs);
        const currentBoundaryUtcMs =
                Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 0, 0, rolloverGraceSeconds, 0) -
                offsetMinutes * 60_000;

        if (now.getTime() >= currentBoundaryUtcMs) {
                return formatDateKeyFromUtcParts(
                        local.getUTCFullYear(),
                        local.getUTCMonth() + 1,
                        local.getUTCDate()
                );
        }

        const previous = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - 1));
        return formatDateKeyFromUtcParts(
                previous.getUTCFullYear(),
                previous.getUTCMonth() + 1,
                previous.getUTCDate()
        );
}

function getNextFixedOffsetInvalidation(
        offsetMinutes: number,
        now: Date,
        rolloverGraceSeconds = DAILY_ROLLOVER_GRACE_SECONDS
): Date {
        const localMs = now.getTime() + offsetMinutes * 60_000;
        const local = new Date(localMs);
        const currentBoundaryUtcMs =
                Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 0, 0, rolloverGraceSeconds, 0) -
                offsetMinutes * 60_000;

        if (now.getTime() < currentBoundaryUtcMs) {
                return new Date(currentBoundaryUtcMs);
        }

        const nextBoundaryUtcMs =
                Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1, 0, 0, rolloverGraceSeconds, 0) -
                offsetMinutes * 60_000;
        return new Date(nextBoundaryUtcMs);
}

function getWorkerLatestDates(
        config: PuzzleWindowConfig,
        now: Date,
        rolloverGraceSeconds = DAILY_ROLLOVER_GRACE_SECONDS
) {
        const visibleDateOffsetDays = config.visibleDateOffsetDays ?? 0;
        const hour = config.boundaryHourUtc ?? 0;
        const minute = config.boundaryMinuteUtc ?? 0;
        const currentBoundary = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                hour,
                minute,
                rolloverGraceSeconds,
                0
        );

        if (now.getTime() >= currentBoundary) {
                const currentVisibleDate = new Date(
                        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + visibleDateOffsetDays)
                );
                const previousVisibleDate = new Date(
                        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + visibleDateOffsetDays - 1)
                );
                return {
                        effectivePuzzleDate: formatDateKeyFromUtcParts(
                                currentVisibleDate.getUTCFullYear(),
                                currentVisibleDate.getUTCMonth() + 1,
                                currentVisibleDate.getUTCDate()
                        ),
                        fallbackPuzzleDate: formatDateKeyFromUtcParts(
                                previousVisibleDate.getUTCFullYear(),
                                previousVisibleDate.getUTCMonth() + 1,
                                previousVisibleDate.getUTCDate()
                        ),
                        nextInvalidationAt: new Date(
                                Date.UTC(
                                        now.getUTCFullYear(),
                                        now.getUTCMonth(),
                                        now.getUTCDate() + 1,
                                        hour,
                                        minute,
                                        rolloverGraceSeconds,
                                        0
                                )
                        )
                };
        }

        const previousVisibleDate = new Date(
                Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + visibleDateOffsetDays - 1)
        );
        const fallbackVisibleDate = new Date(
                Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + visibleDateOffsetDays - 2)
        );
        return {
                effectivePuzzleDate: formatDateKeyFromUtcParts(
                        previousVisibleDate.getUTCFullYear(),
                        previousVisibleDate.getUTCMonth() + 1,
                        previousVisibleDate.getUTCDate()
                ),
                fallbackPuzzleDate: formatDateKeyFromUtcParts(
                        fallbackVisibleDate.getUTCFullYear(),
                        fallbackVisibleDate.getUTCMonth() + 1,
                        fallbackVisibleDate.getUTCDate()
                ),
                nextInvalidationAt: new Date(currentBoundary)
        };
}

export function parsePuzzleDateKey(dateKey: string): Date {
        return new Date(`${dateKey}T12:00:00Z`);
}

export function formatPuzzleDateKey(date: Date): string {
        return formatDateKeyFromUtcParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function getPuzzleDateForGame(game: PuzzleGame, now: Date = new Date()): Date {
        return parsePuzzleDateKey(getPuzzleWindow(game, { now }).effectivePuzzleDate);
}

export function getPuzzleWindow(
        game: PuzzleGame,
        options: { now?: Date; payloadDate?: string | null } = {}
): PuzzleWindow {
        const config = PUZZLE_WINDOW_CONFIG[game];
        const now = options.now ?? new Date();
        const payloadDate = options.payloadDate ?? null;
        const rolloverGraceSeconds = config.rolloverGraceSeconds ?? DAILY_ROLLOVER_GRACE_SECONDS;

        if (config.timezone === 'worker-latest') {
                const latestDates = getWorkerLatestDates(config, now, rolloverGraceSeconds);
                const effectivePuzzleDate = payloadDate ?? latestDates.effectivePuzzleDate;
                const ttlSeconds = Math.max(
                        1,
                        Math.floor((latestDates.nextInvalidationAt.getTime() - now.getTime()) / 1000)
                );

                return {
                        group: config.group,
                        timezone: config.timezone,
                        effectivePuzzleDate,
                        nextInvalidationAt: latestDates.nextInvalidationAt,
                        ttlSeconds,
                        sourceReadiness: config.sourceReadiness,
                        fallbackPuzzleDate: latestDates.fallbackPuzzleDate
                };
        }

        const offsetMinutes = OFFSET_MINUTES[config.timezone];
        const effectivePuzzleDate = getDateKeyFromFixedOffset(offsetMinutes, now, rolloverGraceSeconds);
        const nextInvalidationAt = getNextFixedOffsetInvalidation(offsetMinutes, now, rolloverGraceSeconds);
        const ttlSeconds = Math.max(1, Math.floor((nextInvalidationAt.getTime() - now.getTime()) / 1000));

        return {
                group: config.group,
                timezone: config.timezone,
                effectivePuzzleDate,
                nextInvalidationAt,
                ttlSeconds,
                sourceReadiness: config.sourceReadiness
        };
}

export function isLongCacheStaticPath(pathname: string): boolean {
        if (LONG_CACHE_STATIC_PATHS.has(pathname)) {
                return true;
        }

        if (/^\/\d+-letter-wordle-solver$/.test(pathname)) {
                return true;
        }

        return false;
}
