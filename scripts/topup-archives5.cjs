// Top-up: two large unique sections per new archive article.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const sections = {
  'worgle-archive': [
    {
      heading: 'The daily cadence and what the archive reveals about it',
      paragraphs: [
        'Worgle releases one new word every day, and the daily cadence is exactly what makes the archive valuable. A single daily puzzle is a moment in time; a year of archived answers is a dataset. Scrolling the archive in date order shows you how the game builds difficulty over time, which letter patterns it cycles through, and how often it revisits familiar word families.',
        'The cadence also matters for players who track streaks. Because the archive records every date and its answer, you can reconstruct any past streak, verify a disputed solve, or simply relive the day you nailed a notoriously hard answer.',
        'The rhythm of the game is visible in the data too: hard words cluster, easy words follow, and the archive shows the pattern clearly enough that regular players start to anticipate the difficulty curve.'
      ]
    },
    {
      heading: 'Searching the archive like a pro',
      paragraphs: [
        'The archive is built around two searches: by date and by word. The date search is for the daily player — load a specific day, confirm the answer, move on. The word search is for the pattern hunter — type any five-letter word and see every day it appeared, which reveals the game\u2019s favorites at a glance.',
        'Combining the two is where the archive becomes a study tool. Search a word, note the dates it appeared, cross-reference the answers around those dates, and you start to see the selection logic the game uses.',
        'The list view is the third way in: chronological order, everything, no filters. For players who want the whole history in one scroll, it is the fastest way to absorb the game\u2019s personality.'
      ]
    }
  ],
  'worldle-archive': [
    {
      heading: 'The daily cadence and what the archive reveals about it',
      paragraphs: [
        'Worldle releases one new country every day, and the daily cadence is exactly what makes the archive valuable. A single daily puzzle is a moment in time; a year of archived answers is a geography dataset. Scrolling the archive in date order shows you how the game rotates continents, which countries it favors, and how it times its hard silhouette days.',
        'The cadence also matters for players who track streaks. Because the archive records every date and its country, you can reconstruct any past streak, verify a disputed solve, or revisit the day a tiny island nation broke your run.',
        'The rhythm of the game is visible in the data too: recognizable shapes cluster, obscure territories follow, and the archive shows the pattern clearly enough that regular players start to anticipate which continent is due next.'
      ]
    },
    {
      heading: 'Searching the archive like a pro',
      paragraphs: [
        'The archive is built around two searches: by date and by country. The date search is for the daily player — load a specific day, confirm the country, move on. The country search is for the geography hunter — type any nation and see every day it appeared, which reveals the game\u2019s rotation at a glance.',
        'Combining the two is where the archive becomes a study tool. Search a country, note the dates it appeared, cross-reference the answers around those dates, and you start to see the regional logic the game uses.',
        'The list view is the third way in: chronological order, everything, no filters. For players who want the whole history in one scroll, it is the fastest way to absorb the game\u2019s geographic personality.'
      ]
    }
  ],
  'searchle-archive': [
    {
      heading: 'The daily cadence and what the archive reveals about it',
      paragraphs: [
        'Searchle releases one new mystery query every day, and the daily cadence is exactly what makes the archive valuable. A single daily puzzle is a moment in time; a year of archived queries is a dataset of how the game thinks about search. Scrolling the archive in date order shows you the topic rotation, the phrasing habits, and how the game varies difficulty.',
        'The cadence also matters for players who track streaks. Because the archive records every date and its query, you can reconstruct any past streak, verify a disputed solve, or revisit the day a hyper-specific query stopped you cold.',
        'The rhythm of the game is visible in the data too: broad famous queries cluster, obscure ones follow, and the archive shows the pattern clearly enough that regular players start to anticipate what the next topic will be.'
      ]
    },
    {
      heading: 'Searching the archive like a pro',
      paragraphs: [
        'The archive is built around two searches: by date and by phrase. The date search is for the daily player — load a specific day, confirm the query, move on. The phrase search is for the search-thinking hunter — type any phrase and see every day it appeared, which reveals the game\u2019s favorite topics at a glance.',
        'Combining the two is where the archive becomes a study tool. Search a phrase, note the dates it appeared, cross-reference the answers around those dates, and you start to see the topical logic the game uses.',
        'The list view is the third way in: chronological order, everything, no filters. For players who want the whole history in one scroll, it is the fastest way to absorb the game\u2019s search-thinking personality.'
      ]
    }
  ],
  'colorfle-archive': [
    {
      heading: 'The daily cadence and what the archive reveals about it',
      paragraphs: [
        'Colorfle releases one new color every day, and the daily cadence is exactly what makes the archive valuable. A single daily puzzle is a moment in time; a year of archived targets is a dataset of color selection. Scrolling the archive in date order shows you the hue rotation, the saturation preferences, and how the game times its subtle near-miss days.',
        'The cadence also matters for players who track streaks. Because the archive records every date and its hex value, you can reconstruct any past streak, verify a disputed solve, or revisit the day an almost-impossible shade broke your run.',
        'The rhythm of the game is visible in the data too: bold familiar colors cluster, subtle shades follow, and the archive shows the pattern clearly enough that regular players start to anticipate the next hue family.'
      ]
    },
    {
      heading: 'Searching the archive like a pro',
      paragraphs: [
        'The archive is built around three searches: by date, by name, and by hex value. The date search is for the daily player — load a specific day, confirm the color, move on. The name and hex searches are for the color hunter — look up any shade and see every day it appeared.',
        'Combining the searches is where the archive becomes a study tool. Look up a hex, note the dates it appeared, cross-reference the answers around those dates, and you start to see the wheel logic the game uses.',
        'The list view is the third way in: chronological order, everything, no filters. For players who want the whole history in one scroll, it is the fastest way to absorb the game\u2019s color personality.'
      ]
    }
  ],
  'countryle-archive': [
    {
      heading: 'The daily cadence and what the archive reveals about it',
      paragraphs: [
        'Countryle releases one new country every day, and the daily cadence is exactly what makes the archive valuable. A single daily puzzle is a moment in time; a year of archived answers is a geography dataset. Scrolling the archive in date order shows you the region rotation, the border logic, and how the game times its obscure-nation days.',
        'The cadence also matters for players who track streaks. Because the archive records every date and its country, you can reconstruct any past streak, verify a disputed solve, or revisit the day a tiny landlocked nation stopped you cold.',
        'The rhythm of the game is visible in the data too: familiar countries cluster, obscure ones follow, and the archive shows the pattern clearly enough that regular players start to anticipate which region is due next.'
      ]
    },
    {
      heading: 'Searching the archive like a pro',
      paragraphs: [
        'The archive is built around two searches: by date and by country. The date search is for the daily player — load a specific day, confirm the country, move on. The country search is for the geography hunter — type any nation and see every day it appeared, which reveals the game\u2019s rotation at a glance.',
        'Combining the two is where the archive becomes a study tool. Search a country, note the dates it appeared, cross-reference the answers around those dates, and you start to see the regional logic the game uses.',
        'The list view is the third way in: chronological order, everything, no filters. For players who want the whole history in one scroll, it is the fastest way to absorb the game\u2019s geographic personality.'
      ]
    }
  ],
  'framed-archive': [
    {
      heading: 'The daily cadence and what the archive reveals about it',
      paragraphs: [
        'Framed releases one new movie every day, and the daily cadence is exactly what makes the archive valuable. A single daily puzzle is a moment in time; a year of archived answers is a film-history dataset. Scrolling the archive in date order shows you the era rotation, the genre mix, and how the game times its obscure-cult-classic days.',
        'The cadence also matters for players who track streaks. Because the archive records every date and its movie, you can reconstruct any past streak, verify a disputed solve, or revisit the day a barely-seen indie stopped you cold.',
        'The rhythm of the game is visible in the data too: recognizable blockbusters cluster, deep cuts follow, and the archive shows the pattern clearly enough that regular players start to anticipate the next era.'
      ]
    },
    {
      heading: 'Searching the archive like a pro',
      paragraphs: [
        'The archive is built around three searches: by date, by title, and by year. The date search is for the daily player — load a specific day, confirm the movie, move on. The title and year searches are for the film hunter — look up any movie or era and see every day it appeared.',
        'Combining the searches is where the archive becomes a study tool. Look up a director, note the dates their films appeared, cross-reference the answers around those dates, and you start to see the selection logic the game uses.',
        'The list view is the third way in: chronological order, everything, no filters. For players who want the whole history in one scroll, it is the fastest way to absorb the game\u2019s film personality.'
      ]
    }
  ]
};

let changed = 0;
let skipped = [];
for (const [key, secs] of Object.entries(sections)) {
  const start = src.indexOf("  '" + key + "': {");
  if (start === -1) { skipped.push(key + ' (not found)'); continue; }
  let end = src.indexOf('\n  },', start);
  const block = src.slice(start, end === -1 ? src.length : end);
  if (block.includes(secs[0].heading) && block.includes(secs[1].heading)) { skipped.push(key + ' (exists)'); continue; }
  const anchor = '\n    ],\n    faqHeading:';
  const ai = block.indexOf(anchor);
  if (ai === -1) { skipped.push(key + ' (no faqHeading anchor)'); continue; }
  const objs = secs.map((s) => '{\n        heading: ' + JSON.stringify(s.heading) + ',\n        paragraphs: ' + JSON.stringify(s.paragraphs) + '\n      }').join(',\n      ');
  const sectionObj = ',\n      ' + objs;
  let newBlock = block.slice(0, ai) + sectionObj + anchor + block.slice(ai + anchor.length);
  src = src.slice(0, start) + newBlock + src.slice(start + block.length);
  changed++;
}

fs.writeFileSync(file, src);
console.log('changed:', changed, 'skipped:', skipped.length);
for (const s of skipped) console.log(' -', s);
