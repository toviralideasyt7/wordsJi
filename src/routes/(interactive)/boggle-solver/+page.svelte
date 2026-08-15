<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import { onMount } from 'svelte';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import { generateBreadcrumbSchema, generateFAQSchema, generateHowToSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
        import { generateRandomBoggleBoard, solveBoggleBoard } from '$lib/boggle-client';

        interface Position {
                row: number;
                col: number;
        }

        interface FoundWord {
                word: string;
                path: Position[];
                score: number;
        }

        interface Stats {
                totalWords: number;
                totalScore: number;
                wordLengths: Record<number, number>;
        }

        interface SolveResult {
                success: boolean;
                board: string[][];
                letters: string;
                size: number;
                words: FoundWord[];
                stats: Stats;
                dictionarySize: number;
        }

        interface StatusMessage {
                type: 'success' | 'error';
                title: string;
                description: string;
        }

        type DiceType = 'classic' | 'revised' | 'none';
        type SortBy = 'length' | 'alpha';

        const HEAT_COLORS = [
                'bg-red-500',
                'bg-orange-500',
                'bg-amber-500',
                'bg-yellow-500',
                'bg-lime-500',
                'bg-teal-500',
                'bg-teal-500',
                'bg-teal-500',
                'bg-cyan-500',
                'bg-teal-500'
        ];

        let boardSize = $state(4);
        let letters = $state('');
        let diceType = $state<DiceType>('revised');
        let result = $state<SolveResult | null>(null);
        let isLoading = $state(false);
        let isGenerating = $state(false);
        let sortBy = $state<SortBy>('length');
        let selectedWord = $state<FoundWord | null>(null);
        let selectedCell = $state<Position | null>(null);
        let copiedUrl = $state(false);
        let statusMessage = $state<StatusMessage | null>(null);
        let clearMessageTimer = $state<number | undefined>(undefined);
        let resultsSection = $state<HTMLElement | null>(null);
        let boardSection = $state<HTMLElement | null>(null);

        const filteredWords = $derived.by(() => {
                if (!result?.words) return [] as FoundWord[];

                let words = [...result.words];
                const cell = selectedCell;

                if (sortBy === 'alpha') {
                        words.sort((left, right) => left.word.localeCompare(right.word));
                } else {
                        words.sort((left, right) => right.word.length - left.word.length || left.word.localeCompare(right.word));
                }

                if (cell) {
                        words = words.filter((word) => word.path[0]?.row === cell.row && word.path[0]?.col === cell.col);
                }

                return words;
        });

        const groupedWords = $derived.by(() => {
                const groups: Record<number, FoundWord[]> = {};
                for (const word of filteredWords) {
                        const length = word.word.length;
                        if (!groups[length]) {
                                groups[length] = [];
                        }
                        groups[length].push(word);
                }

                return Object.entries(groups).sort((left, right) => Number(right[0]) - Number(left[0]));
        });

        const cellSize = $derived(boardSize <= 4 ? 72 : boardSize <= 6 ? 56 : 44);
        const fontSizeClass = $derived(boardSize <= 4 ? 'text-2xl' : boardSize <= 6 ? 'text-xl' : 'text-lg');

        function setStatus(type: 'success' | 'error', title: string, description: string, timeout = 3000) {
                statusMessage = { type, title, description };
                if (clearMessageTimer !== undefined) {
                        window.clearTimeout(clearMessageTimer);
                }
                if (timeout > 0) {
                        clearMessageTimer = window.setTimeout(() => {
                                statusMessage = null;
                                clearMessageTimer = undefined;
                        }, timeout);
                }
        }

        async function generateRandomBoard() {
                isGenerating = true;
                statusMessage = null;

                try {
                        const generatedLetters = generateRandomBoggleBoard(boardSize, diceType);
                        letters = generatedLetters;
                        result = null;
                        selectedWord = null;
                        selectedCell = null;

                        const pageUrl = new URL(window.location.href);
                        pageUrl.searchParams.set('b', generatedLetters);
                        pageUrl.searchParams.set('s', String(boardSize));
                        window.history.replaceState({}, '', pageUrl);
                } catch (error) {
                        setStatus('error', 'Error', error instanceof Error ? error.message : 'Failed to generate random board');
                } finally {
                        isGenerating = false;
                }
        }

        async function solveBoard(letterInput?: string, sizeInput?: number) {
                const lettersToUse = letterInput ?? letters;
                const sizeToUse = sizeInput ?? boardSize;

                if (lettersToUse.length !== sizeToUse * sizeToUse) {
                        setStatus(
                                'error',
                                'Invalid Board',
                                `Please enter exactly ${sizeToUse * sizeToUse} letters for a ${sizeToUse}x${sizeToUse} board`
                        );
                        return;
                }

                isLoading = true;
                statusMessage = null;

                try {
                        const data = await solveBoggleBoard(lettersToUse, sizeToUse);
                        result = data;
                        selectedWord = null;
                        selectedCell = null;

                        const pageUrl = new URL(window.location.href);
                        pageUrl.searchParams.set('b', data.letters);
                        pageUrl.searchParams.set('s', String(data.size));
                        window.history.replaceState({}, '', pageUrl);

                        // Auto-scroll to results section after solving
                        requestAnimationFrame(() => {
                                resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                } catch (error) {
                        setStatus('error', 'Error', error instanceof Error ? error.message : 'Failed to connect to solver');
                } finally {
                        isLoading = false;
                }
        }

        function handleLettersInput(value: string) {
                letters = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, boardSize * boardSize);
        }

        function handleBoardSizeChange(value: string) {
                const nextSize = Number.parseInt(value, 10);
                boardSize = nextSize;
                letters = letters.slice(0, nextSize * nextSize);
                result = null;
                selectedWord = null;
                selectedCell = null;
                statusMessage = null;
        }

        async function copyShareUrl() {
                if (!result) return;

                try {
                        await navigator.clipboard.writeText(window.location.href);
                        copiedUrl = true;
                        setStatus('success', 'URL Copied!', 'Share this board URL with friends to challenge them!', 2000);
                        window.setTimeout(() => {
                                copiedUrl = false;
                        }, 2000);
                } catch {
                        setStatus('error', 'Copy Failed', 'Could not copy the share URL.');
                }
        }

        function getCellColor(row: number, col: number): string {
                if (!selectedWord) {
                        return 'bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200';
                }

                const pathIndex = selectedWord.path.findIndex((position) => position.row === row && position.col === col);
                if (pathIndex === -1) {
                        return 'bg-gradient-to-br from-slate-50 to-slate-100 opacity-40';
                }

                const heatIndex = Math.floor((pathIndex / selectedWord.path.length) * HEAT_COLORS.length);
                return HEAT_COLORS[Math.min(heatIndex, HEAT_COLORS.length - 1)];
        }

        function toggleCellSelection(row: number, col: number) {
                if (!result) return;
                const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                selectedCell = isSelected ? null : { row, col };
                selectedWord = null;
        }

        const faqs = [
                {
                        question: 'What board sizes does the Boggle solver support?',
                        answer: 'Any grid from 3x3 to 10x10. Standard Boggle is 4x4, Big Boggle is 5x5. Smaller boards finish faster but have fewer words. Larger boards produce more words but take a moment longer to solve.'
                },
                {
                        question: 'What is the difference between Classic and Revised dice?',
                        answer: 'Classic dice use the original 1972 Boggle letter distribution. Revised dice use the updated Hasbro distribution that slightly increases vowel frequency. Both produce valid boards. Choose "Random" if you want each letter picked independently by frequency.'
                },
                {
                        question: 'How does the Boggle solver find words?',
                        answer: 'It builds a trie from a dictionary of over 100,000 words, then runs a depth-first search from every cell on the board. Each path checks the trie as it goes, so it prunes dead ends early instead of checking every possible path.'
                },
                {
                        question: 'Can I share a Boggle board with someone?',
                        answer: 'Yes. After solving, click "Share Board URL" to copy a link that includes the board letters and size. Anyone who opens that link sees the same board already solved.'
                },
                {
                        question: 'Does the Boggle solver count the Q tile correctly?',
                        answer: 'Yes. In standard Boggle the Q die shows "Qu" and counts as two letters. The solver handles this the same way the physical game does.'
                },
                {
                        question: 'Is this Boggle solver free?',
                        answer: 'Yes, completely free. No sign-up, no ads, no limits. Pick a board size, enter letters or generate one, and solve.'
                }
        ];

        const jsonLd = JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                        {
                                '@type': 'WebApplication',
                                name: 'Boggle Solver',
                                description:
                                        'Find every valid word in a 3x3 to 10x10 Boggle board using the same trie and DFS logic as the source project.',
                                url: 'https://wordsolverx.com/boggle-solver',
                                applicationCategory: 'GameApplication',
                                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
                        },
                        generateWebPageSchema(
                                'Boggle Solver - Free Board Search Tool | WordSolverX',
                                'Find every valid word in a 3x3 to 10x10 Boggle board using the same trie and DFS logic as the source project.',
                                'https://wordsolverx.com/boggle-solver',
                                { image: 'https://wordsolverx.com/images/boggle-solver.webp' }
                        ),
                        generateFAQSchema(faqs),
                        generateHowToSchema('How to use the Boggle solver', [
                                { name: 'Choose a board size', text: 'Pick a grid size from 3x3 to 10x10. Standard Boggle uses 4x4.' },
                                { name: 'Enter or generate letters', text: 'Type your board letters manually or click Random to generate a board with proper Boggle dice distribution.' },
                                { name: 'Click Solve', text: 'The solver finds every valid word and shows them grouped by length, with scores and clickable paths.' }
                        ]),
                        generateBreadcrumbSchema([
                                { name: 'Home', url: 'https://wordsolverx.com' },
                                { name: 'Solver', url: 'https://wordsolverx.com/solver' },
                                { name: 'Boggle Solver', url: 'https://wordsolverx.com/boggle-solver' }
                        ])
                ]
        });

        onMount(() => {
                const params = new URLSearchParams(window.location.search);
                const sharedBoard = params.get('b');
                const sharedSize = params.get('s');

                if (sharedBoard && sharedSize) {
                        const parsedSize = Number.parseInt(sharedSize, 10);
                        if (!Number.isNaN(parsedSize) && parsedSize >= 3 && parsedSize <= 10) {
                                boardSize = parsedSize;
                                letters = sharedBoard.toUpperCase();
                                void solveBoard(sharedBoard.toUpperCase(), parsedSize);
                        }
                }

                return () => {
                        if (clearMessageTimer !== undefined) {
                                window.clearTimeout(clearMessageTimer);
                        }
                };
        });
