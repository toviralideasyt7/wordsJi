<script lang="ts">
  import type { StaticArticleBarFigure } from '$lib/content/registry';

  let { visual }: { visual: StaticArticleBarFigure } = $props();

  /** Bar widths are relative to `max`, or to the largest printed value. */
  const ceiling = $derived(
    visual.max ??
      Math.max(
        1,
        ...visual.bars.map((bar) => bar.value)
      )
  );

  const toneClass: Record<string, string> = {
    primary: 'bg-teal-500',
    accent: 'bg-amber-400',
    success: 'bg-emerald-500',
    neutral: 'bg-slate-400'
  };

  function widthFor(value: number): string {
    const pct = Math.max(2, Math.min(100, (value / ceiling) * 100));
    return `${pct}%`;
  }
</script>

<ol class="space-y-4">
  {#each visual.bars as bar, i}
    <li class="article-bar">
      <div class="mb-1.5 flex items-baseline justify-between gap-4">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{bar.label}</span>
        <span class="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-slate-50">
          {bar.value}{#if visual.unit}<span class="ml-0.5 font-medium text-slate-500 dark:text-slate-400">{visual.unit}</span>{/if}
        </span>
      </div>
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          class="h-full rounded-full {toneClass[bar.tone ?? 'primary']}"
          style="width: {widthFor(bar.value)}"
          style:--stagger-index={i}
        ></div>
      </div>
      {#if bar.note}
        <p class="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{bar.note}</p>
      {/if}
    </li>
  {/each}
</ol>
