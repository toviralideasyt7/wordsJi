<script lang="ts">
  import type { StaticArticleContent } from '$lib/content/registry';
  import { generateFAQSchema } from '$lib/seo';

  let { content }: { content: StaticArticleContent } = $props();

  const faqSchema = $derived(
    content.faqs.length > 0 ? JSON.stringify(generateFAQSchema(content.faqs)) : null
  );
</script>

<svelte:head>
  {#if faqSchema}
    {@html `<script type="application/ld+json">${faqSchema}</script>`}
  {/if}
</svelte:head>

<article class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8" data-static-article>
  <!-- Intro block: direct, snippet-friendly opening -->
  <div class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:p-8">
    {#if content.eyebrow}
      <p class="text-xs font-bold uppercase tracking-[0.22em] text-teal-600 mb-3">{content.eyebrow}</p>
    {/if}
    <p class="text-lg leading-relaxed text-slate-700 sm:text-xl">{@html content.intro}</p>
  </div>

  <!-- Body sections: each article has its own H2 blueprint -->
  {#each content.sections as section, i}
    <section class="mt-10 sm:mt-12" data-section={i}>
      <div class="mb-5 flex items-start gap-3">
        <span class="mt-1.5 block h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500" aria-hidden="true"></span>
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{section.heading}</h2>
      </div>

      {#if (section.paragraphs?.length ?? 0) > 0}
        <div class="space-y-4">
          {#each section.paragraphs ?? [] as paragraph}
            <p class="leading-relaxed text-slate-600 sm:text-lg">{@html paragraph}</p>
          {/each}
        </div>
      {/if}

      {#if section.list}
        <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {#if section.list.title}
            <h3 class="text-lg font-bold text-slate-900 mb-3">{section.list.title}</h3>
          {/if}
          <ul class="space-y-3">
            {#each section.list.items as item}
              <li class="flex items-start gap-3 text-slate-600 sm:text-lg">
                <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-hidden="true"></span>
                <span>{@html item}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if section.callout}
        <div class="mt-5 rounded-2xl border-l-4 border-teal-500 bg-teal-50 p-5 sm:p-6">
          {#if section.callout.title}
            <p class="text-sm font-bold uppercase tracking-wide text-teal-700 mb-2">{section.callout.title}</p>
          {/if}
          <p class="leading-relaxed text-slate-700 sm:text-lg">{@html section.callout.body}</p>
        </div>
      {/if}
    </section>
  {/each}

  <!-- FAQ block: visible content (never hidden behind accordions) for crawlability -->
  {#if content.faqs.length > 0}
    <section class="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="mb-6 flex items-center gap-2">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{content.faqHeading ?? 'Frequently Asked Questions'}</h2>
      </div>
      <div class="space-y-6">
        {#each content.faqs as faq}
          <div class="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
            <h3 class="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
            <p class="leading-relaxed text-slate-600 sm:text-lg">{faq.answer}</p>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Related tools: internal linking hub -->
  {#if content.relatedLinks.length > 0}
    <section class="mt-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg sm:p-8">
      <h2 class="text-xl font-extrabold text-white mb-5 sm:text-2xl">More WordSolverX tools</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        {#each content.relatedLinks as link}
          <a
            href={link.href}
            class="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white transition hover:bg-white/15 hover:border-white/25"
          >
            <span class="font-semibold">{link.label}</span>
            <span class="text-teal-300 transition group-hover:translate-x-1" aria-hidden="true">→</span>
          </a>
        {/each}
      </div>
    </section>
  {/if}
</article>
