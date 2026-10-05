<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import KeepExploring from '$lib/components/KeepExploring.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();

  let revealed = $state(false);

  const socialImage = $derived(data.meta?.socialImage ?? 'https://wordsolverx.com/wordsolverx.webp');
  const cleanedSchemas = $derived(
    data.schemas ? stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES) : null
  );
  const player = $derived(data.entry?.player ?? null);
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <meta name="news_keywords" content="batter up, batter up answer, batter up today, mlb guessing game" />
  <meta name="robots" content="index, follow, max-snippet:-1" />
  <link rel="canonical" href="https://wordsolverx.com/batterup-answer-today" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/batterup-answer-today" />
  <meta property="og:image" content={socialImage} />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content={socialImage} />
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.meta.title,
    description: data.meta.description,
    url: 'https://wordsolverx.com/batterup-answer-today',
    image: socialImage,
    dateModified: data.visibleDateKey
  })}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={data.publishedDate} />
<AnswerPageNoscript gameName="Batter Up" answer={player?.player_name?.toUpperCase() ?? null} />

{#if data.error || !data.entry}
  <!-- Staleness state (Canuckle pattern): the payload date did not match the
       expected window date, so we show "updating" instead of a wrong answer. -->
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
        <svg class="h-7 w-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="text-sm font-semibold uppercase tracking-widest text-teal-600">Batter Up</p>
      <h1 class="mt-2 text-2xl font-bold text-slate-900">Today's answer is updating</h1>
      <p class="mt-3 text-slate-500">
        The Batter Up puzzle for {data.formattedDate} hasn't landed in our data feed yet. New games publish shortly after midnight UTC — check back in a few minutes, or browse the archive and solver while you wait.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="/batterup-archive" class="inline-flex items-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition-colors">
          Browse Archive
        </a>
        <a href="/batterup-solver" class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
          Open Solver
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-100 font-sans">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs hideSchema={true} />

      <!-- Hero -->
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-700 via-blue-800 to-slate-900 p-8 sm:p-10 shadow-xl mt-6">
        <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5"></div>
        <div class="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-400/10"></div>
        <div class="relative z-10">
          <div class="flex flex-wrap items-center gap-2.5 mb-3">
            <span class="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              Game #{data.entry.gameNumber}
            </span>
            <span class="inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-sm">
              {data.formattedDate}
            </span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight">Batter Up Answer Today ({data.formattedDate})</h1>
          <p class="mt-3 max-w-2xl text-base sm:text-lg text-sky-100/80 leading-relaxed">
            Hints, the full player card, and the verified solution for today's MLB guessing game. Guess the batter from six attribute columns: jersey number, team, division, birthplace, age, and position.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a href="/batterup-solver" class="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-sky-800 shadow-md hover:bg-sky-50 transition-all hover:shadow-lg">
              Open Solver
            </a>
            <a href="/batterup-archive" class="inline-flex items-center rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
              Browse Archive
            </a>
          </div>
        </div>
      </section>

      <!-- Hints -->
      <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-5">Hints for today's Batter Up</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Position</p>
            <p class="mt-1 text-lg font-bold text-slate-900">Plays {data.hints.position}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Team</p>
            <p class="mt-1 text-lg font-bold text-slate-900">{data.hints.team} · {data.hints.league}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Age</p>
            <p class="mt-1 text-lg font-bold text-slate-900">{data.hints.age} years old, born in {data.hints.born}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Jersey</p>
            <p class="mt-1 text-lg font-bold text-slate-900">Number in {data.hints.jerseyTens}</p>
          </div>
        </div>
        <p class="mt-5 text-sm text-slate-500 leading-relaxed">
          In the real game, jersey and division give you "close" feedback: same tens digit on the number, or same league but a different division. Team and birthplace are all-or-nothing — they never score yellow.
        </p>
      </section>

      <!-- Reveal -->
      <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-5">Today's answer</h2>
        {#if !revealed}
          <button
            onclick={() => (revealed = true)}
            class="w-full rounded-xl bg-sky-700 px-6 py-4 text-base font-semibold text-white shadow hover:bg-sky-800 transition-colors"
            aria-label="Reveal today's Batter Up answer"
          >
            Reveal the answer
          </button>
          <p class="mt-3 text-center text-sm text-slate-500">No peeking — solve it first if you want the streak.</p>
        {:else}
          <div class="rounded-xl border-2 border-sky-200 bg-sky-50/60 p-6">
            <p class="text-xs font-semibold uppercase tracking-wider text-sky-700">Batter Up #{data.entry.gameNumber} · {data.formattedDate}</p>
            <p class="mt-2 text-3xl font-extrabold text-slate-900">{player.player_name}</p>
            <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div class="rounded-lg bg-white p-3 border border-slate-100"><p class="text-xs text-slate-500 uppercase tracking-wider">Team</p><p class="font-bold text-slate-900">{player.team_name}</p></div>
              <div class="rounded-lg bg-white p-3 border border-slate-100"><p class="text-xs text-slate-500 uppercase tracking-wider">Position</p><p class="font-bold text-slate-900">{player.position.join(', ')}</p></div>
              <div class="rounded-lg bg-white p-3 border border-slate-100"><p class="text-xs text-slate-500 uppercase tracking-wider">Jersey</p><p class="font-bold text-slate-900">#{player.jersey_number ?? '—'}</p></div>
              <div class="rounded-lg bg-white p-3 border border-slate-100"><p class="text-xs text-slate-500 uppercase tracking-wider">Age</p><p class="font-bold text-slate-900">{data.hints.age}</p></div>
              <div class="rounded-lg bg-white p-3 border border-slate-100"><p class="text-xs text-slate-500 uppercase tracking-wider">Born</p><p class="font-bold text-slate-900">{player.born}</p></div>
              <div class="rounded-lg bg-white p-3 border border-slate-100"><p class="text-xs text-slate-500 uppercase tracking-wider">MLB debut</p><p class="font-bold text-slate-900">{player.debut}</p></div>
            </div>
            {#if data.entry.rawVideo}
              <p class="mt-4 text-sm text-slate-600">
                <a href={data.entry.rawVideo} class="text-sky-700 hover:text-sky-800 font-medium underline" rel="external nofollow">Watch the reveal video on MLB.com</a>
                <span class="text-slate-400"> (external)</span>
              </p>
            {/if}
          </div>
        {/if}
      </section>

      <KeepExploring slug="batterup" puzzleDate={data.visibleDateKey} />

      <!-- How the six columns work -->
      <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-5">How the six feedback columns work</h2>
        <div class="space-y-4 text-slate-600 leading-relaxed">
          <p><strong class="text-slate-900">Jersey number</strong> is the gentlest column: exact number goes green, matching tens digit goes yellow. A white result still tells you a lot — it rules out an entire tens band.</p>
          <p><strong class="text-slate-900">Team</strong> is all or nothing. There is no yellow here, so a white team result is one of the strongest eliminations on the board.</p>
          <p><strong class="text-slate-900">Division</strong> sits between the two: exact division is green, same league is yellow. American and National League rosters are different sizes, so the yellow result narrows things more than it feels like.</p>
          <p><strong class="text-slate-900">Birthplace</strong> is the other all-or-nothing column. Most of the pool was born in the USA or the Dominican Republic, so an exact hit here barely moves the needle — a miss is the useful result.</p>
          <p><strong class="text-slate-900">Age</strong> scores within two years as yellow. Players debut across a wide age range, which makes this column noisier than the number suggests.</p>
          <p><strong class="text-slate-900">Position</strong> groups infielders (1B, 2B, 3B, SS) and outfielders (LF, CF, RF); same group is yellow. Catchers and designated hitters belong to no group, so they only ever read green or white.</p>
        </div>
      </section>

      {#if data.yesterday}
        <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 class="text-2xl font-bold text-slate-900 mb-5">Yesterday's Batter Up answer</h2>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-widest text-sky-700">Batter Up #{data.yesterday.gameNumber} · {data.yesterday.date}</p>
            <p class="mt-1 text-xl font-extrabold text-slate-900">{data.yesterday.player.player_name}</p>
            <p class="mt-1 text-sm text-slate-600">{data.yesterday.player.team_name} · {data.yesterday.player.position.join(', ')}</p>
          </div>
        </section>
      {/if}

      {#if data.recent.length > 1}
        <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 class="text-2xl font-bold text-slate-900 mb-5">Recent Batter Up answers</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Game</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Player</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Team</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each data.recent as r}
                  <tr class="hover:bg-gray-50 {r.date === data.entry.date ? 'bg-sky-50/50' : ''}">
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">#{r.gameNumber}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.date}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{r.player.player_name}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.player.team_name}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="mt-4">
            <a href="/batterup-archive" class="text-sky-700 hover:text-sky-800 font-medium underline">See the full Batter Up archive</a>
          </p>
        </section>
      {/if}

      <div class="mt-8">
        <FAQSection faqs={data.hintFaqs} />
      </div>

      <div class="mt-8">
        <AuthorCard
          name={PRESTON_HAYES_AUTHOR_NAME}
          image={PRESTON_HAYES_AUTHOR_IMAGE}
          description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
        />
      </div>

      <div class="mt-12">
        <InternalLinkSection currentGame="Batter Up" />
      </div>
    </div>
  </div>
{/if}
