// Final short section for the 6 new archive articles.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const sections = {
  'worgle-archive': {
    heading: 'Getting the most from the Worgle archive',
    paragraphs: [
      'The Worgle archive rewards the player who treats it as a reference, not a spoiler. Use it to settle arguments, verify streaks, and study the game\u2019s habits — and let the daily puzzle stay a puzzle.',
      'Bookmark the archive, check it when a word surprises you, and over a few weeks the patterns will sink in: the word families, the difficulty curve, the shape of the game. That is the archive\u2019s real value — not an answer sheet, but a way to understand the game better.'
    ]
  },
  'worldle-archive': {
    heading: 'Getting the most from the Worldle archive',
    paragraphs: [
      'The Worldle archive rewards the player who treats it as a reference, not a spoiler. Use it to settle arguments, verify streaks, and study the game\u2019s geography — and let the daily puzzle stay a puzzle.',
      'Bookmark the archive, check it when a silhouette surprises you, and over a few weeks the patterns will sink in: the continent rotation, the recognizable shapes, the rhythm of the game. That is the archive\u2019s real value — not an answer sheet, but a way to know the map better.'
    ]
  },
  'searchle-archive': {
    heading: 'Getting the most from the Searchle archive',
    paragraphs: [
      'The Searchle archive rewards the player who treats it as a reference, not a spoiler. Use it to settle arguments, verify streaks, and study the game\u2019s query habits — and let the daily puzzle stay a puzzle.',
      'Bookmark the archive, check it when a query surprises you, and over a few weeks the patterns will sink in: the topic rotation, the phrasing style, the rhythm of the game. That is the archive\u2019s real value — not an answer sheet, but a way to think like the game.'
    ]
  },
  'colorfle-archive': {
    heading: 'Getting the most from the Colorfle archive',
    paragraphs: [
      'The Colorfle archive rewards the player who treats it as a reference, not a spoiler. Use it to settle arguments, verify streaks, and study the game\u2019s color habits — and let the daily puzzle stay a puzzle.',
      'Bookmark the archive, check it when a shade surprises you, and over a few weeks the patterns will sink in: the hue rotation, the near-miss days, the rhythm of the game. That is the archive\u2019s real value — not an answer sheet, but a way to see color better.'
    ]
  },
  'countryle-archive': {
    heading: 'Getting the most from the Countryle archive',
    paragraphs: [
      'The Countryle archive rewards the player who treats it as a reference, not a spoiler. Use it to settle arguments, verify streaks, and study the game\u2019s geography — and let the daily puzzle stay a puzzle.',
      'Bookmark the archive, check it when a country surprises you, and over a few weeks the patterns will sink in: the region rotation, the border logic, the rhythm of the game. That is the archive\u2019s real value — not an answer sheet, but a way to know the map better.'
    ]
  },
  'framed-archive': {
    heading: 'Getting the most from the Framed archive',
    paragraphs: [
      'The Framed archive rewards the player who treats it as a reference, not a spoiler. Use it to settle arguments, verify streaks, and study the game\u2019s film habits — and let the daily puzzle stay a puzzle.',
      'Bookmark the archive, check it when a movie surprises you, and over a few weeks the patterns will sink in: the era rotation, the genre mix, the rhythm of the game. That is the archive\u2019s real value — not an answer sheet, but a way to know film better.'
    ]
  }
};

let changed = 0;
let skipped = [];
for (const [key, sec] of Object.entries(sections)) {
  const start = src.indexOf("  '" + key + "': {");
  if (start === -1) { skipped.push(key + ' (not found)'); continue; }
  const end = src.indexOf('\n  },', start);
  const block = src.slice(start, end === -1 ? src.length : end);
  if (block.includes(sec.heading)) { skipped.push(key + ' (heading exists)'); continue; }
  const anchor = '\n    ],\n    faqHeading:';
  const ai = block.indexOf(anchor);
  if (ai === -1) { skipped.push(key + ' (no faqHeading anchor)'); continue; }
  const sectionObj = ',\n      {\n        heading: ' + JSON.stringify(sec.heading) + ',\n        paragraphs: ' + JSON.stringify(sec.paragraphs) + '\n      }';
  const newBlock = block.slice(0, ai) + sectionObj + anchor + block.slice(ai + anchor.length);
  src = src.slice(0, start) + newBlock + src.slice(start + block.length);
  changed++;
}

fs.writeFileSync(file, src);
console.log('changed:', changed, 'skipped:', skipped.length);
for (const s of skipped) console.log(' -', s);
