<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import { browser } from '$app/environment';
        import { onMount } from 'svelte';
        import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
        import { fetchArchivePayload } from '$lib/archive-client';

        interface WorgleArchivePayload {
                availableDateStrings: string[];
                selectedDateKey: string | null;
                selectedWorgle: {
                        date: string;
                        word: string;
                        puzzle: number;
                        formattedDate: string;
                } | null;
        }

        let data = $state<WorgleArchivePayload>({
                availableDateStrings: [],
                selectedDateKey: null,
                selectedWorgle: null
        });
        let isLoading = $state(false);
        let loadError = $state<string | null>(null);
        let selectedDateParam = $state<string | null>(
                browser ? new URL(window.location.href).searchParams.get('date') : null
        );

        const startDate = new Date('2021-06-19T12:00:00Z');
        let availableDates = $derived(
                (data.availableDateStrings ?? []).map((dateString) => new Date(`${dateString}T12:00:00`))
        );

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
                        data.selectedWorgle = null;
                        isLoading = false;
                        loadError = null;
                        return;
                }

                const requestDateKey = dateKey;
                isLoading = true;
                loadError = null;

                try {
                        const payload = await fetchArchivePayload<WorgleArchivePayload>('worgle', requestDateKey);

                        if (selectedDateParam !== requestDateKey) {
                                return;
                        }

                        data = payload;
                } catch (error) {
                        if (selectedDateParam !== requestDateKey) {
                                return;
                        }

                        data.selectedDateKey = requestDateKey;
                        data.selectedWorgle = null;
                        loadError = error instanceof Error ? error.message : 'Failed to load the Worgle archive entry.';
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
        <title>Worgle Archive - All Past Answers</title>
        <meta name="description" content="Browse the Worgle archive by date with puzzle numbers and direct answer lookups." />
        <meta property="og:title" content="Worgle Archive - All Past Answers" />
        <meta property="og:description" content="Browse the Worgle archive by date with puzzle numbers and direct answer lookups." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wordsolverx.com/worgle-archive" />
        <meta property="og:site_name" content="WordSolverX" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Worgle Archive - All Past Answers" />
        <meta name="twitter:description" content="Browse the Worgle archive by date with puzzle numbers and direct answer lookups." />
        <link rel="canonical" href="https://wordsolverx.com/worgle-archive" />
</svelte:head>

<ArchiveCalendar
        gameName="Worgle"
        gameColor="teal"
        gameIcon="Wo"
        {startDate}
        {availableDates}
        basePath="/worgle-archive"
        selectedDate={data.selectedDateKey}
        description="Every stored Worgle answer with the matching puzzle number."
        onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="mx-auto max-w-4xl scroll-mt-28 px-4 pb-14 sm:px-6 lg:px-8">
        {#if data.selectedWorgle}
                <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
                        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Selected archive date</p>
                        <h2 class="mt-3 text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50">
                                Worgle answer for {data.selectedWorgle.formattedDate}
                        </h2>
                        <div class="mt-6 grid gap-6 md:grid-cols-[1fr_0.8fr]">
                                <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Puzzle #{data.selectedWorgle.puzzle}</p>
                                        <div class="mt-4 flex flex-wrap gap-2">
                                                {#each data.selectedWorgle.word.toUpperCase().split('') as letter}
                                                        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-lg font-black text-white dark:bg-white/10 dark:text-slate-100 dark:border dark:border-slate-600">
                                                                {letter}
                                                        </div>
                                                {/each}
                                        </div>
                                </div>
                                <div class="rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white">
                                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">Archive note</p>
                                        <p class="mt-4 text-sm leading-7 text-teal-100">
                                                Worgle uses a fixed daily answer, so the archive doubles as a date-by-date lookup table and a puzzle-number history.
                                        </p>
                                </div>
                        </div>
                </div>
        {:else if loadError}
                <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
                        <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Worgle date</h2>
                        <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
                </div>
        {:else if isLoading && data.selectedDateKey}
                <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Worgle archive entry...</h2>
                        <p class="mt-3 text-slate-600 dark:text-slate-300">Pulling the selected answer into the archive view now.</p>
                </div>
        {:else}
                <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Choose a Worgle date above</h2>
                        <p class="mt-3 text-slate-600 dark:text-slate-300">The selected word and puzzle number will appear here.</p>
                </div>
        {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Worgle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Worgle answer since launch. All Welsh words, all in one place.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Worgle Works</h3>
      <p>It's Wordle in Welsh. Six guesses, five letters, same color feedback. But Welsh has a different alphabet and letter frequency — W, Y, and DD are very common. English letter patterns will mislead you here. If you don't speak Welsh, the archive is your best teacher for what kinds of words show up.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Do I need to speak Welsh?</h4>
      <p>It helps, but plenty of non-Welsh speakers enjoy it. The archive teaches you which letter combinations are valid Welsh words over time.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Which letters should I prioritize?</h4>
      <p>W, Y, DD, LL, CH, and RH are all common in Welsh. Start with words that include these to cover the most ground.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does the archive go back to launch?</h4>
      <p>Yes — every Worgle answer since the game started is stored here.</p>
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
