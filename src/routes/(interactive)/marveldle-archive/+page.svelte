<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();

  let query = $state('');
  const filtered = $derived(
    query.trim()
      ? data.entries.filter((e) =>
          `${e.comics} ${e.mcu} ${e.date}`.toLowerCase().includes(query.trim().toLowerCase())
        )
      : data.entries
  );
  const cleanedSchemas = $derived(
    stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES)
  );
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <link rel="canonical" href="https://wordsolverx.com/marveldle-archive" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/marveldle-archive" />
  <meta property="og:image" content={data.meta.socialImage} />
  <meta property="og:site_name" content="WordSolverX" />
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
</svelte:head>

<div class="min-h-screen bg-slate-50/60">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <Breadcrumbs hideSchema={true} />

    <h1 class="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Marveldle Archive</h1>
    <p class="mt-3 text-lg text-slate-600 leading-relaxed max-w-3xl">
      Every verified Marveldle pair, newest first — {data.count} days and counting. Search by character name or date. Looking for today? <a href="/marveldle-answer-today" class="text-red-700 hover:text-red-800 font-medium underline">See today's answers</a>.
    </p>

    <div class="mt-6">
      <label for="archive-search" class="sr-only">Search the archive</label>
      <input
        id="archive-search"
        type="search"
        bind:value={query}
        placeholder="Search character or date (e.g. 2026-09-24)…"
        class="w-full max-w-xl rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
      />
    </div>

    <div class="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Comics</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">MCU</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filtered as e}
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{e.date}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span class="font-semibold text-gray-900">{e.comics}</span>
                  {#if e.comicsType}<span class="text-gray-500"> · {e.comicsType}</span>{/if}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span class="font-semibold text-gray-900">{e.mcu}</span>
                  {#if e.mcuType}<span class="text-gray-500"> · {e.mcuType}</span>{/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if filtered.length === 0}
        <p class="p-8 text-center text-slate-500">No answers match "{query}". Try a different character or date.</p>
      {/if}
    </div>
    <p class="mt-4 text-sm text-slate-500">Showing {filtered.length} of {data.count} days.</p>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">How this archive is organized</h2>
      <div class="space-y-3 text-slate-600 leading-relaxed">
        <p>One row per day, newest first — and two answers in every row. Marveldle runs a Comics game and an MCU game side by side, each with its own character pool, so a date is only fully answered when both names are filled in. The label after each character is that answer's type (hero, villain, anti-hero and so on), the same type the game's own tiles score.</p>
        <p>A day's row is added once both answers have been verified against the game's daily picks. Because the two modes are picked independently, the same character can headline both columns on one day, appear in one mode several times across the archive, or show up in Comics long before the MCU ever uses them — the search box matches either column.</p>
      </div>
    </section>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Ways to use the archive</h2>
      <div class="space-y-3 text-slate-600 leading-relaxed">
        <p><strong class="text-slate-800">Settle a past day.</strong> Missed a game, or debating who last Thursday's MCU answer was? Search the character or the date and the row is the record — both modes at once.</p>
        <p><strong class="text-slate-800">Check for repeats before you guess.</strong> Search a character's name to see every day they have already been the answer in each mode. The pools are large, but the game does revisit favorites, and a name with three rows is a different bet from a name with none.</p>
        <p><strong class="text-slate-800">Read the type column for the game's habits.</strong> Scroll a month of rows and the mix shows itself: how often villains headline, how rarely anti-heroes appear, whether the MCU column leans on the current shows and films. That mix is the prior your first guess should respect.</p>
        <p><strong class="text-slate-800">Cross-check a solver board.</strong> If the <a href="/marveldle-solver" class="text-red-700 hover:text-red-800 font-medium underline">solver</a> narrows a past game to two or three names, the archive confirms which one the day actually used.</p>
      </div>
    </section>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Marveldle archive FAQ</h2>
      <div class="space-y-3">
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Why does each day have two answers?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">Because Marveldle is two daily games sharing a name: a Comics game drawn from the print universe and an MCU game drawn from the screen universe. They have separate pools and separate picks, so the archive records both, side by side.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Are today's answers in the archive?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">Yes — once both of today's picks are verified and published, they appear here as the newest row. For today's games, the <a href="/marveldle-answer-today" class="text-red-700 hover:text-red-800 font-medium underline">Marveldle answer page</a> carries the fuller breakdown for each mode.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">How often is the archive updated?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">After every daily game, once both modes' answers are verified. The count at the top of this page always matches the rows actually listed.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Can the same character be the answer twice?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">Yes, and the archive is where it shows. Search any character to see all of their appearances in each mode — repeats happen in both pools, which is exactly why checking here beats relying on memory.</p>
        </details>
      </div>
    </section>

    <div class="mt-12">
      <InternalLinkSection currentGame="Marveldle" />
    </div>
  </div>
</div>
