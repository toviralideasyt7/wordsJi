import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
	ARCHIVE_STATIC_ROUTES,
	EVERGREEN_STATIC_ROUTES,
	TODAY_STATIC_ROUTES
} from '../src/lib/route-registry.js';

const API_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const API_KEY = process.env.PAGESPEED_API_KEY;
const BASE_URL = process.env.PAGESPEED_BASE_URL ?? 'https://wordsolverx-z-ai.pages.dev';
const OUTPUT_DIR = process.env.PAGESPEED_OUTPUT_DIR ?? 'before-opti';
const STRATEGIES = ['mobile', 'desktop'];
const CONCURRENCY = Number.parseInt(process.env.PAGESPEED_CONCURRENCY ?? '2', 10);
const MAX_RETRIES = Number.parseInt(process.env.PAGESPEED_RETRIES ?? '3', 10);
const TIMEOUT_MS = Number.parseInt(process.env.PAGESPEED_TIMEOUT_MS ?? '120000', 10);

const routes = [...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES])];

if (!API_KEY) {
	console.error('Missing PAGESPEED_API_KEY. Set it in the environment before running this script.');
	process.exit(1);
}

function safeRouteName(route) {
	if (route === '/') return '__home';
	return route.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_') || '__home';
}

function pageDir(route) {
	return path.join(OUTPUT_DIR, 'pages', safeRouteName(route));
}

function resultPath(route, strategy) {
	return path.join(pageDir(route), `${strategy}.json`);
}

function errorPath(route, strategy) {
	return path.join(pageDir(route), `error-${strategy}.json`);
}

async function readJson(filePath) {
	try {
		return JSON.parse(await readFile(filePath, 'utf8'));
	} catch {
		return null;
	}
}

async function hasUsableResult(route, strategy) {
	const filePath = resultPath(route, strategy);
	if (!existsSync(filePath)) return false;
	const json = await readJson(filePath);
	return Boolean(json?.lighthouseResult);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status) {
	return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function shouldRetryPageSpeedError(status, data) {
	const message = data?.error?.message ?? '';
	const reason = data?.error?.errors?.[0]?.reason ?? '';
	return shouldRetryStatus(status) || reason === 'lighthouseUserError' && /NO_FCP|NO_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST/i.test(message);
}

function buildApiUrl(route, strategy) {
	const pageUrl = new URL(route, BASE_URL).toString();
	const url = new URL(API_ENDPOINT);
	url.searchParams.set('url', pageUrl);
	url.searchParams.set('strategy', strategy);
	url.searchParams.set('category', 'performance');
	url.searchParams.set('key', API_KEY);
	return url;
}

async function fetchPageSpeed(route, strategy) {
	const url = buildApiUrl(route, strategy);
	let lastError = null;

	for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

		try {
			const response = await fetch(url, { signal: controller.signal });
			const data = await response.json().catch(() => ({
				error: { message: `Non-JSON response with status ${response.status}` }
			}));

			if (response.ok && data?.lighthouseResult) {
				return { ok: true, data, status: response.status, attempt };
			}

			lastError = {
				status: response.status,
				attempt,
				retryable: shouldRetryPageSpeedError(response.status, data),
				data
			};

			if (!shouldRetryPageSpeedError(response.status, data) || attempt > MAX_RETRIES) {
				return { ok: false, ...lastError };
			}
		} catch (error) {
			lastError = {
				status: null,
				attempt,
				retryable: true,
				data: {
					error: {
						message: error instanceof Error ? error.message : String(error)
					}
				}
			};

			if (attempt > MAX_RETRIES) {
				return { ok: false, ...lastError };
			}
		} finally {
			clearTimeout(timeout);
		}

		await sleep(1000 * attempt);
	}

	return { ok: false, ...(lastError ?? { status: null, attempt: 0, data: null }) };
}

async function writeJson(filePath, value) {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function runTask(task) {
	const { route, strategy } = task;

	if (await hasUsableResult(route, strategy)) {
		return { route, strategy, status: 'skipped', file: resultPath(route, strategy) };
	}

	const result = await fetchPageSpeed(route, strategy);
	if (result.ok) {
		await writeJson(resultPath(route, strategy), result.data);
		await unlink(errorPath(route, strategy)).catch(() => {});
		return {
			route,
			strategy,
			status: 'saved',
			file: resultPath(route, strategy),
			attempt: result.attempt
		};
	}

	await writeJson(errorPath(route, strategy), {
		route,
		strategy,
		baseUrl: BASE_URL,
		status: result.status,
		attempt: result.attempt,
		retryable: result.retryable,
		response: result.data,
		capturedAt: new Date().toISOString()
	});

	return {
		route,
		strategy,
		status: 'failed',
		file: errorPath(route, strategy),
		httpStatus: result.status,
		message: result.data?.error?.message ?? 'Unknown PageSpeed error'
	};
}

async function runQueue(tasks) {
	const results = [];
	let nextIndex = 0;

	async function worker(workerIndex) {
		while (nextIndex < tasks.length) {
			const taskIndex = nextIndex;
			nextIndex += 1;
			const task = tasks[taskIndex];
			process.stderr.write(
				`[${taskIndex + 1}/${tasks.length}] ${task.strategy} ${task.route} (worker ${workerIndex})\n`
			);
			const result = await runTask(task);
			results.push(result);
			process.stderr.write(`  -> ${result.status}${result.message ? `: ${result.message}` : ''}\n`);
		}
	}

	await Promise.all(
		Array.from({ length: Math.max(1, CONCURRENCY) }, (_, index) => worker(index + 1))
	);

	return results;
}

const startedAt = new Date().toISOString();
await mkdir(path.join(OUTPUT_DIR, 'pages'), { recursive: true });

const allTasks = routes.flatMap((route) => STRATEGIES.map((strategy) => ({ route, strategy })));
const skippedTasks = [];
const tasks = [];

for (const task of allTasks) {
	if (await hasUsableResult(task.route, task.strategy)) {
		skippedTasks.push({
			route: task.route,
			strategy: task.strategy,
			status: 'skipped',
			file: resultPath(task.route, task.strategy)
		});
	} else {
		tasks.push(task);
	}
}

if (tasks.length === 0) {
	console.log(`All ${allTasks.length} PageSpeed response(s) already exist. Nothing to capture.`);
}

const results = [...skippedTasks, ...(await runQueue(tasks))];
const completed = results.filter((result) => result.status === 'saved' || result.status === 'skipped');
const failed = results.filter((result) => result.status === 'failed');
const manifest = {
	baseUrl: BASE_URL,
	outputDir: OUTPUT_DIR,
	startedAt,
	endedAt: new Date().toISOString(),
	routeSource: 'src/lib/route-registry.js',
	routeCount: routes.length,
	strategies: STRATEGIES,
	totalExpected: allTasks.length,
	completed: completed.length,
	failed: failed.length,
	saved: results.filter((result) => result.status === 'saved').length,
	skipped: results.filter((result) => result.status === 'skipped').length,
	routes: routes.map((route) => ({
		route,
		safeName: safeRouteName(route),
		url: new URL(route, BASE_URL).toString()
	})),
	results: results.sort((a, b) => `${a.route}:${a.strategy}`.localeCompare(`${b.route}:${b.strategy}`))
};

await writeJson(path.join(OUTPUT_DIR, 'manifest.json'), manifest);

if (failed.length > 0) {
	console.error(`PageSpeed capture finished with ${failed.length} failed request(s).`);
	process.exitCode = 1;
} else {
	console.log(`PageSpeed capture finished: ${completed.length}/${allTasks.length} response(s) ready.`);
}
