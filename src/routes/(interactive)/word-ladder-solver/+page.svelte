<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import FAQSection from '$lib/components/FAQSection.svelte';
        import { generateBreadcrumbSchema, generateFAQSchema, generateHowToSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
        import {
                getDictionaryLabel,
                isValidWordClient,
                solveWordLadderClient,
                supportsWordSolverXLength,
                type DictionaryType,
                type SolveWordLadderResult
        } from '$lib/word-ladder-client';

        type ActiveView = 'all' | 'detailed';

        interface SolutionResult extends SolveWordLadderResult {
                solutionsCount: number;
                startWord: string;
                endWord: string;
                dictionary: DictionaryType;
                maxSolutions: number;
        }

        let startWord = $state('');
        let endWord = $state('');
        let dictionary = $state<DictionaryType>('wordsolverx');
        let maxSolutions = $state('10');
        let loading = $state(false);
        let result = $state<SolutionResult | null>(null);
        let error = $state<string | null>(null);
        let activeSolution = $state(0);
        let activeView = $state<ActiveView>('all');
        let stepsFilter = $state('all');
        let wordSearch = $state('');

        const canSolve = $derived(Boolean(startWord.trim() && endWord.trim()));
        const availableStepCounts = $derived(result?.stepCounts ?? []);
        const filteredSolutions = $derived.by(() => {
                if (!result) return [] as string[][];
                const normalizedSearch = wordSearch.trim().toUpperCase();

                return result.solutions.filter((solution) => {
                        const matchesSteps =
                                stepsFilter === 'all' ||
                                (Number.parseInt(stepsFilter, 10) === solution.length - 1);

                        const matchesSearch =
                                normalizedSearch.length === 0 ||
                                solution.some((word) => word.includes(normalizedSearch));

                        return matchesSteps && matchesSearch;
                });
        });
        const currentDetailedIndex = $derived(
                filteredSolutions.length === 0 ? 0 : Math.min(activeSolution, filteredSolutions.length - 1)
        );
        const detailedSolution = $derived(filteredSolutions[currentDetailedIndex] ?? filteredSolutions[0] ?? null);

        function normalizeMaxSolutions(value: string): number {
                const parsed = Number.parseInt(value, 10);
                if (!Number.isFinite(parsed)) {
                        return 10;
                }

                return Math.min(200, Math.max(1, parsed));
        }

        function handleWordInput(which: 'start' | 'end', value: string) {
                const normalized = value.toUpperCase().replace(/[^A-Z]/g, '');
                if (which === 'start') {
                        startWord = normalized;
                } else {
                        endWord = normalized;
                }
        }

        function handleEnter(event: KeyboardEvent) {
                if (event.key === 'Enter') {
                        void solveLadder();
                }
        }

        function getChangedLetterIndex(word1: string, word2: string): number {
                for (let index = 0; index < word1.length; index += 1) {
                        if (word1[index] !== word2[index]) {
                                return index;
                        }
                }
                return -1;
        }

        function stepDescription(word1: string, word2: string): string {
                const changeIndex = getChangedLetterIndex(word1, word2);
                if (changeIndex === -1) return 'No change';
                return `Change position ${changeIndex + 1}: ${word1[changeIndex]} -> ${word2[changeIndex]}`;
        }

        function getFilterCount(stepCount: number): number {
                return result?.solutions.filter((solution) => solution.length - 1 === stepCount).length ?? 0;
        }

        async function loadMoreAnswers() {
                const nextMaxSolutions = Math.min(200, normalizeMaxSolutions(maxSolutions) + 20);
                if (nextMaxSolutions === normalizeMaxSolutions(maxSolutions)) {
                        return;
                }

                const currentWordSearch = wordSearch;
                const currentStepsFilter = stepsFilter;
                maxSolutions = String(nextMaxSolutions);
                await solveLadder();
                wordSearch = currentWordSearch;
                stepsFilter = currentStepsFilter;
                activeSolution = 0;
        }

        async function solveLadder() {
                if (!startWord.trim() || !endWord.trim()) {
                        error = 'Please enter both start and end words';
                        return;
                }

                if (startWord.length !== endWord.length) {
                        error = 'Start and end words must be the same length';
                        return;
                }

                const normalizedMaxSolutions = normalizeMaxSolutions(maxSolutions);
                maxSolutions = String(normalizedMaxSolutions);

                if (dictionary === 'wordsolverx' && !supportsWordSolverXLength(startWord.length)) {
                        error =
                                'Our Word List is currently available for 3 to 12 letter words. Use OWL2 or SOWPODS for other lengths.';
                        return;
                }

                loading = true;
                error = null;
                result = null;
                activeSolution = 0;
                activeView = 'all';
                stepsFilter = 'all';
                wordSearch = '';

                try {
                        const start = startWord.toUpperCase().trim();
                        const end = endWord.toUpperCase().trim();
                        const [startValid, endValid] = await Promise.all([
                                isValidWordClient(start, dictionary),
                                isValidWordClient(end, dictionary)
                        ]);

                        if (!startValid) {
                                throw new Error(`"${start}" is not in the ${getDictionaryLabel(dictionary)} dictionary`);
                        }

                        if (!endValid) {
                                throw new Error(`"${end}" is not in the ${getDictionaryLabel(dictionary)} dictionary`);
                        }

                        const solved = await solveWordLadderClient(start, end, dictionary, {
                                maxSolutions: normalizedMaxSolutions,
                                mode: 'mixed'
                        });

                        result = {
                                startWord: start,
                                endWord: end,
                                dictionary,
                                maxSolutions: normalizedMaxSolutions,
                                length: solved.length,
                                shortestLength: solved.shortestLength,
                                stepCounts: solved.stepCounts,
                                truncated: solved.truncated,
                                solutionsCount: solved.solutions.length,
                                solutions: solved.solutions
                        };
                } catch (err) {
                        error = err instanceof Error ? err.message : 'An error occurred';
                } finally {
                        loading = false;
                }
        }

        const faqs = [
                {
                        question: 'What is a word ladder?',
                        answer: 'A word ladder transforms one word into another by changing exactly one letter at a time, and each intermediate step must be a valid word. Lewis Carroll invented the puzzle in 1879 under the name "Doublets." The classic example turns HEAD into TAIL in 5 steps: HEAD → HEAL → TEAL → TELL → TALL → TAIL.'
                },
                {
                        question: 'Why does my word pair have no solution?',
                        answer: 'Most unsolvable pairs hit a dead end because no valid word in the dictionary bridges two consecutive steps. BRICK → STONE, for instance, requires changing 5 of 5 letters, and the intermediate words simply do not exist in standard dictionaries. Try switching to a larger dictionary like SOWPODS, which includes more obscure words that might create a path.'
                },
                {
                        question: 'What is the difference between the three dictionaries?',
                        answer: 'Our Word List uses the same word sets as the game Weaver for 3–12 letter words. OWL2 is the official US Scrabble dictionary — smaller but widely accepted. SOWPODS combines OWL2 with the international Scrabble list, adding thousands of words valid in UK and Commonwealth play. A pair that has no solution in OWL2 might have one in SOWPODS.'
                },
                {
                        question: 'Why does the solver return paths with different step counts?',
                        answer: 'Mixed mode finds the shortest paths first, then continues searching for longer paths that use different words. The shortest path from COLD to WARM takes 4 steps, but a 5-step path might travel through words like WORD and FARM that the 4-step path skips. Mixed mode shows you both, so you can pick the route you find most interesting.'
                },
                {
                        question: 'How do I filter results after solving?',
                        answer: 'Two post-solve filters are available. The step-count buttons at the top of the results show only paths with that exact number of steps. The word search box lets you type any word — only paths containing that word appear. Combine both filters to narrow things down fast.'
                },
                {
                        question: 'Does the solver guarantee the shortest possible ladder?',
                        answer: 'Yes. The solver uses breadth-first search, which explores all 1-step paths before any 2-step paths, all 2-step paths before any 3-step paths, and so on. The first complete path it finds is always the shortest. If no path exists in the chosen dictionary, it tells you so.'
                },
                {
                        question: 'Can I solve ladders longer than 4-letter words?',
                        answer: 'Yes. Our Word List supports 3 to 12 letter words. OWL2 and SOWPODS support even longer words. Longer words have more letter positions to change, which means more potential intermediate words — but also more ways to hit dead ends. Try WELCOME → GOODBYE for a real challenge.'
                }
        ];

        const jsonLd = JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                        {
                                '@type': 'WebApplication',
                                name: 'Word Ladder Solver',
                                description:
                                        'Find mixed word ladder paths with manual answer limits and post-solve filters for words and steps.',
                                url: 'https://wordsolverx.com/word-ladder-solver',
                                applicationCategory: 'GameApplication',
                                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
                        },
                        generateWebPageSchema(
                                'Word Ladder Solver | Mixed Paths And Filters',
                                'Find mixed word ladder paths, search results by word, filter by steps after solving, and use manual answer limits with Our Word List, OWL2, or SOWPODS.',
                                'https://wordsolverx.com/word-ladder-solver',
                                { image: 'https://wordsolverx.com/images/word-ladder-solver.webp' }
                        ),
                        generateFAQSchema(faqs),
                        generateHowToSchema('How to use the Word Ladder Solver', [
                                { name: 'Enter start and end words', text: 'Type two words of the same length — for example, COLD and WARM. The solver only works with equal-length words because each step changes exactly one letter.' },
                                { name: 'Pick a dictionary', text: 'Choose Our Word List for Weaver-compatible results, OWL2 for US Scrabble words, or SOWPODS for the widest international word set.' },
                                { name: 'Set the answer limit', text: 'Choose how many paths to return, from 1 to 200. More paths take slightly longer but reveal more routes.' },
                                { name: 'Click Find Word Ladders', text: 'The solver runs breadth-first search and returns a mixed set of paths across different step counts.' },
                                { name: 'Filter the results', text: 'Use the step-count buttons to see only paths of a certain length, or type a word in the search box to find paths that pass through it.' }
                        ]),
                        generateBreadcrumbSchema([
                                { name: 'Home', url: 'https://wordsolverx.com' },
                                { name: 'Word Ladder Solver', url: 'https://wordsolverx.com/word-ladder-solver' }
                        ])
                ]
        });
