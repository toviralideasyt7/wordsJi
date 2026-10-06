<script lang="ts">
  import type { WordleHintFact, WordleHintPageDef } from '$lib/wordle-hints-today';

  interface Faq {
    question: string;
    answer: string;
  }

  interface Meta {
    title: string;
    description: string;
    keywords: string;
  }

  interface Props {
    shortTitle: string;
    question: string;
    canonical: string;
    meta: Meta;
    formattedDate: string;
    wordleNumber: number;
    hasAnswer: boolean;
    value: string;
    explain: string;
    emptyNote: string;
    extraFacts: WordleHintFact[];
    aiOneLiner: string;
    difficultyLabel: string;
    difficultyScore: number;
    difficultyReason: string;
    otherPages: WordleHintPageDef[];
    faqs: Faq[];
    faqSchema: string;
  }

  let {
    shortTitle,
    question,
    canonical,
    meta,
    formattedDate,
    wordleNumber,
    hasAnswer,
    value,
    explain,
    emptyNote,
    extraFacts,
    aiOneLiner,
    difficultyLabel,
    difficultyScore,
    difficultyReason,
    otherPages,
    faqs,
    faqSchema
  }: Props = $props();
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <meta name="keywords" content={meta.keywords} />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={canonical} />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={meta.title} />
  <meta name="twitter:description" content={meta.description} />
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url: canonical
  })}</script>`}
  {@html `<script type="application/ld+json">${faqSchema}</script>`}
</svelte:head>

<!-- NOTE: the layout already renders <main id="main-content"> — this component must not nest a second <main>. -->
<div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    <nav aria-label="Breadcrumb" class="text-sm text-emerald-700 mb-6">
      <ol class="flex flex-wrap items-center gap-1.5">
        <li><a href="/" class="hover:underline">Home</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="/wordle-answer-today" class="hover:underline">Wordle</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-emerald-900 font-medium">{shortTitle}</li>
      </ol>
    </nav>

    <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
      {question}
    </h1>
    <p class="text-sm text-gray-500 mb-8">
      Wordle #{wordleNumber} &middot; {formattedDate}
    </p>

    {#if hasAnswer}
      <section aria-label="Hint answer" class="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 sm:p-10 text-center mb-6">
        {#if value}
          <p class="text-5xl sm:text-6xl font-black text-emerald-600 tracking-widest break-words">
            {value}
          </p>
        {:else}
          <p class="text-lg text-gray-600 max-w-xl mx-auto">
            {emptyNote}
          </p>
        {/if}
      </section>

      <p class="text-gray-700 text-lg leading-relaxed mb-6">
        {explain}
      </p>

      {#if aiOneLiner}
        <aside class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Bonus clue</p>
          <p class="text-gray-800 italic">{aiOneLiner}</p>
        </aside>
      {/if}

      {#if difficultyLabel}
        <div class="flex flex-wrap items-center gap-2 mb-8">
          <span class="text-sm font-medium text-gray-600">Difficulty:</span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
            {difficultyLabel}{#if difficultyScore > 0}&nbsp;({difficultyScore}/10){/if}
          </span>
          {#if difficultyReason}
            <span class="text-xs text-gray-500">{difficultyReason}</span>
          {/if}
        </div>
      {/if}

      {#if extraFacts.length > 0}
        <section aria-label="More letter facts" class="mb-8">
          <h2 class="text-lg font-bold text-gray-900 mb-3">More confirmed facts for today</h2>
          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {#each extraFacts as fact}
              <div class="bg-white rounded-xl border border-emerald-100 px-4 py-3 text-center">
                <dt class="text-xs uppercase tracking-wide text-gray-500">{fact.label}</dt>
                <dd class="text-xl font-bold text-gray-900">{fact.value}</dd>
              </div>
            {/each}
          </dl>
        </section>
      {/if}
    {:else}
      <section class="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 sm:p-10 text-center mb-6">
        <p class="text-lg text-gray-600">
          Today's Wordle answer is still updating. Check back shortly — this hint appears as soon as the answer is confirmed.
        </p>
      </section>
    {/if}

    <section aria-label="More Wordle hints" class="mb-10">
      <h2 class="text-xl font-bold text-gray-900 mb-4">More Wordle hints for {formattedDate}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each otherPages as page}
          <a
            href={`/wordle-hints/${page.slug}`}
            class="block bg-white rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition px-5 py-4"
          >
            <span class="font-semibold text-gray-900">{page.label}</span>
            <span class="block text-sm text-gray-500 mt-0.5">{page.question}</span>
          </a>
        {/each}
      </div>
    </section>

    <div class="flex flex-wrap gap-3 mb-10">
      <a
        href="/wordle-answer-today"
        class="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
      >
        Today's Wordle Answer
      </a>
      <a
        href="/wordle-solver"
        class="inline-flex items-center px-5 py-2.5 rounded-lg bg-white border border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
      >
        Wordle Solver
      </a>
    </div>

    {#if faqs.length > 0}
      <section aria-label="Frequently asked questions" class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
        <div class="space-y-4">
          {#each faqs as faq}
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <h3 class="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p class="text-gray-700">{faq.answer}</p>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>
