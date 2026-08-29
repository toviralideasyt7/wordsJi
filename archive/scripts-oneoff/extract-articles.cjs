// Extract each registry article entry to tmp-rewrites/input/<key>.ts for rewriting.
// Usage: node scripts/extract-articles.cjs
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/lib/content/registry.ts'), 'utf8');

const keyRe = /^  '([a-z0-9-]+)': \{$/gm;
const keys = [];
let m;
while ((m = keyRe.exec(src))) keys.push({ key: m[1], idx: m.index, lineEnd: src.indexOf('\n', m.index) + 1 });

if (keys.length === 0) throw new Error('no entries found');

const inDir = path.join(root, 'tmp-rewrites/input');
fs.mkdirSync(inDir, { recursive: true });

for (let i = 0; i < keys.length; i++) {
  const start = keys[i].lineEnd;
  const end = i + 1 < keys.length ? keys[i + 1].idx : src.lastIndexOf('};');
  const body = src.slice(start, end).trimEnd(); // without trailing comma? keep as-is minus final newline
  // body currently ends like "  }," or "  }" — keep exactly
  fs.writeFileSync(path.join(inDir, `${keys[i].key}.ts`), body + '\n');
}
console.log(`extracted ${keys.length} entries to tmp-rewrites/input/`);
