<script lang="ts">
  import { MAX_GRID_DIMENSION } from '$lib/solvers/nonogram/solver';

  let {
    rows,
    cols,
    solving,
    canSolve,
    samples,
    onRowsChange,
    onColsChange,
    onSolve,
    onClear,
    onRandom,
    onLoadSample
  }: {
    rows: number;
    cols: number;
    solving: boolean;
    canSolve: boolean;
    samples: string[];
    onRowsChange: (n: number) => void;
    onColsChange: (n: number) => void;
    onSolve: () => void;
    onClear: () => void;
    onRandom: () => void;
    onLoadSample: (index: number) => void;
  } = $props();

  function stepper(label: string, value: number, min: number, max: number, onChange: (n: number) => void) {
    return { label, value, min, max, onChange };
  }

  const rowStepper = $derived(stepper('Rows', rows, 1, MAX_GRID_DIMENSION, onRowsChange));
  const colStepper = $derived(stepper('Columns', cols, 1, MAX_GRID_DIMENSION, onColsChange));
</script>

<div class="flex flex-wrap items-center gap-3">
  {#each [rowStepper, colStepper] as s (s.label)}
    <div class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2 py-1.5">
      <span class="pl-1 text-xs font-bold uppercase tracking-wider text-slate-500">{s.label}</span>
      <button
        type="button"
        onclick={() => s.onChange(Math.max(s.min, s.value - 1))}
        disabled={solving || s.value <= s.min}
        aria-label="Decrease {s.label}"
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
      >−</button>
      <span class="w-8 text-center font-mono text-base font-bold text-slate-800">{s.value}</span>
      <button
        type="button"
        onclick={() => s.onChange(Math.min(s.max, s.value + 1))}
        disabled={solving || s.value >= s.max}
        aria-label="Increase {s.label}"
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
      >+</button>
    </div>
  {/each}

  <button
    type="button"
    onclick={onSolve}
    disabled={solving || !canSolve}
    class="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {solving ? 'Solving…' : 'Solve puzzle'}
  </button>

  <button
    type="button"
    onclick={onClear}
    disabled={solving}
    class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
  >
    Clear
  </button>

  <button
    type="button"
    onclick={onRandom}
    disabled={solving}
    class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
  >
    Random sample
  </button>

  <label class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Sample</span>
    <select
      onchange={(e) => onLoadSample(Number((e.currentTarget as HTMLSelectElement).value))}
      disabled={solving}
      class="max-w-40 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none disabled:opacity-50"
      aria-label="Load a sample puzzle"
    >
      {#each samples as name, i (name)}
        <option value={i}>{name}</option>
      {/each}
    </select>
  </label>
</div>
