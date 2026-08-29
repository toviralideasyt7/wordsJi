// Pull Bing Webmaster API query stats for wordsolverx.com (last 90 days via GET)
// and dump: (a) FAQ-style keywords, (b) per-game keyword pools with opportunity metrics.
// Usage: node scripts/bing-faq-keywords.mjs
// Requires BING_KEY in the environment (never hardcode API keys).
const KEY = process.env.BING_KEY;
if (!KEY) throw new Error('Set BING_KEY (Bing Webmaster API key) in the environment.');
const SITE = 'https://wordsolverx.com/';

const games = ['wordle', 'colordle', 'globle', 'worldle', 'semantle', 'nerdle', 'quordle',
  'contexto', 'framed', 'phoodle', 'phrazle', 'canuckle', 'waffle', 'worgle', 'sportle',
  'spotle', 'countryle', 'colorfle', 'searchle', 'betweenle', 'squaredle', 'minesweeper',
  'hangman', 'boggle', 'weaver', 'kanoodle', 'soundmap', 'loldle', 'pokedle', 'smashdle',
  'dotadle', 'narutodle', 'onepiecedle', 'word-ladder', 'light-out', 'wordlebot'];

const res = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?siteUrl=${encodeURIComponent(SITE)}&apikey=${KEY}`);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
const rows = (data.d || []).map((r) => ({
  q: r.Query,
  imps: r.Impressions ?? 0,
  clicks: r.Clicks ?? 0,
  pos: r.AvgImpressionPosition ?? 0,
  date: new Date((r.Date.match(/-?\d+/) || [0])[0] * 1).toISOString().slice(0, 10),
}));

// aggregate by query (daily rows)
const agg = new Map();
for (const r of rows) {
  const k = r.q.toLowerCase();
  if (!agg.has(k)) agg.set(k, { q: r.q, imps: 0, clicks: 0, posSum: 0, n: 0 });
  const a = agg.get(k);
  a.imps += r.imps; a.clicks += r.clicks; a.posSum += r.pos; a.n += 1;
}
const list = [...agg.values()].map((a) => ({ ...a, pos: a.posSum / a.n })).sort((x, y) => y.imps - x.imps);

const faq = list.filter((r) => /^(how|what|why|can|is|are|do|does|when|which)\b|(\?| tips| trick| guide| help| hint| answer key|solver online| solver free)/i.test(r.q))
  .slice(0, 70);

console.log('=== FAQ / question-style keywords (aggregated, by impressions) ===');
for (const r of faq) console.log(`${String(r.imps).padStart(6)} imp ${String(r.clicks).padStart(4)} cl  pos ${r.pos.toFixed(1).padStart(5)}  ${r.q}`);

console.log('\n=== per-game keyword pools ===');
for (const g of games) {
  const pool = list.filter((r) => new RegExp(`\\b${g}\\b`).test(r.q));
  if (!pool.length) continue;
  const imps = pool.reduce((s, r) => s + r.imps, 0);
  const clicks = pool.reduce((s, r) => s + r.clicks, 0);
  const top = [...pool].sort((a, b) => b.imps - a.imps).slice(0, 6);
  console.log(`\n[${g}] total imps=${imps} clicks=${clicks} kw=${pool.length}`);
  for (const t of top) console.log(`  ${String(t.imps).padStart(5)} imp ${String(t.clicks).padStart(3)} cl pos ${t.pos.toFixed(1).padStart(5)}  ${t.q}`);
}

console.log('\n=== all keywords with >= 40 impressions (opportunity list) ===');
for (const r of list.filter((r) => r.imps >= 40)) console.log(`${String(r.imps).padStart(6)} imp ${String(r.clicks).padStart(4)} cl  pos ${r.pos.toFixed(1).padStart(5)}  ${r.q}`);
