// src/routes/(interactive)/marveldle-answer-today/+page.server.ts
// INTEGRATION PRECONDITION (see INTEGRATION-NOTES-A.md): the PuzzleGame
// union and PUZZLE_WINDOW_CONFIG in src/lib/puzzle-window.ts must include
// 'marveldle' — { group: 'gamedle', timezone: 'worker-latest',
// sourceReadiness: 'latest-payload', boundaryHourUtc: 6, boundaryMinuteUtc: 2 }.
//
// Marveldle CANNOT publish at the 16:30 UTC early slot: its answers are
// upstream-picked (US-midnight release), so tomorrow's character does not
// exist until upstream releases it. 06:02 UTC is 1-2h after the swap.

import { format, subDays } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import type { MarveldleDayEntry } from '$lib/marveldle/types';
import answersRaw from '$lib/data/marveldle-answers.json';
import type { PageServerLoad } from './$types';

const answers = answersRaw as Record<string, MarveldleDayEntry>;
const SITE_URL = 'https://wordsolverx.com';
const CANONICAL = `${SITE_URL}/marveldle-answer-today`;

function formatSeoDate(dateStr: string): string {
	const date = new Date(`${dateStr}T12:00:00Z`);
	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function decadeOf(year?: number): string {
	if (!year) return 'an unknown year';
	const d = Math.floor(year / 10) * 10;
	return `the ${d}s`;
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	const today = getPuzzleDateForGame('marveldle');
	const dateKey = format(today, 'yyyy-MM-dd');
	const entry = answers[dateKey] ?? null;
	// Yesterday's answers render inline on this page (no separate yesterday route).
	const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');
	const yesterday = answers[yesterdayKey] ?? null;

	// Staleness guard (Canuckle pattern): Marveldle's solver runs at 06:05 UTC,
	// three minutes after the 06:02 page flip, and takes 2-5 minutes. Until the
	// new entry lands, the page renders its "updating" state — it never shows
	// yesterday's characters labeled as today's.
	const isStale = !entry || entry.date !== dateKey || !entry.comics || !entry.mcu;
	if (isStale) {
		setHeaders({ 'X-Puzzle-Date': dateKey, 'X-Edge-Cache-Bypass': '1' });
		const staleDate = formatSeoDate(dateKey);
		return {
			error: true,
			isStale: true,
			entry: null,
			yesterday: null,
			recent: [],
			formattedDate: staleDate,
			visibleDateKey: dateKey,
			publishedDate: `${dateKey}T00:00:00Z`,
			hintFaqs: [],
			schemas: null,
			meta: {
				title: `Marveldle Answer Today (${format(today, 'MMM d')}) | WordSolverX`,
				description: `Today's Marveldle answers for ${staleDate} are still being solved. Check back shortly for the confirmed Comics and MCU characters and hints.`,
				keywords: 'marveldle answer today, marveldle answer, marveldle hint today, marvel wordle',
				socialImage: `${SITE_URL}/wordsolverx.webp`
			}
		};
	}

	setHeaders({ 'X-Puzzle-Date': dateKey, 'X-Edge-Cache-Bypass': '0' });

	const comics = entry.comics!;
	const mcu = entry.mcu!;
	const formattedDate = formatSeoDate(entry.date);
	const shortDate = format(today, 'MMM d');

	// Stream 4 (2026-10-06): shared daily title/stamp. Marveldle has no upstream
	// puzzle number, so the puzzle date key is the identifier.
	const pageTitle = dailyAnswerTitle('Marveldle', dateKey, formattedDate);
	const updatedStamp = updatedStampText('Marveldle', dateKey, formattedDate);
	// Tease with hints — never the character names in title or description.
	// Template stays inside the 140-158 budget across decade/appearance lengths.
	const pageDescription = `Marveldle hints (${shortDate}): Comics debuted in ${decadeOf(comics.apparitionYear)}, MCU appears in ${(mcu.appearanceTypes ?? []).join(' and ').toLowerCase() || 'film and TV'}. Daily clues for both modes and the confirmed answers at WordSolverX.`;
	const pageKeywords = `marveldle answer today, marveldle answer, marveldle hint, marveldle hint today, marveldle mcu answer, marveldle comics answer, marveldle answer for ${formattedDate}`;

	const hintFaqs = [
		{
			question: `What are the Marveldle answers for today, ${formattedDate}?`,
			answer: `Today's Marveldle answers for ${formattedDate} are ${comics.name} in Comics mode and ${mcu.name} in MCU mode.`
		},
		{
			question: `Who is today's Marveldle Comics character?`,
			answer: `Today's Marveldle Comics answer is ${comics.name}, a ${comics.gender.toLowerCase()} ${comics.type.toLowerCase()} from ${comics.origin} who first appeared in ${comics.apparitionYear ?? 'an unknown year'}.`
		},
		{
			question: `Who is today's Marveldle MCU character?`,
			answer: `Today's Marveldle MCU answer is ${mcu.name}, played by ${mcu.actorName ?? 'an unknown actor'}, appearing in ${(mcu.appearanceTypes ?? []).join(' and ') || 'the MCU'}.`
		},
		{
			question: `What are today's Marveldle hints?`,
			answer: `Comics hint: think ${decadeOf(comics.apparitionYear)} debut, ${comics.origin} origin. MCU hint: ${(mcu.appearanceTypes ?? []).join('/').toLowerCase() || 'screen'} appearance with ${(mcu.affiliations ?? []).slice(0, 2).join(' and ') || 'a notable'} affiliation.`
		},
		{
			question: 'When does Marveldle update?',
			answer: 'Marveldle releases a new pair of characters around midnight US time each day, and this page is updated with the confirmed answers every morning.'
		},
		{
			question: 'What is the difference between Marveldle Comics and MCU mode?',
			answer: 'Comics mode draws from Marvel comic-book characters and scores the year of first appearance; MCU mode draws from the Marvel Cinematic Universe and scores appearance type, teams, and the actor instead.'
		},
		{
			question: 'When was this page last updated?',
			answer: updatedStamp
		}
	];

	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: hintFaqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	};
	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: `Marveldle Hints and Answers for Today (${formattedDate})`,
		description: pageDescription,
		datePublished: `${entry.date}T00:00:00Z`,
		dateModified: entry.solvedAt,
		author: {
			'@type': 'Person',
			name: 'Preston Hayes',
			url: 'https://wordsolverx.com/about#preston-hayes',
			image: 'https://wordsolverx.com/author-wordsolverx.webp'
		},
		publisher: { '@type': 'Organization', name: 'WordSolverX' },
		mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL }
	};
	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Today', item: `${SITE_URL}/today` },
			{ '@type': 'ListItem', position: 3, name: 'Marveldle Answer Today', item: CANONICAL }
		]
	};

	const sortedKeys = Object.keys(answers).sort().reverse();
	const recent = sortedKeys.slice(0, 8).map((k) => answers[k]);

	return {
		error: false,
		isStale: false,
		entry,
		yesterday,
		recent,
		formattedDate,
		visibleDateKey: entry.date,
		publishedDate: `${entry.date}T00:00:00Z`,
		updatedStamp,
		hints: {
			comics: {
				decade: decadeOf(comics.apparitionYear),
				origin: comics.origin,
				type: comics.type,
				gender: comics.gender,
				firstTitle: comics.firstApparitionComicTitle
			},
			mcu: {
				appearances: (mcu.appearanceTypes ?? []).join(' / ') || '—',
				origin: mcu.origin,
				type: mcu.type,
				gender: mcu.gender,
				affiliations: (mcu.affiliations ?? []).slice(0, 3)
			}
		},
		// AI hint cards: merged against the Comics name, which is what the
		// stored hint content describes (see scripts/generate-ai-hints.mjs).
		aiHints: mergeHints(comics.name, getAIHints('marveldle', dateKey)),
		hintFaqs,
		schemas: JSON.stringify([faqSchema, articleSchema, breadcrumbSchema]),
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords: pageKeywords,
			socialImage: `${SITE_URL}/wordsolverx.webp`
		}
	};
};
