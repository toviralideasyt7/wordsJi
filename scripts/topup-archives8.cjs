// Extend the closing paragraph of each new archive article.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const additions = {
  'worgle-archive': {
    needle: 'That is the archive\u2019s real value — not an answer sheet, but a way to understand the game better.',
    extra: ' Keep the daily puzzle honest: try it first, use the archive to learn, and let the history make you a sharper player rather than a faster spoiler-hunter.'
  },
  'worldle-archive': {
    needle: 'That is the archive\u2019s real value — not an answer sheet, but a way to know the map better.',
    extra: ' Keep the daily puzzle honest: try it first, use the archive to learn, and let the geography make you a sharper player rather than a faster spoiler-hunter.'
  },
  'searchle-archive': {
    needle: 'That is the archive\u2019s real value — not an answer sheet, but a way to think like the game.',
    extra: ' Keep the daily puzzle honest: try it first, use the archive to learn, and let the search-thinking make you a sharper player rather than a faster spoiler-hunter.'
  },
  'colorfle-archive': {
    needle: 'That is the archive\u2019s real value — not an answer sheet, but a way to see color better.',
    extra: ' Keep the daily puzzle honest: try it first, use the archive to learn, and let the color sense make you a sharper player rather than a faster spoiler-hunter.'
  },
  'countryle-archive': {
    needle: 'That is the archive\u2019s real value — not an answer sheet, but a way to know the map better.',
    extra: ' Keep the daily puzzle honest: try it first, use the archive to learn, and let the geography make you a sharper player rather than a faster spoiler-hunter.'
  },
  'framed-archive': {
    needle: 'That is the archive\u2019s real value — not an answer sheet, but a way to know film better.',
    extra: ' Keep the daily puzzle honest: try it first, use the archive to learn, and let the film knowledge make you a sharper player rather than a faster spoiler-hunter.'
  }
};

let changed = 0;
for (const [key, { needle, extra }] of Object.entries(additions)) {
  const i = src.indexOf("  '" + key + "': {");
  const j = src.indexOf('\n  },', i);
  const block = src.slice(i, j === -1 ? src.length : j);
  if (!block.includes(needle)) { console.log('needle NOT found', key); continue; }
  const nb = block.replace(needle, needle + extra);
  src = src.slice(0, i) + nb + src.slice(i + block.length);
  changed++;
}
fs.writeFileSync(file, src);
console.log('extended:', changed);
