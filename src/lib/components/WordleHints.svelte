<script lang="ts">
  import FiHelpCircle from '$lib/components/icons/FiHelpCircle.svelte';
  import FiChevronDown from '$lib/components/icons/FiChevronDown.svelte';
  import FiBookOpen from '$lib/components/icons/FiBookOpen.svelte';
  import FiGrid from '$lib/components/icons/FiGrid.svelte';
  import FiType from '$lib/components/icons/FiType.svelte';
  import FiArrowRight from '$lib/components/icons/FiArrowRight.svelte';

  interface Definition {
    definition: string;
    example?: string;
  }

  interface DictionaryResponse {
    word: string;
    meanings: Array<{
      partOfSpeech: string;
      definitions: Definition[];
    }>;
  }

  let { word }: { word: string } = $props();

  let revealedHints = $state<Record<string, boolean>>({});
  let meaningLoading = $state(false);
  let meanings = $state<Definition[]>([]);
  let meaningError = $state('');

  let vowelCount = $derived(
    word.toLowerCase().split('').filter((char: string) => 'aeiou'.includes(char)).length
  );

  let hasDoubleLetters = $derived.by(() => {
    const wordLower = word.toLowerCase();
    for (let i = 0; i < wordLower.length; i++) {
      if (wordLower.indexOf(wordLower[i]) !== wordLower.lastIndexOf(wordLower[i])) return true;
    }
    return false;
  });

  async function fetchMeanings() {
    if (meanings.length > 0 || meaningLoading) return;
    try {
      meaningLoading = true;
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) throw new Error('Definitions not found');
      const data = (await response.json()) as DictionaryResponse[];
      const allDefs: Definition[] = [];
      data.forEach((entry) => {
        entry.meanings.forEach((m) => {
          m.definitions.forEach((d) => {
            if (allDefs.length < 3) allDefs.push(d);
          });
        });
      });
      meanings = allDefs;
    } catch {
      meaningError = 'Could not load definitions for this word.';
    } finally {
      meaningLoading = false;
    }
  }

  function toggleHint(hintId: string) {
    if (hintId === 'meaning' && !revealedHints['meaning']) {
      fetchMeanings();
    }
    revealedHints = { ...revealedHints, [hintId]: !revealedHints[hintId] };
  }
</script>

