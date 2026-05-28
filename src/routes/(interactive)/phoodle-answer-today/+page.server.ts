import { getPhoodleTodaySummary } from '$lib/phoodle';
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
    const pageTitle = `Phoodle Answer Today (${formattedDate}) - Food Word and Hints`;
    const pageDescription = `Get Phoodle hints and the confirmed Phoodle answer for today, ${formattedDate}. Today's food word is ${upperWord}, with recent answers and recipe context.`;
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
