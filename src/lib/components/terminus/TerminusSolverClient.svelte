<script lang="ts">
  import { browser } from '$app/environment';
  import {
    TERMINUS_SYMBOLS,
    calculateTerminusCodes,
    formatTerminusCode,
    terminusFormulaLabels
  } from '$lib/solvers/terminus';
  import { TERMINUS_SYMBOL_ART } from './terminus-symbols';

  const symbolArtByValue = new Map(TERMINUS_SYMBOL_ART.map((s) => [s.value, s.svg]));

  const SELECTORS = [
    { label: 'X', accent: 'from-red-500 to-orange-500', text: 'text-red-400' },
    { label: 'Y', accent: 'from-orange-500 to-yellow-500', text: 'text-orange-400' },
    { label: 'Z', accent: 'from-yellow-500 to-amber-500', text: 'text-yellow-400' }
  ] as const;

  let selectedX = $state<number | null>(null);
  let selectedY = $state<number | null>(null);
  let selectedZ = $state<number | null>(null);
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  const codes = $derived(
    selectedX !== null && selectedY !== null && selectedZ !== null
      ? calculateTerminusCodes(selectedX, selectedY, selectedZ)
      : null
  );
  const fullCode = $derived(codes ? formatTerminusCode(codes) : '');
  const allSelected = $derived(selectedX !== null && selectedY !== null && selectedZ !== null);
  const formulas = $derived(
    selectedX !== null && selectedY !== null && selectedZ !== null
      ? terminusFormulaLabels(selectedX, selectedY, selectedZ)
      : (['', '', ''] as [string, string, string])
  );

  const selections = $derived([
    { label: 'X', value: selectedX },
    { label: 'Y', value: selectedY },
    { label: 'Z', value: selectedZ }
  ]);

  function select(label: 'X' | 'Y' | 'Z', value: number) {
    if (label === 'X') selectedX = value;
    else if (label === 'Y') selectedY = value;
    else selectedZ = value;
  }

  function reset() {
    selectedX = null;
    selectedY = null;
    selectedZ = null;
    copied = false;
    if (copyTimer) clearTimeout(copyTimer);
  }

  async function copyCode() {
    if (!browser || !fullCode) return;
    try {
      await navigator.clipboard.writeText(fullCode);
    } catch {
      // Clipboard API can be unavailable on some setups; fall back to a
      // temporary textarea so the copy button still works.
      const area = document.createElement('textarea');
      area.value = fullCode;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    copied = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
  <div class="space-y-6">
    <!-- Symbol selectors -->
    <div class="rounded-3xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl sm:p-8">
      <h2 class="text-xl font-bold text-white sm:text-2xl">Pick the symbols from your whiteboard</h2>
      <p class="mt-1 text-sm text-slate-400 sm:text-base">
        Match each symbol on the Research Office whiteboard to the one below. The value sits under every glyph.
      </p>

      {#each SELECTORS as selector, i (selector.label)}
        <div class="mt-8 {i > 0 ? 'border-t border-slate-700/60 pt-8' : ''}">
          <div class="flex items-center gap-3">
            <span
              class="rounded-lg bg-gradient-to-r px-5 py-2 text-2xl font-black text-white shadow-lg {selector.accent}"
            >
              {selector.label}
            </span>
            {#if selections[i].value !== null}
              <span class="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-4 py-1.5">
                <svg viewBox="0 0 20 20" class="h-4 w-4 text-emerald-400" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-lg font-bold text-emerald-400">{selections[i].value}</span>
              </span>
            {/if}
          </div>
          <div class="mt-4 grid grid-cols-5 gap-2" role="group" aria-label="Symbol picker for {selector.label}">
            {#each TERMINUS_SYMBOLS as symbol (symbol.value)}
              <button
                type="button"
                onclick={() => select(selector.label, symbol.value)}
                aria-pressed={selections[i].value === symbol.value}
                title="{symbol.name}, value {symbol.value}"
                class="flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-2 transition-all duration-200 hover:scale-105 active:scale-95
                  {selections[i].value === symbol.value
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/30'
                    : 'border-slate-600/50 bg-slate-800/50 hover:border-orange-400/60 hover:bg-slate-700/60'}"
              >
                <svg viewBox="0 0 80 80" class="h-4/5 w-4/5 text-slate-100" aria-hidden="true">
                  {@html symbolArtByValue.get(symbol.value)}
                </svg>
                <span class="mt-1 text-sm font-black {selector.text}">{symbol.value}</span>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Progress -->
    {#if !allSelected}
      <div class="rounded-2xl border border-slate-700/60 bg-slate-900/80 px-6 py-5">
        <div class="flex items-center justify-center gap-6 sm:gap-10">
          {#each selections as selection (selection.label)}
            <div class="flex items-center gap-2.5">
              <span class="h-3.5 w-3.5 rounded-full {selection.value !== null ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-slate-600'}"></span>
              <span class="text-base font-medium {selection.value !== null ? 'text-emerald-300' : 'text-slate-500'}">
                {selection.label}: {selection.value !== null ? selection.value : '…'}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Results -->
    {#if codes}
      <div class="rounded-3xl border border-emerald-600/50 bg-gradient-to-br from-emerald-950/95 via-green-950/95 to-teal-950/95 p-6 shadow-2xl sm:p-8">
        <h2 class="text-xl font-bold text-white sm:text-2xl">Your three terminal codes</h2>
        <p class="mt-1 text-sm text-emerald-300/80 sm:text-base">
          Type these into the Research Office computer, in order.
        </p>

        <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {#each [{ title: 'First code', value: codes.code1, formula: formulas[0] }, { title: 'Second code', value: codes.code2, formula: formulas[1] }, { title: 'Third code', value: codes.code3, formula: formulas[2] }] as code (code.title)}
            <div class="rounded-2xl border border-emerald-500/30 bg-black/50 p-6 text-center">
              <div class="text-xs font-bold uppercase tracking-widest text-emerald-400">{code.title}</div>
              <div class="mt-2 font-mono text-6xl font-black tracking-wider text-white">{code.value}</div>
              <div class="mt-3 inline-block rounded-lg bg-slate-800/60 px-2 py-1 font-mono text-xs text-slate-400">
                {code.formula}
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-6 rounded-2xl border border-yellow-500/40 bg-black/60 p-6 text-center">
          <div class="text-sm font-bold uppercase tracking-widest text-yellow-400">Complete code to enter</div>
          <div class="mt-2 font-mono text-4xl font-black tracking-[0.12em] text-yellow-300 sm:text-6xl">
            {fullCode}
          </div>
          <button
            type="button"
            onclick={copyCode}
            class="mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-lg font-bold text-white transition-all
              {copied ? 'bg-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}"
          >
            {#if copied}
              <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clip-rule="evenodd" />
              </svg>
              Copied
            {:else}
              <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M7 3a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V3z" />
                <path d="M5 5H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1" />
              </svg>
              Copy code
            {/if}
          </button>
        </div>

        <div class="mt-6 flex justify-center">
          <button
            type="button"
            onclick={reset}
            class="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/60 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700"
          >
            <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M4 10a6 6 0 111.5 4M4 10V4m0 6h6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Reset and calculate a new code
          </button>
        </div>
      </div>
    {/if}

    <!-- Symbol reference chart -->
    <div class="rounded-3xl border border-slate-700/60 bg-slate-900/80 p-6 sm:p-8">
      <h2 class="text-xl font-bold text-white">Symbol reference chart</h2>
      <p class="mt-1 text-sm text-slate-400">All ten Terminus symbols with their digit values, 0 through 9.</p>
      <div class="mt-5 grid grid-cols-5 gap-3 md:grid-cols-10">
        {#each TERMINUS_SYMBOLS as symbol (symbol.value)}
          <div class="flex aspect-square flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-black/40 p-2">
            <svg viewBox="0 0 80 80" class="h-3/4 w-3/4 text-slate-200" aria-hidden="true">
              {@html symbolArtByValue.get(symbol.value)}
            </svg>
            <span class="mt-1 text-base font-black text-yellow-400">{symbol.value}</span>
            <span class="sr-only">{symbol.name}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
