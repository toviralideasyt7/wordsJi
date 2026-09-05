<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import MinesweeperSolverClient from '$lib/components/minesweeper/MinesweeperSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    generateWebApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema,
  } from '$lib/seo';

  const pageTitle = 'Minesweeper Solver - Free Online Safe Move Finder';
  const pageDescription =
    'Use this free Minesweeper solver to find safe moves, mark mines, and analyze custom boards with smart hints.';
  const pageUrl = 'https://wordsolverx.com/minesweeper-solver';


  const schemas = JSON.stringify([
    generateHowToSchema('How to use the Minesweeper solver', [
      {
        name: 'Match your puzzle setup',
        text: 'Set the board width, height, and total mine count so the solver matches your real Minesweeper game.',
      },
      {
        name: 'Enter the visible board',
        text: 'Use the number and flag tools to fill in revealed clues and known mines on the board.',
      },
      {
        name: 'Analyze the next move',
        text: 'Click Find Next Move or Find All Moves to let the Minesweeper solver mark safe cells, mines, and the best fallback guesses.',
      },
    ]),
    {
      ...generateSoftwareApplicationSchema('Minesweeper Solver', 'GameApplication'),
      keywords: ['minesweeper solver', 'online minesweeper solver', 'minesweeper helper'],
    },
    generateWebApplicationSchema('Minesweeper Solver', pageDescription),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Minesweeper Solver', url: pageUrl },
    ]),
    generateWebPageSchema('Minesweeper Solver', pageDescription, pageUrl),
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="minesweeper solver, online minesweeper solver, minesweeper helper, minesweeper safe move finder, minesweeper probability solver, minesweeper board analyzer"
  />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/minesweeper-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <link rel="canonical" href={pageUrl} />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<section class="min-h-screen bg-slate-950">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 px-6 py-8 text-white shadow-2xl shadow-indigo-500/10 sm:px-8 sm:py-10">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
        Puzzle solver tool
      </p>
      <h1 class="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Minesweeper Solver</h1>
      <p class="mt-4 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
        This Minesweeper solver helps you map your board, identify safe clicks, and flag forced mines without leaving the browser. Enter your current puzzle, run the analysis, and use the highlighted next moves to solve faster.
      </p>
    </div>
  </section>

  <MinesweeperSolverClient />

  

    <div class="mt-12">
      <div class="mt-12">
  <StaticArticle content={ARTICLE_CONTENT['minesweeper-solver']} />
</div>

<AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </section>
