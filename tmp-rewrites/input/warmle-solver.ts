    key: 'warmle-solver',
    eyebrow: 'Warmle Solver Guide',
    intro:
      "Warmle is the Wordle variant where yellow means something completely different: instead of \"right letter, wrong position,\" a yellow tile means the letter is alphabetically close to the answer letter in that same position. The game literally tells you when you are getting warm. That small rule change turns Warmle into a game about the alphabet — every yellow tile is a directional hint, and a gray tile means the answer letter is far away rather than absent. The Warmle solver applies that logic to a full dictionary, ranking guesses by how much alphabetic distance they reveal. Here is how the mechanic works and how to use it.",
    sections: [
      {
        heading: "Yellow means close, not misplaced",
        paragraphs: [
          "In standard Wordle a yellow tile means the letter exists elsewhere in the word. In Warmle a yellow tile means the letter you guessed is alphabetically near the true letter in the same position — usually within a small distance threshold that the solver lets you set.",
          "That flips the meaning of the board completely. A yellow on the first letter means the answer's first letter is close to yours in the alphabet, not that your letter appears somewhere else.",
          "The practical upshot: a Warmle board reads like a set of five mini-riddles, each one a position where the alphabet has been narrowed to a small window around your guess."
        ],
        callout: {
          title: "Warmth is positional",
          body: "Warmle's yellow is about one position only: it says the true letter in that exact spot sits close to your letter in the alphabet. Use it to walk toward the letter, position by position."
        }
      },
      {
        heading: "Reading the three verdicts in Warmle",
        paragraphs: [
          "Green works exactly as in Wordle: the letter is correct in that position. Yellow means alphabetically close in that same position. Gray means the true letter is far away alphabetically — and crucially, it does not mean the letter is absent from the word.",
          "The gray nuance matters more than any other detail in Warmle. A gray on a common letter like A in the first position tells you the answer's first letter is far from A — toward the other end of the alphabet — but says nothing about whether A appears elsewhere.",
          "Because distance is relative, the same tile means different things depending on your guess. The solver standardizes this by computing, for every candidate word, the exact alphabetic distance between your guessed letter and the candidate's letter at each position."
        ]
      },
      {
        heading: "The distance threshold, and why it matters",
        paragraphs: [
          "Warmle defines \"close\" with a distance threshold — commonly around three or four positions in the alphabet. The Warmle solver exposes that setting so your feedback matches the game's exact rule.",
          "If the game uses a threshold of three, a guessed letter within three alphabet steps of the true letter counts as yellow, and anything farther is gray. Getting the threshold wrong makes every subsequent deduction wrong, which is why the solver lets you tune it.",
          "The threshold also shapes strategy: with a larger threshold, yellow tiles are easy to get but weak as hints; with a smaller one, yellows are rarer but each one pins the letter to a very tight window."
        ],
        list: {
          title: "Warmle clue-reading checklist",
          items: [
            "Green: exact match in that position — lock it",
            "Yellow: the true letter is alphabetically near yours in that spot",
            "Gray: the true letter is alphabetically far — walk the other way",
            "Gray does NOT remove your letter from the word entirely",
            "Match the solver's distance setting to the game's threshold"
          ]
        }
      },
      {
        heading: "How the solver walks the alphabet",
        paragraphs: [
          "The Warmle solver treats each position independently. For every candidate word it computes how your guess's letter compares with the candidate's letter at each position, then keeps only the candidates whose distances match every verdict you entered.",
          "The ranking then rewards guesses that split the alphabet cleanly. A probe letter near the middle of a position's remaining window reveals the most information whether the verdict is yellow or gray.",
          "That is why the solver's suggestions sometimes look like odd words: in Warmle, a word full of mid-alphabet letters in the right positions is far more valuable than a common word with extreme letters."
        ]
      },
      {
        heading: "The winning Warmle strategy",
        paragraphs: [
          "Open with a word that spreads letters across the alphabet rather than clustering them — you want a first clue that tells you about the extremes and the middle of the alphabet at once.",
          "When a position returns yellow, your next guess for that position should be a letter a couple of steps toward where the true letter might be, effectively walking toward it. The solver shows the remaining window for each position, so you always know which direction to walk.",
          "And when a position returns gray, do not waste a guess trying letters near your first choice — jump to the opposite end of the window. Each gray cuts the alphabet in half for that position, which is exactly the elimination the solver counts on."
        ]
      },
      {
        heading: "Warmle answers and the alphabet’s daily walk",
        paragraphs: ["Warmle answers are ordinary five-letter words, but the game’s feedback makes them feel like a different species: every clue is a set of five alphabetic distances rather than a set of letter verdicts. Studying past answers reveals why the game works — most five-letter words sit comfortably in the mid-alphabet, so the warmth mechanic stays meaningful all game.","The solver’s per-position windows are exactly the tool the daily game rewards. Each new Warmle puzzle is a fresh walk through the alphabet, and the solver walks it faster than any human can.","Keep the distance threshold matched to the game and the solver will land most dailies inside the six-guess budget, with the answer usually appearing on its ranked list two or three turns before you would have found it by hand."]
      },
      {
        heading: "Common Warmle mistakes and how to avoid them",
        paragraphs: ["The most common Warmle mistake is carrying over Wordle instincts: treating yellow as misplaced and gray as absent. Both readings are wrong in Warmle, and players who do not unlearn them will draw conclusions that point in entirely the wrong direction. Warmle yellow is a proximity signal; Warmle gray is a distance signal.","The second mistake is guessing clustered letters. In Wordle, a word full of common letters is a good opener; in Warmle, the same word tells you almost nothing, because all its letters live in the same alphabet region. The solver’s ranking corrects for this by preferring words spread across the alphabet.","The third mistake is ignoring the distance threshold. If the game uses a threshold of three and you assume four, half your yellows will be misread as grays, and every deduction downstream will be wrong. Matching the setting is not optional — it is the difference between solving and flailing.","The winning pattern is to walk, not guess: read each position’s remaining window, probe its midpoint, and use every yellow as a step toward the true letter. The solver shows the windows, so the walk is always visible."]
      },
      {
        heading: "Warmle solver settings and word lengths",
        paragraphs: ["The Warmle solver exposes the distance threshold and supports every word length the game uses. The threshold must match the game’s rule exactly, because every yellow-and-gray deduction flows from it; the length setting only changes which dictionary loads.","For past puzzles, the solver works on any date — enter the clues with the correct threshold and the alphabet windows rebuild from scratch. The walk-the-alphabet strategy that wins the daily is the same for every archived puzzle."]
      }
    ],
    faqHeading: "Warmle Solver FAQ",
    faqs: [
      {
        question: "What is Warmle?",
        answer:
          "Warmle is a Wordle variant where yellow tiles mean the guessed letter is alphabetically close to the true letter in the same position, rather than meaning the letter is misplaced."
      },
      {
        question: "What does yellow mean in Warmle?",
        answer:
          "Yellow means the answer letter in that exact position is alphabetically near your guessed letter, usually within a small distance threshold. It is a warmth hint, not a misplaced-letter hint."
      },
      {
        question: "What does gray mean in Warmle?",
        answer:
          "Gray means the true letter in that position is alphabetically far from your guess. Unlike Wordle, it does not mean your letter is absent from the word."
      },
      {
        question: "How does the Warmle solver work?",
        answer:
          "It computes the alphabetic distance between your guessed letters and every candidate word's letters at each position, keeps only the candidates consistent with all verdicts, and ranks guesses by how much alphabetic information they would reveal."
      },
      {
        question: "Why is there a distance setting in the solver?",
        answer:
          "The game defines \"close\" with a threshold. The solver's distance setting lets you match that threshold exactly so its deductions line up with the feedback you actually received."
      },
      {
        question: "What is the best Warmle opening?",
        answer:
          "A word whose letters are spread across the alphabet, so your first clue maps the extremes and the middle at once. Clustered letters waste the warmth mechanic."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/hardle-solver", label: "Hardle Solver" },
      { href: "/woodle-solver", label: "Woodle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" }
    ]
  },
