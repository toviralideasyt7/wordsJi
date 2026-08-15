<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import SquaredleSolverClient from '$lib/components/squaredle/SquaredleSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
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

  const faqs = [
    {
      question: 'Does the Squaredle solver use the compressed dictionary from the original project?',
      answer:
        'Yes. The solver loads the same compressed words_alpha dictionary and solves the board in the browser once that dictionary is ready.'
    },
    {
      question: 'Can I load today\'s official Squaredle puzzle?',
      answer:
        'Yes. The page includes the same today-puzzle scraping flow as the source project, then solves the official board locally after loading it.'
    },
    {
      question: 'What does Solve Official do?',
      answer:
        'Solve Official narrows the results to the known valid and bonus words for today\'s official Squaredle board, so you can compare against the real puzzle list.'
    },
    {
      question: 'How is Squaredle different from Boggle?',
      answer:
        'Squaredle has a daily board format, word categories (common and bonus), and a star system. Boggle uses random boards, a timer, and no word categories. The letter adjacency rules are similar, but the gameplay feels different because Squaredle is about completeness — finding every word — rather than speed.'
    },
    {
      question: 'What counts as a valid word in Squaredle?',
      answer:
        'Words must be at least 4 letters long (the minimum length varies by board). Each letter can only be used once per word. The path can go in any of the 8 directions (including diagonals) but cannot revisit a cell.'
    },
    {
      question: 'How many words does a typical Squaredle board contain?',
      answer:
        'A standard 4x4 board usually has 40-80 valid words. Larger boards can have over 100. The "Load today" feature shows you exactly how many common and bonus words exist for the daily puzzle.'
    }
  ];

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
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
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
