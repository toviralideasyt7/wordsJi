// One-off cleanup: remove the SEO article/content block (prose + FAQ + CTA)
// that follows the solver tool on each standalone solver page. Keeps hero + tool + AuthorCard.
// Run: node scripts/remove-solver-articles.mjs

import fs from 'node:fs';

const WRAPPER = '<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">';

const pages = [
  ['src/routes/(interactive)/squaredle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/light-out-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/kanoodle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/minesweeper-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/weaver-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/phoodle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/spotle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/word-ladder-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/worldle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/waffle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/countryle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/betweenle-solver/+page.svelte', '<section class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">'],
  ['src/routes/(interactive)/hangman-solver/+page.svelte', '<article class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">'],
  ['src/routes/(interactive)/boggle-solver/+page.svelte', '<article class="mt-10 space-y-10 max-w-5xl mx-auto">'],
  ['src/routes/(interactive)/nerdle-solver/+page.svelte', '<article class="space-y-10">'],
  ['src/routes/(interactive)/wordle-analyzer/+page.svelte', '<article class="space-y-10">'],
  ['src/routes/(interactive)/searchle-solver/+page.svelte', '<section class="mt-12 space-y-10">'],
  ['src/routes/(interactive)/colordle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/colorfle-solver/+page.svelte', WRAPPER],
  ['src/routes/(interactive)/soundmap-solver/+page.svelte', '<div class="max-w-6xl mx-auto px-4 pb-12">']
];

const TAG_RE = /<(\/?)(div|section|article)\b[^>]*>/g;

function removeBalancedBlock(html, marker) {
  const start = html.lastIndexOf(marker);
  if (start === -1) return { ok: false, reason: 'marker not found' };
  if (html.indexOf(marker) !== start && html.lastIndexOf(marker) !== start) {
    // multiple occurrences — require the LAST one (content block follows the tool)
  }
  TAG_RE.lastIndex = start;
  let depth = 0;
  let end = -1;
  let m;
  while ((m = TAG_RE.exec(html))) {
    if (m[1] === '/') {
      depth -= 1;
      if (depth === 0) {
        end = m.index + m[0].length;
        break;
      }
    } else {
      depth += 1;
    }
  }
  if (end === -1) return { ok: false, reason: 'block not closed' };
  return { ok: true, html: html.slice(0, start) + html.slice(end) };
}

let changed = 0;
for (const [file, marker] of pages) {
  const original = fs.readFileSync(file, 'utf8');
  const result = removeBalancedBlock(original, marker);
  if (!result.ok) {
    console.log(`SKIP ${file} -> ${result.reason}`);
    continue;
  }
  fs.writeFileSync(file, result.html);
  const removedLines = original.split('\n').length - result.html.split('\n').length;
  console.log(`OK   ${file} (-${removedLines} lines)`);
  changed += 1;
}
console.log(`\n${changed}/${pages.length} pages updated.`);
