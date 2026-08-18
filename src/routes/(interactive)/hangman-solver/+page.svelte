<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import HangmanSolverClient from '$lib/components/hangman/HangmanSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  const pageTitle = 'Hangman Solver - Free Online Word Finder & Hint Tool';
  const pageDescription =
    'Use this Hangman solver to enter your pattern and letters, then get ranked answers and the best next guess.';
  const pageUrl = 'https://wordsolverx.com/hangman-solver';


  const schemas = JSON.stringify([
    generateHowToSchema('How to use the Hangman solver', [
      { name: 'Enter the word pattern', text: 'Use letters for known positions and blank symbols for unknown spots.' },
      { name: 'Add wrong and included letters', text: 'Mark letters that are not in the word and letters that must appear somewhere.' },
      { name: 'Review ranked answers', text: 'Read the top word, best next letter, and the ranked candidate list returned by the worker.' }
    ]),
    {
      ...generateSoftwareApplicationSchema('Hangman Solver', 'GameApplication'),
      keywords: ['hangman solver', 'hangman helper', 'hangman word finder']
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Hangman Solver', url: pageUrl }
    ]),
    generateWebPageSchema('Hangman Solver', pageDescription, pageUrl)
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="hangman solver, hangman helper, hangman cheat, hangman word finder, hangman hints, hangman answer finder"
  />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/hangman-solver.webp" />
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
    <div class="rounded-[2rem] border border-red-100 bg-gradient-to-br from-teal-50 to-teal-100 px-6 py-8 sm:px-10 sm:py-10 shadow-2xl">
      <p class="inline-flex rounded-full bg-teal-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Word Puzzle Helper
      </p>
      <h1 class="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">Hangman Solver</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600 leading-relaxed">
        Enter the letter pattern, mark wrong guesses and known letters, and get entropy-ranked word suggestions and the best next letter to try.
      </p>
    </div>
  </section>

  <HangmanSolverClient />

  

  <div class="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
    </div>
  </div>

    <div class="mt-12">
      <StaticArticle content={ARTICLE_CONTENT['hangman-solver']} />

      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
