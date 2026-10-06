// scripts/generate-ai-hints.mjs
// Generates wordhint.net-style AI hint JSON for each daily-answer game and writes
// them to src/lib/data/ai-hints/<game>.json (idempotent merge, never deletes dates).
//
// Usage:
//   node scripts/generate-ai-hints.mjs                 # all games, today's puzzles
//   node scripts/generate-ai-hints.mjs --force          # regenerate even if dateKey exists
//   node scripts/generate-ai-hints.mjs --games=wordle,semantle
//   node scripts/generate-ai-hints.mjs --date=2026-10-05  # only games resolving to this dateKey
//
// AI chain per game: justworker-key-08/09 (keyless, round-robin) -> NVIDIA (env
// NVIDIA_API_KEY) -> bynara (env BYNARA_API_KEY) -> deterministic fallback.
// Secrets are read ONLY from process.env; nothing secret is written to any file.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'src', 'lib', 'data', 'ai-hints');

// ---------------------------------------------------------------- CLI
const ARGS = process.argv.slice(2);
const FLAG_FORCE = ARGS.includes('--force');
const FLAG_GAMES = (ARGS.find((a) => a.startsWith('--games=')) || '').slice('--games='.length).split(',').map((s) => s.trim()).filter(Boolean);
const FLAG_DATE = (ARGS.find((a) => a.startsWith('--date=')) || '').slice('--date='.length) || null;

function readJson(p) {
	return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function readText(p) {
	return fs.readFileSync(p, 'utf8');
}

// ---------------------------------------------------------------- Window-date replication
// Mirrors src/lib/puzzle-window.ts getWorkerLatestDates for 'worker-latest' games
// (boundaryHourUtc/minute + visibleDateOffsetDays, 30s rollover grace) and the
// fixed-offset branch for worgle (IST, UTC+5:30).
const GRACE_S = 30;
function windowKeyForBoundary(hour, minute, offsetDays, now = new Date()) {
	const boundary = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, GRACE_S, 0);
	const base = now.getTime() >= boundary ? 0 : -1;
	const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + base + offsetDays));
	return dateKeyOf(d);
}
function dateKeyOf(d) {
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function worgleWindowKey(now = new Date()) {
	const offsetMin = 330; // IST
	const local = new Date(now.getTime() + offsetMin * 60_000);
	const boundaryUtcMs = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 0, 0, GRACE_S, 0) - offsetMin * 60_000;
	const eff = now.getTime() >= boundaryUtcMs
		? new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()))
		: new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - 1));
	return dateKeyOf(eff);
}
// Per-game window: [boundaryHourUtc, boundaryMinuteUtc, visibleDateOffsetDays] or 'IST'.
const WINDOWS = {
	wordle: [16, 30, 1], quordle: [16, 30, 1], phoodle: [16, 30, 1], semantle: [16, 30, 1],
	colordle: [16, 30, 1], countryle: [16, 30, 1], framed: [16, 30, 1], worldle: [16, 30, 1],
	betweenle: [16, 30, 1], nerdle: [16, 30, 1], contexto: [16, 30, 1], searchle: [16, 30, 1],
	phrazle: [16, 30, 1], spotle: [16, 30, 1],
	canuckle: [5, 0, 0], globle: [6, 0, 0], waffle: [0, 1, 0],
	dotadle: [6, 2, 0], loldle: [6, 2, 0], narutodle: [6, 2, 0], onepiecedle: [6, 2, 0],
	pokedle: [6, 2, 0], smashdle: [6, 2, 0], marveldle: [6, 2, 0],
	colorfle: [15, 0, 1], batterup: [1, 0, 0], worgle: 'IST'
};
function windowKey(game, now = new Date()) {
	const w = WINDOWS[game];
	if (w === 'IST') return worgleWindowKey(now);
	return windowKeyForBoundary(w[0], w[1], w[2], now);
}
function daysSinceEpochUtc(dateKey, epochY, epochM, epochD) {
	const t = Date.UTC(...dateKey.split('-').map(Number).map((n, i) => (i === 1 ? n - 1 : n)));
	return Math.round((t - Date.UTC(epochY, epochM - 1, epochD)) / 86_400_000);
}

