// Wordle answer difficulty scoring.
//
// Deterministic, transparent rubric used by /wordle-hardest-answers. The
// rubric text below is rendered verbatim on that page ("How we scored this"),
// so the code and the published methodology can never disagree.
//
// The data it scores is the real NYT Wordle answer history (the same answer
// feed that powers /wordle-answer-archive) — no invented rows.

export const MAX_HARDNESS_SCORE = 100;
export const BASE_SCORE = 20;

// Letter tiers are based on standard written-English frequency:
// J, Q, X, Z are the four rarest letters; K, V, W, Y come next.
const ULTRA_RARE = new Set(['q', 'z', 'x', 'j']);
const RARE = new Set(['k', 'v', 'w', 'y']);
const RARE_OPENERS = new Set(['q', 'x', 'z', 'j', 'v']);

export interface HardnessRubricRule {
	/** Points awarded, as printed on the page (e.g. "+18 / occurrence"). */
	points: string;
	/** What the rule rewards. */
	description: string;
}

export const HARDNESS_RUBRIC: HardnessRubricRule[] = [
	{ points: '20', description: 'Base score — every answer starts here.' },
	{
		points: '+18 / occurrence',
		description: 'Ultra-rare letters: Q, Z, X, J — the four rarest letters in written English.'
	},
	{ points: '+8 / occurrence', description: 'Rare letters: K, V, W, Y.' },
	{
		points: '+10 / repeated letter',
		description: 'Repeated letter — each letter that appears more than once (e.g. QUEUE scores this twice).'
	},
	{
		points: '+6',
		description: 'Double consonant cluster — two identical consonants side by side (e.g. ZZ in FUZZY).'
	},
	{ points: '+6', description: 'Rare opening letter — the answer starts with Q, X, Z, J, or V.' },
	{ points: '100 max', description: 'The total is capped at 100.' }
];

/** One-sentence summary, printed on the page for journalists to quote. */
export const HARDNESS_RUBRIC_SUMMARY =
	'Every answer starts at 20 points and gains points for rare letters (Q/Z/X/J and K/V/W/Y), repeated letters, and awkward patterns like double consonants — capped at 100.';

export interface HardnessResult {
	score: number;
	/** Human-readable scoring factors, e.g. ["Contains J", "Contains Z", "Double Z"]. */
	factors: string[];
}

/**
 * Score a 5-letter Wordle answer 0–100. Pure function of the letters —
 * no per-answer tuning, so the ranking is reproducible by anyone.
 */
export function scoreWordleHardness(solution: string): HardnessResult {
	const word = (solution || '').toLowerCase();
	let score = BASE_SCORE;
	const factors: string[] = [];

	for (const letter of word) {
		if (ULTRA_RARE.has(letter)) {
			score += 18;
			factors.push(`Contains ${letter.toUpperCase()}`);
		} else if (RARE.has(letter)) {
			score += 8;
			factors.push(`Contains ${letter.toUpperCase()}`);
		}
	}

	const counts: Record<string, number> = {};
	for (const letter of word) counts[letter] = (counts[letter] || 0) + 1;
	for (const [letter, count] of Object.entries(counts)) {
		if (count > 1) {
			score += 10;
			factors.push(`Double ${letter.toUpperCase()}`);
		}
	}

	if (/([^aeiou])\1/.test(word)) {
		score += 6;
		factors.push('Double consonant cluster');
	}

	if (word.length > 0 && RARE_OPENERS.has(word[0])) {
		score += 6;
		factors.push('Rare opening letter');
	}

	return {
		score: Math.min(MAX_HARDNESS_SCORE, score),
		factors: [...new Set(factors)]
	};
}
