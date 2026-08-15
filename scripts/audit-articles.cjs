// Audit: which route pages should render a registry article but don't?
const fs = require('fs');
const path = require('path');

const reg = fs.readFileSync('src/lib/content/registry.ts', 'utf8');
const keys = [...reg.matchAll(/^  '([^']+)': \{/gm)].map(m => m[1]);

function walk(d) {
  const out = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name === '+page.svelte') out.push(p);
  }
  return out;
}
const pages = walk('src/routes').sort();

const check = (file) => {
  const t = fs.readFileSync(file, 'utf8');
  return {
    direct: /ARTICLE_CONTENT|StaticArticle/.test(t),
    wordlebot: /WordlebotPage/.test(t),
    calendar: /ArchiveCalendar/.test(t),
    gamedle: /GameDleAnswerPage/.test(t)
  };
};

const expected = (p) => {
  const base = path.basename(path.dirname(p));
  const slug = base.replace(/\[[^\]]*\]/g, '').replace(/^-+|-+$/g, '');
  if (base.includes('letter-wordle-solver')) return 'wordle-solver (length pages)';
  if (base === '[variant=wordlebotVariant]-solver') return 'variant-solvers';
  if (keys.includes(slug)) return slug;
  return null;
};

let missing = [];
let ok = [];
for (const p of pages) {
  const exp = expected(p);
  if (!exp) continue;
  const { direct, wordlebot, calendar, gamedle } = check(p);
  let renders;
  let note = '';
  if (direct) { renders = true; }
  else if (exp === 'variant-solvers' && wordlebot) { renders = true; note = '(via WordlebotPage else-branch)'; }
  else if (gamedle) { renders = true; note = '(via GameDleAnswerPage seoContent)'; }
  else if (wordlebot) { renders = false; note = '(WordlebotPage length/canuckle branch: NO article)'; }
  else if (calendar) { renders = false; note = '(ArchiveCalendar: NO article)'; }
  else { renders = false; note = '(no article anywhere)'; }

  if (renders) ok.push(p + '  ' + note);
  else if (calendar) ok.push(p + '  (via ArchiveCalendar StaticArticle)');
  else missing.push(p + '  => expects ' + exp + '  ' + note);
}

console.log('=== PAGES WITH ARTICLES (' + ok.length + ') ===');
console.log('=== MISSING ARTICLES (' + missing.length + ') ===');
for (const m of missing) console.log('MISSING ' + m);
