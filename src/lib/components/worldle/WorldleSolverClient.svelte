<script lang="ts">
  import { onMount } from 'svelte';
  import { tick } from 'svelte';

  import {
    WORLDLE_DIRECTIONS,
    calculateProximity,
    formatDistance,
    getDirectionEmoji,
    getFlagEmoji,
    solveWorldle,
  } from '$lib/worldle/logic';
  import type {
    WorldleCountry,
    WorldleDirection,
    WorldleSolverHint,
    WorldleSolverResult,
  } from '$lib/worldle/types';


  let countries = $state<WorldleCountry[]>([]);
  let countriesLoaded = $state(false);
  let searchQuery = $state('');
  let selectedCountry = $state<WorldleCountry | null>(null);
  let distanceInput = $state('');
  let direction = $state<WorldleDirection>('N');
  let proximityInput = $state('');
  let hints = $state<WorldleSolverHint[]>([]);
  let results = $state<WorldleSolverResult[]>([]);
  let errorMessage = $state('');
  let formPanel: HTMLElement | null = null;
  let resultsPanel: HTMLElement | null = null;
  let distanceInputElement: HTMLInputElement | null = null;

  let suggestions = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query || (selectedCountry && selectedCountry.name.toLowerCase() === query)) {
      return [];
    }

    return countries
      .filter((country) => {
        if (hints.some((hint) => hint.country.code === country.code)) {
          return false;
        }

        return (
          country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase() === query ||
          Object.values(country.names).some((name) => name.toLowerCase().includes(query))
        );
      })
      .slice(0, 8);
  });

  onMount(async () => {
    const module = await import('$lib/data/worldle/countries.json');
    countries = module.default as WorldleCountry[];
    countriesLoaded = true;
  });

  async function selectCountry(country: WorldleCountry): Promise<void> {
    selectedCountry = country;
    searchQuery = country.name;
    errorMessage = '';
    await tick();
    formPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    distanceInputElement?.focus();
  }

  function handleSearchInput(event: Event): void {
    const value = (event.currentTarget as HTMLInputElement).value;
    searchQuery = value;

    if (!selectedCountry || selectedCountry.name.toLowerCase() !== value.trim().toLowerCase()) {
      selectedCountry = null;
    }
  }

  async function addHint(): Promise<void> {
    const distance = Number.parseInt(distanceInput, 10);
    const proximityValue = proximityInput ? Number.parseInt(proximityInput, 10) : undefined;
    const candidate = selectedCountry;

    if (!candidate) {
      errorMessage = 'Select a country from the list before adding the hint.';
      return;
    }

    if (!Number.isFinite(distance) || distance <= 0) {
      errorMessage = 'Enter a valid distance in kilometers.';
      return;
    }

    if (hints.some((hint) => hint.country.code === candidate.code)) {
      errorMessage = 'That country is already in your hint list.';
      return;
    }

    hints = [
      ...hints,
      {
        country: candidate,
        distance,
        direction,
        proximity: Number.isFinite(proximityValue) ? proximityValue : undefined,
      },
    ];

    searchQuery = '';
    selectedCountry = null;
    distanceInput = '';
    direction = 'N';
    proximityInput = '';
    errorMessage = '';
    recomputeResults();
    await tick();
    resultsPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function removeHint(index: number): void {
    hints = hints.filter((_, hintIndex) => hintIndex !== index);
    errorMessage = '';
    recomputeResults();
  }

  function clearSolver(): void {
    hints = [];
    results = [];
    searchQuery = '';
    selectedCountry = null;
    distanceInput = '';
    direction = 'N';
    proximityInput = '';
    errorMessage = '';
  }

  function recomputeResults(): void {
    results = solveWorldle(countries, hints, 24);
  }
</script>

<div class="space-y-10">
  <section class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div class="bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-6 text-white sm:p-8">
        <p class="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
          Client-side Worldle helper
        </p>
        <h2 class="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Find the country from Worldle clues</h2>
        <p class="mt-4 max-w-xl text-base leading-7 text-sky-50/90 sm:text-lg">
          Add the countries you guessed in Worldle, then match the game&apos;s distance and compass clues. The solver filters the full country list directly in your browser and ranks the most likely answers.
        </p>

        <div class="mt-8 rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
          <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100">How to use it</h3>
          <ol class="mt-4 space-y-3 text-sm leading-6 text-sky-50/90">
            <li>1. Search for the country you guessed in Worldle.</li>
            <li>2. Enter the distance shown by the game in kilometers.</li>
            <li>3. Pick the arrow direction from your guess to the answer.</li>
            <li>4. Add more hints until the result list narrows to one country.</li>
          </ol>
        </div>
      </div>

      <div bind:this={formPanel} class="p-6 sm:p-8">
        <div class="grid gap-5">
          <div>
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200" for="worldle-country-search">Country</label>
            <div class="relative mt-2">
              <input
                class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-900/30"
                id="worldle-country-search"
                oninput={handleSearchInput}
                placeholder="Start typing a country name"
                value={searchQuery}
              />

              {#if suggestions.length > 0}
                <div class="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  {#each suggestions as country}
                    <button
                      class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 dark:text-slate-200 dark:hover:bg-sky-900/20 dark:hover:text-sky-200"
                      onclick={() => selectCountry(country)}
                      type="button"
                    >
                      <span class="text-lg leading-none">{getFlagEmoji(country.code)}</span>
                      <span class="font-medium">{country.name}</span>
                      <span class="ml-auto text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{country.code}</span>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-200" for="worldle-distance">Distance (km)</label>
              <input
                bind:value={distanceInput}
                bind:this={distanceInputElement}
                class="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-900/30"
                id="worldle-distance"
                inputmode="numeric"
                min="1"
                placeholder="e.g. 1383"
                type="number"
              />
            </div>

            <div>
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-200" for="worldle-direction">Direction</label>
              <select
                bind:value={direction}
                class="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-900/30"
                id="worldle-direction"
              >
                {#each WORLDLE_DIRECTIONS as option}
                  <option value={option}>{getDirectionEmoji(option)} {option}</option>
                {/each}
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200" for="worldle-proximity">Proximity (optional)</label>
            <input
              bind:value={proximityInput}
              class="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-900/30"
              id="worldle-proximity"
              inputmode="numeric"
              max="100"
              min="0"
              placeholder="Optional percentage from Worldle"
              type="number"
            />
          </div>

          {#if errorMessage}
            <div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              {errorMessage}
            </div>
          {/if}

          <div class="flex flex-wrap gap-3">
            <button
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
              disabled={!countriesLoaded}
              onclick={addHint}
              type="button"
            >
              Add hint
            </button>
            <button
              class="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
              onclick={clearSolver}
              type="button"
            >
              Reset
            </button>
          </div>

          <p class="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {#if countriesLoaded}
              The solver is ready with {countries.length} countries.
            {:else}
              Loading country data for the solver...
            {/if}
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
    <div bind:this={resultsPanel} class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Active hints</p>
          <h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{hints.length} clue{hints.length === 1 ? '' : 's'}</h3>
        </div>
        {#if hints.length > 0}
          <button
            class="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
            onclick={clearSolver}
            type="button"
          >
            Clear all
          </button>
        {/if}
      </div>

      {#if hints.length === 0}
        <div class="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
          Add your first Worldle clue to start filtering countries.
        </div>
      {:else}
        <div class="mt-6 space-y-3">
          {#each hints as hint, index}
            <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
              <span class="text-2xl leading-none">{getFlagEmoji(hint.country.code)}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{hint.country.name}</p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatDistance(hint.distance)} | {getDirectionEmoji(hint.direction)} {hint.direction}
                  {#if typeof hint.proximity === 'number'}
                    | {hint.proximity}%
                  {/if}
                </p>
              </div>
              <button
                class="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                onclick={() => removeHint(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Possible answers</p>
          <h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{results.length} matches</h3>
        </div>
        <a
          class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-sky-600 dark:hover:bg-sky-500"
          href="/worldle-answer-today"
        >
          Open today&apos;s answer
        </a>
      </div>

      {#if hints.length === 0}
        <div class="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
          Results appear here after you add at least one hint.
        </div>
      {:else if results.length === 0}
        <div class="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-8 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          No countries match the current combination closely enough. Double-check the direction arrow and exact distance shown by Worldle.
        </div>
      {:else}
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          {#each results as result, index}
            <article class="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-sky-500 dark:hover:bg-slate-900">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <span class="text-2xl leading-none">{getFlagEmoji(result.country.code)}</span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{result.country.name}</p>
                  <p class="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{result.country.code}</p>
                </div>
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Match score</span>
                  <span>{result.matchScore.toFixed(0)}%</span>
                </div>
                <div class="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    class="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                    style={`width: ${Math.max(4, Math.min(100, result.matchScore))}%`}
                  ></div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div class="rounded-2xl bg-white px-3 py-3 dark:bg-slate-800">
                  <p class="font-semibold uppercase tracking-[0.14em]">Avg distance</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDistance(Math.round(result.averageDistance))}
                  </p>
                </div>
                <div class="rounded-2xl bg-white px-3 py-3 dark:bg-slate-800">
                  <p class="font-semibold uppercase tracking-[0.14em]">Est. heat</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {calculateProximity(Math.round(result.averageDistance))}%
                  </p>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </div>
  </section>

</div>
