// Adds new static article entries to src/lib/content/registry.ts.
// Run with: node scripts/add-articles.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

// Each entry is a full TS object literal WITHOUT the trailing comma, keyed by route.
const ENTRIES = {};

ENTRIES['quordle-answer-today'] = `  'quordle-answer-today': {
    key: 'quordle-answer-today',
    eyebrow: 'Quordle Strategy Guide',
    intro:
      'Quordle makes you solve four Wordle-style boards with one shared set of nine guesses. That changes everything: your opener has to serve four boards at once, and every guess after it is a resource you cannot afford to waste on a single grid. This guide covers board allocation, opener systems, and the endgame habits that separate streaks from blowups.',
    sections: [
      {
        heading: 'The four-board math that changes every decision',
        paragraphs: [
          'Quordle looks like Wordle with extra grids, but the strategy is a different sport. In Wordle you spend guesses on information for one board. In Quordle, the same nine-guess budget has to cover four boards, so a guess that only helps one grid is a luxury you usually cannot afford.',
          'The key number is 2.25 — the average number of boards a guess must advance to solve all four inside nine tries. In practice that means good Quordle players never chase a single board early. They look for guesses that sit in the overlap of two or three boards at once, and they let boards solve themselves in parallel.',
          'The payoff of parallel play is huge. A player who solves board one on guess three and boards two and three on guess five has already banked most of the game before the fourth board even needs attention. A player who tunnels on board one until guess six has spent two-thirds of the budget and learned almost nothing about the other three.'
        ]
      },
      {
        heading: 'Openers that cover four boards instead of one',
        paragraphs: [
          'A good single-game Wordle opener just needs five strong letters. A good Quordle opener needs letters that are likely to hit on four different boards — which mostly means the same thing, done deliberately. You want two or three vowels and the most common consonants, spread across positions so the four boards have different things to work with.',
          'The community has settled on a two-guess opener pair rather than a single word: play STARE, then follow with a second word that reuses the vowels in new positions while testing fresh consonants. Words like CLOWN, PILOT, or MONEY pair with STARE to cover nearly every common letter across the alphabet.',
          'Do not open with the same word on all four boards if the game lets you choose different openers per board — and in the version on this site, you do not need to: you make one guess per round that applies to all boards simultaneously. So the real skill is picking one guess per round that lands across as many boards as possible.'
        ],
        callout: {
          title: 'The opener rule',
          body: 'Pick an opener that covers the five most common letters, then a second guess that tests the next five. Whatever those two guesses reveal across the four boards decides which boards get your attention first — not your favorite word.'
        }
      },
      {
        heading: 'How to read four boards of feedback at once',
        paragraphs: [
          'When you submit a guess in Quordle, every board lights up with its own green, yellow, and gray feedback. Reading them side by side is the real game. A letter that comes back yellow on all four boards is a gift — it means the same letter sits in all four answers, just in different spots.',
          'The fastest way to get lost is to treat the boards as independent. They are not. The guesses are shared, so a letter that is gray on board one but yellow on board three tells you to stop worrying about board one and start relocating that letter on board three.',
          'A practical reading order: check greens first (they lock letters and positions for free), then count which boards each yellow letter belongs to, then decide which board is furthest from solved and give it a targeted guess. The board with the fewest confirmed letters is almost always the one that decides the game.'
        ],
        list: {
          title: 'Signals that should change your plan mid-game',
          items: [
            'A letter yellow on two or more boards: relocate it on all of them in one guess',
            'A board with three greens by guess four: it is nearly solved, leave it alone',
            'A board with nothing but grays by guess four: it needs an emergency information guess, not a solve attempt',
            'Two boards sharing the same pattern (same letter, same position): they likely share the word skeleton, so one guess can crack both'
          ]
        }
      },
      {
        heading: 'The endgame: converting three boards without panicking',
        paragraphs: [
          'Quordle endgames are won by players who know when to stop gathering information. If two boards are solved and the third has one green with four open spots, stop playing the field and start testing real words. At five or six guesses left, an elimination guess is a guess you cannot afford.',
          'The opposite failure is also common: players who finally solve three boards, look at the fourth with two guesses left, and freeze. Do the math before you freeze. If the remaining board has one locked letter and the answer is probably one of three words, guess the most likely one now — you still have one guess left for the runner-up.',
          'Sequence mode changes the endgame completely: boards must be solved in order, so you cannot let board one sit while board four is nearly done. If you play Sequence, adjust your allocation — early guesses should deliberately avoid solving board four before board one is finished.'
        ],
        callout: {
          title: 'The one-line Quordle philosophy',
          body: 'Every guess should either solve a board or make two boards easier. The players who run out of guesses are the ones still making single-board guesses on round seven.'
        }
      },
      {
        heading: 'Mode-by-mode notes: chill, extreme, sequence, and rescue',
        paragraphs: [
          'Chill mode keeps the same four-board structure but gives you more breathing room with a gentler dictionary and more forgiving word selection. Treat it as the training wheels version: play it to internalize the allocation habits above without pressure.',
          'Extreme mode is where the shared-guess math bites hardest. The dictionary is tighter and the answers lean obscure, so the opener pair matters more than ever. Expect to lean on elimination guesses you would never play in normal mode.',
          'Sequence mode forces board-by-board completion, which flips the strategy: you want your early guesses to avoid solving board four too early, and you want to bank board one as fast as possible. Some players deliberately play weaker openers in Sequence to control which board finishes first.',
          'Rescue mode lets you recover boards you would otherwise fail, at the cost of score. The strategic lesson stays the same — the boards that get rescued are almost always the ones that were ignored on rounds two through five while a favorite board got all the attention.'
        ]
      },
      {
        heading: 'Practice habits that turn Quordle into a solvable puzzle',
        paragraphs: [
          'Quordle rewards repetition more than raw vocabulary. The archive of past puzzles on this site is the fastest training tool: replay games and force yourself to write down, after each guess, which board you were trying to help and why. You will notice the pattern within a week — most losses come from allocation, not word knowledge.',
          'A second habit that pays off: always have a planned second guess before you submit your first. Amateur players decide guess two after seeing guess one. Strong players already know it, because the opener pair is a system, not a reaction.',
          'Finally, track your boards-solved-per-game average rather than wins and losses. A 3-1 loss with four boards nearly solved is a different problem than a 4-0 blowout, and the two need different fixes. The players who improve fastest are the ones who stop celebrating streaks and start reading their own mistakes.'
        ]
      }
    ],
    faqHeading: 'Quordle Questions, Answered',
    faqs: [
      {
        question: 'How many guesses do you get in Quordle?',
        answer:
          'Nine guesses total, shared across all four boards. The same guess is applied to every board at once, which is why parallel play matters.'
      },
      {
        question: 'What is the best opening pair for Quordle?',
        answer:
          'A common strong pair is STARE followed by CLOWN or PILOT. Together they cover most of the alphabet, and the four boards each get useful vowels and consonants to work with.'
      },
      {
        question: 'How is Quordle different from Wordle?',
        answer:
          'Wordle is one board with six guesses. Quordle is four boards sharing nine guesses, which forces you to allocate guesses across boards instead of solving one at a time.'
      },
      {
        question: 'How do I stop failing Quordle on the last board?',
        answer:
          'Stop ignoring the lagging board until the end. Track which board has the fewest confirmed letters after each guess and give it a targeted guess before the final rounds.'
      },
      {
        question: 'Does Quordle have different modes?',
        answer:
          'Yes — chill, extreme, sequence, and rescue modes each change the rules slightly. Sequence mode is the hardest strategic shift because boards must be solved in order.'
      }
    ],
    relatedLinks: [
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/nerdle-answer-today', label: 'Nerdle Answer Today' },
      { href: '/quordle-solver', label: 'Quordle Solver' },
      { href: '/phoodle-answer-today', label: 'Phoodle Answer Today' },
      { href: '/waffle-answer-today', label: 'Waffle Answer Today' },
      { href: '/semantle-answer-today', label: 'Semantle Answer Today' }
    ]
  }`;

const marker = '\n};\n';
const src = await readFile(registryPath, 'utf8');
const idx = src.lastIndexOf(marker);
if (idx === -1) throw new Error('final }; not found in registry');

const blocks = [];
for (const [key, entry] of Object.entries(ENTRIES)) {
  if (src.includes(`'${key}':`)) {
    console.log(`SKIP ${key}: already present`);
    continue;
  }
  blocks.push(entry);
  console.log(`ADD ${key}`);
}

if (blocks.length === 0) {
  console.log('Nothing to add.');
} else {
  // Previous entry's closing `}` must become `},`, then each block follows,
  // and the final `};` stays intact. Trailing commas are valid TS here.
  const insertion = blocks.map((b) => `${b},`).join('\n\n');
  const next = src.slice(0, idx) + ',\n\n' + insertion + '\n' + src.slice(idx + 1);
  await writeFile(registryPath, next);
  console.log(`Inserted ${blocks.length} article(s).`);
}
