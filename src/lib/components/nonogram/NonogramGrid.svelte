<script lang="ts">
  import { BLANK, FILLED, type CellState, type Clues, type Grid } from '$lib/solvers/nonogram/solver';

  let {
    grid,
    rowClues,
    colClues,
    changedCells = new Set<string>()
  }: {
    grid: Grid | null;
    rowClues: Clues;
    colClues: Clues;
    changedCells?: Set<string>;
  } = $props();

  const rows = $derived(grid?.length ?? rowClues.length);
  const cols = $derived(grid?.[0]?.length ?? colClues.length);

  function cellClass(cell: CellState): string {
    if (cell === FILLED) return 'bg-slate-900';
    if (cell === BLANK) return 'bg-white';
    return 'bg-slate-200';
  }

  function clueText(clues: number[]): string {
    return clues.join(' ');
  }
</script>

<div class="overflow-x-auto">
  <div class="inline-block rounded-2xl border border-slate-300 bg-slate-50 p-3 shadow-sm sm:p-4">
    <div
      class="grid gap-0"
      style="grid-template-columns: auto repeat({cols}, minmax(0, 1fr));"
    >
      <!-- Corner spacer -->
      <div class="border-b-2 border-r-2 border-slate-400"></div>

      <!-- Column clues -->
      {#each colClues as clues, c (c)}
        <div
          class="flex flex-col items-center justify-end border-b-2 px-0.5 pb-1 font-mono text-[10px] leading-tight text-slate-600 sm:text-xs {c > 0 && c % 5 === 0 ? 'border-l-2 border-l-slate-400' : 'border-l border-l-slate-200'}"
        >
          {#each clues as clue (clue)}
            <span class={clue === 0 ? 'text-slate-300' : ''}>{clue}</span>
          {/each}
        </div>
      {/each}

      <!-- Rows: row clue + cells -->
      {#each rowClues as clues, r (r)}
        <div
          class="flex items-center justify-end gap-1 border-r-2 pr-1 font-mono text-[10px] text-slate-600 sm:text-xs {r > 0 && r % 5 === 0 ? 'border-t-2 border-t-slate-400' : 'border-t border-t-slate-200'}"
        >
          <span class={clues.length === 1 && clues[0] === 0 ? 'text-slate-300' : ''}>{clueText(clues)}</span>
        </div>
        {#each Array(cols) as _, c (c)}
          {@const cell = grid?.[r]?.[c] ?? -1}
          {@const key = `${r},${c}`}
          <div
            class="aspect-square border-slate-200 {cellClass(cell as CellState)}
              {r % 5 === 0 ? 'border-t-2 border-t-slate-400' : 'border-t'}
              {c % 5 === 0 ? 'border-l-2 border-l-slate-400' : 'border-l'}
              {r === rows - 1 ? 'border-b-2 border-b-slate-400' : ''}
              {c === cols - 1 ? 'border-r-2 border-r-slate-400' : ''}
              {changedCells.has(key) ? 'outline-2 outline-amber-400 outline -outline-offset-2' : ''}"
            aria-label="Row {r + 1}, column {c + 1}: {cell === FILLED ? 'filled' : cell === BLANK ? 'blank' : 'unknown'}"
          ></div>
        {/each}
      {/each}
    </div>
  </div>
</div>
