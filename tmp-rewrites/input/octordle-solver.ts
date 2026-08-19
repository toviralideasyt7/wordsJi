    key: 'octordle-solver',
    eyebrow: 'Octordle Solver Guide',
    intro:
      "Octordle is Wordle played eight times at once: eight five-letter words share one 13-guess budget, and every guess you type appears on all eight boards at the same time. That single shared budget is what makes Octordle genuinely different from Wordle — you are not solving eight puzzles, you are solving one allocation problem with eight answers. The Octordle solver treats it exactly that way: it filters all eight candidate lists in parallel and shows you which words earn progress on the most boards. Here is how the math works and the strategy that finishes most Octordle grids inside the limit.",
    sections: [
      {
        heading: "Why eight boards change everything",
        paragraphs: [
          "In Wordle you have six guesses for one word. In Octordle you have 13 guesses for eight words — which sounds generous until you notice the trade-off. A guess that only helps one board costs a turn the other seven boards also needed, and a guess that helps several boards is worth several turns at once.",
          "That is the core Octordle skill: every guess should earn progress on as many boards as possible. The solver ranks every candidate by how much information it would reveal across all eight remaining word lists, so a solid common word beats a clever narrow one every time.",
          "The 13-guess budget works out to roughly one to two guesses per board, but the real arithmetic is different: three or four opening guesses that sweep the alphabet, then one or two targeted guesses per unresolved board."
        ],
        callout: {
          title: "Shared guesses, multiplied value",
          body: "A guess that hits three boards is worth three turns. That is the whole game — spend the opening sweeping letters, then finish boards with targeted words."
        }
      },
      {
        heading: "The opening salvo: three guesses, twenty letters",
        paragraphs: [
          "The strongest Octordle opening is a sequence of common words that covers as many distinct high-frequency letters as possible. Because every guess plays on every board, the first three guesses can expose more than twenty different letters across the eight answers.",
          "A typical salvo uses words built from the most common English letters — E, A, R, I, O, T, N, S, L, C, U, D — arranged so that each guess's letters barely repeat. The solver surfaces the best salvo automatically, but the principle is what matters: maximize distinct letters per guess.",
          "After the salvo you will have a rough picture of every board. Some will already show one or two green letters; others will still be a sea of gray. That uneven picture tells you exactly where to aim next."
        ],
        list: {
          title: "What a good Octordle salvo does",
          items: [
            "Covers 20+ distinct letters in three guesses",
            "Favors E, A, R, I, O, T, N, S, L, C, U, D over rare letters",
            "Leaves every board with at least one visible clue",
            "Sets up the second wave of targeted guesses",
            "Costs only three of your 13 turns"
          ]
        }
      },
      {
        heading: "The second wave: finish the boards that are almost done",
        paragraphs: [
          "After the salvo, score each board by how close it looks. A board with two or three green letters is close; a board with nothing but grays is still wide open. The solver shows this pressure directly in its ranked suggestions.",
          "The efficient order is usually to finish the two or three most advanced boards first, because the words that solve them are short and information-rich — each one also reveals more letters for the stuck boards.",
          "Every time you solve a board, stop guessing its letters and let it ride. From that point your guesses are free to focus entirely on the remaining boards, which is exactly how strong players climb out of the middle of the game."
        ]
      },
      {
        heading: "When to pivot into vertical mode",
        paragraphs: [
          "Octordle players describe two phases: horizontal, where every guess sweeps all boards, and vertical, where you commit to solving one board at a time. The switch happens when the remaining boards have too few candidates to share a common guess.",
          "The solver flags that moment. When its suggestions start converging on a single board rather than spreading across several, the shared-guess phase is over — pick the most solvable board and drive it to completion.",
          "Vertical mode is also where the 13-guess budget gets tight. Each board still open costs one to two targeted guesses, and the solver's ranking tells you which board can be closed with the fewest of them."
        ],
        callout: {
          title: "Read the convergence",
          body: "When ranked suggestions stop spreading across boards, stop spreading your guesses too. Commit to the closest board and close it."
        }
      },
      {
        heading: "Scoring the final boards without wasting turns",
        paragraphs: [
          "The last two or three boards are where Octordle games are lost. With three boards open and four guesses left, you cannot afford a guess that helps only one of them.",
          "Look for a word that could plausibly be the answer to two boards at once — if a single guess finishes two boards, it effectively buys you a free turn. The solver's scoring weighs exactly this kind of double-value word ahead of single-board candidates.",
          "And when you truly have no shared word left, choose the board with the fewest remaining candidates and take it down with the most informative guess — a word that rules out the maximum number of possibilities even if it cannot be the answer itself."
        ]
      },
      {
        heading: "Octordle answers, archives, and the daily grid",
        paragraphs: ["Octordle publishes one new set of eight words every day, and the community tracks those answer sets the way Wordle players track their own daily word. Knowing a past Octordle answer set is mostly bragging rights, but the pattern data is genuinely useful: the game reuses common five-letter words across days, and the answer habits show up in the archive.","The solver itself is date-agnostic — it will filter the eight boards for any puzzle, today or past. What the daily cadence changes is your preparation: the same opener works every day, because high-frequency letters never stop being high-frequency.","That is the real Octordle edge. The answers change daily, but the letter math does not, and the solver is built entirely on the letter math."]
      },
      {
        heading: "Common Octordle mistakes and how to avoid them",
        paragraphs: ["The most common Octordle mistake is playing a narrow guess too early. A word that could only ever be the answer to one board is a luxury you cannot afford in the first half of the game, when all eight boards are still wide open. The solver’s ranking punishes exactly this: narrow words score low while boards are unshaped, and only rise once the field has narrowed enough that their specificity is worth the cost.","The second mistake is ignoring the pressure of the 13-guess budget until it is too late. Players who play the first six guesses as if they were playing Wordle often reach the halfway point with six boards still unresolved and only seven guesses left. The solver surfaces the pressure by showing the candidate count per board, so you can see the budget being spent in real time.","The third mistake is refusing to pivot. When the solver’s suggestions start converging on a single board, that is the signal to switch from horizontal sweeping to vertical finishing, and players who keep sweeping past that point burn guesses on boards that are already nearly solved. Learning to read the convergence is the difference between a comfortable Octordle win and a frustrating near-miss.","Finally, do not open with the same word every single day if it stops working. Octordle answers are drawn from a shared pool of common five-letter words, and a salvo that covers high-frequency letters is never wrong, but a salvo you have memorized can bias your reading of the boards. Let the solver’s ranked salvo guide the first three guesses and you will never open into a dead end."]
      }
    ],
    faqHeading: "Octordle Solver FAQ",
    faqs: [
      {
        question: "What is Octordle?",
        answer:
          "Octordle is a Wordle variant with eight hidden words played at once. Every guess applies to all eight boards, and you have 13 guesses total to solve all of them."
      },
      {
        question: "How many guesses do you get in Octordle?",
        answer:
          "Thirteen guesses for eight boards. The daily Octordle also offers extra lives that give you more chances, but the core 13-guess budget is the standard game."
      },
      {
        question: "Is Octordle eight separate Wordle games?",
        answer:
          "Not quite. Each board is a normal five-letter Wordle puzzle, but the guesses are shared, which turns the game into an allocation problem: every guess must earn progress on as many boards as possible."
      },
      {
        question: "What is the best Octordle opening?",
        answer:
          "A three-word salvo built from high-frequency letters, like CRANE, SLOTH, and BUILD. Each guess should add mostly new letters so the first three turns cover 20 or more distinct letters across the eight boards."
      },
      {
        question: "How does the Octordle solver work?",
        answer:
          "The solver maintains a candidate list for each of the eight boards, filters all eight in parallel as you enter feedback, and ranks the next guess by how much progress it earns across every remaining list."
      },
      {
        question: "Can I use the solver for past Octordle puzzles?",
        answer:
          "Yes. The solver works on any position, not just today's puzzle — enter your guesses and the clue colors you saw, and it will filter the candidate lists regardless of the date."
      }
    ],
    relatedLinks: [
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/dordle-solver", label: "Dordle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  },
