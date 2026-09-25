/**
 * Nonogram Solver - Hybrid Approach
 * 
 * This solver uses a combination of:
 * 1. Line Solving with Dynamic Programming - finds cells that must be filled/blank
 * 2. Constraint Propagation - iteratively applies line solving to all lines
 * 3. Backtracking with Pruning - handles cases where logic alone fails
 * 
 * Based on research from:
 * - "An Efficient Approach to Solving Nonograms" (IEEE, 2013)
 * - "The Magic of Nonogram Solving" (UPC Barcelona)
 */

// Cell states
export const FILLED = 1;
export const BLANK = 0;
export const UNKNOWN = -1;

export type CellState = typeof FILLED | typeof BLANK | typeof UNKNOWN;
export type Grid = CellState[][];
export type Clues = number[][];

export interface NonogramPuzzle {
  rows: number;
  cols: number;
  rowClues: Clues;
  colClues: Clues;
}

export interface SolveResult {
  solution: Grid | null;
  solved: boolean;
  steps: SolveStep[];
  error?: string;
}

export interface SolveStep {
  type: 'line' | 'propagation' | 'backtrack' | 'guess';
  description: string;
  cells: { row: number; col: number; value: CellState }[];
  gridSnapshot: Grid;
}

/**
 * Generate all valid arrangements for a line given clues
 * Uses recursive generation with pruning
 */
export function generateLineArrangements(
  clues: number[],
  length: number,
  currentLine: CellState[] = []
): CellState[][] {
  // ── HARDENING (WordSolverX): memoize full-line enumeration and reset the
  // per-line arrangement budget. Recursive calls pass a non-empty currentLine
  // and skip the memo/budget bookkeeping.
  const memoKey = currentLine.length === 0 ? lineArrangementCacheKey(clues, length) : null;
  if (memoKey !== null) {
    const cached = getCachedArrangements(memoKey);
    if (cached) return cached;
    resetLineArrangementCount();
  }

  // Base case: no more clues to place
  if (clues.length === 0) {
    const arrangement = [...currentLine];
    // Fill remaining with BLANK
    while (arrangement.length < length) {
      arrangement.push(BLANK);
    }
    trackGeneratedArrangement(); // ── HARDENING: throws past the per-line budget
    const result = [arrangement];
    if (memoKey !== null) storeCachedArrangements(memoKey, result);
    return result;
  }

  // Calculate minimum space needed for remaining clues
  const minSpace = clues.reduce((sum, c) => sum + c, 0) + clues.length - 1;
  const remaining = length - currentLine.length;

  // Not enough space - no valid arrangements
  if (minSpace > remaining) {
    if (memoKey !== null) storeCachedArrangements(memoKey, []); // ── HARDENING
    return [];
  }

  const arrangements: CellState[][] = [];
  const firstClue = clues[0];
  const remainingClues = clues.slice(1);

  // Try placing the first clue at each valid position
  for (let start = 0; start <= remaining - minSpace; start++) {
    // Add blank cells before the clue
    const newLine = [...currentLine];
    for (let i = 0; i < start; i++) {
      newLine.push(BLANK);
    }

    // Add the filled cells for the clue
    for (let i = 0; i < firstClue; i++) {
      newLine.push(FILLED);
    }

    // Add mandatory blank after clue (if not the last clue)
    if (remainingClues.length > 0) {
      newLine.push(BLANK);
    }

    // Recursively place remaining clues
    const subArrangements = generateLineArrangements(remainingClues, length, newLine);
    arrangements.push(...subArrangements);
  }

  if (memoKey !== null) storeCachedArrangements(memoKey, arrangements); // ── HARDENING
  return arrangements;
}

/**
 * Filter arrangements that match the current known state
 */
