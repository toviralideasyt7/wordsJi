// scripts/backfill-batterup-gaps.mjs — one-off repair for missed Batter Up days.
// Plain Node.js, no dependencies. Run from the repo root:
//     node scripts/backfill-batterup-gaps.mjs
//
// What it does:
//   1. Fetches games_batterup{date}.json + players_mlb{date}.json from the
//      upstream CloudFront CDN (today, falling back to yesterday — the files
//      are cumulative archives, so the old games are still in the latest one).
//   2. Extracts the specific missing game_numbers below, verifying each
//      game's own game_date matches the expected date.
//   3. Matches each game's player_id against the players file.
//   4. Merges the two entries into src/lib/data/batterup-answers.json in the
//      exact entry format scripts/batterup-daily.mjs uses (sorted keys).
//      NEVER overwrites an existing date entry — if a date is already
//      recorded, it is left untouched and reported.
//
// Exit codes: 0 on success, 1 on any failure. Fails loudly, never writes
// a partial or empty entry.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CDN_BASE = 'https://d2p6wz32uy8hq3.cloudfront.net';

// The only gaps the daily script cannot self-heal (it records max game per
// run and never auto-backfills). Update this list if new gaps are found.
const TARGETS = [
	{ gameNumber: 955, date: '2026-09-30' }, // Gunnar Henderson, Orioles
	{ gameNumber: 958, date: '2026-10-03' }, // Keibert Ruiz, Nationals
	{ gameNumber: 963, date: '2026-10-08' }, // Jeff McNeil (verified in games_batterup2026-10-08.json, game_date matches)
	{ gameNumber: 966, date: '2026-10-11' }, // Cam Smith (verified in games_batterup2026-10-11.json, game_date matches; publisher refreshed ~01:33 UTC, after the 01:05 cron)
	{ gameNumber: 968, date: '2026-10-13' }, // Javier Baez (verified in games_batterup2026-10-13.json, game_date matches; publisher refreshed ~02:59 UTC, after the 01:05 cron)
	{ gameNumber: 973, date: '2026-10-18' }, // Alec Burleson (verified in games_batterup2026-10-20.json, game_date 2026-10-18; Oct 18 cron missed the day entirely)
	{ gameNumber: 975, date: '2026-10-20' }, // Jonathan Aranda (verified in games_batterup2026-10-20.json, game_date matches; Oct 21 cron raced the publisher, nothing committed)
	{ gameNumber: 976, date: '2026-10-21' }, // Jackson Chourio (verified in games_batterup2026-10-21.json, game_date matches; publisher refreshed ~03:19 UTC, after the 01:05 cron)
	{ gameNumber: 980, date: '2026-10-25' }, // Casey Schmitt (verified in games_batterup2026-10-28.json cumulative file, game_date matches, player_id 4301949)
	{ gameNumber: 983, date: '2026-10-28' }, // Trevor Larnach (verified in games_batterup2026-10-28.json cumulative file, game_date matches, player_id 41205; Oct 28 cron raced the publisher, page on "updating")
	{ gameNumber: 985, date: '2026-10-30' }, // Jackson Merrill (verified in games_batterup2026-10-31.json cumulative file, game_date 2026-10-30 matches, player_id 4872691; Oct 30 game missing from site's recent list, Oct 31 #986 landed fine)
	{ gameNumber: 991, date: '2026-11-05' }, // Nick Kurtz (verified in games_batterup2026-11-05.json, game_date 2026-11-05 matches, player_id 4966637, Athletics; file last_updated 2026-11-04T23:50:36-05:00 = 2026-11-05 04:50 UTC, after both the 01:05 cron and the proposed 04:00 move — Nov 5 page on "updating" at 10:43 UTC, archive newest is #990 Nov 4)
];

function dateKeyUTC(date) {
	const y = date.getUTCFullYear();
	const m = String(date.getUTCMonth() + 1).padStart(2, '0');
	const d = String(date.getUTCDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

async function fetchJson(url) {
	const res = await fetch(url, {
		headers: { 'User-Agent': 'WordSolverX-batterup-backfill/1.0' },
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
	const today = dateKeyUTC(new Date());
	const repoRoot = process.cwd();
	const answersFile = join(repoRoot, 'src', 'lib', 'data', 'batterup-answers.json');

	// 1. Fetch the latest cumulative CDN files (today, fall back to yesterday).
	let games = null;
	let players = null;
	let sourceDate = null;
	let lastError = null;
	for (const key of [today, dateKeyUTC(new Date(Date.now() - 86400000))]) {
		try {
			const day = await fetchDay(key);
			games = day.games;
			players = day.players;
			sourceDate = key;
			break;
		} catch (err) {
			lastError = err;
			console.warn(`[batterup-backfill] ${key}: ${err.message}`);
		}
	}
	if (!games || !players) {
		console.error(`[batterup-backfill] FAILED: no usable CDN data. Last error: ${lastError?.message}`);
		process.exit(1);
	}
	console.log(`[batterup-backfill] Source files dated ${sourceDate}: ${games.length} games, ${players.length} players`);

	// 2. Build the entries.
	const entries = [];
	for (const t of TARGETS) {
		const game = games.find((g) => g.game_number === t.gameNumber);
		if (!game) {
			console.error(`[batterup-backfill] FAILED: game #${t.gameNumber} not found in cumulative CDN file`);
			process.exit(1);
		}
		if (game.game_date !== t.date) {
			console.error(`[batterup-backfill] FAILED: game #${t.gameNumber} has game_date ${game.game_date}, expected ${t.date} — refusing to guess`);
			process.exit(1);
		}
		const player = players.find((p) => String(p.player_id) === String(game.player_id));
		if (!player || !player.player_name) {
			console.error(`[batterup-backfill] FAILED: player_id ${game.player_id} not found in players file`);
			process.exit(1);
		}
		entries.push({
			date: t.date,
			gameNumber: game.game_number,
			player: stripPlayer(player),
			videoDescription: game.video_description || null,
			rawVideo: game.raw_video || null,
			sourceDate,
			fetchedAt: new Date().toISOString()
		});
		console.log(`[batterup-backfill] Recovered ${t.date} -> game #${t.gameNumber} (${player.player_name}, ${player.team_name})`);
	}

	// 3. Merge — never overwrite an existing date.
	mkdirSync(join(repoRoot, 'src', 'lib', 'data'), { recursive: true });
	let answers = {};
	if (existsSync(answersFile)) {
		answers = JSON.parse(readFileSync(answersFile, 'utf-8'));
	}
	let added = 0;
	for (const e of entries) {
		if (answers[e.date]) {
			console.log(`[batterup-backfill] SKIP: ${e.date} already recorded (game #${answers[e.date].gameNumber}) — left untouched`);
			continue;
		}
		answers[e.date] = e;
		added++;
	}
	if (added === 0) {
		console.log('[batterup-backfill] UNCHANGED: nothing to add');
		return;
	}
	const sorted = {};
	for (const k of Object.keys(answers).sort()) sorted[k] = answers[k];
	writeFileSync(answersFile, JSON.stringify(sorted, null, 2) + '\n');
	console.log(`[batterup-backfill] WROTE: ${added} entr${added === 1 ? 'y' : 'ies'} added to ${answersFile}`);
}

main().catch((err) => {
	console.error(`[batterup-backfill] FAILED: ${err?.message || err}`);
	process.exit(1);
});
