import { getWordleLengthPageConfig } from '$lib/wordlebot-wasm/route-config';
import { getMainDailyDateKey } from '$lib/main-daily-date';

/**
 * Server-only load, on purpose.
 *
 * `getMainDailyDateKey()` resolves the puzzle date through puzzle-window's
 * rollover table and formats it with date-fns. Built in a universal `+page.ts`
 * loader — as this config used to be — both modules landed in the page's client
 * graph, so every solver document modulepreloaded ~26 KB of them to render one
 * date. On the server they stay in the server graph and the config reaches the
 * browser as prerendered data.
 */
export function load() {
	return {
		config: {
			...getWordleLengthPageConfig(5),
			dataUpdated: getMainDailyDateKey()
		}
	};
}
