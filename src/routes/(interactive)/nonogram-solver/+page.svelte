<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import NonogramSolverClient from '$lib/components/nonogram/NonogramSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  let { data } = $props();

  const pageTitle = 'Nonogram Solver - Solve Picross Puzzles Instantly';
  const pageDescription =
    'Paste your nonogram clues into the grid and watch the solver fill in the picture. Handles Picross, Griddlers and Hanjie puzzles up to 20 by 20, free.';
  const pageUrl = 'https://wordsolverx.com/nonogram-solver';

  const schemas = JSON.stringify([
    generateHowToSchema('How to use the nonogram solver', [
      { name: 'Set the grid size', text: 'Use the row and column steppers to match your puzzle, up to 20 by 20.' },
      { name: 'Enter the clues', text: 'Type each row and column clue as space-separated numbers, using 0 for empty lines. Or load one of the sample puzzles.' },
      { name: 'Solve and replay', text: 'Hit Solve puzzle, then scrub the solving log to step through every deduction, guess and backtrack.' }
    ]),
    {
      ...generateSoftwareApplicationSchema('Nonogram Solver', 'GameApplication'),
      keywords: ['nonogram solver', 'picross solver', 'griddlers solver', 'hanjie solver', 'nonogram puzzle solver online']
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Nonogram Solver', url: pageUrl }
    ]),
    generateWebPageSchema('Nonogram Solver', pageDescription, pageUrl)
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="nonogram solver, picross solver, griddlers solver, hanjie solver, nonogram puzzle solver online, picross puzzle solver"
  />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/wordsolverx.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<section class="min-h-screen bg-white">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50 px-6 py-8 sm:px-10 sm:py-10 shadow-2xl">
      <p class="inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
        Puzzle Solver
      </p>
      <h1 class="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">Nonogram Solver</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600 leading-relaxed">
        Enter your Picross clues and get the finished picture in seconds, with a step-by-step replay of every deduction. Free, up to 20 by 20.
      </p>
    </div>
  </section>

  <NonogramSolverClient />

  <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mt-12">
      <StaticArticle content={data.article} />

      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </section>
</section>
