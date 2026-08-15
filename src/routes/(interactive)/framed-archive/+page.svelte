<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FramedAnswerCard from '$lib/components/FramedAnswerCard.svelte';
  import type { FramedEntry, FramedGameConfig } from '$lib/framed';
import AuthorCard from '$lib/components/AuthorCard.svelte';
import StaticArticle from '$lib/components/StaticArticle.svelte';
import { ARTICLE_CONTENT } from '$lib/content/registry';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import { generateCollectionPageSchema, generateWebPageSchema } from '$lib/seo';

  type ArchiveEntry = FramedEntry & { game: FramedGameConfig };

  let { data: pageData } = $props<{
    data: {
      availableDates: string[];
      selectedDate: string;
      entries: ArchiveEntry[];
    };
  }>();

  const { availableDates, selectedDate: initialSelectedDate, entries: initialEntries } = (() => pageData)();
  let selectedDate = $state(initialSelectedDate);
  let entries = $state<ArchiveEntry[]>(initialEntries);
  let archiveLoading = $state(false);
  let archiveError = $state<string | null>(null);
  const formattedDate = $derived(
    selectedDate
      ? new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        })
      : ''
  );

  async function updateSelectedDate(date: string) {
    if (!date || date === selectedDate) return;
    selectedDate = date;
    archiveLoading = true;
    archiveError = null;

    try {
      const response = await fetch(`/api/framed/archive?date=${encodeURIComponent(date)}`);
      if (!response.ok) {
        throw new Error(`Failed to load archive entries: ${response.status}`);
      }
      const payload = (await response.json()) as { entries?: ArchiveEntry[] };
      entries = payload.entries ?? [];
    } catch {
      entries = [];
      archiveError = 'Could not load that archive date. Please try another date.';
    } finally {
      archiveLoading = false;
    }
  }

  function moveSelection(offset: number) {
    const index = availableDates.indexOf(selectedDate);
    const nextIndex = index + offset;
    if (nextIndex >= 0 && nextIndex < availableDates.length) {
      void updateSelectedDate(availableDates[nextIndex]);
    }
  }

  const schemaJson = $derived(
    JSON.stringify([
      generateCollectionPageSchema(
        'Framed Archive',
        'Browse the Framed archive by date and reveal the saved answers for Framed Classic, One Frame, Titleshot, and Poster from our verified answer records.',
        'https://wordsolverx.com/framed-archive',
        availableDates.slice(0, 10).map((dateKey: string) => ({
          name: `Framed ${dateKey}`,
          url: `https://wordsolverx.com/framed-archive?date=${dateKey}`
        }))
      ),
      generateWebPageSchema(
        'Framed Archive - Past Framed Answers by Date | WordSolverX',
        'Browse the Framed archive by date and reveal the saved answers for Framed Classic, One Frame, Titleshot, and Poster from our verified answer records.',
        'https://wordsolverx.com/framed-archive'
      )
    ])
  );
</script>

<svelte:head>
  <title>Framed Archive - Past Framed Answers by Date | WordSolverX</title>
  <meta name="description" content="Browse the Framed archive by date and reveal the saved answers for Framed Classic, One Frame, Titleshot, and Poster from our verified answer records." />
  <link rel="canonical" href="https://wordsolverx.com/framed-archive" />
  <meta property="og:title" content="Framed Archive - Past Framed Answers by Date" />
  <meta property="og:description" content="Search saved Framed movie title answers by date for all supported Framed modes." />
  <meta property="og:url" content="https://wordsolverx.com/framed-archive" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Framed Archive" />
  <meta name="twitter:description" content="Browse static Framed answer history by date." />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${schemaJson}</script>`}
</svelte:head>

<div class="min-h-screen py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <Breadcrumbs />

    <section class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Framed Archive</p>
      <h1 class="mt-3 text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50">Past Framed Answers</h1>
      <p class="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
        Select any saved date to view the Framed Classic, One Frame, Titleshot, and Poster answers from the static archive.
      </p>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Selected date</p>
          <h2 class="mt-2 text-2xl font-black text-slate-900 dark:text-slate-50">{formattedDate}</h2>
        </div>

        <div class="flex flex-wrap gap-3">
          <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700" onclick={() => moveSelection(1)}>Older</button>
          <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700" onclick={() => moveSelection(-1)}>Newer</button>
        </div>
      </div>

      <input
        class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        type="date"
        value={selectedDate}
        min={availableDates[availableDates.length - 1]}
        max={availableDates[0]}
        onchange={(event) => void updateSelectedDate((event.currentTarget as HTMLInputElement).value)}
      />
    </section>

    <section class="grid gap-5 sm:grid-cols-2">
      {#if archiveLoading}
        <div class="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 sm:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Loading answers...
        </div>
      {:else if archiveError}
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 sm:col-span-2">
          {archiveError}
        </div>
      {:else}
        {#each entries as entry}
          <FramedAnswerCard game={entry.game} answer={entry.answer} puzzleNumber={entry.puzzleNumber} />
        {/each}
      {/if}
    </section>

    <!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Framed Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Framed movie since launch, across Classic, One Frame, Titleshot, and Poster modes.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Framed Works</h3>
      <p>You see a movie still and guess which film it's from. Get it wrong and you get another still from the same movie, progressively more recognizable. Six guesses total. The first frame is usually obscure — a background detail or a minor scene. Genre recognition beats specific film knowledge early on.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does the archive include all modes?</h4>
      <p>Classic, One Frame, Titleshot, and Poster are all tracked separately in the archive.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">How many movies are in the pool?</h4>
      <p>The pool is large enough that repeats are rare. The game pulls from a wide range of genres and decades.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can I use the archive to watch the movies?</h4>
      <p>That's not the intended use, but plenty of players have added movies to their watchlist after a Framed puzzle stumped them.</p>
    </div>
  </div>

    <div class="mt-12">
      <StaticArticle content={ARTICLE_CONTENT['framed-archive']} />
    </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
</article>
  </div>
</div>
