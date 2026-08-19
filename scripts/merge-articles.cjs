// Merge rewritten entries from tmp-rewrites/output/ into registry.ts, with validation.
// Usage: node scripts/merge-articles.cjs [key1 key2 ...]   (no args = merge all outputs)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const regPath = path.join(root, 'src/lib/content/registry.ts');
const outDir = path.join(root, 'tmp-rewrites/output');
let src = fs.readFileSync(regPath, 'utf8');

const BANNED = [
  /this guide covers/i, /this article covers/i, /in this guide/i, /let's dive/i,
  /whether you're a beginner or/i, /it's important to note/i, /the key takeaway/i,
  /look no further/i, /elevate your/i, /take your .+ to the next level/i,
  /a comprehensive guide/i, /everything you need to know/i, /in conclusion/i,
  /at the end of the day/i, /the good news is/i, /the bottom line/i, /game-changer/i,
  /treasure trove/i, /delve into/i, /\bunlock/i, /seamless/i, /\brobust\b/i, /\bmyriad\b/i,
  /testament to/i, /in the world of/i, /when it comes to/i, /happy solving/i,
  /separates .+ from /i,
];

function entryBounds(src, key) {
  const re = new RegExp(`^  '${key}': \\{$`, 'm');
  const m = re.exec(src);
  if (!m) return null;
  const start = m.index;
  const lineEnd = src.indexOf('\n', start) + 1;
  const next = /^  '[a-z0-9-]+': \{$/m;
  next.lastIndex = lineEnd;
  const nm = next.exec(src.slice(lineEnd));
  const end = nm ? lineEnd + nm.index : src.lastIndexOf('};');
  return { start, lineEnd, end };
}

function wordCount(body) {
  const text = body.replace(/['"`]/g, ' ').replace(/[{}:,]/g, ' ');
  return (text.match(/[A-Za-z0-9']+/g) || []).length;
}
function varsOf(body) {
  return new Set((body.match(/\{[a-zA-Z][a-zA-Z0-9]*\}/g) || []));
}
function headingsOf(body) {
  return [...body.matchAll(/heading: '([^']+)'/g)].map((x) => x[1].toLowerCase())
    .concat([...body.matchAll(/heading: "([^"]+)"/g)].map((x) => x[1].toLowerCase()));
}

const args = process.argv.slice(2);
let files = fs.readdirSync(outDir).filter((f) => f.endsWith('.ts'));
if (args.length) files = files.filter((f) => args.includes(path.basename(f, '.ts')));

const errors = [];
const merged = [];

// Pre-collect existing headings across registry for uniqueness check
const allHeadings = new Map();
{
  const keyRe = /^  '([a-z0-9-]+)': \{$/gm;
  const ks = [];
  let m;
  while ((m = keyRe.exec(src))) ks.push({ key: m[1], idx: m.index });
  for (let i = 0; i < ks.length; i++) {
    const end = i + 1 < ks.length ? ks[i + 1].idx : src.lastIndexOf('};');
    for (const h of headingsOf(src.slice(ks[i].idx, end))) {
      if (!allHeadings.has(h)) allHeadings.set(h, ks[i].key);
    }
  }
}

for (const f of files) {
  const key = path.basename(f, '.ts');
  const body = fs.readFileSync(path.join(outDir, f), 'utf8').trimEnd();
  const orig = entryBounds(src, key);
  if (!orig) { errors.push(`${key}: entry not found in registry`); continue; }

  // validations against the ORIGINAL entry currently in src
  const origBody = src.slice(orig.lineEnd, orig.end);
  const wc = wordCount(body);
  if (wc < 1500) errors.push(`${key}: word count ${wc} < 1500`);
  for (const b of BANNED) {
    const hit = body.match(b);
    if (hit) errors.push(`${key}: banned phrase "${hit[0]}"`);
  }
  const fp = (body.match(/\b(I|I'm|I've|I'll|my|me)\b/g) || []).length;
  if (fp < 8) errors.push(`${key}: first-person density too low (${fp})`);
  const ov = varsOf(origBody), nv = varsOf(body);
  for (const v of ov) if (!nv.has(v)) errors.push(`${key}: lost template variable ${v}`);
  for (const v of nv) if (!ov.has(v)) errors.push(`${key}: invented template variable ${v}`);
  for (const h of headingsOf(body)) {
    const owner = allHeadings.get(h);
    if (owner && owner !== key) errors.push(`${key}: heading not unique (also in ${owner}): ${h}`);
  }
  // basic TS shape: must end with top-level close and have faqs + relatedLinks
  if (!/relatedLinks:\s*\[/.test(body)) errors.push(`${key}: missing relatedLinks`);
  if (!/faqs:\s*\[/.test(body)) errors.push(`${key}: missing faqs`);
  if (!/^  \},?$/.test(body.split('\n').pop())) errors.push(`${key}: entry does not end with "  }," `);

  if (errors.length === 0) {
    const replacement = `  '${key}': {\n${body.replace(/,\s*$/, ',')}\n`;
    src = src.slice(0, orig.start) + replacement + src.slice(orig.end);
    // register new headings so later files in this run are checked against them
    for (const h of headingsOf(body)) allHeadings.set(h, key);
    merged.push(key);
    console.log(`OK  ${key}  (${wc} words, ${fp} first-person)`);
  } else {
    console.log(`FAIL ${key}`);
  }
}

if (errors.length) {
  console.log('\n=== ERRORS ===');
  for (const e of errors) console.log('  ' + e);
  process.exit(1);
}
if (merged.length) {
  fs.writeFileSync(regPath, src);
  console.log(`\nmerged ${merged.length} entries into registry.ts`);
} else {
  console.log('\nnothing merged');
}
