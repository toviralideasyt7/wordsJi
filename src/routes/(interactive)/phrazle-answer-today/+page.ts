import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { TOTAL_PHRASES, getAnswerForDate } from '$lib/phrazle/phrases';
import { generateWebPageSchema } from '$lib/seo';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';

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
	// Bing ranking components (2026-10-06): title built from the shared daily
	// title pattern, keyed on the puzzle-window date (todayLabel) so a "today"
	// page can never carry tomorrow's date or answer here. The answer stays out
	// of the title and meta description (snippet tease, not reveal). The morning
	// phrase index is the primary puzzle number.
	const metaTitle = dailyAnswerTitle('Phrazle', todayAnswers.morning.index, todayLabel);
	const pageTitle = `Phrazle Answer Today (${todayLabel})`;
	const pageDescription = `Get Phrazle hints and the confirmed morning and afternoon Phrazle answers for today, ${todayLabel}. Use the archive page for older phrase pairs.`;
	const pageKeywords = `phrazle answer today, phrazle answer, phrazle hint, phrazle hint today, phrazle answer for ${todayLabel}`;
	const updatedStamp = updatedStampText('Phrazle', todayAnswers.morning.index, todayLabel);
	const aiHints = mergeHints(todayAnswers.morning.phrase, getAIHints('phrazle', todayAnswers.date));
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
		},
		{ question: 'When was this page last updated?', answer: updatedStamp }
	];

	const webPageSchema = generateWebPageSchema(
		pageTitle,
		pageDescription,
		'https://wordsolverx.com/phrazle-answer-today'
	);

	// FAQPage schema built from the page FAQ array (wordle pattern).
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	};

	// FactBlock values from the morning phrase.
	const morningLetters = todayAnswers.morning.phrase.toLowerCase().replace(/[^a-z]/g, '');
	const morningVowelCount = [...morningLetters].filter((c) => 'aeiou'.includes(c)).length;
	const morningHasDouble = morningLetters
		.split('')
		.some((c, i, a) => a.indexOf(c) !== a.lastIndexOf(c));

	return {
		totalPhrases: TOTAL_PHRASES,
		todayAnswers,
		todayLabel,
		pageTitle,
		metaTitle,
		pageDescription,
		pageKeywords,
		faqs,
		updatedStamp,
		aiHints,
		morningVowelCount,
		morningHasDouble,
		morningStartLetter: morningLetters[0]?.toUpperCase() ?? '',
		morningEndLetter: morningLetters[morningLetters.length - 1]?.toUpperCase() ?? '',
		schemas: JSON.stringify([webPageSchema, faqSchema])
	};
};
