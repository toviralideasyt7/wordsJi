<script lang="ts">
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import {
    formatContextoDate,
    getContextoGameNumber,
    getContextoTodayDate
  } from '$lib/contexto';
  import {
    generateArticleSchema,
    generateBreadcrumbSchema,
    generateWebPageSchema
  } from '$lib/seo';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_IMAGE_URL,
    PRESTON_HAYES_AUTHOR_NAME,
    PRESTON_HAYES_AUTHOR_JOB_TITLE,
    PRESTON_HAYES_AUTHOR_KNOWS_ABOUT,
    PRESTON_HAYES_AUTHOR_SAME_AS,
    PRESTON_HAYES_AUTHOR_URL
  } from '$lib/authors';

  interface ContextoAnswer {
    success: boolean;
    gameNumber: number;
    date: string;
    answer?: string;
    error?: string;
  }

  let {
    data
  }: {
    data: { initialAnswer: ContextoAnswer | null; latestDate: string | null; error: string | null };
  } = $props();

  function formatDisplayDate(dateKey: string): string {
    return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const activeDate = $derived(
    data.initialAnswer?.date ?? data.latestDate ?? formatContextoDate(getContextoTodayDate())
  );
  const activeLabel = $derived(formatDisplayDate(activeDate));
  const activeGameNumber = $derived(
    data.initialAnswer?.gameNumber ?? getContextoGameNumber(new Date(`${activeDate}T12:00:00`))
  );

  let metaTitle = $derived(`Contexto Answer Today (${activeLabel}) - Hints and Clues`);
  let pageTitle = $derived(`Contexto Answer Today (${activeLabel})`);
  let pageDescription = $derived(
    `Get Contexto hints and the confirmed Contexto answer for today, ${activeLabel}. Use the dedicated archive page when you need an older Contexto answer.`
  );
  let pageKeywords = $derived(
    `contexto answer today, contexto answer, contexto hint, contexto hint today, contexto answer for ${activeLabel}`
  );

  const faqs = [
    {
      question: 'What is Contexto?',
      answer:
        'Contexto is a daily word guessing game where you find the secret word based on semantic closeness. Instead of letter-based clues like Wordle, Contexto uses AI-powered word embeddings to rank how similar your guesses are to the secret word. The game was created by an independent developer and launched in 2022.'
    },
    {
      question: 'How is the game number calculated?',
      answer:
        'Contexto game numbers increment by one each day based on the official release schedule. The game launched with puzzle #1 and has been counting up since. The game number is tied to the date, not to your local timezone — it follows the official server time.'
    },
    {
      question: 'Can I view previous Contexto answers?',
      answer:
        'Yes. Use the Contexto archive page to browse older dates and reveal the answer for that day. We maintain a complete archive going back to the earliest Contexto puzzles. You can search by date or game number.'
    },
    {
      question: 'Where does the data come from?',
      answer:
        'Answers are fetched directly from the official Contexto API. The game uses a word embedding model trained on large text corpora to determine semantic similarity between words. The same model powers the hint system.'
    },
    {
      question: 'How does Contexto scoring work?',
      answer:
        'Contexto ranks every guess from closest (rank 1) to farthest (rank ~15,000+). A rank of 1 means you guessed the exact word. Ranks under 100 are very close semantically. Ranks between 100-1,000 suggest moderate similarity. Anything above 1,000 means you are conceptually far from the answer.'
    },
    {
      question: 'What is a good Contexto strategy?',
      answer:
        'Start with broad category words like "person," "place," "thing," or "emotion" to find which conceptual area the answer lives in. Then narrow down by exploring related words. If "animal" ranks 500, try specific animals and see which direction moves you closer.'
    },
    {
      question: 'Does Contexto have a guess limit?',
      answer:
        'No. Contexto has unlimited guesses. You can guess as many words as you want until you find the answer. The challenge is conceptual navigation, not guess management.'
    }
  ];

  let webPageSchema = $derived(
    generateWebPageSchema(
      metaTitle,
      pageDescription,
      'https://wordsolverx.com/contexto-answer-today'
    )
  );

  // E-E-A-T: Article schema with Person author (not Organization)
  let articleSchema = $derived(
    generateArticleSchema({
      headline: metaTitle,
      description: pageDescription,
      url: 'https://wordsolverx.com/contexto-answer-today',
      image: 'https://wordsolverx.com/images/contexto-answer-today.webp',
      datePublished: activeDate,
      dateModified: activeDate,
      authorName: PRESTON_HAYES_AUTHOR_NAME,
      authorImage: PRESTON_HAYES_AUTHOR_IMAGE_URL,
      authorJobTitle: PRESTON_HAYES_AUTHOR_JOB_TITLE,
      authorDescription: PRESTON_HAYES_AUTHOR_DESCRIPTION,
      authorKnowsAbout: PRESTON_HAYES_AUTHOR_KNOWS_ABOUT,
      authorSameAs: PRESTON_HAYES_AUTHOR_SAME_AS,
    })
  );

  // Breadcrumb schema for navigation
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://wordsolverx.com' },
    { name: 'Today', url: 'https://wordsolverx.com/today' },
    { name: 'Contexto Answer Today', url: 'https://wordsolverx.com/contexto-answer-today' },
  ]);
