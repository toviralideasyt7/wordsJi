<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();

  let revealedComics = $state(false);
  let revealedMcu = $state(false);

  const socialImage = $derived(data.meta?.socialImage ?? 'https://wordsolverx.com/wordsolverx.webp');
  const cleanedSchemas = $derived(
    data.schemas ? stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES) : null
  );
  const comics = $derived(data.entry?.comics ?? null);
  const mcu = $derived(data.entry?.mcu ?? null);
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <meta name="news_keywords" content="marveldle, marveldle answer, marveldle today, marvel wordle, mcu wordle" />
  <meta name="robots" content="index, follow, max-snippet:-1" />
  <link rel="canonical" href="https://wordsolverx.com/marveldle-answer-today" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/marveldle-answer-today" />
  <meta property="og:image" content={socialImage} />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content={socialImage} />
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.meta.title,
    description: data.meta.description,
    url: 'https://wordsolverx.com/marveldle-answer-today',
    image: socialImage,
    dateModified: data.visibleDateKey
  })}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={data.publishedDate} />
<AnswerPageNoscript gameName="Marveldle" answer={comics?.name?.toUpperCase() ?? null} />

{#if data.error || !data.entry}
  <!-- Staleness state (Canuckle pattern): the solver runs at 06:05 UTC, three
       minutes after the 06:02 flip, and takes minutes to finish. Until the new
       entry lands we show "updating" — never yesterday's answers as today's. -->
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
        <svg class="h-7 w-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="text-sm font-semibold uppercase tracking-widest text-red-600">Marveldle</p>
      <h1 class="mt-2 text-2xl font-bold text-slate-900">Today's answers are updating</h1>
      <p class="mt-3 text-slate-500">
        The Marveldle characters for {data.formattedDate} are still being solved. Both modes are verified by our solver every morning shortly after the daily release — check back in a few minutes, or browse the archive and solver while you wait.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="/marveldle-archive" class="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors">
          Browse Archive
        </a>
        <a href="/marveldle-solver" class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
          Open Solver
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-slate-100 font-sans">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs hideSchema={true} />

      <!-- Hero -->
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-700 via-rose-800 to-slate-900 p-8 sm:p-10 shadow-xl mt-6">
        <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5"></div>
        <div class="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-400/10"></div>
        <div class="relative z-10">
          <div class="flex flex-wrap items-center gap-2.5 mb-3">
            <span class="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              Comics + MCU
            </span>
            <span class="inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-sm">
              {data.formattedDate}
            </span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight">Marveldle Answer Today ({data.formattedDate})</h1>
          <p class="mt-3 max-w-2xl text-base sm:text-lg text-rose-100/80 leading-relaxed">
            Hints and verified solutions for both Marveldle modes. Comics mode scores gender, type, species, powers, origin and first-appearance year; MCU mode scores appearance type, teams and the actor instead.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="/marveldle-solver" class="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-red-800 shadow-md hover:bg-red-50 transition-all hover:shadow-lg">
              Open Solver
            </a>
            <a href="/marveldle-archive" class="inline-flex items-center rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
              Browse Archive
            </a>
          </div>
        </div>
      </section>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Comics mode -->
        <section class="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <p class="text-xs font-semibold uppercase tracking-widest text-red-600">Comics mode</p>
          <h2 class="mt-1 text-2xl font-bold text-slate-900">Today's hint</h2>
          <ul class="mt-4 space-y-2 text-slate-600">
            <li>First appeared in <strong class="text-slate-900">{data.hints.comics.decade}</strong></li>
            <li><strong class="text-slate-900">{data.hints.comics.type}</strong> · {data.hints.comics.gender} · origin: {data.hints.comics.origin}</li>
            {#if data.hints.comics.firstTitle}
              <li>Debuted in <em>{data.hints.comics.firstTitle}</em></li>
            {/if}
          </ul>
          {#if !revealedComics}
            <button
              onclick={() => (revealedComics = true)}
              class="mt-5 w-full rounded-xl bg-red-700 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-red-800 transition-colors"
              aria-label="Reveal today's Marveldle Comics answer"
            >
              Reveal the Comics answer
            </button>
          {:else}
            <div class="mt-5 rounded-xl border-2 border-red-200 bg-red-50/60 p-5">
              <p class="text-xs font-semibold uppercase tracking-wider text-red-700">Comics answer</p>
              <p class="mt-1 text-2xl font-extrabold text-slate-900">{comics.name}</p>
              <p class="mt-2 text-sm text-slate-600">{comics.gender} {comics.type} · {(comics.species ?? []).join(', ')} · first appeared {comics.apparitionYear ?? '—'}</p>
            </div>
          {/if}
        </section>

        <!-- MCU mode -->
        <section class="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600">MCU mode</p>
          <h2 class="mt-1 text-2xl font-bold text-slate-900">Today's hint</h2>
          <ul class="mt-4 space-y-2 text-slate-600">
            <li>Appears in <strong class="text-slate-900">{data.hints.mcu.appearances}</strong></li>
            <li><strong class="text-slate-900">{data.hints.mcu.type}</strong> · {data.hints.mcu.gender} · origin: {data.hints.mcu.origin}</li>
            {#if data.hints.mcu.affiliations.length > 0}
              <li>Connected to {data.hints.mcu.affiliations.join(', ')}</li>
            {/if}
          </ul>
          {#if !revealedMcu}
            <button
              onclick={() => (revealedMcu = true)}
              class="mt-5 w-full rounded-xl bg-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-800 transition-colors"
              aria-label="Reveal today's Marveldle MCU answer"
            >
              Reveal the MCU answer
            </button>
          {:else}
            <div class="mt-5 rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-5">
              <p class="text-xs font-semibold uppercase tracking-wider text-indigo-700">MCU answer</p>
              <p class="mt-1 text-2xl font-extrabold text-slate-900">{mcu.name}</p>
              <p class="mt-2 text-sm text-slate-600">{mcu.gender} {mcu.type} · played by {mcu.actorName ?? '—'} · {(mcu.appearanceTypes ?? []).join(' / ')}</p>
            </div>
          {/if}
        </section>
      </div>

      <!-- Strategy -->
      <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-5">How to read the Marveldle grid</h2>
        <div class="space-y-4 text-slate-600 leading-relaxed">
          <p>Open with characters from far-apart corners of the roster. Gender and type split the pool into uneven groups, so a guess that probes an uncommon type tells you more than one more hero from the most common bucket.</p>
          <p>Species and powers are multi-value columns, which makes partial matches the most useful feedback on the board. A partial result means your guess and the answer share at least one item but not the full set — that is usually a sharper cut than it looks like.</p>
          <p>In Comics mode, the year column gives direction: higher means the answer debuted later, lower means earlier. An extreme year on your second guess moves you further along the axis than a safe middle pick.</p>
          <p>In MCU mode, appearance type and teams do the heavy lifting. Movie-only and series-only characters barely overlap, so the first guess that separates them halves the board immediately.</p>
        </div>
      </section>

      {#if data.recent.length > 1}
        <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 class="text-2xl font-bold text-slate-900 mb-5">Recent Marveldle answers</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Comics</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">MCU</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each data.recent as r}
                  <tr class="hover:bg-gray-50 {r.date === data.entry.date ? 'bg-red-50/50' : ''}">
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.date}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{r.comics?.name ?? '—'}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{r.mcu?.name ?? '—'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="mt-4">
            <a href="/marveldle-archive" class="text-red-700 hover:text-red-800 font-medium underline">See the full Marveldle archive</a>
            <span class="text-slate-400"> · </span>
            <a href="/marveldle-answer-yesterday" class="text-red-700 hover:text-red-800 font-medium underline">Yesterday's answers</a>
          </p>
        </section>
      {/if}

      <div class="mt-8">
        <FAQSection faqs={data.hintFaqs} />
      </div>

      <div class="mt-8">
        <AuthorCard
          name={PRESTON_HAYES_AUTHOR_NAME}
          image={PRESTON_HAYES_AUTHOR_IMAGE}
          description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
        />
      </div>

      <div class="mt-12">
        <InternalLinkSection currentGame="Marveldle" />
      </div>
    </div>
  </div>
{/if}
