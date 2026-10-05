// Per-game config for the KeepExploring "keep exploring" module shown below the
// answer on daily answer pages.
//
// - datedPrefix: games with prerendered per-day dated pages
//   (/{prefix}-answer-for-october-4-2026). The "yesterday" link is computed from
//   the page's own puzzle date minus one day — never hardcoded.
// - solverHref: the game's own solver, or '/solver' when it has none.
// - archiveHref: the game's archive page, or null when it has none (falls back
//   to the /archive hub and the /today hub for onward links).

export type KeepExploringSlug =
	| 'wordle'
	| 'colordle'
	| 'canuckle'
	| 'quordle'
	| 'waffle'
	| 'nerdle'
	| 'phoodle'
	| 'phrazle'
	| 'worgle'
	| 'betweenle'
	| 'worldle'
	| 'globle'
	| 'countryle'
	| 'contexto'
	| 'semantle'
	| 'searchle'
	| 'colorfle'
	| 'framed'
	| 'spotle'
	| 'batterup'
	| 'marveldle'
	| 'dotadle'
	| 'loldle'
	| 'narutodle'
	| 'onepiecedle'
	| 'pokedle'
	| 'smashdle';

export interface KeepExploringConfig {
	gameName: string;
	/** per-day dated pages exist for this game (e.g. 'wordle' -> /wordle-answer-for-...) */
	datedPrefix?: 'wordle' | 'colordle';
	solverHref: string;
	solverLabel: string;
	solverSub: string;
	/** game archive page, or null when the game has none */
	archiveHref: string | null;
}

function dedicatedSolver(gameName: string, href: string): Pick<KeepExploringConfig, 'solverHref' | 'solverLabel' | 'solverSub'> {
	return {
		solverHref: href,
		solverLabel: `${gameName} solver`,
		solverSub: `Stuck on a guess? Narrow it down with the ${gameName} solver.`
	};
}

const SOLVER_HUB = {
	solverHref: '/solver',
	solverLabel: 'All puzzle solvers',
	solverSub: 'Browse every solver on WordSolverX in one place.'
};

export const KEEP_EXPLORING_CONFIG: Record<KeepExploringSlug, KeepExploringConfig> = {
	wordle: {
		gameName: 'Wordle',
		datedPrefix: 'wordle',
		...dedicatedSolver('Wordle', '/wordle-solver'),
		archiveHref: '/wordle-answer-archive'
	},
	colordle: {
		gameName: 'Colordle',
		datedPrefix: 'colordle',
		...dedicatedSolver('Colordle', '/colordle-solver'),
		archiveHref: '/colordle-archive'
	},
	canuckle: {
		gameName: 'Canuckle',
		...dedicatedSolver('Canuckle', '/canuckle-solver'),
		archiveHref: '/canuckle-archive'
	},
	quordle: {
		gameName: 'Quordle',
		...dedicatedSolver('Quordle', '/quordle-solver'),
		archiveHref: '/quordle-archive'
	},
	waffle: {
		gameName: 'Waffle',
		...dedicatedSolver('Waffle', '/waffle-solver'),
		archiveHref: '/waffle-archive'
	},
	nerdle: {
		gameName: 'Nerdle',
		...dedicatedSolver('Nerdle', '/nerdle-solver'),
		archiveHref: '/nerdle-archive'
	},
	phoodle: {
		gameName: 'Phoodle',
		...dedicatedSolver('Phoodle', '/phoodle-solver'),
		archiveHref: '/phoodle-archive'
	},
	phrazle: {
		gameName: 'Phrazle',
		...SOLVER_HUB,
		archiveHref: '/phrazle-archive'
	},
	worgle: {
		gameName: 'Worgle',
		...SOLVER_HUB,
		archiveHref: '/worgle-archive'
	},
	betweenle: {
		gameName: 'Betweenle',
		...dedicatedSolver('Betweenle', '/betweenle-solver'),
		archiveHref: null
	},
	worldle: {
		gameName: 'Worldle',
		...dedicatedSolver('Worldle', '/worldle-solver'),
		archiveHref: '/worldle-archive'
	},
	globle: {
		gameName: 'Globle',
		...SOLVER_HUB,
		archiveHref: '/globle-archive'
	},
	countryle: {
		gameName: 'Countryle',
		...dedicatedSolver('Countryle', '/countryle-solver'),
		archiveHref: '/countryle-archive'
	},
	contexto: {
		gameName: 'Contexto',
		...SOLVER_HUB,
		archiveHref: '/contexto-archive'
	},
	semantle: {
		gameName: 'Semantle',
		...SOLVER_HUB,
		archiveHref: '/semantle-archive'
	},
	searchle: {
		gameName: 'Searchle',
		...dedicatedSolver('Searchle', '/searchle-solver'),
		archiveHref: '/searchle-archive'
	},
	colorfle: {
		gameName: 'Colorfle',
		...dedicatedSolver('Colorfle', '/colorfle-solver'),
		archiveHref: '/colorfle-archive'
	},
	framed: {
		gameName: 'Framed',
		...SOLVER_HUB,
		archiveHref: '/framed-archive'
	},
	spotle: {
		gameName: 'Spotle',
		...dedicatedSolver('Spotle', '/spotle-solver'),
		archiveHref: '/spotle-archive'
	},
	batterup: {
		gameName: 'Batter Up',
		...dedicatedSolver('Batter Up', '/batterup-solver'),
		archiveHref: '/batterup-archive'
	},
	marveldle: {
		gameName: 'Marveldle',
		...dedicatedSolver('Marveldle', '/marveldle-solver'),
		archiveHref: '/marveldle-archive'
	},
	dotadle: {
		gameName: 'Dotadle',
		...dedicatedSolver('Dotadle', '/dotadle-solver'),
		archiveHref: null
	},
	loldle: {
		gameName: 'LoLdle',
		...dedicatedSolver('LoLdle', '/loldle-solver'),
		archiveHref: null
	},
	narutodle: {
		gameName: 'Narutodle',
		...dedicatedSolver('Narutodle', '/narutodle-solver'),
		archiveHref: null
	},
	onepiecedle: {
		gameName: 'Onepiecedle',
		...dedicatedSolver('Onepiecedle', '/onepiecedle-solver'),
		archiveHref: null
	},
	pokedle: {
		gameName: 'Pokedle',
		...dedicatedSolver('Pokedle', '/pokedle-solver'),
		archiveHref: null
	},
	smashdle: {
		gameName: 'Smashdle',
		...dedicatedSolver('Smashdle', '/smashdle-solver'),
		archiveHref: null
	}
};
