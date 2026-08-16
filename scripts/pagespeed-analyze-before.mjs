import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
	ARCHIVE_STATIC_ROUTES,
	EVERGREEN_STATIC_ROUTES,
	TODAY_STATIC_ROUTES
} from '../src/lib/route-registry.js';

const OUTPUT_DIR = process.env.PAGESPEED_OUTPUT_DIR ?? 'before-opti';
const STRATEGIES = ['mobile', 'desktop'];
const routes = [...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES])];

const metricAudits = [
	'first-contentful-paint',
	'largest-contentful-paint',
	'cumulative-layout-shift',
	'total-blocking-time',
	'speed-index',
	'interactive'
];

const issueAudits = [
	'render-blocking-resources',
	'unused-javascript',
	'unused-css-rules',
	'total-byte-weight',
	'mainthread-work-breakdown',
	'bootup-time',
	'uses-long-cache-ttl',
	'server-response-time',
	'dom-size',
	'network-requests',
	'third-party-summary',
	'third-party-facades',
	'uses-text-compression',
	'modern-image-formats',
	'uses-optimized-images',
	'uses-responsive-images',
	'offscreen-images',
	'uses-webp-images',
	'efficient-animated-content',
	'font-display',
	'preload-lcp-image',
	'prioritize-lcp-image',
	'redirects',
	'legacy-javascript',
	'duplicated-javascript',
	'viewport'
];

const codeMappings = [
	{
		name: 'Shared interactive layout and hydration',
		match: (route) => isInteractiveRoute(route),
		files: [
			'src/routes/(interactive)/+layout.svelte',
			'src/lib/components/Navigation.svelte',
			'src/lib/components/Footer.svelte',
			'src/lib/utils/performance.ts'
		],
		fix:
			'Reduce shared client-side layout work, keep analytics/performance observers gated, and avoid hydrating shared UI on pages that do not need it.'
	},
	{
		name: 'Content layout without client JS',
		match: (route) => isContentRoute(route),
		files: ['src/routes/(content)/+layout.svelte', 'src/content.css'],
		fix:
			'Keep content routes CSR-free, shrink shared content CSS, and avoid adding client-only components to answer/article pages.'
	},
	{
		name: 'Interactive CSS and inline CSS delivery',
		match: (_route, auditId) => auditId === 'unused-css-rules' || auditId === 'render-blocking-resources',
		files: ['src/interactive.css', 'src/content.css', 'svelte.config.js'],
		fix:
			'Narrow Tailwind source scanning and lower inlineStyleThreshold so CSS can be cached instead of repeated in every HTML document.'
	},
	{
		name: 'Wordlebot WASM solver pages',
		match: (route) =>
			[
				'/wordle-solver',
				'/3-letter-wordle-solver',
				'/4-letter-wordle-solver',
				'/5-letter-wordle-solver',
				'/6-letter-wordle-solver',
				'/7-letter-wordle-solver',
				'/8-letter-wordle-solver',
				'/9-letter-wordle-solver',
				'/10-letter-wordle-solver',
				'/11-letter-wordle-solver',
				'/quordle-solver',
				'/dordle-solver',
				'/octordle-solver',
				'/thirdle-solver',
				'/hardle-solver',
				'/warmle-solver',
				'/woodle-solver',
				'/w-peaks-solver',
				'/xordle-solver',
				'/fibble-solver',
				'/spotle-wordle-solver',
				'/canuckle',
				'/canuckle-solver',
				'/canuckle-archive',
				'/canuckle-answer-today'
			].includes(route),
		files: [
			'src/lib/components/wordlebot/WordlebotWasmClient.svelte',
			'src/lib/wordlebot-wasm/app.ts',
			'src/lib/wordlebot-wasm/assets/generated/per-length/index.ts'
		],
		fix:
			'Lazy-load solver datasets/WASM after first paint or user interaction, and avoid calculating starting suggestions during initial page load.'
	},
	{
		name: 'Squaredle dictionary loading',
		match: (route) => route === '/squaredle-solver',
		files: [
			'src/routes/(interactive)/squaredle-solver/+page.svelte',
			'src/lib/components/squaredle/SquaredleSolverClient.svelte',
			'src/lib/squaredle/client-solver.ts',
			'static/squaredle/words_alpha.txt.gz'
		],
		fix:
			'Do not load the full Squaredle dictionary on mount; defer it until the user loads today or clicks solve, and prefer compressed static delivery.'
	},
	{
		name: 'Wordle analyzer worker data',
		match: (route) => route === '/wordle-analyzer',
		files: [
			'src/routes/(interactive)/wordle-analyzer/+page.svelte',
			'src/lib/components/wordle-analyzer/WordleAnalyzerClient.svelte',
			'src/lib/workers/wordle-analyzer.worker.ts',
			'static/data/wordle-analyzer/word-data.json'
		],
		fix:
			'Start analyzer worker and fetch analyzer datasets only when the user begins analysis, not during initial render.'
	},
	{
		name: 'Archive and static dataset pages',
		match: (route) => route.endsWith('-archive') || route === '/archive',
		files: ['src/lib/archive-data.ts', 'src/lib/archive-client.ts', 'src/lib/components/ArchiveCalendar.svelte'],
		fix:
			'Keep archive landing content light and lazy-load large history datasets only when a specific archive is opened or searched.'
	},
	{
		name: 'Spotle dataset pages',
		match: (route) => route.includes('spotle'),
		files: [
			'src/routes/(interactive)/spotle-solver/+page.svelte',
			'src/routes/(interactive)/spotle-archive/+page.svelte',
			'src/routes/(interactive)/spotle-answer-today/+page.server.ts',
			'static/spotle_data.json'
		],
		fix:
			'Avoid bundling Spotle data into page JS/HTML; fetch the JSON lazily and cache it with stable static headers.'
	},
	{
		name: 'WASM and generated data cache headers',
		match: (_route, auditId) => auditId === 'uses-long-cache-ttl' || auditId === 'total-byte-weight',
		files: ['_headers', 'static/generated/per-length/*', 'static/wasm-lib/*', 'static/phoodle-wasm/*'],
		fix:
			'Add long-lived cache headers for immutable WASM, generated word-data, dictionaries, and stable JSON assets while keeping daily data short-lived.'
	}
];

