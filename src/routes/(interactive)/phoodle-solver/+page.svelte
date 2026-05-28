<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
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

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Phoodle?</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Phoodle is a daily word game launched in May 2022 by cookbook author Josh Laurito. It takes the Wordle format — 5 letters, 6 guesses, green-yellow-gray feedback — and restricts the answer list to food-related words only. Every daily answer is something connected to cooking, ingredients, dishes, or the kitchen.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        The game is free to play at phoodle.org and resets at midnight local time. Past answers include words like PASTA, BREAD, MANGO, OLIVE, STEAK, CREAM, LEMON, SALAD, FLOUR, and SUGAR. If you cook regularly, you already have a head start.
      </p>
      <p class="text-slate-600 leading-relaxed">
        After each guess, tiles turn green (correct letter, correct spot), yellow (wrong position), or gray (not in the word). Same mechanics as Wordle, but the food-only word list changes how you approach every guess.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How Phoodle Differs from Wordle</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        The biggest difference is the word list. Wordle pulls from roughly 2,300 possible answers across all English vocabulary. Phoodle uses a much smaller set — only food words. Every answer is an ingredient, cooking technique, dish name, kitchen tool, or something else tied to food culture.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Generic Wordle openers like CRANE and SLATE are wasteful here — CRANE is not a food word, so it can never be the answer. Once you know a few letters, you can narrow candidates fast because the food domain is constrained. If you see _OAST with a green O and A, you're looking at ROAST or TOAST.
      </p>
      <p class="text-slate-600 leading-relaxed">
        Vowels A, E, and O dominate. Common food letters include R, S, T, L, and N. Letters Q, X, Z, and J rarely show up. You can exploit this frequency skew to eliminate large chunks of the word list with each guess.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Best Opening Words for Phoodle</h2>
      <div class="space-y-5">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">1</span>
          <div>
            <h3 class="font-bold text-slate-900">STEAK — the strongest opener</h3>
            <p class="text-slate-600 mt-1 text-sm">Tests S, T, E, A, and K — four of the most common food-word letters. It's a valid Phoodle answer, so it could hit on guess one.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">2</span>
          <div>
            <h3 class="font-bold text-slate-900">SPICE — high-coverage alternative</h3>
            <p class="text-slate-600 mt-1 text-sm">Covers S, P, I, C, E. P and C appear in PASTA, CREAM, PEACH, CHILI, SCOOP, and CRISP — worth testing early.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">3</span>
          <div>
            <h3 class="font-bold text-slate-900">BREAD, OLIVE, MELON as backups</h3>
            <p class="text-slate-600 mt-1 text-sm">BREAD hits B, R, E, A, D. OLIVE tests O, L, I, V, E. MELON covers M, E, L, O, N. Rotate these if you like varied openers.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center">4</span>
          <div>
            <h3 class="font-bold text-slate-900">Avoid repeated-letter openers</h3>
            <p class="text-slate-600 mt-1 text-sm">ONION tests only 3 unique letters (O, N, I). You want 4–5 distinct letters per guess to maximize information from each attempt.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How the Phoodle Solver Works</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        This solver runs the same standalone WASM bundle from the original Phoodle solver project. No server round-trips — the entire word list and elimination logic live inside the WebAssembly module that loads in your browser.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Enter the word you guessed, tap each letter tile to set its color (gray = absent, yellow = present, green = correct), and the WASM module filters the word list against your feedback, scores every remaining candidate by information value, and returns ranked suggestions.
      </p>
      <p class="text-slate-600 leading-relaxed">
        Results come back in under 50ms. You can enter feedback from multiple guesses at once. Tap any suggestion to load it directly into the guess input — no typing required.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Common Phoodle Answer Categories</h2>
      <p class="text-slate-600 leading-relaxed mb-6">
        Phoodle answers cluster around specific categories. Knowing them helps you guess more efficiently — one strategic guess can rule out entire groups.
      </p>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-slate-50 rounded-2xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Ingredients and Staples</h3>
          <p class="text-slate-600 text-sm">FLOUR, SUGAR, HONEY, LEMON, OLIVE, BASIL, ONION, BUTTER, CREAM — the largest category by far.</p>
        </div>
        <div class="bg-slate-50 rounded-2xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Cooking Methods</h3>
          <p class="text-slate-600 text-sm">GRILL, ROAST, STEAM, BOIL, BLEND, SEAR, POACH. High-frequency letters make these good openers too.</p>
        </div>
        <div class="bg-slate-50 rounded-2xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Dishes and Prepared Foods</h3>
          <p class="text-slate-600 text-sm">PASTA, SALAD, PIZZA, STEW, CURRY, CREPE, BREAD. Satisfying to guess once a few letters lock in.</p>
        </div>
        <div class="bg-slate-50 rounded-2xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Kitchen Tools</h3>
          <p class="text-slate-600 text-sm">WHISK, SPOON, KNIFE, PLATE, GRATER, LADLE, TONGS. WHISK and GRATER test uncommon letters worth trying.</p>
        </div>
        <div class="bg-slate-50 rounded-2xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Fruits and Vegetables</h3>
          <p class="text-slate-600 text-sm">MANGO, PEACH, APPLE, GRAPE, MELON, GUAVA. Many share the -EACH and -ANGO patterns.</p>
        </div>
        <div class="bg-slate-50 rounded-2xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Food Descriptors</h3>
          <p class="text-slate-600 text-sm">SWEET, CRISP, FRESH, TANGY, CHUNK, CRUST, MOIST. Trickier because they describe food rather than name it.</p>
        </div>
      </div>
    </section>

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" {faqs} title="Phoodle Solver FAQs" />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Wordle Solver</a>
        <a href="/squaredle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Squaredle Solver</a>
        <a href="/waffle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Waffle Solver</a>
        <a href="/nerdle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Nerdle Solver</a>
        <a href="/hangman-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Hangman Solver</a>
      </div>
    </section>
  </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
