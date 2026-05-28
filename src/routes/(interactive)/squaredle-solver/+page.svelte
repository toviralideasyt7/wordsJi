<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
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

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Squaredle?</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Squaredle is a daily word search puzzle. You get a grid of letters — usually 4x4 or larger — and your job is to find every valid word by connecting adjacent letters. Adjacent means any of the eight neighbors: horizontal, vertical, or diagonal.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        New boards appear daily. Unlike Boggle, which is about speed (find as many words as you can in three minutes), Squaredle is about completeness. The board stays the same all day, and your goal is to find every single word — both the common words and the harder bonus words.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The game tracks your progress with a star system. Find all common words to earn one star. Find all bonus words for another. A perfect board means every word on the list, no gaps.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Common Words vs Bonus Words</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Every Squaredle board divides its words into two categories. Common words are the ones most players will find — they use familiar vocabulary and straightforward paths. Bonus words are the obscure ones: unusual terms, longer paths, or words that snake through awkward corners of the board.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        A typical board might have 30 common words and 15 bonus words. The common words account for about 70% of what's on the board. The bonus words are where most players get stuck.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The solver shows you both categories. Click "Solve Official" after loading today's board, and it separates the results so you can see exactly which words you missed — and which category they belong to.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Squaredle Solver Works</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        The solver loads a compressed dictionary (words_alpha) into the browser, then runs a depth-first search from every cell on the board. Each path checks the dictionary as it grows, so dead ends get pruned immediately instead of wasting time on impossible letter sequences.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Once the solver finishes, every valid word appears with its path highlighted. Hover over any word in the results and the corresponding cells light up on the grid. This makes it easy to see exactly how each word traces through the board.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The entire computation runs client-side. No data leaves your browser. The dictionary loads once and stays cached, so subsequent solves are nearly instant.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Finding Words You Keep Missing</h2>
      <div class="space-y-5">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">1</span>
          <div>
            <h3 class="font-bold text-slate-900">Start from corners and edges</h3>
            <p class="text-slate-600 mt-1 text-sm">Corner cells only have 3 neighbors. Words that start in a corner have fewer paths to check, which makes them easier to overlook. Start your manual scan from the corners.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">2</span>
          <div>
            <h3 class="font-bold text-slate-900">Try all eight directions from each cell</h3>
            <p class="text-slate-600 mt-1 text-sm">Most people scan left-to-right and top-to-bottom. Words going up-right, down-left, or other diagonal directions get missed because your eyes don't naturally track those paths.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center">3</span>
          <div>
            <h3 class="font-bold text-slate-900">Look for common prefixes and suffixes</h3>
            <p class="text-slate-600 mt-1 text-sm">RE-, UN-, IN-, OUT-, -ING, -ED, -TION, -NESS — if you see an S, check if it can pluralize any word you already found. The same goes for verb forms.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">4</span>
          <div>
            <h3 class="font-bold text-slate-900">Use the solver as a learning tool</h3>
            <p class="text-slate-600 mt-1 text-sm">Solve the board yourself first, then run the solver. Compare the lists. You'll start seeing patterns in what you miss — usually diagonal paths and less common words.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Path Direction Matters</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        In Squaredle, a valid word path can travel in any of eight directions from each cell. That means each cell (except edges) has up to 8 possible next steps. A 4-letter word that starts in the center of a 4x4 board has hundreds of potential paths.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        The one rule you can't break: you can't revisit a cell. If your path goes A→B→C, you can't go back to A. This is the same constraint as Boggle, and it's what makes the puzzle interesting. Without this rule, you could just loop around the board forever.
      </p>
      <p class="text-slate-600 leading-relaxed">
        When you hover over a found word in the solver results, the highlighted path shows you the exact sequence of cells. Pay attention to the diagonal segments — those are the ones your eyes skip past when scanning manually.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">The Squaredle Star System Explained</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Squaredle awards stars based on how much of the board you've completed. Finding all common words earns the first star. Finding all bonus words earns the second. Some boards have additional milestone stars for partial completion.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        The star system is what makes Squaredle different from a one-and-done game. You can return to the same board throughout the day and chip away at it. Find 20 words on your commute. Find 10 more at lunch. Use the solver to find the last few stubborn ones before bed.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The daily board resets at midnight. If you haven't found every word by then, that board is gone. The solver helps you close the gap — especially on those bonus words that sit untouched for hours.
      </p>
    </section>

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" {faqs} title="Squaredle Solver FAQs" />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/boggle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Boggle Solver</a>
        <a href="/hangman-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Hangman Solver</a>
        <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Wordle Solver</a>
        <a href="/waffle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Waffle Solver</a>
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
