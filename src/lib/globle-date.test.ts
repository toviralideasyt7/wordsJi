import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPuzzleWindow } from './puzzle-window';
import { resolveGlobleDataForWindow } from './globle-date';

/**
 * Globle is the only game whose upstream serves a single day and 404s for every other date
 * (`https://globle-game.com/answer?day=YYYY-MM-DD`), so these tests pin two things:
 *
 *   1. the window boundary, so the page's idea of "today" matches the day upstream is serving;
 *   2. the publish guard, so a page can never label itself "today" with a country that is older
 *      than the window's effective date or the fallback date the window declares for that gap.
 *
 * Every case uses a mocked `now` and a mocked upstream, so it is deterministic and never
 * touches the network.
 */

/** Real payload returned by `day=2026-09-21`: AES-encrypted country index, decrypts to 61. */
const UPSTREAM_ANSWER = 'U2FsdGVkX1+ZPs/G//v03+Jpcz7J83sGCVx+4+quq/0=';

const HOUR = 60 * 60 * 1000;

function at(iso: string): Date {
    return new Date(iso);
}

/** Upstream that answers 200 only for the listed days and 404 for everything else. */
function mockUpstream(servedDays: string[]) {
    const requestedDays: string[] = [];

    vi.stubGlobal('fetch', async (input: unknown) => {
        const url = String(input);
        const day = new URL(url).searchParams.get('day') ?? '';
        requestedDays.push(day);

        if (!servedDays.includes(day)) {
            return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
        }

        return {
            ok: true,
            status: 200,
            json: async () => ({ message: 'Mystery country retrieved.', answer: UPSTREAM_ANSWER })
        } as unknown as Response;
    });

    return requestedDays;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('globle puzzle window boundary', () => {
    // 2026-09-21 is during US Eastern daylight time, so upstream swaps days at ~04:00 UTC;
    // the observed swap sat between 03:30 and 06:30 UTC. The boundary is 06:00 UTC.
    const cases: Array<{ now: string; effective: string; fallback: string }> = [
        { now: '2026-09-21T03:00:00Z', effective: '2026-09-20', fallback: '2026-09-19' },
        { now: '2026-09-21T05:00:00Z', effective: '2026-09-20', fallback: '2026-09-19' },
        { now: '2026-09-21T05:59:59Z', effective: '2026-09-20', fallback: '2026-09-19' },
        { now: '2026-09-21T06:00:30Z', effective: '2026-09-21', fallback: '2026-09-20' },
        { now: '2026-09-21T12:00:00Z', effective: '2026-09-21', fallback: '2026-09-20' },
        { now: '2026-09-21T23:00:00Z', effective: '2026-09-21', fallback: '2026-09-20' },
        { now: '2026-09-22T03:00:00Z', effective: '2026-09-21', fallback: '2026-09-20' },
        { now: '2026-09-22T12:00:00Z', effective: '2026-09-22', fallback: '2026-09-21' }
    ];

    it.each(cases)('resolves $now to $effective (fallback $fallback)', ({ now, effective, fallback }) => {
        const window = getPuzzleWindow('globle', { now: at(now) });

        expect(window.effectivePuzzleDate).toBe(effective);
        expect(window.fallbackPuzzleDate).toBe(fallback);
    });

    it('never advances the visible date before 06:00 UTC even though the old config did', () => {
        // The bug: with boundaryHourUtc 16:30 and visibleDateOffsetDays 1 this instant resolved
        // to 2026-09-21, a day upstream did not serve yet, and the page published 2026-09-20
        // under a "September 21" title.
        const window = getPuzzleWindow('globle', { now: at('2026-09-20T17:00:00Z') });

        expect(window.effectivePuzzleDate).toBe('2026-09-20');
    });
});

describe('globle publish guard', () => {
    it('publishes the window date when upstream serves it', async () => {
        const window = getPuzzleWindow('globle', { now: at('2026-09-21T12:00:00Z') });
        const requested = mockUpstream(['2026-09-21']);

        const resolved = await resolveGlobleDataForWindow(window);

        expect(resolved?.publishedDateKey).toBe('2026-09-21');
        expect(requested).toEqual(['2026-09-21']);
    });

    it('falls back to the declared fallback date, never older', async () => {
        const window = getPuzzleWindow('globle', { now: at('2026-09-21T05:00:00Z') });
        // Upstream has not published the window date yet.
        mockUpstream(['2026-09-19']);

        const resolved = await resolveGlobleDataForWindow(window);

        expect(window.effectivePuzzleDate).toBe('2026-09-20');
        expect(resolved?.publishedDateKey).toBe('2026-09-19');
    });

    it('returns null when upstream only has a date older than the fallback', async () => {
        const window = getPuzzleWindow('globle', { now: at('2026-09-21T12:00:00Z') });
        // 2026-09-18 is what the removed seven-day walk-back would have published.
        const requested = mockUpstream(['2026-09-18']);

        const resolved = await resolveGlobleDataForWindow(window);

        expect(resolved).toBeNull();
        expect(requested).toEqual(['2026-09-21', '2026-09-20']);
    });

    it('never publishes a date older than the declared fallback, at any hour', async () => {
        const start = at('2026-09-20T00:00:00Z').getTime();
        const upstreamDays = [
            '2026-09-18',
            '2026-09-19',
            '2026-09-20',
            '2026-09-21',
            '2026-09-22',
            '2026-09-23'
        ];

        for (let offset = 0; offset < 72; offset += 1) {
            const now = new Date(start + offset * HOUR);
            const window = getPuzzleWindow('globle', { now });
            const floor = window.fallbackPuzzleDate ?? window.effectivePuzzleDate;

            for (const servedDay of upstreamDays) {
                mockUpstream([servedDay]);
                const resolved = await resolveGlobleDataForWindow(window);

                if (resolved) {
                    expect([window.effectivePuzzleDate, window.fallbackPuzzleDate]).toContain(
                        resolved.publishedDateKey
                    );
                    expect(resolved.publishedDateKey >= floor).toBe(true);
                }
            }
        }
    });
});
