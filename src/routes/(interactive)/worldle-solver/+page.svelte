<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateSoftwareApplicationSchema,
    stripStructuredDataTypes,
    generateWebPageSchema,
  } from '$lib/seo';
  import WorldleSolverClient from '$lib/components/worldle/WorldleSolverClient.svelte';

  const faqs = [
    {
      question: 'How does the Worldle solver narrow down countries?',
      answer:
        'It compares each candidate country against the distance and direction clues you enter from your guesses. Countries that fail both checks for any hint are removed, and the rest are ranked by how closely they match all clues.',
    },
    {
      question: 'What clues should I enter from the Worldle game?',
      answer:
        'Add the country you guessed, the distance shown by Worldle, and the compass direction arrow from your guess to the answer. If you want, you can also include the proximity percentage as an extra ranking signal.',
    },
    {
      question: 'Does the solver run on the server?',
      answer:
        'No. This tool runs entirely in your browser, so results update locally as you add or remove hints.',
    },
    {
      question: 'Why are there still multiple possible answers sometimes?',
      answer:
        'Worldle clues can overlap. One hint often leaves many countries that are close enough, so adding a second or third hint usually collapses the list quickly.',
    },
    {
      question: 'Does the solver include territories and small island nations?',
      answer:
        'Yes. The database includes overseas territories and small island nations that Worldle uses, like French Polynesia, Saint Helena, and New Caledonia.',
    },
    {
      question: 'Can I remove a clue if I entered it wrong?',
      answer:
        'Yes. Each clue you add has a remove button. Delete any clue and the candidate list recalculates immediately with the remaining hints.',
    },
  ];

  const pageTitle = 'Worldle Solver - Solve Worldle With Distance And Direction Clues | WordSolverX';
  const pageDescription =
    'Use the WordSolverX Worldle Solver to filter countries by distance, direction, and proximity clues. This Worldle helper runs instantly in your browser.';
  const pageUrl = 'https://wordsolverx.com/worldle-solver';

  const schemas = JSON.stringify([
    generateFAQSchema(faqs),
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
    <WorldleSolverClient {faqs} />
  </div>

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Worldle?</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Worldle is a daily geography game created by @teuteuf. You see the silhouette of a country or territory and guess what it is. After each guess, you get two clues: the distance from your guess to the answer (in kilometers), and a direction arrow pointing from your guess toward the answer.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          That's it. No continent hint, no hemisphere clue, no population data. Just distance and direction. The silhouette helps — if you recognize the shape, you're halfway there. But for small island nations and territories most people have never heard of, the silhouette isn't much help at all.
        </p>
        <p class="text-slate-600 leading-relaxed">
          The game has millions of daily players. Most solve it in 3-5 guesses once they learn how to read the distance-direction combo effectively.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Distance-Only Clues Make Worldle Harder Than Countryle</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Countryle gives you five specific clues: hemisphere, continent, temperature, population, and direction. Each one eliminates a clear slice of the answer space. Worldle gives you two vague clues: a number (distance) and an arrow (direction). Both are imprecise.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          A distance of 2,000 km with a northeast arrow from Brazil could point to roughly 20 countries across West Africa and Southern Europe. You need a second guess to narrow further. The same information in Countryle — "different continent, hotter" — would cut the field to maybe 5 countries immediately.
        </p>
        <p class="text-slate-600 leading-relaxed">
          This is why a solver helps more in Worldle than in most other geography games. The clues are fuzzier, the candidate list stays longer, and the difference between a good guess and a great guess is harder to judge by feel.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Worldle Solver Works</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          You enter the country you guessed, the distance the game showed, and the direction arrow. The solver compares every country in its database against all your clues. Any country that doesn't match the distance (within a reasonable tolerance) and direction gets removed.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          The remaining countries are ranked by how closely they match all clues simultaneously. Countries that match the distance more precisely and align better with the direction arrow appear higher in the list.
        </p>
        <p class="text-slate-600 leading-relaxed">
          Add a second or third clue and the candidate list collapses fast. The entire computation runs in your browser — no server calls, no waiting, no data leaving your device.
        </p>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-teal-50 p-8 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">The Best Countries to Guess First in Worldle</h2>
        <div class="grid gap-4 md:grid-cols-3 mb-5">
          <div class="rounded-xl bg-teal-50 border border-teal-200 p-5">
            <h3 class="font-bold text-teal-800 mb-2">France</h3>
            <p class="text-sm text-slate-600">Central to Western Europe. A distance of 8,000+ km with an east arrow points toward Asia. A short distance with a south arrow points toward Africa.</p>
          </div>
          <div class="rounded-xl bg-teal-50 border border-teal-200 p-5">
            <h3 class="font-bold text-teal-800 mb-2">Brazil</h3>
            <p class="text-sm text-slate-600">Large and centrally located in South America. A short distance with an east arrow eliminates most of the Americas. A long distance with a northeast arrow points toward Europe or Africa.</p>
          </div>
          <div class="rounded-xl bg-teal-50 border border-teal-200 p-5">
            <h3 class="font-bold text-teal-800 mb-2">India</h3>
            <p class="text-sm text-slate-600">Sits between the Middle East and Southeast Asia. A west arrow with moderate distance points toward the Middle East or Africa. An east arrow with short distance points toward Southeast Asia.</p>
          </div>
        </div>
        <p class="text-slate-600 leading-relaxed">
          The principle: guess countries near the center of a continent. They produce directional arrows that split the world into meaningful regions. A guess from a corner country — like New Zealand or Iceland — mostly tells you "the answer isn't near here," which is barely useful.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">When the Distance Clue Is Misleading</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Worldle measures distance from the geographic center of your guessed country to the center of the answer. For large countries, this can be confusing. The distance from the center of Russia to the center of the US is about 8,000 km, but Alaska is only 4 km from Russia's eastern tip at the Bering Strait.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          Small countries are the opposite problem. If you guess Luxembourg and the answer is Belgium, the distance shows roughly 200 km — but the direction arrow might point in an unexpected direction because the geographic centers are close but offset.
        </p>
        <p class="text-slate-600 leading-relaxed">
          The solver uses the same center-to-center calculation that Worldle uses. If your distance reading looks weird, check whether you're dealing with a large country where center-to-center doesn't represent the closest border point.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Tips for Narrowing Down the Answer Fast</h2>
        <div class="space-y-5">
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-sky-100 text-teal-700 font-bold flex items-center justify-center">1</span>
            <div>
              <h3 class="font-bold text-slate-900">Use the silhouette first</h3>
              <p class="text-slate-600 mt-1 text-sm">Before guessing, actually look at the country outline. Recognizable shapes — Italy's boot, Japan's arc, Chile's strip — eliminate the need for distance clues entirely on the first guess.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">2</span>
            <div>
              <h3 class="font-bold text-slate-900">Combine distance + direction mentally before entering clues</h3>
              <p class="text-slate-600 mt-1 text-sm">"5,000 km northeast from Brazil" narrows to West Africa and Western Europe. You can probably name 3-4 candidates before even using the solver. Enter your clues anyway — the solver will confirm or correct your intuition.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-teal-700 font-bold flex items-center justify-center">3</span>
            <div>
              <h3 class="font-bold text-slate-900">Don't forget about island territories</h3>
              <p class="text-slate-600 mt-1 text-sm">Worldle includes overseas territories and small island nations. If the distance is huge and the direction points toward the middle of an ocean, think French Polynesia, New Caledonia, or Saint Helena — places most people forget exist.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">How to Play Worldle</h2>
        <div class="space-y-4 mb-4">
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">1</span>
            <div>
              <h3 class="font-bold text-slate-900">Look at the country silhouette</h3>
              <p class="text-slate-600 mt-1 text-sm">Worldle shows you the outline of a country or territory. If you recognize the shape — Italy's boot, Japan's arc, Chile's strip — you can often guess correctly on the first try without needing any distance clues at all.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">2</span>
            <div>
              <h3 class="font-bold text-slate-900">Guess a country and read the distance</h3>
              <p class="text-slate-600 mt-1 text-sm">After each guess, Worldle shows the distance in kilometers from your guess to the answer, plus a compass direction arrow. A distance of 1,200 km means the answer is roughly 1,200 km away from wherever you guessed.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">3</span>
            <div>
              <h3 class="font-bold text-slate-900">Use the direction arrow to narrow the region</h3>
              <p class="text-slate-600 mt-1 text-sm">The arrow points FROM your guess TOWARD the answer. If you guess France and see "northeast", the answer is northeast of France — somewhere in Germany, Switzerland, or further east. Combining distance and direction lets you triangulate the answer.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">4</span>
            <div>
              <h3 class="font-bold text-slate-900">Solve it in 6 guesses or fewer</h3>
              <p class="text-slate-600 mt-1 text-sm">You get a maximum of 6 attempts. Most experienced players solve it in 3-4. The game shows a percentage proximity score in addition to distance — 95%+ means you are very close, under 50% means you are far away.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Players Use a Worldle Solver</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Worldle's clues are imprecise. A distance of 2,000 km with a northeast arrow from Brazil could match 20+ countries across West Africa and Southern Europe. Humans struggle to mentally calculate which countries fall within a 2,000 km radius of a specific direction. The solver does this calculation instantly and ranks the remaining candidates by how closely they match all your clues.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          Island nations are the biggest pain point. If the answer is a tiny territory in the middle of the Pacific Ocean, the distance will be enormous from any continental guess and the direction arrow is your only useful clue. The solver's database includes these territories, so it can narrow to French Polynesia, Tuvalu, or Vanuatu when a human player would be guessing blindly.
        </p>
        <p class="text-slate-600 leading-relaxed">
          Most solver users play the game themselves and only open the tool when they are genuinely stuck after 3-4 guesses. The solver is a last resort, not a first step. When you use it, enter all your previous guesses and their clues — the solver uses every data point you provide to narrow the candidate list.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Worldle vs Similar Geography Games</h2>
        <div class="space-y-4">
          <div class="bg-slate-50 rounded-xl p-5">
            <h3 class="font-bold text-slate-900 mb-2">Worldle vs Countryle</h3>
            <p class="text-slate-600 text-sm">Countryle gives you five specific clues: hemisphere, continent, temperature, population, and direction. Worldle gives you two vague clues: distance and direction. Countryle's structured feedback eliminates countries much faster — each clue slices away a clear segment of the candidate list. Worldle requires more guesses because the clues overlap significantly between countries.</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-5">
            <h3 class="font-bold text-slate-900 mb-2">Worldle vs Globle</h3>
            <p class="text-slate-600 text-sm">Globle also uses distance and direction, but it shows a progressively zooming map as you get closer. This visual feedback makes it easier to narrow the answer without a solver because you can literally see the highlighted region shrinking. Worldle is harder because it only shows numbers — you have to visualize the geography mentally.</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-5">
            <h3 class="font-bold text-slate-900 mb-2">Worldle vs Flagle</h3>
            <p class="text-slate-600 text-sm">Flagle shows country flags instead of silhouettes. If you know flags well, you can often solve it in 1-2 guesses. Worldle relies on geographic knowledge — you need to know where countries are positioned relative to each other, not what their flags look like. The skill sets are different: Flagle rewards flag memorization, Worldle rewards spatial reasoning.</p>
          </div>
        </div>
      </section>

      <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
        <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
        <div class="flex flex-wrap justify-center gap-3">
          <a href="/countryle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Countryle Solver</a>
          <a href="/worldle-answer-today" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Worldle Answer Today</a>
          <a href="/spotle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Spotle Solver</a>
          <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Wordle Solver</a>
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
