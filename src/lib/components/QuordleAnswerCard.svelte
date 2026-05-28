<script lang="ts">
  import { getQuordleDataForDate, type QuordleData } from '$lib/quordle';
  import { format } from 'date-fns';

  let { date, initialData = null }: { date: Date; initialData?: QuordleData | null } = $props();

  let data = $derived(initialData ?? getQuordleDataForDate(date));

  function countVowels(word: string) { return (word.match(/[AEIOU]/gi) || []).length; }
  function hasDoubleLetters(word: string) {
    for (let i = 0; i < word.length - 1; i++) {
      if (word[i] === word[i + 1]) return true;
    }
    return false;
  }

  const colorMap: Record<string, string> = {
    classic: 'bg-teal-500', sequence: 'bg-violet-500', chill: 'bg-blue-500',
    extreme: 'bg-red-500', rescue: 'bg-amber-500', weekly: 'bg-pink-500'
  };
</script>

{#if !data}
  <div class="text-center p-8">Loading...</div>
{:else}
  <div class="space-y-12">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-4">Today&apos;s Quordle Puzzle Hints & Solutions</h2>
      <div class="w-24 h-1 bg-teal-600 mx-auto rounded-full"></div>
      <p class="mt-4 text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">Scroll down for all game modes</p>
    </div>

    {#each [
      { title: 'Daily Classic', words: data.d, type: 'classic', num: data.dN },
      { title: 'Daily Chill', words: data.c, type: 'chill', num: data.cN },
      { title: 'Daily Extreme', words: data.e, type: 'extreme', num: data.eN },
      { title: 'Sequence', words: data.s, type: 'sequence', num: data.dN },
      { title: 'Rescue', words: data.r, type: 'rescue', num: data.rN },
      { title: 'Weekly', words: data.w, type: 'weekly', num: data.wN }
    ] as mode}
      {#if mode.words && mode.words.length > 0}
        {@const accentColor = colorMap[mode.type] || 'bg-slate-500'}
        {@const textColor = accentColor.replace('bg-', 'text-')}
        {@const vowelCountTotal = mode.words.reduce((acc: number, w: string) => acc + countVowels(w), 0)}
        {@const doubleLetterCount = mode.words.filter(hasDoubleLetters).length}
        {@const startingLetters = mode.words.map((w: string) => w[0]).join(', ')}

        <div class="mb-16 scroll-mt-20" id="mode-{mode.type}">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
            <span class="w-2 h-8 rounded-full {accentColor}"></span>
            {mode.title} Hints for {mode.num}
          </h2>
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700 p-8">
            <p class="text-slate-600 dark:text-slate-400 mb-8 italic">
              Are you struggling to solve today&apos;s {mode.title.toLowerCase()}? Here are some useful hints.
            </p>
            <div class="space-y-8">
              <div>
                <div class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span class="{accentColor} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">Q1</span>
                  How many vowels are in today&apos;s {mode.title.toLowerCase()} words?
                </div>
                <p class="text-slate-600 dark:text-slate-400 pl-10">
                  There are a total of <span class="font-bold {textColor}">{vowelCountTotal} vowels</span> across the four words.
                </p>
              </div>
              <div>
                <div class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span class="{accentColor} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">Q2</span>
                  How many double letters are there?
                </div>
                <p class="text-slate-600 dark:text-slate-400 pl-10">
                  {doubleLetterCount === 0 ? "None of today's words contain double letters." : `There are ${doubleLetterCount} words with double letters.`}
                </p>
              </div>
              <div>
                <div class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span class="{accentColor} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">Q3</span>
                  Starting letters?
                </div>
                <p class="text-slate-600 dark:text-slate-400 pl-10">
                  The starting letters are: <span class="font-bold tracking-widest {textColor}">{startingLetters}</span>.
                </p>
              </div>
            </div>
          </div>

          <details class="quordle-answer-details mt-8">
            <summary class="mx-auto flex w-fit cursor-pointer list-none items-center justify-center rounded-full bg-slate-900 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 dark:bg-white dark:text-slate-900">
              <span class="label-closed">Show {mode.title} Answers</span>
              <span class="label-open">Hide Answers</span>
            </summary>

            <div class="quordle-answer-spoiler mt-12">
              <div class="answer-content">
                <div class="text-center mb-8">
                  <div class="text-2xl font-bold text-slate-900 dark:text-white mb-2">{mode.title} Answers for {mode.num}</div>
                  <p class="text-slate-500 dark:text-slate-400">
                    for {format(date, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {#each mode.words as word}
                    <div class="{accentColor} text-white p-6 rounded-2xl text-center text-2xl font-black tracking-[0.2em] shadow-xl border-b-4 border-black/20 transform hover:-translate-y-1 transition-transform">
                      {word}
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </details>
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .quordle-answer-details summary::-webkit-details-marker {
    display: none;
  }

  .quordle-answer-details .label-open {
    display: none;
  }

  .quordle-answer-details[open] .label-closed {
    display: none;
  }

  .quordle-answer-details[open] .label-open {
    display: inline;
  }

  .quordle-answer-spoiler .answer-content {
    filter: blur(10px);
    user-select: none;
    transition: filter 0.3s ease;
  }

  .quordle-answer-details[open] .quordle-answer-spoiler .answer-content {
    filter: none;
    user-select: auto;
  }
</style>
