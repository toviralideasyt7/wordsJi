// Batch 1: high-Bing-opportunity solver articles.
// Run with: node scripts/add-articles-b1.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['colordle-solver'] = `  'colordle-solver': {
    key: 'colordle-solver',
    eyebrow: 'Colordle Solver Guide',
    intro:
      "Colordle is Wordle played with colors: instead of guessing letters, you guess a color from a fixed palette, and every guess returns green, yellow, or gray tiles that tell you how close each component is. The Colordle solver turns those five clues into a shortlist of candidate colors in seconds. This guide explains how the color-mixing logic works, how to read the feedback grid, and the exact strategy the solver uses so you can solve faster without guessing.",
    sections: [
      {
        heading: "How the Colordle solver reads your feedback",
        paragraphs: [
          "Colordle builds every answer from a compact palette of base colors, and each guess is scored component by component. When you enter the feedback row from your game — green for a correct match, yellow for a nearby shade, gray for a miss — the solver filters the entire palette in one pass. A single yellow tile can cut the candidate list by more than half, and two greens usually leave a handful of possibilities.",
          "The key to fast solving is to enter feedback after every guess, not just when you are stuck. The solver's filtering is cumulative: each row narrows the previous pool, so the third or fourth guess is almost always a deliberate check rather than a coin flip.",
          "Most players under-use the yellow tile. In Colordle, yellow does not just mean 'somewhere in the answer' — it means a specific component is close. That directional information is exactly what makes the solver powerful, because it treats every non-gray tile as a real constraint."
        ]
      },
      {
        heading: "The palette and the mixing rule",
        paragraphs: [
          "Colordle answers are drawn from a fixed set of named colors, and the puzzle checks each component of the guess against the corresponding component of the answer. The result is a color-coded feedback row that mirrors Wordle's but with a twist: adjacent shades in the palette behave like near-miss letters, and the solver has to understand that relationship to rank candidates.",
          "When the solver ranks possible answers, it does not treat all yellows equally. A yellow on a component that is one step away in the palette is a stronger signal than a yellow on a component several shades off, so candidates are scored by total distance, not just by match count.",
          "That distance logic is why the Colordle solver beats blind guessing so consistently. Two players can feed it identical feedback and get the same ranked list — the math is deterministic. Your skill is in choosing which candidate to guess next, and the solver simply removes the luck from the filtering step."
        ],
        callout: {
          title: "The one-rule shortcut",
          body: "Whenever a component is yellow, assume the answer's component is adjacent to your guess in the palette. Green locks it in. Gray removes every shade from the running. That single rule gets most puzzles down to five candidates by guess three."
        }
      },
      {
        heading: "A real Colordle solve, step by step",
        paragraphs: [
          "Say your first guess is a mid-palette color and the game returns green, yellow, gray, gray, yellow. The solver immediately drops every color whose first component differs from your guess, every color whose middle components are anywhere near your grays, and keeps only colors with the right near-misses on components two and five.",
          "Your second guess should be the top-ranked candidate from that filtered list — usually a color that shares the green component and nudges one of the yellows toward full match. When that returns two greens and three grays, the pool is typically down to two or three colors, and the third guess finishes the puzzle.",
          "This pattern — filter, rank, confirm — is the same rhythm every Colordle expert uses, and it is exactly what the solver automates. After a few puzzles you will start predicting the solver's top pick before you click it, which is the sign the method has sunk in."
        ],
        list: {
          title: "Signs you are solving Colordle efficiently",
          items: [
            "You never guess a color that contradicts a gray component from an earlier row",
            "You use yellows to steer, not just to confirm",
            "You can predict which colors survive a given feedback row",
            "You finish most puzzles in four guesses or fewer"
          ]
        }
      },
      {
        heading: "Colordle solver vs. playing by intuition",
        paragraphs: [
          "The biggest difference between the solver and intuition is consistency. Intuition drifts when you play late at night or when you recognize a color you like; the solver applies the same distance math to every single row, every day.",
          "That matters more in Colordle than in Wordle because the palette is small and the components are few. Once the pool is down to six or seven colors, intuition stops helping — the remaining candidates are all plausible. The solver's ranking breaks the tie using distance, which is information you already have but are not using.",
          "None of this makes the solver a replacement for playing. The satisfaction of Colordle is still yours. But if your goal is accuracy — a perfect daily streak, a better average guess count — the solver is the fastest way to get there."
        ]
      },
      {
        heading: "Using the Colordle solver with today's puzzle",
        paragraphs: [
          "The solver works with any Colordle puzzle, including the daily one on the answer page. Open the game, make your first guess, copy the feedback into the solver, and let it suggest the next move. Most players land today's answer in four moves or fewer when they combine the solver with a sensible opener.",
          "For the daily puzzle specifically, the fastest openers are colors that split the palette evenly: a mid-tone that mixes a strong component from each end. A good first guess should return feedback that narrows the pool hard regardless of the answer, and the solver's candidate list after row one will show you whether your opener did its job.",
          "If you play the archive, the same rules apply. Old puzzles use the same palette and the same scoring, so the solver is just as effective on Colordle day 1400 as it is on today's puzzle."
        ],
        callout: {
          title: "Streak-saving tip",
          body: "If you are one guess away from losing a streak, do not panic-guess. Enter the current feedback row into the solver, look at the top two candidates, and pick the one that survives the most hypothetical next clues."
        }
      },
      {
        heading: "The Colordle solver's answer pool",
        paragraphs: [
          "The solver draws from the same named-color palette the game uses, so it never suggests a color that cannot be the answer. That guarantee is what separates it from a generic color picker: every candidate the solver lists is a real, valid Colordle answer color.",
          "Because the palette is small and fixed, the solver can pre-compute the distance between every pair of colors at startup. That makes filtering instant, even on older devices, and it means the ranked list you see is exact — not a heuristic approximation.",
          "If you ever want to check your own reasoning, the solver doubles as a teaching tool. Guess a color, note its score, and watch which candidates survive. Over time you will internalize the palette's structure and start seeing the near-miss patterns before the solver does."
        ]
      },
      {
        heading: "Common mistakes the solver fixes",
        paragraphs: [
          "The most common mistake is ignoring grays. In Colordle, a gray component eliminates every color that shares that component's neighborhood, and players who keep guessing colors with a grayed-out component are effectively wasting moves. The solver never makes that error.",
          "The second mistake is misreading yellows as mere confirmations. A yellow component is a direction, not a pat on the back, and treating it as directional information is what collapses the candidate list. The solver scores yellows by distance, which is the difference between narrowing to ten candidates and narrowing to three.",
          "The third mistake is reopening solved components. Once a component is green, it should stay green in every later guess. Players under pressure sometimes 'improve' a locked component and break the row; the solver enforces locked components as hard constraints, which keeps your later guesses valid."
        ],
        list: {
          title: "Three rules for a perfect Colordle game",
          items: [
            "Never guess a color with a grayed-out component",
            "Treat every yellow as directional feedback",
            "Never touch a component that is already green"
          ]
        }
      },
      {
        heading: "Why Colordle solvers rank so well in search",
        paragraphs: [
          "People search for Colordle answers and hints every single day — 'colordle answer', 'colordle answer today', 'colordle hint' are among the most-typed daily puzzle queries. A solver page that explains how feedback works, shows the palette logic, and links to today's answer naturally serves that traffic.",
          "This guide is written to be useful on its own, not padded for keywords. If you came here looking for today's Colordle answer, the answer card and the hint section cover it; if you came to get better at the game, the strategy sections above are the payoff. Both intents are served by one page, which is exactly what search engines reward.",
          "Bookmark the solver and check back when you are stuck, or when you want to verify that your intuition matches the math. Colordle is a five-minute game, and the solver keeps those five minutes from ever turning into a lost streak."
        ]
      }
    ],
    faqHeading: "Colordle Solver FAQ",
    faqs: [
      {
        question: "How does the Colordle solver work?",
        answer:
          "You enter the feedback row from your game — green, yellow, and gray tiles for each component — and the solver filters the entire color palette down to the candidates that match all your clues, ranked by how close each one is."
      },
      {
        question: "What does a yellow tile mean in Colordle?",
        answer:
          "A yellow tile means that component is close to the answer but not an exact match — typically an adjacent shade in the palette. The solver uses that proximity to rank candidates."
      },
      {
        question: "Can the Colordle solver find today's answer?",
        answer:
          "The solver narrows down the palette based on your feedback. For the exact daily answer, check the Colordle answer today page, which reveals the solution and hints for today's puzzle."
      },
      {
        question: "Does the solver work for old Colordle puzzles?",
        answer:
          "Yes. Every Colordle puzzle uses the same palette and scoring rules, so the solver works for the archive and for any past daily puzzle."
      },
      {
        question: "How many guesses should a Colordle take?",
        answer:
          "With the solver's filtering strategy, most puzzles are solved in three to five guesses. Using a palette-splitting opener and entering feedback every round is the key."
      }
    ],
    relatedLinks: [
      { href: "/colordle-answer-today", label: "Colordle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/colorfle-answer-today", label: "Colorfle Answer Today" },
      { href: "/colorfle-solver", label: "Colorfle Solver" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

ENTRIES['spotle-solver'] = `  'spotle-solver': {
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
  }`;

ENTRIES['weaver-solver'] = `  'weaver-solver': {
    key: 'weaver-solver',
    eyebrow: 'Weaver Word Ladder Solver',
    intro:
      "Weaver is the daily word-ladder puzzle: you start with one four-letter word, finish on another, and every step must be a real word that differs by exactly one letter. The Weaver solver finds a valid path between any two words in seconds, so you can check your own ladder, learn new routes, and understand the graph of English words underneath the game. Here is how it works and how to use it.",
    sections: [
      {
        heading: "How the Weaver solver finds a path",
        paragraphs: [
          "Weaver's board is a graph: every four-letter English word is a node, and two words are connected when they differ by exactly one letter. The solver runs a shortest-path search across that graph, so the route it returns is the fewest steps possible between your start and end words.",
          "That search is the same algorithm that powers GPS navigation and network routing — breadth-first search, which fans outward from the start word until it reaches the target. Because it explores in layers, the first path it finds is guaranteed to be the shortest.",
          "The practical consequence is that the solver never returns a meandering route. If it says the answer is four steps, four steps is the minimum — no player is going to beat it with a five-step ladder, because five is longer than the floor."
        ]
      },
      {
        heading: "Reading the solver's ladder",
        paragraphs: [
          "The solver outputs an ordered list of words from start to finish, each one a single letter away from the last. The step between any two consecutive words is the constraint to check — change one letter, keep the rest, and the result must still be a word.",
          "Many of the solver's ladders use common words, but some steps are surprisingly obscure, like 'dore' or 'gite'. That is the nature of the graph: sometimes the only bridge between two regions of the word universe is a rare tile.",
          "If you want a ladder you can actually use in the game, prefer the solver's path when it sticks to everyday vocabulary. If the daily puzzle is stingy with common words, the solver's exact path is still your best route — the game accepts any valid English word, rare or not."
        ],
        callout: {
          title: "The one-letter rule",
          body: "Every Weaver step changes exactly one letter and must produce a real word. Two-letter changes are illegal, so the solver's paths always obey the strict one-letter adjacency the game enforces."
        }
      },
      {
        heading: "Strategy: how to solve Weaver without the solver",
        paragraphs: [
          "Start by thinking about the end word's letters. Your final step must land on it, so the move before it must be a word that shares three of its letters. List those near-neighbors and work backward.",
          "Then do the same for the start word: enumerate the words one letter away and see which direction feels productive. Weaver rewards breadth — knowing six words that rhyme with your current word gives you six exits from a dead end.",
          "Vowels are the classic bottleneck. Words with unusual vowel patterns (like 'aeon' or 'eaux') have few neighbors, so good players route around vowel-heavy words early and save them for the final approach."
        ],
        list: {
          title: "Signs you are improving at Weaver",
          items: [
            "You can name three neighbors of any common four-letter word instantly",
            "You stop visiting words you have already used",
            "You plan two steps ahead instead of reacting one step at a time",
            "You recognize dead-end words (few neighbors) before stepping onto them"
          ]
        }
      },
      {
        heading: "The Weaver solver as a learning tool",
        paragraphs: [
          "The most underrated use of the solver is checking your own ladder before submitting. If the game rejects your final answer, compare your path to the solver's and see exactly where your chain broke — the illegal step is usually a one-letter slip you can fix immediately.",
          "The solver also teaches word families. Run it between words you would never connect — 'cold' to 'warm', 'love' to 'hate' — and study the bridges. Those middle words become future stepping stones in real games.",
          "Over time, players who study solver paths internalize the graph's structure: which letters connect easily, which vowels trap you, which consonants pair up. That knowledge transfers directly to faster manual solves."
        ]
      },
      {
        heading: "Why the Weaver solver page ranks in search",
        paragraphs: [
          "Weaver players search for 'weaver solver' and 'weaver word solver' when they are mid-puzzle and stuck, which means this page answers a time-sensitive need. A solver that returns a valid path instantly is exactly the resource those searchers want.",
          "The page is also useful cold: the strategy sections explain how ladders work, what the one-letter rule is, and how to get better, so it earns traffic from learners as well as from people stuck on a specific puzzle.",
          "Bookmark it for the hard days. Some Weaver puzzles have long minimum paths that feel impossible by intuition — on those days, the solver's route is the difference between a solved puzzle and a streak broken by a dead end."
        ]
      },
      {
        heading: "Common mistakes the Weaver solver prevents",
        paragraphs: [
          "The classic mistake is moving backward. Players get stuck, retreat to an earlier word, and then realize they have wasted three moves. The solver's shortest path never revisits a word, so its ladders are always monotonic progress toward the target.",
          "The second mistake is trying to force a word that is not in the game's dictionary. The solver only uses valid English words, so every step it suggests is a legal move — no rejected submissions.",
          "The third mistake is ignoring the end word's neighbors. Players climb away from the target without a plan for the final approach, then run out of steps. The solver plans the landing zone from the start."
        ]
      }
    ],
    faqHeading: "Weaver Solver FAQ",
    faqs: [
      {
        question: "How does the Weaver solver work?",
        answer:
          "It builds a graph of four-letter English words where two words are connected if they differ by exactly one letter, then runs a shortest-path search to find the fewest-step route between your start and end words."
      },
      {
        question: "What is the one-letter rule in Weaver?",
        answer:
          "Every step must change exactly one letter and the result must be a real English word. You cannot change two letters or use made-up words."
      },
      {
        question: "Can the Weaver solver be used on any puzzle?",
        answer:
          "Yes — the solver works for any pair of four-letter words, including the daily puzzle, practice boards, and custom challenges."
      },
      {
        question: "Is the solver's path always the shortest?",
        answer:
          "Yes. The solver uses a breadth-first search, which guarantees the first path it finds is the minimum number of steps between the two words."
      },
      {
        question: "Does Weaver use a limited dictionary?",
        answer:
          "Weaver uses a curated list of common English words. The solver uses a compatible dictionary so every step it suggests is a valid move."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/word-ladder-solver", label: "Word Ladder Solver" },
      { href: "/boggle-solver", label: "Boggle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/waffle-answer-today", label: "Waffle Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" }
    ]
  }`;

ENTRIES['light-out-solver'] = `  'light-out-solver': {
    key: 'light-out-solver',
    eyebrow: 'Lights Out Solver',
    intro:
      "Lights Out is the puzzle where pressing a tile toggles it and its four neighbors, and you win by turning every light off. The Lights Out solver computes the exact set of presses that solves any board, using the linear algebra that underlies the game. This guide explains how the math works, how to use the solver, and the strategy that lets you solve small boards by hand.",
    sections: [
      {
        heading: "How the Lights Out solver thinks",
        paragraphs: [
          "Lights Out is a linear puzzle: pressing a tile twice cancels out, and the order of presses does not matter, only which tiles you press. That property turns the game into a system of equations over a tiny number system where every value is on or off, 0 or 1.",
          "The solver sets up those equations — one per light — and solves them with Gaussian elimination over the two-element field. The solution is the exact set of presses that extinguishes every light, computed in milliseconds regardless of board size.",
          "Because the puzzle is linear, the solver's answer is provably correct. If the solver says press tiles A, B, and C, then pressing exactly those tiles — in any order — extinguishes the board. That certainty is what makes the solver feel magical and why it never fails on solvable boards."
        ],
        callout: {
          title: "Why order does not matter",
          body: "In Lights Out, every tile is its own toggle. Pressing a tile twice returns the board to its original state, so a solution is just a set of tiles, not a sequence. The solver exploits exactly that."
        }
      },
      {
        heading: "Reading the solver's output",
        paragraphs: [
          "The solver displays the answer as a grid of presses — often the original board with the tiles you need to press highlighted. Press them once each, in any order, and every light goes out.",
          "Some solutions are unique, and some boards have several equivalent solutions. The solver returns one correct set; if you prefer a different shape of presses, you can often find an alternate solution by flipping a known pattern — the all-on row pattern, for example, changes the solution set without changing the outcome.",
          "If the board has no solution — which happens on some generated puzzles — the solver tells you rather than guessing. That honesty is a feature: it saves you from pressing tiles forever on an impossible board."
        ]
      },
      {
        heading: "The strategy behind every Lights Out solve",
        paragraphs: [
          "The classic manual strategy is to clear the board row by row from the top. Look at each light in the top row, and press the tile directly below it to turn it off. This pushes the problem down one row at a time until only the bottom row has lights on.",
          "Then you solve the bottom row by pressing tiles in the top row — the positions that map to each bottom light. This 'chasing the lights' method solves every solvable board, and the solver's algorithm is essentially a rigorous version of that chase.",
          "For small boards (3×3 or 4×4), you can also solve by pattern memory: certain configurations have well-known solutions that veterans recognize on sight. The solver effectively gives you that recognition for any board."
        ],
        list: {
          title: "The chase method, step by step",
          items: [
            "Start at the top row and turn each light off by pressing the tile below it",
            "Repeat for every row, pushing the lights downward",
            "When only the bottom row remains, solve it with presses in the top row",
            "Press the flagged top-row tiles once and the whole board clears"
          ]
        }
      },
      {
        heading: "Why the Lights Out solver is useful beyond puzzles",
        paragraphs: [
          "Lights Out appears everywhere: in game collections, as a bonus minigame, in competitive puzzle speedruns, and even in math classes as an introduction to linear algebra over finite fields. The solver is equally useful in every setting.",
          "Students can use it to check homework: set up a board, run the solver, and verify that the equation system's solution matches the presses the puzzle expects. Seeing Gaussian elimination produce an actual game solution makes the abstract math concrete.",
          "Speedrunners use the solver to learn optimal routes — knowing the exact press set ahead of time lets them practice the motion without the trial and error."
        ]
      },
      {
        heading: "Solving Lights Out by hand like the solver",
        paragraphs: [
          "The key insight to internalize is that each press affects exactly five tiles — itself and its four orthogonal neighbors. Edge and corner tiles affect fewer, which is why corners are the easiest to reason about and centers the hardest.",
          "Work from the top down, and when you reach the bottom row, note the pattern of remaining lights. That pattern determines your top-row presses: the mapping is fixed per board size, and veterans memorize it for their favorite size.",
          "Once you have chased the lights, the second pass is clean. The solver automates both passes, but practicing the chase by hand on small boards builds the intuition that makes the solver's answers feel obvious in hindsight."
        ]
      },
      {
        heading: "Why this page ranks for Lights Out searches",
        paragraphs: [
          "People search for 'lights out solver' whenever a puzzle stumps them — from a phone game to a classroom assignment — and this page delivers the answer instantly, with the reasoning explained. That combination of utility and explanation is exactly what earns rankings.",
          "The page covers the gamut of search intents: the player who just wants the answer, the student who wants the math, and the curious player who wants to solve by hand. Each intent is served by a different section of this guide.",
          "Bookmark it for the next time a board resists you. The solver will clear it in one press set, and the chase method above will make you faster at the game forever after."
        ]
      }
    ],
    faqHeading: "Lights Out Solver FAQ",
    faqs: [
      {
        question: "How does the Lights Out solver work?",
        answer:
          "Lights Out is a linear puzzle, so the solver converts every light into an equation over a two-value system and solves them with Gaussian elimination. The result is the exact set of tiles to press."
      },
      {
        question: "Does the order of presses matter in Lights Out?",
        answer:
          "No. Pressing a tile twice cancels out, so a solution is a set of tiles rather than a sequence. You can press them in any order."
      },
      {
        question: "Can every Lights Out board be solved?",
        answer:
          "No — some configurations have no solution. The solver detects these and tells you instead of pressing tiles forever."
      },
      {
        question: "What is the chase method?",
        answer:
          "A manual strategy where you clear the board row by row from the top, pushing the remaining lights downward until only the bottom row is lit, then solve it with top-row presses."
      },
      {
        question: "Does the solver work for any board size?",
        answer:
          "Yes. The linear algebra scales to any grid, from small 3×3 boards to large custom layouts."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/minesweeper-solver", label: "Minesweeper Solver" },
      { href: "/kanoodle-solver", label: "Kanoodle Solver" },
      { href: "/weaver-solver", label: "Weaver Solver" },
      { href: "/squaredle-solver", label: "Squaredle Solver" },
      { href: "/word-ladder-solver", label: "Word Ladder Solver" }
    ]
  }`;

ENTRIES['kanoodle-solver'] = `  'kanoodle-solver': {
    key: 'kanoodle-solver',
    eyebrow: 'Kanoodle Solver Guide',
    intro:
      "Kanoodle is the 3D puzzle game where twelve oddly shaped pieces must fit together on a small board according to a puzzle card. The Kanoodle solver finds a valid placement for any card, so you can check a solution, learn how the pieces interlock, and understand the spatial logic the game rewards. Here is how it works and how to get better at the game itself.",
    sections: [
      {
        heading: "How the Kanoodle solver places the pieces",
        paragraphs: [
          "Kanoodle pieces are polyomino-like shapes that occupy a fixed set of cells in 3D space, and a puzzle is a target silhouette on a 5×11 board. The solver treats each piece as a shape with every possible rotation and reflection, then searches for an arrangement that covers the board exactly.",
          "That search is backtracking: the solver places pieces one at a time, checks whether the partial arrangement can still be completed, and backtracks the moment a dead end appears. On Kanoodle-sized boards this search is fast, so the solver returns a full solution in a blink.",
          "Because the solver explores systematically, it never misses a solution — if a puzzle card is solvable, the solver finds a placement. That completeness is what makes it a trustworthy checker for your own attempts."
        ]
      },
      {
        heading: "Reading a Kanoodle solution",
        paragraphs: [
          "The solver displays the board with each piece shaded in its own color, so you can see exactly where every piece goes and how it is oriented. Match the colored regions on your physical board and the puzzle is solved.",
          "Some puzzles have multiple valid solutions. The solver returns one; if your own layout differs but also fills the board, both are correct. The game only cares that the pieces fit the silhouette.",
          "The trickiest part of copying a solution is orientation — pieces in 3D can face up or down, or be rotated in the plane. The solver's coloring makes those orientations explicit, so you can mirror each piece precisely."
        ],
        callout: {
          title: "The 12-piece rule",
          body: "Every Kanoodle puzzle uses the same twelve pieces; only the target shape changes. Learn each piece's shape cold and the game becomes a fitting exercise rather than a mystery."
        }
      },
      {
        heading: "Kanoodle strategy without the solver",
        paragraphs: [
          "Start with the largest pieces. The biggest shapes have the fewest possible placements, so committing them early reduces the search space dramatically. Good players place the 'S', the 'L', and the long bars first.",
          "Then fill the corners and edges. Corner cells can only be covered by pieces that fit flush against the board's boundary, so locking the perimeter early exposes the interior for the flexible small pieces.",
          "Watch the parity of the board. Each piece covers a fixed number of cells, and if your partial placement leaves a hole the remaining pieces cannot fill, you have to backtrack. Recognizing those dead ends early is the skill that separates decent players from Kanoodle experts."
        ],
        list: {
          title: "Pieces to place first",
          items: [
            "The long straight bars — fewest orientations, easiest to commit",
            "The large L-shaped pieces that dominate the corners",
            "The chunky blocks that anchor the center",
            "Save the small, twisty pieces for the final fill"
          ]
        }
      },
      {
        heading: "Why the Kanoodle solver helps you learn",
        paragraphs: [
          "The best use of the solver is comparison: solve a puzzle as far as you can, then look at where the solver placed pieces differently from you. The divergence is almost always instructive — the solver tends to place a piece in a spot you dismissed, and seeing why it works trains your spatial eye.",
          "The solver also demystifies the 'impossible' puzzles. Kanoodle's hardest cards look unsolvable until you see the solution, and studying those reveals the unconventional orientations — pieces flipped in 3D, or rotated past where you thought they could go — that the game is built around.",
          "After a few solved puzzles you start seeing the board as interlocking regions instead of twelve independent shapes, and that gestalt is the whole point of the game."
        ]
      },
      {
        heading: "Common mistakes the Kanoodle solver fixes",
        paragraphs: [
          "The most common mistake is orientation rigidity — assuming a piece only fits one way when it can be rotated and flipped. The solver explores every orientation, and its solutions often use flipped versions of pieces you would not have considered.",
          "The second mistake is perimeter neglect. Players fill the interior first, then discover the boundary cannot be covered. The solver locks the edges early, which is why its solutions always complete.",
          "The third mistake is refusing to backtrack. Kanoodle rewards undoing a piece you were attached to. The solver backtracks constantly, and you should too — a piece that feels 'placed' but blocks everything else has to come out."
        ]
      },
      {
        heading: "Why the Kanoodle solver page ranks in search",
        paragraphs: [
          "Kanoodle owners search for 'kanoodle solver' and 'kanoodle solutions' when a puzzle card defeats them — often mid-flight or at the kitchen table with the physical game. This page answers with an instant, verified placement plus the reasoning to improve.",
          "The guide also serves parents and teachers using Kanoodle as a spatial-reasoning tool: the strategy section explains the logic in plain terms that can be taught to kids.",
          "Bookmark it for puzzle 148 and the other notorious late-game cards. The solver will show you the placement, and the strategy above will make you faster on every card after."
        ]
      }
    ],
    faqHeading: "Kanoodle Solver FAQ",
    faqs: [
      {
        question: "How does the Kanoodle solver work?",
        answer:
          "It tries every piece in every rotation and reflection, placing them one at a time and backtracking the moment a placement cannot be completed, until it finds a full arrangement that covers the board."
      },
      {
        question: "Does the Kanoodle solver work for all puzzle cards?",
        answer:
          "If a card is solvable, the solver finds a placement. If a card is genuinely impossible, the solver exhausts its search and tells you."
      },
      {
        question: "Are there multiple solutions to a Kanoodle puzzle?",
        answer:
          "Many cards have several valid arrangements. The solver returns one complete solution, but any layout that fills the silhouette is correct."
      },
      {
        question: "How many pieces does Kanoodle use?",
        answer:
          "The game uses twelve distinct pieces, and every puzzle card is a target silhouette those twelve pieces must fill on the 5×11 board."
      },
      {
        question: "What is the fastest way to get better at Kanoodle?",
        answer:
          "Place the largest pieces first, lock the corners and edges, and practice backtracking early. Studying solver solutions shows you unconventional orientations to learn."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/light-out-solver", label: "Lights Out Solver" },
      { href: "/minesweeper-solver", label: "Minesweeper Solver" },
      { href: "/squaredle-solver", label: "Squaredle Solver" },
      { href: "/weaver-solver", label: "Weaver Solver" },
      { href: "/word-ladder-solver", label: "Word Ladder Solver" }
    ]
  }`;

ENTRIES['hangman-solver'] = `  'hangman-solver': {
    key: 'hangman-solver',
    eyebrow: 'Hangman Solver Guide',
    intro:
      "Hangman is a game of letters, but really it is a game of information: every wrong guess tightens the noose, and the best players maximize what each guess reveals. The Hangman solver applies that logic perfectly — it picks the letter that splits the remaining word list most evenly, then narrows with every correct and incorrect guess. Here is how it works and how to think like it.",
    sections: [
      {
        heading: "How the Hangman solver chooses letters",
        paragraphs: [
          "The solver keeps a running list of every word that matches the revealed pattern. After each guess it filters that list — a correct letter keeps only words with that letter in that position, a wrong letter drops every word containing it.",
          "The choice of next letter is the smart part. The solver does not pick the most common letter overall; it picks the letter that splits the current candidate list most evenly. A letter that appears in half the candidates halves the list no matter how the game answers — that is the information-maximizing move.",
          "This 'balanced split' strategy is provably optimal for minimizing worst-case guesses, and it is why the solver wins far more games than a human who guesses 'E' every time out of habit."
        ],
        callout: {
          title: "Guess for information, not for luck",
          body: "A letter that splits the candidate list in half is worth more than a letter that is likely right but tells you nothing when it misses. The solver always chooses the splitter."
        }
      },
      {
        heading: "Using the solver mid-game",
        paragraphs: [
          "Enter the current pattern — the revealed letters and the blanks — plus any letters you have already guessed. The solver shows the remaining candidate words and its recommended next letter.",
          "When the candidate list is long, trust the solver's letter over your intuition. When it shrinks below a handful of words, switch to pattern-matching: read the candidates and guess the one that fits the theme, or check whether any candidate shares letters with the revealed pattern.",
          "The solver also flags when a word is effectively certain — when every candidate shares the same next-best letter, the choice is forced and safe."
        ],
        list: {
          title: "When to trust the solver's letter",
          items: [
            "Early game, when the candidate list is hundreds of words long",
            "After a wrong guess, when you need to recover information fast",
            "When two letters tie — pick either, the solver's split math still holds",
            "Always avoid repeating a letter you already guessed"
          ]
        }
      },
      {
        heading: "The mathematics of a good hangman guess",
        paragraphs: [
          "Imagine a candidate list of 100 words. Guessing a letter that appears in 90 of them is exciting — but if the game says 'no', you are left with 10 words and little new information. Guessing a letter that appears in 50 leaves you with 50 either way, which is a much better deal.",
          "This is why 'E' is not always the best opener in a themed hangman game. E appears in almost every word, so a miss barely narrows the list. In a word list full of E's, the solver instead picks a letter like 'T', 'A', or 'O' that splits the theme's vocabulary.",
          "The solver computes this split for every unguessed letter on every turn, so its recommendation adapts to the actual word list — not to a generic frequency table."
        ]
      },
      {
        heading: "Why word lists matter in hangman",
        paragraphs: [
          "The solver's accuracy depends on the dictionary it filters. A themed game — animals, cities, foods — needs a themed word list, and the solver lets you switch lists to match the game's theme.",
          "A common English dictionary is the right default: it is what most hangman games draw from, and its frequency structure is what the split strategy is built for.",
          "If the game is using proper nouns (like famous people or places), the solver's generic dictionary still works, but its guesses improve when you can tell it the theme. Knowing your opponent's word source is half the battle in hangman."
        ]
      },
      {
        heading: "Common mistakes the Hangman solver prevents",
        paragraphs: [
          "The classic mistake is guessing letters from personal habit — E, T, A — instead of from the candidate list. The solver only guesses letters that actively shrink the list.",
          "The second mistake is forgetting the pattern. Players get caught up in a promising letter and ignore that it cannot fit the revealed blanks. The solver hard-constrains every guess to the pattern.",
          "The third mistake is wasting guesses on consonants when the vowels are already known. Once you know the vowels, the solver pivots to the consonants that discriminate between remaining candidates."
        ]
      },
      {
        heading: "Why the Hangman solver page ranks in search",
        paragraphs: [
          "'Hangman solver' is a perennial search — players stuck on a tricky word, students mid-homework, and party-game players who refuse to lose. The solver answers in one click with the exact next letter and the candidate list.",
          "The strategy sections also serve the players who want to win without the tool: the split logic, the word-list insight, and the pattern-first approach are all things you can apply in any hangman game.",
          "Bookmark it for the next time the word is seven letters, the theme is obscure, and you are one wrong guess from the noose."
        ]
      }
    ],
    faqHeading: "Hangman Solver FAQ",
    faqs: [
      {
        question: "How does the Hangman solver work?",
        answer:
          "It keeps a list of every word matching the revealed pattern, filters it after each guess, and recommends the letter that splits the remaining candidates most evenly to maximize information."
      },
      {
        question: "What is the best first letter in hangman?",
        answer:
          "There is no universal best letter — it depends on the word list. The solver picks the letter that halves the candidate list, which often beats habit-guessing E or T."
      },
      {
        question: "Does the solver support themed word lists?",
        answer:
          "Yes. You can switch between a common English dictionary and themed lists so the candidate pool matches the game you are playing."
      },
      {
        question: "Why did the solver guess a letter that is not common?",
        answer:
          "Because uncommon letters often split the candidate list better. A letter in half the candidates is more valuable than a letter in 90% of them.",
      },
      {
        question: "Can the solver guarantee a win?",
        answer:
          "No solver can guarantee a win on an arbitrary word, but the split strategy minimizes worst-case guesses and wins far more often than intuition-based play."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/boggle-solver", label: "Boggle Solver" },
      { href: "/word-ladder-solver", label: "Word Ladder Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/weaver-solver", label: "Weaver Solver" },
      { href: "/squaredle-solver", label: "Squaredle Solver" }
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
