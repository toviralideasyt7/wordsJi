<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import LightsOutSolverClient from '$lib/components/lightsout/LightsOutSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  const pageTitle = 'Light Out Solver - Get detailed solutions';
  const pageDescription =
    'Use this Lights Out solver online to build any 2x2 to 5x5 puzzle and generate the exact optimal solve path.';
  const pageUrl = 'https://wordsolverx.com/light-out-solver';

  const faqs = [
    {
      question: 'How does this Light Out solver work?',
      answer:
        'The solver uses Gaussian elimination over GF(2) — modular arithmetic where 1+1=0 — to find the optimal move sequence. This is the same algorithm that proves every 5x5 board is solvable.'
    },
    {
      question: 'What is the difference between Linked Toggle and Edit Puzzle?',
      answer:
        'Linked Toggle behaves like the real game: clicking a light flips it plus its neighbors. Edit Puzzle lets you set up any custom board one light at a time without the neighbor effect.'
    },
    {
      question: 'Can I solve random puzzles and manual board setups?',
      answer:
        'Yes. Generate random boards, recreate a puzzle you already have, then solve it and review every step as a mini-board sequence.'
    },
    {
      question: 'Are all Lights Out boards solvable?',
      answer:
        'Every 5x5 Lights Out board is solvable — this is mathematically proven. Smaller boards (2x2, 3x3, 4x4) are also always solvable with the standard toggle pattern (self plus 4 neighbors).'
    },
    {
      question: 'What is the chase-the-lights method?',
      answer:
        'It is a manual technique where you solve the top row first, then use the second row to fix the first, the third row to fix the second, and so on. It works for most boards but does not guarantee the fewest moves.'
    },
    {
      question: 'Can I use the solver on my phone?',
      answer:
        'Yes. The board and step cards are fully responsive. Tap cells to toggle lights, then tap Solve to get the optimal path.'
    }
  ];

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
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

<main class="min-h-screen bg-white">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50 px-6 py-8 sm:px-10 sm:py-10 shadow-2xl">
      <p class="inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
        Puzzle Solver
      </p>
      <h1 class="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">Light Out Solver</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600 leading-relaxed">
        Build any 2×2 to 5×5 Lights Out board, toggle cells, and get the exact optimal move sequence using Gaussian elimination over GF(2).
      </p>
    </div>
  </section>

  <LightsOutSolverClient />

  

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
