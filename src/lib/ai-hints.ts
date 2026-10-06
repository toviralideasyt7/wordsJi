// Shared type for per-puzzle AI-generated hint data.
// Used by AIHintCards.svelte, PaaHints.svelte and daily answer pages.
export interface AIHints {
	vowel_hint: string;
	repeat_hint: string;
	riddle: string;
	clue1: string;
	starts_with: string;
	ends_with: string;
	definition: string;
	difficulty: number;
	difficulty_label: string;
	difficulty_reason: string;
}

export const EMPTY_AI_HINTS: AIHints = {
	vowel_hint: '',
	repeat_hint: '',
	riddle: '',
	clue1: '',
	starts_with: '',
	ends_with: '',
	definition: '',
	difficulty: 0,
	difficulty_label: '',
	difficulty_reason: '',
};

// ---------------------------------------------------------------------------
// AI hint JSON store (written by scripts/generate-ai-hints.mjs).
// Each file: { game, generatedAt, hints: { dateKey: AIHints }, prose: { dateKey: string } }
// ---------------------------------------------------------------------------

interface AIHintsFile {
	game: string;
	generatedAt: string;
	hints: Record<string, AIHints>;
	prose: Record<string, string>;
}

// Eagerly bundled at build time; missing games simply resolve to null and the
// deterministic fallback covers them at runtime.
const AI_HINT_FILES = import.meta.glob<AIHintsFile>('./data/ai-hints/*.json', { eager: true });

const DIFFICULTY_LABELS = ['Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'] as const;

/** AI-generated hints for a game + dateKey, or null when no stored hints exist. */
export function getAIHints(game: string, dateKey: string): AIHints | null {
	for (const mod of Object.values(AI_HINT_FILES)) {
		const file = mod as unknown as AIHintsFile;
		if (file?.game === game && file.hints?.[dateKey]) {
			return file.hints[dateKey];
		}
	}
	return null;
}

/** Stored two-sentence prose for a dated archive page, or null. */
export function getDatedProse(game: string, dateKey: string): string | null {
	for (const mod of Object.values(AI_HINT_FILES)) {
		const file = mod as unknown as AIHintsFile;
		if (file?.game === game && typeof file.prose?.[dateKey] === 'string') {
			return file.prose[dateKey];
		}
	}
	return null;
}

function analyzeLetters(text: string) {
	// Letters-only analysis; equations (nerdle) and other digit answers fall back
	// to alphanumeric characters so counts/positions stay sane.
	const letters = text.toLowerCase().replace(/[^a-z]/g, '');
	const chars = letters || text.toLowerCase().replace(/[^a-z0-9]/g, '');
	const vowelCount = [...letters].filter((c) => 'aeiou'.includes(c)).length;
	const repeatCount = chars.length - new Set(chars).size;
	const first = chars[0] ? chars[0].toUpperCase() : '?';
	const last = chars[chars.length - 1] ? chars[chars.length - 1].toUpperCase() : '?';
	const unit = letters ? 'letter' : /^[0-9]+$/.test(chars) ? 'digit' : 'character';
	return { letters, chars, vowelCount, repeatCount, first, last, unit };
}

/** Fully deterministic hints computed from the answer text. Never reveals the answer. */
export function deterministicHints(text: string): AIHints {
	const { letters, chars, vowelCount, repeatCount, first, last, unit } = analyzeLetters(text);
	const vowel_hint = `It contains ${vowelCount} ${vowelCount === 1 ? 'vowel' : 'vowels'}.`;
	const repeat_hint =
		repeatCount === 0
			? `There are zero repeated ${unit}s.`
			: `${repeatCount} ${unit}${repeatCount === 1 ? '' : 's'} appear${repeatCount === 1 ? 's' : ''} more than once.`;
	let score = 3;
	if (/[qzxj]/.test(letters)) score += 2;
	if (/[kv]/.test(letters)) score += 1;
	if (repeatCount > 0) score += 1;
	if (chars.length > 8 || chars.length < 4) score += 1;
	if (/^[qxzjv]/.test(letters)) score += 1;
	score = Math.max(0, Math.min(10, score));
	const difficulty_label =
		score <= 2 ? 'Very Easy' : score <= 4 ? 'Easy' : score <= 6 ? 'Normal' : score <= 8 ? 'Hard' : 'Very Hard';
	return {
		vowel_hint,
		repeat_hint,
		riddle: '',
		clue1: '',
		starts_with: first,
		ends_with: last,
		definition: '',
		difficulty: score,
		difficulty_label,
		difficulty_reason: 'Scored from letter rarity, repeats, and length.'
	};
}

/**
 * Merge stored AI hints with deterministic computation. Deterministic fields
 * (starts/ends letters, validated vowel/repeat counts) always win; AI fills the
 * creative fields (riddle, clue1, definition, difficulty, prose) when sane.
 * Empty AI strings stay empty (the UI hides them).
 */
export function mergeHints(text: string, ai: AIHints | null): AIHints {
	const det = deterministicHints(text);
	if (!ai) return det;
	const { vowelCount, repeatCount, first, last } = analyzeLetters(text);

	const vowelMatch = String(ai.vowel_hint).match(/(\d+)/);
	const vowel_hint =
		vowelMatch && parseInt(vowelMatch[1], 10) === vowelCount ? ai.vowel_hint : det.vowel_hint;
	const repeatMatch = String(ai.repeat_hint).match(/(\d+)/);
	const aiRepeatNum = repeatMatch
		? parseInt(repeatMatch[1], 10)
		: /(zero|no)\s+repeat/i.test(ai.repeat_hint)
			? 0
			: -1;
	const repeat_hint = aiRepeatNum === repeatCount ? ai.repeat_hint : det.repeat_hint;

	let difficulty = det.difficulty;
	let difficulty_label = det.difficulty_label;
	let difficulty_reason = det.difficulty_reason;
	if (Number.isInteger(ai.difficulty) && ai.difficulty >= 0 && ai.difficulty <= 10) {
		difficulty = ai.difficulty;
		difficulty_label = (DIFFICULTY_LABELS as readonly string[]).includes(ai.difficulty_label)
			? ai.difficulty_label
			: difficulty <= 2
				? 'Very Easy'
				: difficulty <= 4
					? 'Easy'
					: difficulty <= 6
						? 'Normal'
						: difficulty <= 8
							? 'Hard'
							: 'Very Hard';
		if (ai.difficulty_reason && ai.difficulty_reason.trim()) {
			difficulty_reason = ai.difficulty_reason.trim();
		}
	}

	return {
		vowel_hint,
		repeat_hint,
		riddle: ai.riddle?.trim() || '',
		clue1: ai.clue1?.trim() || '',
		starts_with: first,
		ends_with: last,
		definition: ai.definition?.trim() || '',
		difficulty,
		difficulty_label,
		difficulty_reason
	};
}

/** Two factual sentences about a puzzle; never reveals the answer. */
export function deterministicProse(
	gameLabel: string,
	dateLong: string,
	numberText: string,
	text: string
): string {
	const { chars, first, last } = analyzeLetters(text);
	const span = chars.length === 1 ? '1 character' : `${chars.length} characters`;
	return (
		`The ${gameLabel} puzzle for ${dateLong} (${numberText}) is live with today's answer confirmed. ` +
		`The answer runs ${span}, starting with ${first} and ending with ${last} — see the letter hints above before you peek.`
	);
}
