// Shared build-time helper for the /wordle-hints/* micro-page cluster.
// Resolves TODAY's Wordle answer using the same API + NYT fallback pattern as
// src/routes/(interactive)/wordle-answer-today/+page.server.ts, and computes the
// deterministic hint values for each of the 12 hint pages.
//
// The puzzle date is ALWAYS the puzzle-window date (getPuzzleDateForGame),
// never the build date — a page titled "today" must never carry tomorrow's
// date or answer.

import { format } from 'date-fns';
import { getWordleNumber, formatDate } from '$lib/utils';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { AIHints } from '$lib/ai-hints';
import type { WordleAnswer } from '$lib/api';

const TODAY_API_URL = 'https://api.wordsolverx.workers.dev/api/today';
const SITE_URL = 'https://wordsolverx.com';

export interface WordleHintToday {
	word: string; // uppercase solution, '' when unresolved
	wordleNumber: number;
	todayKey: string; // yyyy-MM-dd puzzle date
	formattedDate: string; // e.g. "October 6, 2026"
	hasAnswer: boolean;
}

interface TodayApiResponse extends WordleAnswer {
	today_jst?: string;
	recent_answers?: WordleAnswer[];
}

export async function resolveWordleToday(): Promise<WordleHintToday> {
	const today = getPuzzleDateForGame('wordle');
	const todayKey = format(today, 'yyyy-MM-dd');
	const fallbackNumber = getWordleNumber(today);

	let payload: TodayApiResponse | null = null;
	try {
		payload = await getWordleDataWithFallback(todayKey, fallbackNumber);
	} catch (error) {
		console.error("Error resolving today's Wordle for hint pages:", error);
	}

	const word = payload?.solution ? payload.solution.toUpperCase() : '';
	// Bug #1 fix pattern (SEO audit): days_since_launch is the real NYT puzzle number.
	const wordleNumber = payload?.days_since_launch || fallbackNumber;
	const formattedDate = payload?.date ? formatDate(new Date(payload.date)) : formatDate(today);

	return {
		word,
		wordleNumber,
		todayKey,
		formattedDate,
		hasAnswer: word.length > 0
	};
}

async function getWordleDataWithFallback(todayKey: string, fallbackNumber: number): Promise<TodayApiResponse | null> {
	const todayResponse = await fetch(TODAY_API_URL);
	const todayPayload = (await todayResponse.json()) as TodayApiResponse & { error?: string };

	if (todayResponse.ok && todayPayload?.solution) {
		return todayPayload;
	}

	try {
		const nytResponse = await fetch(`https://www.nytimes.com/svc/wordle/v2/${todayKey}.json`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 WordSolverX'
			}
		});

		if (nytResponse.ok) {
			const nytPayload = (await nytResponse.json()) as {
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
					editor: nytPayload.editor
				};
			}
		}
	} catch (error) {
		console.error('Error fetching NYT Wordle fallback:', error);
	}

	return null;
}

// ---------------------------------------------------------------------------
// The 12 hint pages. `label` is the short nav label; `question` is the page
// H1 and the first FAQ question; `shortTitle` is the title prefix before the
// puzzle date, e.g. "First Letter of Today's Wordle (October 6, 2026) - Hint".
// ---------------------------------------------------------------------------

export interface WordleHintPageDef {
	slug: string;
	label: string;
	question: string;
	shortTitle: string;
}

