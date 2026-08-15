<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import type { ApiColorfleModeAnswer } from '$lib/color-answers-api';
  import { getContrastColor } from '$lib/colorfle';
  import { generateArticleSchema, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();
  let revealed = $state(false);

  const publishedDate = $derived(data.publishedDate ?? null);
  const answer = $derived(data.answer ?? null);
  const recentEntries = $derived(data.recentEntries ?? []);
  const articleSchema = $derived(
    generateArticleSchema({
      headline: data.meta.title,
      description: data.meta.description,
      url: data.meta.canonical,
      image: `https://wordsolverx.com${data.meta.featuredImage}`,
      datePublished: publishedDate ?? undefined,
      dateModified: publishedDate ?? undefined
    })
  );
  const noscriptAnswer = $derived(
    answer
      ? `Normal: ${answer.normal.colors.map((color) => color.name).join(', ')}. Hard: ${answer.hard.colors.map((color) => color.name).join(', ')}.`
      : null
  );

  function formatEntryDate(isoDate: string) {
    const entryDate = new Date(`${isoDate}T00:00:00Z`);
    return entryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  function formatWeight(weight: number | undefined) {
    return typeof weight === 'number' ? `${Math.round(weight * 100)}%` : '';
  }

  function buildConicGradient(modeAnswer: ApiColorfleModeAnswer) {
    let offset = 0;
    const segments = modeAnswer.colors.map((color) => {
      const start = Math.round(offset * 360);
      offset += color.weight ?? 0;
      const end = Math.round(offset * 360);
      return `${color.hex} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from 0deg, ${segments.join(', ')})`;
  }
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <link rel="canonical" href={data.meta.canonical} />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:url" content={data.meta.canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content={`https://wordsolverx.com${data.meta.featuredImage}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content={`https://wordsolverx.com${data.meta.featuredImage}`} />
  {@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
  {#if data.schemas}
    {@html `<script type="application/ld+json">${stripStructuredDataTypes(data.schemas, ['FAQPage', 'HowTo']) ?? data.schemas}</script>`}
  {/if}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Colorfle" answer={noscriptAnswer} />

{#if data.error || !answer}
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-2xl rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-lg">
      <p class="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">Colorfle</p>
      <h1 class="mt-3 text-3xl font-black text-slate-900">Today's Colorfle answers are temporarily unavailable</h1>
      <p class="mt-4 text-base leading-8 text-slate-600">
        We could not load the verified normal and hard mode answers from the worker API right now.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="/colorfle-archive" class="inline-flex items-center rounded-full bg-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-500">
          Browse Archive
        </a>
        <a href="/colorfle-solver" class="inline-flex items-center rounded-full border border-pink-200 bg-white px-6 py-3 text-sm font-bold text-pink-700 transition hover:border-pink-300 hover:bg-pink-50">
          Open Solver
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs hideSchema={true} />

      <section class="mt-6 rounded-[2rem] border border-pink-100 bg-white p-8 shadow-[0_20px_60px_rgba(236,72,153,0.08)] sm:p-10">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-pink-500">Daily Color Puzzle</p>
        <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Colorfle Answers Today ({data.formattedDate})
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Puzzle #{answer.puzzleNumber}. The worker now powers this page directly, so you can check both
          the normal three-color mix and the hard four-color mix in one place.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/colorfle-solver" class="inline-flex items-center rounded-full bg-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl">
            Open Solver
          </a>
          <a href="/colorfle-archive" class="inline-flex items-center rounded-full border border-pink-200 bg-white px-6 py-3 text-sm font-bold text-pink-700 transition hover:border-pink-300 hover:bg-pink-50">
            Browse Archive
          </a>
        </div>
      </section>

      <section class="mt-8 rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_20px_60px_rgba(236,72,153,0.06)] sm:p-10">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Today's Colorfle answers</h2>
            <p class="mt-2 text-sm text-slate-500">
              Reveal the source colors for both modes, plus the computed mixed target preview.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-pink-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-500"
            onclick={() => (revealed = !revealed)}
            aria-label={revealed ? 'Hide Colorfle answers' : 'Reveal Colorfle answers'}
          >
            {revealed ? 'Hide answers' : 'Reveal answers'}
          </button>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
          {#each [answer.normal, answer.hard] as modeAnswer}
            <article class="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.24em] text-pink-500">{modeAnswer.label} mode</p>
                  <h3 class="mt-2 text-2xl font-black text-slate-900">
                    {modeAnswer.colors.length} source colors
                  </h3>
                </div>
                <div class="rounded-2xl border border-white/70 bg-white px-4 py-3 text-right shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Target</p>
                  <p class="mt-2 font-mono text-sm font-bold text-slate-900">{modeAnswer.targetColor.hex}</p>
                </div>
              </div>

              <div class="relative mx-auto mt-8 flex justify-center">
                <div class="relative h-56 w-56 sm:h-64 sm:w-64">
                  {#if revealed}
                    <div
                      class="h-full w-full rounded-full ring-4 ring-white shadow-2xl transition-all duration-500"
                      style={`background:${buildConicGradient(modeAnswer)}; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);`}
                    ></div>
                  {:else}
                    <div class="flex h-full w-full items-center justify-center rounded-full bg-slate-200 ring-4 ring-white shadow-2xl">
                      <span class="text-4xl font-black text-slate-400">?</span>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="rounded-full bg-white/95 px-5 py-3 text-sm font-bold text-slate-700 shadow-xl ring-2 ring-pink-100">
                        Click reveal
                      </span>
                    </div>
                  {/if}
                </div>
              </div>

              <div class="mt-8 grid gap-3 sm:grid-cols-2">
                {#each modeAnswer.colors as color, index}
                  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    {#if revealed}
                      <div class="flex items-center gap-4">
                        <div
                          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 shadow-inner"
                          style={`background:${color.hex}; color:${getContrastColor(color.hex)}`}
                        >
                          <span class="text-xs font-black uppercase tracking-[0.16em]">
                            {formatWeight(color.weight)}
                          </span>
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-slate-900">{color.name}</p>
                          <p class="mt-1 font-mono text-xs text-slate-500">{color.hex}</p>
                          <p class="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-600">
                            {formatWeight(color.weight)}
                          </p>
                        </div>
                      </div>
                    {:else}
                      <div class="flex items-center gap-4">
                        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-200 shadow-inner">
                          <span class="text-2xl font-black text-slate-400">{index + 1}</span>
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-slate-400">Hidden</p>
                          <p class="mt-1 font-mono text-xs text-slate-300">---</p>
                          <p class="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                            --%
                          </p>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>

              {#if revealed}
                <div class="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mixed result</p>
                  <div class="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div class="flex items-center gap-4">
                      <div
                        class="h-16 w-16 rounded-full border-4 border-white shadow-lg"
                        style={`background:${modeAnswer.targetColor.hex}`}
                      ></div>
                      <div>
                        <p class="font-mono text-lg font-bold text-slate-900">{modeAnswer.targetColor.hex}</p>
                        <p class="text-sm text-slate-500">
                          RGB({modeAnswer.targetColor.rgb.r}, {modeAnswer.targetColor.rgb.g},
                          {modeAnswer.targetColor.rgb.b})
                        </p>
                      </div>
                    </div>
                    <p class="max-w-xs text-sm leading-6 text-slate-600 sm:text-right">
                      The worker gives the verified source colors. WordSolverX computes this target preview at build time from those exact inputs.
                    </p>
                  </div>
                </div>
              {/if}
            </article>
          {/each}
        </div>
      </section>

      <section class="mt-8 rounded-[2rem] border border-pink-100 bg-white p-8 shadow-[0_20px_60px_rgba(236,72,153,0.06)] sm:p-10">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-slate-900">Recent Colorfle answers</h2>
            <p class="mt-2 text-sm text-slate-500">Recent puzzles from the same worker source, with normal and hard previews.</p>
          </div>
          <a href="/colorfle-archive" class="text-sm font-bold text-pink-600 hover:text-pink-500">View full archive &rarr;</a>
        </div>

        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {#each recentEntries as entry}
            <a href={`/colorfle-archive?date=${entry.date}`} class="group block rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/50 p-5 transition hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/40">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-bold text-slate-800">#{entry.puzzleNumber}</p>
                  <p class="mt-0.5 text-xs text-slate-500">{formatEntryDate(entry.date)}</p>
                </div>
                <div
                  class="h-12 w-12 rounded-full shadow-md ring-2 ring-white transition-transform group-hover:scale-105"
                  style={`background:${entry.normal.targetColor.hex}; box-shadow: 0 12px 30px ${entry.normal.targetColor.hex}33`}
                ></div>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-pink-500">Normal</p>
                  <div class="mt-2 flex items-center gap-2">
                    {#each entry.normal.colors as color}
                      <div
                        class="h-7 w-7 rounded-lg ring-2 ring-white shadow-sm"
                        style={`background:${color.hex}`}
                        title={color.name}
                      ></div>
                    {/each}
                  </div>
                </div>
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">Hard</p>
                  <div class="mt-2 flex items-center gap-2">
                    {#each entry.hard.colors as color}
                      <div
                        class="h-7 w-7 rounded-lg ring-2 ring-white shadow-sm"
                        style={`background:${color.hex}`}
                        title={color.name}
                      ></div>
                    {/each}
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </section>

      {#if false}
      <article class="mt-8 space-y-8">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 class="text-3xl font-black tracking-tight text-slate-900">What changed on this page</h2>
          <div class="mt-4 space-y-4 text-lg leading-8 text-slate-600">
            <p>
              This page now uses the shared Color Answers worker directly instead of building Colorfle answers only from the local archive logic.
            </p>
            <p>
              That fixes two long-standing problems at once: the daily answer is generated from the live API at build time, and the page now includes both normal and hard mode answers instead of only the normal mix.
            </p>
            <p>
              The blended target preview still appears here, but it is now derived from the verified worker response so the reveal matches the stored answer set for the selected date.
            </p>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 class="text-3xl font-black tracking-tight text-slate-900">How to use the two modes</h2>
          <div class="mt-6 space-y-6">
            <div class="rounded-2xl bg-slate-50 p-6">
              <h3 class="text-xl font-bold text-slate-900">Normal mode</h3>
              <p class="mt-2 text-base leading-7 text-slate-600">
                Normal mode uses three source colors, so the dominant hue is easier to identify quickly. It is the better place to study how the weight distribution changes the final target.
              </p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-6">
              <h3 class="text-xl font-bold text-slate-900">Hard mode</h3>
              <p class="mt-2 text-base leading-7 text-slate-600">
                Hard mode adds the fourth color and spreads the weights more evenly, which makes the final mix feel less obvious. Comparing the hard preview beside the normal one helps you see how a smaller fourth input shifts the result.
              </p>
            </div>
          </div>
        </section>
      </article>
      {/if}

      <div class="mt-8">
        <StaticArticle content={ARTICLE_CONTENT['colorfle-answer-today']} vars={{ date: data.formattedDate, answer: data.answer?.normal?.targetColor?.hex ?? '' }} />


        <AuthorCard
          name={PRESTON_HAYES_AUTHOR_NAME}
          image={PRESTON_HAYES_AUTHOR_IMAGE}
          description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
        />
      </div>

      <div class="mt-8">
        <InternalLinkSection currentGame="Colorfle" />
      </div>
    </div>
  </div>
{/if}
