import { getTodaySemantleData, getSemantleDataForDate } from '$lib/semantle';
import { composeMetaDescription } from '$lib/seo';
import { format, subDays } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { fetchDatamuseClues } from '$lib/datamuse';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    const today = getPuzzleDateForGame('semantle');
    const dateKey = format(today, 'yyyy-MM-dd');
    const data = getTodaySemantleData();

    if (!data) {
        return { error: true };
    }

    const { word, puzzleNumber, formattedDate } = data;
    const clues = await fetchDatamuseClues(word, fetch);

    const last10Days = Array.from({ length: 10 }, (_, i) => {
        const date = subDays(today, i + 1);
        return getSemantleDataForDate(date);
    }).filter(Boolean);
    const pageTitle = `Semantle Answer Today (${formattedDate}) - Answer and Hint`;
    // The secret word is the only part of this sentence whose length varies, so the closing
    // is chosen from the measured head to stay inside the 140-158 description budget.
    const pageDescription = composeMetaDescription(
        `Semantle answer for ${formattedDate}: ${word} (puzzle #${puzzleNumber})`,
        {
            full: 'The page shows the letter hints, the similarity clues, and the past answers for the puzzle.',
            trimmed: 'The page shows the letter hints and the similar guesses, with the recent answers.'
        }
    );
    const pageKeywords = `semantle answer today, semantle answer, semantle hint, semantle hint today, semantle answer for ${formattedDate}`;

    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Article', headline: pageTitle, description: pageDescription, datePublished: new Date(formattedDate).toISOString(), author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' } }] });

    return { word, puzzleNumber, formattedDate, dateKey, last10Days, clues, schemas: jsonLd, meta: { title: pageTitle, description: pageDescription, keywords: pageKeywords } };
};

