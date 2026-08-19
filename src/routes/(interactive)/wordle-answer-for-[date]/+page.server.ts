import { getWordleNumber, formatDate } from '$lib/utils';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { generatePersonAuthorSchema } from '$lib/seo';
import { parseMonthDayYearKey, toArchiveDateKey, toMonthDayYearKey } from '$lib/archive-page';
import type { PageServerLoad } from './$types';

export const prerender = true;

interface ArchiveAnswer {
	date: string;
	solution: string;
	puzzleNumber?: number | null;
	editor?: string | null;
}

const SITE_URL = 'https://wordsolverx.com';
const WORDLE_START_DATE = new Date(Date.UTC(2021, 5, 19)); // Wordle #1: June 19, 2021

// Memoized across prerender entries so the full answer list is fetched exactly once
// per build instead of once per date page.
let allAnswersPromise: Promise<ArchiveAnswer[]> | null = null;

function getAllAnswers(): Promise<ArchiveAnswer[]> {
	if (!allAnswersPromise) {
		allAnswersPromise = fetch('https://api.wordsolverx.workers.dev/api/answers?limit=2000')
			.then((res) => (res.ok ? res.json() : { answers: [] }))
			.then((payload: { answers?: ArchiveAnswer[] }) => payload.answers ?? [])
			.catch(() => []);
	}
	return allAnswersPromise;
}

// Generate every Wordle date from launch up to YESTERDAY (never today — today lives
// on /wordle-answer-today). The URL slug is month-day-year, e.g. november-19-2022,
// matching the existing /colordle-answer-for-august-24-2023 style.
export function entries() {
	const today = getPuzzleDateForGame('wordle');
	const yesterday = new Date(today);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);

	const dates: { date: string }[] = [];
	const cursor = new Date(WORDLE_START_DATE);
	while (cursor <= yesterday) {
		dates.push({ date: toMonthDayYearKey(cursor) });
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dates;
}

export const load: PageServerLoad = async ({ params }) => {
	const dateKey = params.date; // e.g. "november-19-2022"
	const date = parseMonthDayYearKey(dateKey);
	if (!date) {
		throw new Error(`Invalid date slug: ${dateKey}`);
	}

	const isoDateKey = toArchiveDateKey(date); // e.g. "2022-11-19"
	const formattedDate = formatDate(date);
	const puzzleNumber = getWordleNumber(date);

	const answers = await getAllAnswers();
	const answer = answers.find((a) => a.date === isoDateKey) ?? null;
	const solution = answer?.solution ?? '';
	const editor = answer?.editor ?? null;

	const title = solution
		? `Wordle Answer for ${formattedDate} - ${solution.toUpperCase()}`
		: `Wordle Answer for ${formattedDate}`;
	const description = solution
		? `The Wordle answer for ${formattedDate} was ${solution.toUpperCase()}. See the solution and details for Wordle #${puzzleNumber}.`
		: `Find the Wordle answer for ${formattedDate} with puzzle number and details.`;
	const canonicalUrl = `${SITE_URL}/wordle-answer-for-${dateKey}`;

	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: title,
		datePublished: date.toISOString(),
		dateModified: date.toISOString(),
		author: generatePersonAuthorSchema(
			'Preston Hayes',
			'https://wordsolverx.com/about#preston-hayes',
			'https://wordsolverx.com/author-wordsolverx.webp'
		),
		publisher: {
			'@type': 'Organization',
			name: 'WordSolverX',
			logo: { '@type': 'ImageObject', url: 'https://wordsolverx.com/wordsolverx.webp' }
		},
		description,
		mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }
	};

	const faqSchema = solution
		? {
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: [
					{
						'@type': 'Question',
						name: `What was the Wordle answer on ${formattedDate}?`,
						acceptedAnswer: {
							'@type': 'Answer',
							text: `The Wordle answer for ${formattedDate} was ${solution.toUpperCase()}. This was Wordle #${puzzleNumber}.`
						}
					}
				]
			}
		: null;

	const schemas = JSON.stringify([articleSchema, ...(faqSchema ? [faqSchema] : [])]);

	return {
		dateKey,
		formattedDate,
		solution,
		puzzleNumber,
		editor,
		schemas,
		title,
		description,
		canonicalUrl
	};
};
