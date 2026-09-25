/**
 * Nonogram solver Web Worker.
 *
 * Runs the hardened solver off the main thread so large grids never freeze
 * the page. Vite/SvelteKit bundles this natively via
 * `new Worker(new URL('./nonogram.worker.ts', import.meta.url), { type: 'module' })`.
 *
 * Protocol:
 *   main -> worker: { puzzle: NonogramPuzzle, maxSteps?: number }
 *   worker -> main: { solved, solution, error?, steps, stepsTruncated?, solveTimeMs }
 */
/// <reference lib="webworker" />

import {
  solveNonogramHardened,
  validateSolution,
  type NonogramPuzzle,
  type SolveStep,
  type Grid
} from './solver';

export interface NonogramWorkerRequest {
  puzzle: NonogramPuzzle;
  /** Cap on step snapshots returned (defaults to the engine default). */
  maxSteps?: number;
}

export interface NonogramWorkerResponse {
  solved: boolean;
  solution: Grid | null;
  error?: string;
  steps: SolveStep[];
  stepsTruncated?: boolean;
  solveTimeMs: number;
}

self.onmessage = (event: MessageEvent<NonogramWorkerRequest>) => {
  const { puzzle, maxSteps } = event.data;

  const result = solveNonogramHardened(puzzle, maxSteps === undefined ? {} : { maxSteps });

  // Double-check the engine's answer against the clues before reporting success.
  const valid =
    result.solved && result.solution !== null
      ? validateSolution(result.solution, puzzle.rowClues, puzzle.colClues)
      : false;

  const response: NonogramWorkerResponse = {
    solved: valid,
    solution: result.solution,
    error:
      result.error ??
      (result.solved && !valid ? 'The solver produced a grid that does not match the clues.' : undefined),
    steps: result.steps,
    stepsTruncated: result.stepsTruncated,
    solveTimeMs: result.solveTimeMs ?? 0
  };

  self.postMessage(response);
};
