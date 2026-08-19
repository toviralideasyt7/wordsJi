    key: 'dordle-solver',
    eyebrow: 'Dordle Solver Guide',
    intro:
      "Dordle is Wordle doubled: two five-letter words, one shared guess per turn, and seven attempts to solve both boards. Seven guesses sounds like a lot until you remember that a single guess that only helps one board effectively costs both boards a turn. The Dordle solver filters the two candidate lists in parallel and ranks every suggestion by how much it reveals on both boards at once — which is the only way to win reliably inside seven turns. Here is how the game's budget works and the strategy the solver encodes.",
    sections: [
      {
        heading: "The seven-guess budget, split two ways",
        paragraphs: [
          "Dordle's arithmetic is simple: seven guesses, two answers. If you treat it as two separate Wordle games you need twelve guesses and you lose. If you treat it as one shared game, seven turns is enough — but only when most guesses earn progress on both boards.",
          "The solver's ranking encodes that math. A candidate word is scored by how much information it reveals across both candidate lists combined, not on a single board, so the suggestions naturally favor words that work for both puzzles.",
          "Early in the game the two boards are nearly identical — both are full five-letter dictionaries. That is the moment when shared guesses are cheapest and most valuable, which is why the opening matters more in Dordle than in Wordle."
        ],
        callout: {
          title: "One guess, two boards",
          body: "A guess that reveals letters on both boards is worth two turns. Spend the first few guesses on words with high-value letters, and the budget stops being tight."
        }
      },
      {
        heading: "Openers that hit both boards",
        paragraphs: [
          "The same opening logic that works in Wordle works in Dordle, with one twist: you want the opening word to be a plausible answer to either board, so its feedback is useful in both columns.",
          "Classic five-letter openers like CRANE, SLATE, or ADIEU are strong because they cover common vowels and consonants without repeating letters. Any green or yellow you get applies to a word that could appear on either board.",
          "A two-word opening — CRANE then a word using the uncovered letters — usually leaves you with a good shape of both boards by turn two, with five turns left and plenty of information to work with."
        ],
        list: {
          title: "Signs a Dordle opening is working",
          items: [
            "The first guess returns feedback on both boards",
            "Most letters in the opening are common ones",
            "By turn two, each board shows at least one colored tile",
            "You still have five guesses for two partially solved boards"
          ]
        }
      },
      {
        heading: "Reading two feedback grids at once",
        paragraphs: [
          "The unique skill in Dordle is reading two grids simultaneously. One guess produces two feedback rows — one per board — and they rarely agree. A letter that is green on board one can be gray on board two.",
          "The solver removes the mental load: you tap the colors for each board, and it keeps two completely separate candidate lists. Your job is just to enter what you saw; the solver handles the bookkeeping of what is true on which board.",
          "The discipline that matters is not mixing them up. A letter's color on board one has zero bearing on board two, and players who let one board's feedback bleed into their mental model of the other are the ones who run out of turns."
        ]
      },
      {
        heading: "When one board is solved and the other is stuck",
        paragraphs: [
          "The most common Dordle failure is the asymmetric endgame: board one solved by turn four, board two still a mystery with three turns left. That is winnable, but only with maximum-information guesses.",
          "Once a board is solved, every remaining guess is a single-board game with a shrinking budget. Use each guess to eliminate as many candidates as possible, even if the word you type is not the answer — the solver ranks candidates by elimination power for exactly this situation.",
          "If two guesses remain and the board still has several candidates, look for a word that could be the answer itself rather than an elimination play. The solver balances both options and tells you which is safer."
        ]
      },
      {
        heading: "The solver's double-board scoring, explained",
        paragraphs: [
          "Behind the scenes, the Dordle solver scores each candidate word against both remaining lists and reports a combined value. A word that is a plausible answer on board one and reveals strong letters on board two scores far higher than a word that only solves one board.",
          "That combined score is why the solver's suggestions sometimes look odd — a word that is not the answer to either board can still be the best guess because of what it reveals across both.",
          "It also explains the solver's endgame behavior. When the two boards share almost no candidates, the ranking switches to single-board mode automatically, exactly as a strong human player would."
        ]
      },
      {
        heading: "Dordle answers, dailies, and the two-word record",
        paragraphs: ["Dordle releases one two-word puzzle per day, and its answer pairs are a small but revealing dataset: the two words rarely share letters, which is exactly what a good pair looks like from the game designer’s side — two words that force you to sweep a wide letter set.","The solver handles any daily or past Dordle position the same way: maintain both boards, filter both lists, and rank the shared guesses. The daily cadence only changes which words are in play, never the arithmetic.","Players who track the daily answers build a feel for the pairings the game favors, which makes their opening guesses slightly sharper — and the solver keeps the process honest by always suggesting the highest-value shared guess."]
      },
      {
        heading: "Common Dordle mistakes and how to avoid them",
        paragraphs: ["The classic Dordle mistake is solving one board first and then treating the second as a fresh Wordle. Once a board is solved, your guesses no longer earn double value, and a six-guess-per-board mindset burns the shared budget. The solver’s combined scoring exists precisely to keep both boards in play for as long as possible.","The second mistake is repeating letters across your opening words. Dordle rewards coverage, and two openers that share three letters cover barely more ground than one. The solver’s opening suggestions are chosen to add new letters each turn, so the first three guesses give you the widest possible view of both answers.","The third mistake is over-trusting a single board’s feedback. A green letter on board one does nothing for board two, and players who mentally merge the two boards end up with candidates that cannot possibly be right. The solver keeps the boards strictly separate, and you should too.","The winning pattern is disciplined: sweep with high-value openers, read both grids independently, and when the boards diverge, spend each guess where it earns the most — which the ranked suggestion list tells you at a glance."]
      },
      {
        heading: "Dordle solver settings and word lengths",
        paragraphs: ["The Dordle solver supports the same word lengths the game uses, and the double-board filter scales to each one: two candidate lists, filtered in parallel, ranked by combined value. A longer Dordle changes the word pool, not the arithmetic.","For archived puzzles, the solver works on any date — log each board’s feedback as you saw it and the two lists stay perfectly separate. The seven-guess discipline that wins the daily is identical for every puzzle in the archive."]
      },
      {
        heading: "Why Dordle is the perfect bridge game",
        paragraphs: ["Dordle sits exactly between Wordle and the multi-board monsters: one extra board, one extra guess, and the shared-guess mechanic that makes it interesting without being overwhelming. Players who master the two-board discipline find Quordle and Octordle far less intimidating afterward.","The solver bridges the same gap — it teaches the combined-value ranking that the bigger games need, on a scale where you can actually follow what it is doing. Learn Dordle with the solver and the eight-board game stops being a wall."]
      }
    ],
    faqHeading: "Dordle Solver FAQ",
    faqs: [
      {
        question: "What is Dordle?",
        answer:
          "Dordle is a Wordle variant with two hidden five-letter words. You make one guess per turn and receive feedback on both boards, with seven total guesses to solve both words."
      },
      {
        question: "How many guesses do you get in Dordle?",
        answer:
          "Seven guesses for two boards. Because guesses are shared, the effective budget per board is about three and a half turns — which is why shared-letter openers matter so much."
      },
      {
        question: "Can one guess help both Dordle boards?",
        answer:
          "Yes, and that is the entire strategy. A guess that reveals letters on both boards is effectively two turns in one, so the solver ranks words by their combined value across both candidate lists."
      },
      {
        question: "What is the best Dordle opening word?",
        answer:
          "The same high-value openers that work in Wordle, like CRANE or SLATE, work in Dordle because they cover common letters and could plausibly be either answer."
      },
      {
        question: "Does the Dordle solver keep the boards separate?",
        answer:
          "Yes. It maintains an independent candidate list for each board and filters them separately as you enter each board's feedback, so a green on board one never contaminates board two's candidates."
      },
      {
        question: "Is Dordle harder than Wordle?",
        answer:
          "The words are equally common, but the shared-guess mechanic makes it harder: a guess that only helps one board wastes half its value, so you must think about both answers with every turn."
      }
    ],
    relatedLinks: [
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/octordle-solver", label: "Octordle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  },
