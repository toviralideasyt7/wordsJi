<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { onMount } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
        import { generateBreadcrumbSchema, generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
  import {
    WORDSOLVERX_WORD_LENGTHS,
    getWordLadderIndexClient,
    getWordsOfLengthClient,
    type WordLadderIndex,
  } from '$lib/word-ladder-client';
  import { solveWordLadderWithIndex } from '$lib/word-ladder-logic';

  const MIN_LENGTH = WORDSOLVERX_WORD_LENGTHS[0]; // 3
  const MAX_LENGTH = WORDSOLVERX_WORD_LENGTHS[WORDSOLVERX_WORD_LENGTHS.length - 1]; // 12
  const MAX_PATHS_TO_SHOW = 5;

  type WordLengthOption = (typeof WORDSOLVERX_WORD_LENGTHS)[number];

  let startWord = $state('');
  let endWord = $state('');
  let wordSet = $state<Set<string>>(new Set());
  let ladderIndex = $state<WordLadderIndex | null>(null);
  let loadedLength = $state<number | null>(null);
  let resultPaths = $state<string[][]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let mounted = $state(false);

  let startInputRef = $state<HTMLInputElement | null>(null);
  let endInputRef = $state<HTMLInputElement | null>(null);

  // Derived: detect word length from the longer of the two inputs
  let detectedLength = $derived.by(() => {
    const sLen = startWord.length;
    const eLen = endWord.length;
    // Use the length when both words are the same length, or the longer one if only one is filled
    if (sLen > 0 && eLen > 0 && sLen === eLen) return sLen;
    if (sLen >= MIN_LENGTH && eLen === 0) return sLen;
    if (eLen >= MIN_LENGTH && sLen === 0) return eLen;
    if (sLen > 0 && eLen > 0 && sLen !== eLen) return Math.max(sLen, eLen);
    return null;
  });

  let validLength = $derived(
    detectedLength !== null &&
    detectedLength >= MIN_LENGTH &&
    detectedLength <= MAX_LENGTH &&
    WORDSOLVERX_WORD_LENGTHS.includes(detectedLength as WordLengthOption)
  );

  async function loadWordData(length: number) {
    if (loadedLength === length && ladderIndex) return;
    isLoading = true;
    error = null;

    try {
      const [loadedWords, loadedIndex] = await Promise.all([
        getWordsOfLengthClient(length as WordLengthOption, 'wordsolverx', 'lower'),
        getWordLadderIndexClient(length as WordLengthOption, 'wordsolverx', 'lower'),
      ]);

      wordSet = loadedWords;
      ladderIndex = loadedIndex;
      loadedLength = length;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error fetching words';
      wordSet = new Set();
      ladderIndex = null;
      loadedLength = null;
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    mounted = true;
  });

  function sanitize(val: string): string {
    return val.toLowerCase().replace(/[^a-z]/g, '');
  }

  async function handleInput() {
    resultPaths = [];

    const s = startWord;
    const e = endWord;

    if (s.length === 0 && e.length === 0) return;

    // Both must be same length and within range to solve
    if (s.length !== e.length || s.length < MIN_LENGTH || s.length > MAX_LENGTH) return;
    if (!WORDSOLVERX_WORD_LENGTHS.includes(s.length as WordLengthOption)) return;

    // Load data if needed
    if (loadedLength !== s.length || !ladderIndex) {
      await loadWordData(s.length);
    }

    // After loading, check validity and solve
    if (!ladderIndex || !wordSet) return;
    if (!wordSet.has(s) || !wordSet.has(e)) return;

    resultPaths = solveWordLadderWithIndex(ladderIndex, s, e, {
      maxSolutions: MAX_PATHS_TO_SHOW,
      mode: 'short',
    }).solutions;
  }

  function onStartInput(e: Event) {
    startWord = sanitize((e.target as HTMLInputElement).value);
    void handleInput();
  }

  function onEndInput(e: Event) {
    endWord = sanitize((e.target as HTMLInputElement).value);
    void handleInput();
  }

  let startWordValid = $derived(startWord.length >= MIN_LENGTH && wordSet.has(startWord));
  let endWordValid = $derived(endWord.length >= MIN_LENGTH && wordSet.has(endWord));
  let bothSameLength = $derived(startWord.length > 0 && endWord.length > 0 && startWord.length === endWord.length);
  let startWordInvalid = $derived(startWord.length >= MIN_LENGTH && loadedLength === startWord.length && !isLoading && !wordSet.has(startWord));
  let endWordInvalid = $derived(endWord.length >= MIN_LENGTH && loadedLength === endWord.length && !isLoading && !wordSet.has(endWord));

  function getSizeClasses(length: number): string {
    if (length >= 10) return 'w-8 h-8 text-sm sm:w-10 sm:h-10 sm:text-lg';
    if (length >= 8) return 'w-9 h-9 text-base sm:w-11 sm:h-11 sm:text-xl';
    if (length >= 6) return 'w-10 h-10 text-lg sm:w-12 sm:h-12 sm:text-2xl';
    return 'w-12 h-12 text-2xl sm:w-16 sm:h-16 sm:text-3xl';
  }

  function getBlockClasses(
    letter: string,
    targetWord: string,
    charIndex: number,
    currentLength: number
  ): string {
    let classes = `${getSizeClasses(currentLength)} border-2 flex items-center justify-center font-bold uppercase transition-all duration-150 ease-in-out rounded-xl shadow-sm`;

    if (letter === targetWord[charIndex]) {
      classes += ' bg-teal-500 text-white border-teal-600';
    } else {
      classes += ' bg-slate-200 text-slate-800 border-slate-300';
    }

    return classes;
  }

  const faqs = [
    {
      question: 'What is Weaver?',
      answer: 'Weaver is a daily word ladder game where you change one letter at a time to get from a start word to a target word. Every step must be a real word. The goal is to do it in as few steps as possible.',
    },
    {
      question: 'How does the Weaver Solver work?',
      answer: 'Type your start word and end word. The solver detects the word length, loads the right word list, and runs a breadth-first search to find every shortest path between the two words. Results appear automatically — no button needed.',
    },
    {
      question: 'What word lengths does the solver support?',
      answer: 'The solver handles 3 to 12 letter words. Both words must be the same length. Type them in and the correct word list loads automatically.',
    },
    {
      question: 'Why does the solver show multiple paths?',
      answer: 'Sometimes there are several routes of equal length between two words. The solver shows up to 5 shortest paths so you can pick the one that uses words you prefer.',
    },
    {
      question: 'What happens when no path exists?',
      answer: 'Some word pairs have no valid connection in the dictionary. If that happens, the solver tells you directly. It means there is no sequence of single-letter changes that connects those two words through real words.',
    },
    {
      question: 'Is this the same algorithm as the Weaver game uses?',
      answer: 'The solver uses bidirectional BFS, which is faster than a single-direction search. It explores from both ends simultaneously and stops when the two fronts meet. The result is always the true shortest path.',
    },
    {
      question: 'Can I use this for any word ladder puzzle, not just Weaver?',
      answer: 'Yes. The underlying algorithm works for any word ladder problem. If you have a word pair from a different game or puzzle book, just type them in. As long as both words are the same length and in the dictionary, the solver will find the path.',
    },
  ];

  const jsonLdSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      generateWebPageSchema(
        'Weaver Solver - Word Ladder Helper',
        'Solve any Weaver word ladder puzzle with our free solver. Find the shortest path between two words by changing one letter at a time.',
        'https://wordsolverx.com/weaver-solver',
        { image: 'https://wordsolverx.com/images/weaver-solver.webp' }
      ),
      generateSoftwareApplicationSchema('Weaver Solver', 'GameApplication'),
      generateFAQSchema(faqs),
      generateHowToSchema('How to use the Weaver Solver', [
        { name: 'Enter the start word', text: 'Type your starting word into the top input. It turns green when the solver recognizes it as a valid dictionary word.' },
        { name: 'Enter the end word', text: 'Type the target word in the bottom input. Both words must be the same length between 3 and 12 letters.' },
        { name: 'Wait for results', text: 'The solver detects the word length, loads the word list, and finds the shortest path automatically. No button press needed.' },
        { name: 'Review the paths', text: 'Up to 5 shortest paths appear as letter grids. Green tiles show letters that match the target word at that position.' },
      ]),
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://wordsolverx.com' },
        { name: 'Weaver Solver', url: 'https://wordsolverx.com/weaver-solver' },
      ]),
    ],
  });
