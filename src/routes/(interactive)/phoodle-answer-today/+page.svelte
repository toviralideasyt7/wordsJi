<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import KeepExploring from '$lib/components/KeepExploring.svelte';
  import AnswerArticle from '$lib/components/AnswerArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import PhoodleAnswerCard from '$lib/components/PhoodleAnswerCard.svelte';
  import UpdatedStamp from '$lib/components/UpdatedStamp.svelte';
  import AIHintCards from '$lib/components/AIHintCards.svelte';
  import FactBlock from '$lib/components/FactBlock.svelte';
  import YesterdayBlock from '$lib/components/YesterdayBlock.svelte';
  import PaaHints from '$lib/components/PaaHints.svelte';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, generateBreadcrumbSchema, generateWebPageSchema } from '$lib/seo';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';

  let { data } = $props();
  let pageTitle = $derived(data.meta?.title ?? "Phoodle Answer Today");
  let pageDescription = $derived(
    data.meta?.description ??
      "Get today's Phoodle answer, food-themed hints, recent solutions, and the latest verified daily update from WordSolverX."
  );
  const publishedDate = $derived(data.dateKey ? `${data.dateKey}T00:00:00Z` : null);
  // FAQPage schema built from the server's hintFaqs (wordle pattern).
  const faqSchemaNode = $derived(
    (data.hintFaqs?.length ?? 0) > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: (data.hintFaqs ?? []).map((faq: { question: string; answer: string }) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer }
            }))
          }
        ]
      : []
  );
  let pageSchema = $derived(
    JSON.stringify([
      generateWebPageSchema(
        pageTitle,
        pageDescription,
        'https://wordsolverx.com/phoodle-answer-today',
        {
          image: 'https://wordsolverx.com/images/phoodle-answer-today.webp',
          dateModified: data.dateKey ?? new Date().toISOString().split('T')[0]
        }
      ),
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://wordsolverx.com' },
        { name: 'Today', url: 'https://wordsolverx.com/today' },
        { name: 'Phoodle Answer Today', url: 'https://wordsolverx.com/phoodle-answer-today' }
      ]),
      ...faqSchemaNode
    ])
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/phoodle-answer-today" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content="https://wordsolverx.com/images/phoodle-answer-today.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://wordsolverx.com/images/phoodle-answer-today.webp" />
  <meta name="news_keywords" content={data.meta?.keywords ?? 'phoodle answer today, phoodle answer, phoodle hint, phoodle hint today'} />
  <link rel="canonical" href="https://wordsolverx.com/phoodle-answer-today" />
  {@html `<script type="application/ld+json">${pageSchema}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Phoodle" answer={data.upperWord ?? null} />

{#if data.error || !data.word}
  <div class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="text-center p-8">
      <h1 class="text-3xl font-bold mb-4 text-slate-900">Phoodle Answer Not Available</h1>
      <p class="text-slate-600">Unable to load today's puzzle. Please try again later.</p>
      <a href="/today" class="mt-6 inline-block px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-medium">
        &larr; Back to Today's Hub
      </a>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs hideSchema={true} />

      <!-- Header -->
      <header class="text-center mb-12">
        <div class="inline-flex items-center justify-center p-4 bg-orange-100 rounded-full text-orange-600 mb-6">
          <span class="text-4xl">&#127869;&#65039;</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Phoodle Hints and Answer for Today ({data.formattedDate})
        </h1>
        <p class="text-lg text-slate-600 font-medium">{data.formattedDate}</p>
      </header>

      <div class="mb-6">
        <UpdatedStamp stamp={data.updatedStamp} />
      </div>

      <div class="mb-8">
        <AIHintCards gameName="Phoodle" answer={data.upperWord ?? ''} hints={data.aiHints} showAnswerReveal={false} />
        <p class="mt-3 text-center text-sm text-slate-500">
          Need help solving? <a href="/phoodle-solver" class="font-semibold text-teal-700 hover:text-teal-600 underline">Try the free Phoodle Solver →</a>
        </p>
      </div>

      <!-- Answer Card -->
      <PhoodleAnswerCard
        word={data.word}
        date={data.formattedDate}
        description={data.description}
        recipe_name={data.recipe_name}
      />

      {#if data.yesterday}
        <div class="mt-8">
          <YesterdayBlock
            gameName="Phoodle"
            puzzleNumber={String(data.yesterday.number)}
            dateLong={data.yesterday.dateLong}
            answer={data.yesterday.answer}
          />
        </div>
      {/if}

      <div class="mt-8">
        <FactBlock
          gameName="Phoodle"
          puzzleNumber={String(data.phoodleNumber ?? '')}
          dateLong={data.formattedDate}
          firstLetter={data.startLetter ?? ''}
          lastLetter={data.endLetter ?? ''}
          vowelCount={data.vowelCount ?? 0}
          repeatText={data.hasDouble ? 'Yes' : 'No'}
        />
      </div>

      <div class="mt-8">
        <PaaHints gameName="Phoodle" hints={data.aiHints} />
      </div>

      <!-- Quick Links -->
      <div class="flex justify-center gap-4 mb-16">
        <a href="/phoodle-archive" class="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 rounded-2xl font-bold transition-all shadow-sm group">
          Browse Archive
        </a>
      </div>

      <KeepExploring slug="phoodle" puzzleDate={data.dateKey} />

      <!-- Content & FAQs -->
      <article class="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span class="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>
          About Today's Puzzle
        </h2>
        <p class="text-slate-600 mb-6 leading-relaxed text-lg">
          The Phoodle answer for <strong class="text-slate-900">{data.formattedDate}</strong> is
          <span class="px-2 py-1 bg-teal-100 text-teal-700 rounded font-bold uppercase">{data.word}</span>.
          Phoodle is a delicious twist on the classic word-guessing game, featuring food-related terms every day.
        </p>

        <div class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 mb-8 border-l-4 border-l-orange-500">
          <h3 class="text-lg font-bold text-orange-700 mb-2 flex items-center gap-2">Daily Hint</h3>
          <p class="text-slate-700">
            The word "<strong class="text-orange-800">{data.word}</strong>" has {data.word.length} letters, starts with "{data.word[0].toUpperCase()}",
            and ends with "{data.word[data.word.length - 1].toUpperCase()}". Next time, think about everything related to cooking and dining!
          </p>
        </div>

        <h2 class="text-2xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
        <div class="space-y-10">
          <div class="border-b border-slate-200 pb-8">
            <h3 class="text-xl font-bold text-slate-900 mb-3">What is the Phoodle answer for today, {data.formattedDate}?</h3>
            <p class="text-slate-600 leading-relaxed text-lg">
              The Phoodle answer for today, {data.formattedDate}, is <span class="font-black text-orange-600 uppercase tracking-widest px-2 py-0.5 bg-orange-50 rounded-lg border border-orange-100">{data.upperWord}</span>.
            </p>
          </div>
          <div class="border-b border-slate-200 pb-8">
            <h3 class="text-lg font-bold text-slate-900 mb-2">What is Phoodle?</h3>
            <p class="text-slate-600">
              Phoodle is a daily word puzzle game focused on food-related words. Similar to Wordle, you have six attempts to guess the five-letter food word, with color-coded hints after each guess to guide you.
            </p>
          </div>
          <div class="border-b border-slate-200 pb-8">
            <h3 class="text-lg font-bold text-slate-900 mb-2">When does Phoodle reset?</h3>
            <p class="text-slate-600">
              A new Phoodle puzzle is available every day. The answer updates at midnight JST, providing a fresh challenge for foodies worldwide.
            </p>
          </div>

          {#if data.last10Days}
            {#each data.last10Days as d}
              {#if d}
                <div class="border-b border-slate-100 pb-8 last:border-0">
                  <h3 class="text-lg font-bold text-slate-900 mb-2">What was the Phoodle answer for {d.formattedDate}?</h3>
                  <p class="text-slate-600 leading-relaxed text-lg">
                    The Phoodle answer for {d.formattedDate} was <span class="font-black text-orange-600 uppercase tracking-widest px-2 py-0.5 bg-orange-50 rounded-lg border border-orange-100">{d.word.toUpperCase()}</span>.
                  </p>
                </div>
              {/if}
            {/each}
          {/if}
        </div>
      </article>

      <!-- SEO Content Section -->
      <article class="mt-12 space-y-8">
        <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
          <h2 class="text-3xl font-black tracking-tight text-slate-900">What Phoodle Actually Is</h2>
          <p class="mt-4 text-lg leading-8 text-slate-600">
            Five-letter food word, six guesses, same color-tile feedback as Wordle. The word pool is smaller — ingredients, cooking methods, dishes, kitchen tools, food descriptors. That smaller pool works in your favor: once you know the common terms, you solve faster. Resets at midnight JST.
          </p>
        </section>

        <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
          <h2 class="text-3xl font-black tracking-tight text-slate-900">Today's Answer: {data.word.toUpperCase()}</h2>
          <p class="mt-4 text-lg leading-8 text-slate-600">
            Today's Phoodle is <strong class="text-slate-900">{data.word.toUpperCase()}</strong> — {data.word.length} letters, starts with "{data.word[0].toUpperCase()}", ends with "{data.word[data.word.length - 1].toUpperCase()}." The answer card at the top has the full reveal. Browse the archive to spot patterns in past answers.
          </p>
        </section>

        <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
          <h2 class="text-3xl font-black tracking-tight text-slate-900">Getting Better at Phoodle</h2>
          <div class="mt-6 space-y-4">
            <div class="rounded-2xl bg-slate-50 p-5">
              <h3 class="font-bold text-slate-900">Start with coverage words</h3>
              <p class="mt-2 text-sm leading-7 text-slate-600">
                TOAST, OLIVE, STEAK — words that hit common food letters and at least one vowel. Even wrong guesses teach you something about which letters are in play.
              </p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-5">
              <h3 class="font-bold text-slate-900">Think by category</h3>
              <p class="mt-2 text-sm leading-7 text-slate-600">
                Ingredient? Cooking method? Dish? Kitchen tool? Narrowing to a category cuts the word pool from hundreds to maybe 30-40 candidates.
              </p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-5">
              <h3 class="font-bold text-slate-900">Seasonal answers happen</h3>
              <p class="mt-2 text-sm leading-7 text-slate-600">
                Pumpkin in fall, berries in summer. The game tracks what people are actually eating. If it's a holiday week, think holiday food.
              </p>
            </div>
            <div class="rounded-2xl bg-slate-50 p-5">
              <h3 class="font-bold text-slate-900">Explore beyond your own kitchen</h3>
              <p class="mt-2 text-sm leading-7 text-slate-600">
                MISO, TOFU, DASHI, KORMA, NACHO — Phoodle pulls from global cuisines. Browsing recipe sites from different cultures builds the vocabulary you need.
              </p>
            </div>
          </div>
        </section>
      </article>
      <div class="mb-12">
        <div class="mt-12">
  <AnswerArticle content={ARTICLE_CONTENT['phoodle-answer-today']} vars={{ date: data.formattedDate }}
    verified={publishedDate}
  />
</div>

<AuthorCard
          name={PRESTON_HAYES_AUTHOR_NAME}
          image={PRESTON_HAYES_AUTHOR_IMAGE}
          description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
        />

      <InternalLinkSection currentGame="Phoodle" />
      </div>
    </div>
  </div>
{/if}