function safeRouteName(route) {
	if (route === '/') return '__home';
	return route.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_') || '__home';
}

function resultPath(route, strategy) {
	return path.join(OUTPUT_DIR, 'pages', safeRouteName(route), `${strategy}.json`);
}

async function readJson(filePath) {
	try {
		return JSON.parse(await readFile(filePath, 'utf8'));
	} catch {
		return null;
	}
}

function scoreToNumber(score) {
	return typeof score === 'number' ? Math.round(score * 100) : null;
}

function auditValue(audit) {
	if (!audit) return null;
	return {
		id: audit.id,
		title: audit.title,
		score: audit.score,
		scoreDisplayMode: audit.scoreDisplayMode,
		displayValue: audit.displayValue ?? null,
		numericValue: typeof audit.numericValue === 'number' ? audit.numericValue : null,
		numericUnit: audit.numericUnit ?? null,
		description: audit.description ?? null
	};
}

function detailsSummary(details) {
	if (!details) return null;
	const summary = {};
	if (details.type) summary.type = details.type;
	if (details.overallSavingsMs) summary.overallSavingsMs = Math.round(details.overallSavingsMs);
	if (details.overallSavingsBytes) summary.overallSavingsBytes = details.overallSavingsBytes;
	if (details.summary) summary.summary = details.summary;
	if (Array.isArray(details.items)) {
		summary.itemCount = details.items.length;
		summary.topItems = details.items.slice(0, 8).map((item) => summarizeItem(item));
	}
	return summary;
}

function summarizeItem(item) {
	const keys = [
		'url',
		'source',
		'entity',
		'group',
		'label',
		'node',
		'totalBytes',
		'wastedBytes',
		'wastedMs',
		'blockingTime',
		'duration',
		'transferSize',
		'resourceSize',
		'cacheLifetimeMs'
	];
	const summary = {};
	for (const key of keys) {
		if (item?.[key] === undefined) continue;
		if (key === 'node' && item.node) {
			summary.node = {
				type: item.node.type,
				snippet: item.node.snippet,
				selector: item.node.selector
			};
		} else {
			summary[key] = item[key];
		}
	}
	return summary;
}

