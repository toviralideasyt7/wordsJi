<script lang="ts">
  let {
    word,
    date,
    description,
    recipe_name,
    isYesterday = false,
  }: {
    word: string;
    date: string;
    description?: string;
    recipe_name?: string;
    isYesterday?: boolean;
  } = $props();

  let upperWord = $derived(word.toUpperCase());
  let dayText = $derived(isYesterday ? 'yesterday' : 'today');
</script>

<div class="mb-12">
  <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg mb-8">
    <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
      <span class="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>
      Phoodle clues for {dayText}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
      <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
        <p class="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Length</p>
        <p class="text-slate-900 font-bold text-lg">{word.length} Letters</p>
      </div>
      <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
        <p class="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Starts With</p>
        <p class="text-slate-900 font-bold text-lg">{word[0].toUpperCase()}</p>
      </div>
      <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100">
        <p class="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Ends With</p>
        <p class="text-slate-900 font-bold text-lg">{word[word.length - 1].toUpperCase()}</p>
      </div>
    </div>
  </div>

  <details class="phoodle-answer-details transition-all duration-700 transform">
    <summary class="mx-auto flex w-fit cursor-pointer list-none items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-4 text-lg font-black text-white shadow-xl shadow-orange-100 transition-all active:scale-95 hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-200">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span class="label-closed">Reveal {isYesterday ? "Yesterday's" : "Today's"} Answer</span>
      <span class="label-open">Hide Answer</span>
    </summary>

    <div class="bg-orange-50 rounded-3xl p-8 border border-orange-100 shadow-xl text-center relative overflow-hidden phoodle-answer-panel mt-8">
      <div class="absolute top-0 right-0 p-4 opacity-10">
        <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
        </svg>
      </div>

      <p class="text-orange-600 text-sm font-bold uppercase tracking-widest mb-4">The Answer {isYesterday ? 'Was' : 'Is'}</p>
      <div class="flex justify-center flex-wrap gap-2 mb-6">
        {#each upperWord.split('') as letter, i}
          <div class="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-lg transform" style="background-color: #538d4e; animation-delay: {i * 100}ms">
            {letter}
          </div>
        {/each}
      </div>
      {#if description}
        <p class="text-slate-700 text-lg max-w-lg mx-auto leading-relaxed font-medium">{description}</p>
      {/if}
      {#if recipe_name}
        <div class="mt-6 inline-block px-5 py-2.5 bg-white rounded-full text-orange-700 text-sm font-bold shadow-sm border border-orange-100 italic">
          Pro Tip: {recipe_name}
        </div>
      {/if}
    </div>
  </details>
</div>

<style>
  .phoodle-answer-details summary::-webkit-details-marker {
    display: none;
  }

  .phoodle-answer-details .label-open {
    display: none;
  }

  .phoodle-answer-details[open] .label-closed {
    display: none;
  }

  .phoodle-answer-details[open] .label-open {
    display: inline;
  }

  .phoodle-answer-panel {
    filter: blur(10px);
    user-select: none;
    transition: filter 0.3s ease;
  }

  .phoodle-answer-details[open] .phoodle-answer-panel {
    filter: none;
    user-select: auto;
  }
</style>
