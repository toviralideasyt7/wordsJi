/**
 * Shared text metrics for StaticArticleContent.
 *
 * These helpers used to live privately inside StaticArticle.svelte. They moved
 * here so the guide route (word counts, reading time, TOC generation) and the
 * artile renderer agree on exactly one implementation of heading slugs and
 * word counting. Anchor IDs must stay byte-identical to the old private
 * helpers — the prerendered `#anchor` links in sitemap-era articles depend on
 * it.
 *
 * Tabs, per repo convention for .ts files.
 */

import type { StaticArticleContent, StaticArticleSection, StaticArticleVisual } from './registry';

/** Replace `{token}` placeholders with values from `vars`; unknown tokens pass through. */
export function substituteVars(text: string, vars: Record<string, string> = {}): string {
	if (!text.includes('{')) return text;
	return text.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

/** Heading -> stable anchor id. Must not change: prerendered links point at these. */
export function slugifyHeading(heading: string, vars: Record<string, string> = {}): string {
	return substituteVars(heading, vars)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
}

export interface ArticleHeading {
	heading: string;
	id: string;
}

/** Resolved headings (vars substituted) plus their anchor ids, in document order. */
export function articleHeadings(
	content: StaticArticleContent,
	vars: Record<string, string> = {}
): ArticleHeading[] {
	return content.sections.map((section) => ({
		heading: substituteVars(section.heading, vars),
		id: slugifyHeading(section.heading, vars)
	}));
}

function words(text: string | undefined): number {
	if (!text) return 0;
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

/** All visible strings a visual block contributes, so counts stay honest. */
function visualWordCount(visual: StaticArticleVisual): number {
	let total = words(visual.title) + words(visual.caption);
	switch (visual.type) {
		case 'tiles':
			for (const row of visual.rows) {
				total += words(row.word) + words(row.note);
			}
			break;
		case 'bars':
			for (const bar of visual.bars) {
				total += words(bar.label) + words(bar.note) + words(String(bar.value));
			}
			if (visual.unit) total += words(visual.unit);
			break;
		case 'steps':
			for (const step of visual.steps) {
				total += words(step.title) + words(step.body);
			}
			break;
		case 'stats':
			for (const stat of visual.stats) {
				total += words(stat.value) + words(stat.label) + words(stat.note);
			}
			break;
		case 'table':
			total += visual.headers.reduce((sum, header) => sum + words(header), 0);
			for (const row of visual.rows) {
				total += words(row.label) + words(row.value);
			}
			break;
		case 'swatches':
			for (const swatch of visual.swatches) {
				total += words(swatch.label) + words(swatch.hex);
			}
			break;
	}
	return total;
}

function sectionWordCount(section: StaticArticleSection): number {
	let total = words(section.heading);
	for (const paragraph of section.paragraphs ?? []) total += words(paragraph);
	if (section.list) {
		total += words(section.list.title);
		for (const item of section.list.items) total += words(item);
	}
	if (section.callout) {
		total += words(section.callout.title) + words(section.callout.body);
	}
	const visuals = section.visual
		? Array.isArray(section.visual)
			? section.visual
			: [section.visual]
		: [];
	for (const visual of visuals) total += visualWordCount(visual);
	return total;
}

/**
 * Total readable words in an article: intro, key takeaways, every section
 * (prose, list, callout, and the text rendered inside visual blocks), and the
 * FAQs. Visual text counts because it is real, visible copy in the HTML.
 */
export function countArticleWords(content: StaticArticleContent): number {
	let total = words(content.intro) + words(content.eyebrow);
	for (const takeaway of content.keyTakeaways ?? []) total += words(takeaway);
	for (const section of content.sections) total += sectionWordCount(section);
	total += words(content.faqHeading);
	for (const faq of content.faqs) total += words(faq.question) + words(faq.answer);
	return total;
}

/** Reading time for `words` at a 220 wpm clip, never below two minutes. */
export function estimateReadingMinutes(wordCount: number): number {
	return Math.max(2, Math.round(wordCount / 220));
}

/** Keywords for Article schema: the target keyword plus the article's headings. */
export function articleKeywords(content: StaticArticleContent, extra: string[] = []): string[] {
	const headings = content.sections.map((section) => substituteVars(section.heading)).slice(0, 8);
	return [...new Set([...extra, ...headings].filter(Boolean))];
}