// ---------------------------------------------------------------- Lazy data loaders
const cache = {};
function loadBatterup() {
	if (!cache.batterup) cache.batterup = readJson(path.join(ROOT, 'src/lib/data/batterup-answers.json'));
	return cache.batterup;
}
function loadMarveldle() {
	if (!cache.marveldle) cache.marveldle = readJson(path.join(ROOT, 'src/lib/data/marveldle-answers.json'));
	return cache.marveldle;
}
function loadCanuckle() {
	if (!cache.canuckle) cache.canuckle = readJson(path.join(ROOT, 'src/lib/wordlebot-wasm/assets/generated/canuckle-data.json'));
	return cache.canuckle;
}
function loadSpotle() {
	if (!cache.spotle) cache.spotle = readJson(path.join(ROOT, 'static/spotle_data.json'));
	return cache.spotle;
}
function loadWorgleSolutions() {
	if (!cache.worgleSol) cache.worgleSol = readJson(path.join(ROOT, 'static/worgle_solutions.json'));
	return cache.worgleSol;
}
function loadWorgleArchive() {
	if (!cache.worgleArc) cache.worgleArc = readJson(path.join(ROOT, 'static/worgle_archive.json'));
	return cache.worgleArc;
}
function loadSemantleWords() {
	if (!cache.semantle) {
		const src = readText(path.join(ROOT, 'src/lib/data/semantle-words.ts'));
		cache.semantle = [...src.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
	}
	return cache.semantle;
}
function loadSearchle() {
	if (!cache.searchle) {
		const src = readText(path.join(ROOT, 'src/lib/searchle/searchleData.ts'));
		cache.searchle = [...src.matchAll(/\{"text":"((?:[^"\\]|\\.)*)","answer":"((?:[^"\\]|\\.)*)","luckyGuess":"((?:[^"\\]|\\.)*)"\}/g)]
			.map((m) => ({ text: m[1], answer: m[2], luckyGuess: m[3] }));
	}
	return cache.searchle;
}
function loadBetweenleWords() {
	if (!cache.betweenle) {
		cache.betweenle = readText(path.join(ROOT, 'src/lib/data/betweenle/daily-words.txt'))
			.trim().split('\n').map((w) => w.trim().toLowerCase()).filter(Boolean);
	}
	return cache.betweenle;
}
function loadFramed() {
	if (!cache.framed) cache.framed = readJson(path.join(ROOT, 'static/framed_data.json'));
	return cache.framed;
}
function loadGlobleCountries() {
	if (!cache.globle) cache.globle = readJson(path.join(ROOT, 'src/lib/data/globle-countries.json'));
	return cache.globle;
}
function loadGlobleKey() {
	if (!cache.globleKey) {
		const src = readText(path.join(ROOT, 'src/lib/globle-date.ts'));
		const m = src.match(/const KEY = "([^"]+)"/);
		if (!m) throw new Error('globle KEY not found in src/lib/globle-date.ts');
		cache.globleKey = m[1];
	}
	return cache.globleKey;
}
function loadWorldleCountries() {
	if (!cache.worldle) cache.worldle = readJson(path.join(ROOT, 'src/lib/data/worldle/countries.json'));
	return cache.worldle;
}
function loadCountryleCountries() {
	if (!cache.countryle) cache.countryle = readJson(path.join(ROOT, 'src/lib/data/countryle/countries.json'));
	return cache.countryle;
}
function loadCountryleKey() {
	if (!cache.countryleKey) {
		const src = readText(path.join(ROOT, 'src/lib/live-answer-sources.ts'));
		const m = src.match(/const COUNTRYLE_AES_KEY = '([^']+)'/);
		if (!m) throw new Error('COUNTRYLE_AES_KEY not found');
		cache.countryleKey = m[1];
	}
	return cache.countryleKey;
}
function loadPhrases() {
	if (!cache.phrases) {
		const src = readText(path.join(ROOT, 'src/lib/phrazle/phrases.ts'));
		const arr = src.match(/const PHRASES[^=]*=\s*\[(.*?)\];/s);
		if (!arr) throw new Error('PHRASES not found in phrases.ts');
		cache.phrases = [...arr[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
	}
	return cache.phrases;
}
// Quordle: replicate src/lib/quordle.ts (_M Mersenne Twister + _G) in plain JS.
function loadQuordleData() {
	if (cache.quordle) return cache.quordle;
	const src = readText(path.join(ROOT, 'src/lib/data/QuordleObfuscatedData.ts'));
	const get = (k) => {
		const m = src.match(new RegExp(`export const ${k} = "([^"]+)"`));
		if (!m) throw new Error(`${k} not found`);
		return m[1];
	};
	cache.quordle = {
		wd: Buffer.from(get('Q_DAT_D'), 'base64').toString('utf8').split(' '),
		wc: Buffer.from(get('Q_DAT_C'), 'base64').toString('utf8').split(' '),
		we: Buffer.from(get('Q_DAT_E'), 'base64').toString('utf8').split(' '),
		bl: new Set(Buffer.from(get('Q_DAT_B'), 'base64').toString('utf8').split(' ')),
		wl: JSON.parse(Buffer.from(get('Q_DAT_W'), 'base64').toString('utf8'))
	};
	return cache.quordle;
}
class _M {
	constructor(s) { this.N = 624; this.M = 397; this.A = 2567483615; this.U = 2147483648; this.L = 2147483647; this.m = new Array(this.N); this.i = this.N + 1; if (Array.isArray(s)) this.ia(s, s.length); else this.is(s); }
	is(s) { this.m[0] = s >>> 0; for (this.i = 1; this.i < this.N; this.i++) { let x = this.m[this.i - 1] ^ this.m[this.i - 1] >>> 30; this.m[this.i] = (((x & 4294901760) >>> 16) * 1812433253 << 16) + (x & 65535) * 1812433253 + this.i; this.m[this.i] >>>= 0; } }
	ia(s, l) { this.is(19650218); let i = 1, j = 0, k = this.N > l ? this.N : l; for (; k; k--) { let x = this.m[i - 1] ^ this.m[i - 1] >>> 30; this.m[i] = (this.m[i] ^ (((x & 4294901760) >>> 16) * 1664525 << 16) + (x & 65535) * 1664525) + s[j] + j; this.m[i] >>>= 0; i++; j++; if (i >= this.N) { this.m[0] = this.m[this.N - 1]; i = 1; } if (j >= l) j = 0; } for (k = this.N - 1; k; k--) { let x = this.m[i - 1] ^ this.m[i - 1] >>> 30; this.m[i] = (this.m[i] ^ (((x & 4294901760) >>> 16) * 1566083941 << 16) + (x & 65535) * 1566083941) - i; this.m[i] >>>= 0; i++; if (i >= this.N) { this.m[0] = this.m[this.N - 1]; i = 1; } } this.m[0] = 2147483648; }
	r() { let y, m = new Array(0, this.A); if (this.i >= this.N) { let k; for (this.i == this.N + 1 && this.is(5489), k = 0; k < this.N - this.M; k++) y = this.m[k] & this.U | this.m[k + 1] & this.L, this.m[k] = this.m[this.M + k] ^ y >>> 1 ^ m[y & 1]; for (; k < this.N - 1; k++) y = this.m[k] & this.U | this.m[k + 1] & this.L, this.m[k] = this.m[k + (this.M - this.N)] ^ y >>> 1 ^ m[y & 1]; y = this.m[this.N - 1] & this.U | this.m[0] & this.L, this.m[this.N - 1] = this.m[this.M - 1] ^ y >>> 1 ^ m[y & 1], this.i = 0; } y = this.m[this.i++]; y ^= y >>> 11; y ^= y << 7 & 2636928640; y ^= y << 15 & 4022730752; y ^= y >>> 18; return y >>> 0; }
	r31() { return this.r() >>> 1; }
}
function quordle_G(seed, wb, bl) {
	let r; const rng = new _M(seed);
	rng.r31(); rng.r31(); rng.r31(); rng.r31();
	do r = [wb[rng.r31() % wb.length], wb[rng.r31() % wb.length], wb[rng.r31() % wb.length], wb[rng.r31() % wb.length]];
	while (r[0] === r[1] || r[0] === r[2] || r[0] === r[3] || r[1] === r[2] || r[1] === r[3] || r[2] === r[3] || bl.has(r[0]) || bl.has(r[1]) || bl.has(r[2]) || bl.has(r[3]));
	return r;
}

// ---------------------------------------------------------------- Answer resolvers
// Each resolver returns { text, dateKey, numberText } | null.
// "today" = the dateKey the source itself uses (payload's own date field, or the
// date the page's logic would resolve via the replicated window above).

async function fetchJson(url, opts = {}) {
	const res = await fetch(url, { signal: AbortSignal.timeout(20000), ...opts });
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
	return res.json();
}

const GAMES = [
	{
		key: 'wordle', label: 'Wordle',
		async getInput() {
			const d = await fetchJson('https://api.wordsolverx.workers.dev/api/today');
			if (!d || !d.solution || !d.date) return null;
			return { text: d.solution, dateKey: d.date, numberText: `#${d.days_since_launch}` };
		}
	},
	{
		key: 'batterup', label: 'Batter Up',
		async getInput() {
			const answers = loadBatterup();
			const keys = Object.keys(answers).sort();
			const entry = answers[keys[keys.length - 1]];
			if (!entry || entry.date !== keys[keys.length - 1] || !entry.player?.player_name) return null;
			return { text: entry.player.player_name, dateKey: entry.date, numberText: `Game #${entry.gameNumber}` };
		}
	},
	{
		key: 'marveldle', label: 'Marveldle',
		async getInput() {
			const answers = loadMarveldle();
			const keys = Object.keys(answers).sort();
			const entry = answers[keys[keys.length - 1]];
			if (!entry || entry.date !== keys[keys.length - 1] || !entry.comics?.name || !entry.mcu?.name) return null;
			return { text: `${entry.comics.name} / ${entry.mcu.name}`, dateKey: entry.date, numberText: entry.dateId || entry.date };
		}
	},
	{
		key: 'canuckle', label: 'Canuckle',
		async getInput() {
			const data = loadCanuckle();
			const puzzles = [...data.puzzles].sort((a, b) => a.index - b.index);
			const key = windowKey('canuckle');
			let p = puzzles.find((x) => x.date === key);
			if (!p) p = [...puzzles].reverse().find((x) => x.date <= key) ?? puzzles[puzzles.length - 1];
			if (!p || !p.answer) return null;
			return { text: p.answer, dateKey: p.date, numberText: `#${p.index}` };
		}
	},
	{
		key: 'spotle', label: 'Spotle',
		async getInput() {
			const data = loadSpotle();
			const answers = data.answers ?? [];
			const key = windowKey('spotle');
			let entry = answers.find((e) => e.date === key);
			if (!entry) entry = [...answers].filter((e) => e.date <= key).sort((a, b) => b.date.localeCompare(a.date))[0];
			if (!entry || !entry.artist) return null;
			return { text: entry.artist, dateKey: entry.date, numberText: `Day ${entry.dayNumber}` };
		}
	},
	{
		key: 'worgle', label: 'Worgle',
		async getInput() {
			const solutions = loadWorgleSolutions();
			const archive = loadWorgleArchive();
			const dateKey = windowKey('worgle'); // IST dateKey, formatWorgleDateKey-compatible
			const targetUtcMs = Date.UTC(...dateKey.split('-').map(Number).map((n, i) => (i === 1 ? n - 1 : n)));
			const dayOffset = Math.round((targetUtcMs - Date.UTC(2021, 5, 19)) / 86_400_000);
			const index = (((dayOffset - 207) % solutions.length) + solutions.length) % solutions.length;
			const archived = archive.find((e) => e.date === dateKey);
			const word = archived?.word ?? solutions[index];
			if (!word) return null;
			const puzzleNum = archived?.puzzle ?? (dayOffset - 207);
			return { text: word, dateKey, numberText: `#${puzzleNum}` };
		}
	},
	{
		key: 'colordle', label: 'Colordle',
		async getInput() {
			const d = await fetchJson('https://color-answers-worker.colordle.workers.dev/api/colordle/today');
			if (!d || !d.date || !d.color_name) return null;
			return { text: `${d.color_name} (${d.color_hex})`, dateKey: d.date, numberText: `#${d.day_number}` };
		}
	},
	{
		key: 'semantle', label: 'Semantle',
		async getInput() {
			const words = loadSemantleWords();
			const key = windowKey('semantle');
			const puzzleNumber = daysSinceEpochUtc(key, 2022, 1, 29);
			const word = words[puzzleNumber];
			if (!word) return null;
			return { text: word, dateKey: key, numberText: `#${puzzleNumber}` };
		}
	},
	{
		key: 'searchle', label: 'Searchle',
		async getInput() {
			const puzzles = loadSearchle();
			const key = windowKey('searchle');
			const diffDays = daysSinceEpochUtc(key, 2023, 6, 22);
			const index = diffDays >= 0 ? diffDays % puzzles.length : 0;
			const p = puzzles[index];
			if (!p || !p.answer) return null;
			return { text: p.answer, dateKey: key, numberText: `#${index + 1}` };
		}
	},
	{
		key: 'waffle', label: 'Waffle',
		async getInput() {
			const d = await fetchJson('https://api.wafflegame.workers.dev/today');
			if (!d || d.error || !d.date || !Array.isArray(d.words) || !d.words.length) return null;
			return { text: d.words.join(' / '), dateKey: d.date, numberText: `#${d.number}` };
		}
	},
	{
		key: 'quordle', label: 'Quordle',
		async getInput() {
			const { wd, bl } = loadQuordleData();
			const key = windowKey('quordle');
			const [y, mo, da] = key.split('-').map(Number);
			const e_d = new Date(2022, 0, 24, 12, 0, 0).getTime();
			const sd = new Date(y, mo - 1, da, 12, 0, 0).getTime();
			const dN = Math.floor((sd - e_d) / 86_400_000);
			if (dN < 0) return null;
			const words = quordle_G(dN, wd, bl);
			return { text: words.join(' / '), dateKey: key, numberText: `#${dN}` };
		}
	},
	{
		key: 'nerdle', label: 'Nerdle',
		async getInput() {
			const key = windowKey('nerdle');
			const payload = await fetchJson(`https://nerdle-answers.nerdleapi.workers.dev/${key}`);
			const data = payload?.data;
			const classic = data?.modes?.find((m) => m.id === 'classic');
			const answer = classic?.answers?.[0]?.answer;
			if (!data || data.date !== key || !answer) return null;
			return { text: answer, dateKey: data.date, numberText: `#${data.classicPuzzleNumber}` };
		}
	},
	{
		key: 'phoodle', label: 'Phoodle',
		async getInput() {
			const d = await fetchJson('https://phoodle-worker.pinpoints.workers.dev/summary/today?history=0');
			const current = d?.current;
			if (!current || !current.word) return null;
			const dateKey = current.id || d.visible_date;
			if (!dateKey) return null;
			return { text: current.word, dateKey, numberText: dateKey };
		}
	},
	{
		key: 'betweenle', label: 'Betweenle',
		async getInput() {
			const words = loadBetweenleWords();
			const key = windowKey('betweenle');
			const puzzleNumber = daysSinceEpochUtc(key, 2023, 3, 17) + 1;
			const word = words[(puzzleNumber - 1) % words.length];
			if (!word) return null;
			return { text: word, dateKey: key, numberText: `#${puzzleNumber}` };
		}
	},
	{
		key: 'framed', label: 'Framed',
		async getInput() {
			const key = windowKey('framed');
			const dataset = loadFramed();
			const entry = dataset.modes?.daily?.entries?.find((e) => e.date === key);
			if (entry && entry.answer) {
				return { text: entry.answer, dateKey: entry.date, numberText: `#${entry.puzzleNumber}` };
			}
			// Bundled data ends 2026-05-29; fall back to the live titles.framed.wtf source
			// (mirrors fetchLiveFramedEntries/fetchFramedAnswer in src/lib/live-answer-sources.ts).
			const refDate = new Date(`${dataset.referenceDate}T00:00:00Z`).getTime();
			const target = new Date(`${key}T12:00:00Z`).getTime();
			const puzzleNumber = 1483 + Math.round((target - refDate) / 86_400_000); // 'daily' referencePuzzle
			const payload = await fetchJson(`https://titles.framed.wtf/v1/titles/top-ten/${puzzleNumber}?gameType=daily`, {
				headers: { accept: 'application/json', 'user-agent': 'WordSolverX Daily Live Fetch' }
			});
			const frames = payload?.frames ?? [];
			const lastFrame = frames[frames.length - 1];
			const rawItems = lastFrame?.items;
			const items = typeof rawItems === 'string' ? JSON.parse(rawItems) : (Array.isArray(rawItems) ? rawItems : []);
			const title = items?.[0]?.title;
			if (!title) return null;
			return { text: title, dateKey: key, numberText: `#${puzzleNumber}` };
		}
	},
	{
		key: 'globle', label: 'Globle',
		async getInput() {
			const countries = loadGlobleCountries();
			const CryptoJS = require('crypto-js');
			const key = windowKey('globle');
			const d = await fetchJson(`https://globle-game.com/answer?day=${key}&list=${countries.length}`);
			if (!d || !d.answer) return null;
			const decrypted = CryptoJS.AES.decrypt(d.answer, loadGlobleKey()).toString(CryptoJS.enc.Utf8);
			const index = parseInt(decrypted, 10);
			if (!Number.isFinite(index) || index < 0 || index >= countries.length) return null;
			return { text: countries[index].name, dateKey: key, numberText: key };
		}
	},
	{
		key: 'worldle', label: 'Worldle',
		async getInput() {
			const countries = loadWorldleCountries();
			const seedrandom = require('seedrandom');
			const key = windowKey('worldle');
			const worldleNumber = daysSinceEpochUtc(key, 2022, 1, 21) + 1;
			const sorted = [...countries].sort((a, b) => a.code.localeCompare(b.code));
			const rng = seedrandom(String(worldleNumber));
			const country = sorted[Math.floor(rng() * sorted.length)];
			if (!country || !country.name) return null;
			return { text: country.name, dateKey: key, numberText: `#${worldleNumber}` };
		}
	},
	{
		key: 'countryle', label: 'Countryle',
		async getInput() {
			const key = windowKey('countryle');
			const [y, mo, da] = key.split('-');
			const apiDate = `${da}/${mo}/${y}`;
			try {
				const payload = await fetchJson(`https://www.countryle.com/hidden-api/get-daily-country-valid.php?date=${apiDate}`, {
					headers: { accept: 'application/json', 'user-agent': 'WordSolverX Daily Live Fetch' }
				});
				const CryptoJS = require('crypto-js');
				const raw = payload.country ?? payload.id ?? payload;
				const countryId = typeof raw === 'string'
					? parseInt(CryptoJS.AES.decrypt(raw, loadCountryleKey()).toString(CryptoJS.enc.Utf8), 10)
					: parseInt(String(raw), 10);
				const list = loadCountryleCountries();
				const countriesArr = list.countries ?? list;
				const country = countriesArr.find((c) => c.id === countryId);
				if (country && country.country) {
					return { text: country.country, dateKey: key, numberText: `Game #${payload.number ?? ''}`.trim() };
				}
			} catch { /* fall through to bundled */ }
			return null;
		}
	},
	{
		key: 'colorfle', label: 'Colorfle',
		async getInput() {
			const d = await fetchJson('https://color-answers-worker.colordle.workers.dev/api/colorfle/today');
			if (!d || !d.date) return null;
			let names = [];
			try { names = JSON.parse(d.normal_names ?? '[]'); } catch { /* ignore */ }
			if (!names.length) return null;
			return { text: names.join(' / '), dateKey: d.date, numberText: `#${d.day_number}` };
		}
	},
	{
		key: 'contexto', label: 'Contexto',
		async getInput() {
			const key = windowKey('contexto');
			const gameNumber = 1260 + daysSinceEpochUtc(key, 2026, 3, 1);
			const d = await fetchJson(`https://api.contexto.me/machado/en/giveup/${gameNumber}`, {
				headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Accept: 'application/json' }
			});
			const word = d.word || d.answer;
			if (!word || typeof word !== 'string') return null;
			return { text: word, dateKey: key, numberText: `#${gameNumber}` };
		}
	},
	...['dotadle', 'loldle', 'narutodle', 'onepiecedle', 'pokedle', 'smashdle'].map((gameKey) => ({
		key: gameKey,
		label: { dotadle: 'Dotadle', loldle: 'LoLdle', narutodle: 'Narutodle', onepiecedle: 'OnePiecedle', pokedle: 'Pokedle', smashdle: 'Smashdle' }[gameKey],
		async getInput() {
			const answers = await fetchJson(`https://narutodle-worker.narutodle.workers.dev/today?game=${gameKey}`);
			if (!Array.isArray(answers) || !answers.length) return null;
			const latestDate = answers.map((a) => a.date).filter(Boolean).sort().pop();
			const todays = answers.filter((a) => a.date === latestDate);
			const names = [];
			for (const a of todays) {
				try {
					const content = JSON.parse(a.json_content || '{}');
					const name = (content.champion_name || '').trim();
					if (name && !names.includes(name)) names.push(name);
				} catch { /* ignore */ }
			}
			if (!names.length) return null;
			const gameId = todays[0]?.game_id;
			return { text: names.join(' / '), dateKey: latestDate, numberText: gameId ? `Game #${gameId}` : latestDate };
		}
	})),
	{
		key: 'phrazle', label: 'Phrazle',
		async getInput() {
			const phrases = loadPhrases();
			const key = windowKey('phrazle');
			const days = Math.ceil(daysSinceEpochUtc(key, 2022, 4, 18)); // ceil matches Math.ceil(diffMs/86400000) for whole days
			const pick = (gameNumber) => phrases[((gameNumber % phrases.length) + phrases.length) % phrases.length];
			const morning = pick(2 * days + 1);
			const afternoon = pick(2 * days + 2);
			if (!morning || !afternoon) return null;
			return { text: `${morning} / ${afternoon}`, dateKey: key, numberText: key };
		}
	}
];

// ---------------------------------------------------------------- Deterministic hints
const HINT_KEYS = ['vowel_hint', 'repeat_hint', 'riddle', 'clue1', 'starts_with', 'ends_with', 'definition', 'difficulty', 'difficulty_label', 'difficulty_reason'];
const DIFFICULTY_LABELS = ['Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'];

function analyzeText(text) {
	// Letters-only analysis; equations (nerdle) and other digit answers fall back
	// to alphanumeric characters so counts/positions stay sane.
	const letters = text.toLowerCase().replace(/[^a-z]/g, '');
	const chars = letters || text.toLowerCase().replace(/[^a-z0-9]/g, '');
	const vowelCount = [...letters].filter((c) => 'aeiou'.includes(c)).length;
	const repeatCount = chars.length - new Set(chars).size;
	const first = chars[0] ? chars[0].toUpperCase() : '?';
	const last = chars[chars.length - 1] ? chars[chars.length - 1].toUpperCase() : '?';
	const unit = letters ? 'letter' : (/^[0-9]+$/.test(chars) ? 'digit' : 'character');
	return { letters, chars, vowelCount, repeatCount, first, last, unit };
}
function plural(n, one, many) {
	return n === 1 ? one : many;
}
function deterministicHints(text) {
	const { letters, chars, vowelCount, repeatCount, first, last, unit } = analyzeText(text);
	const vowel_hint = `It contains ${vowelCount} ${plural(vowelCount, 'vowel', 'vowels')}.`;
	const repeat_hint = repeatCount === 0
		? `There are zero repeated ${unit}s.`
		: `${repeatCount} ${unit}${repeatCount === 1 ? '' : 's'} appear${repeatCount === 1 ? 's' : ''} more than once.`;
	const spanLen = chars.length;
	let score = 3;
	if (/[qzxj]/.test(letters)) score += 2;
	if (/[kv]/.test(letters)) score += 1;
	if (repeatCount > 0) score += 1;
	if (spanLen > 8 || spanLen < 4) score += 1;
	if (/^[qxzjv]/.test(letters)) score += 1;
	score = Math.max(0, Math.min(10, score));
	const difficulty_label = score <= 2 ? 'Very Easy' : score <= 4 ? 'Easy' : score <= 6 ? 'Normal' : score <= 8 ? 'Hard' : 'Very Hard';
	return {
		vowel_hint, repeat_hint, riddle: '', clue1: '',
		starts_with: first, ends_with: last, definition: '',
		difficulty: score, difficulty_label,
		difficulty_reason: 'Scored from letter rarity, repeats, and length.'
	};
}
function deterministicProse(gameLabel, dateLong, numberText, text) {
	const { chars, first, last } = analyzeText(text);
	const span = chars.length === 1 ? '1 character' : `${chars.length} characters`;
	return `The ${gameLabel} puzzle for ${dateLong} (${numberText}) is live with today's answer confirmed. ` +
		`The answer runs ${span}, starting with ${first} and ending with ${last} — see the letter hints above before you peek.`;
}
function dateLongOf(dateKey) {
	const [y, m, d] = dateKey.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// Answer-leak guard: riddle / clue1 / prose must never contain the answer text
// (case-insensitive) or any distinctive substring (word of 4+ chars) of it.
function answerTokens(text) {
	const toks = new Set();
	const norm = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
	if (norm.replace(/ /g, '').length >= 3) toks.add(norm.replace(/ /g, ''));
	for (const w of norm.split(' ')) {
		if (w.length >= 4) toks.add(w);
	}
	return [...toks];
}
function leaksAnswer(field, text) {
	if (!field || typeof field !== 'string') return false;
	const low = field.toLowerCase();
	return answerTokens(text).some((t) => t.length >= 3 && low.includes(t));
}

// ---------------------------------------------------------------- AI chain
const JUSTWORKER_HOSTS = [
	'https://justworker-key-08.justworker.workers.dev',
	'https://justworker-key-09.justworker.workers.dev'
];
let justworkerCounter = 0;

function buildPrompt(label, text, dateLong, numberText) {
	return `You are writing hints for the daily puzzle game "${label}".
The answer for the ${dateLong} puzzle (${numberText}) is: ${text}

Reply with ONLY a JSON object (no markdown, no commentary) with EXACTLY these keys:
- "vowel_hint": e.g. "It contains two vowels." (state the COUNT only, never name the vowels)
- "repeat_hint": e.g. "There are zero repeated letters." / "One letter appears twice."
- "riddle": a playful riddle about the answer, max 15 words. MUST NOT contain the answer or any distinctive substring of it.
- "clue1": a subtle clue, max 12 words. Must not reveal the answer.
- "starts_with": single letter (uppercase)
- "ends_with": single letter (uppercase)
- "definition": short dictionary-style definition, max 20 words. If the answer is a name, title, or equation, describe it instead (e.g. "American singer known for ...").
- "difficulty": integer 0-10
- "difficulty_label": one of "Very Easy", "Easy", "Normal", "Hard", "Very Hard"
- "difficulty_reason": max 18 words
- "prose": two original sentences about this specific puzzle (mention the game "${label}", the date "${dateLong}", the puzzle ${numberText}, and a neutral fact like the letter pattern). NEVER reveal the answer. No first-person experience, no invented personal history.`;
}

async function postChat(url, body, headers = {}) {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(45000)
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
	const data = await res.json();
	const content = data?.choices?.[0]?.message?.content;
	if (!content || typeof content !== 'string') throw new Error(`empty completion from ${url}`);
	return content;
}

function parseAIJson(content) {
	let s = content.trim();
	const start = s.indexOf('{');
	const end = s.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) throw new Error('no JSON object in completion');
	const obj = JSON.parse(s.slice(start, end + 1));
	for (const k of HINT_KEYS) {
		if (!(k in obj)) throw new Error(`missing key ${k}`);
	}
	if (!/^[A-Z0-9?]$/.test(String(obj.starts_with))) throw new Error('bad starts_with');
	if (!/^[A-Z0-9?]$/.test(String(obj.ends_with))) throw new Error('bad ends_with');
	if (!Number.isInteger(obj.difficulty) || obj.difficulty < 0 || obj.difficulty > 10) throw new Error('bad difficulty');
	if (!DIFFICULTY_LABELS.includes(obj.difficulty_label)) throw new Error('bad difficulty_label');
	return obj;
}

async function callAI(label, text, dateLong, numberText) {
	const user = buildPrompt(label, text, dateLong, numberText);
	const system = 'You are a puzzle-hint writer. Reply with ONLY a JSON object, no markdown, no commentary.';
	const body = { model: 'claude-opus-4-8', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.5, max_tokens: 1024 };

	// PRIMARY: justworker keyless hosts, round-robin, with retries on transient errors
	const errors = [];
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	for (let attempt = 0; attempt < 4; attempt++) {
		const host = JUSTWORKER_HOSTS[(justworkerCounter++) % JUSTWORKER_HOSTS.length];
		try {
			const content = await postChat(`${host}/v1/chat/completions`, body);
			return { source: `justworker:${new URL(host).hostname}`, hints: parseAIJson(content), prose: extractProse(content) };
		} catch (e) {
			errors.push(`justworker ${host} attempt ${attempt + 1}: ${e.message}`);
			if (attempt < 3) await sleep(1500 * (attempt + 1));
		}
	}
	// FALLBACK 1: NVIDIA (supports a key list in NVIDIA_API_KEYS, one per line/comma)
	const nvidiaKeys = String(process.env.NVIDIA_API_KEYS || process.env.NVIDIA_API_KEY || '')
		.split(/[\r\n,]+/).map((k) => k.trim()).filter(Boolean);
	for (const nvidiaKey of nvidiaKeys) {
		try {
			const content = await postChat('https://integrate.api.nvidia.com/v1/chat/completions',
				{ ...body, model: 'google/gemma-4-31b-it' },
				{ Authorization: `Bearer ${nvidiaKey}` });
			return { source: 'nvidia', hints: parseAIJson(content), prose: extractProse(content) };
		} catch (e) { errors.push(`nvidia: ${e.message}`); }
	}
	// FALLBACK 2: bynara
	if (process.env.BYNARA_API_KEY) {
		try {
			const content = await postChat('https://router.bynara.id/v1/chat/completions',
				{ ...body, model: 'agnes-3-flash' },
				{ Authorization: `Bearer ${process.env.BYNARA_API_KEY}` });
			return { source: 'bynara', hints: parseAIJson(content), prose: extractProse(content) };
		} catch (e) { errors.push(`bynara: ${e.message}`); }
	}
	return { source: 'deterministic', hints: null, prose: null, errors };
}
function extractProse(content) {
	try {
		const s = content.trim();
		const obj = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
		return typeof obj.prose === 'string' ? obj.prose.trim() : null;
	} catch { return null; }
}

// Merge: deterministic fields always win; AI fills creative fields when sane.
function mergeHints(text, ai) {
	const det = deterministicHints(text);
	if (!ai) return { hints: det, prose: null };
	const { vowelCount, repeatCount, first, last } = analyzeText(text);

	const vowelMatch = String(ai.vowel_hint).match(/(\d+)/);
	const vowel_hint = (vowelMatch && parseInt(vowelMatch[1], 10) === vowelCount) ? ai.vowel_hint : det.vowel_hint;
	const repeatMatch = String(ai.repeat_hint).match(/(\d+)/);
	const aiRepeatNum = repeatMatch ? parseInt(repeatMatch[1], 10) : (/(zero|no)\s+repeat/i.test(ai.repeat_hint) ? 0 : -1);
	const repeat_hint = aiRepeatNum === repeatCount ? ai.repeat_hint : det.repeat_hint;

	const riddle = ai.riddle && !leaksAnswer(ai.riddle, text) ? String(ai.riddle).trim() : '';
	const clue1 = ai.clue1 && !leaksAnswer(ai.clue1, text) ? String(ai.clue1).trim() : '';
	const definition = ai.definition && typeof ai.definition === 'string' && !leaksAnswer(ai.definition, text) ? ai.definition.trim() : '';

	let difficulty = det.difficulty, difficulty_label = det.difficulty_label, difficulty_reason = det.difficulty_reason;
	if (Number.isInteger(ai.difficulty) && ai.difficulty >= 0 && ai.difficulty <= 10) {
		difficulty = ai.difficulty;
		difficulty_label = DIFFICULTY_LABELS.includes(ai.difficulty_label) ? ai.difficulty_label
			: (difficulty <= 2 ? 'Very Easy' : difficulty <= 4 ? 'Easy' : difficulty <= 6 ? 'Normal' : difficulty <= 8 ? 'Hard' : 'Very Hard');
		difficulty_reason = ai.difficulty_reason && typeof ai.difficulty_reason === 'string' && ai.difficulty_reason.trim()
			? ai.difficulty_reason.trim() : det.difficulty_reason;
	}
	return {
		hints: { vowel_hint, repeat_hint, riddle, clue1, starts_with: first, ends_with: last, definition, difficulty, difficulty_label, difficulty_reason },
		prose: null
	};
}

// ---------------------------------------------------------------- Output
function loadExisting(game) {
	const p = path.join(OUT_DIR, `${game}.json`);
	if (fs.existsSync(p)) {
		try { return readJson(p); } catch { return null; }
	}
	return null;
}
function writeGame(game, dateKey, hints, prose) {
	fs.mkdirSync(OUT_DIR, { recursive: true });
	const existing = loadExisting(game) || { game, generatedAt: new Date().toISOString(), hints: {}, prose: {} };
	existing.game = game;
	existing.generatedAt = new Date().toISOString();
	existing.hints = existing.hints || {};
	existing.prose = existing.prose || {};
	existing.hints[dateKey] = hints;
	if (prose) existing.prose[dateKey] = prose;
	fs.writeFileSync(path.join(OUT_DIR, `${game}.json`), JSON.stringify(existing, null, 2) + '\n');
}

// ---------------------------------------------------------------- Main
async function processGame(game, results) {
	const label = game.label;
	let input = null;
	try {
		input = await game.getInput();
	} catch (e) {
		results.push({ key: game.key, status: 'SKIP', reason: `source fetch failed: ${e.message}` });
		return;
	}
	if (!input || !input.text) {
		results.push({ key: game.key, status: 'SKIP', reason: 'no answer from source' });
		return;
	}
	if (FLAG_DATE && input.dateKey !== FLAG_DATE) {
		results.push({ key: game.key, status: 'SKIP', reason: `--date filter: resolved ${input.dateKey} !== ${FLAG_DATE}` });
		return;
	}
	const existing = loadExisting(game.key);
	if (!FLAG_FORCE && existing?.hints?.[input.dateKey]) {
		results.push({ key: game.key, status: 'CACHED', dateKey: input.dateKey, text: input.text });
		return;
	}
	const dateLong = dateLongOf(input.dateKey);
	let aiResult;
	try {
		aiResult = await callAI(label, input.text, dateLong, input.numberText);
	} catch (e) {
		aiResult = { source: 'deterministic', hints: null, prose: null, errors: [e.message] };
	}
	const merged = mergeHints(input.text, aiResult.hints);
	let prose = aiResult.prose && !leaksAnswer(aiResult.prose, input.text) ? aiResult.prose : null;
	if (!prose) prose = deterministicProse(label, dateLong, input.numberText, input.text);
	writeGame(game.key, input.dateKey, merged.hints, prose);
	results.push({
		key: game.key, status: aiResult.source === 'deterministic' ? 'DETERMINISTIC' : 'AI',
		via: aiResult.source, dateKey: input.dateKey, text: input.text,
		...(aiResult.errors ? { errors: aiResult.errors } : {})
	});
}

async function main() {
	const selected = FLAG_GAMES.length ? GAMES.filter((g) => FLAG_GAMES.includes(g.key)) : GAMES;
	const missing = FLAG_GAMES.filter((k) => !GAMES.some((g) => g.key === k));
	if (missing.length) console.error(`unknown games ignored: ${missing.join(', ')}`);
	const results = [];
	const CONCURRENCY = 6;
	const queue = [...selected];
	const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
		while (queue.length) {
			const game = queue.shift();
			await processGame(game, results);
			console.log(`[${game.key}] ${results[results.length - 1].status}`);
		}
	});
	await Promise.all(workers);
	console.log('\n=== SUMMARY ===');
	for (const r of results.sort((a, b) => a.key.localeCompare(b.key))) {
		console.log(`${r.key}: ${r.status}${r.via ? ` (${r.via})` : ''}${r.dateKey ? ` dateKey=${r.dateKey}` : ''}${r.text ? ` answer="${r.text}"` : ''}${r.reason ? ` — ${r.reason}` : ''}`);
	}
	const ai = results.filter((r) => r.status === 'AI').length;
	const det = results.filter((r) => r.status === 'DETERMINISTIC').length;
	const skip = results.filter((r) => r.status === 'SKIP').length;
	const cached = results.filter((r) => r.status === 'CACHED').length;
	console.log(`\nAI: ${ai} | deterministic: ${det} | cached: ${cached} | skipped: ${skip}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
