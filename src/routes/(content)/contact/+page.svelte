<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { generateWebPageSchema } from '$lib/seo';

  let contactType = 'Correction';
  let name = '';
  let email = '';
  let pageUrl = '';
  let details = '';

  function openMailDraft() {
    const subject = `[${contactType}] WordSolverX`;
    const bodySections = [
      `Contact type: ${contactType}`,
      name.trim() ? `Name: ${name.trim()}` : '',
      email.trim() ? `Reply email: ${email.trim()}` : '',
      pageUrl.trim() ? `Page URL: ${pageUrl.trim()}` : '',
      '',
      'Details:',
      details.trim() || 'Please describe the issue or request here.'
    ].filter(Boolean);

    const href = `mailto:wordsolverx@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodySections.join('\n'))}`;
    window.location.href = href;
  }
</script>

<svelte:head>
  <title>Contact | Support, Feedback, and Corrections</title>
  <meta
    name="description"
    content="Contact WordSolverX for support, corrections, privacy questions, legal notices, or general feedback about our puzzle pages and solver tools."
  />
  <link rel="canonical" href="https://wordsolverx.com/contact" />
  <meta property="og:title" content="Contact | Support, Feedback, and Corrections" />
  <meta
    property="og:description"
    content="Reach WordSolverX by email for corrections, support, legal notices, and puzzle site feedback."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/contact" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Contact | Support, Feedback, and Corrections" />
  <meta
    name="twitter:description"
    content="Get in touch with WordSolverX for support, feedback, correction requests, and legal notices."
  />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact WordSolverX',
      description: 'Contact page for WordSolverX support, feedback, corrections, and legal inquiries.',
      url: 'https://wordsolverx.com/contact',
      email: 'wordsolverx@gmail.com'
    },
    {
      ...generateWebPageSchema(
        'Contact WordSolverX',
        'Contact WordSolverX for support, corrections, feedback, and legal questions.',
        'https://wordsolverx.com/contact'
      )
    }
  ])}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
  <Breadcrumbs />

  <div class="mb-12">
    <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.1]">
      Contact WordSolverX
    </h1>
    <p class="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
      Questions, corrections, privacy requests, DMCA notices, or feature suggestions. Email works best.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
    <div class="lg:col-span-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 p-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Email Us Directly</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
        For support, corrections, business inquiries, privacy questions, or copyright notices:
      </p>
      <a
        href="mailto:wordsolverx@gmail.com"
        class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40 text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        wordsolverx@gmail.com
      </a>

      <div class="mt-8">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-50 mb-3">What To Contact Us About</h3>
        <ul class="space-y-2.5">
          {#each [
            { label: 'Answer corrections', desc: 'Wrong answer on a daily page or in an archive' },
            { label: 'Solver issues', desc: 'Tool producing incorrect results or broken behavior' },
            { label: 'New game requests', desc: 'Puzzle games you want us to cover' },
            { label: 'Business inquiries', desc: 'Partnerships, media, or advertising questions' },
            { label: 'Privacy or legal', desc: 'Cookie, DMCA, takedown, or data questions' },
            { label: 'Site feedback', desc: 'Usability problems, design suggestions, or content ideas' }
          ] as item}
            <li class="flex items-start gap-3 text-sm">
              <span class="mt-0.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
              <div>
                <span class="font-semibold text-slate-900 dark:text-slate-100">{item.label}</span>
                <span class="text-slate-500 dark:text-slate-400"> - {item.desc}</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>

      <div class="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-50 mb-3">Quick Contact Form</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
          This opens your email app with the details filled in so correction requests and bug reports are easier to send in one pass.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block text-sm">
            <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Contact type</span>
            <select bind:value={contactType} class="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100">
              <option>Correction</option>
              <option>Solver issue</option>
              <option>Feedback</option>
              <option>Business inquiry</option>
              <option>Privacy or legal</option>
            </select>
          </label>
          <label class="block text-sm">
            <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Your name</span>
            <input bind:value={name} type="text" class="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100" placeholder="Optional" />
          </label>
          <label class="block text-sm">
            <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Reply email</span>
            <input bind:value={email} type="email" class="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100" placeholder="Optional" />
          </label>
          <label class="block text-sm">
            <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Page URL</span>
            <input bind:value={pageUrl} type="url" class="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100" placeholder="https://wordsolverx.com/..." />
          </label>
        </div>
        <label class="mt-4 block text-sm">
          <span class="mb-1 block font-medium text-slate-700 dark:text-slate-200">Details</span>
          <textarea bind:value={details} rows="6" class="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100" placeholder="Tell us what is wrong, what you expected, and the puzzle date if it matters."></textarea>
        </label>
        <button
          type="button"
          onclick={openMailDraft}
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
        >
          Open Pre-Filled Email
        </button>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-4">
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">Follow WordSolverX</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
        We share puzzle updates and site links on these platforms.
      </p>

      {#each [
        { name: 'Facebook', url: 'https://www.facebook.com/wordsolverx/', handle: 'facebook.com/wordsolverx' },
        { name: 'Pinterest', url: 'https://www.pinterest.com/wordsolverx/', handle: 'pinterest.com/wordsolverx' },
        { name: 'Telegram', url: 'https://t.me/wordsolverx', handle: 't.me/wordsolverx' }
      ] as social}
        <a
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all duration-200 group"
        >
          <span class="font-semibold text-sm text-slate-900 dark:text-slate-100">{social.name}</span>
          <span class="text-xs text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{social.handle}</span>
        </a>
      {/each}
    </div>
  </div>

  <div class="mt-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 p-6">
    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Before You Write</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none text-sm">
      <p>
        Include the page URL, game name, puzzle date, and your time zone when it matters. If you are reporting a solver issue, describe the letters, colors, or inputs you used and what result you expected.
      </p>
      <p>
        Messages are reviewed manually. Some corrections are fixed quickly on the site before a full reply is sent, especially when the problem is easy to verify against a game source.
      </p>
      <p>
        For policy-related questions, you can also review our <a href="/editorial-policy">Editorial Policy</a>, <a href="/privacy-policy">Privacy Policy</a>, and <a href="/dmca-policy">DMCA Policy</a>.
      </p>
    </div>
  </div>

  <div class="mt-16">
    <div class="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20">
      <h2 class="text-slate-900 dark:text-slate-50">How Feedback Is Handled</h2>
      <p>
        The highest-priority reports are wrong answers, broken solvers, stale daily pages, and source-data failures. Those are checked first because they affect the core usefulness of the site. Broader suggestions such as new features or new games are tracked separately.
      </p>
      <p>
        Not every reported difference is a true error. Some games reset at different times, run multiple modes, or use region-sensitive variations. That is why we verify reports against the relevant route data before changing a page.
      </p>
      <p>
        If you need a takedown request or copyright notice handled, use the same email address and include the information listed in our <a href="/dmca-policy">DMCA Policy</a>.
      </p>
    </div>
  </div>
</div>
