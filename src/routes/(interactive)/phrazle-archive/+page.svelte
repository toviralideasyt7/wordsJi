<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import { REFERENCE_DATE } from '$lib/phrazle/phrases';

  interface PhrazleArchivePayload {
    selectedDateKey: string | null;
    selectedAnswers: {
      morning: { phrase: string; index: number };
      afternoon: { phrase: string; index: number };
    } | null;
  }

  let data = $state<PhrazleArchivePayload>({
    selectedDateKey: null,
    selectedAnswers: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = REFERENCE_DATE;
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
      data.selectedAnswers = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<PhrazleArchivePayload>('phrazle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedAnswers = payload.selectedAnswers;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedAnswers = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Phrazle archive entry.';
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
  <title>Phrazle Archive - Complete Phrase Answer History</title>
  <meta name="description" content="Browse the complete archive of all Phrazle answers. Calendar view with direct access to both the morning and afternoon phrase for each date." />
  <link rel="canonical" href="https://wordsolverx.com/phrazle-archive" />
  <meta property="og:title" content="Phrazle Archive - All Past Answers" />
  <meta property="og:description" content="Complete history of every Phrazle phrase pair. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/phrazle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Phrazle"
  gameColor="teal"
  gameIcon="Pz"
  {startDate}
  basePath="/phrazle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Phrazle morning and afternoon answer. Browse the full phrase history."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedAnswers}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Phrazle answers for {data.selectedDateKey}
        </h2>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-amber-200 bg-amber-50/70 p-6 dark:border-amber-800/40 dark:bg-amber-950/20">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">Morning</p>
          <p class="mt-4 font-mono text-2xl font-black uppercase text-amber-700 dark:text-amber-300">
            {data.selectedAnswers.morning.phrase}
          </p>
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">Phrase #{data.selectedAnswers.morning.index}</p>
        </div>
        <div class="rounded-xl border border-teal-200 bg-teal-50/70 p-6 dark:border-teal-800/40 dark:bg-teal-950/20">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">Afternoon</p>
          <p class="mt-4 font-mono text-2xl font-black uppercase text-teal-700 dark:text-teal-300">
            {data.selectedAnswers.afternoon.phrase}
          </p>
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">Phrase #{data.selectedAnswers.afternoon.index}</p>
        </div>
      </div>
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Phrazle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Phrazle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected morning and afternoon phrases into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Choose a Phrazle date above</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The morning and afternoon phrase answers will load here for the selected date.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Phrazle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Phrazle phrase since launch — morning and afternoon, two per day.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Phrazle Works</h3>
      <p>You guess an entire phrase, not a single word. Common idioms, proverbs, song lyrics, and pop culture quotes dominate the answer pool. The letter feedback works like Wordle — green, yellow, gray — but you're solving across multiple words at once. Phrase length and word positions matter a lot more than individual letters.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Two puzzles a day?</h4>
      <p>Yes — a morning phrase and an afternoon phrase. Both are in the archive.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">What kinds of phrases show up?</h4>
      <p>Idioms, proverbs, song titles, movie quotes, and common sayings. If it's a phrase people use regularly, it could be a Phoodle answer.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Is the archive useful for strategy?</h4>
      <p>Browsing past answers helps you build intuition about phrase structure and common word patterns in the answer pool.</p>
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
