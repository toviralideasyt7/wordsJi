// Batch 4: GameDle family solver articles.
// Run with: node scripts/add-articles-b4.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['smashdle-solver'] = `  'smashdle-solver': {
    key: 'smashdle-solver',
    eyebrow: 'Smashdle Solver Guide',
    intro:
      "Smashdle is the daily Super Smash Bros. guessing game where you identify a mystery fighter using attributes like universe, weight class, and jump count — across Classic, Emoji, Silhouette, Final Smash, and Kirby Copy modes. The Smashdle solver filters the entire Ultimate roster with every clue, so you can crack the daily fighter fast and learn the roster logic the game rewards. Here is how it works and the strategy that wins most days by guess four.",
    sections: [
      {
        heading: "How the Smashdle solver narrows the roster",
        paragraphs: [
          "Smashdle scores your guessed fighter against the answer across attributes — universe, weight class, jump count, and more — with green, yellow, and gray verdicts per attribute. The solver applies those verdicts to the full Ultimate roster, eliminating every fighter that contradicts a single clue.",
          "Universe is the sharpest filter. The roster spans Mario, Zelda, Kirby, Pokémon, and dozens of third-party franchises, and locking the universe can cut the pool by 90 percent in one move.",
          "Weight class and jump count are the tiebreakers. Two fighters from the same universe often share a weight class, so the solver uses the rarer attributes — jump count, final smash type — to split the survivors."
        ],
        callout: {
          title: "Universe first, stats second",
          body: "Nail the universe with your first guess, then use weight, jumps, and final smash to split the survivors. That two-stage filter is the whole game."
        }
      },
      {
        heading: "The Smashdle modes and how they change play",
        paragraphs: [
          "Classic mode gives you the standard attribute grid — universe, weight, jumps. Emoji and Silhouette modes test visual recognition instead, showing you the fighter's icon or outline and letting your knowledge of the roster do the work.",
          "Final Smash mode reveals the fighter's special move, which is often the fastest solve in the game: every Final Smash is tied to its fighter, and recognizing 'the beam that turns everyone into trophies' is an instant answer.",
          "Kirby Copy mode shows the ability Kirby copies from the fighter — a hat, a power, a signature weapon. Each mode rewards a different kind of roster knowledge, and the solver's filtering logic works across all of them."
        ],
        list: {
          title: "Smashdle modes at a glance",
          items: [
            "Classic — attribute grid: universe, weight, jumps, and more",
            "Emoji — identify the fighter from their emoji icon",
            "Silhouette — identify the fighter from their outline",
            "Final Smash — identify the fighter from their special move",
            "Kirby Copy — identify the fighter from Kirby's copied ability"
          ]
        }
      },
      {
        heading: "A real Smashdle solve, step by step",
        paragraphs: [
          "Open with a fighter you know well — Mario, Link, or Kirby — because the feedback on a familiar fighter is easy to read. Suppose the game returns green on universe, yellow on weight, and gray on jumps: you now know the answer's universe, and you have ruled out the jump count entirely.",
          "Your second guess should be a fighter from the confirmed universe whose weight differs from your opener. The yellow weight tells you which direction to move, and the solver's list of surviving universe-mates guides the pick.",
          "By guess three, the roster is usually down to a handful of fighters from one universe, and the remaining attribute — Final Smash type, or a specific weight class — settles it. Most Classic solves finish by guess four."
        ]
      },
      {
        heading: "Common mistakes the Smashdle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing across universes instead of confirming one. Players who bounce between Mario, Pokémon, and Zelda fighters never lock a universe, so the pool never collapses. The solver forces universe confirmation first.",
          "The second mistake is ignoring jump count. Jumps are the rarest discriminator — most fighters have one, a handful have two or three — so a jump verdict eliminates nearly the entire roster instantly. Players underuse it.",
          "The third mistake is forgetting the DLC fighters. Kazuya, Sephiroth, Sora, and Pyra/Mythra come from franchises many players do not know, which makes them sneaky answers. The solver's roster includes every DLC fighter, so its candidates are always valid."
        ]
      },
      {
        heading: "Why the Smashdle solver page ranks in search",
        paragraphs: [
          "Smashdle is searched every day — 'smashdle', 'smashdle answers', 'smashdle answers today' — and this page serves the players who want to solve the daily fighter with a smarter process: the attribute filtering and mode strategy are exactly what they need.",
          "The guide also earns traffic from Smash fans who want to improve: the universe-first strategy and roster knowledge tips transfer to every mode and to the actual game.",
          "Bookmark it for the days the answer is a deep-cut DLC fighter. The solver will find them, and the strategy above will make you faster on every daily guess after."
        ]
      }
    ],
    faqHeading: "Smashdle Solver FAQ",
    faqs: [
      {
        question: "How does the Smashdle solver work?",
        answer:
          "It applies your attribute verdicts — universe, weight, jumps, and more — to the full Ultimate roster, eliminating every fighter that contradicts a clue until the answer is the only candidate left."
      },
      {
        question: "What are the Smashdle modes?",
        answer:
          "Classic (attribute grid), Emoji, Silhouette, Final Smash, and Kirby Copy — each testing a different kind of fighter knowledge, all solvable with the same filtering logic."
      },
      {
        question: "How many fighters are in the Smashdle pool?",
        answer:
          "The full Super Smash Bros. Ultimate roster — over 80 fighters including every DLC addition like Kazuya, Sephiroth, Sora, and Pyra/Mythra."
      },
      {
        question: "What is the best first guess in Smashdle?",
        answer:
          "A fighter you know well — Mario, Link, or Kirby — because the feedback on a familiar fighter is easy to read and the universe verdict is the strongest filter."
      },
      {
        question: "Does the solver work for past Smashdle puzzles?",
        answer:
          "Yes — the attribute logic is identical every day, so the solver works for any past or future puzzle."
      }
    ],
    relatedLinks: [
      { href: "/smashdle-answer-today", label: "Smashdle Answer Today" },
      { href: "/loldle-answer-today", label: "LoLdle Answer Today" },
      { href: "/pokedle-answer-today", label: "Pokedle Answer Today" },
      { href: "/narutodle-answer-today", label: "Narutodle Answer Today" },
      { href: "/dotadle-answer-today", label: "Dotadle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['loldle-solver'] = `  'loldle-solver': {
    key: 'loldle-solver',
    eyebrow: 'LoLdle Solver Guide',
    intro:
      "LoLdle is the daily League of Legends guessing game where you identify a mystery champion from attributes like region, role, gender, species, and resource type — in Classic, Ability, Emoji, and Splash Art modes. The LoLdle solver filters the entire champion roster with every clue, so you can crack the daily champion fast and learn the lore logic the game rewards. Here is how it works and the strategy that wins most days.",
    sections: [
      {
        heading: "How the LoLdle solver narrows the champion pool",
        paragraphs: [
          "LoLdle scores your guessed champion against the answer across attributes — region, role, gender, species, resource — with green, yellow, and gray verdicts. The solver applies those verdicts to the full champion roster, eliminating every champion that contradicts any clue.",
          "Region is the strongest filter. League's world spans Demacia, Noxus, Piltover, Zaun, Ionia, and a dozen more regions, and locking the region can cut the pool by three-quarters in one move.",
          "Role and resource are the tiebreakers. Two champions from the same region often share a role, so the solver uses the rarer attributes — species, gender, release year — to split the survivors.",
        ],
        callout: {
          title: "Region first, role second",
          body: "Lock the region with your first guess, then use role, resource, and species to split the survivors. That staged filter is the fastest path to the answer."
        }
      },
      {
        heading: "The LoLdle modes and their logic",
        paragraphs: [
          "Classic mode gives you the full attribute grid — region, role, gender, species, resource — and rewards champions you know in detail. Ability mode shows the champion's ability icon and tests your memory of every kit in the game.",
          "Emoji mode is a visual game: the champion is represented by a small set of emojis that encode their lore and gameplay. Recognizing 'the masked shadow assassin' from a mask emoji is the fastest possible solve.",
          "Splash Art mode reveals a tiny crop of the champion's splash art and tests how well you know the game's art. Each mode rewards a different kind of knowledge, and the solver's filtering works across all of them."
        ],
        list: {
          title: "LoLdle modes at a glance",
          items: [
            "Classic — full attribute grid: region, role, gender, species, resource",
            "Ability — identify the champion from their ability icons",
            "Emoji — identify the champion from lore-based emoji",
            "Splash Art — identify the champion from a crop of their splash art"
          ]
        }
      },
      {
        heading: "A real LoLdle solve, step by step",
        paragraphs: [
          "Open with a champion you know cold — Ahri, Garen, or Yasuo — because the feedback on a familiar champion is easy to read. Suppose the game returns green on region, yellow on role, and gray on species: you now know the region, and the species verdict eliminates entire classes of champions.",
          "Your second guess should be a champion from the confirmed region with a different role and species, which the solver's surviving list makes easy to pick.",
          "By guess three, the pool is usually down to a handful of champions from one region, and the remaining attribute — resource type or gender — settles it. Most Classic solves finish by guess four or five."
        ]
      },
      {
        heading: "Common mistakes the LoLdle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing across regions. Players who bounce between champions from different parts of Runeterra never lock a region, so the pool never collapses. The solver forces region confirmation first.",
          "The second mistake is ignoring species. Species — human, spirit, void-born, undead — is a coarse filter that eliminates whole classes instantly. Players underuse it because they focus on role.",
          "The third mistake is forgetting that some champions share everything but their release year. When two champions match every clue, the solver's candidate ranking — which weighs recent releases — breaks the tie."
        ]
      },
      {
        heading: "Why the LoLdle solver page ranks in search",
        paragraphs: [
          "LoLdle players search for the daily champion and answers — 'loldle answers', 'loldle answers today' — and this page serves the players who want to solve with a smarter process: the attribute filtering and region-first strategy are exactly what they need.",
          "The guide also earns traffic from League fans who want to improve: the lore-based attribute knowledge transfers to every mode and to the game itself.",
          "Bookmark it for the days the answer is a champion you have never played. The solver will find them, and the strategy above will make you faster on every daily guess after."
        ]
      }
    ],
    faqHeading: "LoLdle Solver FAQ",
    faqs: [
      {
        question: "How does the LoLdle solver work?",
        answer:
          "It applies your attribute verdicts — region, role, gender, species, and resource — to the full champion roster, eliminating every champion that contradicts a clue until the answer remains."
      },
      {
        question: "What are the LoLdle modes?",
        answer:
          "Classic (attribute grid), Ability (ability icons), Emoji (lore-based emoji), and Splash Art (cropped splash art) — each testing a different kind of champion knowledge."
      },
      {
        question: "How many champions are in the LoLdle pool?",
        answer:
          "The pool covers the full League of Legends roster — over 160 champions across every region of Runeterra, including all recent releases."
      },
      {
        question: "What is the best first guess in LoLdle?",
        answer:
          "A champion you know in detail — Ahri, Garen, or Yasuo — because the feedback on a familiar champion is easy to read and the region verdict is the strongest filter."
      },
      {
        question: "Does the solver work for past LoLdle puzzles?",
        answer:
          "Yes — the attribute logic is identical every day, so the solver works for any past or future puzzle."
      }
    ],
    relatedLinks: [
      { href: "/loldle-answer-today", label: "LoLdle Answer Today" },
      { href: "/smashdle-answer-today", label: "Smashdle Answer Today" },
      { href: "/pokedle-answer-today", label: "Pokedle Answer Today" },
      { href: "/narutodle-answer-today", label: "Narutodle Answer Today" },
      { href: "/dotadle-answer-today", label: "Dotadle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['pokedle-solver'] = `  'pokedle-solver': {
    key: 'pokedle-solver',
    eyebrow: 'Pokedle Solver Guide',
    intro:
      "Pokedle is the daily Pokémon guessing game where you identify a mystery Pokémon from attributes like type, generation, height, weight, and evolution stage. The Pokedle solver filters the entire Pokédex with every clue, so you can crack the daily Pokémon fast and learn the dex logic the game rewards. Here is how it works and the strategy that wins most days.",
    sections: [
      {
        heading: "How the Pokedle solver narrows the Pokédex",
        paragraphs: [
          "Pokedle scores your guessed Pokémon against the answer across attributes — type, generation, height, weight, evolution — with green, yellow, and gray verdicts. The solver applies those verdicts to the full Pokédex, eliminating every Pokémon that contradicts a single clue.",
          "Type is the strongest filter. With eighteen types and the dual-type combinations, a confirmed type can cut the dex by more than half in one move.",
          "Height and weight are the tiebreakers. Two Pokémon of the same type and generation often differ in size, so the solver uses the numeric attributes — and their yellow proximity windows — to split the survivors.",
        ],
        callout: {
          title: "Type first, numbers second",
          body: "Lock the type with your first guess, then use generation, height, and weight to split the survivors. That staged filter is the fastest path to the answer."
        }
      },
      {
        heading: "A real Pokedle solve, step by step",
        paragraphs: [
          "Open with a Pokémon you know cold — Pikachu, Charizard, or Eevee — because the feedback on a familiar Pokémon is easy to read. Suppose the game returns green on type, yellow on height, and gray on generation: you now know the type, and the generation verdict eliminates entire eras of the dex.",
          "Your second guess should be a Pokémon of the confirmed type with a different size and generation, which the solver's surviving list makes easy to pick.",
          "By guess three, the pool is usually down to a handful of Pokémon of one type, and the remaining attribute — weight or evolution stage — settles it. Most solves finish by guess four or five."
        ]
      },
      {
        heading: "The numeric attributes and their windows",
        paragraphs: [
          "Height and weight are continuous, so Pokedle gives proximity feedback: yellow means the answer is within a set window of your guess's value. The solver encodes those exact windows, so a yellow height genuinely tells you the answer is close in size.",
          "This proximity logic is the most underused skill in Pokedle. Players treat a yellow height as a vague 'sort of close', when it actually pins the answer to a narrow size band.",
          "Generation is categorical and coarse — one of nine eras — making it the second-best filter after type. Confirming the generation eliminates four-fifths of the dex immediately."
        ],
        list: {
          title: "Pokedle attributes at a glance",
          items: [
            "Type — the strongest filter, with dual-type combinations",
            "Generation — one of nine eras, coarse and powerful",
            "Height — numeric, with a yellow proximity window",
            "Weight — numeric, with a yellow proximity window",
            "Evolution stage — basic, middle, or final form"
          ]
        }
      },
      {
        heading: "Common mistakes the Pokedle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing across types. Players who bounce between different types never lock the strongest filter, so the pool never collapses. The solver forces type confirmation first.",
          "The second mistake is ignoring the proximity windows. A yellow height is a precise band, not a vague hint — the solver treats it as a hard numeric constraint.",
          "The third mistake is forgetting evolution stage. Stage is a clean three-way split — basic, middle, final — that players routinely ignore, and confirming it early can halve the remaining pool."
        ]
      },
      {
        heading: "Why the Pokedle solver page ranks in search",
        paragraphs: [
          "Pokedle players search for the daily answer — 'pokedle answers', 'pokedle answer today' — and this page serves the players who want to solve with a smarter process: the type-first filtering and proximity logic are exactly what they need.",
          "The guide also earns traffic from Pokémon fans who want to improve: the dex knowledge and attribute strategy transfer to every mode and to the games themselves.",
          "Bookmark it for the days the answer is an obscure dex entry. The solver will find it, and the strategy above will make you faster on every daily guess after."
        ]
      }
    ],
    faqHeading: "Pokedle Solver FAQ",
    faqs: [
      {
        question: "How does the Pokedle solver work?",
        answer:
          "It applies your attribute verdicts — type, generation, height, weight, and evolution — to the full Pokédex, eliminating every Pokémon that contradicts a clue until the answer remains."
      },
      {
        question: "What attributes does Pokedle use?",
        answer:
          "Type, generation, height, weight, and evolution stage — with green, yellow, and gray verdicts for each, including proximity windows on the numeric attributes."
      },
      {
        question: "How many Pokémon are in the Pokedle pool?",
        answer:
          "The pool covers the full national Pokédex — over a thousand Pokémon across all nine generations, including regional forms and evolutions."
      },
      {
        question: "What is the best first guess in Pokedle?",
        answer:
          "A Pokémon you know cold — Pikachu, Charizard, or Eevee — because the feedback on a familiar Pokémon is easy to read and the type verdict is the strongest filter."
      },
      {
        question: "Does the solver work for past Pokedle puzzles?",
        answer:
          "Yes — the attribute logic is identical every day, so the solver works for any past or future puzzle."
      }
    ],
    relatedLinks: [
      { href: "/pokedle-answer-today", label: "Pokedle Answer Today" },
      { href: "/loldle-answer-today", label: "LoLdle Answer Today" },
      { href: "/smashdle-answer-today", label: "Smashdle Answer Today" },
      { href: "/narutodle-answer-today", label: "Narutodle Answer Today" },
      { href: "/dotadle-answer-today", label: "Dotadle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['narutodle-solver'] = `  'narutodle-solver': {
    key: 'narutodle-solver',
    eyebrow: 'Narutodle Solver Guide',
    intro:
      "Narutodle is the daily Naruto guessing game where you identify a mystery character from attributes like village, clan, rank, and jutsu type. The Narutodle solver filters the entire shinobi roster with every clue, so you can crack the daily character fast and learn the lore logic the game rewards. Here is how it works and the strategy that wins most days.",
    sections: [
      {
        heading: "How the Narutodle solver narrows the roster",
        paragraphs: [
          "Narutodle scores your guessed character against the answer across attributes — village, clan, rank, and jutsu — with green, yellow, and gray verdicts. The solver applies those verdicts to the full character roster, eliminating every shinobi that contradicts any clue.",
          "Village is the strongest filter. The world spans Konoha, Suna, Kiri, Kumo, Iwa, and the Akatsuki, and locking the village can cut the pool by two-thirds in one move.",
          "Clan and rank are the tiebreakers. Two shinobi from the same village often share a rank, so the solver uses the rarer attributes — clan, jutsu type — to split the survivors.",
        ],
        callout: {
          title: "Village first, clan second",
          body: "Lock the village with your first guess, then use clan, rank, and jutsu to split the survivors. That staged filter is the fastest path to the answer."
        }
      },
      {
        heading: "A real Narutodle solve, step by step",
        paragraphs: [
          "Open with a character you know cold — Naruto, Sasuke, or Kakashi — because the feedback on a familiar character is easy to read. Suppose the game returns green on village, yellow on rank, and gray on clan: you now know the village, and the clan verdict eliminates entire family lines.",
          "Your second guess should be a character from the confirmed village with a different clan and rank, which the solver's surviving list makes easy to pick.",
          "By guess three, the pool is usually down to a handful of shinobi from one village, and the remaining attribute — jutsu type or rank — settles it. Most solves finish by guess four or five."
        ]
      },
      {
        heading: "The lore attributes and how to read them",
        paragraphs: [
          "Village and clan are categorical: either the character belongs or they do not, with no proximity. That makes them the cleanest filters, and the solver treats them as hard exclusions.",
          "Rank is a coarse scale — Genin, Chunin, Jonin, Kage, and the special ranks like Anbu — which splits the roster into tiers. Confirming the rank eliminates everyone outside it.",
          "Jutsu type tests how well you know the moves: taijutsu, ninjutsu, genjutsu, and the signature kekkei genkai abilities. It is the finest filter, and the solver uses it to break ties between otherwise-identical candidates."
        ],
        list: {
          title: "Narutodle attributes at a glance",
          items: [
            "Village — Konoha, Suna, Kiri, Kumo, Iwa, Akatsuki, and more",
            "Clan — Uchiha, Uzumaki, Hyuga, Nara, and the rest",
            "Rank — Genin through Kage, plus special ranks",
            "Jutsu type — taijutsu, ninjutsu, genjutsu, kekkei genkai"
          ]
        }
      },
      {
        heading: "Common mistakes the Narutodle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing across villages. Players who bounce between Konoha and Akatsuki characters never lock the strongest filter, so the pool never collapses. The solver forces village confirmation first.",
          "The second mistake is ignoring clan. Clan is a precise categorical filter that eliminates entire family lines instantly. Players underuse it because they focus on rank.",
          "The third mistake is forgetting the filler and movie characters. The roster is bigger than the main cast, and obscure characters are sneaky answers. The solver's list includes the full roster, so its candidates are always valid."
        ]
      },
      {
        heading: "Why the Narutodle solver page ranks in search",
        paragraphs: [
          "Narutodle players search for the daily answer — 'narutodle answers', 'narutodle answers today' — and this page serves the players who want to solve with a smarter process: the village-first filtering and clan logic are exactly what they need.",
          "The guide also earns traffic from Naruto fans who want to improve: the lore knowledge and attribute strategy transfer to every mode and to the series itself.",
          "Bookmark it for the days the answer is a deep-cut side character. The solver will find them, and the strategy above will make you faster on every daily guess after."
        ]
      }
    ],
    faqHeading: "Narutodle Solver FAQ",
    faqs: [
      {
        question: "How does the Narutodle solver work?",
        answer:
          "It applies your attribute verdicts — village, clan, rank, and jutsu type — to the full character roster, eliminating every shinobi that contradicts a clue until the answer remains."
      },
      {
        question: "What attributes does Narutodle use?",
        answer:
          "Village, clan, rank, and jutsu type — with green, yellow, and gray verdicts for each attribute."
      },
      {
        question: "How many characters are in the Narutodle pool?",
        answer:
          "The pool covers the full Naruto and Naruto Shippuden roster — main cast, side characters, villains, and movie characters alike."
      },
      {
        question: "What is the best first guess in Narutodle?",
        answer:
          "A character you know cold — Naruto, Sasuke, or Kakashi — because the feedback on a familiar character is easy to read and the village verdict is the strongest filter."
      },
      {
        question: "Does the solver work for past Narutodle puzzles?",
        answer:
          "Yes — the attribute logic is identical every day, so the solver works for any past or future puzzle."
      }
    ],
    relatedLinks: [
      { href: "/narutodle-answer-today", label: "Narutodle Answer Today" },
      { href: "/loldle-answer-today", label: "LoLdle Answer Today" },
      { href: "/pokedle-answer-today", label: "Pokedle Answer Today" },
      { href: "/smashdle-answer-today", label: "Smashdle Answer Today" },
      { href: "/dotadle-answer-today", label: "Dotadle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['dotadle-solver'] = `  'dotadle-solver': {
    key: 'dotadle-solver',
    eyebrow: 'Dotadle Solver Guide',
    intro:
      "Dotadle is the daily Dota 2 guessing game where you identify a mystery hero from attributes like primary attribute, role, lane, and release year. The Dotadle solver filters the entire hero pool with every clue, so you can crack the daily hero fast and learn the roster logic the game rewards. Here is how it works and the strategy that wins most days.",
    sections: [
      {
        heading: "How the Dotadle solver narrows the hero pool",
        paragraphs: [
          "Dotadle scores your guessed hero against the answer across attributes — primary attribute (strength, agility, intelligence), role, lane, and release year — with green, yellow, and gray verdicts. The solver applies those verdicts to the full hero pool, eliminating every hero that contradicts a clue.",
          "Primary attribute is the strongest filter. One-third of the pool is strength, one-third agility, one-third intelligence, so confirming the attribute cuts the pool by two-thirds in one move.",
          "Role and lane are the tiebreakers. Two strength heroes often share a lane, so the solver uses the rarer attributes — release year, attack type — to split the survivors.",
        ],
        callout: {
          title: "Attribute first, lane second",
          body: "Lock the primary attribute with your first guess, then use role, lane, and release year to split the survivors. That staged filter is the fastest path to the answer."
        }
      },
      {
        heading: "A real Dotadle solve, step by step",
        paragraphs: [
          "Open with a hero you know cold — Pudge, Invoker, or Crystal Maiden — because the feedback on a familiar hero is easy to read. Suppose the game returns green on attribute, yellow on role, and gray on lane: you now know the primary attribute, and the lane verdict eliminates entire positions.",
          "Your second guess should be a hero of the confirmed attribute with a different role and lane, which the solver's surviving list makes easy to pick.",
          "By guess three, the pool is usually down to a handful of heroes of one attribute, and the remaining clue — release year or attack type — settles it. Most solves finish by guess four or five."
        ]
      },
      {
        heading: "The Dota attributes and how to read them",
        paragraphs: [
          "Primary attribute is categorical and perfectly split: strength, agility, and intelligence each hold about a third of the pool. Confirming it is the single biggest move in the game.",
          "Role and lane overlap — a hero can be support and mid, or carry and safe lane — so the solver treats them as soft filters that rank candidates rather than eliminate them outright.",
          "Release year is the fine filter. The oldest heroes date to the original Dota, while recent additions like Ringmaster and Kez are new. Year proximity — the yellow window — is the solver's tiebreaker when everything else matches."
        ],
        list: {
          title: "Dotadle attributes at a glance",
          items: [
            "Primary attribute — strength, agility, or intelligence",
            "Role — carry, support, initiator, nuker, and more",
            "Lane — safe, mid, off, or roaming",
            "Release year — from the original roster to the newest patch heroes",
            "Attack type — melee or ranged"
          ]
        }
      },
      {
        heading: "Common mistakes the Dotadle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing across attributes. Players who bounce between strength and intelligence heroes never lock the strongest filter, so the pool never collapses. The solver forces attribute confirmation first.",
          "The second mistake is ignoring release year. Year is a precise discriminator that players overlook — confirming the era of the hero eliminates decades of releases instantly.",
          "The third mistake is forgetting melee versus ranged. It is a clean binary split that the solver uses early to halve the pool, but players rarely enter it into their reasoning."
        ]
      },
      {
        heading: "Why the Dotadle solver page ranks in search",
        paragraphs: [
          "Dotadle players search for the daily answer — 'dotadle answers', 'dotadle answers today' — and this page serves the players who want to solve with a smarter process: the attribute-first filtering and year logic are exactly what they need.",
          "The guide also earns traffic from Dota fans who want to improve: the hero knowledge and attribute strategy transfer to every mode and to the game itself.",
          "Bookmark it for the days the answer is a niche support. The solver will find them, and the strategy above will make you faster on every daily guess after."
        ]
      }
    ],
    faqHeading: "Dotadle Solver FAQ",
    faqs: [
      {
        question: "How does the Dotadle solver work?",
        answer:
          "It applies your attribute verdicts — primary attribute, role, lane, and release year — to the full hero pool, eliminating every hero that contradicts a clue until the answer remains."
      },
      {
        question: "What attributes does Dotadle use?",
        answer:
          "Primary attribute (strength, agility, intelligence), role, lane, release year, and attack type — with green, yellow, and gray verdicts for each."
      },
      {
        question: "How many heroes are in the Dotadle pool?",
        answer:
          "The pool covers the full Dota 2 roster — over 120 heroes, from the original roster to the newest patch additions."
      },
      {
        question: "What is the best first guess in Dotadle?",
        answer:
          "A hero you know cold — Pudge, Invoker, or Crystal Maiden — because the feedback on a familiar hero is easy to read and the attribute verdict is the strongest filter."
      },
      {
        question: "Does the solver work for past Dotadle puzzles?",
        answer:
          "Yes — the attribute logic is identical every day, so the solver works for any past or future puzzle."
      }
    ],
    relatedLinks: [
      { href: "/dotadle-answer-today", label: "Dotadle Answer Today" },
      { href: "/loldle-answer-today", label: "LoLdle Answer Today" },
      { href: "/pokedle-answer-today", label: "Pokedle Answer Today" },
      { href: "/smashdle-answer-today", label: "Smashdle Answer Today" },
      { href: "/narutodle-answer-today", label: "Narutodle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['onepiecedle-solver'] = `  'onepiecedle-solver': {
    key: 'onepiecedle-solver',
    eyebrow: 'OnePieceDle Solver Guide',
    intro:
      "OnePieceDle is the daily One Piece guessing game where you identify a mystery character from attributes like crew, role, and arc. The OnePieceDle solver filters the entire pirate roster with every clue, so you can crack the daily character fast and learn the lore logic the game rewards. Here is how it works and the strategy that wins most days.",
    sections: [
      {
        heading: "How the OnePieceDle solver narrows the roster",
        paragraphs: [
          "OnePieceDle scores your guessed character against the answer across attributes — crew, role, and arc — with green, yellow, and gray verdicts. The solver applies those verdicts to the full character roster, eliminating every pirate that contradicts any clue.",
          "Crew is the strongest filter. The world spans the Straw Hats, the Marines, the Yonko crews, the Seven Warlords, and dozens more organizations, and locking the crew can cut the pool by three-quarters in one move.",
          "Role and arc are the tiebreakers. Two characters from the same crew often share a role, so the solver uses the rarer attributes — debut arc, bounty tier — to split the survivors.",
        ],
        callout: {
          title: "Crew first, arc second",
          body: "Lock the crew with your first guess, then use role and debut arc to split the survivors. That staged filter is the fastest path to the answer."
        }
      },
      {
        heading: "A real OnePieceDle solve, step by step",
        paragraphs: [
          "Open with a character you know cold — Luffy, Zoro, or Nami — because the feedback on a familiar character is easy to read. Suppose the game returns green on crew, yellow on role, and gray on arc: you now know the crew, and the arc verdict eliminates entire sagas of the story.",
          "Your second guess should be a character from the confirmed crew with a different role and arc, which the solver's surviving list makes easy to pick.",
          "By guess three, the pool is usually down to a handful of characters from one crew, and the remaining attribute — debut arc or bounty — settles it. Most solves finish by guess four or five."
        ]
      },
      {
        heading: "The One Piece attributes and how to read them",
        paragraphs: [
          "Crew is categorical: the character either belongs to the organization or they do not, with no proximity. That makes it the cleanest filter, and the solver treats it as a hard exclusion.",
          "Role is a coarse scale — captain, swordsman, navigator, cook, doctor, and the villain archetypes — which splits the roster into tiers. Confirming the role eliminates everyone outside it.",
          "Debut arc tests how well you know the story's structure: East Blue, Alabasta, Skypiea, Water 7, Marineford, Dressrosa, Wano, and beyond. It is the fine filter the solver uses to break ties."
        ],
        list: {
          title: "OnePieceDle attributes at a glance",
          items: [
            "Crew — Straw Hats, Marines, Yonko crews, Warlords, and more",
            "Role — captain, swordsman, navigator, villain, and more",
            "Debut arc — East Blue through the current saga",
            "Bounty tier — from rookie bounties to the Yonko billions"
          ]
        }
      },
      {
        heading: "Common mistakes the OnePieceDle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing across crews. Players who bounce between Straw Hats and Marine characters never lock the strongest filter, so the pool never collapses. The solver forces crew confirmation first.",
          "The second mistake is ignoring debut arc. Arc is a precise categorical filter that eliminates entire eras of the story instantly. Players underuse it because they focus on crew.",
          "The third mistake is forgetting the minor crews. The roster is bigger than the main cast, and obscure side characters are sneaky answers. The solver's list includes the full roster, so its candidates are always valid."
        ]
      },
      {
        heading: "Why the OnePieceDle solver page ranks in search",
        paragraphs: [
          "OnePieceDle players search for the daily answer — 'onepiecedle answers', 'onepiecedle answers today' — and this page serves the players who want to solve with a smarter process: the crew-first filtering and arc logic are exactly what they need.",
          "The guide also earns traffic from One Piece fans who want to improve: the lore knowledge and attribute strategy transfer to every mode and to the series itself.",
          "Bookmark it for the days the answer is a deep-cut side character. The solver will find them, and the strategy above will make you faster on every daily guess after."
        ]
      }
    ],
    faqHeading: "OnePieceDle Solver FAQ",
    faqs: [
      {
        question: "How does the OnePieceDle solver work?",
        answer:
          "It applies your attribute verdicts — crew, role, and debut arc — to the full character roster, eliminating every pirate that contradicts a clue until the answer remains."
      },
      {
        question: "What attributes does OnePieceDle use?",
        answer:
          "Crew, role, and debut arc — with green, yellow, and gray verdicts for each attribute."
      },
      {
        question: "How many characters are in the OnePieceDle pool?",
        answer:
          "The pool covers the full One Piece roster — Straw Hats, Marines, Yonko crews, Warlords, and side characters across every arc."
      },
      {
        question: "What is the best first guess in OnePieceDle?",
        answer:
          "A character you know cold — Luffy, Zoro, or Nami — because the feedback on a familiar character is easy to read and the crew verdict is the strongest filter."
      },
      {
        question: "Does the solver work for past OnePieceDle puzzles?",
        answer:
          "Yes — the attribute logic is identical every day, so the solver works for any past or future puzzle."
      }
    ],
    relatedLinks: [
      { href: "/onepiecedle-answer-today", label: "OnePieceDle Answer Today" },
      { href: "/loldle-answer-today", label: "LoLdle Answer Today" },
      { href: "/pokedle-answer-today", label: "Pokedle Answer Today" },
      { href: "/narutodle-answer-today", label: "Narutodle Answer Today" },
      { href: "/dotadle-answer-today", label: "Dotadle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
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
