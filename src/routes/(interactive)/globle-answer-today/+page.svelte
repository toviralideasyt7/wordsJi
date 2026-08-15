<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import GlobleCluesSection from '$lib/components/GlobleCluesSection.svelte';
  import { generateWebPageSchema, stripStructuredDataTypes } from '$lib/seo';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';

  let { data } = $props();
  const publishedDate = $derived(`${data.dateKey}T00:00:00Z`);
  const webPageSchema = $derived(
    generateWebPageSchema(
      data.meta.title,
      data.meta.description,
      'https://wordsolverx.com/globle-answer-today',
      {
        image: data.meta.featuredImage ?? 'https://wordsolverx.com/images/globle-answer-today.webp',
        dateModified: data.dateKey
      }
    )
  );
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="news_keywords" content={data.meta.keywords ?? 'globle answer today, globle answer, globle hint, globle hint today'} />
  <link rel="canonical" href="https://wordsolverx.com/globle-answer-today" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/globle-answer-today" />
  <meta property="og:image" content={data.meta.featuredImage ?? 'https://wordsolverx.com/images/globle-answer-today.webp'} />
  <meta property="og:image:alt" content={`Globle hints and answer for ${data.formattedDate}`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content={data.meta.featuredImage ?? 'https://wordsolverx.com/images/globle-answer-today.webp'} />
  {@html `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`}
  {@html `<script type="application/ld+json">${stripStructuredDataTypes(data.schemas, ['FAQPage', 'HowTo']) ?? data.schemas}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Globle" answer={data.country?.name ?? null} />

<div class="bg-slate-50 dark:bg-slate-800/30 min-h-screen font-sans">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <Breadcrumbs />

    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-4">{data.meta.title}</h1>
      <p class="text-lg text-slate-600 dark:text-slate-400">Today's Globle country and hints for {data.formattedDate}</p>
    </div>

    <GlobleCluesSection country={data.country} date={data.formattedDate}>
      <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] overflow-hidden">
        <div class="p-8 text-center">
          <div class="mb-6">
            <span class="inline-block px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-medium tracking-wide">
              TODAY'S ANSWER
            </span>
          </div>

          <h2 class="text-5xl font-black text-slate-900 dark:text-slate-50 mb-8 tracking-tight">{data.country.name}</h2>

          <div class="flex justify-center mb-8">
            <div class="relative">
              <img
                src="https://flagcdn.com/w320/{data.country.code.toLowerCase()}.png"
                srcset="https://flagcdn.com/w640/{data.country.code.toLowerCase()}.png 2x"
                width="200"
                alt="Flag of {data.country.name}"
                class="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm shadow-lg">
                {data.country.latitude.toFixed(2)}°, {data.country.longitude.toFixed(2)}°
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 text-left">
            <div class="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800/40">
              <div class="text-sm font-medium text-slate-600 dark:text-slate-400">Continent</div>
              <div class="text-lg font-bold text-slate-900 dark:text-slate-100">{data.country.continent}</div>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/40">
              <div class="text-sm font-medium text-slate-600 dark:text-slate-400">Subregion</div>
              <div class="text-lg font-bold text-slate-900 dark:text-slate-100">{data.country.subregion}</div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div class="text-sm font-medium text-slate-600 dark:text-slate-400">Country Code</div>
              <div class="text-lg font-bold text-slate-900 dark:text-slate-100">{data.country.code}</div>
            </div>
            <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div class="text-sm font-medium text-slate-600 dark:text-slate-400">Name Length</div>
              <div class="text-lg font-bold text-slate-900 dark:text-slate-100">{data.country.name.length} letters</div>
            </div>
          </div>

          <div class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <a href="/globle-archive" class="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors group">
              View All Past Answers
              <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </GlobleCluesSection>

    {#if false}
    <article class="mt-12 space-y-8">
      <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
          How to Read the Globle Clues
        </h2>
        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          Today's Globle country is revealed above. Here's how to read the color clues and zero in on the answer faster when you play on your own.
        </p>
        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Each guess lights up on the globe with a color that shows how close you are. Deep red means you're right next door — under 500 km away. Orange means a few thousand kilometers. Yellow means same continent or nearby. White means you're on the wrong side of the world. The shade shifts gradually as you get closer, so two oranges aren't always equal — the darker one is the better guess.
        </p>
      </section>

      <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
          Three Quick Tips
        </h2>
        <div class="space-y-6 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Start with spread-out guesses</h3>
            <p class="leading-relaxed">
              Your first 2-3 guesses should hit different continents. Try Brazil, Turkey, and India — that covers South America, Europe, and Asia. The color feedback immediately narrows the entire globe to one region.
            </p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Learn your small countries</h3>
            <p class="leading-relaxed">
              Vatican City, Monaco, Nauru, San Marino — these tiny nations show up as answers and they're nearly invisible on the globe. Memorizing where the smallest countries sit saves you from burning five guesses on the wrong neighborhood.
            </p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Use borders as clues</h3>
            <p class="leading-relaxed">
              When a guess lights up deep red, the answer is right next to it. Think about which countries share a border and try those. If Poland goes red, guess Czechia, Germany, Ukraine, Belarus, Lithuania, Slovakia, or Russia next.
            </p>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-5 sm:p-8 shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
          Globle FAQ
        </h2>
        <div class="space-y-6 text-base text-slate-600 dark:text-slate-400">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Does Globle use all countries?</h3>
            <p class="leading-relaxed">
              Yes — all 195 UN-recognized sovereign states, including tiny ones like Monaco and Vatican City. Africa and Asia show up most often because they simply have more countries.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">How does the distance color work?</h3>
            <p class="leading-relaxed">
              Closer = warmer colors. Deep red means neighboring, orange means a few thousand km, yellow means moderate, and white means far away. The shade is continuous — darker orange beats lighter orange.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">What are the hardest countries to guess?</h3>
            <p class="leading-relaxed">
              The smallest ones: Vatican City, Monaco, Nauru, Tuvalu, San Marino, Liechtenstein, and Marshall Islands. They're so small on the globe that even neighbors only glow moderately warm. Players who can identify these quickly are in the top tier.
            </p>
          </div>
        </div>
      </section>

      <p class="text-center text-sm text-slate-500">
        Browse every past answer in the <a href="/globle-archive" class="font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-500">Globle archive</a>.
      </p>
    </article>
    {/if}

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />

      <InternalLinkSection currentGame="Globle" />
    </div>
  </div>
</div>
