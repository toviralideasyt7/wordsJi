<script lang="ts">
  import { getTodayPageArticle, type TodayArticleKey } from '$lib/daily-article-content';
  import { sanitizeGeneratedArticleHtml } from '$lib/generated-article-links';

  let {
    articleKey,
    articleDate,
    eyebrow = "Today's notes",
    fallbackTitle = "Today's notes",
    fallbackSummary = ''
  }: {
    articleKey: TodayArticleKey;
    articleDate: string;
    eyebrow?: string;
    fallbackTitle?: string;
    fallbackSummary?: string;
  } = $props();

  const article = $derived(getTodayPageArticle(articleKey, articleDate));

  // Reused stored articles can still display their own saved date when it differs from the page date.
  const displayDate = $derived(article?.date && article.date !== articleDate ? article.date : articleDate);
</script>

{#if article?.articleHtml}
  <section class="mt-12 rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
    <p class="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600">{eyebrow}</p>
    <p class="text-xs text-slate-400 mt-1">
      <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5 align-middle"></span>
      Updated {displayDate}
    </p>
    <h2 class="mt-2 text-3xl font-bold text-slate-900">
      {article.title || fallbackTitle}
    </h2>
    {#if article.summary || fallbackSummary}
      <p class="mt-4 text-lg leading-8 text-slate-600">
        {article.summary || fallbackSummary}
      </p>
    {/if}
    <div class="prose prose-lg mt-6 max-w-none prose-headings:scroll-mt-28 prose-h2:text-slate-900 prose-h3:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-teal-600">
      {@html sanitizeGeneratedArticleHtml(article.articleHtml)}
    </div>
  </section>
{/if}
