<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import SquaredleSolverClient from '$lib/components/squaredle/SquaredleSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  const pageTitle = 'Ai Squaredle Solver - Solve board in seconds';
  let pageDescription =
    'Use the Squaredle solver to load today’s board, paste any custom grid, and find every valid word path with the same client-side solving logic as the original project.';
  const pageUrl = 'https://wordsolverx.com/squaredle-solver';
  pageDescription =
    'Use the Squaredle solver to load today\u2019s board or paste a custom grid and find every valid word path.';


  const schemas = JSON.stringify([
    generateHowToSchema('How to use the Squaredle solver', [
      { name: 'Enter or paste a board', text: 'Type one letter per cell or paste the whole board from a screenshot or copied grid.' },
      { name: 'Load today’s official puzzle if needed', text: 'Use Load today to pull in the current official Squaredle board and word list.' },
      { name: 'Solve and inspect paths', text: 'Run the solver, then hover the found words to see the exact path on the grid.' }
    ]),
    {
      ...generateSoftwareApplicationSchema('Squaredle Solver', 'GameApplication'),
      keywords: ['squaredle solver', 'squaredle helper', 'squaredle today solver']
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Squaredle Solver', url: pageUrl }
    ]),
    generateWebPageSchema('Squaredle Solver', pageDescription, pageUrl)
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta name="keywords" content="squaredle solver, squaredle helper, squaredle board solver, squaredle today solver" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/squaredle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-white">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <!-- Hero banner section -->
  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-12">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-4">
        Word Puzzle Solver
      </p>
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Squaredle Solver</h1>
      <p class="text-lg text-white/80 max-w-2xl leading-relaxed">
        Find every valid word path on any Squaredle board. Load today's official puzzle or paste a custom grid — the solver runs entirely in your browser.
      </p>
    </div>
  </section>

  <SquaredleSolverClient />

  

    <div class="mt-12">
      <div class="mt-12">
  <StaticArticle content={ARTICLE_CONTENT['squaredle-solver']} />
</div>

<AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
