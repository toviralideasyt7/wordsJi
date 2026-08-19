    key: 'woodle-solver',
    eyebrow: 'Woodle Solver Guide',
    intro:
      "Woodle is the Wordle variant that strips the board down to numbers: instead of a colored tile for every letter, each guess comes back with just two counts — how many of your letters are in the exact right spot, and how many are in the word but misplaced. That is all the feedback you get. No positions, no colors, no hints about which letters earned which verdict. The Woodle solver plays the same information-poor game and wins anyway, because it knows how to squeeze every bit of signal out of a pair of numbers. Here is how the feedback works and how the solver extracts meaning from it.",
    sections: [
      {
        heading: "Count-only feedback, and why it is brutal",
        paragraphs: [
          "In Woodle, after each guess you learn exactly two numbers: the count of exact matches and the count of misplaced letters. You do not learn which positions are exact, which letters are misplaced, or which letters are absent.",
          "That single change removes the scaffolding Wordle players rely on. A green tile in Wordle pins a letter to a position; in Woodle, a count of two exacts leaves you guessing which two of the five positions are right.",
          "The information is still there — it is just compressed. Every pair of numbers is a constraint on the answer, and the solver's skill is expanding that constraint into a full filter over the dictionary."
        ],
        callout: {
          title: "Two numbers, every clue",
          body: "Exact count and misplaced count are all Woodle gives you. The solver turns those two numbers into a precise filter — every candidate must produce exactly those counts against your guess."
        }
      },
      {
        heading: "What a count pair actually tells you",
        paragraphs: [
          "Suppose you guess CRANE and the game says one exact, two misplaced. The answer contains C, R, A, N, or E somewhere — exactly three of those five letters, no more — and exactly one of them sits in the position CRANE put it.",
          "That narrows the dictionary enormously, because most five-letter words share almost no letters with CRANE. The solver computes the intersection instantly: any candidate whose overlap with your guess is not exactly three letters is gone.",
          "The counts also imply what is absent: if the total is three, the other two guessed letters are not in the answer at all. Woodle makes you deduce absence from arithmetic instead of showing it to you."
        ],
        list: {
          title: "Decoding a Woodle count pair",
          items: [
            "Exact + misplaced = how many of your letters are in the answer",
            "The remaining guessed letters are absent entirely",
            "Exact count = how many are in the right positions",
            "The two numbers together must match for a word to stay alive",
            "Repeated letters change the arithmetic — the solver handles them"
          ]
        }
      },
      {
        heading: "How the solver filters on two numbers",
        paragraphs: [
          "The Woodle solver runs the same check a careful human would run, across the whole dictionary: for every candidate word, it computes the exact-match count and the misplaced count against your guess, and keeps the word only if both numbers match the feedback you received.",
          "That is a much weaker filter than Wordle's colored tiles, which is why Woodle games run longer. The solver compensates by ranking guesses for information: the best guess splits the surviving candidates into the most even distribution of count pairs.",
          "A guess whose possible count pairs are spread evenly across the candidates tells you more than a guess whose pairs clump. That entropy-based ranking is the solver's real engine."
        ]
      },
      {
        heading: "The eight-guess budget and opening strategy",
        paragraphs: [
          "Woodle gives you eight guesses, and you will need them. The opening should be a word whose count pair is maximally informative — again a common-letter word, because the overlap arithmetic does the work.",
          "The solver's opening suggestions look like Wordle openers for a reason: CRANE, SLATE, and their cousins spread letters so that any count pair narrows the field meaningfully.",
          "Because each clue eliminates fewer words than in Wordle, expect the game to feel like a slow grind. The solver keeps the candidate count visible so you can watch it shrink turn by turn."
        ]
      },
      {
        heading: "The Woodle strategy the solver teaches",
        paragraphs: [
          "The winning Woodle pattern is to alternate between discovering letters and placing them. Early guesses are discovery plays — high-overlap words that teach you which letters exist. Later guesses are placement plays — words built from known letters that reveal position via the exact count.",
          "Once you know the letter set, the exact count becomes your positioning tool: try the letters in new arrangements and read the exact number to see how close you are.",
          "The solver automates the whole loop, but following it by hand is a genuine skill — and players who learn Woodle's arithmetic usually find their Wordle play sharpens too, because they stop relying on colored tiles and start thinking about what the numbers imply."
        ]
      },
      {
        heading: "Woodle answers and the count-only daily grind",
        paragraphs: ["Woodle answers are common five-letter words, but with count-only feedback every daily puzzle turns into an arithmetic exercise. The game’s choice of common answers is deliberate: obscure words would make the count pair almost unreadable, while common words keep the overlap math meaningful.","The solver turns the grind into a routine: log each guess and its two numbers, watch the candidate count drop, and let the ranking pick the next probe. Most dailies resolve inside the eight-guess budget with room to spare.","The discipline the game teaches carries over to every other wordle variant — once you have learned to think in terms of what the numbers imply, colored tiles feel like luxury."]
      },
      {
        heading: "Common Woodle mistakes and how to avoid them",
        paragraphs: ["The most common Woodle mistake is trying to play it like Wordle — expecting position information from every clue. Woodle gives you numbers, not positions, and players who keep waiting for a green tile to pin a letter down will find themselves out of guesses before the shape of the word ever appears.","The second mistake is ignoring the arithmetic. The sum of the two counts tells you how many of your guessed letters are in the answer, and the exact count tells you how many are placed. Players who do not do the subtraction are playing with half the information.","The third mistake is repeating a guessed letter early. With count-only feedback, a repeated letter wastes one of your five probes — you could have learned about two letters instead of one, and in an eight-guess game, wasted probes compound.","The winning pattern is to alternate discovery and placement: first learn the letter set with high-overlap words, then place those letters with the exact count as your guide. The solver’s ranked suggestions automate both phases, and the candidate counter keeps you honest about how much is left."]
      },
      {
        heading: "Woodle solver settings and word lengths",
        paragraphs: ["The Woodle solver accepts the exact-and-misplaced count pair for every guess and applies the same arithmetic to every word length the game supports. Longer words change the numbers, not the method: the overlap math and the exact count still filter the dictionary precisely.","For archived puzzles, the solver works on any date — log each guess and its two numbers, and the candidate counter shows the field shrinking turn by turn. The count-pair discipline is identical whether you are playing today’s daily or a puzzle from months ago."]
      },
      {
        heading: "Why Woodle rewards arithmetic players",
        paragraphs: ["Woodle strips away the colors and leaves the math, and players who enjoy that trade find the game quietly elegant: every clue is a clean two-number constraint, and the answer is whatever word satisfies all of them. There is no luck in Woodle, only overlap arithmetic.","The solver runs that arithmetic across the whole dictionary in an instant, which is why it lands most dailies inside eight guesses. And the habit it teaches — reading counts as constraints — makes every other word game feel easier."]
      }
    ],
    faqHeading: "Woodle Solver FAQ",
    faqs: [
      {
        question: "What is Woodle?",
        answer:
          "Woodle is a Wordle variant that gives only two numbers as feedback per guess: how many of your letters are exact matches and how many are misplaced. There are no per-position colors."
      },
      {
        question: "How does Woodle feedback work?",
        answer:
          "After each guess you receive a count of exact matches and a count of misplaced letters. The sum tells you how many of your guessed letters are in the answer, and the exact count tells you how many are correctly placed."
      },
      {
        question: "Is Woodle harder than Wordle?",
        answer:
          "Yes. The compressed feedback removes position information from every clue, so each guess eliminates fewer candidates. Woodle grants eight guesses to make up for it."
      },
      {
        question: "How does the Woodle solver work?",
        answer:
          "It computes the exact and misplaced counts for every candidate word against your guess and keeps only the words whose counts match your feedback exactly. Its ranking favors guesses that split the remaining candidates evenly."
      },
      {
        question: "What is the best Woodle opening?",
        answer:
          "A common five-letter word with high-frequency, non-repeating letters, such as CRANE or SLATE. The overlap arithmetic against such words produces the most informative count pairs."
      },
      {
        question: "Can the solver handle repeated letters?",
        answer:
          "Yes. Repeated letters change how exact and misplaced counts are computed, and the solver applies the correct arithmetic for each candidate word, including duplicates."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/warmle-solver", label: "Warmle Solver" },
      { href: "/hardle-solver", label: "Hardle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/w-peaks-solver", label: "Wordle Peaks Solver" }
    ]
  },
