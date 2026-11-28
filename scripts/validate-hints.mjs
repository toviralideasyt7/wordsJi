// scripts/validate-hints.mjs — hint/facts consistency gate.
//
// Every daily answer page carries two independently produced data blocks:
// the hint cards (AIHintCards, fed by mergeHints) and the "Puzzle facts"
// strip (FactBlock, fed by letterFacts on the primary answer). When the hint
// pipeline computed stats over the wrong text (multi-mode joins, display
// strings), the blocks contradicted each other in public — e.g. Narutodle
// showing "32 vowels" in the hints while its own facts strip said 2
// (2026-11-05). This validator compares the two blocks in the RENDERED html
// and exits 1 on any contradiction, so a bad hint day can never deploy.
//
// Usage:
//   node scripts/validate-hints.mjs                  # scan the deployable build output (build/pages)
//   node scripts/validate-hints.mjs --dir <dir>      # scan a directory of built html
//   node scripts/validate-hints.mjs --base <url>     # check a live/deployed base URL instead
//
// Exit codes: 0 = all consistent (or nothing checkable), 1 = contradiction found.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const dirArg = args.find((a) => a.startsWith('--dir='))?.slice('--dir='.length);
const baseArg = args.find((a) => a.startsWith('--base='))?.slice('--base='.length);
const DEFAULT_DIR = 'build/pages';

function stripText(html) {
	return html
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/<style[\s\S]*?<\/style>/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, ' ')
		.trim();
}

function extract(text) {
	// A page can carry more than one facts strip (Phrazle shows a morning
	// and an afternoon phrase, each with its own strip and hint set since
	// 2026-11-28). Collect every strip; a hint value is consistent when
	// it matches at least one strip on the page. Single-strip pages —
	// everything else — behave exactly as before.
	const factsList = [
		...text.matchAll(
			/Puzzle facts\s+Puzzle number\s+\S+\s+Date\s+.+?\s+First letter\s+(\S)\s+Last letter\s+(\S)\s+Vowels\s+(\d+)\s+Repeats\s+(None|\d+|Yes|No)\b/g
		)
	].map((factsMatch) => ({
		first: factsMatch[1].toUpperCase(),
		last: factsMatch[2].toUpperCase(),
		vowels: parseInt(factsMatch[3], 10),
		repeats: factsMatch[4] === 'None' ? 0 : /^\d+$/.test(factsMatch[4]) ? parseInt(factsMatch[4], 10) : null
	}));
	const facts = factsList[0] ?? null;

	const hintVowels = new Set([...text.matchAll(/It contains (\d+) vowels?/g)].map((m) => parseInt(m[1], 10)));
	const hintStartEnd = new Set(
		[...text.matchAll(/Starts with,?\s+([A-Z]),?\s+Ends with,?\s+([A-Z])/g)].map((m) => `${m[1]}..${m[2]}`)
	);
	const hintRepeats = new Set();
	for (const m of text.matchAll(/(\d+) letters? appears? more than once/g)) hintRepeats.add(parseInt(m[1], 10));
	if (/There are zero repeated/.test(text)) hintRepeats.add(0);

	const hasHints = hintVowels.size > 0 || hintStartEnd.size > 0 || hintRepeats.size > 0;
	return { facts, factsList, hintVowels, hintStartEnd, hintRepeats, hasHints };
}

function checkPage(name, text) {
	const { facts, factsList, hintVowels, hintStartEnd, hintRepeats, hasHints } = extract(text);
	if (!facts) return { name, status: hasHints ? 'NOTE' : 'SKIP', problems: hasHints ? ['hint cards present but no facts strip to check against'] : [] };
	const problems = [];
	const factsVowels = new Set(factsList.map((f) => f.vowels));
	const factsStartEnd = new Set(factsList.map((f) => `${f.first}..${f.last}`));
	const factsRepeats = new Set(factsList.map((f) => f.repeats).filter((r) => r !== null));
	for (const v of hintVowels) if (!factsVowels.has(v)) problems.push(`hint vowels=${v} but facts vowels=${[...factsVowels].join('/')}`);
	for (const se of hintStartEnd) if (!factsStartEnd.has(se)) problems.push(`hint start/end=${se} but facts=${[...factsStartEnd].join('/')}`);
	if (factsRepeats.size > 0) {
		for (const r of hintRepeats) if (!factsRepeats.has(r)) problems.push(`hint repeats=${r} but facts repeats=${[...factsRepeats].join('/')}`);
	}
	return { name, status: problems.length ? 'FAIL' : 'PASS', problems };
}

function collectFromDir(dir) {
	const pages = [];
	const walk = (d) => {
		for (const entry of readdirSync(d)) {
			const p = join(d, entry);
			if (statSync(p).isDirectory()) walk(p);
			else if (entry.endsWith('.html') && p.includes('answer-today')) {
				pages.push({ name: '/' + relative(dir, p).replace(/\\/g, '/').replace(/\.html$/, '').replace(/\/index$/, ''), text: stripText(readFileSync(p, 'utf8')) });
			}
		}
	};
	walk(dir);
	return pages;
}

async function collectFromBase(base) {
	const sm = await (await fetch(`${base}/sitemap.xml`)).text();
	const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('answer-today'));
	const pages = [];
	for (const url of urls) {
		try {
			const html = await (await fetch(url)).text();
			pages.push({ name: url.replace(base, ''), text: stripText(html) });
		} catch (e) {
			pages.push({ name: url.replace(base, ''), text: '', fetchError: e.message });
		}
	}
	return pages;
}

if (!baseArg && !existsSync(dirArg || DEFAULT_DIR)) {
	console.error(`validate-hints: build dir ${dirArg || DEFAULT_DIR} not found — run the build first, or pass --base <url>.`);
	process.exit(1);
}
const pages = baseArg ? await collectFromBase(baseArg.replace(/\/$/, '')) : collectFromDir(dirArg || DEFAULT_DIR);

let fails = 0;
for (const page of pages.sort((a, b) => a.name.localeCompare(b.name))) {
	if (page.fetchError) {
		console.log(`FAIL ${page.name} — fetch error: ${page.fetchError}`);
		fails++;
		continue;
	}
	const r = checkPage(page.name, page.text);
	if (r.status === 'FAIL') {
		fails++;
		console.log(`FAIL ${r.name} — ${r.problems.join('; ')}`);
	} else if (r.status === 'NOTE') {
		console.log(`NOTE ${r.name} — ${r.problems.join('; ')}`);
	} else if (r.status === 'PASS') {
		console.log(`PASS ${r.name}`);
	}
}
console.log(`\nvalidate-hints: ${pages.length} answer pages checked, ${fails} contradiction(s).`);
process.exit(fails ? 1 : 0);
