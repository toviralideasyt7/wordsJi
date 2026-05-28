import { format } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { fetchLiveCanucklePuzzle } from '$lib/live-answer-sources';
import canuckleRaw from '$lib/wordlebot-wasm/assets/generated/canuckle-data.json';
import type { PageServerLoad } from './$types';

interface CanucklePuzzle {
        index: number;
        answer: string;
        date: string;
        fact: string[];
}

interface CanuckleData {
        schedule: { originalStart: string; currentStart: string };
        maxIndex: number;
        puzzles: CanucklePuzzle[];
}

const canuckleData = canuckleRaw as CanuckleData;
const canucklePuzzles = [...canuckleData.puzzles].sort((a, b) => a.index - b.index);
const latestBundledDateKey = canucklePuzzles[canucklePuzzles.length - 1]?.date ?? null;

function buildPuzzlePositionMap(puzzles: CanucklePuzzle[]): Map<number, number> {
        return new Map(puzzles.map((puzzle, position) => [puzzle.index, position]));
}

function getLatestPuzzleOnOrBefore(puzzles: CanucklePuzzle[], dateKey: string): CanucklePuzzle | null {
        for (let i = puzzles.length - 1; i >= 0; i -= 1) {
                if (puzzles[i].date <= dateKey) {
                        return puzzles[i];
                }
        }

        return null;
}

function getPuzzleForDate(puzzles: CanucklePuzzle[], targetDate: Date): CanucklePuzzle | null {
        const dateKey = format(targetDate, 'yyyy-MM-dd');
        const exact = puzzles.find((puzzle) => puzzle.date === dateKey) ?? null;
        if (exact) return exact;
        return getLatestPuzzleOnOrBefore(puzzles, dateKey);
}

function getPreviousPuzzle(
        puzzles: CanucklePuzzle[],
        puzzlePositionByIndex: Map<number, number>,
        puzzle: CanucklePuzzle | null
): CanucklePuzzle | null {
        if (!puzzle) {
                return null;
        }

        const position = puzzlePositionByIndex.get(puzzle.index);
        if (position === undefined || position === 0) {
                return null;
        }

        return puzzles[position - 1] ?? null;
}

function getLast30Puzzles(
        puzzles: CanucklePuzzle[],
        puzzlePositionByIndex: Map<number, number>,
        basePuzzle: CanucklePuzzle | null
): CanucklePuzzle[] {
        if (!basePuzzle) {
                return [];
        }

        const position = puzzlePositionByIndex.get(basePuzzle.index);
        if (position === undefined) {
                return [];
        }

        return puzzles.slice(Math.max(0, position - 29), position + 1).reverse();
}

