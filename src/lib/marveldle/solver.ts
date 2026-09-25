// src/lib/marveldle/solver.ts
// Interactive Marveldle solver engine: candidate filtering against user-set
// tile colors plus an information-gain suggestion scorer.
// Ported from sujitbhai7710/marveldle-answers:
//   - src/lib/suggestion-engine.ts  (filterCharacters, getSuggestions, getMatchInfo)
//   - scripts/solve.mjs             (matchesConstraint — the same rule the
//                                    daily solver uses against the upstream API)

import type { CharacterData, TileState, GuessEntry, TileColor, MarveldleMode } from './types';

function arrayOverlap(a: string[], b: string[]): number {
	if (!a || !b) return 0;
	return a.filter((x) => b.includes(x)).length;
}

function arrayMatch(a: string[], b: string[]): boolean {
	if (!a || !b) return false;
	if (a.length !== b.length) return false;
	return a.every((x) => b.includes(x)) && b.every((x) => a.includes(x));
}

/**
 * Filter the candidate pool against the user's guesses. Mirrors the game's
 * own feedback semantics: exact = identical, partial = at least one shared
 * item (arrays) / same category but not exact (strings), none = no match.
 */
export function filterCharacters(
	allChars: CharacterData[],
	guesses: GuessEntry[],
	excludeIds: string[]
): CharacterData[] {
	let candidates = allChars.filter((c) => !excludeIds.includes(c.id));

	for (const guess of guesses) {
		const char = guess.character;
		candidates = candidates.filter((c) => {
			for (const tile of guess.tiles) {
				if (tile.color === 'none') continue;

				const charVal = tile.isArray
					? ((c as unknown as Record<string, unknown>)[tile.key] as string[])
					: ((c as unknown as Record<string, unknown>)[tile.key] as string | number);
				const guessVal = tile.value;

				if (tile.isArray) {
					const cArr = (charVal as string[]) || [];
					const gArr = (guessVal as string[]) || [];
					const overlap = arrayOverlap(cArr, gArr);
					if (tile.color === 'exact' && !arrayMatch(cArr, gArr)) return false;
					if (tile.color === 'partial' && overlap === 0) return false;
				} else if (tile.isNumeric) {
					const cNum = (charVal as number) || 0;
					const gNum = (guessVal as number) || 0;
					if (tile.color === 'exact' && cNum !== gNum) return false;
					if (tile.color === 'upper' && cNum <= gNum) return false;
					if (tile.color === 'lower' && cNum >= gNum) return false;
				} else {
					if (tile.color === 'exact' && charVal !== guessVal) return false;
					if (tile.color === 'partial') {
						// For string fields, partial = same category but not exact (no filterable rule)
					}
				}
			}
			return true;
		});
	}

	return candidates;
}

export interface SuggestionScore {
	char: CharacterData;
	score: number;
	reason: string[];
}

/**
 * Rank unguessed candidates by expected information gain: prefer characters
 * with attribute values you have not probed yet, and partial overlaps that
 * cut the pool sharply.
 */
export function getSuggestions(
	candidates: CharacterData[],
	guesses: GuessEntry[],
	maxResults: number = 15
): SuggestionScore[] {
	if (candidates.length <= maxResults) {
		return candidates.map((c) => ({
			char: c,
			score: 0,
			reason: []
		}));
	}

	const guessedIds = new Set(guesses.map((g) => g.character.id));
	const unguessed = candidates.filter((c) => !guessedIds.has(c.id));

	const scored: SuggestionScore[] = unguessed.map((char) => {
		let score = 0;
		const reasons: string[] = [];

		const uniqueGenders = new Set(candidates.map((c) => c.gender)).size;
		const uniqueTypes = new Set(candidates.map((c) => c.type)).size;
		const uniqueOrigins = new Set(candidates.map((c) => c.origin)).size;

		if (uniqueGenders > 1 && !guesses.some((g) => g.character.gender === char.gender)) {
			score += 2;
			reasons.push('new gender');
		}
		if (uniqueTypes > 1 && !guesses.some((g) => g.character.type === char.type)) {
			score += 2;
			reasons.push('new type');
		}
		if (uniqueOrigins > 1 && !guesses.some((g) => g.character.origin === char.origin)) {
			score += 1;
			reasons.push('new origin');
		}

		const lastGuess = guesses[guesses.length - 1]?.character;
		const speciesOverlap = arrayOverlap(char.species || [], lastGuess?.species || []);
		if (speciesOverlap > 0 && speciesOverlap < (char.species || []).length) {
			score += 3;
			reasons.push('partial species match');
		}

		const powerOverlap = arrayOverlap(char.powerTypes || [], lastGuess?.powerTypes || []);
		if (powerOverlap > 0 && powerOverlap < (char.powerTypes || []).length) {
			score += 3;
			reasons.push('partial powers match');
		}

		return { char, score, reason: reasons };
	});

	return scored
		.sort((a, b) => b.score - a.score)
		.slice(0, maxResults);
}

