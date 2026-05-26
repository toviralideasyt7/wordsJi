<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import WordlebotSkeleton from './WordlebotSkeleton.svelte';
  import type { WordlebotAppPageConfig } from '$lib/wordlebot-wasm/types';

  let { config }: { config: WordlebotAppPageConfig } = $props();

  let host: HTMLDivElement | null = null;
  let isStarted = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state('');
  let cleanup: (() => void) | undefined;
  let fallbackTimer: number | null = null;
  let fallbackFrame: number | null = null;

  function prepareShadowStyles(css: string) {
    return css
      .replace(/:root\s*\{/g, ':host {')
      .replace(/html,\s*body\s*\{/g, '.wasm-body {')
      .replace(/^body\s*\{/gm, '.wasm-body {')
      .replace(/:host\s*\{/g, ':host {')
      .replace(/\.shadow-body/g, '.wasm-body');
  }

  function clearFallbackStart() {
    if (fallbackFrame !== null) {
      cancelAnimationFrame(fallbackFrame);
      fallbackFrame = null;
    }

    if (fallbackTimer !== null) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function scheduleFallbackStart() {
    if (typeof window === 'undefined' || isStarted || isLoading) {
      return;
    }

    clearFallbackStart();

    fallbackFrame = window.requestAnimationFrame(() => {
      fallbackFrame = null;
      if (host && !isStarted && !isLoading) {
        void start();
      }
    });

    fallbackTimer = window.setTimeout(() => {
      fallbackTimer = null;
      if (host && !isStarted && !isLoading) {
        void start();
      }
    }, 1200);
  }

  async function start() {
    if (!host || isStarted || isLoading) {
      return;
    }

    clearFallbackStart();
    isStarted = true;
    isLoading = true;
    errorMessage = '';
    cleanup?.();

    try {
      const [{ default: rawStyles }, { mountWordlebotApp }] = await Promise.all([
        import('$lib/wordlebot-wasm/styles.css?raw'),
        import('$lib/wordlebot-wasm/app')
      ]);

      const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = '';

      const style = document.createElement('style');
      style.textContent = prepareShadowStyles(rawStyles);

      const body = document.createElement('div');
      body.className = 'wasm-body';

      const appTarget = document.createElement('div');
      body.appendChild(appTarget);

      shadowRoot.append(style, body);
      cleanup = mountWordlebotApp(appTarget, config);
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : 'The solver engine could not load.';
      isStarted = false;
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !isStarted && !isLoading) {
            void start();
            return;
          }
        }
      },
      { rootMargin: '200px', threshold: 0.05 }
    );

    if (host) {
      observer.observe(host);
      const rect = host.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 200 && rect.bottom >= -200) {
        void start();
      } else {
        scheduleFallbackStart();
      }
    }

    return () => {
      observer.disconnect();
      clearFallbackStart();
    };
  });

  onDestroy(() => {
    clearFallbackStart();
    cleanup?.();
  });
</script>

{#if !isStarted}
  <WordlebotSkeleton {config} />
{/if}

{#if errorMessage}
  <div class="mx-auto w-full max-w-5xl px-4 py-6 text-center sm:px-6 lg:px-8">
    <div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {errorMessage}
      <button
        type="button"
        class="ml-2 font-semibold underline"
        onclick={() => void start()}
      >
        Retry
      </button>
    </div>
  </div>
{/if}

<div
  bind:this={host}
  class="solver-host block w-full"
  style="min-height: 280px;"
></div>

<style>
  .solver-host {
    display: block;
    width: 100%;
    min-height: 280px;
  }
</style>
