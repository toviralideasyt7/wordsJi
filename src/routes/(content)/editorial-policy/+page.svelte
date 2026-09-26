<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import {
    PRESTON_HAYES_AUTHOR_NAME,
    PRESTON_HAYES_AUTHOR_URL,
    PRESTON_HAYES_AUTHOR_IMAGE_URL,
    PRESTON_HAYES_AUTHOR_JOB_TITLE,
    PRESTON_HAYES_AUTHOR_KNOWS_ABOUT,
    PRESTON_HAYES_AUTHOR_SAME_AS
  } from '$lib/authors';
  import { generateWebPageSchema } from '$lib/seo';

  const editorialSchemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...generateWebPageSchema(
          'Editorial Policy - How We Publish Answers',
          'WordSolverX editorial policy: how we verify puzzle answers, validate article drafts, reuse cached article files, and handle corrections.',
          'https://wordsolverx.com/editorial-policy'
        )
      },
      {
        '@type': 'Article',
        headline: 'Editorial Policy - How We Publish Answers',
        description:
          'WordSolverX editorial policy: how we verify puzzle answers, validate article drafts, reuse cached article files, and handle corrections.',
        url: 'https://wordsolverx.com/editorial-policy',
        image: 'https://wordsolverx.com/wordsolverx.webp',
        datePublished: '2025-01-01',
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          '@type': 'Person',
          name: PRESTON_HAYES_AUTHOR_NAME,
          url: PRESTON_HAYES_AUTHOR_URL,
          image: PRESTON_HAYES_AUTHOR_IMAGE_URL,
          jobTitle: PRESTON_HAYES_AUTHOR_JOB_TITLE,
          knowsAbout: PRESTON_HAYES_AUTHOR_KNOWS_ABOUT,
          sameAs: PRESTON_HAYES_AUTHOR_SAME_AS
        },
        publisher: {
          '@type': 'Organization',
          name: 'WordSolverX',
          url: 'https://wordsolverx.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://wordsolverx.com/wordsolverx.webp'
          }
        },
        mainEntityOfPage: 'https://wordsolverx.com/editorial-policy'
      }
    ]
  };
</script>

