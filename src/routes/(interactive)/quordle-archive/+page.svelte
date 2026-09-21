<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import QuordleAnswerCard from '$lib/components/QuordleAnswerCard.svelte';
  import type { QuordleData } from '$lib/quordle';

  interface QuordleArchivePayload {
    selectedDateKey: string | null;
    selectedQuordle: QuordleData | null;
  }

  let data = $state<QuordleArchivePayload>({
    selectedDateKey: null,
    selectedQuordle: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = new Date(2022, 0, 30);
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
      data.selectedQuordle = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<QuordleArchivePayload>('quordle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedQuordle = payload.selectedQuordle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedQuordle = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Quordle archive entry.';
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
  <title>Quordle Archive - Complete Four-Word Answer History</title>
  <meta name="description" content="Browse the complete archive of every Quordle answer, with a calendar view, search, and direct links to each past four-word puzzle solution and its daily grid." />
  <link rel="canonical" href="https://wordsolverx.com/quordle-archive" />
  <meta property="og:title" content="Quordle Archive - All Past Four-Word Answers" />
  <meta property="og:description" content="Complete history of every Quordle answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/quordle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Quordle"
  gameColor="teal"
  gameIcon="4??"
  {startDate}
  basePath="/quordle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Quordle four-word puzzle answer. Browse the complete daily challenge history."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedQuordle}
    <div class="mb-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Quordle answer for {data.selectedQuordle.formattedDate}
        </h2>
      </div>
      <QuordleAnswerCard date={new Date(`${data.selectedDateKey}T00:00:00Z`)} />
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Quordle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Quordle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected four-word answer set into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Select any Quordle date above</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The full answer and hint section will appear here on the archive page without opening a separate dated URL.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Quordle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every daily Quordle quartet since January 2022.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Quordle Works</h3>
      <p>Four Wordle boards, nine guesses, all sharing the same guesses. Every word you type goes to all four boards at once. That's what makes it tricky — a guess that's perfect for board one might be useless for boards two through four. The best Quordle players think about all four boards before submitting each guess.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does the archive include all four words per day?</h4>
      <p>Yes — all four answers for each day are stored together.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Which Quordle modes are archived?</h4>
      <p>Classic, Chill, Extreme, Sequence, Rescue, and Weekly. Each mode is tracked separately.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can I use old puzzles to practice?</h4>
      <p>The archive shows the answers. You can test your strategy by replaying the letter combinations mentally, or use the solver tool on this page.</p>
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
