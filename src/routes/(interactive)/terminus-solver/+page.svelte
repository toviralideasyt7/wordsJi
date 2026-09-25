<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import TerminusSolverClient from '$lib/components/terminus/TerminusSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  let { data } = $props();

  const pageTitle = 'Terminus Code Solver - BO6 Zombies Easter Egg Calculator';
  const pageDescription =
    'Enter the X, Y and Z symbols from the Terminus Research Office whiteboard and get your three terminal codes instantly. Free BO6 Zombies easter egg calculator.';
  const pageUrl = 'https://wordsolverx.com/terminus-solver';

  const schemas = JSON.stringify([
    generateHowToSchema('How to use the Terminus code solver', [
      { name: 'Find the symbols', text: 'Go to the Research Office on the Terminus map and read the three symbols labeled X, Y and Z off the whiteboard.' },
      { name: 'Match them on this page', text: 'Click the matching symbol for X, Y and Z in the selector grids above.' },
      { name: 'Enter the codes', text: 'Copy the combined code and type the three numbers into the Research Office computer terminal, in order.' }
    ]),
    {
      ...generateSoftwareApplicationSchema('Terminus Code Solver', 'GameApplication'),
      keywords: ['terminus code calculator', 'bo6 zombies terminus code solver', 'terminus easter egg code', 'black ops 6 zombies code calculator']
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Terminus Code Solver', url: pageUrl }
    ]),
    generateWebPageSchema('Terminus Code Solver', pageDescription, pageUrl)
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="terminus code calculator, bo6 zombies terminus code solver, terminus easter egg code, black ops 6 zombies code calculator, terminus solver"
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
    <div class="rounded-[2rem] border border-red-100 bg-gradient-to-br from-red-50 via-white to-amber-50 px-6 py-8 sm:px-10 sm:py-10 shadow-2xl">
      <p class="inline-flex rounded-full bg-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
        Puzzle Solver
      </p>
      <h1 class="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">Terminus Code Solver</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600 leading-relaxed">
        Match the X, Y and Z symbols from the Terminus Research Office whiteboard and get the three terminal codes instantly. Free, and saves you 5,000 Essence.
      </p>
    </div>
  </section>

  <TerminusSolverClient />

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
