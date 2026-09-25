// src/routes/(interactive)/marveldle-archive/+page.server.ts
import type { MarveldleDayEntry } from '$lib/marveldle/types';
import answersRaw from '$lib/data/marveldle-answers.json';
import type { PageServerLoad } from './$types';

const answers = answersRaw as Record<string, MarveldleDayEntry>;
const SITE_URL = 'https://wordsolverx.com';
const CANONICAL = `${SITE_URL}/marveldle-archive`;

export const load: PageServerLoad = async () => {
	const entries = Object.keys(answers)
		.sort()
		.reverse()
		.map((k) => {
			const e = answers[k];
			return {
				date: e.date,
				comics: e.comics?.name ?? '—',
				comicsType: e.comics?.type ?? '',
				mcu: e.mcu?.name ?? '—',
				mcuType: e.mcu?.type ?? ''
			};
		});

	const pageTitle = 'Marveldle Archive: Every Past Answer | WordSolverX';
	const pageDescription =
		'Every past Marveldle answer: Comics and MCU characters for each day, searchable by name. Spot patterns and never miss a pair again at WordSolverX.';
	const pageKeywords =
		'marveldle archive, marveldle answers, marveldle past answers, marveldle answer history';

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Marveldle Answer Today', item: `${SITE_URL}/marveldle-answer-today` },
			{ '@type': 'ListItem', position: 3, name: 'Marveldle Archive', item: CANONICAL }
		]
	};

	return {
		entries,
		count: entries.length,
		schemas: JSON.stringify([breadcrumbSchema]),
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords: pageKeywords,
			socialImage: `${SITE_URL}/wordsolverx.webp`
		}
	};
};
