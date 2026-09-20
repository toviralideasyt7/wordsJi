import { error } from '@sveltejs/kit';
import { GUIDES, getGuide } from '$lib/content/guides';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
  return GUIDES.map((g) => ({ slug: g.slug }));
};

export const load: PageLoad = ({ params }) => {
  const guide = getGuide(params.slug);
  if (!guide) {
    throw error(404, 'Guide not found');
  }
  return {
    guide,
    meta: {
      title: guide.title,
      description: guide.description
    },
    publishedDate: guide.publishedDate,
    modifiedDate: guide.modifiedDate
  };
};
