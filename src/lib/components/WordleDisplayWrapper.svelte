<script lang="ts">
  import { browser } from '$app/environment';
  import type { WordleAnswer } from '$lib/api';
  import RevealableWordleDisplay from './RevealableWordleDisplay.svelte';
  import YouTubeVideoEmbed from './YouTubeVideoEmbed.svelte';
  import SocialShareButton from './SocialShareButton.svelte';

  let {
    wordleData,
    wordleWord,
    wordleNumber,
    formattedDate,
    pageContext,
    contentGuide,
    bonusHints = [],
    socialImage,
    youtubeVideoUrl,
  }: {
    wordleData: WordleAnswer | null;
    wordleWord: string;
    wordleNumber: number;
    formattedDate: string;
    pageContext: 'today' | 'archive';
    contentGuide?: string | null;
    bonusHints?: string[];
    socialImage?: string | null;
    youtubeVideoUrl?: string | null;
  } = $props();

  let isRevealed = $state(false);
  let showBonusHints = $state(false);
  let currentUrl = $state('');
  let analysisEl: HTMLDivElement | undefined = $state();

  // Set current URL on client mount
  $effect(() => {
    if (browser) currentUrl = window.location.href;
  });

  // Pronounce word using Web Speech API
  function pronounceWord(word: string) {
    if (browser && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  let pageTitle = $derived.by(() => {
    if (pageContext === 'today') return `Wordle Hints and Answer for Today (${formattedDate})`;
    return `Wordle Answer for ${formattedDate}`;
  });

  let aboutTitle = $derived.by(() => {
    if (pageContext === 'today') return "About Today's Wordle";
    return `About Wordle for ${formattedDate}`;
  });

  let solutionText = $derived.by(() => {
    const lw = wordleWord.toLowerCase();
    if (pageContext === 'archive') return `The word <span class="font-semibold text-teal-600 dark:text-teal-400">"${lw}"</span> was the solution for the Wordle puzzle on ${formattedDate}.`;
    return `The word <span class="font-semibold text-teal-600 dark:text-teal-400">"${lw}"</span> is the solution for today's Wordle puzzle.`;
  });

  let comeBackText = $derived.by(() => {
    if (pageContext === 'archive') return 'Browse the archive for more past Wordle solutions.';
    return "If you've already played today's puzzle, come back tomorrow for the next solution!";
  });

  // Split contentGuide
  let { hintsHtml, revealHtml, analysisHtml } = $derived.by(() => {
    let h: string | null = null;
    let r: string | null = null;
    let a: string | null = null;

    if (contentGuide) {
      const revealHeaderRegex = /<h2[^>]*>.*?Wordle Answer Revealed.*?<\/h2>/i;
      const headerMatch = contentGuide.match(revealHeaderRegex);
      if (headerMatch) {
        const headerIndex = headerMatch.index!;
        h = contentGuide.substring(0, headerIndex);
        const afterHeader = contentGuide.substring(headerIndex + headerMatch[0].length);
        const pMatch = afterHeader.match(/<p[^>]*>.*?<\/p>/i);
        if (pMatch) {
          const pEndIndex = pMatch.index! + pMatch[0].length;
          r = headerMatch[0] + afterHeader.substring(0, pEndIndex);
          a = afterHeader.substring(pEndIndex);
        } else {
          r = headerMatch[0];
          a = afterHeader;
        }
      } else {
        a = contentGuide;
      }
    }
    return { hintsHtml: h, revealHtml: r, analysisHtml: a };
  });

  // Enhance rendered HTML: pronunciation button + collapsible FAQs
  $effect(() => {
    const container = analysisEl;
    if (!container || !analysisHtml) return;

    // 1. Add pronunciation speaker button
    const allPs = container.querySelectorAll('p');
    allPs.forEach((p) => {
      const strong = p.querySelector('strong');
      if (strong && strong.textContent?.includes('Pronunciation')) {
        if (p.querySelector('.pronunciation-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'pronunciation-btn';
        btn.setAttribute('aria-label', 'Listen to pronunciation');
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
        btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;border:none;background:#0d9488;color:white;cursor:pointer;margin-left:8px;vertical-align:middle;transition:all 0.2s;flex-shrink:0;';
        btn.onmouseenter = () => { btn.style.background = '#0f766e'; btn.style.transform = 'scale(1.1)'; };
        btn.onmouseleave = () => { btn.style.background = '#0d9488'; btn.style.transform = 'scale(1)'; };
        btn.onclick = () => {
          pronounceWord(wordleWord);
          btn.style.transform = 'scale(0.9)';
          setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
        };
        p.style.display = 'flex';
        p.style.alignItems = 'center';
        p.style.flexWrap = 'wrap';
        p.appendChild(btn);
      }
    });

    // 2. Convert FAQ section into collapsible accordion
    const allH2s = container.querySelectorAll('h2');
    let faqH2: Element | null = null;
    allH2s.forEach((h2) => {
      if (h2.textContent?.toLowerCase().includes('frequently asked')) faqH2 = h2;
    });

    if (faqH2) {
      const faqItems: { question: Element; answer: Element[] }[] = [];
      let currentSibling = (faqH2 as Element).nextElementSibling;
      let currentItem: { question: Element; answer: Element[] } | null = null;

      while (currentSibling) {
        if (currentSibling.tagName === 'H2') break;
        if (currentSibling.tagName === 'H3') {
          if (currentItem) faqItems.push(currentItem);
          currentItem = { question: currentSibling, answer: [] };
        } else if (currentItem) {
          currentItem.answer.push(currentSibling);
        }
        currentSibling = currentSibling.nextElementSibling;
      }
      if (currentItem) faqItems.push(currentItem);

      if (faqItems.length > 0) {
        const accordion = document.createElement('div');
        accordion.className = 'faq-accordion';

        faqItems.forEach((item, index) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'faq-item';
          if (index === 0) wrapper.classList.add('faq-item-first');
          if (index === faqItems.length - 1) wrapper.classList.add('faq-item-last');

          const trigger = document.createElement('button');
          trigger.className = 'faq-trigger';
          trigger.setAttribute('aria-expanded', 'false');
          trigger.innerHTML = `<span class="faq-question-text">${item.question.textContent}</span><svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

          const content = document.createElement('div');
          content.className = 'faq-content';
          content.hidden = true;
          const inner = document.createElement('div');
          inner.className = 'faq-content-inner';
          item.answer.forEach(el => inner.appendChild(el.cloneNode(true)));
          content.appendChild(inner);

          trigger.onclick = () => {
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!isOpen));
            wrapper.classList.toggle('faq-item-open', !isOpen);
            content.hidden = isOpen;
          };

          wrapper.appendChild(trigger);
          wrapper.appendChild(content);
          accordion.appendChild(wrapper);
        });

        faqItems.forEach(item => {
          item.question.remove();
          item.answer.forEach(el => el.remove());
        });

        (faqH2 as Element).insertAdjacentElement('afterend', accordion);
        (faqH2 as HTMLElement).style.cssText = 'margin-bottom: 16px;';
      }
    }
  });

  let vowelCount = $derived(wordleWord.toLowerCase().split('').filter((c: string) => 'aeiou'.includes(c)).length);
  let consonantCount = $derived(wordleWord.toLowerCase().split('').filter((c: string) => !'aeiou'.includes(c)).length);

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

      {#if bonusHints.length > 0}
        <section class="mb-8 max-w-3xl mx-auto rounded-xl border border-teal-200 dark:border-teal-800/40 bg-teal-50/70 dark:bg-teal-900/20 p-6 shadow-sm">
          <div class="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
                <span class="text-lg font-bold">+</span>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Extra Hint Pass</p>
                <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Fresh hints if you still want one more nudge</h2>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-500"
              aria-expanded={showBonusHints}
              onclick={() => (showBonusHints = !showBonusHints)}
            >
              {showBonusHints ? 'Hide extra hints' : 'Reveal extra hints'}
            </button>
          </div>
          {#if showBonusHints}
            <ul class="space-y-3">
              {#each bonusHints as hint}
                <li class="rounded-2xl bg-white dark:bg-slate-800 px-4 py-3 text-sm leading-6 text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-teal-200 dark:ring-teal-800/40">
                  {hint}
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/if}

      <!-- 3. YouTube Video -->
      <YouTubeVideoEmbed videoUrl={youtubeVideoUrl} title="Wordle {formattedDate} - Video Solution" />

      <!-- 4. Interactive Wordle Game Board -->
      <RevealableWordleDisplay
        word={wordleWord}
        number={wordleNumber}
        date={formattedDate}
        days_since_launch={wordleData?.days_since_launch}
        onReveal={() => (isRevealed = true)}
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

      <!-- 5. Reveal & Analysis -->
      {#if revealHtml || analysisHtml}
        <div class="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow-[0_1px_3px_rgb(0_0_0/0.04)] p-6 sm:p-8 max-w-3xl mx-auto border border-slate-200 dark:border-slate-700">
          {#if revealHtml}
            <div class="prose prose-slate dark:prose-invert max-w-none mb-8 border-b border-slate-100 pb-8 transition-all duration-700 dark:border-slate-700 reveal-section" class:revealed={isRevealed}>
              {@html revealHtml}
            </div>
          {/if}

          {#if analysisHtml}
            <div
              bind:this={analysisEl}
              class="prose prose-slate dark:prose-invert max-w-none wordle-analysis-content"
            >
              {@html analysisHtml}
            </div>
          {/if}

          <!-- Social Share - visible when revealed -->
          {#if isRevealed}
            <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
              <p class="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Share this solution</p>
              <div class="flex flex-wrap justify-center gap-3">
                {#each socialPlatforms as platform}
                  <SocialShareButton {platform} url={currentUrl} title={pageTitle} />
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- 6. Fallback "About" Section (no contentGuide) -->
      {#if !contentGuide}
        <div class="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow-[0_1px_3px_rgb(0_0_0/0.04)] p-6 sm:p-8 max-w-3xl mx-auto border border-slate-200 dark:border-slate-700 transition-all duration-500">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-full p-2.5 mr-4">
              <svg class="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{aboutTitle}</h2>
          </div>

          <div class="prose prose-slate dark:prose-invert max-w-none transition-all duration-500 {isRevealed ? '' : 'blurred-answer'}">
            <p class="text-base sm:text-lg text-slate-700 dark:text-slate-300">
              {@html solutionText.replace(wordleWord.toLowerCase(), wordleWord.toUpperCase())}
            </p>
            <p class="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300">
              This answer is for {#if wordleData?.days_since_launch}<span class="font-medium">Day {wordleData.days_since_launch}</span>{:else}{pageContext}{/if}, released on {formattedDate}. {comeBackText}
            </p>
          </div>

          <!-- Stats Grid -->
          <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center transition-all duration-500 {isRevealed ? '' : 'blurred-stats'}">
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Day</p>
              <p class="text-lg font-semibold text-slate-900 dark:text-white">{wordleData?.days_since_launch}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Letters</p>
              <p class="text-lg font-semibold text-slate-900 dark:text-white">{wordleWord.length}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Vowels</p>
              <p class="text-lg font-semibold text-slate-900 dark:text-white">{vowelCount}</p>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Consonants</p>
              <p class="text-lg font-semibold text-slate-900 dark:text-white">{consonantCount}</p>
            </div>
          </div>

          <!-- Social Share - visible when revealed -->
          {#if isRevealed}
            <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
              <p class="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Share this solution</p>
              <div class="flex flex-wrap justify-center gap-3">
                {#each socialPlatforms as platform}
                  <SocialShareButton {platform} url={currentUrl} title={pageTitle} />
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
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
  .reveal-section {
    filter: blur(8px);
    user-select: none;
  }
  .reveal-section.revealed {
    filter: none;
    user-select: auto;
  }
  .blurred-answer {
    filter: blur(8px);
    user-select: none;
  }
  .blurred-stats {
    filter: blur(6px);
    user-select: none;
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
