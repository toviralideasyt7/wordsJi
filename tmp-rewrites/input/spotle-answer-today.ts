    key: 'spotle-answer-today',
    eyebrow: 'Spotle Strategy Guide',
    intro:
      'Spotle is a daily music guessing game where you identify a mystery Spotify artist using up to ten guesses. After each guess you get feedback on rank, debut year, genre, country, group size, and gender. Most players burn guesses on trivia instead of elimination. This guide covers how to read the attribute feedback, what makes a strong first guess, and how to convert an artist-pool problem into a logic problem.',
    sections: [
      {
        heading: 'The feedback system is the whole game',
        paragraphs: [
          'Spotle gives you more feedback than Wordle and punishes you less per guess, which makes it tempting to guess loosely. Resist. Ten guesses sounds generous, but the artist pool is enormous and the feedback only helps if you read it structurally.',
          'Every attribute answers in one of three ways: exact (green), close (yellow), or wrong (gray) — and for numeric attributes like rank and debut year, there are also higher/lower arrows. That is the key difference from Wordle: the arrows turn a yes/no test into a range search. A rank arrow telling you the answer is lower than your guess eliminates half the pool in one move.',
          'The trap is treating every attribute as equally valuable. They are not. Gender is nearly useless early because the split is roughly even. Country is powerful when the answer is from a small music market and weak when it is the United States. Debut year is the single most reliable narrowing tool because the arrows give you a binary search, and group size (solo vs duo vs band) quietly eliminates massive chunks.',
          'The winning habit is to decide, before each guess, which attribute you are trying to learn — not which artist you hope to hit. Every guess should be an experiment with a purpose.'
        ]
      },
      {
        heading: 'First-guess strategy: pick an artist you know cold',
        paragraphs: [
          'Your first Spotle guess should not be a famous name for the sake of fame. It should be an artist whose every attribute you know precisely — rank range, debut year, country, group size, genre, gender. If you misremember a detail and enter the wrong feedback, every subsequent filter is corrupted.',
          'Strong openers are artists with distinctive attributes that split the pool sharply. An early-2000s solo female singer from a non-English-speaking country gives you different information than a 2020s American band. The best openers are ones whose wrongness is still informative: a gray on country with a smaller-market artist tells you more than a gray on country with a US artist.',
          'There is also a case for opening with a mid-tier artist rather than a global megastar. Megastars sit in crowded attribute space — every attribute lands near the middle of the pool, so feedback is weak. An artist with an unusual combination (tiny country, rare group size, distinctive genre) makes every response sharper. The solver on this page exists exactly for this: it ranks candidate artists by how much information each guess would extract.'
        ],
        callout: {
          title: 'The first-guess rule',
          body: 'Guess an artist whose attributes you know with certainty and whose combination is distinctive. The feedback from a memorable guess beats the guess itself.'
        }
      },
      {
        heading: 'Using the arrows to binary-search the numeric attributes',
        paragraphs: [
          'Rank and debut year are where the higher/lower arrows do the heavy lifting. If the game tells you the answer\'s rank is lower than your guess of 40, you have just cut the pool roughly in half. That is binary search, and you should exploit it deliberately: after the first arrow, aim your next guess at the midpoint of the remaining range.',
          'Debut year works the same way and is even more forgiving because the range is narrower. Most artists on the platform debuted between 1960 and today. One guess near 1990, one arrow, and you know which half of sixty years to work in.',
          'The mistake is ignoring the arrows and playing only categories. Category feedback (country, genre, group size) tells you membership; arrows tell you position. Position is what collapses the pool fastest. When you have a choice between a guess that tests a new country and a guess that splits the rank range, take the split.'
        ],
        list: {
          title: 'Which attributes to trust at which stage',
          items: [
            'Guess 1-2: debut year and rank arrows — the widest eliminations',
            'Guess 2-4: country and group size — sharp when the market is small',
            'Guess 4-6: genre — useful once the year window is narrow',
            'Guess 6+: gender — only relevant when everything else is nearly locked',
            'Never trust a category you guessed on a hunch; the filter inherits your error'
          ]
        }
      },
      {
        heading: 'Yellow feedback and the near-miss trap',
        paragraphs: [
          'Yellow in Spotle means close but not exact — a nearby rank, a related genre, a similar debut era. Yellow feels like progress and often is, but it is the easiest feedback to over-read. A yellow on genre does not tell you the answer is in the same genre family; it tells you the answer is adjacent to it, and adjacency in music genres is messy.',
          'The disciplined read is to treat yellow as a direction, not a membership. Yellow on debut year means the answer is within a few years of your guess — combined with an arrow, that is a powerful range. Yellow on genre means nothing without knowing which genres your guess actually belongs to.',
          'Near-miss frustration usually comes from chasing the yellow instead of the arrows. If you have a yellow on rank, a yellow on year, and a gray on country, the next guess should test a new country or a new group size — not another artist in the same yellow band. You are not close to the answer; you are close to the information.'
        ]
      },
      {
        heading: 'The endgame: converting four attributes into an artist',
        paragraphs: [
          'By guess six or seven, a well-played game looks like this: a narrow debut-year window, a confirmed country or group size, a genre direction, and a shortlist of maybe a dozen artists. This is the endgame, and it is where most players blow it by guessing their favorite among the twelve instead of eliminating the other eleven.',
          'The rule at the end is the opposite of the rule at the start: stop gathering information, start confirming. Every guess should be one of the shortlisted artists, and the feedback — even a full miss — should be designed to split the list. A miss that eliminates six of twelve is a winning guess.',
          'If the solver on this page has been feeding you candidates, this is where its candidate ranking matters most. Do not pick the artist you like; pick the artist at the top of the ranked list, because the ranking already accounts for how much information each guess extracts from what is left.'
        ],
        callout: {
          title: 'The one-line Spotle philosophy',
          body: 'Guess to learn, not to win — until the shortlist is small enough that every guess is a candidate.'
        }
      },
      {
        heading: 'Practice habits for music-guessing games',
        paragraphs: [
          'The fastest way to improve at Spotle is to play the archive and replay your losses with the solver open. After each loss, identify the first guess where your feedback was a guess rather than a fact — that is almost always where the streak died.',
          'Building genuine artist knowledge helps more than trivia. You do not need to know every artist\x27s catalog; you need to know the attributes of a few hundred anchor artists across genres, eras, and countries. Those anchors are what make first guesses informative and endgames confirmable.',
          'Finally, keep a mental list of "if this attribute combination, then this country" rules. Small music markets have distinctive combinations: a female solo artist with a 2010s debut and a non-English genre is far more likely from Korea or Scandinavia than from the US. These rules are what turn a fuzzy puzzle into a shortlist.'
        ]
      }
    ],
    faqHeading: 'Spotle Questions, Answered',
    faqs: [
      {
        question: 'What is Spotle and how do you play?',
        answer:
          'Spotle is a daily game where you guess a mystery Spotify artist in up to ten guesses. After each guess, you get feedback on rank, debut year, genre, country, group size, and gender — with green, yellow, and gray tiles plus higher/lower arrows on numeric attributes.'
      },
      {
        question: 'What does yellow mean in Spotle?',
        answer:
          'Yellow means the attribute is close but not exact — a nearby rank, a related genre, or a similar debut era. Treat it as a direction, not a membership confirmation.'
      },
      {
        question: 'What is the best first guess in Spotle?',
        answer:
          'Pick an artist whose attributes you know with certainty and whose combination is distinctive — a smaller market, an unusual group size, or a rare genre. Certainty matters more than fame.'
      },
      {
        question: 'How many guesses does it take to solve Spotle?',
        answer:
          'With disciplined elimination, most players identify the artist in four to six guesses. Relying on the arrows for rank and debut year is what collapses the pool fastest.'
      },
      {
        question: 'Can the Spotle solver help with past puzzles?',
        answer:
          'Yes. The solver filters the same artist pool used by the game, so you can reconstruct any past answer by entering the feedback from that day\'s guesses.'
      }
    ],
    relatedLinks: [
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/colordle-answer-today', label: 'Colordle Answer Today' },
      { href: '/spotle-solver', label: 'Spotle Solver' },
      { href: '/framed-answer-today', label: 'Framed Answer Today' },
      { href: '/worldle-answer-today', label: 'Worldle Answer Today' },
      { href: '/semantle-answer-today', label: 'Semantle Answer Today' }
    ]
  },
