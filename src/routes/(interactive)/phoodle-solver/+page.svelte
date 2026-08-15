<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PhoodleSolverClient from '$lib/components/phoodle/PhoodleSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  const pageTitle = 'Phoodle Solver - Solver within 3 attempts';
  const pageDescription =
    'Use the Phoodle solver to enter your guesses, match the feedback colors, and get the best next food-word suggestions with the original WASM solver logic.';
  const pageUrl = 'https://wordsolverx.com/phoodle-solver';

  const faqs = [
    {
      question: 'Does this Phoodle solver use the original WASM logic?',
      answer:
        'Yes. This page uses the same standalone WASM solver bundle from the original Phoodle solver project, so the starter and suggestion logic stays the same.'
    },
    {
      question: 'How do I enter my Phoodle feedback?',
      answer:
        'Add the guess you used in the game, then tap each letter tile until it matches the color you saw in Phoodle: absent, present, or correct.'
    },
    {
      question: 'Can I click a suggestion to reuse it?',
      answer:
        'Yes. Tapping a suggested word or a possible answer loads it into the guess input so you can add it quickly as your next try.'
    },
    {
      question: 'What makes Phoodle different from Wordle?',
      answer:
        'Phoodle only uses food-related words — ingredients, dishes, cooking terms, and kitchen items. The green-yellow-gray feedback system is the same, but the restricted word list means standard Wordle strategies like starting with CRANE or SLATE are less effective.'
    },
    {
      question: 'How many guesses do I get in Phoodle?',
      answer:
        'You get 6 guesses, same as Wordle. The solver typically finds the answer within 3 attempts when you enter feedback accurately, which leaves plenty of room for error.'
    },
    {
      question: 'Does the Phoodle solver work on mobile?',
      answer:
        'Yes. The solver runs entirely in the browser with WASM, so it works on any device without installing anything. Just open the page, enter your guesses, and get suggestions.'
    },
    {
      question: 'What time does Phoodle reset?',
      answer:
        'Phoodle resets at midnight local time. A new food word appears every day, and the solver updates its suggestions based on whatever puzzle is current.'
    }
  ];

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
    generateHowToSchema('How to use the Phoodle solver', [
      { name: 'Add your guess', text: 'Enter the 5-letter word you tried in Phoodle.' },
      { name: 'Match the feedback', text: 'Tap each tile until it matches the result from the game.' },
      { name: 'Use the next suggestion', text: 'Read the best next guesses and possible answers, then try the best fit in Phoodle.' }
    ]),
    {
      ...generateSoftwareApplicationSchema('Phoodle Solver', 'GameApplication'),
      keywords: ['phoodle solver', 'phoodle helper', 'food word solver']
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Phoodle Solver', url: pageUrl }
    ]),
    generateWebPageSchema('Phoodle Solver', pageDescription, pageUrl)
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta name="keywords" content="phoodle solver, phoodle helper, phoodle answer finder, food word solver" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/phoodle-solver.webp" />
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
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-12">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-4">
        Wordle Variant Solver
      </p>
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Phoodle Solver</h1>
      <p class="text-lg text-white/80 max-w-2xl leading-relaxed">
        Enter your guesses, match the feedback colors, and get the best food-word suggestions. Solves in 3 attempts using the original WASM logic.
      </p>
    </div>
  </section>

  <PhoodleSolverClient />

  

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
