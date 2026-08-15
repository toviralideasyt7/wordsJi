// Batch 6: archive articles for games whose archives lacked registry content.
// Run with: node scripts/add-articles-b6.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['waffle-archive'] = `  'waffle-archive': {
    key: 'waffle-archive',
    eyebrow: 'Waffle Archive Guide',
    intro:
      "The Waffle archive is the complete record of every daily Waffle grid — the six interlocking words for each date, searchable and free to browse. Waffle is the word game that hands you a grid full of scrambled letters and a fixed swap budget, so the archive is more than a list of answers: it is the record of how the game builds its grids, which words it reuses, and how the swap math plays out across hundreds of puzzles. Here is how to use it and what it teaches.",
    sections: [
      {
        heading: "Every Waffle grid, archived",
        paragraphs: [
          "Waffle publishes one new grid every day, and this archive holds the complete sequence — every date, every set of six interlocking words. The full history is here, rendered on the page and searchable by date or word.",
          "Each entry shows the date, the six words, and the grid layout they form. Browsing the archive reveals the game's construction habits: the common five-letter words it favors, the way across and down words share letters, and the daily rhythm of difficulty.",
          "The archive is the reference for players who track Waffle's answers, want to replay an old grid, or need to confirm a past solution."
        ],
        callout: {
          title: "Six words, one grid, full history",
          body: "The complete Waffle record — every daily grid and its six answers, searchable by date or word."
        }
      },
      {
        heading: "How to use the Waffle archive",
        paragraphs: [
          "Search by date to load a specific day's grid, or search by word to find every puzzle that used a particular answer. The calendar view lets you click any date and see its six words instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's word-selection patterns across the entire run.",
          "For practice, each archived day is replayable: load the date and try to solve the grid within the original swap budget, exactly as the daily game works."
        ]
      },
      {
        heading: "What the Waffle archive teaches",
        paragraphs: [
          "The archive reveals how Waffle designs its grids. The daily answers skew toward common, everyday five-letter words, because the game's challenge comes from the swap mechanic, not the vocabulary.",
          "The interlock structure is the second lesson. Across and down words share letters at their intersections, and the archive shows how the game arranges those shared letters to make grids tight but solvable.",
          "The word families are the third lesson. Waffle reuses favorite words across days, and the archive makes that reuse visible — useful intelligence for players who want to recognize grids faster."
        ],
        list: {
          title: "Waffle archive study patterns",
          items: [
            "Track the common-word bias across grids",
            "Study how intersection letters are shared",
            "Replay old grids within the original swap budget",
            "Note the game's favorite five-letter answers"
          ]
        }
      },
      {
        heading: "The swap budget, seen across the archive",
        paragraphs: [
          "Every Waffle grid ships with a fixed number of swaps, and the archive lets you compare how that budget is spent. Some grids need most of their swaps to fix the center; others spread the work across all six words.",
          "Studying archived grids teaches the double-swap technique: when two letters are in each other's correct positions, one swap fixes them both. The archive is full of such pairs, and recognizing them is the fastest way to improve.",
          "The pattern is consistent: the best Waffle players read the grid for reciprocal pairs before touching anything, and the archive is the training ground for that reading."
        ]
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive and the daily puzzle support each other. Play the daily grid honestly, and when a solution eludes you, the archive confirms the six words — but the real payoff is the study material it leaves behind.",
          "Waffle players who work through past grids develop a feel for the game's construction, and that feel transfers directly to the daily puzzle: familiar word shapes and shared-letter patterns jump out immediately.",
          "The archive also settles arguments. When a community thread asks what a past Waffle grid was, the archive is the clean, definitive answer."
        ]
      }
    ],
    faqHeading: "Waffle Archive FAQ",
    faqs: [
      {
        question: "What is the Waffle archive?",
        answer:
          "It is the complete, searchable history of every daily Waffle grid — the six interlocking words for each date, browseable by calendar or list."
      },
      {
        question: "How does Waffle work?",
        answer:
          "Waffle gives you a grid of scrambled letters containing six interlocking five-letter words — three across and three down — and a fixed number of swaps to unscramble them."
      },
      {
        question: "Can I replay past Waffle puzzles from the archive?",
        answer:
          "Yes. Load any archived date and solve the grid within its original swap budget, exactly like the daily game."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes. Each day's grid and its six words are added to the archive as soon as the puzzle publishes."
      },
      {
        question: "How does the archive help me get better at Waffle?",
        answer:
          "Studying archived grids teaches the double-swap technique, reveals the game's favorite words, and builds the pattern recognition that speeds up every daily solve."
      }
    ],
    relatedLinks: [
      { href: "/waffle-answer-today", label: "Waffle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  }`;

ENTRIES['worgle-archive'] = `  'worgle-archive': {
    key: 'worgle-archive',
    eyebrow: 'Worgle Archive Guide',
    intro:
      "The Worgle archive is the complete record of every daily Worgle answer — the word for each date, searchable and free to browse. Worgle puts its own twist on the classic word formula, and the archive preserves every daily word so you can confirm a past answer, replay an old puzzle, or study the game's word-selection habits across its full history. Here is how to use it and what the record reveals.",
    sections: [
      {
        heading: "Every Worgle answer, archived",
        paragraphs: [
          "Worgle publishes one new word every day, and this archive holds the complete sequence — every date, every answer. The full history is here, rendered on the page and searchable by date or word.",
          "Each entry shows the date and the word that was the answer that day. Browsing the archive reveals the game's answer habits — the letter patterns it favors, the vocabulary level it targets, and how the daily difficulty drifts.",
          "The archive is the reference for players who track Worgle's answers and want to revisit past puzzles or confirm an old word."
        ],
        callout: {
          title: "Every answer, in the record",
          body: "The complete Worgle history — the answer word for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Worgle archive",
        paragraphs: [
          "Search by date to load a specific day's answer, or search by word to find every puzzle that used a particular answer. The calendar view lets you click any date and see its word instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's word-selection patterns.",
          "For practice, each archived day is replayable: load the date and try to solve the word with the same guess budget the daily game gives you."
        ]
      },
      {
        heading: "What the Worgle archive teaches",
        paragraphs: [
          "The archive reveals Worgle's word-selection habits. The daily answers skew toward common, playable words, and the archive makes that bias visible across the full history.",
          "The structure mix is the second lesson. Some answers favor repeated letters, others favor common consonant clusters, and tracking the archive's mix shows you the word shapes the game prefers.",
          "The vocabulary level is the third lesson. Worgle stays firmly in everyday vocabulary, which is exactly why the daily game rewards broad but common word knowledge."
        ],
        list: {
          title: "Worgle archive study patterns",
          items: [
            "Track the common-word bias across answers",
            "Study the repeated-letter frequency",
            "Note the consonant clusters the game favors",
            "Replay old days to practice within the daily budget"
          ]
        }
      },
      {
        heading: "The daily twist, explained through the archive",
        paragraphs: [
          "Worgle's twist on the classic formula shows up in the archive as a consistent pattern: the answers are built so that the twist matters every day, not just occasionally. Studying the archive reveals how the twist shapes word choice.",
          "The practical effect is that Worgle rewards different guesses than plain wordle. The archive is the evidence — answer after answer following the same structural rules, which you can learn faster by browsing the record than by playing one daily at a time.",
          "For players who want the edge, the archive is a study set: scan a month of answers and the game's rule set becomes obvious."
        ]
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive and the daily puzzle support each other. Play the daily game honestly, and when the twist trips you up, the archive confirms the answer — but the real payoff is the pattern knowledge it builds.",
          "Players who work through past answers develop a feel for the game's word selection, and that feel transfers directly to the daily puzzle: familiar shapes and structures jump out immediately.",
          "The archive also settles arguments. When a community thread asks what a past Worgle answer was, the archive is the clean, definitive answer."
        ]
      }
    ],
    faqHeading: "Worgle Archive FAQ",
    faqs: [
      {
        question: "What is the Worgle archive?",
        answer:
          "It is the complete, searchable history of every daily Worgle answer — the word for each date, browseable by calendar or list."
      },
      {
        question: "What is Worgle?",
        answer:
          "Worgle is a daily word game that puts its own twist on the classic guessing formula. The daily answer follows the game's rule set, which the archive's history makes visible."
      },
      {
        question: "Can I replay past Worgle puzzles from the archive?",
        answer:
          "Yes. Load any archived date and try to solve the word with the same guess budget the daily game gives you."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes. Each day's answer is added to the archive as soon as the puzzle publishes."
      },
      {
        question: "How does the archive help me get better at Worgle?",
        answer:
          "Browsing the history reveals the game's word-selection habits and the structure of its twist, so you can recognize the answer patterns faster in the daily game."
      }
    ],
    relatedLinks: [
      { href: "/worgle-answer-today", label: "Worgle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  }`;

ENTRIES['worldle-archive'] = `  'worldle-archive': {
    key: 'worldle-archive',
    eyebrow: 'Worldle Archive Guide',
    intro:
      "The Worldle archive is the complete record of every daily Worldle country — the mystery territory for each date, searchable and free to browse. Worldle shows you a country's silhouette and asks you to name it from the shape alone, with distance and direction hints after each guess. The archive preserves every daily answer so you can confirm a past country, replay an old puzzle, or study the game's geographic selection habits. Here is how to use it and what the record reveals.",
    sections: [
      {
        heading: "Every Worldle country, archived",
        paragraphs: [
          "Worldle publishes one new country every day, and this archive holds the complete sequence — every date, every mystery territory. The full history is here, rendered on the page and searchable by date or country.",
          "Each entry shows the date and the country that was the answer that day. Browsing the archive reveals the game's selection habits — the continents it rotates through, the island nations it favors, and the territories it uses for tricky silhouette days.",
          "The archive is the reference for players who track Worldle's answers and want to revisit past puzzles or confirm an old country."
        ],
        callout: {
          title: "Every territory, in the record",
          body: "The complete Worldle history — the country answer for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Worldle archive",
        paragraphs: [
          "Search by date to load a specific day's country, or search by country to find every puzzle that used a particular territory. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's geographic rotation patterns.",
          "For practice, each archived day is replayable: load the date and try to identify the country from its silhouette with the same hint budget the daily game gives you."
        ]
      },
      {
        heading: "What the Worldle archive teaches",
        paragraphs: [
          "The archive reveals Worldle's geographic habits. The daily answers rotate through continents, and the archive makes the rotation visible — a stretch of European countries, then Asia, then the island nations of the Pacific.",
          "The silhouette difficulty is the second lesson. Some countries have instantly recognizable shapes — the boot of Italy, the horn of Africa — while others are genuinely hard to read, and the archive shows how the game mixes them.",
          "The hint system is the third lesson. Distance and direction hints compound over guesses, and archived puzzles show exactly how those hints narrow the map for different starting guesses."
        ],
        list: {
          title: "Worldle archive study patterns",
          items: [
            "Track the continent rotation across weeks",
            "Study the recognizable-silhouette countries",
            "Note which territories the game uses for hard days",
            "Replay old days to practice the distance-and-direction system"
          ]
        }
      },
      {
        heading: "Silhouette reading, sharpened by the archive",
        paragraphs: [
          "The archive is the best silhouette-reading trainer on the site. Because you can flip through hundreds of country shapes at your own pace, you build the visual memory that makes the daily game fast.",
          "The key skill is learning to read proportions before borders: how wide a country is relative to its height, whether it bulges north or south, whether it is an island or landlocked. The archive lets you drill exactly that.",
          "The distance-and-direction hints then do the rest. The archive shows the full arc of a solve — first guess, hint, second guess, closer — which teaches you how much information each hint carries."
        ]
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive and the daily puzzle support each other. Play the daily game honestly, and when a silhouette defeats you, the archive confirms the country — but the real payoff is the geography it builds.",
          "Players who work through past answers develop a mental map of the world's shapes, and that map transfers directly to the daily puzzle: recognizable silhouettes jump out immediately.",
          "The archive also settles arguments. When a community thread asks what a past Worldle country was, the archive is the clean, definitive answer."
        ]
      }
    ],
    faqHeading: "Worldle Archive FAQ",
    faqs: [
      {
        question: "What is the Worldle archive?",
        answer:
          "It is the complete, searchable history of every daily Worldle country — the mystery territory for each date, browseable by calendar or list."
      },
      {
        question: "How does Worldle work?",
        answer:
          "Worldle shows you a country's silhouette and asks you to guess it from the shape alone. After each guess you receive distance and direction hints toward the answer."
      },
      {
        question: "Can I replay past Worldle puzzles from the archive?",
        answer:
          "Yes. Load any archived date and try to identify the country from its silhouette with the same hint budget the daily game gives you."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes. Each day's country is added to the archive as soon as the puzzle publishes."
      },
      {
        question: "How does the archive help me get better at Worldle?",
        answer:
          "Flipping through the archived silhouettes builds the visual memory and proportion-reading skill that make daily solves faster and more accurate."
      }
    ],
    relatedLinks: [
      { href: "/worldle-answer-today", label: "Worldle Answer Today" },
      { href: "/globle-answer-today", label: "Globle Answer Today" },
      { href: "/countryle-answer-today", label: "Countryle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" }
    ]
  }`;

ENTRIES['searchle-archive'] = `  'searchle-archive': {
    key: 'searchle-archive',
    eyebrow: 'Searchle Archive Guide',
    intro:
      "The Searchle archive is the complete record of every daily Searchle query — the mystery search phrase for each date, searchable and free to browse. Searchle is the game where you reverse-engineer a search query: you guess a phrase and the game ranks it, telling you how close you are to the mystery query. The archive preserves every daily answer so you can confirm a past query, replay an old puzzle, or study how the game picks its search phrases. Here is how to use it and what the record reveals.",
    sections: [
      {
        heading: "Every Searchle query, archived",
        paragraphs: [
          "Searchle publishes one new mystery query every day, and this archive holds the complete sequence — every date, every search phrase. The full history is here, rendered on the page and searchable by date or phrase.",
          "Each entry shows the date and the query that was the answer that day. Browsing the archive reveals the game's selection habits — the topics it cycles through, the phrasing patterns it favors, and the difficulty curve of its daily picks.",
          "The archive is the reference for players who track Searchle's answers and want to revisit past puzzles or confirm an old query."
        ],
        callout: {
          title: "Every query, in the record",
          body: "The complete Searchle history — the mystery search phrase for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Searchle archive",
        paragraphs: [
          "Search by date to load a specific day's query, or search by phrase to find every puzzle that used a particular search term. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's topic rotation patterns.",
          "For practice, each archived day is replayable: load the date and try to reverse-engineer the query with the same rank-feedback system the daily game uses."
        ]
      },
      {
        heading: "What the Searchle archive teaches",
        paragraphs: [
          "The archive reveals Searchle's query-selection habits. The daily answers mix famous searches, everyday questions, and occasional deep cuts, and the archive makes that mix visible across the full history.",
          "The phrasing style is the second lesson. Search queries have a grammar of their own — keywords, modifiers, and the way people actually type into a search box — and the archive shows how the game models real search behavior.",
          "The ranking system is the third lesson. The game ranks your guesses by semantic closeness, and archived puzzles show how different phrasing approaches perform against the same mystery query."
        ],
        list: {
          title: "Searchle archive study patterns",
          items: [
            "Track the topic rotation across weeks",
            "Study the natural-language phrasing style",
            "Note how modifiers change the rank",
            "Replay old days to practice the rank-closeness system"
          ]
        }
      },
      {
        heading: "Search thinking, sharpened by the archive",
        paragraphs: [
          "The archive is the best search-thinking trainer on the site. Because you can work through hundreds of past queries, you build the intuition for what makes a guess rank well against the game's mystery phrase.",
          "The key skill is learning to guess broad before narrow: a general query that captures the topic earns a useful rank, while a hyper-specific guess either lands or misses completely. The archive lets you drill exactly that balance.",
          "The closeness feedback then does the rest. The archive shows the full arc of a solve — first guess, rank, refinement, closer — which teaches you how much each rank jump means."
        ]
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive and the daily puzzle support each other. Play the daily game honestly, and when a query defeats you, the archive confirms the answer — but the real payoff is the search-thinking it builds.",
          "Players who work through past queries develop a feel for how the game's ranking works, and that feel transfers directly to the daily puzzle: the right phrasing jumps out faster.",
          "The archive also settles arguments. When a community thread asks what a past Searchle query was, the archive is the clean, definitive answer."
        ]
      }
    ],
    faqHeading: "Searchle Archive FAQ",
    faqs: [
      {
        question: "What is the Searchle archive?",
        answer:
          "It is the complete, searchable history of every daily Searchle query — the mystery search phrase for each date, browseable by calendar or list."
      },
      {
        question: "How does Searchle work?",
        answer:
          "Searchle asks you to reverse-engineer a mystery search query. You guess a phrase and the game ranks it, telling you how close you are to the answer based on semantic closeness."
      },
      {
        question: "Can I replay past Searchle puzzles from the archive?",
        answer:
          "Yes. Load any archived date and try to reverse-engineer the query with the same rank-feedback system the daily game uses."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes. Each day's query is added to the archive as soon as the puzzle publishes."
      },
      {
        question: "How does the archive help me get better at Searchle?",
        answer:
          "Working through past queries builds the intuition for phrasing, topic coverage, and how the ranking system responds — the exact skills the daily game rewards."
      }
    ],
    relatedLinks: [
      { href: "/searchle-answer-today", label: "Searchle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" }
    ]
  }`;

ENTRIES['colorfle-archive'] = `  'colorfle-archive': {
    key: 'colorfle-archive',
    eyebrow: 'Colorfle Archive Guide',
    intro:
      "The Colorfle archive is the complete record of every daily Colorfle color — the target hue for each date, searchable and free to browse. Colorfle is the daily color puzzle where you guess a color from a palette and the game tells you how far your guess is from the answer, in a warm or cool direction. The archive preserves every daily answer with its name and hex value, so you can confirm a past color, replay an old puzzle, or study the game's color-selection habits. Here is how to use it and what the record reveals.",
    sections: [
      {
        heading: "Every Colorfle color, archived",
        paragraphs: [
          "Colorfle publishes one new color every day, and this archive holds the complete sequence — every date, every target hue. The full history is here, rendered on the page and searchable by date, name, or hex value.",
          "Each entry shows the date, the color name, and its exact hex value. Browsing the archive reveals the game's selection habits — the hue families it cycles through, the saturation levels it favors, and how it mixes instantly-recognizable colors with subtle near-misses.",
          "The archive is the reference for players who track Colorfle's answers and want to revisit past puzzles or confirm an old color."
        ],
        callout: {
          title: "Every hue, in the record",
          body: "The complete Colorfle history — the target color for every date, with name and hex, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Colorfle archive",
        paragraphs: [
          "Search by date to load a specific day's color, by name to find a familiar hue, or by hex value to locate an exact shade. The calendar view lets you click any date and see its color instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's hue-rotation patterns.",
          "For practice, each archived day is replayable: load the date and try to find the target color with the same distance-feedback system the daily game uses."
        ]
      },
      {
        heading: "What the Colorfle archive teaches",
        paragraphs: [
          "The archive reveals Colorfle's hue-selection habits. The daily answers rotate through the color wheel, and the archive makes the rotation visible — reds, then blues, then yellows, then the in-between shades.",
          "The distance feedback is the second lesson. Each guess tells you how far you are from the answer and whether to move warmer or cooler, and the archive shows how that feedback compounds across a full solve.",
          "The naming is the third lesson. Colorfle answers carry recognizable names, and the archive shows how the game picks between everyday names and more unusual shades."
        ],
        list: {
          title: "Colorfle archive study patterns",
          items: [
            "Track the hue rotation across weeks",
            "Study the warm-versus-cool feedback arcs",
            "Note the mix of common and unusual color names",
            "Replay old days to practice within the guess budget"
          ]
        }
      },
      {
        heading: "Color vision, sharpened by the archive",
        paragraphs: [
          "The archive is the best color-vision trainer on the site. Because you can work through hundreds of past targets, you build the perceptual skill that makes the daily game fast.",
          "The key skill is learning to read color in dimensions — hue, saturation, and lightness — rather than by name. The archive lets you drill exactly that, one archived answer at a time.",
          "The distance feedback then does the rest. The archive shows the full arc of a solve — first guess, distance, warm or cool, closer — which teaches you how much each feedback value means."
        ]
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive and the daily puzzle support each other. Play the daily game honestly, and when a color defeats you, the archive confirms the answer — but the real payoff is the color perception it builds.",
          "Players who work through past answers develop a feel for the color wheel, and that feel transfers directly to the daily puzzle: the right region of the wheel jumps out faster.",
          "The archive also settles arguments. When a community thread asks what a past Colorfle color was, the archive is the clean, definitive answer."
        ]
      }
    ],
    faqHeading: "Colorfle Archive FAQ",
    faqs: [
      {
        question: "What is the Colorfle archive?",
        answer:
          "It is the complete, searchable history of every daily Colorfle color — the target hue for each date with its name and hex value, browseable by calendar or list."
      },
      {
        question: "How does Colorfle work?",
        answer:
          "Colorfle asks you to guess a target color from a palette. Each guess tells you how far your color is from the answer and whether to move warmer or cooler."
      },
      {
        question: "Can I replay past Colorfle puzzles from the archive?",
        answer:
          "Yes. Load any archived date and try to find the target color with the same distance-feedback system the daily game uses."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes. Each day's color is added to the archive as soon as the puzzle publishes."
      },
      {
        question: "How does the archive help me get better at Colorfle?",
        answer:
          "Working through archived targets builds the hue, saturation, and lightness perception that makes daily solves faster and more accurate."
      }
    ],
    relatedLinks: [
      { href: "/colorfle-answer-today", label: "Colorfle Answer Today" },
      { href: "/colordle-answer-today", label: "Colordle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/globle-answer-today", label: "Globle Answer Today" }
    ]
  }`;

ENTRIES['countryle-archive'] = `  'countryle-archive': {
    key: 'countryle-archive',
    eyebrow: 'Countryle Archive Guide',
    intro:
      "The Countryle archive is the complete record of every daily Countryle country — the mystery nation for each date, searchable and free to browse. Countryle is the daily geography puzzle where you guess a country and the game shows you how close you are, using distance, direction, and border clues. The archive preserves every daily answer so you can confirm a past country, replay an old puzzle, or study the game's geographic selection habits. Here is how to use it and what the record reveals.",
    sections: [
      {
        heading: "Every Countryle country, archived",
        paragraphs: [
          "Countryle publishes one new country every day, and this archive holds the complete sequence — every date, every mystery nation. The full history is here, rendered on the page and searchable by date or country.",
          "Each entry shows the date, the country, and the geography data that defines it — region, population, and the borders that make each puzzle solvable. Browsing the archive reveals the game's selection habits across the full history.",
          "The archive is the reference for players who track Countryle's answers and want to revisit past puzzles or confirm an old country."
        ],
        callout: {
          title: "Every nation, in the record",
          body: "The complete Countryle history — the country answer for every date, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Countryle archive",
        paragraphs: [
          "Search by date to load a specific day's country, or search by country to find every puzzle that used a particular nation. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's geographic rotation patterns.",
          "For practice, each archived day is replayable: load the date and try to identify the country with the same distance, direction, and border clues the daily game gives you."
        ]
      },
      {
        heading: "What the Countryle archive teaches",
        paragraphs: [
          "The archive reveals Countryle's geographic habits. The daily answers rotate through continents and regions, and the archive makes the rotation visible across the full history.",
          "The border logic is the second lesson. Border clues are the most powerful hint in Countryle, and the archive shows how the game's answers sit inside their neighborhood of neighbors.",
          "The population and region data is the third lesson. Countryle bundles real geography data with every answer, and the archive preserves it — turning every archived puzzle into a small lesson about the country."
        ],
        list: {
          title: "Countryle archive study patterns",
          items: [
            "Track the continent and region rotation",
            "Study the border-neighborhood logic",
            "Note how population data narrows candidates",
            "Replay old days to practice the clue system"
          ]
        }
      },
      {
        heading: "Geography thinking, sharpened by the archive",
        paragraphs: [
          "The archive is the best geography trainer on the site. Because you can work through hundreds of past countries, you build the mental map that makes the daily game fast.",
          "The key skill is learning to think in neighborhoods: which countries border which, which regions share climate and culture, and how population data separates similar nations. The archive lets you drill exactly that.",
          "The distance-and-direction clues then do the rest. The archive shows the full arc of a solve — first guess, distance, direction, closer — which teaches you how much each clue narrows the map."
        ]
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive and the daily puzzle support each other. Play the daily game honestly, and when a country defeats you, the archive confirms the answer — but the real payoff is the geography it builds.",
          "Players who work through past answers develop a mental map of the world's nations and borders, and that map transfers directly to the daily puzzle: the right region jumps out faster.",
          "The archive also settles arguments. When a community thread asks what a past Countryle country was, the archive is the clean, definitive answer."
        ]
      }
    ],
    faqHeading: "Countryle Archive FAQ",
    faqs: [
      {
        question: "What is the Countryle archive?",
        answer:
          "It is the complete, searchable history of every daily Countryle country — the mystery nation for each date, browseable by calendar or list."
      },
      {
        question: "How does Countryle work?",
        answer:
          "Countryle asks you to guess a country and shows you how close you are, using distance, direction, and border clues after each guess."
      },
      {
        question: "Can I replay past Countryle puzzles from the archive?",
        answer:
          "Yes. Load any archived date and try to identify the country with the same distance, direction, and border clues the daily game gives you."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes. Each day's country is added to the archive as soon as the puzzle publishes."
      },
      {
        question: "How does the archive help me get better at Countryle?",
        answer:
          "Working through past countries builds your mental map of the world — borders, regions, and populations — which makes daily solves dramatically faster."
      }
    ],
    relatedLinks: [
      { href: "/countryle-answer-today", label: "Countryle Answer Today" },
      { href: "/globle-answer-today", label: "Globle Answer Today" },
      { href: "/worldle-answer-today", label: "Worldle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" }
    ]
  }`;

ENTRIES['framed-archive'] = `  'framed-archive': {
    key: 'framed-archive',
    eyebrow: 'Framed Archive Guide',
    intro:
      "The Framed archive is the complete record of every daily Framed movie — the mystery film for each date, searchable and free to browse. Framed is the daily movie-guessing game where each frame reveals a little more of a mystery film and you have six chances to name it. The archive preserves every daily answer with its year and director, so you can confirm a past movie, replay an old puzzle, or study the game's film-selection habits. Here is how to use it and what the record reveals.",
    sections: [
      {
        heading: "Every Framed movie, archived",
        paragraphs: [
          "Framed publishes one new movie every day, and this archive holds the complete sequence — every date, every mystery film. The full history is here, rendered on the page and searchable by date or title.",
          "Each entry shows the date, the movie, its release year, and the director. Browsing the archive reveals the game's selection habits — the eras it cycles through, the genres it favors, and how it mixes blockbusters with cult classics.",
          "The archive is the reference for players who track Framed's answers and want to revisit past puzzles or confirm an old movie."
        ],
        callout: {
          title: "Every film, in the record",
          body: "The complete Framed history — the movie answer for every date, with year and director, searchable and free to browse."
        }
      },
      {
        heading: "How to use the Framed archive",
        paragraphs: [
          "Search by date to load a specific day's movie, by title to find a familiar film, or by year to browse a particular era. The calendar view lets you click any date and see its answer instantly.",
          "The list view shows puzzles in chronological order, so you can scroll the full history and track the game's film-selection patterns.",
          "For practice, each archived day is replayable: load the date and try to identify the movie from its frames with the same six-chance budget the daily game gives you."
        ]
      },
      {
        heading: "What the Framed archive teaches",
        paragraphs: [
          "The archive reveals Framed's film-selection habits. The daily answers mix eras and genres, and the archive makes the mix visible — a week of 90s classics, then modern blockbusters, then an indie deep cut.",
          "The frame readability is the second lesson. Some movies are identifiable from a single frame — a distinctive set design, a famous actor, a signature shot — while others need most of the reveal, and the archive shows the difference.",
          "The director and year data is the third lesson. Framed bundles the film's metadata with every answer, and the archive preserves it — turning every archived puzzle into a small film-history lesson."
        ],
        list: {
          title: "Framed archive study patterns",
          items: [
            "Track the era rotation across weeks",
            "Study the single-frame identifiable films",
            "Note the genre mix between blockbusters and classics",
            "Replay old days to practice within six chances"
          ]
        }
      },
      {
        heading: "Film recognition, sharpened by the archive",
        paragraphs: [
          "The archive is the best film-recognition trainer on the site. Because you can work through hundreds of past movies, you build the visual memory that makes the daily game fast.",
          "The key skill is learning to read frames for evidence: set design, era-typical cinematography, actor faces, and the directorial signatures that identify a film. The archive lets you drill exactly that.",
          "The frame-by-frame reveal then does the rest. The archive shows the full arc of a solve — first frame, guess, more frames, confirmation — which teaches you how much each frame is worth."
        ]
      },
      {
        heading: "The archive and the daily game",
        paragraphs: [
          "The archive and the daily puzzle support each other. Play the daily game honestly, and when a movie defeats you, the archive confirms the answer — but the real payoff is the film knowledge it builds.",
          "Players who work through past answers develop a mental library of films, directors, and visual signatures, and that library transfers directly to the daily puzzle: recognizable frames jump out faster.",
          "The archive also settles arguments. When a community thread asks what a past Framed movie was, the archive is the clean, definitive answer."
        ]
      }
    ],
    faqHeading: "Framed Archive FAQ",
    faqs: [
      {
        question: "What is the Framed archive?",
        answer:
          "It is the complete, searchable history of every daily Framed movie — the mystery film for each date with its year and director, browseable by calendar or list."
      },
      {
        question: "How does Framed work?",
        answer:
          "Framed shows you a movie one frame at a time, revealing a little more with each frame. You have six chances to name the film correctly."
      },
      {
        question: "Can I replay past Framed puzzles from the archive?",
        answer:
          "Yes. Load any archived date and try to identify the movie from its frames with the same six-chance budget the daily game gives you."
      },
      {
        question: "Is the archive updated daily?",
        answer:
          "Yes. Each day's movie is added to the archive as soon as the puzzle publishes."
      },
      {
        question: "How does the archive help me get better at Framed?",
        answer:
          "Working through past films builds your mental library of directors, eras, and visual signatures, which makes recognizing the daily movie dramatically faster."
      }
    ],
    relatedLinks: [
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  }`;

const src = await readFile(registryPath, 'utf8');
const blocks = [];
for (const [key, entry] of Object.entries(ENTRIES)) {
  if (src.includes(`  '${key}': {`)) {
    console.log(`SKIP ${key} (exists)`);
    continue;
  }
  blocks.push(entry);
  console.log(`ADD ${key}`);
}

if (blocks.length === 0) {
  console.log('Nothing to add.');
} else {
  const idx = src.lastIndexOf('};');
  const insertion = blocks.map((b) => `${b},`).join('\n\n');
  const base = src.slice(0, idx).replace(/,\s*$/, '');
  const next = base + ',\n\n' + insertion + '\n' + src.slice(idx);
  await writeFile(registryPath, next);
  console.log(`Inserted ${blocks.length} article(s).`);
}
