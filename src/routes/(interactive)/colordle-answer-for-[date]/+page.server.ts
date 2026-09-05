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
		? `The Colordle answer for ${formattedDate}${dayNum ? ` (day ${dayNum})` : ''} was ${colorName}${colorHex ? ` with hex code ${colorHex}` : ''}. See hints, the daily color solution, and more answers from this week.`
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
					},
					...(dayNum
						? [
								{
									'@type': 'Question',
									name: `What was Colordle day ${dayNum}?`,
									acceptedAnswer: {
										'@type': 'Answer',
										text: `Colordle day ${dayNum}, published ${formattedDate}, was ${colorName}${colorHex ? ` with hex code ${colorHex}` : ''}.`
									}
								}
							]
						: [])
				]
			}
		: null;

	const schemas = JSON.stringify([articleSchema, ...(faqSchema ? [faqSchema] : [])]);

	// Prev/next-day navigation: dated pages run START..yesterday, "today" lives on
	// /colordle-answer-today. The day after yesterday resolves to the today route so
	// the chain never dead-ends and crawlers can walk the full archive.
	const todayPuzzle = getPuzzleDateForGame('colordle');
	const todayKey = toArchiveDateKey(todayPuzzle);
	const prevDate = new Date(date);
	prevDate.setUTCDate(prevDate.getUTCDate() - 1);
	const nextDate = new Date(date);
	nextDate.setUTCDate(nextDate.getUTCDate() + 1);
	const prevKey = toArchiveDateKey(prevDate);
	const nextKey = toArchiveDateKey(nextDate);
	const prevDateKey = prevKey >= '2023-08-07' ? toMonthDayYearKey(prevDate) : null;
	const nextDateKey = nextKey < todayKey ? toMonthDayYearKey(nextDate) : null;
	const nextIsToday = nextKey === todayKey;

	// Color facts computed from the hex itself: unique per page, distinct
	// indexable text on every dated URL for Bing.
	function hexToRgb(hex: string): [number, number, number] | null {
		const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!m) return null;
		return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
	}

	function hueFamily(hex: string): string {
		const rgb = hexToRgb(hex);
		if (!rgb) return 'neutral';
		const [r, g, b] = rgb.map((v) => v / 255);
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;
		if (delta < 0.1) return max < 0.3 ? 'dark neutral' : max > 0.7 ? 'light neutral' : 'neutral';
		let hue = 0;
		if (max === r) hue = ((g - b) / delta) % 6;
		else if (max === g) hue = (b - r) / delta + 2;
		else hue = (r - g) / delta + 4;
		hue = ((hue * 60) + 360) % 360;
		if (hue < 30 || hue >= 330) return 'red';
		if (hue < 70) return 'orange';
		if (hue < 90) return 'yellow';
		if (hue < 160) return 'green';
		if (hue < 200) return 'cyan';
		if (hue < 260) return 'blue';
		if (hue < 300) return 'purple';
		return 'pink';
	}

	const rgb = colorHex ? hexToRgb(colorHex) : null;
	const colorFacts =
		colorName && colorHex && rgb
			? {
					family: hueFamily(colorHex),
					rgbLabel: `RGB ${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
					shortHex: colorHex.slice(0, 4).toUpperCase(),
					brightness: Math.round((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 255),
					warmth: rgb[0] >= rgb[2] ? 'warm-leaning' : 'cool-leaning'
				}
			: null;

	const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
	const dayOfMonth = date.getUTCDate();
	const monthName = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
	const yearNum = date.getUTCFullYear();

	const prevColorDate = new Date(date);
	prevColorDate.setUTCDate(prevColorDate.getUTCDate() - 1);
	const nextColorDate = new Date(date);
	nextColorDate.setUTCDate(nextColorDate.getUTCDate() + 1);

	const recent = await getRecentAnswers();
	const prevColorMatch = recent.find((r) => r.date === toArchiveDateKey(prevColorDate));
	const nextColorMatch = recent.find((r) => r.date === toArchiveDateKey(nextColorDate));
	const prevColor = prevColorMatch?.name ?? '';
	const nextColor = nextColorMatch?.name ?? '';

	const familyDescriptions: Record<string, { use: string; vibe: string }> = {
		red: {
			use: 'warm primaries in branding, alerts, and accent UI',
			vibe: 'high-energy, attention-grabbing, appetite-linked'
		},
		orange: {
			use: 'friendly call-to-action buttons, autumn palettes, and food photography',
			vibe: 'playful, warm, and approachable'
		},
		yellow: {
			use: 'highlight markers, hazard signage, and cheerful landing pages',
			vibe: 'sunny, optimistic, hard to ignore on white backgrounds'
		},
		green: {
			use: 'eco and finance branding, growth metrics, and outdoor interfaces',
			vibe: 'calm, balanced, and reassuring'
		},
		cyan: {
			use: 'tech and water themes, link colors, and clean dashboards',
			vibe: 'cool, modern, and slightly clinical'
		},
		blue: {
			use: 'corporate identity, sky backgrounds, and trust signals',
			vibe: 'steady, professional, and dependable'
		},
		purple: {
			use: 'luxury goods, creative tools, and mystical themes',
			vibe: 'rich, imaginative, and slightly regal'
		},
		pink: {
			use: 'fashion branding, soft product UI, and social platform accents',
			vibe: 'soft, expressive, and contemporary'
		},
		neutral: {
			use: 'typography, surfaces, and quiet background fills',
			vibe: 'balanced, restrained, and design-system friendly'
		},
		'light neutral': {
			use: 'paper backgrounds, off-white cards, and minimal product chrome',
			vibe: 'airy, clean, and unobtrusive'
		},
		'dark neutral': {
			use: 'editorial dark mode, charcoal backdrops, and dense data UIs',
			vibe: 'serious, premium, and easy on the eyes in low light'
		}
	};
	const familyInfo = colorFacts ? familyDescriptions[colorFacts.family] : null;
	const brightnessNote =
		colorFacts && colorFacts.brightness < 64
			? 'A darker shade that reads well on light backgrounds but can swallow text placed on top without enough contrast.'
			: colorFacts && colorFacts.brightness > 192
				? 'A bright shade that pops on dark canvases and works as a highlight, though it can feel harsh on large fills.'
				: 'A middle-brightness value that pairs comfortably with both light and dark surfaces.';

	const bodyHtml = colorName && colorHex
		? `<p>Colordle ${dayNum ? `#${dayNum}` : `for ${formattedDate}`} was published on ${dayName}, ${monthName} ${dayOfMonth}, ${yearNum}. The daily puzzle resets at midnight in the player's local time, so the color you'd see on that calendar day depends on where you opened it.</p>
<p>The answer was <strong>${colorName}</strong> at hex code <strong>${colorHex.toUpperCase()}</strong>, decoding to <strong>${colorFacts?.rgbLabel}</strong>. That puts it in the <strong>${colorFacts?.family}</strong> family, which designers typically reach for when they need ${familyInfo?.use ?? 'a versatile accent'}. The tone reads as ${familyInfo?.vibe ?? 'a flexible neutral you can pair with most palettes'}.</p>
<p>On the brightness scale, ${colorName} scores roughly ${colorFacts?.brightness} out of 255, making it ${brightnessNote} It's also ${colorFacts?.warmth}, so it will play nicely against ${colorFacts?.warmth === 'warm-leaning' ? 'cool blues and grays as a contrast accent' : 'warm oranges and yellows as a counterweight'} in most layouts. If you're trying to recreate this color in Figma, Photoshop, or a CSS variable, copy the hex directly; if you need screen-space matching, the RGB triplet above lands you on the same swatch.</p>
<p>The day before this puzzle was <strong>${prevColor || '(archived)'}</strong>${prevColor ? `, and the day after was <strong>${nextColor || '(today route)'}</strong>` : ''}. Scanning a short run of recent answers is a useful way to see whether the curator has been leaning toward a particular palette that week, and it gives you a baseline for guessing future puzzles when a hex doesn't ring a bell. The full archive on this site indexes every Colordle back to launch, so you can flip through months at a time.</p>
<p>For working solvers, the Colordle helper on this site applies the same RGB distance math the official game uses, so you can plug a guess into it and get a near-match back without burning through your daily attempts.</p>`
		: '';

	// Week cluster: 3 days either side with descriptive anchors. Same-week pages
	// link each other, so crawlers and readers walk the date long-tail.
	interface WeekLink {
		href: string;
		label: string;
		isToday: boolean;
		rel: 'prev' | 'next' | null;
	}
	const weekLinks: WeekLink[] = [];
	for (let offset = -3; offset <= 3; offset += 1) {
		if (offset === 0) continue;
		const d = new Date(date);
		d.setUTCDate(d.getUTCDate() + offset);
		const key = toArchiveDateKey(d);
		if (key < '2023-08-07' || key > todayKey) continue;
		if (key === todayKey) {
			weekLinks.push({ href: '/colordle-answer-today', label: "Today's Colordle answer", isToday: true, rel: 'next' });
		} else {
			weekLinks.push({
				href: `/colordle-answer-for-${toMonthDayYearKey(d)}`,
				label: `Colordle answer for ${formatDate(d)}`,
				isToday: false,
				rel: offset === -1 ? 'prev' : offset === 1 ? 'next' : null
			});
		}
	}

	return {
		dateKey,
		formattedDate,
		colorName,
		colorHex,
		dayNum,
		schemas,
		title,
		description,
		canonicalUrl,
		prevDateKey,
		nextDateKey,
		nextIsToday,
		colorFacts,
		weekLinks,
		bodyHtml,
		dayName,
		isoDateKey
	};
};
