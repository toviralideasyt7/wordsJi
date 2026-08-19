    key: 'hardle-solver',
    eyebrow: 'Hardle Solver Guide',
    intro:
      "Hardle is the Wordle variant that makes you question your own eyes: the clue tiles can swap roles. The game shows the usual green, yellow, and gray verdicts, but on some guesses the greens and yellows are deliberately exchanged, so a tile that looks green may really be telling you the letter is misplaced. The Hardle solver handles the uncertainty by keeping every candidate that is consistent with at least one possible assignment of the swapped tiles. Here is how the mechanic works and why it rewires normal Wordle instincts.",
    sections: [
      {
        heading: "The swap rule, stated plainly",
        paragraphs: [
          "In Hardle you get eight guesses instead of six, and the reason is the trick: for some of your clues, the green and yellow verdicts are swapped before you see them. A letter that is correctly placed may light up yellow, and a misplaced letter may light up green.",
          "The game does not tell you which clues are swapped, which is the entire difficulty. You have to solve the word while holding multiple interpretations of the board in your head at once.",
          "Gray tiles stay honest — a gray always means the letter is absent. That one anchor is what makes Hardle solvable, and it is the first thing the solver leans on."
        ],
        callout: {
          title: "Greens and yellows are negotiable",
          body: "In Hardle, green and yellow can swap. Gray is the only verdict you can fully trust, so the solver builds every deduction around grays first."
        }
      },
      {
        heading: "Why this breaks standard Wordle logic",
        paragraphs: [
          "A standard Wordle solver assumes a green tile pins a letter to a position. In Hardle that assumption is unsafe, so the solver tracks two readings of every colored tile: the literal one and the swapped one.",
          "A candidate word stays alive if it matches at least one consistent reading of every clue. If a word contradicts every possible reading of a single clue, it is eliminated — but it only needs one viable reading to survive.",
          "That relaxation makes the candidate set larger and the deductions slower than in Wordle, which is precisely why Hardle gives you two extra guesses."
        ]
      },
      {
        heading: "The eight-guess budget and how to spend it",
        paragraphs: [
          "Eight guesses is the game's acknowledgment that each clue carries less trustworthy information. The solver spends that budget on redundancy: it favors probes that clarify which readings are real.",
          "Replaying a letter that came back green or yellow in an earlier clue is the strongest probe. If the second verdict contradicts the first, you now know one of the clues was swapped and you can discard its misleading reading.",
          "The solver ranks words by how much they would resolve the swap ambiguity, not just by how many letters they test — the two goals are different in Hardle."
        ],
        list: {
          title: "Hardle probe guidelines",
          items: [
            "Trust grays absolutely — they are never swapped",
            "Replay green or yellow letters to detect swapped clues",
            "Prefer words that repeat a contested letter in a new position",
            "Discard a clue's literal reading once a contradiction appears",
            "Spend the last guesses confirming, not exploring"
          ]
        }
      },
      {
        heading: "How the solver models both readings",
        paragraphs: [
          "The Hardle solver's core loop is simple: for each clue, build the set of readings that candidate words could have produced, and keep every candidate that survives at least one full interpretation.",
          "As clues accumulate, the solver also tracks which clues are likely swapped. If a candidate requires clue three to be read as swapped but handles clue one and two literally, the solver notes that consistency and carries it forward.",
          "By the end of the game, the surviving candidates usually share a single coherent story: the word, plus which clues lied about their colors. That story is exactly what a perfect human player would reconstruct."
        ]
      },
      {
        heading: "The Hardle mindset: hold every interpretation",
        paragraphs: [
          "The players who lose Hardle are the ones who commit to a reading of an early clue and stop questioning it. The winning mindset is the opposite: every colored tile is a hypothesis, and hypotheses get confirmed or discarded by later evidence.",
          "The solver never commits. It keeps every candidate that any coherent interpretation allows, and it only narrows when the evidence genuinely rules readings out.",
          "Play with that patience and Hardle becomes a puzzle about deduction under uncertainty — which is harder than Wordle, but exactly as fair. The truth is always in there, recoverable from the clues you have."
        ]
      },
      {
        heading: "Hardle answers and the swapped-clue dailies",
        paragraphs: ["Every Hardle puzzle is a five-letter word whose clues are occasionally swapped, and the daily answers show the game’s fairness: the words themselves are common, so the difficulty comes entirely from the unreliable feedback rather than obscure vocabulary.","That design choice is good news for the solver. A common-word pool means the two-readings filter stays tight, and the surviving candidates converge quickly once you have two or three clues logged.","It is also the right way to think about Hardle as a player: the answer is never the hard part, the interpretation is. Trust the grays, probe the colored tiles, and let the solver hold every reading until the evidence settles it."]
      },
      {
        heading: "Common Hardle mistakes and how to avoid them",
        paragraphs: ["The most common Hardle mistake is trusting the first green you see. In Hardle, green can be swapped with yellow, so an early green is a hypothesis, not a fact. Players who anchor their deductions to an early green usually find themselves defending a position that the later clues quietly contradict.","The second mistake is ignoring grays. Gray is the one honest verdict in Hardle, and it is also the least exciting one, so it gets ignored. The solver does the opposite: it builds its foundation on grays and treats every colored tile as negotiable.","The third mistake is failing to probe. With eight guesses, you have room to replay a contested letter — and when the repeated letter returns a contradictory verdict, you have caught a swapped clue. Players who never probe spend the whole game guessing under a fog they could have lifted in one turn.","The winning pattern is skeptical but systematic: log every clue, let the solver hold every coherent reading, probe the contested letters, and only commit when the surviving candidates agree on a single story. Hardle rewards patience, and the solver makes patience cheap."]
      },
      {
        heading: "Hardle solver settings and word lengths",
        paragraphs: ["The Hardle solver supports the same word lengths the game uses, and it applies the two-reading filter to every length the same way. Whether the daily Hardle is a five-letter puzzle or one of the longer variants, the mechanics do not change: grays are honest, greens and yellows are negotiable, and the candidate filter tolerates one swapped reading per clue.","If you are replaying an archived Hardle puzzle, the solver works on any date — enter the guesses and clues exactly as the game showed them, and the two-reading filter rebuilds the candidate set from scratch. The length setting only changes which dictionary loads, not the logic."]
      },
      {
        heading: "The reward for playing Hardle carefully",
        paragraphs: ["Hardle’s swapped colors feel like an attack on your confidence, but the game is scrupulously fair: gray never lies, the words are common, and every clue is decodable with enough cross-checking. Players who embrace the skeptical method find that Hardle sharpens their whole word-game toolkit.","The solver exists to make that method fast. It holds every reading, probes the contested letters, and never lets a swapped clue hide the truth — which is exactly the assurance a careful Hardle player wants. Load the daily, log the clues, and let the solver keep every reading alive until only one word survives."]
      }
    ],
    faqHeading: "Hardle Solver FAQ",
    faqs: [
      {
        question: "What is Hardle?",
        answer:
          "Hardle is a Wordle variant where green and yellow clue tiles can be swapped on some guesses. A correctly placed letter may appear yellow, and a misplaced letter may appear green."
      },
      {
        question: "How many guesses do you get in Hardle?",
        answer:
          "Eight guesses, two more than standard Wordle, to compensate for the unreliable color feedback."
      },
      {
        question: "Are gray tiles always honest in Hardle?",
        answer:
          "Yes. Gray always means the letter is absent from the answer. It is the only fully trustworthy verdict, which is why the solver builds its deductions around grays first."
      },
      {
        question: "How does the Hardle solver handle swapped colors?",
        answer:
          "It keeps every candidate word that is consistent with at least one reading of each clue — literal or swapped — and only eliminates words that contradict every possible reading of a clue."
      },
      {
        question: "What is the best strategy for Hardle?",
        answer:
          "Probe: replay letters that returned green or yellow in earlier clues. When a repeated letter's verdict contradicts the first one, you have caught a swapped clue and can discard its misleading reading."
      },
      {
        question: "Is Hardle harder than Wordle?",
        answer:
          "Yes, by design. The unreliable colors reduce the information per guess, so the game grants two extra guesses and rewards careful cross-checking over raw intuition."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/fibble-solver", label: "Fibble Solver" },
      { href: "/warmle-solver", label: "Warmle Solver" },
      { href: "/woodle-solver", label: "Woodle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  },
