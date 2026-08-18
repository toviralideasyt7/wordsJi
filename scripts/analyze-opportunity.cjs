// Map Bing queries to pages and compute click upside (position-improvement model).
const fs = require('fs');
const rows = fs.readFileSync('bing-query-stats.csv', 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map((l) => {
  const [q, i, c, ctr, p] = l.split(',');
  return { q, imps: +i, clicks: +c, ctr: +ctr, pos: +p };
});

// CTR benchmark by position (Bing, informational/answer queries)
function ctrAt(pos) {
  if (pos <= 1) return 0.26;
  if (pos <= 2) return 0.17;
  if (pos <= 3) return 0.12;
  if (pos <= 4) return 0.09;
  if (pos <= 5) return 0.07;
  if (pos <= 6) return 0.05;
  if (pos <= 8) return 0.035;
  if (pos <= 10) return 0.025;
  return 0.01;
}

// map query -> target page (by strongest keyword match)
const pageMap = [
  { page: '/wordle-answer-today', re: /\bwordle (answer|solver|hint|helper|today|todays|clue|word finder|finder|guesser|tool|solving|solutions)\b|todays wordle|today's wordle|what is todays wordle|whats todays wordle|wordle #|wordle answer/ },
  { page: '/wordle-answer-archive', re: /all wordle answers|list of wordle answers|every wordle answer|wordle answers (20\d\d|all)|future wordle|wordle archive|wordle answers list|all the wordle answers|wordle (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july) .*answer|wordle \d+\/\d+/ },
  { page: '/5-letter-wordle-solver', re: /wordle solver|wordle helper|5 letter wordle|wordle 5|wordle word finder|word finder for wordle|wordle solving|wordle tools|wordle finder|wordle guesser|wordle clue solver|wordle solved|wordle answer finder|wordle tool/ },
  { page: '/colordle-answer-today', re: /colordle/ },
  { page: '/minesweeper-solver', re: /minesweeper/ },
  { page: '/smashdle-answer-today-updated', re: /smashdle/ },
  { page: '/globle-answer-today', re: /globle/ },
  { page: '/spotle-answer-today', re: /spotle/ },
  { page: '/lights-out-solver', re: /lights out/ },
  { page: '/semantle-answer-today', re: /semantle/ },
  { page: '/kanoodle-solver', re: /kanoodle/ },
  { page: '/waffle-archive', re: /waffle/ },
  { page: '/worldle-answer-today', re: /worldle/ },
  { page: '/betweenle-solver', re: /betweenle/ },
  { page: '/squaredle-solver', re: /squaredle/ },
  { page: '/quordle-answer-today', re: /quordle/ },
  { page: '/nerdle-answer-today', re: /nerdle/ },
  { page: '/contexto-answer-today', re: /contexto/ },
  { page: '/framed-answer-today', re: /framed/ },
  { page: '/searchle-answer-today', re: /searchle/ },
  { page: '/wordfinderx', re: /wordfinderx|word finder x/ },
  { page: '/', re: /wordsolver|word solver|word solutions|word puzzle solver/ }
];

const mapped = rows.map((r) => {
  const hit = pageMap.find((p) => p.re.test(r.q));
  return { ...r, page: hit ? hit.page : 'UNMAPPED' };
});

// Aggregate per page
const byPage = new Map();
for (const r of mapped) {
  if (!byPage.has(r.page)) byPage.set(r.page, { page: r.page, imps: 0, clicks: 0, queries: 0 });
  const a = byPage.get(r.page);
  a.imps += r.imps; a.clicks += r.clicks; a.queries += 1;
}

console.log('=== PER-PAGE (90-day Bing) ===');
const pages = [...byPage.values()].sort((a, b) => b.imps - a.imps);
for (const p of pages) {
  const ctr = p.imps ? p.clicks / p.imps : 0;
  console.log(`${p.page.padEnd(30)} imp ${String(p.imps).padStart(7)} cl ${String(p.clicks).padStart(5)} ctr ${(ctr * 100).toFixed(1).padStart(5)}% queries ${p.queries}`);
}

// Upside model: for queries with pos 3-10, what would clicks be at pos 2-3?
console.log('\n=== TOP 60 QUERIES BY CLICK UPSIDE ===');
const upside = mapped
  .filter((r) => r.pos >= 3 && r.imps >= 50)
  .map((r) => ({
    ...r,
    projAt3: Math.round(r.imps * 0.12),
    upside: Math.round(r.imps * 0.12) - r.clicks
  }))
  .sort((a, b) => b.upside - a.upside);
for (const r of upside.slice(0, 60)) {
  console.log(`${String(r.upside).padStart(6)} upside  ${String(r.imps).padStart(6)} imp ${String(r.clicks).padStart(3)} cl now → ${r.projAt3} @pos3  pos ${r.pos.toFixed(1).padStart(5)}  [${r.page}]  ${r.q}`);
}
const totalUpside = upside.reduce((s, r) => s + r.upside, 0);
console.log('\nTOTAL projected upside (pos3 CTR on all pos≥3 queries with ≥50 imp):', totalUpside, 'clicks/90d');
