<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import { onMount } from 'svelte';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import { browser } from '$app/environment';
        import { generateBreadcrumbSchema, generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
        import type { Artist, AttributeFeedback, FeedbackType, Guess } from '$lib/soundmap/types';

        type SoundmapAlgorithm = Pick<
                typeof import('$lib/soundmap/algorithm'),
                'filterCandidates' | 'findBestGuess' | 'getRecommendedFirstGuesses'
        >;

        type SoundmapRuntime = {
                artists: Artist[];
                algorithm: SoundmapAlgorithm;
        };

        let soundmapRuntimePromise: Promise<SoundmapRuntime> | null = null;

        const defaultFeedback: AttributeFeedback = {
                debut: 'wrong',
                popularity: 'wrong',
                members: 'wrong',
                genre: 'wrong',
                country: 'wrong',
                gender: 'wrong'
        };

        let artists = $state<Artist[]>([]);
        let searchQuery = $state('');
        let showDropdown = $state(false);
        let selectedArtist = $state<Artist | null>(null);
        let guesses = $state<Guess[]>([]);
        let currentFeedback = $state<AttributeFeedback>({ ...defaultFeedback });
        let solverLoading = $state(false);
        let runtimeError = $state<string | null>(null);
        let darkMode = $state(true);
        let showBestGuess = $state(true);
        let showHelp = $state(false);
        let showCandidates = $state(true);
        let notice = $state<string | null>(null);
        let searchRef: HTMLDivElement | null = null;
        let soundmapRuntime = $state<SoundmapRuntime | null>(null);
        let guideFeedback = $state({
                debut: 'wrong' as FeedbackType,
                popularity: 'wrong' as FeedbackType,
                country: 'wrong' as FeedbackType
        });
        let guideActive = $state<'debut' | 'popularity' | 'country'>('debut');

        function loadSoundmapRuntime(): Promise<SoundmapRuntime> {
                if (!soundmapRuntimePromise) {
                        soundmapRuntimePromise = Promise.all([
                                import('$lib/data/soundmap-artists.json'),
                                import('$lib/soundmap/algorithm')
                        ]).then(([artistsModule, algorithm]) => ({
                                artists: artistsModule.default as Artist[],
                                algorithm: {
                                        filterCandidates: algorithm.filterCandidates,
                                        findBestGuess: algorithm.findBestGuess,
                                        getRecommendedFirstGuesses: algorithm.getRecommendedFirstGuesses
                                }
                        }));
                }

                return soundmapRuntimePromise;
        }

        async function ensureSoundmapRuntime(): Promise<SoundmapRuntime | null> {
                if (soundmapRuntime) return soundmapRuntime;

                solverLoading = true;
                runtimeError = null;

                try {
                        const runtime = await loadSoundmapRuntime();
                        soundmapRuntime = runtime;
                        artists = runtime.artists;
                        return runtime;
                } catch {
                        runtimeError = 'Failed to load the Soundmap artist database.';
                        return null;
                } finally {
                        solverLoading = false;
                }
        }

        function prepareSoundmapRuntime() {
                if (!soundmapRuntime && !solverLoading) {
                        void ensureSoundmapRuntime();
                }
        }

        const filteredArtists = $derived.by(() => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) return [];
                return artists.filter((artist) => artist.name.toLowerCase().includes(query)).slice(0, 8);
        });

        const candidates = $derived.by(() =>
                soundmapRuntime ? soundmapRuntime.algorithm.filterCandidates(artists, guesses) : []
        );

        const bestGuess = $derived.by(() => {
                if (!soundmapRuntime || !showBestGuess || guesses.length === 0) return null;
                const previous = guesses.map((guess) => guess.artist.name);
                return soundmapRuntime.algorithm.findBestGuess(artists, candidates, previous);
        });

        const recommendedGuesses = $derived.by(() =>
                soundmapRuntime ? soundmapRuntime.algorithm.getRecommendedFirstGuesses(artists) : []
        );

        const hasWon = $derived(candidates.length === 1 && guesses.length > 0);

        const feedbackMeta: Record<
                FeedbackType,
                { label: string; className: string; icon: string }
        > = {
                correct: { label: 'Correct', className: 'bg-teal-500 text-white', icon: 'OK' },
                close: { label: 'Close', className: 'bg-amber-500 text-white', icon: '~' },
                earlier: { label: 'Earlier', className: 'bg-blue-500 text-white', icon: 'v' },
                later: { label: 'Later', className: 'bg-blue-500 text-white', icon: '^' },
                higher: { label: 'Higher', className: 'bg-purple-500 text-white', icon: '^' },
                lower: { label: 'Lower', className: 'bg-purple-500 text-white', icon: 'v' },
                wrong: { label: 'Wrong', className: 'bg-slate-400 text-white', icon: 'X' }
        };

        function getCycleOrder(field: keyof AttributeFeedback): FeedbackType[] {
                if (field === 'debut') return ['wrong', 'correct', 'close', 'earlier', 'later'];
                if (field === 'popularity') return ['wrong', 'correct', 'close', 'higher', 'lower'];
                if (field === 'country') return ['wrong', 'correct', 'close'];
                return ['wrong', 'correct'];
        }

        function cycleFeedback(field: keyof AttributeFeedback) {
                const order = getCycleOrder(field);
                const current = currentFeedback[field];
                const index = order.indexOf(current);
                const nextValue = order[(index + 1) % order.length];
                currentFeedback = { ...currentFeedback, [field]: nextValue };
        }

        function cycleGuide(field: keyof typeof guideFeedback) {
                const order = getCycleOrder(field);
                const current = guideFeedback[field];
                const index = order.indexOf(current);
                const nextValue = order[(index + 1) % order.length];
                guideFeedback = { ...guideFeedback, [field]: nextValue };
        }

        function runGuideStep(field: 'debut' | 'popularity' | 'country') {
                guideActive = field;
                cycleGuide(field);
        }

        function setNotice(message: string) {
                notice = message;
                setTimeout(() => {
                        notice = null;
                }, 2000);
        }

        function selectArtist(artist: Artist) {
                selectedArtist = artist;
                searchQuery = artist.name;
                showDropdown = false;
                currentFeedback = { ...defaultFeedback };
        }

        function addGuess() {
                const artist = selectedArtist;
                if (!artist) return;
                if (guesses.some((guess) => guess.artist.name === artist.name)) {
                        setNotice('Already guessed this artist.');
                        return;
                }
                guesses = [...guesses, { artist, feedback: { ...currentFeedback } }];
                selectedArtist = null;
                searchQuery = '';
                showDropdown = false;
                currentFeedback = { ...defaultFeedback };
        }

        function resetGame() {
                guesses = [];
                selectedArtist = null;
                searchQuery = '';
                showDropdown = false;
                currentFeedback = { ...defaultFeedback };
        }

        function useBestGuess() {
                if (bestGuess) {
                        selectArtist(bestGuess);
                }
        }

        function buildGuessSummary(guess: Guess) {
                return [
                        { label: 'Debut', value: guess.artist.debut, feedback: guess.feedback.debut },
                        { label: 'Pop', value: `#${guess.artist.popularity}`, feedback: guess.feedback.popularity },
                        { label: 'Members', value: guess.artist.members, feedback: guess.feedback.members },
                        { label: 'Genre', value: guess.artist.genre, feedback: guess.feedback.genre },
                        { label: 'Country', value: guess.artist.country, feedback: guess.feedback.country },
                        { label: 'Gender', value: guess.artist.gender, feedback: guess.feedback.gender }
                ];
        }

        onMount(() => {
                if (browser) {
                        const saved = localStorage.getItem('soundmap-dark-mode');
                        if (saved !== null) darkMode = saved === 'true';
                }

                const handleClickOutside = (event: MouseEvent) => {
                        if (searchRef && !searchRef.contains(event.target as Node)) {
                                showDropdown = false;
                        }
                };
                document.addEventListener('mousedown', handleClickOutside);
                return () => {
                        document.removeEventListener('mousedown', handleClickOutside);
                };
        });

        $effect(() => {
                if (browser) {
                        localStorage.setItem('soundmap-dark-mode', String(darkMode));
                }
        });

        const faqs = [
                {
                        question: 'What is the Soundmap Solver?',
                        answer:
                                'Soundmap Solver is a free tool that helps you solve the Soundmap Artist Guesser game. You enter each artist you guess and mark the feedback the game gives you. The solver filters the full artist database and shows you which artists still fit.'
                },
                {
                        question: 'How does the feedback system work?',
                        answer:
                                'For each attribute — debut year, popularity, members, genre, country, gender — click the feedback button to cycle through: Wrong, Correct, Close, and directional hints (Earlier/Later or Higher/Lower). Match what the game shows you, then add the guess.'
                },
                {
                        question: 'Does the solver work for every artist?',
                        answer:
                                'The solver includes the complete Soundmap artist database. Every time you add a guess with feedback, it recalculates all remaining candidates and suggests the best next guess.'
                },
                {
                        question: 'Is this tool free to use?',
                        answer: 'Yes, the Soundmap Solver is completely free with no login required.'
                },
                {
                        question: 'What does "Close" mean for country?',
                        answer: 'Close for the country attribute means the target artist is from a nearby region, not the exact same country as your guess. For example, guessing a French artist when the answer is Italian might return Close.'
                },
                {
                        question: 'What is the best first guess in Soundmap?',
                        answer: 'The solver calculates recommended first guesses based on which artists split the remaining candidate pool most evenly. These are shown in the Recommended First Guesses section when you have not yet added any guess.'
                },
                {
                        question: 'Why does my candidate count not go to 1?',
                        answer: 'If multiple artists share very similar attributes (same debut year, genre, country), the feedback you receive may not distinguish between them. Keep guessing the recommended artist to eliminate candidates one by one.'
                },
        ];

        const jsonLdSchema = JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                        generateWebPageSchema(
                                'Soundmap Solver - Artist Guesser Helper | WordSolverX',
                                'Solve Soundmap Artist Guesser faster with the Soundmap Solver. Filter artists by debut year, popularity, genre, country, and more.',
                                'https://wordsolverx.com/soundmap-solver',
                                { image: 'https://wordsolverx.com/images/soundmap-solver.webp' }
                        ),
                        generateSoftwareApplicationSchema('Soundmap Solver', 'GameApplication'),
                        generateFAQSchema(faqs),
                        generateHowToSchema('How to use the Soundmap Solver', [
                                { name: 'Search for an artist', text: 'Type any artist name you guessed in the Soundmap game into the search box and select the correct match from the dropdown.' },
                                { name: 'Set the feedback for each attribute', text: 'For each category shown — debut year, popularity, members, genre, country, gender — click the button to cycle through Wrong, Correct, Close, and directional hints until it matches what the game returned.' },
                                { name: 'Add the guess', text: 'Click Add Guess. The solver instantly filters the candidate list to only artists that fit all the feedback you just entered.' },
                                { name: 'Use the best next guess', text: 'If you have added at least one guess, the solver recommends the best next artist to maximize information. Click Use Guess to auto-fill it.' },
                        ]),
                generateBreadcrumbSchema([
                        { name: 'Home', url: 'https://wordsolverx.com' },
                        { name: 'Soundmap Solver', url: 'https://wordsolverx.com/soundmap-solver' },
                ]),
                ],
        });

