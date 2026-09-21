<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import { browser } from '$app/environment';
        import { onMount } from 'svelte';
        import { fetchArchivePayload } from '$lib/archive-client';
        import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
        import {
                COUNTRY_NAMES,
                GENDER_NAMES,
                formatSpotleDate,
                type SpotleArtist,
                type SpotleData
        } from '$lib/spotle';
        import spotleData from '../../../../static/spotle_data.json';
        import { getPuzzleDateForGame } from '$lib/puzzle-window';

        interface SelectedSpotle {
                date: string;
                formattedDate: string;
                dayNumber: number;
                artistName: string;
                track: string | null;
                soundcloudUrl: string | null;
                artist: SpotleArtist | null;
        }

        interface SpotleArchivePayload {
                availableDateStrings: string[];
                selectedDateKey: string | null;
                selectedSpotle: SelectedSpotle | null;
        }

        const localSpotleData = spotleData as SpotleData;
        const todayKey = formatSpotleDate(getPuzzleDateForGame('spotle'));
        const localAvailableDateStrings = (localSpotleData.answers ?? [])
                .map((entry) => entry.date)
                .filter((dateString) => dateString <= todayKey)
                .sort();

        let data = $state<SpotleArchivePayload>({
                availableDateStrings: localAvailableDateStrings,
                selectedDateKey: null,
                selectedSpotle: null
        });
        let isLoading = $state(false);
        let loadError = $state<string | null>(null);

        let availableDates = $derived(
                (data.availableDateStrings ?? []).map((dateString: string) => new Date(`${dateString}T12:00:00`))
        );
        let startDate = $derived(availableDates[0] ?? new Date());
        let selectedDateParam = $state<string | null>(
                browser ? new URL(window.location.href).searchParams.get('date') : null
        );

        function toSpotifyArtistUrl(uri?: string): string | null {
                if (!uri?.startsWith('spotify:artist:')) {
                        return null;
                }

                return `https://open.spotify.com/artist/${uri.replace('spotify:artist:', '')}`;
        }

        onMount(() => {
                if (window.location.search || window.location.hash) {
                        window.history.replaceState(window.history.state, '', window.location.pathname);
                }
        });

        function handleDateSelect(dateKey: string): void {
                selectedDateParam = dateKey;
        }

        async function loadArchive(dateKey: string | null): Promise<void> {
                if (!dateKey) {
                        data.selectedDateKey = null;
                        data.selectedSpotle = null;
                        isLoading = false;
                        loadError = null;
                        return;
                }

                const requestDateKey = dateKey;
                isLoading = true;
                loadError = null;

                try {
                        const payload = await fetchArchivePayload<SpotleArchivePayload>('spotle', requestDateKey);

                        if (selectedDateParam !== requestDateKey) {
                                return;
                        }

                        data.availableDateStrings = payload.availableDateStrings ?? localAvailableDateStrings;
                        data.selectedDateKey = payload.selectedDateKey;
                        data.selectedSpotle = payload.selectedSpotle;
                } catch (error) {
                        if (selectedDateParam !== requestDateKey) {
                                return;
                        }

                        data.selectedDateKey = requestDateKey;
                        data.selectedSpotle = null;
                        loadError = error instanceof Error ? error.message : 'Failed to load the Spotle archive entry.';
                } finally {
                        if (selectedDateParam === requestDateKey) {
                                isLoading = false;
                        }
                }
        }

        $effect(() => {
                if (!browser) {
                        return;
                }

                void loadArchive(selectedDateParam);
        });
</script>

