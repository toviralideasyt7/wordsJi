import type { GameSolverConfig, SolverGameKey } from './types';

export const GAME_ORDER: SolverGameKey[] = [
	'loldle',
	'dotadle',
	'pokedle',
	'smashdle',
	'narutodle',
	'onepiecedle'
];

export const GAME_SOLVER_CONFIGS: Record<SolverGameKey, GameSolverConfig> = {
	loldle: {
		key: 'loldle',
		name: 'LoLdle',
		icon: 'L',
		route: '/loldle-solver',
		answerRoute: '/loldle-answer-today-updated',
		dataFile: '/data/loldle_champions.json',
		nameKey: 'championName',
		description: 'Guess the League of Legends champion with smart attribute filtering.',
		keywords: [
			'loldle solver',
			'loldle helper',
			'loldle answer',
			'league of legends champion solver',
			'wordsolverx loldle'
		],
		attributes: [
			{ key: 'gender', label: 'Gender', type: 'string', compareType: 'exact' },
			{ key: 'positions', label: 'Position', type: 'array', compareType: 'contains' },
			{ key: 'species', label: 'Species', type: 'array', compareType: 'contains' },
			{ key: 'resource', label: 'Resource', type: 'string', compareType: 'exact' },
			{ key: 'range_type', label: 'Range Type', type: 'array', compareType: 'contains' },
			{ key: 'regions', label: 'Region', type: 'array', compareType: 'contains' },
			{ key: 'release_date', label: 'Release Year', type: 'number', compareType: 'numeric' }
		]
	},
	dotadle: {
		key: 'dotadle',
		name: 'Dotadle',
		icon: 'D',
		route: '/dotadle-solver',
		answerRoute: '/dotadle-answer-today-updated',
		dataFile: '/data/dotadle_heroes.json',
		nameKey: 'championName',
		description: 'Solve Dotadle by filtering Dota 2 heroes using game feedback.',
		keywords: [
			'dotadle solver',
			'dotadle helper',
			'dotadle answer',
			'dota 2 hero solver',
			'wordsolverx dotadle'
		],
		attributes: [
			{ key: 'gender', label: 'Gender', type: 'string', compareType: 'exact' },
			{ key: 'attribute', label: 'Attribute', type: 'string', compareType: 'exact' },
			{ key: 'lane', label: 'Lane', type: 'array', compareType: 'contains' },
			{ key: 'rangeType', label: 'Range Type', type: 'array', compareType: 'contains' },
			{ key: 'species', label: 'Species', type: 'array', compareType: 'contains' },
			{ key: 'complexity', label: 'Complexity', type: 'string', compareType: 'exact' },
			{ key: 'releaseYear', label: 'Release Year', type: 'number', compareType: 'numeric' }
		]
	},
	pokedle: {
		key: 'pokedle',
		name: 'Pokedle',
		icon: 'P',
		route: '/pokedle-solver',
		answerRoute: '/pokedle-answer-today-updated',
		dataFile: '/data/pokedle_pokemon.json',
		nameKey: 'championName',
		description: 'Find the right Pokemon faster with Type, habitat, and stat clues.',
		keywords: [
			'pokedle solver',
			'pokedle helper',
			'pokedle answer',
			'pokemon daily puzzle solver',
			'wordsolverx pokedle'
		],
		attributes: [
			{ key: 'type1', label: 'Type 1', type: 'string', compareType: 'exact' },
			{ key: 'type2', label: 'Type 2', type: 'string', compareType: 'exact' },
			{ key: 'habitat', label: 'Habitat', type: 'string', compareType: 'exact' },
			{ key: 'color', label: 'Color', type: 'array', compareType: 'contains' },
			{ key: 'evolutionStage', label: 'Evolution Stage', type: 'number', compareType: 'numeric' },
			{ key: 'height', label: 'Height', type: 'number', compareType: 'numeric' },
			{ key: 'weight', label: 'Weight', type: 'number', compareType: 'numeric' }
		]
	},
	smashdle: {
		key: 'smashdle',
		name: 'Smashdle',
		icon: 'S',
		route: '/smashdle-solver',
		answerRoute: '/smashdle-answer-today-updated',
		dataFile: '/data/smashdle_characters.json',
		nameKey: 'championName',
		description: 'Narrow Smashdle candidates with universe, weight, species, and more.',
		keywords: [
			'smashdle solver',
			'smashdle helper',
			'smashdle answer',
			'smash bros fighter solver',
			'wordsolverx smashdle'
		],
		attributes: [
			{ key: 'gender', label: 'Gender', type: 'string', compareType: 'exact' },
			{ key: 'universe', label: 'Universe', type: 'array', compareType: 'contains' },
			{ key: 'games', label: 'Games', type: 'array', compareType: 'contains' },
			{ key: 'availability', label: 'Availability', type: 'string', compareType: 'exact' },
			{ key: 'weight', label: 'Weight', type: 'number', compareType: 'numeric' },
			{ key: 'jump_number', label: 'Jumps', type: 'number', compareType: 'numeric' },
			{ key: 'species', label: 'Species', type: 'array', compareType: 'contains' },
			{ key: 'originDate', label: 'Origin Year', type: 'number', compareType: 'numeric' }
		]
	},
	narutodle: {
		key: 'narutodle',
		name: 'Narutodle',
		icon: 'N',
		route: '/narutodle-solver',
		answerRoute: '/narutodle-answer-today-updated',
		dataFile: '/data/narutodle_characters.json',
		nameKey: 'championName',
		description: 'Use village, rank, nature types, and age clues to solve Narutodle.',
		keywords: [
			'narutodle solver',
			'narutodle helper',
			'narutodle answer',
			'naruto character solver',
			'wordsolverx narutodle'
		],
		attributes: [
			{ key: 'gender', label: 'Gender', type: 'string', compareType: 'exact' },
			{ key: 'affiliations', label: 'Affiliation', type: 'array', compareType: 'contains' },
			{ key: 'ninjaRank', label: 'Rank', type: 'string', compareType: 'exact' },
			{ key: 'age', label: 'Age', type: 'number', compareType: 'numeric' },
			{ key: 'debut', label: 'Debut Chapter', type: 'number', compareType: 'numeric' },
			{ key: 'classifications', label: 'Classification', type: 'array', compareType: 'contains' },
			{ key: 'natureTypes', label: 'Nature Type', type: 'array', compareType: 'contains' },
			{ key: 'status', label: 'Status', type: 'string', compareType: 'exact' }
		]
	},
	onepiecedle: {
		key: 'onepiecedle',
		name: 'Onepiecedle',
		icon: 'O',
		route: '/onepiecedle-solver',
		answerRoute: '/onepiecedle-answer-today-updated',
		dataFile: '/data/onepiecedle_characters.json',
		nameKey: 'championName',
		description: 'Solve Onepiecedle with bounty, affiliation, devil fruit, and haki filters.',
		keywords: [
			'onepiecedle solver',
			'one piecedle solver',
			'onepiecedle helper',
			'one piece character solver',
			'wordsolverx onepiecedle'
		],
		attributes: [
			{ key: 'gender', label: 'Gender', type: 'string', compareType: 'exact' },
			{ key: 'affiliation', label: 'Affiliation', type: 'string', compareType: 'exact' },
			{ key: 'origin', label: 'Origin', type: 'string', compareType: 'exact' },
			{ key: 'status', label: 'Status', type: 'string', compareType: 'exact' },
			{ key: 'height', label: 'Height', type: 'number', compareType: 'numeric' },
			{ key: 'bounty', label: 'Bounty', type: 'number', compareType: 'numeric' },
			{ key: 'debut', label: 'Debut Chapter', type: 'number', compareType: 'numeric' },
			{ key: 'haki', label: 'Haki', type: 'array', compareType: 'contains' },
			{ key: 'devilFruitType', label: 'Devil Fruit Type', type: 'string', compareType: 'exact' }
		]
	}
};

export function getSolverCrossLinks(gameKey: SolverGameKey): Array<{ href: string; label: string }> {
	return GAME_ORDER.filter((key) => key !== gameKey).map((key) => ({
		href: GAME_SOLVER_CONFIGS[key].route,
		label: GAME_SOLVER_CONFIGS[key].name
	}));
}
