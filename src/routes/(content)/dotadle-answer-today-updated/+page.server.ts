import type { PageServerLoad } from './$types';
import { loadGameDleToday } from '$lib/game-dle/today';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints, type AIHints } from '$lib/ai-hints';

function parseChampionName(jsonContent: string | undefined): string {
	if (!jsonContent) return '';
	try {
		const parsed = JSON.parse(jsonContent) as { champion_name?: unknown };
		return typeof parsed.champion_name === 'string' ? parsed.champion_name : '';
	} catch {
		return '';
	}
}

function letterFacts(name: string) {
	const letters = name.toLowerCase().replace(/[^a-z]/g, '');
	const vowelCount = [...letters].filter((c) => 'aeiou'.includes(c)).length;
	const repeatCount = letters.length - new Set(letters).size;
	return {
		firstLetter: (letters[0] ?? '').toUpperCase(),
		lastLetter: (letters[letters.length - 1] ?? '').toUpperCase(),
		vowelCount,
		repeatText:
			repeatCount === 0 ? 'None' : `${repeatCount} repeated letter${repeatCount === 1 ? '' : 's'}`
	};
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const result = await loadGameDleToday({
		fetchFn: fetch,
		setHeaders,
		game: 'dotadle',
		gameTitle: 'Dotadle'
	});

	const answers = result.answers ?? [];
	// The AI hint store was generated from the deduped champion names joined
	// with ' / ' (see scripts/generate-ai-hints.mjs) — merge against the same text.
	const names: string[] = [];
	for (const answer of answers) {
		const name = parseChampionName(answer.json_content).trim();
		if (name && !names.includes(name)) names.push(name);
	}
	const answerText = names.join(' / ');

	const primary =
		answers.find((a) => a.mode === 'classic' && a.region === 'america') ?? answers[0] ?? null;
	const primaryName = parseChampionName(primary?.json_content).trim();
	const numberVar: string | number = primary?.game_id ?? '';
	const dateLong = (result.dateStr ?? '').replace(/^[^,]+,\s*/, '');
	const hasPuzzle = String(numberVar) !== '' && dateLong !== '';
	const updatedStamp = hasPuzzle ? updatedStampText('Dotadle', numberVar, dateLong) : '';
	const hintFaqs = hasPuzzle
		? [{ question: 'When was this page last updated?', answer: updatedStamp }]
		: [];
	const aiHints: AIHints = mergeHints(answerText, getAIHints('dotadle', result.latestDate ?? ''));

	return {
		...result,
		answerText,
		dateLong,
		updatedStamp,
		hintFaqs,
		aiHints,
		facts: primary
			? { mode: primary.mode, number: primary.game_id, name: primaryName, ...letterFacts(primaryName) }
			: null,
		...(hasPuzzle ? { meta: { title: dailyAnswerTitle('Dotadle', numberVar, dateLong) } } : {})
	};
};