export const load: PageServerLoad = async ({ setHeaders }) => {
        const today = getPuzzleDateForGame('canuckle');
        const dateKey = format(today, 'yyyy-MM-dd');
        let puzzles = canucklePuzzles;
        const shouldRefreshFromSource =
                !latestBundledDateKey || latestBundledDateKey < dateKey || !puzzles.some((puzzle) => puzzle.date === dateKey);

        if (shouldRefreshFromSource) {
                try {
                        const livePuzzle = await fetchLiveCanucklePuzzle(dateKey);
                        if (livePuzzle && !puzzles.some((puzzle) => puzzle.index === livePuzzle.index)) {
                                puzzles = [...puzzles, livePuzzle].sort((left, right) => left.index - right.index);
                        }
                } catch (error) {
                        console.warn(
                                `Unable to refresh Canuckle live puzzle for ${dateKey}:`,
                                error instanceof Error ? error.message : String(error)
                        );
                }
        }

        const puzzlePositionByIndex = buildPuzzlePositionMap(puzzles);
        const todayPuzzle = getPuzzleForDate(puzzles, today);
        const isFallback = todayPuzzle ? todayPuzzle.date !== dateKey : false;
        const puzzleDate = todayPuzzle ? new Date(`${todayPuzzle.date}T12:00:00Z`) : today;
        const visibleDateKey = todayPuzzle?.date ?? dateKey;
        const formattedDate = isFallback ? format(puzzleDate, 'MMMM d, yyyy') : format(today, 'MMMM d, yyyy');

        if (!todayPuzzle) {
                setHeaders({ 'X-Puzzle-Date': dateKey, 'X-Edge-Cache-Bypass': '1' });
                return {
                        error: true,
                        todayPuzzle: null,
                        yesterdayPuzzle: null,
                        last30: [],
                        visibleDateKey: dateKey,
                        formattedDate,
                        isFallback: false,
                        schemas: null,
                        meta: {
                                title: 'Canuckle Answer Today',
                                description: '',
                                keywords: 'canuckle answer today, canuckle today, canuckle hint',
                                featuredImage: '/images/canuckle-answer-today.webp'
                        }
                };
        }

        const yesterdayPuzzle = getPreviousPuzzle(puzzles, puzzlePositionByIndex, todayPuzzle);

        setHeaders({
                'X-Puzzle-Date': visibleDateKey,
                ...(isFallback ? { 'X-Edge-Cache-Bypass': '1' } : {})
        });

        const last30 = getLast30Puzzles(puzzles, puzzlePositionByIndex, todayPuzzle);
        const pageTitle = `Canuckle Answer Today (${formattedDate}) - Daily Canadian Puzzle Solution & Tips | WordSolverX`;
        const pageDescription = `Today's Canuckle answer for ${formattedDate}, yesterday's word, the Canadian fact, and a searchable archive. Updated daily by real players.`;
        const pageKeywords = `canuckle answer today, canuckle word, canuckle hint, canuckle fact, canuckle archive, canadian wordle`;

        const yesterdayData = yesterdayPuzzle
                ? {
                                answer: yesterdayPuzzle.answer,
                                index: yesterdayPuzzle.index,
                                date: format(new Date(`${yesterdayPuzzle.date}T12:00:00Z`), 'MMMM d, yyyy'),
                                fact: yesterdayPuzzle.fact.join(' ')
                        }
                : null;

        const faqItems = [
                {
                        '@type': 'Question',
                        name: `What is the Canuckle answer for today, ${formattedDate}?`,
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: `For ${formattedDate}, the Canuckle answer is ${todayPuzzle.answer.toUpperCase()}. It is puzzle #${todayPuzzle.index}.`
                        }
                },
                {
                        '@type': 'Question',
                        name: 'What was yesterday\'s Canuckle answer?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: yesterdayData
                                        ? `The previous Canuckle answer was ${yesterdayData.answer.toUpperCase()} (puzzle #${yesterdayData.index}).`
                                        : 'Yesterday\'s Canuckle data is not available right now.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'How do you play Canuckle?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Canuckle is a Wordle-style game with a Canadian twist. You guess 5-letter words and get color feedback — green for correct position, yellow for wrong position, red for not in the word. The answer pool uses Canadian-themed words and each puzzle comes with a Canadian fact.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'What makes Canuckle different from Wordle?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Canuckle uses a Canadian-focused answer list, so words like MAPLE, TOQUE, and MOOSE are fair game. It also includes a Canadian fact with each daily answer, and the feedback colors are red instead of green.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'When does the new Canuckle puzzle release?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'A new Canuckle puzzle goes live every day at midnight Eastern Time (ET).'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'What does the red feedback mean in Canuckle?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Red tiles in Canuckle work the same way as gray tiles in Wordle — the letter is not in the answer at all. Yellow means the letter is in the word but in a different position, and green means the correct letter in the correct position.'
                        }
                },
                {
                        '@type': 'Question',
                        name: 'How can I browse earlier Canuckle answers?',
                        acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Use the recent answers table on this page to scan the last 30 days, or visit the full Canuckle archive for a searchable history of all past puzzles.'
                        }
                }
        ];

        const jsonLd = JSON.stringify([
                { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems },
                {
                        '@context': 'https://schema.org',
                        '@type': 'HowTo',
                        name: 'How to Play Canuckle',
                        description: 'Step-by-step guide for the daily Canadian word-guessing game Canuckle.',
                        step: [
                                { '@type': 'HowToStep', position: 1, text: 'Visit canucklegame.github.io and look at the empty 5-letter grid.' },
                                { '@type': 'HowToStep', position: 2, text: 'Type a 5-letter word as your first guess — try a common Canadian word or a vowel-rich starter like "ABOUT".' },
                                { '@type': 'HowToStep', position: 3, text: 'Check the color feedback: green = correct spot, yellow = wrong spot, red = not in the word.' },
                                { '@type': 'HowToStep', position: 4, text: 'Use the feedback to eliminate letters and narrow your next guess.' },
                                { '@type': 'HowToStep', position: 5, text: 'Keep guessing until you find the word within 6 attempts.' }
                        ]
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wordsolverx.com' },
                                { '@type': 'ListItem', position: 2, name: 'Today', item: 'https://wordsolverx.com/today' },
                                { '@type': 'ListItem', position: 3, name: 'Canuckle Answer Today', item: 'https://wordsolverx.com/canuckle-answer-today' }
                        ]
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: pageTitle,
                        datePublished: `${visibleDateKey}T00:00:00.000Z`,
                        dateModified: today.toISOString(),
                        author: {
                                '@type': 'Person',
                                name: 'Preston Hayes',
                                image: 'https://wordsolverx.com/author-wordsolverx.webp',
                                url: 'https://wordsolverx.com/about#preston-hayes'
                        },
                        publisher: { '@type': 'Organization', name: 'WordSolverX' },
                        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/canuckle-answer-today' },
                        description: pageDescription,
                        image: ['https://wordsolverx.com/images/canuckle-answer-today.webp']
                }
        ]);

        return {
                error: false,
                todayPuzzle: {
                        answer: todayPuzzle.answer,
                        index: todayPuzzle.index,
                        date: formattedDate,
                        fact: todayPuzzle.fact.join(' ')
                },
                visibleDateKey,
                isFallback,
                yesterdayData,
                last30: last30.map((p) => ({
                        answer: p.answer,
                        index: p.index,
                        date: format(new Date(`${p.date}T12:00:00Z`), 'MMMM d, yyyy')
                })),
                formattedDate,
                schemas: jsonLd,
                meta: {
                        title: pageTitle,
                        description: pageDescription,
                        keywords: pageKeywords,
                        featuredImage: '/images/canuckle-answer-today.webp'
                }
        };
};

