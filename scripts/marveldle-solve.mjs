// scripts/marveldle-solve.mjs — WordSolverX daily Marveldle answer solver.
// Plain Node.js, no dependencies. Run from the repo root:
//     node scripts/marveldle-solve.mjs today                  # solve both modes for the current pick-id
//     node scripts/marveldle-solve.mjs yesterday              # cheap backfill via the /yesterday endpoint
//     node scripts/marveldle-solve.mjs date "<dateId>" <YYYY-MM-DD>
//
// Ported from sujitbhai7710/marveldle-answers scripts/solve.mjs (MIT-style
// public repo, read-only pull). Algorithm unchanged: constraint-propagation
// solve per mode (comics + audiovisual/MCU), up to 30 diverse-pick attempts
// at ~350ms, then brute force of up to 100 remaining candidates at ~200ms.
//
// Differences from the original (deliberate, documented):
//   - Writes to src/lib/data/marveldle-answers.json (cumulative, date-keyed)
//     instead of the Next.js public/ path.
//   - NEVER writes a partial result: if either mode fails to solve, the
//     script exits 1 WITHOUT touching the file. The scheduled workflow then
//     fails loudly instead of committing an empty answer.
//   - The original's `yesterday` mode used a plain `new Date()` date; here it
//     derives the date key from the pick-dates config when possible so a
//     backfill always lands on the right calendar day.
//   - Overall runtime cap (default 10 min) — a hung run fails instead of
//     blocking the Action.
//
// Cost per run: ~60-120 upstream guess calls over 2-5 minutes. Fragile if
// api.marveldle.com rate-limits or invalidates the Origin/Referer headers —
// in that case the `yesterday` endpoint (one call per mode) is the fallback.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://api.marveldle.com/api';
const HEADERS = {
  Origin: 'https://marveldle.com',
  Referer: 'https://marveldle.com/',
  userLanguage: 'en'
};
const RUN_TIMEOUT_MS = Number(process.env.MARVELDLE_SOLVE_TIMEOUT_MS || 600000);

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function api(path, sid, { method = 'GET', timeoutMs = 30000 } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { ...HEADERS, sessionId: sid },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res;
}

async function createSession() {
  const sid = uuid();
  const res = await api('/session', sid);
  const data = await res.json();
  return data.id || sid;
}

async function getLastPickId(sid) {
  const res = await api('/config/pick-id', sid);
  return (await res.text()).trim();
}

async function getAllCharacters(mode, sid) {
  const res = await api(`/characters/${mode}`, sid, { timeoutMs: 60000 });
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`character list for ${mode} was not an array`);
  return data;
}

async function getYesterday(mode, sid) {
  const res = await api(`/characters/${mode}/yesterday`, sid);
  return await res.json();
}

