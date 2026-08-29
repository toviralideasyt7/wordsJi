// Audit registry articles for AI-pattern phrases, sameness, and word counts.
// Usage: node scripts/audit-human-voice.cjs
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../src/lib/content/registry.ts'), 'utf8');

// crude but effective: split on top-level keys
const entries = {};
const keyRe = /^\s{2}'([a-z0-9-]+)': \{$/gm;
let m;
const keys = [];
while ((m = keyRe.exec(src))) keys.push({ key: m[1], idx: m.index });
for (let i = 0; i < keys.length; i++) {
  const start = keys[i].idx;
  const end = i + 1 < keys.length ? keys[i + 1].idx : src.length;
  entries[keys[i].key] = src.slice(start, end);
}

const AI_PATTERNS = [
  /this guide covers/i,
  /this article covers/i,
  /in this guide/i,
  /let's dive/i,
  /whether you're a beginner or/i,
  /it's important to note/i,
  /the key takeaway/i,
  /separates .+ from /i,
  /look no further/i,
  /elevate your/i,
  /take your .+ to the next level/i,
  /a comprehensive guide/i,
  /everything you need to know/i,
  /in conclusion/i,
  /at the end of the day/i,
  /the good news is/i,
  /the bottom line/i,
  /game-changer/i,
  /treasure trove/i,
  /delve into/i,
  /unlock/i,
  /seamless/i,
  /robust/i,
  /myriad/i,
  /testament to/i,
  /in the world of/i,
  /when it comes to/i,
  /one thing's for sure/i,
  /happy solving/i,
  /keep on solving/i,
];

const results = [];
for (const [key, body] of Object.entries(entries)) {
  const headings = [...body.matchAll(/heading: '([^']+)'/g)].map((x) => x[1]);
  const headings2 = [...body.matchAll(/heading: "([^"]+)"/g)].map((x) => x[1]);
  const allHeadings = [...headings, ...headings2];
  // word count: strip code, count words in string literals
  const text = body.replace(/['"`]/g, ' ').replace(/[{}:,]/g, ' ');
  const words = (text.match(/[A-Za-z0-9']+/g) || []).length;
  const flags = [];
  for (const p of AI_PATTERNS) {
    const hits = (body.match(new RegExp(p.source, 'gi')) || []).length;
    if (hits) flags.push(`${p.source.replace(/\\/g, '')} x${hits}`);
  }
  // first-person count
  const firstPerson = (body.match(/\b(I|I'm|I've|my|me|we|our)\b/g) || []).length;
  results.push({ key, words, sections: allHeadings.length, headings: allHeadings, flags, firstPerson });
}

// heading frequency across articles (sameness detector)
const headingCount = {};
for (const r of results) for (const h of r.headings) {
  const norm = h.replace(/\{[^}]+\}/g, 'X').toLowerCase();
  headingCount[norm] = (headingCount[norm] || 0) + 1;
}
const shared = Object.entries(headingCount).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);

console.log(`=== ${results.length} articles ===\n`);
console.log('--- Word counts (sorted) ---');
for (const r of [...results].sort((a, b) => a.words - b.words)) {
  console.log(`${String(r.words).padStart(6)}  sections:${String(r.sections).padStart(2)}  1st-person:${String(r.firstPerson).padStart(3)}  ${r.key}${r.flags.length ? '  FLAGS: ' + r.flags.join(' | ') : ''}`);
}
console.log('\n--- Headings used by more than one article (sameness) ---');
for (const [h, c] of shared) console.log(`${c}x  ${h}`);
console.log(`\nTotal shared-heading patterns: ${shared.length}`);
const flagged = results.filter((r) => r.flags.length);
console.log(`\nArticles with AI-pattern flags: ${flagged.length}/${results.length}`);
