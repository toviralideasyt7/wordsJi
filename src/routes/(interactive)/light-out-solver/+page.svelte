<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import LightsOutSolverClient from '$lib/components/lightsout/LightsOutSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema
  } from '$lib/seo';

  const pageTitle = 'Light Out Solver - Get detailed solutions';
  const pageDescription =
    'Use this Lights Out solver online to build any 2x2 to 5x5 puzzle and generate the exact optimal solve path.';
  const pageUrl = 'https://wordsolverx.com/light-out-solver';

  const faqs = [
    {
      question: 'How does this Light Out solver work?',
      answer:
        'The solver uses Gaussian elimination over GF(2) — modular arithmetic where 1+1=0 — to find the optimal move sequence. This is the same algorithm that proves every 5x5 board is solvable.'
    },
    {
      question: 'What is the difference between Linked Toggle and Edit Puzzle?',
      answer:
        'Linked Toggle behaves like the real game: clicking a light flips it plus its neighbors. Edit Puzzle lets you set up any custom board one light at a time without the neighbor effect.'
    },
    {
      question: 'Can I solve random puzzles and manual board setups?',
      answer:
        'Yes. Generate random boards, recreate a puzzle you already have, then solve it and review every step as a mini-board sequence.'
    },
    {
      question: 'Are all Lights Out boards solvable?',
      answer:
        'Every 5x5 Lights Out board is solvable — this is mathematically proven. Smaller boards (2x2, 3x3, 4x4) are also always solvable with the standard toggle pattern (self plus 4 neighbors).'
    },
    {
      question: 'What is the chase-the-lights method?',
      answer:
        'It is a manual technique where you solve the top row first, then use the second row to fix the first, the third row to fix the second, and so on. It works for most boards but does not guarantee the fewest moves.'
    },
    {
      question: 'Can I use the solver on my phone?',
      answer:
        'Yes. The board and step cards are fully responsive. Tap cells to toggle lights, then tap Solve to get the optimal path.'
    }
  ];

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
    generateHowToSchema('How to use the Light Out solver', [
      { name: 'Choose a board size', text: 'Pick a size from 2 by 2 up to 5 by 5.' },
      { name: 'Build or randomize the board', text: 'Use linked play or edit mode to create the puzzle state you want to solve.' },
      { name: 'Run the solver', text: 'Click Solve board to get the exact optimal move sequence and follow the step cards.' }
    ]),
    {
      ...generateSoftwareApplicationSchema('Light Out Solver', 'GameApplication'),
      keywords: ['light out solver', 'lights out solver', 'lights out puzzle solver']
    },
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Light Out Solver', url: pageUrl }
    ]),
    generateWebPageSchema('Light Out Solver', pageDescription, pageUrl)
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="light out solver, lights out solver, lights out puzzle, online lights out solver, optimal lights out solution"
  />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <link rel="canonical" href={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/light-out-solver.webp" />
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
    <div class="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50 px-6 py-8 sm:px-10 sm:py-10 shadow-2xl">
      <p class="inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
        Puzzle Solver
      </p>
      <h1 class="mt-4 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">Light Out Solver</h1>
      <p class="mt-3 max-w-2xl text-lg text-slate-600 leading-relaxed">
        Build any 2×2 to 5×5 Lights Out board, toggle cells, and get the exact optimal move sequence using Gaussian elimination over GF(2).
      </p>
    </div>
  </section>

  <LightsOutSolverClient />

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Lights Out?</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Lights Out is an electronic puzzle game that Tiger Electronics released in 1995. Avi Olti invented it. The concept is simple: a 5x5 grid of lights, some on and some off. Press one light and it toggles — along with its four neighbors (up, down, left, right). The goal is to turn every light off.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        That single rule — press one light, toggle five — creates surprisingly deep puzzles. A move in the corner only affects three cells. A move in the center affects five. Every move ripples outward, and undoing a mistake isn't straightforward because the "undo" (pressing the same cell again) toggles the same five cells back, but also flips any cells you've fixed since.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The original handheld game sold over 10 million units. It spawned sequels, knockoffs, and decades of math papers analyzing why the puzzle always has a solution.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Every 5x5 Puzzle Has a Solution</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Here's the mathematical fact: every possible 5x5 Lights Out board is solvable. Not most. All of them. This was proven using linear algebra over GF(2) — a number system where the only values are 0 and 1, and 1+1=0.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Each cell can be either on (1) or off (0). Each move is just addition modulo 2. The entire board state is a system of 25 linear equations with 25 unknowns. Because the coefficient matrix for the 5x5 case has full rank — all 25 rows are linearly independent — the system always has a unique solution.
      </p>
      <p class="text-slate-600 leading-relaxed">
        This doesn't mean the solution is obvious. A random 5x5 board typically requires 8-15 moves, and finding them by hand is genuinely hard. But the solution is always there. The math guarantees it.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Solver Finds the Shortest Path</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        The solver converts your board into a system of equations over GF(2) and applies Gaussian elimination. This is the same algorithm used in linear algebra courses, but with every operation done modulo 2.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        The result is a set of cells that, when pressed in any order, will turn all lights off. The solver presents these as step-by-step mini-boards so you can follow along one move at a time. Each step shows the board before and after that press.
      </p>
      <p class="text-slate-600 leading-relaxed">
        Because Gaussian elimination produces the minimal solution, the move count you see is optimal — no shorter solution exists for that board.
      </p>
    </section>

    <section class="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">The Chase-the-Lights Method You Can Use by Hand</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        You don't need a solver if you know the chase-the-lights technique. It works like this:
      </p>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-4">
        <li class="leading-relaxed">Look at the top row. Any light that's on, press the cell directly below it.</li>
        <li class="leading-relaxed">Now the top row is all off. Look at the second row. Any light on, press below it.</li>
        <li class="leading-relaxed">Repeat for each row, working top to bottom.</li>
        <li class="leading-relaxed">By the time you reach the bottom row, the entire board above it is solved. If the bottom row happens to be all off, you're done.</li>
      </ol>
      <p class="text-slate-600 leading-relaxed">
        The catch: this method doesn't guarantee the fewest moves. A chase-the-lights solution might take 20 presses when the optimal solution takes 8. For casual play it's fine. For the shortest path, use the solver.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Which Board Sizes Are Hardest?</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        2x2 is trivial — at most 4 cells, at most 4 moves. You can brute-force it in your head. 3x3 is solvable in a few seconds of trial and error.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        4x4 starts to get interesting. There are 65,536 possible board states (2^16). The chase-the-lights method still works, but the solution paths get longer and harder to find manually.
      </p>
      <p class="text-slate-600 leading-relaxed">
        5x5 is the sweet spot. 33 million possible states (2^25), solutions typically 8-15 moves, and the math is beautiful — it's the size where Gaussian elimination becomes genuinely necessary. This is the original game size and it's where this solver earns its keep.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Pressing Randomly Never Works</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Here's a common scenario: you press a few cells, the board looks better, then worse, then you press some more and end up further from solved than when you started. What happened?
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Every press toggles five cells (or three at edges, four at corners). That means each move changes almost 20% of the board. Two moves in the same row interact — the second move partially undoes the first. Three moves in a cluster create interference patterns that are nearly impossible to reason about mentally.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The solver avoids this entirely. It doesn't press cells one at a time and hope for the best. It computes the exact set of presses needed, all at once, using linear algebra. No guessing. No undoing.
      </p>
    </section>

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" {faqs} title="Light Out Solver FAQs" />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/kanoodle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Kanoodle Solver</a>
        <a href="/minesweeper-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Minesweeper Solver</a>
        <a href="/boggle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Boggle Solver</a>
        <a href="/nerdle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Nerdle Solver</a>
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
