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
  const isMath = $derived(hh.kind === 'math');

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

  let difficultyPct = $derived(Math.min(100, Math.max(0, (hh.difficulty / 10) * 100)));
</script>

{#snippet hintCard(id: string, title: string, subtitle: string, body: Snippet)}
  <!-- CSS-only disclosure: native <details> needs no JavaScript, so hint
       reveals work on csr=false prerendered pages and stay crawlable. -->
  <details class="hint-card overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800" {id}>
    <summary class="hint-summary flex w-full cursor-pointer list-none items-center justify-between gap-4 p-5 text-left">
      <div class="min-w-0">
        <span class="block font-bold text-slate-900 dark:text-slate-100">{title}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400">{subtitle}</span>
      </div>
      <span class="hint-pill flex shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors dark:bg-slate-700 dark:text-slate-300">
        <span class="label-closed">Reveal</span>
        <span class="label-open">Hide</span>
        <svg class="hint-chevron h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </summary>
    <div class="hint-body">
      <div class="hint-body-inner">
        <div class="mx-5 mb-5 border-t border-slate-100 pt-4 dark:border-slate-700/60">
          {@render body()}
        </div>
      </div>
    </div>
  </details>
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
      {#if isMath}
        {#snippet operatorsBody()}
          <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{hh.operator_hint}</p>
        {/snippet}
        {@render hintCard('operators', 'Operators', 'Which math operators appear?', operatorsBody)}

        {#snippet lengthBody()}
          <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{hh.length_hint}</p>
        {/snippet}
        {@render hintCard('length', 'Equation length', 'How many characters long?', lengthBody)}

        {#snippet resultBody()}
          <p class="text-lg font-medium text-slate-800 dark:text-slate-200">{hh.result_hint}</p>
        {/snippet}
        {@render hintCard('result', 'The result', 'What does it equal? No spoilers.', resultBody)}

        {#snippet mathLettersBody()}
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
        {@render hintCard('letters', 'Starts & ends with', 'The first and last characters.', mathLettersBody)}

        {#if hh.riddle}
          {#snippet mathRiddleBody()}
            <p class="text-lg font-medium text-slate-800 dark:text-slate-200 italic">{hh.riddle}</p>
          {/snippet}
          {@render hintCard('riddle', 'Riddle', 'Solve this to narrow it down.', mathRiddleBody)}
        {/if}
      {:else}
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

  /* CSS-only hint-card disclosures: the <summary> is the toggle, so the
     Reveal/Hide buttons work with zero JavaScript (csr=false pages). */
  .hint-card summary {
    list-style: none;
  }
  .hint-card summary::-webkit-details-marker {
    display: none;
  }
  .hint-card summary::marker {
    display: none;
  }
  .hint-card .label-open {
    display: none;
  }
  .hint-card[open] .label-closed {
    display: none;
  }
  .hint-card[open] .label-open {
    display: inline;
  }
  .hint-card[open] {
    border-color: #e2e8f0;
  }
  .hint-card[open] .hint-pill {
    background-color: #0f172a;
    color: #fff;
  }
  @media (prefers-color-scheme: dark) {
    .hint-card[open] {
      border-color: #334155;
    }
    .hint-card[open] .hint-pill {
      background-color: #f1f5f9;
      color: #0f172a;
    }
  }
  .hint-card .hint-chevron {
    transition: transform 0.3s ease;
  }
  .hint-card[open] .hint-chevron {
    transform: rotate(180deg);
  }
  /* Smooth expand/collapse without JavaScript. Native <details> already hides
     the body when closed; the grid transition animates the opening. */
  .hint-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s ease;
  }
  .hint-body-inner {
    overflow: hidden;
    min-height: 0;
  }
  .hint-card[open] .hint-body {
    grid-template-rows: 1fr;
  }
</style>
