<script lang="ts">
  import { browser } from '$app/environment';
  import NonogramGrid from './NonogramGrid.svelte';
  import ClueInputs from './ClueInputs.svelte';
  import SolverControls from './SolverControls.svelte';
  import SolvingLog from './SolvingLog.svelte';
  import {
    createEmptyGrid,
    validatePuzzle,
    type Clues,
    type Grid,
    type NonogramPuzzle,
    type SolveStep
  } from '$lib/solvers/nonogram/solver';
  import { SAMPLE_PUZZLES, getRandomPuzzle } from '$lib/solvers/nonogram/puzzles';
  import type {
    NonogramWorkerRequest,
    NonogramWorkerResponse
  } from '$lib/solvers/nonogram/nonogram.worker';

  const SAMPLE_NAMES = [
    'Diamond',
    'Hollow square',
    'Plus sign',
    'L shape',
    'Stairs',
    'T shape',
    'Inverted T',
    'Solid rectangle',
    'Half diamond',
    'U shape',
    'H shape',
    'Arrow right',
    'Heart',
    'X shape',
    'Tree'
  ];

  const WORKER_STEP_CAP = 600;

  function cluesToTexts(clues: Clues): string[] {
    return clues.map((line) => line.join(' '));
  }

  const firstSample = SAMPLE_PUZZLES[0];

  let rows = $state(firstSample.rows);
  let cols = $state(firstSample.cols);
  let rowTexts = $state<string[]>(cluesToTexts(firstSample.rowClues));
  let colTexts = $state<string[]>(cluesToTexts(firstSample.colClues));

  let solving = $state(false);
  let error = $state<string | null>(null);
  let solution = $state<Grid | null>(null);
  let steps = $state<SolveStep[]>([]);
  let stepIndex = $state(-1);
  let autoplay = $state(false);
  let speedMs = $state(500);
  let solveTimeMs = $state<number | null>(null);
  let stepsTruncated = $state(false);

  let worker: Worker | null = null;

  /** Parse one clue field: space/comma separated non-negative integers. Blank means an empty line. */
  function parseLine(text: string): number[] | null {
    const trimmed = text.trim();
    if (trimmed === '') return [0];
    const parts = trimmed.split(/[\s,]+/).filter(Boolean);
    const numbers: number[] = [];
    for (const part of parts) {
      if (!/^\d+$/.test(part)) return null;
      numbers.push(Number(part));
    }
    return numbers;
  }

  const parsed = $derived.by(() => {
    const rowClues: Clues = [];
    const colClues: Clues = [];
    const rowErrors = rowTexts.map((t) => parseLine(t) === null);
    const colErrors = colTexts.map((t) => parseLine(t) === null);

    if (rowErrors.some(Boolean) || colErrors.some(Boolean)) {
      return { ok: false as const, rowErrors, colErrors, error: 'Some clue fields contain invalid numbers. Use whole numbers separated by spaces.' };
    }
    for (const t of rowTexts) rowClues.push(parseLine(t) as number[]);
    for (const t of colTexts) colClues.push(parseLine(t) as number[]);

    const puzzle: NonogramPuzzle = { rows, cols, rowClues, colClues };
    const validationError = validatePuzzle(puzzle);
    if (validationError) {
      return { ok: false as const, rowErrors, colErrors, error: validationError };
    }
    return { ok: true as const, rowErrors, colErrors, puzzle };
  });

  const canSolve = $derived(parsed.ok && !solving);

  const displayGrid = $derived<Grid>(
    steps.length > 0 && stepIndex >= 0
      ? steps[stepIndex].gridSnapshot
      : (solution ?? createEmptyGrid(rows, cols))
  );

  const displayRowClues = $derived(parsed.ok ? parsed.puzzle.rowClues : rowTexts.map((t) => parseLine(t) ?? [0]));
  const displayColClues = $derived(parsed.ok ? parsed.puzzle.colClues : colTexts.map((t) => parseLine(t) ?? [0]));

  const changedCells = $derived.by(() => {
    const set = new Set<string>();
    const step = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;
    if (step) {
      for (const cell of step.cells) set.add(`${cell.row},${cell.col}`);
    }
    return set;
  });

  function resetSolveState() {
    solution = null;
    steps = [];
    stepIndex = -1;
    autoplay = false;
    solveTimeMs = null;
    stepsTruncated = false;
    error = null;
  }

  function terminateWorker() {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  }

  function solve() {
    if (!browser || solving) return;
    if (!parsed.ok) {
      error = parsed.error;
      return;
    }
    resetSolveState();
    terminateWorker();
    solving = true;

    const next = new Worker(new URL('../solvers/nonogram/nonogram.worker.ts', import.meta.url), {
      type: 'module'
    });
    worker = next;

    next.onmessage = (event: MessageEvent<NonogramWorkerResponse>) => {
      const response = event.data;
      solution = response.solution;
      steps = response.steps;
      stepsTruncated = response.stepsTruncated ?? false;
      solveTimeMs = response.solveTimeMs;
      error = response.error ?? null;
      solving = false;
      terminateWorker();
      if (response.steps.length > 0) {
        stepIndex = 0;
        autoplay = true;
      }
    };

    next.onerror = () => {
      error = 'The solver could not start in this browser. Try reloading the page.';
      solving = false;
      terminateWorker();
    };

    const request: NonogramWorkerRequest = { puzzle: parsed.puzzle, maxSteps: WORKER_STEP_CAP };
    next.postMessage(request);
  }

  function loadSample(index: number) {
    const puzzle = SAMPLE_PUZZLES[index % SAMPLE_PUZZLES.length];
    rows = puzzle.rows;
    cols = puzzle.cols;
    rowTexts = cluesToTexts(puzzle.rowClues);
    colTexts = cluesToTexts(puzzle.colClues);
    resetSolveState();
    terminateWorker();
  }

  function loadRandomSample() {
    loadSample(SAMPLE_PUZZLES.indexOf(getRandomPuzzle()));
  }

  function clearAll() {
    rowTexts = Array(rows).fill('0');
    colTexts = Array(cols).fill('0');
    resetSolveState();
    terminateWorker();
  }

  function resizeTexts(texts: string[], newSize: number): string[] {
    const next = texts.slice(0, newSize);
    while (next.length < newSize) next.push('0');
    return next;
  }

  function handleRowsChange(n: number) {
    rows = n;
    rowTexts = resizeTexts(rowTexts, n);
    resetSolveState();
    terminateWorker();
  }

  function handleColsChange(n: number) {
    cols = n;
    colTexts = resizeTexts(colTexts, n);
    resetSolveState();
    terminateWorker();
  }

  // Autoplay the solving log like a replay.
  $effect(() => {
    if (!autoplay || steps.length === 0) return;
    const id = setInterval(() => {
      if (stepIndex >= steps.length - 1) {
        autoplay = false;
        return;
      }
      stepIndex += 1;
    }, speedMs);
    return () => clearInterval(id);
  });

  // Scrubbing pauses the replay.
  function handleStepIndex(i: number) {
    autoplay = false;
    stepIndex = i;
  }
