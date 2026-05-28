<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import WordlebotSkeleton from './WordlebotSkeleton.svelte';
  import type { WordlebotAppPageConfig } from '$lib/wordlebot-wasm/types';

  let { config }: { config: WordlebotAppPageConfig } = $props();

  let host: HTMLDivElement | null = null;
  let activationTarget: HTMLDivElement | null = null;
  let isStarted = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state('');
  let cleanup: (() => void) | undefined;

  function prepareShadowStyles(css: string) {
    return css
      .replace(/:root\s*\{/g, ':host {')
      .replace(/html,\s*body\s*\{/g, '.wasm-body {')
      .replace(/^body\s*\{/gm, '.wasm-body {')
      .replace(/:host\s*\{/g, ':host {')
      .replace(/\.shadow-body/g, '.wasm-body');
  }

  async function start() {
    if (!host || isStarted || isLoading) {
      return;
    }

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
    const startOnIntent = () => {
      void start();
    };
    const interactionEvents: Array<keyof HTMLElementEventMap> = ['pointerdown', 'touchstart'];
    const removeInteractionListeners = () => {
      if (!activationTarget) return;
      interactionEvents.forEach((eventName) => {
        activationTarget?.removeEventListener(eventName, startOnIntent);
      });
    };
    const scheduleIdleStart = () => {
      const run = () => {
        removeInteractionListeners();
        void start();
      };

      if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(run, { timeout: 2500 });
        return () => window.cancelIdleCallback(idleId);
      }

      const timeoutId = globalThis.setTimeout(run, 1500);
      return () => globalThis.clearTimeout(timeoutId);
    };

    interactionEvents.forEach((eventName) => {
      activationTarget?.addEventListener(eventName, startOnIntent, { once: true, passive: true });
    });
    window.addEventListener('keydown', startOnIntent, { once: true });

    const cancelIdleStart =
      document.readyState === 'complete'
        ? scheduleIdleStart()
        : (() => {
            let cancel = () => {};
            const handleLoad = () => {
              cancel = scheduleIdleStart();
            };
            window.addEventListener('load', handleLoad, { once: true });
            return () => {
              window.removeEventListener('load', handleLoad);
              cancel();
            };
          })();

    return () => {
      removeInteractionListeners();
      window.removeEventListener('keydown', startOnIntent);
      cancelIdleStart();
      cleanup?.();
    };
  });

  onDestroy(() => {
    cleanup?.();
  });
</script>

<div bind:this={activationTarget}>
  {#if !isStarted || isLoading}
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
</div>

<style>
  .solver-host {
    display: block;
    width: 100%;
    min-height: 280px;
  }
</style>