</script>

<svelte:head>
        <title>Boggle Solver | Find All Words Instantly</title>
        <meta
                name="description"
                content="A light-theme Boggle Solver for 3x3 to 10x10 boards using the same trie and DFS algorithm as the original source project."
        />
        <link rel="canonical" href="https://wordsolverx.com/boggle-solver" />
        <meta property="og:title" content="Boggle Solver" />
        <meta
                property="og:description"
                content="Solve any Boggle board, highlight paths, filter by starting cell, and share board URLs."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wordsolverx.com/boggle-solver" />
        <meta property="og:image" content="https://wordsolverx.com/images/boggle-solver.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Boggle Solver" />
        <meta
                name="twitter:description"
                content="Find all possible words in your Boggle board with the copied trie + DFS logic."
        />
        {@html `<script type="application/ld+json">${stripStructuredDataTypes(jsonLd, ['FAQPage', 'HowTo']) ?? jsonLd}</script>`}
</svelte:head>

<main class="min-h-screen bg-white">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumbs hideSchema={true} />
        </div>

        <!-- Hero banner section -->
        <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
                <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-12">
                        <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-4">
                                Word Game Solver
                        </p>
                        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Boggle Solver</h1>
                        <p class="text-lg text-white/80 max-w-2xl leading-relaxed">
                                Find every valid word in any 3×3 to 10×10 Boggle board. Enter letters, generate a board, or load from a share URL — solved instantly in your browser.
                        </p>
                </div>
        </section>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
                <div class="flex justify-end mb-4">
                        <button
                                type="button"
                                onclick={copyShareUrl}
                                disabled={!result}
                                class={`px-4 py-3 rounded-2xl font-semibold border transition-colors ${
                                        result
                                                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                                title="Share Board URL"
                        >
                                {copiedUrl ? 'Copied URL' : 'Share Board URL'}
                        </button>
                </div>

                {#if statusMessage}
                        <div
                                class={`mb-6 rounded-2xl border px-4 py-3 ${
                                        statusMessage.type === 'success'
                                                ? 'border-teal-200 bg-teal-50 text-teal-700'
                                                : 'border-rose-200 bg-rose-50 text-rose-700'
                                }`}
                        >
                                <p class="font-semibold">{statusMessage.title}</p>
                                <p class="text-sm mt-1">{statusMessage.description}</p>
                        </div>
                {/if}

                <section class="rounded-[30px] border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-5 sm:p-6 mb-8">
                        <div class="grid gap-4 xl:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] xl:items-end">
                                <label class="block">
                                        <span class="text-sm font-semibold text-slate-700">Board Size</span>
                                        <select
                                                class="mt-2 h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900"
                                                bind:value={boardSize}
                                                onchange={(event) => handleBoardSizeChange((event.target as HTMLSelectElement).value)}
                                        >
                                                {#each [3, 4, 5, 6, 7, 8, 9, 10] as size}
                                                        <option value={size}>{size}x{size}</option>
                                                {/each}
                                        </select>
                                </label>

                                <label class="block">
                                        <span class="text-sm font-semibold text-slate-700">
                                                Board Letters <span class="text-slate-400">({letters.length}/{boardSize * boardSize})</span>
                                        </span>
                                        <input
                                                class="mt-2 w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-lg tracking-[0.2em] uppercase font-mono text-slate-900"
                                                placeholder={`Enter ${boardSize * boardSize} letters...`}
                                                value={letters}
                                                maxlength={boardSize * boardSize}
                                                oninput={(event) => handleLettersInput((event.target as HTMLInputElement).value)}
                                        />
                                </label>

                                <label class="block">
                                        <span class="text-sm font-semibold text-slate-700">Letter Distribution</span>
                                        <select
                                                class="mt-2 h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900"
                                                bind:value={diceType}
                                        >
                                                <option value="classic">Classic Dice</option>
                                                <option value="revised">Revised Dice</option>
                                                <option value="none">Random</option>
                                        </select>
                                </label>

                                <button
                                        type="button"
                                        onclick={generateRandomBoard}
                                        disabled={isGenerating}
                                        class="h-12 px-5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-70"
                                >
                                        {isGenerating ? 'Generating...' : 'Random'}
                                </button>

                                <button
                                        type="button"
                                        onclick={() => solveBoard()}
                                        disabled={isLoading || letters.length !== boardSize * boardSize}
                                        class={`h-12 px-6 rounded-2xl font-bold text-white ${
                                                isLoading || letters.length !== boardSize * boardSize
                                                        ? 'bg-slate-300 cursor-not-allowed'
                                                        : 'bg-teal-600 hover:bg-teal-700'
                                        }`}
                                >
                                        {isLoading ? 'Solving...' : 'Solve'}
                                </button>
                        </div>

                        {#if boardSize !== 4 && diceType !== 'none'}
                                <div class="mt-4 rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3 text-sm text-teal-700">
                                        Using weighted letter distribution based on Boggle dice frequency for better word formation on non-4x4 boards.
                                </div>
                        {/if}
                </section>

                <div class="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)]">
                        <div class="space-y-6" bind:this={boardSection}>
                                {#if result}
                                        <section class="rounded-[28px] border border-teal-100 bg-gradient-to-br from-teal-50 to-teal-50 p-5">
                                                <div class="grid grid-cols-3 gap-4 text-center">
                                                        <div>
                                                                <p class="text-3xl font-extrabold text-teal-600">{result.stats.totalWords}</p>
                                                                <p class="text-xs uppercase tracking-wide text-slate-500 mt-1">Words Found</p>
                                                        </div>
                                                        <div>
                                                                <p class="text-3xl font-extrabold text-teal-600">{result.stats.totalScore}</p>
                                                                <p class="text-xs uppercase tracking-wide text-slate-500 mt-1">Total Score</p>
                                                        </div>
                                                        <div>
                                                                <p class="text-3xl font-extrabold text-cyan-600">{result.dictionarySize.toLocaleString()}</p>
                                                                <p class="text-xs uppercase tracking-wide text-slate-500 mt-1">Dictionary</p>
                                                        </div>
                                                </div>
                                        </section>
                                {/if}

                                <section class="rounded-[30px] overflow-hidden border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                                        <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                                                <div
                                                        class="grid gap-1.5 mx-auto"
                                                        style={`grid-template-columns: repeat(${boardSize}, ${cellSize}px); width: fit-content;`}
                                                >
                                                        {#each Array(boardSize * boardSize).fill(null) as _, index}
                                                                {@const row = Math.floor(index / boardSize)}
                                                                {@const col = index % boardSize}
                                                                {@const letter = letters[index] || ''}
                                                                {@const isSelected = selectedCell?.row === row && selectedCell?.col === col}
                                                                <button
                                                                        type="button"
                                                                        onclick={() => toggleCellSelection(row, col)}
                                                                        title={result ? 'Click to filter words starting here' : 'Solve a board first'}
                                                                        class={`${fontSizeClass} font-bold rounded-xl flex items-center justify-center transition-all duration-200 border-2 border-slate-600/30 shadow-lg ${getCellColor(row, col)} ${
                                                                                result ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                                                                        } ${isSelected ? 'ring-4 ring-teal-400 ring-offset-2 ring-offset-slate-800' : ''}`}
                                                                        style={`width:${cellSize}px;height:${cellSize}px;`}
                                                                >
                                                                        <span class="text-slate-800">{letter}</span>
                                                                        {#if letter === 'Q'}
                                                                                <span class="text-xs -ml-1 text-slate-700">u</span>
                                                                        {/if}
                                                                </button>
                                                        {/each}
                                                </div>
                                        </div>
                                </section>

                                {#if selectedWord}
                                        <section class="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                                                <h2 class="text-lg font-bold text-slate-900">Selected Word</h2>
                                                <div class="flex flex-wrap items-center gap-3 mt-3">
                                                        <span class="text-2xl font-extrabold text-amber-700">{selectedWord.word}</span>
                                                        <span class="px-3 py-1 rounded-full bg-white border border-amber-200 text-sm font-semibold text-amber-700">
                                                                {selectedWord.score} points
                                                        </span>
                                                </div>
                                                <p class="mt-3 text-sm text-slate-600">
                                                        Path: {selectedWord.path.map((position) => `[${position.row},${position.col}]`).join(' → ')}
                                                </p>
                                                <p class="mt-2 text-xs text-slate-500">
                                                        Heat map shows letter order from red at the start to blue at the end.
                                                </p>
                                        </section>
                                {/if}
                        </div>

                        <section bind:this={resultsSection} class="rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
                                <div class="p-5 border-b border-slate-200">
                                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                        <h2 class="text-xl font-bold text-slate-900">Found Words</h2>
                                                        <p class="text-sm text-slate-500">
                                                                Click a word to highlight its path. Click a cell to filter by starting position.
                                                        </p>
                                                </div>

                                                <div class="flex items-center gap-2">
                                                        <span class="text-xs text-slate-500 uppercase tracking-wide">Sort</span>
                                                        <button
                                                                type="button"
                                                                onclick={() => (sortBy = 'length')}
                                                                class={`px-3 py-2 rounded-xl text-sm font-semibold ${
                                                                        sortBy === 'length' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                        >
                                                                Length
                                                        </button>
                                                        <button
                                                                type="button"
                                                                onclick={() => (sortBy = 'alpha')}
                                                                class={`px-3 py-2 rounded-xl text-sm font-semibold ${
                                                                        sortBy === 'alpha' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                        >
                                                                A-Z
                                                        </button>
                                                </div>
                                        </div>

                                        {#if selectedCell}
                                                <div class="flex flex-wrap items-center gap-2 mt-3">
                                                        <span class="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                                                                Showing words starting at [{selectedCell.row},{selectedCell.col}]
                                                        </span>
                                                        <button
                                                                type="button"
                                                                onclick={() => (selectedCell = null)}
                                                                class="text-sm font-semibold text-teal-700 hover:text-teal-600"
                                                        >
                                                                Clear
                                                        </button>
                                                </div>
                                        {/if}
                                </div>

                                {#if result}
                                        {#if filteredWords.length > 0}
                                                <div class="max-h-[calc(100vh-320px)] overflow-y-auto p-5 pt-4">
                                                        {#each groupedWords as [length, words]}
                                                                <div class="mb-5">
                                                                        <div class="flex flex-wrap items-center gap-2 mb-3">
                                                                                <span class="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                                                                                        {length} letters
                                                                                </span>
                                                                                <span class="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-500">
                                                                                        {words.length} words • {words.reduce((sum, word) => sum + word.score, 0)} pts
                                                                                </span>
                                                                        </div>

                                                                        <div class="flex flex-wrap gap-2">
                                                                                {#each words as word}
                                                                                        <button
                                                                                                type="button"
                                                                                                onclick={() => {
                                                                                                        selectedWord = selectedWord?.word === word.word ? null : word;
                                                                                                        if (selectedWord) {
                                                                                                                requestAnimationFrame(() => {
                                                                                                                        boardSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                                                                });
                                                                                                        }
                                                                                                }}
                                                                                                class={`h-8 px-3 rounded-xl text-xs font-mono border transition-colors ${
                                                                                                        selectedWord?.word === word.word
                                                                                                                ? 'bg-teal-500 border-teal-500 text-white'
                                                                                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                                                                }`}
                                                                                        >
                                                                                                {word.word} <span class="opacity-70">+{word.score}</span>
                                                                                        </button>
                                                                                {/each}
                                                                        </div>
                                                                </div>
                                                        {/each}
                                                </div>
                                        {:else}
                                                <div class="p-10 text-center text-slate-500">
                                                        <p class="font-semibold text-slate-700">No words found starting at this position</p>
                                                        <p class="text-sm mt-2">Clear the cell filter or solve another board.</p>
                                                </div>
                                        {/if}
                                {:else}
                                        <div class="p-10 text-center text-slate-500">
                                                <p class="font-semibold text-slate-700">No board solved yet</p>
                                                <p class="text-sm mt-2">Enter letters or generate a board, then click Solve.</p>
                                        </div>
                                {/if}
                        </section>
                </div>

                {#if !result}
                        <section class="mt-8 rounded-[30px] border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6">
                                <h2 class="text-2xl font-bold text-slate-900 mb-4">Quick Start</h2>
                                <div class="grid gap-4 md:grid-cols-3">
                                        <div class="rounded-2xl bg-slate-50 p-4">
                                                <h3 class="font-semibold text-slate-800">1. Pick a size</h3>
                                                <p class="mt-1 text-sm text-slate-600">3x3 to 10x10. Standard Boggle is 4x4.</p>
                                        </div>
                                        <div class="rounded-2xl bg-slate-50 p-4">
                                                <h3 class="font-semibold text-slate-800">2. Enter letters</h3>
                                                <p class="mt-1 text-sm text-slate-600">Type your board or hit Random to generate one with proper dice.</p>
                                        </div>
                                        <div class="rounded-2xl bg-slate-50 p-4">
                                                <h3 class="font-semibold text-slate-800">3. Click Solve</h3>
                                                <p class="mt-1 text-sm text-slate-600">Get every valid word, grouped by length, with scores and paths.</p>
                                        </div>
                                </div>
                        </section>
                {/if}

                
        </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
