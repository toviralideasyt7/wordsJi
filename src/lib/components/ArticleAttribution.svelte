<script lang="ts">
  import { PRESTON_HAYES_AUTHOR_NAME } from '$lib/authors';

  /**
   * The who-edited-this / how-to-dispute-it line that sits above an article.
   *
   * It is its own component, with no content imports, because two different page
   * families render it: the ~25 -answer-today routes (via <AnswerArticle>) and
   * every Wordlebot solver route (via <WordlebotPage>). The solver routes must
   * not pull `answer-deep-dives.ts` — 39 KB of per-answer key takeaways and
   * figures that no solver page renders — into their module graph, so the data
   * enrichment stays in <AnswerArticle> and this block stays data-free.
   */
  let {
    /** Puzzle date the answer on this page was last checked against. */
    verified = null
  }: {
    verified?: string | null;
  } = $props();

  /**
   * Formatted in UTC: the loaders pass a puzzle date, and rendering it in a
   * negative-offset timezone would print the previous day.
   */
  const verifiedLabel = $derived.by(() => {
    if (!verified) return null;
    const parsed = new Date(verified);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  });
</script>

<!-- Attribution and corrections live in the document, not only in the Article
     JSON-LD: a reader who spots a wrong answer has to be able to say so from the
     page they are looking at. -->
<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
  <span>
    Edited by
    <a href="/about#preston-hayes" class="font-semibold text-slate-700 underline-offset-2 hover:text-teal-700 hover:underline dark:text-slate-200 dark:hover:text-teal-300"
      >{PRESTON_HAYES_AUTHOR_NAME}</a
    >
  </span>
  {#if verifiedLabel}
    <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">&middot;</span>
    <span>
      Answer verified <time datetime={verified}>{verifiedLabel}</time>
    </span>
  {/if}
  <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">&middot;</span>
  <a href="/contact" class="font-medium text-teal-700 underline-offset-2 hover:underline dark:text-teal-300"
    >Report a wrong answer</a
  >
  <span aria-hidden="true" class="text-slate-300 dark:text-slate-600">&middot;</span>
  <a href="/editorial-policy" class="font-medium text-teal-700 underline-offset-2 hover:underline dark:text-teal-300"
    >How corrections work</a
  >
</div>
