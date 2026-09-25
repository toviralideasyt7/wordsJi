<script lang="ts">
  let {
    rows,
    cols,
    rowTexts,
    colTexts,
    rowErrors,
    colErrors,
    onRowInput,
    onColInput
  }: {
    rows: number;
    cols: number;
    rowTexts: string[];
    colTexts: string[];
    rowErrors: boolean[];
    colErrors: boolean[];
    onRowInput: (index: number, text: string) => void;
    onColInput: (index: number, text: string) => void;
  } = $props();
</script>

<div class="grid gap-6 md:grid-cols-2">
  <fieldset>
    <legend class="text-sm font-bold uppercase tracking-wider text-slate-500">
      Row clues <span class="font-normal normal-case text-slate-400">({rows} rows)</span>
    </legend>
    <div class="mt-2 space-y-1.5">
      {#each rowTexts as text, i (i)}
        <div class="flex items-center gap-2">
          <span class="w-6 shrink-0 text-right font-mono text-xs text-slate-400">{i + 1}</span>
          <input
            type="text"
            value={text}
            oninput={(e) => onRowInput(i, (e.currentTarget as HTMLInputElement).value)}
            placeholder="e.g. 3 1 2"
            aria-label="Row {i + 1} clues"
            class="w-full rounded-lg border px-3 py-1.5 font-mono text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2
              {rowErrors[i] ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-slate-300 focus:border-amber-400 focus:ring-amber-200'}"
          />
        </div>
      {/each}
    </div>
  </fieldset>

  <fieldset>
    <legend class="text-sm font-bold uppercase tracking-wider text-slate-500">
      Column clues <span class="font-normal normal-case text-slate-400">({cols} columns)</span>
    </legend>
    <div class="mt-2 space-y-1.5">
      {#each colTexts as text, i (i)}
        <div class="flex items-center gap-2">
          <span class="w-6 shrink-0 text-right font-mono text-xs text-slate-400">{i + 1}</span>
          <input
            type="text"
            value={text}
            oninput={(e) => onColInput(i, (e.currentTarget as HTMLInputElement).value)}
            placeholder="e.g. 3 1 2"
            aria-label="Column {i + 1} clues"
            class="w-full rounded-lg border px-3 py-1.5 font-mono text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2
              {colErrors[i] ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-slate-300 focus:border-amber-400 focus:ring-amber-200'}"
          />
        </div>
      {/each}
    </div>
  </fieldset>
</div>

<p class="mt-3 text-xs text-slate-500">
  Type each line's block lengths separated by spaces, for example <span class="font-mono">3 1 2</span>.
  Use <span class="font-mono">0</span> for a completely empty row or column.
</p>
