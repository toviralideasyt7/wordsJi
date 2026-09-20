<script lang="ts">
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import GuideToc from '$lib/components/article/GuideToc.svelte';
  import KeyTakeaways from '$lib/components/article/KeyTakeaways.svelte';
  import RelatedGuides from '$lib/components/article/RelatedGuides.svelte';
  import ReadingProgress from '$lib/components/article/ReadingProgress.svelte';
  import { articleHeadings } from '$lib/content/article-metrics';
  import { generateBreadcrumbSchema, generateHowToSchema } from '$lib/seo';
  import { PRESTON_HAYES_AUTHOR_NAME } from '$lib/authors';

  let { data } = $props();
  const guide = $derived(data.guide);
  const canonical = $derived(`https://wordsolverx.com/guides/${guide.slug}`);
  const headings = $derived(articleHeadings(guide.body));
  const readingMinutes = $derived(data.readingMinutes ?? 2);

  /**
   * Breadcrumbs renders its own BreadcrumbList derived from the URL slug. We
   * suppress that (hideSchema) and emit one whose final name is the real
   * article title, so there is exactly one BreadcrumbList per page.
   */
  const breadcrumbSchema = $derived(
    JSON.stringify(
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://wordsolverx.com' },
        { name: 'Guides', url: 'https://wordsolverx.com/guides' },
        { name: guide.title, url: canonical }
      ])
    )
  );

  /** HowTo is emitted only for the procedural walkthroughs. */
  const howToSchema = $derived(
    guide.howToSteps?.length ? JSON.stringify(generateHowToSchema(guide.title, guide.howToSteps)) : null
  );

  const formattedDate = $derived(
    new Date(guide.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
</script>

<svelte:head>
  <title>{guide.title}</title>
  <meta name="description" content={guide.description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={guide.title} />
  <meta property="og:description" content={guide.description} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={canonical} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={guide.title} />
  <meta name="twitter:description" content={guide.description} />
  {@html `<script type="application/ld+json">${breadcrumbSchema}</script>`}
  {#if howToSchema}
    {@html `<script type="application/ld+json">${howToSchema}</script>`}
  {/if}
</svelte:head>

<ReadingProgress />

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
  <Breadcrumbs hideSchema />
</div>

<header class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-2">
  <div
    class="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50 p-6 shadow-sm sm:p-9 dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-teal-950"
  >
    <div
      class="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-gradient-to-br from-teal-400/25 to-emerald-400/10 blur-3xl"
      aria-hidden="true"
    ></div>

    <div class="relative">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
        <span
          class="rounded-full bg-gradient-to-br {guide.gradient} px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
          >{guide.group}</span
        >
        <time datetime={guide.publishedDate}>{formattedDate}</time>
        <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">&middot;</span>
        <span>{readingMinutes} min read</span>
      </div>

      <h1
        class="mt-4 text-3xl font-extrabold leading-[1.12] tracking-tight text-balance text-slate-900 sm:text-4xl lg:text-5xl xl:text-6xl dark:text-slate-50"
      >
        {guide.title}
      </h1>

      <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
        {guide.description}
      </p>

      <div class="mt-6 flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white"
          aria-hidden="true"
        >
          {PRESTON_HAYES_AUTHOR_NAME.split(' ').map((n) => n[0]).join('')}
        </div>
        <div class="text-sm">
          <p class="font-semibold text-slate-800 dark:text-slate-200">{PRESTON_HAYES_AUTHOR_NAME}</p>
          <p class="text-slate-500 dark:text-slate-400">Puzzle Content Editor</p>
        </div>
      </div>
    </div>
  </div>
</header>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
  <!-- Rendered here rather than inside StaticArticle so that component's HTML
       stays byte-identical for its other consumers. -->
  {#if guide.body.keyTakeaways?.length}
    <KeyTakeaways items={guide.body.keyTakeaways} />
  {/if}

  <div class="mt-2 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-14">
    <!-- The TOC is one instance: on mobile it is a <details> that sits above the
         article, on lg+ it moves to the sticky right-hand rail. -->
    <div class="lg:col-start-2 lg:row-start-1">
      <GuideToc {headings} />
    </div>

    <div class="lg:col-start-1 lg:row-start-1">
      <StaticArticle
        content={guide.body}
        containerClass="w-full max-w-none"
        toc="none"
        motion={true}
        scale="large"
      />

      <RelatedGuides slug={guide.slug} group={guide.group} />
    </div>
  </div>
</div>
