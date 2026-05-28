<script lang="ts">
  import FiEye from '$lib/components/icons/FiEye.svelte';
  import FiHash from '$lib/components/icons/FiHash.svelte';
  import FiType from '$lib/components/icons/FiType.svelte';
  import FiBookOpen from '$lib/components/icons/FiBookOpen.svelte';
  import FiChevronDown from '$lib/components/icons/FiChevronDown.svelte';
  import FiChevronUp from '$lib/components/icons/FiChevronUp.svelte';
  import FiMusic from '$lib/components/icons/FiMusic.svelte';

  interface DatamuseWord { word: string; defs?: string[]; }

  let {
    word,
    puzzleNumber,
    definition: initialDefinition = null,
    rhymes: initialRhymes = [],
    synonyms: initialSynonyms = [],
    disableClientFetch = false
  }: {
    word: string;
    puzzleNumber: number;
    definition?: string | null;
    rhymes?: string[];
    synonyms?: string[];
    disableClientFetch?: boolean;
  } = $props();

  let definition = $state<string | null>(null);
  let rhymes = $state<string[]>([]);
  let synonyms = $state<string[]>([]);
  let loading = $state(true);

  let lowerWord = $derived(word.toLowerCase());
  let vowelCount = $derived((lowerWord.match(/[aeiou]/gi) || []).length);
  let startLetter = $derived(lowerWord.charAt(0).toUpperCase());
  let endLetter = $derived(lowerWord.charAt(lowerWord.length - 1).toUpperCase());
  let letterCount = $derived(lowerWord.length);

  $effect(() => {
    let cancelled = false;

    definition = initialDefinition;
    rhymes = [...initialRhymes];
    synonyms = [...initialSynonyms];

    if (initialDefinition || initialRhymes.length || initialSynonyms.length) {
      loading = false;
      return;
    }

    if (disableClientFetch) {
      loading = false;
      return;
    }

    loading = true;

    const fetchWordData = async () => {
      try {
        const defResponse = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(lowerWord)}&md=d&max=1`);
        const defData: DatamuseWord[] = await defResponse.json();
        if (!cancelled && defData.length > 0 && defData[0].defs && defData[0].defs.length > 0) {
          definition = defData[0].defs[0].split('\t')[1];
        }
        const rhymeResponse = await fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(lowerWord)}&max=5`);
        const rhymeData = await rhymeResponse.json();
        if (!cancelled && rhymeData.length > 0) rhymes = rhymeData.slice(0, 5).map((r: { word: string }) => r.word);
        const synResponse = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(lowerWord)}&max=5`);
        const synData = await synResponse.json();
        if (!cancelled && synData.length > 0) synonyms = synData.slice(0, 5).map((s: { word: string }) => s.word);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch word data:', error);
        }
      } finally {
        if (!cancelled) {
          loading = false;
        }
      }
    };
    fetchWordData();

    return () => {
      cancelled = true;
    };
  });
</script>

<div class="bg-slate-50 dark:bg-slate-800 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] overflow-hidden border border-slate-200 dark:border-slate-700 max-w-lg mx-auto">
  <div class="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
    <div class="flex items-center gap-3 mb-2"><FiEye class="text-2xl" /><h2 class="text-xl font-bold">Hints & Clues</h2></div>
    <p class="text-teal-100 text-sm">Use these clues to guess before revealing the answer!</p>
  </div>

  <div class="p-6 space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2"><FiHash class="text-lg" /><span class="text-xs font-semibold uppercase tracking-wider">Letters</span></div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{letterCount}</p>
      </div>
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2"><FiType class="text-lg" /><span class="text-xs font-semibold uppercase tracking-wider">Vowels</span></div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{vowelCount}</p>
      </div>
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2"><span class="text-xs font-semibold uppercase tracking-wider">Starts With</span></div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{startLetter}</p>
      </div>
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2"><span class="text-xs font-semibold uppercase tracking-wider">Ends With</span></div>
        <p class="text-3xl font-bold text-slate-900 dark:text-slate-50">{endLetter}</p>
      </div>
    </div>

    {#if !loading && definition}
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-800/30">
        <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2"><FiBookOpen class="text-lg" /><span class="text-xs font-semibold uppercase tracking-wider">Definition Hint</span></div>
        <p class="text-slate-700 dark:text-slate-300 text-sm italic">"{definition}"</p>
      </div>
    {/if}

    {#if !loading && rhymes.length > 0}
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-600">
        <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2"><FiMusic class="text-lg" /><span class="text-xs font-semibold uppercase tracking-wider">Rhymes With</span></div>
        <div class="flex flex-wrap gap-2">
          {#each rhymes as rhyme}
            <span class="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">{rhyme}</span>
          {/each}
        </div>
      </div>
    {/if}

    {#if !loading && synonyms.length > 0}
      <div class="bg-white dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-teal-800/30">
        <div class="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2"><span class="text-xs font-semibold uppercase tracking-wider">Similar Words</span></div>
        <div class="flex flex-wrap gap-2">
          {#each synonyms as syn}
            <span class="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">{syn}</span>
          {/each}
        </div>
      </div>
    {/if}

    <details class="semantle-answer-details">
      <summary class="w-full cursor-pointer list-none rounded-2xl bg-teal-600 px-6 py-4 text-white shadow-lg transition-all duration-300 hover:bg-teal-700 hover:shadow-xl">
        <span class="flex items-center justify-center gap-2">
          <span class="summary-closed flex items-center gap-2"><FiChevronDown class="text-xl" /> Reveal Answer</span>
          <span class="summary-open flex items-center gap-2"><FiChevronUp class="text-xl" /> Hide Answer</span>
        </span>
      </summary>

      <div class="answer-reveal-area mt-4">
        <div class="answer-text-content bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-6 border border-teal-200 dark:border-teal-800/50">
          <div class="text-center">
            <p class="text-sm text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider mb-2">Puzzle #{puzzleNumber} Answer</p>
            <h3 class="text-3xl font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">{word}</h3>
          </div>
        </div>
      </div>
    </details>
  </div>
</div>

<style>
  .semantle-answer-details summary::-webkit-details-marker {
    display: none;
  }

  .semantle-answer-details .summary-open {
    display: none;
  }

  .semantle-answer-details[open] .summary-closed {
    display: none;
  }

  .semantle-answer-details[open] .summary-open {
    display: inline-flex;
  }

  .answer-text-content {
    filter: blur(10px);
    user-select: none;
    transition: filter 0.3s ease;
  }

  .semantle-answer-details[open] .answer-text-content {
    filter: none;
    user-select: auto;
  }
</style>
