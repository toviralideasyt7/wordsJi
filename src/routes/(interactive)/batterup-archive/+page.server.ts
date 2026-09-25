// src/routes/(interactive)/batterup-archive/+page.server.ts
import { getTeamDivision } from '$lib/batterup/solver';
import type { BatterUpDayEntry } from '$lib/batterup/solver';
import answersRaw from '$lib/data/batterup-answers.json';
import type { PageServerLoad } from './$types';

const answers = answersRaw as Record<string, BatterUpDayEntry>;
const SITE_URL = 'https://wordsolverx.com';
const CANONICAL = `${SITE_URL}/batterup-archive`;

export const load: PageServerLoad = async () => {
	const entries = Object.keys(answers)
		.sort()
		.reverse()
		.map((k) => {
			const e = answers[k];
			return {
				date: e.date,
				gameNumber: e.gameNumber,
				name: e.player.player_name,
				team: e.player.team_name,
				division: getTeamDivision(e.player.team_name),
				position: e.player.position[0],
				jersey: e.player.jersey_number
			};
		});

	const pageTitle = 'Batter Up Archive: Every Answer Since 2024 | WordSolverX';
	const pageDescription =
		'Every Batter Up answer in one place: game number, date, player, team and position. Search the full archive of the daily MLB guessing game at WordSolverX.';
	const pageKeywords =
		'batter up archive, batter up answers, batter up past answers, batter up answer history, mlb guessing game archive';

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Batter Up Answer Today', item: `${SITE_URL}/batterup-answer-today` },
			{ '@type': 'ListItem', position: 3, name: 'Batter Up Archive', item: CANONICAL }
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
