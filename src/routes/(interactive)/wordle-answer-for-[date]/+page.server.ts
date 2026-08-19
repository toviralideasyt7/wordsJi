import { format } from 'date-fns';
import { getWordleNumber, formatDate } from '$lib/utils';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { generatePersonAuthorSchema } from '$lib/seo';
import type { PageServerLoad } from './$types';

export const prerender = true;

interface ArchiveAnswer {
	date: string;
	solution: string;
	puzzleNumber?: number | null;
	editor?: string | null;
}

const SITE_URL = 'https://wordsolverx.com';
const WORDLE_START_DATE_KEY = '2021-06-19';

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
// on /wordle-answer-today).
export function entries() {
	const todayKey = format(getPuzzleDateForGame('wordle'), 'yyyy-MM-dd');
	const yesterday = new Date(`${todayKey}T00:00:00Z`);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);

	const dates: { date: string }[] = [];
	const cursor = new Date(`${WORDLE_START_DATE_KEY}T00:00:00Z`);
	while (cursor <= yesterday) {
		dates.push({ date: format(cursor, 'yyyy-MM-dd') });
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dates;
}

export const load: PageServerLoad = async ({ params }) => {
	const dateKey = params.date;
	const date = new Date(`${dateKey}T00:00:00Z`);
	const formattedDate = formatDate(date);
	const puzzleNumber = getWordleNumber(date);

	const answers = await getAllAnswers();
	const answer = answers.find((a) => a.date === dateKey) ?? null;
	const solution = answer?.solution ?? '';
	const editor = answer?.editor ?? null;

	const title = solution
		? `Wordle Answer for ${formattedDate} - ${solution.toUpperCase()}`
		: `Wordle Answer for ${formattedDate}`;
	const description = solution
		? `The Wordle answer for ${formattedDate} was ${solution.toUpperCase()}. See the solution and details for Wordle #${puzzleNumber}.`
		: `Find the Wordle answer for ${formattedDate} with puzzle number and details.`;
	const canonicalUrl = `${SITE_URL}/wordle-answer-for/${dateKey}`;

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
