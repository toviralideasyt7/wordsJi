import type { PageServerLoad } from './$types';
import { loadGameDleToday, type GameDleAnswer } from '$lib/game-dle/today';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints, type AIHints } from '$lib/ai-hints';
import { format, subDays } from 'date-fns';

interface ParsedChampion {
    name: string | null;
    yesterday: string | null;
}

function parseChampion(jsonContent: string | undefined): ParsedChampion {
    try {
        const parsed = JSON.parse(jsonContent ?? '') as { champion_name?: unknown; yesterday?: unknown };
        return {
            name: typeof parsed.champion_name === 'string' && parsed.champion_name ? parsed.champion_name : null,
            yesterday: typeof parsed.yesterday === 'string' && parsed.yesterday ? parsed.yesterday : null
        };
    } catch {
        return { name: null, yesterday: null };
    }
}

function classicAnswer(answers: GameDleAnswer[]): GameDleAnswer | undefined {
    return answers.find((a) => a.mode === 'classic' && a.region === 'america') ?? answers[0];
}

function factFields(name: string, puzzleNumber: string, dateLong: string) {
    const chars = name.toLowerCase().replace(/[^a-z]/g, '');
    const vowelCount = [...chars].filter((c) => 'aeiou'.includes(c)).length;
    const repeats = chars.length - new Set(chars).size;
    return {
        puzzleNumber,
        dateLong,
        firstLetter: chars[0]?.toUpperCase() ?? '',
        lastLetter: chars[chars.length - 1]?.toUpperCase() ?? '',
        vowelCount,
        repeatText: repeats > 0 ? 'Yes' : 'No'
    };
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
    const result = await loadGameDleToday({
        fetchFn: fetch,
        setHeaders,
        game: 'onepiecedle',
        gameTitle: 'OnePiecedle'
    });

    const entry = classicAnswer(result.answers);
    const gameId = entry?.game_id;
    // dateStr is "Weekday, Month d, yyyy" — strip the weekday for the long date.
    const longDate = result.dateStr ? result.dateStr.replace(/^[^,]+,\s*/, '') : '';
    const todayKey = result.latestDate ?? '';
    const champion = parseChampion(entry?.json_content);

    const hasPuzzle = gameId != null && longDate !== '';
    // Bing ranking components (2026-10-06): title built from the shared daily
    // title pattern, keyed on the puzzle-window date (longDate) so a "today"
    // page can never carry tomorrow's date or answer here.
    const pageTitle = hasPuzzle
        ? dailyAnswerTitle('OnePiecedle', gameId, longDate)
        : 'OnePiecedle Hints and Answers for Today';
    const updatedStamp = hasPuzzle ? updatedStampText('OnePiecedle', gameId, longDate) : '';
    const aiHints: AIHints | null = champion.name ? mergeHints(champion.name, getAIHints('onepiecedle', todayKey)) : null;

    // Yesterday's name ships inside the worker's json_content; number/dateLong
    // are derived from the daily sequence (game_id - 1, latestDate - 1 day).
    let yesterday: { number: number; dateLong: string; answer: string } | null = null;
    if (champion.yesterday && gameId != null && result.latestDate) {
        yesterday = {
            number: gameId - 1,
            dateLong: format(subDays(new Date(`${result.latestDate}T00:00:00Z`), 1), 'MMMM d, yyyy'),
            answer: champion.yesterday
        };
    }

    const factData = champion.name && hasPuzzle
        ? factFields(champion.name, String(gameId), longDate)
        : undefined;

    return {
        ...result,
        meta: { title: pageTitle },
        updatedStamp,
        aiHints,
        aiAnswer: champion.name ?? '',
        yesterday,
        factData
    };
};
