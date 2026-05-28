<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import KanoodleGame from '$lib/components/kanoodle/KanoodleGame.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema,
  } from '$lib/seo';

  const faqs = [
    {
      question: 'What is the Kanoodle solver and how do you use it?',
      answer:
        'The Kanoodle solver is an online tool and playable board that helps you solve the 12-piece Kanoodle puzzle. Drag or click a piece, rotate or flip it, then place it on the 5 by 11 board until every cell is filled.',
    },
    {
      question: 'Does this noodle solver find real Kanoodle solutions?',
      answer:
        'Yes. This noodle solver uses the copied Kanoodle solver logic from the original implementation to test solvability, reveal hints, solve the board, and count multiple valid solutions.',
    },
    {
      question: 'Can I generate easier or harder Kanoodle puzzles?',
      answer:
        'Yes. Use the New Puzzle controls to start a board with 1 to 6 pieces already placed. Fewer pre-placed pieces means a harder puzzle.',
    },
    {
      question: 'Does this Kanoodle solver work on mobile?',
      answer:
        'Yes. The layout is responsive and supports tap-to-select plus tap-to-place if dragging is less convenient on your device.',
    },
    {
      question: 'How does the backtracking solver work?',
      answer:
        'The solver places one piece at a time, checks whether the remaining empty cells are still reachable, and backtracks immediately if a dead end is detected. This connectivity check is what makes it fast — it stops exploring paths that can never lead to a full board.',
    },
    {
      question: 'What is the difference between Hint, Solve, and Count Solutions?',
      answer:
        'Hint places one more piece and stops, letting you continue manually. Solve fills the entire board in one action. Count Solutions finds every valid completion — useful when you want to know whether your current layout has one answer or many.',
    },
    {
      question: 'Does this solver work for Kanoodle Genius or Kanoodle Extreme?',
      answer:
        'The solver handles the original Kanoodle 5x11 flat board. Kanoodle Genius adds a 3D pyramid mode which is not supported. Kanoodle Extreme adds a sliding puzzle element that this solver does not handle.',
    },
  ];

  const pageTitle = 'Kanoodle Solver — Solve Any Kanoodle Puzzle Online';
  const pageDescription =
    'Use the Kanoodle solver online to fit all 12 pieces on the board with hints, challenge mode, and fast in-browser solving.';
  const pageUrl = 'https://wordsolverx.com/kanoodle-solver';

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
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

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Kanoodle?</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Kanoodle is a spatial puzzle game made by Educational Insights. You get 12 uniquely shaped pieces (they call them "noodles") and a 5x11 grid. The goal: fit every piece onto the board with no overlaps and no gaps.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Each piece is a connected cluster of 1-5 cells. Some pieces are L-shaped, some are T-shaped, some zigzag. They can be rotated and flipped, which means each piece has up to 8 orientations. That's 96 possible piece-position combinations before you even start counting board placements.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The physical game ships with a booklet of puzzles — some with pieces pre-placed, some completely empty. The fewer pieces pre-placed, the harder the puzzle. An empty board has millions of possible solutions. Finding even one by hand is a genuine challenge.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why the L-Piece and T-Piece Cause 80% of Failures</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Two pieces cause most of the trouble: the 4-cell L-shape and the 4-cell T-shape. Both are too large to fit in corners easily, but too small to anchor a row on their own. Players tend to place the easy pieces first (straight lines, 2-cell pieces) and leave these two for last.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        That's backwards. Place the awkward pieces first when you have the most freedom. Once the board fills up, there are fewer valid orientations for L and T shapes, and you end up with gaps that nothing can fill.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The solver doesn't have this problem. It tries every orientation of every piece systematically, backtracking when a placement leads to a dead end. The order doesn't matter to the algorithm — it tries them all.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Kanoodle Solver Works</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        The solver uses backtracking search. It places a piece, checks whether the remaining empty cells can still be filled, and either continues or backtracks. The key optimization: it checks connectivity — if the empty cells split into disconnected regions that are too small for any remaining piece, it stops immediately instead of continuing down a dead path.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Four solver actions are available. "Check" tells you whether the current board is solvable. "Hint" places one more piece. "Solve" fills the entire board. "Count Solutions" enumerates all valid completions — useful for puzzles where you want to know if you've found the only solution or just one of many.
      </p>
      <p class="text-slate-600 leading-relaxed">
        All computation runs in your browser. No server calls. The solver handles the full 12-piece board in under a second on most devices.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Getting Better at Kanoodle</h2>
      <div class="space-y-5">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">1</span>
          <div>
            <h3 class="font-bold text-slate-900">Place big pieces first</h3>
            <p class="text-slate-600 mt-1 text-sm">The 4- and 5-cell pieces have fewer valid positions. Place them while the board is mostly empty. Save the 1- and 2-cell pieces for last — they fit almost anywhere.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center">2</span>
          <div>
            <h3 class="font-bold text-slate-900">Fill corners early</h3>
            <p class="text-slate-600 mt-1 text-sm">Corners have only one cell. Pieces that can fill a corner and extend along an edge are prime candidates for early placement. Once the corners are locked, the rest flows more easily.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-fuchsia-100 text-fuchsia-700 font-bold flex items-center justify-center">3</span>
          <div>
            <h3 class="font-bold text-slate-900">Use Check before you commit</h3>
            <p class="text-slate-600 mt-1 text-sm">After placing 3-4 pieces, hit Check. If the board is unsolvable, undo the last piece instead of wasting time on a dead path. This single habit cuts your solve time dramatically.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Kanoodle vs Kanoodle Genius vs Kanoodle Extreme</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-xl bg-slate-50 p-5">
          <h3 class="font-bold text-slate-900 mb-2">Kanoodle</h3>
          <p class="text-sm text-slate-600">Original game. 12 pieces, 5x11 board, 2D only. The version this solver handles. Good for ages 7 and up.</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h3 class="font-bold text-slate-900 mb-2">Kanoodle Genius</h3>
          <p class="text-sm text-slate-600">Same pieces, but adds a 3D pyramid building mode on top of the flat board. The 2D puzzles are harder than the original.</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-5">
          <h3 class="font-bold text-slate-900 mb-2">Kanoodle Extreme</h3>
          <p class="text-sm text-slate-600">Adds a sliding puzzle element. The board has a sliding piece that changes the available space. This solver doesn't handle that variant yet.</p>
        </div>
      </div>
    </section>

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" {faqs} title="Kanoodle Solver FAQs" />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/light-out-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Light Out Solver</a>
        <a href="/minesweeper-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Minesweeper Solver</a>
        <a href="/boggle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Boggle Solver</a>
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
