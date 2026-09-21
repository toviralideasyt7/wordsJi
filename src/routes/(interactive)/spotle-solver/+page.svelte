<script lang="ts">
        import { onMount } from 'svelte';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import { generateBreadcrumbSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import {
                COUNTRY_NAMES,
                GENDER_NAMES,
                SPOTLE_ATTRIBUTES,
                filterSpotleCandidates,
                getDefaultSpotleFeedback,
                getNextSpotleArrow,
                getNextSpotleFeedback,
                type SpotleArtist,
                type SpotleGuess
        } from '$lib/spotle';

        let dataLoaded = $state(false);
        let dataLoading = $state(false);
        let loadError = $state('');
        let artists = $state<SpotleArtist[]>([]);
        let searchQuery = $state('');
        let showDropdown = $state(false);
        let selectedArtist = $state<SpotleArtist | null>(null);
        let guesses = $state<SpotleGuess[]>([]);
        let currentFeedback = $state(getDefaultSpotleFeedback());


        const solverLinks = [
                { href: '/wordle-solver', label: 'Wordle Solver' },
                { href: '/nerdle-solver', label: 'Nerdle Solver' },
                { href: '/spotle-answer-today', label: 'Spotle Answer Today' },
                { href: '/searchle-solver', label: 'Searchle Solver' },
                { href: '/contexto-solver', label: 'Contexto Solver' },
                { href: '/countryle-solver', label: 'Countryle Solver' }
        ];

        async function loadSpotleData() {
                if (dataLoaded || dataLoading) return;
                dataLoading = true;
                loadError = '';
                try {
                        const response = await fetch('/spotle_data.json');
                        if (!response.ok) {
                                throw new Error(`Spotle data fetch failed: ${response.status}`);
                        }
                        const payload = await response.json();
                        artists = payload.artists ?? [];
                        dataLoaded = true;
                } catch (error) {
                        console.error('Spotle data load error', error);
                        loadError = 'The Spotle artist database could not load right now. Try reloading the page.';
                        dataLoaded = true;
                } finally {
                        dataLoading = false;
                }
        }

        onMount(() => {
                void loadSpotleData();
        });

        const searchResults = $derived.by(() => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) return [];
                return artists
                        .filter((artist) => artist.artist.toLowerCase().includes(query))
                        .slice(0, 8);
        });

        const remainingCandidates = $derived(filterSpotleCandidates(artists, guesses));

        function selectArtist(artist: SpotleArtist) {
                selectedArtist = artist;
                searchQuery = artist.artist;
                showDropdown = false;
        }

        function addGuess() {
                if (!selectedArtist) return;
                if (guesses.some((guess) => guess.artist.artist === selectedArtist?.artist)) {
                        return;
                }
                guesses = [...guesses, { artist: selectedArtist, feedback: { ...currentFeedback } }];
                selectedArtist = null;
                searchQuery = '';
                showDropdown = false;
                currentFeedback = getDefaultSpotleFeedback();
        }

        function resetAll() {
                guesses = [];
                selectedArtist = null;
                searchQuery = '';
                showDropdown = false;
                currentFeedback = getDefaultSpotleFeedback();
        }

        const pageTitle = 'Spotle Solver - Spotify Artist Guess Helper';
        const pageDescription =
                'Solve Spotle faster with real-time artist filtering by rank, debut year, genre, country, group size, and gender.';
        const pageUrl = 'https://wordsolverx.com/spotle-solver';
        const pageImage = 'https://wordsolverx.com/images/spotle-solver.webp';
</script>

