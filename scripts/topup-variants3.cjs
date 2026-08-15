// Final pass: short unique section per remaining under-1500 variant article.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const sections = {
  'hardle-solver': {
    heading: 'Hardle solver settings and word lengths',
    paragraphs: [
      'The Hardle solver supports the same word lengths the game uses, and it applies the two-reading filter to every length the same way. Whether the daily Hardle is a five-letter puzzle or one of the longer variants, the mechanics do not change: grays are honest, greens and yellows are negotiable, and the candidate filter tolerates one swapped reading per clue.',
      'If you are replaying an archived Hardle puzzle, the solver works on any date — enter the guesses and clues exactly as the game showed them, and the two-reading filter rebuilds the candidate set from scratch. The length setting only changes which dictionary loads, not the logic.'
    ]
  },
  'woodle-solver': {
    heading: 'Woodle solver settings and word lengths',
    paragraphs: [
      'The Woodle solver accepts the exact-and-misplaced count pair for every guess and applies the same arithmetic to every word length the game supports. Longer words change the numbers, not the method: the overlap math and the exact count still filter the dictionary precisely.',
      'For archived puzzles, the solver works on any date — log each guess and its two numbers, and the candidate counter shows the field shrinking turn by turn. The count-pair discipline is identical whether you are playing today\u2019s daily or a puzzle from months ago.'
    ]
  },
  'w-peaks-solver': {
    heading: 'Wordle Peaks solver settings and word lengths',
    paragraphs: [
      'The Wordle Peaks solver tracks the alphabet window for every position at every word length the game supports. Longer words mean more windows to track, but each one still halves with every midpoint probe, so the solver\u2019s six-guess math scales naturally.',
      'For past puzzles, the solver works on any date — enter the earlier-or-later verdicts you saw, and the window tracker rebuilds the search state from scratch. The midpoint rule that wins the daily is the same rule that wins every archived puzzle.'
    ]
  },
  'spotle-wordle-solver': {
    heading: 'Spotle Wordle and Thirdle solver settings',
    paragraphs: [
      'The solver\u2019s mode selector is the one setting that matters: Spotle Wordle mode loads the five-letter dictionary with the four-verdict system, and Thirdle mode loads the three-letter dictionary with the three-guess budget. Switching modes does not reset your entered guesses, so you can experiment without losing your place.',
      'Both modes work on any puzzle date, because the elimination engine is date-agnostic. Whether you are chasing today\u2019s five-letter daily or a past three-letter Thirdle, the ranked suggestions are always computed from the guesses you have actually entered.'
    ]
  },
  'canuckle-solver': {
    heading: 'Canuckle solver settings and word lengths',
    paragraphs: [
      'Canuckle uses five-letter words only, so the solver always loads the full five-letter Canadian list and does not need a length switcher. That single-list design keeps the suggestions fast and always legal.',
      'The solver works on any Canuckle position, today or archived. Enter your guesses, tap the tiles to match the brown, yellow, and green you saw, and the Canadian-list filter rebuilds the candidate set instantly — the same process that wins today\u2019s daily wins every puzzle in the archive.'
    ]
  },
  'dordle-solver': {
    heading: 'Dordle solver settings and word lengths',
    paragraphs: [
      'The Dordle solver supports the same word lengths the game uses, and the double-board filter scales to each one: two candidate lists, filtered in parallel, ranked by combined value. A longer Dordle changes the word pool, not the arithmetic.',
      'For archived puzzles, the solver works on any date — log each board\u2019s feedback as you saw it and the two lists stay perfectly separate. The seven-guess discipline that wins the daily is identical for every puzzle in the archive.'
    ]
  },
  'xordle-solver': {
    heading: 'Xordle solver settings and word lengths',
    paragraphs: [
      'The Xordle solver supports every word length the game uses, and the merge-decoding logic scales to each one: every merged tile is enumerated into its possible splits, and both hidden-word lists are filtered against all of them.',
      'For past puzzles, the solver works on any date — enter the merged feedback exactly as shown, and the two candidate lists rebuild from scratch. The nine-guess budget is the same for every puzzle, and the decode-first discipline that wins the daily never changes.'
    ]
  },
  'fibble-solver': {
    heading: 'Fibble solver settings and word lengths',
    paragraphs: [
      'The Fibble solver supports the word lengths the game uses, and the lie-tolerance filter scales to each one: a candidate survives a clue if it contradicts at most one tile of it, at any length.',
      'For archived puzzles, the solver works on any date — log each clue and the one-lie filter rebuilds the candidate set exactly as it does for today\u2019s daily. The nine-guess probing discipline is identical whether the puzzle is fresh or months old.'
    ]
  },
  'warmle-solver': {
    heading: 'Warmle solver settings and word lengths',
    paragraphs: [
      'The Warmle solver exposes the distance threshold and supports every word length the game uses. The threshold must match the game\u2019s rule exactly, because every yellow-and-gray deduction flows from it; the length setting only changes which dictionary loads.',
      'For past puzzles, the solver works on any date — enter the clues with the correct threshold and the alphabet windows rebuild from scratch. The walk-the-alphabet strategy that wins the daily is the same for every archived puzzle.'
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
