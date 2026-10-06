<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import WordleDisplayWrapper from '$lib/components/WordleDisplayWrapper.svelte';
  import KeepExploring from '$lib/components/KeepExploring.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import AnswerArticle from '$lib/components/AnswerArticle.svelte';
  import StrategyDeepDive from '$lib/components/StrategyDeepDive.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import type { WordleAnswer } from '$lib/api';
  import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';
  import UpdatedStamp from '$lib/components/UpdatedStamp.svelte';
  import FactBlock from '$lib/components/FactBlock.svelte';
  import YesterdayBlock from '$lib/components/YesterdayBlock.svelte';
  import PaaHints from '$lib/components/PaaHints.svelte';

  let { data } = $props();

  function formatDateForFAQ(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const publishedDate = $derived.by(() =>
    data.publishedDate ?? (data.wordleData?.date ? `${data.wordleData.date}T00:00:00Z` : null)
  );
  const cleanedSchemas = $derived(
    stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES)
  );
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords ?? 'wordle answer today, wordle answer, wordle hint, wordle hint today'} />
  <meta name="news_keywords" content="wordle, wordle answer, wordle today, nyt wordle, daily word puzzle" />
  <link rel="canonical" href="https://wordsolverx.com/wordle-answer-today" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:image" content={data.meta.socialImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`Wordle Answer for ${data.formattedDate}`} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/wordle-answer-today" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content={data.meta.socialImage} />
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.meta.title,
    description: data.meta.description,
    url: 'https://wordsolverx.com/wordle-answer-today',
    image: data.meta.socialImage,
    dateModified: data.wordleData?.date || new Date().toISOString().split('T')[0]
  })}</script>`}
  {#if cleanedSchemas}
    {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
  {/if}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Wordle" answer={data.wordleWord?.toUpperCase()} />

<!-- NOTE: the layout already renders <main id="main-content"> — this page must not
	nest a second <main> (invalid HTML that confuses ad content extraction). -->
<div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-6">
      <UpdatedStamp stamp={data.updatedStamp} />
    </div>

    <WordleDisplayWrapper
      wordleData={data.wordleData}
      wordleWord={data.wordleWord}
      wordleNumber={data.wordleNumber}
      formattedDate={data.formattedDate}
      pageContext="today"
      contentGuide={data.wordleData?.content_guide}
      socialImage={data.directSocialImage}
      youtubeVideoUrl={data.wordleData?.youtube_video_url}
      aiHints={data.aiHints}
    />
    <p class="mt-6 text-center text-sm text-slate-500">
      Need help solving? <a href="/wordle-solver" class="font-semibold text-teal-700 hover:text-teal-600 underline">Try the free Wordle Solver →</a>
    </p>

    {#if data.yesterday}
      <div class="mt-8">
        <YesterdayBlock
          gameName="Wordle"
          puzzleNumber={String(data.yesterday.number)}
          dateLong={data.yesterday.dateLong}
          answer={data.yesterday.answer}
        />
      </div>
    {/if}

    <div class="mt-8">
      <FactBlock
        gameName="Wordle"
        puzzleNumber={String(data.wordleNumber ?? '')}
        dateLong={data.formattedDate}
        firstLetter={data.startLetter ?? ''}
        lastLetter={data.endLetter ?? ''}
        vowelCount={data.vowelCount ?? 0}
        repeatText={data.hasDouble ? 'Yes' : 'No'}
      />
    </div>

    <div class="mt-8">
      <PaaHints gameName="Wordle" hints={data.aiHints} />
    </div>

    <KeepExploring slug="wordle" puzzleDate={data.wordleData?.date} />

    {#if data.recentAnswers.length > 1}
      <section class="mt-12 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 overflow-hidden">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span class="w-2 h-8 bg-green-500 rounded-full"></span>
          Recent Wordle Answers
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Wordle #</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Answer</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each data.recentAnswers as answer}
                <tr class="transition-colors hover:bg-gray-50 {answer.date === data.wordleData?.date ? 'bg-green-50/50' : ''}">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{answer.days_since_launch ?? answer.id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDateForFAQ(answer.date)}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      {answer.solution.toUpperCase()}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <!-- SEO audit chapter 9.3.3: outbound citation to the canonical source (NYT Wordle).
             Dofollow link to the official game is a credibility signal — it shows the content
             is researched rather than scraped, and associates the site with the canonical
             source entity. 30-minute content update across top answer pages, costs nothing. -->
        <p class="mt-6 text-sm text-gray-500">
          Source: <a href="https://www.nytimes.com/games/wordle/index.html" class="text-teal-600 hover:text-teal-700 font-medium underline" rel="external">NYT Wordle</a> — the official daily word puzzle from The New York Times.
        </p>
      </section>
    {/if}

    <div class="mt-12">
      <AnswerArticle
        content={ARTICLE_CONTENT['wordle-answer-today']}
        vars={{
          date: data.formattedDate,
          answer: data.wordleWord?.toUpperCase() ?? '',
          number: data.wordleNumber ? String(data.wordleNumber) : ''
        }}

        verified={publishedDate}
      />
    </div>

    <div class="mt-12">
      <StrategyDeepDive slug="wordle-answer-today" />
    </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>

    <div class="mt-16">
      <InternalLinkSection currentGame="Wordle" />
    </div>
  </div>
</div>
