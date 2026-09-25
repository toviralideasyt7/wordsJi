// src/routes/(interactive)/batterup-answer-today/+page.server.ts
// INTEGRATION PRECONDITION (see INTEGRATION-NOTES-A.md): the PuzzleGame
// union and PUZZLE_WINDOW_CONFIG in src/lib/puzzle-window.ts must include
// 'batterup' — { group: 'main', timezone: 'worker-latest',
// sourceReadiness: 'latest-payload', boundaryHourUtc: 1, boundaryMinuteUtc: 0 }.
// Until then this load does not typecheck; it is written against that config.

import { format, subDays } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { getTeamDivision, getLeague, calculateAge } from '$lib/batterup/solver';
import type { BatterUpDayEntry } from '$lib/batterup/solver';
import answersRaw from '$lib/data/batterup-answers.json';
import type { PageServerLoad } from './$types';

const answers = answersRaw as Record<string, BatterUpDayEntry>;
const SITE_URL = 'https://wordsolverx.com';
const CANONICAL = `${SITE_URL}/batterup-answer-today`;

const POSITION_WORDS: Record<string, string> = {
	'1B': 'first base',
	'2B': 'second base',
	'3B': 'third base',
	SS: 'shortstop',
	LF: 'left field',
	CF: 'center field',
	RF: 'right field',
	C: 'catcher',
	DH: 'designated hitter'
};

function tensWord(n: number | null): string {
	if (n === null) return 'single digits';
	const t = Math.floor(n / 10);
	const words = ['single digits', 'the teens', 'the 20s', 'the 30s', 'the 40s', 'the 50s', 'the 60s', 'the 70s', 'the 80s', 'the 90s'];
	return words[t] ?? 'the 90s';
}

function formatSeoDate(dateStr: string): string {
	const date = new Date(`${dateStr}T12:00:00Z`);
	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	const today = getPuzzleDateForGame('batterup');
	const dateKey = format(today, 'yyyy-MM-dd');
	const entry = answers[dateKey] ?? null;
	// Yesterday's answer renders inline on this page.
	const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');
	const yesterday = answers[yesterdayKey] ?? null;

	// Staleness guard (Canuckle pattern): if the payload date is not the
	// expected window date, the page renders its "updating" state — never
	// yesterday's player labeled as today's answer.
	if (!entry || entry.date !== dateKey) {
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
				title: `Batter Up Answer Today (${format(today, 'MMM d')}) | WordSolverX`,
				description: `Today's Batter Up answer for ${staleDate} is still being verified. Check back shortly for the confirmed MLB player, hints and the full player card.`,
				keywords: 'batter up answer today, batter up answer, batter up mlb, batter up hint today',
				socialImage: `${SITE_URL}/wordsolverx.webp`
			}
		};
	}

	setHeaders({ 'X-Puzzle-Date': dateKey, 'X-Edge-Cache-Bypass': '0' });

	const player = entry.player;
	const formattedDate = formatSeoDate(entry.date);
	const shortDate = format(today, 'MMM d');
	const position = POSITION_WORDS[player.position[0]] ?? player.position[0].toLowerCase();
	const division = getTeamDivision(player.team_name);
	const league = getLeague(division);
	const age = calculateAge(player.birth_date);

	const pageTitle = `Batter Up Answer Today #${entry.gameNumber} (${shortDate}) | WordSolverX`;
	// Tease with hints — never the player name in title or description.
	// Template keeps the description inside the 140-158 budget for the full
	// range of position/team/jersey lengths (worst cases: ~130-157).
	const pageDescription = `Batter Up hints (${shortDate}): today's ${position} for the ${player.team_name}, jersey in ${tensWord(player.jersey_number)}. Daily MLB clues and the confirmed answer at WordSolverX.`;
	const pageKeywords = `batter up answer today, batter up answer, batter up mlb answer today, batter up hint, batter up hint today, batter up solver, batter up answer for ${formattedDate}`;

	const hintFaqs = [
		{
			question: `What is the Batter Up answer for today, ${formattedDate}?`,
			answer: `The Batter Up answer for today, ${formattedDate}, is ${player.player_name} of the ${player.team_name}. This is Batter Up game #${entry.gameNumber}.`
		},
		{
			question: `What team does today's Batter Up player play for?`,
			answer: `Today's Batter Up player, ${player.player_name}, plays for the ${player.team_name} in the ${division}.`
		},
		{
			question: `What position is today's Batter Up answer?`,
			answer: `${player.player_name} plays ${position}. In Batter Up, position feedback is exact, close (same infield/outfield category), or miss.`
		},
		{
			question: `How old is today's Batter Up player?`,
			answer: `${player.player_name} is ${age} years old, born in ${player.born}. Age feedback in Batter Up is exact, within two years, or miss.`
		},
		{
			question: `What jersey number is today's Batter Up answer?`,
			answer: `${player.player_name} wears number ${player.jersey_number ?? 'unknown'}. Jersey feedback compares the exact number first, then the tens digit.`
		},
		{
			question: 'When does Batter Up update?',
			answer: 'A new Batter Up puzzle goes live shortly after midnight UTC each day, and this page is updated with the confirmed answer every morning.'
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
		headline: `Batter Up Hints and Answer for Today (${formattedDate})`,
		description: pageDescription,
		datePublished: `${entry.date}T00:00:00Z`,
		dateModified: entry.fetchedAt,
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
			{ '@type': 'ListItem', position: 3, name: 'Batter Up Answer Today', item: CANONICAL }
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
		hints: {
			team: player.team_name,
			division,
			league: league === 'AL' ? 'American League' : 'National League',
			position,
			age,
			born: player.born,
			jerseyTens: tensWord(player.jersey_number),
			debut: player.debut
		},
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
