<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { onMount } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { generateBreadcrumbSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
  import type { SearchleDailyPuzzle } from '$lib/searchle/daily';
  import {
    type SearchleFeedback,
    type SearchleGuess,
    type SearchleSuggestion
  } from '$lib/searchle/searchleSolver';

  type SearchleRuntime = Pick<
    typeof import('$lib/searchle/searchleSolver'),
    'getSearchlePromptSuggestions' | 'solveSearchle'
  >;

  let searchleRuntimePromise: Promise<SearchleRuntime> | null = null;

  interface GuessResult {
    word: string;
    isCorrect: boolean;
    feedback: SearchleFeedback[];
  }

  type LetterState = SearchleFeedback;

  let { data } = $props<{
    data: {
      dailyPuzzle: SearchleDailyPuzzle;
    };
  }>();

  let prompt = $state('');
  let suggestions = $state<SearchleSuggestion[]>([]);
  let isLoading = $state(false);
  let runtimeLoading = $state(false);
  let error = $state<string | null>(null);
  let guesses = $state<GuessResult[]>([]);
  let currentGuess = $state('');
  let letterStates = $state<LetterState[]>([]);
  let isSolved = $state(false);
  let possibleWords = $state(0);
  let useDaily = $state(false);
  let promptSuggestions = $state<string[]>([]);
  let showPromptSuggestions = $state(false);
  let activePromptSuggestionIndex = $state(-1);
  let promptInput: HTMLInputElement | null = $state(null);
  let searchleRuntime = $state<SearchleRuntime | null>(null);
  const dailyPuzzle = $derived(data.dailyPuzzle);


  const solverLinks = [
    { href: '/wordle-solver', label: 'Wordle Solver' },
    { href: '/nerdle-solver', label: 'Nerdle Solver' },
    { href: '/quordle-solver', label: 'Quordle Solver' },
    { href: '/searchle-answer-today', label: 'Searchle Answer Today' },
    { href: '/spotle-solver', label: 'Spotle Solver' },
    { href: '/contexto-solver', label: 'Contexto Solver' }
  ];

  function loadSearchleRuntime(): Promise<SearchleRuntime> {
    if (!searchleRuntimePromise) {
      searchleRuntimePromise = import('$lib/searchle/searchleSolver').then((module) => ({
        getSearchlePromptSuggestions: module.getSearchlePromptSuggestions,
        solveSearchle: module.solveSearchle
      }));
    }

    return searchleRuntimePromise;
  }

  async function ensureSearchleRuntime(): Promise<SearchleRuntime | null> {
    if (searchleRuntime) return searchleRuntime;

    runtimeLoading = true;

    try {
      const runtime = await loadSearchleRuntime();
      searchleRuntime = runtime;
      return runtime;
    } catch {
      error = 'Failed to load Searchle solver data';
      return null;
    } finally {
      runtimeLoading = false;
    }
  }

  onMount(() => {
    void ensureSearchleRuntime();
  });

  async function refreshPromptSuggestions(query: string) {
    if (!query.trim()) {
      promptSuggestions = [];
      showPromptSuggestions = false;
      activePromptSuggestionIndex = -1;
      return;
    }

    const runtime = await ensureSearchleRuntime();
    if (!runtime) return;
    if (prompt !== query) return;

    promptSuggestions = runtime.getSearchlePromptSuggestions(query);
    showPromptSuggestions = promptSuggestions.length > 0 && query.trim().length > 0;
    activePromptSuggestionIndex = promptSuggestions.length > 0 ? 0 : -1;
  }

  function applyPromptSuggestion(suggestion: string) {
    prompt = suggestion;
    showPromptSuggestions = false;
    activePromptSuggestionIndex = -1;
    promptInput?.focus();
    const cursorPosition = suggestion.length;
    promptInput?.setSelectionRange(cursorPosition, cursorPosition);
  }

  function handlePromptInput(event: Event) {
    prompt = (event.currentTarget as HTMLInputElement).value;
    void refreshPromptSuggestions(prompt);
  }

  async function handleSolve() {
    if (!prompt.trim() || isLoading) return;

    isLoading = true;
    error = null;
    suggestions = [];
    guesses = [];
    isSolved = false;
    possibleWords = 0;
    useDaily = false;
    showPromptSuggestions = false;
    activePromptSuggestionIndex = -1;

    try {
      const runtime = await ensureSearchleRuntime();
      if (!runtime) return;
      const result = runtime.solveSearchle(prompt.trim(), []);
      suggestions = result.suggestions;
      possibleWords = result.totalWords;
    } catch {
      error = 'Failed to get suggestions';
    } finally {
      isLoading = false;
    }
  }

  function playDaily() {
    if (!dailyPuzzle) return;
    prompt = dailyPuzzle.prompt;
    useDaily = true;
    guesses = [];
    isSolved = false;
    suggestions = [];
    void refreshPromptSuggestions(prompt);
  }

  function selectWord(word: string) {
    currentGuess = word;
    letterStates = word.split('').map(() => 'unknown');
  }

  function toggleLetterState(index: number) {
    const states: LetterState[] = ['unknown', 'absent', 'partial', 'correct'];
    const next = [...letterStates];
    const currentIndex = states.indexOf(next[index]);
    next[index] = states[(currentIndex + 1) % states.length];
    letterStates = next;
  }

  async function submitGuess() {
    if (!currentGuess || letterStates.length === 0) return;

    const isCorrect = letterStates.every((state) => state === 'correct');
    const newGuess: GuessResult = {
      word: currentGuess,
      isCorrect,
      feedback: [...letterStates]
    };

    guesses = [...guesses, newGuess];

    if (isCorrect) {
      isSolved = true;
      return;
    }

    currentGuess = '';
    letterStates = [];
    isLoading = true;

    try {
      const runtime = await ensureSearchleRuntime();
      if (!runtime) return;
      const previousGuesses: SearchleGuess[] = guesses.map((guess) => ({
        word: guess.word,
        feedback: guess.feedback
      }));
      const result = runtime.solveSearchle(prompt.trim(), previousGuesses);
      suggestions = result.suggestions;
      possibleWords = result.totalWords;
    } catch {
      error = 'Failed to get next suggestions';
    } finally {
      isLoading = false;
    }
  }

  function handleReset() {
    guesses = [];
    currentGuess = '';
    letterStates = [];
    isSolved = false;
    suggestions = [];
    possibleWords = 0;
    error = null;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (showPromptSuggestions && promptSuggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activePromptSuggestionIndex =
          activePromptSuggestionIndex < promptSuggestions.length - 1
            ? activePromptSuggestionIndex + 1
            : 0;
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        activePromptSuggestionIndex =
          activePromptSuggestionIndex > 0
            ? activePromptSuggestionIndex - 1
            : promptSuggestions.length - 1;
        return;
      }

      if (event.key === 'Escape') {
        showPromptSuggestions = false;
        activePromptSuggestionIndex = -1;
        return;
      }

      if (event.key === 'Enter' && !currentGuess) {
        const activeSuggestion = promptSuggestions[activePromptSuggestionIndex] ?? promptSuggestions[0];
        if (activeSuggestion) {
          event.preventDefault();
          applyPromptSuggestion(activeSuggestion);
          return;
        }
      }
    }

    if (event.key !== 'Enter') return;
    if (currentGuess && letterStates.length > 0) {
      void submitGuess();
    } else {
      void handleSolve();
    }
  }

  function getStateColor(state: LetterState) {
    switch (state) {
      case 'correct':
        return 'bg-teal-500 text-white border-teal-500';
      case 'partial':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'absent':
        return 'bg-slate-500 text-white border-slate-500';
      default:
        return 'bg-white text-slate-900 border-slate-300';
    }
  }

  const pageTitle = 'Searchle Solver - Autocomplete Guess Helper | WordSolverX';
  const pageDescription =
    'Solve Searchle fast with entropy-ranked guesses, daily prompts, and feedback tracking. Find the missing autocomplete word in seconds.';
  const pageUrl = 'https://wordsolverx.com/searchle-solver';
  const pageImage = 'https://wordsolverx.com/images/searchle-solver.webp';

