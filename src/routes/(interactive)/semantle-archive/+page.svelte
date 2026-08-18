<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import SemantleClues from '$lib/components/SemantleClues.svelte';
  import type { SemantleData } from '$lib/semantle';

  interface SemantleArchivePayload {
    selectedDateKey: string | null;
    selectedSemantle: SemantleData | null;
  }

  let data = $state<SemantleArchivePayload>({
    selectedDateKey: null,
    selectedSemantle: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = new Date(2022, 0, 29);
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
      data.selectedSemantle = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<SemantleArchivePayload>('semantle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedSemantle = payload.selectedSemantle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedSemantle = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Semantle archive entry.';
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
  <title>Semantle Archive - Complete Secret Word Answer History</title>
  <meta name="description" content="Browse the complete archive of all Semantle secret word answers. Calendar view with search and direct links to every past semantic puzzle solution." />
  <link rel="canonical" href="https://wordsolverx.com/semantle-archive" />
  <meta property="og:title" content="Semantle Archive - All Past Secret Word Answers" />
  <meta property="og:description" content="Complete history of every Semantle secret word. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/semantle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Semantle"
  gameColor="teal"
  gameIcon="??"
  {startDate}
  basePath="/semantle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Semantle secret word answer. Find any past semantic puzzle solution instantly."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedSemantle}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Semantle answer for {data.selectedSemantle.formattedDate}
        </h2>
      </div>
      <SemantleClues word={data.selectedSemantle.word} puzzleNumber={data.selectedSemantle.puzzleNumber} />
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Semantle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Semantle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected semantic answer into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Pick a Semantle archive date above</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The selected puzzle's clue-and-reveal block will load here, so the archive page itself becomes the answer page.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Semantle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Semantle secret word since launch. Useful for learning how semantic similarity scoring works — past answers show you what the model considers "close".</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Semantle Works</h3>
      <p>You guess words and Semantle tells you how semantically close each guess is on a 0-100 scale. The 1000th-closest word usually scores around 10-15. If you hit 30+, you're in the neighborhood. The jump from 70 to the answer can take 50+ guesses — that's where the real thinking kicks in.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How does Semantle differ from Contexto?</h4>
      <p>Both use word embeddings, but Semantle gives you a numeric similarity score (0-100) while Contexto gives you a rank position. Semantle also tends to be harder — fewer guesses, wider scoring gaps.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Is the archive useful for strategy?</h4>
      <p>Very. Looking at past answers helps you build intuition about which word families the model tends to pick as targets.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">What score means I'm close?</h4>
      <p>Below 10: cold. 10-30: warming up. 30-50: you're in the right area. 50+: you're close, keep iterating. 100: you got it.</p>
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
