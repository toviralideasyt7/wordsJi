<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import { generateBreadcrumbSchema, generateHowToSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
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

<section class="min-h-screen bg-white">
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

        
</div>

    <div class="mt-12">
      <StaticArticle content={ARTICLE_CONTENT['word-ladder-solver']} />

      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </section>
