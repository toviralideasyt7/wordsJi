    key: 'fibble-solver',
    eyebrow: 'Fibble Solver Guide',
    intro:
      "Fibble is the Wordle variant with a liar problem: in every clue you receive, one tile is deliberately wrong. The game shows you the usual green, yellow, and gray verdicts, but exactly one of them is a fib, and figuring out which one — without being able to ask — is what makes Fibble genuinely harder than Wordle. The Fibble solver handles the deception the only reliable way: instead of trusting any single clue, it keeps every candidate word that is consistent with all but one tile of every clue. Here is how the lie mechanic works and how the solver thinks about it.",
    sections: [
      {
        heading: "The one-lie rule, exactly as it works",
        paragraphs: [
          "In Fibble, each of your clues contains exactly one false tile. The other four verdicts are honest. You never know which position lied — the game simply guarantees that exactly one of the five tiles in each clue row is not the real verdict.",
          "That guarantee is what makes Fibble solvable at all. If the game could lie any number of times, the information would be worthless; with exactly one lie per clue, the truth is always a single correction away.",
          "The practical effect is a branching problem: every clue suggests five possible corrected versions, one per position, and the real answer must satisfy one of them — while also satisfying similar corrected versions of every other clue you have."
        ],
        callout: {
          title: "One correction per clue",
          body: "Every Fibble clue is one flip away from the truth. The solver tracks every possible correction at once, so the real answer can never hide behind the lie."
        }
      },
      {
        heading: "Why this breaks a normal Wordle solver",
        paragraphs: [
          "A standard Wordle solver assumes every tile is true, so a single lie filters out the real answer and leaves only wrong words. That is why Fibble needs its own logic: the candidate filter has to tolerate one contradiction per clue.",
          "The Fibble solver's rule is simple to state and powerful in practice: a word stays alive if, for each clue, it contradicts at most one tile of that clue. Words that contradict two or more tiles of a single clue are eliminated, because a clue can only contain one lie.",
          "Running that rule across several clues narrows the field dramatically. Each new clue must be consistent with the answer except for one position, which is a far tighter constraint than it sounds."
        ]
      },
      {
        heading: "The nine-guess budget buys room to probe",
        paragraphs: [
          "Fibble gives you nine guesses instead of Wordle's six, and that extra room exists precisely because the lies eat information. The solver treats guesses as probes: each turn is designed to either reveal the answer or shrink the ambiguity about which tiles lied.",
          "A well-chosen probe word deliberately uses letters whose verdicts are informative even if one is wrong. Because you get nine turns, you can afford the redundancy of probing a letter twice — a repeated letter whose verdict changes tells you which clue lied.",
          "The solver's ranking reflects this: it scores words by how well they would distinguish the remaining candidates under every possible lie placement, not just under the honest reading."
        ],
        list: {
          title: "How to probe a suspected lie",
          items: [
            "Replay a letter that returned green or yellow in an earlier clue",
            "If the second verdict contradicts the first, one of the two clues lied",
            "Use a word that repeats the contested letter in a different position",
            "Keep probing until exactly one reading remains consistent with every clue",
            "Let the solver show which candidates survive each interpretation"
          ]
        }
      },
      {
        heading: "How the solver tracks every possible truth",
        paragraphs: [
          "The heart of the Fibble solver is its consistency check. For every candidate word in the dictionary, it counts how many tiles of each clue the word contradicts. A candidate survives a clue if that count is zero or one, and it survives the game only if it survives every clue that way.",
          "As clues accumulate, the solver also reasons about where the lies could have been: if a candidate matches a clue exactly except for one flipped position, the solver notes that position as a possible lie site. Across many candidates, the lie sites converge.",
          "By the end of the game, the solver usually has the answer pinned with one clear lie identified per clue — the same information a perfect human player would have deduced by careful cross-checking, but reached in seconds."
        ]
      },
      {
        heading: "The Fibble mindset: trust patterns, not tiles",
        paragraphs: [
          "The biggest mistake Fibble players make is treating a clue as gospel. One tile per clue is wrong by design, so the winning mindset is to look for the interpretation that makes everything else consistent.",
          "The solver embodies that mindset: it never commits to a reading of a clue, it keeps every reading alive until the evidence eliminates it, and it only surfaces candidates that survive all of the surviving readings.",
          "Play with that discipline and Fibble is a puzzle about consistency rather than luck. The lies stop being traps and become just another constraint — the one that makes the game interesting."
        ]
      },
      {
        heading: "Fibble answers and the daily lie, tracked",
        paragraphs: ["Each Fibble puzzle is a five-letter word plus its daily lie pattern, and the community’s answer logs make an interesting study: the lie placement is random, but the answers themselves skew toward the common end of the dictionary — the game wants you to beat the deception, not the vocabulary.","That answer bias is a quiet advantage for the solver. Because the candidate pool is mostly common words, the consistency check converges faster than it would on an obscure list.","For players, the takeaway is to trust the solver’s surviving-candidate list and not to overthink the lie. One tile per clue is wrong, everything else is honest, and the consistent reading always wins."]
      },
      {
        heading: "Common Fibble mistakes and how to avoid them",
        paragraphs: ["The most common Fibble mistake is treating every clue as gospel. The whole point of the game is that one tile per clue is wrong, and players who commit to the literal reading of an early clue will find the answer eluding them all game. The solver never commits, and neither should you.","The second mistake is wasting the nine-guess budget. Because the lies eat information, every guess must be a probe — a word that would clarify which reading is real. Guessing the first word that looks plausible is how streaks die in Fibble.","The third mistake is ignoring the one-lie guarantee. Some players assume the game could lie any number of times and give up on deduction entirely, but the guarantee is what makes the puzzle solvable: every clue is one correction away from truth, and the solver’s consistency check exploits exactly that.","The winning pattern is procedural: log each clue, let the solver keep every candidate consistent with all-but-one-tile of every clue, probe the contested letters, and watch the survivor list converge. Played that way, Fibble is a consistency puzzle rather than a coin flip."]
      },
      {
        heading: "Fibble solver settings and word lengths",
        paragraphs: ["The Fibble solver supports the word lengths the game uses, and the lie-tolerance filter scales to each one: a candidate survives a clue if it contradicts at most one tile of it, at any length.","For archived puzzles, the solver works on any date — log each clue and the one-lie filter rebuilds the candidate set exactly as it does for today’s daily. The nine-guess probing discipline is identical whether the puzzle is fresh or months old."]
      }
    ],
    faqHeading: "Fibble Solver FAQ",
    faqs: [
      {
        question: "What is Fibble?",
        answer:
          "Fibble is a Wordle variant where every clue contains exactly one deliberately wrong tile. You see the usual green, yellow, and gray verdicts, but one position in each clue is a lie."
      },
      {
        question: "How many lies are in each Fibble clue?",
        answer:
          "Exactly one per clue. The game guarantees one false tile per row, which makes the puzzle solvable: every clue is one correction away from the truth."
      },
      {
        question: "How many guesses do you get in Fibble?",
        answer:
          "Nine guesses, three more than standard Wordle. The extra turns are there to compensate for the information lost to the lies."
      },
      {
        question: "How does the Fibble solver deal with the lies?",
        answer:
          "Instead of trusting any single tile, the solver keeps every word that contradicts at most one tile per clue. A candidate is eliminated only if it contradicts two or more tiles of a single clue."
      },
      {
        question: "Can I beat Fibble without a solver?",
        answer:
          "Yes, by probing: replay contested letters in later guesses and cross-check verdicts. When a repeated letter's verdict changes, one of the clues lied, and the consistent reading eventually pins the answer."
      },
      {
        question: "Does the solver work for every Fibble puzzle?",
        answer:
          "Yes, for any date and word length. Enter each guess and its clue, and the solver maintains the full set of lie-tolerant candidates from start to finish."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/hardle-solver", label: "Hardle Solver" },
      { href: "/warmle-solver", label: "Warmle Solver" },
      { href: "/xordle-solver", label: "Xordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  },
