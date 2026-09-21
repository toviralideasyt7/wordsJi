import { startOfDay, format, subDays, addDays } from 'date-fns';
import { getPuzzleDateForGame, parsePuzzleDateKey, type PuzzleWindow } from '$lib/puzzle-window';
import countries from '$lib/data/globle-countries.json';

import CryptoJS from 'crypto-js';
const KEY = "ee53e68c3074206a002bf01333b047d5";

export interface GlobleDayData {
    date: Date;
    country: {
        name: string;
        code: string;
        latitude: number;
        longitude: number;
        index: number;
        continent: string;
        subregion: string;
    };
    formattedDate: string;
}

// Decrypt the answer index from the API
function decryptAnswer(encrypted: string, key: string): number | null {
    try {
        const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
        return parseInt(decrypted, 10);
    } catch (e) {
        return null;
    }
}

// Fetch answer from the Globle API
export async function getGlobleDataForDate(date: Date): Promise<GlobleDayData | null> {
    try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const listLen = countries.length;
        const url = `https://globle-game.com/answer?day=${dateStr}&list=${listLen}`;

        const response = await fetch(url, {

        });

        if (!response.ok) {
            return null;
        }

        const data: { answer?: string } = await response.json();

        if (!data.answer) {
            return null;
        }

        const index = decryptAnswer(data.answer, KEY);

        if (index === null || isNaN(index) || index < 0 || index >= countries.length) {
            return null;
        }

        const country = countries[index];

        return {
            date,
            country: {
                name: country.name,
                code: country.code,
                latitude: country.latitude,
                longitude: country.longitude,
                index: country.index,
                continent: country.continent || 'Unknown',
                subregion: country.subregion || 'Unknown'
            },
            formattedDate: format(date, 'MMMM d, yyyy')
        };
    } catch (e) {
        console.error('Error fetching Globle data:', e);
        return null;
    }
}

export async function getGlobleToday(): Promise<GlobleDayData | null> {
    return getGlobleDataForDate(getPuzzleDateForGame('globle'));
}

export async function getGlobleYesterday(): Promise<GlobleDayData | null> {
    return getGlobleDataForDate(subDays(getPuzzleDateForGame('globle'), 1));
}

export interface PublishableGlobleData {
    data: GlobleDayData;
    publishedDateKey: string;
}

/**
 * Resolve the Globle payload a "-answer-today" page is allowed to publish, or null.
 *
 * Globle's upstream serves exactly one day and 404s for every other date, so "fetch the window
 * date" is the only honest request this page can make. An older version walked backwards up to
 * seven days with subDays() and returned the first date that answered, which is how yesterday's
 * country ended up in the <title>, the <h1> and the Article JSON-LD while the page still called
 * itself "today".
 *
 * The only two dates that may be published are the ones the window itself declares:
 *   - effectivePuzzleDate: what "today" means for the site right now, and
 *   - fallbackPuzzleDate: the previous date the window keeps for the rollover gap, for the
 *     stretch where the site's date has advanced but upstream has not published the new day.
 *
 * Nothing older is accepted. When neither date answers, callers redirect to /globle-archive
 * rather than labelling an older answer as today's.
 */
export async function resolveGlobleDataForWindow(
    puzzleWindow: PuzzleWindow
): Promise<PublishableGlobleData | null> {
    const candidates = [puzzleWindow.effectivePuzzleDate, puzzleWindow.fallbackPuzzleDate].filter(
        (dateKey): dateKey is string => typeof dateKey === 'string' && dateKey.length > 0
    );

    for (const dateKey of [...new Set(candidates)]) {
        const data = await getGlobleDataForDate(parsePuzzleDateKey(dateKey));

        if (!data) {
            continue;
        }

        // getGlobleDataForDate() formats the day in the runtime's local timezone, so confirm the
        // payload really is for the candidate date before it reaches the title and the schema.
        if (format(data.date, 'yyyy-MM-dd') !== dateKey) {
            continue;
        }

        if (dateKey !== puzzleWindow.effectivePuzzleDate) {
            console.warn(
                `[globle-date] No upstream data for ${puzzleWindow.effectivePuzzleDate} yet; ` +
                    `publishing the declared fallback date ${dateKey}.`
            );
        }

        return { data, publishedDateKey: dateKey };
    }

    return null;
}

// Helper to parse the verbose url format: "january-27-2026"
export const parseGlobleSlugDate = (slug: string): Date | null => {
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
    } catch (e) {
        return null;
    }
};

export const formatGlobleDateForSlug = (date: Date): string => {
    return format(date, 'MMMM-dd-yyyy').toLowerCase();
};