{#if word}
<div class="w-full max-w-2xl mx-auto dark:text-slate-100">
  <div class="text-center mb-8">
    <div class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-lg mb-4 text-white">
      <FiHelpCircle class="w-6 h-6" />
    </div>
    <h2 class="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2">Wordle Hints</h2>
    <p class="text-slate-600 dark:text-slate-400 font-medium">Need a nudge? Reveal clues without spoiling the answer.</p>
  </div>

  <div class="grid gap-4">
    <!-- Hint 1: Vowel Count -->
    <div class="overflow-hidden rounded-2xl border transition-all duration-300 {revealedHints['vowels'] ? 'bg-teal-50/50 border-teal-200 dark:bg-teal-900/10 dark:border-teal-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}">
      <button onclick={() => toggleHint('vowels')} class="w-full flex items-center justify-between p-5 text-left">
        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-xl {revealedHints['vowels'] ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}">
            <FiGrid class="w-5 h-5" />
          </div>
          <div>
            <span class="block font-bold text-slate-900 dark:text-slate-100">Vowel Count</span>
            <span class="text-sm text-slate-500 dark:text-slate-400">How many vowels are in the word?</span>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors {revealedHints['vowels'] ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
          {revealedHints['vowels'] ? 'Hide' : 'Reveal'}
          <FiChevronDown class="w-4 h-4 transform transition-transform duration-300 {revealedHints['vowels'] ? 'rotate-180' : ''}" />
        </div>
      </button>
      <div class="transition-all duration-300 ease-in-out overflow-hidden {revealedHints['vowels'] ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}">
        <div class="p-5 pt-0 border-t border-teal-100 dark:border-teal-800/30">
          <div class="mt-4 flex items-center gap-3">
            <span class="text-3xl font-black text-teal-600 dark:text-teal-400">{vowelCount}</span>
            <span class="text-lg font-medium text-slate-700 dark:text-slate-300">vowels in today's word</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Hint 2: Double Letters -->
    <div class="overflow-hidden rounded-2xl border transition-all duration-300 {revealedHints['double'] ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}">
      <button onclick={() => toggleHint('double')} class="w-full flex items-center justify-between p-5 text-left">
        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-xl {revealedHints['double'] ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}">
            <FiType class="w-5 h-5" />
          </div>
          <div>
            <span class="block font-bold text-slate-900 dark:text-slate-100">Repeating Letters</span>
            <span class="text-sm text-slate-500 dark:text-slate-400">Are there any duplicate letters?</span>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors {revealedHints['double'] ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
          {revealedHints['double'] ? 'Hide' : 'Reveal'}
          <FiChevronDown class="w-4 h-4 transform transition-transform duration-300 {revealedHints['double'] ? 'rotate-180' : ''}" />
        </div>
      </button>
      <div class="transition-all duration-300 ease-in-out overflow-hidden {revealedHints['double'] ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}">
        <div class="p-5 pt-0 border-t border-blue-100 dark:border-blue-800/30">
          <p class="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
            {#if hasDoubleLetters}
              <span class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span class="font-bold">Yes!</span> There is at least one repeating letter.
              </span>
            {:else}
              <span class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span class="font-bold">No.</span> Each letter is unique.
              </span>
            {/if}
          </p>
        </div>
      </div>
    </div>

    <!-- Hint 3: Start/End Letters -->
    <div class="overflow-hidden rounded-2xl border transition-all duration-300 {revealedHints['letters'] ? 'bg-purple-50/50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}">
      <button onclick={() => toggleHint('letters')} class="w-full flex items-center justify-between p-5 text-left">
        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-xl {revealedHints['letters'] ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}">
            <FiArrowRight class="w-5 h-5" />
          </div>
          <div>
            <span class="block font-bold text-slate-900 dark:text-slate-100">Start & End</span>
            <span class="text-sm text-slate-500 dark:text-slate-400">Reveal the first and last letters.</span>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors {revealedHints['letters'] ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
          {revealedHints['letters'] ? 'Hide' : 'Reveal'}
          <FiChevronDown class="w-4 h-4 transform transition-transform duration-300 {revealedHints['letters'] ? 'rotate-180' : ''}" />
        </div>
      </button>
      <div class="transition-all duration-300 ease-in-out overflow-hidden {revealedHints['letters'] ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}">
        <div class="p-5 pt-0 border-t border-purple-100 dark:border-purple-800/30">
          <div class="mt-4 flex items-center justify-around">
            <div class="text-center">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Starts with</div>
              <div class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 rounded-xl text-2xl font-black text-purple-700 dark:text-purple-300">
                {word[0].toUpperCase()}
              </div>
            </div>
            <div class="h-px flex-grow mx-4 bg-purple-200 dark:bg-purple-800"></div>
            <div class="text-center">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Ends with</div>
              <div class="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 rounded-xl text-2xl font-black text-purple-700 dark:text-purple-300">
                {word[word.length - 1].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hint 4: Meaning -->
    <div class="overflow-hidden rounded-2xl border transition-all duration-300 {revealedHints['meaning'] ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}">
      <button onclick={() => toggleHint('meaning')} class="w-full flex items-center justify-between p-5 text-left">
        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-xl {revealedHints['meaning'] ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}">
            <FiBookOpen class="w-5 h-5" />
          </div>
          <div>
            <span class="block font-bold text-slate-900 dark:text-slate-100">Definitions</span>
            <span class="text-sm text-slate-500 dark:text-slate-400">See word meanings (possible spoilers).</span>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors {revealedHints['meaning'] ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
          {revealedHints['meaning'] ? 'Hide' : 'Reveal'}
          <FiChevronDown class="w-4 h-4 transform transition-transform duration-300 {revealedHints['meaning'] ? 'rotate-180' : ''}" />
        </div>
      </button>
      <div class="transition-all duration-300 ease-in-out overflow-hidden {revealedHints['meaning'] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}">
        <div class="p-5 pt-0 border-t border-amber-100 dark:border-amber-800/30">
          <div class="mt-4">
            {#if meaningLoading}
              <div class="flex items-center justify-center py-4 space-x-2 animate-pulse">
                <div class="h-2 w-2 bg-amber-500 rounded-full"></div>
                <div class="h-2 w-2 bg-amber-500 rounded-full delay-75"></div>
                <div class="h-2 w-2 bg-amber-500 rounded-full delay-150"></div>
              </div>
            {:else if meaningError}
              <p class="text-red-500 text-sm italic">{meaningError}</p>
            {:else}
              <ul class="space-y-3">
                {#each meanings as def, i}
                  <li class="flex gap-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
                    <span class="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs mt-0.5">{i + 1}</span>
                    <span>{def.definition}</span>
                  </li>
                {/each}
                {#if meanings.length === 0 && !meaningLoading}
                  <p class="text-slate-500 italic text-sm">No definitions found.</p>
                {/if}
              </ul>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/if}
