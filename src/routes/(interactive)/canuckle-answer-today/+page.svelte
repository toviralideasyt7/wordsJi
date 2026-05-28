<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import GeneratedTodayArticle from '$lib/components/GeneratedTodayArticle.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import { stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();

  const formattedDate = $derived(data.formattedDate ?? 'today');
  const publishedDate = $derived(`${data.visibleDateKey}T00:00:00Z`);
  const socialImage = $derived(
    data.meta?.featuredImage?.startsWith('http')
      ? data.meta.featuredImage
      : `https://wordsolverx.com${data.meta?.featuredImage ?? '/wordsolverx.webp'}`
  );
  const cleanedSchemas = $derived(
    stripStructuredDataTypes(data.schemas, ['FAQPage', 'HowTo'])
  );
</script>

<svelte:head>
  <title>{data.meta?.title ?? 'Canuckle Answer Today'}</title>
  <meta name="description" content={data.meta?.description ?? ''} />
  <meta name="robots" content="index, follow, max-snippet:-1" />
  <meta name="news_keywords" content={data.meta?.keywords ?? 'canuckle answer today, canuckle hint, daily canadian puzzle'} />
  <link rel="canonical" href="https://wordsolverx.com/canuckle-answer-today" />
  <meta property="og:title" content={data.meta?.title ?? 'Canuckle Answer Today'} />
  <meta property="og:description" content={data.meta?.description ?? ''} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/canuckle-answer-today" />
  <meta property="og:image" content={socialImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`Canuckle daily word solution for ${formattedDate}`} />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta?.title ?? 'Canuckle Answer Today'} />
  <meta name="twitter:description" content={data.meta?.description ?? ''} />
  <meta name="twitter:image" content={socialImage} />
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.meta?.title ?? 'Canuckle Answer Today',
    description: data.meta?.description ?? '',
    url: 'https://wordsolverx.com/canuckle-answer-today',
    image: socialImage,
    dateModified: data.todayPuzzle?.date || new Date().toISOString().split('T')[0]
  })}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Canuckle" answer={data.todayPuzzle?.answer?.toUpperCase() ?? null} />

