import {
	GAME_TYPES,
	formatFramedDate,
	getLatestFramedDateKey,
	getTodayFramedEntries
} from '$lib/framed';
import { fetchLiveFramedEntries } from '$lib/live-answer-sources';
import { getMainDailyDateKey } from '$lib/main-daily-date';
import {
	generateBreadcrumbSchema,
	generateSoftwareApplicationSchema,
	generateWebPageSchema
} from '$lib/seo';
import type { PageServerLoad } from './$types';

export const prerender = true;

function orderEntriesByGame<T extends { game: { key: string } }>(entries: T[]): T[] {
	const entryByGameKey = new Map(entries.map((entry) => [entry.game.key, entry]));
	return GAME_TYPES.map((game) => entryByGameKey.get(game.key)).filter(
		(entry): entry is T => entry !== undefined
	);
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	const targetDateKey = getMainDailyDateKey();
	let entries = getTodayFramedEntries(targetDateKey);

	if (entries.length < GAME_TYPES.length) {
		try {
			const liveEntries = await fetchLiveFramedEntries(targetDateKey);
			if (liveEntries.length > 0) {
				entries = orderEntriesByGame([...entries, ...liveEntries]);
			}
		} catch (error) {
			console.warn(
				`Unable to refresh Framed live answers for ${targetDateKey}:`,
				error instanceof Error ? error.message : String(error)
			);
		}
	}

	let displayDateKey = targetDateKey;
	let hasExactEntries = entries.length === GAME_TYPES.length;

	if (!hasExactEntries) {
		const latestKey = getLatestFramedDateKey();
		if (latestKey) {
			displayDateKey = latestKey;
			entries = getTodayFramedEntries(latestKey);
			hasExactEntries = entries.length === GAME_TYPES.length;
		}
	}

	const formattedDate = formatFramedDate(new Date(`${displayDateKey}T00:00:00Z`));
	// The title keeps the calendar date but drops the weekday prefix: the full
	// "<weekday>, <month> <day>, <year>" form plus a qualifier pushes the title past the
	// 30-60 character budget. The weekday still appears in the description, which has a
	// wider 140-158 budget.
	const titleDate = formattedDate.replace(/^[A-Za-z]+,\s*/, '');
	const pageTitle = hasExactEntries
		? `Framed Answer Today (${titleDate}) - Movie Answers`
		: `Framed Answer Today (${titleDate}) - Latest Answers`;
	const pageDescription = hasExactEntries
		? `Get today's Framed answers for ${formattedDate}, including Framed Classic, One Frame, Titleshot, and Poster movie titles, plus the archive.`
		: `Check whether the Framed answers for ${formattedDate} are ready yet, then use the Framed archive to look up older saved movie titles and scores.`;
	const pageUrl = 'https://wordsolverx.com/framed-answer-today';
	const isFallback = displayDateKey !== targetDateKey || !hasExactEntries;

	setHeaders({
		'X-Puzzle-Date': displayDateKey,
		...(isFallback ? { 'X-Edge-Cache-Bypass': '1' } : {})
	});

	const schemas = JSON.stringify([
		generateWebPageSchema('Framed Answers Today', pageDescription, pageUrl),
		generateSoftwareApplicationSchema('Framed Answers Today', 'UtilitiesApplication'),
		generateBreadcrumbSchema([
			{ name: 'Home', url: 'https://wordsolverx.com' },
			{ name: 'Today', url: 'https://wordsolverx.com/today' },
			{ name: 'Framed Answers Today', url: pageUrl }
		])
	]);

	return {
		entries,
		hasExactEntries,
		targetDateKey: displayDateKey,
		formattedDate,
		schemas,
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords: 'framed answers today, framed answer today, framed archive, one frame answer, titleshot answer, poster answer',
			canonical: pageUrl,
			featuredImage: '/images/framed-answer-today.webp'
		}
	};
};
