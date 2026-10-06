<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { generateArticleSchema, generateFAQSchema } from '$lib/seo';

  let { data } = $props();

  const pageTitle = 'The Hardest Wordle Answers, Ranked';
  const pageDescription =
    'Every Wordle answer ranked by difficulty: a transparent 0–100 rubric scoring rare letters, repeats, and awkward patterns. The 50 hardest answers plus the 10 easiest.';
  const pageUrl = 'https://wordsolverx.com/wordle-hardest-answers';

  const schemas = $derived(JSON.stringify([
    generateArticleSchema({
      headline: pageTitle,
      description: pageDescription,
      url: pageUrl,
      image: 'https://wordsolverx.com/images/wordle-answer-archive.webp',
      datePublished: data.publishedDate,
      dateModified: data.publishedDate,
      authorName: 'Preston Hayes',
      authorImage: 'https://wordsolverx.com/author-wordsolverx.webp',
      authorJobTitle: 'Puzzle Content Editor',
      authorKnowsAbout: ['Wordle', 'Word Puzzles', 'Daily Puzzle Answers', 'Puzzle Solver Tools', 'Information Theory'],
      authorSameAs: ['https://www.pinterest.com/wordsolverx/'],
      articleSection: 'Wordle Strategy',
      keywords: ['hardest wordle answers', 'hardest wordle words', 'wordle difficulty ranking', 'rare wordle answers']
    }),
    generateFAQSchema(data.faqs)
  ]));

  function scoreTier(score: number): string {
    if (score >= 80) return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    if (score >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    if (score >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="hardest wordle answers, hardest wordle words, wordle difficulty ranking, wordle rare answers, easiest wordle answers"
  />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="https://wordsolverx.com/images/wordle-answer-archive.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://wordsolverx.com/images/wordle-answer-archive.webp" />
  {@html `<script type="application/ld+json">${schemas}</script>`}
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
  <Breadcrumbs />
</div>

<!-- Hero -->
<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
  <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
    {pageTitle}
  </h1>
  <p class="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
    Not all Wordle answers are created equal. A word like CRANE falls quickly to a good opener;
    a word like JAZZY can burn through all six guesses. We scored every real Wordle answer ever
    published on a transparent 0–100 difficulty rubric — rare letters, repeated letters, and
    awkward patterns — and ranked them. Below: the 50 hardest answers of all time, plus the
    10 easiest for contrast.
  </p>
  {#if data.totalAnswers > 0 && data.dateRange}
    <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
      Ranked from {data.totalAnswers.toLocaleString()} real Wordle answers
      ({data.dateRange.first} – {data.dateRange.last}).
    </p>
  {/if}
</section>

{#if data.fetchError}
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
    <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200">
      The live answer feed was temporarily unavailable ({data.fetchError}), so the ranked tables
      could not be built on this render. The methodology below still explains exactly how every
      score is calculated.
    </div>
  </section>
{:else}
  <!-- Hardest 50 table -->
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-2">
        The 50 Hardest Wordle Answers
      </h2>
      <p class="text-slate-600 dark:text-slate-300 mb-6 text-sm">
        Sorted by difficulty score, highest first. Ties are broken by earliest puzzle date, so the
        table always shows exactly the 50 highest-scoring answers.
      </p>
      <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Answer</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Puzzle #</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Why it's hard</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
            {#each data.hardest as row}
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-black text-slate-900 dark:text-slate-100">#{row.rank}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 tracking-widest">
                    {row.answer}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">{row.puzzleNumber ?? '—'}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{row.formattedDate}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class={`inline-flex items-center justify-center min-w-12 px-2.5 py-1 rounded-full text-sm font-black ${scoreTier(row.score)}`}>
                    {row.score}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.why}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Easiest 10 table -->
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-2">
        The 10 Easiest Wordle Answers
      </h2>
      <p class="text-slate-600 dark:text-slate-300 mb-6 text-sm">
        The contrast set: common five-letter words built from everyday letters in familiar
        positions. These are the answers your opener was practically built for.
      </p>
      <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Answer</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Puzzle #</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Why it's easy</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
            {#each data.easiest as row}
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-black text-slate-900 dark:text-slate-100">#{row.rank}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 tracking-widest">
                    {row.answer}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">{row.puzzleNumber ?? '—'}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{row.formattedDate}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class={`inline-flex items-center justify-center min-w-12 px-2.5 py-1 rounded-full text-sm font-black ${scoreTier(row.score)}`}>
                    {row.score}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.why}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </section>
{/if}

<!-- Methodology -->
<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-4">How we scored this</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p class="font-semibold text-slate-800 dark:text-slate-100">{data.rubricSummary}</p>
      <p>
        Difficulty in Wordle comes down to how much information each guess gives you. Common letters
        (E, A, R, S, T) appear in thousands of candidate words, so standard openers test them
        immediately. Rare letters like J, Q, X, and Z appear in far fewer guesses, so they reveal
        themselves late — often after several guesses have already been spent. Repeated letters are
        awkward because a single green or yellow rarely tells you the letter appears twice, and
        double consonant clusters sit in word shapes most solvers don't reach for first.
      </p>
      <p>
        The rubric is applied identically to every answer — no per-word tuning — so the ranking is
        deterministic: anyone can re-run it against the public answer list and get the same order.
        Word length is fixed at five for every Wordle answer, so length plays no part in the score.
      </p>
    </div>
    <div class="mt-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead class="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Points</th>
            <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rule</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
          {#each data.rubric as rule}
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td class="px-4 py-3 whitespace-nowrap text-sm font-black text-teal-700 dark:text-teal-300">{rule.points}</td>
              <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{rule.description}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
  <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6 tracking-tight">
    Frequently Asked Questions
  </h2>
  <div class="space-y-2">
    {#each data.faqs as faq}
      <details class="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <summary class="list-none cursor-pointer px-5 py-4 flex justify-between items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
          <span class="text-[0.9375rem] font-semibold text-slate-800 dark:text-slate-200">
            {faq.question}
          </span>
          <svg
            class="w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div class="px-5 pb-4 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">
          <p class="pt-3">{faq.answer}</p>
        </div>
      </details>
    {/each}
  </div>
</section>

<!-- Internal links -->
<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
  <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Keep exploring Wordle</h2>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <a href="/wordle-answer-today" class="rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition dark:border-slate-700 dark:bg-slate-800">
      <div class="text-sm font-bold text-teal-700 dark:text-teal-300">Today's Wordle answer</div>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Hints and the confirmed answer for today's puzzle.</p>
    </a>
    <a href="/wordle-solver" class="rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition dark:border-slate-700 dark:bg-slate-800">
      <div class="text-sm font-bold text-teal-700 dark:text-teal-300">Wordle solver</div>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Enter your clues and get the best next guess.</p>
    </a>
    <a href="/wordle-answer-archive" class="rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition dark:border-slate-700 dark:bg-slate-800">
      <div class="text-sm font-bold text-teal-700 dark:text-teal-300">Full Wordle answer archive</div>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Every past answer by date and puzzle number, searchable.</p>
    </a>
    <a href="/guides/best-wordle-starting-words" class="rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition dark:border-slate-700 dark:bg-slate-800">
      <div class="text-sm font-bold text-teal-700 dark:text-teal-300">Best Wordle starting words</div>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">The openers that beat rare letters fastest.</p>
    </a>
    <a href="/guides/how-to-solve-wordle-in-3-guesses" class="rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition dark:border-slate-700 dark:bg-slate-800">
      <div class="text-sm font-bold text-teal-700 dark:text-teal-300">How to solve Wordle in 3 guesses</div>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Strategy guide for cutting your average down.</p>
    </a>
    <a href="/guides/words-with-double-letters" class="rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition dark:border-slate-700 dark:bg-slate-800">
      <div class="text-sm font-bold text-teal-700 dark:text-teal-300">Words with double letters</div>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Why repeats are the silent guess-killers.</p>
    </a>
  </div>
</section>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
  <AuthorCard
    name={PRESTON_HAYES_AUTHOR_NAME}
    image={PRESTON_HAYES_AUTHOR_IMAGE}
    description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
  />
</div>