function isFailingAudit(audit) {
	if (!audit) return false;
	if (audit.score === null) return Boolean(audit.details?.overallSavingsMs || audit.details?.overallSavingsBytes);
	if (typeof audit.score === 'number') return audit.score < 0.9;
	return Boolean(audit.displayValue || audit.details?.items?.length);
}

function extractIssues(lighthouseResult) {
	const audits = lighthouseResult?.audits ?? {};
	const manual = issueAudits
		.map((id) => audits[id])
		.filter(isFailingAudit)
		.map((audit) => ({
			...auditValue(audit),
			details: detailsSummary(audit.details)
		}));

	const opportunities = Object.values(audits)
		.filter((audit) => audit?.details?.type === 'opportunity' && isFailingAudit(audit))
		.map((audit) => ({
			...auditValue(audit),
			details: detailsSummary(audit.details)
		}));

	const diagnostics = Object.values(audits)
		.filter((audit) => audit?.details?.type === 'table' && isFailingAudit(audit))
		.map((audit) => ({
			...auditValue(audit),
			details: detailsSummary(audit.details)
		}));

	const byId = new Map();
	for (const issue of [...manual, ...opportunities, ...diagnostics]) {
		if (issue?.id && !byId.has(issue.id)) byId.set(issue.id, issue);
	}

	return [...byId.values()].sort((a, b) => issueSeverity(b) - issueSeverity(a));
}

function issueSeverity(issue) {
	const savingsMs = issue.details?.overallSavingsMs ?? 0;
	const savingsBytes = issue.details?.overallSavingsBytes ?? 0;
	const scorePenalty = typeof issue.score === 'number' ? (1 - issue.score) * 1000 : 100;
	return scorePenalty + savingsMs + savingsBytes / 1024;
}

function isInteractiveRoute(route) {
	if (route === '/') return false;
	const contentRoutes = new Set([
		'/about',
		'/archive',
		'/contact',
		'/disclaimer',
		'/guides',
		'/privacy-policy',
		'/solver',
		'/terms-of-service',
		'/today',
		'/dotadle-answer-today-updated',
		'/loldle-answer-today-updated',
		'/narutodle-answer-today-updated',
		'/onepiecedle-answer-today-updated',
		'/pokedle-answer-today-updated',
		'/smashdle-answer-today-updated'
	]);
	return !contentRoutes.has(route);
}

function isContentRoute(route) {
	return !isInteractiveRoute(route);
}

function mapCodeAreas(route, issues) {
	const matched = new Map();
	for (const issue of issues) {
		for (const mapping of codeMappings) {
			if (!mapping.match(route, issue.id)) continue;
			if (!matched.has(mapping.name)) {
				matched.set(mapping.name, {
					name: mapping.name,
					files: mapping.files,
					recommendedFix: mapping.fix,
					triggeredByAudits: []
				});
			}
			matched.get(mapping.name).triggeredByAudits.push(issue.id);
		}
	}
	return [...matched.values()].map((mapping) => ({
		...mapping,
		triggeredByAudits: [...new Set(mapping.triggeredByAudits)]
	}));
}

function routeFamily(route) {
	if (route === '/') return 'home';
	if (route.endsWith('-archive') || route === '/archive') return 'archive pages';
	if (route.endsWith('-answer-today') || route === '/today') return 'today answer pages';
	if (route.includes('wordle-solver') || route === '/wordle-solver') return 'wordlebot solver pages';
	if (route.endsWith('-solver') || route === '/solver') return 'solver pages';
	return 'content pages';
}

