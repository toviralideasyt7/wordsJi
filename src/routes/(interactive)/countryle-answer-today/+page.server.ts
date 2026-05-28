import { getCountryleArchiveDates, getCountryleArchiveEntry, getCountryleToday } from '$lib/countryle-data';
import { fetchLiveCountryleToday } from '$lib/live-answer-sources';
import { getMainDailyDateKey } from '$lib/main-daily-date';
import {
	generateBreadcrumbSchema,
	generateSoftwareApplicationSchema,
	generateWebPageSchema
} from '$lib/seo';
import type { PageServerLoad } from './$types';

export const prerender = true;

function formatDisplayDate(dateKey: string): string {
	return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	const targetDateKey = getMainDailyDateKey();
	let today = getCountryleToday(targetDateKey);

	if (!today || today.date !== targetDateKey) {
		try {
			const liveToday = await fetchLiveCountryleToday(targetDateKey);
			if (liveToday) {
				today = liveToday;
			}
		} catch (error) {
			console.warn(
				`Unable to refresh Countryle live answer for ${targetDateKey}:`,
				error instanceof Error ? error.message : String(error)
			);
		}
	}

	const displayDateKey = today?.date ?? targetDateKey;
	const recentEntries = getCountryleArchiveDates()
		.slice(0, 10)
		.map((dateKey) => getCountryleArchiveEntry(dateKey))
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
	const recentEntriesWithToday =
		today && !recentEntries.some((entry) => entry.date === today?.date)
			? [{ date: today.date, gameNumber: today.gameNumber, country: today.country }, ...recentEntries].slice(0, 10)
			: recentEntries;

	const formattedDate = formatDisplayDate(displayDateKey);
	const pageTitle = `Countryle Answer Today (${formattedDate}) - Country Answer and Clues`;
	const pageDescription = today
		? `Get today's Countryle answer for ${formattedDate}. See the country, key clues, and quick links to the archive and Countryle solver.`
		: "Get today's Countryle answer, archive access, and the Countryle solver.";
	const pageUrl = 'https://wordsolverx.com/countryle-answer-today';
	const isFallback = displayDateKey !== targetDateKey;

	setHeaders({
		'X-Puzzle-Date': displayDateKey,
		...(isFallback ? { 'X-Edge-Cache-Bypass': '1' } : {})
	});

	const schemas = JSON.stringify([
		generateWebPageSchema('Countryle Answer Today', pageDescription, pageUrl),
		generateSoftwareApplicationSchema('Countryle Answer Today', 'UtilitiesApplication'),
		generateBreadcrumbSchema([
			{ name: 'Home', url: 'https://wordsolverx.com' },
			{ name: 'Today', url: 'https://wordsolverx.com/today' },
			{ name: 'Countryle Answer Today', url: pageUrl }
		])
	]);

	return {
		today,
		recentEntries: recentEntriesWithToday,
		formattedDate,
		schemas,
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords: 'countryle answer today, countryle answer, countryle archive, countryle solver, countryle country today',
			canonical: pageUrl,
			featuredImage: '/images/countryle-answer-today.webp'
		}
	};
};
