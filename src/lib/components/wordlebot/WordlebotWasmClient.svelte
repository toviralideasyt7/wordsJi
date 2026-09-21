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

  /**
   * Bridge the site's design tokens into the shadow root.
   *
   * Custom properties inherit across a shadow boundary, so the solver only has to
   * re-point its own variables at the outer ones instead of hard-coding a second
   * palette. Chrome — panel, borders, text, accent, radii, shadows — follows the
   * page; the three feedback colours are left alone, because green/yellow/gray is
   * what the puzzle feedback means, not a theme choice.
   *
   * Appended after the solver stylesheet so these declarations win on order, and
   * `background: transparent` replaces the sheet's own beige body gradient with
   * the card's surface colour.
   */
  const HOST_TOKEN_BRIDGE = `
:host {
  --background: var(--color-bg-secondary, #f8fafc);
  --panel: var(--color-bg-primary, #ffffff);
  --panel-strong: var(--color-bg-primary, #ffffff);
  --text-color: var(--color-text-primary, #0f172a);
  --muted-text: var(--color-text-tertiary, #64748b);
  --link-border: var(--color-border, #e2e8f0);
  --card-border: var(--color-border, #e2e8f0);
  --accent: var(--color-primary-600, #0d9488);
  --accent-soft: var(--color-primary-50, #f0fdfa);
  --button-text: var(--color-bg-primary, #ffffff);
  --radius-tile: var(--radius-sm, 0.5rem);
  --radius-card: var(--radius-lg, 1rem);
  --radius-pill: 9999px;
  --shadow-soft: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  --shadow-hover: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.07));
  --shadow-tile: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  --transition-smooth: var(--duration-normal, 220ms) var(--easing-in-out, cubic-bezier(0.4, 0, 0.2, 1));
}
.wasm-body {
  background: transparent;
  color: var(--text-color);
}
`;

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
      style.textContent = prepareShadowStyles(rawStyles) + HOST_TOKEN_BRIDGE;

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

    // Preload the app module, styles, and the page-specific WASM solver + dictionary
    // during idle — non-blocking. This does NOT run any solve logic (suggestions are
    // unchanged); it only resolves the dynamic imports so that when start() fires on
    // interaction/idle, the modules are already cached and the app mounts + renders
    // its first suggestions with no cold-import delay.
    let preloadStarted = false;
    const runPreload = () => {
      if (preloadStarted) return;
      preloadStarted = true;
      void Promise.all([
        import('$lib/wordlebot-wasm/styles.css?raw'),
        import('$lib/wordlebot-wasm/app').then(({ preloadSolverAssets }) => preloadSolverAssets(config))
      ]).catch(() => {
        // Best-effort: real errors surface when the app actually mounts.
        preloadStarted = false;
      });
    };
    const schedulePreload = () => {
      if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(() => runPreload(), { timeout: 4000 });
        return () => window.cancelIdleCallback(idleId);
      }
      const timeoutId = globalThis.setTimeout(runPreload, 600);
      return () => globalThis.clearTimeout(timeoutId);
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

    // Kick off the non-blocking preload as soon as the page is done loading (or now).
    const cancelPreload =
      document.readyState === 'complete'
        ? schedulePreload()
        : (() => {
            let cancel = () => {};
            const handleLoad = () => {
              cancel = schedulePreload();
            };
            window.addEventListener('load', handleLoad, { once: true });
            return () => {
              window.removeEventListener('load', handleLoad);
              cancel();
            };
          })();

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
      cancelPreload();
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
    <div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {errorMessage}
      <button
        type="button"
        class="ml-2 font-semibold underline"
        onclick={() => void start()}
      >
        Retry
      </button>
    </div>
  {/if}

  <div
    bind:this={host}
    class="solver-host block w-full"
  ></div>
</div>

<style>
  /* Reserved while the solver is still loading, so the framed card does not
     resize under the reader when the engine mounts. */
  .solver-host {
    display: block;
    width: 100%;
    min-height: 280px;
  }
</style>
