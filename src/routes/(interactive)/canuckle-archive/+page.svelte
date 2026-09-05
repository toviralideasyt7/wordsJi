<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import WordlebotPage from '$lib/components/wordlebot/WordlebotPage.svelte';

  interface RecentCanuckleEntry {
    index: number;
    date: string;
    answer: string;
  }

  let { data }: {
    data: {
      config: import('$lib/wordlebot-wasm/types').WordlebotPageConfig;
      recentEntries: RecentCanuckleEntry[];
      totalPuzzles: number;
      latestDateKey: string | null;
      latestIndex: number | null;
      recentCount: number;
    };
  } = $props();

  const recentEntries = $derived(data?.recentEntries ?? []);
  const totalPuzzles = $derived(data?.totalPuzzles ?? 0);
  const latestDateKey = $derived(data?.latestDateKey ?? null);
  const latestIndex = $derived(data?.latestIndex ?? null);
  const recentCount = $derived(data?.recentCount ?? 0);

  function formatEntryDate(dateKey: string): string {
    if (!dateKey) return '';
    const date = new Date(`${dateKey}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return dateKey;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }
</script>

<section class="bg-white border-b border-slate-200">
  <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
    <header class="mb-6">
      <p class="text-xs font-bold uppercase tracking-[0.24em] text-rose-600">Canuckle Archive</p>
      <h2 class="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
        Recent Canuckle Answers
      </h2>
      <p class="mt-2 max-w-3xl text-sm text-slate-600">
        The most recent {recentCount} verified Canuckle puzzles, baked into this page so the list loads with the HTML and remains visible without JavaScript. The interactive search below covers the full archive of {totalPuzzles.toLocaleString('en-US')} puzzles.
      </p>
      {#if latestDateKey && latestIndex !== null}
        <p class="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Latest stored puzzle: #{latestIndex} on {formatEntryDate(latestDateKey)}
        </p>
      {/if}
    </header>

    {#if recentEntries.length === 0}
      <p class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        No Canuckle entries are available right now. The interactive archive below will load on demand.
      </p>
    {:else}
      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Puzzle #</th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Answer</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            {#each recentEntries as entry}
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900">#{entry.index}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{formatEntryDate(entry.date)}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 uppercase">
                    {entry.answer}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-slate-500">
        Showing {recentEntries.length} of {totalPuzzles.toLocaleString('en-US')} archived puzzles. The search panel below covers every stored Canuckle answer.
      </p>
    {/if}
  </div>
</section>

<WordlebotPage config={data.config} />

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Canuckle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Canuckle answer since the game launched. Browse by date, check your guesses, or just see how many Canadian words you actually know. Most visitors arrive with one question — what was the Canuckle word on a specific date — and the archive answers it directly: find the date, read the word, move on. The sections below cover the parts that actually change how the game plays.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Canuckle Works</h3>
      <p>Same format as Wordle — six tries, five letters, color feedback. The difference is every answer ties back to Canada somehow. That could be a province name, a hockey term, a French-Canadian word, or slang you'd hear in Halifax but not in Houston. One visible difference: Canuckle marks exact matches in red instead of green, a nod to the flag — red means right letter, right spot, yellow means right letter, wrong spot, and grey means the letter is absent. The answer pool is smaller than standard Wordle, roughly 2,300 words, so vowel-heavy openers tend to do well.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Where Non-Canadian Guessing Habits Break Down</h3>
      <p>Standard Wordle openers still work for letter coverage, but the second guess is where Canuckle diverges. Once the tiles confirm a pattern, the candidate list is not the global English pool — it is the Canadian pool. A grey-heavy board that would suggest obscure vocabulary in Wordle usually points at a shorter list here: place names, winter and hockey terms, and words with French spellings. Guessing another generic English word on turn three instead of switching into the Canadian list is the most common way to waste the middle of the board.</p>
      <p>The bilingual angle cuts both ways. French-derived answers often carry letter patterns English-first players underweight — doubled vowels are rarer, terminal consonants that stay silent in French spelling still occupy tiles, and accents never appear, so the unaccented form is what counts. Browsing past answers in this archive is the fastest way to calibrate: a few dozen entries reveal which themes repeat and which letter shapes the game favors.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How This Archive Stays Current</h3>
      <p>Stored answers grow by one entry each day at build time. For the word running right now — which may not be listed here yet if the site has not rebuilt today — the <a href="/canuckle-answer-today" class="text-teal-600 hover:text-teal-700 underline">Canuckle answer today</a> page always carries the current puzzle. Stuck mid-board rather than checking history? The <a href="/canuckle-solver" class="text-teal-600 hover:text-teal-700 underline">Canuckle solver</a> filters the same Canadian word list by the tiles on screen.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can I use the archive to get better?</h4>
      <p>Yes — browsing past answers is the fastest way to learn what kinds of Canadian words show up. You'll start noticing which letters and themes repeat.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Do all players get the same word?</h4>
      <p>Yes, one word per day, same for everyone. The archive reflects that shared answer for each date.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are French words included?</h4>
      <p>Sometimes. Canuckle pulls from both English and French Canadian vocabulary, so don't be surprised if a word comes from the French side of the bilingual pool.</p>
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