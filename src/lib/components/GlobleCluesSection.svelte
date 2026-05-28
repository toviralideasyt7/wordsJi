<script lang="ts">
  import type { Snippet } from 'svelte';

  interface GlobleCountry {
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    continent: string;
    subregion: string;
  }

  let {
    country,
    date,
    children,
  }: {
    country: GlobleCountry;
    date: string;
    children?: Snippet;
  } = $props();

  let clues = $derived([
    { question: `What continent is today's Globle country located on?`, answer: `The country is located on the ${country.continent} continent.` },
    { question: `How many letters are in today's Globle country name?`, answer: `The country name has ${country.name.length} letters.` },
    { question: `What is the first letter of today's Globle country?`, answer: `The country name starts with the letter "${country.name[0]}".` },
    { question: `What subregion is today's Globle country in?`, answer: `The country is located in ${country.subregion}.` },
    { question: `What are the coordinates of today's Globle country?`, answer: `The geographic center is at latitude ${country.latitude.toFixed(2)}° and longitude ${country.longitude.toFixed(2)}°.` },
  ]);

</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700 p-8 mb-8">
  <div class="text-center mb-6">
    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Globle Clues for {date}</h2>
    <p class="text-slate-600 dark:text-slate-300">Use these hints to guess the country before revealing the answer</p>
  </div>

  <div class="space-y-4 mb-8">
    {#each clues as clue, index}
      <div class="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-5 border border-teal-200 dark:border-teal-800/40">
        <h3 class="font-semibold text-slate-900 dark:text-white mb-2 flex items-start">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-sm font-bold mr-3 flex-shrink-0 mt-0.5">{index + 1}</span>
          {clue.question}
        </h3>
        <p class="text-slate-700 dark:text-slate-200 ml-9">{clue.answer}</p>
      </div>
    {/each}
  </div>

</div>

<!-- Answer section -->
{#if children}
  <details class="globle-answer-details">
    <summary class="mx-auto flex w-fit cursor-pointer list-none items-center justify-center rounded-xl bg-teal-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-teal-700 hover:shadow-xl">
      <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span class="label-closed">Reveal Answer</span>
      <span class="label-open">Hide Answer</span>
    </summary>
    <p class="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">Click to see the Globle country</p>
    <div class="globle-answer-reveal mt-8">
      {@render children()}
    </div>
  </details>
{/if}

<style>
  .globle-answer-details summary::-webkit-details-marker {
    display: none;
  }

  .globle-answer-details .label-open {
    display: none;
  }

  .globle-answer-details[open] .label-closed {
    display: none;
  }

  .globle-answer-details[open] .label-open {
    display: inline;
  }

  .globle-answer-reveal {
    filter: blur(10px);
    user-select: none;
    transition: filter 0.3s ease;
  }

  .globle-answer-details[open] .globle-answer-reveal {
    filter: none;
    user-select: auto;
  }
</style>