export const WORDLE_HINT_PAGES: WordleHintPageDef[] = [
	{
		slug: 'first-letter',
		label: 'First Letter',
		question: "What is the first letter of today's Wordle?",
		shortTitle: "First Letter of Today's Wordle"
	},
	{
		slug: 'first-two-letters',
		label: 'First Two Letters',
		question: "What are the first two letters of today's Wordle?",
		shortTitle: "First Two Letters of Today's Wordle"
	},
	{
		slug: 'middle-letter',
		label: 'Middle Letter',
		question: "What is the middle letter of today's Wordle?",
		shortTitle: "Middle Letter of Today's Wordle"
	},
	{
		slug: 'last-two-letters',
		label: 'Last Two Letters',
		question: "What are the last two letters of today's Wordle?",
		shortTitle: "Last Two Letters of Today's Wordle"
	},
	{
		slug: 'last-letter',
		label: 'Last Letter',
		question: "What is the last letter of today's Wordle?",
		shortTitle: "Last Letter of Today's Wordle"
	},
	{
		slug: 'vowel-count',
		label: 'Vowel Count',
		question: "How many vowels are in today's Wordle?",
		shortTitle: "Vowel Count in Today's Wordle"
	},
	{
		slug: 'consonant-count',
		label: 'Consonant Count',
		question: "How many consonants are in today's Wordle?",
		shortTitle: "Consonant Count in Today's Wordle"
	},
	{
		slug: 'repeating-letters',
		label: 'Repeating Letters',
		question: "Does today's Wordle have repeating letters?",
		shortTitle: "Repeating Letters in Today's Wordle"
	},
	{
		slug: 'letter-pattern',
		label: 'Letter Pattern',
		question: "What is the consonant-vowel pattern of today's Wordle?",
		shortTitle: "Letter Pattern of Today's Wordle"
	},
	{
		slug: 'unique-letters',
		label: 'Unique Letters',
		question: "How many unique letters are in today's Wordle?",
		shortTitle: "Unique Letters in Today's Wordle"
	},
	{
		slug: 'starts-with-vowel',
		label: 'Starts With Vowel',
		question: "Does today's Wordle start with a vowel?",
		shortTitle: "Does Today's Wordle Start With a Vowel"
	},
	{
		slug: 'word-definition',
		label: 'Word Definition',
		question: "What is the definition of today's Wordle answer?",
		shortTitle: "Definition of Today's Wordle Answer"
	}
];

export const WORDLE_HINT_BASE = '/wordle-hints';

export function getWordleHintPageDef(slug: string): WordleHintPageDef {
	const def = WORDLE_HINT_PAGES.find((p) => p.slug === slug);
	if (!def) {
		throw new Error(`Unknown wordle-hints page slug: ${slug}`);
	}
	return def;
}

export interface WordleHintFact {
	label: string;
	value: string;
}

export interface WordleHintContent {
	value: string; // plain-text hint value for the big answer card
	explain: string; // 1-2 sentences of explanation
	emptyNote: string; // shown instead of value when the hint is unavailable
	extraFacts: WordleHintFact[]; // deterministic supporting facts (definition page)
	faqAnswer: string; // plain-text answer to the page's FAQ question
}

function isVowel(letter: string): boolean {
	return 'AEIOU'.includes(letter);
}

function countVowels(word: string): number {
	return word.split('').filter((c) => isVowel(c)).length;
}

function repeatingLetters(word: string): string[] {
	const counts = new Map<string, number>();
	for (const c of word) {
		counts.set(c, (counts.get(c) ?? 0) + 1);
	}
	return [...counts.entries()].filter(([, n]) => n > 1).map(([c]) => c);
}

function consonantVowelPattern(word: string): string {
	return word
		.split('')
		.map((c) => (isVowel(c) ? 'V' : 'C'))
		.join('');
}

/** Shared deterministic facts shown on the definition page when AI is empty. */
function deterministicFacts(word: string): WordleHintFact[] {
	return [
		{ label: 'First letter', value: word[0] ?? '' },
		{ label: 'Last letter', value: word[word.length - 1] ?? '' },
		{ label: 'Vowel count', value: String(countVowels(word)) },
		{ label: 'Letter pattern', value: consonantVowelPattern(word) },
		{ label: 'Unique letters', value: String(new Set(word).size) }
	];
}

/**
 * Compute the deterministic hint value + explanation for a hint page.
 * Works entirely from the answer word — no AI required.
 */
