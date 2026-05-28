<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ColorClues from '$lib/components/ColorClues.svelte';
  import GeneratedTodayArticle from '$lib/components/GeneratedTodayArticle.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import { generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';

  let { data } = $props();
  let historySearch = $state('');

  const featuredImage = $derived(data.meta?.featuredImage ?? '/images/colordle-answer-today.webp');
  const publishedDate = $derived(data.publishedDate ?? null);
  const requestedDateLabel = $derived(data.requestedFormattedDate ?? data.formattedDate ?? 'today');
  const answerDateLabel = $derived(data.formattedDate ?? requestedDateLabel);
  const generatedBonusHints = $derived(data.generatedArticle?.bonusHints ?? []);
  const historyEntries = $derived(data.last100Days ?? []);
  const webPageSchema = $derived(
    generateWebPageSchema(
      data.meta?.title ?? 'Colordle Answer Today',
      data.meta?.description ?? '',
      'https://wordsolverx.com/colordle-answer-today',
      {
        image: featuredImage.startsWith('http') ? featuredImage : `https://wordsolverx.com${featuredImage}`,
        dateModified: data.publishedDate ?? new Date().toISOString().split('T')[0]
      }
    )
  );
  const noscriptAnswer = $derived(
    `${data.color?.name ?? ''}${data.color?.hex ? ` (${data.color.hex})` : ''}`.trim() || null
  );
  const cleanedSchemas = $derived(
    stripStructuredDataTypes(data.schemas, ['FAQPage', 'HowTo'])
  );

  const filteredHistory = $derived.by(() => {
    const query = historySearch.trim().toLowerCase();
    if (!query) {
      return historyEntries;
    }

    return historyEntries.filter((entry) =>
      [entry.formattedDate, entry.color.name, entry.color.hex].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  });
</script>

<svelte:head>
  <title>{data.meta?.title ?? 'Colordle Answer Today'}</title>
  <meta name="description" content={data.meta?.description ?? ''} />
  <meta name="robots" content="index, follow, max-snippet:-1" />
  <meta
    name="news_keywords"
    content={data.meta?.keywords ?? 'colordle answer today, colordle hint, daily color puzzle'}
  />
  <link rel="canonical" href="https://wordsolverx.com/colordle-answer-today" />
  <meta property="og:title" content={data.meta?.title ?? 'Colordle Answer Today'} />
  <meta property="og:description" content={data.meta?.description ?? ''} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/colordle-answer-today" />
  <meta property="og:image" content={featuredImage} />
  <meta property="og:image:alt" content={`Colordle answer for ${answerDateLabel}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta?.title ?? 'Colordle Answer Today'} />
  <meta name="twitter:description" content={data.meta?.description ?? ''} />
  <meta name="twitter:image" content={featuredImage} />
  {@html `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`}
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Colordle" answer={noscriptAnswer} />

{#if data.error || !data.color}
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-lg">
      <p class="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500">Colordle</p>
      <h1 class="mt-3 text-3xl font-black text-slate-900">Latest Colordle data is temporarily unavailable</h1>
      <p class="mt-4 text-base leading-8 text-slate-600">
        We could not load a verified Colordle answer for {requestedDateLabel} right now. You can still browse the archive or use the solver while the latest answer refreshes.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="/colordle-archive" class="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500">
          Browse Archive
        </a>
        <a href="/colordle-solver" class="inline-flex items-center rounded-full border border-indigo-200 bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50">
          Open Solver
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs hideSchema={true} />

      <section class="mt-6 rounded-[2rem] border border-indigo-100 bg-white p-8 shadow-[0_20px_60px_rgba(79,70,229,0.08)] sm:p-10">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500">Daily Color Puzzle</p>
        <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Colordle Answer Today ({answerDateLabel})
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
          The worker API now feeds this page directly, so the color name, hex code, and recent history all come from the same verified source.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/colordle-solver" class="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl">
            Open Solver
          </a>
          <a href="/colordle-archive" class="inline-flex items-center rounded-full border border-indigo-200 bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50">
            Browse Archive
          </a>
        </div>
      </section>

      <section class="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-[0_20px_60px_rgba(79,70,229,0.06)] sm:p-10">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-indigo-500">Today's answer</p>
            <h2 class="mt-2 text-3xl font-black text-slate-900">{data.color.name}</h2>
            <p class="mt-2 font-mono text-lg font-bold text-indigo-600">{data.color.hex}</p>
            <p class="mt-3 text-sm text-slate-500">Puzzle #{data.dayNum} for {answerDateLabel}</p>
          </div>
          {#if data.yesterdayData}
            <div class="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 shadow-sm sm:max-w-xs">
              <p class="font-semibold uppercase tracking-[0.2em] text-slate-400">Yesterday</p>
              <p class="mt-2 font-bold text-slate-900">{data.yesterdayData.color.name}</p>
              <p class="font-mono text-indigo-600">{data.yesterdayData.color.hex}</p>
              <p class="mt-2">{data.yesterdayData.formattedDate}</p>
            </div>
          {/if}
        </div>

        <div class="mt-8">
          <ColorClues colorName={data.color.name} colorHex={data.color.hex} showAnswerReveal={false} />
        </div>

        {#if data.gameNarrative?.guesses?.length}
          <div class="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Suggested solve path</p>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Today's puzzle felt <strong class="text-slate-900">{data.gameNarrative.difficultyLabel}</strong>. Here is a plausible path using the same color-difference logic the solver relies on.
            </p>
            <div class="mt-5 space-y-4">
              {#each data.gameNarrative.guesses as guess, index}
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm" style={`background:${guess.hex}`}></div>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Guess {index + 1}</span>
                      <span class="font-bold text-slate-900">{guess.name}</span>
                      <span class="font-mono text-sm {guess.percent === 100 ? 'text-emerald-600' : 'text-slate-500'}">
                        {guess.percent === 100 ? '100%' : `${guess.percent}%`}
                      </span>
                    </div>
                    <p class="mt-1 text-sm leading-6 text-slate-500">
                      {#if guess.percent === 100}
                        Exact match. That locks in {data.color.name} at {data.color.hex}.
                      {:else if guess.percent >= 85}
                        Close enough that the next move is usually a narrower shade in the same family.
                      {:else if guess.percent >= 60}
                        Useful signal, but broad enough that the hue family still needed refinement.
                      {:else}
                        A low match, so the next guess should pivot harder across the spectrum.
                      {/if}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </section>

      {#if generatedBonusHints.length > 0}
        <section class="mt-8 rounded-[2rem] border border-fuchsia-100 bg-white p-6 shadow-[0_20px_60px_rgba(217,70,239,0.06)] sm:p-8">
          <p class="text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-500">Extra hints</p>
          <h2 class="mt-2 text-2xl font-black text-slate-900">Fresh nudges before you peek elsewhere</h2>
          <div class="mt-6 grid gap-3 md:grid-cols-2">
            {#each generatedBonusHints as hint}
              <div class="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/70 px-4 py-4 text-sm leading-6 text-slate-700">
                {hint}
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <GeneratedTodayArticle
        articleKey="colordle-answer-today"
        articleDate={data.dateKey}
        fallbackSummary={data.meta?.description ?? ''}
      />

      <section class="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-indigo-500">Recent history</p>
            <h2 class="mt-2 text-2xl font-black text-slate-900">The last 100 Colordle answers</h2>
          </div>
          <p class="text-sm text-slate-500">
            Search by date, color name, or hex code.
          </p>
        </div>

        <form class="mt-6 flex overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm" onsubmit={(event) => event.preventDefault()}>
          <input
            bind:value={historySearch}
            type="search"
            placeholder="Search by date, color name, or hex code..."
            class="min-w-0 flex-1 bg-transparent px-5 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            class="border-l border-indigo-200 bg-indigo-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-indigo-500"
          >
            Search
          </button>
        </form>

        <div class="mt-6 grid gap-3 md:grid-cols-2">
          {#each filteredHistory as entry}
            <div class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/60">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900">{entry.formattedDate}</p>
                <p class="text-xs text-slate-500">Daily color</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-slate-900">{entry.color.name}</p>
                <p class="font-mono text-sm text-indigo-600">{entry.color.hex}</p>
              </div>
            </div>
          {/each}
        </div>

        {#if historySearch.trim() && filteredHistory.length === 0}
          <p class="mt-6 text-center text-slate-500">No matching colors found in the recent archive.</p>
        {/if}
      </section>

      <section class="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-3xl font-black text-slate-900">Frequently asked questions</h2>
        <div class="mt-6 space-y-4">
          <details class="group rounded-2xl border border-slate-200 bg-slate-50 p-5" open>
            <summary class="cursor-pointer font-semibold text-slate-900">
              What is the Colordle answer for {answerDateLabel}?
            </summary>
            <p class="mt-3 text-slate-600">
              The answer is <strong class="text-slate-900">{data.color.name}</strong> with hex code
              <span class="font-mono text-indigo-600"> {data.color.hex}</span>.
            </p>
          </details>

          <details class="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <summary class="cursor-pointer font-semibold text-slate-900">
              What does the percentage score mean in Colordle?
            </summary>
            <p class="mt-3 text-slate-600">
              The score reflects perceptual similarity, not just raw RGB distance. A higher percentage means your guess is visually closer to the target color.
            </p>
          </details>

          <details class="group rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <summary class="cursor-pointer font-semibold text-slate-900">
              Where can I compare older Colordle answers?
            </summary>
            <p class="mt-3 text-slate-600">
              Use the recent history section above for quick lookups, or open the
              <a href="/colordle-archive" class="font-semibold text-indigo-600 hover:text-indigo-500"> Colordle archive</a>
              for the broader date-by-date view.
            </p>
          </details>
        </div>
      </section>

      <div class="mt-12">
        <AuthorCard
          name={PRESTON_HAYES_AUTHOR_NAME}
          image={PRESTON_HAYES_AUTHOR_IMAGE}
          description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
        />
      </div>

      <div class="mt-16">
        <InternalLinkSection currentGame="Colordle" />
      </div>
    </div>
  </div>
{/if}
