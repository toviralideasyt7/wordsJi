<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import SemantleClues from '$lib/components/SemantleClues.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import KeepExploring from '$lib/components/KeepExploring.svelte';
  import AnswerArticle from '$lib/components/AnswerArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import FiChevronDown from '$lib/components/icons/FiChevronDown.svelte';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';

  let { data } = $props();
  const publishedDate = $derived(`${data.dateKey}T00:00:00Z`);
  const webPageSchema = $derived(
    generateWebPageSchema(
      data.meta?.title ?? 'Semantle Answer Today',
      data.meta?.description ?? '',
      'https://wordsolverx.com/semantle-answer-today',
      {
        image: 'https://wordsolverx.com/images/semantle-answer-today.webp',
        dateModified: data.dateKey
      }
    )
  );
  const cleanedSchemas = $derived(
    stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES)
  );
</script>

<svelte:head>
  <title>{data.meta?.title ?? 'Semantle Answer Today'}</title>
  <meta name="description" content={data.meta?.description ?? ''} />
  <meta name="news_keywords" content={data.meta?.keywords ?? 'semantle answer today, semantle answer, semantle hint, semantle hint today'} />
  <link rel="canonical" href="https://wordsolverx.com/semantle-answer-today" />
  <meta property="og:title" content={data.meta?.title ?? 'Semantle Answer Today'} />
  <meta property="og:description" content={data.meta?.description ?? ''} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/semantle-answer-today" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta?.title ?? 'Semantle Answer Today'} />
  <meta name="twitter:description" content={data.meta?.description ?? ''} />
  <meta name="twitter:image" content="https://wordsolverx.com/images/semantle-answer-today.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`}
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Semantle" answer={data.word?.toUpperCase() ?? null} />