function rowFor(route, strategy, json) {
	if (!json?.lighthouseResult) {
		return {
			route,
			strategy,
			status: 'missing',
			score: null,
			metrics: {},
			issues: [],
			codeAreas: []
		};
	}

	const lighthouse = json.lighthouseResult;
	const audits = lighthouse.audits ?? {};
	const issues = extractIssues(lighthouse);
	return {
		route,
		strategy,
		status: 'ok',
		url: lighthouse.finalDisplayedUrl ?? lighthouse.finalUrl ?? null,
		fetchTime: lighthouse.fetchTime ?? null,
		score: scoreToNumber(lighthouse.categories?.performance?.score),
		metrics: Object.fromEntries(metricAudits.map((id) => [id, auditValue(audits[id])])),
		keyAudits: Object.fromEntries(issueAudits.map((id) => [id, auditValue(audits[id])])),
		issues,
		codeAreas: mapCodeAreas(route, issues)
	};
}

function summarizeRoute(route, mobile, desktop) {
	const allIssues = [...(mobile.issues ?? []), ...(desktop.issues ?? [])];
	return {
		route,
		family: routeFamily(route),
		mobileScore: mobile.score,
		desktopScore: desktop.score,
		lowestScore: Math.min(mobile.score ?? 101, desktop.score ?? 101),
		status: mobile.status === 'ok' && desktop.status === 'ok' ? 'ok' : 'missing',
		mobileMetrics: mobile.metrics,
		desktopMetrics: desktop.metrics,
		topIssues: allIssues.slice(0, 10).map((issue) => ({
			id: issue.id,
			title: issue.title,
			displayValue: issue.displayValue,
			score: issue.score,
			savingsMs: issue.details?.overallSavingsMs ?? null,
			savingsBytes: issue.details?.overallSavingsBytes ?? null
		})),
		codeAreas: mergeCodeAreas([...(mobile.codeAreas ?? []), ...(desktop.codeAreas ?? [])])
	};
}

function mergeCodeAreas(areas) {
	const merged = new Map();
	for (const area of areas) {
		if (!merged.has(area.name)) {
			merged.set(area.name, {
				name: area.name,
				files: area.files,
				recommendedFix: area.recommendedFix,
				triggeredByAudits: []
			});
		}
		merged.get(area.name).triggeredByAudits.push(...area.triggeredByAudits);
	}
	return [...merged.values()].map((area) => ({
		...area,
		triggeredByAudits: [...new Set(area.triggeredByAudits)]
	}));
}

function buildIssuesByType(rows) {
	const byType = new Map();
	for (const row of rows) {
		for (const issue of row.issues ?? []) {
			if (!byType.has(issue.id)) {
				byType.set(issue.id, {
					id: issue.id,
					title: issue.title,
					description: issue.description,
					occurrences: 0,
					routes: [],
					strategies: { mobile: 0, desktop: 0 },
					totalSavingsMs: 0,
					totalSavingsBytes: 0,
					codeAreas: new Map()
				});
			}
			const group = byType.get(issue.id);
			group.occurrences += 1;
			group.routes.push({
				route: row.route,
				strategy: row.strategy,
				score: row.score,
				displayValue: issue.displayValue,
				savingsMs: issue.details?.overallSavingsMs ?? null,
				savingsBytes: issue.details?.overallSavingsBytes ?? null
			});
			group.strategies[row.strategy] += 1;
			group.totalSavingsMs += issue.details?.overallSavingsMs ?? 0;
			group.totalSavingsBytes += issue.details?.overallSavingsBytes ?? 0;
			for (const area of row.codeAreas ?? []) {
				group.codeAreas.set(area.name, area);
			}
		}
	}

	return [...byType.values()]
		.map((group) => ({
			...group,
			totalSavingsMs: Math.round(group.totalSavingsMs),
			totalSavingsBytes: Math.round(group.totalSavingsBytes),
			codeAreas: [...group.codeAreas.values()],
			routes: group.routes.sort((a, b) => (a.score ?? 101) - (b.score ?? 101))
		}))
		.sort((a, b) => b.occurrences - a.occurrences || b.totalSavingsMs - a.totalSavingsMs);
}

