// Dynamic slug page handler with improved SEO
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TODAY_STATIC_ROUTES, EVERGREEN_STATIC_ROUTES, ARCHIVE_STATIC_ROUTES } from '$lib/route-registry';

export const load: PageServerLoad = async ({ url, params }) => {
	const slug = params.slug;
	const path = `/${slug}`;
	
	// Check if this is a known route
	const knownRoutes = new Set([
		...TODAY_STATIC_ROUTES,
		...EVERGREEN_STATIC_ROUTES,
		...ARCHIVE_STATIC_ROUTES
	]);
	
	if (!knownRoutes.has(path)) {
		throw error(404, 'Page not found');
	}
	
	// For dynamic content pages, we'd normally fetch data here
	// For now, return metadata indicating this is a valid route
	return {
		path,
		slug,
		seo: {
			title: `WordSolverX - ${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
			description: 'Daily puzzle answers, solver tools, and strategy guides for Wordle and other popular word games.',
			keywords: ['wordle', 'puzzle', 'solver', 'answers', 'daily'],
			canonical: `https://wordsolverx.com${path}`
		}
	};
};