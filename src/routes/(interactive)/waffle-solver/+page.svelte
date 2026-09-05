<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { onMount } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { generateBreadcrumbSchema, generateHowToSchema, generateSoftwareApplicationSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';

  interface CellConstraint {
    index: number;
    letter: string;
    status: 'green' | 'yellow' | 'none' | 'grey';
  }

  let wasmReady = $state(false);
  let solveFunc = $state<any>(null);
  let board = $state<string[]>(Array(21).fill(''));
  let statuses = $state<('green' | 'yellow' | 'none')[]>(Array(21).fill('none'));
  let solutions = $state<string[][]>([]);
  let loading = $state(false);
  let solving = $state(false);
  let selectedDate = $state('');
  let solutionsRef: HTMLDivElement | undefined = $state();
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');
  let toastVisible = $state(false);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    toastMessage = message;
    toastType = type;
    toastVisible = true;
    setTimeout(() => (toastVisible = false), 3000);
  }

  onMount(async () => {
    selectedDate = new Date().toISOString().split('T')[0];
    try {
      const wasm = await import('$lib/waffle-wasm/waffle_wasm');
      await wasm.default();
      solveFunc = wasm.solve_waffle_wasm;
      wasmReady = true;
    } catch (err) {
      console.error('WASM Init Error:', err);
      showToast('Failed to load Waffle engine.', 'error');
    }
  });

  function getGlobalIdx(r: number, c: number): number {
    if (r === 0) return c;
    if (r === 1) return 5 + c / 2;
    if (r === 2) return 8 + c;
    if (r === 3) return 13 + c / 2;
    if (r === 4) return 16 + c;
    return 0;
  }

  function handleCellChange(pIdx: number, val: string) {
    board[pIdx] = val.toUpperCase().slice(-1);
    solutions = [];
  }

  function toggleStatus(pIdx: number) {
    if (solutions.length > 0) return;
    const current = statuses[pIdx];
    if (current === 'none') statuses[pIdx] = 'yellow';
    else if (current === 'yellow') statuses[pIdx] = 'green';
    else statuses[pIdx] = 'none';
    solutions = [];
  }

  function clearGrid() {
    board = Array(21).fill('');
    statuses = Array(21).fill('none');
    solutions = [];
    showToast('Grid cleared');
  }

  function calculateStartingColors(puzzle: string, solution: string): ('green' | 'yellow' | 'none')[] {
    const res: ('green' | 'yellow' | 'none')[] = Array(21).fill('none');
    const across = [[0, 1, 2, 3, 4], [8, 9, 10, 11, 12], [16, 17, 18, 19, 20]];
    const down = [[0, 5, 8, 13, 16], [2, 6, 10, 14, 18], [4, 7, 12, 15, 20]];

    [...across, ...down].forEach((indices) => {
      const target = indices.map((i) => solution[i]);
      const current = indices.map((i) => puzzle[i]);
      const wordColors: string[] = Array(5).fill('none');
      const available = [...target];

      current.forEach((char, i) => {
        if (char === target[i]) {
          wordColors[i] = 'green';
          available[i] = '';
        }
      });

      current.forEach((char, i) => {
        if (wordColors[i] === 'none') {
          const idx = available.indexOf(char);
          if (idx !== -1) {
            wordColors[i] = 'yellow';
            available[idx] = '';
          }
        }
      });

      indices.forEach((idx, i) => {
        if (wordColors[i] === 'green') res[idx] = 'green';
        else if (wordColors[i] === 'yellow' && res[idx] !== 'green') res[idx] = 'yellow';
      });
    });
    return res;
  }

  async function fetchAndFill(url: string) {
    loading = true;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const puzzle = data.puzzle as string;
      const solution = data.solution as string;
      const colors = calculateStartingColors(puzzle, solution);
      board = puzzle.split('');
      statuses = colors;
      solutions = [];
      showToast('Puzzle loaded successfully');
    } catch (err) {
      showToast('Failed to load puzzle.', 'error');
    } finally {
      loading = false;
    }
  }

  async function solve() {
    if (!wasmReady || !solveFunc) return;
    const anyEmpty = board.some((c) => !c);
    if (anyEmpty) {
      showToast('Please fill all letters first!', 'error');
      return;
    }

    solving = true;
    await new Promise((r) => setTimeout(r, 100));

    try {
      const puzzleStr = board.join('').toLowerCase();
      const constraints: CellConstraint[] = statuses.map((s, i) => ({
        index: i,
        letter: board[i],
        status: s,
      }));

      const result = solveFunc(puzzleStr, JSON.stringify(constraints));

      if (result === 'NOT_FOUND') {
        showToast('No solution found.', 'error');
      } else {
        const found = JSON.parse(result);
        solutions = found;
        showToast(`Found ${found.length} valid arrangement(s)`);
        setTimeout(() => {
          solutionsRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during solving.', 'error');
    } finally {
      solving = false;
    }
  }

  function getCellStatusClass(status: string, isInteractive: boolean): string {
    if (!isInteractive) return 'bg-teal-500 text-white border-teal-600 shadow-sm';
    if (status === 'green') return 'bg-teal-500 text-white border-teal-600 shadow-lg shadow-teal-500/30';
    if (status === 'yellow') return 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30';
    return 'bg-white text-slate-900 border-2 border-slate-200 shadow-sm hover:border-amber-400';
  }


  const jsonLdSchema = JSON.stringify([
    generateWebPageSchema(
      'Waffle Solver - Solve Any Waffle Puzzle Instantly',
      "Solve today's Waffle puzzle with our high-performance WASM-powered solver. Auto-fill or manually enter your grid and get instant solutions.",
      'https://wordsolverx.com/waffle-solver',
      { image: 'https://wordsolverx.com/images/waffle-solver.webp' }
    ),
    generateSoftwareApplicationSchema('Waffle Solver', 'GameApplication'),
    generateHowToSchema('How to use the Waffle Solver', [
      { name: 'Fill the board', text: "Type the letters from your current Waffle grid into the input cells, or click 'Auto Fill Today' to load them automatically." },
      { name: 'Set the colors', text: 'Click each cell to cycle through white, yellow, and green to match what the Waffle game shows you.' },
      { name: 'Click Solve', text: 'The WASM engine evaluates every valid arrangement and returns all dictionary-valid solutions.' },
      { name: 'Use the result', text: 'Pick a solution and plan your swaps to reach it in as few moves as possible — ideally 10 for a perfect score.' },
    ]),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Waffle Solver', url: 'https://wordsolverx.com/waffle-solver' },
    ]),
  ]);

  const solverLinks = [
    { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
    { href: '/quordle-solver', label: 'Quordle Solver' },
    { href: '/phoodle-answer-today', label: 'Phoodle Answer Today' },
    { href: '/waffle-answer-today', label: 'Waffle Answer Today' },
  ];
</script>

<svelte:head>
  <title>Waffle Solver - Solve Any Waffle Puzzle Instantly</title>
  <meta name="description" content="Solve today's Waffle puzzle with our high-performance WASM-powered solver. Auto-fill or manually enter your grid and get instant solutions." />
  <meta name="keywords" content="Waffle Solver, Waffle Answer, Waffle Puzzle, Waffle Game Helper, Waffle Cheat" />
  <link rel="canonical" href="https://wordsolverx.com/waffle-solver" />
  <meta property="og:title" content="Waffle Solver - Instant Puzzle Solutions" />
  <meta property="og:description" content="Solve any Waffle puzzle instantly with our Rust-powered engine." />
  <meta property="og:url" content="https://wordsolverx.com/waffle-solver" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://wordsolverx.com/images/waffle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Waffle Solver" />
  <meta name="twitter:description" content="Solve today's Waffle puzzle instantly." />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(jsonLdSchema, ['FAQPage', 'HowTo']) ?? jsonLdSchema}</script>`}
</svelte:head>

<!-- Toast Notification -->
{#if toastVisible}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-bold text-sm transition-all {toastType === 'error' ? 'bg-red-600 text-white' : 'bg-teal-600 text-white'}">
    {toastMessage}
  </div>
{/if}

<section class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <Breadcrumbs hideSchema={true} />
  </div>

  <!-- Hero Banner -->
  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-8 shadow-2xl text-center space-y-4">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Daily Word Puzzle</p>
      <h1 class="text-4xl font-black text-white sm:text-5xl">Waffle Solver</h1>
      <p class="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">Enter your Waffle grid, mark the colors, and get every valid solution in milliseconds. Auto-fill today's puzzle with one click.</p>
    </div>
  </section>

  <!-- Interactive Component -->
  <div class="mx-auto max-w-4xl px-4 pb-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-3xl shadow-2xl p-6 sm:p-14 border border-slate-100 relative overflow-hidden">

      <!-- Input Grid Area -->
      <div class="flex flex-col items-center gap-6 relative z-10 w-full px-2">
        <div class="flex flex-col items-center gap-3">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Input Pattern</span>
          <div class="inline-block p-4 sm:p-6 rounded-[24px] shadow-sm border-2 sm:border-4 ring-1 bg-slate-50 border-white ring-slate-200">
            <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
              {#each Array(5) as _, r}
                {#each Array(5) as _, c}
                  {@const pIdx = getGlobalIdx(r, c)}
                  {@const isEmpty = (r === 1 || r === 3) && (c === 1 || c === 3)}
                  {#if isEmpty}
                    <div class="w-10 h-10 sm:w-12 sm:h-12"></div>
                  {:else}
                    <div class="relative group">
                      <input
                        type="text"
                        value={board[pIdx] ? board[pIdx].toUpperCase() : ''}
                        maxlength={1}
                        oninput={(e) => handleCellChange(pIdx, (e.target as HTMLInputElement).value)}
                        onclick={() => toggleStatus(pIdx)}
                        class="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-3xl font-black rounded-lg sm:rounded-xl transition-all duration-300 focus:outline-none cursor-pointer focus:ring-2 sm:focus:ring-8 focus:ring-amber-500/20 active:scale-90 uppercase {getCellStatusClass(statuses[pIdx], true)}"
                      />
                    </div>
                  {/if}
                {/each}
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Top Controls -->
      <div class="flex flex-col items-center gap-6 relative z-10 pt-8 border-t border-slate-100 w-full max-w-2xl mx-auto">
        <p class="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
          Load Puzzle Data
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onclick={() => fetchAndFill('https://api.wafflegame.workers.dev/today')}
            disabled={loading}
            class="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {loading ? 'Fetching...' : 'Auto Fill Today'} {!loading ? '🚀' : ''}
          </button>

          <div class="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <input
              type="date"
              value={selectedDate}
              oninput={(e) => (selectedDate = (e.target as HTMLInputElement).value)}
              class="bg-transparent border-none rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-0 w-32"
            />
            <button
              onclick={() => fetchAndFill(`https://api.wafflegame.workers.dev/date/${selectedDate}`)}
              disabled={loading || !selectedDate}
              class="px-4 py-1.5 bg-white hover:bg-slate-50 rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95 border border-slate-100"
            >
              Load
            </button>
          </div>

          <button
            onclick={clearGrid}
            class="px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
          >
            🗑️ Reset
          </button>
        </div>
      </div>

      <!-- Solve Action -->
      <div class="w-full flex flex-col items-center gap-4 pt-8 relative z-10">
        <button
          onclick={solve}
          disabled={solving || !wasmReady}
          class="px-12 py-3 rounded-2xl text-xl font-black shadow-lg transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-white {solving ? 'bg-slate-500 animate-pulse' : 'bg-teal-600 hover:bg-teal-700 hover:scale-105 active:scale-95 shadow-teal-600/30'}"
        >
          {solving ? 'Solving...' : 'Solve'}
        </button>
        <p class="text-sm font-bold text-slate-400 uppercase tracking-tighter">
          {wasmReady ? 'Engine Standby • Client Side Execution' : 'Loading Neural Engine...'}
        </p>
      </div>

      <!-- Solutions Display Area -->
      {#if solutions.length > 0}
        <div bind:this={solutionsRef} class="mt-20 border-t-2 border-slate-100 pt-16">
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100 text-teal-800 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Success
            </div>
            <h3 class="text-4xl font-black text-slate-900 mb-2">
              {solutions.length} Valid Solution{solutions.length !== 1 ? 's' : ''} Found
            </h3>
            <p class="text-slate-500">All arrangements below satisfy the puzzle constraints.</p>
          </div>

          <div class="flex flex-wrap justify-center gap-12 sm:gap-16">
            {#each solutions as sol, idx}
              <div class="flex flex-col items-center gap-6">
                <div class="inline-block p-4 sm:p-6 rounded-[24px] shadow-sm border-2 sm:border-4 ring-1 bg-teal-50 border-teal-100 ring-teal-200">
                  <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {#each Array(5) as _, r}
                      {#each Array(5) as _, c}
                        {@const pIdx = getGlobalIdx(r, c)}
                        {@const isEmpty = (r === 1 || r === 3) && (c === 1 || c === 3)}
                        {#if isEmpty}
                          <div class="w-10 h-10 sm:w-12 sm:h-12"></div>
                        {:else}
                          <div class="relative">
                            <input
                              type="text"
                              value={sol[pIdx] ? sol[pIdx].toUpperCase() : ''}
                              readonly
                              class="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-3xl font-black rounded-lg sm:rounded-xl transition-all duration-300 cursor-default pointer-events-none uppercase bg-teal-500 text-white border-teal-600 shadow-sm"
                            />
                          </div>
                        {/if}
                      {/each}
                    {/each}
                  </div>
                </div>
                <span class="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-black uppercase tracking-widest">
                  Option #{idx + 1}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- SEO Content -->
  

    <div class="mt-12">
      <StaticArticle content={ARTICLE_CONTENT['waffle-solver']} />

      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </section>

<style>
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