function buildPagePlan(summaries) {
	return summaries
		.filter((summary) => summary.status === 'ok')
		.map((summary) => ({
			page: summary.route,
			pageFamily: summary.family,
			mobileScore: summary.mobileScore,
			desktopScore: summary.desktopScore,
			priority:
				summary.lowestScore < 70
					? 'critical'
					: summary.lowestScore < 85
						? 'high'
						: summary.lowestScore < 90
							? 'medium'
							: 'monitor',
			psiIssuesFound: summary.topIssues,
			codeFilesCausingIssue: [
				...new Set(summary.codeAreas.flatMap((area) => area.files))
			],
			exactOptimizationChange: summary.codeAreas.map((area) => area.recommendedFix),
			expectedImpact:
				summary.lowestScore < 90
					? 'Should directly improve this page toward the 90+ mobile and desktop target.'
					: 'Keep as a regression guard; page already meets or is close to target.',
			riskLevel: summary.codeAreas.some((area) => area.name.includes('WASM')) ? 'medium' : 'low',
			testsRequired: [
				'npm run check',
				'npm run test',
				'npm run build:pages',
				`Re-run PSI mobile and desktop for ${summary.route}`
			]
		}))
		.sort((a, b) => Math.min(a.mobileScore ?? 101, a.desktopScore ?? 101) - Math.min(b.mobileScore ?? 101, b.desktopScore ?? 101));
}

