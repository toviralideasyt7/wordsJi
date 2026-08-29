// Final short pass for the last six variant articles.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const sections = {
  'spotle-wordle-solver': {
    heading: 'One page, two dailies, no waiting',
    paragraphs: [
      'The practical payoff of the merged page is that a single bookmark covers both daily puzzles. When the Spotle Wordle answer is eluding you and the Thirdle sprint is already running, you switch modes on the same page, log both games\u2019 clues, and get ranked suggestions for each without navigating anywhere.',
      'That convenience is the reason the page exists, and it is also the reason the solver\u2019s dual-mode design matters: two games, two dictionaries, two budgets, one consistent elimination engine under the hood.'
    ]
  },
  'canuckle-solver': {
    heading: 'Why Canuckle players keep the solver open',
    paragraphs: [
      'The daily fact makes Canuckle feel personal, and the solver lets you enjoy it without the frustration of a stuck board. Players keep the page open, play the word honestly, and only reach for the solver when the brown tiles pile up.',
      'When they do, the Canadian list guarantees the suggestions are real answers, the archive support covers any past puzzle, and the six-guess budget almost always closes the daily. That combination — respect for the game, honesty of the list, and speed of the solve — is why the solver is a fixture for Canuckle regulars.'
    ]
  },
  'hardle-solver': {
    heading: 'The reward for playing Hardle carefully',
    paragraphs: [
      'Hardle\u2019s swapped colors feel like an attack on your confidence, but the game is scrupulously fair: gray never lies, the words are common, and every clue is decodable with enough cross-checking. Players who embrace the skeptical method find that Hardle sharpens their whole word-game toolkit.',
      'The solver exists to make that method fast. It holds every reading, probes the contested letters, and never lets a swapped clue hide the truth — which is exactly the assurance a careful Hardle player wants.'
    ]
  },
  'woodle-solver': {
    heading: 'Why Woodle rewards arithmetic players',
    paragraphs: [
      'Woodle strips away the colors and leaves the math, and players who enjoy that trade find the game quietly elegant: every clue is a clean two-number constraint, and the answer is whatever word satisfies all of them. There is no luck in Woodle, only overlap arithmetic.',
      'The solver runs that arithmetic across the whole dictionary in an instant, which is why it lands most dailies inside eight guesses. And the habit it teaches — reading counts as constraints — makes every other word game feel easier.'
    ]
  },
  'w-peaks-solver': {
    heading: 'The search, not the vocabulary',
    paragraphs: [
      'Wordle Peaks is the rare word game that tests search skill instead of vocabulary. The answer words are ordinary; the challenge is the five simultaneous binary searches, and players who treat it as an arithmetic problem rather than a spelling test win consistently.',
      'That is the solver\u2019s whole approach: five windows, midpoint probes, dictionary intersection. It is the purest expression of the search mindset on the site, and the daily is usually over by guess four.'
    ]
  },
  'dordle-solver': {
    heading: 'Why Dordle is the perfect bridge game',
    paragraphs: [
      'Dordle sits exactly between Wordle and the multi-board monsters: one extra board, one extra guess, and the shared-guess mechanic that makes it interesting without being overwhelming. Players who master the two-board discipline find Quordle and Octordle far less intimidating afterward.',
      'The solver bridges the same gap — it teaches the combined-value ranking that the bigger games need, on a scale where you can actually follow what it is doing. Learn Dordle with the solver and the eight-board game stops being a wall.'
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
