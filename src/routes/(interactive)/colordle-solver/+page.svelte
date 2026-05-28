<script lang="ts">
  import { onMount } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateWebPageSchema
  } from '$lib/seo';
  import type { ColorData } from '$lib/colordle';

  type ColordleRuntime = Pick<
    typeof import('$lib/colordle'),
    'getAllColors' | 'getUniqueTargetColors' | 'findBestCandidates'
  >;

  let colordleRuntimePromise: Promise<ColordleRuntime> | null = null;

  // State
  let allColors = $state<ColorData[]>([]);
  let candidates = $state<ColorData[]>([]);
  let history = $state<{ guess: ColorData; percent: number }[]>([]);

  let guessInput = $state('');
  let percentageInput = $state('');
  let loading = $state(true);
  let loadingError = $state<string | null>(null);
  let processing = $state(false);

  let selectedGuess = $state<ColorData | null>(null);
  let displayLimit = $state(12);
  let colordleRuntime = $state<ColordleRuntime | null>(null);
  let runtimeBootstrapped = $state(false);

  function loadColordleRuntime(): Promise<ColordleRuntime> {
    if (!colordleRuntimePromise) {
      colordleRuntimePromise = import('$lib/colordle').then((module) => ({
        getAllColors: module.getAllColors,
        getUniqueTargetColors: module.getUniqueTargetColors,
        findBestCandidates: module.findBestCandidates
      }));
    }

    return colordleRuntimePromise;
  }

  async function ensureColordleRuntime(): Promise<ColordleRuntime | null> {
    if (colordleRuntime) return colordleRuntime;

    loading = true;

    try {
      const runtime = await loadColordleRuntime();
      colordleRuntime = runtime;
      allColors = runtime.getAllColors();
      candidates = runtime.getUniqueTargetColors();
      return runtime;
    } catch {
      loadingError = 'Failed to load the Colordle solver data.';
      return null;
    } finally {
      loading = false;
    }
  }

  function bootstrapColordleRuntime() {
    if (runtimeBootstrapped) return;
    runtimeBootstrapped = true;
    void ensureColordleRuntime();
  }

  let suggestions = $derived.by(() => {
    if (guessInput.length < 2 || selectedGuess?.name === guessInput) return [];
    const lowerInput = guessInput.toLowerCase();
    const matches: ColorData[] = [];
    for (const c of allColors) {
      if (c.name.toLowerCase().includes(lowerInput)) {
        matches.push(c);
        if (matches.length >= 20) break;
      }
    }
    return matches;
  });

  function handleAddStep() {
    if (!colordleRuntime || !selectedGuess || !percentageInput) return;
    const percent = parseFloat(percentageInput);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      alert('Please enter a valid percentage (0-100)');
      return;
    }
    processing = true;
    const newHistoryItem = { guess: selectedGuess, percent };
    history = [...history, newHistoryItem];
    const allTargets = colordleRuntime.getUniqueTargetColors();
    candidates = colordleRuntime.findBestCandidates(allTargets, history);
    guessInput = '';
    percentageInput = '';
    selectedGuess = null;
    processing = false;
    displayLimit = 12;
  }

  function handleReset() {
    if (!colordleRuntime) return;
    history = [];
    candidates = colordleRuntime.getUniqueTargetColors();
    guessInput = '';
    percentageInput = '';
    selectedGuess = null;
    displayLimit = 12;
  }

  function handleSelectFromSuggestion(color: ColorData) {
    selectedGuess = color;
    guessInput = color.name;
  }

  function handleRemoveHistoryItem(idx: number) {
    if (!colordleRuntime) return;
    history = history.filter((_: any, i: number) => i !== idx);
    const allTargets = colordleRuntime.getUniqueTargetColors();
    if (history.length === 0) {
      candidates = allTargets;
    } else {
      candidates = colordleRuntime.findBestCandidates(allTargets, history);
    }
  }

  function handleGuessInput(value: string) {
    guessInput = value;
    if (selectedGuess && value !== selectedGuess.name) selectedGuess = null;
  }

  onMount(() => {
    const startOnInteraction = () => {
      bootstrapColordleRuntime();
    };
    const scheduleIdleLoad = () => {
      const run = () => {
        bootstrapColordleRuntime();
      };

      if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(run, { timeout: 2000 });
        return () => window.cancelIdleCallback(idleId);
      }

      const timeoutId = globalThis.setTimeout(run, 1200);
      return () => globalThis.clearTimeout(timeoutId);
    };

    document.addEventListener('pointerdown', startOnInteraction, {
      once: true,
      passive: true,
      capture: true
    });
    document.addEventListener('focusin', startOnInteraction, { once: true, capture: true });
    window.addEventListener('keydown', startOnInteraction, { once: true });
    const cancelIdleLoad =
      document.readyState === 'complete'
        ? scheduleIdleLoad()
        : (() => {
            let cancel = () => {};
            const handleLoad = () => {
              cancel = scheduleIdleLoad();
            };
            window.addEventListener('load', handleLoad, { once: true });
            return () => {
              window.removeEventListener('load', handleLoad);
              cancel();
            };
          })();

    return () => {
      document.removeEventListener('pointerdown', startOnInteraction, true);
      document.removeEventListener('focusin', startOnInteraction, true);
      window.removeEventListener('keydown', startOnInteraction);
      cancelIdleLoad();
    };
  });

  const faqs = [
    { question: 'What is the Colordle Solver?', answer: 'You type in your guess (like "Sea Green") and the percentage Colordle gave you. The solver filters the color list to show only colors that would produce that same percentage. It saves you from manually cross-referencing hundreds of colors.' },
    { question: 'How accurate is the percentage calculation?', answer: 'It uses Delta E CIE2000 in LAB color space — the same formula Colordle itself uses. A score of 85% from the solver means the same as 85% in the game.' },
    { question: 'Is this solver cheating?', answer: "It's a utility, not cheating. Think of it like a crossword dictionary. If you want to learn how hex codes and color distance work, you'll pick that up naturally by using it." },
    { question: 'Where do you get the list of color names?', answer: 'The list comes from a large open-source color database with thousands of named colors. It includes obscure names like Gamboge, Celadon, and Amaranth that Colordle actually uses.' },
    { question: 'Can I use this solver on mobile?', answer: 'Yes. It works on phones, tablets, and desktop. The color grid is touch-friendly and the input fields are sized for mobile.' },
{ question: 'How many guesses does it usually take?', answer: 'With the solver, most people get it in 2-3 guesses. Without help, it varies wildly — some colors are just harder to pin down if you don\'t know the specific name.' },
{ question: 'Why do some color names have multiple words?', answer: 'Colordle uses a large color database that includes compound names like "Sea Green", "Pale Turquoise", and "Deep Sky Blue." These are standard CSS color names. When searching, partial matches work — typing "sea" finds "Sea Green."' },
{ question: 'Can I solve multiple Colordle puzzles with this tool?', answer: 'Yes. The solver does not store any data between sessions. Each puzzle is independent. Refresh the page to start fresh with a new puzzle.' },
{ question: 'What happens if I enter the wrong percentage?', answer: 'Entering an incorrect percentage filters out colors that should stay in the candidate list. If your filtered results suddenly look wrong, double-check the percentage from the game. The most common mistake is mixing up tens and ones digits.' },
];

const jsonLdSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    generateWebPageSchema(
      'Colordle Solver - Color Puzzle Helper',
      'Filter Colordle candidates by entering your guess and percentage score. Find the daily color answer faster.',
      'https://wordsolverx.com/colordle-solver',
      {
        image: 'https://wordsolverx.com/images/colordle-solver.webp'
      }
    ),
    {
      '@type': 'WebApplication',
      name: 'Colordle Solver',
      description: 'Filter Colordle candidates by named color and similarity percentage.',
      applicationCategory: 'Game',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    },
    generateFAQSchema(faqs),
    generateHowToSchema('How to use the Colordle Solver', [
      { name: 'Make your first guess in Colordle', text: 'Start with a broad color like Red, Blue, or Yellow. These span the color wheel and give you the most information about the target hue.' },
      { name: 'Note the similarity percentage', text: 'Colordle tells you how close your guess is as a percentage. Higher means closer. Write down the color name and percentage.' },
      { name: 'Enter your guess in the solver', text: 'Search for the color name in the solver input, select it from the dropdown, then type the similarity percentage in the second field.' },
      { name: 'Click Filter Results', text: 'The solver narrows the candidate list to colors that would produce a similar similarity score to your guess.' },
      { name: 'Pick the top candidate as your next guess', text: 'Choose a color from the filtered results, guess it in Colordle, then add the new percentage to the solver to filter again.' },
    ]),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Colordle Solver', url: 'https://wordsolverx.com/colordle-solver' }
    ]),
  ],
});

  const steps = [
    { label: 'Step 1', text: 'Search and select a color name from the game' },
    { label: 'Step 2', text: 'Enter the similarity % score you received' },
    { label: 'Step 3', text: 'Find the answer from filtered results' },
  ];

  const stepIcons = ['🔍', '⚡', '✓'];

  const howToSteps = [
    { num: '1', text: 'Type a color name in the search box — "Sky Blue", "Coral", whatever you guessed in Colordle' },
    { num: '2', text: 'Enter the percentage score Colordle gave you (the one below your guess, like "34%")' },
    { num: '3', text: 'Hit Filter Results — the solver shows colors that would return that same percentage' },
    { num: '4', text: 'Pick one from the filtered list as your next guess, then repeat until you hit 100%' },
  ];

  const moreLinks = [
    { href: '/colordle-answer-today', label: "Today's Answer" },
    { href: '/colordle-archive', label: 'Full Archive' },
  ];
