<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { fetchArchivePayload } from '$lib/archive-client';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import WaffleAnswerCard from '$lib/components/WaffleAnswerCard.svelte';
  import type { WaffleDayData } from '$lib/waffle';

  interface WaffleArchivePayload {
    selectedDateKey: string | null;
    selectedWaffle: WaffleDayData | null;
  }

  let data = $state<WaffleArchivePayload>({
    selectedDateKey: null,
    selectedWaffle: null
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
      data.selectedWaffle = null;
      isLoading = false;
      loadError = null;
      return;
    }

    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<WaffleArchivePayload>('waffle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = payload.selectedDateKey;
      data.selectedWaffle = payload.selectedWaffle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedWaffle = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Waffle archive entry.';
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
  <title>Waffle Archive - Complete Waffle Puzzle Answer History</title>
  <meta name="description" content="Browse the complete archive of every Waffle puzzle answer, with a calendar view, search, and direct links to each past waffle grid solution." />
  <link rel="canonical" href="https://wordsolverx.com/waffle-archive" />
  <meta property="og:title" content="Waffle Archive - All Past Waffle Answers" />
  <meta property="og:description" content="Complete history of every Waffle puzzle answer. Browse by calendar or search." />
  <meta property="og:url" content="https://wordsolverx.com/waffle-archive" />
  <meta property="og:type" content="website" />
</svelte:head>

<ArchiveCalendar
  gameName="Waffle"
  gameColor="teal"
  gameIcon="??"
  {startDate}
  basePath="/waffle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Waffle puzzle answer. Browse the daily grid puzzle history."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedWaffle}
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 dark:text-slate-50">
          Waffle answer for {data.selectedWaffle.formattedDate}
        </h2>
      </div>
      <WaffleAnswerCard
        puzzle={data.selectedWaffle.puzzle}
        solution={data.selectedWaffle.solution}
        date={new Date(data.selectedWaffle.date)}
      />

      <div class="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h3 class="mb-4 text-lg font-bold text-slate-900 dark:text-slate-50">Across words</h3>
          <div class="space-y-3">
            {#each data.selectedWaffle.words.slice(0, 3) as word}
              {@const definition = data.selectedWaffle.definitions.find((entry) => entry.word.toLowerCase() === word.toLowerCase())}
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <div class="font-black uppercase tracking-wide text-slate-900 dark:text-slate-50">{word}</div>
                <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">{definition?.definition ?? 'No definition available.'}</div>
              </div>
            {/each}
          </div>
        </div>
        <div>
          <h3 class="mb-4 text-lg font-bold text-slate-900 dark:text-slate-50">Down words</h3>
          <div class="space-y-3">
            {#each data.selectedWaffle.words.slice(3, 6) as word}
              {@const definition = data.selectedWaffle.definitions.find((entry) => entry.word.toLowerCase() === word.toLowerCase())}
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <div class="font-black uppercase tracking-wide text-slate-900 dark:text-slate-50">{word}</div>
                <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">{definition?.definition ?? 'No definition available.'}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Waffle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && data.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Waffle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected grid answer into this archive page now.
      </p>
    </div>
  {:else}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Pick a Waffle date above</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        The solved grid and word definitions for the selected archive date will render here on the archive page.
      </p>
    </div>
  {/if}
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Waffle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>
        The Waffle archive provides a complete history of daily crossword-style grid puzzles from January 2022 to the present. Waffle presents a unique challenge that combines word-guessing with spatial reasoning, as players must swap letters in a grid to form valid across and down words simultaneously. The archive preserves not just the solved grid but also the individual word definitions, making it both a puzzle reference and a vocabulary-building resource.
      </p>
      <p>
        Each Waffle puzzle consists of a grid where letters must be arranged to form three words across and three words down, with certain letters pre-placed in their correct positions and others requiring swaps. The archive captures the complete puzzle state, showing both the initial scrambled grid and the solved solution. This allows players to replay past puzzles, study the solving strategies that would work, and understand how the game constructs its daily challenges.
      </p>
      <p>
        The word definitions included with each archive entry add significant educational value. For each of the six words in the daily grid, the archive provides a dictionary definition, turning each puzzle entry into a vocabulary lesson. This makes the Waffle archive particularly useful for students, language learners, and anyone who enjoys building their English vocabulary through engaging puzzle content.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Waffle Answers Work</h3>
      <p>
        Waffle presents a grid of letters where some are in correct positions and others need to be swapped to form valid words. The grid contains three across words and three down words that intersect, similar to a crossword but with a more constrained structure. Players swap letters between positions to transform the scrambled grid into the solved state where all six words read correctly in both directions.
      </p>
      <p>
        The answer for each date includes the complete puzzle grid, the solved solution, the list of all six words, and their dictionary definitions. Each date has exactly one puzzle, and the archive records this mapping completely. The word list is drawn from common English vocabulary, ensuring all solutions use words that most players would recognize.
      </p>
      <p>
        Waffle puzzles vary in difficulty based on how many letters are already in their correct positions and how many swaps are needed to reach the solution. Easier puzzles have more pre-placed letters and fewer required swaps, while harder puzzles require more moves and more creative thinking about which letters could be swapped to form valid words in both the across and down directions.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Notable Past Waffle Answers</h3>
      <p>
        The Waffle archive contains many puzzles that challenged players with tricky letter arrangements. Particularly difficult entries often involve words that share many letters with their intersecting partners, making it harder to determine the correct placement. Days where the across and down words have unusual letter patterns or use less common vocabulary tend to produce the highest swap counts and the most satisfying solves.
      </p>
      <p>
        The archive also reveals patterns in the types of words Waffle selects. Common three-to-five-letter English words appear most frequently, with a mix of everyday vocabulary and slightly more unusual terms that test broader word knowledge. Understanding these word patterns through archive study helps players develop faster recognition of potential solutions when approaching new daily puzzles.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How to Use the Waffle Archive</h3>
      <p>
        Navigate the archive using the calendar above to view any past Waffle puzzle. Each entry displays the solved grid, the individual words, and their definitions. Use the archive to review puzzles you missed, study word patterns, or practice your grid-solving skills against known solutions.
      </p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How is Waffle different from a crossword?</h4>
      <p>
        Waffle is more constrained than a traditional crossword. Instead of filling in blank squares from clues, players swap misplaced letters in a pre-populated grid to form valid across and down words. The challenge comes from figuring out which swaps will simultaneously satisfy both the horizontal and vertical word constraints.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does the archive show the scrambled and solved grids?</h4>
      <p>
        Yes. Each archive entry displays both the initial puzzle grid and the solved solution, allowing you to see the starting state and the final answer. You can analyze the puzzle to determine the minimum number of swaps needed to solve it.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are word definitions included for every entry?</h4>
      <p>
        Yes. The archive includes dictionary definitions for all six words in each daily grid, organized into across and down categories. This makes the archive both a puzzle reference and a vocabulary-building resource.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can the archive help me improve at Waffle?</h4>
      <p>
        Absolutely. Studying past puzzles helps you recognize common letter patterns, understand how words intersect in the grid structure, and develop faster solving strategies. Pay attention to which words appear frequently and how the game balances common and less common vocabulary.
      </p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How many swaps does a typical Waffle puzzle require?</h4>
      <p>
        The number of swaps varies by difficulty. Easier puzzles may need as few as three to five swaps, while harder ones can require ten or more. The archive allows you to examine each puzzle's structure and determine the optimal swap sequence for any past date.
      </p>
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
