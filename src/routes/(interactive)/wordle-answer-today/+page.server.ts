import { format } from 'date-fns';
import { getWordleNumber, formatDate } from '$lib/utils';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { WordleAnswer } from '$lib/api';
import { generatePersonAuthorSchema } from '$lib/seo';
import type { PageServerLoad } from './$types';

interface TodayApiResponse extends WordleAnswer {
    today_jst?: string;
    recent_answers?: WordleAnswer[];
    social_image_direct?: string;
}

const SITE_URL = 'https://wordsolverx.com';
const STATIC_WORDLE_TODAY_IMAGE_PATH = '/Wordle-Answer-today.webp';

export const load: PageServerLoad = async ({ setHeaders }) => {
    const today = getPuzzleDateForGame('wordle');
    const todayKey = format(today, 'yyyy-MM-dd');
    const fallbackNumber = getWordleNumber(today);
    const fallbackDate = formatDate(today);

    let wordleData: TodayApiResponse | null = null;
    try {
        wordleData = await getWordleDataWithFallback(todayKey, fallbackNumber);
    } catch (error) {
        console.error("Error fetching today's Wordle:", error);
    }

    const recentAnswers = wordleData?.recent_answers || [];
    // This page is prerendered, so using url.origin would resolve to
    // http://sveltekit-prerender during the build. Keep the in-page image relative
    // and use an absolute production URL only for metadata.
    const directSocialImage = STATIC_WORDLE_TODAY_IMAGE_PATH;
    const socialImageUrl = `${SITE_URL}${STATIC_WORDLE_TODAY_IMAGE_PATH}`;
    const normalizedWordleData = wordleData
        ? {
            ...wordleData,
            social_image: directSocialImage,
            social_image_direct: directSocialImage
        }
        : null;
    const isCacheReady = Boolean(
        normalizedWordleData?.date === todayKey &&
        normalizedWordleData?.content_guide &&
        normalizedWordleData?.social_image
    );
    setHeaders({
        'X-Puzzle-Date': normalizedWordleData?.date ?? todayKey,
        'X-Edge-Cache-Bypass': isCacheReady ? '0' : '1'
    });

    const wordleWord = normalizedWordleData?.solution || '';
    // Bug #1 fix (SEO audit): use days_since_launch (real NYT puzzle number) instead of id (D1 row PK)
    const wordleNumber = normalizedWordleData?.days_since_launch || fallbackNumber;
    const formattedDate = normalizedWordleData?.date ? formatDate(new Date(normalizedWordleData.date)) : fallbackDate;

    const vowelCount = wordleWord.toLowerCase().split('').filter((c: string) => 'aeiou'.includes(c)).length;
    const hasDouble = wordleWord.toLowerCase().split('').some((c: string, i: number, a: string[]) => a.indexOf(c) !== a.lastIndexOf(c));
    const startLetter = wordleWord[0]?.toUpperCase() || '';
    const endLetter = wordleWord[wordleWord.length - 1]?.toUpperCase() || '';

    const hintFaqs = [
        { question: `What is the Wordle answer for today, ${formattedDate}?`, answer: `The Wordle answer for today, ${formattedDate}, is ${wordleWord.toUpperCase()}. This is Wordle #${wordleNumber}.` },
        { question: `How many vowels are in today's Wordle answer?`, answer: `Today's Wordle answer contains ${vowelCount} vowels.` },
        { question: `Does today's Wordle have any repeating letters?`, answer: hasDouble ? "Yes, today's Wordle has at least one repeating letter." : "No, today's Wordle does not contain any repeated letters." },
        { question: `What letter does Wordle #${wordleNumber} start with?`, answer: `Today's Wordle answer starts with the letter ${startLetter}.` },
        { question: `What is the last letter of today's Wordle?`, answer: `The Wordle answer for ${formattedDate} ends with the letter ${endLetter}.` },
    ];

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: hintFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wordsolverx.com/' },
            { '@type': 'ListItem', position: 2, name: 'Wordle', item: 'https://wordsolverx.com/wordle-answer-today' }
        ]
    };

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `Wordle Hints and Answer for Today (${formattedDate})`,
        datePublished: new Date(normalizedWordleData?.date || today).toISOString(),
        dateModified: new Date(normalizedWordleData?.date || today).toISOString(),
        author: generatePersonAuthorSchema('Preston Hayes', 'https://wordsolverx.com/about#preston-hayes', 'https://wordsolverx.com/author-wordsolverx.webp'),
        publisher: { '@type': 'Organization', name: 'WordSolverX', logo: { '@type': 'ImageObject', url: 'https://wordsolverx.com/wordsolverx.webp' } },
        description: `Get Wordle hints and the confirmed Wordle answer for today, ${formattedDate}. Hints, clues, and the solution for Wordle #${wordleNumber}.`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/wordle-answer-today' },
    };

    // CTR fix 2026-09-25: never reveal the answer in the title or meta description.
    // The "answer in snippet" experiment coincided with CTR collapsing to ~1.6% on
    // 50k monthly Bing impressions for "wordle answer today": a snippet that hands
    // over the answer earns the impression but loses the click. Tease with hints.
    // Stream 4 (2026-10-05): title rewritten to the colordle benchmark pattern
    // "[Game] Answer Today ([Date]) - [hook]" which converts at ~7.7% CTR. The
    // date uses `today` (the same puzzle-window date the answers are keyed on),
    // so a "today" page can never carry tomorrow's date or answer here.
    const longTitleDate = format(today, 'MMMM d, yyyy');
    const pageTitle = `Wordle Answer Today #${wordleNumber} (${longTitleDate}) - Hints`;
    const pageDescription = wordleWord
        ? `Wordle answer today ${formattedDate}: starts with ${startLetter}, ends with ${endLetter}. Stuck on Wordle #${wordleNumber}? Hints, letter clues and the confirmed solution, updated daily.`
        : `Wordle answer today ${formattedDate}: hints, letter clues and the confirmed solution for Wordle #${wordleNumber}, with yesterday's answer too. Updated daily.`;
    const pageKeywords = `wordle answer today, wordle answer, wordle hint, wordle hint today, wordle answer for ${formattedDate}`;

    return {
        wordleData: normalizedWordleData,
        wordleWord,
        wordleNumber,
        formattedDate,
        recentAnswers,
        directSocialImage,
        hintFaqs,
        publishedDate: new Date(normalizedWordleData?.date || today).toISOString(),
        schemas: JSON.stringify([faqSchema, articleSchema, breadcrumbSchema]),
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
            socialImage: socialImageUrl,
        },
    };
};

async function getWordleDataWithFallback(todayKey: string, fallbackNumber: number): Promise<TodayApiResponse | null> {
    const todayResponse = await fetch('https://api.wordsolverx.workers.dev/api/today');
    const todayPayload = (await todayResponse.json()) as TodayApiResponse & { error?: string };

    if (todayResponse.ok && todayPayload?.solution) {
        return todayPayload;
    }

    const recentAnswers = Array.isArray(todayPayload?.recent_answers) ? todayPayload.recent_answers : [];

    try {
        const nytResponse = await fetch(`https://www.nytimes.com/svc/wordle/v2/${todayKey}.json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 WordSolverX'
            }
        });

        if (nytResponse.ok) {
            const nytPayload = await nytResponse.json() as {
                solution?: string;
                days_since_launch?: number;
                editor?: string;
            };

            if (nytPayload.solution) {
                return {
                    id: nytPayload.days_since_launch ?? fallbackNumber,
                    date: todayKey,
                    solution: nytPayload.solution,
                    days_since_launch: nytPayload.days_since_launch,
                    editor: nytPayload.editor,
                    recent_answers: recentAnswers
                };
            }
        }
    } catch (error) {
        console.error('Error fetching NYT Wordle fallback:', error);
    }

    return null;
}

