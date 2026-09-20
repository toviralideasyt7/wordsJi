<script lang="ts">
  import type { StaticArticleSwatchFigure, StaticArticleTileState } from '$lib/content/registry';

  let { visual }: { visual: StaticArticleSwatchFigure } = $props();

  const stateRing: Record<StaticArticleTileState, string> = {
    correct: 'ring-2 ring-emerald-600 ring-offset-2 dark:ring-offset-slate-800',
    present: 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-800',
    absent: 'ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-800'
  };

  const stateText: Record<StaticArticleTileState, string> = {
    correct: 'Exact match',
    present: 'Close match',
    absent: 'No match'
  };
</script>

<ul class="flex flex-wrap gap-4">
  {#each visual.swatches as swatch}
    <li class="w-24 text-center">
      <span
        class="article-tile block h-16 w-full rounded-xl {stateRing[swatch.state]}"
        style="background-color: {swatch.hex};"
        aria-hidden="true"></span>
      <span class="mt-2 block font-mono text-xs font-semibold uppercase text-slate-700 dark:text-slate-200">{swatch.hex}</span>
      <span class="block text-xs text-slate-500 dark:text-slate-400">{swatch.label ?? stateText[swatch.state]}</span>
    </li>
  {/each}
</ul>
