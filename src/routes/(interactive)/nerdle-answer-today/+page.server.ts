import type { PageServerLoad } from './$types';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import {
        getNerdleAllModeAnswerForDate,
        type NerdleAllModeAnswerData,
        type NerdleAnswerFetchOptions
} from '$lib/nerdle-answers';
import { getPuzzleWindow } from '$lib/puzzle-window';
import { getGameVideo } from '$lib/server/game-videos';

/**
 * Display guard: an answer is only shown if it is a real, balanced
 * equation. The upstream feed shipped "Instant: +17=24*9_5" on
 * 2026-11-28 — a leading "+", a "_" placeholder, and no balance — and
 * the page rendered it raw. Malformed entries are dropped, never shown.
 */
function isValidNerdleEquation(eq: string): boolean {
        if (!/^[0-9+\-*/=]+$/.test(eq)) return false;
        const sides = eq.split('=');
        if (sides.length !== 2 || !sides[0] || !sides[1]) return false;
        const evaluate = (side: string): number | null => {
                const tokens = side.match(/\d+|[+\-*/]/g);
                if (!tokens || tokens.join('') !== side) return null;
                if (!/^\d+$/.test(tokens[0]) || !/^\d+$/.test(tokens[tokens.length - 1])) return null;
                const values: number[] = [Number(tokens[0])];
                const ops: string[] = [];
                for (let i = 1; i < tokens.length; i += 2) {
                        const op = tokens[i];
                        const next = tokens[i + 1];
                        if (!['+', '-', '*', '/'].includes(op) || next === undefined || !/^\d+$/.test(next)) return null;
                        if (op === '*') values[values.length - 1] *= Number(next);
                        else if (op === '/') {
                                if (Number(next) === 0) return null;
                                values[values.length - 1] /= Number(next);
                        } else {
                                ops.push(op);
                                values.push(Number(next));
                        }
                }
                let result = values[0];
                for (let i = 0; i < ops.length; i++) {
                        result = ops[i] === '+' ? result + values[i + 1] : result - values[i + 1];
                }
                return result;
        };
        const left = evaluate(sides[0]);
        const right = evaluate(sides[1]);
        return left !== null && right !== null && Math.abs(left - right) < 1e-9;
}

function formatDateLabel(dateKey: string): string {
        const date = new Date(`${dateKey}T00:00:00Z`);
        if (Number.isNaN(date.getTime())) {
                return dateKey;
        }

        return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Tokyo'
        });
}

