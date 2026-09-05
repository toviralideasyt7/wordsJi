import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(__dirname, '..', '..', 'src', 'lib', 'content', 'registry.ts');

const BANNED = [
	'delve', 'tapestry', 'realm of', "in today's", 'in today\u2019s', 'furthermore',
	'moreover', 'additionally', 'without further ado', 'in conclusion', 'in summary',
	'in essence', "it's worth noting", 'it is worth noting', 'game-changer',
	'unlock potential', 'mastering the', 'machine learning', 'language model',
	'one of the most', 'fascinating', 'showcase', 'streamline', 'vibrant',
	'innovative', 'robust', 'seamless', 'pivotal', 'intricate', 'meticulous',
	'facilitate', 'utilize', 'paramount', 'plethora', 'myriad', 'harness',
	'embark', 'testament', 'cutting-edge', 'revolutionary', 'multifaceted'
];

const HEDGES = ['however', 'notably', 'essentially', 'that said', 'arguably'];

const EXPERIENCE = [
	/\bI (burned|guessed|opened|started|missed|needed|stared|wasted|hesitated|plugged|spotted|noticed|kept|played|solved|tracked|logged|use|used|figured|checked|lost)\b/i,
	/\bmy (streak|guess|guesses|average|morning|spreadsheet|sheet|brain|rule|tracking|opener|play)\b/i,
	/\bmy (friend|partner|wife|husband|kid|son|daughter|mom|dad|brother|sister|colleague)\b/i,
	/\bgroup chat\b/i
];

function stripHtml(s) {
	return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sentencesOf(text) {
	return text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'“])/).map((s) => s.trim()).filter(Boolean);
}

function stddev(nums) {
	if (nums.length < 2) return 0;
	const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
	return Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length);
}

function countTripletRuns(lens) {
	let runs = 0;
	let run = 1;
	for (let i = 1; i < lens.length; i += 1) {
		if (Math.abs(lens[i] - lens[i - 1]) <= 2) run += 1;
		else {
			if (run >= 3) runs += 1;
			run = 1;
		}
	}
	if (run >= 3) runs += 1;
	return runs;
}

function scoreArticle(key, raw) {
	// FAQ *questions* speak in the reader's voice ("How do I...", "my guesses") —
	// that is correct and must not count as invented experience. Scan everything
	// for AI tells, but check experience patterns against answers/prose only.
	const dequoted = raw.replace(/question:\s*(['"])(.+?)\1,?/gs, 'question: [ skipped ]');
	const text = stripHtml(raw);
	const prose = stripHtml(dequoted);
	const words = text.split(/\s+/).filter(Boolean);
	const sents = sentencesOf(text);
	const lens = sents.map((s) => s.split(/\s+/).filter(Boolean).length);
	const sd = stddev(lens);
	const avg = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
	const per1k = (n) => (words.length ? (n / words.length) * 1000 : 0);
	const lower = text.toLowerCase();
	const emdash = (text.match(/\u2014/g) || []).length;
	const banned = BANNED.filter((b) => lower.includes(b));
	const hedges = HEDGES.reduce((n, h) => n + (lower.split(h).length - 1), 0);
	const contractions = (text.match(/\b\w+'(t|re|ve|ll|d|s|m)\b/gi) || []).length;
	const experience = EXPERIENCE.flatMap((re) => prose.match(new RegExp(re.source, 'gi')) || []);
	const triplets = countTripletRuns(lens);
	const issues = [];
	if (banned.length > 0) issues.push({ level: 'FAIL', msg: `banned phrases: ${banned.join(', ')}` });
	if (experience.length > 0) issues.push({ level: 'FAIL', msg: `invented-experience hits: ${experience.slice(0, 3).join(' | ')}` });
	if (per1k(emdash) > 2) issues.push({ level: 'FAIL', msg: `${emdash} em-dashes (${per1k(emdash).toFixed(1)}/1k words)` });
	if (sd < 6 && avg >= 15 && avg <= 25 && sents.length >= 10) issues.push({ level: 'REVIEW', msg: `flat cadence (avg ${avg.toFixed(1)}, sd ${sd.toFixed(1)})` });
	if (per1k(hedges) >= 3) issues.push({ level: 'REVIEW', msg: `hedge cluster (${hedges} hits)` });
	if (triplets >= 3) issues.push({ level: 'REVIEW', msg: `${triplets} same-length sentence runs` });
	if (words.length > 300 && contractions / words < 1 / 150) issues.push({ level: 'REVIEW', msg: 'almost no contractions (over-formal)' });
	return { key, words: words.length, sentences: sents.length, avgLen: +avg.toFixed(1), sd: +sd.toFixed(1), emdash, banned: banned.length, expHits: experience.length, issues };
}

async function main() {
	const src = await readFile(REGISTRY, 'utf8');
	const markers = [...src.matchAll(/key: '([a-z0-9-]+)'/g)];
	const results = markers.map((m, i) => {
		const start = m.index;
		const end = i + 1 < markers.length ? markers[i + 1].index : src.length;
		return scoreArticle(m[1], src.slice(start, end));
	});
	const asJson = process.argv.includes('--json');
	if (asJson) {
		console.log(JSON.stringify(results, null, 2));
	} else {
		for (const r of results) {
			const flag = r.issues.some((i) => i.level === 'FAIL') ? 'FAIL' : r.issues.length ? 'REVIEW' : 'PASS';
			console.log(`${flag}\t${r.key}\t${r.words}w\t${r.sentences}s\tavg${r.avgLen}\tsd${r.sd}\tem${r.emdash}`);
			for (const i of r.issues) console.log(`    [${i.level}] ${i.msg}`);
		}
		const fails = results.filter((r) => r.issues.some((i) => i.level === 'FAIL')).length;
		const reviews = results.filter((r) => !r.issues.some((i) => i.level === 'FAIL') && r.issues.length).length;
		console.log(`\nTOTAL=${results.length} PASS=${results.length - fails - reviews} REVIEW=${reviews} FAIL=${fails}`);
	}
	const fails = results.filter((r) => r.issues.some((i) => i.level === 'FAIL')).length;
	if (fails > 0 && !asJson) process.exitCode = 1;
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 2;
});
