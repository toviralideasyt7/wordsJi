<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { onMount } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { generateBreadcrumbSchema, generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';

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

  const faqs = [
    { question: 'How does the Waffle Solver work?', answer: 'Enter the letters from your Waffle grid and mark each cell green or yellow based on what the game shows. Click Solve, and the WASM engine tests every valid letter arrangement against the dictionary to find all solutions that fit.' },
    { question: 'Can I solve past Waffles?', answer: "Yes. Use the date picker next to the 'Auto Fill Today' button to load and solve Waffle puzzles from any previous day." },
    { question: 'Is it free to use?', answer: 'The Waffle Solver is completely free. No sign-up, no limits.' },
    { question: 'What do the colors mean?', answer: 'Green means the letter is already in the correct position. Yellow means the letter belongs in that word (row or column) but is in the wrong spot. White or gray means the letter does not belong in that specific word.' },
    { question: 'Why does the solver sometimes find more than one solution?', answer: 'Occasionally the grid constraints allow multiple valid letter arrangements. Each result shown satisfies all the color hints and uses only real English words. You can try all of them in the game.' },
    { question: 'What does Auto Fill Today do?', answer: "Auto Fill Today fetches today's Waffle puzzle from the official Waffle API and fills the grid automatically, including starting colors. You skip manual entry entirely." },
    { question: 'How many swaps does a perfect Waffle score take?', answer: 'Every Waffle puzzle is solvable in exactly 10 swaps, which earns a 5-star score. Each extra swap costs half a star. Knowing the target arrangement from the solver lets you plan the most efficient route.' },
  ];

  const jsonLdSchema = JSON.stringify([
    generateWebPageSchema(
      'Waffle Solver - Solve Any Waffle Puzzle Instantly | WordSolverX',
      "Solve today's Waffle puzzle with our high-performance WASM-powered solver. Auto-fill or manually enter your grid and get instant solutions.",
      'https://wordsolverx.com/waffle-solver',
      { image: 'https://wordsolverx.com/images/waffle-solver.webp' }
    ),
    generateSoftwareApplicationSchema('Waffle Solver', 'GameApplication'),
    generateFAQSchema(faqs),
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
    { href: '/5-letter-wordle-solver', label: '5-Letter Wordle Solver' },
    { href: '/quordle-solver', label: 'Quordle Solver' },
    { href: '/phoodle-answer-today', label: 'Phoodle Answer Today' },
    { href: '/waffle-answer-today', label: 'Waffle Answer Today' },
  ];
</script>

<svelte:head>
  <title>Waffle Solver - Solve Any Waffle Puzzle Instantly | WordSolverX</title>
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

<main class="min-h-screen bg-slate-50">
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
  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">

    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How to Use the Waffle Solver</h2>
      <div class="space-y-6">
        {#each [
          { n: 1, title: 'Fill the board', text: 'Type the 21 letters from your Waffle grid. Or click "Auto Fill Today" to fetch the current puzzle automatically — no manual entry needed.' },
          { n: 2, title: 'Mark the colors', text: 'Click each cell to cycle through white, yellow, and green. Match exactly what the game shows you.' },
          { n: 3, title: 'Click Solve', text: 'The WASM engine runs in your browser and checks every valid letter arrangement against a real English dictionary.' },
          { n: 4, title: 'Plan your swaps', text: 'Each solution shows the target arrangement. Aim for 10 swaps or fewer to earn a 5-star score.' },
        ] as step}
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">{step.n}</div>
            <div>
              <h3 class="font-semibold text-slate-900 mb-1">{step.title}</h3>
              <p class="text-slate-600 leading-relaxed">{step.text}</p>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="border border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">What Is Waffle?</h2>
      <p class="text-slate-600 leading-relaxed mb-4">Waffle is a daily word game with a crossword-shaped grid. All 21 letters are already on the board — you swap them to form six valid 5-letter words: three across and three down. Each puzzle is solvable in exactly 10 swaps for a perfect score.</p>
      <p class="text-slate-600 leading-relaxed mb-4">Green cells are already in the right position. Yellow cells belong in that row or column but are in the wrong spot. White or grey cells don't belong in that specific word.</p>
      <p class="text-slate-600 leading-relaxed">The solver finds every letter arrangement that satisfies all color hints simultaneously. If the puzzle has multiple valid solutions, it shows all of them.</p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-amber-50 p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Waffle Scoring</h2>
      <p class="text-slate-600 leading-relaxed mb-6">Every puzzle is designed to be solvable in 10 swaps. Each extra swap above 10 costs half a star.</p>
      <div class="grid sm:grid-cols-2 gap-4">
        {#each [
          { stars: '5 Stars', swaps: '10 swaps', desc: 'Perfect score. Every swap was optimal.' },
          { stars: '4 Stars', swaps: '11–12 swaps', desc: 'Good, but one or two inefficient moves.' },
          { stars: '3 Stars', swaps: '13–14 swaps', desc: 'Average. Review where you made extra swaps.' },
          { stars: '2 Stars or less', swaps: '15+ swaps', desc: 'Use the solver to find the optimal path.' },
        ] as row}
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="font-semibold text-slate-900">{row.stars} — {row.swaps}</p>
            <p class="text-slate-600 text-sm mt-1">{row.desc}</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How to Play Waffle</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Waffle presents you with a 5x5 crossword-shaped grid. All 21 letter cells are already filled — no empty spaces, no guessing at random. Your job is to swap letters into the correct positions to form six valid 5-letter English words: three across and three down.
      </p>
      <div class="space-y-4 mb-4">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">1</span>
          <div>
            <h3 class="font-bold text-slate-900">Read the color clues on each letter</h3>
            <p class="text-slate-600 mt-1 text-sm">Green tiles are in the correct position and belong to the correct word. Yellow tiles belong to that word but are in the wrong position. White tiles don't belong to that specific word at all. Each tile gets its color from the intersection of its row word and column word.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">2</span>
          <div>
            <h3 class="font-bold text-slate-900">Swap letters between positions</h3>
            <p class="text-slate-600 mt-1 text-sm">Click a letter you want to move, then click where you want to place it. This counts as one swap. You can swap any two letters on the board regardless of whether they are in the same word or different words. The fewer swaps you use, the higher your score.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">3</span>
          <div>
            <h3 class="font-bold text-slate-900">Solve the puzzle for a 5-star score</h3>
            <p class="text-slate-600 mt-1 text-sm">Every Waffle puzzle is designed to be solvable in exactly 10 swaps. Hitting 10 swaps earns you 5 stars. Each additional swap above 10 costs half a star. The solver finds the target arrangement so you can plan the most efficient swap path.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">4</span>
          <div>
            <h3 class="font-bold text-slate-900">Colors update after every swap</h3>
            <p class="text-slate-600 mt-1 text-sm">After each swap, the game recolors every affected tile based on the new board state. A letter that was yellow might turn green if it is now in the correct position, or stay yellow if it is still misplaced. This feedback loop is what makes Waffle solvable — each swap gives you information for the next one.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How the Waffle Solver Works</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        The solver runs a Rust/WASM engine directly in your browser. When you fill in the grid and click Solve, it takes your 21-letter grid and the color constraints you set, then tests every possible letter arrangement against its built-in English dictionary. It checks whether each arrangement produces six valid 5-letter words that match all the color hints simultaneously.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        The constraint solving is the hard part. A yellow tile in row 1, position 3 means the letter currently there belongs somewhere in row 1 but not position 3. But that same cell is also in column 3, and the column's color constraint might be different. The solver resolves all these competing constraints at once — it is not checking rows and columns independently, it is solving the entire crossword simultaneously.
      </p>
      <p class="text-slate-600 leading-relaxed">
        When multiple solutions exist, it shows all of them. Each one is a valid final arrangement — you can pick any solution and plan your swaps toward it. The Auto Fill Today feature fetches the current day's puzzle from the official Waffle API, so you can skip manual entry entirely.
      </p>
    </section>

    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Getting Better at Waffle</h2>
      <div class="space-y-4">
        <div class="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h3 class="font-bold text-teal-900 mb-2">Start with green tiles — they are already correct</h3>
          <p class="text-teal-800 text-sm">Green tiles are locked. Don't waste swaps moving them. Focus on yellow tiles first, since they need to move somewhere within their word but not to their current position. White tiles are your lowest priority — they are wrong letters that need to be replaced entirely.</p>
        </div>
        <div class="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h3 class="font-bold text-teal-900 mb-2">Look for 2-for-1 swaps</h3>
          <p class="text-teal-800 text-sm">If two yellow tiles are in each other's correct positions, swapping them fixes both at once. The solver finds these automatically, but training yourself to spot them saves swaps. For example, if row 1 has A in position 3 (but A belongs in position 5) and E in position 5 (but E belongs in position 3), swapping A and E solves two problems with one move.</p>
        </div>
        <div class="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h3 class="font-bold text-teal-900 mb-2">Solve one word at a time when possible</h3>
          <p class="text-teal-800 text-sm">If one word has 4 green tiles and 1 yellow, focus on placing that yellow tile. Fixing one complete word creates a stable foundation — it reduces the remaining variables and makes the other words easier to solve. Trying to fix everything simultaneously leads to more total swaps.</p>
        </div>
        <div class="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h3 class="font-bold text-teal-900 mb-2">Count your swaps as you go</h3>
          <p class="text-teal-800 text-sm">10 swaps is the target. If you reach swap 8 and still have a messy board, you are in trouble. Use the solver to find the target arrangement before you start swapping in the actual game — knowing where you are going is half the battle.</p>
        </div>
      </div>
    </section>

    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Players Use a Waffle Solver</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Waffle is harder than it looks. The crossword grid creates interconnected constraints — moving one letter to fix one word can break another word that shared it. Players who try to solve intuitively often end up at 14-16 swaps because they fix one word only to undo progress on another.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        The solver eliminates this back-and-forth by finding the target arrangement upfront. You can see where every letter needs to end up, then plan the most efficient path. It is like having a GPS for a road trip — you still drive the car, but you know the route in advance.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The honest reason most people use it: they got stuck on a puzzle with a 5-star streak on the line and do not want to lose it. The solver gives you the answer without you having to guess.
      </p>
    </section>

    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Waffle vs Similar Word Games</h2>
      <div class="space-y-4">
        <div class="bg-slate-50 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Waffle vs Crossword</h3>
          <p class="text-slate-600 text-sm">Crosswords give you clues and blank spaces; Waffle gives you all the letters and asks you to arrange them. Crosswords test vocabulary and general knowledge; Waffle tests spatial reasoning and constraint satisfaction. Both involve overlapping words in a grid, but the solving process is completely different.</p>
        </div>
        <div class="bg-slate-50 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Waffle vs Wordle</h3>
          <p class="text-slate-600 text-sm">Wordle gives you a hidden word and colored feedback after guesses. Waffle gives you a visible grid with misplaced letters and asks you to rearrange them. Wordle is about elimination through guessing; Waffle is about optimization through rearrangement. Waffle has no random element — the same puzzle always has the same solution.</p>
        </div>
        <div class="bg-slate-50 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Waffle vs Nerdle</h3>
          <p class="text-slate-600 text-sm">Nerdle deals with mathematical equations. Waffle deals with English words in a crossword format. The only similarity is the color-based feedback system (green/yellow/gray). The underlying logic is completely different — Nerdle requires arithmetic validation, while Waffle requires dictionary validation of six intersecting words.</p>
        </div>
      </div>
    </section>

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" {faqs} title="Waffle Solver FAQ" />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        {#each solverLinks as link}
          <a href={link.href} class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">{link.label}</a>
        {/each}
      </div>
    </section>
  </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>

<style>
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>
