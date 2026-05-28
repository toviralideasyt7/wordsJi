<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
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

  <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Betweenle?</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Betweenle is a daily word game where you guess a 5-letter word and get told whether the mystery word comes alphabetically before or after your guess. You also see a "temperature" indicator — hotter means closer alphabetically, colder means further away.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Think of it as binary search with words. Each guess splits the dictionary in half. If you guess "MANGO" and the game says "after," you know the answer starts with M-Z. Guess "TIGER" next and it says "before" — now you're between MANGO and TIGER. Keep narrowing.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The temperature clue adds a twist Wordle doesn't have. Two guesses might both say "after," but one is 90% hot and the other is 40% hot. That percentage tells you roughly where the answer sits within the range. The solver uses these percentages to make smarter guesses than a plain middle-word strategy.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Alphabetical Ordering Is Harder Than Letter Matching</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        In Wordle, you learn about specific letters. Green A in position 1, yellow R somewhere. Each clue eliminates a concrete set of words. Five guesses with good feedback typically narrows 2,500 words down to one.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        In Betweenle, you learn about alphabetical position. "After MANGO" eliminates roughly half the dictionary — maybe 1,200 words. That sounds efficient, but the feedback is less precise. You don't know which letters are in the word. You don't even know the first letter. You just know it falls in a range.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The temperature percentages help, but they're approximate. A 70% hot reading means "closer to the boundary than the far end," not "exactly 70% of the way there." The solver accounts for this fuzziness when picking its next guess.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Betweenle Solver Works</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        You enter your current top and bottom bound words along with the distance percentages shown by the game. The solver takes your bounds, calculates the alphabetical midpoint weighted by the percentages, and picks the word closest to that weighted midpoint from the dictionary.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        When the range is large (thousands of words between your bounds), the solver suggests a word near the weighted center. When the range is small (under 50 words), it lists the remaining candidates so you can pick directly instead of guessing.
      </p>
      <p class="text-slate-600 leading-relaxed">
        If you only have one bound, leave the other blank. The solver still narrows the range using whatever information you provide.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">The Hotter/Colder Indicator Explained</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        After each guess, Betweenle shows a percentage. This is the temperature. A higher percentage means your guess is closer to the answer's alphabetical position. A lower percentage means you're further away.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        Here's the thing: the percentage measures distance from your guess to the answer within the current range, not within the entire dictionary. So a 90% reading when your range is "GRAPE to LEMON" means the answer is very close to LEMON. The same 90% reading in a different range means something entirely different.
      </p>
      <p class="text-slate-600 leading-relaxed">
        The solver interprets these percentages relative to your current bounds. That's why entering accurate percentages matters — off-by-10% errors shift the suggested guess by potentially hundreds of words.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Narrowing the Range Fast</h2>
      <div class="space-y-5">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">1</span>
          <div>
            <h3 class="font-bold text-slate-900">Guess words near the middle of the alphabet</h3>
            <p class="text-slate-600 mt-1 text-sm">Words starting with L, M, or N split the common English word list roughly in half. "MOUNT," "LEVEL," or "NIGHT" are strong openers because they divide the range into near-equal halves.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">2</span>
          <div>
            <h3 class="font-bold text-slate-900">Pay attention to the percentage more than the direction</h3>
            <p class="text-slate-600 mt-1 text-sm">"After" tells you which half the answer is in. The percentage tells you where in that half. A 95% reading is much more informative than the direction alone — it means the answer is right next to one of your boundaries.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-fuchsia-100 text-fuchsia-700 font-bold flex items-center justify-center">3</span>
          <div>
            <h3 class="font-bold text-slate-900">When the range is small, list the words mentally</h3>
            <p class="text-slate-600 mt-1 text-sm">If your bounds are "CRANE" and "CREAM," the answer is one of maybe 10-15 words starting with CRA or CRE. The solver shows you these candidates directly, but even without it, you can mentally enumerate: CRANE, CRASH, CRAVE, CRAWL, CREAM...</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Best Opening Words for Betweenle</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        You want a word that splits the remaining range as evenly as possible. On an empty board with no bounds, the ideal opener sits near the middle of the 5-letter word dictionary alphabetically. Words starting with L or M are usually close to that midpoint.
      </p>
      <div class="grid gap-3 md:grid-cols-3 mb-4">
        <div class="rounded-xl bg-indigo-50 p-4 text-center">
          <p class="text-lg font-bold text-indigo-700">MOUNT</p>
          <p class="text-xs text-slate-500 mt-1">Near the M midpoint</p>
        </div>
        <div class="rounded-xl bg-purple-50 p-4 text-center">
          <p class="text-lg font-bold text-purple-700">LEVEL</p>
          <p class="text-xs text-slate-500 mt-1">L-range with common letters</p>
        </div>
        <div class="rounded-xl bg-fuchsia-50 p-4 text-center">
          <p class="text-lg font-bold text-fuchsia-700">NIGHT</p>
          <p class="text-xs text-slate-500 mt-1">N-range, slightly above center</p>
        </div>
      </div>
      <p class="text-slate-600 leading-relaxed">
        These aren't magic. Any word near the alphabetical center works. The key is getting that first 50/50 split, then using the temperature percentages to home in on the answer within 3-4 more guesses.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">How to Play Betweenle</h2>
      <div class="space-y-4">
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">1</span>
          <div>
            <h3 class="font-bold text-slate-900">Guess any 5-letter word to start</h3>
            <p class="text-slate-600 mt-1 text-sm">The game accepts any valid English word. You don't need to think strategically on your first guess — just pick a word near the middle of the alphabet. "MOUNT," "LEVEL," or "NIGHT" are solid choices because they split the dictionary roughly in half, giving you maximum information from a single guess.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">2</span>
          <div>
            <h3 class="font-bold text-slate-900">Read the direction and temperature</h3>
            <p class="text-slate-600 mt-1 text-sm">After each guess, the game tells you whether the answer comes alphabetically before or after your guess and shows a temperature percentage. "After" with a high temperature means you are very close to the answer. "Before" with a low temperature means you are far away within the current range.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-fuchsia-100 text-fuchsia-700 font-bold flex items-center justify-center">3</span>
          <div>
            <h3 class="font-bold text-slate-900">Narrow the range with each guess</h3>
            <p class="text-slate-600 mt-1 text-sm">Each guess creates a new boundary. After two or three guesses you have a tight alphabetical window. The solver picks the optimal next word within that window based on your temperature percentages, so you converge faster than guessing random words in the range.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">4</span>
          <div>
            <h3 class="font-bold text-slate-900">Solve it in as few guesses as possible</h3>
            <p class="text-slate-600 mt-1 text-sm">There is no guess limit in Betweenle, but your result summary shows how many guesses it took. Most players aim for 5-7. With the solver, you can usually nail it in 4-5. The game resets daily at midnight.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Players Use a Betweenle Solver</h2>
      <p class="text-slate-600 leading-relaxed mb-4">
        Betweenle seems simple — just guess words and follow the arrow. But the challenge grows fast after the first two or three guesses. Once you have a range like "FLAME to FREED," there are dozens of valid 5-letter words in between, and manually listing them is tedious. The temperature percentages help, but translating a percentage into an exact word position requires you to know where words fall in the dictionary alphabetically. Most people don't have that memorized.
      </p>
      <p class="text-slate-600 leading-relaxed mb-4">
        The solver handles this by using the actual game word list. When you enter "FLAME" as your top bound and "FREED" as your bottom bound with a 65% temperature, it knows exactly which words exist between those two and which one is closest to the 65% mark. No manual scanning, no guessing, no risk of picking a word that doesn't exist.
      </p>
      <p class="text-slate-600 leading-relaxed">
        Some players use the solver from the very first guess. Others play 2-3 rounds on their own to understand the range, then open the solver when the candidate list gets too large to track. Either approach works. The solver updates instantly as you add or change information, so it's useful at any stage of the puzzle.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
      <h2 class="text-3xl font-bold text-slate-900 mb-5">Betweenle vs Similar Word Games</h2>
      <div class="space-y-4">
        <div class="bg-slate-50 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Betweenle vs Wordle</h3>
          <p class="text-slate-600 text-sm">Wordle gives you letter-level feedback (green, yellow, gray) that eliminates specific words. Betweenle gives you range-level feedback (before/after, temperature) that eliminates broad alphabetical chunks. Wordle is about precise deduction; Betweenle is about binary search. Wordle reveals what letters are in the answer, Betweenle reveals where the answer sits in the dictionary. Both are solvable in 6 guesses with optimal play, but the information structure is completely different.</p>
        </div>
        <div class="bg-slate-50 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Betweenle vs Contexto</h3>
          <p class="text-slate-600 text-sm">Contexto ranks all words by semantic similarity to the answer using a neural network. You guess words and get a rank number — closer to #1 means closer in meaning. Betweenle uses pure alphabetical distance. Contexto rewards vocabulary and pattern recognition; Betweenle rewards knowing how words are ordered in the dictionary. A person who reads a lot can be great at Contexto. A person who knows the alphabet can be great at Betweenle.</p>
        </div>
        <div class="bg-slate-50 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 mb-2">Betweenle vs Searchle</h3>
          <p class="text-slate-600 text-sm">Searchle combines Wordle-style letter feedback with alphabetical ranking. You get both green/yellow/gray tiles AND a numeric position score. Searchle is arguably the hardest variant because it requires managing two different feedback systems at once. Betweenle is simpler — just follow the arrow and temperature. If you find Searchle overwhelming, Betweenle is a good stepping stone because it uses only one feedback dimension.</p>
        </div>
      </div>
    </section>

    <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
      <FAQSection class="py-0" {faqs} title="Betweenle Solver FAQs" />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">5-Letter Wordle Solver</a>
        <a href="/phoodle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Phoodle Solver</a>
        <a href="/waffle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Waffle Solver</a>
        <a href="/searchle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Searchle Solver</a>
      </div>
    </section>
  </section>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