</script>

<svelte:head>
  <title>Weaver Solver - Word Ladder Helper</title>
  <meta name="description" content="Solve any Weaver word ladder puzzle with our free solver. Find the shortest path between two words by changing one letter at a time." />
  <meta name="keywords" content="Weaver Solver, Word Ladder, Weaver Game, Weaver Answer, Word Puzzle Solver" />
  <link rel="canonical" href="https://wordsolverx.com/weaver-solver" />
  <meta property="og:title" content="Weaver Solver - Word Ladder Helper" />
  <meta property="og:description" content="Find the shortest word ladder path between any two words." />
  <meta property="og:url" content="https://wordsolverx.com/weaver-solver" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://wordsolverx.com/images/weaver-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Weaver Solver" />
  <meta name="twitter:description" content="Solve Weaver word ladder puzzles instantly." />
        {@html `<script type="application/ld+json">${stripStructuredDataTypes(jsonLdSchema, ['FAQPage', 'HowTo']) ?? jsonLdSchema}</script>`}
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-6 py-8 shadow-2xl">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Word Ladder Game</p>
      <h1 class="mt-4 text-4xl font-black text-white">Weaver Solver</h1>
      <p class="mt-4 max-w-3xl text-lg text-white/80">
        Type your start and end words. The solver auto-detects word length and finds the shortest path — no button needed.
      </p>
    </div>
  </section>

  <div class="mx-auto max-w-5xl px-4 pb-4 sm:px-6 lg:px-8">

  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 max-w-md w-full text-center">
      <p class="text-red-600 font-medium">{error}</p>
      <p class="mt-2 text-slate-500 text-sm">Please try refreshing the page.</p>
    </div>
  {/if}

  <div class="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg lg:max-w-3xl xl:max-w-5xl border border-slate-200 transition-all duration-300">
    <!-- Starting Word Section -->
    <div class="mb-6">
      <div class="flex items-center justify-center mb-3">
        <div class="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-1/4 mr-4"></div>
        <h2 class="text-center text-lg font-medium text-indigo-700 px-4 py-1 rounded-full bg-indigo-50 border border-indigo-100">
          Starting Word
        </h2>
        <div class="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-1/4 ml-4"></div>
      </div>
      <div class="flex justify-center">
        <input
          bind:this={startInputRef}
          type="text"
          value={startWord}
          oninput={onStartInput}
          placeholder="e.g. cold"
          class="w-full max-w-sm text-center text-2xl sm:text-3xl font-bold uppercase tracking-[0.3em] py-4 px-6 border-2 rounded-xl shadow-inner outline-none transition-all duration-200
            {startWordInvalid ? 'border-red-400 bg-red-50/50 text-red-600 focus:ring-2 focus:ring-red-300' :
             startWordValid ? 'border-teal-400 bg-teal-50/50 text-teal-700 focus:ring-2 focus:ring-teal-300' :
             'border-indigo-300 bg-indigo-50/50 text-indigo-600 focus:ring-2 focus:ring-indigo-400'}"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </div>
      {#if startWordInvalid}
        <p class="text-center text-red-500 text-sm mt-2">
          <span class="font-semibold">"{startWord}"</span> is not in the dictionary.
        </p>
      {/if}
    </div>

    <!-- Loading indicator -->
    {#if isLoading}
      <div class="flex justify-center my-4">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        <span class="ml-3 text-slate-500">Loading {detectedLength}-letter words...</span>
      </div>
    {/if}

    <!-- Result Paths -->
    {#if resultPaths.length > 0}
      <div class="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each resultPaths as path, pathIdx}
          <div class="p-4 bg-slate-50 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
            <h3 class="text-center font-semibold text-blue-600 mb-3 pb-2 border-b border-slate-200">
              Path {pathIdx + 1} <span class="text-slate-500 text-sm">({path.length - 1} step{path.length - 1 === 1 ? '' : 's'})</span>
            </h3>
            <div class="space-y-2 flex-grow flex flex-col justify-center">
              {#each path.slice(1) as word, stepIndex}
                <div class="overflow-x-auto">
                  <div
                    class="flex min-w-max justify-center gap-1 sm:gap-2 animate-fadeIn"
                    style="animation-delay: {stepIndex * 100}ms"
                  >
                    {#each word.split('') as char, charIndex}
                      <div class={getBlockClasses(char, endWord, charIndex, word.length)}>
                        {char}
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
            <div class="mt-2 pt-2 border-t border-slate-200 text-center text-xs text-slate-500">
              {path[0]} -&gt; {path[path.length - 1]}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- No path found -->
    {#if bothSameLength && startWordValid && endWordValid && resultPaths.length === 0 && !isLoading}
      <div class="my-4 text-center">
        <p class="text-yellow-600 font-medium px-4 py-2 bg-yellow-50 rounded-lg inline-block">
          No path found between <span class="font-semibold">"{startWord}"</span> and <span class="font-semibold">"{endWord}"</span>.
        </p>
      </div>
    {/if}

    <!-- Length mismatch warning -->
    {#if startWord.length >= MIN_LENGTH && endWord.length >= MIN_LENGTH && startWord.length !== endWord.length}
      <div class="my-4 text-center">
        <p class="text-amber-600 text-sm px-4 py-2 bg-amber-50 rounded-lg inline-block">
          Start word ({startWord.length} letters) and end word ({endWord.length} letters) must be the same length.
        </p>
      </div>
    {/if}

    <!-- Destination Word Section -->
    <div class="mt-6">
      <div class="flex items-center justify-center mb-3">
        <div class="h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent w-1/4 mr-4"></div>
        <h2 class="text-center text-lg font-medium text-teal-700 px-4 py-1 rounded-full bg-teal-50 border border-teal-100">
          Destination Word
        </h2>
        <div class="h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent w-1/4 ml-4"></div>
      </div>
      <div class="flex justify-center">
        <input
          bind:this={endInputRef}
          type="text"
          value={endWord}
          oninput={onEndInput}
          placeholder="e.g. warm"
          class="w-full max-w-sm text-center text-2xl sm:text-3xl font-bold uppercase tracking-[0.3em] py-4 px-6 border-2 rounded-xl shadow-inner outline-none transition-all duration-200
            {endWordInvalid ? 'border-red-400 bg-red-50/50 text-red-600 focus:ring-2 focus:ring-red-300' :
             endWordValid ? 'border-teal-400 bg-teal-50/50 text-teal-700 focus:ring-2 focus:ring-teal-300' :
             'border-teal-300 bg-teal-50/50 text-teal-700 focus:ring-2 focus:ring-teal-400'}"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </div>
      {#if endWordInvalid}
        <p class="text-center text-red-500 text-sm mt-2">
          <span class="font-semibold">"{endWord}"</span> is not in the dictionary.
        </p>
      {/if}
    </div>
  </div>

  </div>

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">What the Weaver game actually is</h2>
      <p class="text-slate-600 mb-4 leading-relaxed">
        Weaver gives you two words of the same length and asks you to get from one to the other by changing exactly one letter per step. Every intermediate word has to be real. COLD → CORD → WORD → WARD → WARM is a classic example — four steps, four valid words.
      </p>
      <p class="text-slate-600 mb-4 leading-relaxed">
        The daily version picks one word pair. You try to beat it in fewer steps than the par. Some pairs have an obvious path. Others send you hunting through less common words before you find the right bridge.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The concept goes back to 1879. Lewis Carroll invented it and called them Doublets, published in Vanity Fair magazine. His first example: HEAD → HEAL → TEAL → TELL → TALL → TAIL. Same rule, same structure — just no leaderboard.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">When the path isn't obvious</h2>
      <p class="text-slate-600 mb-4 leading-relaxed">
        Short words look easy. Three-letter pairs like CAT → DOG feel approachable, but CAT and DOG share no letters. You need a bridge word, then another, then another. CAT → BAT → BAD → BAG → BOG → DOG — five steps for what looked like a simple hop.
      </p>
      <p class="text-slate-600 mb-4 leading-relaxed">
        Longer words have more letters to change but also more options at each step. A seven-letter word can swap any of seven positions, each producing a potential neighbor. The search space is bigger, but there are also more paths through it.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The hardest puzzles involve words with unusual letter patterns — lots of uncommon consonants, or vowel combinations that only appear in a few words. There might be only one valid intermediate word at a certain step, and if you don't know it, you're stuck.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How the solver finds the shortest path</h2>
      <p class="text-slate-600 mb-4 leading-relaxed">
        The solver uses bidirectional breadth-first search. It explores outward from both the start word and end word at the same time and stops the moment the two fronts meet. This is faster than searching from one end alone, especially for longer words.
      </p>
      <p class="text-slate-600 mb-4 leading-relaxed">
        BFS guarantees the shortest path. It checks every path of length N before any path of length N+1. The first time a word appears in both frontiers, that's the meeting point — and you know it's optimal because no shorter path could have been missed.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The word graph is built by comparing every word of the target length to every other. Two words are connected if they differ by exactly one letter. For 4-letter words, that graph has tens of thousands of edges. The solver navigates it in under a second.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Patterns that actually help</h2>
      <div class="space-y-5">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">1</span>
          <div>
            <h3 class="font-bold text-slate-900">Work from both ends</h3>
            <p class="text-slate-600 mt-1 text-sm">Think about what words are one step from your start, and what words are one step from your target. If any word appears on both lists, you've found a two-step path.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">2</span>
          <div>
            <h3 class="font-bold text-slate-900">Change vowels last</h3>
            <p class="text-slate-600 mt-1 text-sm">Consonant swaps tend to preserve word meaning and stay in the dictionary. Changing the vowel often jumps into a different word family with fewer connections.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center">3</span>
          <div>
            <h3 class="font-bold text-slate-900">Know your three-letter words</h3>
            <p class="text-slate-600 mt-1 text-sm">Short words like OAT, EAT, EAR, OAR, OAK form dense clusters. If your path goes through one of these, you often have several options for the next step.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">4</span>
          <div>
            <h3 class="font-bold text-slate-900">Avoid rare words as bridges</h3>
            <p class="text-slate-600 mt-1 text-sm">A valid dictionary word isn't always useful. If only one other word connects to it, it's a dead end in disguise. Look for words with many neighbors.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">5</span>
          <div>
            <h3 class="font-bold text-slate-900">Use the solver to learn</h3>
            <p class="text-slate-600 mt-1 text-sm">After you've tried a puzzle, look at the solver's path. Pay attention to which bridge words it chose. Those words tend to be highly connected — knowing them helps on future puzzles.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why some word pairs have no path</h2>
      <p class="text-slate-600 mb-4 leading-relaxed">
        Not every pair of same-length words is connected. The word graph can have disconnected components — islands of words that can only reach each other and not the broader network.
      </p>
      <p class="text-slate-600 mb-4 leading-relaxed">
        Unusual words with uncommon letter patterns often end up isolated. They might have only one or two neighbors in the graph, and those neighbors might not connect back to the main component.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The daily Weaver game is designed to avoid this. Puzzle creators pick pairs from the connected core of the word graph. If the solver tells you no path exists, one of your words is probably spelled differently than expected, or it's not in the dictionary the solver uses.
      </p>
    </section>

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" title="Weaver Solver FAQ" {faqs} />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/word-ladder-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Word Ladder Solver</a>
        <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Wordle Solver</a>
        <a href="/squaredle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Squaredle Solver</a>
        <a href="/boggle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Boggle Solver</a>
        <a href="/hangman-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Hangman Solver</a>
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
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out forwards;
    opacity: 0;
  }
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion) {
    .animate-fadeIn {
      animation: none;
      opacity: 1;
    }
  }

  input[type='text'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
</style>
