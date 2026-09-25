<script lang="ts">
  import type { StaticArticleContent, StaticArticleVisual } from '$lib/content/registry';
  import { generateFAQSchema } from '$lib/seo';
  import { substituteVars, slugifyHeading } from '$lib/content/article-metrics';
  import { reveal } from '$lib/actions/reveal';
  import ArticleVisual from './article/ArticleVisual.svelte';

  /**
   * Every new behaviour here is opt-in. The defaults reproduce the previous
   * rendering exactly, because ~50 (interactive) pages and ArchiveCalendar
   * render this component and must keep their current HTML.
   */
  let {
    content,
    vars = {},
    containerClass = 'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8',
    toc = 'inline',
    motion = false,
    scale = 'default'
  }: {
    content: StaticArticleContent;
    vars?: Record<string, string>;
    /** Wrapper classes. Callers that own their own layout pass 'w-full max-w-none'. */
    containerClass?: string;
    /** 'inline' keeps today's >3-heading in-article TOC; 'none' suppresses it. */
    toc?: 'inline' | 'none';
    /** Opt in to scroll-reveal gestures (client JS only, below-the-fold only). */
    motion?: boolean;
    /** 'large' bumps the type scale — used by the long-form guides. */
    scale?: 'default' | 'large';
  } = $props();

  const sub = (text: string) => substituteVars(text, vars);

  const faqSchema = $derived(
    content.faqs.length > 0
      ? JSON.stringify(
          generateFAQSchema(
            content.faqs.map((faq) => ({ question: sub(faq.question), answer: sub(faq.answer) }))
          )
        )
      : null
  );

  const headings = $derived(
    content.sections.map((section) => ({
      heading: sub(section.heading),
      id: slugifyHeading(section.heading, vars)
    }))
  );

  const large = $derived(scale === 'large');
  const showInlineToc = $derived(toc !== 'none' && headings.length > 3);

  const s = $derived({
    sectionSpacing: large ? 'mt-12 sm:mt-16' : 'mt-10 sm:mt-12',
    proseGap: large ? 'space-y-5' : 'space-y-4',
    intro: large
      ? 'text-xl leading-relaxed text-slate-700 sm:text-2xl'
      : 'text-lg leading-relaxed text-slate-700 sm:text-xl',
    body: large
      ? 'text-lg leading-relaxed text-slate-600 lg:text-xl'
      : 'leading-relaxed text-slate-600 sm:text-lg',
    h2: large
      ? 'scroll-mt-24 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl'
      : 'scroll-mt-24 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl',
    // The FAQ heading has no anchor id, so it must not carry scroll-mt-24.
    h2Plain: large
      ? 'text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl'
      : 'text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl',
    h3: large ? 'text-xl font-bold text-slate-900' : 'text-lg font-bold text-slate-900'
  });

  function sectionVisuals(section: StaticArticleContent['sections'][number]): StaticArticleVisual[] {
    if (!section.visual) return [];
    return Array.isArray(section.visual) ? section.visual : [section.visual];
  }

  function applyVars(section: StaticArticleContent['sections'][number]) {
    return {
      heading: sub(section.heading),
      paragraphs: (section.paragraphs ?? []).map(sub),
      list: section.list
        ? { title: section.list.title ? sub(section.list.title) : undefined, items: section.list.items.map(sub) }
        : undefined,
      callout: section.callout ? { title: sub(section.callout.title ?? ''), body: sub(section.callout.body) } : undefined,
      visuals: sectionVisuals(section).map((visual) => applyVisualVars(visual))
    };
  }

  /** Figure copy can also carry {token} placeholders, so resolve it the same way. */
  function applyVisualVars(visual: StaticArticleVisual): StaticArticleVisual {
    const base = {
      title: visual.title ? sub(visual.title) : undefined,
      caption: visual.caption ? sub(visual.caption) : undefined
    };
    switch (visual.type) {
      case 'tiles':
        return {
          ...visual,
          ...base,
          rows: visual.rows.map((row) => ({ ...row, note: row.note ? sub(row.note) : undefined }))
        };
      case 'bars':
        return {
          ...visual,
          ...base,
          bars: visual.bars.map((bar) => ({ ...bar, label: sub(bar.label), note: bar.note ? sub(bar.note) : undefined }))
        };
      case 'steps':
        return {
          ...visual,
          ...base,
          steps: visual.steps.map((step) => ({ title: sub(step.title), body: sub(step.body) }))
        };
      case 'stats':
        return {
          ...visual,
          ...base,
          stats: visual.stats.map((stat) => ({
            value: sub(stat.value),
            label: sub(stat.label),
            note: stat.note ? sub(stat.note) : undefined
          }))
        };
      case 'table':
        return {
          ...visual,
          ...base,
          headers: [sub(visual.headers[0]), sub(visual.headers[1])] as [string, string],
          rows: visual.rows.map((row) => ({ ...row, label: sub(row.label), value: sub(row.value) }))
        };
      case 'swatches':
        return {
          ...visual,
          ...base,
          swatches: visual.swatches.map((swatch) => ({
            ...swatch,
            label: swatch.label ? sub(swatch.label) : undefined
          }))
        };
    }
  }
