<script lang="ts">
  import { type Snippet } from 'svelte';
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import ArticleAttribution from '$lib/components/ArticleAttribution.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import { generateBreadcrumbSchema, generatePersonAuthorSchema } from '$lib/seo';

  interface ModeConfig {
    name: string;
    icon: string;
    color: string;
    bg: string;
  }

  interface GameAnswer {
    game: string;
    date: string;
    mode: string;
    region: string;
    game_id: number;
    json_content: string;
  }

  interface ParsedContent {
    champion_name: string;
    yesterday?: string;
  }

  interface PageMeta {
    title?: string;
    heading?: string;
    description?: string;
    keywords?: string;
    featuredImage?: string;
  }

  type StructuredDataNode = Record<string, unknown> | StructuredDataNode[] | string | null;

  let {
    gameKey,
    gameTitle,
    apiGame,
    modes,
    modeConfig,
    regions = [
      { key: 'america', label: 'America', flag: 'US', accent: 'bg-teal-500' },
      { key: 'europe', label: 'Europe', flag: 'EU', accent: 'bg-teal-500' }
    ],
    gridCols = 'grid-cols-1 md:grid-cols-2',
    seoContent,
    crossLinks,
    schemas,
    data
  }: {
    gameKey: string;
    gameTitle: string;
    apiGame: string;
    modes: string[];
    modeConfig: Record<string, ModeConfig>;
    regions?: { key: string; label: string; flag: string; accent: string }[];
    gridCols?: string;
    seoContent: Snippet;
    crossLinks: { href: string; icon: string; label: string }[];
    schemas: object;
    data?: {
      answers: GameAnswer[];
      dateStr: string;
      error: string | null;
      meta?: PageMeta;
      schemas?: object | string;
    };
  } = $props();

  let answers = $derived(data?.answers ?? []);
  let loading = $derived(!data?.answers?.length);
  let error = $derived(data?.error ?? null);
  let dateStr = $derived(data?.dateStr ?? '');

  let canonicalUrl = $derived(`https://wordsolverx.com/${gameKey}-answer-today-updated`);
  let seoDate = $derived(dateStr ? dateStr.replace(/^[^,]+,\s*/, '') : '');
  let publishedDate = $derived(answers[0]?.date ?? '');
  let pageTitle = $derived(
    data?.meta?.title ?? `${gameTitle} Hints and Answers for Today${seoDate ? ` (${seoDate})` : ''}`
  );
  let pageHeading = $derived(
    data?.meta?.heading ?? `${gameTitle} Hints and Answers for Today${seoDate ? ` (${seoDate})` : ''}`
  );
  let pageDescription = $derived(
    data?.meta?.description ??
      `Today's ${gameTitle} answers for every mode and region${seoDate ? ` — ${seoDate}` : ''}. Every mode is listed with its answer, and the solver is always one click away.`
  );
  let pageKeywords = $derived(
    data?.meta?.keywords ??
      `${gameKey} answer today, ${gameKey} answer, ${gameKey} hint, ${gameKey} hint today${seoDate ? `, ${gameKey} answer for ${seoDate}` : ''}`
  );
  let pageImage = $derived(data?.meta?.featuredImage ?? 'https://wordsolverx.com/wordsolverx.webp');
  let crossLinkColsClass = $derived(crossLinks.length > 4 ? 'md:grid-cols-5' : 'md:grid-cols-4');
  let breadcrumbSchemaData = $derived(
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Today', url: 'https://wordsolverx.com/today' },
      { name: `${gameTitle} Answer Today`, url: canonicalUrl }
    ])
  );

  function normalizeStructuredData(input: unknown, isTopLevel: boolean = true): unknown {
    if (typeof input === 'string' || input == null) {
      return input;
    }

    if (Array.isArray(input)) {
      if (isTopLevel) {
        const seen = new Set<string>();
        const deduped: unknown[] = [];

        for (const item of input) {
          const normalized = normalizeStructuredData(item, false);
          if (typeof normalized === 'object' && normalized !== null && !Array.isArray(normalized)) {
            const record = normalized as Record<string, unknown>;
            const type = typeof record['@type'] === 'string' ? record['@type'] : '';
            const label =
              typeof record.name === 'string'
                ? record.name
                : typeof record.headline === 'string'
                  ? record.headline
                  : '';
            const key = `${type}::${label}`;

            if (type && seen.has(key)) {
              continue;
            }

            if (type) {
              seen.add(key);
            }
          }

          deduped.push(normalized);
        }

        return deduped;
      }

      return input.map((item) => normalizeStructuredData(item, false));
    }

    if (typeof input !== 'object') {
      return input;
    }

    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      normalized[key] = normalizeStructuredData(value, false);
    }

    const type = normalized['@type'];

    if (type === 'NewsArticle' || type === 'Article' || type === 'BlogPosting') {
      normalized['@type'] = 'Article';
      normalized.headline = pageTitle;
      normalized.description = pageDescription;
      normalized.mainEntityOfPage = {
        '@type': 'WebPage',
        '@id': canonicalUrl
      };
      normalized.image = pageImage;
      if (publishedDate) {
        normalized.datePublished = normalized.datePublished ?? publishedDate;
        normalized.dateModified = normalized.dateModified ?? publishedDate;
      }
    }

    if (type === 'WebPage') {
      normalized.name = pageTitle;
      normalized.headline = pageTitle;
      normalized.description = pageDescription;
      normalized.url = canonicalUrl;

      if (normalized['@id']) {
        normalized['@id'] = canonicalUrl;
      }
    }

    return normalized;
  }

  function hasSchemaType(input: StructuredDataNode, types: string[]): boolean {
    if (typeof input === 'string' || input == null) {
      return false;
    }

    if (Array.isArray(input)) {
      return input.some((item) => hasSchemaType(item, types));
    }

    const record = input as Record<string, unknown>;
    const schemaType = record['@type'];

    if (typeof schemaType === 'string' && types.includes(schemaType)) {
      return true;
    }

    return Object.values(record).some((value) => hasSchemaType(value as StructuredDataNode, types));
  }

  let resolvedSchemas = $derived(normalizeStructuredData(data?.schemas ?? schemas));
  let resolvedSchemaJson = $derived(
    typeof resolvedSchemas === 'string' ? resolvedSchemas : JSON.stringify(resolvedSchemas)
  );
  let hasPrimaryArticleSchema = $derived(
    hasSchemaType(resolvedSchemas as StructuredDataNode, ['Article', 'NewsArticle', 'BlogPosting'])
  );
  let webPageSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    image: pageImage,
    ...(publishedDate
      ? {
          dateModified: publishedDate
        }
      : {})
  });
  let articleSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pageTitle,
    description: pageDescription,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    author: generatePersonAuthorSchema(
      'Preston Hayes',
      'https://wordsolverx.com/about#preston-hayes',
      'https://wordsolverx.com/author-wordsolverx.webp'
    ),
    publisher: {
      '@type': 'Organization',
      name: 'WordSolverX',
      url: 'https://wordsolverx.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://wordsolverx.com/wordsolverx.webp',
        width: 1200,
        height: 630
      }
    },
    image: pageImage,
    ...(publishedDate
      ? {
          datePublished: publishedDate,
          dateModified: publishedDate
        }
      : {})
  });

  function parseContent(jsonContent: string): ParsedContent {
    try {
      return JSON.parse(jsonContent);
    } catch {
      return { champion_name: 'Unknown' };
    }
  }

  function getAnswer(mode: string, region: string) {
    return answers.find((answer) => answer.mode === mode && answer.region === region);
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta name="keywords" content={pageKeywords} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content={pageImage} />
  <meta property="og:image:width" content="768" />
  <meta property="og:image:height" content="319" />
  <meta property="og:image:alt" content={`${gameTitle} hints and answers for today`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content={pageImage} />
  {@html `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`}
  {#if !hasPrimaryArticleSchema}
    {@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
  {/if}
  {@html `<script type="application/ld+json">${resolvedSchemaJson}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchemaData)}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />

<div class="min-h-screen bg-white">
  <div class="max-w-6xl mx-auto px-3 sm:px-4 pt-6">
    <Breadcrumbs hideSchema={true} />
  </div>
  <header class="border-b border-slate-200 bg-slate-50/70">
    <div class="max-w-6xl mx-auto px-3 sm:px-4 py-9 sm:py-11">
      <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">{gameTitle} daily answers</p>
      <h1 class="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl text-balance">
        {pageHeading}
      </h1>
      {#if dateStr}
        <p class="mt-3 text-base text-slate-600 sm:text-lg">{dateStr}</p>
      {/if}
      <div class="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">{modes.length} modes</span>
        <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">{regions.length} regions</span>
        <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">Answers checked daily</span>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-teal-700">
          <span class="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true"></span>
          Live
        </span>
      </div>
    </div>
  </header>

  <div class="max-w-6xl mx-auto px-3 sm:px-4 py-8">
    {#if loading}
      <div class={`grid ${gridCols} gap-6`}>
        {#each Array(modes.length) as _}
          <div class="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div class="mb-4 h-3 w-1/3 rounded bg-slate-200"></div>
            <div class="mb-5 h-7 w-3/4 rounded bg-slate-200"></div>
            <div class="h-3 w-1/2 rounded bg-slate-200"></div>
          </div>
        {/each}
      </div>
    {:else if error}
      <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-red-600">{error}</p>
        <button
          type="button"
          data-reload-page
          class="mt-4 inline-flex rounded-lg bg-red-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    {:else}
      {#each regions as region}
        <section class="mb-12" aria-labelledby={`${gameKey}-${region.key}-heading`}>
          <div class="mb-5 flex items-center gap-3">
            <span class={`h-7 w-1.5 rounded-full ${region.accent}`} aria-hidden="true"></span>
            <h2 id={`${gameKey}-${region.key}-heading`} class="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              {gameTitle} {region.label} answers
            </h2>
          </div>
          <div class={`grid ${gridCols} gap-6`}>
            {#each modes as mode}
              {@const answer = getAnswer(mode, region.key)}
              {@const content = answer ? parseContent(answer.json_content) : null}
              {@const cfg = modeConfig[mode]}
              <article class="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors hover:border-slate-200">
                <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">{cfg.name}</p>
                {#if content}
                  <p class="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                    {content.champion_name}
                  </p>
                  <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span class="font-mono text-slate-500">#{answer?.game_id}</span>
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        data-copy-value={content.champion_name}
                        data-copy-default="Copy"
                        data-copy-success="Copied"
                        class="font-medium text-slate-600 transition-colors hover:text-slate-900"
                        title="Copy answer"
                      >
                        Copy
                      </button>
                      <span class="inline-flex items-center gap-1 font-medium text-teal-700">
                        <span class="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true"></span>
                        Live
                      </span>
                    </div>
                  </div>
                  {#if content.yesterday}
                    <p class="mt-3 border-t border-dashed border-slate-200 pt-3 text-xs text-slate-500">
                      Yesterday
                      <span class="ml-1 font-medium text-slate-700">{content.yesterday}</span>
                    </p>
                  {/if}
                {:else}
                  <p class="mt-3 py-3 text-sm text-slate-500">No data available</p>
                {/if}
              </article>
            {/each}
          </div>
        </section>
      {/each}

      <div class="mb-6">
        <ArticleAttribution verified={publishedDate ?? null} />
      </div>

      <section class="mb-12">
        {@render seoContent()}
      </section>

      <section class="mb-12">
        <AuthorCard
          name={PRESTON_HAYES_AUTHOR_NAME}
          image={PRESTON_HAYES_AUTHOR_IMAGE}
          description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
        />
      </section>

      <InternalLinkSection currentGame={gameTitle} />
    {/if}
  </div>

  <aside class="max-w-6xl mx-auto px-3 sm:px-4 py-12" aria-labelledby={`${gameKey}-more-games`}>
    <h2 id={`${gameKey}-more-games`} class="mb-6 text-center text-xl font-bold text-slate-800">More Games</h2>
    <nav class={`grid grid-cols-2 ${crossLinkColsClass} gap-4`} aria-label="More game links">
      {#each crossLinks as link}
        <a href={link.href} class="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition-colors hover:border-slate-200">
          <span class="mb-2 block text-3xl">{link.icon}</span>
          <span class="font-medium text-slate-700">{link.label}</span>
        </a>
      {/each}
    </nav>
  </aside>
</div>
