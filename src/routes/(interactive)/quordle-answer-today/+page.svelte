<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import QuordleAnswerCard from '$lib/components/QuordleAnswerCard.svelte';
  import GeneratedTodayArticle from '$lib/components/GeneratedTodayArticle.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import FiChevronDown from '$lib/components/icons/FiChevronDown.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';

  let { data } = $props();
  const publishedDate = $derived(data.publishedDate ?? `${data.dateKey}T00:00:00Z`);
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="news_keywords" content={data.meta.keywords ?? 'quordle answer today, quordle answer, quordle hint, quordle hint today'} />
  <link rel="canonical" href="https://wordsolverx.com/quordle-answer-today" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/quordle-answer-today" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content="https://wordsolverx.com/images/quordle-answer-today.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Quordle Answer Today" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content="https://wordsolverx.com/images/quordle-answer-today.webp" />
  {@html `<script type="application/ld+json">${data.schemas}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Quordle" answer={data.todayWords} />

<div class="bg-slate-50 dark:bg-slate-800/30 min-h-screen font-sans">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <header class="text-center mb-12">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/40 rounded-full text-teal-700 dark:text-teal-300 text-sm font-semibold mb-4">
        <span class="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
        Updated Daily
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-50 mb-6">
        Quordle Answer Today ({data.formattedDate})
      </h1>
      <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        <span class="font-semibold text-slate-900 dark:text-slate-100">{data.formattedDate}</span> — Today's Quordle answers for
        <span class="text-teal-600 dark:text-teal-400 font-bold">Classic</span>,
        <span class="text-blue-600 dark:text-blue-400 font-bold">Chill</span>,
        <span class="text-red-600 dark:text-red-400 font-bold">Extreme</span>,
        <span class="text-violet-600 dark:text-violet-400 font-bold">Sequence</span>,
        <span class="text-amber-600 dark:text-amber-400 font-bold">Rescue</span>, and more.
      </p>
    </header>

    <div class="flex flex-wrap justify-center gap-3 mb-12">
      <a href="/quordle-archive" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
        Browse Archive
      </a>
    </div>

    <div class="mb-16">
      <QuordleAnswerCard date={data.today} initialData={data.quordleData} />
    </div>

    <article class="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <details class="group bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-200 dark:border-teal-800/40 overflow-hidden" open>
          <summary class="cursor-pointer p-5 flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 transition-colors">
            <span>What is the Quordle answer for today, {data.formattedDate}?</span>
            <FiChevronDown class="text-teal-600 dark:text-teal-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div class="p-5 pt-0 text-slate-600 dark:text-slate-400">
            The Quordle answer for today, {data.formattedDate}, is <span class="font-bold text-slate-900 dark:text-slate-100 uppercase">{data.todayWords}</span>.
          </div>
        </details>
        <details class="group bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <summary class="cursor-pointer p-5 flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <span>When does Quordle reset?</span>
            <FiChevronDown class="text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform" />
          </summary>
          <div class="p-5 pt-0 text-slate-600 dark:text-slate-400">
            Quordle resets every day at midnight JST for Daily modes. The Weekly puzzle resets every Monday.
          </div>
        </details>

        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">Recent Quordle Answers</h3>
        {#each data.last10Days as d}
          {#if d}
            <details class="group bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <summary class="cursor-pointer p-5 flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <span>What was the Quordle answer for {d.formattedDate}?</span>
                <FiChevronDown class="text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div class="p-5 pt-0 text-slate-600 dark:text-slate-400">
                The Quordle answer for {d.formattedDate} was <span class="font-bold text-slate-900 dark:text-slate-100 uppercase">{d.d.join(', ').replace(/, ([^,]*)$/, ', and $1')}</span>.
              </div>
            </details>
          {/if}
        {/each}
      </div>
    </article>

    {#if false}
    <!-- SEO Article -->
    <article class="mt-12 space-y-8">
      <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          Playing Quordle Daily
        </h2>
        <p class="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Quordle is Wordle with four boards. You type one word, it hits all four boards at once, and you get nine guesses to solve all of them. Created by Freddie Meyer in early 2022, it draws from the same ~2,300-word answer pool as Wordle — so if it has been a Wordle answer, it could be a Quordle answer too. Resets at midnight JST.
        </p>
        <p class="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Six modes available: Classic (standard), Chill (practice, no streak), Extreme (harder words), Sequence (solve boards in order), Rescue (one board partially revealed, 11 guesses), and Weekly (resets Monday).
        </p>
      </section>

      <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          Tips That Actually Work
        </h2>
        <div class="space-y-4 text-base text-slate-600 dark:text-slate-400">
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">First three guesses = information gathering</h3>
            <p class="text-sm leading-6">Do not try to solve anything until guess 4. Use SLATE, CRANE, PILOT or similar openers that cover the most common letters. After three guesses you should know which letters live on which boards.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Solve the easiest board first</h3>
            <p class="text-sm leading-6">Find the board where you have the most letters confirmed and knock it out. Reduces mental load and frees up guesses for the harder ones. Most experienced players identify the "easy" board by guess 4 or 5.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Every guess applies to all four boards</h3>
            <p class="text-sm leading-6">If you can solve one board with either "GHOST" or "GRACE," pick the one that also gives you information on the other three boards. A guess that solves one board but is useless everywhere else is a wasted guess.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">A letter can be green on one board and gray on another</h3>
            <p class="text-sm leading-6">The keyboard shows aggregate feedback, which is misleading. Track each board separately. The <a href="/quordle-solver" class="font-semibold text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:text-teal-500">Quordle solver</a> on this site handles this automatically.</p>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          Quordle FAQ
        </h2>
        <div class="divide-y divide-slate-200 dark:divide-slate-700 text-base text-slate-600 dark:text-slate-400">
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              Is Quordle harder than Wordle?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">Yes. Wordle gives you 6 guesses for 1 word (6:1 ratio). Quordle gives you 9 guesses for 4 words (2.25:1 ratio). You have less than half the guesses per word. The Classic solve rate is around 72% versus Wordle's 97%.</p>
          </details>
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              What time does Quordle reset?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">Midnight JST daily. That is 11 AM ET the previous day, 4 PM GMT the previous day. Weekly resets Monday at the same time.</p>
          </details>
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              Does Quordle use the same word list as Wordle?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">For Classic and Chill, yes — same ~2,300-word answer pool. Extreme uses a harder subset with less common words.</p>
          </details>
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              Can I check past Quordle answers?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">The <a href="/quordle-archive" class="font-semibold text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:text-teal-500">Quordle archive</a> has every past answer searchable by date.</p>
          </details>
        </div>
      </section>
    </article>
    {/if}

    <GeneratedTodayArticle articleKey="quordle-answer-today" articleDate={data.dateKey} />
    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>

    <div class="mt-16">
      <InternalLinkSection currentGame="Quordle" />
    </div>
  </div>
</div>
