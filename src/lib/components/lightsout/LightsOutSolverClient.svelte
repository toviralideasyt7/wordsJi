<script lang="ts">
  import { browser } from '$app/environment';

  import {
    REVEAL_DELAYS,
    buildStepBoards,
    generateRandomPuzzle,
    solveLightsOutOptimal,
    toggleCellBitboard
  } from '$lib/lights-out/solver';

  let gridSize = 5;
  let bitboard = 0;
  let editMode = false;
  let solution: number[] | null | undefined = undefined;
  let pingingCells = new Set<number>();
  let animationToken = 0;
  let solutionSection: HTMLElement | null = null;

  $: stepBoards = buildStepBoards(bitboard, solution ?? null, gridSize);
  $: boardIndices = Array.from({ length: gridSize * gridSize }, (_, index) => index);

  $: {
    animationToken += 1;
    const token = animationToken;

    if (!browser || !solution || solution.length === 0) {
      pingingCells = new Set();
    } else {
      pingingCells = new Set([solution[0]]);
      const interval = 600 / solution.length;
      const pingingSequence = [solution[0]];
      let stepIndex = 1;
      let donePause = true;

      const animate = () => {
        if (token !== animationToken) {
          return;
        }

        if (stepIndex === solution!.length) {
          if (pingingSequence.length === 0) {
            pingingCells = new Set();
            return;
          }

          if (donePause) {
            donePause = false;
            window.setTimeout(animate, interval * 10);
            return;
          }

          pingingSequence.shift();
          pingingCells = new Set(pingingSequence);
          window.setTimeout(animate, interval);
          return;
        }

        pingingSequence.push(solution![stepIndex]);
        stepIndex += 1;
        pingingCells = new Set(pingingSequence);
        window.setTimeout(animate, interval);
      };

      window.setTimeout(animate, interval);
    }
  }

  function handleGridSizeChange(event: Event) {
    gridSize = Number((event.currentTarget as HTMLSelectElement).value);
    bitboard = 0;
    solution = undefined;
    pingingCells = new Set();
  }

  function handleCellClick(row: number, col: number) {
    if (editMode) {
      bitboard ^= 1 << (row * gridSize + col);
    } else {
      bitboard = toggleCellBitboard(bitboard, gridSize, row, col);
    }
    solution = undefined;
  }

  function handleRandom() {
    bitboard = generateRandomPuzzle(gridSize);
    solution = undefined;
  }

  function handleSolve() {
    solution = solveLightsOutOptimal(bitboard, gridSize);

    if (browser) {
      window.setTimeout(() => {
        solutionSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }

  function boardTagPosition(tagRow?: number, tagCol?: number) {
    if (tagRow === undefined || tagCol === undefined) {
      return Number.NaN;
    }
    return tagRow * gridSize + tagCol;
  }

  function boardStyle(size: number) {
    return `grid-template-columns: repeat(${size}, minmax(0, 2.9rem)); grid-auto-rows: 2.9rem;`;
  }
</script>

<section class="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(180deg,#f8fffc_0%,#f6fbff_50%,#eef7ff_100%)] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
  <div class="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-5xl rounded-full bg-teal-200/30 blur-3xl"></div>

  <div class="relative mx-auto max-w-6xl">
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="space-y-6">
        <div class="rounded-[2rem] border border-teal-100 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,118,110,0.12)] backdrop-blur sm:p-8">
          <div class="max-w-2xl">
            <p class="inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Classic grid puzzle
            </p>
            <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Light Out Solver</h2>
            <p class="mt-4 text-base leading-8 text-slate-600">
              Build any 2x2 to 5x5 Light Out puzzle, switch between linked play and manual edit mode, then solve it with the same optimal Gaussian-elimination logic from the original project.
            </p>
          </div>
        </div>

        <div class="grid gap-6">
          <div class="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(59,130,246,0.12)] backdrop-blur">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 class="text-xl font-bold text-slate-900">Interactive board</h3>
                <p class="mt-1 text-sm text-slate-500">
                  {#if editMode}
                    Tap any bulb to turn just that light on or off.
                  {:else}
                    Tap any bulb to toggle it and its neighbors together.
                  {/if}
                </p>
              </div>
              <div class="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                {gridSize} x {gridSize}
              </div>
            </div>

            <div class="flex flex-col items-center gap-4">
              <div class="flex flex-wrap items-end justify-center gap-3">
                <label class="grid gap-2 text-sm font-semibold text-slate-700">
                  Board size
                  <select
                    class="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-400"
                    bind:value={gridSize}
                    onchange={handleGridSizeChange}
                    aria-label="Board size"
                  >
                    <option value={2}>2 x 2</option>
                    <option value={3}>3 x 3</option>
                    <option value={4}>4 x 4</option>
                    <option value={5}>5 x 5</option>
                  </select>
                </label>

                <button
                  class="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  onclick={handleRandom}
                  type="button"
                >
                  Random puzzle
                </button>
              </div>

              <div class="lights-board grid gap-1.5 rounded-[1.75rem] border border-slate-200 bg-slate-900/95 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.3)]" style={boardStyle(gridSize)}>
                {#each boardIndices as index}
                  {@const isLit = (bitboard & (1 << index)) !== 0}
                  {@const isPinging = pingingCells.has(index)}
                  <button
                    class={`lights-cell ${isLit ? 'is-lit' : 'is-unlit'} ${isPinging ? 'is-pinging' : ''}`}
                    onclick={() => handleCellClick(Math.floor(index / gridSize), index % gridSize)}
                    type="button"
                    aria-label={`Cell ${index + 1}`}
                  ></button>
                {/each}
              </div>

              <div class="flex flex-wrap justify-center gap-3">
                <button
                  class={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${!editMode ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25' : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700'}`}
                  onclick={() => (editMode = false)}
                  type="button"
                >
                  Linked toggle
                </button>
                <button
                  class={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${editMode ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 'border border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:text-amber-700'}`}
                  onclick={() => (editMode = true)}
                  type="button"
                >
                  Edit puzzle
                </button>
                <button
                  class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:translate-y-[-1px]"
                  onclick={handleSolve}
                  type="button"
                >
                  Solve board
                </button>
              </div>

              <p class="text-sm text-slate-500">
                {solution === undefined
                  ? 'Build a puzzle or randomize one, then solve it.'
                  : solution === null
                    ? 'This board has no solution.'
                    : solution.length === 0
                      ? 'Puzzle is already solved.'
                      : `Optimal solution found in ${solution.length} move${solution.length === 1 ? '' : 's'}.`}
              </p>
            </div>
          </div>
          <section bind:this={solutionSection} class="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_70px_rgba(99,102,241,0.1)] backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-xl font-bold text-slate-900">Solution steps</h3>
                <p class="mt-1 text-sm text-slate-500">
                  {#if solution === undefined}
                    Solve a board to see the guided move path.
                  {:else if solution === null}
                    No valid solve path exists for this board.
                  {:else if solution.length === 0}
                    No moves needed.
                  {:else}
                    {solution.length} guided move{solution.length === 1 ? '' : 's'}
                  {/if}
                </p>
              </div>
              {#if solution && solution.length > 0}
                <div class="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                  Optimal
                </div>
              {/if}
            </div>

            {#if solution === null}
              <div class="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
                This board cannot be solved from the current state.
              </div>
            {:else if solution !== undefined && solution.length === 0}
              <div class="mt-6 rounded-3xl border border-teal-200 bg-teal-50 p-5 text-sm font-semibold text-teal-800">
                Everything is already off. You are done.
              </div>
            {:else if solution && solution.length > 0}
              <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                {#each stepBoards as stepBoard, index}
                  {@const isDone = index === solution.length}
                  {@const move = isDone ? null : solution[index]}
                  {@const tagRow = move !== null ? Math.floor(move / gridSize) : undefined}
                  {@const tagCol = move !== null ? move % gridSize : undefined}
                  <article
                    class="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
                    style={`animation-delay:${REVEAL_DELAYS[Math.min(index, REVEAL_DELAYS.length - 1)]}s;`}
                  >
                    <div class="mb-3 flex items-center justify-between">
                      <p class="text-sm font-bold text-slate-700">{isDone ? 'Done' : `Step ${index + 1}`}</p>
                      <p class="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {isDone ? 'Solved' : `Tap ${Math.floor(move! / gridSize) + 1}:${(move! % gridSize) + 1}`}
                      </p>
                    </div>

                    <div class="lights-board grid w-fit gap-1 rounded-[1.25rem] border border-slate-200 bg-slate-900/95 p-3" style={boardStyle(gridSize)}>
                      {#each Array.from({ length: gridSize * gridSize }, (_, cellIndex) => cellIndex) as cellIndex}
                        {@const isLit = (stepBoard & (1 << cellIndex)) !== 0}
                        {@const isTagged = cellIndex === boardTagPosition(tagRow, tagCol)}
                        <div class={`lights-cell ${isLit ? 'is-lit' : 'is-unlit'}`}>
                          {#if isTagged}
                            <span class="step-tag">{index + 1}</span>
                          {/if}
                          {#if isDone && cellIndex === Math.floor((gridSize * gridSize) / 2)}
                            <span class="done-tag">Done</span>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </article>
                {/each}
              </div>
            {/if}
          </section>

          <aside class="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_70px_rgba(14,165,233,0.08)]">
            <h3 class="text-xl font-bold text-slate-900">How to use it</h3>
            <div class="mt-5 space-y-4">
              <div class="rounded-2xl bg-teal-50 p-4">
                <p class="text-sm font-semibold text-teal-800">1. Pick your board</p>
                <p class="mt-2 text-sm leading-7 text-teal-900/80">Choose a size from 2x2 up to 5x5, or click Random puzzle to generate a fresh board instantly.</p>
              </div>
              <div class="rounded-2xl bg-sky-50 p-4">
                <p class="text-sm font-semibold text-sky-800">2. Choose the editing mode</p>
                <p class="mt-2 text-sm leading-7 text-sky-900/80">Use Linked toggle to play the real puzzle behavior, or Edit puzzle if you want to recreate a board from a screenshot.</p>
              </div>
              <div class="rounded-2xl bg-violet-50 p-4">
                <p class="text-sm font-semibold text-violet-800">3. Solve and review steps</p>
                <p class="mt-2 text-sm leading-7 text-violet-900/80">The solver highlights the full move sequence and shows each step as a mini board so you can follow the exact optimal path.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .lights-cell {
    position: relative;
    display: block;
    height: 2.9rem;
    width: 2.9rem;
    border-radius: 1rem;
    transition:
      transform 0.18s ease,
      box-shadow 0.25s ease,
      background 0.25s ease;
  }

  .lights-cell:hover {
    transform: translateY(-1px);
  }

  .is-lit {
    background:
      radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0) 30%),
      radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.18) 55%, rgba(6, 95, 70, 0.9));
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.35),
      inset 0 -4px 8px rgba(6, 78, 59, 0.45),
      0 0 32px rgba(16, 185, 129, 0.35);
  }

  .is-unlit {
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 25%),
      radial-gradient(circle at 70% 70%, rgba(71, 85, 105, 0.9), rgba(15, 23, 42, 0.96));
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.08),
      inset 0 -4px 8px rgba(2, 6, 23, 0.55);
  }

  .is-pinging {
    background:
      radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0) 24%),
      radial-gradient(circle at 68% 68%, rgba(245, 158, 11, 0.95), rgba(236, 72, 153, 0.75), rgba(99, 102, 241, 0.95));
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.35),
      0 0 28px rgba(244, 114, 182, 0.45);
  }

  .step-tag,
  .done-tag {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 0.8rem;
    font-weight: 800;
    color: white;
    text-shadow: 0 2px 8px rgba(15, 23, 42, 0.55);
  }

  .done-tag {
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
