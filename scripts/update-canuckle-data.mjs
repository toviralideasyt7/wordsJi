import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markUpdateFailure, markUpdateSuccess } from './lib/update-status.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const FIRESTORE_URL =
	process.env.CANUCKLE_FIRESTORE_URL ??
	'https://firestore.googleapis.com/v1/projects/canuckle-c2157/databases/(default)/documents/canuckleGameData';

const WORDS_URL =
	process.env.CANUCKLE_WORDS_URL ??
	'https://firestore.googleapis.com/v1/projects/canuckle-c2157/databases/(default)/documents/canuckleWords/words';

const ORIGINAL_START_DATE = '2022-02-10';
const CURRENT_START_DATE = '2022-10-04';
const RESTART_PUZZLE_INDEX = 143;

const outputPath = path.join(
	projectRoot,
	'src',
	'lib',
	'wordlebot-wasm',
	'assets',
	'generated',
	'canuckle-data.json'
);

const solverOutputPath = path.join(
	projectRoot,
	'src',
	'lib',
	'wordlebot-wasm',
	'assets',
	'generated',
	'canuckle-solver-data.json'
);

function decodeBase64(str) {
	return Buffer.from(str, 'base64').toString('utf-8');
}

function extractString(field) {
	return field?.stringValue ?? '';
}

function extractInteger(field) {
	return parseInt(field?.integerValue ?? '0', 10);
}

function extractArray(field) {
	return (field?.arrayValue?.values ?? [])
		.map((v) => v.stringValue ?? '')
		.filter((value) => value.length > 0);
}

function extractDistribution(field) {
	const map = field?.mapValue?.fields;
	if (!map) return undefined;
	return {
		ones: extractInteger(map.ones),
		twos: extractInteger(map.twos),
		threes: extractInteger(map.threes),
		fours: extractInteger(map.fours),
		fives: extractInteger(map.fives),
		sixes: extractInteger(map.sixes),
		losses: extractInteger(map.losses)
	};
}

function getPuzzleDate(index) {
	const startDate = new Date(
		`${index >= RESTART_PUZZLE_INDEX ? CURRENT_START_DATE : ORIGINAL_START_DATE}T12:00:00Z`
	);
	const dayOffset = index >= RESTART_PUZZLE_INDEX ? index - RESTART_PUZZLE_INDEX : index - 1;
	startDate.setUTCDate(startDate.getUTCDate() + dayOffset);
	return startDate.toISOString().slice(0, 10);
}

function parsePuzzleDocument(doc) {
	const fields = doc.fields;
	const index = extractInteger(fields.index);
	const puzzle = {
		index,
		answer: decodeBase64(extractString(fields.answer)),
		date: getPuzzleDate(index),
		fact: extractArray(fields.fact)
	};
	if (fields.factUrls?.arrayValue?.values) {
		puzzle.factUrls = extractArray(fields.factUrls);
	}
	if (fields.distribution?.mapValue?.fields) {
		puzzle.distribution = extractDistribution(fields.distribution);
	}
	if (doc.createTime) {
		puzzle.createTime = doc.createTime;
	}
	if (doc.updateTime) {
		puzzle.updateTime = doc.updateTime;
	}
	return puzzle;
}

