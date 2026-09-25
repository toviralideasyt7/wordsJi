<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import WordlebotSkeleton from './WordlebotSkeleton.svelte';
  import {
    getSolverFrameMinHeight,
    SOLVER_FRAME_MOBILE_EXTRA_PX
  } from '$lib/wordlebot-wasm/frame-height';
  import type { WordlebotAppPageConfig } from '$lib/wordlebot-wasm/types';
  import {
    getBestLengthForWordlebotGame,
    getWordlebotGame
  } from '$lib/wordlebot-wasm/game-config';

  let { config }: { config: WordlebotAppPageConfig } = $props();

  let host: HTMLDivElement | null = null;
  let activationTarget: HTMLDivElement | null = null;
  let isStarted = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state('');
  let cleanup: (() => void) | undefined;

  /**
   * Height the region holds open for the engine, so mounting fills space that is already there
   * instead of pushing the article below the card down the page.
   */
  let frameMinHeight = $derived(getSolverFrameMinHeight(config));

  /**
   * Word length the engine will actually solve for (falls back to the game's first supported
   * length when the page does not pin one). Used by the preload hint below so the browser
   * starts the dictionary download during HTML parse, before hydration can even begin.
   */
  let solverLength = $derived(
    config.pageType === 'solver' && config.game !== 'canuckle'
      ? getBestLengthForWordlebotGame(config.game, config.wordLength ?? getWordlebotGame(config.game).lengths[0])
      : null
  );

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
/* The first solve runs on idle right after mounting and replaces a one-line spinner with the
   ranked suggestion list. Holding the panel at its populated height keeps that swap from
   growing the page under the reader; the solver's suggestions are untouched. */
.results-panel {
  min-height: 440px;
}
`;

  /**
   * The app module and its stylesheet are pulled in once and shared by the preload and the
   * mount, so hovering the solver and then clicking it costs a single fetch of each.
   */
  let appModulePromise: Promise<{
    mountWordlebotApp: typeof import('$lib/wordlebot-wasm/app').mountWordlebotApp;
    preloadSolverAssets: typeof import('$lib/wordlebot-wasm/app').preloadSolverAssets;
    rawStyles: string;
  }> | null = null;

  function loadAppModule() {
    if (!appModulePromise) {
      appModulePromise = Promise.all([
        import('$lib/wordlebot-wasm/app'),
        import('$lib/wordlebot-wasm/styles.css?raw')
      ]).then(([app, styles]) => ({
        mountWordlebotApp: app.mountWordlebotApp,
        preloadSolverAssets: app.preloadSolverAssets,
        rawStyles: styles.default
      }));
    }

    return appModulePromise;
  }

  /**
   * Warm the engine and its word list for this page's game and length.
   *
   * Called immediately on mount. Loading ~0.9 MB of solver assets on every solver page view
   * is a deliberate trade made by the site owner on 2026-09-23: the earlier intent gate left
   * the placeholder visible indefinitely on a plain page load, which read as a broken tool.
   * All heavy processing still happens off the interaction path, and the results panel
   * communicates progress with its "Calculating suggestions..." state.
   */
  let preloadStarted = false;
  function preload() {
    if (preloadStarted || isStarted) {
      return;
    }

    preloadStarted = true;
    void loadAppModule()
      .then(({ preloadSolverAssets }) => preloadSolverAssets(config))
      .catch(() => {
        // Best effort: real errors surface when the app actually mounts.
        preloadStarted = false;
      });
  }

  async function start() {
    if (!host || isStarted || isLoading) {
      return;
    }

    // Warm the engine + dictionary in parallel with the app module load; the shared promise
    // caches make preload and mount download each asset exactly once.
    preload();
    isStarted = true;
    isLoading = true;
    errorMessage = '';
    cleanup?.();

    try {
      const { rawStyles, mountWordlebotApp } = await loadAppModule();

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
      // Timing beacon: when the solver actually becomes interactive.
      try {
        performance.mark('solver-interactive');
        (window as any).dataLayer?.push({ event: 'solver_interactive' });
      } catch {
        /* telemetry is best-effort */
      }
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : 'The solver engine could not load.';
      isStarted = false;
    } finally {
      isLoading = false;
    }
  }

  let mountObserver: IntersectionObserver | null = null;

  onMount(() => {
    // Start the ~0.9 MB WASM + dictionary download only when the solver is about to
    // enter the viewport, so it never competes with LCP on initial page load.
    // The skeleton placeholder keeps the region height-stable until then.
    if (typeof IntersectionObserver !== 'undefined' && activationTarget) {
      mountObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            mountObserver?.disconnect();
            mountObserver = null;
            void start();
          }
        },
        { rootMargin: '400px' }
      );
      mountObserver.observe(activationTarget);
    } else {
      void start();
    }

    return () => {
      mountObserver?.disconnect();
      mountObserver = null;
      cleanup?.();
    };
  });

  onDestroy(() => {
    cleanup?.();
  });
</script>

<svelte:head>
  <!-- Dictionary preload removed: the WASM engine and its word list load only when the
       solver approaches the viewport (see onMount above), never during initial page load. -->
</svelte:head>

<div
  bind:this={activationTarget}
  class="solver-shell"
  style="--solver-frame-min-height: {frameMinHeight}px; --solver-frame-mobile-extra: {SOLVER_FRAME_MOBILE_EXTRA_PX}px;"
>
  <!--
    One box, two occupants: the server-rendered placeholder and the mounted engine render into
    the same grid cell, so the region is never blank and swapping one for the other cannot
    change the region's height.
  -->
  <div class="solver-frame">
    {#if !isStarted || isLoading}
      <div class="solver-placeholder">
        <WordlebotSkeleton {config} />
      </div>
    {/if}

    <div
      bind:this={host}
      class="solver-host"
    ></div>
  </div>

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
</div>

<style>
  .solver-shell {
    display: block;
    width: 100%;
  }

  /* Reserves the mounted app's height before it exists, and lets the placeholder and the engine
     share one cell so the swap is height neutral. */
  .solver-frame {
    display: grid;
    width: 100%;
    min-height: var(--solver-frame-min-height, 0);
  }

  .solver-placeholder,
  .solver-host {
    grid-area: 1 / 1;
    width: 100%;
  }

  /* Matches the app's own breakpoint: below 520px its settings grid and guess entry stack. */
  @media (max-width: 520px) {
    .solver-frame {
      min-height: calc(
        var(--solver-frame-min-height, 0px) + var(--solver-frame-mobile-extra, 0px)
      );
    }
  }
</style>
