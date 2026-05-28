<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import WordleDisplayWrapper from '$lib/components/WordleDisplayWrapper.svelte';
  import type { WordleAnswer } from '$lib/api';
  import { formatDate } from '$lib/utils';

  interface WordleArchivePayload {
    selectedDateKey: string | null;
    selectedWordle: WordleAnswer | null;
  }

  let data = $state<WordleArchivePayload>({
    selectedDateKey: null,
    selectedWordle: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = new Date(2021, 5, 19);
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
      data.selectedWordle = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<WordleArchivePayload>('wordle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedWordle = payload.selectedWordle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedWordle = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Wordle archive entry.';
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
  <title>Wordle Answer Archive - Complete History of All Solutions | WordSolverX</title>
  <meta name="description" content="Browse the complete archive of all Wordle answers by date. Calendar view with search, daily puzzle numbers, and direct links to every past solution since June 2021." />
  <link rel="canonical" href="https://wordsolverx.com/wordle-answer-archive" />
  <meta property="og:title" content="Wordle Answer Archive - All Past Solutions" />
  <meta property="og:description" content="Complete history of every Wordle answer. Browse by calendar or search by date." />
  <meta property="og:url" content="https://wordsolverx.com/wordle-answer-archive" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://wordsolverx.com/images/wordle-answer-archive.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Wordle Answer Archive - All Past Solutions | WordSolverX" />
  <meta name="twitter:description" content="Complete history of every Wordle answer with calendar view." />
  <meta name="twitter:image" content="https://wordsolverx.com/images/wordle-answer-archive.webp" />
</svelte:head>

<ArchiveCalendar
  gameName="Wordle"
  gameColor="teal"
  gameIcon="??"
  {startDate}
  basePath="/wordle-answer-archive"
  selectedDate={data.selectedDateKey}
  description="Every NYT Wordle answer since the beginning. Find any past solution instantly."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedWordle}
    <div class="mb-5 rounded-xl border border-teal-200 bg-teal-50/70 px-5 py-4 text-sm font-medium text-teal-900 dark:border-teal-800/40 dark:bg-teal-950/20 dark:text-teal-200">
      Selected archive date: {formatDate(new Date(`${data.selectedDateKey}T00:00:00Z`))}
    </div>
    <WordleDisplayWrapper
      wordleData={data.selectedWordle}
      wordleWord={data.selectedWordle.solution}
      wordleNumber={data.selectedWordle.id}
      formattedDate={formatDate(new Date(`${data.selectedDateKey}T00:00:00Z`))}
      pageContext="archive"
      contentGuide={data.selectedWordle.content_guide}
      socialImage={data.selectedWordle.social_image}
      youtubeVideoUrl={data.selectedWordle.youtube_video_url}
    />
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Wordle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Wordle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected answer into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Pick a date to reveal the answer here</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Click any archived day in the calendar or list above and the full Wordle answer block will load below this section.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Wordle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Wordle answer since the game started. Search by date or browse chronologically.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Wordle Works</h3>
      <p>Six guesses to find a five-letter word. Green means right letter right spot, yellow means right letter wrong spot, gray means it's not in the word. One puzzle per day, same word for everyone. The answer list is finite — Wordle has about 2,300 possible answers in the original pool.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How many Wordle answers are there?</h4>
      <p>About 2,309 in the original answer list. The game cycles through them in order, so once you know the pattern, you can predict future answers too.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are Wordle answers the same worldwide?</h4>
      <p>Yes — one word per day, globally. The archive reflects the universal answer for each date.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can the archive help me get better?</h4>
      <p>Browsing past answers helps you see which letter patterns and word types come up most. Over time, you'll start opening with words that cover the most common letters in the pool.</p>
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