export function filterValidArrangements(
  arrangements: CellState[][],
  currentLine: CellState[]
): CellState[][] {
  return arrangements.filter(arrangement => {
    for (let i = 0; i < currentLine.length; i++) {
      if (currentLine[i] !== UNKNOWN && currentLine[i] !== arrangement[i]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Find cells that have the same value in all valid arrangements
 * Returns an array of determined cells
 */
export function findDeterminedCells(
  arrangements: CellState[][],
  length: number,
  currentLine: CellState[]
): { index: number; value: CellState }[] {
  if (arrangements.length === 0) {
    return []; // No valid arrangements - indicates contradiction
  }

  const determined: { index: number; value: CellState }[] = [];

  for (let i = 0; i < length; i++) {
    // Skip if already determined
    if (currentLine[i] !== UNKNOWN) continue;

    const firstValue = arrangements[0][i];
    const allSame = arrangements.every(arr => arr[i] === firstValue);

    if (allSame) {
      determined.push({ index: i, value: firstValue });
    }
  }

  return determined;
}

/**
 * Solve a single line and return determined cells
 */
export function solveLine(
  clues: number[],
  currentLine: CellState[]
): { index: number; value: CellState }[] {
  const length = currentLine.length;
  
  // Generate all possible arrangements
  const allArrangements = generateLineArrangements(clues, length);
  
  // Filter by current known state
  const validArrangements = filterValidArrangements(allArrangements, currentLine);
  
  // Find cells that are determined
  return findDeterminedCells(validArrangements, length, currentLine);
}

/**
 * Create an empty grid
 */
export function createEmptyGrid(rows: number, cols: number): Grid {
  return Array(rows).fill(null).map(() => Array(cols).fill(UNKNOWN));
}

/**
 * Copy a grid
 */
export function copyGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

/**
 * Check if grid is completely solved
 */
export function isGridSolved(grid: Grid): boolean {
  return grid.every(row => row.every(cell => cell !== UNKNOWN));
}

/**
 * Check if grid has a contradiction (no valid arrangements for a line)
 */
export function hasContradiction(
  grid: Grid,
  rowClues: Clues,
  colClues: Clues
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  // Check rows
  for (let r = 0; r < rows; r++) {
    const arrangements = generateLineArrangements(rowClues[r], cols);
    const valid = filterValidArrangements(arrangements, grid[r]);
    if (valid.length === 0) return true;
  }

  // Check columns
  for (let c = 0; c < cols; c++) {
    const colLine = grid.map(row => row[c]);
    const arrangements = generateLineArrangements(colClues[c], rows);
    const valid = filterValidArrangements(arrangements, colLine);
    if (valid.length === 0) return true;
  }

  return false;
}

/**
 * Propagation phase: solve lines iteratively until no progress
 */
export function propagate(
  grid: Grid,
  rowClues: Clues,
  colClues: Clues,
  onStep?: (step: SolveStep) => void
): { grid: Grid; progress: boolean } {
  const rows = grid.length;
  const cols = grid[0].length;
  let currentGrid = copyGrid(grid);
  let madeProgress = true;
  let totalProgress = false;

  while (madeProgress) {
    madeProgress = false;

    // Process rows
    for (let r = 0; r < rows; r++) {
      const determined = solveLine(rowClues[r], currentGrid[r]);
      
      if (determined.length > 0) {
        madeProgress = true;
        totalProgress = true;
        
        const cells = determined.map(d => ({
          row: r,
          col: d.index,
          value: d.value
        }));

        for (const d of determined) {
          currentGrid[r][d.index] = d.value;
        }

        if (onStep) {
          onStep({
            type: 'line',
            description: `Row ${r + 1}: Determined ${determined.length} cell(s)`,
            cells,
            gridSnapshot: copyGrid(currentGrid)
          });
        }
      }
    }

    // Process columns
    for (let c = 0; c < cols; c++) {
      const colLine = currentGrid.map(row => row[c]);
      const determined = solveLine(colClues[c], colLine);
      
      if (determined.length > 0) {
        madeProgress = true;
        totalProgress = true;
        
        const cells = determined.map(d => ({
          row: d.index,
          col: c,
          value: d.value
        }));

        for (const d of determined) {
          currentGrid[d.index][c] = d.value;
        }

        if (onStep) {
          onStep({
            type: 'line',
            description: `Column ${c + 1}: Determined ${determined.length} cell(s)`,
            cells,
            gridSnapshot: copyGrid(currentGrid)
          });
        }
      }
    }
  }

  return { grid: currentGrid, progress: totalProgress };
}

/**
 * Find the best cell to guess (minimum remaining values heuristic)
 */
export function findBestGuessCell(
  grid: Grid,
  rowClues: Clues,
  colClues: Clues
): { row: number; col: number } | null {
  const rows = grid.length;
  const cols = grid[0].length;
  
  let bestCell: { row: number; col: number } | null = null;
  let minOptions = Infinity;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === UNKNOWN) {
        // Count valid arrangements for this cell's row and column
        const rowArrangements = filterValidArrangements(
          generateLineArrangements(rowClues[r], cols),
          grid[r]
        );
        const colLine = grid.map(row => row[c]);
        const colArrangements = filterValidArrangements(
          generateLineArrangements(colClues[c], rows),
          colLine
        );
        
        const options = Math.max(1, Math.min(rowArrangements.length, colArrangements.length));
        
        if (options < minOptions) {
          minOptions = options;
          bestCell = { row: r, col: c };
        }
      }
    }
  }

  return bestCell;
}

/**
 * Main solver function using hybrid approach
 */
export function solveNonogram(
  puzzle: NonogramPuzzle,
  onStep?: (step: SolveStep) => void,
  maxBacktracks: number = 10000
): SolveResult {
  const { rows, cols, rowClues, colClues } = puzzle;
  const steps: SolveStep[] = [];
  
  const recordStep = (step: SolveStep) => {
    steps.push(step);
    if (onStep) onStep(step);
  };

  // Initialize empty grid
  let grid = createEmptyGrid(rows, cols);
  
  // Phase 1: Propagation
  recordStep({
    type: 'propagation',
    description: 'Starting constraint propagation phase',
    cells: [],
    gridSnapshot: copyGrid(grid)
  });

  const propagationResult = propagate(grid, rowClues, colClues, recordStep);
  grid = propagationResult.grid;

  // Check if solved
  if (isGridSolved(grid)) {
    return { solution: grid, solved: true, steps };
  }

  // Check for contradiction
  if (hasContradiction(grid, rowClues, colClues)) {
    return { 
      solution: null, 
      solved: false, 
      steps, 
      error: 'Contradiction detected - puzzle may be unsolvable' 
    };
  }

  // Phase 2: Backtracking
  recordStep({
    type: 'backtrack',
    description: 'Starting backtracking phase',
    cells: [],
    gridSnapshot: copyGrid(grid)
  });

  let backtrackCount = 0;
  const backtrackStack: { grid: Grid; cell: { row: number; col: number }; triedFilled: boolean }[] = [];

  while (!isGridSolved(grid) && backtrackCount < maxBacktracks) {
    // Find best cell to guess
    const guessCell = findBestGuessCell(grid, rowClues, colClues);
    
    if (!guessCell) {
      // No unknown cells but not solved - contradiction
      break;
    }

    // Make a guess (try FILLED first)
    recordStep({
      type: 'guess',
      description: `Guessing cell (${guessCell.row + 1}, ${guessCell.col + 1}) = FILLED`,
      cells: [{ row: guessCell.row, col: guessCell.col, value: FILLED }],
      gridSnapshot: copyGrid(grid)
    });

    const gridCopy = copyGrid(grid);
    gridCopy[guessCell.row][guessCell.col] = FILLED;
    backtrackStack.push({ 
      grid: copyGrid(grid), 
      cell: guessCell, 
      triedFilled: true 
    });

    // Propagate from guess
    const result = propagate(gridCopy, rowClues, colClues, recordStep);

    if (hasContradiction(result.grid, rowClues, colClues)) {
      // Guess was wrong, try BLANK
      backtrackCount++;
      
      const lastGuess = backtrackStack.pop();
      if (!lastGuess) {
        return { 
          solution: null, 
          solved: false, 
          steps, 
          error: 'No more guesses to backtrack - puzzle may be unsolvable' 
        };
      }

      recordStep({
        type: 'backtrack',
        description: `Backtracking: cell (${lastGuess.cell.row + 1}, ${lastGuess.cell.col + 1}) must be BLANK`,
        cells: [{ row: lastGuess.cell.row, col: lastGuess.cell.col, value: BLANK }],
        gridSnapshot: copyGrid(lastGuess.grid)
      });

      grid = copyGrid(lastGuess.grid);
      grid[lastGuess.cell.row][lastGuess.cell.col] = BLANK;

      const retryResult = propagate(grid, rowClues, colClues, recordStep);
      grid = retryResult.grid;

      if (hasContradiction(grid, rowClues, colClues)) {
        // Need to backtrack further
        while (backtrackStack.length > 0) {
          backtrackCount++;
          const previous = backtrackStack.pop()!;
          
          recordStep({
            type: 'backtrack',
            description: `Backtracking further: cell (${previous.cell.row + 1}, ${previous.cell.col + 1}) must be BLANK`,
            cells: [{ row: previous.cell.row, col: previous.cell.col, value: BLANK }],
            gridSnapshot: copyGrid(previous.grid)
          });

          grid = copyGrid(previous.grid);
          grid[previous.cell.row][previous.cell.col] = BLANK;

          const retryAgain = propagate(grid, rowClues, colClues, recordStep);
          grid = retryAgain.grid;

          if (!hasContradiction(grid, rowClues, colClues)) {
            break;
          }
        }
      }
    } else {
      grid = result.grid;
    }
  }

  if (backtrackCount >= maxBacktracks) {
    return { 
      solution: grid, 
      solved: false, 
      steps, 
      error: `Maximum backtracks (${maxBacktracks}) exceeded` 
    };
  }

  if (!isGridSolved(grid)) {
    return { 
      solution: grid, 
      solved: false, 
      steps, 
      error: 'Could not find complete solution' 
    };
  }

  return { solution: grid, solved: true, steps };
}

/**
 * Validate that a solution satisfies all clues
 */
export function validateSolution(
  grid: Grid,
  rowClues: Clues,
  colClues: Clues
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  // Validate rows
  for (let r = 0; r < rows; r++) {
    const computedClues = computeLineClues(grid[r]);
    if (!cluesMatch(computedClues, rowClues[r])) {
      return false;
    }
  }

  // Validate columns
  for (let c = 0; c < cols; c++) {
    const colLine = grid.map(row => row[c]);
    const computedClues = computeLineClues(colLine);
    if (!cluesMatch(computedClues, colClues[c])) {
      return false;
    }
  }

  return true;
}

/**
 * Compute clues from a solved line
 */
export function computeLineClues(line: CellState[]): number[] {
  const clues: number[] = [];
  let currentRun = 0;

  for (const cell of line) {
    if (cell === FILLED) {
      currentRun++;
    } else if (currentRun > 0) {
      clues.push(currentRun);
      currentRun = 0;
    }
  }

  if (currentRun > 0) {
    clues.push(currentRun);
  }

  return clues.length === 0 ? [0] : clues;
}

/**
 * Check if two clue arrays match
 */
function cluesMatch(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

/* ════════════════════════════════════════════════════════════════════════════
 * HARDENING — WordSolverX port additions (everything below this line).
 *
 * The original solver above is reproduced verbatim from
 * sujitbhai7710/nonogram-solver, with four marked call sites inside
 * generateLineArrangements (memo lookup/store + budget counting). This section
 * adds the safety rails: a 20×20 grid cap, a per-line arrangement budget with
 * a graceful "too complex" error instead of a frozen tab, a bounded memo
 * cache, and a hardened entry point that clears per-solve state.
 * ════════════════════════════════════════════════════════════════════════════ */

/** Largest grid dimension the solver will accept (20×20 = 400 cells). */
export const MAX_GRID_DIMENSION = 20;

/** Default per-line arrangement budget before the solver gives up gracefully. */
export const DEFAULT_LINE_ARRANGEMENT_BUDGET = 250_000;

/** Default cap on recorded step snapshots returned to the UI. */
export const DEFAULT_MAX_STEPS = 2000;

/** Default backtracking cap, matching the original solveNonogram default. */
export const DEFAULT_MAX_BACKTRACKS = 10_000;

/** Thrown when a single line's enumeration exceeds the per-line budget. */
export class LineBudgetExceededError extends Error {
  public readonly budget: number;
  constructor(budget: number) {
    super(`Line arrangement budget of ${budget} exceeded`);
    this.name = 'LineBudgetExceededError';
    this.budget = budget;
  }
}

// ── Per-line arrangement budget bookkeeping ─────────────────────────────────
let lineArrangementBudget: number = Number.POSITIVE_INFINITY;
let lineArrangementCount = 0;

/** Reset the counter at the start of each top-level line enumeration. */
function resetLineArrangementCount(): void {
  lineArrangementCount = 0;
}

/** Count one generated arrangement; throws past the budget. Called at the base case. */
function trackGeneratedArrangement(): void {
  lineArrangementCount += 1;
  if (lineArrangementCount > lineArrangementBudget) {
    throw new LineBudgetExceededError(lineArrangementBudget);
  }
}

/** Set by the hardened entry point around each solve; restored afterwards. */
function setLineArrangementBudget(budget: number): void {
  lineArrangementBudget = budget;
}

// ── Bounded memo cache for full-line arrangement generation ────────────────
// generateLineArrangements(clues, length) output depends only on (clues, length),
// so results are safely shared across rows, columns, and propagation passes.
const ARRANGEMENT_CACHE_LIMIT = 256;
const arrangementCache = new Map<string, CellState[][]>();

function lineArrangementCacheKey(clues: number[], length: number): string {
  return `${clues.join(',')}|${length}`;
}

function getCachedArrangements(key: string): CellState[][] | null {
  return arrangementCache.get(key) ?? null;
}

function storeCachedArrangements(key: string, arrangements: CellState[][]): void {
  if (arrangementCache.size >= ARRANGEMENT_CACHE_LIMIT) {
    arrangementCache.clear();
  }
  arrangementCache.set(key, arrangements);
}

/** Clear the memo cache — called at the start of every hardened solve. */
export function clearArrangementCache(): void {
  arrangementCache.clear();
}

// ── Puzzle validation ──────────────────────────────────────────────────────

/** Minimum cells a line needs to fit its clues (blocks + mandatory gaps). */
function minLineSpace(clues: number[]): number {
  const sum = clues.reduce((total, c) => total + c, 0);
  return clues.length === 0 || (clues.length === 1 && clues[0] === 0)
    ? sum
    : sum + clues.length - 1;
}

function cluesAreWellFormed(clues: Clues): boolean {
  return clues.every(
    (line) =>
      Array.isArray(line) &&
      line.every((n) => Number.isInteger(n) && n >= 0)
  );
}

/**
 * Validate a puzzle before solving. Returns an error message, or null when
 * the puzzle is acceptable. Covers the grid cap and clue sanity so the UI can
 * show a plain-language message instead of hanging or throwing.
 */
export function validatePuzzle(puzzle: NonogramPuzzle): string | null {
  const { rows, cols, rowClues, colClues } = puzzle;

  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) {
    return 'Grid dimensions must be positive whole numbers.';
  }
  if (rows > MAX_GRID_DIMENSION || cols > MAX_GRID_DIMENSION) {
    return `Grids are capped at ${MAX_GRID_DIMENSION} by ${MAX_GRID_DIMENSION} to keep solving fast.`;
  }
  if (!Array.isArray(rowClues) || !Array.isArray(colClues)) {
    return 'Puzzle clues are missing.';
  }
  if (rowClues.length !== rows || colClues.length !== cols) {
    return 'The number of clue lines does not match the grid size.';
  }
  if (!cluesAreWellFormed(rowClues) || !cluesAreWellFormed(colClues)) {
    return 'Clues must be whole numbers, zero or higher, separated by spaces.';
  }

  for (let r = 0; r < rows; r++) {
    if (minLineSpace(rowClues[r]) > cols) {
      return `Row ${r + 1}'s clues cannot fit in ${cols} columns. Check the numbers and try again.`;
    }
  }
  for (let c = 0; c < cols; c++) {
    if (minLineSpace(colClues[c]) > rows) {
      return `Column ${c + 1}'s clues cannot fit in ${rows} rows. Check the numbers and try again.`;
    }
  }

  return null;
}

// ── Hardened entry point ─────────────────────────────────────────────────────

export interface HardenedSolveOptions {
  /** Per-line arrangement budget. Defaults to DEFAULT_LINE_ARRANGEMENT_BUDGET. */
  arrangementBudget?: number;
  /** Backtracking cap. Defaults to DEFAULT_MAX_BACKTRACKS. */
  maxBacktracks?: number;
  /** Max step snapshots kept in the result. Defaults to DEFAULT_MAX_STEPS. */
  maxSteps?: number;
}

export interface HardenedSolveResult extends SolveResult {
  /** True when steps were cut at maxSteps (the solution itself is unaffected). */
  stepsTruncated?: boolean;
  /** Wall-clock solve time in milliseconds. */
  solveTimeMs?: number;
}

/**
 * Solve with the WordSolverX safety rails: dimension cap, per-line arrangement
 * budget, bounded memo cache, and capped step recording. Never throws for
 * oversized or pathological input — it returns a SolveResult with an error
 * message instead.
 */
export function solveNonogramHardened(
  puzzle: NonogramPuzzle,
  options: HardenedSolveOptions = {}
): HardenedSolveResult {
  const dimensionError = validatePuzzle(puzzle);
  if (dimensionError) {
    return { solution: null, solved: false, steps: [], error: dimensionError };
  }

  const {
    arrangementBudget = DEFAULT_LINE_ARRANGEMENT_BUDGET,
    maxBacktracks = DEFAULT_MAX_BACKTRACKS,
    maxSteps = DEFAULT_MAX_STEPS
  } = options;

  clearArrangementCache();
  setLineArrangementBudget(arrangementBudget);

  const startedAt = Date.now();
  try {
    const result = solveNonogram(puzzle, undefined, maxBacktracks);
    const solveTimeMs = Date.now() - startedAt;

    // The verbatim engine can report solved=true for contradictory clues that
    // resolve purely through propagation (it never re-validates). Gate it here
    // so a wrong grid can never reach the UI as a success.
    if (result.solved && result.solution && !validateSolution(result.solution, puzzle.rowClues, puzzle.colClues)) {
      return {
        solution: null,
        solved: false,
        steps: [],
        solveTimeMs,
        error:
          'These clues contradict each other, so no valid picture exists. ' +
          'Check for a miscounted run or a missing gap between blocks.'
      };
    }

    let steps = result.steps;
    let stepsTruncated = false;
    if (steps.length > maxSteps) {
      steps = steps.slice(0, maxSteps);
      stepsTruncated = true;
    }

    return { ...result, steps, stepsTruncated, solveTimeMs };
  } catch (error) {
    if (error instanceof LineBudgetExceededError) {
      return {
        solution: null,
        solved: false,
        steps: [],
        solveTimeMs: Date.now() - startedAt,
        error:
          'This puzzle is too complex: one of its lines has more possible arrangements ' +
          'than the solver will work through. Try a smaller grid or clues with more filled cells.'
      };
    }
    throw error;
  } finally {
    setLineArrangementBudget(Number.POSITIVE_INFINITY);
  }
}

