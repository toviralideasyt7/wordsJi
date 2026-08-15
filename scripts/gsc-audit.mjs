// GSC Audit script — reads a service-account JSON from GSC_CREDENTIALS_PATH,
// reports verified sites, sitemap status, search analytics (date/page/query),
// and URL Inspection results for a sample of pages.
//
// Usage (bash):
//   GSC_CREDENTIALS_PATH="/path/to/xxx.json" node scripts/gsc-audit.mjs
//
// Credentials are read from the environment only — never commit the key file.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const CRED_PATH = process.env.GSC_CREDENTIALS_PATH;
if (!CRED_PATH) {
  console.error('Set GSC_CREDENTIALS_PATH to the service-account JSON path.');
  process.exit(1);
}

const cred = JSON.parse(fs.readFileSync(CRED_PATH, 'utf8'));
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const TOKEN_URI = cred.token_uri || 'https://oauth2.googleapis.com/token';

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      iss: cred.client_email,
      scope: SCOPES.join(' '),
      aud: TOKEN_URI,
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), cred.private_key).toString('base64url');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) {
    console.error('Token error:', JSON.stringify(json));
    process.exit(1);
  }
  return json.access_token;
}

async function gsc(token, url, options = {}) {
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    console.error(`API error ${res.status} for ${url}:`, typeof json === 'string' ? json.slice(0, 500) : JSON.stringify(json).slice(0, 500));
  }
  return { status: res.status, json };
}

function dateStr(offsetDays) {
  const d = new Date(Date.now() - offsetDays * 86400000);
  return d.toISOString().split('T')[0];
}

const OUT_DIR = process.env.GSC_OUT_DIR || '.freebuff/gsc-audit';
const SAMPLE_URLS = [
  '/',
  '/wordle-answer-today',
  '/spotle-answer-today',
  '/quordle-answer-today',
  '/colordle-answer-today',
  '/canuckle-answer-today',
  '/5-letter-wordle-solver',
  '/quordle-solver',
  '/wordle-analyzer',
  '/today',
  '/archive',
  '/guides',
  '/solver',
  '/about',
  '/contact',
  '/wordle-answer-archive',
  '/loldle-answer-today',
];

