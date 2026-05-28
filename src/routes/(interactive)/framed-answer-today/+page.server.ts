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
	generateFAQSchema,
	generateHowToSchema,
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
	const pageTitle = hasExactEntries
		? `Framed Answer Today (${formattedDate}) - Movie Answers for All Modes`
		: `Framed Answer Today (${formattedDate}) - Latest Saved Movie Answers`;
	const pageDescription = hasExactEntries
		? `Get today's Framed answers for ${formattedDate}, including Framed Classic, One Frame, Titleshot, and Poster puzzle titles from our verified answer records.`
		: `Check whether the Framed answers for ${formattedDate} are ready yet, then use the archive if you need older saved movie titles.`;
	const pageUrl = 'https://wordsolverx.com/framed-answer-today';
	const isFallback = displayDateKey !== targetDateKey || !hasExactEntries;

	setHeaders({
		'X-Puzzle-Date': displayDateKey,
		...(isFallback ? { 'X-Edge-Cache-Bypass': '1' } : {})
	});

	const schemas = JSON.stringify([
		generateWebPageSchema('Framed Answers Today', pageDescription, pageUrl),
		generateSoftwareApplicationSchema('Framed Answers Today', 'UtilitiesApplication'),
		generateHowToSchema('How to use the Framed answers today page', [
			{
				name: 'Check the current date',
				text: "Open the page to see the saved answer cards for today's Framed modes."
			},
			{ name: 'Open the archive', text: 'Use the archive link to inspect older Framed puzzle dates.' },
			{
				name: 'Verify after playing',
				text: 'Use the title cards to confirm your guesses once you are done playing Framed.'
			}
		]),
		generateBreadcrumbSchema([
			{ name: 'Home', url: 'https://wordsolverx.com' },
			{ name: 'Today', url: 'https://wordsolverx.com/today' },
			{ name: 'Framed Answers Today', url: pageUrl }
		]),
		generateFAQSchema([
			{
				question: `What are the Framed answers for ${formattedDate}?`,
				answer: hasExactEntries
					? `The page lists today's saved Framed answers for ${entries.map((entry) => entry.game.label).join(', ')}.`
					: "Today's exact Framed answers are not available yet. Check back shortly or use the archive for older saved dates."
			},
			{
				question: 'Which Framed modes are included?',
				answer: 'The page includes Framed Classic, One Frame, Titleshot, and Poster.'
			},
			{
				question: 'Can I browse older Framed answers?',
				answer: 'Yes. Use the Framed archive page to select older dates and reveal the saved movie titles for each mode.'
			}
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
