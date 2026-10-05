<script lang="ts">
  import type { WordlebotAppPageConfig } from '$lib/wordlebot-wasm/types';
  import { getWordlebotGame } from '$lib/wordlebot-wasm/game-config';

  /**
   * The brief mounting placeholder shown while the solver engine loads.
   *
   * It is deliberately dumb markup: one flat tile row per board, laid out with the same tile
   * size and spacing the mounted app uses, plus a block where the suggestion list will land.
   * Earlier versions drew a full-width board of `aspect-ratio: 1` tiles, which is around
   * 4-11x taller than the app and made the swap a layout shift; matching the app's own
   * measurements is what lets the region reserve a height and keep it.
   *
   * The engine now loads immediately at page load, so this state is transient: the spinner and
   * status line communicate that loading is under way rather than waiting for input.
   *
   * The tiles are decorative (`aria-hidden`); the one thing announced is the status text.
   */
  let { config }: { config: WordlebotAppPageConfig } = $props();

  let isCanucklePanel = $derived(config.pageType !== 'solver');
  let game = $derived(getWordlebotGame(config.pageType === 'solver' ? config.game : 'canuckle'));
  let wordLength = $derived(
    config.pageType === 'solver' && config.wordLength ? config.wordLength : game.lengths[0] ?? 5
  );
  let boardCount = $derived(game.boards);

  /** One legal opener per length, used as the sample row so the tiles read as a board. */
  const SAMPLE_WORDS: Record<number, string> = {
    3: 'CAT',
    4: 'WORD',
    5: 'CRANE',
    6: 'PLANET',
    7: 'PIRATES',
    8: 'ELEPHANT',
    9: 'BUTTERFLY',
    10: 'STRAWBERRY',
    11: 'HELLOWORLD'
  };

  /** Green / gray / yellow mix so the placeholder reads as a real row of feedback. */
  const SAMPLE_PATTERN = ['correct', 'present', '', 'correct', 'present', '', 'correct'];

  let sampleWord = $derived((SAMPLE_WORDS[wordLength] ?? 'CRANE').slice(0, wordLength));

  let sampleTiles = $derived(
    Array.from({ length: wordLength }, (_, column) => ({
      letter: sampleWord[column] ?? '',
      state: SAMPLE_PATTERN[column % SAMPLE_PATTERN.length]
    }))
  );

  let boardList = $derived(Array.from({ length: boardCount }, (_, index) => index));
</script>

{#if isCanucklePanel}
  <div class="canuckle-skeleton" aria-hidden="true">
    <div class="line wide"></div>
    <div class="line short"></div>
    <div class="line wide"></div>
    <div class="line medium"></div>
  </div>
  <p class="status"><span class="spinner" aria-hidden="true"></span>Loading today's puzzle data…</p>
{:else}
  <div
    class="skeleton"
    style="--word-length: {wordLength};"
  >
    <div class="boards" aria-hidden="true">
      {#each boardList as board}
        <div class="board">
          {#if boardCount > 1}
            <p class="board-label">Board {board + 1}</p>
          {/if}
          <div class="guess-row">
            {#each sampleTiles as tile}
              <span class="tile" class:correct={tile.state === 'correct'} class:present={tile.state === 'present'}
                >{tile.letter}</span
              >
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="results-placeholder" aria-hidden="true">
      <p class="line short"></p>
      <p class="line wide"></p>
      <p class="line wide"></p>
      <p class="line medium"></p>
    </div>

    <p class="status"><span class="spinner" aria-hidden="true"></span>Loading the solver…</p>

    <noscript>
      <p class="noscript">The interactive solver needs JavaScript turned on. The steps and FAQ below still work.</p>
    </noscript>
  </div>
{/if}

<style>
  /* Chrome uses the site's tokens; the three tile states keep the game's own
     colours because green/yellow/gray is what the feedback means. */
  .skeleton {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    /* Fills the height the solver region reserved, so the placeholder and the mounted app
       occupy the same box. */
    height: 100%;
  }

  .boards {
    display: grid;
    gap: 0.75rem;
    width: 100%;
  }

  .board {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.5rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 1rem);
    background: #fff;
  }

  .board-label {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--color-text-tertiary, #64748b);
    text-align: center;
  }

  .guess-row {
    display: flex;
    justify-content: center;
    gap: 4px;
    width: 100%;
  }

  /* Same measurements as `.tile` in the solver's own stylesheet, so the placeholder's board
     and the mounted board are the same size at every viewport width. */
  .tile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(calc((100vw - 40px) / (var(--word-length, 5) + 0.8)), 62px);
    height: min(calc((100vw - 40px) / (var(--word-length, 5) + 0.8)), 62px);
    border: 2px solid var(--color-border, #e2e8f0);
    border-radius: 14px;
    background: #fff;
    font-size: clamp(0.9rem, calc(1.9rem - (var(--word-length, 5) - 5) * 0.12rem), 1.9rem);
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-primary, #0f172a);
  }

  .tile.correct {
    border-color: var(--wordle-green, #6aaa64);
    background: var(--wordle-green, #6aaa64);
    color: #fff;
  }

  .tile.present {
    border-color: var(--wordle-yellow, #c9b458);
    background: var(--wordle-yellow, #c9b458);
    color: #fff;
  }

  /* Stands in for the results panel the engine will render, and takes up the slack in the
     reserved height so the box looks deliberate rather than half empty. */
  .results-placeholder {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    min-height: 8rem;
    padding: 1rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 1rem);
    background: #fff;
  }

  .results-placeholder .line,
  .canuckle-skeleton .line {
    height: 0.875rem;
    margin: 0;
    border-radius: 9999px;
    background: var(--color-neutral-200, #e2e8f0);
  }

  .results-placeholder .wide,
  .canuckle-skeleton .wide {
    width: 100%;
  }
  .results-placeholder .medium,
  .canuckle-skeleton .medium {
    width: 75%;
  }
  .results-placeholder .short,
  .canuckle-skeleton .short {
    width: 45%;
  }

  .spinner {
    display: inline-block;
    flex: 0 0 auto;
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 9999px;
    animation: skeleton-spin 0.8s linear infinite;
  }

  @keyframes skeleton-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Dead-click fix: the placeholder tiles look like a finished game board, so
     clicks on them while the engine loads felt unresponsive. The pulse marks
     the whole region as "working", never as an interactive board. */
  .tile,
  .results-placeholder .line,
  .canuckle-skeleton .line {
    animation: skeleton-pulse 1.6s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }
    .tile,
    .results-placeholder .line,
    .canuckle-skeleton .line {
      animation: none;
    }
  }
  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-tertiary, #64748b);
  }

  .noscript {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-accent-700, #b45309);
  }

  .canuckle-skeleton {
    display: grid;
    gap: 0.625rem;
    width: 100%;
  }

  @media (max-width: 520px) {
    .tile {
      width: min(calc((100vw - 28px) / (var(--word-length, 5) + 0.8)), 54px);
      height: min(calc((100vw - 28px) / (var(--word-length, 5) + 0.8)), 54px);
      border-radius: 10px;
      font-size: clamp(0.75rem, calc(1.55rem - (var(--word-length, 5) - 5) * 0.1rem), 1.55rem);
    }
  }
</style>
