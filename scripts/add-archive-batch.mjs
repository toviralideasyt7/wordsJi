// Archive + analyzer batch.
// Run with: node scripts/add-archive-batch.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['waffle-archive'] = `  'waffle-archive': {
    key: 'waffle-archive',
    eyebrow: 'Waffle Archive Guide',
    intro:
      "The Waffle archive is the complete record of every daily Waffle grid — all six words for each puzzle, organized by date, searchable, and free to browse. Whether you are looking for the Waffle game archive to replay an old puzzle, checking the Waffle answers for a specific date, or studying how the grids are built, this page has the full history. Here is how to use it and what the archive teaches you.",
    sections: [
      {
        heading: "Every Waffle grid, in one place",
        paragraphs: [
          "Waffle publishes one new grid every day, and this archive holds the complete sequence — every puzzle, every date, every set of six words. The full history is here, rendered on the page and searchable by date or word.",
          "The archive is the answer to the 'Waffle game archive' searches that players type every day: the complete record of past puzzles, organized so you can jump to any date in seconds.",
          "Each entry shows the date, the puzzle's six words, and the grid structure — the across words and the down words that made up the daily challenge. Browsing the archive is also a study session: you see exactly how the game builds its interlocking grids."
        ],
        callout: {
          title: "The complete Waffle record",
          body: "Every daily Waffle grid from the game's launch to today — six words per puzzle, searchable by date or word, and free to browse."
        }
      },
      {
        heading: "How to search the Waffle archive",
        paragraphs: [
          "The archive supports two search styles. Search by date to jump to a specific day's grid, or search by word to find every puzzle that used a particular five-letter word — type LEMON and every grid containing it appears.",
          "The list view shows the puzzles in chronological order, so you can scroll through the entire history or scan for patterns across weeks. Each row links to the grid details for that date.",
          "For the daily flow, use the calendar to click any date and load that puzzle's words instantly. The calendar is the fastest way to answer 'what was the Waffle on my birthday?'"
        ]
      },
      {
        heading: "What the Waffle archive teaches you",
        paragraphs: [
          "Browsing the archive reveals the game's construction habits. Waffle grids interlock densely, with common letters — R, S, T, N, and the vowels — doing most of the crossing work, and the archive shows that pattern across hundreds of puzzles.",
          "The vocabulary bias is the second lesson. Waffle favors common five-letter words, and the archive confirms the pool's shape — everyday nouns and verbs rather than crossword rarities. Knowing the pool is common vocabulary reshapes your guesses from the start.",
          "The move economy is the third lesson. Each archived grid shows the words, and replaying them lets you practice minimal-swap solving — the crossing logic that keeps your move count low."
        ],
        list: {
          title: "Archive study patterns",
          items: [
            "Track which letters the game uses for crossings",
            "Confirm the vocabulary bias — everyday words dominate",
            "Replay old grids to practice minimal-swap solving",
            "Study how across and down words share their letters"
          ]
        }
      },
      {
        heading: "The Waffle archive and the daily game",
        paragraphs: [
          "The archive pairs with the daily Waffle page: the daily page gives you today's grid and answer, while the archive holds everything before it. Between the two, every Waffle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net. Missed a day? Replay it from the archive. Want to confirm an old answer? The record is here. The archive keeps your Waffle history complete.",
          "For learners, the archive is unlimited practice. Every past grid is a puzzle you can replay, and replaying old grids builds the crossing logic and swap planning that make the daily game faster."
        ]
      }
    ],
    faqHeading: "Waffle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Waffle game archive?",
        answer:
          "This page holds the complete Waffle archive — every daily grid's six words, organized by date and searchable by date or word."
      },
      {
        question: "How far back does the Waffle archive go?",
        answer:
          "The archive covers every daily Waffle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search the archive by date or word?",
        answer:
          "Yes — search by date to jump to a specific day, or by word to find every puzzle that used a particular five-letter word."
      },
      {
        question: "Can I replay old Waffle puzzles?",
        answer:
          "Yes — each archived entry shows the grid's six words, and you can replay any past puzzle to practice minimal-swap solving."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each new daily Waffle grid is added to the archive as soon as it publishes."
      }
    ],
    relatedLinks: [
      { href: "/waffle-answer-today", label: "Waffle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/squaredle-solver", label: "Squaredle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/weaver-solver", label: "Weaver Solver" }
    ]
  }`;

ENTRIES['quordle-archive'] = `  'quordle-archive': {
    key: 'quordle-archive',
    eyebrow: 'Quordle Archive Guide',
    intro:
      "The Quordle archive is the complete record of every daily Quordle puzzle — all four answers for each date, searchable and free to browse. Whether you are looking for the Quordle answers for a specific day, replaying an old four-board challenge, or studying how Quordle sequences its answers, this page has the full history. Here is how to use it and what it teaches you.",
    sections: [
      {
        heading: "Every Quordle puzzle, archived",
        paragraphs: [
          "Quordle publishes four answers every day, and this archive holds the complete sequence — every puzzle, every date, all four answers per day. The full history is here, rendered on the page and searchable by date or word.",
          "Each entry shows the date and the four answers that made up that day's challenge. Browsing the archive reveals the game's answer habits — the letter patterns, the repeated structures, the everyday vocabulary it favors.",
          "The archive is the answer to the 'Quordle archive' searches players type when they want to revisit a past challenge or confirm an old answer."
        ],
        callout: {
          title: "Four answers per day, all archived",
          body: "Every daily Quordle puzzle's four answers, organized by date and searchable — the complete history of the game."
        }
      },
      {
        heading: "How to use the Quordle archive",
        paragraphs: [
          "Search by date to load a specific day's four answers, or search by word to find every puzzle that used a particular answer. The calendar view lets you click any date and see its four words instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history or compare answers across weeks to spot the game's vocabulary patterns.",
          "For practice, each archived day is a replayable challenge: load the date, cover the answers, and try to solve all four boards with the daily guess economy."
        ]
      },
      {
        heading: "What the Quordle archive teaches",
        paragraphs: [
          "The archive reveals Quordle's answer-selection habits. The four daily answers often share vowel patterns, which is exactly why a vowel-heavy opener helps multiple boards at once — and the archive makes that sharing visible.",
          "The vocabulary bias is the second lesson. Quordle answers are common English words, and the archive confirms the pool's shape — everyday vocabulary rather than obscure fillers.",
          "The sequence logic is the third lesson. Seeing hundreds of days of answer sets shows you how the game balances the four boards — the mixed letter coverage, the shared structures — and that understanding improves your multi-board guessing."
        ],
        list: {
          title: "Quordle archive study patterns",
          items: [
            "Track shared vowels across the four daily answers",
            "Confirm the common-word vocabulary bias",
            "Replay old days to practice the multi-board economy",
            "Study how the four answers distribute their letters"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Quordle daily page: the daily page gives you today's four answers, while the archive holds everything before it. Between the two, every Quordle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old answer, the record is here.",
          "For learners, the archive is unlimited practice — every past four-board challenge is replayable, and replaying builds the multi-board thinking that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Quordle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Quordle archive?",
        answer:
          "This page holds the complete Quordle archive — every daily puzzle's four answers, organized by date and searchable by date or word."
      },
      {
        question: "How far back does the Quordle archive go?",
        answer:
          "The archive covers every daily Quordle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Quordle answers by date?",
        answer:
          "Yes — search by date to load a specific day's four answers, or by word to find every puzzle that used a particular answer."
      },
      {
        question: "Can I replay old Quordle puzzles?",
        answer:
          "Yes — each archived day is replayable: load the date, cover the answers, and solve all four boards with the daily guess economy."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's four answers are added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/nerdle-answer-today", label: "Nerdle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['spotle-archive'] = `  'spotle-archive': {
    key: 'spotle-archive',
    eyebrow: 'Spotle Archive Guide',
    intro:
      "The Spotle archive is the complete record of every daily Spotle puzzle — the mystery artist for each date, plus the movie-mode answers, searchable and free to browse. Whether you are looking for past Spotle answers, replaying an old artist-guessing challenge, or studying the game's answer pool, this page has the full history. Here is how to use it.",
    sections: [
      {
        heading: "Every Spotle answer, archived",
        paragraphs: [
          "Spotle publishes a new mystery artist every day, and this archive holds the complete sequence — every date, every artist, plus the movie-mode answers. The full history is here, rendered on the page and searchable by date or name.",
          "Each entry shows the date and the artist that was the answer that day. Browsing the archive reveals the game's answer habits — the eras it favors, the genres it visits, the recognizable names it prefers.",
          "The archive is the answer to the 'Spotle archive' and 'Spotle movies archive' searches players type when they want to revisit a past challenge or confirm an old artist."
        ],
        callout: {
          title: "Every daily artist, in the record",
          body: "The complete Spotle history — the daily artist and movie-mode answers for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Spotle archive",
        paragraphs: [
          "Search by date to load a specific day's artist, or search by name to find every puzzle that featured a particular musician. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's selection patterns across weeks and months.",
          "For practice, each archived day is replayable: load the date, and try to identify the artist from the same attribute clues the daily game gives."
        ]
      },
      {
        heading: "What the Spotle archive teaches",
        paragraphs: [
          "The archive reveals Spotle's artist-selection habits. The daily answers skew toward recognizable, chart-relevant artists — the popular, the iconic, the recently trending — and the archive makes that bias visible.",
          "The attribute logic is the second lesson. Reviewing past answers shows you how the game's attributes — rank, debut year, genre, country — map onto real artists, and that mapping improves your guessing.",
          "The era rhythm is the third lesson. Some weeks lean heavily on one decade or genre, and tracking the archive's rhythm lets you pre-load the right era before the first clue lands."
        ],
        list: {
          title: "Spotle archive study patterns",
          items: [
            "Track which eras and genres the game favors",
            "Confirm the recognizable-artist bias",
            "Replay old days to practice attribute reading",
            "Study how rank and debut-year clues map to real artists"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Spotle daily page: the daily page gives you today's artist, while the archive holds everything before it. Between the two, every Spotle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old artist, the record is here.",
          "For learners, the archive is unlimited practice — every past artist is replayable, and replaying builds the attribute-reading that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Spotle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Spotle archive?",
        answer:
          "This page holds the complete Spotle archive — the daily artist for every date, searchable by date or artist name."
      },
      {
        question: "Does the archive include movie-mode answers?",
        answer:
          "Yes — the archive covers both the daily artist mode and the movie-mode answers, so every Spotle puzzle is in the record."
      },
      {
        question: "Can I search Spotle answers by date?",
        answer:
          "Yes — search by date to load a specific day's artist, or by name to find every puzzle that featured a particular musician."
      },
      {
        question: "Can I replay old Spotle puzzles?",
        answer:
          "Yes — each archived day is replayable, letting you practice attribute reading on past artists."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's artist is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/spotle-solver", label: "Spotle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" }
    ]
  }`;

ENTRIES['semantle-archive'] = `  'semantle-archive': {
    key: 'semantle-archive',
    eyebrow: 'Semantle Archive Guide',
    intro:
      "The Semantle archive is the complete record of every daily Semantle puzzle — the mystery word for each date, searchable and free to browse. Whether you are looking for past Semantle answers, replaying an old semantic-distance challenge, or studying the game's word-space, this page has the full history. Here is how to use it.",
    sections: [
      {
        heading: "Every Semantle word, archived",
        paragraphs: [
          "Semantle publishes a new mystery word every day, and this archive holds the complete sequence — every date, every word. The full history is here, rendered on the page and searchable by date or word.",
          "Each entry shows the date and the word that was the answer that day. Browsing the archive reveals the game's answer habits — the abstract concepts it favors, the common vocabulary it prefers, the semantic neighborhoods it visits.",
          "The archive is the reference for the players who track Semantle's answers and want to revisit past puzzles or confirm an old word."
        ],
        callout: {
          title: "Every daily word, in the record",
          body: "The complete Semantle history — the mystery word for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Semantle archive",
        paragraphs: [
          "Search by date to load a specific day's word, or search by word to find every puzzle that used a particular answer. The calendar view lets you click any date and see its word instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's selection patterns.",
          "For practice, each archived day is replayable: load the date and try to reach the word using the similarity scores, exactly as the daily game works."
        ]
      },
      {
        heading: "What the Semantle archive teaches",
        paragraphs: [
          "The archive reveals Semantle's answer-selection habits. The daily words are common vocabulary with clear meanings — the kind of words that sit at the center of the word-space rather than the edges.",
          "The semantic-neighborhood lesson is the second value. Reviewing past answers shows you which words the model considers neighbors, and that mapping builds the semantic intuition the game rewards.",
          "The category rhythm is the third lesson. Some days the answer is abstract, others concrete, others emotional — and tracking the archive's rhythm shows you which corners of the word-space the game visits."
        ],
        list: {
          title: "Semantle archive study patterns",
          items: [
            "Track the abstract-versus-concrete rhythm",
            "Confirm the common-vocabulary bias",
            "Study which words the model treats as neighbors",
            "Replay old days to practice the similarity compass"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Semantle daily page: the daily page gives you today's word, while the archive holds everything before it. Between the two, every Semantle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old word, the record is here.",
          "For learners, the archive is unlimited practice — every past word is replayable, and replaying builds the similarity reading that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Semantle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Semantle archive?",
        answer:
          "This page holds the complete Semantle archive — the mystery word for every date, searchable by date or word."
      },
      {
        question: "How far back does the Semantle archive go?",
        answer:
          "The archive covers every daily Semantle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Semantle answers by date?",
        answer:
          "Yes — search by date to load a specific day's word, or by word to find every puzzle that used a particular answer."
      },
      {
        question: "Can I replay old Semantle puzzles?",
        answer:
          "Yes — each archived day is replayable, letting you practice the similarity compass on past words."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's word is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/semantle-answer-today", label: "Semantle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['colordle-archive'] = `  'colordle-archive': {
    key: 'colordle-archive',
    eyebrow: 'Colordle Archive Guide',
    intro:
      "The Colordle archive is the complete record of every daily Colordle puzzle — the color answer for each date, with its hex value, searchable and free to browse. Whether you are looking for past Colordle answers, a specific day's color, or the full day-number history players search for, this page has it all. Here is how to use it.",
    sections: [
      {
        heading: "Every Colordle color, archived",
        paragraphs: [
          "Colordle publishes one new color every day, and this archive holds the complete sequence — every date, every color, every hex value. The full history is here, rendered on the page and searchable by date or color name.",
          "Each entry shows the date, the day number, and the exact color with its hex value. Browsing the archive reveals the game's palette habits — the recognizable color families it favors, the neutrals it mixes in, the named colors it prefers.",
          "The archive is the reference for the players who search for 'colordle day 1441 answer' style queries — the day-number history is all here, cross-referenced with dates."
        ],
        callout: {
          title: "The full color history, hex-exact",
          body: "Every daily Colordle color — date, day number, and exact hex — searchable and free to browse."
        }
      },
      {
        heading: "How to use the Colordle archive",
        paragraphs: [
          "Search by date to load a specific day's color, by day number to find the puzzle numbered that day, or by color name to find every puzzle that used it. The calendar view lets you click any date and see its color instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's palette selection patterns.",
          "The hex values make the archive uniquely precise: every archived color is recorded exactly, so the archive doubles as a searchable history of the game's entire palette."
        ]
      },
      {
        heading: "What the Colordle archive teaches",
        paragraphs: [
          "The archive reveals Colordle's palette habits. The daily colors skew toward recognizable families — the standard rainbow plus the classic neutrals — and the archive makes that bias visible across hundreds of puzzles.",
          "The day-number system is the second lesson. Colordle puzzles are numbered sequentially, and the archive's day-number cross-reference lets you find any puzzle by its number — the exact search style the community uses.",
          "The palette structure is the third lesson. Reviewing past answers shows you the full set of colors the game draws from, and knowing the palette makes your guesses far more efficient."
        ],
        list: {
          title: "Colordle archive study patterns",
          items: [
            "Track the color families the game favors",
            "Use the day-number cross-reference for community-style searches",
            "Study the full palette the game draws from",
            "Replay old days to practice the component-filtering logic"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Colordle daily page: the daily page gives you today's color, while the archive holds everything before it. Between the two, every Colordle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old color, the hex-exact record is here.",
          "For learners, the archive is unlimited practice — every past color is replayable, and replaying builds the palette knowledge that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Colordle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Colordle archive?",
        answer:
          "This page holds the complete Colordle archive — the color answer for every date with its hex value, searchable by date, day number, or color name."
      },
      {
        question: "How far back does the Colordle archive go?",
        answer:
          "The archive covers every daily Colordle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Colordle answers by day number?",
        answer:
          "Yes — the archive cross-references every day number with its date, so community-style searches like 'colordle day 1441 answer' work directly."
      },
      {
        question: "Does the archive include hex values?",
        answer:
          "Yes — every archived color is recorded with its exact hex value, making the archive a precise searchable history of the game's palette."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's color is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/colordle-answer-today", label: "Colordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/colordle-solver", label: "Colordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/colorfle-answer-today", label: "Colorfle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['phoodle-archive'] = `  'phoodle-archive': {
    key: 'phoodle-archive',
    eyebrow: 'Phoodle Archive Guide',
    intro:
      "The Phoodle archive is the complete record of every daily Phoodle puzzle — the food word for each date, searchable and free to browse. Whether you are looking for past Phoodle answers, replaying an old food-word challenge, or studying the vocabulary the game draws from, this page has the full history. Here is how to use it.",
    sections: [
      {
        heading: "Every Phoodle food word, archived",
        paragraphs: [
          "Phoodle publishes one new food word every day, and this archive holds the complete sequence — every date, every word. The full history is here, rendered on the page and searchable by date or word.",
          "Each entry shows the date and the food word that was the answer that day. Browsing the archive reveals the game's answer habits — the ingredients it favors, the dishes it mixes in, the kitchen verbs and adjectives it uses.",
          "The archive is the reference for players who track Phoodle's answers and want to revisit past puzzles or confirm an old word."
        ],
        callout: {
          title: "Every food word, in the record",
          body: "The complete Phoodle history — the food word for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Phoodle archive",
        paragraphs: [
          "Search by date to load a specific day's word, or search by word to find every puzzle that used a particular food term. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's vocabulary patterns.",
          "For practice, each archived day is replayable: load the date and try to solve the food word using the same feedback rules as the daily game."
        ]
      },
      {
        heading: "What the Phoodle archive teaches",
        paragraphs: [
          "The archive reveals Phoodle's vocabulary habits. The daily answers skew toward common food words — ingredients, dishes, and kitchen terms — and the archive makes that bias visible.",
          "The category mix is the second lesson. Some days the answer is an ingredient, others a dish, a cut, or a kitchen verb — and tracking the archive's mix shows you which lanes the game favors.",
          "The letter patterns are the third lesson. Food vocabulary is heavy on A and O, with the S-T-R-P-C-K cluster dominating ingredient names, and the archive confirms those patterns across hundreds of puzzles."
        ],
        list: {
          title: "Phoodle archive study patterns",
          items: [
            "Track the ingredient-versus-dish-versus-verb rhythm",
            "Confirm the common-food-word bias",
            "Study the vowel patterns of food vocabulary",
            "Replay old days to practice the food-lane strategy"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Phoodle daily page: the daily page gives you today's food word, while the archive holds everything before it. Between the two, every Phoodle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old word, the record is here.",
          "For learners, the archive is unlimited practice — every past food word is replayable, and replaying builds the vocabulary that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Phoodle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Phoodle archive?",
        answer:
          "This page holds the complete Phoodle archive — the food word for every date, searchable by date or word."
      },
      {
        question: "How far back does the Phoodle archive go?",
        answer:
          "The archive covers every daily Phoodle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Phoodle answers by date?",
        answer:
          "Yes — search by date to load a specific day's food word, or by word to find every puzzle that used a particular term."
      },
      {
        question: "Can I replay old Phoodle puzzles?",
        answer:
          "Yes — each archived day is replayable, letting you practice the food-lane strategy on past words."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's food word is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/phrazle-answer-today", label: "Phrazle Answer Today" },
      { href: "/canuckle-answer-today", label: "Canuckle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['phrazle-archive'] = `  'phrazle-archive': {
    key: 'phrazle-archive',
    eyebrow: 'Phrazle Archive Guide',
    intro:
      "The Phrazle archive is the complete record of every daily Phrazle puzzle — the phrase answer for each date, searchable and free to browse. Whether you are looking for past Phrazle answers, replaying an old phrase challenge, or studying the sayings the game draws from, this page has the full history. Here is how to use it.",
    sections: [
      {
        heading: "Every Phrazle phrase, archived",
        paragraphs: [
          "Phrazle publishes one new phrase every day, and this archive holds the complete sequence — every date, every multi-word answer. The full history is here, rendered on the page and searchable by date or phrase.",
          "Each entry shows the date and the phrase that was the answer that day. Browsing the archive reveals the game's answer habits — the idioms it favors, the titles it mixes in, the everyday sayings it prefers.",
          "The archive is the reference for players who track Phrazle's answers and want to revisit past puzzles or confirm an old phrase."
        ],
        callout: {
          title: "Every phrase, in the record",
          body: "The complete Phrazle history — the phrase answer for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Phrazle archive",
        paragraphs: [
          "Search by date to load a specific day's phrase, or search by phrase to find every puzzle that used a particular saying. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's phrase selection patterns.",
          "For practice, each archived day is replayable: load the date and try to solve the phrase word by word, exactly as the daily game works."
        ]
      },
      {
        heading: "What the Phrazle archive teaches",
        paragraphs: [
          "The archive reveals Phrazle's phrase-selection habits. The daily answers skew toward famous, recognizable phrases — idioms, titles, catchphrases — and the archive makes that bias visible.",
          "The structure mix is the second lesson. Some answers are two-word adjective-noun pairs, others three-word idioms, and tracking the archive's mix shows you the phrase families the game favors.",
          "The vocabulary is the third lesson. The phrases use common words, which is exactly why the daily game rewards everyday vocabulary — and the archive confirms it across hundreds of puzzles."
        ],
        list: {
          title: "Phrazle archive study patterns",
          items: [
            "Track the idiom-versus-title-versus-catchphrase mix",
            "Confirm the famous-phrase bias",
            "Study the two-word versus three-word structures",
            "Replay old days to practice word-by-word solving"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Phrazle daily page: the daily page gives you today's phrase, while the archive holds everything before it. Between the two, every Phrazle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old phrase, the record is here.",
          "For learners, the archive is unlimited practice — every past phrase is replayable, and replaying builds the phrase recognition that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Phrazle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Phrazle archive?",
        answer:
          "This page holds the complete Phrazle archive — the phrase answer for every date, searchable by date or phrase."
      },
      {
        question: "How far back does the Phrazle archive go?",
        answer:
          "The archive covers every daily Phrazle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Phrazle answers by date?",
        answer:
          "Yes — search by date to load a specific day's phrase, or by phrase to find every puzzle that used a particular saying."
      },
      {
        question: "Can I replay old Phrazle puzzles?",
        answer:
          "Yes — each archived day is replayable, letting you practice word-by-word solving on past phrases."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's phrase is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/phrazle-answer-today", label: "Phrazle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/canuckle-answer-today", label: "Canuckle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['nerdle-archive'] = `  'nerdle-archive': {
    key: 'nerdle-archive',
    eyebrow: 'Nerdle Archive Guide',
    intro:
      "The Nerdle archive is the complete record of every daily Nerdle puzzle — the equation answer for each date, searchable and free to browse. Whether you are looking for past Nerdle answers, replaying an old equation challenge, or studying the arithmetic the game favors, this page has the full history. Here is how to use it.",
    sections: [
      {
        heading: "Every Nerdle equation, archived",
        paragraphs: [
          "Nerdle publishes one new equation every day, and this archive holds the complete sequence — every date, every eight-character answer. The full history is here, rendered on the page and searchable by date or equation.",
          "Each entry shows the date and the equation that was the answer that day. Browsing the archive reveals the game's answer habits — the two-term sums it favors, the subtraction it mixes in, the structure of its equations.",
          "The archive is the reference for players who track Nerdle's answers and want to revisit past puzzles or confirm an old equation."
        ],
        callout: {
          title: "Every equation, in the record",
          body: "The complete Nerdle history — the equation answer for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Nerdle archive",
        paragraphs: [
          "Search by date to load a specific day's equation, or search by equation to find every puzzle that used a particular string. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's equation patterns.",
          "For practice, each archived day is replayable: load the date and try to solve the equation using the same green-purple-black feedback as the daily game."
        ]
      },
      {
        heading: "What the Nerdle archive teaches",
        paragraphs: [
          "The archive reveals Nerdle's equation habits. The daily answers skew toward two-term sums — the classic a+b=c form — and the archive confirms that the sum form dominates the answer space.",
          "The digit census is the second lesson. Digits appear unevenly in valid equations — 1, 2, 0, and 5 are workhorses, while 8, 9, and 7 appear less often — and the archive makes that census visible.",
          "The structure lesson is the third. Reviewing past equations shows you how the equals sign splits them, how operators distribute, and how the equation space is actually shaped."
        ],
        list: {
          title: "Nerdle archive study patterns",
          items: [
            "Track the two-term-sum dominance",
            "Study the digit census across hundreds of equations",
            "Confirm the operator distribution — plus and minus lead",
            "Replay old days to practice the feedback discipline"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Nerdle daily page: the daily page gives you today's equation, while the archive holds everything before it. Between the two, every Nerdle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old equation, the record is here.",
          "For learners, the archive is unlimited practice — every past equation is replayable, and replaying builds the equation-space intuition that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Nerdle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Nerdle archive?",
        answer:
          "This page holds the complete Nerdle archive — the equation answer for every date, searchable by date or equation."
      },
      {
        question: "How far back does the Nerdle archive go?",
        answer:
          "The archive covers every daily Nerdle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Nerdle answers by date?",
        answer:
          "Yes — search by date to load a specific day's equation, or by equation to find every puzzle that used a particular string."
      },
      {
        question: "Can I replay old Nerdle puzzles?",
        answer:
          "Yes — each archived day is replayable, letting you practice the equation-solving logic on past puzzles."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's equation is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/nerdle-answer-today", label: "Nerdle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/nerdle-solver", label: "Nerdle Solver" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['contexto-archive'] = `  'contexto-archive': {
    key: 'contexto-archive',
    eyebrow: 'Contexto Archive Guide',
    intro:
      "The Contexto archive is the complete record of every daily Contexto puzzle — the mystery word for each date, searchable and free to browse. Whether you are looking for past Contexto answers, replaying an old semantic-distance challenge, or studying the words the game favors, this page has the full history. Here is how to use it.",
    sections: [
      {
        heading: "Every Contexto word, archived",
        paragraphs: [
          "Contexto publishes one new mystery word every day, and this archive holds the complete sequence — every date, every word. The full history is here, rendered on the page and searchable by date or word.",
          "Each entry shows the date and the word that was the answer that day. Browsing the archive reveals the game's answer habits — the common vocabulary it favors, the semantic neighborhoods it visits, the everyday words it prefers.",
          "The archive is the reference for players who track Contexto's answers and want to revisit past puzzles or confirm an old word."
        ],
        callout: {
          title: "Every daily word, in the record",
          body: "The complete Contexto history — the mystery word for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Contexto archive",
        paragraphs: [
          "Search by date to load a specific day's word, or search by word to find every puzzle that used a particular answer. The calendar view lets you click any date and see its word instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's selection patterns.",
          "For practice, each archived day is replayable: load the date and try to reach the word using the ranking feedback, exactly as the daily game works."
        ]
      },
      {
        heading: "What the Contexto archive teaches",
        paragraphs: [
          "The archive reveals Contexto's word-selection habits. The daily answers are common vocabulary with clear meanings — the kind of words that sit near the center of the semantic space.",
          "The domain mix is the second lesson. Some days the answer is a kitchen word, others a tech word, others an emotion — and tracking the archive's mix shows you which domains the game visits.",
          "The ranking lesson is the third. Reviewing past answers shows you which words the model treats as close neighbors, and that mapping builds the semantic intuition the game rewards."
        ],
        list: {
          title: "Contexto archive study patterns",
          items: [
            "Track the domain rhythm — kitchen, tech, emotion",
            "Confirm the common-vocabulary bias",
            "Study which words the model ranks as neighbors",
            "Replay old days to practice the ranking compass"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Contexto daily page: the daily page gives you today's word, while the archive holds everything before it. Between the two, every Contexto puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old word, the record is here.",
          "For learners, the archive is unlimited practice — every past word is replayable, and replaying builds the ranking reading that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Contexto Archive FAQ",
    faqs: [
      {
        question: "Where is the full Contexto archive?",
        answer:
          "This page holds the complete Contexto archive — the mystery word for every date, searchable by date or word."
      },
      {
        question: "How far back does the Contexto archive go?",
        answer:
          "The archive covers every daily Contexto puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Contexto answers by date?",
        answer:
          "Yes — search by date to load a specific day's word, or by word to find every puzzle that used a particular answer."
      },
      {
        question: "Can I replay old Contexto puzzles?",
        answer:
          "Yes — each archived day is replayable, letting you practice the ranking compass on past words."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's word is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['globle-archive'] = `  'globle-archive': {
    key: 'globle-archive',
    eyebrow: 'Globle Archive Guide',
    intro:
      "The Globle archive is the complete record of every daily Globle puzzle — the country answer for each date, searchable and free to browse. Whether you are looking for past Globle answers, replaying an old geography challenge, or studying the countries the game favors, this page has the full history. Here is how to use it.",
    sections: [
      {
        heading: "Every Globle country, archived",
        paragraphs: [
          "Globle publishes one new country every day, and this archive holds the complete sequence — every date, every answer. The full history is here, rendered on the page and searchable by date or country.",
          "Each entry shows the date and the country that was the answer that day. Browsing the archive reveals the game's answer habits — the recognizable countries it favors, the continents it visits, the geography it prefers.",
          "The archive is the reference for players who track Globle's answers and want to revisit past puzzles or confirm an old country."
        ],
        callout: {
          title: "Every daily country, in the record",
          body: "The complete Globle history — the country answer for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Globle archive",
        paragraphs: [
          "Search by date to load a specific day's country, or search by country to find every puzzle that used a particular nation. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's geographic patterns.",
          "For practice, each archived day is replayable: load the date and try to reach the country using the color-map feedback, exactly as the daily game works."
        ]
      },
      {
        heading: "What the Globle archive teaches",
        paragraphs: [
          "The archive reveals Globle's country-selection habits. The daily answers skew toward recognizable nations — the G20, the popular travel destinations — and the archive makes that bias visible.",
          "The continental rhythm is the second lesson. Some weeks lean European, others Asian or African, and tracking the archive's rhythm lets you pre-load the right continent before the first guess.",
          "The color-map lesson is the third. Reviewing past answers shows you how the game's distance-to-color gradient maps onto real geography, and that mapping improves your reading of the daily map."
        ],
        list: {
          title: "Globle archive study patterns",
          items: [
            "Track the continental rhythm across weeks",
            "Confirm the recognizable-country bias",
            "Study how the color gradient maps to distance",
            "Replay old days to practice the color-map reading"
          ]
        }
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive pairs with the Globle daily page: the daily page gives you today's country, while the archive holds everything before it. Between the two, every Globle puzzle — past and present — is one click away.",
          "For streak-keepers, the archive is the safety net: missed a day, replay it; want to confirm an old country, the record is here.",
          "For learners, the archive is unlimited practice — every past country is replayable, and replaying builds the map sense that makes the daily game faster."
        ]
      }
    ],
    faqHeading: "Globle Archive FAQ",
    faqs: [
      {
        question: "Where is the full Globle archive?",
        answer:
          "This page holds the complete Globle archive — the country answer for every date, searchable by date or country."
      },
      {
        question: "How far back does the Globle archive go?",
        answer:
          "The archive covers every daily Globle puzzle from the game's launch through today, updated daily."
      },
      {
        question: "Can I search Globle answers by date?",
        answer:
          "Yes — search by date to load a specific day's country, or by country to find every puzzle that used a particular nation."
      },
      {
        question: "Can I replay old Globle puzzles?",
        answer:
          "Yes — each archived day is replayable, letting you practice color-map reading on past countries."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes — each day's country is added to the archive as soon as the puzzle publishes."
      }
    ],
    relatedLinks: [
      { href: "/globle-answer-today", label: "Globle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/worldle-answer-today", label: "Worldle Answer Today" },
      { href: "/countryle-answer-today", label: "Countryle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

const marker = '\n};\n';
const src = await readFile(registryPath, 'utf8');
const idx = src.lastIndexOf(marker);
if (idx === -1) throw new Error('final }; not found in registry');

const blocks = [];
for (const [key, entry] of Object.entries(ENTRIES)) {
  if (src.includes(`'${key}':`)) {
    console.log(`SKIP ${key}: already present`);
    continue;
  }
  blocks.push(entry);
  console.log(`ADD ${key}`);
}

if (blocks.length === 0) {
  console.log('Nothing to add.');
} else {
  const insertion = blocks.map((b) => `${b},`).join('\n\n');
  const base = src.slice(0, idx).replace(/,\s*$/, '');
  const next = base + ',\n\n' + insertion + '\n' + src.slice(idx + 1);
  await writeFile(registryPath, next);
  console.log(`Inserted ${blocks.length} article(s).`);
}
