<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
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

  let { data } = $props();

  // Calendar state (kept for "today" lookups — the SSR table covers history)
  let calendarData = $state<WordleArchivePayload>({
    selectedDateKey: null,
    selectedWordle: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  const startDate = new Date(2021, 5, 19);
  let selectedDateParam = $state<string | null>(browser ? new URL(window.location.href).searchParams.get('date') : null);

  // Client-side search state
  let searchQuery = $state('');

  let filteredAnswers = $derived(
    (data.allAnswers || []).filter((a: { date: string; solution: string; puzzleNumber: number | null }) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        a.date?.toLowerCase().includes(q) ||
        a.solution?.toLowerCase().includes(q) ||
        (a.puzzleNumber !== null && a.puzzleNumber !== undefined && String(a.puzzleNumber).includes(q))
      );
    })
  );

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
      calendarData.selectedDateKey = null;
      calendarData.selectedWordle = null;
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

      calendarData.selectedDateKey = payload.selectedDateKey;
      calendarData.selectedWordle = payload.selectedWordle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      calendarData.selectedDateKey = requestDateKey;
      calendarData.selectedWordle = null;
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
  <title>Wordle Answer Archive - Complete List of All Solutions by Date</title>
  <meta name="description" content="The complete Wordle answer archive: every solution since June 2021, organized by year with puzzle numbers, dates, and editors. Search by date or puzzle number. Updated daily." />
  <link rel="canonical" href="https://wordsolverx.com/wordle-answer-archive" />
  <meta property="og:title" content="Wordle Answer Archive - Complete List of All Solutions" />
  <meta property="og:description" content="Every Wordle answer since the beginning, organized by year with puzzle numbers and search." />
  <meta property="og:url" content="https://wordsolverx.com/wordle-answer-archive" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://wordsolverx.com/images/wordle-answer-archive.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Wordle Answer Archive - All Past Solutions" />
  <meta name="twitter:description" content="Complete history of every Wordle answer with year-by-year tables and search." />
  <meta name="twitter:image" content="https://wordsolverx.com/images/wordle-answer-archive.webp" />
</svelte:head>

<!-- Calendar for "today" and interactive date lookups -->
<ArchiveCalendar
  gameName="Wordle"
  gameColor="teal"
  gameIcon="??"
  {startDate}
  basePath="/wordle-answer-archive"
  selectedDate={calendarData.selectedDateKey}
  description="Every NYT Wordle answer since the beginning. Find any past solution instantly."
  onSelectDate={handleDateSelect}
/>

<!-- Selected date answer block -->
<section id="archive-answer" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if calendarData.selectedWordle}
    <div class="mb-5 rounded-xl border border-teal-200 bg-teal-50/70 px-5 py-4 text-sm font-medium text-teal-900 dark:border-teal-800/40 dark:bg-teal-950/20 dark:text-teal-200">
      Selected archive date: {formatDate(new Date(`${calendarData.selectedDateKey}T00:00:00Z`))}
    </div>
    <WordleDisplayWrapper
      wordleData={calendarData.selectedWordle}
      wordleWord={calendarData.selectedWordle.solution}
      wordleNumber={calendarData.selectedWordle.days_since_launch ?? calendarData.selectedWordle.id}
      formattedDate={formatDate(new Date(`${calendarData.selectedDateKey}T00:00:00Z`))}
      pageContext="archive"
      contentGuide={calendarData.selectedWordle.content_guide}
      socialImage={calendarData.selectedWordle.social_image}
      youtubeVideoUrl={calendarData.selectedWordle.youtube_video_url}
    />
  {:else if loadError}
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-800/40 dark:bg-rose-950/20">
      <h2 class="text-2xl font-bold text-rose-900 dark:text-rose-100">We couldn't load that Wordle date</h2>
      <p class="mt-3 text-rose-700 dark:text-rose-200">{loadError}</p>
    </div>
  {:else if isLoading && calendarData.selectedDateKey}
    <div class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Loading Wordle archive entry...</h2>
      <p class="mt-3 text-slate-600 dark:text-slate-300">
        Pulling the selected answer into this archive page now.
      </p>
    </div>
  {/if}
