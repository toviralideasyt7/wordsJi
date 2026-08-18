<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import type { SearchleDailyPuzzle } from '$lib/searchle/daily';

  interface SearchleArchivePayload {
    selectedDateKey: string | null;
    selectedPuzzle: SearchleDailyPuzzle | null;
  }

  let data = $state<SearchleArchivePayload>({
    selectedDateKey: null,
    selectedPuzzle: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = new Date(2023, 5, 22);
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
      data.selectedPuzzle = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<SearchleArchivePayload>('searchle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedPuzzle = payload.selectedPuzzle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedPuzzle = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Searchle archive entry.';
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
  <title>Searchle Archive - Complete Prompt Answer History</title>
  <meta name="description" content="Browse the complete archive of all Searchle answers. Calendar view with direct access to past autocomplete prompts and confirmed answers." />
  <link rel="canonical" href="https://wordsolverx.com/searchle-archive" />
  <meta property="og:title" content="Searchle Archive - All Past Answers" />
  <meta property="og:description" content="Complete history of every Searchle answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/searchle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Searchle"
  gameColor="teal"
  gameIcon="Sr"
  {startDate}
  basePath="/searchle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Searchle prompt and answer. Browse the full autocomplete puzzle history."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedPuzzle}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="text-center mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Searchle answer for {data.selectedDateKey}
        </h2>
      </div>
      <div class="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/50 p-8 text-center dark:border-teal-800/40 dark:from-teal-950/30 dark:to-teal-900/20">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">Prompt</p>
        <p class="mt-4 text-xl italic text-slate-700 dark:text-slate-200">
          "{data.selectedPuzzle.prompt}"
        </p>
        <p class="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">Answer</p>
        <p class="mt-4 font-mono text-4xl font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
          {data.selectedPuzzle.answer}
        </p>
      </div>
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Searchle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Searchle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected prompt and answer into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Pick a Searchle date above</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The archived prompt and answer will render here on the same page.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Searchle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Searchle prompt and answer since launch. See what people are searching for.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Searchle Works</h3>
      <p>You see a Google autocomplete prompt and guess what people actually search for. The answers reflect real search trends — pop culture, current events, and evergreen questions dominate. There's no letter-matching or color feedback like Wordle. You either know what people search for or you don't.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are the prompts based on real Google data?</h4>
      <p>Yes — the prompts and answers come from actual Google autocomplete predictions.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can I search the archive by prompt?</h4>
      <p>You can browse by date. If you remember the rough timeframe, you'll find the prompt and answer for that day.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Why are some answers surprising?</h4>
      <p>Because what people actually search for and what you think they search for are often different things. That's the whole fun of the game.</p>
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
