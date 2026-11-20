import { getAIHints, mergeHints } from '$lib/ai-hints';
import { resolveWordleToday, buildHintContent, WORDLE_HINT_PAGES } from '$lib/wordle-hints-today';
import type { PageServerLoad } from './$types';

// The single Wordle hints hub. It replaced the 12 /wordle-hints/* micro pages
// in the Phase 1 cleanup (2026-11-20): those pages were 322-377 words each
// with ~76% pairwise content overlap. Every hint type now lives here as an
// anchored section, computed from the same deterministic builders the micro
// pages used, so no hint value can drift from the page's own facts.
export const load: PageServerLoad = async ({ setHeaders }) => {
	const today = await resolveWordleToday();
	const ai = today.hasAnswer ? getAIHints('wordle', today.todayKey) : null;
	const merged = today.hasAnswer ? mergeHints(today.word, ai) : null;

	const sections = WORDLE_HINT_PAGES.map((def) => {
		const content = today.hasAnswer && merged ? buildHintContent(def.slug, today.word, merged) : null;
		return {
			slug: def.slug,
			label: def.label,
			question: def.question,
			value: content?.value ?? '',
			explain: content?.explain ?? '',
			emptyNote: content?.emptyNote ?? '',
			extraFacts: content?.extraFacts ?? [],
			faqAnswer: content?.faqAnswer ?? ''
		};
	});

	const faqs = today.hasAnswer
		? [
				...sections.map((s) => ({ question: s.question, answer: s.faqAnswer })),
				{
					question: 'Where can I find the full Wordle answer?',
					answer: `The confirmed answer for Wordle #${today.wordleNumber}, with the full letter-by-letter breakdown, is at https://wordauditor.com/wordle-answer-today.`
				}
			]
		: [
				{
					question: "What are today's Wordle hints?",
					answer: "Today's Wordle answer is still updating — check back shortly for the full hint set."
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

	setHeaders({
		'X-Puzzle-Date': today.todayKey,
		'X-Edge-Cache-Bypass': today.hasAnswer ? '0' : '1'
	});

	return {
		canonical: 'https://wordauditor.com/wordle-hints',
		meta: {
			title: `Wordle Hints Today (${today.formattedDate}) — All 12 Hints for Wordle #${today.wordleNumber}`,
			description: `All 12 Wordle hints for ${today.formattedDate} (Wordle #${today.wordleNumber}) on one page: first and last letters, vowel and consonant counts, letter pattern, repeating letters and the definition — plus the confirmed answer.`,
			keywords: `wordle hint, wordle hints today, wordle clues, wordle #${today.wordleNumber} hints, wordle answer today`
		},
		formattedDate: today.formattedDate,
		wordleNumber: today.wordleNumber,
		hasAnswer: today.hasAnswer,
		sections,
		aiOneLiner: merged?.clue1 || merged?.riddle || '',
		difficultyLabel: merged?.difficulty_label ?? '',
		difficultyScore: merged?.difficulty ?? 0,
		difficultyReason: merged?.difficulty_reason ?? '',
		faqs,
		faqSchema
	};
};
