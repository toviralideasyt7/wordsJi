import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { colornames } from 'color-name-list';
import { colordleColorOverrides } from '../src/lib/data/colordle-color-overrides.js';
import { markUpdateFailure, markUpdateSuccess } from './lib/update-status.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const COLORDLE_SOURCE_URL =
	process.env.COLORDLE_SOURCE_URL ?? 'https://colordle.ryantanen.com/colors.json';
const START_DATE = '2023-08-07';
const DAY_OFFSET = 500;
const JST_TIME_ZONE = 'Asia/Tokyo';

const targetPath = path.join(projectRoot, 'src', 'lib', 'data', 'colordle-targets.json');
const staticDataPath = path.join(projectRoot, 'static', 'colordle_data.json');

function normalizeName(name) {
	return name.toLowerCase().replace(/\s+/g, '');
}

function buildColorLookup() {
	const lookup = new Map();

	for (const color of colornames) {
		const key = normalizeName(color.name);
		if (!lookup.has(key)) {
			lookup.set(key, color);
		}
	}

	return lookup;
}

const colorLookup = buildColorLookup();

function resolveColor(name) {
	const normalizedName = normalizeName(name);
	const match = colorLookup.get(normalizedName);

	if (match) {
		return {
			name: match.name,
			hex: match.hex
		};
	}

	const override = colordleColorOverrides[normalizedName];
	if (override) {
		return override;
	}

	console.warn(`Colordle color name missing from color-name-list: ${name}`);
	return {
		name,
		hex: '#000000'
	};
}

function buildDateKey(index) {
	const date = new Date(`${START_DATE}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + index);
	return date.toISOString().slice(0, 10);
}

function getExpectedLatestDate(now = new Date()) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: JST_TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(now);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return `${values.year}-${values.month}-${values.day}`;
}

function buildDataset(colors) {
	const availableDateStrings = colors.map((_, index) => buildDateKey(index));
	const entries = colors.map((name, index) => ({
		date: availableDateStrings[index],
		dayNum: DAY_OFFSET + index,
		color: resolveColor(name)
	}));

	return {
		generatedAt: new Date().toISOString(),
		sourceUrl: COLORDLE_SOURCE_URL,
		startDate: START_DATE,
		dayOffset: DAY_OFFSET,
		entryCount: entries.length,
		latestDate: availableDateStrings.at(-1) ?? null,
		colors,
		availableDateStrings,
		entries
	};
}

async function fetchColors() {
	const response = await fetch(COLORDLE_SOURCE_URL, {
		headers: {
			accept: 'application/json',
			'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
			referer: 'https://colordle.ryantanen.com/',
			'user-agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 WordSolverX Colordle Dataset Builder'
		}
	});

	if (!response.ok) {
		throw new Error(`Colordle source responded with ${response.status}`);
	}

	const payload = await response.json();

	if (!payload || !Array.isArray(payload.colors) || payload.colors.length === 0) {
		throw new Error('Colordle source returned an empty colors list');
	}

	return payload.colors.map((value) => String(value));
}

async function readJsonIfPresent(filePath) {
	try {
		const raw = await readFile(filePath, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

async function loadFallbackColors() {
	const targetPayload = await readJsonIfPresent(targetPath);
	if (targetPayload && Array.isArray(targetPayload.colors) && targetPayload.colors.length > 0) {
		return targetPayload.colors.map((value) => String(value));
	}

	const staticPayload = await readJsonIfPresent(staticDataPath);
	if (staticPayload && Array.isArray(staticPayload.colors) && staticPayload.colors.length > 0) {
		return staticPayload.colors.map((value) => String(value));
	}

	throw new Error('No existing Colordle dataset is available for fallback.');
}

async function writeDataset(colors) {
	const dataset = buildDataset(colors);

	await mkdir(path.dirname(targetPath), { recursive: true });
	await mkdir(path.dirname(staticDataPath), { recursive: true });

	await writeFile(targetPath, `${JSON.stringify({ colors }, null, 2)}\n`, 'utf8');
	await writeFile(staticDataPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');

	return dataset;
}

async function main() {
	let colors;
	let outputMode = 'fresh source data';
	let failureMessage = '';
	let shouldMarkFailure = false;
	const existingColors = await loadFallbackColors();

	try {
		colors = await fetchColors();
	} catch (error) {
		colors = existingColors;
		outputMode = 'cached fallback data';
		failureMessage = error instanceof Error ? error.message : String(error);
		shouldMarkFailure = true;
		console.warn(
			`Failed to refresh Colordle data from ${COLORDLE_SOURCE_URL}. Reusing existing local dataset.`,
			error
		);
	}

	if (!shouldMarkFailure && colors.length < existingColors.length) {
		const remoteCount = colors.length;
		colors = existingColors;
		outputMode = 'cached fallback data';
		failureMessage = `Colordle source returned ${remoteCount} colors, which is shorter than the local dataset (${existingColors.length}).`;
		shouldMarkFailure = true;
	}

	const remoteLatestDate = buildDateKey(colors.length - 1);
	const expectedLatestDate = getExpectedLatestDate();

	if (!shouldMarkFailure && remoteLatestDate < expectedLatestDate) {
		outputMode = 'stale source data';
		failureMessage = `Colordle source is only available through ${remoteLatestDate}; expected at least ${expectedLatestDate}.`;
		shouldMarkFailure = true;
	}

	const dataset = await writeDataset(colors);

	if (shouldMarkFailure) {
		await markUpdateFailure(
			projectRoot,
			'colordle',
			failureMessage || 'Colordle refresh fell back to the cached dataset.',
			{
				latestDate: dataset.latestDate,
				expectedLatestDate,
				sourceUrl: COLORDLE_SOURCE_URL
			}
		);
	} else {
		await markUpdateSuccess(projectRoot, 'colordle', {
			latestDate: dataset.latestDate,
			expectedLatestDate,
			sourceUrl: COLORDLE_SOURCE_URL
		});
	}

	console.log(
		`Colordle dataset ready with ${dataset.entryCount} entries through ${dataset.latestDate} using ${outputMode}.`
	);
}

main().catch((error) => {
	console.error('Unable to prepare Colordle dataset:', error);
	process.exit(1);
});
