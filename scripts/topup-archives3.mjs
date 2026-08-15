// Top-up pass 3: third section for archive articles.
// Run with: node scripts/topup-archives3.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const SECTIONS = {
  'waffle-archive': {
    heading: "Waffle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Waffle, then check the archive for yesterday's grid and replay it — the contrast between today's fresh solve and yesterday's cold replay is the fastest pattern-recognition training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for the current grid. Players who keep both in their daily rotation never lose track of the sequence, and the archive's chronological list makes the connection obvious — every day slots into the record.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old grid contained, the archived entry is the ground truth, with all six words recorded for the date in question.",
      "Finally, use the search box for vocabulary study. Type a letter combination like 'QU' and see every archived grid that used it — the results show you which rare-letter words the game actually favors, and that knowledge reshapes your guessing."
    ]
  },
  'quordle-archive': {
    heading: "Quordle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Quordle, then check the archive for yesterday's four answers and replay them — the contrast between today's fresh solve and yesterday's cold replay is the fastest multi-board training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's four answers. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's answers were, the archived entry is the ground truth, with all four words recorded for the date.",
      "Finally, use the search box for coverage study. Type a word and see every day that used it — the results show you how answers repeat and share letters across days, and that knowledge reshapes your multi-board guessing."
    ]
  },
  'spotle-archive': {
    heading: "Spotle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Spotle, then check the archive for yesterday's artist and replay the attribute logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest artist-knowledge training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's artist. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's artist was, the archived entry is the ground truth, with the artist recorded for the date.",
      "Finally, use the search box for era study. Type a decade and see every archived artist from that era — the results show you which eras the game favors, and that knowledge lets you pre-load the right era before the first clue lands."
    ]
  },
  'semantle-archive': {
    heading: "Semantle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Semantle, then check the archive for yesterday's word and replay the similarity logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest semantic training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's word. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's word was, the archived entry is the ground truth.",
      "Finally, use the search box for category study. Type a word and see the archived days that used it or its neighbors — the results show you the semantic neighborhoods the game favors, and that knowledge reshapes your guessing."
    ]
  },
  'colordle-archive': {
    heading: "Colordle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Colordle, then check the archive for yesterday's color and replay the component logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest palette training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's color. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's color was, the archived entry is the ground truth, with the exact hex recorded.",
      "Finally, use the day-number search for community-style queries. Type a day number and see the exact puzzle and color it refers to — the results make the 'colordle day 1441 answer' searches work directly."
    ]
  },
  'phoodle-archive': {
    heading: "Phoodle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Phoodle, then check the archive for yesterday's food word and replay the food-lane logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest vocabulary training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's word. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's word was, the archived entry is the ground truth.",
      "Finally, use the search box for category study. Type a food word and see every archived day that used it — the results show you which lanes the game favors, and that knowledge reshapes your guessing."
    ]
  },
  'phrazle-archive': {
    heading: "Phrazle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Phrazle, then check the archive for yesterday's phrase and replay the word-by-word logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest phrase training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's phrase. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's phrase was, the archived entry is the ground truth.",
      "Finally, use the search box for structure study. Type a phrase and see every archived day that used it — the results show you the phrase families the game favors, and that knowledge reshapes your guessing."
    ]
  },
  'nerdle-archive': {
    heading: "Nerdle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Nerdle, then check the archive for yesterday's equation and replay the feedback logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest equation training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's equation. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's equation was, the archived entry is the ground truth.",
      "Finally, use the search box for structure study. Type an equation and see every archived day that used it — the results show you the equation forms the game favors, and that knowledge reshapes your guessing."
    ]
  },
  'contexto-archive': {
    heading: "Contexto archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Contexto, then check the archive for yesterday's word and replay the ranking logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest semantic training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's word. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's word was, the archived entry is the ground truth.",
      "Finally, use the search box for domain study. Type a word and see the archived days that used it — the results show you the semantic domains the game favors, and that knowledge reshapes your guessing."
    ]
  },
  'globle-archive': {
    heading: "Globle archive tips and the daily connection",
    paragraphs: [
      "The fastest way to use the archive is to pair it with the daily game. Solve today's Globle, then check the archive for yesterday's country and replay the color-map logic — the contrast between today's fresh solve and yesterday's cold replay is the fastest geography training the game offers.",
      "Bookmark both pages: the archive for history, the daily page for today's country. Players who keep both in their daily rotation never lose track of the sequence.",
      "The archive is also the dispute-settler. When the group cannot agree on what an old day's country was, the archived entry is the ground truth.",
      "Finally, use the search box for continent study. Type a country and see every archived day that used it — the results show you which continents the game favors, and that knowledge lets you pre-load the right region before the first guess lands."
    ]
  },
};

let src = await readFile(registryPath, 'utf8');

let count = 0;
for (const [key, section] of Object.entries(SECTIONS)) {
  const needle = `'${key}': {\n    key: '${key}'`;
  const start = src.indexOf(needle);
  if (start === -1) { console.log(`MISS ${key}`); continue; }
  if (src.includes(section.heading)) { console.log(`SKIP ${key}: already topped up`); continue; }
  const faqIdx = src.indexOf('faqHeading:', start);
  if (faqIdx === -1) { console.log(`NO FAQ ${key}`); continue; }
  const closeIdx = src.lastIndexOf('    ],', faqIdx);
  if (closeIdx === -1 || closeIdx < start) { console.log(`NO CLOSE ${key}`); continue; }

  const block = `      {\n        heading: ${JSON.stringify(section.heading)},\n        paragraphs: [\n${section.paragraphs.map((p) => `          ${JSON.stringify(p)}`).join(',\n')}\n        ]\n      }`;

  const next = src.slice(0, closeIdx) + block + ',\n' + src.slice(closeIdx);
  src = next;
  await writeFile(registryPath, next);
  count++;
  console.log(`TOPUP ${key}`);
}
console.log(`Total: ${count}`);