async function guessChar(mode, charId, dateId, sid, attempt = 1) {
  const url = `/characters/${mode}/guess/${charId}?dateId=${encodeURIComponent(dateId)}`;
  try {
    const res = await api(url, sid);
    return await res.json();
  } catch (err) {
    if (attempt >= 2) throw err;
    await sleep(1000);
    return guessChar(mode, charId, dateId, sid, attempt + 1);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function matchesConstraint(char, gr, guessed, mode) {
  if (gr.gender !== 'None') {
    if (gr.gender === 'Exact' && char.gender !== guessed.gender) return false;
    if (gr.gender === 'None' && char.gender === guessed.gender) return false;
  }
  if (gr.type !== 'None') {
    if (gr.type === 'Exact' && char.type !== guessed.type) return false;
    if (gr.type === 'None' && char.type === guessed.type) return false;
  }
  if (gr.species !== 'None') {
    const overlap = (char.species || []).filter((s) => (guessed.species || []).includes(s));
    if (gr.species === 'Exact' && overlap.length !== (guessed.species || []).length) return false;
    if (gr.species === 'None' && overlap.length > 0) return false;
    if (gr.species === 'Partial' && overlap.length === 0) return false;
  }
  if (gr.powerTypes !== 'None') {
    const overlap = (char.powerTypes || []).filter((p) => (guessed.powerTypes || []).includes(p));
    if (gr.powerTypes === 'Exact' && overlap.length !== (guessed.powerTypes || []).length) return false;
    if (gr.powerTypes === 'None' && overlap.length > 0) return false;
    if (gr.powerTypes === 'Partial' && overlap.length === 0) return false;
  }
  if (gr.origin !== 'None') {
    if (gr.origin === 'Exact' && char.origin !== guessed.origin) return false;
    if (gr.origin === 'None' && char.origin === guessed.origin) return false;
  }
  if (mode === 'comics' && gr.apparitionYear && gr.apparitionYear !== 'None') {
    const cy = char.apparitionYear || 0;
    const gy = guessed.apparitionYear || 0;
    if (gr.apparitionYear === 'Upper' && cy <= gy) return false;
    if (gr.apparitionYear === 'Lower' && cy >= gy) return false;
  }
  if (mode === 'audiovisual' && gr.appearanceTypes && gr.appearanceTypes !== 'None') {
    const overlap = (char.appearanceTypes || []).filter((t) => (guessed.appearanceTypes || []).includes(t));
    if (gr.appearanceTypes === 'Exact' && overlap.length !== (guessed.appearanceTypes || []).length) return false;
    if (gr.appearanceTypes === 'None' && overlap.length > 0) return false;
    if (gr.appearanceTypes === 'Partial' && overlap.length === 0) return false;
  }
  return true;
}

async function solveMode(mode, dateId, sid, allChars) {
  let candidates = [...allChars];
  let attempts = 0;
  const maxAttempts = 30;
  const tried = new Set();

  while (candidates.length > 1 && attempts < maxAttempts) {
    // Pick from diverse type|gender groups first to maximize information.
    let pick = null;
    const byType = {};
    candidates.forEach((c) => {
      if (!tried.has(c.id)) {
        const key = `${c.type}|${c.gender}`;
        if (!byType[key]) byType[key] = [];
        byType[key].push(c);
      }
    });
    const groups = Object.values(byType);
    if (groups.length > 0) {
      pick = groups[Math.floor(Math.random() * groups.length)][0];
    } else {
      pick = candidates[Math.floor(Math.random() * candidates.length)];
    }
    if (!pick) break;
    tried.add(pick.id);

    try {
      const gr = await guessChar(mode, pick.id, dateId, sid);
      if (gr.isExact) {
        console.log(`  [${mode}] FOUND: ${pick.name} (${pick.id}) in ${attempts + 1} guesses`);
        return pick;
      }
      const before = candidates.length;
      candidates = candidates.filter((c) => c.id !== pick.id && matchesConstraint(c, gr, pick, mode));
      console.log(`  [${mode}] Guess #${attempts + 1}: ${pick.name} -> ${before} -> ${candidates.length}`);
      if (candidates.length === 0) {
        console.log(`  [${mode}] Reset - too many filtered`);
        candidates = allChars.filter((c) => !tried.has(c.id));
      }
    } catch (e) {
      console.error(`  [${mode}] Error: ${e.message}`);
    }
    attempts++;
    await sleep(350);
  }

  // Brute force remaining candidates.
  console.log(`  [${mode}] Trying ${Math.min(candidates.length, 100)} remaining candidates...`);
  for (const c of candidates.slice(0, 100)) {
    try {
      const gr = await guessChar(mode, c.id, dateId, sid);
      if (gr.isExact) {
        console.log(`  [${mode}] FOUND: ${c.name} (${c.id})`);
        return c;
      }
    } catch (e) {
      // keep going
    }
    await sleep(200);
  }
  return null;
}

function slimComics(c) {
  if (!c) return null;
  return {
    id: c.id, name: c.name, gender: c.gender, type: c.type,
    species: c.species, powerTypes: c.powerTypes, origin: c.origin,
    apparitionYear: c.apparitionYear, firstApparitionComicTitle: c.firstApparitionComicTitle,
    keywords: c.keywords
  };
}

function slimMcu(c) {
  if (!c) return null;
  return {
    id: c.id, name: c.name, gender: c.gender, type: c.type,
    species: c.species, powerTypes: c.powerTypes, origin: c.origin,
    actorName: c.actorName, appearanceTypes: c.appearanceTypes,
    affiliations: c.affiliations, keywords: c.keywords
  };
}

function answersFilePath() {
  return join(process.cwd(), 'src', 'lib', 'data', 'marveldle-answers.json');
}

function loadAnswers() {
  const file = answersFilePath();
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    return {};
  }
}

function saveAnswers(answers) {
  const sorted = {};
  for (const k of Object.keys(answers).sort()) sorted[k] = answers[k];
  mkdirSync(join(process.cwd(), 'src', 'lib', 'data'), { recursive: true });
  writeFileSync(answersFilePath(), JSON.stringify(sorted, null, 2) + '\n');
}

function dateKeyUTC(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// "M/D/YYYY 12:00:00 AM" -> "YYYY-MM-DD". Falls back to the UTC calendar date.
function pickIdToDateKey(pickId, fallback) {
  const m = String(pickId).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return fallback;
  return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

async function solveToday() {
  const sid = await createSession();
  const dateId = await getLastPickId(sid);
  const dateKey = pickIdToDateKey(dateId, dateKeyUTC(new Date()));
  console.log(`=== Solving for today: ${dateKey} (${dateId}) ===`);

  const [comicsChars, mcuChars] = await Promise.all([
    getAllCharacters('comics', sid),
    getAllCharacters('audiovisual', sid)
  ]);
  console.log(`[solve] Got ${comicsChars.length} comics, ${mcuChars.length} MCU characters`);

  const [comics, mcu] = await Promise.all([
    solveMode('comics', dateId, sid, comicsChars),
    solveMode('audiovisual', dateId, sid, mcuChars)
  ]);

  // Never write a partial result. A failed solve must fail the Action loudly
  // so the today page shows its "updating" state instead of half an answer.
  if (!comics || !mcu) {
    console.error(`[solve] FAILED: ${!comics ? 'comics unsolved' : ''} ${!mcu ? 'mcu unsolved' : ''} — writing nothing`);
    process.exit(1);
  }

  const result = {
    date: dateKey,
    dateId,
    comics: slimComics(comics),
    mcu: slimMcu(mcu),
    solvedAt: new Date().toISOString()
  };

  const answers = loadAnswers();
  answers[dateKey] = result;
  saveAnswers(answers);
  console.log(`\n=== Saved ${dateKey} ===`);
  console.log(`Comics: ${result.comics.name}`);
  console.log(`MCU: ${result.mcu.name}`);
}

async function fetchYesterday() {
  const sid = await createSession();
  const dateId = await getLastPickId(sid);
  // The /yesterday endpoint serves the pick before the current one, so the
  // key is one day before the current pick-id date.
  const currentKey = pickIdToDateKey(dateId, dateKeyUTC(new Date()));
  const d = new Date(`${currentKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  const dateKey = dateKeyUTC(d);
  console.log(`=== Fetching yesterday's answers: ${dateKey} (current pick: ${dateId}) ===`);

  const [comics, mcu] = await Promise.all([
    getYesterday('comics', sid),
    getYesterday('audiovisual', sid)
  ]);
  if (!comics?.id || !mcu?.id) {
    console.error('[solve] FAILED: /yesterday endpoint returned an incomplete character');
    process.exit(1);
  }

  const result = {
    date: dateKey,
    dateId: `yesterday-of:${dateId}`,
    comics: slimComics(comics),
    mcu: slimMcu(mcu),
    solvedAt: new Date().toISOString()
  };

  const answers = loadAnswers();
  answers[dateKey] = result;
  saveAnswers(answers);
  console.log(`Saved ${dateKey}: Comics=${comics.name}, MCU=${mcu.name}`);
}

async function solveDate(dateId, dateKey) {
  const sid = await createSession();
  console.log(`=== Solving for ${dateKey} (${dateId}) ===`);

  const [comicsChars, mcuChars] = await Promise.all([
    getAllCharacters('comics', sid),
    getAllCharacters('audiovisual', sid)
  ]);

  const [comics, mcu] = await Promise.all([
    solveMode('comics', dateId, sid, comicsChars),
    solveMode('audiovisual', dateId, sid, mcuChars)
  ]);

  if (!comics || !mcu) {
    console.error('[solve] FAILED: one or both modes unsolved — writing nothing');
    process.exit(1);
  }

  const result = {
    date: dateKey,
    dateId,
    comics: slimComics(comics),
    mcu: slimMcu(mcu),
    solvedAt: new Date().toISOString()
  };

  const answers = loadAnswers();
  answers[dateKey] = result;
  saveAnswers(answers);
  console.log(`Saved ${dateKey}: Comics=${comics.name}, MCU=${mcu.name}`);
}

async function main() {
  const action = process.argv[2] || 'today';
  const run = (async () => {
    if (action === 'today') return solveToday();
    if (action === 'yesterday') return fetchYesterday();
    if (action === 'date') {
      const dateId = process.argv[3];
      const dateKey = process.argv[4];
      if (!dateId || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey || '')) {
        console.error('Usage: node scripts/marveldle-solve.mjs date <dateId> <YYYY-MM-DD>');
        process.exit(1);
      }
      return solveDate(dateId, dateKey);
    }
    console.error('Usage: node scripts/marveldle-solve.mjs [today|yesterday|date <dateId> <YYYY-MM-DD>]');
    process.exit(1);
  })();

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`solve timed out after ${RUN_TIMEOUT_MS}ms`)), RUN_TIMEOUT_MS)
  );
  await Promise.race([run, timeout]);
}

main().catch((err) => {
  console.error(`[solve] FAILED: ${err?.message || err}`);
  process.exit(1);
});
