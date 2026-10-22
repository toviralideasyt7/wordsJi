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
import { getGameVideo } from '$lib/server/game-videos';
import { getMarveldleDbAnswer } from '$lib/server/daily-games-answers';
import type { CharacterData, MarveldleDayEntry } from '$lib/marveldle/types';
import answersRaw from '$lib/data/marveldle-answers.json';
import comicsCharactersRaw from '$lib/data/marveldle-comics.json';
import type { PageServerLoad } from './$types';

const answers = answersRaw as Record<string, MarveldleDayEntry>;
const comicsCharacters = comicsCharactersRaw as unknown as CharacterData[];
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
	const ownEntry = answers[dateKey] ?? null;
	// Yesterday's answers render inline on this page (no separate yesterday route).
	const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');
	const yesterday = answers[yesterdayKey] ?? null;

	const ownComplete =
		!!ownEntry && ownEntry.date === dateKey && !!ownEntry.comics && !!ownEntry.mcu;

	let entry: MarveldleDayEntry | null = ownComplete ? ownEntry : null;
	let video = await getGameVideo('marveldle', dateKey);
	let partial = false;
	let fallback: { requestedDate: string; showingDate: string } | null = null;

	if (!entry) {
		// Fallback 1 — the daily-games solver verifies the Comics-mode
		// character every day (it is the answer its daily video solves).
		// When our own entry has not landed, today's Comics answer and
		// video can still be shown immediately; the MCU character follows
		// when our solver's entry arrives.
		const db = await getMarveldleDbAnswer(dateKey);
		const dbComics = db
			? (comicsCharacters.find((c) => c.name === db.name) ?? null)
			: null;
		if (db && dbComics) {
			entry = {
				date: dateKey,
				dateId: 'daily-games-db',
				comics: dbComics,
				mcu: null,
				solvedAt: db.publishedAt ?? new Date().toISOString()
			};
			partial = true;
		} else if (yesterday && yesterday.comics && yesterday.mcu) {
			// Fallback 2 — show yesterday's confirmed answers, clearly
			// dated as yesterday's, instead of a dead-end "still being
			// solved" page. Every rebuild retries today's sources first,
			// so the page self-heals as soon as today's answers land.
			entry = yesterday;
			fallback = { requestedDate: dateKey, showingDate: yesterdayKey };
			video = await getGameVideo('marveldle', yesterdayKey);
		}
	}

	if (!entry) {
		setHeaders({ 'X-Puzzle-Date': dateKey, 'X-Edge-Cache-Bypass': '1' });
		const staleDate = formatSeoDate(dateKey);
		return {
			error: true,
			isStale: true,
			partial: false,
			fallback: null,
			video,
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

	const provisional = partial || !!fallback;
	setHeaders({ 'X-Puzzle-Date': dateKey, 'X-Edge-Cache-Bypass': provisional ? '1' : '0' });

	const comics = entry.comics!;
	const mcu = entry.mcu;
	const formattedDate = formatSeoDate(entry.date);
	const shortDate = format(new Date(`${entry.date}T12:00:00Z`), 'MMM d');
	const displayKey = entry.date;

	// Stream 4 (2026-10-06): shared daily title/stamp. Marveldle has no upstream
	// puzzle number, so the puzzle date key is the identifier. In the
	// yesterday-fallback state the stamp keys on the DISPLAYED entry's date,
	// never on the requested (still-unsolved) date.
	const pageTitle = dailyAnswerTitle('Marveldle', displayKey, formattedDate);
	const updatedStamp = updatedStampText('Marveldle', displayKey, formattedDate);
	// Tease with hints — never the character names in title or description.
	// Template stays inside the 140-158 budget across decade/appearance lengths.
	const pageDescription = mcu
		? `Marveldle hints (${shortDate}): Comics debuted in ${decadeOf(comics.apparitionYear)}, MCU appears in ${(mcu.appearanceTypes ?? []).join(' and ').toLowerCase() || 'film and TV'}. Daily clues for both modes and the confirmed answers at WordSolverX.`
		: `Marveldle hints (${shortDate}): Comics debuted in ${decadeOf(comics.apparitionYear)}. The confirmed Comics answer is live now; the MCU character is still being verified and joins this page shortly.`;
	const pageKeywords = `marveldle answer today, marveldle answer, marveldle hint, marveldle hint today, marveldle mcu answer, marveldle comics answer, marveldle answer for ${formattedDate}`;

	const hintFaqs = mcu
		? [
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
			]
		: [
				{
					question: `What is the Marveldle Comics answer for today, ${formattedDate}?`,
					answer: `Today's Marveldle Comics answer for ${formattedDate} is ${comics.name}, a ${comics.gender.toLowerCase()} ${comics.type.toLowerCase()} from ${comics.origin} who first appeared in ${comics.apparitionYear ?? 'an unknown year'}. The MCU character is still being verified and will be added to this page shortly.`
				},
				{
					question: `What are today's Marveldle hints?`,
					answer: `Comics hint: think ${decadeOf(comics.apparitionYear)} debut, ${comics.origin} origin.`
				},
				{
					question: 'When does Marveldle update?',
					answer: 'Marveldle releases a new pair of characters around midnight US time each day, and this page is updated with the confirmed answers every morning.'
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

	// In the yesterday-fallback state the displayed entry IS yesterday's, so
	// the inline "yesterday" strip steps one more day back instead of
	// repeating the same answers.
	const inlineYesterday = fallback
		? (answers[format(subDays(new Date(`${entry.date}T12:00:00Z`), 1), 'yyyy-MM-dd')] ?? null)
		: yesterday;

	return {
		error: false,
		isStale: false,
		partial,
		fallback,
		video,
		entry,
		yesterday: inlineYesterday,
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
			mcu: mcu
				? {
						appearances: (mcu.appearanceTypes ?? []).join(' / ') || '—',
						origin: mcu.origin,
						type: mcu.type,
						gender: mcu.gender,
						affiliations: (mcu.affiliations ?? []).slice(0, 3)
					}
				: null
		},
		// AI hint cards: merged against the Comics name, which is what the
		// stored hint content describes (see scripts/generate-ai-hints.mjs).
		aiHints: mergeHints(comics.name, getAIHints('marveldle', displayKey)),
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
