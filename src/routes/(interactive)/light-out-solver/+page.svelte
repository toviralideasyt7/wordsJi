<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import LightsOutSolverClient from '$lib/components/lightsout/LightsOutSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  const pageTitle = 'Lights Out Solver - Step-by-Step Puzzle Solution';
  const pageDescription =
    'Use this Lights Out solver online to build any 2x2 to 5x5 puzzle and generate the exact optimal solve path.';
  const pageUrl = 'https://wordsolverx.com/light-out-solver';


  const schemas = JSON.stringify([
    generateHowToSchema('How to use the Light Out solver', [
      { name: 'Choose a board size', text: 'Pick a size from 2 by 2 up to 5 by 5.' },
      { name: 'Build or randomize the board', text: 'Use linked play or edit mode to create the puzzle state you want to solve.' },
      { name: 'Run the solver', text: 'Click Solve board to get the exact optimal move sequence and follow the step cards.' }
    ]),
    {
      ...generateSoftwareApplicationSchema('Light Out Solver', 'GameApplication'),
      keywords: ['light out solver', 'lights out solver', 'lights out puzzle solver']
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Light Out Solver', url: pageUrl }
    ]),
    generateWebPageSchema('Light Out Solver', pageDescription, pageUrl)
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="light out solver, lights out solver, lights out puzzle, online lights out solver, optimal lights out solution"
  />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/light-out-solver.webp" />
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
      <h1 class="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">Lights Out Solver</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600 leading-relaxed">
        Build any 2×2 to 5×5 Lights Out board, toggle cells, and get the exact optimal move sequence using Gaussian elimination over GF(2).
      </p>
    </div>
  </section>

  <LightsOutSolverClient />

  

    <div class="mt-12">
      <StaticArticle content={ARTICLE_CONTENT['light-out-solver']} />

      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </section>
