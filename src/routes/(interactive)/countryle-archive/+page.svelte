<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { formatPopulation, formatTemperature } from '$lib/countryle';
  import { getCountryleArchive, getCountryleArchiveDates } from '$lib/countryle-data';
  import { generateCollectionPageSchema, generateWebPageSchema } from '$lib/seo';

  const archive = getCountryleArchive();
  const availableDates = getCountryleArchiveDates();
  let selectedDate = $state(availableDates[0] ?? '');
  const selectedEntry = $derived((selectedDate && archive[selectedDate]) || null);
  const schemaJson = JSON.stringify([
    generateCollectionPageSchema(
      'Countryle Archive',
      'Browse the Countryle archive by date and review past countries, continents, populations, coordinates, and map links from our verified answer records.',
      'https://wordsolverx.com/countryle-archive',
      availableDates.slice(0, 10).map((dateKey) => ({
        name: `Countryle ${dateKey}`,
        url: `https://wordsolverx.com/countryle-archive?date=${dateKey}`
      }))
    ),
    generateWebPageSchema(
      'Countryle Archive - Daily Country Answers History | WordSolverX',
      'Browse the Countryle archive by date and review past countries, continents, populations, coordinates, and map links from our verified answer records.',
      'https://wordsolverx.com/countryle-archive'
    )
  ]);
</script>

<svelte:head>
  <title>Countryle Archive - Daily Country Answers History | WordSolverX</title>
  <meta name="description" content="Browse the Countryle archive by date and review past countries, continents, populations, coordinates, and map links from our verified answer records." />
  <link rel="canonical" href="https://wordsolverx.com/countryle-archive" />
  <meta property="og:title" content="Countryle Archive - Daily Country Answers History" />
  <meta property="og:description" content="Look up previous Countryle answers with a static archive of countries and date-based puzzle entries." />
  <meta property="og:url" content="https://wordsolverx.com/countryle-archive" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Countryle Archive" />
  <meta name="twitter:description" content="Search the saved Countryle answer archive by date." />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${schemaJson}</script>`}
</svelte:head>

<div class="min-h-screen py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <Breadcrumbs />

    <section class="rounded-xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Countryle Archive</p>
      <h1 class="mt-3 text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50">Past Countryle Answers</h1>
      <p class="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
        Search the Countryle answer archive by date and review the saved country details for each puzzle.
      </p>
    </section>

    <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <article class="rounded-xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
        <label for="countryle-archive-date" class="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Select date</label>
        <input
          id="countryle-archive-date"
          class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          type="date"
          value={selectedDate}
          min={availableDates[availableDates.length - 1]}
          max={availableDates[0]}
          onchange={(event) => (selectedDate = (event.currentTarget as HTMLInputElement).value)}
        />

        <div class="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          {availableDates.length} archive entries available.
        </div>

        <div class="mt-6 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
          {#each availableDates.slice(0, 60) as dateKey}
            {@const entry = archive[dateKey]}
            <button
              type="button"
              class={`w-full rounded-lg border p-4 text-left transition-colors ${selectedDate === dateKey ? 'border-teal-500 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/30' : 'border-slate-200 hover:border-teal-300 dark:border-slate-700 dark:hover:border-teal-700'}`}
              onclick={() => (selectedDate = dateKey)}
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-slate-50">{entry.country.country}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-300">{entry.date} · #{entry.gameNumber}</p>
                </div>
                <span class="text-sm text-slate-500 dark:text-slate-400">{entry.country.continent}</span>
              </div>
            </button>
          {/each}
        </div>
      </article>

      <article class="rounded-xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
        {#if selectedEntry}
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Selected puzzle</p>
          <h2 class="mt-3 text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50">{selectedEntry.country.country}</h2>
          <p class="mt-2 text-slate-600 dark:text-slate-300">{selectedEntry.date} · Game #{selectedEntry.gameNumber}</p>

          <div class="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900"><p class="text-sm text-slate-500 dark:text-slate-400">Continent</p><p class="mt-2 font-bold text-slate-900 dark:text-slate-50">{selectedEntry.country.continent}</p></div>
            <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900"><p class="text-sm text-slate-500 dark:text-slate-400">Hemisphere</p><p class="mt-2 font-bold text-slate-900 dark:text-slate-50">{selectedEntry.country.hemisphere}</p></div>
            <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900"><p class="text-sm text-slate-500 dark:text-slate-400">Population</p><p class="mt-2 font-bold text-slate-900 dark:text-slate-50">{formatPopulation(selectedEntry.country.population)}</p></div>
            <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900"><p class="text-sm text-slate-500 dark:text-slate-400">Surface Area</p><p class="mt-2 font-bold text-slate-900 dark:text-slate-50">{selectedEntry.country.surface.toLocaleString()} km²</p></div>
            <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900"><p class="text-sm text-slate-500 dark:text-slate-400">Avg. Temperature</p><p class="mt-2 font-bold text-slate-900 dark:text-slate-50">{formatTemperature(selectedEntry.country.avgTemperature)}</p></div>
            <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900"><p class="text-sm text-slate-500 dark:text-slate-400">Coordinates</p><p class="mt-2 font-bold text-slate-900 dark:text-slate-50">{selectedEntry.country.coordinates}</p></div>
          </div>

          {#if selectedEntry.country.mapsUrl}
            <a href={selectedEntry.country.mapsUrl} target="_blank" rel="noopener noreferrer" class="mt-6 inline-flex items-center rounded-lg bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/20 dark:text-teal-300 dark:hover:bg-teal-950/30">
              View on Google Maps
            </a>
          {/if}
        {/if}
      </article>
    </section>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </div>
</div>
