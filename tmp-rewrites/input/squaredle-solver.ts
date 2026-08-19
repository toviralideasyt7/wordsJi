    key: 'squaredle-solver',
    eyebrow: 'Squaredle Solver Guide',
    intro:
      "The Squaredle Solver finds every valid word path on any 4x4 board — the official daily puzzle or a custom grid you paste in. It runs the full dictionary in your browser, marks common and bonus words separately, and shows the exact path for each match. This guide explains the path rules, why completeness is the real challenge in Squaredle, and how to use the solver to get better at finding words yourself.",
    sections: [
      {
        heading: "How word paths work in Squaredle",
        paragraphs: [
          "Squaredle hands you a grid of letters and asks you to find every valid word. A word is valid when its letters form a connected path: each next letter must be adjacent to the previous one, including diagonals, and you cannot reuse a cell within the same word. That is the entire rule set — and it is surprisingly restrictive once you try to find everything.",
          "The solver applies the same rules over the full dictionary. It walks every possible path on the board, checks each one against the word list, and records the matches. Because the board is small but the path tree is large, this is exactly the kind of exhaustive search a human cannot do by hand — and exactly what makes Squaredle satisfying: the board always holds more words than you first see.",
          "The official daily puzzle adds a second layer: the answer list is split into common words and bonus words. Common words are the ones the game expects you to find; bonus words are the rest of the dictionary that happens to fit. The solver separates them so you can compare against the official list."
        ]
      },
      {
        heading: "Why completeness is harder than finding words",
        paragraphs: [
          "Anyone can find a dozen words on a Squaredle board. The challenge is finding all of them, and that is a different skill. The human brain loves the familiar — it spots common prefixes like ST, TR, and PL first, then starts recycling the same vowels and misses the words hiding in diagonal paths.",
          "The solver demonstrates the gap on every board: run it on a board you just played and compare its full list to yours. The words you missed are almost always short ones (4 letters), diagonal ones, or words built across the middle of the grid where your eye stopped looking.",
          "That comparison is the entire training value. Once you know the shape of your blind spots — and every player has the same few — you start scanning for them deliberately, and your found-word count climbs on every subsequent board."
        ],
        list: {
          title: "What the solver teaches you about scanning",
          items: [
            "Start with short words: 4-letter words are the largest share and the easiest to miss",
            "Check diagonal paths — they are the first thing the eye skips",
            "Look for common suffixes like -ER, -ED, and -ING early; they multiply quickly",
            "Re-scan the board after every few finds; a word can hide behind a word you already saw",
            "Use the solver after the fact, never during a live game, to protect the challenge"
          ]
        }
      },
      {
        heading: "Loading today's official puzzle or a custom grid",
        paragraphs: [
          "The solver accepts two inputs. Load today pulls the official Squaredle board and its word list, so you can compare your finds against the real puzzle. Paste a custom grid lets you type any arrangement of letters, which is how you solve boards from screenshots, challenges, or your own practice grids.",
          "Once the board is in, the solver runs locally — the dictionary loads once in your browser and everything after that is instant. There is no server round trip between guesses, and nothing you type leaves your machine.",
          "The official-puzzle mode has a useful extra: it highlights which of your candidate words are actually in the official list versus dictionary-only. That distinction is the difference between feeling done and actually being done, and it is the most common source of the 'I found everything' frustration."
        ],
        callout: {
          title: "The one-line Squaredle truth",
          body: "Every board hides more words than you see on the first pass. The solver finds them all; the game is training yourself to see what it finds."
        }
      },
      {
        heading: "Squaredle versus Boggle: the same rules, different goals",
        paragraphs: [
          "Squaredle and Boggle share the adjacency rules, but the goals are opposites. Boggle rewards speed — find a handful of long words before the timer. Squaredle rewards completeness — find every word, common and bonus, with no timer at all.",
          "That is why the solver is built the way it is. A Boggle solver wants the longest words fast. A Squaredle solver wants every word, including the 4-letter ones you would never bother shouting in Boggle. If you come to Squaredle from Boggle, the adjustment is exactly this: slow down and finish the board instead of racing to ten words.",
          "The skill transfer goes both ways. Boggle players who train with Squaredle boards report seeing more words in the same time, because completeness training sharpens pattern recognition. The solver is the checklist that makes that training measurable."
        ]
      },
      {
        heading: "Patterns that multiply your word count",
        paragraphs: [
          "The fastest way to improve your raw Squaredle total is to hunt word families instead of individual words. When you spot the word TRAIN, the letters T-R-A-I-N are a resource: TRADE, TRAIL, STRAIN, RETAIN, and TRAINED all grow from the same core, and a good scanner checks the extensions before moving on. The solver does this automatically, which is why its list always contains whole families you missed.",
          "Vowel-heavy hubs deserve a second pass. Boards with clusters of vowels like AI, OU, and EA generate an outsized share of words because they form the middle of so many combinations. Re-scan the board for vowels after your first sweep — the words built through them are the ones you saw but did not read.",
          "The final multiplier is the reuse trick. A word like PLANE and a word like PEARL use the same letters in different orders, and the board that supports one often supports the other. The solver's path view makes these visible: two highlighted paths through the same cells in different orders. Training your eye to flip letter orders is the difference between a 40-word board and a 60-word board."
        ],
        callout: {
          title: "The family rule",
          body: "Find one word, then mine its letters. Every board word is a seed for three or four more, and the solver shows you the whole crop."
        }
      },
      {
        heading: "The word-finding habits that win Squaredle",
        paragraphs: [
          "Squaredle is Boggle's daily sibling: a grid of letters where you find as many words as possible, often with a theme word hidden in the mix. The solver finds every word, and studying its list reveals the habits that win: anchor on vowels, trace every adjacent path, and never skip the rare letters.",
          "The theme word is the daily prize. Most Squaredle grids hide a long theme word that connects the day's puzzle, and the solver's list surfaces it — along with the words that share its letters, which are usually the highest-value finds on the board.",
          "The grid's structure rewards systematic scanning. Words can snake in any direction, so a player who scans the board in a fixed pattern — row by row, then diagonal by diagonal — finds more words than a player who lets the eye wander. The solver's exhaustive search is that discipline, automated.",
          "Finally, the daily reveal teaches the grid's vocabulary bias. Squaredle favors common words with a few longer treasures, and knowing the pool's shape — everyday vocabulary plus a theme word — reshapes your guessing from the start."
        ]
      },
      {
        heading: "Squaredle solver settings and daily practice",
        paragraphs: [
          "The Squaredle solver is built for the daily grid, and a little setup makes it complete. Enter the grid exactly as the game shows it — every letter in every cell — and the solver will find every valid word, including the hidden theme word.",
          "The theme word is the daily prize, and the solver's list surfaces it along with its letter-sharing companions. Studying those words teaches you the grid's construction — how the theme word's letters anchor the other finds — and that awareness improves your manual scanning.",
          "The solver's exhaustive search is the discipline lesson. It never skips a diagonal, never misses a rare letter, never abandons a path early — and watching its complete list shows you exactly which finds your own scan skips.",
          "Finally, use the solver as a daily checker. Find as many words as you can on your own, run the solver, and compare — the words you missed are the ones your eye pattern does not see, and each comparison sharpens your scanning."
        ]
      },
    ],
    faqHeading: "Squaredle Solver Questions",
    faqs: [
      {
        question: "What are the word rules in Squaredle?",
        answer:
          "Words must be at least four letters long, each letter must be adjacent to the previous one (including diagonals), and you cannot reuse a cell within the same word. Common and bonus words are counted separately in the daily puzzle."
      },
      {
        question: "Does the Squaredle solver load today's official puzzle?",
        answer:
          "Yes. Load today pulls the official board and its word list, then solves it locally and separates common from bonus words so you can compare against the real puzzle."
      },
      {
        question: "Can I solve a custom board?",
        answer:
          "Yes. Paste any grid of letters and the solver will find every valid word path using the same dictionary and rules, with the exact path shown for each word."
      },
      {
        question: "How many words does a typical Squaredle board have?",
        answer:
          "A standard 4x4 board usually holds 40 to 80 valid words, common and bonus combined. Larger boards can pass 100. The solver shows you the true total for any board."
      },
      {
        question: "Is using a Squaredle solver cheating?",
        answer:
          "For a live game, yes. Used after the fact to learn where you miss words, it is one of the best training tools for the game — the blind spots it reveals are almost always the same ones."
      }
    ],
    relatedLinks: [
      { href: "/squaredle-answer-today", label: "Squaredle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/boggle-solver", label: "Boggle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/hangman-solver", label: "Hangman Solver" },
      { href: "/word-ladder-solver", label: "Word Ladder Solver" }
    ]
  },
