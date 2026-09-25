// src/routes/(interactive)/marveldle-answer-yesterday/+page.server.ts
// Same integration precondition as marveldle-answer-today (see
// INTEGRATION-NOTES-A.md): 'marveldle' in the PuzzleGame union + config.

import { format } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { MarveldleDayEntry } from '$lib/marveldle/types';
import answersRaw from '$lib/data/marveldle-answers.json';
import type { PageServerLoad } from './$types';

const answers = answersRaw as Record<string, MarveldleDayEntry>;
const SITE_URL = 'https://wordsolverx.com';
const CANONICAL = `${SITE_URL}/marveldle-answer-yesterday`;

function formatSeoDate(dateStr: string): string {
	const date = new Date(`${dateStr}T12:00:00Z`);
	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	const today = getPuzzleDateForGame('marveldle');
	const yesterday = new Date(today.getTime() - 86400000);
	const dateKey = format(yesterday, 'yyyy-MM-dd');
	const entry = answers[dateKey] ?? null;

	if (!entry || entry.date !== dateKey || !entry.comics || !entry.mcu) {
		setHeaders({ 'X-Puzzle-Date': dateKey, 'X-Edge-Cache-Bypass': '1' });
		return {
			error: true,
			entry: null,
			formattedDate: formatSeoDate(dateKey),
			visibleDateKey: dateKey,
			publishedDate: `${dateKey}T00:00:00Z`,
			schemas: null,
			meta: {
				title: `Marveldle Answer Yesterday (${format(yesterday, 'MMM d')}) | WordSolverX`,
				description: `Yesterday's Marveldle answers for ${formatSeoDate(dateKey)} are not available yet. Check today's answers or browse the archive.`,
				keywords: 'marveldle answer yesterday, marveldle yesterday answer, marveldle archive',
				socialImage: `${SITE_URL}/wordsolverx.webp`
			}
		};
	}

	setHeaders({ 'X-Puzzle-Date': dateKey });

	const comics = entry.comics!;
	const mcu = entry.mcu!;
	const formattedDate = formatSeoDate(entry.date);

	const pageTitle = `Marveldle Answer Yesterday (${format(yesterday, 'MMM d')}) | WordSolverX`;
	// Tease — never the character names in title or description.
	const pageDescription = `Yesterday's Marveldle answers: both verified characters, Comics and MCU, with full attribute cards. Browse every past pair in the archive at WordSolverX.`;
	const pageKeywords = `marveldle answer yesterday, marveldle yesterday answer, marveldle ${formattedDate}, marveldle archive`;

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Marveldle Answer Today', item: `${SITE_URL}/marveldle-answer-today` },
			{ '@type': 'ListItem', position: 3, name: 'Marveldle Answer Yesterday', item: CANONICAL }
		]
	};
	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: `Marveldle Answers for Yesterday (${formattedDate})`,
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

	return {
		error: false,
		entry,
		formattedDate,
		visibleDateKey: entry.date,
		publishedDate: `${entry.date}T00:00:00Z`,
		schemas: JSON.stringify([articleSchema, breadcrumbSchema]),
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords: pageKeywords,
			socialImage: `${SITE_URL}/wordsolverx.webp`
		}
	};
};