export function getMatchInfo(
	candidates: CharacterData[],
	tile: TileState,
	guessValue: string | number | string[]
): { match: number; total: number } {
	let match = 0;
	const total = candidates.length;

	for (const c of candidates) {
		const cVal = tile.isArray
			? ((c as unknown as Record<string, unknown>)[tile.key] as string[])
			: ((c as unknown as Record<string, unknown>)[tile.key] as string | number);

		if (tile.isArray) {
			const cArr = (cVal as string[]) || [];
			const gArr = (guessValue as string[]) || [];
			const overlap = arrayOverlap(cArr, gArr);
			if (tile.color === 'exact' && arrayMatch(cArr, gArr)) match++;
			else if (tile.color === 'partial' && overlap > 0) match++;
			else if (tile.color === 'none' && overlap === 0) match++;
		} else if (tile.isNumeric) {
			const cNum = (cVal as number) || 0;
			const gNum = (guessValue as number) || 0;
			if (tile.color === 'exact' && cNum === gNum) match++;
			else if (tile.color === 'upper' && cNum > gNum) match++;
			else if (tile.color === 'lower' && cNum < gNum) match++;
		} else {
			if (tile.color === 'exact' && cVal === guessValue) match++;
		}
	}

	return { match, total };
}

// ============================
// Upstream feedback constraint (same rule scripts/marveldle-solve.mjs uses)
// ============================

export interface UpstreamGuessResult {
	gender: string;
	type: string;
	species: string;
	powerTypes: string;
	origin: string;
	apparitionYear?: string;
	appearanceTypes?: string;
	isExact?: boolean;
}

/**
 * Whether a candidate stays possible given the upstream feedback for a guess.
 * Exact/Partial/None/Upper/Lower semantics, per mode.
 */
export function matchesConstraint(
	char: CharacterData,
	gr: UpstreamGuessResult,
	guessed: CharacterData,
	mode: MarveldleMode
): boolean {
	if (gr.gender !== 'None') {
		if (gr.gender === 'Exact' && char.gender !== guessed.gender) return false;
		if (gr.gender === 'None' && char.gender === guessed.gender) return false;
	}
	if (gr.type !== 'None') {
		if (gr.type === 'Exact' && char.type !== guessed.type) return false;
		if (gr.type === 'None' && char.type === guessed.type) return false;
	}
	if (gr.species !== 'None') {
		const overlap = (char.species || []).filter((s) => (guessed.species || []).includes(s));
		if (gr.species === 'Exact' && overlap.length !== (guessed.species || []).length) return false;
		if (gr.species === 'None' && overlap.length > 0) return false;
		if (gr.species === 'Partial' && overlap.length === 0) return false;
	}
	if (gr.powerTypes !== 'None') {
		const overlap = (char.powerTypes || []).filter((p) => (guessed.powerTypes || []).includes(p));
		if (gr.powerTypes === 'Exact' && overlap.length !== (guessed.powerTypes || []).length) return false;
		if (gr.powerTypes === 'None' && overlap.length > 0) return false;
		if (gr.powerTypes === 'Partial' && overlap.length === 0) return false;
	}
	if (gr.origin !== 'None') {
		if (gr.origin === 'Exact' && char.origin !== guessed.origin) return false;
		if (gr.origin === 'None' && char.origin === guessed.origin) return false;
	}
	if (mode === 'comics' && gr.apparitionYear && gr.apparitionYear !== 'None') {
		const cy = char.apparitionYear || 0;
		const gy = guessed.apparitionYear || 0;
		if (gr.apparitionYear === 'Upper' && cy <= gy) return false;
		if (gr.apparitionYear === 'Lower' && cy >= gy) return false;
	}
	if (mode === 'mcu' && gr.appearanceTypes && gr.appearanceTypes !== 'None') {
		const overlap = (char.appearanceTypes || []).filter((t) =>
			(guessed.appearanceTypes || []).includes(t)
		);
		if (gr.appearanceTypes === 'Exact' && overlap.length !== (guessed.appearanceTypes || []).length)
			return false;
		if (gr.appearanceTypes === 'None' && overlap.length > 0) return false;
		if (gr.appearanceTypes === 'Partial' && overlap.length === 0) return false;
	}
	return true;
}

/** Narrow the pool given one upstream guess result (used by future live-solve UI). */
export function applyUpstreamFeedback(
	candidates: CharacterData[],
	gr: UpstreamGuessResult,
	guessed: CharacterData,
	mode: MarveldleMode
): CharacterData[] {
	return candidates.filter(
		(c) => c.id !== guessed.id && matchesConstraint(c, gr, guessed, mode)
	);
}
