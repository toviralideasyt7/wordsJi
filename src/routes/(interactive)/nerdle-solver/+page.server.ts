import { ARTICLE_CONTENT } from '$lib/content/registry';
import type { PageServerLoad } from './$types';

/**
 * Server-only load, on purpose.
 *
 * The page renders exactly one article, but importing ARTICLE_CONTENT inside the component put
 * the whole content registry (every article on the site, ~680 KB built) into this route's
 * client bundle - it was the single largest cost of the first load. Loading it here keeps the
 * registry in the server graph; the prerendered document carries only this article's data, so
 * the browser never downloads the rest.
 */
export function load() {
	return {
		article: ARTICLE_CONTENT['nerdle-solver']
	};
}