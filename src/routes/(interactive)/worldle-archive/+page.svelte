<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import WorldleCountryCard from '$lib/components/worldle/WorldleCountryCard.svelte';
  import type { WorldleAnswer } from '$lib/worldle/types';

  interface WorldleArchivePayload {
    selectedDateKey: string | null;
    selectedAnswer: WorldleAnswer | null;
    formattedSelectedDate: string | null;
  }

  let data = $state<WorldleArchivePayload>({
    selectedDateKey: null,
    selectedAnswer: null,
    formattedSelectedDate: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = new Date(2022, 0, 21);
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
      data.selectedAnswer = null;
      data.formattedSelectedDate = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<WorldleArchivePayload>('worldle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedAnswer = payload.selectedAnswer;
      data.formattedSelectedDate = payload.formattedSelectedDate;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedAnswer = null;
      data.formattedSelectedDate = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Worldle archive entry.';
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
  <title>Worldle Archive - Complete Country Answer History</title>
  <meta name="description" content="Browse the complete archive of every Worldle answer, with a calendar view and direct access to each past country silhouette puzzle and its solution." />
  <link rel="canonical" href="https://wordsolverx.com/worldle-archive" />
  <meta property="og:title" content="Worldle Archive - All Past Country Answers" />
  <meta property="og:description" content="Complete history of every Worldle country answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/worldle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Worldle"
  gameColor="teal"
  gameIcon="WL"
  {startDate}
  basePath="/worldle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Worldle country answer. Browse the full country silhouette puzzle history."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedAnswer}
    <WorldleCountryCard
      answer={data.selectedAnswer}
      headline="Selected archive date"
      subheadline={`Showing the Worldle answer for ${data.formattedSelectedDate}.`}
    />
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Worldle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Worldle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected country answer into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Choose a Worldle date above</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The selected country answer and details will load here on the archive page.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Worldle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Worldle country since launch. Good for spotting which regions come up most often.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Worldle Works</h3>
      <p>You see a country silhouette and guess which country it is. After each guess, you get the distance away, the direction, and a percentage score. Six guesses to get it right. If you've been playing since launch, you've probably noticed that some continents show up way more than others.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How far back does the archive go?</h4>
      <p>Since Worldle launched in early 2022. Every country is stored with its date and puzzle number.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can I practice old puzzles?</h4>
      <p>Use the archive to look up past answers. The solver on this page lets you test your geography skills against any country.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Which regions appear most often?</h4>
      <p>Browse the archive and you'll see patterns — Africa and Southeast Asia come up regularly, while tiny island nations are rarer.</p>
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
