import { formatDate } from '$lib/utils';
import { getColordleDataForDate } from '$lib/colordle-date';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { generatePersonAuthorSchema } from '$lib/seo';
import { parseMonthDayYearKey, toArchiveDateKey, toMonthDayYearKey } from '$lib/archive-page';
import type { PageServerLoad } from './$types';

export const prerender = true;

const SITE_URL = 'https://wordsolverx.com';
const COLORDLE_START_DATE = new Date(Date.UTC(2023, 7, 7)); // Colordle #1: August 7, 2023
const COLOR_ANSWERS_API_BASE = 'https://color-answers-worker.colordle.workers.dev';

interface RecentAnswer {
	date: string;
	dayNumber: number;
	name: string;
	hex: string;
}

// Memoized across prerender entries so the live worker range is fetched exactly
// once per build instead of once per date page. The static snapshot can lag the
// live puzzle by a few days, so this backfills the most recent dates.
let recentAnswersPromise: Promise<RecentAnswer[]> | null = null;

function getRecentAnswers(): Promise<RecentAnswer[]> {
	if (!recentAnswersPromise) {
		const today = getPuzzleDateForGame('colordle');
		const from = new Date(today);
		from.setUTCDate(from.getUTCDate() - 120);
		const fromKey = toArchiveDateKey(from);
		const toKey = toArchiveDateKey(today);

		recentAnswersPromise = fetch(
			`${COLOR_ANSWERS_API_BASE}/api/colordle/range?from=${fromKey}&to=${toKey}`
		)
			.then((res) => (res.ok ? res.json() : []))
			.then(
				(
					rows: Array<{
						date: string;
						day_number: number;
						color_name: string;
						color_hex: string;
					}>
				) =>
					(rows ?? []).map((r) => ({
						date: String(r.date),
						dayNumber: Number(r.day_number) || 0,
						name: String(r.color_name),
						hex: String(r.color_hex)
					}))
			)
			.catch(() => []);
	}
	return recentAnswersPromise;
}

// Generate every Colordle date from launch up to YESTERDAY (never today — today lives
// on /colordle-answer-today). The URL slug is month-day-year, e.g. august-24-2023.
export function entries() {
	const today = getPuzzleDateForGame('colordle');
	const yesterday = new Date(today);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);

	const dates: { date: string }[] = [];
	const cursor = new Date(COLORDLE_START_DATE);
	while (cursor <= yesterday) {
		dates.push({ date: toMonthDayYearKey(cursor) });
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dates;
}

export const load: PageServerLoad = async ({ params }) => {
	const dateKey = params.date; // e.g. "august-24-2023"
	const date = parseMonthDayYearKey(dateKey);
	if (!date) {
		throw new Error(`Invalid date slug: ${dateKey}`);
	}

	const isoDateKey = toArchiveDateKey(date); // e.g. "2023-08-24"
	const formattedDate = formatDate(date);

	// Primary: static snapshot. Fallback: live worker for the most recent dates.
	let colorName: string | null = null;
	let colorHex: string | null = null;
	let dayNum: number | null = null;

	const staticData = getColordleDataForDate(date);
	if (staticData?.color) {
		colorName = staticData.color.name;
		colorHex = staticData.color.hex;
		dayNum = staticData.dayNum ?? null;
	}

	if (!colorName) {
		const recent = await getRecentAnswers();
		const match = recent.find((r) => r.date === isoDateKey);
		if (match) {
			colorName = match.name;
			colorHex = match.hex;
			dayNum = match.dayNumber || null;
		}
	}

	const title = colorName
		? `Colordle Answer for ${formattedDate} - ${colorName}${colorHex ? ` (${colorHex})` : ''}`
		: `Colordle Answer for ${formattedDate}`;
	const description = colorName
		? `The Colordle answer for ${formattedDate} was ${colorName}${colorHex ? ` with hex code ${colorHex}` : ''}. See the daily color solution and details.`
		: `Find the Colordle answer for ${formattedDate} with the daily color name and hex code.`;
	const canonicalUrl = `${SITE_URL}/colordle-answer-for-${dateKey}`;

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

	const faqSchema = colorName
		? {
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: [
					{
						'@type': 'Question',
						name: `What was the Colordle answer on ${formattedDate}?`,
						acceptedAnswer: {
							'@type': 'Answer',
							text: `The Colordle answer for ${formattedDate} was ${colorName}${colorHex ? ` with hex code ${colorHex}` : ''}.`
						}
					}
				]
			}
		: null;

	const schemas = JSON.stringify([articleSchema, ...(faqSchema ? [faqSchema] : [])]);

	return {
		dateKey,
		formattedDate,
		colorName,
		colorHex,
		dayNum,
		schemas,
		title,
		description,
		canonicalUrl
	};
};