</section>

<!-- SEO audit chapter 6.3 / 7.2 Lever 4: Full answer archive with year-by-year tables,
     search box, and per-month stats. This is the definitive Wordle answer list. -->
<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-4">Complete Wordle Answer List</h2>
    <p class="text-slate-600 dark:text-slate-300 mb-6">
      Every NYT Wordle answer since the game began, organized by year. Use the search box to filter by date (YYYY-MM-DD), answer word, or puzzle number.
    </p>

    {#if data.fetchError}
      <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200">
        The live archive API is temporarily unavailable ({data.fetchError}). The calendar above still works for looking up any specific date.
      </div>
    {:else if data.totalAnswers === 0}
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
        No answers loaded yet. The calendar above can still look up any specific date.
      </div>
    {:else}
      <!-- Search box -->
      <div class="mb-6">
        <label for="archive-search" class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Search answers by date, word, or puzzle number</label>
        <input
          id="archive-search"
          type="search"
          bind:value={searchQuery}
          placeholder="e.g. 2025-03-15, crane, or 1234"
          class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
        />
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredAnswers.length} of {data.totalAnswers} answers{#if searchQuery.trim()} (filtered){/if}
        </p>
      </div>

      <!-- Per-month stats for the latest year -->
      {#if data.monthStats.length > 0 && !searchQuery.trim()}
        <div class="mb-8 rounded-lg border border-teal-100 bg-teal-50/50 p-4 dark:border-teal-800/30 dark:bg-teal-950/10">
          <h3 class="text-sm font-bold text-teal-900 dark:text-teal-200 mb-3">{data.monthStats[0].year} Wordle answers by month</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {#each data.monthStats as stat}
              <div class="rounded-md bg-white px-3 py-2 text-center dark:bg-slate-800">
                <div class="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.monthLabel}</div>
                <div class="text-lg font-bold text-teal-700 dark:text-teal-300">{stat.count}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Year-by-year tables -->
      {#if searchQuery.trim()}
        <!-- Search results: single flat table -->
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Puzzle #</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Answer</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Editor</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
              {#each filteredAnswers.slice(0, 500) as a}
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">#{a.puzzleNumber ?? '—'}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"><a href="/wordle-answer-for/{a.date}" class="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium underline">{a.date}</a></td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                      {a.solution?.toUpperCase()}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{a.editor || '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        {#if filteredAnswers.length > 500}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Showing first 500 of {filteredAnswers.length} matches. Refine your search to see more.
          </p>
        {/if}
      {:else}
        <!-- Full year-by-year tables -->
        {#each data.years as yearGroup}
          <div class="mb-10">
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-3">
              <span class="text-2xl">{yearGroup.year}</span>
              <span class="text-sm font-normal text-slate-500 dark:text-slate-400">({yearGroup.count} answers)</span>
            </h3>
            <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead class="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Puzzle #</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Answer</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Editor</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                  {#each yearGroup.answers as a}
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">#{a.puzzleNumber ?? '—'}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300"><a href="/wordle-answer-for/{a.date}" class="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium underline">{a.date}</a></td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                          {a.solution?.toUpperCase()}
                        </span>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{a.editor || '—'}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/each}
      {/if}

      <!-- Outbound citation to NYT (audit chapter 9.3.3) -->
      <p class="mt-8 text-sm text-slate-500 dark:text-slate-400">
        Source: <a href="https://www.nytimes.com/games/wordle/index.html" class="text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium underline" rel="external">NYT Wordle</a> — the official daily word puzzle from The New York Times. Answer data is sourced from the NYT Wordle API and cross-checked against our own daily fetch.
      </p>
    {/if}
  </div>
</section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Wordle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>The Wordle answer archive above is the most complete reference you will find online for past Wordle solutions. Every answer since the New York Times acquired the game in early 2022 is listed with its official puzzle number, publication date, and the editor who selected it. This page exists because the single most common Wordle-related search query is not "how to play Wordle" — it is "what was the Wordle answer on [date]". A full, searchable, year-by-year table is the clearest way to answer that question.</p>

      <p>Unlike a calendar-only view, the table format lets you scan months of answers at once, spot patterns in the answer pool, and quickly find a specific date without clicking through a date picker. The search box above the tables accepts three input types: a full date in YYYY-MM-DD format (for example, 2025-03-15), a five-letter answer word (for example, crane), or a puzzle number (for example, 1234). Search results appear in a single flat table so you can see every match at once.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Wordle Puzzle Numbers Work</h3>
      <p>Wordle puzzle numbers are counted from the game's original launch. Wordle #1 was on June 19, 2021. The New York Times acquired the game in January 2022 and has published one puzzle per day since. The official puzzle number — the one shown on this archive page — is the <code>days_since_launch</code> value from the NYT Wordle API, which counts the number of days since June 19, 2021. This is the same number that appears on the NYT Wordle website after you solve the puzzle.</p>

      <p>Some sites incorrectly display a different number — often an internal database row ID that has drifted ahead of the real puzzle number because of historical row deletions. If you see a Wordle number on another site that is hundreds ahead of the number shown here, that site is using the wrong field. The numbers on this archive page are verified against the NYT Wordle API on every fetch.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Wordle Works</h3>
      <p>Six guesses to find a five-letter word. Green means right letter right spot, yellow means right letter wrong spot, gray means it's not in the word. One puzzle per day, same word for everyone worldwide. The answer list is finite — Wordle has about 2,300 possible answers in the original pool, and the game cycles through them in order. The NYT editor (currently Tracy Bennett) selects each day's answer from the remaining pool.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How many Wordle answers are there?</h4>
      <p>About 2,309 in the original answer list. The game cycles through them in order, so once you know the pattern, you can predict future answers too. The archive above shows every answer published so far — the count grows by one each day.</p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are Wordle answers the same worldwide?</h4>
      <p>Yes — one word per day, globally. The archive reflects the universal answer for each date. The NYT Wordle API publishes the next day's answer at approximately 16:00 UTC, which is why some sites (including this one) may show tomorrow's answer in the evening UTC time.</p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can the archive help me get better at Wordle?</h4>
      <p>Browsing past answers helps you see which letter patterns and word types come up most. Over time, you'll start opening with words that cover the most common letters in the pool. The most common starting letters in the Wordle answer pool are S, C, B, T, and P. The most common vowels are E and A. Words like "crane", "slate", and "audio" are popular openers because they cover high-frequency letters.</p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Why do some archive sites show different puzzle numbers?</h4>
      <p>Some sites use an internal database row ID instead of the official NYT puzzle number. The NYT puzzle number counts days since June 19, 2021. If a site shows a number that is hundreds higher than the number on this page for the same date, that site is using the wrong field — usually an auto-incrementing database primary key that has drifted ahead because of test rows being inserted and deleted during development.</p>

      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How often is this archive updated?</h4>
      <p>The archive table above is baked into the page at build time, so it is current as of the last site rebuild. For today's answer — which may not be in the table yet if the site has not rebuilt today — use the calendar above or visit <a href="/wordle-answer-today" class="text-teal-600 hover:text-teal-700 underline">/wordle-answer-today</a>. The calendar fetches the answer for any selected date directly from the live API.</p>
    </div>
  </div>

  <div class="mt-12">
    <StaticArticle content={ARTICLE_CONTENT['wordle-answer-archive']} />
  </div>

  <div class="mt-12">
    <AuthorCard
      name={PRESTON_HAYES_AUTHOR_NAME}
      image={PRESTON_HAYES_AUTHOR_IMAGE}
      description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
    />
  </div>
</article>