<svelte:head>
  <title>Editorial Policy - How We Publish Answers</title>
  <meta
    name="description"
    content="WordSolverX editorial policy: how we verify puzzle answers, check article drafts against the implementation, handle corrections, and date our updates."
  />
  <link rel="canonical" href="https://wordsolverx.com/editorial-policy" />
  <meta property="og:title" content="Editorial Policy - How We Publish Answers" />
  <meta
    property="og:description"
    content="WordSolverX editorial policy: how we verify puzzle answers, check article drafts against the implementation, handle corrections, and date our updates."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/editorial-policy" />
  <meta property="og:image" content="https://wordsolverx.com/wordsolverx.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="WordSolverX Editorial Policy - How We Publish Answers" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Editorial Policy - How We Publish Answers" />
  <meta
    name="twitter:description"
    content="Learn how WordSolverX verifies answers, handles generated article text, and publishes corrections."
  />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify(editorialSchemas)}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
  <Breadcrumbs />
  <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.1]">
    Editorial Policy - How We Publish Answers
  </h1>
  <p class="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
    How WordSolverX verifies answers, validates supporting article drafts, reuses stored article files, and handles corrections.
  </p>

  <div class="mt-10 prose prose-slate dark:prose-invert max-w-none">
    <p class="font-semibold">
      AI disclosure: Some supporting article copy on WordSolverX is drafted with model assistance, then reviewed and approved by the human reviewer, <strong>Preston Hayes</strong>, the credited editor for WordSolverX, before publication. Preston Hayes is responsible for every page that publishes under this byline, including verification of any model-assisted draft. The answer data itself always comes from verified puzzle sources, never from generated text.
    </p>

    <h2>1. Answer Data Comes First</h2>
    <p>
      WordSolverX separates answer data from article copy. The answer card, archive entry, hints, and route date must come from the game's own source data, a verified endpoint, or a maintained dataset tied back to the game. The supporting article text is never used as the source of truth for the answer.
    </p>
    <p>
      If the answer layer and the article layer disagree, the answer layer wins and the article is rejected. We would rather publish an answer page without a long article than ship a page that mixes correct answer data with stale or fabricated commentary.
    </p>

    <h2>2. How We Source Different Games</h2>
    <p>
      Different games require different collection methods. Some have embedded answer lists or client payloads. Others expose data through APIs or can be refreshed from stable game rules and maintained datasets. The exact method varies by route, but the requirement stays the same: the data must be traceable to the game itself.
    </p>
    <p>
      When an upstream source is late or broken, WordSolverX may keep previously verified data instead of guessing. Later retry jobs can then refresh only the sources that were still missing.
    </p>

    <h2>3. How Supporting Articles Are Generated</h2>
    <p>
      Some daily answer pages can include a long-form article block. These drafts may be generated with model assistance, but only from the verified puzzle facts supplied for that route and date. The generator is instructed to avoid first-person gameplay claims, fabricated statistics, generic AI filler language, and off-topic story telling.
    </p>
    <p>
      WordSolverX currently prefers a Qwen-first model order, with route-level fallback only when the earlier model times out or returns invalid output. If a fallback model succeeds cleanly, the pipeline can promote that model for the rest of the current run to reduce repeated slow failures.
    </p>

    <h2>4. Validation Rules For Article Drafts</h2>
    <p>
      A returned draft is not accepted automatically. It must pass route-specific section checks, date-aware checks, word-count boundaries, internal link sanitation, banned-phrase filters, and first-person claim filters. Drafts can be rejected for stale dates, mismatched answer references, thin output, bloated output, or generic phrasing that does not clear our validators.
    </p>
    <p>
      If a draft fails validation, the answer page can still publish. In that case the stored article for that exact route and date is reused if it is still valid. If no valid stored article exists, the article block stays hidden for that date.
    </p>

    <h2>5. Caching And Regeneration Rules</h2>
    <p>
      Stored articles are cached by route and date. Normal source-code pushes rebuild the site with the existing cache and do not regenerate daily articles by default. Scheduled content runs and explicit article-generation runs are the jobs that create new daily article drafts.
    </p>
    <p>
      Scheduled runs also use grouped windows. The main site group runs first. Later schedules target other puzzle groups and can retry earlier groups when a previous window was still missing the current day's data. This reduces wasted same-day regeneration while still giving late upstream sources another chance to publish.
    </p>

    <h2>6. Content Standards</h2>
    <p>
      The first standard is accuracy. The second is usefulness. A page should make the answer easy to verify and then offer optional context only when that context is specific to the puzzle and worth reading. We do not treat word count as a quality goal by itself.
    </p>
    <p>
      We do not allow fabricated personal playthroughs, invented review logs, made-up percentages, or unsupported authority claims. If a route cannot support a trustworthy long-form article on a given date, the safer outcome is to omit the article.
    </p>

    <h2>7. Corrections</h2>
    <p>
      Answer errors, archive errors, and solver-result errors are handled as high-priority issues. Reports are checked against the relevant game source or maintained dataset before a change is made. Once verified, the affected data is updated and the relevant pages are rebuilt and redeployed.
    </p>
    <p>
      We do not promise a public correction note for every edit, but verified answer errors are treated seriously. If you report one, include the page URL, game name, puzzle date, and what you believe is incorrect.
    </p>

    <h2>8. Contact</h2>
    <p>
      Report corrections, stale answer pages, broken solvers, or article issues through <a href="/contact">our contact page</a> or by email at <a href="mailto:blog@wordsolverx.com">blog@wordsolverx.com</a>. Useful reports usually include the URL, puzzle date, your time zone if it matters, and a short description of the problem.
    </p>
  </div>
</div>
