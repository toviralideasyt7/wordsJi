import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { PAGES_FUNCTION_INCLUDE_ROUTES, PRERENDER_ENTRIES } from './src/lib/route-registry.js';

const isPagesBuild = Boolean(process.env.CF_PAGES || process.env.BUILD_TARGET === 'pages');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			config: isPagesBuild ? 'wrangler.pages.jsonc' : 'wrangler.jsonc',
			...(isPagesBuild
				? {
						routes: {
							include: PAGES_FUNCTION_INCLUDE_ROUTES,
							exclude: []
						}
					}
				: {})
		}),
		// 0 = never inline stylesheets into the document. Anything inlined is
		// re-downloaded with every navigation and can never be cached; at 4096
		// this was putting 0.7–3.8 KB of component CSS into every answer and
		// solver document. External CSS files are cached across pages, so the
		// only cost is one extra request on a cold cache.
		inlineStyleThreshold: 0,
		prerender: {
			crawl: false,
			entries: PRERENDER_ENTRIES
		}
	}
};

export default config;
