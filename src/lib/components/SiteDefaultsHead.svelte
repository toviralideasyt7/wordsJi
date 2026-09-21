<script lang="ts">
  import { page } from '$app/state';
  import { generateOrganizationSchema, generateArticleSchema } from '$lib/seo';

  const organizationSchema = generateOrganizationSchema();
  const currentUrl = $derived(`https://wordsolverx.com${page.url.pathname}`);
  const currentTitle = $derived(page.data?.meta?.title ?? page.data?.title ?? '');
  const pathname = $derived(page.url.pathname);

  const isArticleRoute = $derived(
    pathname.endsWith('-answer-today') ||
      pathname.endsWith('-answer-today-updated') ||
      pathname.endsWith('-archive') ||
      pathname === '/today' ||
      pathname === '/archive' ||
      pathname === '/canuckle-archive' ||
      pathname.startsWith('/guides/') ||
      pathname.startsWith('/wordle-answer-for-') ||
      pathname.startsWith('/colordle-answer-for-')
  );

  const articleSchema = $derived(
    isArticleRoute
      ? generateArticleSchema({
          headline: currentTitle || pathname,
          description:
            (page.data?.meta?.description as string | undefined) ??
            'Daily puzzle answers, solver tools, archives, and strategy guides for Wordle and other popular puzzle games.',
          url: currentUrl,
          image: 'https://wordsolverx.com/wordsolverx.webp',
          datePublished: (page.data?.publishedDate as string | undefined) ?? new Date().toISOString().split('T')[0],
          // Daily answer pages rebuild every puzzle day but set only publishedDate,
          // so falling straight through to the build date would report an edit that
          // did not happen. Prefer the puzzle date; guides still supply modifiedDate.
          dateModified:
            (page.data?.modifiedDate as string | undefined) ??
            (page.data?.publishedDate as string | undefined) ??
            new Date().toISOString().split('T')[0],
          authorName: 'Preston Hayes',
          authorImage: 'https://wordsolverx.com/author-wordsolverx.webp',
          authorJobTitle: 'Puzzle Content Editor',
          authorKnowsAbout: ['Wordle', 'Word Puzzles', 'Daily Puzzle Answers', 'Puzzle Solver Tools', 'Information Theory'],
          authorSameAs: ['https://www.pinterest.com/wordsolverx/'],
          // Optional enrichment: only routes that supply these emit them, so
          // every other page's Article JSON-LD is unchanged.
          wordCount: page.data?.wordCount as number | undefined,
          articleSection: page.data?.articleSection as string | undefined,
          keywords: page.data?.keywords as string[] | undefined
        })
      : null
  );
</script>

<svelte:head>
  <link rel="icon" type="image/webp" href="/wordsolverx-favicon.webp" />
  <meta name="theme-color" content="#10b981" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="https://wordsolverx.com/wordsolverx.webp" />
  <meta property="og:image:width" content="768" />
  <meta property="og:image:height" content="319" />
  <meta property="og:image:alt" content="WordSolverX - Daily Puzzle Answers and Solver Tools" />
  <meta name="twitter:site" content="@WordSolverX" />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  <link rel="apple-touch-icon" href="/wordsolverx-favicon.webp" />
  <link rel="alternate" hreflang="en" href={currentUrl} />
  <link rel="alternate" hreflang="x-default" href={currentUrl} />
  <meta name="author" content="Preston Hayes" />
  {@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>`}
  {#if articleSchema}
    {@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
  {/if}
</svelte:head>