async function readExistingData() {
	try {
		const raw = await readFile(outputPath, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

async function fetchAllPuzzles() {
	const allPuzzles = [];
	let pageUrl = FIRESTORE_URL;
	let pageCount = 0;

	while (pageUrl) {
		pageCount++;
		const response = await fetch(pageUrl, {
			headers: {
				accept: 'application/json',
				'user-agent': 'WordSolverX Canuckle Dataset Builder'
			},
			signal: AbortSignal.timeout(30000)
		});

		if (!response.ok) {
			throw new Error(`Firestore responded with ${response.status} on page ${pageCount}`);
		}

		const payload = await response.json();
		const documents = payload.documents ?? [];

		for (const doc of documents) {
			try {
				allPuzzles.push(parsePuzzleDocument(doc));
			} catch (err) {
				console.warn(`Skipping document: ${err instanceof Error ? err.message : String(err)}`);
			}
		}

		console.log(`  Page ${pageCount}: ${documents.length} documents (total: ${allPuzzles.length})`);

		const nextPageToken = payload.nextPageToken;
		if (nextPageToken) {
			pageUrl = `${FIRESTORE_URL}?pageToken=${nextPageToken}`;
		} else {
			pageUrl = null;
		}
	}

	return allPuzzles;
}

async function fetchAcceptedWords() {
	const response = await fetch(WORDS_URL, {
		headers: {
			accept: 'application/json',
			'user-agent': 'WordSolverX Canuckle Dataset Builder'
		},
		signal: AbortSignal.timeout(30000)
	});

	if (!response.ok) {
		throw new Error(`Firestore words responded with ${response.status}`);
	}

	const payload = await response.json();
	const fields = payload.fields;
	const wordsArray = fields?.words?.arrayValue?.values ?? [];
	return wordsArray
		.map((v) => (v.stringValue ?? '').trim().toUpperCase())
		.filter((value) => /^[A-Z]{5}$/.test(value));
}

function buildSolverDataset(puzzles, acceptedWords) {
	const answers = [...new Set(puzzles.map((p) => p.answer.toUpperCase()))].sort();
	const guesses = [...new Set(acceptedWords.map((w) => w.toUpperCase()))].sort();
	return {
		length: 5,
		guesses,
		restrictedAnswers: answers,
		completeAnswers: guesses,
		officialAnswers: answers,
		officialGuesses: guesses,
		easyRankings: {},
		hardRankings: {}
	};
}

async function main() {
	let usedFallback = false;
	let failureMessage = '';
	let puzzles;
	let acceptedWords;

	try {
		console.log('Fetching Canuckle puzzles from Firestore...');
		puzzles = await fetchAllPuzzles();
		console.log(`Fetched ${puzzles.length} puzzles.`);
	} catch (error) {
		usedFallback = true;
		failureMessage = error instanceof Error ? error.message : String(error);
		console.warn(`Failed to fetch puzzles: ${failureMessage}. Using existing data.`);
		const existing = await readExistingData();
		if (!existing?.puzzles?.length) {
			throw new Error('No existing Canuckle data available for fallback.');
		}
		puzzles = existing.puzzles;
	}

	try {
		console.log('Fetching Canuckle accepted words from Firestore...');
		acceptedWords = await fetchAcceptedWords();
		console.log(`Fetched ${acceptedWords.length} accepted words.`);
	} catch (error) {
		console.warn(`Failed to fetch words: ${error instanceof Error ? error.message : String(error)}. Using existing data.`);
		const existing = await readExistingData();
		if (!existing?.acceptedWords?.length) {
			throw new Error('No existing Canuckle words available for fallback.');
		}
		acceptedWords = existing.acceptedWords;
	}

	puzzles.sort((a, b) => a.index - b.index);
	const maxIndex = puzzles.length > 0 ? puzzles[puzzles.length - 1].index : 0;

	const puzzlesDataset = {
		source: {
			projectId: 'canuckle-c2157',
			version: 'Version 2.3.4',
			collections: {
				words: 'canuckleWords/words',
				puzzles: 'canuckleGameData',
				version: 'gameVersions/canuckle'
			},
			fetchedAt: new Date().toISOString()
		},
		schedule: {
			originalStart: ORIGINAL_START_DATE,
			currentStart: CURRENT_START_DATE
		},
		maxIndex,
		acceptedWords,
		puzzles
	};

	const solverDataset = buildSolverDataset(puzzles, acceptedWords);

	await mkdir(path.dirname(outputPath), { recursive: true });
	await mkdir(path.dirname(solverOutputPath), { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(puzzlesDataset)}\n`, 'utf8');
	await writeFile(solverOutputPath, JSON.stringify(solverDataset), 'utf8');

	if (usedFallback) {
		await markUpdateFailure(projectRoot, 'canuckle', failureMessage || 'Canuckle refresh fell back to cached data.', {
			latestDate: puzzles[puzzles.length - 1]?.date ?? 'unknown',
			puzzleCount: puzzles.length
		});
	} else {
		await markUpdateSuccess(projectRoot, 'canuckle', {
			latestDate: puzzles[puzzles.length - 1]?.date ?? 'unknown',
			puzzleCount: puzzles.length
		});
	}

	console.log(
		`Canuckle dataset ready: ${puzzles.length} puzzles, ${acceptedWords.length} words, through ${puzzles[puzzles.length - 1]?.date ?? 'unknown'} using ${usedFallback ? 'cached fallback' : 'fresh Firestore data'}.`
	);
}

main().catch((error) => {
	console.error('Unable to update Canuckle dataset:', error);
	process.exit(1);
});
