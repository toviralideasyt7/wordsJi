import { getAIHints, mergeHints } from '$lib/ai-hints';
import {
	resolveWordleToday,
	getWordleHintPageDef,
	buildHintContent,
	wordleHintCanonical,
	WORDLE_HINT_PAGES
} from '$lib/wordle-hints-today';
import type { PageServerLoad } from './$types';

const SLUG = 'letter-pattern';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const def = getWordleHintPageDef(SLUG);
	const today = await resolveWordleToday();
	const ai = today.hasAnswer ? getAIHints('wordle', today.todayKey) : null;
	const merged = today.hasAnswer ? mergeHints(today.word, ai) : null;
	const content = today.hasAnswer ? buildHintContent(SLUG, today.word, merged) : null;
	const aiOneLiner = merged?.clue1 || merged?.riddle || '';
	const canonical = wordleHintCanonical(SLUG);
	const otherPages = WORDLE_HINT_PAGES.filter((p) => p.slug !== SLUG);
	const faqAnswer = content?.faqAnswer ?? '';

	setHeaders({
		'X-Puzzle-Date': today.todayKey,
		'X-Edge-Cache-Bypass': today.hasAnswer ? '0' : '1'
	});

	const pageTitle = `${def.shortTitle} (${today.formattedDate}) - Hint`;
	const pageDescription = faqAnswer
		? `${def.shortTitle} (${today.formattedDate}): ${faqAnswer} More Wordle #${today.wordleNumber} hints plus the confirmed answer.`
		: `${def.shortTitle} (${today.formattedDate}): Wordle #${today.wordleNumber} daily letter hint — 12 hints updated daily, plus the confirmed answer.`;
	const pageKeywords = `wordle hint, wordle hints today, ${def.shortTitle.toLowerCase()}, wordle answer today, wordle #${today.wordleNumber}`;

	const faqs = faqAnswer
		? [
				{ question: def.question, answer: faqAnswer },
				{
					question: 'Where can I find more Wordle hints?',
					answer: `See all of today's Wordle hints and the confirmed answer at https://wordsolverx.com/wordle-answer-today.`
				}
			]
		: [
				{
					question: def.question,
					answer: `Today's Wordle answer is still updating — check back shortly for this hint.`
				},
				{
					question: 'Where can I find more Wordle hints?',
					answer: `See all of today's Wordle hints and the confirmed answer at https://wordsolverx.com/wordle-answer-today.`
				}
			];

	const faqSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	});

	return {
		shortTitle: def.shortTitle,
		question: def.question,
		canonical,
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords: pageKeywords
		},
		formattedDate: today.formattedDate,
		wordleNumber: today.wordleNumber,
		hasAnswer: today.hasAnswer,
		value: content?.value ?? '',
		explain: content?.explain ?? '',
		emptyNote: content?.emptyNote ?? '',
		extraFacts: content?.extraFacts ?? [],
		aiOneLiner,
		difficultyLabel: merged?.difficulty_label ?? '',
		difficultyScore: merged?.difficulty ?? 0,
		difficultyReason: merged?.difficulty_reason ?? '',
		otherPages,
		faqs,
		faqSchema
	};
};
