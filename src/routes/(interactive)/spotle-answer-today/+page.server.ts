import type { PageServerLoad } from './$types';
import { format, subDays } from 'date-fns';
import spotleData from '../../../../static/spotle_data.json';
import { fetchLiveSpotleToday } from '$lib/live-answer-sources';
import {
	COUNTRY_NAMES,
	GENDER_NAMES,
	formatSpotleDate,
	parseSpotleDate,
	type SpotleArtist,
	type SpotleAnswer,
	type SpotleData
} from '$lib/spotle';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { composeMetaDescription } from '$lib/seo';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';

interface SpotleDay {
	date: string;
	dayNumber: number;
	artistName: string;
	track: string | null;
	soundcloudUrl: string | null;
	artist: SpotleArtist | null;
}

function getArtistByName(artists: SpotleArtist[], artistName: string | undefined): SpotleArtist | null {
	if (!artistName) {
		return null;
	}

	return artists.find((artist) => artist.artist.toLowerCase() === artistName.toLowerCase()) ?? null;
}

export const load: PageServerLoad = async ({ setHeaders }) => {
	const data = spotleData as SpotleData;
	const artists = data?.artists ?? [];
	const bundledAnswers = data?.answers ?? [];
	const todayStr = formatSpotleDate(getPuzzleDateForGame('spotle'));
	let mergedAnswers = [...bundledAnswers];
	let activeAnswers = mergedAnswers
		.filter((entry) => entry.date <= todayStr)
		.sort((a, b) => b.date.localeCompare(a.date));
	const latestAnswer = activeAnswers[0] ?? null;
	let todayAnswer = mergedAnswers.find((entry) => entry.date === todayStr) ?? latestAnswer;

	if (!todayAnswer || todayAnswer.date !== todayStr) {
		try {
			const liveToday = await fetchLiveSpotleToday(todayStr);
			if (liveToday) {
				mergedAnswers = [...mergedAnswers.filter((entry) => entry.date !== liveToday.date), liveToday];
				activeAnswers = mergedAnswers
					.filter((entry) => entry.date <= todayStr)
					.sort((a, b) => b.date.localeCompare(a.date));
				todayAnswer = mergedAnswers.find((entry) => entry.date === todayStr) ?? activeAnswers[0] ?? null;
			}
		} catch (error) {
			console.warn(
				`Unable to refresh Spotle live answer for ${todayStr}:`,
				error instanceof Error ? error.message : String(error)
			);
		}
	}

	const displayDate = todayAnswer?.date ?? todayStr;
	const displayDateObject = parseSpotleDate(displayDate);
	const todayArtist = getArtistByName(artists, todayAnswer?.artist);
	const isFallback = !todayAnswer || displayDate !== todayStr || !todayArtist;

	setHeaders({
		'X-Puzzle-Date': displayDate,
		...(isFallback ? { 'X-Edge-Cache-Bypass': '1' } : {})
	});

	const last30Days: SpotleDay[] = [];
	for (let i = 0; i < 30; i += 1) {
		const date = subDays(displayDateObject, i);
		const dateStr = formatSpotleDate(date);
		const answer = mergedAnswers.find((entry) => entry.date === dateStr);
		if (!answer) {
			continue;
		}

		last30Days.push({
			date: dateStr,
			dayNumber: answer.dayNumber,
			artistName: answer.artist,
			track: answer.track ?? null,
			soundcloudUrl: answer.soundcloudUrl ?? null,
			artist: getArtistByName(artists, answer.artist)
		});
	}

	const todayFormatted = format(displayDateObject, 'MMMM d, yyyy');
	const updatedStamp = updatedStampText('Spotle', todayAnswer?.dayNumber ?? '', todayFormatted);
	const answerString = todayArtist?.artist ?? todayAnswer?.artist ?? '';
	const aiHints = mergeHints(answerString, getAIHints('spotle', todayStr));

	const yesterdayKey = formatSpotleDate(subDays(displayDateObject, 1));
	const yesterdayEntry = !isFallback ? last30Days.find((entry) => entry.date === yesterdayKey) ?? null : null;
	const yesterday = yesterdayEntry
		? {
				number: yesterdayEntry.dayNumber,
				dateLong: format(parseSpotleDate(yesterdayEntry.date), 'MMMM d, yyyy'),
				answer: yesterdayEntry.artistName
			}
		: null;

	const factLetters = answerString.toLowerCase().replace(/[^a-z]/g, '');
	const factRepeatCount = factLetters.length - new Set(factLetters).size;
	const factData = {
		puzzleNumber: todayAnswer ? String(todayAnswer.dayNumber) : '',
		dateLong: todayFormatted,
		firstLetter: factLetters[0]?.toUpperCase() ?? '',
		lastLetter: factLetters[factLetters.length - 1]?.toUpperCase() ?? '',
		vowelCount: [...factLetters].filter((c) => 'aeiou'.includes(c)).length,
		repeatText: factRepeatCount === 0 ? 'None' : String(factRepeatCount)
	};

	const faqItems = [
		{
			question: `What is the Spotle answer for ${format(displayDateObject, 'MMMM d, yyyy')}?`,
			answer: todayAnswer
				? `The Spotle answer for ${format(displayDateObject, 'MMMM d, yyyy')} is ${todayAnswer.artist}. This is Day #${todayAnswer.dayNumber}.`
			: `The Spotle answer for ${format(displayDateObject, 'MMMM d, yyyy')} has not been posted yet.`
		},
		{
			question: 'Where can I check older Spotle answers?',
			answer:
				'Open the Spotle archive page to browse older artist answers by date with the same profile details shown on this page.'
		},
		{
			question: 'Does this page show extra Spotle info besides the artist?',
			answer:
				'Yes. When the source provides it, this page also shows the featured track, SoundCloud link, rank, country, genre, debut year, and group details.'
		},
		{
			question: 'When was this page last updated?',
			answer: updatedStamp
		}
	];

	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqItems.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	};

	const metaTitle = todayAnswer
		? dailyAnswerTitle('Spotle', todayAnswer.dayNumber, todayFormatted)
		: `Spotle Answer Today (${todayFormatted}) - Artist and Clues`;
	// The artist name is the only part of this sentence whose length varies (2-24 characters
	// across the artist list), so the closing is chosen from the measured head to stay inside
	// the 140-158 character description budget. The track title is left out for the same
	// reason; it still appears in the page body and the structured data.
	const metaDescription = todayArtist
		? composeMetaDescription(
				`Get the Spotle answer for ${todayFormatted}, including artist details for ${todayArtist.artist}`,
				{
					full: 'The page also lists the clue trail, the track list, and every past answer.',
					trimmed: 'The page also lists the clue trail and every past answer.'
				}
			)
		: `Get the Spotle answer for ${todayFormatted}, plus the clue trail, the artist details, the track list, and every past answer listed in the archive.`;
	const metaKeywords =
		`spotle answer today, spotle answer, spotle archive, spotle artist today, spotle hints ${todayFormatted}`;

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://wordsolverx.com'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Today',
				item: 'https://wordsolverx.com/today'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: 'Spotle Answer Today',
				item: 'https://wordsolverx.com/spotle-answer-today'
			}
		]
	};

	const webPageSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: metaTitle,
		description: metaDescription,
		url: 'https://wordsolverx.com/spotle-answer-today',
		image: 'https://wordsolverx.com/wordsolverx.webp',
		dateModified: displayDate,
		inLanguage: 'en',
		isPartOf: {
			'@type': 'WebSite',
			name: 'WordSolverX',
			url: 'https://wordsolverx.com'
		}
	};

	return {
		todayStr,
		todayFormatted,
		todayAnswer: todayAnswer as SpotleAnswer | null,
		todayArtist,
		artists,
		answers: activeAnswers,
		last30Days,
		faqItems,
		updatedStamp,
		aiHints,
		yesterday,
		factData,
		schemaJson: JSON.stringify([webPageSchema, breadcrumbSchema, faqSchema]),
		meta: {
			title: metaTitle,
			description: metaDescription,
			keywords: metaKeywords
		},
		stats: {
			totalArtists: artists.length,
			totalAnswers: mergedAnswers.length,
			lastSyncedAt: data?.metadata?.lastSyncedAt ?? null
		},
		labels: {
			countryNames: COUNTRY_NAMES,
			genderNames: GENDER_NAMES
		}
	};
};
