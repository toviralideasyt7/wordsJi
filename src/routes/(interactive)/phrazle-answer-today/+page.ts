import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { TOTAL_PHRASES, getAnswerForDate } from '$lib/phrazle/phrases';
import { generateFAQSchema, generateHowToSchema, generateWebPageSchema } from '$lib/seo';

export const prerender = true;
export const csr = false;

interface PhrazleAnswer {
	phrase: string;
	index: number;
}

interface PhrazleDayAnswers {
	date: string;
	morning: PhrazleAnswer;
	afternoon: PhrazleAnswer;
}

function formatDateKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(dateKey: string): string {
	return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

function getDayAnswers(date: Date): PhrazleDayAnswers {
	const morning = getAnswerForDate(date, 'morning');
	const afternoon = getAnswerForDate(date, 'afternoon');

	return {
		date: formatDateKey(date),
		morning: {
			phrase: morning.phrase,
			index: morning.index
		},
		afternoon: {
			phrase: afternoon.phrase,
			index: afternoon.index
		}
	};
}

export const load = () => {
	const today = getPuzzleDateForGame('phrazle');
	const todayAnswers = getDayAnswers(today);
	const todayLabel = formatDisplayDate(todayAnswers.date);
	const metaTitle = `Phrazle Answer Today (${todayLabel}) - Morning and Afternoon Answers`;
	const pageTitle = `Phrazle Answer Today (${todayLabel})`;
	const pageDescription = `Get Phrazle hints and the confirmed morning and afternoon Phrazle answers for today, ${todayLabel}. Use the dedicated archive page for older phrase pairs.`;
	const pageKeywords = `phrazle answer today, phrazle answer, phrazle hint, phrazle hint today, phrazle answer for ${todayLabel}`;
	const faqs = [
		{
			question: 'What is Phrazle?',
			answer:
				'Phrazle is a daily phrase guessing game with two puzzles each day, a morning puzzle and an afternoon puzzle.'
		},
		{
			question: 'How are Phrazle answers calculated?',
			answer:
				'Answers are mapped by date using the official Phrazle phrase list and the game schedule.'
		},
		{
			question: 'Can I view previous Phrazle answers?',
			answer:
				'Yes. Use the Phrazle archive page to see both the morning and afternoon answers for older dates.'
		},
		{
			question: 'Why are there two puzzles?',
			answer:
				'Phrazle releases two puzzles per day, so each date has a morning phrase and an afternoon phrase.'
		}
	];

	const faqSchema = generateFAQSchema(faqs);
	const howToSchema = generateHowToSchema('How to use the Phrazle answer page', [
		{ name: 'Check both puzzles', text: 'Review the morning and afternoon answer cards for today’s date.' },
		{ name: 'Reveal or copy', text: 'Use the buttons to hide, reveal, or copy either phrase.' },
		{ name: 'Open the archive', text: 'Use the dedicated archive page when you need an older Phrazle answer pair.' }
	]);
	const webPageSchema = generateWebPageSchema(
		pageTitle,
		pageDescription,
		'https://wordsolverx.com/phrazle-answer-today'
	);

	return {
		totalPhrases: TOTAL_PHRASES,
		todayAnswers,
		todayLabel,
		pageTitle,
		metaTitle,
		pageDescription,
		pageKeywords,
		faqs,
		schemas: JSON.stringify([webPageSchema, faqSchema, howToSchema])
	};
};
