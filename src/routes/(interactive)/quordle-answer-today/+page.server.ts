import { getQuordleToday, getQuordleDataForDate } from '$lib/quordle';
import { generateBreadcrumbSchema, generatePersonAuthorSchema } from '$lib/seo';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import { format, subDays } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const today = getPuzzleDateForGame('quordle');
    const formattedDate = format(today, 'MMMM d, yyyy');
    const dateKey = format(today, 'yyyy-MM-dd');
    const todayData = getQuordleToday();
    const quordleData = getQuordleDataForDate(today);
    const todayWords = todayData ? todayData.d.join(', ').replace(/, ([^,]*)$/, ', and $1') : '';

    const last10Days = Array.from({ length: 10 }, (_, i) => {
        const date = subDays(today, i + 1);
        return getQuordleDataForDate(date);
    }).filter(Boolean);
    // Bing ranking components (2026-10-06): title built from the shared daily
    // title pattern, keyed on the puzzle-window date (formattedDate) so a
    // "today" page can never carry tomorrow's date or answer here. The answer
    // stays out of the title and meta description (snippet tease, not reveal).
    const quordleNumber = todayData?.dN ?? 0;
    const pageTitle = dailyAnswerTitle('Quordle', quordleNumber, formattedDate);
    const updatedStamp = updatedStampText('Quordle', quordleNumber, formattedDate);
    const aiHints = mergeHints(todayWords, getAIHints('quordle', dateKey));
    // No FAQ array existed on this page — create hintFaqs with the updated entry.
    const hintFaqs = [{ question: 'When was this page last updated?', answer: updatedStamp }];

    // Yesterday's entry is the head of the recent-answers feed.
    const yesterdayData = last10Days[0] ?? null;
    const yesterday = yesterdayData
        ? {
            number: yesterdayData.dN,
            dateLong: yesterdayData.formattedDate,
            answer: yesterdayData.d.join(', ').replace(/, ([^,]*)$/, ', and $1')
        }
        : null;

    // FactBlock values across the four daily words.
    const quordleLetters = (todayData?.d ?? []).join('').toLowerCase();
    const quordleVowelCount = quordleLetters.split('').filter((c) => 'aeiou'.includes(c)).length;
    const quordleHasDouble = quordleLetters.split('').some((c, i, a) => a.indexOf(c) !== a.lastIndexOf(c));
    const quordleStartLetter = todayData?.d[0]?.[0]?.toUpperCase() ?? '';
    const quordleEndLetter = todayData?.d[todayData.d.length - 1]?.slice(-1)?.toUpperCase() ?? '';
    const pageDescription = `Get today's Quordle answers for ${formattedDate}, covering the Classic, Chill, Extreme, Sequence, Rescue, and Weekly modes, all solved on one page.`;
    const pageKeywords = `quordle answer today, quordle answer, quordle hint, quordle hint today, quordle answer for ${formattedDate}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                headline: pageTitle,
                datePublished: new Date(today).toISOString(),
                dateModified: new Date(today).toISOString(),
                author: generatePersonAuthorSchema('Preston Hayes', 'https://wordsolverx.com/about#preston-hayes', 'https://wordsolverx.com/author-wordsolverx.webp'),
                publisher: { '@type': 'Organization', name: 'WordSolverX' },
                description: pageDescription,
                mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/quordle-answer-today' },
            },
            generateBreadcrumbSchema([
                { name: 'Home', url: 'https://wordsolverx.com' },
                { name: 'Today', url: 'https://wordsolverx.com/today' },
                { name: 'Quordle Answer Today', url: 'https://wordsolverx.com/quordle-answer-today' },
            ]),
            {
                '@type': 'FAQPage',
                mainEntity: hintFaqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: { '@type': 'Answer', text: faq.answer }
                }))
            },
        ],
    };

    return {
        today,
        formattedDate,
        dateKey,
        todayData,
        quordleData,
        todayWords,
        last10Days,
        quordleNumber,
        updatedStamp,
        aiHints,
        hintFaqs,
        yesterday,
        quordleVowelCount,
        quordleHasDouble,
        quordleStartLetter,
        quordleEndLetter,
        publishedDate: `${dateKey}T00:00:00Z`,
        schemas: JSON.stringify(jsonLd),
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
        },
    };
};

