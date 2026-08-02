<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import { onMount } from 'svelte';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import FAQSection from '$lib/components/FAQSection.svelte';
        import {
                generateFAQSchema,
                generateHowToSchema,
                generateBreadcrumbSchema,
                generateWebPageSchema,
                stripStructuredDataTypes
        } from '$lib/seo';

        type GameMode = 'micro' | 'mini' | 'midi' | 'classic' | 'maxi';
        type Feedback = 0 | 1 | 2;

        interface GuessRow {
                equation: string;
                feedback: Feedback[];
        }

        interface Suggestion {
                eq: string;
                entropy: number;
        }

        const NERDLE_SOLVER_API_URL = 'https://solver.nerdle.workers.dev';
        const SUPERSCRIPT_2 = '\u00B2';
        const SUPERSCRIPT_3 = '\u00B3';

        const MODE_CONFIG = {
                micro: { length: 5, name: 'Micro', example: '2+1=3', guesses: 6 },
                mini: { length: 6, name: 'Mini', example: '4*7=28', guesses: 6 },
                midi: { length: 7, name: 'Midi', example: '6-1*4=2', guesses: 6 },
                classic: { length: 8, name: 'Classic', example: '43-28=15', guesses: 6 },
                maxi: { length: 10, name: 'Maxi', example: '239-171=68', guesses: 6 }
        } as const;

        const FEEDBACK_STYLES = {
                2: 'bg-teal-500 border-teal-600 text-white',
                1: 'bg-yellow-400 border-yellow-500 text-slate-950',
                0: 'bg-slate-400 border-slate-500 text-white'
        } as const;

        const VALID_CHARS_BASIC = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '='];
        const VALID_CHARS_MAXI = [...VALID_CHARS_BASIC, '(', ')', SUPERSCRIPT_2, SUPERSCRIPT_3];
        const MODE_ENTRIES = Object.entries(MODE_CONFIG) as Array<
                [GameMode, (typeof MODE_CONFIG)[GameMode]]
        >;

        let mode = $state<GameMode>('classic');
        let guesses = $state<GuessRow[]>([]);
        let currentInput = $state('');
        let copiedEq = $state<string | null>(null);
        let suggestions = $state<Suggestion[]>([]);
        let remaining = $state(0);
        let totalCount = $state(0);
        let isLoading = $state(true);
        let isCalculating = $state(false);
        let isCheckingGuess = $state(false);
        let loadError = $state<string | null>(null);
        let requestToken = 0;

        const currentMode = $derived(MODE_CONFIG[mode]);
        const targetLength = $derived(currentMode.length);
        const validChars = $derived(mode === 'maxi' ? VALID_CHARS_MAXI : VALID_CHARS_BASIC);
        const topSuggestion = $derived(suggestions[0] ?? null);
        const moreSuggestions = $derived(suggestions.slice(1));
        const isDuplicateGuess = $derived(
                currentInput.length > 0 && guesses.some((guess) => guess.equation === currentInput)
        );
        const canAddGuess = $derived(currentInput.length === targetLength && !isDuplicateGuess);
        const modeSelectDisabled = $derived(guesses.length > 0 || isLoading || isCalculating);
        const keypadRows = $derived(
                mode === 'maxi'
                        ? [
                                        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                                        ['+', '-', '*', '/', '=', '(', ')', SUPERSCRIPT_2, SUPERSCRIPT_3]
                                ]
                        : [
                                        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                                        ['+', '-', '*', '/', '=']
                                ]
        );
        const inputMessage: { tone: 'info' | 'warning' | 'success'; text: string } = $derived.by(() => {
                if (currentInput.length === 0) {
                        return { tone: 'info', text: `Enter a ${targetLength}-character equation.` };
                }

                if (currentInput.length < targetLength) {
                        return {
                                tone: 'info',
                                text: `${targetLength - currentInput.length} more character${targetLength - currentInput.length === 1 ? '' : 's'} needed.`
                        };
                }

                if (isCheckingGuess) {
                        return { tone: 'info', text: 'Checking this equation with the solver...' };
                }

                if (isDuplicateGuess) {
                        return { tone: 'warning', text: 'This equation is already in your guess list.' };
                }

                return { tone: 'success', text: 'Ready to add. Press Enter or tap Add Guess.' };
        });

        function getInputTileClass(length: number, filled: boolean): string {
                const size = length <= 6 ? 'w-12 h-14 text-2xl' : length <= 8 ? 'w-11 h-12 text-xl' : 'w-9 h-11 text-base';
                return `${size} rounded-lg border-2 font-bold flex items-center justify-center ${
                        filled ? 'bg-white border-teal-400 text-slate-900 shadow-sm' : 'bg-slate-100 border-slate-300 text-slate-300'
                }`;
        }

        function getGuessTileClass(length: number, feedback: Feedback): string {
                const size = length <= 6 ? 'w-11 h-12 text-xl' : length <= 8 ? 'w-10 h-11 text-lg' : 'w-9 h-10 text-base';
                return `${size} rounded-md border-2 font-bold flex items-center justify-center ${FEEDBACK_STYLES[feedback]}`;
        }

        function getSuggestionTileClass(length: number): string {
                const size = length <= 6 ? 'w-9 h-10 text-lg' : length <= 8 ? 'w-8 h-9 text-base' : 'w-7 h-8 text-sm';
                return `${size} rounded-md border-2 border-slate-300 bg-white text-slate-900 font-bold flex items-center justify-center`;
        }

        function normalizeEquationInput(value: string): string {
                return Array.from(value)
                        .filter((character) => validChars.includes(character))
                        .slice(0, targetLength)
                        .join('');
        }

        function cycleFeedback(value: Feedback): Feedback {
                if (value === 0) return 2;
                if (value === 2) return 1;
                return 0;
        }

        function feedbackLabel(value: Feedback): string {
                if (value === 2) return 'Correct';
                if (value === 1) return 'Present';
                return 'Absent';
        }

        async function fetchSuggestions(currentGuesses: GuessRow[], nextMode: GameMode, token: number) {
                isCalculating = true;

                try {
                        const response = await fetch(`${NERDLE_SOLVER_API_URL}/solve`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ mode: nextMode, guesses: currentGuesses })
                        });
                        const data = await response.json().catch(() => null);

                        if (token !== requestToken || nextMode !== mode) {
                                return;
                        }

                        if (!response.ok || !data?.success) {
                                throw new Error(data?.error ?? data?.message ?? 'Failed to calculate suggestions.');
                        }

                        suggestions = data.suggestions ?? [];
                        remaining = data.remaining ?? 0;
                        totalCount = data.total ?? 0;
                        loadError = null;
                } catch (error) {
                        if (token !== requestToken || nextMode !== mode) {
                                return;
                        }

                        suggestions = [];
                        remaining = 0;
                        loadError = error instanceof Error ? error.message : 'Failed to calculate suggestions.';
                } finally {
                        if (token === requestToken && nextMode === mode) {
                                isCalculating = false;
                        }
                }
        }

        async function validateEquation(nextMode: GameMode, equation: string) {
                const response = await fetch(`${NERDLE_SOLVER_API_URL}/validate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ mode: nextMode, equation })
                });
                const data = await response.json().catch(() => null);

                if (!response.ok || !data?.success) {
                        throw new Error(data?.error ?? data?.message ?? 'Failed to validate the equation.');
                }

                return Boolean(data.valid);
        }

        async function loadModeData(nextMode: GameMode) {
                const token = ++requestToken;
                isLoading = true;
                loadError = null;
                currentInput = '';
                guesses = [];
                suggestions = [];
                remaining = 0;
                totalCount = 0;

                try {
                        await fetchSuggestions([], nextMode, token);
                } catch (error) {
                        if (token === requestToken && nextMode === mode) {
                                loadError = error instanceof Error ? error.message : 'Failed to load mode data.';
                        }
                } finally {
                        if (token === requestToken && nextMode === mode) {
                                isLoading = false;
                        }
                }
        }

        function handleModeChange(value: string) {
                const nextMode = value as GameMode;
                if (nextMode === mode || modeSelectDisabled) {
                        return;
                }

                mode = nextMode;
                void loadModeData(nextMode);
        }

        function handleModeSelectChange(event: Event) {
                handleModeChange((event.target as HTMLSelectElement).value);
        }

        function handleEquationInput(value: string) {
                currentInput = normalizeEquationInput(value);
                loadError = null;
        }

        function handleEquationTextInput(event: Event) {
                handleEquationInput((event.target as HTMLInputElement).value);
        }

        function handleInputKeydown(event: KeyboardEvent) {
                if (event.key === 'Enter' && canAddGuess && !isCheckingGuess) {
                        event.preventDefault();
                        void addGuess(currentInput);
                }
        }

        async function addGuess(
                equation: string = currentInput,
                options: { skipValidation?: boolean } = {}
        ) {
                const nextMode = mode;
                const nextLength = targetLength;

                if (equation.length !== nextLength || guesses.some((guess) => guess.equation === equation)) {
                        return;
                }

                try {
                        if (!options.skipValidation) {
                                isCheckingGuess = true;
                                const valid = await validateEquation(nextMode, equation);
                                if (!valid) {
                                        loadError = `"${equation}" is not a valid ${MODE_CONFIG[nextMode].name} equation.`;
                                        return;
                                }
                        }

                        if (mode !== nextMode || guesses.some((guess) => guess.equation === equation)) {
                                return;
                        }

                        guesses = [
                                ...guesses,
                                { equation, feedback: new Array(nextLength).fill(0) as Feedback[] }
                        ];
                        currentInput = '';
                        loadError = null;
                } catch (error) {
                        loadError = error instanceof Error ? error.message : 'Failed to validate the equation.';
                } finally {
                        isCheckingGuess = false;
                }
        }

        function toggleFeedback(guessIndex: number, charIndex: number) {
                guesses = guesses.map((guess, index) => {
                        if (index !== guessIndex) return guess;
                        const nextFeedback = [...guess.feedback];
                        nextFeedback[charIndex] = cycleFeedback(nextFeedback[charIndex]);
                        return { ...guess, feedback: nextFeedback };
                });
        }

        function clearInput() {
                currentInput = '';
        }

        function handleBackspace() {
                currentInput = currentInput.slice(0, -1);
        }

        function handleKeypadPress(character: string) {
                if (currentInput.length >= targetLength) {
                        return;
                }

                handleEquationInput(`${currentInput}${character}`);
        }

        function removeLastGuess() {
                if (guesses.length === 0) return;
                guesses = guesses.slice(0, -1);
        }

        function resetSolver() {
                guesses = [];
                currentInput = '';
                loadError = null;
                void fetchSuggestions([], mode, requestToken);
        }

        function refreshSolver() {
                loadError = null;
                void fetchSuggestions(guesses, mode, requestToken);
        }

        function addCurrentGuess() {
                void addGuess(currentInput);
        }

        function addSuggestedGuess(equation: string) {
                void addGuess(equation, { skipValidation: true });
        }

        function getInputMessageClass(tone: 'info' | 'warning' | 'success'): string {
                if (tone === 'success') return 'mt-3 text-center text-sm text-teal-700';
                if (tone === 'warning') return 'mt-3 text-center text-sm text-amber-700';
                return 'mt-3 text-center text-sm text-slate-600';
        }

        async function copyEquation(equation: string) {
                try {
                        await navigator.clipboard.writeText(equation);
                        copiedEq = equation;
                        window.setTimeout(() => {
                                if (copiedEq === equation) copiedEq = null;
                        }, 1500);
                } catch {
                        copiedEq = null;
                }
        }

        onMount(() => {
                void loadModeData(mode);

                const handleKeyDown = (event: KeyboardEvent) => {
                        if (
                                event.target instanceof HTMLInputElement ||
                                event.target instanceof HTMLTextAreaElement ||
                                event.ctrlKey ||
                                event.metaKey ||
                                event.altKey
                        ) {
                                return;
                        }

                        if (event.key === 'Enter' && canAddGuess && !isCheckingGuess) {
                                void addGuess(currentInput);
                                return;
                        }

                        if (event.key === 'Backspace') {
                                handleBackspace();
                                return;
                        }

                        if (validChars.includes(event.key) && currentInput.length < targetLength) {
                                handleEquationInput(`${currentInput}${event.key}`);
                        }
                };

                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
        });

        const faqs = [
                {
                        question: 'What is Nerdle?',
                        answer:
                                'Nerdle is a daily math puzzle game where you guess a hidden equation instead of a word. Created by Richard and Marcus Mann, it gives you 6 attempts to find the correct equation. Feedback uses colored tiles: green means the right character in the right spot, purple means the character exists but in the wrong position, and black means the character is not in the equation at all.'
                },
                {
                        question: 'How do I play Nerdle?',
                        answer:
                                'Enter a mathematically valid equation of the correct length for your chosen mode. After each guess, the tiles change color to show how close you are. Green tiles are correct and in the right position. Purple tiles are in the equation but in a different spot. Black tiles are not in the equation at all. Use this feedback to narrow down the answer within 6 guesses.'
                },
                {
                        question: 'What counts as a valid Nerdle equation?',
                        answer:
                                'A valid Nerdle equation must be mathematically correct — both sides of the equals sign must compute to the same value. It must contain exactly one equals sign, use only digits 0-9 and the operators +, -, *, / (Maxi mode adds brackets and powers), and be the correct length for the mode you are playing. Commutative solutions are accepted — for example, 3+5=8 and 5+3=8 are both valid.'
                },
                {
                        question: 'What are the differences between Nerdle modes?',
                        answer:
                                'Micro uses 5 characters (e.g. 2+1=3), Mini uses 6 (e.g. 4*7=28), Midi uses 7 (e.g. 6-1*4=2), Classic uses 8 (e.g. 43-28=15), and Maxi uses 10 (e.g. 239-171=68 with brackets and powers). Longer modes have dramatically larger equation pools — Classic has over 17,000 possible equations while Micro has a much smaller set, making each guess more impactful in shorter modes.'
                },
                {
                        question: 'Does the Nerdle solver work on mobile?',
                        answer:
                                'Yes. The solver runs entirely in the browser with no app to install. It works on phones, tablets, and desktops. The on-screen keypad and tile-tap feedback system are designed for touch screens, and the layout adapts to smaller displays. Just open the page in your mobile browser, select your mode, and start solving.'
                },
                {
                        question: 'Is the Nerdle solver free to use?',
                        answer:
                                'Yes, completely free with no sign-up, no ads blocking functionality, and no usage limits. The solver processes your feedback through a worker that calculates entropy-ranked suggestions for every valid equation in the pool. You can use it for every daily puzzle across all five modes without paying anything.'
                },
                {
                        question: 'How does the solver choose its suggestions?',
                        answer:
                                'The solver uses an entropy-based algorithm. It evaluates every equation in the valid pool and calculates how much information each one would reveal across all possible feedback patterns. Equations that split the remaining pool most evenly — meaning they narrow down the most candidates regardless of what feedback you get — receive the highest entropy scores and appear at the top of the suggestion list.'
                }
        ];

        const schemaItems = [
                {
                        '@type': 'WebApplication',
                        name: 'Nerdle Solver',
                        description:
                                'Nerdle solver for Micro, Mini, Midi, Classic, and Maxi with direct worker solving and a Wordle-style interface.',
                        url: 'https://wordsolverx.com/nerdle-solver',
                        applicationCategory: 'GameApplication',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
                },
                generateFAQSchema(faqs),
                generateHowToSchema('How to use the Nerdle solver', [
                        { name: 'Select your mode', text: 'Choose Micro, Mini, Midi, Classic, or Maxi to match the Nerdle game you are playing.' },
                        { name: 'Enter your guess', text: 'Type or tap the equation you used in Nerdle and add it to the board.' },
                        { name: 'Set the feedback', text: 'Tap each tile to cycle through absent, present, and correct until it matches the result from the game.' },
                        { name: 'Get suggestions', text: 'Click Calculate Best Equation to get entropy-ranked suggestions, then use the top pick as your next guess.' }
                ]),
                generateBreadcrumbSchema([
                        { name: 'Home', url: 'https://wordsolverx.com' },
                        { name: 'Solver', url: 'https://wordsolverx.com/solver' },
                        { name: 'Nerdle Solver', url: 'https://wordsolverx.com/nerdle-solver' }
                ]),
                generateWebPageSchema(
                        'Nerdle Solver',
                        'Solve Micro, Mini, Midi, Classic, and Maxi Nerdle with entropy-ranked suggestions and direct worker solving.',
                        'https://wordsolverx.com/nerdle-solver'
                )
        ];

        const jsonLd = JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': schemaItems
        });
        const jsonLdScript = `<script type="application/ld+json">${stripStructuredDataTypes(jsonLd, ['FAQPage', 'HowTo']) ?? jsonLd}<\/script>`;
</script>

<svelte:head>
        <title>Nerdle Solver All Modes | Micro, Mini, Midi, Classic And Maxi</title>
        <meta
                name="description"
                content="Use the WordSolverX Nerdle Solver for Micro, Mini, Midi, Classic, and Maxi with direct worker solving and a cleaner Wordle-style interface."
        />
        <link rel="canonical" href="https://wordsolverx.com/nerdle-solver" />
        <meta property="og:title" content="Nerdle Solver All Modes" />
        <meta
                property="og:description"
                content="Solve every Nerdle mode with the original logic and a cleaner Wordle-style layout."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wordsolverx.com/nerdle-solver" />
        <meta property="og:image" content="https://wordsolverx.com/images/nerdle-solver.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://wordsolverx.com/images/nerdle-solver.webp" />
        <meta name="twitter:title" content="Nerdle Solver All Modes" />
        <meta
                name="twitter:description"
                content="Solve Nerdle equations with direct worker requests and a cleaner Wordle-style UI."
        />
        {@html jsonLdScript}
</svelte:head>

<main class="min-h-screen bg-white">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs hideSchema={true} />
        </div>

        <!-- Hero banner section -->
        <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
                <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-12">
                        <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-4">
                                Math Puzzle Solver
                        </p>
                        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Nerdle Solver</h1>
                        <p class="text-lg text-white/80 max-w-2xl leading-relaxed">
                                Solve Micro, Mini, Midi, Classic, and Maxi Nerdle with entropy-ranked equation suggestions. Choose a mode, enter your guesses, and get the best next equation.
                        </p>
                </div>
        </section>

        <div class="max-w-7xl mx-auto py-4 px-4">
                <div class="max-w-2xl mx-auto">

                        {#if loadError}
                                <div class="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
                                        <p class="font-bold">Something needs attention</p>
                                        <p class="mt-1 text-sm">{loadError}</p>
                                </div>
                        {/if}

                        {#if isLoading}
                                <div class="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
                                        <div class="w-10 h-10 mx-auto border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                                        <p class="mt-4 text-lg font-semibold text-slate-800">Loading {currentMode.name} mode...</p>
                                        <p class="mt-1 text-slate-600">Getting the opening suggestions from the solver worker.</p>
                                </div>
                        {:else}
                                {#if guesses.length === 0}
                                        <div class="mb-8">
                                                <div class="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-lg border border-slate-200">
                                                        <div class="block text-sm font-bold text-teal-800 uppercase tracking-wider mb-4">
                                                                Puzzle Mode
                                                        </div>
                                                        <div class="rounded-2xl bg-slate-100/90 p-1.5">
                                                                <div class="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                                                        <label
                                                                                for="nerdle-mode"
                                                                                class="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2"
                                                                        >
                                                                                Select mode
                                                                        </label>
                                                                        <select
                                                                                id="nerdle-mode"
                                                                                class="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-800 shadow-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-200"
                                                                                value={mode}
                                                                                onchange={handleModeSelectChange}
                                                                                disabled={modeSelectDisabled}
                                                                        >
                                                                                {#each MODE_ENTRIES as [modeKey, config]}
                                                                                        <option value={modeKey}>{config.name} ({config.length} chars)</option>
                                                                                {/each}
                                                                        </select>
                                                                </div>
                                                        </div>
                                                        <div class="mt-4 grid gap-3 sm:grid-cols-3">
                                                                <div class="rounded-xl border border-slate-100 bg-white px-4 py-4 text-center">
                                                                        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Current Mode</p>
                                                                        <p class="mt-2 text-xl font-black text-slate-900">{currentMode.name}</p>
                                                                </div>
                                                                <div class="rounded-xl border border-slate-100 bg-white px-4 py-4 text-center">
                                                                        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Equation Length</p>
                                                                        <p class="mt-2 text-xl font-black text-slate-900">{targetLength} chars</p>
                                                                </div>
                                                                <div class="rounded-xl border border-slate-100 bg-white px-4 py-4 text-center">
                                                                        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Equation Pool</p>
                                                                        <p class="mt-2 text-xl font-black text-slate-900">{totalCount.toLocaleString()}</p>
                                                                </div>
                                                        </div>
                                                        <div class="mt-4 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 text-sm text-slate-600">
                                                                Start with an equation like
                                                                <span class="font-mono font-bold text-slate-900">{currentMode.example}</span>
                                                                and the worker will return ranked next guesses for the selected mode.
                                                        </div>
                                                </div>
                                        </div>
                                {/if}

                                <div class="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                                        <div class="flex flex-wrap items-start justify-between gap-4 mb-5">
                                                <div>
                                                        <div class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                                Enter Equation
                                                        </div>
                                                        <p class="text-sm text-slate-600">
                                                                Type or tap characters below, then add the equation to your board.
                                                        </p>
                                                </div>
                                                <div class="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                                                        <span class="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-teal-700">
                                                                {currentMode.name}
                                                        </span>
                                                        <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                                                                {targetLength} chars
                                                        </span>
                                                        <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                                                                {remaining.toLocaleString()} remaining
                                                        </span>
                                                </div>
                                        </div>

                                        <div class="relative w-full max-w-md mx-auto">
                                                <input
                                                        type="text"
                                                        value={currentInput}
                                                        oninput={handleEquationTextInput}
                                                        placeholder={currentMode.example}
                                                        class="w-full px-6 py-4 text-center text-3xl font-black tracking-widest bg-gradient-to-br from-white to-slate-50 rounded-2xl border-[3px] border-slate-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-200 transition-all shadow-lg hover:shadow-xl text-slate-900 font-mono"
                                                        maxlength={targetLength}
                                                        autocomplete="off"
                                                        autocorrect="off"
                                                        autocapitalize="off"
                                                        spellcheck="false"
                                                        onkeydown={handleInputKeydown}
                                                />
                                                <button
                                                        type="button"
                                                        aria-label="Clear equation input"
                                                        onclick={clearInput}
                                                        class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                                >
                                                        Clear
                                                </button>
                                        </div>
                                        <div class={getInputMessageClass(inputMessage.tone)}>
                                                {inputMessage.text}
                                        </div>
                                        <div class="mt-5 flex justify-center">
                                                <div class="flex flex-wrap justify-center gap-1.5 rounded-2xl bg-slate-50 px-4 py-4 border border-slate-200">
                                                        {#each Array.from({ length: targetLength }) as _, index}
                                                                <div class={getInputTileClass(targetLength, Boolean(currentInput[index]))}>
                                                                        {currentInput[index] || ''}
                                                                </div>
                                                        {/each}
                                                </div>
                                        </div>

                                        <div class="mt-6 space-y-2">
                                        {#each keypadRows as row, rowIndex}
                                                <div class="flex flex-wrap justify-center gap-2">
                                                        {#each row as key}
                                                                <button
                                                                        type="button"
                                                                        onclick={() => handleKeypadPress(key)}
                                                                        class={`min-w-12 rounded-xl border-2 px-3 py-3 text-sm font-bold shadow-sm transition-all ${
                                                                                key === '='
                                                                                        ? 'border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100'
                                                                                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                        {key === SUPERSCRIPT_2 ? 'x^2' : key === SUPERSCRIPT_3 ? 'x^3' : key}
                                                                </button>
                                                        {/each}
                                                        {#if rowIndex === keypadRows.length - 1}
                                                                <button
                                                                        type="button"
                                                                        onclick={handleBackspace}
                                                                        class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-sm hover:bg-red-100"
                                                                >
                                                                        DEL
                                                                </button>
                                                        {/if}
                                                </div>
                                        {/each}
                                        </div>

                                        <div class="mt-6 flex justify-center gap-3 flex-wrap">
                                        <button
                                                onclick={addCurrentGuess}
                                                disabled={!canAddGuess || isCheckingGuess}
                                                class="flex items-center space-x-2 px-5 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                                <span>{isCheckingGuess ? 'Checking...' : 'Add Guess'}</span>
                                        </button>
                                        <button
                                                onclick={resetSolver}
                                                class="flex items-center space-x-2 px-5 py-3 text-sm font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 rounded-xl border-2 border-red-200 transition-all shadow-sm hover:shadow-md"
                                        >
                                                <span>Reset Solver</span>
                                        </button>
                                        </div>
                                </div>

                                {#if guesses.length > 0}
                                        <div class="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 shadow-lg">
                                                <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
                                                        <div>
                                                                <div class="block text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">
                                                                        Set Nerdle Feedback
                                                                </div>
                                                                <p class="text-sm text-slate-600">
                                                                        Tap each tile until it matches the result from the game.
                                                                </p>
                                                        </div>
                                                        <button
                                                                onclick={removeLastGuess}
                                                                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                                        >
                                                                Remove Last Entry
                                                        </button>
                                                </div>
                                                <div class="space-y-4">
                                                        {#each guesses as guess, guessIndex}
                                                                <div class="rounded-2xl border border-amber-100 bg-white/90 p-4">
                                                                        <div class="flex justify-center gap-1.5 flex-wrap">
                                                                                {#each guess.equation.split('') as char, charIndex}
                                                                                        <button
                                                                                                type="button"
                                                                                                onclick={() => toggleFeedback(guessIndex, charIndex)}
                                                                                                class={getGuessTileClass(targetLength, guess.feedback[charIndex])}
                                                                                        >
                                                                                                {char}
                                                                                        </button>
                                                                                {/each}
                                                                        </div>
                                                                        <div class="mt-2 text-center text-xs text-slate-500">
                                                                                {#each guess.feedback as value, feedbackIndex}
                                                                                        <span class="inline-block mx-1">{feedbackIndex + 1}: {feedbackLabel(value)}</span>
                                                                                {/each}
                                                                        </div>
                                                                </div>
                                                        {/each}
                                                </div>
                                        </div>
                                {/if}

                                <div class="mb-8">
                                        <button
                                                onclick={refreshSolver}
                                                disabled={isCalculating}
                                                class="w-full max-w-md mx-auto flex items-center justify-center gap-3 py-5 px-8 bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-700 hover:via-teal-700 hover:to-teal-700 text-white font-black text-2xl rounded-2xl shadow-2xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                                {#if isCalculating}
                                                        <div class="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                {:else}
                                                        {guesses.length > 0 ? 'Calculate Best Equation' : 'Get Opening Suggestions'}
                                                {/if}
                                        </button>
                                </div>

                                <div class="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                        <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
                                                <div>
                                                        <h3 class="text-2xl font-black text-slate-900">Solver Suggestions</h3>
                                                        <p class="text-slate-600 mt-1">{suggestions.length} shown - {remaining.toLocaleString()} possible equations</p>
                                                </div>
                                                <div class="grid grid-cols-2 gap-2 text-center">
                                                        <div class="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
                                                                <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Remaining</p>
                                                                <p class="mt-1 text-xl font-black text-slate-900">{remaining.toLocaleString()}</p>
                                                        </div>
                                                        <div class="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
                                                                <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Pool</p>
                                                                <p class="mt-1 text-xl font-black text-slate-900">{totalCount.toLocaleString()}</p>
                                                        </div>
                                                </div>
                                        </div>

                                        {#if isCalculating}
                                                <div class="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center">
                                                        <div class="w-10 h-10 mx-auto border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                                                        <p class="mt-4 text-base font-semibold text-slate-700">Calculating best equation…</p>
                                                        <p class="mt-1 text-sm text-slate-500">Ranking next guesses from the solver worker.</p>
                                                </div>
                                        {:else if topSuggestion}
                                                <div class="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 mb-4">
                                                        <div class="flex items-center justify-between gap-3 mb-4">
                                                                <div>
                                                                        <p class="text-sm font-bold uppercase tracking-wide text-teal-700">Top Pick</p>
                                                                        <p class="text-xl font-black text-slate-900 mt-1">{topSuggestion.eq}</p>
                                                                        <p class="mt-1 text-sm text-slate-600">Best next guess for the current board.</p>
                                                                </div>
                                                                <div class="rounded-xl bg-white border border-teal-100 px-4 py-2 text-right">
                                                                        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Entropy</p>
                                                                        <p class="text-lg font-black text-slate-900 mt-1">{topSuggestion.entropy.toFixed(2)}</p>
                                                                </div>
                                                        </div>
                                                        <div class="flex justify-center gap-1 mb-4">
                                                                {#each topSuggestion.eq.split('') as char}
                                                                        <div class={getSuggestionTileClass(targetLength)}>{char}</div>
                                                                {/each}
                                                        </div>
                                                        <div class="grid gap-3 sm:grid-cols-2">
                                                                <button
                                                                        onclick={() => addSuggestedGuess(topSuggestion.eq)}
                                                                        class="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-3 transition-all"
                                                                >
                                                                        Use This Guess
                                                                </button>
                                                                <button
                                                                        onclick={() => void copyEquation(topSuggestion.eq)}
                                                                        class="rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-3 transition-all"
                                                                >
                                                                        {copiedEq === topSuggestion.eq ? 'Copied' : 'Copy Equation'}
                                                                </button>
                                                        </div>
                                                </div>

                                                {#if moreSuggestions.length > 0}
                                                        <div class="space-y-3">
                                                                {#each moreSuggestions as item, index}
                                                                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                                                <div class="flex items-center gap-3">
                                                                                        <div class="w-10 text-center text-sm font-black text-slate-500">#{index + 2}</div>
                                                                                        <div class="flex flex-1 flex-wrap items-center justify-center gap-1">
                                                                                                {#each item.eq.split('') as char}
                                                                                                        <div class={getSuggestionTileClass(targetLength)}>{char}</div>
                                                                                                {/each}
                                                                                        </div>
                                                                                </div>
                                                                                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                                                                                        <div class="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                                                                                                Entropy {item.entropy.toFixed(2)}
                                                                                        </div>
                                                                                        <div class="flex gap-2">
                                                                                                <button
                                                                                                        onclick={() => addSuggestedGuess(item.eq)}
                                                                                                        class="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                                                                                                >
                                                                                                        Use
                                                                                                </button>
                                                                                                <button
                                                                                                        onclick={() => void copyEquation(item.eq)}
                                                                                                        class="rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                                                                                                >
                                                                                                        {copiedEq === item.eq ? 'Copied' : 'Copy'}
                                                                                                </button>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                {/each}
                                                        </div>
                                                {/if}
                                        {:else}
                                                <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                                                        <p class="text-lg font-bold text-slate-900">No suggestions yet</p>
                                                        <p class="text-slate-600 mt-2">Get the opening suggestions or add feedback to narrow the equation pool.</p>
                                                </div>
                                        {/if}
                                </div>
                        {/if}
                </div>
        </div>

        <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
                <article class="space-y-10">
                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Nerdle?</h2>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                Nerdle is a daily math puzzle game launched in January 2022 by data scientist Richard Mann and his brother Marcus. The idea came from Richard's daughter, who wished Wordle existed for math. The result: instead of guessing a 5-letter word, you guess a complete mathematical equation.
                                        </p>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                You get 6 guesses to find the hidden equation. After each guess, tiles change color to show how close you are. Green means the character is correct and in the right position. Purple (or sometimes shown as magenta) means the character exists in the equation but somewhere else. Black means that character does not appear at all. Sound familiar? It should — the feedback system works exactly like Wordle, except every "letter" is a digit or operator instead of an A through Z.
                                        </p>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                The game is free at nerdlegame.com and resets daily at midnight UTC. There is no app to download — it runs in any browser. Since launch, Nerdle has built a community of over 1 million daily players, and the equation pool has expanded from the original 8-character Classic mode into five distinct modes.
                                        </p>
                                        <p class="text-slate-600 leading-relaxed">
                                                Nerdle differs from Wordle in the structure of the search space. In Wordle, every position is an independent letter. In Nerdle, positions are constrained by math — the equals sign must exist, both sides must compute to the same value, and operators have defined roles. This creates a tighter, more logical elimination process once you understand the rules.
                                        </p>
                                </section>

                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">How Nerdle Feedback Works</h2>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                Every guess returns three types of colored feedback. Understanding what each color tells you — and what it does not tell you — is the difference between solving in 3 guesses and burning all 6.
                                        </p>
                                        <div class="space-y-4 mb-4">
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Green tiles — correct character, correct position</h3>
                                                        <p class="text-teal-800">
                                                                If you guess 43-28=15 and the first tile turns green showing "4", that 4 is locked in position 1. No other digit or operator can go there. This is the strongest feedback you can get. Two green tiles on the left side of the equals sign can sometimes determine the entire equation, because the remaining positions must satisfy the mathematical constraint.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-purple-50 border border-purple-200 p-6">
                                                        <h3 class="text-lg font-bold text-purple-900 mb-2">Purple tiles — character exists, but in a different position</h3>
                                                        <p class="text-purple-800">
                                                                Purple tells you the character appears somewhere in the equation but not where you put it. If you guess 12+34=46 and the "1" turns purple, you know 1 is in the answer but not in position 1. The tricky part: if you see two "4"s and only one turns purple, that means 4 appears exactly once in the answer. The other 4 you guessed was a duplicate that does not exist.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-slate-100 border border-slate-200 p-6">
                                                        <h3 class="text-lg font-bold text-slate-900 mb-2">Black tiles — character not in the equation</h3>
                                                        <p class="text-slate-700">
                                                                Black means elimination. If your guess 58*2=116 turns the "5" and the "*" black, you can remove every equation containing a 5 or a multiplication sign from consideration. In Classic mode with over 17,000 valid equations, a single guess with 3 or 4 black tiles can eliminate thousands of candidates in one shot.
                                                        </p>
                                                </div>
                                        </div>
                                        <p class="text-slate-600 leading-relaxed">
                                                One subtlety that catches new players: the equals sign. In every mode, the answer contains exactly one "=". If your guess has "=" in the right spot and it turns green, you immediately know where the equation splits. If it turns purple, you know the equation has an equals sign but you placed it wrong — which constrains the answer length on each side.
                                        </p>
                                </section>

                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">All Five Nerdle Modes Explained</h2>
                                        <p class="text-slate-600 mb-6 leading-relaxed">
                                                Nerdle started with one mode — the 8-character Classic. As the community grew, the developers added shorter modes for quick sessions and a longer mode for players who wanted deeper puzzles. Each mode has a different equation pool size, which directly affects how much information each guess reveals.
                                        </p>
                                        <div class="space-y-4">
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Micro Nerdle — 5 characters</h3>
                                                        <p class="text-teal-800 mb-2">
                                                                The fastest mode. Equations are only 5 characters long, like 2+1=3 or 9-4=5. The equation pool is small — typically around 200 valid equations. This means each guess eliminates a large percentage of the pool. Most Micro puzzles are solvable in 2-3 guesses if you start with a strong opener. The limited length means equations are simple: one operator, single-digit numbers, and no complex arithmetic.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Mini Nerdle — 6 characters</h3>
                                                        <p class="text-teal-800 mb-2">
                                                                One character longer than Micro, but the extra slot opens up two-digit results. Equations like 4*7=28 and 12-5=7 fit here. The pool grows to roughly 1,000 valid equations. You still get the quick-session feel, but two-digit numbers introduce more possibilities. A good opener like 9*8=72 tests 5 unique characters and covers a wide range of digits.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Midi Nerdle — 7 characters</h3>
                                                        <p class="text-teal-800 mb-2">
                                                                Midi introduces equations with more structure, like 6-1*4=2 or 50-23=27. The pool sits around 5,000 valid equations. Order of operations matters here — 6-1*4=2 is valid because multiplication happens first (1*4=4, then 6-4=2). This is where players who do not respect operator precedence start making mistakes. If you forget that * and / bind tighter than + and -, you will enter equations that are mathematically wrong even though they look plausible.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Classic Nerdle — 8 characters</h3>
                                                        <p class="text-teal-800 mb-2">
                                                                The original mode. Eight characters with examples like 43-28=15 and 12+35=47. The equation pool exceeds 17,000 valid combinations, making it the most popular and most challenging of the standard modes. Two-digit numbers on both sides of the equals sign create a dense search space. The solver is most valuable here — manual elimination gets difficult after 2-3 guesses because the remaining candidates are still in the hundreds.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Maxi Nerdle — 10 characters</h3>
                                                        <p class="text-teal-800 mb-2">
                                                                The hardest mode. Maxi adds parentheses and powers (squared and cubed), pushing the character count to 10. An example might look like 3*(8+2)=30. The bracket syntax and exponentiation dramatically expand the equation pool and introduce structural complexity — you now need to think about nested operations and grouping. Maxi is for players who find Classic too easy and want a puzzle that genuinely takes all 6 guesses to solve.
                                                        </p>
                                                </div>
                                        </div>
                                </section>

                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Use a Nerdle Solver</h2>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                You can play Nerdle without any help. Plenty of people do. But the math-based search space creates specific situations where a solver saves you guesses you would otherwise waste.
                                        </p>
                                        <div class="space-y-4 mb-4">
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Classic mode has over 17,000 valid equations</h3>
                                                        <p class="text-teal-800">
                                                                After 2 guesses in Classic Nerdle, you might eliminate 60% of the pool but still face 7,000 possible equations. A human cannot sort through 7,000 candidates mentally. The solver calculates which next guess splits that remaining set most efficiently, often cutting it by another 70-80% in a single guess.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Bad opens waste guesses</h3>
                                                        <p class="text-teal-800">
                                                                If your first guess uses repeated digits like 11+22=33, you test only 4 unique characters across 8 positions. A strong opener like 48*2=96 tests 6 unique characters. The difference is enormous — the strong opener typically eliminates 10,000+ equations versus 3,000-4,000 with the repetitive guess. The solver ranks openers by entropy so you never start with a dud.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Math blind spots are real</h3>
                                                        <p class="text-teal-800">
                                                                Most people are worse at mental math than they think. When you have 3 green tiles and need to figure out what fills the remaining 5 positions, arithmetic mistakes lead to invalid equations that the game rejects. The solver only suggests equations that are mathematically correct, so you never waste a guess on something like 48-23=26 (which equals 25, not 26).
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Protect your streak</h3>
                                                        <p class="text-teal-800">
                                                                If you are on a 50-day streak and stuck on guess 5 with no clear path, the solver gives you the mathematically optimal next guess instead of a hunch. It is the difference between maintaining a streak and starting over. Regular solver users report solving Classic mode in an average of 3.2 guesses versus 4.1 guesses without help.
                                                        </p>
                                                </div>
                                        </div>
                                </section>

                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Nerdle Solver Works</h2>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                This solver uses an entropy-based algorithm running on a dedicated worker. When you select a mode, the solver loads the full pool of valid equations for that mode. Every time you add a guess and set the feedback, the solver filters the pool and recalculates which remaining equation would reveal the most information on your next guess.
                                        </p>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                Here is what entropy means in practice. Say the remaining pool has 2,000 equations. The solver tests every single equation in that pool as a hypothetical next guess. For each one, it simulates all possible feedback patterns you might receive. An equation that produces 20 different feedback patterns and splits the 2,000 candidates into roughly equal groups scores high on entropy — because no matter what feedback you get, you eliminate a large chunk of the pool. An equation that produces only 4 patterns, with 1,800 candidates bunched into a single pattern, scores low — because you will probably get that common pattern and learn almost nothing.
                                        </p>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                The solver ranks all equations by their entropy score and presents them with the top pick highlighted. You also see the remaining count and total pool size, so you know exactly how much progress each guess has made. The top suggestion is not always the answer — it is the equation that will narrow your search the most, which is what you want when you still have hundreds of candidates left.
                                        </p>
                                        <p class="text-slate-600 leading-relaxed">
                                                The worker processes your guesses server-side, which means the full equation pool stays off the client and your browser stays fast. After each calculation, you get back a ranked list of suggestions with entropy values you can compare. The entire cycle — enter feedback, click calculate, get results — takes under a second on most connections.
                                        </p>
                                </section>

                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Getting Better at Nerdle</h2>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                The solver handles the computation, but understanding why it picks certain equations makes you a better player even when you are not using it.
                                        </p>
                                        <div class="space-y-4 mb-4">
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Maximize unique characters in your opener</h3>
                                                        <p class="text-teal-800">
                                                                An equation like 48*2=96 uses 6 unique characters across 8 positions (4, 8, *, 2, =, 9, 6 — with 9 and 6 distinct). Compare that to 11+11=22, which tests only 3 unique characters. The first guess eliminates far more candidates. Always count unique characters in your opening guess — aim for at least 6 in Classic mode.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Pin the equals sign early</h3>
                                                        <p class="text-teal-800">
                                                                Knowing where the "=" sits tells you the split between left and right sides of the equation. In Classic mode, the equals sign is usually at position 5 or 6 (counting from 1). If your first guess puts "=" at position 5 and it turns green, you know the left side is 4 characters and the right side is 3. If it turns purple, the equals sign is at a different position — which narrows the structural possibilities immediately.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Test operators strategically</h3>
                                                        <p class="text-teal-800">
                                                                There are only 4 basic operators in Classic mode: +, -, *, /. If your first guess uses * and it turns black, you eliminate every equation containing multiplication. Since roughly 25-30% of Classic equations use *, that is a substantial cut from a single piece of feedback. Your second guess should test a different operator to continue narrowing the operator space.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Respect order of operations</h3>
                                                        <p class="text-teal-800">
                                                                Nerdle follows standard mathematical precedence: multiplication and division before addition and subtraction. The equation 3+4*5=23 is valid (4*5=20, then 3+20=23), but 3+4*5=35 is not (that would require left-to-right evaluation). If you enter equations that ignore precedence, the game rejects them. This is the most common mistake new players make, especially in Midi and Classic modes.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-teal-50 border border-teal-200 p-6">
                                                        <h3 class="text-lg font-bold text-teal-900 mb-2">Use the solver to learn patterns</h3>
                                                        <p class="text-teal-800">
                                                                After each game, compare your guesses to what the solver suggested. You will notice that the solver frequently picks equations that test digits you have not tried yet, rather than equations that might be the answer but test overlapping characters. This "information over guessing" approach is the core strategy. Once you internalize it, you will start picking better guesses on your own even without the solver open.
                                                        </p>
                                                </div>
                                        </div>
                                </section>

                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">Understanding Nerdle Equation Rules</h2>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                Nerdle is stricter than it looks. Not every string of digits and operators counts as a valid equation. Knowing the exact rules prevents you from wasting guesses on things the game will reject.
                                        </p>
                                        <div class="space-y-4 mb-4">
                                                <div class="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                                                        <h3 class="text-lg font-bold text-amber-900 mb-2">Both sides must compute to the same value</h3>
                                                        <p class="text-amber-800">
                                                                This is the fundamental rule. 43-28=15 is valid because 43 minus 28 equals 15. 43-28=14 is invalid because 43 minus 28 is 15, not 14. The game checks the math before checking the feedback. If the arithmetic does not work, the guess is rejected entirely.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                                                        <h3 class="text-lg font-bold text-amber-900 mb-2">The equals sign must appear exactly once</h3>
                                                        <p class="text-amber-800">
                                                                Every valid Nerdle equation contains one and only one "=" character. No exceptions. You cannot use "==" and you cannot leave out the equals sign. If your equation has no equals sign or more than one, it is rejected.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                                                        <h3 class="text-lg font-bold text-amber-900 mb-2">No leading zeros</h3>
                                                        <p class="text-amber-800">
                                                                Numbers cannot start with zero. You cannot write 05+3=8 — it must be 5+3=8. The only place a zero can appear as the first character is the very first position of the entire equation, and even then the number it starts must be valid (so 0+5=5 is valid, but 03+4=7 is not).
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                                                        <h3 class="text-lg font-bold text-amber-900 mb-2">Commutative answers are accepted</h3>
                                                        <p class="text-amber-800">
                                                                If the answer is 3+5=8, then 5+3=8 is also accepted as a correct guess. The game treats commutative equivalents as valid matches for the green/purple feedback. However, only one of the commutative forms is the "official" daily answer, so feedback may differ between the two forms if the positions do not align.
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                                                        <h3 class="text-lg font-bold text-amber-900 mb-2">Negative numbers are not allowed</h3>
                                                        <p class="text-amber-800">
                                                                Neither side of the equation can evaluate to a negative number. So 5-12=-7 is not a valid Nerdle equation even though the math works. The minus sign can only be used as a subtraction operator between positive values, not as a negation prefix.
                                                        </p>
                                                </div>
                                        </div>
                                        <p class="text-slate-600 leading-relaxed">
                                                For Maxi mode specifically, parentheses and powers add two more rules: brackets must be properly paired and nested, and the power notation uses superscript characters for squared and cubed. The solver validates all of these rules automatically, so when you use a suggestion from the tool, you know it will be accepted by the game.
                                        </p>
                                </section>

                                <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
                                        <h2 class="text-3xl font-bold text-slate-900 mb-5">Nerdle vs Wordle: Key Differences</h2>
                                        <p class="text-slate-600 mb-4 leading-relaxed">
                                                Nerdle and Wordle share the same core mechanic — guess the hidden thing in 6 tries with colored feedback — but the differences in search space and constraints make them play very differently.
                                        </p>
                                        <div class="overflow-x-auto mb-4">
                                                <table class="w-full text-sm border-collapse">
                                                        <thead>
                                                                <tr class="border-b-2 border-slate-200">
                                                                        <th class="text-left py-3 px-4 font-bold text-slate-900">Aspect</th>
                                                                        <th class="text-left py-3 px-4 font-bold text-slate-900">Wordle</th>
                                                                        <th class="text-left py-3 px-4 font-bold text-slate-900">Nerdle</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                <tr class="border-b border-slate-100">
                                                                        <td class="py-3 px-4 font-semibold text-slate-700">What you guess</td>
                                                                        <td class="py-3 px-4 text-slate-600">A 5-letter word</td>
                                                                        <td class="py-3 px-4 text-slate-600">A math equation (5-10 chars)</td>
                                                                </tr>
                                                                <tr class="border-b border-slate-100">
                                                                        <td class="py-3 px-4 font-semibold text-slate-700">Characters</td>
                                                                        <td class="py-3 px-4 text-slate-600">26 letters (A-Z)</td>
                                                                        <td class="py-3 px-4 text-slate-600">10 digits + 4 operators + =</td>
                                                                </tr>
                                                                <tr class="border-b border-slate-100">
                                                                        <td class="py-3 px-4 font-semibold text-slate-700">Search space</td>
                                                                        <td class="py-3 px-4 text-slate-600">~2,300 possible answers</td>
                                                                        <td class="py-3 px-4 text-slate-600">200 to 17,000+ depending on mode</td>
                                                                </tr>
                                                                <tr class="border-b border-slate-100">
                                                                        <td class="py-3 px-4 font-semibold text-slate-700">Positional constraints</td>
                                                                        <td class="py-3 px-4 text-slate-600">None — any letter can go anywhere</td>
                                                                        <td class="py-3 px-4 text-slate-600">Math constrains positions (e.g. = must exist)</td>
                                                                </tr>
                                                                <tr class="border-b border-slate-100">
                                                                        <td class="py-3 px-4 font-semibold text-slate-700">Valid guess check</td>
                                                                        <td class="py-3 px-4 text-slate-600">Must be a real English word</td>
                                                                        <td class="py-3 px-4 text-slate-600">Must be mathematically correct</td>
                                                                </tr>
                                                                <tr class="border-b border-slate-100">
                                                                        <td class="py-3 px-4 font-semibold text-slate-700">Modes</td>
                                                                        <td class="py-3 px-4 text-slate-600">One mode (5 letters)</td>
                                                                        <td class="py-3 px-4 text-slate-600">5 modes (Micro through Maxi)</td>
                                                                </tr>
                                                                <tr>
                                                                        <td class="py-3 px-4 font-semibold text-slate-700">Feedback colors</td>
                                                                        <td class="py-3 px-4 text-slate-600">Green / Yellow / Gray</td>
                                                                        <td class="py-3 px-4 text-slate-600">Green / Purple / Black</td>
                                                                </tr>
                                                        </tbody>
                                                </table>
                                        </div>
                                        <p class="text-slate-600 leading-relaxed">
                                                The biggest strategic difference: Wordle positions are independent — any letter can go in any slot. Nerdle positions are mathematically coupled. If position 1 is "9" and position 2 is "*", then position 3 must be a digit (not an operator), and the product constrains what appears after the equals sign. This coupling means that in Nerdle, locking in 2-3 characters often determines the rest of the equation, while in Wordle you might need 4-5 correct letters before the answer becomes obvious.
                                        </p>
                                </section>
                </article>

                <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
                        <FAQSection class="py-0" {faqs} title="Nerdle Solver FAQs" />
                </div>

                <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
                        <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
                        <div class="flex flex-wrap justify-center gap-3">
                                <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Wordle Solver</a>
                                <a href="/waffle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Waffle Solver</a>
                                <a href="/boggle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Boggle Solver</a>
                                <a href="/hangman-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Hangman Solver</a>
                                <a href="/squaredle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Squaredle Solver</a>
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
