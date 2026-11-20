import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markUpdateFailure, markUpdateSuccess } from './lib/update-status.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const outputPath = path.join(projectRoot, 'static', 'framed_data.json');
const REFERENCE_DATE = new Date('2026-04-02T00:00:00Z');
const CONCURRENCY = 8;
const LOOKAHEAD_DAYS = 1;

const GAME_TYPES = [
  { key: 'daily', label: 'Framed Classic', referencePuzzle: 1483, color: '#e50914', gradient: 'from-red-600 to-red-900' },
  { key: 'one-frame', label: 'One Frame', referencePuzzle: 486, color: '#6366f1', gradient: 'from-violet-500 to-purple-700' },
  { key: 'titleshot', label: 'Titleshot', referencePuzzle: 302, color: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
  { key: 'poster', label: 'Poster', referencePuzzle: 252, color: '#10b981', gradient: 'from-emerald-500 to-teal-700' }
];

function normalizeUtcDate(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDateKey(date) {
  return normalizeUtcDate(date).toISOString().slice(0, 10);
}

function getCurrentUtcDate() {
  return normalizeUtcDate(new Date());
}

function addUtcDays(date, days) {
  const next = normalizeUtcDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getPuzzleNumber(referencePuzzle, date) {
  const targetDay = normalizeUtcDate(date);
  const diffMs = targetDay.getTime() - REFERENCE_DATE.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  return referencePuzzle + diffDays;
}

function getDateForPuzzleNumber(referencePuzzle, puzzleNumber) {
  const date = new Date(REFERENCE_DATE);
  date.setUTCDate(date.getUTCDate() + (puzzleNumber - referencePuzzle));
  return normalizeUtcDate(date);
}

async function readJsonIfPresent(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchFramedAnswer(gameType, puzzleNumber) {
  const response = await fetch(
    `https://titles.framed.wtf/v1/titles/top-ten/${puzzleNumber}?gameType=${gameType}`,
    {
      headers: {
        accept: 'application/json',
        'user-agent': 'WordAuditor Framed Dataset Builder'
      },
      signal: AbortSignal.timeout(15000)
    }
  );

  if (!response.ok) {
    throw new Error(`Framed source responded with ${response.status}`);
  }

  const payload = await response.json();
  const lastFrame = payload?.frames?.[payload.frames.length - 1];
  const rawItems = lastFrame?.items;
  const items =
    typeof rawItems === 'string'
      ? JSON.parse(rawItems)
      : Array.isArray(rawItems)
        ? rawItems
        : rawItems && typeof rawItems === 'object'
          ? rawItems
          : [];
  const answer = items?.[0]?.title ?? null;

  if (!answer) {
    throw new Error('Framed payload did not include an answer title.');
  }

  return answer;
}

async function runWithConcurrency(tasks, limit) {
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  return results;
}

function buildEmptyDataset() {
  return {
    generatedAt: new Date().toISOString(),
    referenceDate: toDateKey(REFERENCE_DATE),
    modes: Object.fromEntries(
      GAME_TYPES.map((game) => [
        game.key,
        {
          key: game.key,
          label: game.label,
          color: game.color,
          gradient: game.gradient,
          referencePuzzle: game.referencePuzzle,
          entries: []
        }
      ])
    )
  };
}

async function main() {
  const existing = (await readJsonIfPresent(outputPath)) ?? buildEmptyDataset();
  const today = getCurrentUtcDate();
  const fetchThroughDate = addUtcDays(today, LOOKAHEAD_DAYS);
  const failedTargets = [];

  for (const game of GAME_TYPES) {
    const modePayload = existing.modes?.[game.key] ?? {
      key: game.key,
      label: game.label,
      color: game.color,
      gradient: game.gradient,
      referencePuzzle: game.referencePuzzle,
      entries: []
    };

    const entryByPuzzle = new Map((modePayload.entries ?? []).map((entry) => [entry.puzzleNumber, entry]));
    const latestPuzzleNumber = getPuzzleNumber(game.referencePuzzle, fetchThroughDate);
    const currentMax = Math.max(0, ...entryByPuzzle.keys());
    const startPuzzleNumber = currentMax > 0 ? Math.max(1, currentMax - 1) : 1;
    const missingPuzzleNumbers = [];

    for (let puzzleNumber = startPuzzleNumber; puzzleNumber <= latestPuzzleNumber; puzzleNumber += 1) {
      if (!entryByPuzzle.has(puzzleNumber) || puzzleNumber >= latestPuzzleNumber - 1) {
        missingPuzzleNumbers.push(puzzleNumber);
      }
    }

    if (missingPuzzleNumbers.length > 0) {
      const tasks = missingPuzzleNumbers.map((puzzleNumber) => async () => {
        try {
          const answer = await fetchFramedAnswer(game.key, puzzleNumber);
          return {
            ok: true,
            entry: {
              date: toDateKey(getDateForPuzzleNumber(game.referencePuzzle, puzzleNumber)),
              puzzleNumber,
              answer
            }
          };
        } catch (error) {
          return {
            ok: false,
            puzzleNumber,
            message: error instanceof Error ? error.message : String(error)
          };
        }
      });

      const results = await runWithConcurrency(tasks, CONCURRENCY);

      for (const result of results) {
        if (result?.ok) {
          entryByPuzzle.set(result.entry.puzzleNumber, result.entry);
        } else if (result) {
          failedTargets.push(`${game.key}#${result.puzzleNumber}`);
          console.warn(`Failed to refresh Framed ${game.key} #${result.puzzleNumber}: ${result.message}`);
        }
      }
    }

    existing.modes[game.key] = {
      key: game.key,
      label: game.label,
      color: game.color,
      gradient: game.gradient,
      referencePuzzle: game.referencePuzzle,
      latestPuzzleNumber,
      entries: [...entryByPuzzle.values()].sort((left, right) => right.date.localeCompare(left.date))
    };
  }

  existing.generatedAt = new Date().toISOString();

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');

  if (failedTargets.length > 0) {
    await markUpdateFailure(
      projectRoot,
      'framed',
      `Failed to refresh ${failedTargets.length} Framed puzzle${failedTargets.length === 1 ? '' : 's'}.`,
      {
        failedTargets
      }
    );
  } else {
    await markUpdateSuccess(projectRoot, 'framed', {
      failedTargets: []
    });
  }

  const totalEntries = Object.values(existing.modes).reduce(
    (sum, mode) => sum + (Array.isArray(mode.entries) ? mode.entries.length : 0),
    0
  );

  console.log(
    `Framed dataset ready with ${totalEntries} entries across ${GAME_TYPES.length} modes through ${toDateKey(fetchThroughDate)}.`
  );
}

main().catch((error) => {
  console.error('Unable to prepare Framed dataset:', error);
  process.exit(1);
});
