// Second top-up: large unique section per variant article (~400 words each).
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

const sections = {
  'octordle-solver': {
    heading: 'Common Octordle mistakes and how to avoid them',
    paragraphs: [
      'The most common Octordle mistake is playing a narrow guess too early. A word that could only ever be the answer to one board is a luxury you cannot afford in the first half of the game, when all eight boards are still wide open. The solver\u2019s ranking punishes exactly this: narrow words score low while boards are unshaped, and only rise once the field has narrowed enough that their specificity is worth the cost.',
      'The second mistake is ignoring the pressure of the 13-guess budget until it is too late. Players who play the first six guesses as if they were playing Wordle often reach the halfway point with six boards still unresolved and only seven guesses left. The solver surfaces the pressure by showing the candidate count per board, so you can see the budget being spent in real time.',
      'The third mistake is refusing to pivot. When the solver\u2019s suggestions start converging on a single board, that is the signal to switch from horizontal sweeping to vertical finishing, and players who keep sweeping past that point burn guesses on boards that are already nearly solved. Learning to read the convergence is the difference between a comfortable Octordle win and a frustrating near-miss.',
      'Finally, do not open with the same word every single day if it stops working. Octordle answers are drawn from a shared pool of common five-letter words, and a salvo that covers high-frequency letters is never wrong, but a salvo you have memorized can bias your reading of the boards. Let the solver\u2019s ranked salvo guide the first three guesses and you will never open into a dead end.'
    ]
  },
  'dordle-solver': {
    heading: 'Common Dordle mistakes and how to avoid them',
    paragraphs: [
      'The classic Dordle mistake is solving one board first and then treating the second as a fresh Wordle. Once a board is solved, your guesses no longer earn double value, and a six-guess-per-board mindset burns the shared budget. The solver\u2019s combined scoring exists precisely to keep both boards in play for as long as possible.',
      'The second mistake is repeating letters across your opening words. Dordle rewards coverage, and two openers that share three letters cover barely more ground than one. The solver\u2019s opening suggestions are chosen to add new letters each turn, so the first three guesses give you the widest possible view of both answers.',
      'The third mistake is over-trusting a single board\u2019s feedback. A green letter on board one does nothing for board two, and players who mentally merge the two boards end up with candidates that cannot possibly be right. The solver keeps the boards strictly separate, and you should too.',
      'The winning pattern is disciplined: sweep with high-value openers, read both grids independently, and when the boards diverge, spend each guess where it earns the most — which the ranked suggestion list tells you at a glance.'
    ]
  },
  'xordle-solver': {
    heading: 'Common Xordle mistakes and how to avoid them',
    paragraphs: [
      'The most common Xordle mistake is reading the merged tile as if it belonged to a single word. A green tile in position three does not mean your letter is correct in your word — it means one of the two hidden words has that letter there, and the solver exists to keep both interpretations alive.',
      'The second mistake is ignoring gray tiles as a source of truth. Because gray is the only unambiguous verdict, it is the strongest evidence you have, and players who treat it as weakly as they treat ambiguous greens lose the game\u2019s one reliable anchor.',
      'The third mistake is guessing a word that is not a plausible answer to either hidden word. With nine guesses the budget feels generous, but every wasted probe costs you the resolution phase, when you actually need two or three turns to separate the final candidates.',
      'The solver keeps the two candidate lists visible as they converge, so you always know how much ambiguity is left. When both lists are down to a handful of words, spend your probes distinguishing them rather than discovering new letters — the discovery phase is over.'
    ]
  },
  'fibble-solver': {
    heading: 'Common Fibble mistakes and how to avoid them',
    paragraphs: [
      'The most common Fibble mistake is treating every clue as gospel. The whole point of the game is that one tile per clue is wrong, and players who commit to the literal reading of an early clue will find the answer eluding them all game. The solver never commits, and neither should you.',
      'The second mistake is wasting the nine-guess budget. Because the lies eat information, every guess must be a probe — a word that would clarify which reading is real. Guessing the first word that looks plausible is how streaks die in Fibble.',
      'The third mistake is ignoring the one-lie guarantee. Some players assume the game could lie any number of times and give up on deduction entirely, but the guarantee is what makes the puzzle solvable: every clue is one correction away from truth, and the solver\u2019s consistency check exploits exactly that.',
      'The winning pattern is procedural: log each clue, let the solver keep every candidate consistent with all-but-one-tile of every clue, probe the contested letters, and watch the survivor list converge. Played that way, Fibble is a consistency puzzle rather than a coin flip.'
    ]
  },
  'warmle-solver': {
    heading: 'Common Warmle mistakes and how to avoid them',
    paragraphs: [
      'The most common Warmle mistake is carrying over Wordle instincts: treating yellow as misplaced and gray as absent. Both readings are wrong in Warmle, and players who do not unlearn them will draw conclusions that point in entirely the wrong direction. Warmle yellow is a proximity signal; Warmle gray is a distance signal.',
      'The second mistake is guessing clustered letters. In Wordle, a word full of common letters is a good opener; in Warmle, the same word tells you almost nothing, because all its letters live in the same alphabet region. The solver\u2019s ranking corrects for this by preferring words spread across the alphabet.',
      'The third mistake is ignoring the distance threshold. If the game uses a threshold of three and you assume four, half your yellows will be misread as grays, and every deduction downstream will be wrong. Matching the setting is not optional — it is the difference between solving and flailing.',
      'The winning pattern is to walk, not guess: read each position\u2019s remaining window, probe its midpoint, and use every yellow as a step toward the true letter. The solver shows the windows, so the walk is always visible.'
    ]
  },
  'hardle-solver': {
    heading: 'Common Hardle mistakes and how to avoid them',
    paragraphs: [
      'The most common Hardle mistake is trusting the first green you see. In Hardle, green can be swapped with yellow, so an early green is a hypothesis, not a fact. Players who anchor their deductions to an early green usually find themselves defending a position that the later clues quietly contradict.',
      'The second mistake is ignoring grays. Gray is the one honest verdict in Hardle, and it is also the least exciting one, so it gets ignored. The solver does the opposite: it builds its foundation on grays and treats every colored tile as negotiable.',
      'The third mistake is failing to probe. With eight guesses, you have room to replay a contested letter — and when the repeated letter returns a contradictory verdict, you have caught a swapped clue. Players who never probe spend the whole game guessing under a fog they could have lifted in one turn.',
      'The winning pattern is skeptical but systematic: log every clue, let the solver hold every coherent reading, probe the contested letters, and only commit when the surviving candidates agree on a single story. Hardle rewards patience, and the solver makes patience cheap.'
    ]
  },
  'woodle-solver': {
    heading: 'Common Woodle mistakes and how to avoid them',
    paragraphs: [
      'The most common Woodle mistake is trying to play it like Wordle — expecting position information from every clue. Woodle gives you numbers, not positions, and players who keep waiting for a green tile to pin a letter down will find themselves out of guesses before the shape of the word ever appears.',
      'The second mistake is ignoring the arithmetic. The sum of the two counts tells you how many of your guessed letters are in the answer, and the exact count tells you how many are placed. Players who do not do the subtraction are playing with half the information.',
      'The third mistake is repeating a guessed letter early. With count-only feedback, a repeated letter wastes one of your five probes — you could have learned about two letters instead of one, and in an eight-guess game, wasted probes compound.',
      'The winning pattern is to alternate discovery and placement: first learn the letter set with high-overlap words, then place those letters with the exact count as your guide. The solver\u2019s ranked suggestions automate both phases, and the candidate counter keeps you honest about how much is left.'
    ]
  },
  'w-peaks-solver': {
    heading: 'Common Wordle Peaks mistakes and how to avoid them',
    paragraphs: [
      'The most common Wordle Peaks mistake is guessing letters near the edges of the alphabet. An opener full of X\u2019s and Z\u2019s returns verdicts that barely narrow the windows, because there is almost nothing below an X to rule out. The solver\u2019s midpoint rule exists for exactly this reason: edge letters waste the halving.',
      'The second mistake is ignoring the windows between guesses. Wordle Peaks is a search problem, and the search state is the set of five alphabet windows. Players who guess by feel instead of by window usually end up repeating letters that were already ruled out.',
      'The third mistake is treating an early green as a free pass. It is — but only for that one position. The other four windows still need their own probes, and players who fixate on the solved position lose track of the four active searches.',
      'The winning pattern is arithmetic: track five windows, probe each window\u2019s midpoint, and only play dictionary words whose letters all fit their windows. Six guesses is enough for that pattern every time, and the solver runs it faster than any human.'
    ]
  },
  'spotle-wordle-solver': {
    heading: 'Common Spotle Wordle and Thirdle mistakes',
    paragraphs: [
      'The most common Spotle Wordle mistake is treating the blank verdict as a gray. The blank tile is the game\u2019s rank-based signal and carries meaning that gray does not, so conflating the two destroys the model you are building. The solver consumes all four verdicts exactly as shown, which is why its candidate lists stay accurate while hand-played models drift.',
      'The most common Thirdle mistake is wasting the first guess. With only three turns, there is no discovery phase — your first word must both test letters and position them, which means opening with a common word that could plausibly be the answer itself.',
      'The shared mistake across both modes is ignoring the ranked suggestions. The solver ranks words by how evenly their possible feedback would split the survivors, which is the difference between playing reactively and playing with a plan.',
      'The winning pattern for both games is the same: log every clue faithfully, read the ranked list, and play the top suggestion that fits everything you know. In Thirdle that usually means the answer by guess three; in Spotle Wordle, comfortably inside six.'
    ]
  },
  'canuckle-solver': {
    heading: 'Common Canuckle mistakes and how to avoid them',
    paragraphs: [
      'The most common Canuckle mistake is misreading brown as a partial match. New players see a third color and assume it carries a third meaning, but brown is simply Canuckle\u2019s gray — the letter is not in the word, and treating it as anything else poisons the candidate filter.',
      'The second mistake is using a generic English dictionary mindset. Canuckle answers come from a Canadian word list, and words that feel natural in the US or UK are often not in the pool at all. The solver removes that guesswork by loading the Canadian list directly.',
      'The third mistake is ignoring the daily fact. The fact is a legitimate hint — knowing that today\u2019s answer relates to a hockey term, a prairie city, or a Canadian food genuinely narrows the candidate pool for players who know their country.',
      'The winning pattern is to open with a thematically safe, letter-rich word, respect every brown as a hard ban, and let the solver\u2019s Canadian-list rankings carry the endgame. Six guesses is enough for nearly every Canuckle daily when the pool is the right pool.'
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
