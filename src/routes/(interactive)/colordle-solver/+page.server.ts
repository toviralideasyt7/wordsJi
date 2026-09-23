import { ARTICLE_CONTENT } from '$lib/content/registry';
import type { PageServerLoad } from './$types';

/**
 * Server-only load, on purpose.
 *
 * Importing ARTICLE_CONTENT in the component pulled the whole content registry (~680 KB built)
 * into this route's client bundle just to render one article - the single largest first-load
 * cost. Loading it here keeps the registry in the server graph; the prerendered document
 * carries only this article's data.
 */
export function load() {
	return {
		article: ARTICLE_CONTENT['colordle-solver']
	};
}