{#if data.error || !data.word || !data.puzzleNumber}
  <div class="min-h-screen bg-slate-50 dark:bg-slate-800/30 flex items-center justify-center">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">Semantle Answer Not Available</h2>
      <p class="text-slate-500 dark:text-slate-400">Unable to load today's puzzle. Please try again later.</p>
    </div>
  </div>
{:else}
  <div class="bg-slate-50 dark:bg-slate-800/30 min-h-screen font-sans">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs />

      <header class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/40 rounded-full text-teal-700 dark:text-teal-300 text-sm font-semibold mb-4">
          <span class="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
          Updated Daily
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mb-4">
          Semantle Answer Today ({data.formattedDate})
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400">
          {data.formattedDate} &bull; Puzzle <span class="font-mono font-bold text-teal-700 dark:text-teal-400">#{data.puzzleNumber}</span>
        </p>
      </header>

      <div class="mb-12">
        <SemantleClues
          word={data.word}
          puzzleNumber={data.puzzleNumber}
          definition={data.clues?.definition}
          rhymes={data.clues?.rhymes ?? []}
          synonyms={data.clues?.synonyms ?? []}
          disableClientFetch={true}
        />
      </div>

      <div class="flex justify-center gap-4 mb-12">
        <a href="/semantle-archive" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700 transition-all">
          Browse Archive
        </a>
      </div>

      <KeepExploring slug="semantle" puzzleDate={data.dateKey} />

      <article class="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">About Today's Puzzle</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-6">
          Puzzle <strong class="text-teal-700 dark:text-teal-400">#{data.puzzleNumber}</strong>.
          Today's Semantle word: <strong class="text-slate-900 dark:text-slate-100 uppercase">{data.word}</strong>.
        </p>

        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-4">
          <details class="group bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-200 dark:border-teal-800/40 overflow-hidden">
            <summary class="cursor-pointer p-5 flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
              <span>What is the Semantle answer for today, {data.formattedDate}?</span>
              <FiChevronDown class="text-teal-600 dark:text-teal-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div class="p-5 pt-0 text-slate-600 dark:text-slate-400">
              The Semantle answer for today is <span class="font-bold text-slate-900 dark:text-slate-100 uppercase">{data.word}</span> (Puzzle #{data.puzzleNumber}).
            </div>
          </details>

          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">Recent Semantle Answers</h3>
          {#each data.last10Days as d}
            {#if d}
              <details class="group bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary class="cursor-pointer p-5 flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <span>What was the Semantle answer for {d.formattedDate}?</span>
                  <FiChevronDown class="text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div class="p-5 pt-0 text-slate-600 dark:text-slate-400">
                  The answer was <span class="font-bold text-slate-900 dark:text-slate-100 uppercase">{d.word}</span> (Puzzle #{d.puzzleNumber}).
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
            How Semantle Scoring Actually Works
          </h2>
          <p class="text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Every guess gets a similarity score from 0 to 1. Above 0.70? You're practically on top of it. Between 0.30 and 0.70? Right neighborhood. Below 0.30? Wrong domain entirely. The game always shows your top 1,000 closest guesses, so you can track your trajectory. No guess limit, no timer. The word2vec model was trained on Google News — that's why "penguin" is close to "emperor" and "France" is close to "cheese."
          </p>
        </section>

        <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Strategies That Actually Work
          </h2>
          <div class="space-y-4 text-base text-slate-600 dark:text-slate-400">
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Start with category anchors</h3>
              <p class="text-sm leading-6">Your first 10 guesses: "person," "thing," "place," "feeling," "time," "food," "animal," "action," "money," "home." If "feeling" scores 0.45 but "thing" scores 0.05, you've found the domain.</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Systematic exploration beats random guessing</h3>
              <p class="text-sm leading-6">When "music" scores 0.60, exhaust that neighborhood: "song," "melody," "instrument," "guitar," "concert," "rhythm." Each one either advances you or eliminates a branch.</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Follow the surprise hits</h3>
              <p class="text-sm leading-6">If "loyalty" scores higher than "dog" even though you're in the animal domain, the answer is probably abstract. Pay attention when an unexpected word outperforms your domain-specific guesses.</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">When stuck, try simple words</h3>
              <p class="text-sm leading-6">Hard Semantle answers are often common words like "run," "set," "put," "get." If you've been exploring complex domains for 100+ guesses, step back and try everyday words.</p>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Semantle FAQ
          </h2>
          <div class="space-y-4 text-base text-slate-600 dark:text-slate-400">
            <div>
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">How is Semantle different from Contexto?</h3>
              <p class="text-sm leading-6">Semantle shows a numeric cosine similarity score. Contexto shows a rank position (1 to 15,000). They use different word embedding models trained on different data, so the same pair of words can score differently in each game.</p>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">How many guesses does it take on average?</h3>
              <p class="text-sm leading-6">50-200 for most players. Easy puzzles with strong semantic associations: 20-50. Hard puzzles with abstract answers: 200-500. The record-setters who finish in under 10 guesses are usually getting lucky with their first few category words.</p>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Can the answer be a proper noun?</h3>
              <p class="text-sm leading-6">Yes. Country names, city names, and brand names are all in the word2vec vocabulary and can appear as answers. If common words aren't working after 100+ guesses, try proper nouns.</p>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">What time does the puzzle reset?</h3>
              <p class="text-sm leading-6">Midnight server time. The puzzle number increments by one each day. The game has been running since early 2022.</p>
            </div>
          </div>
        </section>
      </article>
      {/if}

      <div class="mb-12">
        <div class="mt-12">
  <AnswerArticle content={ARTICLE_CONTENT['semantle-answer-today']} vars={{ date: data.formattedDate, number: data.puzzleNumber ? String(data.puzzleNumber) : '' }}
    verified={publishedDate}
  />
</div>

<AuthorCard
          name={PRESTON_HAYES_AUTHOR_NAME}
          image={PRESTON_HAYES_AUTHOR_IMAGE}
          description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
        />
      </div>

      <div class="mt-16">
        <InternalLinkSection currentGame="Semantle" />
      </div>
    </div>
  </div>
{/if}
