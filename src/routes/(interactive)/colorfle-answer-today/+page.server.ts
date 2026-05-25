import { format, subDays } from 'date-fns';
import {
	getColorfleRangeFromApi,
	getColorfleTodayFromApi,
	type ApiColorfleAnswer
} from '$lib/color-answers-api';
import {
	generateBreadcrumbSchema,
	generateFAQSchema,
	generateHowToSchema,
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
			meta: {
				title: 'Colorfle Answers Today | WordSolverX',
				description: 'Colorfle normal and hard mode answers are temporarily unavailable.',
				keywords: 'colorfle answer today, colorfle answer, colorfle archive, colorfle solver',
				canonical: 'https://wordsolverx.com/colorfle-answer-today',
				featuredImage: '/images/colorfle-answer-today.webp'
			}
		};
	}

	const formattedDate = answer.formattedDate;
	const pageTitle = `Colorfle Answers Today (${formattedDate}) - Normal and Hard Mode`;
	const pageDescription = `Get today's Colorfle answers for ${formattedDate}, including both normal and hard mode color mixes, weights, and blended target hex values.`;
	const pageUrl = 'https://wordsolverx.com/colorfle-answer-today';

	const schemas = JSON.stringify([
		generateWebPageSchema('Colorfle Answers Today', pageDescription, pageUrl),
		generateSoftwareApplicationSchema('Colorfle Answers Today', 'UtilitiesApplication'),
		generateHowToSchema('How to use the Colorfle answers today page', [
			{
				name: 'Reveal both daily modes',
				text: 'Open the answer cards to compare the normal three-color mix and the hard four-color mix.'
			},
			{
				name: 'Check the blended target',
				text: 'Review the computed target hex and RGB values for each mode after you inspect the source colors.'
			},
			{
				name: 'Use the solver or archive',
				text: 'Open the solver for live guesses or browse the archive for older normal and hard mode answers.'
			}
		]),
		generateBreadcrumbSchema([
			{ name: 'Home', url: 'https://wordsolverx.com' },
			{ name: 'Today', url: 'https://wordsolverx.com/today' },
			{ name: 'Colorfle Answer Today', url: pageUrl }
		]),
		generateFAQSchema([
			{
				question: `What are the Colorfle answers for ${formattedDate}?`,
				answer: `Normal mode uses ${answer.normal.colors.map((color) => color.name).join(', ')}. Hard mode uses ${answer.hard.colors.map((color) => color.name).join(', ')}.`
			},
			{
				question: 'Does this page include hard mode too?',
				answer: 'Yes. The daily page now shows both normal and hard mode answers side by side with their own source colors and target previews.'
			},
			{
				question: 'Can I check older Colorfle answers?',
				answer: 'Yes. Use the Colorfle archive page to load past dates from the worker API and inspect both modes.'
			}
		])
	]);

	return {
		error: false,
		answer,
		recentEntries,
		dateKey: answer.date,
		formattedDate,
		publishedDate: `${answer.date}T00:00:00Z`,
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
