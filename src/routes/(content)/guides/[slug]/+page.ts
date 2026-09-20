import { error } from '@sveltejs/kit';
import { GUIDES, getGuide } from '$lib/content/guides';
import { articleKeywords, countArticleWords, estimateReadingMinutes } from '$lib/content/article-metrics';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

/**
 * The 20 guide pages are the only (content) routes that hydrate: the reading
 * progress bar, the sticky-TOC scroll-spy and the below-the-fold reveals all
 * need client JS. Everything else under (content) keeps the layout's csr=false
 * and ships zero JavaScript.
 */
export const csr = true;

export const entries: EntryGenerator = () => {
  return GUIDES.map((g) => ({ slug: g.slug }));
};

export const load: PageLoad = ({ params }) => {
  const guide = getGuide(params.slug);
  if (!guide) {
    throw error(404, 'Guide not found');
  }

  // Counted from the same content the page renders (prose, takeaways, figure
  // text and FAQs), so the published wordCount matches what a reader sees.
  const wordCount = countArticleWords(guide.body);

  return {
    guide,
    wordCount,
    readingMinutes: estimateReadingMinutes(wordCount),
    articleSection: guide.group,
    keywords: articleKeywords(guide.body, [guide.keyword]),
    meta: {
      title: guide.title,
      description: guide.description
    },
    publishedDate: guide.publishedDate,
    modifiedDate: guide.modifiedDate
  };
};
