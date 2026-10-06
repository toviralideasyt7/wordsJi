<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import AnswerArticle from '$lib/components/AnswerArticle.svelte';
  import StrategyDeepDive from '$lib/components/StrategyDeepDive.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FramedAnswerCard from '$lib/components/FramedAnswerCard.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import KeepExploring from '$lib/components/KeepExploring.svelte';
  import UpdatedStamp from '$lib/components/UpdatedStamp.svelte';
  import AIHintCards from '$lib/components/AIHintCards.svelte';
  import FactBlock from '$lib/components/FactBlock.svelte';
  import PaaHints from '$lib/components/PaaHints.svelte';
  import { getMainDailyDateKey } from '$lib/main-daily-date';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

  let { data } = $props();
  const todayKey = getMainDailyDateKey();
  const publishedDate = $derived(`${data.targetDateKey ?? todayKey}T00:00:00Z`);
  const noscriptAnswer = $derived.by(() =>
    data.hasExactEntries
      ? data.entries.map((entry) => `${entry.game}: ${entry.answer}`).join(' | ')
      : null
  );
  const featuredEntry = $derived(data.hasExactEntries ? data.entries[0] ?? null : null);
  const remainingEntries = $derived(data.hasExactEntries ? data.entries.slice(1) : []);

  const factLetters = $derived((data.classicAnswer ?? '').toLowerCase().replace(/[^a-z]/g, ''));
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
<AnswerPageNoscript gameName="Framed" answer={noscriptAnswer} />

<div class="bg-slate-50 min-h-screen py-12">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <Breadcrumbs hideSchema={true} />

    <section class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">Framed Answers Today</p>
          <h1 class="mt-3 text-4xl font-black text-slate-900">Framed Answer Today ({data.formattedDate})</h1>
          <p class="mt-4 max-w-3xl text-lg text-slate-600">
            Today's movie picks for Framed Classic, One Frame, Titleshot, and Poster. Answer below.
          </p>
        </div>
        <a href="/framed-archive" class="inline-flex items-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600">Browse Archive</a>
      </div>
    </section>

    <div class="flex justify-center">
      <UpdatedStamp stamp={data.updatedStamp} />
    </div>

    {#if data.hasExactEntries && data.classicAnswer}
      <AIHintCards gameName="Framed" answer={data.classicAnswer} hints={data.aiHints} showAnswerReveal={false} />
    {/if}

    <section class="space-y-5">
      {#if data.hasExactEntries}
        {#if featuredEntry}
          <FramedAnswerCard
            game={featuredEntry.game}
            answer={featuredEntry.answer}
            puzzleNumber={featuredEntry.puzzleNumber}
            featured={true}
          />
        {/if}

        {#if remainingEntries.length > 0}
          <div class="grid items-start gap-5 md:grid-cols-3">
            {#each remainingEntries as entry}
              <FramedAnswerCard game={entry.game} answer={entry.answer} puzzleNumber={entry.puzzleNumber} />
            {/each}
          </div>
        {/if}
      {:else}
        <div class="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 class="text-2xl font-black">Today's Framed answers aren't available yet</h2>
          <p class="mt-3 text-base text-amber-900">
            Today's Framed answers aren't available yet. Check back after midnight, or browse the archive for past puzzles in the meantime.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <a href="/framed-archive" class="inline-flex items-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600">Browse Archive</a>
          </div>
        </div>
      {/if}
    </section>

    {#if data.hasExactEntries && data.classicAnswer}
      <FactBlock
        gameName="Framed Classic"
        puzzleNumber={String(data.classicNumber)}
        dateLong={data.formattedDate}
        firstLetter={factFirstLetter}
        lastLetter={factLastLetter}
        vowelCount={factVowelCount}
        repeatText={factRepeatText}
      />

      <PaaHints gameName="Framed" hints={data.aiHints} />
    {/if}

    <KeepExploring slug="framed" puzzleDate={data.targetDateKey} />

    {#if false}
    <article class="space-y-8">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">What you're looking at today</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Framed shows you one movie frame per guess. You get six tries to name the film. The first frame is usually vague — a color palette, a silhouette, a location you might not recognize. By frame three or four, most people who watch movies regularly can narrow it down.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          There are four variants running daily: Classic (six progressive frames), One Frame (one shot only), Titleshot (title screen or poster text), and Poster (movie poster). Each picks a different movie, so you get four separate challenges every day. The answer cards above show today's picks across all four.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">How to read the frames</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Genre recognition matters more than specific film knowledge early on. Color grading, aspect ratio, and lighting style tell you the era — desaturated cool tones usually mean 2000s thriller or drama, warm wide shots suggest a blockbuster or western. If you can pin the decade from the first frame, you've already cut the answer pool by two-thirds.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Don't guess on the first frame. Wait until frame two or three, when you can spot an actor's face, a recognizable prop, or a distinctive location. Burning a guess on a vague opening shot wastes one of your six attempts for almost no payoff. Props and wardrobe are underrated — a lightsaber, a yellow taxi, a specific uniform can nail the answer before you even recognize the actors.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Common wrong approaches</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The biggest mistake is guessing obscure films. Framed picks widely known movies — Oscar nominees, top-grossers, cult favorites with big audiences. If your first thought is an arthouse film from 1973, it's almost certainly wrong. Stick to movies you've heard of, even if you haven't seen them.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The second mistake is ignoring the archive. Browsing a week of past answers teaches you which decades and genres the game favors. It also shows you which movies appeared recently — the game rarely repeats within a month, so you can eliminate recent answers from your shortlist.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Questions players keep asking</h2>
        <div class="mt-6 space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-base font-bold text-slate-900">What time does Framed reset?</h3>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Midnight in the server timezone. For most North American players, that's the same as Wordle's reset. European players see it in the early morning.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-base font-bold text-slate-900">Do all four variants show the same movie?</h3>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              No. Classic, One Frame, Titleshot, and Poster each pick independently. Four different movies every day. Puzzle numbers are also separate — #300 in Classic is a different film from #300 in One Frame.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-base font-bold text-slate-900">Does Framed repeat movies?</h3>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Eventually, yes — the pool is a few hundred films. But the game spaces them out, so you won't see the same movie twice in a month. The archive makes it easy to check before you guess.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-base font-bold text-slate-900">How do I get better?</h3>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Watch more movies, basically. The answer pool leans heavily toward well-known films, so building your visual library pays off fast. Also practice recognizing actors from partial faces and identifying production design from a single frame.
            </p>
          </div>
        </div>
      </section>
    </article>
    {/if}

    <AnswerArticle content={ARTICLE_CONTENT['framed-answer-today']} vars={{ date: data.formattedDate, answer: data.entries?.[0]?.answer ?? '' }}
      verified={publishedDate}
    />

    <div class="mt-12">
      <StrategyDeepDive slug="framed-answer-today" />
    </div>

    <AuthorCard
      name={PRESTON_HAYES_AUTHOR_NAME}
      image={PRESTON_HAYES_AUTHOR_IMAGE}
      description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
    />

    <InternalLinkSection currentGame="Framed" />
  </div>
</div>