</script>

<svelte:head>
  <title>{metaTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta name="keywords" content={pageKeywords} />
  <meta property="og:title" content={metaTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/contexto-answer-today" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content="https://wordsolverx.com/images/contexto-answer-today.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Contexto Answer Today" />
  <meta property="article:published_time" content={activeDate} />
  <meta property="article:modified_time" content={activeDate} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={metaTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <link rel="canonical" href="https://wordsolverx.com/contexto-answer-today" />
  {@html `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<AnswerPageNoscript gameName="Contexto" answer={data.initialAnswer?.answer ?? null} />

<div class="min-h-screen bg-slate-50 dark:bg-slate-800/30">
  <section class="max-w-5xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium mb-4">
        <span>Daily Contexto Answers</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">
        Contexto Answer Today ({activeLabel})
      </h1>
      <p class="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
        Today's Contexto answer and hints. Need an older one? The archive has every past puzzle.
      </p>
      <div class="inline-flex items-center gap-1.5 text-xs text-slate-500 mt-2">
        <span class="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
        Updated Daily
      </div>
    </div>

    <section class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] overflow-hidden mb-10">
      <div class="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6 text-white">
        <p class="text-sm uppercase tracking-[0.2em] text-teal-100 mb-2">Answer Today</p>
        <div class="flex flex-wrap items-center gap-3">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-sm">
            Game #{activeGameNumber}
          </span>
          <span class="text-sm text-teal-100">
            {activeDate}
          </span>
        </div>
      </div>

      <div class="p-6 md:p-8">
        {#if data.error}
          <div class="text-center py-6">
            <p class="text-red-500 dark:text-red-400">{data.error}</p>
          </div>
        {:else if data.initialAnswer?.success}
          <div class="grid lg:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
            <details class="contexto-answer-details">
              <summary class="list-none">
                <div class="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-all md:p-8 dark:border-slate-600 dark:bg-slate-700/50">
                  <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">The Contexto answer for this day</p>
                  <p class="text-4xl md:text-6xl font-black tracking-tight text-teal-700 dark:text-teal-300 capitalize contexto-answer-word">
                    {data.initialAnswer.answer}
                  </p>
                  <p class="contexto-answer-note mt-3 text-sm text-slate-500 dark:text-slate-400">
                    <span class="note-closed">Click reveal when you want the answer.</span>
                    <span class="note-open">Answer revealed. Use the archive for older days.</span>
                  </p>
                </div>
              </summary>

              <div class="flex gap-3 flex-wrap mt-5">
                <a
                  href="/contexto-archive"
                  class="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Browse Archive
                </a>
              </div>
            </details>

            <div class="space-y-4">
              <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-5">
                <h2 class="text-base font-semibold mb-3 text-slate-900 dark:text-slate-100">Need an older Contexto answer?</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Looking for a past Contexto answer? Check the archive.
                </p>
                <a
                  href="/contexto-archive"
                  class="mt-4 inline-flex px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium"
                >
                  Open Contexto Archive
                </a>
              </div>

              <div class="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5">
                <p class="font-semibold mb-1">Play Contexto</p>
                <p class="text-sm text-amber-100 mb-4">Open the official puzzle after checking the answer.</p>
                <a
                  href="https://contexto.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex px-4 py-2 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 font-medium"
                >
                  Open contexto.me
                </a>
              </div>
            </div>
          </div>
        {:else}
          <div class="text-center py-6 text-slate-500 dark:text-slate-400">Unable to load today&apos;s answer right now.</div>
        {/if}
      </div>
    </section>

    <FAQSection title="Contexto Answer FAQ" {faqs} class="pb-0" />

    {#if false}
    <!-- SEO Article -->
    <article class="mt-12 space-y-8 max-w-5xl mx-auto">
      <section class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] p-6 sm:p-5 sm:p-8">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          How Contexto Actually Works
        </h2>
        <p class="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Contexto ranks every guess by how semantically close it is to the answer. Rank 1 = you found it. Rank 200 = right neighborhood. Rank 10,000 = completely off. No letter clues, no tiles, just a number. The game uses word embeddings — the same tech behind language models — to measure meaning distance. It has been running since 2022 at contexto.me.
        </p>
      </section>

      <section class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] p-6 sm:p-5 sm:p-8">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          Strategy That Cuts Your Guess Count
        </h2>
        <div class="space-y-4 text-base text-slate-600 dark:text-slate-400">
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Start with category words</h3>
            <p class="text-sm leading-6">Your first 5 guesses should be broad: "person," "animal," "place," "feeling," "food." If "animal" ranks 200 and "feeling" ranks 8,000, you know the domain immediately.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Follow the trail when a guess ranks under 1,000</h3>
            <p class="text-sm leading-6">Explore that word's neighbors. If "music" ranks 300, try "song," "melody," "instrument," "rhythm." Each follow-up either moves you closer or rules out a branch.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Big ranking jumps = semantic landmarks</h3>
            <p class="text-sm leading-6">Dropping from 5,000 to 200 in one guess means you found a strong connection. Use that word as your pivot for the next few guesses.</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-2">Think associations, not just synonyms</h3>
            <p class="text-sm leading-6">Contexto understands antonyms, category members, and cultural associations. "Doctor" and "hospital" are close. "Hot" and "cold" are close. If pure synonyms aren't working, try related concepts.</p>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] p-6 sm:p-5 sm:p-8">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          Contexto FAQ
        </h2>
        <div class="divide-y divide-slate-200 dark:divide-slate-700 text-base text-slate-600 dark:text-slate-400">
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              How many guesses does it usually take?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">30-100 for most players. Experienced solvers who start with category words can finish under 30. Abstract answers like "silence" or "time" tend to take longer.</p>
          </details>
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              Is there a guess limit?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">No. Guess as many times as you need. The challenge is conceptual, not about running out of attempts.</p>
          </details>
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              What types of words are usually the answer?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">Mostly concrete nouns and common adjectives. Abstract concepts appear but less frequently. Technical jargon and archaic words are rare.</p>
          </details>
          <details class="group py-4 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900 dark:text-slate-100">
              Can I find past Contexto answers?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-2 text-sm leading-6">The <a href="/contexto-archive" class="font-semibold text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:text-teal-500">Contexto archive</a> has every past answer searchable by date or game number.</p>
          </details>
        </div>
      </section>
    </article>
    {/if}

    <div class="mt-12">
      <div class="mt-12">
  <StaticArticle content={ARTICLE_CONTENT['contexto-answer-today']} />
</div>

<AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>

    <InternalLinkSection currentGame="Contexto" />
  </section>
</div>

<style>
  .contexto-answer-word {
    filter: blur(12px);
    transition: filter 0.3s ease;
    user-select: none;
  }

  .contexto-answer-details[open] .contexto-answer-word {
    filter: none;
    user-select: auto;
  }

  .contexto-answer-details > summary {
    cursor: pointer;
  }

  .contexto-answer-details > summary::-webkit-details-marker {
    display: none;
  }

  .contexto-answer-details .note-open {
    display: none;
  }

  .contexto-answer-details[open] > summary .rounded-2xl {
    border-style: solid;
    border-color: #5eead4;
    background: rgba(204, 251, 241, 0.65);
  }

  :global(body[data-theme='dark']) .contexto-answer-details[open] > summary .rounded-2xl {
    border-color: #0f766e;
    background: rgba(15, 118, 110, 0.2);
  }

  .contexto-answer-details[open] .note-closed {
    display: none;
  }

  .contexto-answer-details[open] .note-open {
    display: inline;
  }
</style>
