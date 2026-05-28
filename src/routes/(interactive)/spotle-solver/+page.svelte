<script lang="ts">
        import { onMount } from 'svelte';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import FAQSection from '$lib/components/FAQSection.svelte';
        import { generateBreadcrumbSchema, generateWebPageSchema } from '$lib/seo';
import AuthorCard from '$lib/components/AuthorCard.svelte';
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

        const faqs = [
                {
                        question: 'What is Spotle?',
                        answer: 'Spotle is a daily music guessing game where you try to identify a mystery Spotify artist in 10 guesses or fewer. After each guess, you get feedback on multiple attributes like rank, debut year, genre, country, group size, and gender — similar to Wordle but for music artists.'
                },
                {
                        question: 'How does the Spotle solver work?',
                        answer: 'Search for an artist you want to guess, then set the feedback colors (green/yellow/gray) and arrows (higher/lower) for each attribute to match what the game shows. Click "Add Guess" and the solver filters the entire artist pool in real time, showing only candidates that match all your clues.'
                },
                {
                        question: 'Does the solver use the same artist data as Spotle?',
                        answer: 'The solver draws from the same pool of popular Spotify artists that the game uses. Its filtering logic matches Spotle\'s attribute comparison rules — including proximity thresholds for yellow feedback and the direction arrows for numeric attributes.'
                },
                {
                        question: 'Can I use the solver for the daily Spotle puzzle?',
                        answer: 'Yes. Enter your guesses and feedback exactly as they appear in today\'s Spotle game. The solver filters candidates in real time, so you can narrow down the answer within a few guesses regardless of which artist was chosen.'
                },
                {
                        question: 'What do the green, yellow, and gray feedback colors mean in Spotle?',
                        answer: 'Green means the attribute matches exactly — same genre, same country, same rank number. Yellow means the attribute is close — similar but not exact, like a nearby rank or a related genre. Gray means the attribute is wrong and the mystery artist\'s value is far from your guess.'
                },
                {
                        question: 'How many guesses does it usually take to solve Spotle?',
                        answer: 'With the solver, most players identify the artist in 3-4 guesses. The real-time filtering eliminates large portions of the artist pool after each guess, so you converge quickly. Without a solver, players typically need 5-7 guesses, and many fail to solve within the 10-guess limit.'
                }
        ];

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
                content="Solve Spotle faster with our Spotify artist solver. Match rank, debut year, genre, country, and more using precise feedback filters."
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
        {@html `<script type="application/ld+json">${JSON.stringify({
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
                                '@type': 'FAQPage',
                                mainEntity: faqs.map((faq) => ({
                                        '@type': 'Question',
                                        name: faq.question,
                                        acceptedAnswer: { '@type': 'Answer', text: faq.answer }
                                }))
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
        })}</script>`}
</svelte:head>

