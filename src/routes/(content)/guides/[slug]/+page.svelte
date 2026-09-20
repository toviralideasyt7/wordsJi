<script lang="ts">
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

  let { data } = $props();
  const guide = $derived(data.guide);
  const canonical = $derived(`https://wordsolverx.com/guides/${guide.slug}`);
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
  <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl lg:text-5xl">
    {guide.title}
  </h1>
</header>

<div class="py-6">
  <StaticArticle content={guide.body} />
</div>