</script>

<svelte:head>
  <title>Searchle Solver - Autocomplete Guess Helper | WordSolverX</title>
  <meta
    name="description"
    content="Solve Searchle fast with entropy-ranked guesses, daily prompts, and feedback tracking. Find the missing autocomplete word in seconds."
  />
  <meta
    name="keywords"
    content="searchle solver, searchle autocomplete, searchle helper, searchle puzzle, daily searchle"
  />
  <meta property="og:title" content="Searchle Solver - Autocomplete Guess Helper" />
  <meta
    property="og:description"
    content="Enter the Searchle prompt and get the best autocomplete guesses ranked by entropy."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/searchle-solver" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content="https://wordsolverx.com/images/searchle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href="https://wordsolverx.com/searchle-solver" />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      generateWebPageSchema(pageTitle, pageDescription, pageUrl, {
        image: pageImage
      }),
      {
        '@type': 'WebApplication',
        name: 'Searchle Solver',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'HowTo',
        name: 'How to use the Searchle solver',
        step: [
          { '@type': 'HowToStep', name: 'Enter the search prompt', text: 'Type the partial Google search query from your Searchle game, using ... for the missing word.', position: 1 },
          { '@type': 'HowToStep', name: 'Pick a suggested word', text: 'Click one of the entropy-ranked guesses, then set the letter feedback colors to match what Searchle showed you.', position: 2 },
          { '@type': 'HowToStep', name: 'Submit and repeat', text: 'Click Submit Guess, then repeat with the updated suggestions until the answer is found.', position: 3 }
        ]
      },
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://wordsolverx.com' },
        { name: 'Solver', url: 'https://wordsolverx.com/solver' },
        { name: 'Searchle Solver', url: 'https://wordsolverx.com/searchle-solver' }
      ])
    ]
  }), ['FAQPage', 'HowTo'])}</script>`}
</svelte:head>

<main class="min-h-screen bg-purple-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <Breadcrumbs hideSchema={true} />
  </div>

  <!-- Hero Banner -->
  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 px-6 py-8 shadow-2xl text-center space-y-4">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Daily Word Game</p>
      <h1 class="text-4xl font-black text-white sm:text-5xl">Searchle Solver</h1>
      <p class="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">Enter the partial Google search prompt and get entropy-ranked autocomplete guesses. Mark feedback colors to narrow down the answer.</p>
    </div>
  </section>

  <div class="max-w-4xl mx-auto px-4 py-4">
    {#if dailyPuzzle && !useDaily}
      <div class="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg rounded-2xl">
        <div class="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium">Today&apos;s Searchle</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">{dailyPuzzle.date}</span>
            </div>
            <p class="text-purple-100 text-sm">"{dailyPuzzle.prompt}"</p>
          </div>
          <button
            type="button"
            onclick={playDaily}
            class="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg"
          >
            Play Daily
          </button>
        </div>
      </div>
    {/if}

    <div class="mb-6 bg-white border border-slate-200 shadow-lg rounded-2xl">
      <div class="p-6">
        <label for="searchle-prompt-input" class="block text-sm font-medium text-slate-700 mb-2">
          Enter the search prompt (with ... for the missing word)
        </label>
        <div class="flex gap-3">
          <div class="relative flex-1">
            <input
              id="searchle-prompt-input"
              type="text"
              bind:this={promptInput}
              bind:value={prompt}
              oninput={handlePromptInput}
              onkeydown={handleKeyDown}
              onfocus={() => void refreshPromptSuggestions(prompt)}
              onblur={() => setTimeout(() => {
                showPromptSuggestions = false;
                activePromptSuggestionIndex = -1;
              }, 120)}
              placeholder="e.g., Why does my cat... or How to make..."
              class="w-full pl-4 pr-4 py-4 text-lg rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
            {#if showPromptSuggestions}
              <div class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div class="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Searchle Queries
                </div>
                <div class="max-h-80 overflow-y-auto py-2">
                  {#each promptSuggestions as suggestion, index}
                    <button
                      type="button"
                      onmousedown={(event) => event.preventDefault()}
                      onclick={() => applyPromptSuggestion(suggestion)}
                      class={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${index === activePromptSuggestionIndex ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span class="truncate text-sm font-medium">{suggestion}</span>
                      <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Pick</span>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
          <button
            type="button"
            onclick={handleSolve}
            disabled={isLoading || !prompt.trim()}
            class="bg-purple-500 hover:bg-purple-600 text-white px-6 rounded-xl"
          >
            {isLoading || runtimeLoading ? 'Loading' : 'Solve'}
          </button>
        </div>
        {#if possibleWords > 0}
          <div class="mt-3 text-sm text-slate-500">{possibleWords} possible answers</div>
        {/if}
      </div>
    </div>

    {#if error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-2xl">
        <div class="py-4 text-center text-red-600">{error}</div>
      </div>
    {/if}

    {#if isSolved && guesses.length > 0}
      <div class="mb-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white border-0 shadow-xl rounded-2xl">
        <div class="py-8 text-center">
          <h2 class="text-xl font-bold mb-2">Solved</h2>
          <p class="font-mono text-4xl uppercase tracking-[0.2em] font-bold mb-2">
            {guesses[guesses.length - 1].word}
          </p>
          <p class="text-teal-100 mb-4">
            Completed in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}
          </p>
          <button
            type="button"
            onclick={handleReset}
            class="bg-white text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg"
          >
            New Puzzle
          </button>
        </div>
      </div>
    {/if}

    {#if guesses.length > 0 && !isSolved}
      <div class="mb-6 bg-white border border-slate-200 rounded-2xl">
        <div class="py-5 text-center">
          <h3 class="text-sm font-medium text-slate-500 mb-4">Your Guesses</h3>
          <div class="flex flex-wrap justify-center gap-3">
            {#each guesses as guess}
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
                <span class="font-mono font-bold uppercase">{guess.word}</span>
                <span class={guess.isCorrect ? 'text-teal-500' : 'text-red-500'}>
                  {guess.isCorrect ? 'OK' : 'X'}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    {#if suggestions.length > 0 && !isSolved}
      <div class="mb-6 bg-white border border-slate-200 rounded-2xl">
        <div class="px-6 pt-5 pb-2">
          <h3 class="text-lg font-semibold">Best Guesses</h3>
          <p class="text-sm text-slate-500 mt-1">
            Ordered so the most likely answers stay on top, followed by the lucky guess and the extra guesses.
          </p>
        </div>
        <div class="px-6 pb-6 grid grid-cols-2 md:grid-cols-5 gap-2">
          {#each suggestions as suggestion, index}
            <button
              type="button"
              onclick={() => selectWord(suggestion.word)}
              disabled={currentGuess === suggestion.word}
              class={`flex flex-col items-center p-3 rounded-xl font-mono text-center transition-all ${currentGuess === suggestion.word ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-slate-50 hover:bg-purple-50'} ${index === 0 ? 'ring-1 ring-teal-400' : ''}`}
            >
              <span class="text-lg font-bold uppercase">{suggestion.word}</span>
              <span class="text-xs text-slate-500">{suggestion.score}%</span>
              {#if suggestion.category === 'answer'}
                <span class="mt-1 text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">High Chances</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if currentGuess && letterStates.length > 0 && !isSolved}
      <div class="mb-6 bg-white border border-slate-200 rounded-2xl">
        <div class="py-5">
          <h3 class="text-sm font-medium text-slate-500 mb-3 text-center">
            Click each letter to match Searchle feedback
          </h3>
          <div class="flex justify-center gap-2 mb-4">
            {#each letterStates as state, idx}
              <button
                type="button"
                onclick={() => toggleLetterState(idx)}
                class={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all hover:scale-105 ${getStateColor(state)}`}
              >
                {currentGuess[idx].toUpperCase()}
              </button>
            {/each}
          </div>
          <div class="flex justify-center gap-3">
            <button type="button" onclick={() => { currentGuess = ''; letterStates = []; }} class="px-4 py-2 border border-slate-200 rounded-lg">
              Cancel
            </button>
            <button
              type="button"
              onclick={submitGuess}
              disabled={letterStates.every((s) => s === 'unknown')}
              class="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
            >
              Submit Guess
            </button>
          </div>
        </div>
      </div>
    {/if}

    <div class="grid md:grid-cols-2 gap-4">
      <a href="/searchle-answer-today" class="block">
        <div class="bg-white border border-slate-200 hover:border-purple-400 transition-colors rounded-2xl p-4 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">Ans</div>
          <div>
            <h3 class="font-semibold text-slate-900">Daily Answers</h3>
            <p class="text-sm text-slate-500">View today&apos;s and past answers</p>
          </div>
          <span class="ml-auto text-slate-400">&gt;</span>
        </div>
      </a>
    </div>

    

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl mt-12">
    </div>

    <div class="mt-8 bg-slate-100 rounded-2xl p-6 sm:p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">Explore More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        {#each solverLinks as link}
          <a href={link.href} class="px-5 py-2.5 bg-white rounded-xl font-semibold text-sm text-slate-800 shadow-sm border border-slate-200 hover:border-purple-400 transition-colors">
            {link.label}
          </a>
        {/each}
      </div>
    </div>
  </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
