// src/routes/(interactive)/marveldle-solver/+page.server.ts
import type { PageServerLoad } from './$types';

const SITE_URL = 'https://wordsolverx.com';

export const load: PageServerLoad = async () => {
	const pageTitle = 'Marveldle Solver: Comics & MCU Helper | WordSolverX';
	const pageDescription =
		'Enter your Marveldle guesses and tile colors to narrow the character pool. Works for Comics and MCU modes with ranked next-guess suggestions.';
	return {
		meta: {
			title: pageTitle,
			description: pageDescription,
			keywords:
				'marveldle solver, marveldle helper, marvel wordle solver, marveldle mcu solver, marveldle answer today',
			socialImage: `${SITE_URL}/wordsolverx.webp`
		}
	};
};
