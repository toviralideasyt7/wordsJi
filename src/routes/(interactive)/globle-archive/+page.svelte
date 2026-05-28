<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import GlobleCluesSection from '$lib/components/GlobleCluesSection.svelte';
  import type { GlobleDayData } from '$lib/globle-date';

  interface GlobleArchivePayload {
    selectedDateKey: string | null;
    selectedGloble: GlobleDayData | null;
  }

  let data = $state<GlobleArchivePayload>({
    selectedDateKey: null,
    selectedGloble: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = new Date(2022, 0, 1);
  let selectedDateParam = $state<string | null>(browser ? new URL(window.location.href).searchParams.get('date') : null);

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
      data.selectedGloble = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<GlobleArchivePayload>('globle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedGloble = payload.selectedGloble;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedGloble = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Globle archive entry.';
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
  <title>Globle Archive - Complete Country Answer History | WordSolverX</title>
  <meta name="description" content="Browse the complete archive of all Globle country answers. Calendar view with search and direct links to every past geography puzzle solution." />
  <link rel="canonical" href="https://wordsolverx.com/globle-archive" />
  <meta property="og:title" content="Globle Archive - All Past Country Answers" />
  <meta property="og:description" content="Complete history of every Globle country answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/globle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Globle"
  gameColor="teal"
  gameIcon="??"
  {startDate}
  basePath="/globle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Globle daily country answer. Find any past geography puzzle solution."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedGloble}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Globle answer for {data.selectedGloble.formattedDate}
        </h2>
      </div>
      <GlobleCluesSection country={data.selectedGloble.country} date={data.selectedGloble.formattedDate}>
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
          <div class="p-8 text-center">
            <div class="mb-6">
              <span class="inline-block rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium tracking-wide text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">ANSWER</span>
            </div>
            <h3 class="mb-8 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">{data.selectedGloble.country.name}</h3>
            <div class="grid gap-4 text-left md:grid-cols-2">
              <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div class="text-sm font-medium text-slate-600 dark:text-slate-300">Continent</div>
                <div class="text-lg font-bold text-slate-900 dark:text-white">{data.selectedGloble.country.continent}</div>
              </div>
              <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div class="text-sm font-medium text-slate-600 dark:text-slate-300">Subregion</div>
                <div class="text-lg font-bold text-slate-900 dark:text-white">{data.selectedGloble.country.subregion}</div>
              </div>
              <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div class="text-sm font-medium text-slate-600 dark:text-slate-300">Country Code</div>
                <div class="text-lg font-bold text-slate-900 dark:text-white">{data.selectedGloble.country.code}</div>
              </div>
              <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div class="text-sm font-medium text-slate-600 dark:text-slate-300">Coordinates</div>
                <div class="text-lg font-bold text-slate-900 dark:text-white">
                  {data.selectedGloble.country.latitude.toFixed(2)}°, {data.selectedGloble.country.longitude.toFixed(2)}°
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlobleCluesSection>
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Globle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Globle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected country answer into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Choose a country date from the archive</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The selected Globle answer and clue section will appear here without sending users to a thin dated page.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Globle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Globle country since launch. Practice your geography with past answers.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Globle Works</h3>
      <p>You guess a country and see how close it is on a heat map. Closer guesses turn warmer (red/orange), farther guesses stay cooler (blue/green). No word puzzles here — it's pure geography. Start with a central country on each continent to triangulate the region fast.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How far back does the archive go?</h4>
      <p>Since Globle launched. Every country is stored with its date.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does Globle use distance or direction?</h4>
      <p>Distance only, shown as a color gradient. Unlike Worldle, there's no directional arrow — you have to read the heat map.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Which countries come up most?</h4>
      <p>Browse the archive to see. Larger countries and well-known nations appear more often than tiny island states.</p>
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
