<script lang="ts">
        import { onMount } from 'svelte';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import { GAME_SOLVER_CONFIGS, getSolverCrossLinks } from '$lib/game-dle/config';
        import { gameSolverSeoContent } from '$lib/game-dle/seo-content';
        import type {
                AttributeConfig,
                CharacterRecord,
                FeedbackState,
                GuessFeedback,
                SolverGameKey
        } from '$lib/game-dle/types';
        import {
                generateBreadcrumbSchema,
                generateSoftwareApplicationSchema,
                generateWebApplicationSchema,
                generateWebPageSchema
        } from '$lib/seo';

        let { gameKey }: { gameKey: SolverGameKey } = $props();

        const standardStates: FeedbackState[] = [null, 'green', 'yellow_up', 'red'];
        const numericStates: FeedbackState[] = [null, 'green', 'yellow_up', 'yellow_down', 'red'];

        let characters = $state<CharacterRecord[]>([]);
        let loading = $state(true);
        let errorMessage = $state<string | null>(null);
        let searchQuery = $state('');
        let showSuggestions = $state(false);
        let guesses = $state<GuessFeedback[]>([]);
        let showHowTo = $state(true);

        let expandedSections = $state({
                howToPlay: false,
                tips: false,
                faqs: false,
                strategies: false
        });

        const config = $derived(GAME_SOLVER_CONFIGS[gameKey]);
        const seoContent = $derived(gameSolverSeoContent[gameKey]);
        const crossLinks = $derived(getSolverCrossLinks(gameKey));
        const pageUrl = $derived(`https://wordsolverx.com${config.route}`);
        const pageTitle = $derived(seoContent.title);
        const pageDescription = $derived(seoContent.description);
        const pageKeywords = $derived(config.keywords.join(', '));
        const solverOgImage = $derived(`https://wordsolverx.com/og/${config.key}-solver.svg`);

        const breadcrumbSchema = $derived(
                generateBreadcrumbSchema([
                        { name: 'Home', url: 'https://wordsolverx.com' },
                        { name: 'Solver Tools', url: 'https://wordsolverx.com/solver' },
                        { name: config.name }
                ])
        );
        const webApplicationSchema = $derived(
                generateWebApplicationSchema(
                        `${config.name} Solver`,
                        `${config.description} Filter candidates with exact game feedback and solve faster.`
                )
        );
        const softwareSchema = $derived(
                generateSoftwareApplicationSchema(`${config.name} Solver`, 'GameApplication', 'Any')
        );
        const webPageSchema = $derived(generateWebPageSchema(pageTitle, pageDescription, pageUrl));

        async function loadCharacters(dataFile: string): Promise<void> {
                loading = true;
                errorMessage = null;
                searchQuery = '';
                guesses = [];
                showHowTo = true;
                expandedSections = {
                        howToPlay: false,
                        tips: false,
                        faqs: false,
                        strategies: false
                };

                try {
                        const response = await fetch(dataFile);
                        if (!response.ok) {
                                throw new Error(`Could not fetch data: ${response.status}`);
                        }
                        const data = (await response.json()) as unknown;
                        characters = Array.isArray(data) ? (data as CharacterRecord[]) : [];
                } catch (error) {
                        console.error(`Failed loading ${dataFile}`, error);
                        errorMessage = 'Failed to load game data. Please refresh and try again.';
                        characters = [];
                } finally {
                        loading = false;
                }
        }

        onMount(() => {
                void loadCharacters(config.dataFile);
        });

        function normalizeValue(value: unknown, attr: AttributeConfig): string | number | string[] {
                if (value === null || value === undefined) {
                        return attr.type === 'array' ? ['None'] : 'None';
                }

                if (Array.isArray(value)) {
                        if (value.length === 0) {
                                return ['None'];
                        }
                        return value.map((entry) => {
                                if (entry === null || entry === undefined) {
                                        return 'None';
                                }
                                if (typeof entry === 'object') {
                                        const nameField = (entry as { name?: unknown }).name;
                                        return nameField ? String(nameField) : JSON.stringify(entry);
                                }
                                return String(entry);
                        });
                }

                if (typeof value === 'number') {
                        return value;
                }

                if (attr.key === 'release_date' && typeof value === 'string') {
                        return value.split('-')[0] ?? value;
                }

                return String(value);
        }

        function toNumber(value: string | number | string[]): number | null {
                if (typeof value === 'number') {
                        return Number.isFinite(value) ? value : null;
                }
                if (typeof value === 'string') {
                        const parsed = Number.parseInt(value, 10);
                        return Number.isNaN(parsed) ? null : parsed;
                }
                return null;
        }

        function hasIntersection(left: string[], right: string[]): boolean {
                return left.some((value) => right.includes(value));
        }

        const suggestions = $derived.by(() => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) {
                        return [] as CharacterRecord[];
                }

                return characters
                        .filter((character) => {
                                const rawName = character[config.nameKey];
                                const name = typeof rawName === 'string' ? rawName.toLowerCase() : '';
                                return name.includes(query);
                        })
                        .slice(0, 10);
        });

        const candidates = $derived.by(() => {
                if (guesses.length === 0) {
                        return characters;
                }

                return characters.filter((character) => {
                        for (const guess of guesses) {
                                for (const attr of config.attributes) {
                                        const feedback = guess.feedback[attr.key];
                                        if (!feedback) {
                                                continue;
                                        }

                                        const guessedValue = normalizeValue(guess.character[attr.key], attr);
                                        const candidateValue = normalizeValue(character[attr.key], attr);
                                        const isNumeric = attr.type === 'number' || attr.key === 'release_date';

                                        if (feedback === 'green') {
                                                if (attr.type === 'array') {
                                                        if (
                                                                !hasIntersection(guessedValue as string[], candidateValue as string[])
                                                        ) {
                                                                return false;
                                                        }
                                                } else if (candidateValue !== guessedValue) {
                                                        return false;
                                                }
                                        }

                                        if (feedback === 'red') {
                                                if (attr.type === 'array') {
                                                        if (
                                                                hasIntersection(guessedValue as string[], candidateValue as string[])
                                                        ) {
                                                                return false;
                                                        }
                                                } else if (candidateValue === guessedValue) {
                                                        return false;
                                                }
                                        }

                                        if (feedback === 'yellow_up') {
                                                if (isNumeric) {
                                                        const guessNumber = toNumber(guessedValue);
                                                        const candidateNumber = toNumber(candidateValue);
                                                        if (guessNumber !== null && candidateNumber !== null && candidateNumber <= guessNumber) {
                                                                return false;
                                                        }
                                                } else if (attr.type === 'array') {
                                                        if (
                                                                !hasIntersection(guessedValue as string[], candidateValue as string[])
                                                        ) {
                                                                return false;
                                                        }
                                                }
                                        }

                                        if (feedback === 'yellow_down' && isNumeric) {
                                                const guessNumber = toNumber(guessedValue);
                                                const candidateNumber = toNumber(candidateValue);
                                                if (guessNumber !== null && candidateNumber !== null && candidateNumber >= guessNumber) {
                                                        return false;
                                                }
                                        }
                                }
                        }

                        return true;
                });
        });

        const guessedNames = $derived.by(() => {
                return new Set(
                        guesses
                                .map((guess) => guess.character[config.nameKey])
                                .filter((name): name is string => typeof name === 'string')
                );
        });

        const remainingCandidates = $derived(
                candidates.filter((candidate) => {
                        const candidateName = candidate[config.nameKey];
                        return typeof candidateName === 'string' ? !guessedNames.has(candidateName) : true;
                })
        );

        const progress = $derived.by(() => {
                if (characters.length === 0) {
                        return 0;
                }
                const eliminatedCount = characters.length - candidates.length;
                return Math.round((eliminatedCount / characters.length) * 100);
        });

        const bestGuess = $derived.by(() => {
                if (remainingCandidates.length === 0) {
                        return null;
                }
                if (remainingCandidates.length === characters.length || remainingCandidates.length > 20) {
                        return null;
                }
                return remainingCandidates[0] ?? null;
        });

        function getDisplayName(character: CharacterRecord): string {
                const value = character[config.nameKey];
                return typeof value === 'string' ? value : 'Unknown';
        }

        function handleSelectCharacter(character: CharacterRecord): void {
                guesses = [
                        ...guesses,
                        {
                                character,
                                feedback: {},
                                collapsed: false
                        }
                ];
                searchQuery = '';
                showSuggestions = false;
                showHowTo = false;
        }

        function cycleFeedback(current: FeedbackState, isNumeric: boolean): FeedbackState {
                const states = isNumeric ? numericStates : standardStates;
                const currentIndex = states.findIndex((item) => item === current);
                const nextIndex = (currentIndex + 1) % states.length;
                return states[nextIndex] ?? null;
        }

        function handleFeedback(guessIndex: number, attrKey: string, nextState: FeedbackState): void {
                guesses = guesses.map((guess, index) => {
                        if (index !== guessIndex) {
                                return guess;
                        }
                        return {
                                ...guess,
                                feedback: {
                                        ...guess.feedback,
                                        [attrKey]: nextState
                                }
                        };
                });
        }

        function removeGuess(indexToRemove: number): void {
                guesses = guesses.filter((_, index) => index !== indexToRemove);
        }

        function toggleGuess(indexToToggle: number): void {
                guesses = guesses.map((guess, index) => {
                        if (index !== indexToToggle) {
                                return guess;
                        }
                        return {
                                ...guess,
                                collapsed: !guess.collapsed
                        };
                });
        }

        function resetAll(): void {
                guesses = [];
                searchQuery = '';
                showSuggestions = false;
                showHowTo = true;
        }

        function formatAttributeValue(value: unknown, attr: AttributeConfig): string {
                if (value === null || value === undefined) {
                        return 'None';
                }

                if (Array.isArray(value)) {
                        const mapped = value.map((entry) => {
                                if (entry === null || entry === undefined) {
                                        return 'None';
                                }
                                if (typeof entry === 'object') {
                                        const nameField = (entry as { name?: unknown }).name;
                                        return nameField ? String(nameField) : JSON.stringify(entry);
                                }
                                return String(entry);
                        });

                        if (mapped.length === 0 || (mapped.length === 1 && mapped[0] === 'None')) {
                                return 'None';
                        }
                        return mapped.join(', ');
                }

                if (attr.key === 'release_date' && typeof value === 'string') {
                        return value.split('-')[0] ?? value;
                }

                if (attr.key === 'bounty' && typeof value === 'number') {
                        return value.toLocaleString('en-US');
                }

                return String(value);
        }

        function formatPreviewValue(value: unknown): string {
                if (value === null || value === undefined) {
                        return 'None';
                }

                if (Array.isArray(value)) {
                        if (value.length === 0) {
                                return 'None';
                        }
                        const normalized = value
                                .map((entry) => {
                                        if (entry === null || entry === undefined) {
                                                return 'None';
                                        }
                                        if (typeof entry === 'object') {
                                                const nameField = (entry as { name?: unknown }).name;
                                                return nameField ? String(nameField) : 'Item';
                                        }
                                        return String(entry);
                                })
                                .filter(Boolean);
                        if (normalized.length === 0) {
                                return 'None';
                        }
                        const short = normalized.slice(0, 2).join(', ');
                        return normalized.length > 2 ? `${short}...` : short;
                }

                if (typeof value === 'number' && value >= 10000) {
                        return value.toLocaleString('en-US');
                }

                return String(value);
        }

        function getFeedbackColorClass(state: FeedbackState): string {
                switch (state) {
                        case 'green':
                                return 'bg-teal-50 border-teal-400 shadow-sm';
                        case 'yellow_up':
                        case 'yellow_down':
                                return 'bg-amber-50 border-amber-400 shadow-sm';
                        case 'red':
                                return 'bg-red-50 border-red-400 shadow-sm';
                        default:
                                return 'bg-slate-50 border-slate-200';
                }
        }

        function getFeedbackButtonClass(state: FeedbackState): string {
                switch (state) {
                        case 'green':
                                return 'bg-teal-500 hover:bg-teal-600 text-white border-teal-600';
                        case 'yellow_up':
                                return 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500';
                        case 'yellow_down':
                                return 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700';
                        case 'red':
                                return 'bg-red-500 hover:bg-red-600 text-white border-red-600';
                        default:
                                return 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300';
                }
        }

        function feedbackText(state: FeedbackState, isNumeric: boolean): string {
                if (state === 'green') {
                        return 'Match';
                }
                if (state === 'red') {
                        return 'Wrong';
                }
                if (state === 'yellow_up') {
                        return isNumeric ? 'Higher' : 'Partial';
                }
                if (state === 'yellow_down') {
                        return 'Lower';
                }
                return 'Tap';
        }

        function feedbackSymbol(state: FeedbackState): string {
                if (state === 'green') {
                        return 'OK';
                }
                if (state === 'yellow_up') {
                        return 'UP';
                }
                if (state === 'yellow_down') {
                        return 'DN';
                }
                if (state === 'red') {
                        return 'NO';
                }
                return '--';
        }

        function toggleSection(section: keyof typeof expandedSections): void {
                expandedSections = {
                        ...expandedSections,
                        [section]: !expandedSections[section]
                };
        }
