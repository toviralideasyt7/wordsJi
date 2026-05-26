<script lang="ts">
  import FiEye from '$lib/components/icons/FiEye.svelte';
  import FiHash from '$lib/components/icons/FiHash.svelte';
  import FiType from '$lib/components/icons/FiType.svelte';
  import FiBookOpen from '$lib/components/icons/FiBookOpen.svelte';
  import FiChevronDown from '$lib/components/icons/FiChevronDown.svelte';
  import FiChevronUp from '$lib/components/icons/FiChevronUp.svelte';

  interface DatamuseWord { word: string; defs?: string[]; }

  let {
    colorName,
    colorHex,
    showAnswerReveal = true
  }: {
    colorName: string;
    colorHex: string;
    showAnswerReveal?: boolean;
  } = $props();

  let showAnswer = $state(false);
  let definition = $state<string | null>(null);
  let loading = $state(true);

  let name = $derived(colorName.toLowerCase());
  let vowelCount = $derived((name.match(/[aeiou]/gi) || []).length);
  let startLetter = $derived(name.charAt(0).toUpperCase());
  let endLetter = $derived(name.charAt(name.length - 1).toUpperCase());
  let letterCount = $derived(name.replace(/\s/g, '').length);

  $effect(() => {
    const fetchDefinition = async () => {
      try {
        const response = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(name.split(' ')[0])}&md=d&max=1`);
        const data: DatamuseWord[] = await response.json();
        if (data.length > 0 && data[0].defs && data[0].defs.length > 0) {
          definition = data[0].defs[0].split('\t')[1];
        }
      } catch (error) {
        console.error('Failed to fetch definition:', error);
      } finally {
        loading = false;
      }
    };
    fetchDefinition();
  });
</script>

<div class="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/30 max-w-lg mx-auto">
  <!-- Header -->
  <div class="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-6 text-white">
    <div class="flex items-center gap-3 mb-2">
      <FiEye class="text-2xl" />
      <h2 class="text-xl font-bold">Hints & Clues</h2>
    </div>
    <p class="text-purple-100 text-sm">Use these clues to guess before revealing the answer!</p>
  </div>

  <!-- Clues Grid -->
  <div class="p-6 space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-purple-100 dark:border-purple-800/30 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
          <FiHash class="text-lg" />
          <span class="text-xs font-semibold uppercase tracking-wider">Letters</span>
        </div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{letterCount}</p>
      </div>
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-800/30 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
          <FiType class="text-lg" />
          <span class="text-xs font-semibold uppercase tracking-wider">Vowels</span>
        </div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{vowelCount}</p>
      </div>
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-pink-100 dark:border-pink-800/30 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Starts With</span>
        </div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{startLetter}</p>
      </div>
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-rose-100 dark:border-rose-800/30 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Ends With</span>
        </div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{endLetter}</p>
      </div>
    </div>

    {#if !loading && definition}
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-800/30">
        <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
          <FiBookOpen class="text-lg" />
          <span class="text-xs font-semibold uppercase tracking-wider">Meaning Hint</span>
        </div>
        <p class="text-slate-700 dark:text-slate-300 text-sm italic">"{definition}"</p>
      </div>
    {/if}

    <!-- Color Preview -->
    <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-600">
      <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-3">
        <span class="text-xs font-semibold uppercase tracking-wider">Color Preview</span>
      </div>
      <div class="h-16 w-full rounded-xl shadow-inner border border-slate-200 dark:border-slate-600" style="background-color: {colorHex}"></div>
    </div>

    {#if showAnswerReveal}
      <button
        onclick={() => (showAnswer = !showAnswer)}
        class="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
      >
        {#if showAnswer}
          <FiChevronUp class="text-xl" /> Hide Answer
        {:else}
          <FiChevronDown class="text-xl" /> Reveal Answer
        {/if}
      </button>

      <div class="answer-reveal-area" class:revealed={showAnswer}>
        <div class="answer-text-content bg-gradient-to-r from-teal-50 to-teal-50 dark:from-teal-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-teal-200 dark:border-teal-800/50">
          <div class="text-center">
            <p class="text-sm text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider mb-2">Today's Answer</p>
            <h3 class="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-1">{colorName}</h3>
            <p class="font-mono text-lg text-slate-600 dark:text-slate-400">({colorHex})</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .answer-text-content {
    filter: blur(10px);
    user-select: none;
    transition: filter 0.3s ease;
  }

  .answer-reveal-area.revealed .answer-text-content {
    filter: none;
    user-select: auto;
  }
</style>
