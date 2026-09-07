<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { generateWebPageSchema } from '$lib/seo';
</script>

<svelte:head>
  <title>Privacy Policy</title>
  <meta
    name="description"
    content="Read the WordSolverX privacy policy for browser storage, analytics, advertising disclosures, cookie choices, and contact information."
  />
  <link rel="canonical" href="https://wordsolverx.com/privacy-policy" />
  <meta property="og:title" content="Privacy Policy" />
  <meta
    property="og:description"
    content="Review how WordSolverX handles browser storage, analytics, advertising, and privacy requests."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/privacy-policy" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Privacy Policy" />
  <meta
    name="twitter:description"
    content="See how WordSolverX handles privacy, cookie preferences, analytics, and advertising disclosures."
  />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify(
    generateWebPageSchema(
      'Privacy Policy',
      'Privacy policy and data handling information for WordSolverX.',
      'https://wordsolverx.com/privacy-policy',
      { dateModified: '2026-05-26' }
    )
  )}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
  <Breadcrumbs />

  <div class="mb-10">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Privacy Policy</h1>
    <p class="mt-3 text-slate-500 dark:text-slate-400">Last updated: May 26, 2026</p>
  </div>

  <div class="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 p-6 sm:p-8">
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p class="lead text-lg">
        This Privacy Policy explains how WordSolverX may collect, use, store, and disclose information
        when you visit https://wordsolverx.com, use our puzzle pages, or contact us directly.
      </p>

      <h2>1. Information You Provide Voluntarily</h2>
      <p>
        If you email WordSolverX, we may receive the information you include in that message, such as
        your name, email address, the content of your message, and any other details you choose to send.
      </p>

      <h2>2. Technical Data and Hosting Logs</h2>
      <p>
        Like most websites, WordSolverX and its hosting providers may automatically record basic
        technical information such as IP address, browser type, device type, referring page, timestamps,
        and requested pages. This information is used for site operations, security, troubleshooting,
        and performance review.
      </p>

      <h2>3. Browser Storage and Site Preferences</h2>
      <p>
        Some WordSolverX tools store preferences directly in your browser so the experience works
        smoothly the next time you visit. Examples include solver settings, selected modes, and word
        length choices.
      </p>
      <p>
        These settings remain on your device until you clear them through your browser.
      </p>

      <h2>4. Analytics and Advertising</h2>
      <p>
        WordSolverX uses third-party services for analytics and advertising.
      </p>

      <h3>Google Analytics</h3>
      <p>
        We may load Google Analytics to understand aggregate traffic, page usage, and general site
        performance. Google may process device, browser, and usage information according to its own
        privacy documentation.
      </p>

      <h3>Advertising</h3>
      <p>
        WordSolverX displays advertisements served by our advertising partner (Ezoic) through its
        script at www.ezojs.com. Our partner and its advertising network may use cookies or
        similar technologies to serve ads based on your visits to this site and other sites.
      </p>
      <ul>
        <li>
          Our advertising partner manages its own consent controls for ad personalization in line with
          industry frameworks.
        </li>
        <li>
          You can learn more about ad industry opt-out tools at
          <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">aboutads.info/choices</a>.
        </li>
      </ul>

      <h2>5. Cookie Choices</h2>
      <p>
        You can manage cookies and similar storage through your browser settings. Most browsers let you
        block or delete cookies, though doing so may affect how third-party services behave on this and
        other sites.
      </p>

      <h2>6. Embedded and Third-Party Content</h2>
      <p>
        Some pages may embed or link to third-party content such as videos, game websites, or advertising
        providers. If you interact with third-party content, those services may collect information under
        their own privacy policies.
      </p>

      <h2>7. How We Use Information</h2>
      <p>We may use the information described in this policy to:</p>
      <ul>
        <li>Operate, maintain, and improve WordSolverX</li>
        <li>Remember simple tool preferences in your browser</li>
        <li>Respond to support, correction, legal, or business inquiries</li>
        <li>Review technical issues, abuse, and security events</li>
        <li>Measure site traffic and ad delivery when you have accepted optional cookies</li>
      </ul>

      <h2>8. Data Sharing</h2>
      <p>
        WordSolverX does not sell your personal information. Information may be processed by hosting,
        infrastructure, analytics, advertising, or embedded service providers only as needed to operate
        the site and any services you have chosen to enable.
      </p>

      <h2>9. Data Retention</h2>
      <p>
        Email correspondence may be kept for as long as reasonably necessary to respond, maintain
        records, or follow up on a site issue. Browser-stored preferences remain on your device until
        you clear them or change them.
      </p>

      <h2>10. Your Rights and Choices</h2>
      <p>
        Depending on where you live, you may have rights related to access, correction, deletion, or
        objection to the processing of your personal information. To make a request, email
        <a href="mailto:wordsolverx@gmail.com">wordsolverx@gmail.com</a>.
      </p>

      <h2>11. Children&apos;s Privacy</h2>
      <p>
        WordSolverX is not directed specifically to children under 13, and we do not knowingly collect
        personal information from children through this website.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time as the site changes. Any updates will be
        posted on this page with a revised last updated date.
      </p>

      <h2>13. Contact</h2>
      <p>
        If you have questions about this Privacy Policy or advertising disclosures,
        contact <a href="mailto:wordsolverx@gmail.com">wordsolverx@gmail.com</a>.
      </p>
    </div>
  </div>
</div>
