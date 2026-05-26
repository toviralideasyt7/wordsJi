<script lang="ts">
  import { getTodayPageArticle, type TodayArticleKey } from '$lib/daily-article-content';
  import { sanitizeGeneratedArticleHtml } from '$lib/generated-article-links';

  let {
    articleKey,
    articleDate,
    allowStaleDate = false,
    eyebrow = "Today's notes",
    fallbackTitle = "Today's notes",
    fallbackSummary = ''
  }: {
    articleKey: TodayArticleKey;
    articleDate: string;
    allowStaleDate?: boolean;
    eyebrow?: string;
    fallbackTitle?: string;
    fallbackSummary?: string;
  } = $props();

  const article = $derived(getTodayPageArticle(articleKey, articleDate, { allowStaleDate }));
</script>

{#if article?.articleHtml}
  <section class="mx-auto mt-10 w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:mt-12 sm:p-8">
    <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600">{eyebrow}</p>
    <h2 class="mt-2 text-3xl font-bold text-slate-900">
      {article.title || fallbackTitle}
    </h2>
    {#if article.summary || fallbackSummary}
      <p class="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        {article.summary || fallbackSummary}
      </p>
    {/if}
    <div class="prose mt-5 max-w-none prose-slate prose-headings:scroll-mt-28 prose-h2:mb-3 prose-h2:mt-8 prose-h2:text-2xl prose-h2:font-black prose-h2:text-slate-900 prose-h3:mb-2 prose-h3:mt-6 prose-h3:text-lg prose-h3:font-bold prose-h3:text-slate-900 prose-p:my-4 prose-p:text-base prose-p:leading-7 prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-teal-600">
      {@html sanitizeGeneratedArticleHtml(article.articleHtml)}
    </div>
  </section>
{/if}
