<script lang="ts">
  import StaticArticle from './StaticArticle.svelte';
  import ArticleAttribution from './ArticleAttribution.svelte';
  import KeyTakeaways from './article/KeyTakeaways.svelte';
  import { ANSWER_EXTRAS, withAnswerExtras } from '$lib/content/answer-deep-dives';
  import type { StaticArticleContent } from '$lib/content/registry';

  /**
   * The guide-tier renderer for the daily answer articles.
   *
   * <StaticArticle> keeps its old defaults on purpose — around 40 other routes
   * and the archive calendar render it and must keep their current HTML — so the
   * answer pages opt in here instead: large type scale, scroll-reveal figures,
   * the in-article table of contents, a key-takeaways block, and this page's own
   * figures, all applied through the component's existing props.
   *
   * This component is the *only* consumer of `answer-deep-dives.ts`, and only the
   * -answer-today routes import it. The solver shell (<WordlebotPage>) renders
   * the same presentation tier — attribution line plus a large-scale, animated
   * <StaticArticle> — but takes `ArticleAttribution` and `StaticArticle` directly,
   * so `ANSWER_EXTRAS` never enters a solver page's module graph.
   *
   * Nothing rendered here is animated by default. The reveal action only adds
   * `reveal-armed` from client JS, and only below the fold, so the prerendered
   * document is complete and readable with JavaScript disabled.
   */
  let {
    content,
    vars = {},
    /** Puzzle date the answer on this page was last checked against. */
    verified = null
  }: {
    content: StaticArticleContent;
    vars?: Record<string, string>;
    verified?: string | null;
  } = $props();

  const enriched = $derived(withAnswerExtras(content, ANSWER_EXTRAS[content.key]));
</script>

<ArticleAttribution {verified} />

{#if enriched.keyTakeaways?.length}
  <KeyTakeaways items={enriched.keyTakeaways} />
{/if}

<StaticArticle
  content={enriched}
  {vars}
  containerClass="w-full max-w-none"
  scale="large"
  motion={true}
/>
