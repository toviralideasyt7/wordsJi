<script lang="ts">
  import { browser } from '$app/environment';
  import type { WordleAnswer } from '$lib/api';
  import RevealableWordleDisplay from './RevealableWordleDisplay.svelte';
  import YouTubeVideoEmbed from './YouTubeVideoEmbed.svelte';
  import SocialShareButton from './SocialShareButton.svelte';
  import AIHintCards from './AIHintCards.svelte';
  import type { AIHints } from '$lib/ai-hints';

  let {
    wordleData,
    wordleWord,
    wordleNumber,
    formattedDate,
    pageContext,
    contentGuide,
    socialImage,
    youtubeVideoUrl,
    aiHints = null,
  }: {
    wordleData: WordleAnswer | null;
    wordleWord: string;
    wordleNumber: number;
    formattedDate: string;
    pageContext: 'today' | 'archive';
    contentGuide?: string | null;
    socialImage?: string | null;
    youtubeVideoUrl?: string | null;
    aiHints?: AIHints | null;
  } = $props();

  let currentUrl = $state('');

  // Set current URL on client mount
  $effect(() => {
    if (browser) currentUrl = window.location.href;
  });

  let pageTitle = $derived.by(() => {
    if (pageContext === 'today') return `Wordle Hints and Answer for Today (${formattedDate})`;
    return `Wordle Answer for ${formattedDate}`;
  });

  // Hints section of the legacy content guide (everything before the old
  // "Wordle Answer Revealed" heading, which is no longer rendered — the page
  // keeps exactly one answer block, the CSS-only reveal below).
  let hintsHtml = $derived.by(() => {
    if (!contentGuide) return null;
    const revealHeaderRegex = /<h2[^>]*>.*?Wordle Answer Revealed.*?<\/h2>/i;
    const headerMatch = contentGuide.match(revealHeaderRegex);
    if (headerMatch && headerMatch.index !== undefined) {
      return contentGuide.substring(0, headerMatch.index);
    }
    return null;
  });

  const socialPlatforms = ['twitter', 'reddit', 'telegram', 'whatsapp', 'linkedin', 'facebook', 'pinterest', 'tumblr', 'threads', 'mix'];
</script>

{#if !wordleWord}
  <div class="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow-[0_1px_3px_rgb(0_0_0/0.04)] p-6 max-w-3xl mx-auto text-center border border-slate-200 dark:border-slate-700">
    <svg class="mx-auto h-16 w-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Solution Not Available</h1>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p class="text-slate-600 dark:text-slate-300">
        We're unable to retrieve the Wordle solution for {pageContext === 'archive' ? formattedDate : pageContext} at the moment. Please check back later.
      </p>
    </div>
  </div>
{:else}
  <div class="relative">
    <!-- Decorative background -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-teal-200 to-teal-300 dark:from-teal-900 dark:to-teal-800 rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-200 to-amber-300 dark:from-amber-900 dark:to-amber-800 rounded-full opacity-20 blur-3xl"></div>
    </div>

    <div class="relative z-10">
      <!-- 1. Image at Top -->
      {#if socialImage}
        <div class="mb-8 max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-xl relative isolate">
          <img
            src={socialImage}
            alt="Wordle Answer for {formattedDate}"
            class="w-full h-auto object-cover block"
            width="1200"
            height="630"
            loading="eager"
            decoding="sync"
            fetchpriority="high"
            sizes="(max-width: 768px) 100vw, 665px"
            style="position: relative; z-index: 1;"
          />
        </div>
      {/if}

      <!-- Page intro/Title -->
      <div class="mb-8 text-center max-w-2xl mx-auto px-4">
        <p class="text-sm font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1">
          {pageContext === 'today' ? 'Daily Answer' : 'Wordle Answer'}
        </p>
        <h1 class="mb-3 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          {pageContext === 'today' ? pageTitle : `Wordle Answer for ${formattedDate}`}
        </h1>
        {#if !contentGuide}
          <p class="text-base md:text-lg text-slate-600 dark:text-slate-400">
            Explore hints and reveal the answer one letter at a time.
          </p>
        {/if}
      </div>

      <!-- 2. Hints Section (from contentGuide) -->
      {#if hintsHtml}
        <div class="mb-8 bg-white dark:bg-slate-800 rounded-lg shadow-[0_1px_3px_rgb(0_0_0/0.04)] p-6 sm:p-8 max-w-3xl mx-auto border border-slate-200 dark:border-slate-700">
          <div class="prose prose-slate dark:prose-invert max-w-none">
            {@html hintsHtml}
          </div>
        </div>
      {/if}

      <!-- 3. YouTube Video -->
      <YouTubeVideoEmbed videoUrl={youtubeVideoUrl} title="Wordle {formattedDate} - Video Solution" />

      <!-- Hint cards: clues before the answer -->
      {#if aiHints}
        <div class="mb-8">
          <AIHintCards gameName="Wordle" answer={wordleWord} hints={aiHints} showAnswerReveal={false} />
        </div>
      {/if}

      <!-- 4. Single CSS-only answer reveal (the one answer block on the page) -->
      <RevealableWordleDisplay
        word={wordleWord}
        number={wordleNumber}
        date={formattedDate}
        days_since_launch={wordleData?.days_since_launch}
      />

      <!-- Social Share Bar -->
      <div class="mt-6 max-w-3xl mx-auto" style="min-height:106px">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-[0_1px_3px_rgb(0_0_0/0.04)] border border-slate-200 dark:border-slate-700 px-4 py-4">
          <p class="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Share with friends</p>
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
            {#each socialPlatforms as platform}
              <SocialShareButton {platform} url={currentUrl} title={pageTitle} />
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.faq-accordion) {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }
  :global(.dark .faq-accordion) { border-color: #374151; }
  :global(.faq-item) { border-bottom: 1px solid #e5e7eb; }
  :global(.dark .faq-item) { border-bottom-color: #374151; }
  :global(.faq-item-last) { border-bottom: none; }
  :global(.faq-trigger) {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 16px 20px; background: #f9fafb;
    border: none; cursor: pointer; text-align: left;
    font-size: 15px; font-weight: 600; color: #111827;
    transition: background 0.2s; gap: 12px;
  }
  :global(.dark .faq-trigger) { background: #1f2937; color: #f9fafb; }
  :global(.faq-trigger:hover) { background: #f3f4f6; }
  :global(.dark .faq-trigger:hover) { background: #374151; }
  :global(.faq-question-text) { flex: 1; line-height: 1.4; }
  :global(.faq-chevron) { flex-shrink: 0; transition: transform 0.3s ease; color: #6b7280; }
  :global(.dark .faq-chevron) { color: #9ca3af; }
  :global(.faq-item-open .faq-chevron) { transform: rotate(180deg); }
  :global(.faq-content) { overflow: hidden; }
  :global(.faq-content[hidden]) { display: none; }
  :global(.faq-content-inner) { padding: 0 20px 16px 20px; color: #374151; font-size: 14.5px; line-height: 1.65; }
  :global(.dark .faq-content-inner) { color: #d1d5db; }
  :global(.faq-content-inner p) { margin: 0; }
  :global(.faq-item-open .faq-trigger) { background: #f0fdfa; }
  :global(.dark .faq-item-open .faq-trigger) { background: #134e4a; }
</style>
