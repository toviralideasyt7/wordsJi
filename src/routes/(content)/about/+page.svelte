<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME,
    PRESTON_HAYES_AUTHOR_URL,
    getPrestonHayesAuthorSchema
  } from '$lib/authors';

  const aboutSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About WordSolverX',
      description: 'About page for WordSolverX and its puzzle answer, archive, and solver content.',
      url: 'https://wordsolverx.com/about'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'About WordSolverX',
      description: 'Learn about WordSolverX, its puzzle answer pages, archives, solver tools, and guides.',
      url: 'https://wordsolverx.com/about'
    },
    {
      ...getPrestonHayesAuthorSchema(),
      url: PRESTON_HAYES_AUTHOR_URL,
      description: PRESTON_HAYES_AUTHOR_DESCRIPTION,
      worksFor: {
        '@type': 'Organization',
        name: 'WordSolverX',
        url: 'https://wordsolverx.com'
      }
    }
  ];
</script>

<svelte:head>
  <title>About WordSolverX | Puzzle Answers, Archives, and Solver Tools</title>
  <meta
    name="description"
    content="Learn about WordSolverX and how we publish daily puzzle answers, archives, solver tools, and puzzle guides."
  />
  <link rel="canonical" href="https://wordsolverx.com/about" />
  <meta property="og:title" content="About WordSolverX | Puzzle Answers, Archives, and Solver Tools" />
  <meta
    property="og:description"
    content="See what WordSolverX offers, which puzzle tools we cover, and how the site stays updated."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/about" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="About WordSolverX | Puzzle Answers, Archives, and Solver Tools" />
  <meta
    name="twitter:description"
    content="Learn about WordSolverX, our puzzle resources, and how the site helps players every day."
  />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify(aboutSchemas)}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
  <Breadcrumbs />

  <div class="mb-10">
    <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.1]">
      About WordSolverX
    </h1>
    <p class="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
      An independent puzzle resource built for people who want fast answer checks, useful archives, and solver tools that do not bury the page under clutter.
    </p>
  </div>

  <div class="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20">
    <h2 class="text-slate-900 dark:text-slate-50">What WordSolverX Is</h2>
    <p>
      WordSolverX publishes daily puzzle answers, answer archives, and interactive solver tools for Wordle and many other daily games. The site is independent. It is not affiliated with The New York Times, any puzzle publisher, or any official game operator.
    </p>
    <p>
      The core idea is simple: answer first, extra context second. If you only need today's answer, the page should give it to you quickly. If you want hints, archive access, or a solver, those should be available without making the answer harder to reach.
    </p>

    <h2 class="text-slate-900 dark:text-slate-50">What You Will Find Here</h2>
    <p>
      <strong>Today's Answers</strong> - Daily answer pages for the games we track. These pages are designed to surface the current answer quickly, then offer optional hints, archive links, and route-specific context below.
    </p>
    <p>
      <strong>Solver Tools</strong> - Browser-based tools for Wordle, Quordle, Nerdle, Waffle, Worldle, Betweenle, character-guessing games, and many more. The goal is to help players work through a puzzle instead of blindly jumping to the answer.
    </p>
    <p>
      <strong>Archives</strong> - Historical answer lookups by date for supported games. Archives are meant to be quick to search and easy to scan.
    </p>
    <p>
      <strong>Guides</strong> - Strategy pages and explainers for games where a deeper breakdown is useful.
    </p>

    <h2 class="text-slate-900 dark:text-slate-50">How The Site Works</h2>
    <p>
      WordSolverX is built with SvelteKit and deployed on Cloudflare Pages. Most answer pages are statically generated at build time so the answer, page date, and supporting metadata are already in the HTML before the browser loads the page.
    </p>
    <p>
      Solver tools run in the browser. Some use WebAssembly for speed, while others use plain client-side logic. The site also uses scheduled jobs to refresh game datasets and publish new static pages when daily answers roll over.
    </p>

    <h2 class="text-slate-900 dark:text-slate-50">How Answers Are Sourced</h2>
    <p>
      Answer data comes from game source material, published payloads, verified APIs, or maintained datasets that trace back to stable game rules. The exact method varies by game, but the rule does not: the answer itself must come from the game, not from guesswork and not from article text.
    </p>
    <p>
      When a source is late or fails, WordSolverX may keep the last verified data rather than inventing a replacement. Follow-up retry jobs can then refresh only the sources that were still missing.
    </p>

    <h2 class="text-slate-900 dark:text-slate-50">How Article Content Works</h2>
    <p>
      Some answer pages also include a long-form article block. That copy can be drafted with model assistance, but it is not the source of truth for the page. The answer card, hints, route date, and archive data come from verified puzzle data first.
    </p>
    <p>
      Before a generated article can appear, it has to pass route-specific structure checks, date-aware checks, banned-phrase filters, and quality thresholds. If a draft fails those checks, the answer page still publishes and the article block stays hidden for that date instead of showing stale or invented copy.
    </p>

    <h2 class="text-slate-900 dark:text-slate-50">Independent Status</h2>
    <p>
      WordSolverX is an unofficial fan and reference site. Puzzle names, logos, and trademarks belong to their respective owners and are used here for identification and commentary only.
    </p>

    <h2 class="text-slate-900 dark:text-slate-50">Corrections</h2>
    <p>
      If an answer, archive entry, or solver result looks wrong, we want to know. The fastest report includes the page URL, game name, puzzle date, your time zone if it matters, and what you believe should be corrected. More about our verification and correction process is available in the <a href="/editorial-policy">Editorial Policy</a>.
    </p>

    <section id="preston-hayes" class="scroll-mt-20">
      <h2 class="text-slate-900 dark:text-slate-50">About Preston Hayes</h2>
      <p>
        Preston Hayes is the credited editorial byline for WordSolverX answer pages and puzzle content. The focus of that editorial role is practical accuracy: make the answer easy to verify, keep the page readable, and avoid padding the page with claims that cannot be supported by the puzzle data.
      </p>
      <p>
        The standard is straightforward. If a player can reach the page, confirm the answer quickly, and use the rest of the page only when it is genuinely helpful, the content is doing its job.
      </p>
    </section>
  </div>

  <div class="mt-10">
    <AuthorCard
      name={PRESTON_HAYES_AUTHOR_NAME}
      image={PRESTON_HAYES_AUTHOR_IMAGE}
      description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
    />
  </div>
</div>
