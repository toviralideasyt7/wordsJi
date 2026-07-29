<script lang="ts">
  import { page } from '$app/state';
  import { generateOrganizationSchema } from '$lib/seo';

  const organizationSchema = generateOrganizationSchema();
  const currentUrl = $derived(`https://wordsolverx.com${page.url.pathname}`);
</script>

<svelte:head>
  <link rel="icon" type="image/webp" href="/wordsolverx-favicon.webp" />
  <title>WordSolverX | Wordle & Puzzle Solvers</title>
  <meta name="theme-color" content="#10b981" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="https://wordsolverx.com/wordsolverx.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="WordSolverX - Daily Puzzle Answers and Solver Tools" />
  <meta name="twitter:site" content="@WordSolverX" />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  <link rel="apple-touch-icon" href="/wordsolverx-favicon.webp" />
  <link rel="alternate" hreflang="en" href={currentUrl} />
  <link rel="alternate" hreflang="x-default" href={currentUrl} />
  <meta name="author" content="Preston Hayes" />
  {@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>`}
</svelte:head>
