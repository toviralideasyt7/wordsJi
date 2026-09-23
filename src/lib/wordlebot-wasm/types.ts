export type WordlebotFeedbackMode =
	| 'standard'
	| 'xordle'
	| 'warmle'
	| 'woodle'
	| 'peaks'
	| 'spotle';

export type WordlebotGameSlug =
	| 'canuckle'
	| 'wordle'
	| 'xordle'
	| 'fibble'
	| 'warmle'
	| 'hardle'
	| 'woodle'
	| 'w-peaks'
	| 'thirdle'
	| 'dordle'
	| 'quordle'
	| 'octordle'
	| 'spotle';

export interface WordlebotGameConfig {
	slug: WordlebotGameSlug;
	name: string;
	rankingKey: string;
	boards: number;
	lengths: number[];
	defaultMax: number;
	feedback: WordlebotFeedbackMode;
	description: string;
	supportsWarmleDistance?: boolean;
}

export type WordlebotAppPageConfig =
	| {
			pageType: 'solver';
			game: WordlebotGameSlug;
			wordLength?: number;
	  }
	| {
			pageType: 'canuckle-daily';
			visibleDateKey: string;
	  }
	| {
			pageType: 'canuckle-archive';
			visibleDateKey: string;
	  };

export interface SolverDataset {
	length: number;
	guesses: string[];
	restrictedAnswers: string[];
	completeAnswers: string[];
	officialAnswers?: string[];
	officialGuesses?: string[];
	easyRankings: Record<string, unknown[]>;
	hardRankings?: Record<string, unknown[]>;
}

export interface SolverTurn {
	guess: string;
	feedback: string[];
}

export interface SolverState {
	game: WordlebotGameSlug;
	gameName: string;
	boards: number;
	wordLength: number;
	feedbackMode: WordlebotFeedbackMode;
	description: string;
	dataset: SolverDataset;
	bank: 'restricted' | 'complete';
	hardMode: boolean;
	maxGuesses: number;
	warmleDistance: number;
	turns: SolverTurn[];
}

export interface SolverSuggestion {
	word: string;
	average: number;
	wrong: number;
	fullyTested?: boolean;
}

export interface SolverResponse {
	totalLikely: number;
	totalUnlikely: number;
	suggestions: SolverSuggestion[];
	likelyAnswers: string[][];
	unlikelyAnswers: string[][];
	boardCount: number;
}

export interface CanuckleSourceInfo {
	projectId: string;
	version: string;
	collections: {
		words: string;
		puzzles: string;
		version: string;
	};
	fetchedAt: string;
}

export interface CanucklePuzzle {
	index: number;
	answer: string;
	date: string;
	fact: string[];
	factUrls?: string[];
	distribution?: {
		ones?: number;
		twos?: number;
		threes?: number;
		fours?: number;
		fives?: number;
		sixes?: number;
		losses?: number;
	};
	createTime?: string;
	updateTime?: string;
}

export type CanuckleSolverData = SolverDataset;

export interface CanuckleData {
	source: CanuckleSourceInfo;
	schedule: {
		originalStart: string;
		currentStart: string;
	};
	maxIndex: number;
	acceptedWords: string[];
	puzzles: CanucklePuzzle[];
}

export interface WordlebotHowToStep {
	name: string;
	text: string;
}

export interface WordlebotSeoSection {
	title: string;
	paragraphs: string[];
}

export interface WordlebotPageConfig {
	appConfig: WordlebotAppPageConfig;
	title: string;
	metaTitle?: string;
	displayTitle?: string;
	eyebrow: string;
	description: string;
	pageUrl: string;
	keywords: string[];
	faqTitle: string;
	faqs: Array<{
		question: string;
		answer: string;
	}>;
	howToTitle: string;
	howToSteps: WordlebotHowToStep[];
	sections: WordlebotSeoSection[];
	chips: string[];
	cta?: {
		label: string;
		href: string;
	};
	/**
	 * Puzzle date the solver's answer list and daily data were last rolled
	 * forward to (YYYY-MM-DD). Rendered in the page body next to the author and
	 * the corrections link, and the same value the Article JSON-LD dates from.
	 */
	dataUpdated?: string;
}
