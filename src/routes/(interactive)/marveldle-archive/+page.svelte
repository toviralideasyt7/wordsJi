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

    <div class="mt-12">
      <InternalLinkSection currentGame="Marveldle" />
    </div>
  </div>
</div>
