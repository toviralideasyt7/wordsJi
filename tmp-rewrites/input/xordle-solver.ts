    key: 'xordle-solver',
    eyebrow: 'Xordle Solver Guide',
    intro:
      "Xordle is the Wordle variant that hides two words behind one row of feedback. You type a normal five-letter guess, and each position comes back showing the merged result of two hidden letters — one from each of the two secret words. Decoding that merged clue is the whole game, and it is exactly what the Xordle solver does for you: it keeps candidate lists for both hidden words, tries every possible split of the merged feedback, and tells you which words are still alive after each guess. Here is how the merge works and how to read it.",
    sections: [
      {
        heading: "How the Xordle merge works",
        paragraphs: [
          "In Xordle, two five-letter words are hidden, and each of your guesses is scored against both of them at once. The feedback row you see merges the two results position by position, so a single colored tile can represent two different letters.",
          "The solver's job starts with decoding: for every position, it enumerates the possible hidden letters that could have produced the tile you saw, and then it intersects that possibility set with both candidate dictionaries.",
          "That decoding is where human players lose. A green tile means at least one of the two hidden words has that exact letter in that position, but you cannot tell which word — and a yellow tile is even more ambiguous, because it could come from either hidden word in either position."
        ],
        callout: {
          title: "One tile, two truths",
          body: "Every Xordle tile is a merge of two verdicts. The solver enumerates every split, so you never have to guess which word produced the color."
        }
      },
      {
        heading: "The nine-guess budget and the two-word picture",
        paragraphs: [
          "Xordle gives you nine guesses, which is generous compared with Wordle's six — but the information per guess is genuinely murkier, because the merge hides which word is which.",
          "The first two or three guesses should be ordinary high-frequency openers, exactly like Wordle. The merge is hardest to read early, when both candidate lists are still huge, and a normal salvo narrows both lists at once.",
          "The solver's ranked suggestions in the opening look like normal Wordle openers for the same reason: with both dictionaries full, the best move is still to sweep the most common letters."
        ],
        list: {
          title: "Reading the merged clues correctly",
          items: [
            "A green tile means one of the two words has that letter in that spot",
            "A yellow tile means the letter exists somewhere in one of the two words",
            "A gray tile means the letter is in neither word — the only unambiguous verdict",
            "Double green on a position means both words have that letter there",
            "The same guess is scored against both words, so every tile is two verdicts in one"
          ]
        }
      },
      {
        heading: "Why gray tiles are your best friends",
        paragraphs: [
          "The only fully unambiguous Xordle feedback is gray: it means the letter is absent from both hidden words. Every gray you collect removes that letter from both dictionaries at once, which is why a guess full of common letters is still the right play even though the colors are hard to read.",
          "The solver leans on grays heavily in its scoring. A candidate guess that would confirm or deny a high-value letter in both lists scores better than one that only probes a single board.",
          "As the game progresses, the balance shifts: once you have a decent picture of both words, greens and yellows start to dominate the ranking because they finally have enough context to pin down specific words."
        ]
      },
      {
        heading: "The endgame: resolving the split",
        paragraphs: [
          "With a few guesses left, the ambiguity concentrates in the split itself — you may know the exact set of letters but not which word owns which. That is when the solver's candidate enumeration earns its keep.",
          "It maintains two separate filtered lists and reports them side by side, so you can see the two words converging. When a word appears on both lists, the solver flags it: that word is consistent with every clue for both hidden answers.",
          "The final guesses in Xordle are often confirmations rather than discoveries — you play words that distinguish the two remaining candidates, and the solver tells you which word the feedback points to."
        ]
      },
      {
        heading: "The strategy that wins Xordle",
        paragraphs: [
          "Phase one, guesses one to three: sweep common letters with standard openers and let the solver decode the merged rows into two live candidate lists. Phase two, guesses four to six: probe the letters the merge left ambiguous, using words that would split the candidates cleanly.",
          "Phase three, guesses seven to nine: resolve the two words. By then the solver usually has each word narrowed to a handful of candidates, and the feedback from your probe guesses identifies which is which.",
          "The discipline that wins Xordle is never trying to out-think the merge. Enter the feedback exactly as shown, let the solver enumerate every split, and spend your guesses on words the solver ranks — the merge is decodable, but only systematically."
        ]
      },
      {
        heading: "Xordle answers and the two-word merge in practice",
        paragraphs: ["Every Xordle puzzle hides two five-letter words, and the daily answers show the game’s taste: pairs of common words that share few letters, so the merged feedback stays readable. The solver’s two candidate lists mirror exactly that structure.","What makes Xordle answers interesting to study is the pair logic — the game picks words that are independently common but collectively distinctive, which is why the merge never collapses into an unreadable mess.","Whether you are solving today’s puzzle or replaying an archived one, the solver applies the same decoding: enumerate every split of the merged tiles, keep both lists consistent, and rank the next guess by how cleanly it would split the survivors."]
      },
      {
        heading: "Common Xordle mistakes and how to avoid them",
        paragraphs: ["The most common Xordle mistake is reading the merged tile as if it belonged to a single word. A green tile in position three does not mean your letter is correct in your word — it means one of the two hidden words has that letter there, and the solver exists to keep both interpretations alive.","The second mistake is ignoring gray tiles as a source of truth. Because gray is the only unambiguous verdict, it is the strongest evidence you have, and players who treat it as weakly as they treat ambiguous greens lose the game’s one reliable anchor.","The third mistake is guessing a word that is not a plausible answer to either hidden word. With nine guesses the budget feels generous, but every wasted probe costs you the resolution phase, when you actually need two or three turns to separate the final candidates.","The solver keeps the two candidate lists visible as they converge, so you always know how much ambiguity is left. When both lists are down to a handful of words, spend your probes distinguishing them rather than discovering new letters — the discovery phase is over."]
      },
      {
        heading: "Xordle solver settings and word lengths",
        paragraphs: ["The Xordle solver supports every word length the game uses, and the merge-decoding logic scales to each one: every merged tile is enumerated into its possible splits, and both hidden-word lists are filtered against all of them.","For past puzzles, the solver works on any date — enter the merged feedback exactly as shown, and the two candidate lists rebuild from scratch. The nine-guess budget is the same for every puzzle, and the decode-first discipline that wins the daily never changes."]
      }
    ],
    faqHeading: "Xordle Solver FAQ",
    faqs: [
      {
        question: "What is Xordle?",
        answer:
          "Xordle is a Wordle variant where two hidden five-letter words share one feedback row per guess. Each colored tile merges the verdicts from both hidden words, so a single tile can hide two different letters."
      },
      {
        question: "How many guesses do you get in Xordle?",
        answer:
          "Nine guesses, compared with six in Wordle. The extra turns compensate for the ambiguity of the merged feedback."
      },
      {
        question: "How does merged feedback work in Xordle?",
        answer:
          "Every position of your guess is scored against both hidden words at once and the results are merged into one tile. A green tile means at least one hidden word has that letter in that position; only a gray tile is fully unambiguous."
      },
      {
        question: "What does the Xordle solver do differently?",
        answer:
          "It keeps separate candidate lists for the two hidden words, enumerates every possible split of each merged tile, and filters both lists against all of them — decoding the merge exhaustively instead of by intuition."
      },
      {
        question: "What is the best Xordle opening?",
        answer:
          "Standard high-frequency openers like CRANE or SLATE work well because they narrow both hidden word lists at once and produce the most readable early merge."
      },
      {
        question: "Can the solver handle any Xordle position?",
        answer:
          "Yes. It works for any puzzle date and any word length the game uses — enter your guesses and the merged colors, and it maintains both candidate lists from there."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/dordle-solver", label: "Dordle Solver" },
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/w-peaks-solver", label: "Wordle Peaks Solver" }
    ]
  },
