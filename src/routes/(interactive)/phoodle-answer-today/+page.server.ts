import { getPhoodleTodaySummary } from '$lib/phoodle';
import { composeMetaDescription } from '$lib/seo';
import { getPuzzleWindow, parsePuzzleDateKey } from '$lib/puzzle-window';
import { format } from 'date-fns';
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
    const pageTitle = `Phoodle Answer Today (${formattedDate}) - Food and Hints`;
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
        schemas: null,
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
        },
    };
};
