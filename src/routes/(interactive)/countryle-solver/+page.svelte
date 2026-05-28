<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { generateBreadcrumbSchema, generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema, generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
  import {
    calculateDirection,
    directionLabels,
    directionOptions,
    filterCountriesByHints,
    formatPopulation,
    formatTemperature,
    getAllCountries,
    type CountryData,
    type CountryHint,
    type DiffType,
    type DirectionType
  } from '$lib/countryle';

  const countries = getAllCountries();

  let searchTerm = $state('');
  let selectedCountry = $state<CountryData | null>(null);
  let hemisphereDiff = $state<DiffType>('EQUAL');
  let continentHit = $state(true);
  let avgTemperatureDiff = $state<DiffType>('EQUAL');
  let populationDiff = $state<DiffType>('EQUAL');
  let coordinatesDiff = $state<DirectionType>('N');
  let hints = $state<CountryHint[]>([]);

  const countryMatches = $derived(
    searchTerm.trim().length === 0
      ? []
      : countries
          .filter(
            (country) =>
              country.country.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !hints.some((hint) => hint.country.id === country.id)
          )
          .slice(0, 8)
  );

  const filteredResults = $derived(filterCountriesByHints(countries, hints));

  const faqs = [
    {
      question: 'How do I use the Countryle solver?',
      answer: 'Pick the country you guessed in the real game, then enter the exact feedback for hemisphere, continent, temperature, population, and compass direction. Each clue reduces the matching countries.'
    },
    {
      question: 'Does the Countryle solver use the same clue logic?',
      answer: 'Yes. The filtering logic uses the same comparison rules as the source project, including the direction tolerance and percentage-based population thresholds.'
    },
    {
      question: 'Can I solve old Countryle puzzles too?',
      answer: 'Yes. The solver works for any Countryle date as long as you enter the clue feedback from that puzzle.'
    },
    {
      question: 'What do the temperature clues mean?',
      answer: '"Hotter" means the target country has a higher average temperature than your guess. "A bit hotter" means it is slightly warmer. "Same" means similar average temperature. The thresholds match the original Countryle game.'
    },
    {
      question: 'Which direction does the compass arrow point?',
      answer: 'The arrow points FROM your guessed country TOWARD the target country. If you guess France and the arrow points East, the answer is east of France — like Turkey or Russia.'
    },
    {
      question: 'What is the best country to guess first?',
      answer: 'Countries near the center of continents work well because they produce useful directional clues. Turkey, Algeria, and Kazakhstan are strong openers — they split the world into manageable regions after a single guess.'
    }
  ];

  const schemas = JSON.stringify([
    generateWebPageSchema(
      'Countryle Solver - Free Country Clue Helper | WordSolverX',
      'Use the Countryle solver to filter countries by continent, hemisphere, temperature, population, and direction clues from the daily Countryle game.',
      'https://wordsolverx.com/countryle-solver',
      { image: 'https://wordsolverx.com/images/countryle-solver.webp' }
    ),
    generateSoftwareApplicationSchema('Countryle Solver', 'GameApplication'),
    generateFAQSchema(faqs),
    generateHowToSchema('How to use the Countryle solver', [
      { name: 'Select your guessed country', text: 'Type the country name and pick it from the dropdown.' },
      { name: 'Set the clue feedback', text: 'Toggle hemisphere, continent, temperature, population, and direction to match what Countryle showed you.' },
      { name: 'Add clue and review results', text: 'Click Add Clue to filter. The remaining countries are ranked by how well they match all your clues.' }
    ]),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Solver', url: 'https://wordsolverx.com/solver' },
      { name: 'Countryle Solver', url: 'https://wordsolverx.com/countryle-solver' }
    ])
  ]);

  function selectCountry(country: CountryData) {
    selectedCountry = country;
    searchTerm = country.country;
  }

  function addHint() {
    if (!selectedCountry) return;

    hints = [
      ...hints,
      {
        id: `${selectedCountry.id}-${Date.now()}`,
        country: selectedCountry,
        hemisphereDiff,
        continentHit,
        avgTemperatureDiff,
        populationDiff,
        coordinatesDiff
      }
    ];

    searchTerm = '';
    selectedCountry = null;
    hemisphereDiff = 'EQUAL';
    continentHit = true;
    avgTemperatureDiff = 'EQUAL';
    populationDiff = 'EQUAL';
    coordinatesDiff = 'N';
  }

  function removeHint(id: string) {
    hints = hints.filter((hint) => hint.id !== id);
  }

  function resetSolver() {
    searchTerm = '';
    selectedCountry = null;
    hints = [];
    hemisphereDiff = 'EQUAL';
    continentHit = true;
    avgTemperatureDiff = 'EQUAL';
    populationDiff = 'EQUAL';
    coordinatesDiff = 'N';
  }