export const load: PageServerLoad = async ({ setHeaders, platform, fetch }) => {
        const fetchOptions: NerdleAnswerFetchOptions = {
                platform,
                fetchImpl: fetch
        };
        const fallbackDate = getPuzzleWindow('nerdle').effectivePuzzleDate;
        const answerData =
                (await getNerdleAllModeAnswerForDate(fallbackDate, fetchOptions)) ??
                ({
                        date: fallbackDate,
                        classicPuzzleNumber: Number.NaN,
                        modes: []
                } satisfies NerdleAllModeAnswerData);
        for (const mode of answerData.modes ?? []) {
                mode.answers = (mode.answers ?? []).filter((entry) => isValidNerdleEquation(entry.answer ?? ''));
        }
        const formattedDate = formatDateLabel(answerData.date);
        const hasValidTodayData =
                Number.isFinite(answerData.classicPuzzleNumber) &&
                Array.isArray(answerData.modes) &&
                answerData.modes.length > 0;
        const fallbackCacheTtlSeconds = 60;

        setHeaders({
                'X-Puzzle-Date': answerData.date,
                'X-Edge-Cache-Bypass': '0',
                ...(hasValidTodayData ? {} : { 'X-Edge-Cache-TTL': String(fallbackCacheTtlSeconds) }),
                'Cache-Control': hasValidTodayData
                        ? 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600'
                        : `public, max-age=0, s-maxage=${fallbackCacheTtlSeconds}, stale-while-revalidate=300`
        });

        // Bing ranking components (2026-10-06): title built from the shared daily
        // title pattern, keyed on the puzzle-window date (formattedDate) so a
        // "today" page can never carry tomorrow's date or answer here. The answer
        // stays out of the title and meta description (snippet tease, not reveal).
        const classicAnswerEntry = answerData.modes.find((mode) => mode.id === 'classic')?.answers[0];
        const classicAnswer = classicAnswerEntry?.answer ?? '';
        const classicNumber = Number.isFinite(answerData.classicPuzzleNumber) ? answerData.classicPuzzleNumber : '';
        const pageTitle = dailyAnswerTitle('Nerdle', classicNumber, formattedDate);
        const pageDescription = `Get every Nerdle answer for ${formattedDate}, covering Classic, Micro, Mini, Midi, Maxi, Mini Bi, Quad, Speed, and Instant, all solved on one page.`;
        const updatedStamp = updatedStampText('Nerdle', classicNumber, formattedDate);
        const aiHints = mergeHints(classicAnswer, getAIHints('nerdle', answerData.date));

        // FactBlock values derived from the classic equation.
        const factChars = classicAnswer.toLowerCase().replace(/[^a-z0-9]/g, '');
        const factVowelCount = [...classicAnswer.toLowerCase()].filter((c) => 'aeiou'.includes(c)).length;
        const factHasRepeat = factChars.split('').some((c, i, a) => a.indexOf(c) !== a.lastIndexOf(c));

        const faqItems = [
                {
                        question: `What is the Nerdle classic answer for ${formattedDate}?`,
                        answer:
                                answerData.modes.find((mode) => mode.id === 'classic')?.answers.map((entry) => entry.answer).join(', ') ??
                                'The latest Nerdle classic answer is listed in the Classic section above.'
                },
                {
                        question: 'Does this page include all Nerdle modes?',
                        answer:
                                'Yes. This page lists the current answers for Classic, Micro, Mini, Midi, Maxi, Mini Bi, Quad, Speed, and Instant whenever that mode is available.'
                },
                {
                        question: 'Where can I solve old Nerdle puzzles?',
                        answer:
                                'Use the Nerdle Solver and the Nerdle Archive on WordAuditor to check older dates, mode answers, and puzzle history.'
                },
                { question: 'When was this page last updated?', answer: updatedStamp }
        ];

        const schemas = JSON.stringify([
                {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: pageTitle,
                        description: pageDescription,
                        datePublished: `${answerData.date}T00:00:00+09:00`,
                        dateModified: `${answerData.date}T00:00:00+09:00`,
                        mainEntityOfPage: 'https://wordauditor.com/nerdle-answer-today',
                        author: {
                                '@type': 'Person',
                                name: 'Preston Hayes',
                                url: 'https://wordauditor.com/about#preston-hayes',
                                image: 'https://wordauditor.com/author-wordauditor.webp',
                                jobTitle: 'Word Puzzle Analyst',
                                knowsAbout: ['Wordle', 'Word Puzzles', 'Daily Puzzle Answers', 'Puzzle Solver Tools', 'Information Theory'],
                                sameAs: ['https://www.pinterest.com/wordsolverx/']
                        },
                        publisher: {
                                '@type': 'Organization',
                                name: 'WordAuditor',
                                logo: {
                                        '@type': 'ImageObject',
                                        url: 'https://wordauditor.com/images/nerdle-answer-today.webp'
                                }
                        }
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: pageTitle,
                        description: pageDescription,
                        url: 'https://wordauditor.com/nerdle-answer-today',
                        image: 'https://wordauditor.com/images/nerdle-answer-today.webp',
                        dateModified: answerData.date
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wordauditor.com' },
                                { '@type': 'ListItem', position: 2, name: 'Today', item: 'https://wordauditor.com/today' },
                                {
                                        '@type': 'ListItem',
                                        position: 3,
                                        name: 'Nerdle Answer Today',
                                        item: 'https://wordauditor.com/nerdle-answer-today'
                                }
                        ]
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqItems.map((item) => ({
                                '@type': 'Question',
                                name: item.question,
                                acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: item.answer
                                }
                        }))
                }
        ]);

        const video = await getGameVideo('nerdle', answerData.date);

        return {
                video,
                answerData,
                formattedDate,
                faqItems,
                updatedStamp,
                aiHints,
                classicAnswer,
                classicNumber,
                factFirstLetter: factChars[0]?.toUpperCase() ?? '',
                factLastLetter: factChars[factChars.length - 1]?.toUpperCase() ?? '',
                factVowelCount,
                factRepeatText: factHasRepeat ? 'Yes' : 'No',
                meta: {
                        title: pageTitle,
                        description: pageDescription,
                        keywords: `nerdle answer today, nerdle all modes answer, nerdle classic micro mini midi maxi quad speed instant, nerdle archive, nerdle answer ${formattedDate}`,
                        canonical: 'https://wordauditor.com/nerdle-answer-today'
                },
                schemas
        };
};
