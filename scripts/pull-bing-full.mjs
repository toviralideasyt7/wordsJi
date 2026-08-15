// Pull full Bing query stats (90 days) and save aggregated rows to a CSV.
const KEY = '696b6fcae42c4cf49cdd18cd1c8906d8';
const SITE = 'https://wordsolverx.com/';
const res = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?siteUrl=${encodeURIComponent(SITE)}&apikey=${KEY}`);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
const rows = data.d || [];
console.log('raw rows:', rows.length);

// aggregate by query
const agg = new Map();
for (const r of rows) {
  const q = (r.Query || '').toLowerCase();
  if (!agg.has(q)) agg.set(q, { q: r.Query, imps: 0, clicks: 0, posSum: 0, n: 0 });
  const a = agg.get(q);
  a.imps += r.Impressions ?? 0;
  a.clicks += r.Clicks ?? 0;
  a.posSum += r.AvgImpressionPosition ?? 0;
  a.n += 1;
}
const list = [...agg.values()].map((a) => ({ ...a, pos: +(a.posSum / a.n).toFixed(1) }));

list.sort((x, y) => y.imps - x.imps);
const totalImps = list.reduce((s, r) => s + r.imps, 0);
const totalClicks = list.reduce((s, r) => s + r.clicks, 0);
console.log(`aggregated queries: ${list.length} | impressions: ${totalImps} | clicks: ${totalClicks}`);

// CSV
const header = 'query,impressions,clicks,ctr,position';
const csv = [header, ...list.map((r) => `${r.q.replace(/,/g, ' ')},${r.imps},${r.clicks},${(r.clicks / r.imps).toFixed(4)},${r.pos}`)].join('\n');
import { writeFileSync } from 'node:fs';
writeFileSync('bing-query-stats.csv', csv);
console.log('saved bing-query-stats.csv');
