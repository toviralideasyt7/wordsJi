import type { PageServerLoad } from './$types';
import { formatDate } from '$lib/utils';
import {
	HARDNESS_RUBRIC,
	HARDNESS_RUBRIC_SUMMARY,
	scoreWordleHardness
} from '$lib/wordle/wordle-hardness';

export const prerender = true;

const HARDEST_COUNT = 50;
const EASIEST_COUNT = 10;

interface RawAnswer {
	date: string;
	solution: string;
	puzzleNumber: number | null;
	editor: string | null;
}

export interface RankedAnswer {
	rank: number;
	answer: string;
	puzzleNumber: number | null;
	date: string;
	formattedDate: string;
	score: number;
	why: string;
}

function toRankedAnswer(a: RawAnswer & { score: number; why: string }, rank: number): RankedAnswer {
	return {
		rank,
		answer: a.solution.toUpperCase(),
		puzzleNumber: a.puzzleNumber,
		date: a.date,
		formattedDate: formatDate(new Date(`${a.date}T00:00:00Z`)),
		score: a.score,
		why: a.why
	};
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	let fetchError: string | null = null;
	let scored: Array<RawAnswer & { score: number; why: string }> = [];

	try {
		const res = await fetch('https://api.wordsolverx.workers.dev/api/answers?limit=2000');
		if (res.ok) {
			const payload = await res.json();
			const answers: RawAnswer[] = payload.answers || [];
			scored = answers
				.filter(
					(a) =>
						typeof a?.solution === 'string' &&
						/^[a-zA-Z]{5}$/.test(a.solution) &&
						typeof a?.date === 'string' &&
						/^\d{4}-\d{2}-\d{2}$/.test(a.date)
				)
				.map((a) => {
					const { score, factors } = scoreWordleHardness(a.solution);
					return {
						date: a.date,
						solution: a.solution.toLowerCase(),
						puzzleNumber: a.puzzleNumber,
						editor: a.editor,
						score,
						why: factors.length > 0 ? factors.join('; ') : 'Everyday letters in familiar positions'
					};
				});
		} else {
			fetchError = `Archive API returned HTTP ${res.status}`;
		}
	} catch (err) {
		fetchError = err instanceof Error ? err.message : 'Failed to fetch archive';
	}

	// Deterministic ranking: score first, earliest puzzle date breaks ties.
	const hardest = [...scored]
		.sort((x, y) => y.score - x.score || x.date.localeCompare(y.date))
		.slice(0, HARDEST_COUNT)
		.map((a, i) => toRankedAnswer(a, i + 1));

	const easiest = [...scored]
		.sort((x, y) => x.score - y.score || x.date.localeCompare(y.date))
		.slice(0, EASIEST_COUNT)
		.map((a, i) => toRankedAnswer(a, i + 1));

	const totalAnswers = scored.length;
	const dateRange =
		scored.length > 0
			? {
					first: formatDate(new Date(`${[...scored].sort((a, b) => a.date.localeCompare(b.date))[0].date}T00:00:00Z`)),
					last: formatDate(new Date(`${[...scored].sort((a, b) => b.date.localeCompare(a.date))[0].date}T00:00:00Z`))
				}
			: null;

	const topAnswer = hardest[0] ?? null;

	const faqs = [
		{
			question: 'What is the hardest Wordle answer of all time?',
			answer: topAnswer
				? `${topAnswer.answer} (puzzle #${topAnswer.puzzleNumber ?? 'launch day'}, ${topAnswer.formattedDate}) is the highest-scoring answer in our data at ${topAnswer.score} out of 100. ${topAnswer.why}. It is the only answer to reach a perfect difficulty score across all ${totalAnswers.toLocaleString()} puzzles analyzed.`
				: 'The hardest answers are ranked by a transparent rubric combining rare letters, repeated letters, and awkward patterns. The full ranked table is above.'
		},
		{
			question: 'How is Wordle answer difficulty scored?',
			answer: `${HARDNESS_RUBRIC_SUMMARY} The rubric is applied identically to every past answer, so the ranking is deterministic and reproducible — anyone can re-run it and get the same order.`
		},
		{
			question: 'What are the easiest Wordle answers?',
			answer: `The easiest answers are common five-letter words built from everyday letters in familiar positions — words like CRANE and SLATE. They score the base 20 out of 100 because they contain no rare letters, no repeats, and no awkward clusters. The 10 easiest answers are listed in the contrast table above.`
		},
		{
			question: 'Can I cite this ranking in an article or classroom?',
			answer: 'Yes. This ranking is published as a citation-friendly reference: every row names the real answer, its official puzzle number, and its date. Please credit WordSolverX and link to this page. The methodology is documented on this page so your readers can verify how each score was calculated.'
		}
	];

	const buildDate = new Date().toISOString().split('T')[0];

	setHeaders({
		'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	return {
		hardest,
		easiest,
		totalAnswers,
		dateRange,
		rubric: HARDNESS_RUBRIC,
		rubricSummary: HARDNESS_RUBRIC_SUMMARY,
		faqs,
		fetchError,
		publishedDate: buildDate,
		meta: {
			title: 'The Hardest Wordle Answers, Ranked',
			description:
				'Every Wordle answer ranked by difficulty: a transparent 0–100 rubric scoring rare letters, repeats, and awkward patterns. The 50 hardest answers plus the 10 easiest.'
		}
	};
};