</script>

<svelte:head>
  {#if faqSchema}
    {@html `<script type="application/ld+json">${faqSchema}</script>`}
  {/if}
</svelte:head>

<article class="{containerClass}" data-static-article>
  <!-- Intro block: direct, snippet-friendly opening -->
  <div class="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:p-8">
    {#if content.eyebrow}
      <p class="text-xs font-bold uppercase tracking-[0.22em] text-teal-600 mb-3">{content.eyebrow}</p>
    {/if}
    <p class="{s.intro}">{@html sub(content.intro)}</p>
  </div>

  <!-- Table of contents: anchored, crawlable. Key takeaways and figure blocks
       are rendered by the caller or inside sections, never as extra top-level
       conditionals here: a new conditional or comment node in this position
       would shift Svelte's whitespace collapsing and change the HTML of this
       component's ~50 other consumers. -->
  {#if showInlineToc}
    <nav class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="Table of contents">
      <p class="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">In this guide</p>
      <ol class="grid gap-2 sm:grid-cols-2">
        {#each headings as heading}
          <li>
            <a href="#{heading.id}" class="group flex items-start gap-2 text-slate-700 hover:text-teal-700 transition">
              <span class="mt-1 text-teal-500 group-hover:translate-x-0.5 transition" aria-hidden="true">→</span>
              <span class="leading-snug font-medium">{heading.heading}</span>
            </a>
          </li>
        {/each}
      </ol>
    </nav>
  {/if}

  <!-- Body sections: each article has its own H2 blueprint -->
  {#each content.sections as section, i}
    {@const rendered = applyVars(section)}
    <section class="{s.sectionSpacing}" data-section={i} use:reveal={motion}>
      <div class="mb-5 flex items-start gap-3">
        <span class="mt-1.5 block h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500" aria-hidden="true"></span>
        <h2 id={headings[i]?.id} class="{s.h2}">{rendered.heading}</h2>
      </div>

      {#if rendered.paragraphs.length > 0}
        <div class="{s.proseGap}">
          {#each rendered.paragraphs as paragraph}
            <p class="{s.body}">{@html paragraph}</p>
          {/each}
        </div>
      {/if}

      <!-- Figures sit between the prose and any list/callout -->
      {#each rendered.visuals as visual}
        <ArticleVisual {visual} {motion} />
      {/each}

      {#if rendered.list}
        <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {#if rendered.list.title}
            <h3 class="{s.h3} mb-3">{rendered.list.title}</h3>
          {/if}
          <ul class="space-y-3">
            {#each rendered.list.items as item}
              <li class="flex items-start gap-3 text-slate-600 sm:text-lg">
                <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-hidden="true"></span>
                <span>{@html item}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if rendered.callout}
        <div class="mt-5 rounded-2xl border-l-4 border-teal-500 bg-teal-50 p-5 sm:p-6">
          {#if rendered.callout.title}
            <p class="text-sm font-bold uppercase tracking-wide text-teal-700 mb-2">{rendered.callout.title}</p>
          {/if}
          <p class="leading-relaxed text-slate-700 sm:text-lg">{@html rendered.callout.body}</p>
        </div>
      {/if}
    </section>
  {/each}

  <!-- FAQ block: visible content (never hidden behind accordions) for crawlability -->
  {#if content.faqs.length > 0}
    <section class="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="mb-6 flex items-center gap-2">
        <h2 class="{s.h2Plain}">{sub(content.faqHeading ?? 'Frequently Asked Questions')}</h2>
      </div>
      <div class="space-y-6">
        {#each content.faqs as faq}
          <div class="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
            <h3 class="{s.h3} mb-2">{sub(faq.question)}</h3>
            <p class="{s.body}">{sub(faq.answer)}</p>
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
            style="color: #ffffff"
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
