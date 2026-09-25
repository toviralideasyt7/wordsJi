// src/routes/(interactive)/batterup-solver/+page.server.ts
import type { PageServerLoad } from './$types';

const SITE_URL = 'https://wordsolverx.com';

export const load: PageServerLoad = async () => {
	const pageTitle = 'Batter Up Solver: Guess the MLB Player | WordSolverX';
	const pageDescription =
		'Enter your Batter Up guesses and feedback colors to shrink the MLB player pool. Get entropy-ranked suggestions for the highest-information next guess.';
	return {
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords:
				'batter up solver, batter up helper, batter up mlb solver, batter up guess helper, batter up answer today',
			socialImage: `${SITE_URL}/wordsolverx.webp`
		}
	};
};
