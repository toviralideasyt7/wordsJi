<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <link rel="canonical" href={data.canonical} />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={data.canonical} />
  <meta property="og:site_name" content="WordAuditor" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.meta.title,
    description: data.meta.description,
    url: data.canonical
  })}</script>`}
  {@html `<script type="application/ld+json">${data.faqSchema}</script>`}
</svelte:head>

<!-- NOTE: the layout already renders <main id="main-content"> — this page must not nest a second <main>. -->
<div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    <nav aria-label="Breadcrumb" class="text-sm text-emerald-700 mb-6">
      <ol class="flex flex-wrap items-center gap-1.5">
        <li><a href="/" class="hover:underline">Home</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="/wordle-answer-today" class="hover:underline">Wordle</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-emerald-900 font-medium">Wordle Hints</li>
      </ol>
    </nav>

    <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
      Wordle Hints for {data.formattedDate}
    </h1>
    <p class="text-sm text-gray-500 mb-6">
      Wordle #{data.wordleNumber} &middot; {data.formattedDate}
    </p>

    <p class="text-gray-700 text-lg leading-relaxed mb-8">
      Twelve hints for today's puzzle, ordered from gentlest to strongest. The early ones only narrow
      the word down — a starting letter, a vowel count. The last one, the definition, all but gives the
      word away. Take only as much help as you need, then head back to your grid.
    </p>

    {#if data.hasAnswer}
      {#if data.aiOneLiner}
        <aside class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Bonus clue</p>
          <p class="text-gray-800 italic">{data.aiOneLiner}</p>
        </aside>
      {/if}

      {#if data.difficultyLabel}
        <div class="flex flex-wrap items-center gap-2 mb-8">
          <span class="text-sm font-medium text-gray-600">Difficulty:</span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
            {data.difficultyLabel}{#if data.difficultyScore > 0}&nbsp;({data.difficultyScore}/10){/if}
          </span>
          {#if data.difficultyReason}
            <span class="text-xs text-gray-500">{data.difficultyReason}</span>
          {/if}
        </div>
      {/if}

      <nav aria-label="Hint sections" class="mb-10">
        <div class="flex flex-wrap gap-2">
          {#each data.sections as section}
            <a
              href={`#${section.slug}`}
              class="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-emerald-200 text-sm font-medium text-emerald-800 hover:border-emerald-400 hover:shadow-sm transition"
            >
              {section.label}
            </a>
          {/each}
        </div>
      </nav>

      <div class="space-y-6 mb-10">
        {#each data.sections as section}
          <section id={section.slug} aria-label={section.question} class="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 sm:p-8 scroll-mt-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{section.question}</h2>
            {#if section.value}
              <p class="text-4xl sm:text-5xl font-black text-emerald-600 tracking-widest break-words text-center py-2">
                {section.value}
              </p>
            {:else}
              <p class="text-lg text-gray-600 text-center py-2">{section.emptyNote}</p>
            {/if}
            <p class="text-gray-700 leading-relaxed mt-4">{section.explain}</p>

            {#if section.extraFacts.length > 0}
              <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {#each section.extraFacts as fact}
                  <div class="bg-emerald-50 rounded-xl border border-emerald-100 px-4 py-3 text-center">
                    <dt class="text-xs uppercase tracking-wide text-gray-500">{fact.label}</dt>
                    <dd class="text-xl font-bold text-gray-900">{fact.value}</dd>
                  </div>
                {/each}
              </dl>
            {/if}
          </section>
        {/each}
      </div>
    {:else}
      <section class="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 sm:p-10 text-center mb-10">
        <p class="text-lg text-gray-600">
          Today's Wordle answer is still updating. Check back shortly — the full hint set appears here
          as soon as the answer is confirmed.
        </p>
      </section>
    {/if}

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

    {#if data.faqs.length > 0}
      <section aria-label="Frequently asked questions" class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
        <div class="space-y-3">
          {#each data.faqs as faq}
            <details class="bg-white rounded-xl border border-gray-200 px-5 py-4">
              <summary class="font-semibold text-gray-900 cursor-pointer">{faq.question}</summary>
              <p class="text-gray-700 mt-2">{faq.answer}</p>
            </details>
          {/each}
        </div>
      </section>
    {/if}

    <p class="text-sm text-gray-500">
      This page updates with every new puzzle. For a past day's hints, the
      <a href="/wordle-answer-archive" class="text-teal-600 hover:text-teal-700 underline">Wordle archive</a>
      lists every answer by date.
    </p>
  </div>
</div>
