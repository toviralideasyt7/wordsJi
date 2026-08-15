// Final top-up: one large unique section per new archive article.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const sections = {
  'worgle-archive': {
    heading: 'The Worgle archive versus answer-tracker sites',
    paragraphs: [
      'Because Worgle publishes one word each day, answer-tracker sites, Discord bots, and daily-puzzle communities all maintain their own Worgle logs. The consistency of those records is worth understanding: the official daily answer is fixed at publication time, so every reputable tracker shows the same word for the same date.',
      'This archive is that same record, kept directly on the page and updated without the ads, popups, and redirects that riddle the third-party trackers. When a community thread asks what a past Worgle answer was, this page is the cleanest place to confirm it.',
      'The difference matters for players who cross-check multiple sources. Trackers occasionally lag a day or two, and a stale third-party page can show yesterday\u2019s answer where you expected today\u2019s. Because this archive is tied to the same daily cycle the game uses, its dates and answers stay aligned.',
      'For the streak-chaser, that reliability is everything. A wrong answer from a sketchy tracker costs a streak; a verified one protects it. The archive is built to be the source you trust, not the source you double-check.'
    ]
  },
  'worldle-archive': {
    heading: 'The Worldle archive versus answer-tracker sites',
    paragraphs: [
      'Because Worldle publishes one country each day, answer-tracker sites, Discord bots, and daily-puzzle communities all maintain their own Worldle logs. The consistency of those records is worth understanding: the official daily answer is fixed at publication time, so every reputable tracker shows the same country for the same date.',
      'This archive is that same record, kept directly on the page and updated without the ads, popups, and redirects that riddle the third-party trackers. When a community thread asks what a past Worldle country was, this page is the cleanest place to confirm it.',
      'The difference matters for players who cross-check multiple sources. Trackers occasionally lag a day or two, and a stale third-party page can show yesterday\u2019s territory where you expected today\u2019s. Because this archive is tied to the same daily cycle the game uses, its dates and answers stay aligned.',
      'For the streak-chaser, that reliability is everything. A wrong answer from a sketchy tracker costs a streak; a verified one protects it. The archive is built to be the source you trust, not the source you double-check.'
    ]
  },
  'searchle-archive': {
    heading: 'The Searchle archive versus answer-tracker sites',
    paragraphs: [
      'Because Searchle publishes one query each day, answer-tracker sites, Discord bots, and daily-puzzle communities all maintain their own Searchle logs. The consistency of those records is worth understanding: the official daily answer is fixed at publication time, so every reputable tracker shows the same query for the same date.',
      'This archive is that same record, kept directly on the page and updated without the ads, popups, and redirects that riddle the third-party trackers. When a community thread asks what a past Searchle query was, this page is the cleanest place to confirm it.',
      'The difference matters for players who cross-check multiple sources. Trackers occasionally lag a day or two, and a stale third-party page can show yesterday\u2019s query where you expected today\u2019s. Because this archive is tied to the same daily cycle the game uses, its dates and answers stay aligned.',
      'For the streak-chaser, that reliability is everything. A wrong answer from a sketchy tracker costs a streak; a verified one protects it. The archive is built to be the source you trust, not the source you double-check.'
    ]
  },
  'colorfle-archive': {
    heading: 'The Colorfle archive versus answer-tracker sites',
    paragraphs: [
      'Because Colorfle publishes one color each day, answer-tracker sites, Discord bots, and daily-puzzle communities all maintain their own Colorfle logs. The consistency of those records is worth understanding: the official daily answer is fixed at publication time, so every reputable tracker shows the same color for the same date.',
      'This archive is that same record, kept directly on the page and updated without the ads, popups, and redirects that riddle the third-party trackers. When a community thread asks what a past Colorfle color was, this page is the cleanest place to confirm it — with the exact hex value, not a fuzzy description.',
      'The difference matters for players who cross-check multiple sources. Trackers occasionally lag a day or two, and a stale third-party page can show yesterday\u2019s shade where you expected today\u2019s. Because this archive is tied to the same daily cycle the game uses, its dates and answers stay aligned.',
      'For the streak-chaser, that reliability is everything. A wrong answer from a sketchy tracker costs a streak; a verified one protects it. The archive is built to be the source you trust, not the source you double-check.'
    ]
  },
  'countryle-archive': {
    heading: 'The Countryle archive versus answer-tracker sites',
    paragraphs: [
      'Because Countryle publishes one country each day, answer-tracker sites, Discord bots, and daily-puzzle communities all maintain their own Countryle logs. The consistency of those records is worth understanding: the official daily answer is fixed at publication time, so every reputable tracker shows the same country for the same date.',
      'This archive is that same record, kept directly on the page and updated without the ads, popups, and redirects that riddle the third-party trackers. When a community thread asks what a past Countryle country was, this page is the cleanest place to confirm it.',
      'The difference matters for players who cross-check multiple sources. Trackers occasionally lag a day or two, and a stale third-party page can show yesterday\u2019s nation where you expected today\u2019s. Because this archive is tied to the same daily cycle the game uses, its dates and answers stay aligned.',
      'For the streak-chaser, that reliability is everything. A wrong answer from a sketchy tracker costs a streak; a verified one protects it. The archive is built to be the source you trust, not the source you double-check.'
    ]
  },
  'framed-archive': {
    heading: 'The Framed archive versus answer-tracker sites',
    paragraphs: [
      'Because Framed publishes one movie each day, answer-tracker sites, Discord bots, and daily-puzzle communities all maintain their own Framed logs. The consistency of those records is worth understanding: the official daily answer is fixed at publication time, so every reputable tracker shows the same film for the same date.',
      'This archive is that same record, kept directly on the page and updated without the ads, popups, and redirects that riddle the third-party trackers. When a community thread asks what a past Framed movie was, this page is the cleanest place to confirm it — with the year and director, not just the title.',
      'The difference matters for players who cross-check multiple sources. Trackers occasionally lag a day or two, and a stale third-party page can show yesterday\u2019s film where you expected today\u2019s. Because this archive is tied to the same daily cycle the game uses, its dates and answers stay aligned.',
      'For the streak-chaser, that reliability is everything. A wrong answer from a sketchy tracker costs a streak; a verified one protects it. The archive is built to be the source you trust, not the source you double-check.'
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
