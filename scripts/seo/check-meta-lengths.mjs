#!/usr/bin/env node
/**
 * Asserts every prerendered page ships a usable <title> and <meta name="description">.
 *
 * Reads the final HTML SvelteKit emitted rather than the source that produced it, so the
 * numbers below are what a crawler actually receives -- including date-interpolated titles
 * and descriptions, which vary in length from one puzzle day to the next.
 *
 * Run `npm run build` first. Checked in CI-friendly order by `npm run seo:check-meta`.
 *
 * Usage:
 *   node scripts/seo/check-meta-lengths.mjs            # assert every page
 *   node scripts/seo/check-meta-lengths.mjs --report   # print every page, never fail
 *   node scripts/seo/check-meta-lengths.mjs --dir=DIR  # read a different output directory
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 140;
const DESC_MAX = 158;

// Candidate output directories, in order of preference. `.svelte-kit/output/prerendered/pages`
// is SvelteKit's own prerender output; `build/cloudflare-worker` is the deployed artefact.
const CANDIDATE_DIRS = [
	'.svelte-kit/output/prerendered/pages',
	'build/cloudflare-worker'
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');

const args = process.argv.slice(2);
const reportOnly = args.includes('--report');
const explicitDir = args.find((arg) => arg.startsWith('--dir='))?.slice('--dir='.length);

function resolveSourceDir() {
	if (explicitDir) {
		const dir = path.resolve(projectRoot, explicitDir);
		if (!existsSync(dir)) {
			throw new Error(`--dir=${explicitDir} does not exist.`);
		}
		return dir;
	}

	for (const candidate of CANDIDATE_DIRS) {
		const dir = path.join(projectRoot, candidate);
		if (existsSync(dir)) {
			return dir;
		}
	}

	throw new Error(
		`No prerendered output found. Run \`npm run build\` first, or pass --dir=<dir>. Looked in: ${CANDIDATE_DIRS.join(', ')}`
	);
}

function walkHtml(dir, base = dir, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walkHtml(full, base, out);
		} else if (entry.isFile() && entry.name.endsWith('.html')) {
			out.push(path.relative(base, full).split(path.sep).join('/'));
		}
	}
	return out;
}

// Titles and descriptions contain apostrophes and ampersands, which Svelte escapes in the
// emitted HTML. Count what a reader sees, not the entity source.
const ENTITIES = [
	['&amp;', '&'],
	['&lt;', '<'],
	['&gt;', '>'],
	['&quot;', '"'],
	['&#39;', "'"],
	['&#x27;', "'"],
	['&nbsp;', ' ']
];

function decodeEntities(value) {
	return ENTITIES.reduce((acc, [entity, char]) => acc.replaceAll(entity, char), value);
}

function extract(html) {
	const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	const descMatch =
		html.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/i) ??
		html.match(/<meta\s+content="([\s\S]*?)"\s+name="description"/i);

	return {
		title: titleMatch ? decodeEntities(titleMatch[1]).trim() : null,
		description: descMatch ? decodeEntities(descMatch[1]).trim() : null
	};
}

function routeFor(relativePath) {
	const route = `/${relativePath.replace(/\.html$/, '')}`;
	return route.endsWith('/index') ? route.slice(0, -'index'.length) : route;
}

const sourceDir = resolveSourceDir();
const files = walkHtml(sourceDir).sort();

const pages = [];
const skippedRedirects = [];

for (const file of files) {
	const html = readFileSync(path.join(sourceDir, file), 'utf8');

	// Redirect stubs (`src/routes/**/+server.ts` throwing redirect) prerender as a bare
	// meta-refresh fragment with no <html> element. They are not indexable pages.
	if (!/<html[\s>]/i.test(html)) {
		skippedRedirects.push(routeFor(file));
		continue;
	}

	pages.push({ route: routeFor(file), ...extract(html) });
}

const problems = [];
const titleOwners = new Map();
const descriptionOwners = new Map();

for (const page of pages) {
	const label = page.route;

	if (!page.title) {
		problems.push(`${label} :: missing <title>`);
	} else {
		const length = page.title.length;
		if (length < TITLE_MIN || length > TITLE_MAX) {
			problems.push(
				`${label} :: title ${length} chars (need ${TITLE_MIN}-${TITLE_MAX}) :: ${page.title}`
			);
		}
		const previous = titleOwners.get(page.title);
		if (previous) {
			problems.push(`${label} :: duplicate title, also used by ${previous} :: ${page.title}`);
		} else {
			titleOwners.set(page.title, label);
		}
	}

	if (!page.description) {
		problems.push(`${label} :: missing <meta name="description">`);
	} else {
		const length = page.description.length;
		if (length < DESC_MIN || length > DESC_MAX) {
			problems.push(
				`${label} :: description ${length} chars (need ${DESC_MIN}-${DESC_MAX}) :: ${page.description}`
			);
		}
		const previous = descriptionOwners.get(page.description);
		if (previous) {
			problems.push(
				`${label} :: duplicate description, also used by ${previous} :: ${page.description}`
			);
		} else {
			descriptionOwners.set(page.description, label);
		}
	}
}

console.log(`source: ${path.relative(projectRoot, sourceDir).split(path.sep).join('/')}`);
console.log(
	`pages checked: ${pages.length} (titles ${TITLE_MIN}-${TITLE_MAX}, descriptions ${DESC_MIN}-${DESC_MAX})`
);
if (skippedRedirects.length > 0) {
	console.log(`redirect stubs skipped: ${skippedRedirects.length}`);
}

if (reportOnly) {
	for (const page of pages) {
		console.log(
			[
				page.route.padEnd(46),
				`T ${String(page.title?.length ?? '-').padStart(3)}`,
				`D ${String(page.description?.length ?? '-').padStart(3)}`,
				page.title ?? '',
				'||',
				page.description ?? ''
			].join(' | ')
		);
	}
	process.exit(0);
}

if (problems.length > 0) {
	console.error(`\nFAIL: ${problems.length} metadata problem(s)\n`);
	for (const problem of problems) {
		console.error(`  ${problem}`);
	}
	process.exit(1);
}

console.log(`\nOK: all ${pages.length} pages within range and unique.`);