</script>

<div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
  <div class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SolverControls
        {rows}
        {cols}
        {solving}
        {canSolve}
        samples={SAMPLE_NAMES}
        onRowsChange={handleRowsChange}
        onColsChange={handleColsChange}
        onSolve={solve}
        onClear={clearAll}
        onRandom={loadRandomSample}
        onLoadSample={loadSample}
      />
      {#if error}
        <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      {/if}
      {#if solveTimeMs !== null && !error}
        <p class="mt-3 text-sm text-slate-500">
          Solved in {(solveTimeMs / 1000).toFixed(2)}s{solution ? '' : ' (no complete solution found)'}.
        </p>
      {/if}
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 class="mb-4 text-base font-bold text-slate-900">Grid</h2>
        <NonogramGrid
          grid={displayGrid}
          rowClues={displayRowClues}
          colClues={displayColClues}
          {changedCells}
        />
      </div>

      <SolvingLog
        {steps}
        stepIndex={Math.max(0, stepIndex)}
        {autoplay}
        {speedMs}
        truncated={stepsTruncated}
        onStepIndex={handleStepIndex}
        onToggleAutoplay={() => (autoplay = !autoplay)}
        onSpeed={(ms) => (speedMs = ms)}
      />
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 class="mb-4 text-base font-bold text-slate-900">Enter your clues</h2>
      <ClueInputs
        {rows}
        {cols}
        {rowTexts}
        {colTexts}
        rowErrors={parsed.rowErrors}
        colErrors={parsed.colErrors}
        onRowInput={(i, text) => {
          rowTexts[i] = text;
          resetSolveState();
        }}
        onColInput={(i, text) => {
          colTexts[i] = text;
          resetSolveState();
        }}
      />
    </div>
  </div>
</div>
