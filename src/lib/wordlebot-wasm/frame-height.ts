import { getWordlebotGame } from './game-config';
import type { WordlebotAppPageConfig } from './types';

/**
 * Height reserved for the solver region before the engine mounts.
 *
 * The solver used to mount itself on idle, roughly 2.5 s after load, and the swap was not
 * height neutral: the placeholder was a full-width board grid (~1.1 KB of tiles on desktop)
 * while the mounted app is a narrow column, so everything below the card moved and the page
 * carried a 0.111 CLS. Two things fix that:
 *
 *   1. the placeholder is sized like the app rather than like a full-width board, and
 *   2. the region reserves the app's height up front and both the placeholder and the mounted
 *      engine render into that same box, so mounting can only ever fill space that was already
 *      there.
 *
 * The numbers are the app's measured height at mount, read off the mounted solver in headless
 * Chromium (`npm run build`, then load /wordle-solver and hover into the region) with the
 * results panel still at its placeholder height:
 *
 *   settings card 225 + panel margin 14
 *   guesses panel 277
 *   results panel 440 (the height the shadow stylesheet holds it at, see WordlebotWasmClient)
 *   container padding 52
 *   -------------------------------------------------------------------------------
 *   1020 on an 800px-wide viewport; the floor below is that plus headroom
 *
 * The app's own numbers run slightly under the constants here on purpose: the reservation only
 * has to be an upper bound to do its job, and a few spare pixels read as breathing room, while
 * a reservation that is too small puts the shift straight back.
 *
 * The engine grows the region again when the first suggestion list arrives (that is content the
 * reader asked for by starting the tool, not a background swap), which is why this covers the
 * mount rather than the populated result.
 */
export const SOLVER_FRAME_FLOOR_PX = 1050;
export const SOLVER_FRAME_PER_EXTRA_BOARD_PX = 132;

/**
 * Below 520px the app's own stylesheet stacks the settings grid and the guess entry, which
 * measures 1290px at mount for a 5-letter solve — 270px more than the desktop box. The
 * component applies this through a matching media query.
 */
export const SOLVER_FRAME_MOBILE_EXTRA_PX = 270;

export function getSolverFrameMinHeight(config: WordlebotAppPageConfig): number {
	if (config.pageType !== 'solver') {
		return 0;
	}

	const extraBoards = Math.max(0, getWordlebotGame(config.game).boards - 1);
	return SOLVER_FRAME_FLOOR_PX + extraBoards * SOLVER_FRAME_PER_EXTRA_BOARD_PX;
}