async function writeJson(filePath, value) {
	await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function markdownTable(headers, rows) {
	const escapeCell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
	return [
		`| ${headers.map(escapeCell).join(' | ')} |`,
		`| ${headers.map(() => '---').join(' | ')} |`,
		...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`)
	].join('\n');
}

function issueById(issues, id) {
	return issues.find((issue) => issue.id === id);
}

function failingRoutesForMarkdown(summaries) {
	return summaries
		.filter((route) => route.status !== 'ok' || (route.mobileScore ?? 0) < 90 || (route.desktopScore ?? 0) < 90)
		.toSorted((a, b) => a.lowestScore - b.lowestScore);
}

function buildMarkdownPlan({ summary, issuesByType, worstPages, optimizationPlan }) {
	const unusedJs = issueById(issuesByType, 'unused-javascript');
	const renderBlocking = issueById(issuesByType, 'render-blocking-insight');
	const mainThread = issueById(issuesByType, 'mainthread-work-breakdown');
	const layoutShifts = issueById(issuesByType, 'layout-shifts');
	const redirects = issueById(issuesByType, 'redirects');
	const failing = failingRoutesForMarkdown(summary.routes);

	const byPriority = optimizationPlan.pages.reduce((groups, page) => {
		(groups[page.priority] ||= []).push(page);
		return groups;
	}, {});

	const criticalHigh = [...(byPriority.critical ?? []), ...(byPriority.high ?? [])];
	const medium = byPriority.medium ?? [];

	return `# WordSolverX PSI Optimization Plan

Generated from the raw PageSpeed Insights JSON in \`${OUTPUT_DIR}/pages/**\`.

## Baseline Snapshot

- Routes audited: ${summary.routeCount}
- PSI responses analyzed: ${summary.okResultCount}/${summary.resultCount}
- Passing both mobile and desktop 90+: ${summary.passingBothCount}
- Missing the 90+ target on at least one strategy: ${summary.failingTargetCount}
- Worst route: ${worstPages[0]?.route} (mobile ${worstPages[0]?.mobileScore}, desktop ${worstPages[0]?.desktopScore})

## Global PSI Findings

${markdownTable(
	['Issue', 'Occurrences', 'Mobile', 'Desktop', 'Evidence', 'Primary code area', 'Plan'],
	[
		[
			'Unused JavaScript',
			unusedJs?.occurrences,
			unusedJs?.strategies.mobile,
			unusedJs?.strategies.desktop,
			'Every run flags ~63 KiB from https://www.googletagmanager.com/gtag/js?id=G-8QRMXK049Z',
			'src/app.html, src/lib/utils/performance.ts, interactive/content layouts',
			'Delay analytics until first interaction or a longer post-load idle window; prevent layout-level page_view calls from forcing useful work before the page is stable.'
		],
		[
			'Render blocking CSS',
			renderBlocking?.occurrences,
			renderBlocking?.strategies.mobile,
			renderBlocking?.strategies.desktop,
			'Every run reports route CSS assets such as /_app/immutable/assets/3.*.css or /2.*.css',
			'src/interactive.css, src/content.css, svelte.config.js',
			'Shrink Tailwind output, split solver-specific CSS, keep only above-the-fold shell CSS critical, and revisit inlineStyleThreshold.'
		],
		[
			'Main-thread work',
			mainThread?.occurrences,
			mainThread?.strategies.mobile,
			mainThread?.strategies.desktop,
			'Worst runs: /3-letter-wordle-solver 16.7s mobile / 24.6s desktop, /soundmap-solver 5.2s mobile, /squaredle-solver 3.8s mobile',
			'Wordlebot WASM app, Squaredle dictionary, Soundmap/Spotle runtime imports',
			'Stop heavy datasets, WASM initialization, first-guess solving, dictionary parsing, and large filtering from running on initial page load.'
		],
		[
			'Layout shifts',
			layoutShifts?.occurrences,
			layoutShifts?.strategies.mobile,
			layoutShifts?.strategies.desktop,
			'Routes include /spotle-solver, /quordle-answer-today, /canuckle-archive, /nerdle-solver',
			'Affected page components and shared nav/footer spacing',
			'Reserve dimensions for dynamic cards, answer reveals, search/filter results, headings, and any late-loaded solver sections.'
		],
		[
			'Redirects',
			redirects?.occurrences,
			redirects?.strategies.mobile,
			redirects?.strategies.desktop,
			'/canuckle and /wordle-solver each lose ~760ms on mobile due to 301 chains',
			'route registry and redirect route files',
			'Audit and expose final canonical routes directly; remove redirected aliases from the performance target list or render lightweight canonical pages instead of redirecting.'
		]
	]
)}

## Priority Implementation Plan

1. **Analytics and shared shell first**
   Fix \`src/app.html\` so Google Analytics does not load during Lighthouse's critical window. Keep the tiny queue stub, but load gtag only after first interaction, visibility-confirmed idle time, or a longer delay. Then remove duplicate early page-view work from \`src/routes/(interactive)/+layout.svelte\` and \`src/lib/utils/performance.ts\`. This targets all 101 routes.

2. **CSS delivery second**
   Reduce \`src/interactive.css\` scanning. It currently scans broad \`src/lib/**/*\`, which makes every interactive route pay for styles used by unrelated solvers. Split Wordlebot/Squaredle/Soundmap-specific style sources or add route-level CSS entrypoints. Re-test the render-blocking audit after each split.

3. **Heavy solver hydration third**
   For Wordlebot routes, do not call \`renderSolver()\` and \`solveAndRender()\` during initial mount. Render a static solver shell or skeleton first, then load the per-length dataset/WASM only after the user clicks into the solver, presses an explicit "Start solver" button, or the browser reaches a safe idle window. Move dictionary parsing, candidate scoring, and expensive solver startup into Web Workers where possible. This targets all 11 Wordlebot solver pages, especially \`/3-letter-wordle-solver\` and \`/9-letter-wordle-solver\`.

4. **Dataset-heavy single pages fourth**
   Fix \`/squaredle-solver\`, \`/soundmap-solver\`, and \`/spotle-solver\` individually. Each has real main-thread cost beyond the global gtag/CSS issues.

5. **Inline data and generated content fifth**
   For answer/archive pages, keep only above-the-fold answer summary, primary schema, and critical page metadata in the initial HTML. Load long history arrays, full archive tables, generated article bodies, and non-critical FAQ/Article JSON-LD after idle or user intent. This keeps the visual design intact while reducing HTML parse time.

6. **Bundle, font, CLS, and redirects last**
   Reserve dimensions for the small set of CLS pages and remove redirected aliases from the speed target set once canonical routes are being audited directly.

## Page And Family Plan

${markdownTable(
	['Page / family', 'Mobile', 'Desktop', 'PSI issues', 'Code files', 'Exact optimization change', 'Risk', 'Tests'],
	criticalHigh.map((page) => [
		`${page.page} (${page.pageFamily})`,
		page.mobileScore,
		page.desktopScore,
		page.psiIssuesFound.slice(0, 4).map((issue) => issue.id).join(', '),
		page.codeFilesCausingIssue.slice(0, 5).join('<br>'),
		page.exactOptimizationChange.slice(0, 3).join('<br>'),
		page.riskLevel,
		page.testsRequired.join('<br>')
	])
)}

## Medium Priority Pages

${markdownTable(
	['Page / family', 'Mobile', 'Desktop', 'Main PSI issues', 'Primary change'],
	medium.map((page) => [
		`${page.page} (${page.pageFamily})`,
		page.mobileScore,
		page.desktopScore,
		page.psiIssuesFound.slice(0, 4).map((issue) => issue.id).join(', '),
		page.exactOptimizationChange.slice(0, 2).join('<br>')
	])
)}

## Specific Code Fixes

- \`src/app.html\`: make GA opt-in to a later trigger; keep the card-filter/copy helpers, but split them into a small static file or route-specific module if they continue to show up in bootup cost.
- \`src/routes/(interactive)/+layout.svelte\`: remove unnecessary page-view work from initial reactive effects; keep \`PerformanceMonitor.init()\` dev/perfDebug-only.
- \`src/interactive.css\`: replace broad \`@source "./lib/**/*"\` with explicit shared components plus route/component-specific CSS imports.
- \`svelte.config.js\`: revisit \`inlineStyleThreshold: 100000\`; use a small threshold after CSS is split so repeated HTML does not carry large style payloads.
- \`src/lib/components/wordlebot/WordlebotWasmClient.svelte\` and \`src/lib/wordlebot-wasm/app.ts\`: add a static idle shell and defer dataset/WASM plus initial \`solveAndRender\`.
- \`src/lib/components/squaredle/SquaredleSolverClient.svelte\` and \`src/lib/squaredle/client-solver.ts\`: remove dictionary loading from \`onMount\`; parse/build dictionary in a worker after user action.
- \`src/routes/(interactive)/soundmap-solver/+page.svelte\`: do not import artist JSON or start the guide interval on mount; load runtime when search/focus starts.
- \`src/routes/(interactive)/spotle-solver/+page.svelte\`: lazy-load \`/spotle_data.json\` after the user starts searching or solving; reserve stable height for result panels.
- Content and archive \`+page.ts\` loaders: return only the data needed for the initial answer/header view; fetch full archive/history/generated article data as static JSON after idle or when the relevant section is opened.
- Schema output: keep critical \`WebPage\`/breadcrumb schema in initial HTML, but trim or defer long FAQ/Article JSON-LD blocks when they materially inflate page HTML.
- \`vite.config.ts\`: after the heavy runtime work is deferred, review modulepreload behavior and manual chunks so content pages do not preload solver-only modules. Add manual chunks only for stable boundaries such as Wordlebot WASM runtime, archive/data helpers, and game-dle solver databases.
- Fonts: consider self-hosting the Plus Jakarta Sans WOFF2 weights actually used by the design, with \`font-display: swap\`; if kept on Google Fonts, preserve preconnect/preload and verify it does not become the LCP blocker after JS fixes.
- Images and generated HTML: keep below-fold images lazy, add explicit dimensions, and audit \`{@html}\` content for missing \`loading="lazy"\` or size attributes.
- Large archive UIs: if a route still fails after JS/CSS fixes, paginate or virtualize long lists/tables above roughly 50 visible rows while preserving the same visual styling.
- Redirect routes: remove \`/canuckle\` and \`/wordle-solver\` from the performance audit target or make them real canonical pages instead of measuring their 301 redirects.

## Notes From The Older Plan

The older root \`plan.md\` has useful implementation ideas, but it should not replace this file because it was mobile-only and several claims no longer match the fresh PSI output. In particular, the new run shows render-blocking CSS on all 202 mobile/desktop audits, while the older plan says there are no CSS issues. The useful points retained here are: skeleton UI while solvers initialize, Web Workers for heavy dictionary/WASM work, reducing inline data and long JSON-LD, reviewing modulepreloads/manual chunks, self-hosting fonts, lazy-loading below-fold images, and paginating very large archive DOMs. All of these are performance-only changes and should keep the UI looking the same or better.

## Acceptance Criteria

- Re-run \`npm run pagespeed:capture:before\` into a new \`after-opti\` folder by setting \`PAGESPEED_OUTPUT_DIR=after-opti\`.
- Re-run \`npm run pagespeed:analyze:before\` with \`PAGESPEED_OUTPUT_DIR=after-opti\`.
- Target passes only when all 101 routes score 90+ on both mobile and desktop, excluding any intentionally removed redirect aliases.
- Verification commands before deploy: \`npm run check\`, \`npm run test\`, \`npm run build:pages\`.
`;
}

const rows = [];
for (const route of routes) {
	for (const strategy of STRATEGIES) {
		const json = await readJson(resultPath(route, strategy));
		rows.push(rowFor(route, strategy, json));
	}
}

const byRoute = new Map();
for (const route of routes) {
	const mobile = rows.find((row) => row.route === route && row.strategy === 'mobile');
	const desktop = rows.find((row) => row.route === route && row.strategy === 'desktop');
	byRoute.set(route, summarizeRoute(route, mobile, desktop));
}

const summaries = [...byRoute.values()];
const summary = {
	generatedAt: new Date().toISOString(),
	outputDir: OUTPUT_DIR,
	routeCount: routes.length,
	resultCount: rows.length,
	okResultCount: rows.filter((row) => row.status === 'ok').length,
	missingResultCount: rows.filter((row) => row.status !== 'ok').length,
	passingBothCount: summaries.filter(
		(route) => (route.mobileScore ?? 0) >= 90 && (route.desktopScore ?? 0) >= 90
	).length,
	failingTargetCount: summaries.filter(
		(route) => (route.mobileScore ?? 0) < 90 || (route.desktopScore ?? 0) < 90
	).length,
	routes: summaries
};

const issuesByPage = Object.fromEntries(
	rows.map((row) => [
		`${row.route}#${row.strategy}`,
		{
			route: row.route,
			strategy: row.strategy,
			score: row.score,
			status: row.status,
			issues: row.issues,
			codeAreas: row.codeAreas
		}
	])
);

const issuesByType = buildIssuesByType(rows);
const worstPages = summaries
	.toSorted((a, b) => a.lowestScore - b.lowestScore)
	.map((route) => ({
		route: route.route,
		family: route.family,
		mobileScore: route.mobileScore,
		desktopScore: route.desktopScore,
		lowestScore: route.lowestScore,
		topIssues: route.topIssues,
		codeAreas: route.codeAreas
	}));

const optimizationPlan = {
	generatedAt: new Date().toISOString(),
	target: '90+ mobile and desktop PageSpeed performance',
	source: 'before-opti PageSpeed JSON plus static code mapping',
	pages: buildPagePlan(summaries),
	sharedIssuePriority: issuesByType.slice(0, 20).map((issue) => ({
		id: issue.id,
		title: issue.title,
		occurrences: issue.occurrences,
		strategies: issue.strategies,
		totalSavingsMs: issue.totalSavingsMs,
		totalSavingsBytes: issue.totalSavingsBytes,
		codeAreas: issue.codeAreas,
		worstRoutes: issue.routes.slice(0, 15)
	}))
};

await writeJson(path.join(OUTPUT_DIR, 'summary.json'), summary);
await writeJson(path.join(OUTPUT_DIR, 'issues-by-page.json'), issuesByPage);
await writeJson(path.join(OUTPUT_DIR, 'issues-by-type.json'), issuesByType);
await writeJson(path.join(OUTPUT_DIR, 'worst-pages.json'), worstPages);
await writeJson(path.join(OUTPUT_DIR, 'optimization-plan.json'), optimizationPlan);
await writeFile(
	path.join(OUTPUT_DIR, 'optimization-plan.md'),
	`${buildMarkdownPlan({ summary, issuesByType, worstPages, optimizationPlan })}\n`,
	'utf8'
);

console.log(
	`Analyzed ${summary.okResultCount}/${summary.resultCount} PageSpeed response(s). ${summary.failingTargetCount} route(s) currently miss the 90+ target.`
);
