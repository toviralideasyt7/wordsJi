<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import MinesweeperSolverClient from '$lib/components/minesweeper/MinesweeperSolverClient.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    generateWebApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema,
  } from '$lib/seo';

  const pageTitle = 'Minesweeper Solver - Free Online Safe Move Finder';
  const pageDescription =
    'Use this free Minesweeper solver to find safe moves, mark mines, and analyze custom boards with smart hints.';
  const pageUrl = 'https://wordsolverx.com/minesweeper-solver';

  const faqs = [
    {
      question: 'How do I use this Minesweeper solver?',
      answer:
        'Match the board size and mine count to your game, enter the revealed numbers and flagged mines, then click Find Next Move. The Minesweeper solver marks forced safe cells and forced mine cells directly on the board.',
    },
    {
      question: 'What do the green and red markers mean?',
      answer:
        'Green markers are safe squares the solver says can be clicked safely. Red markers are mine locations the solver can prove. If there is no forced move, the solver marks the safest candidates with a question mark.',
    },
    {
      question: 'Can this Minesweeper solver handle custom board sizes?',
      answer:
        'Yes. You can change the width, height, and total mine count before resetting the board. That makes the tool useful for beginner, intermediate, expert, and custom Minesweeper layouts.',
    },
    {
      question: 'Does this Minesweeper solver work on mobile?',
      answer:
        'Yes. The board editor and solver controls are responsive, so you can use the Minesweeper solver on desktop and mobile browsers without installing anything.',
    },
  ];

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
    generateHowToSchema('How to use the Minesweeper solver', [
      {
        name: 'Match your puzzle setup',
        text: 'Set the board width, height, and total mine count so the solver matches your real Minesweeper game.',
      },
      {
        name: 'Enter the visible board',
        text: 'Use the number and flag tools to fill in revealed clues and known mines on the board.',
      },
      {
        name: 'Analyze the next move',
        text: 'Click Find Next Move or Find All Moves to let the Minesweeper solver mark safe cells, mines, and the best fallback guesses.',
      },
    ]),
    {
      ...generateSoftwareApplicationSchema('Minesweeper Solver', 'GameApplication'),
      keywords: ['minesweeper solver', 'online minesweeper solver', 'minesweeper helper'],
    },
    generateWebApplicationSchema('Minesweeper Solver', pageDescription),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Minesweeper Solver', url: pageUrl },
    ]),
    generateWebPageSchema('Minesweeper Solver', pageDescription, pageUrl),
  ]);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta
    name="keywords"
    content="minesweeper solver, online minesweeper solver, minesweeper helper, minesweeper safe move finder, minesweeper probability solver, minesweeper board analyzer"
  />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={pageUrl} />
  <meta property="og:image" content="https://wordsolverx.com/images/minesweeper-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <link rel="canonical" href={pageUrl} />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-slate-950">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 px-6 py-8 text-white shadow-2xl shadow-indigo-500/10 sm:px-8 sm:py-10">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
        Puzzle solver tool
      </p>
      <h1 class="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Minesweeper Solver</h1>
      <p class="mt-4 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
        This Minesweeper solver helps you map your board, identify safe clicks, and flag forced mines without leaving the browser. Enter your current puzzle, run the analysis, and use the highlighted next moves to solve faster.
      </p>
    </div>
  </section>

  <MinesweeperSolverClient />

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
      <h2 class="text-3xl font-bold text-white mb-5">What is Minesweeper?</h2>
      <p class="text-slate-300 leading-relaxed mb-4">
        Minesweeper is a logic puzzle game that Microsoft bundled with Windows starting in 1990. Robert Donner created the original version in 1989. The concept: a grid of cells, some hiding mines. Click a cell and it reveals a number — that number tells you how many of its 8 neighbors contain mines. Click a mine and you lose. Flag all mines and reveal all safe cells to win.
      </p>
      <p class="text-slate-300 leading-relaxed mb-4">
        The game seems simple at first. A "1" with one unrevealed neighbor? That neighbor is a mine. A "3" with three flags around it? The remaining neighbors are safe. But as boards get larger and mine density increases, the logic chains get longer and harder to follow. Expert mode (30x16, 99 mines) is genuinely difficult even for experienced players.
      </p>
      <p class="text-slate-300 leading-relaxed">
        The game shipped on every Windows PC for over a decade. An entire generation learned to play it during computer class. It's one of the most-played video games in history by total hours.
      </p>
    </section>

    <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
      <h2 class="text-3xl font-bold text-white mb-5">Why You Keep Clicking Mines (It's Not Always Bad Luck)</h2>
      <p class="text-slate-300 leading-relaxed mb-4">
        About 30% of Expert-level Minesweeper boards require at least one guess. That's not a skill issue — it's a mathematical fact. When two unrevealed cells share the same constraints and neither can be logically eliminated, you have to pick one and hope.
      </p>
      <p class="text-slate-300 leading-relaxed mb-4">
        But most mine clicks aren't forced guesses. They're missed deductions. A "2" next to a "1" might look ambiguous, but if you account for the shared neighbor, one of those cells is forced. These patterns — 1-2, 1-1, and their variants — are the building blocks of Minesweeper logic.
      </p>
      <p class="text-slate-300 leading-relaxed">
        The solver catches every forced deduction. It doesn't miss the 1-2 pattern or the subset relationship. When it says there are no safe moves, you're genuinely in a guessing situation — and it highlights the cell with the lowest mine probability so your guess has the best odds.
      </p>
    </section>

    <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
      <h2 class="text-3xl font-bold text-white mb-5">How Our Minesweeper Solver Works</h2>
      <p class="text-slate-300 leading-relaxed mb-4">
        You enter your board state: the revealed numbers, any flagged mines, and the total mine count. The solver applies constraint-based logic to each number on the board. If a number's remaining mine count equals its remaining unrevealed neighbors, all those neighbors are mines. If a number already has enough flags, all other neighbors are safe.
      </p>
      <p class="text-slate-300 leading-relaxed mb-4">
        When simple constraints aren't enough, the solver checks subset relationships. If the unknowns around a "2" are a subset of the unknowns around a "3," the difference set contains exactly one mine. This eliminates candidates that neither number could reach alone.
      </p>
      <p class="text-slate-300 leading-relaxed">
        When no forced move exists, the solver calculates mine probabilities for each unrevealed cell and marks the safest option with a question mark. It's not guaranteed safe — but it's the best probability you'll get.
      </p>
    </section>

    <section class="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 p-8 shadow-xl backdrop-blur-sm">
      <h2 class="text-3xl font-bold text-white mb-5">When You Have to Guess in Minesweeper</h2>
      <p class="text-slate-300 leading-relaxed mb-4">
        Forced guesses happen most often in two situations: the opening move (every cell is unknown, so the first click is always a gamble), and endgame patterns where two cells share identical constraints.
      </p>
      <p class="text-slate-300 leading-relaxed mb-4">
        The opening move gamble is unavoidable. Windows Minesweeper actually guaranteed your first click was never a mine — most modern versions do the same. After that, logic takes over for most of the board.
      </p>
      <p class="text-slate-300 leading-relaxed">
        Endgame guesses are where probability matters. If you have to choose between a cell with a 30% mine chance and one with 70%, pick the 30% one. The solver calculates these exact probabilities using constraint propagation across the entire board, not just local neighbors.
      </p>
    </section>

    <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
      <h2 class="text-3xl font-bold text-white mb-5">Tips for Reading the Board Faster</h2>
      <div class="space-y-5">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-900/50 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">1</span>
          <div>
            <h3 class="font-bold text-white">Start from the edges of revealed areas</h3>
            <p class="text-slate-400 mt-1 text-sm">The boundary between revealed and unrevealed cells is where all the information lives. Scan the boundary systematically — top to bottom, left to right — instead of jumping around randomly.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-900/50 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">2</span>
          <div>
            <h3 class="font-bold text-white">Learn the 1-1 and 1-2 patterns</h3>
            <p class="text-slate-400 mt-1 text-sm">Two of the most common patterns. A 1-1 along an edge means the cell beyond the second 1 is safe. A 1-2 means the cell beyond the 2 is a mine. These two patterns solve about 40% of Expert boards on their own.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-900/50 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">3</span>
          <div>
            <h3 class="font-bold text-white">Count the remaining mines</h3>
            <p class="text-slate-400 mt-1 text-sm">If there are 5 mines left and 5 unrevealed cells, every unrevealed cell is a mine. If there are 2 mines left and 10 unrevealed cells, each cell has a 20% mine chance. The total mine count is a constraint the solver uses — and you should too.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
      <h2 class="text-3xl font-bold text-white mb-5">Minesweeper Difficulty Levels Explained</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-xl bg-black/20 border border-white/10 p-5">
          <h3 class="font-bold text-white mb-2">Beginner</h3>
          <p class="text-sm text-slate-400">9x9 grid, 10 mines. About 12% mine density. Almost every cell can be deduced logically. Good for learning the number patterns.</p>
        </div>
        <div class="rounded-xl bg-black/20 border border-white/10 p-5">
          <h3 class="font-bold text-white mb-2">Intermediate</h3>
          <p class="text-sm text-slate-400">16x16 grid, 40 mines. About 16% density. Requires longer logic chains. The 1-2 and 1-1 patterns appear constantly. Occasional guesses needed.</p>
        </div>
        <div class="rounded-xl bg-black/20 border border-white/10 p-5">
          <h3 class="font-bold text-white mb-2">Expert</h3>
          <p class="text-sm text-slate-400">30x16 grid, 99 mines. About 21% density. Long constraint chains, subset relationships, and frequent forced guesses. The solver earns its keep here.</p>
        </div>
      </div>
    </section>

    <div class="rounded-3xl border border-white/10 bg-white/5 p-2 shadow-xl backdrop-blur-sm">
      <FAQSection class="py-0" {faqs} title="Minesweeper Solver FAQs" />
    </div>

    <section class="rounded-3xl bg-slate-900 p-8 text-center space-y-6 border border-white/10">
      <h2 class="text-2xl font-bold text-white">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/light-out-solver" class="px-5 py-2.5 bg-white/10 border border-white/10 rounded-xl font-semibold text-slate-200 hover:bg-white/20 transition-colors">Light Out Solver</a>
        <a href="/kanoodle-solver" class="px-5 py-2.5 bg-white/10 border border-white/10 rounded-xl font-semibold text-slate-200 hover:bg-white/20 transition-colors">Kanoodle Solver</a>
        <a href="/boggle-solver" class="px-5 py-2.5 bg-white/10 border border-white/10 rounded-xl font-semibold text-slate-200 hover:bg-white/20 transition-colors">Boggle Solver</a>
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
