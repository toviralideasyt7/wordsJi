<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema,
  } from '$lib/seo';
  import WorldleSolverClient from '$lib/components/worldle/WorldleSolverClient.svelte';


  const pageTitle = 'Worldle Solver - Solve Worldle With Distance And Direction Clues | WordSolverX';
  const pageDescription =
    'Use the WordSolverX Worldle Solver to filter countries by distance, direction, and proximity clues. This Worldle helper runs instantly in your browser.';
  const pageUrl = 'https://wordsolverx.com/worldle-solver';

  const schemas = JSON.stringify([
    generateHowToSchema('How to use the Worldle solver', [
      {
        name: 'Choose a guessed country',
        text: 'Search for the country you guessed in the Worldle game and select it from the suggestion list.',
      },
      {
        name: 'Enter the clue values',
        text: 'Add the distance in kilometers, choose the direction arrow, and optionally include the proximity percentage.',
      },
      {
        name: 'Review ranked matches',
        text: 'Add more clues as needed until the ranked candidate list narrows to the most likely country.',
      },
    ]),
    generateSoftwareApplicationSchema('Worldle Solver', 'UtilitiesApplication'),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Worldle Solver', url: pageUrl },
    ]),
    generateWebPageSchema('Worldle Solver', pageDescription, pageUrl),
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="worldle solver, worldle helper, worldle clue solver, worldle country solver, worldle distance solver, worldle direction solver"
  />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/worldle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://wordsolverx.com/images/worldle-solver.webp" />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-8 shadow-2xl">
      <div class="max-w-4xl">
        <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Geography Game</p>
        <h1 class="mt-4 text-4xl font-black text-white">Worldle Solver</h1>
        <p class="mt-4 max-w-3xl text-lg text-white/80">
          Solve the geography puzzle by entering the same clues Worldle gives you: guessed country, distance, and direction. The tool filters the candidate list live in your browser.
        </p>
      </div>
    </div>
  </section>

  <div class="mx-auto max-w-5xl px-4 pb-4 sm:px-6 lg:px-8">
    <WorldleSolverClient />
  </div>

  

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
