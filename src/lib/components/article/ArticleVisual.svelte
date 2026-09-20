<script lang="ts">
  import type { StaticArticleVisual } from '$lib/content/registry';
  import TileFigure from './TileFigure.svelte';
  import BarFigure from './BarFigure.svelte';
  import StepFlow from './StepFlow.svelte';
  import StatCards from './StatCards.svelte';
  import ComparisonTable from './ComparisonTable.svelte';
  import SwatchFigure from './SwatchFigure.svelte';
  import { reveal, revealStagger } from '$lib/actions/reveal';

  let {
    visual,
    motion = false
  }: {
    visual: StaticArticleVisual;
    motion?: boolean;
  } = $props();
</script>

<figure
  class="article-visual mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800/60"
  use:reveal={motion}
>
  {#if visual.title}
    <figcaption class="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
      {visual.title}
    </figcaption>
  {/if}

  {#if visual.type === 'tiles'}
    <div use:revealStagger={motion}>
      <TileFigure {visual} />
    </div>
  {:else if visual.type === 'bars'}
    <div use:revealStagger={motion}>
      <BarFigure {visual} />
    </div>
  {:else if visual.type === 'steps'}
    <StepFlow {visual} />
  {:else if visual.type === 'stats'}
    <StatCards {visual} />
  {:else if visual.type === 'table'}
    <ComparisonTable {visual} />
  {:else if visual.type === 'swatches'}
    <SwatchFigure {visual} />
  {/if}

  {#if visual.caption}
    <p class="mt-4 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {visual.caption}
    </p>
  {/if}
</figure>
