<script lang="ts">
  /**
   * AnswerReveal — the single answer block for answer pages.
   *
   * Pure HTML + CSS reveal via native <details>/<summary>: zero JavaScript, so
   * the answer text is always present in the prerendered HTML for crawlers and
   * the reveal can never break. Exactly one of these should exist per page.
   *
   * The answer is shown as normal large text — no letter tiles, no card box.
   */
  let {
    gameName = 'Wordle',
    answer = '',
    puzzleNumber = '',
    dateLong = '',
    summaryLabel = '',
    id = 'answer-reveal'
  }: {
    gameName?: string;
    answer: string;
    puzzleNumber?: string | number;
    dateLong?: string;
    summaryLabel?: string;
    id?: string;
  } = $props();

  let label = $derived(summaryLabel || `Reveal today's ${gameName} answer`);
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
    <p class="answer-text">{answer}</p>
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
    padding: 0.625rem 1.25rem;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 0.9375rem;
    line-height: 1.25;
    color: #fff;
    background-color: #0f766e;
    box-shadow: 0 4px 14px rgb(15 118 110 / 0.25);
    transition: background-color 0.2s ease, transform 0.15s ease;
  }
  .answer-reveal-summary .reveal-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
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
  /* No card box: the answer reads as normal large text on the page. */
  .answer-reveal-panel {
    margin-top: 1.25rem;
    padding: 0.5rem;
    text-align: center;
  }
  .answer-text {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    line-height: 1.15;
    text-transform: uppercase;
    color: #0f172a;
    overflow-wrap: break-word;
  }
  @media (min-width: 640px) {
    .answer-text {
      font-size: 3rem;
    }
  }
  .answer-meta {
    margin-top: 1rem;
    font-size: 0.95rem;
    color: #475569;
  }
</style>
