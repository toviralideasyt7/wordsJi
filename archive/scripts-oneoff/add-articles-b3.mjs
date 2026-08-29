// Batch 3: remaining standalone solver articles.
// Run with: node scripts/add-articles-b3.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['boggle-solver'] = `  'boggle-solver': {
    key: 'boggle-solver',
    eyebrow: 'Boggle Solver Guide',
    intro:
      "Boggle is the dice-shaker word game where you race to find as many words as possible in a 4×4 grid of letters — adjacent letters connect, and words must be three letters or longer. The Boggle solver finds every valid word in any grid, so you can check your finds, settle disputes, and learn the hidden words the dice almost always contain. Here is how it works and how it makes you a faster player.",
    sections: [
      {
        heading: "How the Boggle solver scans the grid",
        paragraphs: [
          "The solver treats the 4×4 board as a graph: every cell is a node, and each cell connects to its eight neighbors — horizontally, vertically, and diagonally. It walks every possible path of adjacent letters, checking each sequence against a dictionary as it goes.",
          "That walk is a depth-first search with early pruning: the moment a letter sequence cannot start any dictionary word, the solver stops following that path. Pruning is what makes the search instant instead of astronomical, because raw path counts explode exponentially with length.",
          "The result is the complete word list for your grid — every valid word of three letters or more, with no duplicates and no invented words. If the solver says a word is there, it is there, and the solver can even show you the exact path of cells that spells it."
        ],
        callout: {
          title: "The eight-neighbor rule",
          body: "In Boggle, letters connect horizontally, vertically, and diagonally — eight neighbors per cell. Diagonal connections are where the hidden words live, and the solver uses all eight directions."
        }
      },
      {
        heading: "Reading the solver's word list",
        paragraphs: [
          "The solver lists every findable word, usually grouped by length, so you can instantly see the long words you missed — the four-letter minimum for official play, plus the five, six, and seven-letter treasures that win rounds.",
          "Long words are the real points in Boggle. A six-letter word beats two four-letter words, and the solver's list is sorted to surface the long finds first. When the group shouts 'it's not a word!', the solver settles it with authority.",
          "The solver also marks the words you already found, so you can review exactly what the rest of the group missed and why — usually a diagonal connection through a letter you did not think to use."
        ]
      },
      {
        heading: "Boggle strategy without the solver",
        paragraphs: [
          "Train yourself to spot the grid's rare letters first. Q, X, J, Z, and K are in few words, so the words containing them are easy wins — most players overlook them entirely under time pressure.",
          "Scan in rings around each vowel. Every Boggle word contains at least one vowel, so anchoring on the vowel cells and tracing every adjacent path is the systematic approach experts use.",
          "Look for suffixes and prefixes as you scan. If you see a path spelling 'BURN', the extensions — BURNS, BURNED, BURNING — are often reachable through the neighboring cells, and each extension is a separate word.",
          "Finally, remember the corners. Corner cells have only three neighbors, which makes them entry points for words that snake along the board's edge — and edge paths are exactly what other players miss."
        ],
        list: {
          title: "Winning habits from fast Boggle players",
          items: [
            "Hunt rare letters (Q, X, J, Z, K) early — they are low-competition points",
            "Anchor on vowels and trace every adjacent path",
            "Extend found words with suffixes whenever the letters allow",
            "Never skip the corners and edges of the board",
            "Keep a running mental list to avoid re-finding the same word"
          ]
        }
      },
      {
        heading: "How the solver teaches better play",
        paragraphs: [
          "Run the solver on a few random boards and study the words you missed. The patterns repeat: missed words are usually long, diagonal, or built around a rare letter — exactly the three categories above.",
          "The solver also exposes the difference between your board vision and the dictionary's. Many missed words are common words you know perfectly well — you just did not see them in the grid. Training your eye to connect letters in unfamiliar orders is the transferable skill.",
          "Speed matters too. The solver finds words in milliseconds; you have three minutes. Practicing against the solver's list — trying to match it before time runs out — is the fastest way to build real Boggle speed."
        ]
      },
      {
        heading: "Common mistakes the Boggle solver fixes",
        paragraphs: [
          "The classic mistake is reusing a letter cell. Boggle words cannot reuse a cell — each letter is used once per word. Players routinely 'find' words that pass through the same cell twice, and the solver never makes that error.",
          "The second mistake is skipping the diagonal neighbors. Words like 'tread' that zigzag diagonally are invisible to players who only check horizontal and vertical paths. The solver's eight-direction search finds them every time.",
          "The third mistake is claiming words not in the dictionary. The solver uses a standard English dictionary, so its list is the ground truth for disputes — no more arguing about whether a word counts."
        ]
      },
      {
        heading: "Why the Boggle solver page ranks in search",
        paragraphs: [
          "Boggle players search for solvers mid-game and mid-argument — 'boggle solver', 'boggle word finder', 'find words in this boggle board'. This page answers instantly with the complete list plus the strategy to play better without the tool.",
          "The guide also serves teachers and parents using Boggle as a spelling and vocabulary exercise: the strategy sections explain the game in a way that transfers directly to classroom play.",
          "Bookmark it for family game night. When the timer stops and the debate starts, the solver is the referee — and the strategy above will quietly make you the best player at the table."
        ]
      }
    ],
    faqHeading: "Boggle Solver FAQ",
    faqs: [
      {
        question: "How does the Boggle solver work?",
        answer:
          "It treats the board as a graph of connected cells and walks every adjacent path of letters, checking each against a dictionary and pruning dead ends to return the complete list of valid words."
      },
      {
        question: "Can Boggle words reuse a letter?",
        answer:
          "No. Each cell can be used once per word. The solver respects this rule, so every word it returns is a legal Boggle find."
      },
      {
        question: "Does the Boggle solver include diagonal words?",
        answer:
          "Yes — it checks all eight directions (horizontal, vertical, and diagonal), which is where the hidden words usually live."
      },
      {
        question: "What is the minimum word length in Boggle?",
        answer:
          "Official Boggle play counts words of three letters or more. The solver returns all valid words at or above that length."
      },
      {
        question: "Is the solver's dictionary standard?",
        answer:
          "The solver uses a standard English dictionary, making it the ground truth for settling disputes about whether a word counts."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/hangman-solver", label: "Hangman Solver" },
      { href: "/weaver-solver", label: "Weaver Solver" },
      { href: "/word-ladder-solver", label: "Word Ladder Solver" },
      { href: "/squaredle-solver", label: "Squaredle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['nerdle-solver'] = `  'nerdle-solver': {
    key: 'nerdle-solver',
    eyebrow: 'Nerdle Solver Guide',
    intro:
      "Nerdle is Wordle with arithmetic: you have six guesses to find an eight-character equation, and every digit, operator, and equals sign comes back green, purple, or black. The Nerdle solver filters the entire space of valid equations after every guess, so you can crack the daily puzzle fast and learn the math behind better guessing. Here is how it works, the equations it knows, and the strategy that beats most daily puzzles by guess four.",
    sections: [
      {
        heading: "How the Nerdle solver narrows the equation space",
        paragraphs: [
          "A Nerdle answer is a valid equation: eight characters, one equals sign, and an arithmetic relationship that actually evaluates. The solver maintains a list of every valid equation that matches your feedback, and each guess filters that list to a fraction of its size.",
          "The power of the solver is in the character-level feedback. Each of the eight tiles is either green (correct and in place), purple (in the equation but misplaced), or black (not in the equation at all). The solver applies all eight verdicts simultaneously, which is dramatically more information than Wordle's five letters.",
          "With a well-chosen first guess, the solver can cut the equation space by 90 percent in a single move. By guess three, most daily puzzles are down to a handful of candidate equations, and guess four is a formality."
        ],
        callout: {
          title: "Eight tiles of feedback",
          body: "Every Nerdle guess returns eight independent verdicts — one per character. The solver consumes all eight at once, which is why it narrows so much faster than letter-based games."
        }
      },
      {
        heading: "The Nerdle character census",
        paragraphs: [
          "A smart first guess should cover the characters that appear in most valid equations. The classic opener is something like 12+35=47 or 98-76=22 — guesses that sweep in multiple digits, an operator, and the equals sign.",
          "Digits appear unevenly in equations: 1, 2, and 0 are workhorses, while 9 and 8 appear less often but still frequently. Operators matter more: + and - appear in a majority of equations, while * and / are rarer and therefore more informative when they hit.",
          "The equals sign is the anchor. Every equation has exactly one, so a green equals sign locks the entire left/right split of the equation, which halves the search space by itself."
        ],
        list: {
          title: "Characters worth sweeping early",
          items: [
            "1, 2, and 0 — the most common digits in valid equations",
            "+ and - — the most common operators, found in most equations",
            "The equals sign — anchors the whole structure",
            "A repeated character, to test whether duplicates are allowed in the answer"
          ]
        }
      },
      {
        heading: "A real Nerdle solve, step by step",
        paragraphs: [
          "Open with a broad equation like 12+35=47. Suppose the game returns green on the 1, green on the +, black on most digits, and purple on the 5. The solver instantly knows the equation starts with 1, uses plus, contains 5 somewhere, and avoids the blacked-out digits.",
          "Your second guess should cover the surviving characters in new positions — say 15+26=41, which re-tests 1 and 5 while sweeping fresh digits and another operator slot. The feedback tightens the net: now you know where the plus goes and which digits are actually in play.",
          "By guess three the solver usually lists fewer than ten equations. Pick the most likely, verify it evaluates correctly, and the daily puzzle is solved with two guesses to spare. This rhythm — sweep, re-test, verify — is the same one every Nerdle expert uses."
        ]
      },
      {
        heading: "Why purple duplicates confuse players",
        paragraphs: [
          "Purple in Nerdle means the character is in the equation but not in this position — and a character can appear more than once. A purple 2 could mean one 2 elsewhere, or two 2s, one of which is elsewhere.",
          "This ambiguity trips up players who treat purple like Wordle's yellow. The solver handles it rigorously: it keeps equations with the right character counts, whether the duplication resolves or not.",
          "If you are playing without the solver, use a guess that repeats a purple character in a new position — that single test resolves the duplicate question and usually collapses the candidate list."
        ]
      },
      {
        heading: "Common mistakes the Nerdle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing equations with no equals-sign anchor. A guess without '=' wastes a full tile of feedback. Every guess should be a real, valid equation — that is what makes the feedback meaningful.",
          "The second mistake is ignoring the black tiles. A black digit is banned for the rest of the game, yet players keep slipping banned digits into later guesses. The solver hard-excludes blacked characters.",
          "The third mistake is committing to an operator too early. Players who lock in '*' after one purple tile miss that the equation might use a different operator entirely. The solver keeps all operator possibilities open until the feedback settles it."
        ],
        list: {
          title: "Three rules for a fast Nerdle",
          items: [
            "Every guess must be a valid eight-character equation",
            "Never reuse a blacked-out character",
            "Resolve purple duplicates with a deliberate test guess"
          ]
        }
      },
      {
        heading: "Why the Nerdle solver page ranks in search",
        paragraphs: [
          "Players search for the Nerdle answer and hints daily, and the solver page serves the ones who want to crack it themselves — 'nerdle solver', 'nerdle answer today', 'nerdle today' are all daily queries this page and its siblings answer.",
          "The solver is also a teaching tool: the strategy sections explain the equation space, character census, and purple-rule in plain math, which earns traffic from players who want to improve rather than just copy answers.",
          "Bookmark it for the days the equation fights back. The solver will crack it, and the strategy above will make you faster on every puzzle after."
        ]
      }
    ],
    faqHeading: "Nerdle Solver FAQ",
    faqs: [
      {
        question: "How does the Nerdle solver work?",
        answer:
          "It maintains the full list of valid eight-character equations and filters it with every guess's eight tile verdicts — green, purple, and black — until the answer is the only candidate left."
      },
      {
        question: "What does purple mean in Nerdle?",
        answer:
          "Purple means the character is in the equation but in a different position. A purple character may also appear more than once in the answer."
      },
      {
        question: "What is a good first guess in Nerdle?",
        answer:
          "A broad equation that sweeps common digits, an operator, and the equals sign — like 12+35=47 — maximizes the information from your first eight tiles."
      },
      {
        question: "Can the solver solve the daily Nerdle?",
        answer:
          "Yes. The solver works on any valid equation puzzle, including the daily one, usually solving within three to five guesses."
      },
      {
        question: "Why do black tiles matter so much?",
        answer:
          "A black tile bans that character for the rest of the game. Respecting bans is the single biggest accuracy lever in Nerdle."
      }
    ],
    relatedLinks: [
      { href: "/nerdle-answer-today", label: "Nerdle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/phrazle-answer-today", label: "Phrazle Answer Today" }
    ]
  }`;

ENTRIES['worldle-solver'] = `  'worldle-solver': {
    key: 'worldle-solver',
    eyebrow: 'Worldle Solver Guide',
    intro:
      "Worldle is the daily geography game that shows you a country's silhouette and gives you six guesses, with distance and direction feedback on every miss. The Worldle solver identifies the country from your distance clues, so you can check your geography instinct, learn the feedback rules, and get faster at reading the map. Here is how it works and how to think like a cartographer.",
    sections: [
      {
        heading: "How the Worldle solver identifies the country",
        paragraphs: [
          "Worldle gives you a silhouette and then distance feedback: every wrong guess reports how many kilometers your country is from the answer, plus a direction. The solver maintains a map of every country's location and filters by distance and bearing after each guess.",
          "The distance readout is the key signal. A guess 500 km away means the answer is a neighbor or near-neighbor; a guess 8,000 km away means another continent entirely. The solver turns those numbers into a shortlist of candidate countries.",
          "Because the feedback is numeric and absolute, the solver's filtering is precise: each guess's distance narrows the map to a ring, and the direction arrow cuts that ring to an arc. Two or three well-chosen guesses usually leave a handful of countries."
        ],
        callout: {
          title: "Distance is the message",
          body: "Every Worldle miss tells you exactly how far you are from the answer. Read the number as a band — under 1,000 km means a neighbor, over 4,000 km means a different continent — and jump accordingly."
        }
      },
      {
        heading: "Worldle strategy for geography players",
        paragraphs: [
          "Open with a country whose position splits the map usefully — central countries like the DRC, Kazakhstan, or Brazil give clean direction feedback that eliminates whole continents. Avoid islands early; their feedback is often ambiguous.",
          "Use the distance band to decide your next jump. If the first guess is 7,000 km away, do not nudge — leap to a country on the opposite side of the globe and read the new distance.",
          "Once you are under 1,000 km, switch to regional logic: list the countries near your last guess, check the direction arrow, and pick the one the arrow points at. Border countries resolve most puzzles from there."
        ],
        list: {
          title: "Worldle distance quick-guide",
          items: [
            "Over 6,000 km — wrong continent; jump hemispheres",
            "3,000–6,000 km — same hemisphere, likely different continent",
            "1,000–3,000 km — same region; think neighboring countries",
            "Under 1,000 km — you are in the neighborhood; use borders and the arrow",
            "Under 200 km — the answer is a direct neighbor"
          ]
        }
      },
      {
        heading: "Reading the silhouette",
        paragraphs: [
          "Before any guess, study the silhouette itself: its shape, its coastlines, its size relative to the frame. Distinctive shapes — Italy's boot, Chile's ribbon, Sri Lanka's teardrop — solve instantly for players who know their maps.",
          "Size is a clue too. A silhouette that fills the frame is a large country (Russia, Canada, Brazil); a small one could be an island or a microstate. Compare the silhouette to your mental map and start with the region it resembles.",
          "Continent-adjacent silhouettes are the hardest: countries like Indonesia and Greece look like scattered islands, and players often misjudge the framing. When the shape is ambiguous, lean on distance feedback rather than the silhouette."
        ]
      },
      {
        heading: "Common mistakes the Worldle solver prevents",
        paragraphs: [
          "The classic mistake is ignoring the direction arrow. Distance tells you how far, but the arrow tells you where — two guesses can be equidistant and opposite. Players who read only the number wander the map.",
          "The second mistake is island-phobia. Small islands are hard to hit but easy to reason about once you are close: a 300-km miss around a small island narrows to one or two candidates.",
          "The third mistake is forgetting the feedback compounds. Every miss narrows the map, so the last guesses are the most informative. Trust the pattern instead of panicking into random guesses."
        ]
      },
      {
        heading: "Why the Worldle solver page ranks in search",
        paragraphs: [
          "Worldle players search for the daily answer and country reveals, and the solver page serves the ones who want to solve it themselves — the feedback logic and distance bands are exactly what those players need.",
          "The page also earns traffic from geography learners: the strategy sections teach real map-reading skills that transfer far beyond the game.",
          "Bookmark it for the brutal days when the silhouette is a shape you have never seen. The solver will identify it, and the strategy above will make you a sharper map reader on every puzzle after."
        ]
      }
    ],
    faqHeading: "Worldle Solver FAQ",
    faqs: [
      {
        question: "How does the Worldle solver work?",
        answer:
          "It tracks every country's position and filters by the distance and direction feedback Worldle gives after each guess, narrowing the map to a shortlist of candidate countries."
      },
      {
        question: "How many guesses do you get in Worldle?",
        answer:
          "Worldle gives six guesses per daily puzzle, plus the silhouette, with distance and direction feedback on every miss."
      },
      {
        question: "What does the distance number mean in Worldle?",
        answer:
          "It is the straight-line distance from your guessed country to the answer. Read it as a band — under 1,000 km means a neighbor, over 4,000 km means another continent."
      },
      {
        question: "What is the best first guess in Worldle?",
        answer:
          "A central country like the DRC, Kazakhstan, or Brazil, because its position gives direction feedback that eliminates whole continents cleanly."
      },
      {
        question: "Does the solver work for past Worldle puzzles?",
        answer:
          "Yes. The solver works on any country, and the Worldle archive holds every past daily answer for practice."
      }
    ],
    relatedLinks: [
      { href: "/worldle-answer-today", label: "Worldle Answer Today" },
      { href: "/globle-answer-today", label: "Globle Answer Today" },
      { href: "/countryle-answer-today", label: "Countryle Answer Today" },
      { href: "/countryle-solver", label: "Countryle Solver" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['countryle-solver'] = `  'countryle-solver': {
    key: 'countryle-solver',
    eyebrow: 'Countryle Solver Guide',
    intro:
      "Countryle is the daily geography game where you guess a country and the game scores how close you are — by distance, borders, and continent. The Countryle solver uses your guess feedback to narrow the entire map to the likely answer, so you can verify your geography instinct, learn the feedback rules, and solve faster. Here is how it works and the strategy that wins most puzzles in four guesses.",
    sections: [
      {
        heading: "How the Countryle solver narrows the map",
        paragraphs: [
          "Countryle feedback is geographic: after each guess you learn how far you are from the answer, whether you are on the right continent, and whether you guessed a neighbor. The solver combines those clues to filter the country list down to candidates that match every signal.",
          "The strongest signal is the continent check. Most Countryle versions report the answer's continent, which instantly eliminates four-fifths of the map. From there, distance and border hints refine the region.",
          "The solver's candidate list after two or three guesses is typically a handful of countries — and it ranks them by how well they satisfy your clues, so the top pick is your best next guess."
        ],
        callout: {
          title: "Continent first, distance second",
          body: "Nail the continent with your first guess, then use distance bands to find the region, then borders to find the country. That three-stage filter is the whole game."
        }
      },
      {
        heading: "A Countryle solving rhythm",
        paragraphs: [
          "Your opener should be a large, central country whose position tells you the continent decisively — Brazil, the DRC, Kazakhstan, or Australia. If the feedback confirms the continent, you have already won the biggest battle.",
          "Guess two should jump to the likely region within that continent: if the answer is South America and your first guess was 3,000 km from Brazil, think the Andes; if it is Africa, think the Sahel or the south.",
          "From guess three onward, use border logic. List the countries near your last guess, check the distance, and pick the one that matches. Countryle puzzles almost always resolve within four or five guesses using this rhythm."
        ],
        list: {
          title: "Feedback signals Countryle gives you",
          items: [
            "Continent confirmation or denial",
            "Straight-line distance to the answer",
            "Neighbor confirmation when you guess an adjacent country",
            "Proximity hints for countries sharing a border region"
          ]
        }
      },
      {
        heading: "Common mistakes the Countryle solver fixes",
        paragraphs: [
          "The biggest mistake is ignoring continent feedback. Players who keep guessing within their own region while the game says the answer is elsewhere waste guess after guess. The solver treats continent as a hard filter.",
          "The second mistake is guessing tiny countries early. Microstates like Andorra or Malta are nearly impossible to hit blind, and their feedback barely narrows the map. Guess big, then refine.",
          "The third mistake is forgetting that landlocked countries exist. Players aiming for coasts miss the interior entirely; the solver's candidate list includes every country type, so it never suffers from coastal bias."
        ]
      },
      {
        heading: "Why the Countryle solver page ranks in search",
        paragraphs: [
          "Countryle players search for the daily answer and hints, and the solver page serves the players who want to solve it themselves — the continent-first strategy and distance bands are exactly the tools they need.",
          "The guide also earns traffic from geography learners: the strategy sections teach real map-reading skills that apply far beyond the daily game.",
          "Bookmark it for the days the answer is a country you have barely heard of. The solver will find it, and the strategy above will sharpen your map sense for every puzzle after."
        ]
      }
    ],
    faqHeading: "Countryle Solver FAQ",
    faqs: [
      {
        question: "How does the Countryle solver work?",
        answer:
          "It combines your guess feedback — continent, distance, and neighbor signals — to filter the country list down to the candidates that match every clue you have collected."
      },
      {
        question: "What is the best first guess in Countryle?",
        answer:
          "A large, central country like Brazil, the DRC, or Kazakhstan, because its position makes the continent feedback decisive."
      },
      {
        question: "How many guesses does a Countryle take?",
        answer:
          "Most puzzles resolve in four or five guesses using the continent-first rhythm: establish the continent, jump to the region, then use border logic."
      },
      {
        question: "Does the solver work for all Countryle versions?",
        answer:
          "Yes. The continent-distance-border logic applies to the main Countryle formats, and the solver adapts to the feedback style of your version."
      },
      {
        question: "What is the fastest way to get better at Countryle?",
        answer:
          "Practice reading distance bands and committing to continent switches. The solver's candidate lists teach you both with every use."
      }
    ],
    relatedLinks: [
      { href: "/countryle-answer-today", label: "Countryle Answer Today" },
      { href: "/worldle-solver", label: "Worldle Solver" },
      { href: "/globle-answer-today", label: "Globle Answer Today" },
      { href: "/worldle-answer-today", label: "Worldle Answer Today" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['colorfle-solver'] = `  'colorfle-solver': {
    key: 'colorfle-solver',
    eyebrow: 'Colorfle Solver Guide',
    intro:
      "Colorfle is the daily color-guessing game where you navigate a palette using directional feedback — warmer, cooler, lighter, darker, more or less saturated. The Colorfle solver tracks your position in color space and recommends the next move, so you can solve fast, verify your color intuition, and learn the three axes the game tests. Here is how it works and how to read color like a designer.",
    sections: [
      {
        heading: "How the Colorfle solver navigates color space",
        paragraphs: [
          "Every color can be described by three axes: hue (the color family), saturation (vividness), and lightness (how dark or light it is). Colorfle's feedback moves you along those axes — warmer or cooler changes hue, brighter or darker changes lightness, and more or less colorful changes saturation.",
          "The solver keeps a running estimate of the target along all three axes. Each piece of feedback shifts the estimate, and the solver recommends the guess that is most likely to lock in one axis completely.",
          "The result is a guided search: you stop wandering the palette and start walking a precise path toward the answer, usually landing within five or six guesses."
        ],
        callout: {
          title: "Three axes, one target",
          body: "Hue, saturation, and lightness are the whole game. Fix two axes with early guesses and only one remains — that is when Colorfle gets easy."
        }
      },
      {
        heading: "A Colorfle solving strategy",
        paragraphs: [
          "Open with a mid-palette color: mid-lightness, mid-saturation, a recognizable hue like a medium blue or green. Mid-palette guesses give informative feedback in every direction, while edge colors waste half their feedback.",
          "Make big moves early. Colorfle's feedback range is wide, and players who nudge one step at a time burn through guesses. If the game says 'much lighter', jump far up the lightness scale.",
          "Lock axes in order: hue first, then lightness, then saturation. Fixing the hue family immediately halves the palette; locking lightness cuts it again; saturation then resolves the final ambiguity."
        ],
        list: {
          title: "The Colorfle axis checklist",
          items: [
            "Hue — which color family is the target in?",
            "Lightness — is it a dark shade or a light tint?",
            "Saturation — vivid, muted, or grayish?",
            "Never guess a color you know contradicts an earlier verdict"
          ]
        }
      },
      {
        heading: "Common mistakes the Colorfle solver fixes",
        paragraphs: [
          "The biggest mistake is tiny adjustments. Players who nudge one step per guess run out of moves long before reaching the target. The solver moves big until the axes narrow.",
          "The second mistake is ignoring saturation. Saturation is the axis players forget, and a grayish target with a vivid guess is one of the most common Colorfle traps. The solver tracks it from move one.",
          "The third mistake is misreading warm versus cool. Warm and cool are directional on the hue wheel, and a guess 'too cool' means rotate toward the warm side — the solver keeps that direction straight."
        ]
      },
      {
        heading: "Why the Colorfle solver page ranks in search",
        paragraphs: [
          "Colorfle players search for the daily answer and hints, and the solver page serves the ones who want to solve it themselves — the axis model and movement strategy are exactly what those players need.",
          "The guide also earns traffic from designers and color-curious players: the hue-saturation-lightness model is real color theory that transfers to design work.",
          "Bookmark it for the days the palette fights back. The solver will navigate it, and the axis strategy will make you faster on every puzzle after."
        ]
      }
    ],
    faqHeading: "Colorfle Solver FAQ",
    faqs: [
      {
        question: "How does the Colorfle solver work?",
        answer:
          "It tracks your position on the three color axes — hue, saturation, and lightness — and uses Colorfle's directional feedback to recommend the next move toward the target."
      },
      {
        question: "What are the three axes in Colorfle?",
        answer:
          "Hue (the color family), saturation (vividness), and lightness (darkness). Colorfle's feedback moves you along these axes until you reach the exact target."
      },
      {
        question: "What is a good first guess in Colorfle?",
        answer:
          "A mid-lightness, mid-saturation color with a recognizable hue, because its feedback is informative in every direction."
      },
      {
        question: "How many guesses does a Colorfle take?",
        answer:
          "Most puzzles resolve in five or six guesses when you make big directional moves early and refine late."
      },
      {
        question: "Why does saturation matter in Colorfle?",
        answer:
          "Saturation is the axis most players forget, and a grayish target with a vivid guess is a classic trap. Tracking it from move one prevents wasted guesses."
      }
    ],
    relatedLinks: [
      { href: "/colorfle-answer-today", label: "Colorfle Answer Today" },
      { href: "/colordle-solver", label: "Colordle Solver" },
      { href: "/colordle-answer-today", label: "Colordle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" }
    ]
  }`;

ENTRIES['waffle-solver'] = `  'waffle-solver': {
    key: 'waffle-solver',
    eyebrow: 'Waffle Solver Guide',
    intro:
      "Waffle is the daily word puzzle laid out in a five-by-five waffle grid, where six words — three across and three down — share letters at the intersections, and you swap tiles to unscramble them. The Waffle solver checks your board, finds every valid word placement, and suggests the swaps that solve it fastest. Here is how it works and how to get better at the swap puzzle.",
    sections: [
      {
        heading: "How the Waffle solver reads your board",
        paragraphs: [
          "A Waffle board is a crossword-like grid where the across words and down words share letters at their crossings. Every letter on the board belongs to exactly one across word and one down word, and the solver keeps track of both dimensions at once.",
          "The solver checks which of the twelve word slots (six across, six down) already contain a valid word, which are close, and which need the most swaps. That board-state analysis is the core of the solver: it tells you exactly which intersections to attack first.",
          "Because Waffle allows unlimited swaps and only scores you on the number of moves, the solver's value is efficiency — it finds the minimal set of swaps that turns the scrambled board into six valid words."
        ],
        callout: {
          title: "Words share letters",
          body: "Every letter in the Waffle grid sits at the crossing of an across word and a down word. Solving one direction often fixes the other — that interdependence is the puzzle's heart."
        }
      },
      {
        heading: "Waffle strategy without the solver",
        paragraphs: [
          "Start by finding the already-solved words. Any row or column that already spells a word is locked — do not touch it, because swapping its letters breaks two words at once.",
          "Then attack the near-miss words: rows and columns that are one or two letters off. Since crossing letters belong to both dimensions, a swap that fixes an across word often fixes the down word it crosses.",
          "Count your swaps. Waffle scores you on move count, and a perfect game uses the minimum swaps. Planning two swaps ahead — where the tile goes, then where its replacement comes from — is the habit of expert players."
        ],
        list: {
          title: "Signs of a fast Waffle solve",
          items: [
            "You lock solved words and never disturb them",
            "You fix crossings deliberately, not randomly",
            "You plan swaps in chains — this tile out, that tile in",
            "You read the grid as six words, not sixty individual tiles"
          ]
        }
      },
      {
        heading: "Reading the solver's swap suggestions",
        paragraphs: [
          "The solver highlights the tiles that need to move and suggests an ordered sequence of swaps. Follow the sequence and the grid resolves into six valid words in the fewest moves.",
          "If you prefer to solve on your own, use the solver as a checker: arrange your swaps, then ask the solver whether the board is now correct. It will confirm or point at the remaining misplaced tiles.",
          "The solver also shows which words it found in each slot, so you can learn the vocabulary — Waffle uses common words, but the crossing constraints can hide words you know perfectly well."
        ]
      },
      {
        heading: "Common mistakes the Waffle solver prevents",
        paragraphs: [
          "The classic mistake is fixing a row without checking its crossings. A letter that completes an across word can break the down word it belongs to — the solver tracks both dimensions and never makes that error.",
          "The second mistake is repeatedly touching solved words. Players under time pressure swap tiles in already-correct rows, undoing their progress. The solver locks solved slots.",
          "The third mistake is ignoring move count. Waffle rewards minimal swaps, and random clicking can double your score. The solver's sequenced swaps keep the move count honest."
        ]
      },
      {
        heading: "Why the Waffle solver page ranks in search",
        paragraphs: [
          "Waffle players search for answers, archives, and solvers — 'waffle game archive', 'waffle archive', and 'waffle solver' are all recurring queries. This page serves the solver intent with instant board analysis and minimal-swap guidance.",
          "The strategy sections also serve players who want to improve: the crossing logic and swap-chaining habits transfer to every daily Waffle.",
          "Bookmark it for the days the grid is a tangle. The solver will unscramble it, and the crossing strategy will make you faster on every waffle after."
        ]
      }
    ],
    faqHeading: "Waffle Solver FAQ",
    faqs: [
      {
        question: "How does the Waffle solver work?",
        answer:
          "It analyzes the five-by-five grid as six intersecting words — three across and three down — and finds the minimal set of tile swaps that turns the board into six valid words."
      },
      {
        question: "Can you swap tiles freely in Waffle?",
        answer:
          "Yes, Waffle allows unlimited swaps, but you are scored on move count, so solving with the minimum number of swaps is the goal."
      },
      {
        question: "Do Waffle words share letters?",
        answer:
          "Yes — every letter sits at the crossing of an across word and a down word, which is why fixing one direction often fixes the other."
      },
      {
        question: "What is a good Waffle strategy?",
        answer:
          "Lock the already-solved words, attack near-misses at the crossings, and plan swaps in chains to minimize your move count."
      },
      {
        question: "Does the solver work for past Waffle puzzles?",
        answer:
          "Yes — the solver works on any Waffle grid, and the Waffle archive holds past daily puzzles for practice."
      }
    ],
    relatedLinks: [
      { href: "/waffle-answer-today", label: "Waffle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/squaredle-solver", label: "Squaredle Solver" },
      { href: "/weaver-solver", label: "Weaver Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  }`;

ENTRIES['phoodle-solver'] = `  'phoodle-solver': {
    key: 'phoodle-solver',
    eyebrow: 'Phoodle Solver Guide',
    intro:
      "Phoodle is Wordle with a kitchen twist: every answer is a food-related word, from ingredients to dishes to cooking verbs, and you have six guesses to find it. The Phoodle solver filters the food vocabulary with every guess, so you can crack the daily food word fast and learn the vocabulary the game draws from. Here is how it works and why the food constraint is your biggest advantage.",
    sections: [
      {
        heading: "How the Phoodle solver filters food words",
        paragraphs: [
          "Phoodle's answer pool is food vocabulary — ingredients, dishes, cuts, herbs, and kitchen verbs — which is far smaller than Wordle's full dictionary. The solver filters that food-specific list with every guess's green, yellow, and gray tiles.",
          "Because the pool is small and themed, the solver narrows much faster than it could on a general dictionary. A pattern like _A_ST_ is far more tractable when you know the answer is an ingredient or dish.",
          "The solver also understands food-word letter frequencies: it knows which letters dominate food vocabulary, and it biases its recommendations toward letters that are actually likely to appear in a food word."
        ],
        callout: {
          title: "The food-lane rule",
          body: "Every Phoodle answer is food-related. Guess letters that live in food vocabulary — S, T, P, C, K and the vowels — and you filter the pool far faster than a generic Wordle strategy."
        }
      },
      {
        heading: "Phoodle openers that actually help",
        paragraphs: [
          "A strong Phoodle opener covers the letters that dominate food words while staying valid: STEAK, SPICE, and PASTA are community favorites. STEAK gives you S, T, E, A, K — four letters that appear across ingredients and dishes.",
          "Avoid food-neutral openers like CRANE or SLATE. They are great Wordle words but tell you nothing about the food lane, wasting the constraint that makes Phoodle solvable.",
          "After the opener, think in food categories: if you have an E and a T, guess words that test ingredient letters (C, P, R) rather than abstract vocabulary. The category thinking is what separates fast Phoodle players."
        ],
        list: {
          title: "Top Phoodle opener words",
          items: [
            "STEAK — covers S, T, E, A, K across food vocabulary",
            "SPICE — covers S, P, I, C, E including the food-y C and P",
            "PASTA — covers P, A, S, T with a double-A test",
            "BASTE — covers B, A, S, T, E including the kitchen verb B",
            "Avoid neutral openers — they waste the food constraint"
          ]
        }
      },
      {
        heading: "A real Phoodle solve, step by step",
        paragraphs: [
          "Open with STEAK. Suppose the game returns green on S and T, yellow on A, and gray on E and K. The solver instantly knows the answer starts with ST, contains A, and avoids E and K — a strong pattern for a food word.",
          "Guess SPICE next to test P, I, C against the confirmed S-T prefix. If C comes back yellow, the solver narrows to food words containing ST, A, C with no E or K — a short list of ingredients.",
          "By guess three the candidate list is usually under ten food words. Pick the most likely ingredient, and the daily Phoodle is solved with three guesses to spare."
        ]
      },
      {
        heading: "Common mistakes the Phoodle solver fixes",
        paragraphs: [
          "The biggest mistake is playing Phoodle like Wordle. Neutral openers, abstract guesses, and general vocabulary all waste the food constraint that makes the game solvable. The solver never leaves the food lane.",
          "The second mistake is forgetting kitchen verbs and food adjectives. Answers are not only ingredients — they include words like BAKE, SPICY, and TART. The solver includes the full food vocabulary, not just nouns.",
          "The third mistake is ignoring the plural and form variations. Some answers are plural ingredients or past-tense cooking verbs, and players who only consider singular nouns miss them. The solver's list covers all valid forms."
        ]
      },
      {
        heading: "Why the Phoodle solver page ranks in search",
        paragraphs: [
          "Phoodle players search for the daily answer and hints — 'phoodle answer today', 'phoodle hint today' — and the solver page serves the players who want to solve it themselves with the food-lane strategy.",
          "The guide also earns traffic from food-word curious players who want to understand the vocabulary the game draws from.",
          "Bookmark it for the days the answer is an obscure ingredient. The solver will find it, and the food-lane strategy will make you faster on every puzzle after."
        ]
      }
    ],
    faqHeading: "Phoodle Solver FAQ",
    faqs: [
      {
        question: "How does the Phoodle solver work?",
        answer:
          "It filters a food-specific vocabulary list with every guess's green, yellow, and gray tiles, using food-word letter frequencies to recommend the best next guess."
      },
      {
        question: "What is a good first guess in Phoodle?",
        answer:
          "STEAK, SPICE, or PASTA — openers that cover letters common in food vocabulary while staying valid food-adjacent words."
      },
      {
        question: "Are all Phoodle answers food words?",
        answer:
          "Yes. Every Phoodle answer is food-related — ingredients, dishes, herbs, cuts, kitchen verbs, or food adjectives.",
      },
      {
        question: "Can the solver solve the daily Phoodle?",
        answer:
          "Yes. The solver works on the daily puzzle and usually narrows the food pool to a handful of candidates within three guesses."
      },
      {
        question: "What makes Phoodle different from Wordle?",
        answer:
          "The answer pool is food vocabulary only, which is smaller and more constrained than Wordle's dictionary — an advantage once you learn to play the food lane."
      }
    ],
    relatedLinks: [
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/phrazle-answer-today", label: "Phrazle Answer Today" },
      { href: "/canuckle-answer-today", label: "Canuckle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/waffle-answer-today", label: "Waffle Answer Today" }
    ]
  }`;

ENTRIES['searchle-solver'] = `  'searchle-solver': {
    key: 'searchle-solver',
    eyebrow: 'Searchle Solver Guide',
    intro:
      "Searchle is the daily game where you reverse-engineer a mystery search query: you guess a phrase, the game ranks it, and your job is to climb to the top by matching the target's words and intent. The Searchle solver studies the ranking feedback and suggests the phrasing that climbs fastest. Here is how it works, how search ranking thinks, and how to win the daily query game.",
    sections: [
      {
        heading: "How the Searchle solver reads the rankings",
        paragraphs: [
          "Searchle ranks your guessed query against the mystery query using search relevance: the closer your words and intent match the target, the higher your position. The solver watches how each guess moves the ranking and learns the target's vocabulary from that movement.",
          "A rank jump from 40 to 8 means your new words overlap the target; a flat ranking means your phrasing is pointed the wrong way. The solver treats every rank movement as a signal about which words the target contains.",
          "By combining several guesses' movements, the solver builds a model of the target query — its topic, its length, its structure — and recommends the next phrase most likely to top the chart."
        ],
        callout: {
          title: "Rank movement is the clue",
          body: "Searchle tells you where your query ranks after every guess. Big jumps mean you added the right kind of words; flat rankings mean your phrasing is off — read the movement, not just the position."
        }
      },
      {
        heading: "Thinking like a search engine",
        paragraphs: [
          "Search engines match intent, not just keywords. 'Best pizza' and 'pizza near me' are different queries with different intent, and Searchle ranks them apart. Before you guess, decide what the searcher is trying to do — find a recipe, a location, a definition, a comparison.",
          "Real search phrases are short: two to five words. The mystery query is almost always a realistic everyday search, so guess like a person typing into a search box, not like a writer composing a sentence.",
          "Modifiers carry meaning. 'How to', 'what is', 'best', 'free', and 'near me' are high-value words that shift ranking significantly. The solver's recommendations lean on these realistic modifiers."
        ],
        list: {
          title: "Query structures to test",
          items: [
            "How-to: 'how to bake sourdough'",
            "Question: 'what is the tallest mountain'",
            "Comparison: 'best budget phone 2026'",
            "Local: 'coffee shops near me'",
            "Definition: 'what does serendipity mean'"
          ]
        }
      },
      {
        heading: "A Searchle solving strategy",
        paragraphs: [
          "Open with the broad topic — 'pizza', 'football', 'recipes' — to locate the neighborhood. Note your rank; it is the baseline for everything that follows.",
          "Then add one modifier at a time and watch the movement. If 'pizza' ranks 40 and 'pizza recipe' jumps to 12, the target is recipe-related; if 'best pizza' jumps instead, the target is comparison-related.",
          "Once you are in the top ten, the remaining task is precision: match the exact phrasing. The solver's model of the target's word order and length guides the final guesses."
        ]
      },
      {
        heading: "Common mistakes the Searchle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing essay-length queries. Real searches are short, and long phrases almost always rank poorly against a concise target. The solver keeps guesses in the two-to-five-word range.",
          "The second mistake is ignoring intent. Adding keywords without changing intent — 'pizza delivery best pizza' — rarely jumps the ranking, because the target's intent is unchanged. The solver matches intent before words.",
          "The third mistake is repeating the same structure. If 'best X' keeps missing, the target is probably a question or a how-to. The solver changes the construction, not just the words."
        ]
      },
      {
        heading: "Why the Searchle solver page ranks in search",
        paragraphs: [
          "Searchle players search for the daily answer and hints, and the solver page serves the players who want to crack the query themselves — the rank-movement model and intent-first strategy are exactly what they need.",
          "The guide also earns traffic from SEO-curious players: the search-thinking sections explain real ranking logic that transfers directly to search marketing.",
          "Bookmark it for the days the target query is a head-scratcher. The solver will climb it, and the search-thinking strategy will make you faster on every puzzle after."
        ]
      }
    ],
    faqHeading: "Searchle Solver FAQ",
    faqs: [
      {
        question: "How does the Searchle solver work?",
        answer:
          "It watches how each guessed query moves in the rankings, builds a model of the target's vocabulary and intent, and recommends the phrasing most likely to rank first."
      },
      {
        question: "How is Searchle scored?",
        answer:
          "Your guessed query is ranked against the mystery query by search relevance — the closer your words and intent match, the higher you rank after each guess."
      },
      {
        question: "What is a good first guess in Searchle?",
        answer:
          "The broad topic alone — like 'pizza' or 'football' — establishes your baseline rank and tells you which neighborhood the target lives in."
      },
      {
        question: "How long is a typical Searchle answer?",
        answer:
          "Mystery queries are realistic everyday searches, usually two to five words, matching how people actually type into a search box."
      },
      {
        question: "Does the solver work for past Searchle puzzles?",
        answer:
          "Yes — the rank-movement logic applies to any Searchle puzzle, past or present."
      }
    ],
    relatedLinks: [
      { href: "/searchle-answer-today", label: "Searchle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" }
    ]
  }`;

ENTRIES['word-ladder-solver'] = `  'word-ladder-solver': {
    key: 'word-ladder-solver',
    eyebrow: 'Word Ladder Solver Guide',
    intro:
      "Word ladders are the classic puzzle where you transform one word into another one letter at a time — COLD to WARM, LOVE to HATE — with every intermediate step a real word. The word ladder solver finds the shortest valid chain between any two words, so you can check your own ladders, learn new routes, and understand the hidden structure of the English word graph. Here is how it works and how to get better at building ladders.",
    sections: [
      {
        heading: "How the word ladder solver builds chains",
        paragraphs: [
          "A word ladder is a path through the graph of English words: two words are connected when they differ by exactly one letter, and a ladder is a chain of those connections. The solver runs a shortest-path search across that graph, so the ladder it returns is the fewest steps possible.",
          "That search is breadth-first: the solver explores every one-letter neighbor of the start word, then every neighbor of those, layer by layer, until it reaches the target. Because it explores in layers, the first path found is guaranteed to be the minimum.",
          "The solver's ladders never skip a step and never reuse a word, so every chain it returns is a legal ladder — each rung a real word, each transition a single letter."
        ],
        callout: {
          title: "One letter per rung",
          body: "Every step of a word ladder changes exactly one letter and must produce a real word. The solver obeys both rules strictly, so its chains are always legal."
        }
      },
      {
        heading: "The strategy behind short ladders",
        paragraphs: [
          "Think about the target's neighbors first. The final rung before the target must share three letters with it, so listing those near-neighbors gives you the landing zone.",
          "Then work backward from the start: enumerate the words one letter away and look for a bridge that moves toward the landing zone. Strong ladder-builders always plan the last two steps before the middle ones.",
          "Vowels are the bottleneck. Words with unusual vowel patterns have few neighbors, so expert players route around vowel-heavy words and save them for the final approach."
        ],
        list: {
          title: "Signs of a good ladder-builder",
          items: [
            "You know the near-neighbors of the target before you start",
            "You plan the final approach, not just the first step",
            "You avoid dead-end words with few neighbors",
            "You never reuse a word already in the ladder"
          ]
        }
      },
      {
        heading: "Reading the solver's shortest path",
        paragraphs: [
          "The solver outputs the chain from start to finish, each word one letter from the last. Check every transition — if each pair differs by exactly one letter and each word is real, the ladder is valid.",
          "Some solver ladders use rare words as bridges — words like 'dore' or 'gite' that connect otherwise-separated regions of the word graph. If you need a ladder for a game that only accepts common words, the solver's path is still your best route; just prefer the common-word segments.",
          "If the solver returns a ladder longer than you expected, the distance itself is informative: some word pairs are genuinely far apart in the graph, and no human shortcut exists."
        ]
      },
      {
        heading: "Common mistakes the word ladder solver prevents",
        paragraphs: [
          "The classic mistake is changing more than one letter per step. Players get impatient and jump two letters at once, breaking the ladder's legality. The solver never does this.",
          "The second mistake is using invented words. A ladder with a made-up rung is invalid even if the endpoints are right. The solver only uses dictionary words.",
          "The third mistake is not planning the approach. Players climb away from the target, run out of legal moves, and get stuck. The solver plans the landing zone from the first step."
        ]
      },
      {
        heading: "Why the word ladder solver page ranks in search",
        paragraphs: [
          "Students, puzzle fans, and game players search for word ladder solvers when they are stuck on an assignment or a puzzle — 'word ladder solver', 'word ladder answers'. This page answers with instant shortest paths plus the strategy to build ladders by hand.",
          "The guide also serves teachers: word ladders are a classic vocabulary and spelling exercise, and the strategy sections explain the logic in teachable terms.",
          "Bookmark it for the next assignment or puzzle. The solver will find the chain, and the approach-planning strategy will make you faster at building ladders forever after."
        ]
      }
    ],
    faqHeading: "Word Ladder Solver FAQ",
    faqs: [
      {
        question: "How does the word ladder solver work?",
        answer:
          "It builds a graph of English words where two words connect when they differ by exactly one letter, then runs a shortest-path search to find the minimum-step ladder between your words."
      },
      {
        question: "What is the rule for a valid word ladder step?",
        answer:
          "Each step changes exactly one letter and must produce a real English word. You cannot change two letters or use made-up words."
      },
      {
        question: "Is the solver's ladder always the shortest?",
        answer:
          "Yes. The solver uses breadth-first search, which guarantees the first path it finds is the minimum number of steps between the two words."
      },
      {
        question: "Why do some ladders use unusual words?",
        answer:
          "Rare words sometimes form the only bridge between two regions of the word graph. The solver's path is still the shortest legal route, even when a rung is uncommon."
      },
      {
        question: "Does the solver work for any word pair?",
        answer:
          "Yes, for any two words of the same length that exist in the dictionary. Some pairs are far apart in the graph, so their ladders are naturally long."
      }
    ],
    relatedLinks: [
      { href: "/weaver-solver", label: "Weaver Solver" },
      { href: "/boggle-solver", label: "Boggle Solver" },
      { href: "/hangman-solver", label: "Hangman Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/squaredle-solver", label: "Squaredle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['soundmap-solver'] = `  'soundmap-solver': {
    key: 'soundmap-solver',
    eyebrow: 'Soundmap Artist Guesser Guide',
    intro:
      "Soundmap's Artist Guesser is the daily music challenge where you identify a mystery artist from clues — era, genre, chart position, and hints that tighten with every guess. The Soundmap solver narrows the artist pool with each clue, so you can crack the daily artist fast and learn the discography logic the game rewards. Here is how it works and the strategy that wins most days.",
    sections: [
      {
        heading: "How the Soundmap solver narrows the artist pool",
        paragraphs: [
          "The Artist Guesser gives you a series of clues about a mystery artist — their debut era, their primary genre, their chart peak, sometimes their collaborators. The solver treats every clue as a filter on the artist database, eliminating everyone who does not match.",
          "Era clues are the coarsest and most powerful filter: knowing the artist debuted in the 1990s removes everyone from other decades. Genre narrows further, and chart peak, nationality, and collaborator hints finish the job.",
          "The solver ranks the surviving candidates by how well they fit every clue, so the top of the list is your best next guess — and usually the answer itself."
        ],
        callout: {
          title: "Every clue is a filter",
          body: "Soundmap's hints are not decoration — each one eliminates a chunk of the artist pool. Feed them into the solver as they appear and the candidate list collapses fast."
        }
      },
      {
        heading: "A Soundmap solving strategy",
        paragraphs: [
          "Act on the first clue immediately. If the hint says the artist is from the 1980s, guess a 1980s superstar on move one — the feedback from a bold correct-era guess is worth more than a safe hedge.",
          "Stack clues before guessing obscure artists. The early hints are broad, but the late hints are specific — a collaborator name or a signature album can make the answer obvious. Wait for the specific clues before you reach.",
          "Think in artist careers, not just names. The game rewards knowing when an artist debuted, what they are known for, and who they worked with — the same knowledge that powers every music-trivia game."
        ],
        list: {
          title: "Clues Soundmap tends to give",
          items: [
            "Debut decade or era",
            "Primary genre or subgenre",
            "Chart peak or hit songs",
            "Nationality or scene",
            "Notable collaborators or label"
          ]
        }
      },
      {
        heading: "Common mistakes the Soundmap solver fixes",
        paragraphs: [
          "The biggest mistake is ignoring early clues. Players who guess randomly until the hints pile up waste moves that a bold era-aligned guess would have used productively. The solver filters from clue one.",
          "The second mistake is over-fitting a single clue. An artist who matches the genre but debuted in the wrong decade is not the answer — every clue has to fit. The solver enforces all constraints simultaneously.",
          "The third mistake is guessing the same artist repeatedly. When a candidate fails, the game's feedback usually tells you why; the solver drops eliminated artists permanently."
        ]
      },
      {
        heading: "Why the Soundmap solver page ranks in search",
        paragraphs: [
          "Soundmap players search for the daily artist and hints — 'soundmap artist guesser', 'soundmap solver' — and this page serves both the reveal and the solving strategy.",
          "The guide also earns traffic from music fans who want to get better at artist-guessing games generally: the clue-stacking and era-first logic transfer to every music trivia game.",
          "Bookmark it for the days the artist is a deep cut. The solver will find them, and the clue-stacking strategy will make you faster on every daily guess after."
        ]
      }
    ],
    faqHeading: "Soundmap Artist Guesser FAQ",
    faqs: [
      {
        question: "How does the Soundmap solver work?",
        answer:
          "It treats every hint as a filter on the artist database — era, genre, chart peak, nationality, collaborators — and ranks the artists that satisfy all your clues."
      },
      {
        question: "What clues does the Artist Guesser give?",
        answer:
          "Clues include debut era, primary genre, chart performance, nationality, and collaborators — each one narrowing the artist pool."
      },
      {
        question: "What is a good first guess in Soundmap?",
        answer:
          "A bold guess that matches the first clue — if the hint says a decade, guess that decade's biggest superstar to maximize the feedback from move one."
      },
      {
        question: "Does the solver work for the daily artist?",
        answer:
          "Yes — the solver filters the same artist pool the game draws from, so its candidates are always valid answers."
      },
      {
        question: "What is the fastest way to get better?",
        answer:
          "Stack clues before guessing obscure artists, act on era hints immediately, and learn the careers behind the names — debut decade, genre, and collaborators."
      }
    ],
    relatedLinks: [
      { href: "/spotle-solver", label: "Spotle Solver" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" }
    ]
  }`;

ENTRIES['all-wordle-solver'] = `  'all-wordle-solver': {
    key: 'all-wordle-solver',
    eyebrow: 'All Wordle Solver Guide',
    intro:
      "Every Wordle variant — the original five-letter daily, the six-letter, seven-letter, and custom-length versions, plus the endless practice mode — uses the same core rules: guess a word, read the green, yellow, and gray tiles, and narrow the answer. The Wordle solver works across all of them, filtering the dictionary by every clue so you can solve any length, any day. Here is how it works and the strategy that works at every length.",
    sections: [
      {
        heading: "How the Wordle solver works at any length",
        paragraphs: [
          "Wordle's feedback is the same at every length: green means the letter is right and in place, yellow means it is in the word but misplaced, gray means it is not in the word at all. The solver maintains a dictionary filtered by those verdicts.",
          "The solver scales naturally to any word length — five letters, six letters, seven, or custom — because the filtering logic does not depend on the length, only on the clues. Longer words have bigger dictionaries, but the same rules apply.",
          "Every guess narrows the candidate list: greens lock positions, yellows relocate letters, grays ban them. The solver applies all the clues simultaneously, so by guess three or four the answer is usually down to a handful of words."
        ],
        callout: {
          title: "Length does not change the rules",
          body: "Green locks, yellow relocates, gray bans — at five letters, six letters, or ten. Master the feedback logic once and every Wordle variant opens up."
        }
      },
      {
        heading: "The opener that works everywhere",
        paragraphs: [
          "A good opener covers the most common letters regardless of length: vowels plus the frequent consonants R, S, T, N. In five-letter Wordle, CRANE or SLATE; in six, CRANES or SLATER; in seven, RANCETS or SLATER'S. The principle — vowels plus common consonants, no repeats — is universal.",
          "The first guess is information-gathering, not a solve attempt. Its job is to tell you which of the common letters the answer contains, and the best openers maximize that information.",
          "After the opener, every guess should add at least one new letter to your picture. Confirmed green letters stay fixed; yellow letters move; gray letters disappear. The solver does all of this bookkeeping for you, but understanding it makes you faster even without the tool."
        ],
        list: {
          title: "Universal opener principles",
          items: [
            "Two or three vowels, including a high-frequency vowel",
            "Common consonants: R, S, T, N, L",
            "No repeated letters in the first guess",
            "Vary the opener occasionally so you see different feedback"
          ]
        }
      },
      {
        heading: "A solve at any length, step by step",
        paragraphs: [
          "Open with a common-letter word. Suppose the game returns green on the first letter and yellow on the second, with the rest gray. The solver instantly knows the answer starts with that letter, contains the second letter elsewhere, and avoids all the grayed letters.",
          "Your second guess should keep the green and relocate the yellow while sweeping fresh common letters. The feedback tightens: now you know the second letter's new position is wrong too, and the answer's shape is emerging.",
          "By guess three, the pattern usually matches a short list of dictionary words. Pick the most common one, and the puzzle is solved with guesses to spare — at five letters or ten."
        ]
      },
      {
        heading: "Common mistakes the Wordle solver prevents",
        paragraphs: [
          "The classic mistake is repeating a gray letter. Once a letter is confirmed absent, every guess that includes it wastes a slot. The solver never suggests a word containing a banned letter.",
          "The second mistake is locking a yellow letter too early. Yellow means 'in the word, wrong place' — you have to move it. Players who keep the yellow letter in the same spot chase the same wrong pattern.",
          "The third mistake is ignoring letter frequency late in the game. When the candidate list is short, the answer is usually the most common word fitting the pattern. The solver ranks candidates by likelihood, not just validity."
        ]
      },
      {
        heading: "Why this solver page ranks in search",
        paragraphs: [
          "'Wordle solver', '5 letter wordle solver', and 'wordle helper' are searched thousands of times a day, and this page answers the full range — the solver itself plus the strategy that works at every word length.",
          "The guide also serves learners: the feedback logic, opener principles, and letter-frequency reasoning are the same skills that make players good at Wordle without any tool.",
          "Bookmark it for the days the answer is stubborn. The solver will crack it, and the strategy above will make you a sharper guesser at every length, every day."
        ]
      }
    ],
    faqHeading: "Wordle Solver FAQ",
    faqs: [
      {
        question: "How does the Wordle solver work?",
        answer:
          "It filters a dictionary by your green, yellow, and gray tiles — locking greens, relocating yellows, banning grays — until the candidate list narrows to the answer."
      },
      {
        question: "Does the solver work for different word lengths?",
        answer:
          "Yes. The filtering logic is identical at every length, from five-letter daily Wordle to six-, seven-, and custom-length variants."
      },
      {
        question: "What is a good first Wordle guess?",
        answer:
          "A word with two or three vowels, common consonants like R, S, T, and N, and no repeated letters — CRANE and SLATE are the classic openers."
      },
      {
        question: "What does each tile color mean in Wordle?",
        answer:
          "Green means the letter is correct and in place, yellow means it is in the word but misplaced, and gray means it is not in the word at all."
      },
      {
        question: "Can the solver solve the daily Wordle?",
        answer:
          "Yes. The solver works on the daily puzzle and any variant, usually narrowing to a handful of candidates within three or four guesses."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/5-letter-wordle-solver", label: "5 Letter Wordle Solver" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/nerdle-answer-today", label: "Nerdle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/wordle-answer-archive", label: "Wordle Answer Archive" }
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
