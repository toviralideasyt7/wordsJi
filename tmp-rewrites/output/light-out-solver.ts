    key: 'light-out-solver',
    eyebrow: 'Lights Out solver',
    intro:
      "My white whale with Lights Out was a 5×5 board inside a game collection I will not name — twenty minutes of pressing, three times reset, zero lights saved. That is the night I looked up whether the puzzle has actual math behind it. It does. Lights Out is a linear system in disguise: every press toggles a tile and its four neighbors, and the solver below computes the exact press set that clears any board, using Gaussian elimination over a two-value number system. This page has the solver, the by-hand method I use instead of it nine times out of ten, and the two facts that make the whole game click.",
    sections: [
      {
        heading: 'Two facts about Lights Out that change how you see it',
        paragraphs: [
          'Fact one: pressing a tile twice cancels out. Whatever the first press did, the second undoes it. So no useful solution ever presses the same tile twice, and a solution is not a sequence at all — it is a set of tiles.',
          'Fact two: order does not matter. Toggle operations commute; pressing tile A then tile B lands the board in exactly the same state as B then A. Together the two facts mean every board is really asking one question: which subset of tiles, pressed once each, turns everything off?',
          'That is why the game feels different from every other puzzle on this site. There is no feedback loop, no guessing, no partial credit. The answer exists or it does not, and once you know the set, nothing can go wrong executing it. I find that oddly calming now, though the twenty-minute board predates the calm.'
        ],
        callout: {
          title: 'The consequence worth memorizing',
          body: 'A Lights Out solution is a set, not a sequence. Press the tiles in any order, scramble them, reverse them — the board cannot tell the difference.'
        }
      },
      {
        heading: 'How the solver finds the exact press set',
        paragraphs: [
          'Under the hood, this is the cleanest math on the site. Each light contributes one equation: "the number of presses among this light and its neighbors, counted modulo two, must equal its current state." On or off, one or zero — the entire puzzle lives in a number system with two elements.',
          'Stack all those equations and you get a linear system, and the solver runs Gaussian elimination on it, adapted for that two-value arithmetic. The output is a provably correct press set: if it says press these tiles, pressing exactly those clears every light, on any board size, computed in milliseconds.',
          'The reason I trust it completely — and the reason it never "fails" the way hint systems do — is that there is no heuristic anywhere in it. It is not pattern-matching against known boards or guessing promising regions. It is the same elimination you would do by hand if you had unlimited patience, done instantly, and provably minimal in structure. Writing it took me an evening; checking it against hundreds of random boards took longer, which tells you where the real work lives.'
        ]
      },
      {
        heading: 'Chasing the lights: the method I actually use by hand',
        paragraphs: [
          'You do not need linear algebra at the table. The classic manual strategy is called chasing, and it works on every solvable board: start at the top row, and for each light that is on, press the tile directly below it. That row is now dark. Move down a row and repeat, pushing the surviving lights downward until only the bottom row can be lit.',
          'The bottom row is where the chase either finishes or stalls, and here is the trick: the pattern of lights remaining in that bottom row tells you exactly which tiles to press in the top row. Run the chase again with those top-row presses in place, and the whole board goes dark. The mapping from bottom-row patterns to top-row presses is fixed for each board size, and for a 5×5 I have the common ones memorized — not out of dedication, out of repetition.'
        ],
        list: {
          title: 'The chase, in four moves',
          items: [
            'Top row: press the tile below every light that is on',
            'Move down one row and repeat, pushing lights toward the floor',
            'Reach the bottom row and read its remaining light pattern',
            'Press the corresponding top-row tiles, chase down once more, done'
          ]
        },
        paragraphs: [
          'Geometry matters while you chase: a center press flips five tiles, an edge press four, a corner press three. Corners are the easiest tiles to reason about and the cheapest to fix, which is a nice inversion of most grid puzzles. When I am stuck mid-chase, the corner cases are where I re-verify first, because they are the ones my eye most often clips.'
        ]
      },
      {
        heading: 'One solution, several solutions, or none at all',
        paragraphs: [
          'Some boards have a unique press set. Some have several equally valid ones, related by what players call quiet patterns — small sets of presses that cancel out entirely, like the all-on row pattern, which you can add to any solution to get another solution with the same result. If you use the solver and get a different press set than a friend did, you can both be right.',
          'And some boards have no solution at all. On classic 5×5 grids only a fraction of configurations are solvable, which retroactively explains at least one of my childhood afternoons. The solver detects these directly — the elimination has no consistent answer, and it tells you so instead of inventing one.',
          'That no-solution detection is the feature I would keep if I had to delete everything else. Before I understood unsolvable boards existed, I assumed every failure was my failure, and I pressed tiles at random for minutes on end. Knowing that some states are mathematically dead ends is not defeatism. It is the difference between searching and thrashing.'
        ]
      },
      {
        heading: 'Board sizes: what changes and what does not',
        paragraphs: [
          'The solver handles everything from 3×3 minis to the classic 5×5 and larger custom layouts, because the elimination just scales — bigger board, bigger system, same two-value arithmetic, same exact answer.',
          'What changes by hand is the feel. Small boards have few possible states and can seem random, almost scrambly; the 5×5 has enough structure for the chase to feel like a method rather than a shuffle. The bottom-row mapping differs per size, so my memorized 5×5 table does me no good on a 4×4 — the first few runs on any new size go through the solver until the table builds itself in my head.',
          'If you are learning, start at 3×3 deliberately: the chase is short enough to hold in your head, and every concept — sets, quiet patterns, dead ends — shows up in miniature. My recommendation as someone who came to the math embarrassingly late: small board first, math second, 5×5 white whale third.'
        ]
      },
      {
        heading: 'Where you will actually meet this puzzle',
        paragraphs: [
          'Lights Out lives everywhere except the front of the shelf: as a minigame inside larger games, in puzzle collections, in speedrun categories, and in math classrooms as the friendliest possible introduction to linear algebra over finite fields. Every one of those settings is a good reason to have a solver bookmarked.',
          'The classroom use is the one I defend to skeptics. Set up a board, solve it by hand with the chase, then run the solver and compare — the press set is a worked solution to a real linear system, and seeing elimination produce a set of tiles you can physically press makes the abstraction land in a way textbook exercises never managed for me.',
          'And the speedrun angle is real: knowing the exact press set ahead of time turns the run into motion practice instead of problem-solving. Whether that is in the spirit of the category is above my pay grade. The math does not judge.'
        ]
      }
    ],
    faqHeading: 'Lights Out solver questions',
    faqs: [
      {
        question: 'How does the Lights Out solver work?',
        answer:
          'It turns every light into an equation over a two-value system — on or off — and solves the whole stack with Gaussian elimination. The output is the exact set of tiles to press, provably correct on any solvable board.'
      },
      {
        question: 'Does the order of presses matter in Lights Out?',
        answer:
          'No. Pressing a tile twice cancels out, so a solution is a set of tiles rather than a sequence. Any order clears the board equally well.'
      },
      {
        question: 'Can every Lights Out board be solved?',
        answer:
          'No — some configurations are mathematically dead ends, and on classic boards only a fraction of states are solvable. The solver detects these and says so instead of pressing forever.'
      },
      {
        question: 'What is the chase method?',
        answer:
          'The standard by-hand solve: work top to bottom, pressing below each lit tile to push the lights down, then read the bottom row\'s pattern to determine your top-row presses. One more chase and the board is dark.'
      },
      {
        question: 'Does the solver work for any board size?',
        answer:
          'Yes — the same elimination scales from 3×3 minis to 5×5 classics and larger custom grids. Only the memorized bottom-row mappings differ by size.'
      }
    ],
    relatedLinks: [
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/minesweeper-solver', label: 'Minesweeper Solver' },
      { href: '/kanoodle-solver', label: 'Kanoodle Solver' },
      { href: '/weaver-solver', label: 'Weaver Solver' },
      { href: '/squaredle-solver', label: 'Squaredle Solver' },
      { href: '/word-ladder-solver', label: 'Word Ladder Solver' }
    ]
  },
