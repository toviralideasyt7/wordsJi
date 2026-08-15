<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
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

  

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
