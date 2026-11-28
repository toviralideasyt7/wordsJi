<script lang="ts">
  import type { BetweenleSolverResult } from '$lib/betweenle/types';

  type BetweenleRuntime = {
    words: string[];
    computeBetweenleSuggestion: typeof import('$lib/betweenle/logic').computeBetweenleSuggestion;
  };

  const EMPTY_RESULT: BetweenleSolverResult = {
    suggestionWord: '',
    remaining: 0,
    boundTopIdx: 0,
    boundBottomIdx: 0,
    effectiveTopWord: '',
    effectiveBottomWord: '',
    suggestionIdx: 0,
    useDistance: false,
    isSolved: false,
    closerTo: '',
    topDist: -1,
    bottomDist: -1,
  };

  let betweenleRuntimePromise: Promise<BetweenleRuntime> | null = null;

  let topWord = $state('');
  let bottomWord = $state('');
  let topDistance = $state('');
  let bottomDistance = $state('');
  let showSuggestion = $state(false);
  let formError = $state('');
  let copiedWord = $state('');
  let copyFeedback = $state(false);
  let runtimeLoading = $state(false);
  let betweenleRuntime = $state<BetweenleRuntime | null>(null);

  let result = $derived.by(() =>
    betweenleRuntime
      ? betweenleRuntime.computeBetweenleSuggestion(topWord, bottomWord, topDistance, bottomDistance)
      : EMPTY_RESULT
  );
  let possibleWords = $derived.by(() =>
    betweenleRuntime ? betweenleRuntime.words.slice(result.boundTopIdx, result.boundBottomIdx + 1) : []
  );

  function loadBetweenleRuntime(): Promise<BetweenleRuntime> {
    if (!betweenleRuntimePromise) {
      betweenleRuntimePromise = Promise.all([
        import('$lib/betweenle/data'),
        import('$lib/betweenle/logic')
      ]).then(([dataModule, logicModule]) => ({
        words: dataModule.BETWEENLE_WORDS,
        computeBetweenleSuggestion: logicModule.computeBetweenleSuggestion
      }));
    }
    return betweenleRuntimePromise;
  }

  async function ensureBetweenleRuntime(): Promise<BetweenleRuntime | null> {
    if (betweenleRuntime) return betweenleRuntime;

    runtimeLoading = true;
    try {
      betweenleRuntime = await loadBetweenleRuntime();
      return betweenleRuntime;
    } finally {
      runtimeLoading = false;
    }
  }

  async function startSolving(): Promise<void> {
    await ensureBetweenleRuntime();
    scrollToId('betweenle-solver-panel');
  }

  // The Solve button used to render only when result.remaining > 1 and
  // no suggestion was showing — so on a fresh page there was no Solve
  // button at all (the page's own step 3 says "Click Solve"), and it
  // vanished again after every solve. Clarity showed dead clicks in 55%
  // of sessions. The button is now always present; clicking it with
  // incomplete bounds explains what is missing instead of silently
  // suggesting a word for empty inputs (it returned "LUMPS").
  async function solve(): Promise<void> {
    await ensureBetweenleRuntime();
    if (topWord.trim().length !== 5 || bottomWord.trim().length !== 5) {
      formError = 'Enter both bound words first — the 5-letter word above your guess and the 5-letter word below it.';
      showSuggestion = false;
      return;
    }
    if (!result.suggestionWord) {
      formError = 'No word sits between those two bounds — check the words and try again.';
      showSuggestion = false;
      return;
    }
    formError = '';
    showSuggestion = true;
  }

  function updateTopWord(value: string): void {
    topWord = value.toLowerCase().slice(0, 5);
    showSuggestion = false;
    formError = '';
    void ensureBetweenleRuntime();
  }

  function updateBottomWord(value: string): void {
    bottomWord = value.toLowerCase().slice(0, 5);
    showSuggestion = false;
    formError = '';
    void ensureBetweenleRuntime();
  }

  function updateTopDistance(value: string): void {
    topDistance = value;
    showSuggestion = false;
    void ensureBetweenleRuntime();
  }

  function updateBottomDistance(value: string): void {
    bottomDistance = value;
    showSuggestion = false;
    void ensureBetweenleRuntime();
  }

  function handleTopWordInput(event: Event): void {
    updateTopWord((event.currentTarget as HTMLInputElement).value);
  }

  function handleBottomWordInput(event: Event): void {
    updateBottomWord((event.currentTarget as HTMLInputElement).value);
  }

  function handleTopDistanceInput(event: Event): void {
    updateTopDistance((event.currentTarget as HTMLInputElement).value);
  }

  function handleBottomDistanceInput(event: Event): void {
    updateBottomDistance((event.currentTarget as HTMLInputElement).value);
  }

  function resetSolver(): void {
    topWord = '';
    bottomWord = '';
    topDistance = '';
    bottomDistance = '';
    showSuggestion = false;
    copiedWord = '';
    copyFeedback = false;
  }

  async function copyToClipboard(word: string): Promise<void> {
    const text = word.toUpperCase();

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    copiedWord = word;
    copyFeedback = true;
    window.setTimeout(() => {
      if (copiedWord === word) copyFeedback = false;
    }, 2000);
  }

  function scrollToId(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setWordValue(value: string): void {
    void copyToClipboard(value);
  }
</script>

<section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
  <section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 px-6 py-12 text-white sm:px-8 sm:py-16">
    <div class="absolute inset-0 opacity-20">
      <div class="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-400 blur-3xl"></div>
      <div class="absolute bottom-0 right-8 h-48 w-48 rounded-full bg-fuchsia-500 blur-3xl"></div>
    </div>
    <div class="relative mx-auto max-w-4xl text-center">
      <span class="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
        Betweenle Solver
      </span>
      <h2 class="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Find the hidden word faster</h2>
      <p class="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
        Use the same Betweenle logic with top and bottom bounds, distance percentages, and binary-search style narrowing. Enter your clues and get the best next word instantly.
      </p>
      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          class="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-transform hover:scale-[1.02]"
          onclick={() => void startSolving()}
          type="button"
        >
          {runtimeLoading ? 'Loading...' : 'Start Solving'}
        </button>
        <button
          class="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          onclick={() => scrollToId('betweenle-how-it-works')}
          type="button"
        >
          How It Works
        </button>
        <a
          class="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          href="/betweenle-answer-today"
        >
          Today&apos;s Answer
        </a>
      </div>
    </div>
  </section>

  <section id="betweenle-solver-panel" class="px-6 py-12 sm:px-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-8 text-center">
        <h3 class="text-3xl font-black text-slate-900 dark:text-white">Solver</h3>
        <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Enter the same clues you see in Betweenle and get the best next word to try.
        </p>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div class="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/60">
          <h4 class="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Enter Your Bounds</h4>
        </div>

        <div class="space-y-5 px-6 py-6">
          <div class="space-y-2">
            <label for="betweenle-top-word" class="text-sm font-semibold text-slate-900 dark:text-white">Top Bound</label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <input
                id="betweenle-top-word"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono uppercase outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:flex-1"
                maxlength="5"
                placeholder="Top word from game"
                value={topWord}
                oninput={handleTopWordInput}
                onfocus={() => void ensureBetweenleRuntime()}
              />
              <input
                id="betweenle-top-distance"
                aria-label="Top bound percentage"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-24 sm:flex-none"
                placeholder="Top %"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={topDistance}
                oninput={handleTopDistanceInput}
                onfocus={() => void ensureBetweenleRuntime()}
              />
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Word and distance shown above your guess in the game</p>
          </div>

          <div class="space-y-2">
            <label for="betweenle-bottom-word" class="text-sm font-semibold text-slate-900 dark:text-white">Bottom Bound</label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <input
                id="betweenle-bottom-word"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono uppercase outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:flex-1"
                maxlength="5"
                placeholder="Bottom word from game"
                value={bottomWord}
                oninput={handleBottomWordInput}
                onfocus={() => void ensureBetweenleRuntime()}
              />
              <input
                id="betweenle-bottom-distance"
                aria-label="Bottom bound percentage"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-24 sm:flex-none"
                placeholder="Bottom %"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={bottomDistance}
                oninput={handleBottomDistanceInput}
                onfocus={() => void ensureBetweenleRuntime()}
              />
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Word and distance shown below your guess in the game</p>
          </div>

          {#if result.remaining <= 20 && result.remaining > 1}
            <div class="rounded-2xl bg-slate-50 px-4 py-3 text-center dark:bg-slate-800/60">
              <span class="inline-flex rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                {result.remaining} possible words
              </span>
            </div>
          {/if}

          {#if result.isSolved && result.suggestionWord}
            <div class="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-5 text-center dark:border-teal-900/40 dark:bg-teal-950/30">
              <p class="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Solved</p>
              <p class="mt-3 text-4xl font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{result.suggestionWord}</p>
            </div>
          {/if}

          {#if showSuggestion && !result.isSolved && result.suggestionWord}
            <div class="rounded-3xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Try this word next</p>
                {#if result.useDistance}
                  <span class="rounded-full border border-indigo-300 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-700 dark:border-indigo-700 dark:text-indigo-300">
                    Smart Pick
                  </span>
                {/if}
              </div>
              <button
                class="flex w-full flex-col items-center justify-center gap-1 rounded-2xl bg-indigo-600 px-4 py-3 text-white transition-transform hover:scale-[1.01]"
                onclick={() => copyToClipboard(result.suggestionWord)}
                type="button"
              >
                <span class="text-xl font-black uppercase tracking-[0.2em]">
                  {#if copyFeedback && copiedWord === result.suggestionWord}
                    Copied!
                  {:else}
                    {result.suggestionWord}
                  {/if}
                </span>
                <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-200">Click to copy</span>
              </button>
            </div>
          {/if}

          {#if result.remaining > 1 && result.remaining <= 20}
            <div class="space-y-3">
              <p class="text-sm font-semibold text-slate-900 dark:text-white">Possible words ({result.remaining})</p>
              <div class="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {#each possibleWords as word}
                  <button
                    class={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                      word === result.suggestionWord
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
                    }`}
                    onclick={() => setWordValue(word)}
                    type="button"
                  >
                    {word}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div class="flex flex-wrap gap-3 pt-2">
            {#if !result.isSolved}
              <button
                class="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01]"
                onclick={() => void solve()}
                type="button"
              >
                {runtimeLoading ? 'Loading...' : 'Solve'}
              </button>
            {/if}
            <button
              class={`rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200 ${
                showSuggestion || result.isSolved ? 'flex-1' : ''
              }`}
              onclick={resetSolver}
              type="button"
            >
              Reset
            </button>
          </div>
          {#if formError}
            <p role="alert" class="pt-3 text-center text-sm font-semibold text-rose-600 dark:text-rose-400">{formError}</p>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <section id="betweenle-how-it-works" class="border-t border-slate-200 px-6 py-12 dark:border-slate-700 sm:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="text-center">
        <h3 class="text-3xl font-black text-slate-900 dark:text-white">How it works</h3>
        <p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Betweenle tells you whether the answer sits alphabetically above or below your guesses. Add those bounds and percentages here, and the solver calculates the strongest next move.
        </p>
      </div>

      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/60">
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white">1</div>
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Enter your bounds</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Use the top and bottom words shown in your current Betweenle game. Leave either field blank if you only have one confirmed bound.
          </p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/60">
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white">2</div>
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Add the percentages</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Distance percentages help the solver estimate where the answer sits inside the remaining alphabetical range.
          </p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/60">
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white">3</div>
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Copy the next guess</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Hit solve, copy the suggested word, and repeat with your new bounds until the answer is locked in.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="border-t border-slate-200 bg-slate-50 px-6 py-12 dark:border-slate-700 dark:bg-slate-800/40 sm:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="text-center">
        <h3 class="text-3xl font-black text-slate-900 dark:text-white">Pro tips</h3>
        <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          These habits make Betweenle much easier, even if you only use the solver when you get stuck.
        </p>
      </div>

      <div class="mt-8 grid gap-5 md:grid-cols-2">
        <div class="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Use the percentages</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Smaller percentages mean the answer is much closer to that bound. Adding both percentages gives the strongest next guess.
          </p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Think alphabetically</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Betweenle follows dictionary order. Narrowing the word range is more important than chasing random familiar words.
          </p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Trust the closer bound</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            If one bound has a much smaller percentage, the answer sits near that word. The solver weights that automatically.
          </p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Use the small-range browser</h4>
          <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Once the range gets tight, the possible-word list becomes the fastest way to close out the puzzle.
          </p>
        </div>
      </div>
    </div>
  </section>
</section>
