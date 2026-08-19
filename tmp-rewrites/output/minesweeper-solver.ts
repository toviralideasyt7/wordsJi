    key: 'minesweeper-solver',
    eyebrow: 'Minesweeper solver',
    intro:
      "I built this Minesweeper solver to settle an argument about luck. A friend insisted expert Minesweeper is a coin-flip game; I insisted most boards are pure logic with a small unlucky core. So I wrote the logic down. You enter the board you are looking at — numbers, flags, unknowns — and the solver marks every cell that can be decided with certainty, then ranks the genuinely ambiguous ones by mine probability. He was a little right, I was mostly right, and the tool we ended up with is below, along with the patterns it uses and the habits that actually made me faster at the real game.",
    sections: [
      {
        heading: 'The argument that made me write a Minesweeper solver',
        paragraphs: [
          'The whole game rests on two sentences. A numbered cell tells you how many mines sit in its eight neighbors. When that count is already satisfied by flags, every other neighbor is safe; when the number equals the count of unknown neighbors, every one of those is a mine.',
          'Apply those two rules over and over, recursively, and a surprising share of every board solves itself. A 3 with three flags around it clears its whole neighborhood. A 1 with exactly one unknown neighbor flags it. Beginners look at the grid; the game is actually a list of these little counting facts, chained together.',
          'The solver does nothing more mystical than that. It takes your visible numbers and flags, derives every certainty it can, updates the board, and repeats until nothing new falls out. Whatever remains is the honest ambiguity — the part my friend was right about — and for that, it switches to probabilities. Writing it was the most educational week of Minesweeper I have ever had, because implementing the rules forced me to actually know them.'
        ]
      },
      {
        heading: 'Four patterns worth memorizing, because they are most of the game',
        paragraphs: [
          'You can derive everything from the two base rules, but deriving mid-game is slow. What speedrunners do is recognize packaged shapes on sight. These four cover most walls you will ever meet:'
        ],
        list: {
          title: 'The shapes the solver checks on every pass',
          items: [
            '<strong>1-2-1</strong> against a wall: the two mines sit under the 2, and the cells under the 1s are safe',
            '<strong>1-2-2-1</strong> against a wall: the mines sit under the two 2s, and the outer cells are safe',
            '<strong>The corner count</strong>: a corner 1 with only one unknown neighbor means that neighbor is a mine; a satisfied 3 clears its entire corner',
            '<strong>The subtraction</strong>: a 2 with one flag already placed needs exactly one more mine among its remaining neighbors, which often crosses off half of them'
          ]
        },
        paragraphs: [
          'Every pattern is the base rule in a costume, which is the reassuring part: if you forget a pattern mid-game, you can re-derive it. The 1-2-1 and 1-2-2-1 walls are the two I would drill first, because they resolve entire regions in one glance and they show up constantly.',
          'What the solver adds is parallelism. On an expert board there are dozens of these deductions live at once, and a human eye holds maybe three. The solver finds them all, including the ones your attention skips, which is exactly where my manual play was leaking time — I kept re-deriving things I had effectively already solved.'
        ]
      },
      {
        heading: 'When the logic runs out, the odds take over',
        paragraphs: [
          'Almost every board eventually stalls: a region where two or three cells could hide the mine in mutually exclusive ways, and no counting rule can decide. This is the ambiguous core, and how you play it decides whether you are a good Minesweeper player or a lucky one.',
          'The solver handles the core by computing each remaining cell\'s actual mine probability and pointing at the safest click, weighted by position risk like corners and edges. It does not guess blindly. It guesses the best number available, which is a different thing entirely.',
          'The counterintuitive lesson I needed: a scary-looking cell can carry a 1-in-10 chance while an innocent-looking one carries 1-in-3. The board\'s vibes mean nothing; the constraint math means everything. Internalizing that one idea changed my endgame survival rate more than every pattern combined, because the endgame is where the vibes die and the odds decide.'
        ],
        callout: {
          title: 'The rule I play by',
          body: 'Never click a cell the logic has already decided. Certain mines get flagged, certain safes get cleared, and only the genuinely undecidable cells are worth a calculated risk.'
        }
      },
      {
        heading: 'Chording and flags: where my speed actually came from',
        paragraphs: [
          'Chording is the move casual players never find: when a number\'s mine count is satisfied by flags, clicking that number opens every remaining neighbor at once. One click, up to seven cells. On a wall of 1-2-1 patterns, a couple of chords clear a dozen cells while a cell-clicker is still aiming.',
          'Flagging more, not less, is the second half. Unflagged numbers force you to re-count neighborhoods in your head, over and over, and that re-counting is where both errors and seconds come from. A fully flagged board is a readable board, and a readable board is a chordable board. The solver marks every certain mine for exactly this reason: the flag layout is the interface for the rest of the logic.',
          'The deepest habit shift is reading before clicking. I used to scan for safe-looking cells; now I read number groups, resolve them, and let the clicks follow. That inversion — eye on the numbers, not the grid — is what took my beginner boards from twenty seconds to five, and the solver drills it by showing you each deduction the moment it exists.'
        ]
      },
      {
        heading: 'Training with the solver instead of leaning on it',
        paragraphs: [
          'Used honestly, this thing is a coach. Play a real board until you stall, then enter it here and study what you missed. The gap between your stall-point and the solver\'s stall-point is a syllabus: each missed deduction is a pattern you have not internalized yet. A few sessions of that and 1-2-1 walls start leaping off the grid at you.',
          'The compare-your-solve habit is the one I still run. Finish a board as far as logic allows, run the solver, and diff the two. My divergences are almost always the same two mistakes: a subtraction I did not notice, and a probability call I got wrong in the endgame. Knowing your two signature mistakes is worth more than any generic tip list.',
          'And for the perfectionists: some endgames are true 50-50s. The solver picks the better side and moves on, and that is the correct emotional model for the game. A perfect player still loses coin flips. Raging at them is optional; I tried it for years and can report it does not improve the odds.'
        ]
      },
      {
        heading: 'What runs where, and what the solver is good for beyond winning',
        paragraphs: [
          'Everything runs locally in your browser. The board you enter never leaves your machine, and results update instantly as you add numbers and flags — which matters less for privacy drama and more for the practical bit: you can iterate on a live board quickly, mid-game, without any round trips.',
          'Beyond the win, two uses keep me recommending it to people who do not care about scores. It is a clean demonstration of constraint logic — every revealed number is a tiny constraint-satisfaction problem, and watching the deductions chain is the most persuasive intro to that kind of thinking I know. And it is an honest expected-value teacher: when logic stalls, it shows the actual odds rather than a feeling, which is a lesson that transfers well past this game.',
          'The last use is verification. Solved a board by hand and want to check you never guessed when you did not have to? Run it through and compare. Clean boards are satisfying; knowing exactly where your one necessary guess was, and that it was necessary, is better.'
        ]
      }
    ],
    faqHeading: 'Minesweeper solver questions',
    faqs: [
      {
        question: 'How does a Minesweeper solver work?',
        answer:
          'It applies the counting rules to every visible number: when a number\'s mine count is met by flags, the rest of its neighbors are safe; when unknowns must all be mines, it flags them. It loops those deductions until nothing new is provable, then ranks whatever is left by mine probability.'
      },
      {
        question: 'Can every Minesweeper board be solved without guessing?',
        answer:
          'No, and anyone who says otherwise has not met enough endgames. Most boards reduce to a small ambiguous region where two configurations are equally valid. The solver picks the lowest-probability cell there, which is the best anyone can do.'
      },
      {
        question: 'What is the 1-2-1 pattern in Minesweeper?',
        answer:
          'A 1-2-1 row against a wall means both mines sit under the 2 and the cells under the 1s are safe. It clears a whole wall in one look, which is why it is the first pattern worth drilling.'
      },
      {
        question: 'Does the solver run on a server?',
        answer:
          'No — all the logic runs in your browser, so the board stays local and the analysis updates instantly as you enter numbers and flags.'
      },
      {
        question: 'Is using a Minesweeper solver cheating?',
        answer:
          'During a live game, it removes the challenge, so I would not bother. As a trainer — studying missed patterns and probability calls after you stall — it is the fastest improvement tool I have used, which is the entire reason this page exists.'
      }
    ],
    relatedLinks: [
      { href: '/minesweeper-solver', label: 'Minesweeper Solver' },
      { href: '/wordle-solver', label: 'Wordle Solver' },
      { href: '/kanoodle-solver', label: 'Kanoodle Solver' },
      { href: '/light-out-solver', label: 'Lights Out Solver' },
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/weaver-solver', label: 'Weaver Solver' }
    ]
  },
