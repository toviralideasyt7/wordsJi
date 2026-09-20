<script lang="ts">
  import type { StaticArticleStatFigure } from '$lib/content/registry';

  let { visual }: { visual: StaticArticleStatFigure } = $props();

  const columns = $derived(
    visual.stats.length === 2
      ? 'sm:grid-cols-2'
      : visual.stats.length === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4'
  );
</script>

<dl class="grid grid-cols-1 gap-3 {columns}">
  {#each visual.stats as stat}
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <dt class="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</dt>
      <dd class="mt-1 text-3xl font-extrabold tracking-tight text-teal-700 dark:text-teal-300">{stat.value}</dd>
      {#if stat.note}
        <dd class="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{stat.note}</dd>
      {/if}
    </div>
  {/each}
</dl>
