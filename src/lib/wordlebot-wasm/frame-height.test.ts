import { describe, expect, it } from 'vitest';
import {
	SOLVER_FRAME_FLOOR_PX,
	SOLVER_FRAME_PER_EXTRA_BOARD_PX,
	getSolverFrameMinHeight
} from './frame-height';

/**
 * The reservation exists so mounting the solver cannot move the article below the card. It only
 * has to be an upper bound, so these tests pin the two properties that matter: it is never
 * smaller than the app's own floor (`.solver-container { min-height: 600px }` plus the results
 * panel it renders into), and it grows with the number of boards the app stacks.
 */
describe('solver frame reservation', () => {
	it('reserves the app floor for a single-board solver', () => {
		const height = getSolverFrameMinHeight({ pageType: 'solver', game: 'wordle', wordLength: 5 });

		expect(height).toBe(SOLVER_FRAME_FLOOR_PX);
		expect(height).toBeGreaterThanOrEqual(600);
	});

	it('grows with each additional board the app stacks', () => {
		const dordle = getSolverFrameMinHeight({ pageType: 'solver', game: 'dordle' });
		const quordle = getSolverFrameMinHeight({ pageType: 'solver', game: 'quordle' });
		const octordle = getSolverFrameMinHeight({ pageType: 'solver', game: 'octordle' });

		expect(dordle).toBe(SOLVER_FRAME_FLOOR_PX + SOLVER_FRAME_PER_EXTRA_BOARD_PX);
		expect(quordle).toBeGreaterThan(dordle);
		expect(octordle).toBeGreaterThan(quordle);
	});

	it('does not reserve anything for the panels that are not the solver', () => {
		expect(getSolverFrameMinHeight({ pageType: 'canuckle-daily', visibleDateKey: '2026-09-21' })).toBe(0);
		expect(getSolverFrameMinHeight({ pageType: 'canuckle-archive', visibleDateKey: '2026-09-21' })).toBe(0);
	});
});
