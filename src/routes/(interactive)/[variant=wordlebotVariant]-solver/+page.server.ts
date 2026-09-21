import { getVariantSolverPageConfig } from '$lib/wordlebot-wasm/route-config';
import { getMainDailyDateKey } from '$lib/main-daily-date';
import { WORDLEBOT_VARIANT_ROUTE_SLUGS, type WordlebotVariantRouteSlug } from '$lib/wordlebot-wasm/routes';

export function entries() {
	return WORDLEBOT_VARIANT_ROUTE_SLUGS.map((variant) => ({ variant }));
}

/** Server-only load, on purpose — see wordle-solver/+page.server.ts. */
export function load({ params }) {
	return {
		config: {
			...getVariantSolverPageConfig(params.variant as WordlebotVariantRouteSlug),
			dataUpdated: getMainDailyDateKey()
		}
	};
}
