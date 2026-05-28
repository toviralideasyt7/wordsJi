<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import PhoodleAnswerCard from '$lib/components/PhoodleAnswerCard.svelte';
  import { parseApiDate, PHOODLE_START_DATE, type PhoodleDayData } from '$lib/phoodle';

  interface PhoodleArchivePayload {
    availableDateStrings: string[];
    selectedDateKey: string | null;
    selectedPhoodle: PhoodleDayData | null;
  }

  let data = $state<PhoodleArchivePayload>({
    availableDateStrings: [],
    selectedDateKey: null,
    selectedPhoodle: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  let availableDates = $derived((data.availableDateStrings ?? []).map(parseApiDate));
  let startDate = $derived(availableDates.at(-1) ?? PHOODLE_START_DATE);
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
    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<PhoodleArchivePayload>('phoodle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.availableDateStrings = payload.availableDateStrings ?? [];
      data.selectedDateKey = payload.selectedDateKey;
      data.selectedPhoodle = payload.selectedPhoodle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedPhoodle = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Phoodle archive entry.';
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
  <title>Phoodle Archive - Complete Food Word Answer History | WordSolverX</title>
  <meta name="description" content="Browse the complete archive of all Phoodle food word answers. Calendar view with search and direct links to every past food puzzle solution." />
  <link rel="canonical" href="https://wordsolverx.com/phoodle-archive" />
  <meta property="og:title" content="Phoodle Archive - All Past Food Word Answers" />
  <meta property="og:description" content="Complete history of every Phoodle food word answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/phoodle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Phoodle"
  gameColor="teal"
  gameIcon="Ph"
  {startDate}
  {availableDates}
  basePath="/phoodle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Phoodle food word answer. Browse the complete daily food puzzle history."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedPhoodle}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Phoodle answer for {data.selectedPhoodle.formattedDate}
        </h2>
      </div>
      <PhoodleAnswerCard
        word={data.selectedPhoodle.word}
        date={data.selectedPhoodle.formattedDate}
        description={data.selectedPhoodle.description}
        recipe_name={data.selectedPhoodle.recipe_name}
      />
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Phoodle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Phoodle archive data...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Preparing the archive calendar and selected food answer for this page.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Select a Phoodle day to reveal it here</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Older answers now open directly inside the archive page instead of using separate dated permalink pages.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Phoodle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Phoodle answer since launch. All food words, all in one place.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Phoodle Works</h3>
      <p>Same mechanics as Wordle — six guesses, color feedback — but every answer is food-related. Cooking terms, ingredients, cuisines, kitchen tools, and dishes. The answer pool is narrower than Wordle, so food vocabulary pays off here more than general word-guessing skills.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How narrow is the answer pool?</h4>
      <p>Narrower than Wordle by a lot. Food terms, cooking verbs, and ingredient names make up most of the answers.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Do answers ever repeat?</h4>
      <p>Not within the main answer sequence. Each day's word is unique in the rotation.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">What's the best opening word?</h4>
      <p>Something with common food letters. "BREAD" covers B, R, E, A, D — all frequent in cooking vocabulary. "SAUCE" and "FLOUR" are solid too.</p>
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
