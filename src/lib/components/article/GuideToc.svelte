<script lang="ts">
  import type { ArticleHeading } from '$lib/content/article-metrics';

  let { headings }: { headings: ArticleHeading[] } = $props();

  let activeId = $state<string>('');

  /**
   * Scroll-spy is decoration only: the TOC is a plain list of in-page anchors
   * that works with JS disabled. Under reduced motion or without
   * IntersectionObserver we simply never highlight anything.
   */
  $effect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) activeId = visible[0].target.id;
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0 }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  });
</script>

<!-- Desktop: sticky rail -->
<aside class="hidden lg:block">
  <nav
    class="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
    aria-label="On this page"
  >
    <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">On this page</p>
    <ol class="mt-4 space-y-2.5 border-l border-slate-200 dark:border-slate-700">
      {#each headings as heading}
        <li>
          <a
            href="#{heading.id}"
            aria-current={activeId === heading.id ? 'location' : undefined}
            class="-ml-px block border-l-2 py-0.5 pl-3 text-sm leading-snug transition-colors motion-safe:transition-transform hover:text-teal-700 dark:hover:text-teal-300 {activeId ===
            heading.id
              ? 'border-teal-500 font-semibold text-teal-700 dark:text-teal-300'
              : 'border-transparent text-slate-500 dark:text-slate-400'}"
          >
            {heading.heading}
          </a>
        </li>
      {/each}
    </ol>
  </nav>
</aside>

<!-- Mobile / tablet: collapsed, still fully crawlable in the HTML -->
<details class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-800/60">
  <summary class="cursor-pointer text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
    Jump to section
  </summary>
  <ol class="mt-4 space-y-2">
    {#each headings as heading}
      <li>
        <a
          href="#{heading.id}"
          class="flex items-start gap-2 text-slate-700 transition-colors hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300"
        >
          <span class="mt-1 text-teal-500 motion-safe:transition-transform" aria-hidden="true">→</span>
          <span class="leading-snug font-medium">{heading.heading}</span>
        </a>
      </li>
    {/each}
  </ol>
</details>
