<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { generateWebPageSchema } from '$lib/seo';
</script>

<svelte:head>
  <title>Terms of Service - Using WordSolverX</title>
  <meta
    name="description"
    content="Review the WordSolverX terms of service for using our puzzle answer pages, archives, guides, and solver tools, including acceptable use and liability."
  />
  <link rel="canonical" href="https://wordsolverx.com/terms-of-service" />
  <meta property="og:title" content="Terms of Service - Using WordSolverX" />
  <meta
    property="og:description"
    content="Read the current terms and conditions for using WordSolverX and its puzzle tools."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/terms-of-service" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Terms of Service - Using WordSolverX" />
  <meta
    name="twitter:description"
    content="Review the rules, site usage terms, and limitations for WordSolverX."
  />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify(
    generateWebPageSchema(
      'Terms of Service - Using WordSolverX',
      'Terms and conditions and legal information for WordSolverX.',
      'https://wordsolverx.com/terms-of-service',
      { dateModified: '2026-03-14' }
    )
  )}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
  <Breadcrumbs />

  <div class="mb-10">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Terms of Service - Using WordSolverX</h1>
    <p class="mt-3 text-slate-500 dark:text-slate-400">Last updated: March 14, 2026</p>
  </div>

  <div class="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 p-6 sm:p-8">
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using https://wordsolverx.com, you agree to these Terms of Service - Using WordSolverX. If
        you do not agree, please do not use the site. These terms apply to all visitors, regardless
        of how you accessed the site or which pages you view. We may update these terms from time to
        time, and continued use of the site after any changes constitutes acceptance of the revised
        terms. It is your responsibility to review these terms periodically for updates.
      </p>

      <h2>2. Website Purpose</h2>
      <p>
        WordSolverX provides puzzle answer pages, archives, guides, and solver tools for
        informational and entertainment purposes. The site is intended to help users explore puzzle
        content, review past answers, and use solving tools more easily. We cover over 20 daily
        puzzle games including Wordle, Quordle, Nerdle, Worldle, Contexto, Betweenle, and many
        others. Each game has its own dedicated answer page, archive, and, in most cases, an
        interactive solver tool. Everything on the site is free to use and does not require account
        creation or sign-up.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>You agree not to misuse the site. This includes, without limitation:</p>
      <ul>
        <li>Trying to disrupt, damage, or overload the website or its infrastructure through denial-of-service attacks, excessive automated requests, or other means</li>
        <li>Attempting unauthorized access to data, accounts, or systems, including trying to access admin panels, databases, or internal APIs that are not publicly intended for use</li>
        <li>Using automated scraping or abusive traffic in a way that harms site availability for other users - this includes running bots that request hundreds of pages per second or scraping the entire site content for redistribution</li>
        <li>Copying site content in bulk for deceptive or competing uses, such as republishing our answer pages on another website without attribution or creating a derivative service that directly mirrors our content and functionality</li>
        <li>Using the site in any way that violates applicable laws or regulations in your jurisdiction</li>
      </ul>
      <p>
        We reserve the right to restrict access to users or automated systems that violate these
        guidelines. In most cases, we will attempt to contact you before taking action, but we may
        implement technical restrictions without prior notice if the misuse is causing immediate harm
        to the site or its users.
      </p>

      <h2>4. Intellectual Property and Trademarks</h2>
      <p>
        Unless otherwise noted, content created by WordSolverX belongs to WordSolverX. Puzzle names,
        trademarks, logos, and brands referenced on the site belong to their respective owners.
        WordSolverX is an independent website and is not affiliated with the official publishers of
        the puzzle games covered here unless explicitly stated.
      </p>

      <h2>5. Accuracy and Availability</h2>
      <p>
        We aim to keep the site accurate and up to date, but we do not guarantee that every page,
        answer, archive entry, or tool output will always be complete, correct, or available without
        interruption.
      </p>

      <h2>6. No Professional Advice</h2>
      <p>
        The content on WordSolverX is provided for general informational and entertainment purposes
        only. It is not legal, financial, medical, or other professional advice.
      </p>

      <h2>7. Third-Party Links and Services</h2>
      <p>
        Some pages may include links or embedded content from third-party services. WordSolverX is
        not responsible for the content, policies, or practices of third-party websites.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, WordSolverX will not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising out of or related to your
        use of the site.
      </p>

      <h2>9. Changes to These Terms</h2>
      <p>
        We may update these Terms of Service - Using WordSolverX from time to time. Any revised version will be
        posted on this page with a new last updated date.
      </p>

      <h2>10. Contact</h2>
      <p>
        If you have questions about these Terms of Service - Using WordSolverX, email
        <a href="mailto:wordsolverx@gmail.com">wordsolverx@gmail.com</a>
        or visit our <a href="/contact">contact page</a>.
      </p>
    </div>
  </div>
</div>
