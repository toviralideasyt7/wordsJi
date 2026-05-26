import { format } from 'date-fns';
import { getPuzzleDateForGame, getPuzzleWindow } from '$lib/puzzle-window';

const PHOODLE_API = 'https://phoodle-worker.pinpoints.workers.dev';
const PHOODLE_PAGE_SIZE = 20;
const PHOODLE_DATES_TTL_MS = 60 * 60 * 1000;

// Start date for Phoodle (earliest available data)
export const PHOODLE_START_DATE = new Date(2023, 1, 1); // Feb 1, 2023

export interface PhoodleDayData {
    id: string;
    word: string;
    description?: string;
    recipe_name?: string;
    formattedDate: string;
    date: Date;
}

let cachedPhoodleDates: { fetchedAt: number; dates: string[] } | null = null;
let pendingPhoodleDates: Promise<string[]> | null = null;

export interface PhoodleTodaySummary {
    visibleDate: string;
    current: PhoodleDayData | null;
    recent: PhoodleDayData[];
}

type PhoodleApiResponse = {
    success?: boolean;
    data?: unknown;
    visible_date?: string;
    current?: unknown;
    recent?: unknown;
};

async function fetchPhoodleJson(endpoint: string): Promise<any | null> {
    try {
        const res = await fetch(`${PHOODLE_API}/${endpoint}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

function mapPhoodleApiEntry(entry: any): PhoodleDayData | null {
    if (!entry?.id || !entry?.word) return null;

    const actualDate = parseApiDate(entry.id);

    return {
        id: entry.id,
        word: entry.word,
        description: entry.description,
        recipe_name: entry.recipe_name,
        formattedDate: format(actualDate, 'MMMM d, yyyy'),
        date: actualDate
    };
}

function getPhoodleVisibleDateKey(): string {
    return getPuzzleWindow('phoodle').effectivePuzzleDate;
}

async function getPhoodleDataForDateString(dateStr: string): Promise<PhoodleDayData | null> {
    const data = await fetchPhoodleJson(`show/date/${dateStr}`);
    if (!data?.success || !data.data) return null;
    return mapPhoodleApiEntry(data.data);
}

async function getPhoodleRelativeDay(endpoint: 'today' | 'yesterday'): Promise<PhoodleDayData | null> {
    const data = await fetchPhoodleJson(endpoint);
    if (!data?.success || !data.data) return null;
    return mapPhoodleApiEntry(data.data);
}

/**
 * Fetch Phoodle data for a specific date from the API.
 */
export async function getPhoodleDataForDate(date: Date): Promise<PhoodleDayData | null> {
    return getPhoodleDataForDateString(format(date, 'yyyy-MM-dd'));
}

export async function getAllPhoodleDates(): Promise<string[]> {
    if (cachedPhoodleDates && Date.now() - cachedPhoodleDates.fetchedAt < PHOODLE_DATES_TTL_MS) {
        return cachedPhoodleDates.dates;
    }

    if (pendingPhoodleDates) {
        return pendingPhoodleDates;
    }

    pendingPhoodleDates = (async (): Promise<string[]> => {
        const data = await fetchPhoodleJson('list/all') as PhoodleApiResponse | null;
        const dates =
            data?.success && Array.isArray(data.data)
                ? data.data.filter((dateStr): dateStr is string => typeof dateStr === 'string')
                : [];
        const visibleDate = getPhoodleVisibleDateKey();
        const uniqueDates = Array.from(new Set(dates))
            .filter((dateStr) => dateStr <= visibleDate)
            .sort((a, b) => b.localeCompare(a));
        cachedPhoodleDates = { fetchedAt: Date.now(), dates: uniqueDates };
        pendingPhoodleDates = null;
        return uniqueDates;
    })().catch((error) => {
        pendingPhoodleDates = null;
        throw error;
    });

    return pendingPhoodleDates;
}

export async function getNearestPhoodleDate(
    targetDate: Date,
    direction: 'on-or-before' | 'before' | 'on-or-after' | 'after' = 'on-or-before'
): Promise<Date | null> {
    const targetKey = format(targetDate, 'yyyy-MM-dd');
    const dates = await getAllPhoodleDates();

    if (direction === 'on-or-before') {
        const match = dates.find((dateStr) => dateStr <= targetKey);
        return match ? parseApiDate(match) : null;
    }

    if (direction === 'before') {
        const match = dates.find((dateStr) => dateStr < targetKey);
        return match ? parseApiDate(match) : null;
    }

    const ascending = [...dates].reverse();

    if (direction === 'on-or-after') {
        const match = ascending.find((dateStr) => dateStr >= targetKey);
        return match ? parseApiDate(match) : null;
    }

    const match = ascending.find((dateStr) => dateStr > targetKey);
    return match ? parseApiDate(match) : null;
}

export async function getPhoodleAdjacentDates(currentDate: Date): Promise<{ previous: Date | null; next: Date | null }> {
    const targetKey = format(currentDate, 'yyyy-MM-dd');
    const dates = await getAllPhoodleDates();
    const index = dates.findIndex((dateStr) => dateStr === targetKey);

    if (index === -1) {
        return { previous: null, next: null };
    }

    return {
        previous: dates[index + 1] ? parseApiDate(dates[index + 1]) : null,
        next: dates[index - 1] ? parseApiDate(dates[index - 1]) : null
    };
}

export async function getRecentPhoodleHistory(beforeDate: Date, count: number): Promise<PhoodleDayData[]> {
    const targetKey = format(beforeDate, 'yyyy-MM-dd');
    const dates = await getAllPhoodleDates();
    const priorDates = dates.filter((dateStr) => dateStr < targetKey).slice(0, count);
    const results = await Promise.all(priorDates.map((dateStr) => getPhoodleDataForDateString(dateStr)));
    return results.filter((result): result is PhoodleDayData => result !== null);
}

export async function getPhoodleTodaySummary(historyCount = 10): Promise<PhoodleTodaySummary> {
    const safeHistoryCount = Math.max(0, Math.min(20, historyCount));
    const data = await fetchPhoodleJson(`summary/today?history=${safeHistoryCount}`) as PhoodleApiResponse | null;
    const visibleDate = data?.visible_date ?? getPhoodleVisibleDateKey();
    const current = mapPhoodleApiEntry(data?.current);
    const recent = Array.isArray(data?.recent)
        ? data.recent
            .map((entry: unknown) => mapPhoodleApiEntry(entry))
            .filter((entry): entry is PhoodleDayData => entry !== null)
        : [];

    if (current) {
        return {
            visibleDate,
            current,
            recent
        };
    }

    const fallbackCurrent = await getPhoodleToday();
    return {
        visibleDate,
        current: fallbackCurrent,
        recent: fallbackCurrent ? await getRecentPhoodleHistory(fallbackCurrent.date, safeHistoryCount) : []
    };
}

/**
 * Get today's Phoodle data in JST
 */
export async function getPhoodleToday(): Promise<PhoodleDayData | null> {
    const workerToday = await getPhoodleRelativeDay('today');
    if (workerToday) return workerToday;

    const closestDate = await getNearestPhoodleDate(getPuzzleDateForGame('phoodle'), 'on-or-before');
    if (!closestDate) return null;
    return getPhoodleDataForDate(closestDate);
}

/**
 * Get yesterday's Phoodle data in JST
 */
export async function getPhoodleYesterday(): Promise<PhoodleDayData | null> {
    const workerYesterday = await getPhoodleRelativeDay('yesterday');
    if (workerYesterday) return workerYesterday;

    const previousDate = await getNearestPhoodleDate(getPuzzleDateForGame('phoodle'), 'before');
    if (!previousDate) return null;
    return getPhoodleDataForDate(previousDate);
}

/**
 * Fetch paginated list of available dates from the API.
 */
export async function getPhoodleDatesPage(page: number): Promise<string[]> {
    const data = await fetchPhoodleJson(`list/page/${page}`);
    return data?.success && Array.isArray(data.data) ? data.data : [];
}

/**
 * Parse a slug-formatted date string like "january-07-2026" into a Date object.
 */
export function parsePhoodleSlugDate(slug: string): Date | null {
    try {
        const parts = slug.split('-');
        if (parts.length !== 3) return null;

        const monthStr = parts[0];
        const dayStr = parts[1];
        const yearStr = parts[2];

        const dateStr = `${monthStr} ${dayStr}, ${yearStr}`;
        const date = new Date(dateStr);

        if (isNaN(date.getTime())) return null;

        return date;
    } catch {
        return null;
    }
}

/**
 * Format a Date object into a slug-friendly string like "january-07-2026".
 */
export function formatPhoodleDateForSlug(date: Date): string {
    return format(date, 'MMMM-dd-yyyy').toLowerCase();
}

/**
 * Convert YYYY-MM-DD string to Date object.
 */
export function parseApiDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00Z');
}