</script>

<svelte:head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="WordSolverX" />
        <meta property="og:image" content={solverOgImage} />
        <meta property="og:image:alt" content={`${config.name} Solver Tool`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={solverOgImage} />
        {@html `<script type="application/ld+json">${JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [webPageSchema, webApplicationSchema, softwareSchema, breadcrumbSchema]
        })}</script>`}
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumbs hideSchema={true} />

                <section class="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 md:p-8 mb-8">
                        <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
                                <div>
                                        <p
                                                class="inline-flex items-center rounded-full bg-teal-100 text-teal-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                                        >
                                                Solver Tool
                                        </p>
                                        <h1 class="mt-3 text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                                                {config.name} Solver
                                        </h1>
                                        <p class="mt-2 text-slate-600 max-w-3xl">{config.description}</p>
                                </div>
                                <a
                                        href={config.answerRoute}
                                        class="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                                >
                                        View Today's Answer
                                </a>
                        </div>

                        <div class="flex flex-wrap gap-2">
                                {#each crossLinks as link}
                                        <a
                                                href={link.href}
                                                class="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                                {link.label} Solver
                                        </a>
                                {/each}
                        </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white shadow-lg p-5 md:p-6 mb-8" style="min-height: 580px;">
                        {#if loading}
                                <div class="h-[540px] flex flex-col items-center justify-center gap-3">
                                        <div class="w-10 h-10 rounded-full border-4 border-slate-300 border-t-slate-700 animate-spin"></div>
                                        <p class="text-sm text-slate-600">Loading {config.name} characters...</p>
                                </div>
                        {:else if errorMessage}
                                <div class="h-[540px] flex flex-col items-center justify-center gap-3">
                                        <p class="text-red-600 font-medium">{errorMessage}</p>
                                        <button
                                                type="button"
                                                onclick={() => void loadCharacters(config.dataFile)}
                                                class="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                                        >
                                                Retry
                                        </button>
                                </div>
                        {:else}
                                <div class="space-y-4">
                                        <div class="flex gap-2">
                                                <div class="relative flex-1">
                                                        <input
                                                                type="text"
                                                                placeholder={`Type ${config.name} character name to guess...`}
                                                                value={searchQuery}
                                                                oninput={(event) => {
                                                                        searchQuery = (event.currentTarget as HTMLInputElement).value;
                                                                        showSuggestions = true;
                                                                }}
                                                                onfocus={() => {
                                                                        showSuggestions = true;
                                                                }}
                                                                onblur={() => {
                                                                        setTimeout(() => {
                                                                                showSuggestions = false;
                                                                        }, 160);
                                                                }}
                                                                class="w-full h-12 rounded-xl border-2 border-slate-200 px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                        />
                                                        {#if showSuggestions && suggestions.length > 0}
                                                                <div
                                                                        class="absolute left-0 right-0 top-full mt-1 rounded-xl border-2 border-blue-200 bg-white shadow-xl overflow-hidden z-30"
                                                                >
                                                                        {#each suggestions.slice(0, 8) as suggestion, index}
                                                                                <button
                                                                                        type="button"
                                                                                        onmousedown={(event) => {
                                                                                                event.preventDefault();
                                                                                                handleSelectCharacter(suggestion);
                                                                                        }}
                                                                                        class="w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors text-sm font-medium text-slate-800"
                                                                                >
                                                                                        <span class="inline-block w-6 text-slate-400">{index + 1}.</span>
                                                                                        {getDisplayName(suggestion)}
                                                                                </button>
                                                                        {/each}
                                                                </div>
                                                        {/if}
                                                </div>
                                                <button
                                                        type="button"
                                                        onclick={resetAll}
                                                        class="shrink-0 h-12 rounded-xl border-2 border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                                >
                                                        Reset
                                                </button>
                                        </div>

                                        {#if showHowTo && guesses.length === 0}
                                                <div class="rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                                                        <h2 class="text-base font-bold text-blue-900 mb-3">How to Use This Solver</h2>
                                                        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-slate-700">
                                                                <div class="rounded-xl bg-white/80 p-3 border border-blue-100">
                                                                        <p class="font-semibold">1. Search</p>
                                                                        <p class="text-xs mt-1">Type a character name and select it as your guess.</p>
                                                                </div>
                                                                <div class="rounded-xl bg-white/80 p-3 border border-blue-100">
                                                                        <p class="font-semibold">2. Compare</p>
                                                                        <p class="text-xs mt-1">Match each attribute with game feedback.</p>
                                                                </div>
                                                                <div class="rounded-xl bg-white/80 p-3 border border-blue-100">
                                                                        <p class="font-semibold">3. Update</p>
                                                                        <p class="text-xs mt-1">Tap buttons to cycle Match/Partial/Wrong.</p>
                                                                </div>
                                                                <div class="rounded-xl bg-white/80 p-3 border border-blue-100">
                                                                        <p class="font-semibold">4. Solve</p>
                                                                        <p class="text-xs mt-1">Candidates automatically narrow after each guess.</p>
                                                                </div>
                                                        </div>
                                                </div>
                                        {/if}

                                        {#if guesses.length > 0}
                                                <div class="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                                                        <div class="flex items-center justify-between text-sm mb-2">
                                                                <span class="font-medium text-slate-700">Progress</span>
                                                                <span class="font-bold text-blue-700">{progress}% eliminated</span>
                                                        </div>
                                                        <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                                                                <div
                                                                        class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                                                                        style={`width: ${progress}%`}
                                                                ></div>
                                                        </div>
                                                        <div class="mt-2 text-right text-xs text-slate-600">
                                                                <strong class="text-slate-800">{remainingCandidates.length}</strong> candidates left
                                                        </div>
                                                </div>
                                        {/if}

                                        {#if guesses.length > 0}
                                                <div class="space-y-2">
                                                        <div class="flex items-center justify-between">
                                                                <h3 class="text-base font-bold text-slate-800">Your Guesses ({guesses.length})</h3>
                                                                <p class="text-xs text-slate-500">Click card header to collapse/expand</p>
                                                        </div>
                                                        {#each guesses as guess, guessIndex}
                                                                {@const feedbackCount = Object.values(guess.feedback).filter((item) => item).length}
                                                                {@const totalAttrs = config.attributes.length}
                                                                <div class="rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm">
                                                                        <div
                                                                                role="button"
                                                                                tabindex="0"
                                                                                onclick={() => toggleGuess(guessIndex)}
                                                                                onkeydown={(event) => {
                                                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                                                                event.preventDefault();
                                                                                                toggleGuess(guessIndex);
                                                                                        }
                                                                                }}
                                                                                class="w-full px-3 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between text-left cursor-pointer"
                                                                        >
                                                                                <div>
                                                                                        <p class="font-bold text-slate-900">{getDisplayName(guess.character)}</p>
                                                                                        <p class="text-xs text-slate-600">{feedbackCount}/{totalAttrs} attributes marked</p>
                                                                                </div>
                                                                                <div class="flex items-center gap-2">
                                                                                        <button
                                                                                                type="button"
                                                                                                onclick={(event) => {
                                                                                                        event.stopPropagation();
                                                                                                        removeGuess(guessIndex);
                                                                                                }}
                                                                                                class="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                                                                                        >
                                                                                                Remove
                                                                                        </button>
                                                                                        <span class="text-xs font-semibold text-slate-500">{guess.collapsed ? 'Expand' : 'Collapse'}</span>
                                                                                </div>
                                                                        </div>

                                                                        {#if !guess.collapsed}
                                                                                <div class="p-3 space-y-2 bg-white">
                                                                                        {#each config.attributes as attr}
                                                                                                {@const value = guess.character[attr.key]}
                                                                                                {@const isNumeric = attr.type === 'number' || attr.key === 'release_date'}
                                                                                                {@const feedback = guess.feedback[attr.key] ?? null}
                                                                                                <div class={`rounded-xl border-2 p-2.5 ${getFeedbackColorClass(feedback)}`}>
                                                                                                        <div class="flex items-center justify-between gap-2">
                                                                                                                <div class="min-w-0">
                                                                                                                        <p class="text-xs text-slate-500">{attr.label}</p>
                                                                                                                        <p class="text-sm font-semibold text-slate-800 truncate">
                                                                                                                                {formatAttributeValue(value, attr)}
                                                                                                                        </p>
                                                                                                                </div>
                                                                                                                <button
                                                                                                                        type="button"
                                                                                                                        onclick={() =>
                                                                                                                                handleFeedback(
                                                                                                                                        guessIndex,
                                                                                                                                        attr.key,
                                                                                                                                        cycleFeedback(feedback, isNumeric)
                                                                                                                                )}
                                                                                                                        class={`rounded-lg border px-2 py-1 text-xs font-semibold transition-colors ${getFeedbackButtonClass(feedback)}`}
                                                                                                                >
                                                                                                                        {feedbackSymbol(feedback)} {feedbackText(feedback, isNumeric)}
                                                                                                                </button>
                                                                                                        </div>
                                                                                                </div>
                                                                                        {/each}
                                                                                </div>
                                                                        {/if}
                                                                </div>
                                                        {/each}
                                                </div>
                                        {/if}

                                        {#if bestGuess}
                                                <div class="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
                                                        <div class="flex flex-wrap items-center justify-between gap-3">
                                                                <div>
                                                                        <p class="text-xs uppercase font-bold tracking-wide text-amber-700">Suggested next guess</p>
                                                                        <p class="text-lg font-black text-slate-900">{getDisplayName(bestGuess)}</p>
                                                                </div>
                                                                <button
                                                                        type="button"
                                                                        onclick={() => handleSelectCharacter(bestGuess)}
                                                                        class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                                                                >
                                                                        Use Suggestion
                                                                </button>
                                                        </div>
                                                </div>
                                        {/if}

                                        <div class="flex items-center justify-between gap-2">
                                                <h3 class="text-lg font-bold text-slate-800">Possible Answers ({remainingCandidates.length})</h3>
                                                {#if guesses.length === 0}
                                                        <p class="text-xs text-slate-500">Start by searching your first guess above</p>
                                                {/if}
                                        </div>

                                        <div class="max-h-[540px] overflow-y-auto pr-1">
                                                {#if remainingCandidates.length > 0}
                                                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                                                                {#each remainingCandidates as candidate}
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => handleSelectCharacter(candidate)}
                                                                                class="rounded-xl border-2 border-slate-200 bg-white text-left p-2.5 hover:border-blue-400 hover:shadow-md transition-all"
                                                                        >
                                                                                <p class="font-semibold text-sm text-slate-800 truncate">
                                                                                        {getDisplayName(candidate)}
                                                                                </p>
                                                                                <div class="mt-1.5 space-y-0.5">
                                                                                        {#each config.attributes.slice(0, 3) as attr}
                                                                                                <p class="text-[11px] text-slate-600 truncate">
                                                                                                        <span class="text-slate-500">{attr.label}:</span>
                                                                                                        <span class="ml-1 font-medium">{formatPreviewValue(candidate[attr.key])}</span>
                                                                                                </p>
                                                                                        {/each}
                                                                                </div>
                                                                        </button>
                                                                {/each}
                                                        </div>
                                                {:else}
                                                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                                                                <p class="text-slate-800 font-semibold">No candidates match current feedback.</p>
                                                                <p class="text-sm text-slate-500 mt-1">Try adjusting one or more attributes.</p>
                                                        </div>
                                                {/if}
                                        </div>
                                </div>
                        {/if}
                </section>

                <section class="space-y-4 mb-8">
                        <div class="rounded-3xl border border-slate-200 bg-white shadow-md p-6">
                                <h2 class="text-2xl font-black text-slate-900">{seoContent.title}</h2>
                                <p class="text-slate-600 mt-1">{seoContent.description}</p>
                                <div class="mt-4 space-y-4">
                                        {#each seoContent.introduction as paragraph}
                                                <p class="text-slate-700 leading-relaxed">{paragraph}</p>
                                        {/each}
                                </div>
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <button
                                        type="button"
                                        onclick={() => toggleSection('howToPlay')}
                                        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                                >
                                        <h3 class="text-lg font-semibold text-slate-900">How to Play {config.name}</h3>
                                        <span class="text-xs font-semibold text-slate-500">{expandedSections.howToPlay ? 'Hide' : 'Show'}</span>
                                </button>
                                {#if expandedSections.howToPlay}
                                        <div class="border-t border-slate-200 px-5 py-4 space-y-4">
                                                {#each seoContent.howToPlay as step, index}
                                                        <div class="flex gap-3">
                                                                <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                                        {index + 1}
                                                                </div>
                                                                <div>
                                                                        <p class="font-semibold text-slate-900">{step.step}</p>
                                                                        <p class="text-sm text-slate-600 mt-1">{step.description}</p>
                                                                </div>
                                                        </div>
                                                {/each}
                                        </div>
                                {/if}
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <button
                                        type="button"
                                        onclick={() => toggleSection('tips')}
                                        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                                >
                                        <h3 class="text-lg font-semibold text-slate-900">Pro Tips</h3>
                                        <span class="text-xs font-semibold text-slate-500">{expandedSections.tips ? 'Hide' : 'Show'}</span>
                                </button>
                                {#if expandedSections.tips}
                                        <div class="border-t border-slate-200 px-5 py-4 space-y-3">
                                                {#each seoContent.tips as tip, index}
                                                        <p class="text-sm text-slate-700">
                                                                <span class="inline-block rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 mr-2">
                                                                        Tip {index + 1}
                                                                </span>
                                                                {tip}
                                                        </p>
                                                {/each}
                                        </div>
                                {/if}
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <button
                                        type="button"
                                        onclick={() => toggleSection('strategies')}
                                        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                                >
                                        <h3 class="text-lg font-semibold text-slate-900">Advanced Strategies</h3>
                                        <span class="text-xs font-semibold text-slate-500">{expandedSections.strategies ? 'Hide' : 'Show'}</span>
                                </button>
                                {#if expandedSections.strategies}
                                        <div class="border-t border-slate-200 px-5 py-4 space-y-3">
                                                {#each seoContent.strategies as strategy}
                                                        <div class="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-slate-700">
                                                                {strategy}
                                                        </div>
                                                {/each}
                                        </div>
                                {/if}
                        </div>

                        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <button
                                        type="button"
                                        onclick={() => toggleSection('faqs')}
                                        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                                >
                                        <h3 class="text-lg font-semibold text-slate-900">Frequently Asked Questions</h3>
                                        <span class="text-xs font-semibold text-slate-500">{expandedSections.faqs ? 'Hide' : 'Show'}</span>
                                </button>
                                {#if expandedSections.faqs}
                                        <div class="border-t border-slate-200 px-5 py-4 space-y-4">
                                                {#each seoContent.faqs as faq}
                                                        <div class="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                                                <p class="font-semibold text-slate-900">{faq.question}</p>
                                                                <p class="text-sm text-slate-600 mt-1">{faq.answer}</p>
                                                        </div>
                                                {/each}
                                        </div>
                                {/if}
                        </div>
                </section>
        </div>
</div>