{#if data.error || !data.todayPuzzle}
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
        <svg class="h-7 w-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
      </div>
      <p class="text-sm font-semibold uppercase tracking-widest text-teal-600">Canuckle</p>
      <h1 class="mt-2 text-2xl font-bold text-slate-900">Data is temporarily unavailable</h1>
      <p class="mt-3 text-slate-500">
        Today's Canuckle answer isn't available yet. Browse the archive or try the solver while you wait.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="/canuckle-archive" class="inline-flex items-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition-colors">
          Browse Archive
        </a>
        <a href="/canuckle-solver" class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
          Open Solver
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-slate-50/60">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      <Breadcrumbs hideSchema={true} />

      <!-- Hero Section — Light Teal Gradient -->
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-8 sm:p-10 shadow-xl">
        <!-- Decorative shapes -->
        <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5"></div>
        <div class="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-400/10"></div>
        <div class="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full bg-white/[0.03]"></div>

        <div class="relative z-10">
          <div class="flex flex-wrap items-center gap-2.5 mb-3">
            <span class="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <svg class="mr-1.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              Puzzle #{data.todayPuzzle.index}
            </span>
            <span class="inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-sm">
              {formattedDate}
            </span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight">Canuckle Answer Today ({formattedDate})</h1>
          <p class="mt-3 max-w-2xl text-base sm:text-lg text-teal-50/80 leading-relaxed">
            Verified answer, puzzle number, and Canadian fact for today's Canuckle puzzle.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="/canuckle-solver" class="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow-md hover:bg-teal-50 transition-all hover:shadow-lg">
              Open Solver
            </a>
            <a href="/canuckle-archive" class="inline-flex items-center rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
              Browse Archive
            </a>
          </div>
        </div>
      </section>

      <!-- Trust Indicators — Clean pill bar -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="flex items-center gap-3 rounded-xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <svg class="h-4.5 w-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">Verified Daily</p>
            <p class="text-[11px] text-slate-500">Answers checked each day</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
            <svg class="h-4.5 w-4.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">Updated Midnight ET</p>
            <p class="text-[11px] text-slate-500">Synced with game clock</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
            <svg class="h-4.5 w-4.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">1,500+ Puzzles</p>
            <p class="text-[11px] text-slate-500">Historical archive tracked</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <svg class="h-4.5 w-4.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">{PRESTON_HAYES_AUTHOR_NAME}</p>
            <p class="text-[11px] text-slate-500">Word Puzzle Expert</p>
          </div>
        </div>
      </section>

      <section id="today-answer-reveal" class="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xl">
        <div class="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div class="p-6 sm:p-8">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Today&apos;s verified answer</p>
            <h2 class="mt-3 text-4xl font-black tracking-[0.18em] text-slate-900 sm:text-5xl">
              {data.todayPuzzle.answer.toUpperCase()}
            </h2>
            <p class="mt-4 text-base leading-7 text-slate-600">
              Puzzle #{data.todayPuzzle.index} for {formattedDate}. This answer is rendered directly in the page HTML for faster crawlability and easier verification.
            </p>

            <div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Canadian fact</p>
              <p class="mt-3 text-base leading-7 text-slate-700">{data.todayPuzzle.fact}</p>
            </div>
          </div>

          <aside class="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
            <div class="mt-5 space-y-3">
              <a href="/canuckle-solver" class="flex items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500">
                Open Solver
              </a>
              <a href="/canuckle-archive" class="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Browse Archive
              </a>
            </div>

            <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Date key</p>
              <p class="mt-2 text-lg font-bold text-slate-900">{data.visibleDateKey}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                This page now shows the answer directly instead of hiding it behind the client-only daily widget.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <!-- Yesterday's Answer — Light Info Card -->
      {#if data.yesterdayData}
        <section class="rounded-xl bg-gradient-to-r from-amber-50 via-white to-teal-50 p-5 border border-amber-200/60">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Yesterday&apos;s Answer</span>
            <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Puzzle #{data.yesterdayData.index}</span>
          </div>
          <p class="text-base text-slate-700">
            Yesterday&apos;s word was
            <span class="inline-flex items-center rounded-lg bg-white px-3 py-1 font-bold text-teal-700 border border-slate-200 shadow-sm mx-1 tracking-wide">
              {data.yesterdayData.answer.toUpperCase()}
            </span>
          </p>
        </section>
      {/if}

      <GeneratedTodayArticle articleKey="canuckle-answer-today" articleDate={data.visibleDateKey} />

      {#if false}
      <!-- Thin Separator -->
      <div class="flex items-center gap-4 py-2">
        <div class="flex-1 h-px bg-slate-200"></div>
        <span class="text-xs font-semibold uppercase tracking-widest text-slate-400">Guide</span>
        <div class="flex-1 h-px bg-slate-200"></div>
      </div>

      <article class="space-y-6">

        <section class="rounded-xl bg-white border border-slate-200 p-6 sm:p-5 sm:p-8 shadow-sm">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4">Quick Tips for Canuckle</h2>
          <div class="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Canuckle is Wordle with a Canadian twist — every answer has a connection to Canada. The answer card above shows today's word, puzzle number, and a Canadian fact. It resets at midnight Eastern Time.
            </p>
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
                <h3 class="font-semibold text-slate-900 mb-2">Think Canadian first</h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  Words like TOQUE, POUTINE, MAPLE, LOONIE, MOOSE, and SYRUP are all fair game. Once you have a few letters locked in, reach for Canadian vocabulary before generic English words.
                </p>
              </div>
              <div class="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
                <h3 class="font-semibold text-slate-900 mb-2">Open with ABOUT</h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  ABOUT tests four vowels plus B and T — letters that show up constantly in Canadian answers. It's the best single opener for this game specifically.
                </p>
              </div>
              <div class="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
                <h3 class="font-semibold text-slate-900 mb-2">Check recent answers</h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  Canuckle rarely repeats within a month. Scan the recent answers grid below before guessing to avoid wasting a try on a word that already came up.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl bg-white border border-slate-200 p-6 sm:p-5 sm:p-8 shadow-sm">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">Canuckle FAQ</h2>
          <div class="space-y-3">
            <details class="group rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300">
              <summary class="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-slate-900 select-none">
                What time does Canuckle reset?
                <svg class="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div class="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                Midnight Eastern Time, same as Wordle for North American players. If you're in Europe or Asia, the new puzzle appears in your early morning hours.
              </div>
            </details>
            <details class="group rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300">
              <summary class="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-slate-900 select-none">
                What does the red feedback mean?
                <svg class="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div class="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                Red is Canuckle's version of Wordle's gray — the letter isn't in the answer. Yellow means it's in the word but in a different spot. Green means correct spot.
              </div>
            </details>
            <details class="group rounded-lg border border-slate-200 bg-white transition-all hover:border-slate-300">
              <summary class="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-slate-900 select-none">
                How do I browse earlier answers?
                <svg class="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div class="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                The recent answers grid below covers the last 30 days. For the full history, visit the <a href="/canuckle-archive" class="font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-500">Canuckle archive</a>.
              </div>
            </details>
          </div>
        </section>
      </article>
      {/if}

        <!-- Recent 30-Day Answers -->
        {#if data.last30 && data.last30.length > 0}
          <section class="rounded-xl bg-white border border-slate-200 p-6 sm:p-5 sm:p-8 shadow-sm">
            <div class="flex items-start gap-3 mb-2">
              <div class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <svg class="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-0.5">Archive</p>
                <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Recent Canuckle Answers</h2>
              </div>
            </div>
            <p class="text-sm text-slate-500 mb-5">Last {data.last30.length} days of verified Canuckle answers.</p>
            <div class="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {#each data.last30 as entry}
                <div class="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3 transition-colors hover:bg-teal-50/50 hover:border-teal-200/60">
                  <div>
                    <p class="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{entry.answer.toUpperCase()}</p>
                    <p class="text-xs text-slate-500">{entry.date}</p>
                  </div>
                  <span class="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 border border-slate-200">#{entry.index}</span>
                </div>
              {/each}
            </div>
          </section>
        {/if}
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />

      <InternalLinkSection currentGame="Canuckle" />
    </div>
  </div>
{/if}
