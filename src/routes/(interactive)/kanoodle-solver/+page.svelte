<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import KanoodleGame from '$lib/components/kanoodle/KanoodleGame.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema,
  } from '$lib/seo';


  const pageTitle = 'Kanoodle Solver — Solve Any Kanoodle Puzzle Online';
  const pageDescription =
    'Use the Kanoodle solver online to fit all 12 pieces on the board with hints, challenge mode, and fast in-browser solving.';
  const pageUrl = 'https://wordsolverx.com/kanoodle-solver';

  const schemas = JSON.stringify([
    generateHowToSchema('How to solve Kanoodle online', [
      {
        name: 'Select a piece',
        text: 'Choose one of the remaining Kanoodle pieces, then rotate or flip it if needed.',
      },
      {
        name: 'Place it on the board',
        text: 'Drag the piece onto the board or tap a board cell after selecting the piece.',
      },
      {
        name: 'Use solver tools',
        text: 'Check the board, ask for a hint, quick solve it, or count all possible solutions whenever you need help.',
      },
    ]),
    {
      ...generateSoftwareApplicationSchema('Kanoodle Solver', 'GameApplication'),
      alternateName: ['Noodle Solver', 'Kanoodle Puzzle Solver'],
      keywords: ['kanoodle solver', 'noodle solver', 'kanoodle puzzle solver'],
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Kanoodle Solver', url: pageUrl },
    ]),
    {
      ...generateWebPageSchema('Kanoodle Solver', pageDescription, pageUrl),
      about: ['kanoodle solver', 'noodle solver', 'spatial puzzle solver'],
    },
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="kanoodle solver, noodle solver, kanoodle online, kanoodle puzzle game, kanoodle hints, kanoodle solution finder, kanoodle puzzle solver, shape puzzle solver, spatial puzzle"
  />
  <meta name="news_keywords" content="kanoodle solver, noodle solver, kanoodle puzzle solver" />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/kanoodle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://wordsolverx.com/images/kanoodle-solver.webp" />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-white">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] bg-gradient-to-br from-teal-600 via-sky-600 to-fuchsia-700 px-6 py-8 text-white shadow-2xl shadow-teal-500/20 sm:px-8 sm:py-10">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-50">
        Online puzzle tool
      </p>
      <h1 class="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Kanoodle Solver</h1>
      <p class="mt-4 max-w-3xl text-base leading-8 text-teal-50/90 sm:text-lg">
        This Kanoodle solver is built for players who want a fast way to test placements, get hints, and solve the full 12-piece board online. If you searched for a noodle solver, this page gives you the same practical tool experience with a playable board and instant solver actions.
      </p>
    </div>
  </section>

  <KanoodleGame />

  

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
