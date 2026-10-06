import { getTodaySemantleData, getSemantleDataForDate } from '$lib/semantle';
import { composeMetaDescription } from '$lib/seo';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
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
    const pageTitle = dailyAnswerTitle('Semantle', puzzleNumber, formattedDate);
    const updatedStamp = updatedStampText('Semantle', puzzleNumber, formattedDate);
    const aiHints = mergeHints(word, getAIHints('semantle', dateKey));

    const yesterdayEntry = last10Days[0] ?? null;
    const yesterday = yesterdayEntry
        ? { number: yesterdayEntry.puzzleNumber, dateLong: yesterdayEntry.formattedDate, answer: yesterdayEntry.word }
        : null;

    const factVowelCount = word.toLowerCase().split('').filter((c: string) => 'aeiou'.includes(c)).length;
    const factRepeatCount = word.length - new Set(word.toLowerCase()).size;
    const factData = {
        puzzleNumber: String(puzzleNumber),
        dateLong: formattedDate,
        firstLetter: word[0]?.toUpperCase() ?? '',
        lastLetter: word[word.length - 1]?.toUpperCase() ?? '',
        vowelCount: factVowelCount,
        repeatText: factRepeatCount === 0 ? 'None' : String(factRepeatCount)
    };
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

    const hintFaqs = [
        { question: 'When was this page last updated?', answer: updatedStamp }
    ];

    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Article', headline: pageTitle, description: pageDescription, datePublished: new Date(formattedDate).toISOString(), author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' } }, { '@type': 'FAQPage', mainEntity: hintFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }] });

    return { word, puzzleNumber, formattedDate, dateKey, last10Days, clues, updatedStamp, aiHints, hintFaqs, yesterday, factData, schemas: jsonLd, meta: { title: pageTitle, description: pageDescription, keywords: pageKeywords } };
};

