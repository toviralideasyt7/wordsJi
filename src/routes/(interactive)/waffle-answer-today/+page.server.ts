import { getWaffleDataForDate } from '$lib/waffle';
import { subDays, addDays, startOfDay, isBefore } from 'date-fns';
import { format } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
    const today = getPuzzleDateForGame('waffle');
    const data = await getWaffleDataForDate(today);

    if (!data) {
        const formattedDate = format(today, 'MMMM d, yyyy');
        return {
            error: true,
            formattedDate,
            meta: {
                title: `Waffle Answer Today (${formattedDate}) - Grid Solution and Hints`,
                description: `Get Waffle hints and the confirmed Waffle answer for today, ${formattedDate}.`,
                keywords: `waffle answer today, waffle answer, waffle hint, waffle hint today, waffle answer for ${formattedDate}`
            },
            schemas: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: `Waffle Hints and Answer for Today (${formattedDate})`,
                description: `Get Waffle hints and the confirmed Waffle answer for today, ${formattedDate}.`,
                url: 'https://wordsolverx.com/waffle-answer-today',
                image: 'https://wordsolverx.com/wordsolverx.webp',
                dateModified: today.toISOString().split('T')[0]
            })
        };
    }

    const { formattedDate, puzzle, solution, words, definitions, number } = data;
    setHeaders({
        'X-Puzzle-Date': data.date.toISOString().split('T')[0]
    });
    const prevDate = subDays(data.date, 1);
    const nextDate = addDays(data.date, 1);

    const formatArchiveHref = (d: Date) => `/waffle-archive?date=${d.toISOString().split('T')[0]}`;
    const prevSlug = formatArchiveHref(prevDate);
    const nextSlug = formatArchiveHref(nextDate);
    const showNext = isBefore(startOfDay(nextDate), addDays(startOfDay(today), 1));

    const pageTitle = dailyAnswerTitle('Waffle', number, formattedDate);
    const updatedStamp = updatedStampText('Waffle', number, formattedDate);
    const answerString = words.join(', ');
    const dateKey = data.date.toISOString().split('T')[0];
    const aiHints = mergeHints(answerString, getAIHints('waffle', dateKey));
    const hintFaqs = [
        { question: 'When was this page last updated?', answer: updatedStamp }
    ];
    const factLetters = answerString.toLowerCase().replace(/[^a-z]/g, '');
    const factRepeatCount = factLetters.length - new Set(factLetters).size;
    const factData = {
        puzzleNumber: String(number),
        dateLong: formattedDate,
        firstLetter: factLetters[0]?.toUpperCase() ?? '',
        lastLetter: factLetters[factLetters.length - 1]?.toUpperCase() ?? '',
        vowelCount: [...factLetters].filter((c: string) => 'aeiou'.includes(c)).length,
        repeatText: factRepeatCount === 0 ? 'None' : String(factRepeatCount)
    };
    const pageDescription = `Get the confirmed Waffle answer for ${formattedDate}, with hints, the fully solved grid, today's word list, and links to the older puzzle archive.`;
    const pageKeywords = `waffle answer today, waffle answer, waffle hint, waffle hint today, waffle answer for ${formattedDate}`;
    const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Article', headline: pageTitle, description: pageDescription, datePublished: new Date(today).toISOString(), author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' } }, { '@type': 'FAQPage', mainEntity: hintFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }] });

    return {
        error: false,
        formattedDate, puzzle, solution, words, definitions, number,
        prevSlug, nextSlug, showNext, date: data.date,
        dateKey,
        updatedStamp, aiHints, hintFaqs, factData,
        schemas: jsonLd,
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
        },
    };
};