</script>

<svelte:head>
        <title>Soundmap Solver - Artist Guesser Helper | WordSolverX</title>
        <meta
                name="description"
                content="Solve Soundmap Artist Guesser faster with the Soundmap Solver. Filter artists by debut year, popularity, genre, country, and more."
        />
        <meta
                name="keywords"
                content="soundmap solver, soundmap artist guesser, soundmap helper, artist guesser solver, music guessing game"
        />
        <meta property="og:title" content="Soundmap Solver - Artist Guesser Helper" />
        <meta
                property="og:description"
                content="Use smart feedback filters to narrow Soundmap answers and get the best next guess instantly."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wordsolverx.com/soundmap-solver" />
        <meta property="og:site_name" content="WordSolverX" />
        <meta property="og:image" content="https://wordsolverx.com/images/soundmap-solver.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
                name="twitter:title"
                content="Soundmap Solver - Artist Guesser Helper"
        />
        <meta
                name="twitter:description"
                content="Free Soundmap solver with best-guess recommendations and instant candidate filtering."
        />
        <link rel="canonical" href="https://wordsolverx.com/soundmap-solver" />
                {@html `<script type="application/ld+json">${stripStructuredDataTypes(jsonLdSchema, ['FAQPage', 'HowTo']) ?? jsonLdSchema}</script>`}