export function buildHintContent(slug: string, word: string, ai: AIHints | null): WordleHintContent {
	const n = word.length;
	const midIndex = Math.floor(n / 2);
	const midPosition = midIndex + 1;
	const vowelCount = countVowels(word);
	const consonantCount = n - vowelCount;
	const repeats = repeatingLetters(word);
	const pattern = consonantVowelPattern(word);
	const uniqueCount = new Set(word).size;
	const startsWithVowel = word.length > 0 && isVowel(word[0]);
	const definition = ai?.definition?.trim() ?? '';

	switch (slug) {
		case 'first-letter':
			return {
				value: word[0] ?? '',
				explain: `Today's Wordle answer starts with the letter ${word[0]}. Try it as the opening letter of your next guess.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `Today's Wordle answer starts with the letter ${word[0]}.`
			};
		case 'first-two-letters':
			return {
				value: word.slice(0, 2),
				explain: `The first two letters of today's Wordle are ${word.slice(0, 2)}. That opening pair narrows your options fast.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `The first two letters of today's Wordle are ${word.slice(0, 2)}.`
			};
		case 'middle-letter':
			return {
				value: word[midIndex] ?? '',
				explain: `The middle letter of today's Wordle (position ${midPosition} of ${n}) is ${word[midIndex]}.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `The middle letter of today's Wordle (position ${midPosition} of ${n}) is ${word[midIndex]}.`
			};
		case 'last-two-letters':
			return {
				value: word.slice(-2),
				explain: `Today's Wordle ends with the letters ${word.slice(-2)}. Lock those in before guessing the rest.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `The last two letters of today's Wordle are ${word.slice(-2)}.`
			};
		case 'last-letter':
			return {
				value: word[n - 1] ?? '',
				explain: `Today's Wordle answer ends with the letter ${word[n - 1]}. Check your guesses against it.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `Today's Wordle answer ends with the letter ${word[n - 1]}.`
			};
		case 'vowel-count':
			return {
				value: String(vowelCount),
				explain: `Today's Wordle contains ${vowelCount} ${vowelCount === 1 ? 'vowel' : 'vowels'} (A, E, I, O, U).`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `Today's Wordle contains ${vowelCount} ${vowelCount === 1 ? 'vowel' : 'vowels'}.`
			};
		case 'consonant-count':
			return {
				value: String(consonantCount),
				explain: `Today's Wordle contains ${consonantCount} ${consonantCount === 1 ? 'consonant' : 'consonants'}.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `Today's Wordle contains ${consonantCount} ${consonantCount === 1 ? 'consonant' : 'consonants'}.`
			};
		case 'repeating-letters':
			return {
				value: repeats.length > 0 ? 'Yes' : 'No',
				explain:
					repeats.length > 0
						? `Yes — the letter ${repeats.join(' and ')} ${repeats.length > 1 ? 'repeat' : 'repeats'} in today's Wordle.`
						: `No — all ${n} letters in today's Wordle are different.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer:
					repeats.length > 0
						? `Yes, today's Wordle has at least one repeating letter (${repeats.join(', ')}).`
						: "No, today's Wordle does not contain any repeated letters."
			};
		case 'letter-pattern':
			return {
				value: pattern,
				explain: `C stands for consonant and V for vowel. Today's Wordle follows the pattern ${pattern}.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `The consonant-vowel pattern of today's Wordle is ${pattern}.`
			};
		case 'unique-letters':
			return {
				value: String(uniqueCount),
				explain: `Today's Wordle answer uses ${uniqueCount} distinct ${uniqueCount === 1 ? 'letter' : 'letters'}.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: `Today's Wordle answer has ${uniqueCount} unique ${uniqueCount === 1 ? 'letter' : 'letters'}.`
			};
		case 'starts-with-vowel':
			return {
				value: startsWithVowel ? `Yes (${word[0]})` : `No (${word[0]})`,
				explain: startsWithVowel
					? `Yes — today's Wordle starts with the vowel ${word[0]}.`
					: `No — today's Wordle starts with ${word[0]}, which is a consonant.`,
				emptyNote: '',
				extraFacts: [],
				faqAnswer: startsWithVowel
					? `Yes, today's Wordle starts with a vowel (${word[0]}).`
					: `No, today's Wordle starts with the consonant ${word[0]}.`
			};
		case 'word-definition':
			return {
				value: definition,
				explain: definition
					? `The definition of today's Wordle answer is shown above. Definitions are generated with each day's hint set and describe the answer word only.`
					: `No definition has been generated for today's answer yet. Check back later — meanwhile, the confirmed letter facts for today are listed below.`,
				emptyNote: `No definition has been generated for today's answer yet — check back later.`,
				extraFacts: deterministicFacts(word),
				faqAnswer: definition
					? `Today's Wordle answer means: ${definition}`
					: `No definition has been generated for today's Wordle answer yet. See the confirmed letter facts on this page, or check back later.`
			};
		default:
			throw new Error(`Unknown wordle-hints page slug: ${slug}`);
	}
}

export function wordleHintCanonical(slug: string): string {
	return `${SITE_URL}${WORDLE_HINT_BASE}/${slug}`;
}
