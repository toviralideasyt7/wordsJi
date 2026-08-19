    key: 'spotle-solver',
    eyebrow: 'Spotle Solver Guide',
    intro:
      "Spotle is the daily game where you identify a mystery Spotify artist in ten guesses using clues like rank, debut year, genre, country, and group size. The Spotle solver turns those attribute clues into a live-filtered candidate list, so you can solve faster and learn the artists' chart logic as you play. Here is how the solver works, how to read its output, and the strategy that wins most puzzles by guess six or seven.",
    sections: [
      {
        heading: "How the Spotle solver filters the artist pool",
        paragraphs: [
          "Spotle compares your guessed artist to the answer across a handful of attributes — chart rank, debut year, genre, country, group size, and gender. Each attribute comes back green (exact), yellow (close), or gray (wrong), and the solver applies those verdicts to the entire artist database in real time.",
          "What makes the solver powerful is that it understands the yellow thresholds. In Spotle, yellow does not mean 'somewhere in the list' — it means the value is within a specific proximity window, like a rank within a few positions or a debut year within a few years. The solver encodes those exact thresholds, so its filtering is precise rather than approximate.",
          "Every time you add a clue, the pool shrinks. The first guess alone usually cuts thousands of artists down to a few hundred; by the fourth or fifth clue, the ranked list is short enough that a music fan can recognize the answer instantly."
        ]
      },
      {
        heading: "The attribute cheat sheet",
        paragraphs: [
          "Rank is the sharpest filter in Spotle because it is a continuous number. If your guess lands yellow on rank, the answer is close to that position — check the neighbors on the chart, not the whole list. A green rank with a yellow country is a different animal entirely: the chart position is locked, and you only need to disambiguate between nearby acts from adjacent countries.",
          "Debut year behaves like rank but slower. Charts move weekly while careers span decades, so debut year narrows a generation of artists, not a single slot. Use it to rule out entire eras before you start guessing specific names.",
          "Genre and country are categorical, which means they are either right or wrong — but Spotle's yellow on genres means 'related genre', like pop for dance pop. The solver treats those related-genre yellows as strong evidence, because they point at the artist's musical neighborhood even when the exact label misses."
        ],
        list: {
          title: "Best first guesses in Spotle",
          items: [
            "A giant act everyone knows — think Taylor Swift, Drake, or Bad Bunny — because its feedback is maximally informative",
            "An artist with an unusual debut year, so the year clue splits the field hard",
            "A solo artist, so the group-size attribute becomes a clean binary test",
            "Avoid obscure picks early: they waste a clue and their feedback barely narrows the pool"
          ]
        }
      },
      {
        heading: "A real Spotle solve, move by move",
        paragraphs: [
          "Open with a household-name artist. Suppose the game returns green on country, yellow on debut year, gray on genre, and yellow on rank. The solver immediately discards every artist outside your country, every act whose debut year is far from your guess, and keeps only chart neighbors with a related genre.",
          "The second guess should be a candidate from the top of the ranked list — ideally an artist you think could be the answer, because that way the feedback doubles as a check. When it comes back green on genre and closer on rank, the pool is usually down to a handful of names.",
          "From there, the group-size attribute is the tiebreaker. If your top two candidates differ in whether they are a band or a solo act, one more guess settles it, and the reveal is a formality. Most solves finish between guess six and eight when you trust the ranked list instead of hopping around the chart."
        ]
      },
      {
        heading: "Reading the solver's ranked list",
        paragraphs: [
          "The solver does not just dump candidates — it orders them by how well they satisfy your clues, with exact matches first and near-misses below. The top of the list is where you should guess, not the middle.",
          "If the top candidate does not feel right, do not scroll deep. Instead, reconsider your clues: a misread yellow or a wrong gray can silently poison the filter. Re-entering the feedback row accurately is more valuable than scanning a hundred names.",
          "The solver also lets you check hypotheticals before committing. Play 'what if this is the answer' — the feedback it would generate tells you whether guessing that artist would be a wasted move or a decisive one. That forward-looking habit is what separates strong Spotle players from the pack."
        ],
        callout: {
          title: "The ten-guess safety net",
          body: "Spotle gives you ten guesses — more than most daily games. Use the first two to establish rank, year, and country, then let the solver's ranked list carry you. You only need the full ten on brutally obscure days."
        }
      },
      {
        heading: "Spotle solver vs. streaming charts knowledge",
        paragraphs: [
          "Knowing music helps, but it is not enough. Even a well-read listener cannot hold the full chart in their head, and the solver's value is that it holds the chart for you — thousands of artists, their debut years, their genres, their countries — and applies your clues instantly.",
          "Your music knowledge still decides the game. The solver suggests; you recognize. When the pool is down to twelve artists, the solver cannot tell you which one it is, but a fan of that era or region usually can.",
          "That division of labor is why the solver feels fair: it removes the memory burden without removing the fun. You still have to think, connect, and recognize — you just do not have to memorize the entire Spotify catalog to play well."
        ]
      },
      {
        heading: "Common mistakes the Spotle solver catches",
        paragraphs: [
          "The most common mistake is treating yellow as a vague 'maybe'. In Spotle, yellow on rank means within a tight window — act on it by guessing a chart neighbor, not a distant name. The solver makes that window explicit in its filtering.",
          "The second mistake is ignoring the group-size attribute. Solo versus band is a clean split that most players leave until late, but checking it early can halve the pool in one move.",
          "The third mistake is re-guessing artists you already ruled out. It sounds obvious, but under pressure players cycle back to familiar names. The solver simply never suggests a candidate your clues have eliminated."
        ],
        list: {
          title: "Three habits of fast Spotle players",
          items: [
            "Enter every clue as soon as the game gives it to you",
            "Guess from the top of the ranked list, not from memory alone",
            "Use group size and country as early tiebreakers"
          ]
        }
      },
      {
        heading: "Why the Spotle solver pages rank in search",
        paragraphs: [
          "Every day, players type 'spotle answer today' and 'spotle solver' into Google and Bing looking for exactly this page. The answer-today page covers the daily reveal, while this solver page serves the players who want to crack the puzzle themselves with a smarter process.",
          "Both pages are written to answer real questions — how feedback works, what yellow means, which openers are best — so they earn clicks from people who are actually stuck, not just browsing. That is the kind of content search engines index and keep indexed.",
          "Bookmark the solver for the days when the answer is a deep-cut artist. On those days, the ranked list is the difference between a solved puzzle and a frustrating streak-breaker."
        ]
      },
      {
        heading: "Spotle artist pools and clue values",
        paragraphs: ["Spotle draws from a pool of well-known Spotify artists, and the solver filters that pool with the game’s own attributes — rank, debut year, genre, country, group size, and gender. Each attribute is a clue with a value, and the solver treats them all as constraints.","The rank attribute is the sharpest filter because it is a number: the game tells you higher or lower, and each arrow halves the remaining range.","The solver combines every arrow and every green or yellow tile into one candidate list, so by the fifth guess you are usually looking at the answer."]
      }
    ],
    faqHeading: "Spotle Solver FAQ",
    faqs: [
      {
        question: "How does the Spotle solver work?",
        answer:
          "You enter the attribute feedback from your guesses — green, yellow, or gray for rank, debut year, genre, country, group size, and gender — and the solver filters the artist database down to the candidates that match all your clues."
      },
      {
        question: "What does yellow mean in Spotle?",
        answer:
          "Yellow means the attribute is close but not exact. For rank and debut year it is a tight proximity window; for genres it means a related genre like pop for dance pop."
      },
      {
        question: "How many guesses does a Spotle take?",
        answer:
          "Most solves finish between six and eight guesses when you enter every clue and guess from the solver's ranked list. The game gives you ten guesses as a safety net."
      },
      {
        question: "Does the solver use the same artist data as the game?",
        answer:
          "The solver draws from the same pool of artists and applies the same attribute comparison rules, so its candidates are always valid answers."
      },
      {
        question: "Can I use the solver for past Spotle puzzles?",
        answer:
          "Yes — the attribute logic is identical for every puzzle, so the solver works for archive and past daily games too."
      }
    ],
    relatedLinks: [
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/colordle-answer-today", label: "Colordle Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  },
