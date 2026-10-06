import { getPhoodleTodaySummary, PHOODLE_START_DATE } from '$lib/phoodle';
import { composeMetaDescription } from '$lib/seo';
import { getPuzzleWindow, parsePuzzleDateKey } from '$lib/puzzle-window';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import { format, differenceInCalendarDays } from 'date-fns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
    const summary = await getPhoodleTodaySummary(10);
    const data = summary.current;

    if (!data) {
        return {
            error: true,
            formattedDate: format(parsePuzzleDateKey(getPuzzleWindow('phoodle').effectivePuzzleDate), 'MMMM d, yyyy')
        };
    }

    const { word, description, recipe_name, formattedDate } = data;
    const upperWord = word.toUpperCase();

    setHeaders({
        'X-Puzzle-Date': data.date.toISOString().split('T')[0]
    });

    const last10Days = summary.recent;
    // Phoodle has no official puzzle number; derive a stable day-count from the
    // site's own data start (same methodology as Quordle's dN epoch math).
    const phoodleNumber = differenceInCalendarDays(data.date, PHOODLE_START_DATE) + 1;
    // Bing ranking components (2026-10-06): title built from the shared daily
    // title pattern, keyed on the puzzle-window date (formattedDate) so a
    // "today" page can never carry tomorrow's date or answer here.
    const pageTitle = dailyAnswerTitle('Phoodle', phoodleNumber, formattedDate);
    const updatedStamp = updatedStampText('Phoodle', phoodleNumber, formattedDate);
    const aiHints = mergeHints(word, getAIHints('phoodle', data.date.toISOString().split('T')[0]));
    // No FAQ array existed on this page — create hintFaqs with the updated entry.
    const hintFaqs = [{ question: 'When was this page last updated?', answer: updatedStamp }];

    // Yesterday's entry is the head of the recent-answers feed.
    const yesterdayEntry = last10Days[0] ?? null;
    const yesterday = yesterdayEntry
        ? {
            number: phoodleNumber - 1,
            dateLong: yesterdayEntry.formattedDate,
            answer: yesterdayEntry.word.toUpperCase()
        }
        : null;

    const vowelCount = word.toLowerCase().split('').filter((c: string) => 'aeiou'.includes(c)).length;
    const hasDouble = word.toLowerCase().split('').some((c: string, i: number, a: string[]) => a.indexOf(c) !== a.lastIndexOf(c));
    const startLetter = word[0]?.toUpperCase() || '';
    const endLetter = word[word.length - 1]?.toUpperCase() || '';
    // The food word is the only part of this sentence whose length varies, so the closing
    // is chosen from the measured head to stay inside the 140-158 description budget.
    const pageDescription = composeMetaDescription(
        `Today's Phoodle answer for ${formattedDate} is ${upperWord}`,
        {
            full: 'The page also covers the letter hints, the recent food words, and the recipe context for each answer.',
            trimmed: 'The page also covers the letter hints, the recent food words, and the recipe context.'
        }
    );
    const pageKeywords = `phoodle answer today, phoodle answer, phoodle hint, phoodle hint today, phoodle answer for ${formattedDate}`;

    return {
        word,
        upperWord,
        description,
        recipe_name,
        formattedDate,
        dateKey: data.date.toISOString().split('T')[0],
        last10Days,
        phoodleNumber,
        updatedStamp,
        aiHints,
        hintFaqs,
        yesterday,
        vowelCount,
        hasDouble,
        startLetter,
        endLetter,
        schemas: null,
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
        },
    };
};
