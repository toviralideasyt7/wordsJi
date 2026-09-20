<script lang="ts">
  import type { StaticArticleTileFigure, StaticArticleTileState } from '$lib/content/registry';

  let { visual }: { visual: StaticArticleTileFigure } = $props();

  const legend = $derived(visual.legend !== false);
  /** Equations (Nerdle) render as monospace character runs, not letter squares. */
  const isEquation = $derived(visual.variant === 'equation');

  const stateClass: Record<StaticArticleTileState, string> = {
    correct: 'bg-emerald-600 text-white',
    present: 'bg-amber-400 text-slate-900',
    absent: 'bg-slate-500 text-white'
  };

  const stateLabel: Record<StaticArticleTileState, string> = {
    correct: 'correct spot',
    present: 'wrong spot',
    absent: 'not present'
  };

  const rowLabel = (word: string, states: StaticArticleTileState[]) =>
    `${word}: ${[...word].map((ch, i) => `${ch} ${stateLabel[states[i] ?? 'absent']}`).join(', ')}`;
</script>

<ul class="space-y-2">
  {#each visual.rows as row}
    <li class="flex flex-wrap items-center gap-3">
      <span class="flex {isEquation ? 'gap-0.5' : 'gap-1'}" role="img" aria-label={rowLabel(row.word, row.states)}>
        {#each [...row.word] as character, i}
          {#if isEquation}
            <span
              class="article-tile flex h-8 min-w-7 items-center justify-center rounded px-1 font-mono text-base font-bold {stateClass[
                row.states[i] ?? 'absent'
              ]}"
              aria-hidden="true">{character}</span
            >
          {:else}
            <span
              class="article-tile flex h-9 w-9 items-center justify-center rounded-md text-base font-extrabold uppercase sm:h-10 sm:w-10 sm:text-lg {stateClass[
                row.states[i] ?? 'absent'
              ]}"
              aria-hidden="true">{character}</span
            >
          {/if}
        {/each}
      </span>
      {#if row.note}
        <span class="text-sm font-medium text-slate-500 dark:text-slate-400">{row.note}</span>
      {/if}
    </li>
  {/each}
</ul>

{#if legend}
  <ul
    class="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400"
  >
    <li class="flex items-center gap-2">
      <span class="h-3.5 w-3.5 rounded bg-emerald-600" aria-hidden="true"></span>Correct spot
    </li>
    <li class="flex items-center gap-2">
      <span class="h-3.5 w-3.5 rounded bg-amber-400" aria-hidden="true"></span>Wrong spot
    </li>
    <li class="flex items-center gap-2">
      <span class="h-3.5 w-3.5 rounded bg-slate-500" aria-hidden="true"></span>Not in {isEquation ? 'equation' : 'word'}
    </li>
  </ul>
{/if}
