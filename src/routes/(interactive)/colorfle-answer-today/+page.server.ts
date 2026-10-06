import { format, subDays } from 'date-fns';
import {
	getColorfleRangeFromApi,
	getColorfleTodayFromApi,
	type ApiColorfleAnswer
} from '$lib/color-answers-api';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import {
	generateBreadcrumbSchema,
	generateSoftwareApplicationSchema,
	generateWebPageSchema
} from '$lib/seo';
import type { PageServerLoad } from './$types';

export const prerender = true;

function buildModeAnswerSummary(answer: ApiColorfleAnswer): string {
	return answer.normal.colors.map((color) => color.name).join(', ');
}

export const load: PageServerLoad = async () => {
	let answer: ApiColorfleAnswer | null = null;
	let recentEntries: ApiColorfleAnswer[] = [];
	const workerFetch = globalThis.fetch;

	try {
		answer = await getColorfleTodayFromApi(workerFetch);
		const answerDate = new Date(`${answer.date}T12:00:00Z`);
		const rangeStart = format(subDays(answerDate, 10), 'yyyy-MM-dd');
		recentEntries = (await getColorfleRangeFromApi(workerFetch, rangeStart, answer.date)).filter(
			(entry) => entry.date !== answer?.date
		);
	} catch (error) {
		console.warn('Colorfle worker API request failed:', error);
	}

	if (!answer) {
		return {
			error: true,
			answer: null,
			recentEntries: [],
			dateKey: null,
			formattedDate: 'today',
			publishedDate: null,
			schemas: null,
			updatedStamp: '',
			aiHints: null,
			yesterday: null,
			hintFaqs: [],
			meta: {
				title: 'Colorfle Answers Today',
				description: 'Colorfle normal and hard mode answers are temporarily unavailable.',
				keywords: 'colorfle answer today, colorfle answer, colorfle archive, colorfle solver',
				canonical: 'https://wordsolverx.com/colorfle-answer-today',
				featuredImage: '/images/colorfle-answer-today.webp'
			}
		};
	}

	const formattedDate = answer.formattedDate;
	const pageTitle = dailyAnswerTitle('Colorfle', answer.puzzleNumber, formattedDate);
	const pageDescription = `Get today's Colorfle answers for ${formattedDate}, including both normal and hard mode color mixes, weights, and blended target hex values.`;
	const pageUrl = 'https://wordsolverx.com/colorfle-answer-today';

	const updatedStamp = updatedStampText('Colorfle', answer.puzzleNumber, formattedDate);
	const answerSummary = `${buildModeAnswerSummary(answer)} / ${answer.hard.colors.map((color) => color.name).join(', ')}`;
	const aiHints = mergeHints(answerSummary, getAIHints('colorfle', answer.date));
	const hintFaqs = [{ question: 'When was this page last updated?', answer: updatedStamp }];

	const yesterdayEntry = recentEntries.length > 0 ? recentEntries[0] : null;
	const yesterday = yesterdayEntry
		? {
				number: yesterdayEntry.puzzleNumber,
				dateLong: yesterdayEntry.formattedDate,
				answer: buildModeAnswerSummary(yesterdayEntry)
			}
		: null;

	const schemas = JSON.stringify([
		generateWebPageSchema('Colorfle Answers Today', pageDescription, pageUrl),
		generateSoftwareApplicationSchema('Colorfle Answers Today', 'UtilitiesApplication'),
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: hintFaqs.map((faq) => ({
				'@type': 'Question',
				name: faq.question,
				acceptedAnswer: { '@type': 'Answer', text: faq.answer }
			}))
		},
		generateBreadcrumbSchema([
			{ name: 'Home', url: 'https://wordsolverx.com' },
			{ name: 'Today', url: 'https://wordsolverx.com/today' },
			{ name: 'Colorfle Answer Today', url: pageUrl }
		])
	]);

	return {
		error: false,
		answer,
		recentEntries,
		dateKey: answer.date,
		formattedDate,
		publishedDate: `${answer.date}T00:00:00Z`,
		updatedStamp,
		aiHints,
		yesterday,
		hintFaqs,
		schemas,
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords:
				'colorfle answer today, colorfle hard mode answer, colorfle archive, colorfle solver, colorfle normal answer',
			canonical: pageUrl,
			featuredImage: '/images/colorfle-answer-today.webp'
		},
		summary: buildModeAnswerSummary(answer)
	};
};
