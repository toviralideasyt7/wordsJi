<script lang="ts">
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME } from '$lib/authors';

  let { data } = $props();
  const guide = $derived(data.guide);
  const canonical = $derived(`https://wordsolverx.com/guides/${guide.slug}`);

  // Rough reading-time estimate from the article body.
  const readingMinutes = $derived.by(() => {
    const wordCount =
      (guide.body.intro?.split(/\s+/).length ?? 0) +
      guide.body.sections.reduce((sum, s) => {
        const paras = (s.paragraphs ?? []).join(' ').split(/\s+/).length;
        const listItems = (s.list?.items ?? []).join(' ').split(/\s+/).length;
        const callout = (s.callout?.body ?? '').split(/\s+/).length;
        return sum + paras + listItems + callout;
      }, 0) +
      guide.body.faqs.reduce((sum, f) => sum + f.question.split(/\s+/).length + f.answer.split(/\s+/).length, 0);
    return Math.max(2, Math.round(wordCount / 220));
  });

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
</svelte:head>

<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6">
  <Breadcrumbs />
</div>

<header class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-4 pb-2">
  <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
    <span class="font-semibold text-teal-600 dark:text-teal-400">{guide.group}</span>
    <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">&middot;</span>
    <time datetime={guide.publishedDate}>{formattedDate}</time>
    <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">&middot;</span>
    <span>{readingMinutes} min read</span>
  </div>
  <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl lg:text-5xl leading-[1.15] text-balance">
    {guide.title}
  </h1>
  <div class="mt-5 flex items-center gap-3">
    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-sm font-bold shrink-0" aria-hidden="true">
      {PRESTON_HAYES_AUTHOR_NAME.split(' ').map((n) => n[0]).join('')}
    </div>
    <div class="text-sm">
      <p class="font-semibold text-slate-800 dark:text-slate-200">{PRESTON_HAYES_AUTHOR_NAME}</p>
      <p class="text-slate-500 dark:text-slate-400">Puzzle Content Editor</p>
    </div>
  </div>
</header>

<div class="py-6">
  <StaticArticle content={guide.body} />
</div>
