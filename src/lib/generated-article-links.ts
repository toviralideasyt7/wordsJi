import { PRERENDER_ENTRIES } from '$lib/route-registry.js';

const validPaths = new Set(PRERENDER_ENTRIES);

function normalizePath(path: string): string {
	const trimmed = path.replace(/\/+$/, '');
	return trimmed || '/';
}

export function sanitizeGeneratedArticleHtml(html: string): string {
	return html
		.replace(/<h1\b([^>]*)>/gi, '<h2$1>')
		.replace(/<\/h1>/gi, '</h2>')
		.replace(
		/<a\b([^>]*?)href=(["'])(\/[^"']*|https?:\/\/wordsolverx\.com\/[^"']*)\2([^>]*)>(.*?)<\/a>/gi,
		(match, beforeHref: string, _quote: string, href: string, afterHref: string, text: string) => {
			let path = href;

			if (href.startsWith('http')) {
				try {
					path = new URL(href).pathname;
				} catch {
					return text;
				}
			}

			if (validPaths.has(normalizePath(path))) {
				return `<a${beforeHref}href="${href}"${afterHref}>${text}</a>`;
			}

			return text;
		}
	);
}
