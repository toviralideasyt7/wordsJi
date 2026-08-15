// Top-up for the 10 wordlebot variant solver articles.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const sections = {
  'octordle-solver': {
    heading: 'Octordle answers, archives, and the daily grid',
    paragraphs: [
      'Octordle publishes one new set of eight words every day, and the community tracks those answer sets the way Wordle players track their own daily word. Knowing a past Octordle answer set is mostly bragging rights, but the pattern data is genuinely useful: the game reuses common five-letter words across days, and the answer habits show up in the archive.',
      'The solver itself is date-agnostic — it will filter the eight boards for any puzzle, today or past. What the daily cadence changes is your preparation: the same opener works every day, because high-frequency letters never stop being high-frequency.',
      'That is the real Octordle edge. The answers change daily, but the letter math does not, and the solver is built entirely on the letter math.'
    ]
  },
  'dordle-solver': {
    heading: 'Dordle answers, dailies, and the two-word record',
    paragraphs: [
      'Dordle releases one two-word puzzle per day, and its answer pairs are a small but revealing dataset: the two words rarely share letters, which is exactly what a good pair looks like from the game designer\u2019s side — two words that force you to sweep a wide letter set.',
      'The solver handles any daily or past Dordle position the same way: maintain both boards, filter both lists, and rank the shared guesses. The daily cadence only changes which words are in play, never the arithmetic.',
      'Players who track the daily answers build a feel for the pairings the game favors, which makes their opening guesses slightly sharper — and the solver keeps the process honest by always suggesting the highest-value shared guess.'
    ]
  },
  'xordle-solver': {
    heading: 'Xordle answers and the two-word merge in practice',
    paragraphs: [
      'Every Xordle puzzle hides two five-letter words, and the daily answers show the game\u2019s taste: pairs of common words that share few letters, so the merged feedback stays readable. The solver\u2019s two candidate lists mirror exactly that structure.',
      'What makes Xordle answers interesting to study is the pair logic — the game picks words that are independently common but collectively distinctive, which is why the merge never collapses into an unreadable mess.',
      'Whether you are solving today\u2019s puzzle or replaying an archived one, the solver applies the same decoding: enumerate every split of the merged tiles, keep both lists consistent, and rank the next guess by how cleanly it would split the survivors.'
    ]
  },
  'fibble-solver': {
    heading: 'Fibble answers and the daily lie, tracked',
    paragraphs: [
      'Each Fibble puzzle is a five-letter word plus its daily lie pattern, and the community\u2019s answer logs make an interesting study: the lie placement is random, but the answers themselves skew toward the common end of the dictionary — the game wants you to beat the deception, not the vocabulary.',
      'That answer bias is a quiet advantage for the solver. Because the candidate pool is mostly common words, the consistency check converges faster than it would on an obscure list.',
      'For players, the takeaway is to trust the solver\u2019s surviving-candidate list and not to overthink the lie. One tile per clue is wrong, everything else is honest, and the consistent reading always wins.'
    ]
  },
  'warmle-solver': {
    heading: 'Warmle answers and the alphabet\u2019s daily walk',
    paragraphs: [
      'Warmle answers are ordinary five-letter words, but the game\u2019s feedback makes them feel like a different species: every clue is a set of five alphabetic distances rather than a set of letter verdicts. Studying past answers reveals why the game works — most five-letter words sit comfortably in the mid-alphabet, so the warmth mechanic stays meaningful all game.',
      'The solver\u2019s per-position windows are exactly the tool the daily game rewards. Each new Warmle puzzle is a fresh walk through the alphabet, and the solver walks it faster than any human can.',
      'Keep the distance threshold matched to the game and the solver will land most dailies inside the six-guess budget, with the answer usually appearing on its ranked list two or three turns before you would have found it by hand.'
    ]
  },
  'hardle-solver': {
    heading: 'Hardle answers and the swapped-clue dailies',
    paragraphs: [
      'Every Hardle puzzle is a five-letter word whose clues are occasionally swapped, and the daily answers show the game\u2019s fairness: the words themselves are common, so the difficulty comes entirely from the unreliable feedback rather than obscure vocabulary.',
      'That design choice is good news for the solver. A common-word pool means the two-readings filter stays tight, and the surviving candidates converge quickly once you have two or three clues logged.',
      'It is also the right way to think about Hardle as a player: the answer is never the hard part, the interpretation is. Trust the grays, probe the colored tiles, and let the solver hold every reading until the evidence settles it.'
    ]
  },
  'woodle-solver': {
    heading: 'Woodle answers and the count-only daily grind',
    paragraphs: [
      'Woodle answers are common five-letter words, but with count-only feedback every daily puzzle turns into an arithmetic exercise. The game\u2019s choice of common answers is deliberate: obscure words would make the count pair almost unreadable, while common words keep the overlap math meaningful.',
      'The solver turns the grind into a routine: log each guess and its two numbers, watch the candidate count drop, and let the ranking pick the next probe. Most dailies resolve inside the eight-guess budget with room to spare.',
      'The discipline the game teaches carries over to every other wordle variant — once you have learned to think in terms of what the numbers imply, colored tiles feel like luxury.'
    ]
  },
  'w-peaks-solver': {
    heading: 'Wordle Peaks answers and the daily descent',
    paragraphs: [
      'Wordle Peaks answers are five-letter words, but the game\u2019s directional feedback makes each daily puzzle a descent from the full alphabet to a single word. The daily answers tend to be ordinary words — the game\u2019s difficulty is in the search, not the vocabulary.',
      'The solver\u2019s window tracking is built for exactly this daily rhythm: five windows, one per position, collapsing with every probe. Enter today\u2019s clues and the remaining-window readout shows you how close the answer is.',
      'Players who follow the midpoint rule by hand usually land the daily in five or six guesses. With the solver, the same puzzle typically resolves in four — the window math simply runs faster.'
    ]
  },
  'spotle-wordle-solver': {
    heading: 'Spotle Wordle and Thirdle answers, both modes daily',
    paragraphs: [
      'Spotle Wordle releases a five-letter daily, and Thirdle releases its own three-letter sprint — two puzzles, two budgets, one solver page. The daily answers in both games stick to common words, which keeps the feedback readable and the games fair.',
      'The dual-mode page means a single bookmark covers both dailies: use Spotle Wordle mode for the five-letter puzzle with its four verdicts, then switch to Thirdle mode for the three-guess sprint.',
      'It is the rare solver page that genuinely covers two games, and the reason it works is that both games share the same elimination engine — the dictionaries and budgets differ, the logic does not.'
    ]
  },
  'canuckle-solver': {
    heading: 'Canuckle answers, archives, and the daily fact',
    paragraphs: [
      'Canuckle publishes one Canadian word per day, and its archive is a record of the country in five-letter increments — hockey terms, place names, foods, and the everyday vocabulary of Canadian English. The daily fact that comes with each puzzle is the flavor that keeps players coming back.',
      'The solver works on any of these puzzles, today or archived, because it filters the same Canadian word list the game uses. The brown tiles ban letters, the yellow tiles relocate them, and the green tiles lock them.',
      'Whether you play for the word or the fact, the solver keeps your streak alive — log the clues, read the ranked list, and take the daily Canadian win.'
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
