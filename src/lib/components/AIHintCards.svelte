<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { AIHints } from '$lib/ai-hints';
  import { EMPTY_AI_HINTS } from '$lib/ai-hints';

  interface Props {
    gameName?: string;
    answer?: string;
    hints?: AIHints | null;
    accent?: string;
    /**
     * Set to false on pages that render their own dedicated answer block, so
     * the page keeps exactly one answer reveal.
     */
    showAnswerReveal?: boolean;
  }

  let { gameName = 'Wordle', answer = '', hints = EMPTY_AI_HINTS, accent = 'teal', showAnswerReveal = true }: Props = $props();
  const hh = $derived(hints ?? EMPTY_AI_HINTS);

  // Tailwind-safe accent map (full class names only — no dynamic interpolation).
  const ACCENTS: Record<string, string> = {
    teal: 'from-teal-400 to-teal-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    amber: 'from-amber-400 to-amber-600',
    emerald: 'from-emerald-400 to-emerald-600',
    rose: 'from-rose-400 to-rose-600'
  };
  let accentGradient = $derived(ACCENTS[accent] ?? ACCENTS['teal']);

  let open = $state<Record<string, boolean>>({});

  function toggle(id: string) {
    open = { ...open, [id]: !open[id] };
  }

  let difficultyPct = $derived(Math.min(100, Math.max(0, (hh.difficulty / 10) * 100)));
</script>

{#snippet hintCard(id: string, title: string, subtitle: string, body: Snippet)}
  <div class="overflow-hidden rounded-2xl border transition-all duration-300 {open[id] ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}">
    <button type="button" onclick={() => toggle(id)} aria-expanded={open[id] ?? false} class="w-full flex items-center justify-between gap-4 p-5 text-left">
      <div class="min-w-0">
        <span class="block font-bold text-slate-900 dark:text-slate-100">{title}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400">{subtitle}</span>
      </div>
      <span class="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors {open[id] ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
        {open[id] ? 'Hide' : 'Reveal'}
        <svg class="w-4 h-4 transition-transform duration-300 {open[id] ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </button>
    <div class="transition-all duration-300 ease-in-out overflow-hidden {open[id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
      <div class="px-5 pb-5">
        <div class="pt-4 border-t border-slate-100 dark:border-slate-700/60">
          {@render body()}
        </div>
      </div>
    </div>
  </div>
{/snippet}

{#if answer}
  <section class="w-full max-w-2xl mx-auto" aria-label="Today's {gameName} hints">
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center p-3 bg-gradient-to-br {accentGradient} rounded-2xl shadow-lg mb-4 text-white">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h2 class="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2">Today's {gameName} Hints</h2>
      <p class="text-slate-600 dark:text-slate-400 font-medium">Reveal clues one at a time — no spoilers until you tap.</p>
    </div>

    <div class="grid gap-4">
      {#snippet vowelBody()}
        <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{hh.vowel_hint}</p>
      {/snippet}
      {@render hintCard('vowels', 'Vowel count', 'How many vowels are in the word?', vowelBody)}

      {#snippet repeatBody()}
        <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{hh.repeat_hint}</p>
      {/snippet}
      {@render hintCard('repeats', 'Repeating letters', 'Are there any duplicate letters?', repeatBody)}

      {#if hh.riddle}
        {#snippet riddleBody()}
          <p class="text-lg font-medium text-slate-800 dark:text-slate-200 italic">{hh.riddle}</p>
        {/snippet}
        {@render hintCard('riddle', 'Riddle', 'Solve this to narrow it down.', riddleBody)}
      {/if}

      {#if hh.clue1}
        {#snippet clueBody()}
          <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{hh.clue1}</p>
        {/snippet}
        {@render hintCard('clue', 'First clue', 'A direct hint about the word.', clueBody)}
      {/if}

      {#snippet lettersBody()}
        <div class="flex items-center justify-around">
          <div class="text-center">
            <div class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Starts with</div>
            <div class="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-xl text-2xl font-black text-slate-800 dark:text-slate-100">
              {hh.starts_with}
            </div>
          </div>
          <div class="h-px flex-grow mx-4 bg-slate-200 dark:bg-slate-700"></div>
          <div class="text-center">
            <div class="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Ends with</div>
            <div class="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-xl text-2xl font-black text-slate-800 dark:text-slate-100">
              {hh.ends_with}
            </div>
          </div>
        </div>
      {/snippet}
      {@render hintCard('letters', 'Starts & ends with', 'The first and last letters.', lettersBody)}

      {#if hh.definition}
        {#snippet definitionBody()}
          <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{hh.definition}</p>
        {/snippet}
        {@render hintCard('meaning', 'Meaning', 'What the word means.', definitionBody)}
      {/if}
    </div>

    {#if hh.difficulty_label || hh.difficulty_reason}
      <div class="mt-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold text-slate-900 dark:text-slate-100">Difficulty</span>
          <span class="text-sm font-bold text-slate-600 dark:text-slate-300">{hh.difficulty}/10{hh.difficulty_label ? ` — ${hh.difficulty_label}` : ''}</span>
        </div>
        <div class="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-3">
          <div class="h-full rounded-full bg-gradient-to-r {accentGradient}" style="width: {difficultyPct}%"></div>
        </div>
        {#if hh.difficulty_reason}
          <p class="text-sm text-slate-600 dark:text-slate-400">{hh.difficulty_reason}</p>
        {/if}
      </div>
    {/if}

    {#if showAnswerReveal}
    <details class="hint-answer-details mt-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 text-center">
      <summary class="inline-block px-6 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer">
        <span class="label-closed">Reveal today's {gameName} answer</span>
        <span class="label-open">Hide answer</span>
      </summary>
      <p class="mt-4 text-lg text-slate-800 dark:text-slate-200">
        Today's {gameName} answer: <strong class="font-black">{answer}</strong>
      </p>
    </details>
    {/if}
  </section>
{/if}

<style>
  /* CSS-only answer reveal: native <details> keeps the answer in the HTML with
     zero JavaScript, so crawlers always see it and the toggle cannot break. */
  .hint-answer-details summary {
    list-style: none;
  }
  .hint-answer-details summary::-webkit-details-marker {
    display: none;
  }
  .hint-answer-details summary::marker {
    display: none;
  }
  .hint-answer-details .label-open {
    display: none;
  }
  .hint-answer-details[open] .label-closed {
    display: none;
  }
  .hint-answer-details[open] .label-open {
    display: inline;
  }
</style>
