import { getWordleLengthPageConfig } from '$lib/wordlebot-wasm/route-config';
import { getMainDailyDateKey } from '$lib/main-daily-date';
import { WORDLEBOT_WORDLE_SOLVER_LENGTHS } from '$lib/wordlebot-wasm/routes';

export function entries() {
	return WORDLEBOT_WORDLE_SOLVER_LENGTHS.filter((wordLength) => wordLength !== 5).map((wordLength) => ({
		wordLength: String(wordLength)
	}));
}

/** Server-only load, on purpose — see wordle-solver/+page.server.ts. */
export function load({ params }) {
	return {
		config: {
			...getWordleLengthPageConfig(Number(params.wordLength)),
			dataUpdated: getMainDailyDateKey()
		}
	};
}