</script>

<svelte:head>
        <title>Word Ladder Solver | Mixed Paths And Filters</title>
        <meta
                name="description"
                content="Find mixed word ladder paths, search results by word, filter by steps after solving, and use manual answer limits with Our Word List, OWL2, or SOWPODS."
        />
        <link rel="canonical" href="https://wordsolverx.com/word-ladder-solver" />
        <meta property="og:title" content="Word Ladder Solver" />
        <meta
                property="og:description"
                content="Solve word ladders with mixed step counts plus post-solve word and step filters."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wordsolverx.com/word-ladder-solver" />
        <meta property="og:image" content="https://wordsolverx.com/images/word-ladder-solver.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Word Ladder Solver" />
        <meta
                name="twitter:description"
                content="Find mixed ladders with Our Word List, OWL2, or SOWPODS and filter them after solving."
        />
        {@html `<script type="application/ld+json">${stripStructuredDataTypes(jsonLd, ['FAQPage', 'HowTo']) ?? jsonLd}</script>`}
</svelte:head>

<main class="min-h-screen bg-white">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumbs hideSchema={true} />
        </div>

        <!-- Hero banner section -->
        <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
                <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-700 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-12">
                        <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-4">
                                Word Puzzle Solver
                        </p>
                        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Word Ladder Solver</h1>
                        <p class="text-lg text-white/80 max-w-2xl leading-relaxed">
                                Find the shortest path between any two words, changing one letter at a time. Mixed step counts, post-solve filters, and three dictionaries — including the same word list as Weaver.
                        </p>
                </div>
        </section>

        <div class="max-w-6xl mx-auto px-4 sm:px-6">

                <section class="rounded-[30px] border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 mb-6">
                        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                                <label class="block">
                                        <span class="text-sm font-semibold text-slate-700">Start Word</span>
                                        <input
                                                class="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-lg font-mono uppercase text-slate-900"
                                                placeholder="CAT"
                                                value={startWord}
                                                maxlength={15}
                                                oninput={(event) => handleWordInput('start', (event.target as HTMLInputElement).value)}
                                                onkeydown={handleEnter}
                                        />
                                </label>

                                <label class="block">
                                        <span class="text-sm font-semibold text-slate-700">End Word</span>
                                        <input
                                                class="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-lg font-mono uppercase text-slate-900"
                                                placeholder="DOG"
                                                value={endWord}
                                                maxlength={15}
                                                oninput={(event) => handleWordInput('end', (event.target as HTMLInputElement).value)}
                                                onkeydown={handleEnter}
                                        />
                                </label>

                                <label class="block">
                                        <span class="text-sm font-semibold text-slate-700">Dictionary</span>
                                        <select
                                                class="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900"
                                                bind:value={dictionary}
                                        >
                                                <option value="wordsolverx">Our Word List (same as Weaver)</option>
                                                <option value="twl">OWL2 (US Scrabble)</option>
                                                <option value="sowpods">SOWPODS (World)</option>
                                        </select>
                                </label>

                                <label class="block">
                                        <span class="text-sm font-semibold text-slate-700">Max Answers</span>
                                        <input
                                                class="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900"
                                                type="number"
                                                min="1"
                                                max="200"
                                                step="1"
                                                inputmode="numeric"
                                                bind:value={maxSolutions}
                                        />
                                </label>
                        </div>

                        <div class="mt-4 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
                                <p class="font-semibold">Mixed results are enabled by default.</p>
                                <p class="mt-1">The solver now mixes different step counts together instead of filling the whole list with only one step length first. Manual answer caps like 12 or 18 are supported.</p>
                                {#if dictionary === 'wordsolverx'}
                                        <p class="mt-2 text-violet-700">Our Word List uses the same local word lists as Weaver for 3 to 12 letter words.</p>
                                {/if}
                        </div>

                        <div class="mt-6 flex justify-center">
                                <button
                                        type="button"
                                        onclick={solveLadder}
                                        disabled={loading || !canSolve}
                                        class={`px-8 py-3 rounded-2xl font-bold text-white transition-colors ${
                                                loading || !canSolve
                                                        ? 'bg-slate-300 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-violet-500 to-fuchsia-600'
                                        }`}
                                >
                                        {loading ? 'Solving...' : 'Find Word Ladders'}
                                </button>
                        </div>
                </section>

                {#if error}
                        <div class="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                                <p class="font-semibold">Error</p>
                                <p class="text-sm mt-1">{error}</p>
                        </div>
                {/if}

                {#if loading}
                        <section class="rounded-[30px] border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 space-y-4">
                                <div class="h-7 w-48 rounded-full bg-slate-200 animate-pulse"></div>
                                <div class="h-24 rounded-3xl bg-slate-100 animate-pulse"></div>
                                <div class="h-24 rounded-3xl bg-slate-100 animate-pulse"></div>
                        </section>
                {/if}

                {#if result && !loading}
                        <div class="space-y-6">
                                <section class="rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6">
                                        <div class="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                        <h2 class="text-xl font-bold text-slate-900">Results</h2>
                                                        <p class="text-sm text-slate-500">
                                                                {getDictionaryLabel(result.dictionary)} | {result.solutionsCount} answer{result.solutionsCount === 1 ? '' : 's'}
                                                        </p>
                                                </div>
                                                <div class="flex flex-wrap items-center gap-2">
                                                        <div class="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-700">
                                                                Shortest: {result.shortestLength - 1} step{result.shortestLength - 1 === 1 ? '' : 's'}
                                                        </div>
                                                        {#if result.truncated}
                                                                <div class="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700">
                                                                        Capped at {result.maxSolutions} answers
                                                                </div>
                                                        {/if}
                                                </div>
                                        </div>

                                        <div class="flex flex-wrap items-center gap-4 text-lg mt-4">
                                                <span class="font-mono font-bold text-violet-700">{result.startWord}</span>
                                                <span class="text-slate-400">-></span>
                                                <span class="font-mono font-bold text-teal-700">{result.endWord}</span>
                                                <span class="text-slate-500">({result.solutions.length} answers shown)</span>
                                        </div>

                                        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                                                <label class="block">
                                                        <span class="text-sm font-semibold text-slate-700">Search By Word</span>
                                                        <input
                                                                class="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-mono uppercase text-slate-900"
                                                                placeholder="TIN"
                                                                value={wordSearch}
                                                                oninput={(event) => {
                                                                        wordSearch = (event.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z]/g, '');
                                                                        activeSolution = 0;
                                                                }}
                                                        />
                                                </label>

                                                {#if result.truncated && result.maxSolutions < 200}
                                                        <div class="flex justify-start lg:justify-end">
                                                                <button
                                                                        type="button"
                                                                        onclick={loadMoreAnswers}
                                                                        class="px-5 py-3 rounded-2xl border border-violet-200 bg-violet-50 text-violet-700 font-semibold"
                                                                >
                                                                        Load 20 More Answers
                                                                </button>
                                                        </div>
                                                {/if}
                                        </div>

                                        {#if availableStepCounts.length > 0}
                                                <div class="mt-5">
                                                        <p class="text-sm font-semibold text-slate-700 mb-3">Filter By Steps</p>
                                                        <div class="flex flex-wrap gap-2">
                                                                <button
                                                                        type="button"
                                                                        onclick={() => {
                                                                                stepsFilter = 'all';
                                                                                activeSolution = 0;
                                                                        }}
                                                                        class={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                                                                stepsFilter === 'all'
                                                                                        ? 'bg-slate-900 text-white'
                                                                                        : 'bg-slate-100 text-slate-600'
                                                                        }`}
                                                                >
                                                                        All Steps ({result.solutions.length})
                                                                </button>
                                                                {#each availableStepCounts as stepCount}
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => {
                                                                                        stepsFilter = String(stepCount);
                                                                                        activeSolution = 0;
                                                                                }}
                                                                                class={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                                                                        stepsFilter === String(stepCount)
                                                                                                ? 'bg-violet-600 text-white'
                                                                                                : 'bg-violet-50 text-violet-700 border border-violet-200'
                                                                                }`}
                                                                        >
                                                                                {stepCount} step{stepCount === 1 ? '' : 's'} ({getFilterCount(stepCount)})
                                                                        </button>
                                                                {/each}
                                                        </div>
                                                </div>
                                        {/if}
                                </section>

                                {#if result.solutions.length > 0}
                                        <section class="rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
                                                <div class="p-5 border-b border-slate-200">
                                                        <div class="flex flex-wrap items-center justify-between gap-3">
                                                                <div class="flex items-center gap-2">
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => (activeView = 'all')}
                                                                                class={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                                                                        activeView === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                                                }`}
                                                                        >
                                                                                All Answers
                                                                        </button>
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => (activeView = 'detailed')}
                                                                                class={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                                                                        activeView === 'detailed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                                                }`}
                                                                        >
                                                                                Detailed View
                                                                        </button>
                                                                </div>

                                                                {#if activeView === 'detailed' && filteredSolutions.length > 0}
                                                                        <div class="flex items-center gap-2">
                                                                                <button
                                                                                        type="button"
                                                                                        onclick={() => (activeSolution = Math.max(0, currentDetailedIndex - 1))}
                                                                                        disabled={currentDetailedIndex === 0}
                                                                                        class={`px-3 py-2 rounded-xl text-sm font-semibold ${
                                                                                                currentDetailedIndex === 0
                                                                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                                                        : 'bg-white border border-slate-200 text-slate-700'
                                                                                        }`}
                                                                                >
                                                                                        Previous
                                                                                </button>
                                                                                <span class="text-sm text-slate-500">
                                                                                        {currentDetailedIndex + 1} of {filteredSolutions.length}
                                                                                </span>
                                                                                <button
                                                                                        type="button"
                                                                                        onclick={() => (activeSolution = Math.min(filteredSolutions.length - 1, currentDetailedIndex + 1))}
                                                                                        disabled={currentDetailedIndex >= filteredSolutions.length - 1}
                                                                                        class={`px-3 py-2 rounded-xl text-sm font-semibold ${
                                                                                                currentDetailedIndex >= filteredSolutions.length - 1
                                                                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                                                        : 'bg-white border border-slate-200 text-slate-700'
                                                                                        }`}
                                                                                >
                                                                                        Next
                                                                                </button>
                                                                        </div>
                                                                {/if}
                                                        </div>
                                                </div>

                                                {#if filteredSolutions.length === 0}
                                                        <div class="p-5">
                                                                <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
                                                                        <p class="font-semibold">No answers match this filter</p>
                                                                        <p class="text-sm mt-1">Try another word search, another step count, or load more answers.</p>
                                                                </div>
                                                        </div>
                                                {:else if activeView === 'all'}
                                                        <div class="p-5 space-y-4">
                                                                {#each filteredSolutions as solution, index}
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => {
                                                                                        activeSolution = index;
                                                                                        activeView = 'detailed';
                                                                                }}
                                                                                class={`w-full text-left rounded-[24px] border p-4 transition-all ${
                                                                                        activeSolution === index
                                                                                                ? 'border-violet-300 bg-violet-50'
                                                                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                                                                }`}
                                                                        >
                                                                                <div class="flex flex-wrap items-center gap-3 mb-3">
                                                                                        <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-violet-700">
                                                                                                {index + 1}
                                                                                        </div>
                                                                                        <h3 class="font-semibold text-slate-900">Answer {index + 1}</h3>
                                                                                        <span class="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-500">
                                                                                                {solution.length - 1} step{solution.length - 1 === 1 ? '' : 's'}
                                                                                        </span>
                                                                                        <span class="ml-auto px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-500">
                                                                                                {solution.length} words
                                                                                        </span>
                                                                                </div>

                                                                                <div class="flex flex-wrap items-center gap-2">
                                                                                        {#each solution as word, wordIndex}
                                                                                                <span class="px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-sm text-slate-800">
                                                                                                        {word}
                                                                                                </span>
                                                                                                {#if wordIndex < solution.length - 1}
                                                                                                        <span class="text-slate-400">-></span>
                                                                                                {/if}
                                                                                        {/each}
                                                                                </div>
                                                                        </button>
                                                                {/each}
                                                        </div>
                                                {:else}
                                                        <div class="p-5">
                                                                {#if detailedSolution}
                                                                <div class="space-y-3">
                                                                        <div class="flex items-center gap-3 p-3 rounded-2xl bg-violet-50 border border-violet-200">
                                                                                <div class="w-9 h-9 rounded-full bg-white border border-violet-200 flex items-center justify-center font-bold text-violet-700">
                                                                                        S
                                                                                </div>
                                                                                <span class="font-mono text-xl font-bold text-violet-700">
                                                                                        {detailedSolution[0]}
                                                                                </span>
                                                                                <span class="px-3 py-1 rounded-full bg-white border border-violet-200 text-xs font-semibold text-violet-700">
                                                                                        Start
                                                                                </span>
                                                                        </div>

                                                                        {#each detailedSolution as word, index}
                                                                                {#if index < detailedSolution.length - 1}
                                                                                        {@const nextWord = detailedSolution[index + 1]}
                                                                                        {@const changeIndex = getChangedLetterIndex(word, nextWord)}
                                                                                        <div class="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                                                                                                <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                                                                                                        <div class="flex items-center gap-3">
                                                                                                                <div class="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm">
                                                                                                                        {index + 1}
                                                                                                                </div>

                                                                                                                <div class="font-mono text-lg flex gap-1">
                                                                                                                        {#each word.split('') as char, charIndex}
                                                                                                                                <span
                                                                                                                                        class={`inline-flex w-7 h-8 items-center justify-center rounded ${
                                                                                                                                                charIndex === changeIndex
                                                                                                                                                        ? 'bg-amber-100 text-amber-700 border border-amber-300 font-bold'
                                                                                                                                                        : 'text-slate-800'
                                                                                                                                        }`}
                                                                                                                                >
                                                                                                                                        {char}
                                                                                                                                </span>
                                                                                                                        {/each}
                                                                                                                </div>

                                                                                                                <span class="text-slate-400">-></span>

                                                                                                                <div class="font-mono text-lg flex gap-1">
                                                                                                                        {#each nextWord.split('') as char, charIndex}
                                                                                                                                <span
                                                                                                                                        class={`inline-flex w-7 h-8 items-center justify-center rounded ${
                                                                                                                                                charIndex === changeIndex
                                                                                                                                                        ? 'bg-teal-100 text-teal-700 border border-teal-300 font-bold'
                                                                                                                                                        : 'text-slate-800'
                                                                                                                                        }`}
                                                                                                                                >
                                                                                                                                        {char}
                                                                                                                                </span>
                                                                                                                        {/each}
                                                                                                                </div>
                                                                                                        </div>

                                                                                                        <div class="text-sm text-slate-500 lg:ml-auto">
                                                                                                                {stepDescription(word, nextWord)}
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                {/if}
                                                                        {/each}

                                                                        <div class="flex items-center gap-3 p-3 rounded-2xl bg-teal-50 border border-teal-200">
                                                                                <div class="w-9 h-9 rounded-full bg-white border border-teal-200 flex items-center justify-center font-bold text-teal-700">
                                                                                        T
                                                                                </div>
                                                                                <span class="font-mono text-xl font-bold text-teal-700">
                                                                                        {detailedSolution[detailedSolution.length - 1]}
                                                                                </span>
                                                                                <span class="px-3 py-1 rounded-full bg-white border border-teal-200 text-xs font-semibold text-teal-700">
                                                                                        Target
                                                                                </span>
                                                                        </div>
                                                                </div>
                                                                {/if}
                                                        </div>
                                                {/if}
                                        </section>
                                {:else}
                                        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
                                                <p class="font-semibold">No solution found</p>
                                                <p class="text-sm mt-1">
                                                        There is no word ladder connecting "{result.startWord}" to "{result.endWord}" in the selected dictionary.
                                                </p>
                                        </div>
                                {/if}
                        </div>
                {/if}

        <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                                <h2 class="text-3xl font-bold text-slate-900 mb-5">Lewis Carroll Invented Word Ladders in 1879</h2>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        In December 1879, the mathematician and author Charles Dodgson — better known by his pen name Lewis Carroll — published a new word puzzle in Vanity Fair magazine. He called it "Doublets." The rules were simple: transform one word into another by changing one letter at a time, and every intermediate step had to be a real word.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        Carroll's original puzzle asked readers to turn HEAD into TAIL. The solution takes 5 steps: HEAD → HEAL → TEAL → TELL → TALL → TAIL. Turns out, HEAD → TAIL is one of the most famous word ladders ever — and it's still hard to beat. Carroll published dozens of Doublets in Vanity Fair throughout 1879 and 1880, and readers sent in their own. The puzzle caught on fast.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        The name "word ladder" came later. Carroll's Doublets required each step to relate to the words' meanings — he insisted that HEAD and TAIL were thematically linked — but modern word ladders dropped that constraint. Today, any pair of equal-length words is fair game, and the only rule is that every step must be a valid word in whatever dictionary you are using.
                                </p>
                                <div class="rounded-2xl bg-violet-50 border border-violet-200 p-5">
                                        <p class="text-sm font-semibold text-violet-800 mb-3">The original HEAD → TAIL ladder in 5 steps</p>
                                        <div class="flex flex-wrap items-center gap-2">
                                                <span class="px-3 py-2 rounded-xl bg-white border border-violet-200 font-mono text-sm font-bold text-violet-700">HEAD</span>
                                                <span class="text-violet-400">→</span>
                                                <span class="px-3 py-2 rounded-xl bg-white border border-violet-200 font-mono text-sm text-slate-700">HEAL</span>
                                                <span class="text-violet-400">→</span>
                                                <span class="px-3 py-2 rounded-xl bg-white border border-violet-200 font-mono text-sm text-slate-700">TEAL</span>
                                                <span class="text-violet-400">→</span>
                                                <span class="px-3 py-2 rounded-xl bg-white border border-violet-200 font-mono text-sm text-slate-700">TELL</span>
                                                <span class="text-violet-400">→</span>
                                                <span class="px-3 py-2 rounded-xl bg-white border border-violet-200 font-mono text-sm text-slate-700">TALL</span>
                                                <span class="text-violet-400">→</span>
                                                <span class="px-3 py-2 rounded-xl bg-white border border-teal-200 font-mono text-sm font-bold text-teal-700">TAIL</span>
                                        </div>
                                </div>
                        </section>

                        <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                                <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Some Word Pairs Have No Solution</h2>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        Not every word pair has a ladder connecting them. The most common reason is a dead end: you change a letter, land on a valid word, and then find that every possible next change produces nonsense. If every path from that word hits a dead end, the ladder is unsolvable.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        Take BRICK → STONE. All five letters differ, which means every position needs to change at least once. The problem is that intermediate words like BRACE, TRACK, or STOCK exist — but they do not form a connected chain that reaches STONE. In the OWL2 dictionary, BRICK → STONE simply has no solution.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        Dictionary gaps cause most failures. SOWPODS contains roughly 267,000 words while OWL2 has about 187,000. Those extra 80,000 words in SOWPODS include obscure terms that can bridge steps where OWL2 hits a wall. A pair that fails in OWL2 might solve cleanly in SOWPODS. If your ladder comes back empty, switch dictionaries and try again.
                                </p>
                                <p class="text-slate-600 leading-relaxed">
                                        This won't find paths using words outside the selected dictionary. If neither dictionary contains a bridging word, the pair is genuinely unsolvable by the rules of the game.
                                </p>
                        </section>

                        <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                                <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Solver Finds Every Possible Path</h2>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        The solver uses breadth-first search (BFS). BFS explores all 1-step words from the start word before any 2-step words, all 2-step words before any 3-step words, and so on. Because of this layer-by-layer approach, the first complete path BFS discovers from start to end is always the shortest possible path. No exceptions.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        For longer ladders, the solver also runs bidirectional search — it explores outward from both the start word and the end word at the same time. When the two frontiers meet, a path exists. Bidirectional search cuts the search space roughly in half compared to one-directional BFS, which makes a real difference on 7+ letter words where the word graph is large.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        Once the shortest paths are found, the solver keeps going in mixed mode. It continues the BFS to discover paths that take one more step, then two more steps, filling the result set with ladders of different lengths until it hits the answer cap you set. This is why you might see 23 shortest paths and 24 with extra steps — same start and end words, different routes.
                                </p>
                                <p class="text-slate-600 leading-relaxed">
                                        Every path the solver returns is valid. It never skips a word, never reuses a word in the same ladder, and never produces a step that is not in the chosen dictionary. If the solver says a path exists, you can verify it one step at a time.
                                </p>
                        </section>

                        <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                                <h2 class="text-3xl font-bold text-slate-900 mb-5">Three Dictionaries, Three Different Results</h2>
                                <p class="text-slate-600 leading-relaxed mb-5">
                                        The dictionary you pick changes which words count as valid steps, and that changes which ladders exist. Here is how the three options differ:
                                </p>
                                <div class="grid gap-4 md:grid-cols-3 mb-5">
                                        <div class="rounded-xl bg-violet-50 border border-violet-200 p-5">
                                                <h3 class="font-bold text-violet-900 mb-2">Our Word List</h3>
                                                <p class="text-sm text-violet-700">Uses the same word sets as the daily game Weaver for 3–12 letter words. If a ladder works in Weaver, it works here with the same step count. This is the default because it matches the most popular word ladder game online.</p>
                                        </div>
                                        <div class="rounded-xl bg-slate-50 border border-slate-200 p-5">
                                                <h3 class="font-bold text-slate-900 mb-2">OWL2 (US Scrabble)</h3>
                                                <p class="text-sm text-slate-600">The official Tournament Word List used in North American Scrabble. About 187,000 words. Smaller than SOWPODS, so some ladders that exist in international play will not appear here. Good if you want widely-accepted words only.</p>
                                        </div>
                                        <div class="rounded-xl bg-slate-50 border border-slate-200 p-5">
                                                <h3 class="font-bold text-slate-900 mb-2">SOWPODS (World)</h3>
                                                <p class="text-sm text-slate-600">Combines OWL2 with the international Scrabble list, totaling roughly 267,000 words. Adds UK-specific terms, Commonwealth English, and older tournament words. The largest dictionary — best chance of finding a solution when OWL2 comes up empty.</p>
                                        </div>
                                </div>
                                <p class="text-slate-600 leading-relaxed">
                                        A concrete example: COLD → WARM has a 4-step ladder in all three dictionaries. But COLD → FARM might need 5 steps in OWL2 and only 4 in SOWPODS because SOWPODS contains a bridging word that OWL2 does not recognize. The dictionary is not a minor setting — it determines what counts as a valid step.
                                </p>
                        </section>

                        <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                                <h2 class="text-3xl font-bold text-slate-900 mb-5">When Mixed Step Counts Reveal Better Paths</h2>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        The shortest ladder between two words is not always the most interesting one. Consider COLD → WARM. The 4-step shortest path might go through CARD. A 5-step path might go through CORD → WORD → WARD → WARM — a route that strings together common, recognizable words instead of scraping by with obscure ones.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        Mixed mode finds the shortest paths first, then continues the search to collect longer paths that use different intermediate words. The result is a combined set — you might get 23 shortest paths and 24 with extra steps in a single solve. The step-count filter at the top of the results lets you isolate any step length you want.
                                </p>
                                <p class="text-slate-600 leading-relaxed mb-4">
                                        This matters if you are solving word ladders for a game like Weaver. Weaver requires the shortest possible path, so you need to confirm the minimum step count first. But if you are exploring word ladders for fun or education, the longer paths often travel through more common words and are easier to follow by hand.
                                </p>
                                <p class="text-slate-600 leading-relaxed">
                                        The answer cap controls how many total paths the solver returns. Start with 10 to see a sample, then raise it to 50 or 100 if you want to explore more routes. The solver stops when it hits the cap or exhausts all paths — whichever comes first.
                                </p>
                        </section>

                        <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
                                <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Solving Word Ladders by Hand</h2>
                                <div class="space-y-5">
                                        <div class="flex gap-4">
                                                <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center">1</span>
                                                <div>
                                                        <h3 class="font-bold text-slate-900">Work from both ends</h3>
                                                        <p class="text-slate-600 mt-1 text-sm">Write the start word at the top of the page and the end word at the bottom. Change one letter from each end and see if the middle words can meet. This halves the effective search space because you are building two short ladders instead of one long one.</p>
                                                </div>
                                        </div>
                                        <div class="flex gap-4">
                                                <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center">2</span>
                                                <div>
                                                        <h3 class="font-bold text-slate-900">Focus on letters that differ</h3>
                                                        <p class="text-slate-600 mt-1 text-sm">If HEAD and TAIL differ in positions 1, 2, 3, and 4, you need to change all four positions. Do not waste steps changing a letter back to something it already was. Track which positions still need to flip and prioritize those.</p>
                                                </div>
                                        </div>
                                        <div class="flex gap-4">
                                                <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center">3</span>
                                                <div>
                                                        <h3 class="font-bold text-slate-900">Use rhyming word families</h3>
                                                        <p class="text-slate-600 mt-1 text-sm">If you need to change the first letter of a word ending in -AIL, run through the family: BAIL, FAIL, HAIL, JAIL, MAIL, NAIL, PAIL, RAIL, SAIL, TAIL. Rhyming families are the fastest way to brainstorm valid intermediate words because your brain already groups them.</p>
                                                </div>
                                        </div>
                                        <div class="flex gap-4">
                                                <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center">4</span>
                                                <div>
                                                        <h3 class="font-bold text-slate-900">Accept detours</h3>
                                                        <p class="text-slate-600 mt-1 text-sm">Sometimes you need to change a letter to something wrong temporarily so you can change another position. HEAD → HEAL changes the 4th letter to L, which then lets you reach TEAL → TELL → TALL. Without that detour through HEAL, you cannot get the L into position 4. Detours are not wasted steps — they are how most ladders actually work.</p>
                                                </div>
                                        </div>
                                        <div class="flex gap-4">
                                                <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center">5</span>
                                                <div>
                                                        <h3 class="font-bold text-slate-900">Verify each step out loud</h3>
                                                        <p class="text-slate-600 mt-1 text-sm">It is embarrassingly easy to write down a word that looks real but is not. SHOAL is a word. SHOEL is not. Say each intermediate word out loud — if you cannot find it in a sentence, it probably is not valid. When in doubt, check it against the dictionary you are using.</p>
                                                </div>
                                        </div>
                                </div>
                        </section>

                        <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
                                <FAQSection class="py-0" title="Word Ladder Solver FAQ" {faqs} />
                        </div>

                        <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
                                <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
                                <div class="flex flex-wrap justify-center gap-3">
                                        <a href="/weaver-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Weaver Solver</a>
                                        <a href="/hangman-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Hangman Solver</a>
                                        <a href="/boggle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Boggle Solver</a>
                                        <a href="/squaredle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Squaredle Solver</a>
                                        <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">5-Letter Wordle Solver</a>
                                        <a href="/word-search-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Word Search Solver</a>
                                </div>
</section>
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
