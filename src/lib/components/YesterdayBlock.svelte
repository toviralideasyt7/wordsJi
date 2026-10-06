<script lang="ts">
  interface Props {
    gameName?: string;
    puzzleNumber?: string;
    dateLong?: string;
    answer?: string;
  }

  let { gameName = 'Wordle', puzzleNumber = '', dateLong = '', answer = '' }: Props = $props();
</script>

{#if answer}
  <div class="rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
    <h3 class="text-lg font-black text-slate-900 dark:text-slate-50 mb-3">Yesterday's {gameName} Answer</h3>
    <p class="text-slate-700 dark:text-slate-300">
      {gameName} #{puzzleNumber} ({dateLong}): <strong class="font-black text-slate-900 dark:text-slate-50">{answer}</strong>
    </p>
  </div>
{/if}
