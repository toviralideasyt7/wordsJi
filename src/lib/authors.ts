import { generatePersonAuthorSchema } from '$lib/seo';

// All pages use Preston Hayes as the credited editor for consistency.
export const PRESTON_HAYES_AUTHOR_NAME = 'Preston Hayes';
export const PRESTON_HAYES_AUTHOR_URL = 'https://wordsolverx.com/about#preston-hayes';
export const PRESTON_HAYES_AUTHOR_IMAGE = '/author-wordsolverx.webp';
export const PRESTON_HAYES_AUTHOR_IMAGE_URL = 'https://wordsolverx.com/author-wordsolverx.webp';
export const PRESTON_HAYES_AUTHOR_DESCRIPTION =
	'Preston Hayes is the credited editor for WordSolverX answer pages and puzzle strategy content. His work focuses on clear answer presentation, source verification, solver guidance, and fast corrections when a game changes.';
export const PRESTON_HAYES_AUTHOR_JOB_TITLE = 'Puzzle Content Editor';
export const PRESTON_HAYES_AUTHOR_KNOWS_ABOUT = [
	'Wordle',
	'Word Puzzles',
	'Daily Puzzle Answers',
	'Puzzle Solver Tools',
	'Information Theory'
];

export const PRESTON_HAYES_AUTHOR_SAME_AS = [
	'https://www.pinterest.com/wordsolverx/'
];

export function getAuthorForGame(_gameName: string): string {
	return PRESTON_HAYES_AUTHOR_NAME;
}

export function getAuthorProfileUrl(_authorName?: string): string {
	return PRESTON_HAYES_AUTHOR_URL;
}

export function getPrestonHayesAuthorSchema() {
	return generatePersonAuthorSchema(
		PRESTON_HAYES_AUTHOR_NAME,
		PRESTON_HAYES_AUTHOR_URL,
		PRESTON_HAYES_AUTHOR_IMAGE_URL,
		PRESTON_HAYES_AUTHOR_JOB_TITLE,
		PRESTON_HAYES_AUTHOR_KNOWS_ABOUT,
		PRESTON_HAYES_AUTHOR_SAME_AS
	);
}
