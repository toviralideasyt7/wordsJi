<script lang="ts">
  let {
    word,
    number,
    date,
    days_since_launch,
    onReveal,
  }: {
    word: string;
    number: number;
    date: string;
    days_since_launch?: number;
    onReveal?: () => void;
  } = $props();

  let revealedIndices = $state<Set<number>>(new Set());
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  function revealLetter(index: number) {
    if (revealedIndices.has(index)) return;
    revealedIndices = new Set([...revealedIndices, index]);
  }

  function revealAll(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    revealedIndices = new Set([...Array(word.length).keys()]);
    if (onReveal) onReveal();
  }

  let isAllRevealed = $derived(revealedIndices.size === word.length);

  // Dead-click fix: after the reveal there was no way to copy the answer, so
  // clicks on the "Answer Revealed" badge went nowhere. The button always
  // acknowledges the click, even when the clipboard API is unavailable.
  async function copyAnswer() {
    const text = word.toUpperCase();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      /* Clipboard unavailable — still acknowledge the click so it never feels dead. */
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-700 transform transition-all hover:shadow-xl">
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

  <div class="flex justify-center flex-wrap gap-2 sm:gap-3 mb-8">
    {#each word.split('') as letter, index}
      {#if revealedIndices.has(index)}
        <!-- Dead-click fix 2026-09-25: a revealed tile is not interactive. Keeping it a
             <button> made every click on a green tile a Clarity dead click. -->
        <div
          class="flex h-14 w-14 items-center justify-center rounded-xl border-2 text-3xl font-black uppercase transition-all md:h-16 md:w-16 md:text-4xl border-[#6aaa64] bg-[#6aaa64] text-white shadow-md cursor-default"
          aria-hidden="true"
        >
          {letter.toUpperCase()}
        </div>
      {:else}
        <button
          onclick={() => revealLetter(index)}
          class="focus:outline-none transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Reveal Tile {index + 1}"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl border-2 text-3xl font-black uppercase transition-all md:h-16 md:w-16 md:text-4xl border-slate-300 bg-slate-100 text-slate-900 wordle-blurred-letter dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {letter.toUpperCase()}
          </div>
        </button>
      {/if}
    {/each}
  </div>

  <div class="text-center relative">
    {#if !isAllRevealed}
      <button
        onclick={revealAll}
        class="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black rounded-full transition-all font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1"
      >
        <div class="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
          </svg>
          <span>Show Answer</span>
        </div>
      </button>
      <div class="mt-4 text-sm text-slate-500 dark:text-slate-400 opacity-80">
        Click individual tiles to reveal one letter at a time
      </div>
    {:else}
      <div class="inline-flex flex-wrap items-center justify-center gap-3">
        <div class="inline-flex items-center gap-2 px-6 py-3 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <span>Answer Revealed</span>
        </div>
        <button
          onclick={copyAnswer}
          class="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-full font-bold shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all"
          aria-live="polite"
        >
          {#if copied}
            <svg class="w-5 h-5 text-teal-600 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <span class="text-teal-600 dark:text-teal-300">Copied!</span>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <span>Copy answer</span>
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .wordle-blurred-letter {
    filter: blur(8px);
    user-select: none;
    transition: filter 0.3s ease, background-color 0.3s ease;
  }
</style>