</svelte:head>

<div class="soundmap-solver" class:dark={darkMode}>
        <div class="min-h-screen bg-teal-50 text-slate-900 dark:text-slate-100 transition-colors duration-300">
                <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <Breadcrumbs hideSchema={true} />
                </div>

                <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
                        <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-500 via-teal-500 to-teal-500 px-6 py-8 shadow-2xl text-center space-y-4">
                                <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Music Artist Puzzle</p>
                                <h1 class="text-4xl font-black text-white sm:text-5xl">Soundmap Solver</h1>
                                <p class="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">Search for an artist you guessed, set the feedback colors and arrows, and watch the candidate list narrow down in real time.</p>
                        </div>
                </section>

                <header class="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b dark:border-slate-700">
                        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                        <span class="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">SM</span>
                                        <p class="text-xl font-bold">Soundmap Solver</p>
                                </div>
                                <div class="flex items-center gap-3">
                                        <button
                                                type="button"
                                                onclick={() => (showHelp = true)}
                                                class="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                                Help
                                        </button>
                                        <label class="flex items-center gap-2 text-sm">
                                                <span>Dark</span>
                                                <input
                                                        type="checkbox"
                                                        checked={darkMode}
                                                        onchange={(event) => (darkMode = (event.currentTarget as HTMLInputElement).checked)}
                                                        class="h-4 w-4 accent-teal-500"
                                                />
                                        </label>
                                </div>
                        </div>
                </header>

                <main class="max-w-6xl mx-auto px-4 py-6 space-y-6">
                        {#if notice}
                                <div class="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-2 text-sm">
                                        {notice}
                                </div>
                        {/if}

                        {#if solverLoading}
                                <div class="rounded-xl border border-blue-200 bg-blue-50 text-blue-900 px-4 py-3 text-sm">
                                        Loading the Soundmap artist database...
                                </div>
                        {:else if runtimeError}
                                <div class="rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3 text-sm">
                                        {runtimeError}
                                </div>
                        {/if}

                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                                        <p class="text-2xl font-bold text-teal-500">{candidates.length}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">Candidates</p>
                                </div>
                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                                        <p class="text-2xl font-bold text-blue-500">{guesses.length}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">Guesses</p>
                                </div>
                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                                        <p class="text-2xl font-bold text-purple-500">{artists.length}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">Total Artists</p>
                                </div>
                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
                                        <p class="text-2xl font-bold text-amber-500">{hasWon ? 'WIN' : '...'}</p>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">{hasWon ? 'Solved!' : 'In Progress'}</p>
                                </div>
                        </div>

                        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                <div class="flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                                <h2 class="text-sm font-semibold">How to Match Feedback</h2>
                                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        Tap the sample chips to preview the color cycle, then use the same logic in the solver below.
                                                </p>
                                        </div>
                                        <div class="text-[11px] text-slate-500 dark:text-slate-400">
                                                Wrong -> Correct -> Close -> Arrow hint
                                        </div>
                                </div>

                                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3">
                                                {#if guideActive === 'debut'}
                                                        <div class="absolute -top-2 right-3 flex items-center gap-1">
                                                                <span class="inline-flex h-5 px-2 rounded-full bg-teal-600 text-white text-[10px] items-center shadow-lg animate-pulse">
                                                                        Click
                                                                </span>
                                                                <span class="relative flex h-3 w-3">
                                                                        <span class="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-70 animate-ping"></span>
                                                                        <span class="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                                                                </span>
                                                        </div>
                                                {/if}
                                                <div class="flex items-center justify-between mb-2">
                                                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Year</p>
                                                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Earlier / Later</p>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                                        <button
                                                                type="button"
                                                                onclick={() => cycleGuide('debut')}
                                                                class={`min-w-[110px] h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${feedbackMeta[guideFeedback.debut].className} ${guideActive === 'debut' ? 'scale-105 ring-2 ring-teal-300 dark:ring-teal-700' : ''}`}
                                                        >
                                                                <span>{feedbackMeta[guideFeedback.debut].icon}</span>
                                                                <span>{feedbackMeta[guideFeedback.debut].label}</span>
                                                        </button>
                                                        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                                </div>
                                        </div>

                                        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3">
                                                {#if guideActive === 'popularity'}
                                                        <div class="absolute -top-2 right-3 flex items-center gap-1">
                                                                <span class="inline-flex h-5 px-2 rounded-full bg-teal-600 text-white text-[10px] items-center shadow-lg animate-pulse">
                                                                        Click
                                                                </span>
                                                                <span class="relative flex h-3 w-3">
                                                                        <span class="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-70 animate-ping"></span>
                                                                        <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                                                </span>
                                                        </div>
                                                {/if}
                                                <div class="flex items-center justify-between mb-2">
                                                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Popularity</p>
                                                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Higher / Lower</p>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                                        <button
                                                                type="button"
                                                                onclick={() => cycleGuide('popularity')}
                                                                class={`min-w-[110px] h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${feedbackMeta[guideFeedback.popularity].className} ${guideActive === 'popularity' ? 'scale-105 ring-2 ring-purple-300 dark:ring-purple-700' : ''}`}
                                                        >
                                                                <span>{feedbackMeta[guideFeedback.popularity].icon}</span>
                                                                <span>{feedbackMeta[guideFeedback.popularity].label}</span>
                                                        </button>
                                                        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                                </div>
                                        </div>

                                        <div class="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3">
                                                {#if guideActive === 'country'}
                                                        <div class="absolute -top-2 right-3 flex items-center gap-1">
                                                                <span class="inline-flex h-5 px-2 rounded-full bg-teal-600 text-white text-[10px] items-center shadow-lg animate-pulse">
                                                                        Click
                                                                </span>
                                                                <span class="relative flex h-3 w-3">
                                                                        <span class="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-70 animate-ping"></span>
                                                                        <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                                                </span>
                                                        </div>
                                                {/if}
                                                <div class="flex items-center justify-between mb-2">
                                                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Country</p>
                                                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Close = same region</p>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                                        <button
                                                                type="button"
                                                                onclick={() => cycleGuide('country')}
                                                                class={`min-w-[110px] h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${feedbackMeta[guideFeedback.country].className} ${guideActive === 'country' ? 'scale-105 ring-2 ring-amber-300 dark:ring-amber-700' : ''}`}
                                                        >
                                                                <span>{feedbackMeta[guideFeedback.country].icon}</span>
                                                                <span>{feedbackMeta[guideFeedback.country].label}</span>
                                                        </button>
                                                        <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                                </div>
                                        </div>
                                </div>

                                <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                                        <div class="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1.5 text-center">1. Pick artist</div>
                                        <div class="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1.5 text-center">2. Match colors</div>
                                        <div class="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1.5 text-center">3. Add guess</div>
                                        <div class="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1.5 text-center">4. Use next best</div>
                                </div>
                        </div>

                        {#if hasWon}
                                <div class="rounded-2xl bg-gradient-to-r from-teal-500 to-teal-700 text-white p-6 text-center">
                                        <h2 class="text-2xl font-bold">Congratulations!</h2>
                                        <p class="text-lg mt-1">
                                                The answer is <strong>{candidates[0].name}</strong>
                                        </p>
                                        <p class="text-sm opacity-90 mt-1">Solved in {guesses.length} guesses</p>
                                </div>
                        {/if}

                        {#if showBestGuess && bestGuess && guesses.length > 0 && !hasWon}
                                <div class="rounded-2xl border-2 border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-4">
                                        <div class="flex items-center justify-between flex-wrap gap-3">
                                                <div>
                                                        <p class="text-xs text-slate-500 dark:text-slate-400">Best Next Guess</p>
                                                        <p class="text-lg font-semibold">{bestGuess.name}</p>
                                                </div>
                                                <button
                                                        type="button"
                                                        onclick={useBestGuess}
                                                        class="rounded-xl bg-teal-500 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-600"
                                                >
                                                        Use Guess
                                                </button>
                                        </div>
                                </div>
                        {/if}

                        {#if guesses.length === 0 && !solverLoading}
                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                        <h2 class="text-lg font-semibold mb-3">Recommended First Guesses</h2>
                                        <div class="flex flex-wrap gap-2">
                                                {#each recommendedGuesses as recommendation}
                                                        <button
                                                                type="button"
                                                                onclick={() => selectArtist(recommendation.artist)}
                                                                class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                                        >
                                                                <span class="font-medium">{recommendation.artist.name}</span>
                                                                <span class="ml-2 text-xs text-slate-500 dark:text-slate-400">{recommendation.artist.genre}</span>
                                                                <span class="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                                                                        2 guess avg: {recommendation.twoGuesses?.toFixed(2) ?? '--'} | 3 guess avg:
                                                                        {recommendation.threeGuesses?.toFixed(2) ?? '--'}
                                                                </span>
                                                        </button>
                                                {/each}
                                        </div>
                                </div>
                        {/if}

                        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                <div class="space-y-4">
                                        <div class="relative" bind:this={searchRef}>
                                                <input
                                                type="text"
                                                placeholder="Search for an artist..."
                                                value={searchQuery}
                                                disabled={!!runtimeError}
                                                oninput={(event) => {
                                                        prepareSoundmapRuntime();
                                                        searchQuery = (event.currentTarget as HTMLInputElement).value;
                                                        showDropdown = true;
                                                }}
                                                onfocus={() => {
                                                        prepareSoundmapRuntime();
                                                        showDropdown = true;
                                                }}
                                                        class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                                {#if showDropdown && filteredArtists.length > 0}
                                                        <div class="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                                                                {#each filteredArtists as artist}
                                                                        <button
                                                                                type="button"
                                                                                onmousedown={(event) => {
                                                                                        event.preventDefault();
                                                                                        selectArtist(artist);
                                                                                }}
                                                                                class="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                                                                        >
                                                                                <span class="font-medium">{artist.name}</span>
                                                                                <span class="text-xs text-slate-500 dark:text-slate-400">{artist.genre}</span>
                                                                        </button>
                                                                {/each}
                                                        </div>
                                                {/if}
                                        </div>

                                        {#if selectedArtist}
                                                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                                                        <div class="flex items-center justify-between flex-wrap gap-2 mb-4">
                                                                <div>
                                                                        <h3 class="font-semibold text-lg">{selectedArtist.name}</h3>
                                                                        <p class="text-xs text-slate-500 dark:text-slate-400">
                                                                                Tap each box to cycle feedback
                                                                        </p>
                                                                </div>
                                                                <button
                                                                        type="button"
                                                                        onclick={addGuess}
                                                                        class="rounded-xl bg-teal-500 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-600"
                                                                >
                                                                        Add Guess
                                                                </button>
                                                        </div>

                                                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                <div class="space-y-1">
                                                                        <p class="text-xs text-slate-500 dark:text-slate-400">Debut Year</p>
                                                                        <p class="text-sm font-semibold">{selectedArtist.debut}</p>
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => cycleFeedback('debut')}
                                                                                class={`w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${feedbackMeta[currentFeedback.debut].className}`}
                                                                        >
                                                                                <span>{feedbackMeta[currentFeedback.debut].icon}</span>
                                                                                <span>{feedbackMeta[currentFeedback.debut].label}</span>
                                                                        </button>
                                                                </div>
                                                                <div class="space-y-1">
                                                                        <p class="text-xs text-slate-500 dark:text-slate-400">Popularity</p>
                                                                        <p class="text-sm font-semibold">#{selectedArtist.popularity}</p>
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => cycleFeedback('popularity')}
                                                                                class={`w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${feedbackMeta[currentFeedback.popularity].className}`}
                                                                        >
                                                                                <span>{feedbackMeta[currentFeedback.popularity].icon}</span>
                                                                                <span>{feedbackMeta[currentFeedback.popularity].label}</span>
                                                                        </button>
                                                                </div>
                                                                <div class="space-y-1">
                                                                        <p class="text-xs text-slate-500 dark:text-slate-400">Members</p>
                                                                        <p class="text-sm font-semibold">{selectedArtist.members}</p>
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => cycleFeedback('members')}
                                                                                class={`w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${feedbackMeta[currentFeedback.members].className}`}
                                                                        >
                                                                                <span>{feedbackMeta[currentFeedback.members].icon}</span>
                                                                                <span>{feedbackMeta[currentFeedback.members].label}</span>
                                                                        </button>
                                                                </div>
                                                                <div class="space-y-1">
                                                                        <p class="text-xs text-slate-500 dark:text-slate-400">Genre</p>
                                                                        <p class="text-sm font-semibold">{selectedArtist.genre}</p>
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => cycleFeedback('genre')}
                                                                                class={`w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${feedbackMeta[currentFeedback.genre].className}`}
                                                                        >
                                                                                <span>{feedbackMeta[currentFeedback.genre].icon}</span>
                                                                                <span>{feedbackMeta[currentFeedback.genre].label}</span>
                                                                        </button>
                                                                </div>
                                                                <div class="space-y-1">
                                                                        <p class="text-xs text-slate-500 dark:text-slate-400">Country</p>
                                                                        <p class="text-sm font-semibold">{selectedArtist.country}</p>
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => cycleFeedback('country')}
                                                                                class={`w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${feedbackMeta[currentFeedback.country].className}`}
                                                                        >
                                                                                <span>{feedbackMeta[currentFeedback.country].icon}</span>
                                                                                <span>{feedbackMeta[currentFeedback.country].label}</span>
                                                                        </button>
                                                                </div>
                                                                <div class="space-y-1">
                                                                        <p class="text-xs text-slate-500 dark:text-slate-400">Gender</p>
                                                                        <p class="text-sm font-semibold">{selectedArtist.gender}</p>
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => cycleFeedback('gender')}
                                                                                class={`w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${feedbackMeta[currentFeedback.gender].className}`}
                                                                        >
                                                                                <span>{feedbackMeta[currentFeedback.gender].icon}</span>
                                                                                <span>{feedbackMeta[currentFeedback.gender].label}</span>
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </div>
                                        {/if}
                                </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                        <div class="flex items-center justify-between mb-4">
                                                <h2 class="text-lg font-semibold">Previous Guesses</h2>
                                                {#if guesses.length > 0}
                                                        <button
                                                                type="button"
                                                                onclick={resetGame}
                                                                class="text-xs text-red-500 hover:text-red-400"
                                                        >
                                                                Reset
                                                        </button>
                                                {/if}
                                        </div>
                                        {#if guesses.length === 0}
                                                <p class="text-sm text-slate-500 dark:text-slate-400">Add guesses to start filtering.</p>
                                        {:else}
                                                <div class="space-y-3">
                                                        {#each guesses as guess, index}
                                                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3">
                                                                        <div class="flex items-center justify-between mb-2">
                                                                                <p class="font-semibold">
                                                                                        Guess #{index + 1}: {guess.artist.name}
                                                                                </p>
                                                                                <button
                                                                                        type="button"
                                                                                        onclick={() => (guesses = guesses.filter((_, i) => i !== index))}
                                                                                        class="text-xs text-red-500 hover:text-red-400"
                                                                                >
                                                                                        Remove
                                                                                </button>
                                                                        </div>
                                                                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                                                                {#each buildGuessSummary(guess) as item}
                                                                                        <div class={`rounded-lg p-2 text-center ${feedbackMeta[item.feedback].className}`}>
                                                                                                <p class="text-[10px] uppercase tracking-wide">{item.label}</p>
                                                                                                <p class="font-semibold">{item.value}</p>
                                                                                        </div>
                                                                                {/each}
                                                                        </div>
                                                                </div>
                                                        {/each}
                                                </div>
                                        {/if}
                                </div>

                                <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                        <div class="flex items-center justify-between mb-4">
                                                <h2 class="text-lg font-semibold">Possible Artists ({candidates.length})</h2>
                                                <button
                                                        type="button"
                                                        onclick={() => (showCandidates = !showCandidates)}
                                                        class="text-xs text-slate-500 dark:text-slate-400"
                                                >
                                                        {showCandidates ? 'Hide' : 'Show'}
                                                </button>
                                        </div>
                                        {#if showCandidates}
                                                <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
                                                        {#each candidates.slice(0, 120) as artist}
                                                                <button
                                                                        type="button"
                                                                        onclick={() => selectArtist(artist)}
                                                                        class="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                                                                >
                                                                        <span class="font-medium">{artist.name}</span>
                                                                        <span class="text-xs text-slate-500 dark:text-slate-400">
                                                                                {artist.genre}
                                                                        </span>
                                                                </button>
                                                        {/each}
                                                        {#if candidates.length > 120}
                                                                <p class="text-xs text-slate-500 dark:text-slate-400 text-center">
                                                                        And {candidates.length - 120} more...
                                                                </p>
                                                        {/if}
                                                </div>
                                        {/if}
                                </div>
                        </div>

                        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
                                <div>
                                        <h3 class="font-semibold">Settings</h3>
                                        <p class="text-xs text-slate-500 dark:text-slate-400">
                                                Toggle best-guess recommendations on or off.
                                        </p>
                                </div>
                                <label class="flex items-center gap-2 text-sm">
                                        <span>Best Guess</span>
                                        <input
                                                type="checkbox"
                                                checked={showBestGuess}
                                                onchange={(event) =>
                                                        (showBestGuess = (event.currentTarget as HTMLInputElement).checked)}
                                                class="h-4 w-4 accent-teal-500"
                                        />
                                </label>
                        </div>
                
    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>

                

                {#if showHelp}
                        <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                        <div class="max-w-2xl w-full bg-white rounded-2xl p-6 relative">
                                <button
                                        type="button"
                                        onclick={() => (showHelp = false)}
                                        class="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
                                >
                                        X
                                </button>
                                <h2 class="text-2xl font-bold mb-2">How to Use Soundmap Solver</h2>
                                <p class="text-sm text-slate-500 mb-4">
                                        Match each feedback color from the game and let the solver narrow the list.
                                </p>
                                <ol class="list-decimal list-inside space-y-2 text-sm text-slate-700">
                                                <li>Search and select an artist you guessed in Soundmap.</li>
                                                <li>Tap each feedback box to match the game&apos;s hints.</li>
                                                <li>Add the guess to filter the candidate list instantly.</li>
                                                <li>Use the best-guess recommendation to solve faster.</li>
                                        </ol>
                                </div>
                        </div>
                {/if}
        </div>
</div>