<svelte:head>
        <title>Spotle Archive - Complete Artist Answer History</title>
        <meta name="description" content="Browse the full Spotle archive by date, with the artist, the track, and the stored music metadata for every past puzzle answer in one searchable list." />
        <link rel="canonical" href="https://wordsolverx.com/spotle-archive" />
        <meta property="og:title" content="Spotle Archive - All Past Artist Answers" />
        <meta property="og:description" content="Complete history of Spotle answers with artist details, music metadata, and date-based browsing." />
        <meta property="og:url" content="https://wordsolverx.com/spotle-archive" />
        <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
        gameName="Spotle"
        gameColor="teal"
        gameIcon="Sp"
        {startDate}
        {availableDates}
        basePath="/spotle-archive"
        selectedDate={data.selectedDateKey}
        description="Every Spotle artist answer with richer profile data when the source provides it."
        onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="mx-auto max-w-4xl scroll-mt-28 px-4 pb-14 sm:px-6 lg:px-8">
        {#if data.selectedSpotle}
                <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
                        <div class="mb-8 text-center">
                                <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
                                <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
                                        Spotle answer for {data.selectedSpotle.formattedDate}
                                </h2>
                        </div>

                        <div class="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
                                <div class="rounded-xl border border-teal-200 bg-teal-50/70 p-8 dark:border-teal-800/40 dark:bg-teal-950/20">
                                        <p class="text-sm font-semibold text-teal-700 dark:text-teal-300">Day #{data.selectedSpotle.dayNumber}</p>
                                        <p class="mt-3 text-4xl font-black text-slate-900 dark:text-white">{data.selectedSpotle.artistName}</p>

                                        {#if data.selectedSpotle.track}
                                                <p class="mt-4 text-base text-slate-700 dark:text-slate-200">
                                                        Featured track: <span class="font-semibold">{data.selectedSpotle.track}</span>
                                                </p>
                                        {/if}

                                        {#if data.selectedSpotle.artist}
                                                <div class="mt-6 grid gap-3 sm:grid-cols-2">
                                                        <div class="rounded-lg bg-white/80 p-4 dark:bg-slate-900/60">
                                                                <p class="text-xs text-slate-500 dark:text-slate-400">Country</p>
                                                                <p class="mt-2 font-semibold text-slate-900 dark:text-white">
                                                                        {COUNTRY_NAMES[data.selectedSpotle.artist.country] ??
                                                                                data.selectedSpotle.artist.country.toUpperCase()}
                                                                </p>
                                                        </div>
                                                        <div class="rounded-lg bg-white/80 p-4 dark:bg-slate-900/60">
                                                                <p class="text-xs text-slate-500 dark:text-slate-400">Genre</p>
                                                                <p class="mt-2 font-semibold text-slate-900 dark:text-white">{data.selectedSpotle.artist.genre}</p>
                                                        </div>
                                                        <div class="rounded-lg bg-white/80 p-4 dark:bg-slate-900/60">
                                                                <p class="text-xs text-slate-500 dark:text-slate-400">Debut</p>
                                                                <p class="mt-2 font-semibold text-slate-900 dark:text-white">{data.selectedSpotle.artist.debut_album_year}</p>
                                                        </div>
                                                        <div class="rounded-lg bg-white/80 p-4 dark:bg-slate-900/60">
                                                                <p class="text-xs text-slate-500 dark:text-slate-400">Gender</p>
                                                                <p class="mt-2 font-semibold text-slate-900 dark:text-white">
                                                                        {GENDER_NAMES[data.selectedSpotle.artist.gender] ?? data.selectedSpotle.artist.gender}
                                                                </p>
                                                        </div>
                                                </div>
                                        {/if}
                                </div>

                                <div class="rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white">
                                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">Music profile</p>
                                        {#if data.selectedSpotle.soundcloudUrl}
                                                <a
                                                        href={data.selectedSpotle.soundcloudUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        class="mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                                                >
                                                        Listen on SoundCloud
                                                </a>
                                        {/if}
                                        {#if toSpotifyArtistUrl(data.selectedSpotle.artist?.uri)}
                                                <a
                                                        href={toSpotifyArtistUrl(data.selectedSpotle.artist?.uri) ?? '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        class="mt-3 inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                                >
                                                        Open artist profile
                                                </a>
                                        {/if}
                                        <p class="mt-5 text-sm leading-6 text-teal-50">
                                                No images are rendered on this archive page. The focus stays on the answer, the date, and the music metadata we can safely display.
                                        </p>
                                </div>
                        </div>
                </div>
        {:else if loadError}
                <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
                        <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Spotle date</h2>
                        <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
                </div>
        {:else if isLoading && data.selectedDateKey}
                <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Spotle archive entry...</h2>
                        <p class="mt-3 text-slate-600 dark:text-slate-300">
                                Pulling the selected artist answer into this archive page now.
                        </p>
                </div>
        {:else}
                <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Choose a Spotle date above</h2>
                        <p class="mt-3 text-slate-600 dark:text-slate-300">
                                The selected artist answer and the stored music details will render here.
                        </p>
                </div>
        {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Spotle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Spotle artist since launch, with genre, debut year, and country of origin.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Spotle Works</h3>
      <p>You guess a music artist and get feedback on genre, debut year, group size, gender, and nationality. The trick is narrowing genre and decade first, then using the specific attributes to zero in. A first guess from a genre you know well saves you more guesses than a random pick.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How far back does the archive go?</h4>
      <p>Since Spotle launched. Every artist is stored with date, genre, debut year, and country.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are the artists all well-known?</h4>
      <p>Mix of mainstream and niche. Some days you'll get a household name, other days you'll discover someone new.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does genre help narrow it down fast?</h4>
      <p>Genre is the strongest first filter — it cuts the pool by 80% or more. Start there, then use debut year to narrow further.</p>
    </div>
  </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </article>
