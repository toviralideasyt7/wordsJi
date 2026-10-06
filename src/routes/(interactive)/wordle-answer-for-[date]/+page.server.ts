import { getWordleNumber, formatDate } from '$lib/utils';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { generatePersonAuthorSchema } from '$lib/seo';
import { getDatedProse, deterministicProse } from '$lib/ai-hints';
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

	// Prev/next-day navigation: dated pages run START..yesterday, "today" lives on
	// /wordle-answer-today. The day after yesterday resolves to the today route so
	// the chain never dead-ends and crawlers can walk the full archive.
	const todayPuzzle = getPuzzleDateForGame('wordle');
	const todayKey = toArchiveDateKey(todayPuzzle);
	const prevDate = new Date(date);
	prevDate.setUTCDate(prevDate.getUTCDate() - 1);
	const nextDate = new Date(date);
	nextDate.setUTCDate(nextDate.getUTCDate() + 1);
	const prevKey = toArchiveDateKey(prevDate);
	const nextKey = toArchiveDateKey(nextDate);
	const prevDateKey = prevKey >= '2021-06-19' ? toMonthDayYearKey(prevDate) : null;
	const nextDateKey = nextKey < todayKey ? toMonthDayYearKey(nextDate) : null;
	const nextIsToday = nextKey === todayKey;
	const prevDateLabel = prevDateKey ? formatDate(prevDate) : null;
	const nextDateLabel = nextDateKey ? formatDate(nextDate) : null;

	// Unique two-sentence prose per puzzle: stored AI prose when it exists for
	// this date, otherwise the deterministic fallback computed from the answer.
	const prose = solution
		? (getDatedProse('wordle', isoDateKey) ??
			deterministicProse('Wordle', formattedDate, `#${puzzleNumber}`, solution))
		: null;

	// The no-solution branch has to stand on its own: the date string is the only variable
	// part, so both strings are sized to land inside the 30-60 title and 140-158 description
	// budgets for every date length from "May 5, 2026" to "September 21, 2026".
	const title = solution
		? `Wordle Answer for ${formattedDate} - ${solution.toUpperCase()} (#${puzzleNumber})`
		: `Wordle Answer for ${formattedDate} - Solution and Hints`;
	const description = solution
		? `The Wordle answer for ${formattedDate} (Wordle #${puzzleNumber}) was ${solution.toUpperCase()}. Starts with ${solution[0].toUpperCase()}, ends with ${solution[solution.length - 1].toUpperCase()}. See hints, solution details, and more answers from this week.`
		: `Looking for the Wordle answer for ${formattedDate}? This page carries the puzzle number, the letter hints, and the confirmed solution for that day.`;
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
					},
					{
						'@type': 'Question',
						name: `What was Wordle #${puzzleNumber}?`,
						acceptedAnswer: {
							'@type': 'Answer',
							text: `Wordle #${puzzleNumber}, published ${formattedDate}, was ${solution.toUpperCase()}.`
						}
					}
				]
			}
		: null;

	const schemas = JSON.stringify([articleSchema, ...(faqSchema ? [faqSchema] : [])]);

	// Word traits computed from the answer itself: unique per page, spoiler-free
	// hints that give Bing distinct indexable text on every dated URL.
	const letters = solution.toLowerCase().split('');
	const wordStats = solution
		? {
				first: solution[0].toUpperCase(),
				last: solution[solution.length - 1].toUpperCase(),
				vowels: letters.filter((l) => 'aeiou'.includes(l)).length,
				repeat: new Set(letters).size !== letters.length
			}
		: null;

	const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
	const dayOfMonth = date.getUTCDate();
	const monthName = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
	const yearNum = date.getUTCFullYear();

	const prevSolDate = new Date(date);
	prevSolDate.setUTCDate(prevSolDate.getUTCDate() - 1);
	const prevSolMatch = answers.find((a) => a.date === toArchiveDateKey(prevSolDate));
	const prevSol = prevSolMatch?.solution?.toUpperCase() ?? '';

	const nextSolDate = new Date(date);
	nextSolDate.setUTCDate(nextSolDate.getUTCDate() + 1);
	const nextSolMatch = answers.find((a) => a.date === toArchiveDateKey(nextSolDate));
	const nextSol = nextSolMatch?.solution?.toUpperCase() ?? '';

	const letterFrequency: Record<string, number> = {};
	for (const ch of letters) {
		letterFrequency[ch] = (letterFrequency[ch] ?? 0) + 1;
	}
	const distinctLetters = Object.keys(letterFrequency).length;
	const topLetter = Object.entries(letterFrequency).sort((a, b) => b[1] - a[1])[0];
	const consonants = letters.filter((l) => !'aeiou'.includes(l)).length;
	const vowelPositions = letters
		.map((l, i) => ('aeiou'.includes(l) ? i + 1 : -1))
		.filter((p) => p > 0);

	const difficultyNote = (() => {
		if (!solution || !wordStats) return '';
		if (wordStats.repeat && wordStats.vowels <= 1) {
			return 'Players often found this one tough because of the repeated consonant and the tight vowel count.';
		}
		if (wordStats.vowels >= 3) {
			return 'The generous vowel count gave solvers an early opening once a vowel-heavy starter like ADIEU or AUDIO landed.';
		}
		if (distinctLetters === 5) {
			return 'With five fully distinct letters and no repeats, the grid behaves predictably for players who commit to a strong opener.';
		}
		return 'Standard difficulty for a weekday slot, with the answer sitting in a common word family that a careful opener can narrow down.';
	})();

	const bodyHtml = solution
		? `<p>Wordle #${puzzleNumber} was published on ${dayName}, ${monthName} ${dayOfMonth}, ${yearNum}. It's the puzzle players around the world saw on that date, locked in at midnight local time and shared the next morning through the familiar yellow-and-green grid.</p>
<p>The answer was <strong>${solution.toUpperCase()}</strong>, a ${solution.length}-letter word that starts with <strong>${solution[0].toUpperCase()}</strong> and ends with <strong>${solution[solution.length - 1].toUpperCase()}</strong>.${
			editor ? ` It was chosen by ${editor}, the editor on duty for the ${monthName} ${dayOfMonth} slot.` : ''
		}</p>
<p>This particular answer carries ${wordStats?.vowels ?? 0} vowel${wordStats?.vowels === 1 ? '' : 's'} and ${consonants} consonant${consonants === 1 ? '' : 's'}, distributed across positions ${vowelPositions.length ? vowelPositions.join(', ') : '(none in standard vowel slots)'}. The word uses ${distinctLetters} distinct letter${distinctLetters === 1 ? '' : 's'}${wordStats?.repeat ? `, with ${topLetter?.[0].toUpperCase()} showing up ${topLetter?.[1]} time${topLetter?.[1] === 1 ? '' : 's'}` : ' with no repeats'}. ${difficultyNote}</p>
<p>If you're replaying this puzzle from the archive, start with a classic opener like CRANE, STARE, or ADIEU to nail the vowels in two moves. Once you know the shape, the suffix often gives the answer away. The day before this one was <strong>${prevSol || '(archived)'}</strong> and the day after was <strong>${nextSol || '(today route)'}</strong>, so comparing those three answers is a quick way to spot whether the editor leaned toward a particular stem or vowel pattern that week.</p>
<p>For more context, the Wordle archive on this site indexes every puzzle back to launch, so you can scan the surrounding week or jump straight to a specific date. The solver tool on the same site will run the same letter-frequency logic against any guess you throw at it, which makes it handy for working through a stale grid you've been sitting on.</p>`
		: '';

	// Week cluster: 3 days either side with descriptive anchors. Same-week pages
	// link each other, so crawlers and readers walk the date long-tail.
	interface WeekLink {
		href: string;
		label: string;
		isToday: boolean;
		isAdjacent: boolean;
		rel: 'prev' | 'next' | null;
	}
	const weekLinks: WeekLink[] = [];
	for (let offset = -3; offset <= 3; offset += 1) {
		if (offset === 0) continue;
		const d = new Date(date);
		d.setUTCDate(d.getUTCDate() + offset);
		const key = toArchiveDateKey(d);
		if (key < '2021-06-19' || key > todayKey) continue;
		if (key === todayKey) {
			weekLinks.push({ href: '/wordle-answer-today', label: "Today's Wordle answer", isToday: true, isAdjacent: true, rel: 'next' });
		} else {
			weekLinks.push({
				href: `/wordle-answer-for-${toMonthDayYearKey(d)}`,
				label: `Wordle answer for ${formatDate(d)}`,
				isToday: false,
				isAdjacent: Math.abs(offset) === 1,
				rel: offset === -1 ? 'prev' : offset === 1 ? 'next' : null
			});
		}
	}

	return {
		dateKey,
		formattedDate,
		solution,
		puzzleNumber,
		editor,
		schemas,
		title,
		description,
		canonicalUrl,
		prevDateKey,
		nextDateKey,
		nextIsToday,
		prevDateLabel,
		nextDateLabel,
		prose,
		wordStats,
		weekLinks,
		bodyHtml,
		dayName,
		isoDateKey
	};
};
