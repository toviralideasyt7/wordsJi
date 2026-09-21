<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import { getContextoDateFromGameNumber } from '$lib/contexto';

  interface ContextoAnswerResponse {
    success: boolean;
    gameNumber: number;
    date: string;
    answer?: string;
    error?: string;
  }

  interface ContextoArchivePayload {
    selectedDateKey: string | null;
    selectedContexto: ContextoAnswerResponse | null;
  }

  let data = $state<ContextoArchivePayload>({
    selectedDateKey: null,
    selectedContexto: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = getContextoDateFromGameNumber(1);
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
      data.selectedContexto = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<ContextoArchivePayload>('contexto', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedContexto = payload.selectedContexto;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedContexto = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Contexto archive entry.';
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
  <title>Contexto Archive - Complete Secret Word History</title>
  <meta name="description" content="Browse the complete archive of every Contexto answer, with a calendar view and direct access to past secret words, game numbers, and similarity scores." />
  <link rel="canonical" href="https://wordsolverx.com/contexto-archive" />
  <meta property="og:title" content="Contexto Archive - All Past Answers" />
  <meta property="og:description" content="Complete history of every Contexto answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/contexto-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Contexto"
  gameColor="teal"
  gameIcon="Cx"
  {startDate}
  basePath="/contexto-archive"
  selectedDate={data.selectedDateKey}
  description="Every Contexto answer word. Browse the full semantic puzzle history."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedContexto}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Contexto answer for {data.selectedContexto.date}
        </h2>
      </div>
      <div class="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
        <div class="rounded-xl border border-teal-200 bg-teal-50/70 p-8 dark:border-teal-800/40 dark:bg-teal-950/20">
          <p class="text-sm text-slate-500 mb-3">Game #{data.selectedContexto.gameNumber}</p>
          <p class="text-4xl md:text-6xl font-black tracking-tight text-teal-700 dark:text-teal-300 capitalize">
            {data.selectedContexto.answer}
          </p>
        </div>
        <div class="rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">Archive lookup</p>
          <p class="mt-4 text-lg font-bold">Semantic answer confirmed</p>
          <p class="mt-3 text-sm leading-6 text-teal-100">
            This archive view reveals the exact secret word for the selected Contexto day without sending users to separate dated URLs.
          </p>
        </div>
      </div>
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Contexto date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Contexto archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected semantic answer into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Select a Contexto date above</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The selected game number and answer word will appear here on the archive page.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Contexto Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Contexto answer, searchable by date. Contexto ranks words by meaning rather than spelling, so past answers help you learn how the game thinks.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Contexto Works</h3>
      <p>You type any word and Contexto tells you how close it is to the secret word based on meaning, not spelling. A word ranked 1 is the answer. Anything in the top 50 is getting close. The game uses word embeddings — the same kind of math behind search engines — to figure out what's semantically related to what.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does the archive show the ranking for each past answer?</h4>
      <p>The archive shows the answer and date. If you want to understand the similarity space, try entering old answers into today's puzzle to see how the model groups them.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Why do some answers feel random?</h4>
      <p>Contexto picks words based on how the model clusters meanings. Sometimes a word is semantically close to a big group of common words, even if it's not a word you'd guess. That's part of the challenge.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can studying old answers help?</h4>
      <p>Yes — you'll start to see what kinds of words the model considers similar. Abstract nouns and everyday verbs tend to cluster differently than proper nouns or rare words.</p>
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