<main class="min-h-screen bg-teal-50">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumbs />
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

        <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                        <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Spotle?</h2>
                        <p class="text-slate-600 leading-relaxed mb-4">
                                Spotle is a daily music guessing game that works like Wordle for Spotify artists. You get 10 guesses to identify a mystery artist, and after each guess you receive feedback on six attributes: rank, debut year, genre, country, group size, and gender. The goal is to use that feedback to narrow down who the mystery artist is.
                        </p>
                        <p class="text-slate-600 leading-relaxed mb-4">
                                The game pulls from roughly the top 1,000 Spotify artists, so you are dealing with artists people actually listen to — not obscure deep cuts. Taylor Swift, Drake, Bad Bunny, The Weeknd, Ed Sheeran. These names come up a lot, which means genre, rank, and country clues eliminate huge swaths of the pool fast.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                                A new puzzle drops daily. Some days the answer is obvious after two guesses. Other days you burn through six guesses and still feel lost. The difference almost always comes down to how efficiently you use the feedback from each attribute.
                        </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                        <h2 class="text-3xl font-bold text-slate-900 mb-5">How Spotle Feedback Works</h2>
                        <p class="text-slate-600 leading-relaxed mb-6">
                                Every guess returns feedback on six attributes. Each attribute gets a color — green, yellow, or gray — and some attributes also show directional arrows. Here is what each signal means.
                        </p>
                        <div class="space-y-4 mb-6">
                                <div class="rounded-xl bg-teal-50 border border-teal-200 p-5">
                                        <h3 class="text-lg font-bold text-teal-700 mb-2">Green — Exact match</h3>
                                        <p class="text-slate-600">The attribute matches the mystery artist exactly. Same genre, same country, same gender. Green feedback is the strongest signal you can get — it locks in that attribute and eliminates every artist who does not share it.</p>
                                </div>
                                <div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
                                        <h3 class="text-lg font-bold text-amber-700 mb-2">Yellow — Close but not exact</h3>
                                        <p class="text-slate-600">The attribute is in the right neighborhood but not a perfect match. For numerical attributes like rank and debut year, yellow means the real value is nearby. For categorical attributes like genre, it means something related. Yellow narrows the range but does not pin it down.</p>
                                </div>
                                <div class="rounded-xl bg-slate-100 border border-slate-200 p-5">
                                        <h3 class="text-lg font-bold text-slate-700 mb-2">Gray — Wrong</h3>
                                        <p class="text-slate-600">The attribute does not match at all. Different genre, different country, different gender. Gray feedback is just as useful as green — it tells you what the answer is not, which eliminates a lot of artists.</p>
                                </div>
                        </div>
                        <p class="text-slate-600 leading-relaxed mb-4">
                                Numerical attributes — rank and debut year — also show arrows. An up arrow means the mystery artist's value is higher (higher rank number or later debut year). A down arrow means it is lower. These arrows are arguably the most powerful feedback in the game because they create hard numeric bounds on the answer.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                                Combine the arrow direction with the color and you get precise constraints. Green on rank means you found the exact rank. Yellow with a down arrow on debut year means the mystery artist debuted slightly before your guess. Gray with an up arrow on rank means the answer is way lower on the chart. Each piece of feedback tightens the filter.
                        </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                        <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Use a Spotle Solver</h2>
                        <p class="text-slate-600 leading-relaxed mb-6">
                                Spotle gives you 10 guesses, which feels generous until you realize that 1,000 artists is a lot of ground to cover. A solver turns those 10 guesses from scattered stabs into a systematic elimination process.
                        </p>
                        <div class="space-y-4">
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">1</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Real-time filtering eliminates mental math</h3>
                                                <p class="text-slate-600">After each guess, you need to cross-reference six different attributes against 1,000 artists. That is 6,000 data points to track. The solver filters the entire pool instantly, so you see only the artists that match every single clue. No mental gymnastics required.</p>
                                        </div>
                                </div>
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">2</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Attribute overlap is hard to reason about</h3>
                                                <p class="text-slate-600">Knowing the genre is "Pop" and the country is "United States" narrows the pool significantly. But adding that the debut year is close to 2008 and the gender is "Female" — that intersection is where most people lose track. The solver handles multi-attribute intersections correctly every time.</p>
                                        </div>
                                </div>
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">3</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Arrow feedback creates numeric windows</h3>
                                                <p class="text-slate-600">When rank is yellow with a down arrow, the answer is somewhere in a narrow numeric window. Manually estimating that window and checking which artists fall inside it is tedious and error-prone. The solver computes exact ranges and shows you only qualifying artists.</p>
                                        </div>
                                </div>
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">4</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Stop guessing the same artists twice</h3>
                                                <p class="text-slate-600">Without a tracker, it is easy to accidentally guess an artist you already tried or one whose attributes contradict earlier feedback. The solver keeps a clean guess history and only suggests candidates that are consistent with all previous clues.</p>
                                        </div>
                                </div>
                        </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                        <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Spotle Solver Works</h2>
                        <p class="text-slate-600 leading-relaxed mb-4">
                                The solver loads the full Spotle artist list when the page opens. When you add a guess with feedback, it runs the filter function across every artist in the pool and removes any that contradict your clues. The remaining candidates are displayed as ranked suggestions.
                        </p>
                        <p class="text-slate-600 leading-relaxed mb-4">
                                Each attribute is checked independently. For green feedback, the candidate must match that attribute exactly. For yellow, the candidate must be within the proximity threshold the game uses. For gray, the candidate must fall outside that threshold. Arrows add directional constraints — a "higher" arrow on rank means the mystery artist's rank number is larger than your guess's rank.
                        </p>
                        <p class="text-slate-600 leading-relaxed mb-4">
                                All filters stack. If your first guess eliminates 600 artists and your second guess eliminates another 250 from the remaining 400, you are left with 150 candidates after just two guesses. Three or four well-chosen guesses typically narrow the pool to under 20 artists, and by that point the answer is usually obvious.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                                The suggestions panel shows the top remaining candidates, sorted by relevance. Quick picks let you load popular artists instantly without searching. The entire workflow — search, set feedback, add guess, view results — runs locally in your browser with no server round trips.
                        </p>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
                        <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Getting Better at Spotle</h2>
                        <p class="text-slate-600 leading-relaxed mb-6">
                                The solver does the filtering, but picking the right artists to guess first makes the process faster. Here are strategies that work.
                        </p>
                        <div class="space-y-4">
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">1</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Start with artists you know well</h3>
                                                <p class="text-slate-600">When you know an artist's attributes by heart — Drake is a Canadian male solo rapper who debuted around 2009 and ranks in the top 5 — you can set the feedback quickly and accurately. Familiarity reduces the chance of misreading the game's feedback, which is the most common way solvers go off track.</p>
                                        </div>
                                </div>
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">2</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Use rank and debut year as anchors</h3>
                                                <p class="text-slate-600">These two attributes carry the most information because they are numerical. A yellow-and-arrow response on rank tells you the answer is within a specific range. Genre and country are categorical, which means they split the pool into chunks but do not create the same fine-grained narrowing. Prioritize guesses that give you clear rank and debut year signals.</p>
                                        </div>
                                </div>
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">3</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Pay attention to genre + country combos</h3>
                                                <p class="text-slate-600">Some genre-country pairs are rare. A Korean Pop artist from South Korea narrows things down fast. A Latin artist from Puerto Rico also has a short list. When you see green on genre or country, immediately think about which artists fit both — the intersection is usually small.</p>
                                        </div>
                                </div>
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">4</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Group size is an underrated filter</h3>
                                                <p class="text-slate-600">Whether the artist is a solo act, a duo, or a group of 3+ eliminates a huge chunk of the pool. If you guess a solo artist and group size turns gray, you know the answer is a band or duo. That single piece of feedback removes hundreds of solo artists instantly.</p>
                                        </div>
                                </div>
                                <div class="flex gap-4">
                                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">5</div>
                                        <div>
                                                <h3 class="font-bold text-slate-900 mb-1">Avoid narrow early guesses</h3>
                                                <p class="text-slate-600">Guessing a niche artist first wastes a turn because you learn very little. An artist ranked #800 with an unusual genre and country gives you feedback that eliminates only a handful of similar artists. Start big — guess someone in the top 20 — and let the broad feedback do the heavy lifting before you zoom in.</p>
                                        </div>
                                </div>
                        </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                        <h2 class="text-3xl font-bold text-slate-900 mb-5">Understanding Spotle Artist Attributes</h2>
                        <p class="text-slate-600 leading-relaxed mb-6">
                                Every artist in the Spotle pool has six attributes. Each one filters the answer differently. Here is what each attribute tells you and how to use the feedback effectively.
                        </p>
                        <div class="space-y-4 mb-6">
                                <div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
                                        <h3 class="text-lg font-bold text-amber-700 mb-2">Rank</h3>
                                        <p class="text-slate-600">The artist's position on the Spotify charts, numbered from 1 (most popular) downward. Rank is a numerical attribute, so it gives you arrow feedback — higher or lower — in addition to color. A green rank means you hit the exact number. A yellow rank with an up arrow means the answer ranks somewhere nearby but with a higher number. Use the arrow to create a numeric window: if your guess is rank #15 and the arrow points down, the answer is somewhere in the top 14.</p>
                                </div>
                                <div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
                                        <h3 class="text-lg font-bold text-amber-700 mb-2">Debut Year</h3>
                                        <p class="text-slate-600">The year the artist first appeared on Spotify's radar. Like rank, this is numerical and gives arrow feedback. If you guess an artist who debuted in 2015 and get a yellow with a down arrow, the answer debuted within a few years of 2015 but earlier. Debut year is especially useful for separating legacy artists (pre-2000) from modern ones (post-2010).</p>
                                </div>
                                <div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
                                        <h3 class="text-lg font-bold text-amber-700 mb-2">Genre</h3>
                                        <p class="text-slate-600">The artist's primary genre classification — Pop, Hip-Hop, Latin, Rock, R&B, K-Pop, and so on. Genre is categorical, so it does not have arrows. Green means exact match. Yellow means a related genre (Pop and Dance-Pop, for example). Gray means a completely different genre. Green on genre is one of the most powerful clues because it eliminates roughly 80-90% of the pool immediately.</p>
                                </div>
                                <div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
                                        <h3 class="text-lg font-bold text-amber-700 mb-2">Country</h3>
                                        <p class="text-slate-600">The artist's country of origin. United States, United Kingdom, Canada, South Korea, Puerto Rico, and Brazil are common. Like genre, this is categorical with no arrows. Green means same country. Yellow means a neighboring or culturally related country. Gray means a different region entirely. Combined with genre, country often identifies the answer within 10-20 candidates.</p>
                                </div>
                                <div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
                                        <h3 class="text-lg font-bold text-amber-700 mb-2">Group Size</h3>
                                        <p class="text-slate-600">Whether the artist is a solo act, a duo, or a group with three or more members. This attribute has three possible values, making it a quick eliminator. If you guess a solo artist and group size turns green, the answer is also solo — that removes all bands and duos. If it turns gray, the answer is either a duo or a larger group, cutting the pool roughly in half.</p>
                                </div>
                                <div class="rounded-xl bg-amber-50 border border-amber-200 p-5">
                                        <h3 class="text-lg font-bold text-amber-700 mb-2">Gender</h3>
                                        <p class="text-slate-600">Male, Female, or Mixed (for groups with members of different genders). Another categorical attribute with three values. Green on gender means you have the right category. Combined with group size, gender feedback tells you whether to look for a solo female, a male duo, a mixed group, and so on. Two guesses that nail both attributes can eliminate 70% of the pool.</p>
                                </div>
                        </div>
                        <p class="text-slate-600 leading-relaxed">
                                No single attribute solves the puzzle on its own. The power comes from combining them. Each guess gives you six data points, and after two guesses you have twelve constraints working together. That is where the solver shines — it handles the combinatorial filtering that humans struggle to track mentally. Try it on your next daily Spotle and watch how fast the candidate pool shrinks.
                        </p>
                </section>

                <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
                        <FAQSection title="Spotle Solver FAQ" {faqs} class="py-0" />
                </div>

                <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
                        <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
                        <div class="flex flex-wrap justify-center gap-3">
                                {#each solverLinks as link}
                                        <a href={link.href} class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                                {link.label}
                                        </a>
                                {/each}
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
