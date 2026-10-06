<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import KeepExploring from '$lib/components/KeepExploring.svelte';
  import AnswerArticle from '$lib/components/AnswerArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import WorldleCountryCard from '$lib/components/worldle/WorldleCountryCard.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';
  import UpdatedStamp from '$lib/components/UpdatedStamp.svelte';
  import AIHintCards from '$lib/components/AIHintCards.svelte';
  import FactBlock from '$lib/components/FactBlock.svelte';
  import YesterdayBlock from '$lib/components/YesterdayBlock.svelte';
  import PaaHints from '$lib/components/PaaHints.svelte';

  let { data } = $props();
  const publishedDate = $derived(`${data.todayDate}T00:00:00Z`);
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta
    name="keywords"
    content={data.meta.keywords ?? 'worldle answer today, worldle answer, worldle hint, worldle hint today'}
  />
  <link rel="canonical" href={data.meta.canonical} />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={data.meta.canonical} />
  <meta property="og:image" content="https://wordsolverx.com/images/worldle-answer-today.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content="https://wordsolverx.com/images/worldle-answer-today.webp" />
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES) ?? data.schemas}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Worldle" answer={data.todayAnswer?.country.name ?? null} />

<section class="min-h-screen bg-slate-50">
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
    <Breadcrumbs hideSchema={true} />

    <section class="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 px-6 py-8 text-white shadow-2xl shadow-sky-500/20 sm:px-8 sm:py-10">
      <div class="max-w-4xl">
        <p class="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
          Worldle Answer Today
        </p>
        <h1 class="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          Worldle Answer Today ({data.formattedTodayDate})
        </h1>
        <p class="mt-4 max-w-3xl text-base leading-7 text-sky-50/90 sm:text-lg">
          Today's Worldle country for {data.formattedTodayDate}. Got it right? Nice. Got it wrong? That's what the solver is for.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white">
            <img
              alt={`Flag of ${data.todayAnswer.country.name}`}
              class="h-6 w-8 rounded-md border border-white/20 object-cover"
              height="24"
              loading="lazy"
              src={`https://flagcdn.com/w40/${data.todayAnswer.country.code.toLowerCase()}.png`}
              width="32"
            />
            <span>{data.todayAnswer.country.name}</span>
          </div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white">
            <span>Worldle #{data.todayAnswer.worldleNumber}</span>
          </div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white">
            <span>Updates at 00:00 UTC</span>
          </div>
        </div>
      </div>
    </section>

    <div class="mt-8">
      <UpdatedStamp stamp={data.updatedStamp} />
    </div>

    <div class="mt-8">
      <AIHintCards gameName="Worldle" answer={data.todayAnswer.country.name} hints={data.aiHints} showAnswerReveal={false} />
    </div>

    <div class="mt-8">
      <WorldleCountryCard
        answer={data.todayAnswer}
        headline="Today's Worldle answer"
        subheadline={`This page is refreshed automatically for the active Worldle day. Today is ${data.formattedTodayDate}.`}
      />
    </div>

    {#if data.yesterday}
      <div class="mt-8">
        <YesterdayBlock
          gameName="Worldle"
          puzzleNumber={String(data.yesterday.number)}
          dateLong={data.yesterday.dateLong}
          answer={data.yesterday.answer}
        />
      </div>
    {/if}

    <div class="mt-8">
      <FactBlock
        gameName="Worldle"
        puzzleNumber={data.factData.puzzleNumber}
        dateLong={data.factData.dateLong}
        firstLetter={data.factData.firstLetter}
        lastLetter={data.factData.lastLetter}
        vowelCount={data.factData.vowelCount}
        repeatText={data.factData.repeatText}
      />
    </div>

    <div class="mt-8">
      <PaaHints gameName="Worldle" hints={data.aiHints} />
    </div>

    <KeepExploring slug="worldle" puzzleDate={data.todayDate} />

    <section class="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">More Worldle tools</p>
          <h2 class="mt-1 text-3xl font-black tracking-tight text-slate-900">Open the archive or solve first</h2>
          <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Need a past Worldle answer? The archive has every country.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a
            class="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-500  "
            href="/worldle-archive"
          >
            Browse Worldle Archive
          </a>
          <a
            class="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            href="/worldle-solver"
          >
            Open Worldle Solver
          </a>
        </div>
      </div>
    </section>

    <div class="mt-10 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60">
      <FAQSection faqs={data.faqEntries} title="Worldle Answers For The Last 10 Days" />
    </div>

    {#if false}
    <article class="mt-10 space-y-8">
      <section class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/60">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Reading the shape today</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Worldle shows you one country silhouette and six guesses to name it. After each wrong answer you get the distance, a direction arrow, and a percentage. Those three numbers are enough to narrow 190+ countries down to one — if you use them right.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The silhouette for puzzle #{data.todayAnswer.worldleNumber} starts the same way every day: a single shape, no labels, no neighbor outlines. If you recognize the shape immediately, great. If not, the distance and direction from your first guess will point you toward the right continent within seconds.
        </p>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/60">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">How to narrow it down fast</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Your first guess should be a large country in the region you think the shape belongs to — Brazil, Russia, China, DR Congo, Australia. Big countries give you better distance data because they cover more ground. A tiny island nation as your first guess tells you almost nothing if you're wrong.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          After that first guess, the proximity percentage does the heavy lifting. Above 80% means you're within a country or two. Between 50% and 80% means right region, wrong spot. Below 50%? You're probably on the wrong continent. The direction arrow confirms it — if it points southwest and you guessed a European country, you're heading toward Africa or South America.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Pay attention to silhouette size too. Worldle shows every country at the same zoom level, so a tiny shape means a small nation or island. A shape that fills the frame is Russia, Canada, Brazil, or one of the other giants.
        </p>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/60">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">The shapes that trip people up</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Small West African nations — Benin, Togo, Guinea, Sierra Leone — all look vaguely similar on a silhouette. Central Asian countries like Kyrgyzstan and Uzbekistan can be hard to tell apart. Caribbean islands are notoriously difficult because many share a rough teardrop shape.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          If the silhouette looks unfamiliar after two guesses, it's probably a small country in a crowded region. Use the distance to gauge which part of the world, then the solver to filter by continent and population size. The solver won't reveal the answer outright — it narrows the list until you can make a confident pick.
        </p>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-200/60">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Questions players keep asking</h2>
        <div class="mt-6 space-y-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900">What time does Worldle reset?</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Midnight UTC. That's 7 PM Eastern, 4 PM Pacific, and 5:30 AM IST. Same moment worldwide.
        </p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">How many countries are in the rotation?</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Over 190, including territories. At one per day, the full cycle takes more than six months. You'll see mostly fresh answers if you play daily.
        </p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">What's a decent score?</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          1 or 2 guesses is a standout — the shape was probably obvious. 3 is solid. Most people average 3 to 4. If you're consistently at 4 or below, you're doing better than the average player.
        </p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">Can the solver help without spoiling the answer?</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Yes. The Worldle Solver filters countries by continent, population, and area. Enter your guesses and it narrows the list. You still pick the answer — it just removes the ones that don't fit.
        </p>
          </div>
        </div>
      </section>
    </article>
    {/if}
    <div class="mt-12">
      <div class="mt-12">
  <AnswerArticle content={ARTICLE_CONTENT['worldle-answer-today']} vars={{ date: data.formattedTodayDate, country: data.todayAnswer?.country?.name ?? '' }}
    verified={publishedDate}
  />
</div>

<AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />

      <InternalLinkSection currentGame="Worldle" />
    </div>
  </div>
</section>
