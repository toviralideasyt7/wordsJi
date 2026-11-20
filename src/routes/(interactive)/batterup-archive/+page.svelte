<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();

  let query = $state('');
  const filtered = $derived(
    query.trim()
      ? data.entries.filter((e) =>
          `${e.name} ${e.team} ${e.division} ${e.position} ${e.gameNumber}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
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
  <link rel="canonical" href="https://wordsolverx.com/batterup-archive" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/batterup-archive" />
  <meta property="og:image" content={data.meta.socialImage} />
  <meta property="og:site_name" content="WordSolverX" />
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
</svelte:head>

<div class="min-h-screen bg-slate-50/60">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <Breadcrumbs hideSchema={true} />

    <h1 class="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Batter Up Archive</h1>
    <p class="mt-3 text-lg text-slate-600 leading-relaxed max-w-3xl">
      Every verified Batter Up answer, newest first — {data.count} games and counting. Search by player, team, division or game number. Looking for today? <a href="/batterup-answer-today" class="text-sky-700 hover:text-sky-800 font-medium underline">See today's answer</a>.
    </p>

    <div class="mt-6">
      <label for="archive-search" class="sr-only">Search the archive</label>
      <input
        id="archive-search"
        type="search"
        bind:value={query}
        placeholder="Search player, team, division or game number…"
        class="w-full max-w-xl rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
      />
    </div>

    <div class="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Game</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Player</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Team</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pos</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filtered as e}
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">#{e.gameNumber}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{e.date}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{e.name}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{e.team}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{e.position}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{e.jersey ?? '—'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if filtered.length === 0}
        <p class="p-8 text-center text-slate-500">No answers match "{query}". Try a different player or team.</p>
      {/if}
    </div>
    <p class="mt-4 text-sm text-slate-500">Showing {filtered.length} of {data.count} games.</p>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">How this archive is organized</h2>
      <div class="space-y-3 text-slate-600 leading-relaxed">
        <p>One row per day, newest first. The game number is Batter Up's own numbering, and the date is the puzzle date — the day that answer was live in the game. A row is added only after the day's answer has been verified against the game's own daily data, which is why the newest row can lag a day the game itself had a late update: a missing row here means "not yet verified", never a skipped game.</p>
        <p>The columns mirror the tiles the game scores. <strong class="text-slate-800">Team</strong> is the club the player was recorded with for that game, <strong class="text-slate-800">Pos</strong> is his position group, and <strong class="text-slate-800">#</strong> is his jersey number. Players are traded and numbers change, so treat each row as a snapshot of that date, not a current roster entry.</p>
      </div>
    </section>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Ways to use the archive</h2>
      <div class="space-y-3 text-slate-600 leading-relaxed">
        <p><strong class="text-slate-800">Settle a past game.</strong> Missed a day, or arguing about who Tuesday's answer was? Search the player or the date and the row is the record.</p>
        <p><strong class="text-slate-800">Check for repeats.</strong> Search a player's name to see every time he has been the answer. If a name appears once, it has been used once — useful before you burn a late guess on someone the game already spent.</p>
        <p><strong class="text-slate-800">Study the pool's shape.</strong> Scroll the position and team columns and the game's habits show: which positions come up most, which clubs the game favors, how often catchers or pitchers-who-bat appear. Tomorrow's opener is easier to pick when you know what the game tends to serve.</p>
        <p><strong class="text-slate-800">Rebuild a streak.</strong> If you play along in the <a href="/batterup-solver" class="text-sky-700 hover:text-sky-800 font-medium underline">solver</a>, the archive is the quickest way to confirm the answer a half-remembered board was pointing at.</p>
      </div>
    </section>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Batter Up archive FAQ</h2>
      <div class="space-y-3">
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">How often is the archive updated?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">After every daily game, once the answer is verified. On days when the game publishes late, the row follows as soon as verification catches up — the count at the top of this page always reflects the rows actually listed.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Is today's answer in the archive?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">Yes — once the day's answer is verified and published, it appears here as the newest row. For today's game the <a href="/batterup-answer-today" class="text-sky-700 hover:text-sky-800 font-medium underline">Batter Up answer page</a> is still the better read: it carries the full breakdown and hints, while this table is the running record.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Why is a jersey number blank?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">A dash means the game's source data carried no jersey number for that player on that date. The rest of the row — team, position, date — is unaffected.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">A player changed teams. Which team does the archive show?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">The team recorded for that specific game. The archive is a per-day record, so the same player can legitimately appear with different teams in different rows across a season.</p>
        </details>
      </div>
    </section>

    <div class="mt-12">
      <InternalLinkSection currentGame="Batter Up" />
    </div>
  </div>
</div>
