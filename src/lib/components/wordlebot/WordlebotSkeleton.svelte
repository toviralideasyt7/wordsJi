<script lang="ts">
  import type { WordlebotAppPageConfig } from '$lib/wordlebot-wasm/types';
  import { getWordlebotGame } from '$lib/wordlebot-wasm/game-config';

  /**
   * The placeholder shown until the solver mounts.
   *
   * It is deliberately dumb markup: one flat tile list per board, laid out by
   * `grid-template-columns` instead of nested rows, so a four-board grid costs a
   * few hundred bytes rather than the ~19 KB of nested divs and hydration
   * anchors this used to emit. The tiles are decorative (`aria-hidden`); the one
   * thing announced is the status line.
   */
  let { config }: { config: WordlebotAppPageConfig } = $props();

  let isCanucklePanel = $derived(config.pageType !== 'solver');
  let game = $derived(getWordlebotGame(config.pageType === 'solver' ? config.game : 'canuckle'));
  let wordLength = $derived(
    config.pageType === 'solver' && config.wordLength ? config.wordLength : game.lengths[0] ?? 5
  );
  let boardCount = $derived(game.boards);
  let maxGuesses = $derived(game.defaultMax);

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

  /**
   * Row one carries sample feedback so the placeholder looks like a board rather
   * than a grey grid. Every other slot is empty.
   */
  let boardTiles = $derived.by(() =>
    Array.from({ length: maxGuesses * wordLength }, (_, index) => {
      const column = index % wordLength;
      if (Math.floor(index / wordLength) > 0) return { letter: '', state: '' };
      return { letter: sampleWord[column] ?? '', state: SAMPLE_PATTERN[column % SAMPLE_PATTERN.length] };
    })
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
  <p class="status" role="status">
    <span class="spinner" aria-hidden="true"></span>
    Loading…
  </p>
{:else}
  <div
    class="skeleton"
    style="--tile-columns: {wordLength};"
  >
    <div class="boards" aria-hidden="true">
      {#each boardList as board}
        <div class="board">
          {#if boardCount > 1}
            <p class="board-label">Board {board + 1}</p>
          {/if}
          <div class="grid">
            {#each boardTiles as tile}
              <span class="tile" class:correct={tile.state === 'correct'} class:present={tile.state === 'present'}
                >{tile.letter}</span
              >
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <p class="status" role="status">
      <span class="spinner" aria-hidden="true"></span>
      Loading the solver…
    </p>

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
    padding-bottom: 0.75rem;
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

  .grid {
    display: grid;
    grid-template-columns: repeat(var(--tile-columns, 5), minmax(0, 1fr));
    gap: 4px;
  }

  .tile {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    border: 2px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-sm, 0.5rem);
    background: #fff;
    font-size: clamp(0.75rem, 2.2vw, 1.25rem);
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

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--color-border, #e2e8f0);
    border-top-color: var(--color-primary-500, #14b8a6);
    border-radius: 50%;
  }

  .canuckle-skeleton {
    display: grid;
    gap: 0.625rem;
    width: 100%;
  }

  .canuckle-skeleton .line {
    height: 0.875rem;
    border-radius: 9999px;
    background: var(--color-neutral-200, #e2e8f0);
  }

  .canuckle-skeleton .wide {
    width: 100%;
  }
  .canuckle-skeleton .medium {
    width: 75%;
  }
  .canuckle-skeleton .short {
    width: 45%;
  }

  @media (prefers-reduced-motion: no-preference) {
    .spinner {
      animation: solver-spin 0.8s linear infinite;
    }
    .canuckle-skeleton .line {
      animation: solver-pulse 1.8s ease-in-out infinite;
    }
  }

  @keyframes solver-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes solver-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
