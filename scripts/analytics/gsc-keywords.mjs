// GSC keyword-opportunity puller.
// Reads the service account from GSC_CREDENTIALS_PATH, pulls 90 days of query
// analytics for wordsolverx.com, and flags the keywords with impressions but
// weak CTR (the "huge potential" list), plus near-miss queries sitting at
// position 2-6 that should convert.
//
// Usage:
//   GSC_CREDENTIALS_PATH="/path/xxx.json" node scripts/gsc-keywords.mjs

import fs from 'node:fs';
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
  const signature = crypto
    .sign('RSA-SHA256', Buffer.from(unsigned), cred.private_key)
    .toString('base64url');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const json = await res.json();
  if (!json.access_token) {
    console.error('Token error:', JSON.stringify(json));
    process.exit(1);
  }
  return json.access_token;
}

function dateStr(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Pick the verified property for wordsolverx.com.
  const siteListRes = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', { headers });
  const siteListJson = await siteListRes.json();
  const siteList = (siteListJson.siteEntry || []).map((s) => s.siteUrl);
  const site = siteList.find((s) => s.includes('wordsolverx.com')) || siteList[0];
  if (!site) {
    console.error('No verified GSC properties found:', JSON.stringify(siteListJson));
    process.exit(1);
  }
  console.log(`Using property: ${site}`);

  // Query analytics, last 90 days, 1000 rows.
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ startDate: dateStr(90), endDate: dateStr(0), dimensions: ['query'], rowLimit: 1000 }),
  });
  const json = await res.json();
  if (!json.rows) {
    console.error('No rows returned:', JSON.stringify(json));
    process.exit(1);
  }

  const rows = json.rows.map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr ?? (r.impressions ? r.clicks / r.impressions : 0),
    position: r.position,
  }));

  // Normalize queries: strip "answer today", "solver", "hint", etc. so we can
  // see which GAME keywords drive the most volume.
  const byGame = new Map();
  for (const r of rows) {
    const q = r.query.toLowerCase();
    let game = null;
    for (const g of ['wordle', 'quordle', 'nerdle', 'spotle', 'worldle', 'globle', 'countryle', 'colordle', 'colorfle', 'phoodle', 'phrazle', 'semantle', 'contexto', 'searchle', 'waffle', 'canuckle', 'worgle', 'framed', 'loldle', 'dotadle', 'narutodle', 'pokedle', 'smashdle', 'onepiecedle', 'squaredle', 'hangman', 'boggle', 'word ladder', 'weaver', 'minesweeper', 'kanoodle', 'betweenle']) {
      if (q.includes(g)) {
        game = g;
        break;
      }
    }
    const key = game ?? 'other';
    const agg = byGame.get(key) || { game: key, clicks: 0, impressions: 0, queries: 0 };
    agg.clicks += r.clicks;
    agg.impressions += r.impressions;
    agg.queries += 1;
    byGame.set(key, agg);
  }
  const games = [...byGame.values()].sort((a, b) => b.impressions - a.impressions);

  console.log(`\nTOTAL QUERIES: ${rows.length} | 90-day totals:`);
  console.log(
    `  impressions=${rows.reduce((s, r) => s + r.impressions, 0).toLocaleString()} clicks=${rows.reduce((s, r) => s + r.clicks, 0).toLocaleString()}`
  );

  console.log('\nVOLUME BY GAME (impressions descending):');
  games.forEach((g) =>
    console.log(
      `  ${String(Math.round(g.impressions)).padStart(7)} imp ${String(Math.round(g.clicks)).padStart(5)} clk ${(g.ctr = g.clicks / g.impressions * 100).toFixed(1)}% ctr  ${g.game} (${g.queries} queries)`
    )
  );

  console.log('\nKEYWORD OPPORTUNITIES — impressions but weak CTR (top 40 by click upside):');
  const opportunities = rows
    .filter((r) => r.impressions >= 80 && r.position <= 25)
    .map((r) => ({ ...r, upside: Math.round(r.impressions * (0.15 - r.ctr)) }))
    .sort((a, b) => b.upside - a.upside);
  opportunities.slice(0, 40).forEach((r) =>
    console.log(
      `  ${String(Math.round(r.impressions)).padStart(6)} imp ${String(Math.round(r.clicks)).padStart(4)} clk ${(r.ctr * 100).toFixed(1).padStart(5)}% ctr ${r.position.toFixed(1).padStart(5)} pos  +${r.upside} upside  "${r.query}"`
    )
  );

  console.log('\nNEAR-MISS — position 2-6 but CTR < 10% (title/description/snippet fixes):');
  rows
    .filter((r) => r.position >= 2 && r.position <= 6 && r.impressions >= 50 && r.ctr < 0.1)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .forEach((r) =>
      console.log(
        `  ${String(Math.round(r.impressions)).padStart(6)} imp ${(r.ctr * 100).toFixed(1).padStart(5)}% ctr ${r.position.toFixed(1).padStart(5)} pos  "${r.query}"`
      )
    );

  fs.writeFileSync('artifacts/gsc-keywords.json', JSON.stringify({ rows, opportunities, games }, null, 2));
  console.log('\nSaved artifacts/gsc-keywords.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