<svelte:head>
        <title>Spotle Solver - Spotify Artist Guess Helper</title>
        <meta
                name="description"
                content="Solve Spotle faster with a Spotify artist solver that matches rank, debut year, genre, and country using precise feedback filters on every guess."
        />
        <link rel="canonical" href="https://wordsolverx.com/spotle-solver" />
        <meta property="og:title" content="Spotle Solver - Spotify Artist Guess Helper" />
        <meta
                property="og:description"
                content="Use smart feedback filters to narrow Spotle answers by rank, debut year, genre, country, group size, and gender."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wordsolverx.com/spotle-solver" />
        <meta property="og:site_name" content="WordSolverX" />
        <meta property="og:image" content="https://wordsolverx.com/images/spotle-solver.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        {@html `<script type="application/ld+json">${stripStructuredDataTypes(JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                        generateWebPageSchema(pageTitle, pageDescription, pageUrl, {
                                image: pageImage
                        }),
                        {
                                '@type': 'WebApplication',
                                name: 'Spotle Solver',
                                applicationCategory: 'GameApplication',
                                operatingSystem: 'Any',
                                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
                        },
                        {
                                '@type': 'HowTo',
                                name: 'How to use the Spotle solver',
                                step: [
                                        { '@type': 'HowToStep', name: 'Search an artist', text: 'Type the name of the artist you guessed in Spotle and select them from the dropdown.', position: 1 },
                                        { '@type': 'HowToStep', name: 'Set feedback colors', text: 'Tap each attribute button until it matches the Spotle feedback: green for exact match, yellow for close, gray for wrong.', position: 2 },
                                        { '@type': 'HowToStep', name: 'Add and repeat', text: 'Click Add Guess, then pick from the filtered remaining candidates for your next guess.', position: 3 }
                                ]
                        },
                        generateBreadcrumbSchema([
                                { name: 'Home', url: 'https://wordsolverx.com' },
                                { name: 'Solver', url: 'https://wordsolverx.com/solver' },
                                { name: 'Spotle Solver', url: 'https://wordsolverx.com/spotle-solver' }
                        ])
                ]
        }), ['FAQPage', 'HowTo'])}</script>`}
</svelte:head>

<section class="min-h-screen bg-teal-50">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <Breadcrumbs hideSchema={true} />
        </div>

        <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
                <div class="rounded-[2rem] border border-teal-200/60 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-500 px-6 py-8 sm:px-10 sm:py-10 shadow-2xl">
                        <p class="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-50">Spotify Daily Game</p>
                        <div class="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div>
                                        <h1 class="text-4xl font-black text-white md:text-5xl">Spotle Solver</h1>
                                        <p class="mt-3 max-w-2xl text-teal-50/90 text-lg">
                                                Search an artist, match the feedback colors and arrows, and filter the remaining candidates in real time.
                                        </p>
                                </div>
                                <a
                                        href="/spotle-answer-today"
                                        class="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 shrink-0 shadow-md"
                                >
                                        View Today's Answer
                                </a>
                        </div>
                </div>
        </section>

        <div class="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">

                {#if !dataLoaded}
                        <div class="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                                <p class="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Loading</p>
                                <h2 class="mt-3 text-2xl font-black text-slate-900">Spotle solver database</h2>
                                <p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                        The artist pool is loading automatically so the solver can render as soon as it is ready.
                                </p>
                                <div class="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20">
                                        Loading Spotle data...
                                </div>
                        </div>
                {:else}
                        {#if loadError}
                                <div class="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
                                        {loadError}
                                </div>
                        {/if}
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <section class="lg:col-span-4 space-y-6">
                                        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg">
                                                <h2 class="text-lg font-semibold text-slate-800 mb-4">Make a Guess</h2>
                                                <div class="relative mb-3">
                                                        <input
                                                                type="text"
                                                                placeholder="Search artist..."
                                                                value={searchQuery}
                                                                oninput={(event) => {
                                                                        searchQuery = (event.currentTarget as HTMLInputElement).value;
                                                                        showDropdown = true;
                                                                }}
                                                                onfocus={() => (showDropdown = true)}
                                                                onblur={() => setTimeout(() => (showDropdown = false), 200)}
                                                                class="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                        />
                                                        {#if showDropdown && searchResults.length > 0}
                                                                <div class="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                                                                        {#each searchResults as artist}
                                                                                <button
                                                                                        type="button"
                                                                                        onmousedown={(event) => {
                                                                                                event.preventDefault();
                                                                                                selectArtist(artist);
                                                                                        }}
                                                                                        class="w-full px-3 py-2 flex items-center gap-3 hover:bg-teal-50 text-left"
                                                                                >
                                                                                        <div class="min-w-0">
                                                                                                <p class="text-sm font-semibold text-slate-800 truncate">{artist.artist}</p>
                                                                                                <p class="text-xs text-slate-500">#{artist.index + 1} - {artist.genre}</p>
                                                                                        </div>
                                                                                </button>
                                                                        {/each}
                                                                </div>
                                                        {/if}
                                                </div>

                                                {#if selectedArtist}
                                                        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                                                                <div class="flex items-center gap-3">
                                                                        <div>
                                                                                <p class="font-semibold text-slate-800">{selectedArtist.artist}</p>
                                                                                <p class="text-xs text-slate-500">Tap colors to match your game</p>
                                                                        </div>
                                                                </div>

                                                                <div class="grid grid-cols-3 gap-2 text-xs">
                                                                        {#each SPOTLE_ATTRIBUTES as attr}
                                                                                <div class="bg-white border border-slate-200 rounded-xl p-2 text-center shadow-sm">
                                                                                        <p class="text-slate-500">{attr.shortLabel}</p>
                                                                                        <p class="font-semibold text-slate-800 truncate">{attr.getDisplayValue(selectedArtist)}</p>
                                                                                        <button
                                                                                                type="button"
                                                                                                onclick={() => {
                                                                                                        currentFeedback = {
                                                                                                                ...currentFeedback,
                                                                                                                [attr.key]: getNextSpotleFeedback(currentFeedback[attr.key] as any)
                                                                                                        };
                                                                                                }}
                                                                                                class={`mt-1 w-full h-6 rounded-lg text-[10px] font-bold ${
                                                                                                        currentFeedback[attr.key] === 'green'
                                                                                                                ? 'bg-teal-500 text-white'
                                                                                                                : currentFeedback[attr.key] === 'yellow'
                                                                                                                        ? 'bg-amber-400 text-black'
                                                                                                                        : 'bg-slate-200 text-slate-600'
                                                                                                }`}
                                                                                        >
                                                                                                {currentFeedback[attr.key] === 'green'
                                                                                                        ? 'Match'
                                                                                                        : currentFeedback[attr.key] === 'yellow'
                                                                                                                ? 'Close'
                                                                                                                : 'Wrong'}
                                                                                        </button>
                                                                                        {#if attr.hasArrow}
                                                                                                <button
                                                                                                        type="button"
                                                                                                        onclick={() => {
                                                                                                                currentFeedback = {
                                                                                                                        ...currentFeedback,
                                                                                                                        [attr.arrowKey!]: getNextSpotleArrow(
                                                                                                                                currentFeedback[attr.arrowKey!] as any
                                                                                                                        )
                                                                                                                };
                                                                                                        }}
                                                                                                        class={`mt-1 w-full h-5 rounded-lg text-[10px] font-semibold ${
                                                                                                                currentFeedback[attr.arrowKey!] === 'up'
                                                                                                                        ? 'bg-sky-500 text-white'
                                                                                                                        : currentFeedback[attr.arrowKey!] === 'down'
                                                                                                                                ? 'bg-orange-500 text-white'
                                                                                                                                : 'bg-slate-200 text-slate-600'
                                                                                                        }`}
                                                                                                >
                                                                                                        {currentFeedback[attr.arrowKey!] === 'up'
                                                                                                                ? 'Higher'
                                                                                                                : currentFeedback[attr.arrowKey!] === 'down'
                                                                                                                        ? 'Lower'
                                                                                                                        : 'Same'}
                                                                                                </button>
                                                                                        {/if}
                                                                                </div>
                                                                        {/each}
                                                                </div>

                                                                <button
                                                                        type="button"
                                                                        onclick={addGuess}
                                                                        class="w-full rounded-xl bg-teal-500 text-white font-semibold py-2 hover:bg-teal-600 shadow-md"
                                                                >
                                                                        Add Guess
                                                                </button>
                                                        </div>
                                                {/if}

                                                <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
                                                        <span>Guesses: {guesses.length}</span>
                                                        <button
                                                                type="button"
                                                                onclick={resetAll}
                                                                class="text-teal-600 hover:text-teal-700 font-medium"
                                                        >
                                                                Reset
                                                        </button>
                                                </div>
                                        </div>

                                        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg">
                                                <h3 class="text-sm font-semibold text-slate-600 mb-3">Quick Picks</h3>
                                                <div class="flex flex-wrap gap-2 text-xs">
                                                        {#each ['Drake', 'Taylor Swift', 'Bad Bunny', 'The Weeknd', 'Ed Sheeran', 'Beyonce'] as name}
                                                                {@const artist = artists.find((a) => a.artist === name)}
                                                                {#if artist}
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => selectArtist(artist)}
                                                                                class="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 transition-colors"
                                                                        >
                                                                                {name.split(' ')[0]}
                                                                        </button>
                                                                {/if}
                                                        {/each}
                                                </div>
                                        </div>
                                </section>

                                <section class="lg:col-span-4 space-y-6">
                                        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg">
                                                <div class="flex items-center justify-between mb-4">
                                                        <h2 class="text-lg font-semibold text-slate-800">Your Guesses</h2>
                                                        {#if guesses.length > 0}
                                                                <button
                                                                        type="button"
                                                                        onclick={resetAll}
                                                                        class="text-xs text-red-500 hover:text-red-600 font-medium"
                                                                >
                                                                        Clear All
                                                                </button>
                                                        {/if}
                                                </div>
                                                {#if guesses.length === 0}
                                                        <p class="text-sm text-slate-400">Add guesses to start filtering.</p>
                                                {:else}
                                                        <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                                                {#each guesses as guess, index}
                                                                        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                                                                                <div class="flex items-center justify-between mb-2">
                                                                                        <div class="flex items-center gap-2">
                                                                                                <div>
                                                                                                        <p class="text-sm font-semibold text-slate-800">{guess.artist.artist}</p>
                                                                                                        <p class="text-[10px] text-slate-500">#{guess.artist.index + 1}</p>
                                                                                                </div>
                                                                                        </div>
                                                                                        <button
                                                                                                type="button"
                                                                                                onclick={() => (guesses = guesses.filter((_, i) => i !== index))}
                                                                                                class="text-xs text-red-500 hover:text-red-600"
                                                                                        >
                                                                                                Remove
                                                                                        </button>
                                                                                </div>
                                                                                <div class="grid grid-cols-3 gap-2 text-[10px]">
                                                                                        {#each SPOTLE_ATTRIBUTES as attr}
                                                                                                <div class="bg-white border border-slate-200 rounded-lg p-2 text-center shadow-sm">
                                                                                                        <p class="text-slate-500">{attr.shortLabel}</p>
                                                                                                        <p class="font-semibold text-slate-800">{attr.getDisplayValue(guess.artist)}</p>
                                                                                                        <p class="mt-1 text-slate-600">
                                                                                                                {guess.feedback[attr.key]}
                                                                                                                {#if attr.hasArrow}
                                                                                                                        ({guess.feedback[attr.arrowKey!]})
                                                                                                                {/if}
                                                                                                        </p>
                                                                                                </div>
                                                                                        {/each}
                                                                                </div>
                                                                        </div>
                                                                {/each}
                                                        </div>
                                                {/if}
                                        </div>
                                </section>

                                <section class="lg:col-span-4 space-y-6">
                                        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg">
                                                <h2 class="text-lg font-semibold text-slate-800 mb-4">Best Suggestions</h2>
                                                {#if remainingCandidates.length === 0}
                                                        <p class="text-sm text-slate-400">No matches found.</p>
                                                {:else}
                                                        <div class="space-y-2">
                                                                {#each remainingCandidates.slice(0, 5) as artist, i}
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => selectArtist(artist)}
                                                                                class="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 hover:bg-teal-50 hover:border-teal-300 transition-colors"
                                                                        >
                                                                                <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">
                                                                                        {i + 1}
                                                                                </div>
                                                                                <div class="min-w-0 text-left">
                                                                                        <p class="text-sm font-semibold text-slate-800 truncate">{artist.artist}</p>
                                                                                        <p class="text-xs text-slate-500">
                                                                                                #{artist.index + 1} - {artist.genre}
                                                                                        </p>
                                                                                </div>
                                                                        </button>
                                                                {/each}
                                                        </div>
                                                {/if}
                                        </div>

                                        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg">
                                                <h3 class="text-sm font-semibold text-slate-600 mb-3">Remaining Candidates</h3>
                                                {#if remainingCandidates.length <= 15}
                                                        <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                                                {#each remainingCandidates as artist}
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => selectArtist(artist)}
                                                                                class="w-full flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 hover:bg-teal-50 hover:border-teal-300 transition-colors"
                                                                        >
                                                                                <span class="text-xs font-medium truncate flex-1 text-left text-slate-700">{artist.artist}</span>
                                                                                <span class="text-[10px] text-slate-400">#{artist.index + 1}</span>
                                                                        </button>
                                                                {/each}
                                                        </div>
                                                {:else}
                                                        <p class="text-sm text-slate-500">{remainingCandidates.length} candidates remaining.</p>
                                                {/if}
                                        </div>
                                </section>
                        </div>
                {/if}
        </div>

        

    <div class="mt-12">
      <StaticArticle content={ARTICLE_CONTENT['spotle-solver']} />

      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </section>
