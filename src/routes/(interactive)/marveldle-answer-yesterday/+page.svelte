<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();

  const cleanedSchemas = $derived(
    data.schemas ? stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES) : null
  );
  const comics = $derived(data.entry?.comics ?? null);
  const mcu = $derived(data.entry?.mcu ?? null);
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <link rel="canonical" href="https://wordsolverx.com/marveldle-answer-yesterday" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/marveldle-answer-yesterday" />
  <meta property="og:image" content={data.meta.socialImage} />
  <meta property="og:site_name" content="WordSolverX" />
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
</svelte:head>

<div class="min-h-screen bg-slate-50/60">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <Breadcrumbs hideSchema={true} />

    {#if data.error || !data.entry}
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p class="text-sm font-semibold uppercase tracking-widest text-red-600">Marveldle</p>
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Yesterday's answers aren't available</h1>
        <p class="mt-3 text-slate-500">We don't have a verified entry for {data.formattedDate} yet. Check today's answers or browse the archive.</p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/marveldle-answer-today" class="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors">Today's Answers</a>
          <a href="/marveldle-archive" class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">Browse Archive</a>
        </div>
      </div>
    {:else}
      <h1 class="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Marveldle Answer Yesterday ({data.formattedDate})</h1>
      <p class="mt-3 text-lg text-slate-600 leading-relaxed max-w-3xl">
        Missed a day? Here are the verified Marveldle characters for {data.formattedDate}. <a href="/marveldle-answer-today" class="text-red-700 hover:text-red-800 font-medium underline">See today's answers</a>.
      </p>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section class="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <p class="text-xs font-semibold uppercase tracking-widest text-red-600">Comics mode</p>
          <p class="mt-2 text-3xl font-extrabold text-slate-900">{comics.name}</p>
          <div class="mt-4 space-y-1.5 text-sm text-slate-600">
            <p><span class="font-semibold text-slate-900">Gender:</span> {comics.gender}</p>
            <p><span class="font-semibold text-slate-900">Type:</span> {comics.type}</p>
            <p><span class="font-semibold text-slate-900">Species:</span> {(comics.species ?? []).join(', ')}</p>
            <p><span class="font-semibold text-slate-900">Powers:</span> {(comics.powerTypes ?? []).join(', ')}</p>
            <p><span class="font-semibold text-slate-900">Origin:</span> {comics.origin}</p>
            <p><span class="font-semibold text-slate-900">First appeared:</span> {comics.apparitionYear ?? '—'}{comics.firstApparitionComicTitle ? ` (${comics.firstApparitionComicTitle})` : ''}</p>
          </div>
        </section>
        <section class="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <p class="text-xs font-semibold uppercase tracking-widest text-indigo-600">MCU mode</p>
          <p class="mt-2 text-3xl font-extrabold text-slate-900">{mcu.name}</p>
          <div class="mt-4 space-y-1.5 text-sm text-slate-600">
            <p><span class="font-semibold text-slate-900">Gender:</span> {mcu.gender}</p>
            <p><span class="font-semibold text-slate-900">Type:</span> {mcu.type}</p>
            <p><span class="font-semibold text-slate-900">Species:</span> {(mcu.species ?? []).join(', ')}</p>
            <p><span class="font-semibold text-slate-900">Powers:</span> {(mcu.powerTypes ?? []).join(', ')}</p>
            <p><span class="font-semibold text-slate-900">Origin:</span> {mcu.origin}</p>
            <p><span class="font-semibold text-slate-900">Played by:</span> {mcu.actorName ?? '—'}</p>
            <p><span class="font-semibold text-slate-900">Appears in:</span> {(mcu.appearanceTypes ?? []).join(' / ')}</p>
            <p><span class="font-semibold text-slate-900">Teams:</span> {(mcu.affiliations ?? []).join(', ')}</p>
          </div>
        </section>
      </div>
    {/if}

    <div class="mt-12">
      <InternalLinkSection currentGame="Marveldle" />
    </div>
  </div>
</div>
