<script lang="ts">
  import type { SolveStep } from '$lib/solvers/nonogram/solver';

  let {
    steps,
    stepIndex,
    autoplay,
    speedMs,
    truncated,
    onStepIndex,
    onToggleAutoplay,
    onSpeed
  }: {
    steps: SolveStep[];
    stepIndex: number;
    autoplay: boolean;
    speedMs: number;
    truncated: boolean;
    onStepIndex: (i: number) => void;
    onToggleAutoplay: () => void;
    onSpeed: (ms: number) => void;
  } = $props();

  const total = $derived(steps.length);
  const current = $derived(stepIndex >= 0 && stepIndex < total ? steps[stepIndex] : null);

  const SPEEDS = [
    { label: 'Slow', ms: 1200 },
    { label: 'Normal', ms: 500 },
    { label: 'Fast', ms: 150 }
  ];

  function stepBadge(type: SolveStep['type']): string {
    switch (type) {
      case 'line':
        return 'bg-sky-100 text-sky-800';
      case 'propagation':
        return 'bg-violet-100 text-violet-800';
      case 'guess':
        return 'bg-amber-100 text-amber-800';
      case 'backtrack':
        return 'bg-rose-100 text-rose-800';
    }
  }
</script>

<div class="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h3 class="text-base font-bold text-slate-900">
      Solving log
      <span class="ml-1 font-mono text-sm font-normal text-slate-500">
        {#if total > 0}{Math.min(stepIndex + 1, total)} of {total}{#if truncated}+{/if}{:else}no steps yet{/if}
      </span>
    </h3>
    {#if total > 0}
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={onToggleAutoplay}
          class="rounded-lg px-3 py-1.5 text-sm font-semibold {autoplay ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          aria-pressed={autoplay}
        >
          {autoplay ? 'Pause' : 'Play'}
        </button>
        <div class="flex overflow-hidden rounded-lg border border-slate-200" role="group" aria-label="Replay speed">
          {#each SPEEDS as s (s.label)}
            <button
              type="button"
              onclick={() => onSpeed(s.ms)}
              aria-pressed={speedMs === s.ms}
              class="px-2.5 py-1.5 text-xs font-semibold {speedMs === s.ms ? 'bg-amber-100 text-amber-900' : 'bg-white text-slate-500 hover:bg-slate-50'}"
            >{s.label}</button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if total > 0}
    <div class="mt-4 flex items-center gap-3">
      <button
        type="button"
        onclick={() => onStepIndex(Math.max(0, stepIndex - 1))}
        disabled={stepIndex <= 0}
        aria-label="Previous step"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
      >
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12.7 5.3a1 1 0 010 1.4L8.4 10l4.3 3.3a1 1 0 11-1.4 1.4l-5-4a1 1 0 010-1.4l5-4a1 1 0 011.4 0z" /></svg>
      </button>
      <input
        type="range"
        min="0"
        max={total - 1}
        value={stepIndex}
        oninput={(e) => onStepIndex(Number((e.currentTarget as HTMLInputElement).value))}
        aria-label="Scrub through solving steps"
        class="w-full accent-amber-500"
      />
      <button
        type="button"
        onclick={() => onStepIndex(Math.min(total - 1, stepIndex + 1))}
        disabled={stepIndex >= total - 1}
        aria-label="Next step"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
      >
        <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M7.3 5.3a1 1 0 000 1.4l4.3 3.3-4.3 3.3a1 1 0 101.4 1.4l5-4a1 1 0 000-1.4l-5-4a1 1 0 00-1.4 0z" /></svg>
      </button>
    </div>

    {#if current}
      <div class="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-3">
        <span class="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide {stepBadge(current.type)}">
          {current.type}
        </span>
        <p class="text-sm text-slate-700">{current.description}</p>
      </div>
    {/if}

    {#if truncated}
      <p class="mt-3 text-xs text-slate-500">
        The log shows the first {total} steps; the full solve continued past the display cap.
        The final grid is unaffected.
      </p>
    {/if}
  {:else}
    <p class="mt-3 text-sm text-slate-500">
      Hit <span class="font-semibold">Solve puzzle</span> and each deduction, guess and backtrack
      will appear here for you to step through.
    </p>
  {/if}
</div>
