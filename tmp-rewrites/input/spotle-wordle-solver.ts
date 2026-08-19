    key: 'spotle-wordle-solver',
    eyebrow: 'Spotle Wordle Solver Guide',
    intro:
      "Spotle Wordle is the wordlebot's five-letter variant with rank-based feedback: every letter in your guess comes back as green, yellow, gray, or blank depending on where it sits in the answer, but with the twist that the verdicts are computed against a ranked letter model rather than plain position logic. The same page also covers Thirdle, the three-letter Wordle with three guesses, because the two games share the same solver engine. Whether you are untangling a five-letter Spotle Wordle or cracking a three-letter Thirdle, the solver filters the exact candidate pool your game uses. Here is how both modes work.",
    sections: [
      {
        heading: "Spotle Wordle feedback, explained",
        paragraphs: [
          "Spotle Wordle plays like Wordle with an extra verdict: each tile can be green, yellow, gray, or blank. The blank tile is the game's signature — it carries a different meaning from gray, and reading the difference is the first skill.",
          "Green means the letter is exactly right in that position. Yellow means the letter belongs to the answer but sits elsewhere. Gray rules the letter out. Blank is the rank-based signal that sets Spotle Wordle apart from standard Wordle.",
          "The solver accepts all four verdicts per tile, so whatever the game shows you, the candidate filter can consume it exactly as-is."
        ],
        callout: {
          title: "Four verdicts, one filter",
          body: "Spotle Wordle tiles come in green, yellow, gray, and blank. The solver consumes all four exactly as shown, so you never have to translate the game's feedback."
        }
      },
      {
        heading: "Thirdle: the three-letter sprint",
        paragraphs: [
          "Thirdle is Wordle compressed: three-letter words, three guesses, and no mercy. With only three turns, there is no room for a discovery phase — every guess must both test letters and position them.",
          "The solver treats Thirdle as its own mode because the dictionary and the strategy are different. Three-letter words repeat letters more often and share more letters with each other, so the overlap math is tighter.",
          "Your first Thirdle guess should be a high-frequency three-letter word that could plausibly be the answer, because in three guesses there is no second chance to sweep the alphabet."
        ],
        list: {
          title: "Thirdle essentials",
          items: [
            "Three guesses for a three-letter word",
            "Open with a common word that could be the answer itself",
            "Vowels are scarce — guess them early",
            "Repeated letters are common in three-letter words",
            "The solver narrows the three-letter dictionary with every clue"
          ]
        }
      },
      {
        heading: "One solver, two games",
        paragraphs: [
          "The same solver page handles both modes because both games filter the same way: feed in guesses and verdicts, and the engine eliminates every word that contradicts them. The difference is the dictionary and the budget.",
          "In Spotle Wordle mode the solver works against the five-letter pool with six guesses and the full four-verdict system. In Thirdle mode it switches to the three-letter dictionary with three guesses and standard green-yellow-gray logic.",
          "If you arrived at this page from an old Thirdle link, you are in the right place — the two games share this solver, and the interface lets you pick the mode before you start."
        ]
      },
      {
        heading: "The strategy that wins both modes",
        paragraphs: [
          "For Spotle Wordle, treat the blank verdict as your richest signal: a blank narrows the letter's possible meanings far more than a gray, so build your model of the answer around which positions came back blank.",
          "For Thirdle, speed is everything. Guess a common word first, then use the solver's candidate list to find a second guess that splits the survivors evenly — the third guess should be the answer itself.",
          "In both modes the solver's ranked suggestions do the heavy lifting: they tell you which word reveals the most information next, which is the difference between playing reactively and playing to win."
        ]
      },
      {
        heading: "How the solver ranks its suggestions",
        paragraphs: [
          "The ranking engine scores each candidate word by how evenly its possible feedback splits the remaining dictionary. A word that could plausibly return several different verdict patterns is more informative than one whose verdict is predictable.",
          "That is the same information-theory logic that powers the best Wordle solvers, adapted to the four-verdict system of Spotle Wordle and the compressed three-guess budget of Thirdle.",
          "The result is a suggestion list that reads like a pro player's thought process: first a word that splits the field, then the word that closes the remaining gap, then the answer."
        ]
      },
      {
        heading: "Spotle Wordle and Thirdle answers, both modes daily",
        paragraphs: ["Spotle Wordle releases a five-letter daily, and Thirdle releases its own three-letter sprint — two puzzles, two budgets, one solver page. The daily answers in both games stick to common words, which keeps the feedback readable and the games fair.","The dual-mode page means a single bookmark covers both dailies: use Spotle Wordle mode for the five-letter puzzle with its four verdicts, then switch to Thirdle mode for the three-guess sprint.","It is the rare solver page that genuinely covers two games, and the reason it works is that both games share the same elimination engine — the dictionaries and budgets differ, the logic does not."]
      },
      {
        heading: "Common Spotle Wordle and Thirdle mistakes",
        paragraphs: ["The most common Spotle Wordle mistake is treating the blank verdict as a gray. The blank tile is the game’s rank-based signal and carries meaning that gray does not, so conflating the two destroys the model you are building. The solver consumes all four verdicts exactly as shown, which is why its candidate lists stay accurate while hand-played models drift.","The most common Thirdle mistake is wasting the first guess. With only three turns, there is no discovery phase — your first word must both test letters and position them, which means opening with a common word that could plausibly be the answer itself.","The shared mistake across both modes is ignoring the ranked suggestions. The solver ranks words by how evenly their possible feedback would split the survivors, which is the difference between playing reactively and playing with a plan.","The winning pattern for both games is the same: log every clue faithfully, read the ranked list, and play the top suggestion that fits everything you know. In Thirdle that usually means the answer by guess three; in Spotle Wordle, comfortably inside six."]
      },
      {
        heading: "Spotle Wordle and Thirdle solver settings",
        paragraphs: ["The solver’s mode selector is the one setting that matters: Spotle Wordle mode loads the five-letter dictionary with the four-verdict system, and Thirdle mode loads the three-letter dictionary with the three-guess budget. Switching modes does not reset your entered guesses, so you can experiment without losing your place.","Both modes work on any puzzle date, because the elimination engine is date-agnostic. Whether you are chasing today’s five-letter daily or a past three-letter Thirdle, the ranked suggestions are always computed from the guesses you have actually entered."]
      },
      {
        heading: "One page, two dailies, no waiting",
        paragraphs: ["The practical payoff of the merged page is that a single bookmark covers both daily puzzles. When the Spotle Wordle answer is eluding you and the Thirdle sprint is already running, you switch modes on the same page, log both games’ clues, and get ranked suggestions for each without navigating anywhere.","That convenience is the reason the page exists, and it is also the reason the solver’s dual-mode design matters: two games, two dictionaries, two budgets, one consistent elimination engine under the hood. It is the kind of small structural win that keeps the solver open in a tab all week, ready for whichever daily fires first."]
      }
    ],
    faqHeading: "Spotle Wordle Solver FAQ",
    faqs: [
      {
        question: "What is Spotle Wordle?",
        answer:
          "Spotle Wordle is a five-letter Wordle variant with four verdicts per tile — green, yellow, gray, and blank — where the blank tile is a rank-based signal that standard Wordle does not have."
      },
      {
        question: "What is Thirdle?",
        answer:
          "Thirdle is a three-letter Wordle variant with just three guesses. It shares this solver page with Spotle Wordle, so you can pick either mode before you start."
      },
      {
        question: "What does the blank tile mean in Spotle Wordle?",
        answer:
          "The blank verdict is the game's rank-based signal, distinct from gray. The solver consumes it exactly as the game shows it, so you never need to translate the feedback yourself."
      },
      {
        question: "How many guesses do you get in each mode?",
        answer:
          "Spotle Wordle gives you six guesses for a five-letter word. Thirdle gives you three guesses for a three-letter word — a deliberately brutal sprint."
      },
      {
        question: "How does the solver work for both games?",
        answer:
          "It maintains the correct dictionary for the selected mode — five-letter words for Spotle Wordle, three-letter words for Thirdle — and eliminates every candidate that contradicts your guesses and verdicts."
      },
      {
        question: "I used an old Thirdle link. Am I in the right place?",
        answer:
          "Yes. Thirdle was merged into this solver page, which supports both the standard three-letter Thirdle rules and the Spotle Wordle five-letter mode. Pick the mode in the interface and enter your clues as usual."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/spotle-solver", label: "Spotle Solver" },
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/hardle-solver", label: "Hardle Solver" }
    ]
  },
