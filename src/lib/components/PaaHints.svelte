<script lang="ts">
  import type { AIHints } from '$lib/ai-hints';
  import { EMPTY_AI_HINTS } from '$lib/ai-hints';

  interface Props {
    gameName?: string;
    hints?: AIHints | null;
  }

  let { gameName = 'Wordle', hints = EMPTY_AI_HINTS }: Props = $props();
  const hh = $derived(hints ?? EMPTY_AI_HINTS);
  const isMath = $derived(hh.kind === 'math');
</script>

<section aria-label="Frequently asked questions about today's {gameName}" class="space-y-6">
  {#if isMath}
    {#if hh.operator_hint}
      <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-2">What operators are in today's {gameName}?</h2>
        <p class="text-slate-700 dark:text-slate-300">{hh.operator_hint}</p>
      </div>
    {/if}
    {#if hh.length_hint}
      <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-2">How long is today's {gameName} equation?</h2>
        <p class="text-slate-700 dark:text-slate-300">{hh.length_hint}</p>
      </div>
    {/if}
    {#if hh.result_hint}
      <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-2">What does today's {gameName} equal?</h2>
        <p class="text-slate-700 dark:text-slate-300">{hh.result_hint}</p>
      </div>
    {/if}
    {#if hh.starts_with && hh.ends_with}
      <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-2">What characters does today's {gameName} start and end with?</h2>
        <p class="text-slate-700 dark:text-slate-300">Today's {gameName} starts with {hh.starts_with} and ends with {hh.ends_with}.</p>
      </div>
    {/if}
  {:else}
  {#if hh.vowel_hint}
    <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
      <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-2">How many vowels are in today's {gameName}?</h2>
      <p class="text-slate-700 dark:text-slate-300">{hh.vowel_hint}</p>
    </div>
  {/if}

  {#if hh.starts_with && hh.ends_with}
    <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
      <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-2">What letter does today's {gameName} start with?</h2>
      <p class="text-slate-700 dark:text-slate-300">Today's {gameName} starts with the letter {hh.starts_with} and ends with {hh.ends_with}.</p>
    </div>
  {/if}

  {#if hh.definition}
    <div class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
      <h2 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-2">What is the definition of today's {gameName} answer?</h2>
      <p class="text-slate-700 dark:text-slate-300">{hh.definition}</p>
    </div>
  {/if}
  {/if}
</section>