</script>

<svelte:head>
  <title>Countryle Solver - Free Country Clue Helper | WordSolverX</title>
  <meta name="description" content="Use the Countryle solver to filter countries by continent, hemisphere, temperature, population, and direction clues from the daily Countryle game." />
  <meta name="keywords" content="countryle solver, countryle helper, countryle country solver, countryle clues" />
  <link rel="canonical" href="https://wordsolverx.com/countryle-solver" />
  <meta property="og:title" content="Countryle Solver - Free Country Clue Helper" />
  <meta property="og:description" content="Filter countries by Countryle clue feedback and narrow the correct answer quickly." />
  <meta property="og:url" content="https://wordsolverx.com/countryle-solver" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content="https://wordsolverx.com/images/countryle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Countryle Solver" />
  <meta name="twitter:description" content="A static Countryle solver with exact clue filtering and ranked matches." />
  <meta name="twitter:image" content="https://wordsolverx.com/images/countryle-solver.webp" />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <Breadcrumbs hideSchema={true} />
  </div>

  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-8 shadow-2xl">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Geography Game</p>
          <h1 class="mt-4 text-4xl font-black text-white">Countryle Solver</h1>
          <p class="mt-4 max-w-3xl text-lg text-white/80">
            Enter the exact feedback from your Countryle guess and this solver ranks the matching countries using the same clue logic as the source project.
          </p>
        </div>
        <button type="button" class="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10" onclick={resetSolver}>Reset</button>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-5xl px-4 pb-4 sm:px-6 lg:px-8">
    <section class="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <article class="rounded-3xl bg-white shadow-sm border border-slate-200 p-8 space-y-5">
        <div>
          <label for="countryle-guess-country" class="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Guessed country</label>
          <input id="countryle-guess-country" class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 " bind:value={searchTerm} placeholder="Type a country name..." />
          {#if countryMatches.length > 0 && !selectedCountry}
            <div class="mt-3 rounded-2xl border border-slate-200 overflow-hidden">
              {#each countryMatches as country}
                <button type="button" class="w-full border-b border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 last:border-b-0" onclick={() => selectCountry(country)}>
                  <span class="font-semibold">{country.country}</span>
                  <span class="ml-2 text-slate-500">{country.continent}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>

        {#if selectedCountry}
          <div class="rounded-2xl bg-slate-50 p-4 ">
            <p class="font-semibold text-slate-900">Selected: {selectedCountry.country}</p>
            <div class="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <p>Continent: {selectedCountry.continent}</p>
              <p>Hemisphere: {selectedCountry.hemisphere}</p>
              <p>Population: {formatPopulation(selectedCountry.population)}</p>
              <p>Temperature: {formatTemperature(selectedCountry.avgTemperature)}</p>
            </div>
          </div>
        {/if}

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm font-semibold text-slate-700">Hemisphere</p>
            <div class="mt-2 flex gap-2">
              <button type="button" class={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${hemisphereDiff === 'EQUAL' ? 'bg-teal-600 text-white' : 'border border-slate-300 text-slate-700'}`} onclick={() => (hemisphereDiff = 'EQUAL')}>Same</button>
              <button type="button" class={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${hemisphereDiff === 'DIFFERENT' ? 'bg-rose-600 text-white' : 'border border-slate-300 text-slate-700'}`} onclick={() => (hemisphereDiff = 'DIFFERENT')}>Different</button>
            </div>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-700">Continent</p>
            <div class="mt-2 flex gap-2">
              <button type="button" class={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${continentHit ? 'bg-teal-600 text-white' : 'border border-slate-300 text-slate-700'}`} onclick={() => (continentHit = true)}>Same</button>
              <button type="button" class={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${!continentHit ? 'bg-rose-600 text-white' : 'border border-slate-300 text-slate-700'}`} onclick={() => (continentHit = false)}>Different</button>
            </div>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-700">Temperature</p>
            <select class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 " bind:value={avgTemperatureDiff}>
              <option value="MORE">Hotter</option>
              <option value="LITTLE_MORE">A bit hotter</option>
              <option value="EQUAL">Same</option>
              <option value="LITTLE_LESS">A bit colder</option>
              <option value="LESS">Colder</option>
            </select>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-700">Population</p>
            <select class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 " bind:value={populationDiff}>
              <option value="MORE">Larger</option>
              <option value="LITTLE_MORE">A bit larger</option>
              <option value="EQUAL">Same</option>
              <option value="LITTLE_LESS">A bit smaller</option>
              <option value="LESS">Smaller</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <p class="text-sm font-semibold text-slate-700">Direction to target</p>
            <div class="mt-2 grid grid-cols-4 gap-2 md:grid-cols-8">
              {#each directionOptions as direction}
                <button type="button" class={`rounded-xl px-3 py-2 text-sm font-semibold ${coordinatesDiff === direction ? 'bg-sky-600 text-white' : 'border border-slate-300 text-slate-700'}`} onclick={() => (coordinatesDiff = direction)}>{directionLabels[direction]}</button>
              {/each}
            </div>
          </div>
        </div>

        <button type="button" class="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50" onclick={addHint} disabled={!selectedCountry}>Add Clue</button>
      </article>

      <article class="rounded-3xl bg-white shadow-sm border border-slate-200 p-8 space-y-6">
        <div>
          <h2 class="text-2xl font-black text-slate-900">Active Clues</h2>
          <div class="mt-4 space-y-3">
            {#if hints.length === 0}
              <p class="text-slate-600">Add your first Countryle clue to begin filtering.</p>
            {:else}
              {#each hints as hint}
                <div class="rounded-2xl border border-slate-200 p-4">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="font-semibold text-slate-900">{hint.country.country}</p>
                      <p class="mt-2 text-sm text-slate-600">
                        Hemisphere {hint.hemisphereDiff} · Continent {hint.continentHit ? 'same' : 'different'} · Direction {hint.coordinatesDiff}
                      </p>
                    </div>
                    <button type="button" class="text-sm font-semibold text-rose-600" onclick={() => removeHint(hint.id)}>Remove</button>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <div>
          <h2 class="text-2xl font-black text-slate-900">Possible Answers</h2>
          <p class="mt-2 text-sm text-slate-500">{filteredResults.length} matches</p>
          <div class="mt-4 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {#if filteredResults.length === 0 && hints.length > 0}
              <p class="text-slate-600">No countries match the current clue set.</p>
            {:else}
              {#each filteredResults.slice(0, 30) as result, index}
                <div class="rounded-2xl border border-slate-200 p-4">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="font-semibold text-slate-900">{index + 1}. {result.country.country}</p>
                      <p class="mt-1 text-sm text-slate-600">{result.country.continent} · {result.country.hemisphere}</p>
                    </div>
                    <span class="text-sm font-semibold text-slate-500">Score {result.score.toFixed(0)}</span>
                  </div>
                  {#if selectedCountry}
                    <p class="mt-3 text-xs text-slate-500">
                      Direction from {selectedCountry.country}: {calculateDirection(selectedCountry.coordinates, result.country.coordinates)}
                    </p>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </article>
    </section>
  </section>

  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
    <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">What is Countryle?</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Countryle is a daily geography guessing game. You guess a country and get five clues back: hemisphere, continent, average temperature, population, and compass direction. The goal is to identify the mystery country in as few guesses as possible.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          It works like Wordle but for countries instead of words. Each guess narrows the field. If your guess shows "Different hemisphere," you can eliminate every country on that side of the equator. If the temperature is "Hotter," you cut every cold country. The clues compound fast.
        </p>
        <p class="text-slate-600 leading-relaxed">
          Most players solve it in 3-4 guesses once they learn how to read the clues. The trick is picking opening guesses that split the world into roughly equal halves.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Two Guesses Usually Crack It</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Guess Turkey first. You get five clues. Hemisphere — same or different, which immediately cuts the field in half. Continent — same or different, which either confirms Eurasia or eliminates it. Temperature, population, and direction further constrain the answer.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          After one well-placed guess, you're typically down to 15-25 countries. A second guess — say, Brazil if the direction points southwest — brings that down to 3-5 countries. The third guess is usually the answer.
        </p>
        <p class="text-slate-600 leading-relaxed">
          The solver automates this. Enter each guess's feedback and watch the candidate list shrink. By the second or third clue, the answer is almost always in the top 3 ranked results.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">The Best Countries to Guess First</h2>
        <div class="grid gap-4 md:grid-cols-3 mb-5">
          <div class="rounded-2xl bg-teal-50 border border-teal-200 p-5">
            <h3 class="font-bold text-teal-800 mb-2">Turkey</h3>
            <p class="text-sm text-slate-600">Straddles Europe and Asia. Moderate temperature. Large population. Central position makes the direction arrow highly informative — it points toward most of the world's countries.</p>
          </div>
          <div class="rounded-2xl bg-teal-50 border border-teal-200 p-5">
            <h3 class="font-bold text-teal-800 mb-2">Algeria</h3>
            <p class="text-sm text-slate-600">North Africa. Northern hemisphere. Hot climate. Medium-large population. The direction clue from Algeria cleanly separates Africa + Europe from Asia + the Americas.</p>
          </div>
          <div class="rounded-2xl bg-teal-50 border border-teal-200 p-5">
            <h3 class="font-bold text-teal-800 mb-2">Kazakhstan</h3>
            <p class="text-sm text-slate-600">Central Asia. Cold winters. Large land area. Eastern hemisphere. Its position makes the compass direction split Asia into clear sub-regions on the first guess.</p>
          </div>
        </div>
        <p class="text-slate-600 leading-relaxed">
          The common thread: these countries sit near the center of their continent. A guess from the center produces directional clues that cut the world into meaningful slices. A guess from the edge — say, Iceland — mostly tells you "the answer isn't near Iceland," which isn't helpful.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">How Our Countryle Solver Ranks Countries</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          After you add a clue, the solver filters the country list to only those that match every hint you've entered. Then it scores each remaining country based on how well it satisfies all the constraints simultaneously.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          Countries that match more precisely — closer temperature, closer population, more aligned compass direction — get higher scores. The top results are the most likely answers given what you've told the solver so far.
        </p>
        <p class="text-slate-600 leading-relaxed">
          The scoring uses the same comparison logic as the original Countryle game, including the percentage-based thresholds for population and temperature proximity. No approximations.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Understanding Each Clue Type</h2>
        <div class="space-y-5">
          <div class="rounded-2xl bg-slate-50 p-5">
            <h3 class="font-bold text-slate-900 mb-2">Hemisphere</h3>
            <p class="text-sm text-slate-600">Same or different. The equator divides the world into northern and southern. Most countries are in the northern hemisphere, so "Different" is more informative — it cuts far more candidates.</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-5">
            <h3 class="font-bold text-slate-900 mb-2">Continent</h3>
            <p class="text-sm text-slate-600">Same or different. Seven continents. If your guess and the answer share a continent, you've narrowed it to roughly 30-50 countries. If not, you've eliminated an entire landmass.</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-5">
            <h3 class="font-bold text-slate-900 mb-2">Temperature</h3>
            <p class="text-sm text-slate-600">Hotter, a bit hotter, same, a bit colder, colder. This uses the country's average annual temperature. Tropical countries like Indonesia read "hotter" compared to most guesses; Scandinavian countries read "colder."</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-5">
            <h3 class="font-bold text-slate-900 mb-2">Population</h3>
            <p class="text-sm text-slate-600">Larger, a bit larger, same, a bit smaller, smaller. The "a bit" variants indicate the answer is within a certain percentage threshold. This helps distinguish between countries of similar size like France and the UK.</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-5">
            <h3 class="font-bold text-slate-900 mb-2">Compass direction</h3>
            <p class="text-sm text-slate-600">Eight directions: N, NE, E, SE, S, SW, W, NW. This points FROM your guessed country TOWARD the answer. It's the most precise single clue — combined with continent, it often identifies the region.</p>
          </div>
        </div>
      </section>

      <section class="border border-slate-200 bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">When the Direction Arrow Points the Wrong Way</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          The most common mistake in Countryle: reading the compass direction backward. The arrow points from your guess toward the answer — not from the answer toward your guess.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          Example: you guess Brazil. The arrow points East. That means the answer is east of Brazil — countries like Nigeria, Chad, or further east. It does NOT mean you should guess something west of Brazil.
        </p>
        <p class="text-slate-600 leading-relaxed">
          This trips up roughly half of new players. If your results keep getting worse instead of better, check whether you've been reading the direction clue in reverse.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">How to Play Countryle</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Countryle is a daily geography guessing game. Each day, a mystery country is chosen. You guess a country, and the game gives you five pieces of feedback. Your goal is to identify the mystery country in as few guesses as possible, typically 3-4 with good strategy.
        </p>
        <div class="space-y-4 mb-4">
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">1</span>
            <div>
              <h3 class="font-bold text-slate-900">Guess any country from the full list</h3>
              <p class="text-slate-600 mt-1 text-sm">Type a country name in the search box and select it. The database includes every country and territory that Countryle uses — over 200 options. Your guess does not have to be from the answer list; the game accepts any recognized country.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">2</span>
            <div>
              <h3 class="font-bold text-slate-900">Enter the five feedback clues from the game</h3>
              <p class="text-slate-600 mt-1 text-sm">Set hemisphere (same or different), continent (same or different), temperature (hotter, a bit hotter, same, a bit colder, colder), population (larger, a bit larger, same, a bit smaller, smaller), and compass direction (8 directions). Match exactly what Countryle showed you for that guess.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <span class="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center">3</span>
            <div>
              <h3 class="font-bold text-slate-900">Add the clue and watch the candidate list shrink</h3>
              <p class="text-slate-600 mt-1 text-sm">Each clue eliminates a chunk of the candidate list. Hemisphere alone cuts roughly in half. Continent narrows further. After two well-chosen guesses, the list typically drops to 3-5 countries. The third guess is usually the answer.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Players Use a Countryle Solver</h2>
        <p class="text-slate-600 leading-relaxed mb-4">
          Five clues per guess creates a dense information structure. After two guesses, you might have 10+ data points across hemisphere, continent, temperature, population, and direction. Mentally processing all of those at once is difficult — which hemisphere is the answer in? Which continent? Is it hotter or colder? The solver filters the list instantly and shows you the ranked matches.
        </p>
        <p class="text-slate-600 leading-relaxed mb-4">
          Temperature and population clues are particularly tricky because "a bit hotter" and "a bit larger" use fuzzy thresholds. The solver handles these percentage-based comparisons exactly as the original game does, so you get the same filtering results you would get by checking each country manually — but thousands of times faster.
        </p>
        <p class="text-slate-600 leading-relaxed">
          Some players use the solver to learn which opening guesses produce the best information. After trying different first countries, they discover that central continental countries like Turkey and Kazakhstan consistently narrow the field faster than edge countries like Iceland or New Zealand.
        </p>
      </section>

      <section class="border border-slate-200 bg-white rounded-xl p-6 shadow-[0_1px_3px_rgb(0_0_0/0.04)]">
        <h2 class="text-3xl font-bold text-slate-900 mb-5">Countryle vs Similar Geography Games</h2>
        <div class="space-y-4">
          <div class="bg-slate-50 rounded-xl p-5">
            <h3 class="font-bold text-slate-900 mb-2">Countryle vs Worldle</h3>
            <p class="text-slate-600 text-sm">Countryle gives you five structured clues; Worldle gives you two vague ones (distance and direction). Countryle's structured feedback eliminates countries much faster — after two guesses, you are typically down to 3-5 candidates. Worldle often leaves 10-20 candidates after the same number of guesses because its distance/direction clues are less precise.</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-5">
            <h3 class="font-bold text-slate-900 mb-2">Countryle vs Globle</h3>
            <p class="text-slate-600 text-sm">Globle uses a progressive zoom map approach — the map starts fully zoomed out and gets closer as you guess correctly. This visual feedback makes it easier to play without a solver because you can see the highlighted region shrinking. Countryle has no visual component — it is purely text-based clues.</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-5">
            <h3 class="font-bold text-slate-900 mb-2">Countryle vs Flagle</h3>
            <p class="text-slate-600 text-sm">Flagle tests flag knowledge — you see a country's flag and guess the country. No geographic reasoning required, just visual recognition. Countryle is the opposite — no visual element at all, pure geographic reasoning. Different skill sets, different players tend to prefer one over the other.</p>
          </div>
        </div>
      </section>

      <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
        <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
        <div class="flex flex-wrap justify-center gap-3">
          <a href="/worldle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Worldle Solver</a>
          <a href="/countryle-answer-today" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Countryle Answer Today</a>
          <a href="/spotle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Spotle Solver</a>
          <a href="/5-letter-wordle-solver" class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">Wordle Solver</a>
        </div>
      </section>
      <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
        <FAQSection class="py-0" title="Countryle Solver FAQ" {faqs} />
      </div>
    </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
