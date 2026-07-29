import { getBestLengthForWordlebotGame } from './game-config';
import type { WordlebotGameSlug } from './types';

export const WORDLEBOT_WORDLE_SOLVER_LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export const WORDLEBOT_VARIANT_ROUTE_SLUGS = [
        'canuckle',
        'hardle',
        'warmle',
        'woodle',
        'w-peaks',
        'xordle',
        'fibble',
        'dordle',
        'quordle',
        'octordle',
        'spotle-wordle'
] as const;

export type WordlebotVariantRouteSlug = (typeof WORDLEBOT_VARIANT_ROUTE_SLUGS)[number];

const VARIANT_ROUTE_TO_GAME: Record<WordlebotVariantRouteSlug, WordlebotGameSlug> = {
        canuckle: 'canuckle',
        hardle: 'hardle',
        warmle: 'warmle',
        woodle: 'woodle',
        'w-peaks': 'w-peaks',
        xordle: 'xordle',
        fibble: 'fibble',
        dordle: 'dordle',
        quordle: 'quordle',
        octordle: 'octordle',
        'spotle-wordle': 'spotle'
};

const GAME_TO_VARIANT_ROUTE: Record<WordlebotGameSlug, string> = {
        canuckle: 'canuckle',
        wordle: '',
        xordle: 'xordle',
        fibble: 'fibble',
        warmle: 'warmle',
        hardle: 'hardle',
        woodle: 'woodle',
        'w-peaks': 'w-peaks',
        // thirdle-solver merged into spotle-wordle-solver per SEO audit Bug #4
        // The thirdle GAME slug is still valid (engine can solve 3-letter puzzles),
        // but its public URL is now /spotle-wordle-solver.
        thirdle: 'spotle-wordle',
        dordle: 'dordle',
        quordle: 'quordle',
        octordle: 'octordle',
        spotle: 'spotle-wordle'
};

export function getGameForVariantRoute(slug: WordlebotVariantRouteSlug): WordlebotGameSlug {
        return VARIANT_ROUTE_TO_GAME[slug];
}

export function getVariantRouteForGame(game: WordlebotGameSlug): string {
        return GAME_TO_VARIANT_ROUTE[game];
}

export function getWordleLengthSolverPath(wordLength: number): string {
        return `/${wordLength}-letter-wordle-solver`;
}

export function getCanucklePagePath(page: 'today' | 'archive' | 'solver'): string {
        if (page === 'today') return '/canuckle-answer-today';
        if (page === 'archive') return '/canuckle-archive';
        return '/canuckle-solver';
}

export function getWordlebotSolverPath(game: WordlebotGameSlug, preferredLength = 5): string {
        if (game === 'wordle') {
                const length = getBestLengthForWordlebotGame(game, preferredLength);
                return getWordleLengthSolverPath(length);
        }

        if (game === 'canuckle') {
                return getCanucklePagePath('solver');
        }

        return `/${getVariantRouteForGame(game)}-solver`;
}
