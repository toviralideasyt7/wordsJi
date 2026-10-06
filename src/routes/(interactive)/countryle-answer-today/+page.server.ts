import { getCountryleArchiveDates, getCountryleArchiveEntry, getCountryleToday } from '$lib/countryle-data';
import { fetchLiveCountryleToday } from '$lib/live-answer-sources';
import { getMainDailyDateKey } from '$lib/main-daily-date';
import { format, subDays } from 'date-fns';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
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
	// Stream 4 (2026-10-06): shared daily title/stamp. Number falls back to the
	// date key itself when no game number is known — never fabricated.
	const puzzleNumber: string | number = today?.gameNumber ?? displayDateKey;
	const pageTitle = dailyAnswerTitle('Countryle', puzzleNumber, formattedDate);
	const updatedStamp = updatedStampText('Countryle', puzzleNumber, formattedDate);
	const pageDescription = today
		? `Get today's Countryle answer for ${formattedDate}. See the country, the key clues, and quick links to the Countryle archive and the Countryle solver.`
		: 'Get the Countryle answer for today, plus the country clues, the archive, and the Countryle solver.';
	const pageUrl = 'https://wordsolverx.com/countryle-answer-today';
	const isFallback = displayDateKey !== targetDateKey;

	// FAQPage (wordle pattern): the updated-stamp Q&A feeds its own schema node
	// because the page-level strip removes FAQPage from data.schemas.
	const hintFaqs = [{ question: 'When was this page last updated?', answer: updatedStamp }];
	const faqSchemaJson = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: hintFaqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	});

	// AI hint cards: deterministic letter analysis merged with any stored hints.
	const aiHints = mergeHints(today?.country.country ?? '', getAIHints('countryle', targetDateKey));

	// Yesterday's entry comes from the real archive — never fabricated.
	const yesterdayKey = format(subDays(new Date(`${displayDateKey}T12:00:00Z`), 1), 'yyyy-MM-dd');
	const yesterdayEntry = recentEntriesWithToday.find((entry) => entry.date === yesterdayKey);
	const yesterday = yesterdayEntry
		? {
				number: yesterdayEntry.gameNumber,
				dateLong: formatDisplayDate(yesterdayEntry.date),
				answer: yesterdayEntry.country.country
			}
		: null;

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
		yesterday,
		formattedDate,
		updatedStamp,
		hintFaqs,
		faqSchemaJson,
		aiHints,
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
