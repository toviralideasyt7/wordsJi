<script lang="ts">
  import AnswerReveal from './AnswerReveal.svelte';

  /**
   * CSS-only Wordle answer reveal. The answer tiles live inside a native
   * <details> element (see AnswerReveal): zero JavaScript, always in the HTML.
   */
  let {
    word,
    number,
    date,
    days_since_launch,
  }: {
    word: string;
    number: number;
    date: string;
    days_since_launch?: number;
    onReveal?: () => void;
  } = $props();
</script>

<div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
  <div class="text-center mb-6">
    <div class="relative inline-block">
      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
        Wordle answer for {date}
      </h2>
      <div class="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-blue-500 rounded-full"></div>
    </div>
    {#if days_since_launch}
      <p class="text-slate-500 dark:text-slate-400 mt-2">
        Day {days_since_launch} since launch
      </p>
    {/if}
  </div>

  <AnswerReveal
    gameName="Wordle"
    answer={word}
    variant="tiles"
    tileColor="#538d4e"
    puzzleNumber={number}
    dateLong={date}
    id="wordle-answer-reveal"
  />
</div>
