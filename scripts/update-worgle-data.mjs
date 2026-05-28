import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markUpdateFailure, markUpdateSuccess } from './lib/update-status.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const archivePath = path.resolve(__dirname, '../static/worgle_archive.json');
const solutionsPath = path.resolve(__dirname, '../static/worgle_solutions.json');
const epochUtcMs = Date.UTC(2021, 5, 19);
const indexOffset = 207;

function getIstDateKey(now = new Date()) {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Kolkata',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});

	const parts = formatter.formatToParts(now);
	const year = parts.find((part) => part.type === 'year')?.value;
	const month = parts.find((part) => part.type === 'month')?.value;
	const day = parts.find((part) => part.type === 'day')?.value;

	if (!year || !month || !day) {
		throw new Error('Unable to derive the current IST date.');
	}

	return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
	return new Date(`${dateKey}T12:00:00Z`);
}

function formatDateKey(date) {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
		date.getUTCDate()
	).padStart(2, '0')}`;
}

function addDays(date, days) {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}

function getAnswerForDateKey(dateKey, solutions) {
	const target = parseDateKey(dateKey);
	const targetUtcMs = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
	const dayOffset = Math.round((targetUtcMs - epochUtcMs) / 86_400_000);
	const rawIndex = dayOffset - indexOffset;
	const index = ((rawIndex % solutions.length) + solutions.length) % solutions.length;

	return solutions[index];
}

function getPuzzleNumber(dateKey) {
	const target = parseDateKey(dateKey);
	const targetUtcMs = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
	const dayOffset = Math.round((targetUtcMs - epochUtcMs) / 86_400_000);
	return dayOffset - 206;
}

async function main() {
	const projectRoot = path.resolve(__dirname, '..');
	const archive = JSON.parse(await readFile(archivePath, 'utf8'));
	const solutions = JSON.parse(await readFile(solutionsPath, 'utf8'));
	const todayKey = getIstDateKey();
	const lastEntry = archive[archive.length - 1] ?? null;
	let cursor = lastEntry ? addDays(parseDateKey(lastEntry.date), 1) : parseDateKey('2021-06-19');
	let added = 0;

	while (formatDateKey(cursor) <= todayKey) {
		const dateKey = formatDateKey(cursor);
		archive.push({
			date: dateKey,
			word: getAnswerForDateKey(dateKey, solutions),
			puzzle: getPuzzleNumber(dateKey)
		});
		added += 1;
		cursor = addDays(cursor, 1);
	}

	await writeFile(archivePath, `${JSON.stringify(archive, null, 2)}\n`);

	const latestEntry = archive[archive.length - 1] ?? null;

	await markUpdateSuccess(projectRoot, 'worgle', {
		latestDate: latestEntry?.date ?? null,
		puzzleCount: archive.length
	});

	if (added === 0 && latestEntry) {
		console.log(`Worgle archive already current through ${latestEntry.date} (${latestEntry.word}).`);
	} else if (latestEntry) {
		console.log(
			`Worgle archive updated with ${added} new entr${added === 1 ? 'y' : 'ies'} through ${latestEntry.date} (${latestEntry.word}).`
		);
	}
}

main().catch(async (error) => {
	const projectRoot = path.resolve(__dirname, '..');
	const failureMessage = error instanceof Error ? error.message : String(error);
	await markUpdateFailure(projectRoot, 'worgle', failureMessage);
	console.error('Failed to update Worgle archive:', error);
	process.exit(1);
});
