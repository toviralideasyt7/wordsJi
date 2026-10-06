<script lang="ts">
  /**
   * AnswerReveal — the single answer block for answer pages.
   *
   * Pure HTML + CSS reveal via native <details>/<summary>: zero JavaScript, so
   * the answer text is always present in the prerendered HTML for crawlers and
   * the reveal can never break. Exactly one of these should exist per page.
   */
  let {
    gameName = 'Wordle',
    answer = '',
    variant = 'tiles',
    tileColor = '#538d4e',
    puzzleNumber = '',
    dateLong = '',
    summaryLabel = '',
    id = 'answer-reveal'
  }: {
    gameName?: string;
    answer: string;
    variant?: 'tiles' | 'text';
    tileColor?: string;
    puzzleNumber?: string | number;
    dateLong?: string;
    summaryLabel?: string;
    id?: string;
  } = $props();

  let label = $derived(summaryLabel || `Reveal today's ${gameName} answer`);
  let letters = $derived(answer.toUpperCase().split(''));
</script>

<details class="answer-reveal" {id}>
  <summary class="answer-reveal-summary">
    <svg class="reveal-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    <span class="label-closed">{label}</span>
    <span class="label-open">Hide answer</span>
  </summary>

  <div class="answer-reveal-panel">
    {#if variant === 'tiles'}
      <div class="answer-tiles" aria-label={`Today's ${gameName} answer is ${answer.toUpperCase()}`}>
        {#each letters as letter}
          <span class="answer-tile" style="background-color: {tileColor}; border-color: {tileColor};">{letter}</span>
        {/each}
      </div>
    {:else}
      <p class="answer-text">{answer}</p>
    {/if}
    {#if puzzleNumber || dateLong}
      <p class="answer-meta">
        Today's {gameName} answer{#if puzzleNumber} <strong>#{puzzleNumber}</strong>{/if}{#if dateLong} for {dateLong}{/if}.
      </p>
    {/if}
  </div>
</details>

<style>
  .answer-reveal {
    max-width: 42rem;
    margin: 0 auto;
  }
  .answer-reveal summary {
    list-style: none;
    cursor: pointer;
  }
  .answer-reveal summary::-webkit-details-marker {
    display: none;
  }
  .answer-reveal summary::marker {
    display: none;
  }
  .answer-reveal-summary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    border-radius: 9999px;
    font-weight: 800;
    font-size: 1rem;
    color: #fff;
    background-color: #0f766e;
    box-shadow: 0 4px 14px rgb(15 118 110 / 0.25);
    transition: background-color 0.2s ease, transform 0.15s ease;
  }
  .answer-reveal-summary:hover {
    background-color: #115e59;
  }
  .answer-reveal-summary:active {
    transform: scale(0.97);
  }
  .answer-reveal-summary:focus-visible {
    outline: 3px solid #99f6e4;
    outline-offset: 2px;
  }
  .label-open {
    display: none;
  }
  .answer-reveal[open] .label-closed {
    display: none;
  }
  .answer-reveal[open] .label-open {
    display: inline;
  }
  .answer-reveal[open] .answer-reveal-summary {
    background-color: #334155;
  }
  .answer-reveal-panel {
    margin-top: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    background: #fff;
    padding: 2rem 1.5rem;
    text-align: center;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
  }
  .answer-tiles {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .answer-tile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.75rem;
    border: 2px solid;
    color: #fff;
    font-size: 1.875rem;
    font-weight: 900;
    text-transform: uppercase;
  }
  @media (min-width: 640px) {
    .answer-tile {
      width: 4rem;
      height: 4rem;
      font-size: 2.25rem;
    }
  }
  .answer-text {
    font-size: 2.25rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0f172a;
  }
  .answer-meta {
    margin-top: 1rem;
    font-size: 0.95rem;
    color: #475569;
  }
</style>
