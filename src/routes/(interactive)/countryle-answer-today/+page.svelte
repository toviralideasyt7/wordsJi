<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import AnswerArticle from '$lib/components/AnswerArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import KeepExploring from '$lib/components/KeepExploring.svelte';
  import UpdatedStamp from '$lib/components/UpdatedStamp.svelte';
  import AIHintCards from '$lib/components/AIHintCards.svelte';
  import FactBlock from '$lib/components/FactBlock.svelte';
  import YesterdayBlock from '$lib/components/YesterdayBlock.svelte';
  import PaaHints from '$lib/components/PaaHints.svelte';
  import { formatPopulation, formatTemperature } from '$lib/countryle';
  import { getMainDailyDateKey } from '$lib/main-daily-date';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();
  const todayKey = getMainDailyDateKey();
  const publishedDate = $derived(
    data.today ? `${data.today.date}T00:00:00Z` : `${todayKey}T00:00:00Z`
  );

  function formatEntryDate(dateKey: string) {
    return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  const continentEmoji: Record<string, string> = {
    Africa: '\u{1F30D}',
    Europe: '\u{1F30D}',
    Asia: '\u{1F30F}',
    Oceania: '\u{1F30F}',
    'North America': '\u{1F30E}',
    'South America': '\u{1F30E}',
    Antarctica: '\u{2744}\u{FE0F}'
  };

  const countryName = $derived(data.today?.country.country ?? '');
  const factLetters = $derived(countryName.toLowerCase().replace(/[^a-z]/g, ''));
  const factFirstLetter = $derived((factLetters[0] ?? '').toUpperCase());
  const factLastLetter = $derived((factLetters[factLetters.length - 1] ?? '').toUpperCase());
  const factVowelCount = $derived([...factLetters].filter((c) => 'aeiou'.includes(c)).length);
  const factRepeatCount = $derived(factLetters.length - new Set(factLetters).size);
  const factRepeatText = $derived(
    factRepeatCount === 0 ? 'None' : `${factRepeatCount} repeated letter${factRepeatCount === 1 ? '' : 's'}`
  );
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <link rel="canonical" href={data.meta.canonical} />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:url" content={data.meta.canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content={`https://wordsolverx.com${data.meta.featuredImage}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content={`https://wordsolverx.com${data.meta.featuredImage}`} />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES) ?? data.schemas}</script>`}
  {#if data.faqSchemaJson}
    {@html `<script type="application/ld+json">${data.faqSchemaJson}</script>`}
  {/if}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Countryle" answer={data.today?.country.country ?? null} />

<div class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <Breadcrumbs hideSchema={true} />

    {#if data.today}
      <!-- Hero -->
      <section class="mt-6 rounded-[2rem] border border-teal-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.08)] sm:p-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-teal-600">Daily Geography Puzzle</p>
            <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Countryle Answer Today ({data.formattedDate})
            </h1>
            <p class="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Game #{data.today.gameNumber}. Guess the mystery country using geography clues like continent, hemisphere, population, and temperature. Today's verified answer and stats are below.
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-3">
            <a href="/countryle-solver" class="inline-flex items-center rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-xl">Open Solver</a>
            <a href="/countryle-archive" class="inline-flex items-center rounded-full border border-teal-200 bg-white px-6 py-3 text-sm font-bold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50">Browse Archive</a>
          </div>
        </div>
      </section>

      <div class="mt-6 flex justify-center">
        <UpdatedStamp stamp={data.updatedStamp} />
      </div>

      <div class="mt-6">
        <AIHintCards gameName="Countryle" answer={data.today.country.country} hints={data.aiHints} />
      </div>

      <!-- Answer Card -->
      <section class="mt-8 rounded-[2rem] border border-teal-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.06)] sm:p-10">
        <h2 class="text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Today's Country</h2>
        <p class="mt-2 text-center text-sm text-slate-500">Game #{data.today.gameNumber} &middot; {data.formattedDate}</p>

        <details class="countryle-answer-details mx-auto mt-8 max-w-3xl">
          <summary class="list-none">
            <div class="group relative rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 px-12 py-8 text-center transition hover:border-teal-400 hover:bg-teal-50">
              <div class="flex flex-col items-center gap-3">
                <svg class="h-10 w-10 text-teal-400 transition group-hover:text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span class="countryle-answer-label text-sm font-bold text-teal-700">Click to Reveal Answer</span>
                <div class="countryle-answer-reveal flex flex-col items-center gap-2">
                  <span class="text-4xl">{continentEmoji[data.today.country.continent] ?? '\u{1F30D}'}</span>
                  <h3 class="text-4xl font-black tracking-tight text-teal-700 sm:text-5xl countryle-answer-word">{data.today.country.country}</h3>
                  <p class="mt-1 rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-700">{data.today.country.continent} &middot; {data.today.country.hemisphere}</p>
                </div>
              </div>
            </div>
          </summary>

          <div class="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-5 text-center">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Continent</p>
              <p class="mt-2 text-lg font-bold text-slate-900">{data.today.country.continent}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-5 text-center">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Hemisphere</p>
              <p class="mt-2 text-lg font-bold text-slate-900">{data.today.country.hemisphere}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-5 text-center">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Population</p>
              <p class="mt-2 text-lg font-bold text-slate-900">{formatPopulation(data.today.country.population)}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-5 text-center">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Surface Area</p>
              <p class="mt-2 text-lg font-bold text-slate-900">{data.today.country.surface.toLocaleString()} km&sup2;</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-5 text-center">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Avg. Temp</p>
              <p class="mt-2 text-lg font-bold text-slate-900">{formatTemperature(data.today.country.avgTemperature)}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-5 text-center">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Coordinates</p>
              <p class="mt-2 text-sm font-bold text-slate-900">{data.today.country.coordinates}</p>
            </div>
          </div>

          {#if data.today.country.mapsUrl}
            <div class="mt-6 text-center">
              <a href={data.today.country.mapsUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-5 py-2.5 text-sm font-bold text-teal-700 transition hover:bg-teal-100">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                View on Google Maps
              </a>
            </div>
          {/if}
        </details>
      </section>

      {#if data.yesterday}
        <div class="mt-8">
          <YesterdayBlock
            gameName="Countryle"
            puzzleNumber={String(data.yesterday.number)}
            dateLong={data.yesterday.dateLong}
            answer={data.yesterday.answer}
          />
        </div>
      {/if}

      <div class="mt-8">
        <FactBlock
          gameName="Countryle"
          puzzleNumber={String(data.today.gameNumber)}
          dateLong={data.formattedDate}
          firstLetter={factFirstLetter}
          lastLetter={factLastLetter}
          vowelCount={factVowelCount}
          repeatText={factRepeatText}
        />
      </div>

      <div class="mt-8">
        <PaaHints gameName="Countryle" hints={data.aiHints} />
      </div>

      <KeepExploring slug="countryle" puzzleDate={data.today?.date} />

      <!-- Recent Answers -->
      <section class="mt-8 rounded-[2rem] border border-teal-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.06)] sm:p-10">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-2xl font-black tracking-tight text-slate-900">Recent Countryle Answers</h2>
          <a href="/countryle-archive" class="text-sm font-bold text-teal-600 hover:text-teal-500">Full archive &rarr;</a>
        </div>

        <div class="mt-6 divide-y divide-slate-100">
          {#each data.recentEntries as entry}
            <a href="/countryle-archive" class="group flex items-center justify-between gap-4 py-4 transition first:pt-0 last:pb-0 hover:bg-teal-50/40 -mx-3 px-3 rounded-xl">
              <div class="flex items-center gap-4">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-700">
                  #{entry.gameNumber}
                </span>
                <div>
                  <p class="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{entry.country.country}</p>
                  <p class="text-sm text-slate-500">{formatEntryDate(entry.date)}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">{entry.country.continent}</span>
                <span class="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">{entry.country.hemisphere}</span>
                <svg class="h-4 w-4 text-slate-300 transition group-hover:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
            </a>
          {/each}
        </div>
      </section>

      <!-- How It Works -->
      <section class="mt-8 rounded-[2rem] border border-teal-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.06)] sm:p-10">
        <h2 class="text-center text-2xl font-black tracking-tight text-slate-900">How Countryle Works</h2>
        <div class="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-3">
          <div class="rounded-2xl bg-teal-50/60 p-6 text-center">
            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-teal-700">1</div>
            <h3 class="mt-4 text-base font-bold text-slate-900">Guess a country</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">Type any country name as your first guess and submit it.</p>
          </div>
          <div class="rounded-2xl bg-teal-50/60 p-6 text-center">
            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-teal-700">2</div>
            <h3 class="mt-4 text-base font-bold text-slate-900">Read the clues</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">Compare continent, hemisphere, population, temperature, and surface area with arrow hints.</p>
          </div>
          <div class="rounded-2xl bg-teal-50/60 p-6 text-center">
            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-teal-700">3</div>
            <h3 class="mt-4 text-base font-bold text-slate-900">Narrow it down</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">Each guess reveals more info. Find the target country in as few guesses as possible.</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mt-8 rounded-[2rem] border border-teal-100 bg-white p-8 shadow-[0_20px_60px_rgba(16,185,129,0.06)] sm:p-10">
        <h2 class="text-center text-2xl font-black tracking-tight text-slate-900">Frequently Asked Questions</h2>
        <div class="mx-auto mt-8 max-w-3xl divide-y divide-slate-100">
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              What is the Countryle answer for {data.formattedDate}?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">The Countryle answer for {data.formattedDate} is <strong>{data.today.country.country}</strong>, located in {data.today.country.continent} ({data.today.country.hemisphere} hemisphere). Click "Reveal Answer" above to see the full country details including population, surface area, and coordinates.</p>
          </details>
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              How does Countryle work?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">Countryle is a daily geography guessing game. Each day a mystery country is picked and you guess countries to receive clues about continent, hemisphere, population, temperature, surface area, and proximity. The goal is to identify the country in as few guesses as possible.</p>
          </details>
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              Can I see older Countryle answers?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">Yes. Use the <a href="/countryle-archive" class="font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-500">Countryle archive</a> to look up previous dates and countries from the complete answer archive.</p>
          </details>
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              Is this page updated daily?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">Yes. This page is updated automatically every day with the latest Countryle answer. The answer is checked against the official Countryle answer list.</p>
          </details>
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              How many guesses do I get in Countryle?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">Countryle does not enforce a strict guess limit, so you can keep guessing until you find the answer. However, the game tracks how many guesses you used, and solving it in three or fewer guesses is considered excellent. Most experienced players consistently get the answer in four to six guesses by using the continent, temperature, and population clues to narrow the field efficiently.</p>
          </details>
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              Does Countryle pick small or obscure countries?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">Yes, occasionally. The game pulls from all 195 recognized countries, which means microstates like Liechtenstein, Brunei, and Suriname do appear. If your first few guesses with large countries keep returning downward population and surface area arrows, consider that the answer might be a small island nation or a lesser-known territory. Having a mental list of small countries by continent helps on those harder puzzle days.</p>
          </details>
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              How is Countryle different from Worldle?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">Worldle shows you a country silhouette and you guess based on shape recognition. Countryle takes a data-driven approach instead — it gives you quantitative clues like population, surface area, average temperature, and hemisphere. Worldle tests visual geography memory, while Countryle tests statistical and comparative reasoning. Both are daily games, but they appeal to different types of geography knowledge.</p>
          </details>
          <details class="group py-5 first:pt-0 last:pb-0">
            <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
              When was this page last updated?
              <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">{data.updatedStamp}</p>
          </details>
        </div>
      </section>
    {/if}

    <article class="mt-8 space-y-8">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">What is Countryle?</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Countryle is a daily geography guessing game where a mystery country is selected each day and you try to identify it using directional clues and comparative data. You type a country name, and the game tells you how close your guess is by showing the distance in kilometers, the compass direction, and a proximity percentage.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          It follows the same one-puzzle-per-day format that made Wordle famous, but replaces word deduction with geographic reasoning.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The game was inspired directly by Worldle — the silhouette-based country guessing game that launched in early 2022. Countryle takes a different approach. Instead of showing you a country outline, it gives you quantitative clues: continent, hemisphere, average temperature, population, and surface area.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Each clue comes with an up or down arrow indicating whether the target country is higher or lower than your guess. That combination of data points makes it possible to narrow down the answer logically, even if you do not recognize the country by sight.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Geography enthusiasts picked up the game quickly, and it has maintained a dedicated following of roughly 50,000 daily players. The audience skews toward people who enjoy maps, travel trivia, and country comparison data — a slightly different demographic than the word-game crowd, though there is significant overlap.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">How Countryle Works</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Each day, Countryle picks one country from its database of approximately 195 recognized nations. The puzzle resets at midnight in the game&apos;s local timezone, and each puzzle is assigned a sequential game number.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The game presents you with a text input field — no map, no image, just a blank box waiting for a country name.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          When you submit a guess, the game returns a row of data comparing your guess to the target.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The comparison includes: the continent (matching or not), the hemisphere (northern, southern, or both), the population with an arrow showing whether the target is larger or smaller, the average temperature with a directional arrow, the surface area in square kilometers, and a distance/proximity percentage indicating how close geographically your guess was to the target.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The population and surface area clues are particularly powerful. If you guess India (population 1.4 billion) and the arrow points down, you know the target has fewer people — but it could still be a large country like the United States or Brazil.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Combine that with the temperature arrow and the continent filter, and you can usually narrow the field to five or six candidates within two or three guesses.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          There is no hard guess limit, but the game tracks how many guesses you used. Getting the answer in three guesses or fewer is considered excellent. Most players solve it in four to six guesses with practice.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Strategy Tips for Countryle</h2>
        <div class="mt-6 space-y-6">
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Start with a large country from a central continent</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Your first guess should be a country you know well from a continent that splits the world roughly in half. Brazil, the United States, or Russia are good openers because they are large enough that the population and area arrows will be informative regardless of whether the target is bigger or smaller.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          If you guess Brazil and the arrow points down on population, the target has fewer than 215 million people — which eliminates about 50 countries immediately.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Prioritize the continent clue</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
              The continent filter is binary and eliminates roughly 80% of possible answers in one guess. If your first guess is in Africa and the target continent is different, you have just cut the search space from 195 countries to about 40. Always make the continent your first narrowing criterion.
            </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Use temperature to distinguish latitude</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Average temperature correlates strongly with distance from the equator. If the temperature clue shows 25°C or higher, you are probably looking at a tropical or equatorial country. If it shows 5°C or lower, the target is likely in northern Europe, Canada, or the southern tip of South America.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          This helps narrow latitude when the continent clue alone is not enough.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Cross-reference population and area</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
              Countries with high population density (like Bangladesh or South Korea) will show relatively small surface areas combined with large populations. Countries with low density (like Mongolia or Namibia) will show the opposite pattern. This density signal helps distinguish between otherwise similar countries.
            </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Think about small countries deliberately</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
              The game occasionally picks very small countries — Liechtenstein, Brunei, Suriname. If your large-country guesses keep showing population arrows pointing down aggressively, consider that the target might be a microstate or small island nation. Have a mental list of small countries by continent to fall back on.
            </p>
          </div>
        </div>
      </section>

    </article>
    <div class="mt-8">
      <AnswerArticle content={ARTICLE_CONTENT['countryle-answer-today']} vars={{ date: data.formattedDate, answer: data.today?.country.country ?? '' }}
        verified={publishedDate}
      />


      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>

    <div class="mt-8">
      <InternalLinkSection currentGame="Countryle" />
    </div>
  </div>
</div>

<style>
  .countryle-answer-details > summary {
    cursor: pointer;
  }

  .countryle-answer-details > summary::-webkit-details-marker {
    display: none;
  }

  .countryle-answer-word {
    filter: blur(14px);
    transition: filter 0.3s ease;
    user-select: none;
  }

  .countryle-answer-details .countryle-answer-reveal {
    display: none;
  }

  .countryle-answer-details[open] .countryle-answer-label {
    display: none;
  }

  .countryle-answer-details[open] .countryle-answer-reveal {
    display: flex;
  }

  .countryle-answer-details[open] .countryle-answer-word {
    filter: none;
    user-select: auto;
  }

  .countryle-answer-details[open] > summary > div {
    border-style: solid;
    background: rgba(236, 253, 245, 0.95);
  }
</style>

