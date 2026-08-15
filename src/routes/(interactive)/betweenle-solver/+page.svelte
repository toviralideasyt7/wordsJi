<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import BetweenleSolverClient from '$lib/components/betweenle/BetweenleSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema,
  } from '$lib/seo';

  const pageTitle = 'Ai Betweenle Solver - Solve Betweenle within seconds';
  const pageDescription =
    'Use our Betweenle solver to enter bounds and distance clues, then get the best next guess with real dictionary logic.';
  const pageUrl = 'https://wordsolverx.com/betweenle-solver';

  const faqs = [
    {
      question: 'How do I use the Betweenle solver?',
      answer:
        'Enter the current top and bottom bound words from your Betweenle game, add the distance percentages shown by the puzzle, then click Solve. The Betweenle solver calculates the strongest next guess from the remaining alphabetical range.',
    },
    {
      question: 'Does the Betweenle solver use the same game logic?',
      answer:
        'Yes. This Betweenle solver uses the same word ordering and bound logic, then combines it with the percentage clues to estimate the best next word.',
    },
    {
      question: 'Can I use the Betweenle solver with only one bound?',
      answer:
        'Yes. If you only know the top word or the bottom word, leave the other side blank. The solver still narrows the range and gives you a smart next guess.',
    },
    {
      question: 'Is this Betweenle solver mobile friendly?',
      answer:
        'Yes. The solver works on phones, tablets, and desktop browsers, and you can copy suggested words directly from the page.',
    },
    {
      question: 'How many guesses does Betweenle allow?',
      answer:
        'The daily Betweenle puzzle gives you unlimited guesses, but most players aim to solve it in 5-7. The game tracks your guess count and shows it in your result summary.',
    },
    {
      question: 'What happens when the solver shows remaining candidates directly?',
      answer:
        'When fewer than 50 words remain in your range, the solver switches to listing those words instead of picking a midpoint. At that point you can just try each candidate directly.',
    },
  ];

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
    generateHowToSchema('How to use the Betweenle solver', [
      {
        name: 'Enter your current bounds',
        text: 'Add the top and bottom words currently shown in your Betweenle game.',
      },
      {
        name: 'Add distance percentages',
        text: 'Type the percentages shown next to those bounds so the solver can estimate the next best area.',
      },
      {
        name: 'Copy the suggested word',
        text: 'Click Solve, copy the recommended guess, and repeat until the Betweenle answer is found.',
      },
    ]),
    {
      ...generateSoftwareApplicationSchema('Betweenle Solver', 'GameApplication'),
      keywords: ['betweenle solver', 'betweenle helper', 'betweenle answer solver'],
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Betweenle Solver', url: pageUrl },
    ]),
    generateWebPageSchema('Betweenle Solver', pageDescription, pageUrl),
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="betweenle solver, betweenle helper, betweenle answer solver, betweenle word finder, betweenle clue solver"
  />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/og/betweenle-solver.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://wordsolverx.com/og/betweenle-solver.svg" />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700 px-6 py-8 shadow-2xl">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Word Game</p>
      <h1 class="mt-4 text-4xl font-black text-white">Betweenle Solver</h1>
      <p class="mt-4 max-w-3xl text-lg text-white/80">
        Enter your top and bottom bounds, add distance percentages, and get the best next word to guess. Uses the same word ordering and bound logic as the real game.
      </p>
    </div>
  </section>

  <section class="mx-auto mt-2 max-w-5xl px-4 sm:px-6 lg:px-8">
    <BetweenleSolverClient />
  </section>

  

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