async function main() {
  const token = await getAccessToken();
  console.log('Auth OK — token acquired.\n');

  const { json: sites } = await gsc(token, 'https://searchconsole.googleapis.com/webmasters/v3/sites');
  const siteList = (sites.siteEntry || []).map((s) => s.siteUrl);
  console.log('Verified sites:', siteList.length ? siteList.join(', ') : '(none)');
  if (!siteList.length) {
    console.error('No verified properties found for this service account.');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'sites.json'), JSON.stringify(sites, null, 2));

  const preferred = process.env.GSC_SITE_URL || 'https://wordsolverx.com/';
  const site = siteList.find((s) => s.includes('wordsolverx.com')) || siteList[0];
  if (!siteList.includes(preferred) && !site) {
    console.error('wordsolverx.com not found among verified sites:', siteList.join(', '));
    process.exit(1);
  }
  const enc = encodeURIComponent(site);
  console.log(`\nUsing property: ${site}\n`);

  // 1) Sitemaps
  const { json: sitemaps } = await gsc(token, `https://searchconsole.googleapis.com/webmasters/v3/sites/${enc}/sitemaps`);
  const sitemapRows = (sitemaps.sitemap || []).map((s) => ({
    path: s.path,
    lastSubmitted: s.lastSubmitted,
    isPending: s.isPending,
    isSitemapsIndex: s.isSitemapsIndex,
    lastDownloaded: s.lastDownloaded,
    errors: s.errors,
    warnings: s.warnings,
    contents: s.contents,
  }));
  console.log('SITEMAPS:');
  sitemapRows.forEach((s) => console.log(`  ${s.path} | errors=${s.errors} warnings=${s.warnings} submitted=${s.lastSubmitted}`));
  fs.writeFileSync(path.join(OUT_DIR, 'sitemaps.json'), JSON.stringify(sitemapRows, null, 2));

  // 2) Search analytics — daily trend (last ~270 days)
  const saBase = `https://searchconsole.googleapis.com/webmasters/v3/sites/${enc}/searchAnalytics/query`;
  const trend = await gsc(token, saBase, {
    method: 'POST',
    body: { startDate: dateStr(270), endDate: dateStr(0), dimensions: ['date'], rowLimit: 1000 },
  });
  const trendRows = (trend.json.rows || []).map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
  console.log(`\nSEARCH ANALYTICS (${trendRows.length} days of data):`);
  // print a coarse monthly rollup to spot the drop
  const byMonth = {};
  for (const r of trendRows) {
    const m = r.date.slice(0, 7);
    byMonth[m] = byMonth[m] || { clicks: 0, impressions: 0 };
    byMonth[m].clicks += r.clicks;
    byMonth[m].impressions += r.impressions;
  }
  Object.keys(byMonth).sort().forEach((m) => {
    console.log(`  ${m}: impressions=${Math.round(byMonth[m].impressions)} clicks=${Math.round(byMonth[m].clicks)}`);
  });
  fs.writeFileSync(path.join(OUT_DIR, 'trend.json'), JSON.stringify(trendRows, null, 2));

  // 3) Pages report (last 270 days) — which URLs ever got impressions
  const pages = await gsc(token, saBase, {
    method: 'POST',
    body: { startDate: dateStr(270), endDate: dateStr(0), dimensions: ['page'], rowLimit: 25000 },
  });
  const pageRows = (pages.json.rows || []).map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position }));
  pageRows.sort((a, b) => b.impressions - a.impressions);
  console.log(`\nPAGES WITH IMPRESSIONS (${pageRows.length} total, top 25 by impressions):`);
  pageRows.slice(0, 25).forEach((r) => console.log(`  ${Math.round(r.impressions).toString().padStart(7)} imp ${Math.round(r.clicks).toString().padStart(5)} clk ${r.position.toFixed(1).padStart(5)} avg-pos ${r.page}`));
  fs.writeFileSync(path.join(OUT_DIR, 'pages.json'), JSON.stringify(pageRows, null, 2));

  // 4) Queries report (last 90 days)
  const queries = await gsc(token, saBase, {
    method: 'POST',
    body: { startDate: dateStr(90), endDate: dateStr(0), dimensions: ['query'], rowLimit: 1000 },
  });
  const queryRows = (queries.json.rows || []).map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr ?? (r.impressions ? r.clicks / r.impressions : 0), position: r.position }));
  queryRows.sort((a, b) => b.clicks - a.clicks);
  console.log(`\nTOP QUERIES (${queryRows.length} total, top 25 by clicks):`);
  queryRows.slice(0, 25).forEach((r) => console.log(`  ${Math.round(r.clicks).toString().padStart(5)} clk ${Math.round(r.impressions).toString().padStart(7)} imp ${(r.ctr * 100).toFixed(1).padStart(5)}% ctr ${r.position.toFixed(1).padStart(5)} pos "${r.query}"`));

  // Keyword opportunity: impressions without clicks (ranking but not winning).
  const opportunities = queryRows
    .filter((r) => r.impressions >= 100 && r.position <= 25)
    .map((r) => ({ ...r, potentialClicks: Math.round(r.impressions * (0.15 - r.ctr)) }))
    .sort((a, b) => b.potentialClicks - a.potentialClicks);
  console.log(`\nKEYWORD OPPORTUNITIES (impressions>=100, pos<=25, biggest click upside first):`);
  opportunities.slice(0, 30).forEach((r) =>
    console.log(
      `  ${Math.round(r.impressions).toString().padStart(7)} imp ${Math.round(r.clicks).toString().padStart(4)} clk ${(r.ctr * 100).toFixed(1).padStart(5)}% ctr ${r.position.toFixed(1).padStart(5)} pos +${String(r.potentialClicks).padStart(3)} upside "${r.query}"`
    )
  );

  // Near-miss: good position (2-6) but CTR far below the ~15% reference → title/meta/snippet problem.
  const nearMisses = queryRows
    .filter((r) => r.position >= 2 && r.position <= 6 && r.impressions >= 50 && r.ctr < 0.10)
    .sort((a, b) => b.impressions - a.impressions);
  console.log(`\nNEAR-MISS (pos 2-6 but CTR < 10% — fix titles/descriptions/featured snippets):`);
  nearMisses.slice(0, 20).forEach((r) =>
    console.log(
      `  ${Math.round(r.impressions).toString().padStart(7)} imp ${(r.ctr * 100).toFixed(1).padStart(5)}% ctr ${r.position.toFixed(1).padStart(5)} pos "${r.query}"`
    )
  );

  fs.writeFileSync(path.join(OUT_DIR, 'queries.json'), JSON.stringify(queryRows, null, 2));
  fs.writeFileSync(
    path.join(OUT_DIR, 'keyword-opportunities.json'),
    JSON.stringify({ opportunities, nearMisses }, null, 2)
  );

  // 5) URL Inspection for the sample
  console.log('\nURL INSPECTION:');
  const insp = [];
  for (const p of SAMPLE_URLS) {
    const url = p.startsWith('http') ? p : `https://wordsolverx.com${p}`;
    const { status, json: r } = await gsc(token, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      body: { inspectionUrl: url, siteUrl: site },
    });
    const ir = r && r.inspectionResult;
    const idx = ir && ir.indexStatusResult;
    const rich = ir && ir.richResultsResult;
    const verdict = idx ? idx.verdict : 'N/A';
    const coverage = idx ? idx.coverageState : 'N/A';
    const robots = idx ? idx.robotsTxtState : 'N/A';
    const lastCrawl = idx ? idx.lastCrawlTime : 'N/A';
    const canonical = idx ? idx.googleCanonical : 'N/A';
    const richVerdict = rich ? rich.verdict : 'N/A';
    const sitemapRef = ir && ir.sitemap ? (ir.sitemap.length ? ir.sitemap.join(',') : '-') : '-';
    console.log(`  ${status} ${p}\n      verdict=${verdict} | coverage=${coverage} | robots=${robots}\n      lastCrawl=${lastCrawl} | richResults=${richVerdict}\n      googleCanonical=${canonical}\n      sitemapRef=${sitemapRef}`);
    insp.push({
      page: p,
      apiStatus: status,
      verdict,
      coverage,
      robotsTxtState: robots,
      lastCrawlTime: lastCrawl,
      googleCanonical: canonical,
      richResults: richVerdict,
      sitemap: sitemapRef,
    });
    await new Promise((res) => setTimeout(res, 250)); // be gentle
  }
  fs.writeFileSync(path.join(OUT_DIR, 'inspection.json'), JSON.stringify(insp, null, 2));

  console.log(`\nRaw outputs written to ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
