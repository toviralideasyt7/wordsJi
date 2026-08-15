// Top up archive articles to 1500+ words.
// Run with: node scripts/topup-archives.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const SECTIONS = {
  'wordle-analyzer': {
    heading: "The strategy the analyzer grades you on",
    paragraphs: [
      "The analyzer's scoring is built on the same information logic that powers the best Wordle openers. A great first guess covers the most common letters — two or three vowels plus R, S, T, N — because that guess returns the most informative feedback no matter what the answer is. The analyzer rewards openers that cut the candidate list hard, and it shows you when your opener underperformed.",
      "The midgame is where most grades leak. After the opener, every guess should add a new letter to your picture, keep confirmed greens locked, and relocate yellows — and the analyzer flags each move that fails to do all three at once. Players who think they are playing well discover that two or three midgame moves were quietly wasted.",
      "The endgame is the grade's final exam. With the pool down to a handful of words, the analyzer checks whether you guessed from the candidate list or from habit — and players who guess the same word every time they reach a pattern get the same penalty every time. Reading the flagged endgame moves once fixes the habit for good.",
      "The beauty of the analyzer is that it turns these abstract principles into concrete, per-move feedback. You do not need to study information theory — you need to read one report and see exactly which of your moves wasted information."
    ]
  },
  'waffle-archive': {
    heading: "Waffle archive searches, answered",
    paragraphs: [
      "Players search for the Waffle archive in several distinct ways, and this page answers all of them. 'Waffle game archive' and 'Waffle archive' are the general searches — the complete history, answered by the full list below. 'Waffle word game archive' narrows to the word-game format, and 'today's Waffle answers' points at the daily page this archive feeds.",
      "The date-specific searches are the second family: 'waffle answer for a specific date', 'waffle June 23 answer', and the past-puzzle queries all resolve to a calendar click on this page. The calendar is the fastest way to answer any dated Waffle question.",
      "The word-specific searches are the third family: players who remember a word from an old grid and want to find the puzzle that used it. The archive's word search answers that instantly, finding every grid that contained a particular five-letter word.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Waffle answer resource."
    ]
  },
  'quordle-archive': {
    heading: "Quordle archive searches, answered",
    paragraphs: [
      "The 'Quordle archive' search is the game's most-searched archive query, and this page is built to answer it completely: the full history of daily four-answer puzzles, organized by date and searchable by date or word.",
      "The second search family is the date-specific query — 'quordle answer for a date', 'todays quordle answer' — which resolves to the calendar and the daily page this archive feeds. Every dated question has a one-click answer here.",
      "The third family is the answer-specific query: players who remember a word from an old four-board puzzle and want to find the day it appeared. The archive's word search answers that instantly.",
      "Each search intent is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Quordle answer record."
    ]
  },
  'spotle-archive': {
    heading: "Spotle archive searches, answered",
    paragraphs: [
      "Spotle players search for the archive in several distinct ways, and this page answers all of them. 'Spotle archive' is the general search — the complete artist history, answered by the list below. 'Spotle movies archive' is the movie-mode search, covered here too, since the archive includes both modes.",
      "The date-specific searches are the second family: 'spotle answer for a date', 'spotle answer June 9', and the past-artist queries all resolve to a calendar click on this page.",
      "The artist-specific searches are the third family: players who remember a musician from an old puzzle and want to find the day they appeared. The archive's name search answers that instantly.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Spotle answer resource."
    ]
  },
  'semantle-archive': {
    heading: "Semantle archive searches, answered",
    paragraphs: [
      "Semantle players search for the archive in several distinct ways, and this page answers all of them. 'Semantle archive' is the general search — the complete word history, answered by the list below. 'Semantle answer' and 'Semantle answer today' point to the daily pages this archive feeds.",
      "The date-specific searches are the second family: 'semantle answer for a date', 'semantle May 16 answer', and the numbered-puzzle queries — 'semantle 1466' — all resolve to a calendar click or a word search on this page.",
      "The word-specific searches are the third family: players who remember a word from an old puzzle and want to find the day it appeared. The archive's word search answers that instantly.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Semantle answer resource."
    ]
  },
  'colordle-archive': {
    heading: "Colordle archive searches, answered",
    paragraphs: [
      "Colordle players search for the archive in several distinct ways, and this page answers all of them. 'Colordle archive' is the general search — the complete color history, answered by the list below. 'Colordle answer' and 'Colordle answer today' point to the daily pages this archive feeds.",
      "The day-number searches are the second family, and they are uniquely Colordle: 'colordle day 1441 answer', 'colordle hint 1455', and the numbered-puzzle queries all resolve to the archive's day-number cross-reference.",
      "The date-specific searches are the third family: 'colordle answer for a date', 'colordle 2/22/2026 answer', and the past-color queries all resolve to a calendar click on this page.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the day-number search — and together they make the archive the complete Colordle answer resource."
    ]
  },
  'phoodle-archive': {
    heading: "Phoodle archive searches, answered",
    paragraphs: [
      "Phoodle players search for the archive in several distinct ways, and this page answers all of them. 'Phoodle archive' is the general search — the complete food-word history, answered by the list below. 'Phoodle answer today' and 'phoodle hint today' point to the daily pages this archive feeds.",
      "The date-specific searches are the second family: 'phoodle answer for a date', 'phoodle hint June 17', 'phoodle mar 15 2026' — all resolve to a calendar click on this page.",
      "The word-specific searches are the third family: players who remember a food word from an old puzzle and want to find the day it appeared. The archive's word search answers that instantly.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Phoodle answer resource."
    ]
  },
  'phrazle-archive': {
    heading: "Phrazle archive searches, answered",
    paragraphs: [
      "Phrazle players search for the archive in several distinct ways, and this page answers all of them. 'Phrazle archive' is the general search — the complete phrase history, answered by the list below. 'Phrazle answer today' and 'phrazle hint today' point to the daily pages this archive feeds.",
      "The date-specific searches are the second family: 'phrazle answer for a date', 'phrazle answer June 18', and the past-phrase queries all resolve to a calendar click on this page.",
      "The phrase-specific searches are the third family: players who remember a saying from an old puzzle and want to find the day it appeared. The archive's phrase search answers that instantly.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Phrazle answer resource."
    ]
  },
  'nerdle-archive': {
    heading: "Nerdle archive searches, answered",
    paragraphs: [
      "Nerdle players search for the archive in several distinct ways, and this page answers all of them. 'Nerdle archive' is the general search — the complete equation history, answered by the list below. 'Nerdle answer today' and 'nerdle today' point to the daily pages this archive feeds.",
      "The date-specific searches are the second family: 'nerdle answer for a date', 'nerdle June 26 answer', and the past-equation queries all resolve to a calendar click on this page.",
      "The equation-specific searches are the third family: players who remember an equation from an old puzzle and want to find the day it appeared. The archive's equation search answers that instantly.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Nerdle answer resource."
    ]
  },
  'contexto-archive': {
    heading: "Contexto archive searches, answered",
    paragraphs: [
      "Contexto players search for the archive in several distinct ways, and this page answers all of them. 'Contexto archive' is the general search — the complete word history, answered by the list below. 'Contexto answer' and 'Contexto answer today' point to the daily pages this archive feeds.",
      "The date-specific searches are the second family: 'contexto answer for a date', 'contexto answer May 28', and the past-word queries all resolve to a calendar click on this page.",
      "The word-specific searches are the third family: players who remember a word from an old puzzle and want to find the day it appeared. The archive's word search answers that instantly.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Contexto answer resource."
    ]
  },
  'globle-archive': {
    heading: "Globle archive searches, answered",
    paragraphs: [
      "Globle players search for the archive in several distinct ways, and this page answers all of them. 'Globle archive' is the general search — the complete country history, answered by the list below. 'Globle answer today' and 'today's globle answer' point to the daily pages this archive feeds.",
      "The date-specific searches are the second family: 'globle answer for a date', 'what is todays globle', and the past-country queries all resolve to a calendar click on this page.",
      "The country-specific searches are the third family: players who remember a nation from an old puzzle and want to find the day it appeared. The archive's country search answers that instantly.",
      "Each of these search intents is served by a different part of this page — the list, the calendar, the search box — and together they make the archive the complete Globle answer resource."
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
