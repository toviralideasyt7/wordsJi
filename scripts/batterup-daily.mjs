// scripts/batterup-daily.mjs — WordSolverX daily Batter Up answer fetch.
// Plain Node.js, no dependencies. Run from the repo root:
//     node scripts/batterup-daily.mjs            # today's game (UTC date)
//     node scripts/batterup-daily.mjs 2026-09-24  # a specific date
//
// What it does:
//   1. Fetches games_batterup{date}.json and players_mlb{date}.json from the
//      upstream CloudFront CDN, trying the requested date back to date-4
//      (the upstream pipeline is occasionally late; this mirrors the
//      batter-up-helper client's 5-day fallback loop).
//   2. Takes the game with the max game_number (today's game — the games
//      files are cumulative archives).
//   3. Matches the game's player_id against the players file.
//   4. Merges the result into src/lib/data/batterup-answers.json keyed by
//      the game's own game_date (never the fetch date), and refreshes
//      src/lib/data/batterup-players.json with a team_history-stripped copy
//      of the player pool for the interactive solver.
//
// Exit codes: 0 on success (prints WROTE or UNCHANGED), 1 on any failure.
// The scheduled workflow commits only when the answers file changed and
// fails the job outright when this script exits non-zero — it never writes
// an empty or partial entry.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CDN_BASE = 'https://d2p6wz32uy8hq3.cloudfront.net';
const LOOKBACK_DAYS = 5; // try the requested date, then date-1 ... date-4

function dateKeyUTC(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDateKey(dateKey, days) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return dateKeyUTC(d);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WordSolverX-batterup-daily/1.0' },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

async function fetchDay(dateKey) {
  const [gamesData, playersData] = await Promise.all([
    fetchJson(`${CDN_BASE}/games_batterup${dateKey}.json`),
    fetchJson(`${CDN_BASE}/players_mlb${dateKey}.json`)
  ]);
  const games = gamesData?.games;
  const players = playersData?.players;
  if (!Array.isArray(games) || games.length === 0) throw new Error(`no games in games_batterup${dateKey}.json`);
  if (!Array.isArray(players) || players.length === 0) throw new Error(`no players in players_mlb${dateKey}.json`);
  return { games, players };
}

function stripPlayer(p) {
  return {
    player_name: p.player_name,
    player_id: String(p.player_id),
    team_name: p.team_name,
    born: p.born,
    birth_date: p.birth_date,
    position: p.position,
    debut: p.debut,
    jersey_number: p.jersey_number ?? null
  };
}

async function main() {
  const requested = process.argv[2] || dateKeyUTC(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requested)) {
    console.error(`Invalid date argument: ${requested} (expected YYYY-MM-DD)`);
    process.exit(1);
  }

  const repoRoot = process.cwd();
  const dataDir = join(repoRoot, 'src', 'lib', 'data');
  const answersFile = join(dataDir, 'batterup-answers.json');
  const playersFile = join(dataDir, 'batterup-players.json');

  // 1. Fetch with lookback.
  let games = null;
  let players = null;
  let sourceDate = null;
  let lastError = null;
  for (let back = 0; back < LOOKBACK_DAYS; back++) {
    const key = shiftDateKey(requested, -back);
    try {
      const day = await fetchDay(key);
      games = day.games;
      players = day.players;
      sourceDate = key;
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[batterup] ${key}: ${err.message}`);
    }
  }
  if (!games || !players) {
    console.error(`[batterup] FAILED: no usable CDN data for ${requested} (lookback ${LOOKBACK_DAYS} days). Last error: ${lastError?.message}`);
    process.exit(1);
  }
  console.log(`[batterup] Source files dated ${sourceDate}: ${games.length} games, ${players.length} players`);

  // 2. Today's game = max game_number (files are cumulative).
  const latest = games.reduce((a, b) => (b.game_number > a.game_number ? b : a), games[0]);
  if (!latest || latest.game_number == null || !latest.player_id) {
    console.error('[batterup] FAILED: latest game has no game_number/player_id');
    process.exit(1);
  }

  // 3. Match the player.
  const player = players.find((p) => String(p.player_id) === String(latest.player_id));
  if (!player || !player.player_name) {
    console.error(`[batterup] FAILED: player_id ${latest.player_id} not found in players file`);
    process.exit(1);
  }

  const gameDate = latest.game_date || sourceDate;
  const entry = {
    date: gameDate,
    gameNumber: latest.game_number,
    player: stripPlayer(player),
    videoDescription: latest.video_description || null,
    rawVideo: latest.raw_video || null,
    sourceDate,
    fetchedAt: new Date().toISOString()
  };

  // 4. Merge into the cumulative answers file (keyed by the GAME's date,
  //    never the fetch date, so a late fetch can't mislabel a day).
  mkdirSync(dataDir, { recursive: true });
  let answers = {};
  if (existsSync(answersFile)) {
    answers = JSON.parse(readFileSync(answersFile, 'utf-8'));
  }
  const existing = answers[gameDate];
  if (existing && existing.gameNumber === entry.gameNumber && existing.player.player_id === entry.player.player_id) {
    console.log(`[batterup] UNCHANGED: ${gameDate} already recorded as game #${entry.gameNumber} (${entry.player.player_name})`);
  } else {
    answers[gameDate] = entry;
    const sorted = {};
    for (const k of Object.keys(answers).sort()) sorted[k] = answers[k];
    writeFileSync(answersFile, JSON.stringify(sorted, null, 2) + '\n');
    console.log(`[batterup] WROTE: ${gameDate} -> game #${entry.gameNumber} (${entry.player.player_name}, ${entry.player.team_name})`);
  }

  // 5. Refresh the solver player pool (team_history stripped to keep the
  //    client bundle small; the answer pages don't need it either).
  const pool = players.map(stripPlayer).sort((a, b) => a.player_name.localeCompare(b.player_name));
  writeFileSync(playersFile, JSON.stringify(pool) + '\n');
  console.log(`[batterup] Player pool refreshed: ${pool.length} players (${playersFile})`);
}

main().catch((err) => {
  console.error(`[batterup] FAILED: ${err?.message || err}`);
  process.exit(1);
});