</script>

<svelte:head>
  <title>Colordle Solver - Color Puzzle Helper</title>
  <meta name="description" content="Enter your Colordle guess and percentage. The solver filters thousands of named colors to find candidates matching your score." />
  <meta name="keywords" content="Colordle Solver, Colordle Answer, Color Puzzle, Colordle Help, Colordle Cheat" />
  <link rel="canonical" href="https://wordsolverx.com/colordle-solver" />
  <meta property="og:title" content="Colordle Solver - Daily Color Puzzle Helper" />
  <meta property="og:description" content="Use our Colordle solver to filter named colors by similarity percentage and find the exact daily answer faster." />
  <meta property="og:url" content="https://wordsolverx.com/colordle-solver" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://wordsolverx.com/images/colordle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Colordle Solver" />
  <meta name="twitter:description" content="Filter Colordle guesses by percentage similarity and find the exact color match with WordSolverX." />
  <meta name="twitter:image" content="https://wordsolverx.com/images/colordle-solver.webp" />
  {@html `<script type="application/ld+json">${jsonLdSchema}</script>`}
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs />
  </div>

  <!-- Hero Banner -->
  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-8 shadow-2xl text-center space-y-4">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Daily Color Puzzle</p>
      <h1 class="text-4xl font-black text-white sm:text-5xl">Colordle Solver</h1>
      <p class="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">Enter color guesses and their similarity percentages. The solver filters named colors by Delta E distance to find the exact daily answer.</p>
    </div>
  </section>

  <!-- Main Solver Area -->
  <div
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
    style="min-height: 800px;"
  >
    {#if loading}
      <div class="flex justify-center items-center" style="min-height: 800px;">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    {:else if loadingError}
      <div class="max-w-2xl mx-auto rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center text-red-700 shadow-sm">
        {loadingError}
      </div>
    {:else}
      <div class="grid lg:grid-cols-12 gap-6">
        <!-- Left Panel: Input + History -->
        <div class="lg:col-span-5 space-y-5">
          <!-- Input Card -->
          <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white">
                🔍
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900">Enter Guess Data</h2>
                <p class="text-xs text-slate-500">Search a color, then enter the % score</p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Color Name Input -->
              <div class="relative">
                <label for="colorNameInput" class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Color Name</label>
                <div class="relative">
                  <input
                    id="colorNameInput"
                    type="text"
                    value={guessInput}
                    oninput={(e) => handleGuessInput((e.target as HTMLInputElement).value)}
                    placeholder="e.g. Flax, Sky Blue, Coral"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                  />
                  {#if selectedGuess}
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <div
                        class="w-7 h-7 rounded-lg border-2 border-white shadow-sm"
                        style="background-color: {selectedGuess.hex}"
                      ></div>
                      <span class="text-teal-500">✓</span>
                    </div>
                  {/if}
                </div>

                <!-- Suggestions Dropdown -->
                {#if suggestions.length > 0}
                  <div class="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {#each suggestions as s}
                      <button
                        onclick={() => handleSelectFromSuggestion(s)}
                        class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
                      >
                        <div
                          class="w-7 h-7 rounded-lg border border-slate-200 shrink-0 shadow-sm"
                          style="background-color: {s.hex}"
                        ></div>
                        <div class="flex-1 min-w-0">
                          <span class="text-sm font-medium text-slate-800 truncate block">{s.name}</span>
                          <span class="text-xs text-slate-400 font-mono">{s.hex}</span>
                        </div>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              <!-- Percentage Input -->
              <div>
                <label for="similarityInput" class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Similarity %</label>
                <input
                  id="similarityInput"
                  type="number"
                  step="0.01"
                  value={percentageInput}
                  oninput={(e) => (percentageInput = (e.target as HTMLInputElement).value)}
                  placeholder="e.g. 50.18"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400 font-mono transition-all"
                  onkeydown={(e) => { if ((e as KeyboardEvent).key === 'Enter') handleAddStep(); }}
                />
              </div>

              <!-- Submit Button -->
              <button
                onclick={handleAddStep}
                disabled={!selectedGuess || !percentageInput || processing}
                class="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {#if processing}
                  <span class="flex items-center gap-2"><span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Calculating...</span>
                {:else}
                  Filter Results →
                {/if}
              </button>
            </div>
          </div>

          <!-- Guess History -->
          {#if history.length > 0}
            <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  📚 Guess History
                </h3>
                <button onclick={handleReset} class="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  ↻ Reset All
                </button>
              </div>
              <div class="space-y-2">
                {#each history as item, idx}
                  <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between group">
                    <div class="flex items-center gap-3">
                      <div class="relative">
                        <div
                          class="w-9 h-9 rounded-lg border-2 border-white shadow-sm"
                          style="background-color: {item.guess.hex}"
                        ></div>
                        <span class="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                      </div>
                      <div>
                        <div class="font-semibold text-sm text-slate-900">{item.guess.name}</div>
                        <div class="text-xs text-slate-400 font-mono">{item.guess.hex}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">{item.percent}%</span>
                      <button onclick={() => handleRemoveHistoryItem(idx)} class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1" title="Remove">
                        ✕
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Right Panel: Candidates -->
        <div class="lg:col-span-7">
          <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 h-full flex flex-col">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white">
                  ✓
                </div>
                <div>
                  <h2 class="text-lg font-bold text-slate-900">Possible Solutions</h2>
                  <p class="text-xs text-slate-500">Click any color to use it as your next guess</p>
                </div>
              </div>
              <span class="px-3 py-1.5 rounded-full text-sm font-bold font-mono {candidates.length <= 10
                ? 'bg-teal-100 text-teal-700'
                : 'bg-slate-100 text-slate-600'}">
                {candidates.length}
              </span>
            </div>

            <div class="flex-1 overflow-y-auto max-h-[700px] pr-1">
              {#if candidates.length === 0}
                <div class="h-48 flex flex-col items-center justify-center text-center">
                  <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">🎨</div>
                  <p class="text-slate-500 font-medium">No matching colors found</p>
                  <p class="text-sm text-slate-400 mt-1">Double-check your percentages or reset to start over</p>
                  <button onclick={handleReset} class="mt-4 text-sm font-semibold text-teal-600 hover:text-pink-700 flex items-center gap-1">
                    ↻ Reset Solver
                  </button>
                </div>
              {:else}
                <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {#each candidates.slice(0, displayLimit) as c}
                    <button
                      onclick={() => handleSelectFromSuggestion(c)}
                      class="group bg-white border border-slate-200 hover:border-teal-300 rounded-xl p-3 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 text-left"
                    >
                      <div
                        class="w-full aspect-square rounded-lg mb-2.5 shadow-inner border border-black/5 group-hover:shadow-md transition-shadow"
                        style="background-color: {c.hex}"
                      ></div>
                       <div class="text-sm font-semibold truncate text-center text-slate-800 group-hover:text-teal-600 transition-colors">
                        {c.name}
                      </div>
                      <div class="text-xs text-center text-slate-400 font-mono mt-0.5">
                        {c.hex}
                      </div>
                    </button>
                  {/each}
                </div>

                {#if displayLimit < candidates.length}
                  <div class="mt-6 flex justify-center">
                    <button
                      onclick={() => (displayLimit += 20)}
                      class="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm transition-all group"
                    >
                      ▼ Show More ({candidates.length - displayLimit} remaining)
                    </button>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Content Sections -->
  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <!-- What Is & How To Play -->
<section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
  <div class="flex items-center gap-3 mb-5">
    <div class="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
      ℹ️
    </div>
    <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Colordle?</h2>
  </div>
  <div class="space-y-3 text-slate-600 leading-relaxed">
    <p>
      Colordle is a daily game where you guess a secret color. You type in a color name, and Colordle tells you how close you are with a percentage — 100% means you got it.
    </p>
    <p>
      The tricky part: if you guess <span class="font-mono text-sm bg-slate-100 px-1 rounded">#3498db</span> and get 34% back, that number alone doesn't tell you much. Is the target brighter? More saturated? A different hue entirely? Without a way to cross-reference, you're guessing in the dark. The solver helps you filter the color list based on that percentage.
    </p>
  </div>
</section>

    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
          📚
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-5">How to Play</h2>
      </div>
      <ul class="space-y-3 text-slate-600 leading-relaxed">
        {#each howToSteps as step}
          <li class="flex gap-3 items-start">
            <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">{step.num}</span>
            <span>{step.text}</span>
          </li>
        {/each}
      </ul>
    </section>

    <!-- Why Use Section -->
<section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
  <h2 class="text-3xl font-bold text-slate-900 mb-5">
    Why Use a Colordle Helper?
  </h2>
  <div class="text-slate-600 leading-relaxed space-y-3">
    <p>
      Colordle has thousands of named colors. When you get 42% back on "Mauve" and 38% on "Dusty Rose," you can't manually cross-reference which one is closer. The solver does that work — it filters the list to show only colors that would return those percentage scores.
    </p>
    <p>
      It's especially useful once you're under 50% and need to narrow down candidates quickly. You can also use it to learn how hex codes and color distance actually work.
    </p>
  </div>
</section>

    <!-- FAQ Section -->
    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" title="Colordle Solver FAQ" {faqs} />
    </div>

    <!-- More Solvers -->
    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        {#each moreLinks as link}
          <a href={link.href} class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">{link.label}</a>
        {/each}
      </div>
    </section>

    <!-- SEO Content Section -->
    <section class="space-y-10">
<div class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
  <h2 class="text-3xl font-bold text-slate-900 mb-5">How Color Distance Calculation Works</h2>
  <div class="prose prose-lg max-w-none text-slate-600">
    <p class="mb-6 leading-relaxed">
      Colordle uses Delta E CIE2000 to convert your percentage into a color distance value. A Delta E of 1.0 is roughly the smallest difference the human eye can detect. A Delta E of 10+ is a clearly different color. The percentage you see is derived from this distance.
    </p>
    <p class="mb-6 leading-relaxed">
      The math happens in LAB color space, not RGB. RGB hex values aren't perceptually uniform — jumping from <span class="font-mono text-sm bg-slate-100 px-1 rounded">#FF0000</span> to <span class="font-mono text-sm bg-slate-100 px-1 rounded">#FF1100</span> (a change of 1) is invisible, but the same jump in a different color range might be obvious. LAB was designed to fix this. A Delta E of 5 means the same visual gap regardless of where in the color wheel you are.
    </p>
    <p class="leading-relaxed">
      When you enter your percentage, the solver inverts the formula to find colors with a matching Delta E. It's not magic — it's just math doing the tedious cross-referencing for you.
    </p>
  </div>
</div>

<div class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
  <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Getting Better at Colordle</h2>
  <div class="space-y-6 text-lg text-slate-600">
    <ul class="space-y-4 ml-4">
      <li class="leading-relaxed">
        <strong class="text-slate-900">Start with primaries in separate guesses.</strong> If you get 20% on Red and 45% on Blue, the target is hue-adjacent to blue but not pure red. This costs you guesses but tells you the hue family fast. After 2-3 primaries, you know roughly where on the wheel you are.
      </li>
      <li class="leading-relaxed">
        <strong class="text-slate-900">Percentage context matters.</strong> A 40% match on a muted color means something different than 40% on a saturated one. The solver handles this, but when you're guessing manually, keep in mind that low-saturation colors cluster together — a 40% on "Ash Grey" and 42% on "Silver" could both point to the same target.
      </li>
      <li class="leading-relaxed">
        <strong class="text-slate-900">Use color families to narrow.</strong> If your target looks like a sunset color, focus on the oranges, corals, and yellow-greens. The solver filters by Delta E, but you can skip whole branches of the color list if you know the vibe you're looking for.
      </li>
      <li class="leading-relaxed">
        <strong class="text-slate-900">Percentage thresholds are useful shortcuts.</strong> Above 60% means the target is in the same saturation and lightness range. Below 30% means look for something visually opposite. If you're stuck between 40-50%, try a guess with opposite saturation.
      </li>
      <li class="leading-relaxed">
        <strong class="text-slate-900">Learn the weird color names.</strong> Colordle pulls from a large color list. Names that often trip people up: "Celadon" (a pale green), "Amaranth" (a pinkish red), "Gamboge" (a mustard yellow), "Vermilion" (a bright orange-red), "Saffron" (deep yellow). If you don't know them, you can't guess them.
      </li>
    </ul>
  </div>
</div>

<div class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
  <h2 class="text-3xl font-bold text-slate-900 mb-5">Understanding Hex Color Codes</h2>
  <div class="prose prose-lg max-w-none text-slate-600">
    <p class="mb-6 leading-relaxed">
      Every color in Colordle has a hex code like <span class="font-mono text-sm bg-slate-100 px-1 rounded">#FF6B6B</span>. Once you learn to read the pairs, you can make educated guesses.
    </p>
    <div class="grid md:grid-cols-3 gap-6 not-prose mb-6">
      <div class="bg-white p-6 rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-2">First 2: Red</h3>
        <p class="text-slate-600 text-sm">00 means no red, FF means red is maxed out. If your guess <span class="font-mono text-xs">#FF6B6B</span> returns 40% and the red pair is FF, you know red is already at full strength in the target.</p>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-2">Middle 2: Green</h3>
        <p class="text-slate-600 text-sm">Same idea — 00 is no green, FF is full green. A low green value often makes a color feel pinkish or purple-adjacent.</p>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-2">Last 2: Blue</h3>
        <p class="text-slate-600 text-sm">Blue at 00 feels warm (orange tones). Blue at FF feels cool (purple or cyan tones). If you're getting low scores, check which pair is dragging you down.</p>
      </div>
    </div>
    <p class="leading-relaxed">
      Example: <span class="font-mono text-sm bg-slate-100 px-1 rounded">#FF6B6B</span> has max red (FF), medium green (6B = 107 in decimal), medium-low blue (6B). If you get 40% on this, and the solver says red is maxed — you'll want your next guess to also have FF in the first pair.
    </p>
  </div>
</div>

<div class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
  <h2 class="text-3xl font-bold text-slate-900 mb-5">Common Colordle Color Categories</h2>
  <div class="prose prose-lg max-w-none text-slate-600">
    <p class="mb-6 leading-relaxed">
      Colordle draws from a large color list. Answers tend to cluster around these groups:
    </p>
    <div class="grid md:grid-cols-2 gap-6 not-prose">
      <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-2">🎨 Desaturated Common Names</h3>
        <p class="text-slate-600 text-sm">Colors like "Mauve", "Slate", "Taupe", "Sage". These are muted, low-saturation colors that are hard to pin down without the percentage. Often appear in the 40-60% range on first guesses.</p>
      </div>
      <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-2">🌸 Pastel Variants</h3>
        <p class="text-slate-600 text-sm">"Powder Blue", "Pale Rose", "Lavender Blush". These have high lightness and medium-low saturation. If you get a decent match on a saturated color and the target feels "light", try a pastel version.</p>
      </div>
      <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-2">🍇 Saturated Jewel Tones</h3>
        <p class="text-slate-600 text-sm">"Cerulean", "Cobalt", "Vermilion", "Emerald". These are highly saturated and produce sharp percentage jumps. If you miss by 10% on cobalt, you're not close at all.</p>
      </div>
      <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-900 mb-2">🟤 Earth Tones</h3>
        <p class="text-slate-600 text-sm">"Umber", "Sienna", "Ochre", "Burnt Sienna". Brown-adjacent colors with low saturation and warm undertones. Often the hardest to distinguish from each other — a 5% difference might separate two earth tones.</p>
      </div>
    </div>
  </div>
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
