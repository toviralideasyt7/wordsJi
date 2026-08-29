// Batch 5b: wordlebot variant solver articles (hardle, woodle, w-peaks, spotle-wordle, canuckle).
// Run with: node scripts/add-articles-b5b.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['hardle-solver'] = `  'hardle-solver': {
    key: 'hardle-solver',
    eyebrow: 'Hardle Solver Guide',
    intro:
      "Hardle is the Wordle variant that makes you question your own eyes: the clue tiles can swap roles. The game shows the usual green, yellow, and gray verdicts, but on some guesses the greens and yellows are deliberately exchanged, so a tile that looks green may really be telling you the letter is misplaced. The Hardle solver handles the uncertainty by keeping every candidate that is consistent with at least one possible assignment of the swapped tiles. Here is how the mechanic works and why it rewires normal Wordle instincts.",
    sections: [
      {
        heading: "The swap rule, stated plainly",
        paragraphs: [
          "In Hardle you get eight guesses instead of six, and the reason is the trick: for some of your clues, the green and yellow verdicts are swapped before you see them. A letter that is correctly placed may light up yellow, and a misplaced letter may light up green.",
          "The game does not tell you which clues are swapped, which is the entire difficulty. You have to solve the word while holding multiple interpretations of the board in your head at once.",
          "Gray tiles stay honest — a gray always means the letter is absent. That one anchor is what makes Hardle solvable, and it is the first thing the solver leans on."
        ],
        callout: {
          title: "Greens and yellows are negotiable",
          body: "In Hardle, green and yellow can swap. Gray is the only verdict you can fully trust, so the solver builds every deduction around grays first."
        }
      },
      {
        heading: "Why this breaks standard Wordle logic",
        paragraphs: [
          "A standard Wordle solver assumes a green tile pins a letter to a position. In Hardle that assumption is unsafe, so the solver tracks two readings of every colored tile: the literal one and the swapped one.",
          "A candidate word stays alive if it matches at least one consistent reading of every clue. If a word contradicts every possible reading of a single clue, it is eliminated — but it only needs one viable reading to survive.",
          "That relaxation makes the candidate set larger and the deductions slower than in Wordle, which is precisely why Hardle gives you two extra guesses."
        ]
      },
      {
        heading: "The eight-guess budget and how to spend it",
        paragraphs: [
          "Eight guesses is the game's acknowledgment that each clue carries less trustworthy information. The solver spends that budget on redundancy: it favors probes that clarify which readings are real.",
          "Replaying a letter that came back green or yellow in an earlier clue is the strongest probe. If the second verdict contradicts the first, you now know one of the clues was swapped and you can discard its misleading reading.",
          "The solver ranks words by how much they would resolve the swap ambiguity, not just by how many letters they test — the two goals are different in Hardle."
        ],
        list: {
          title: "Hardle probe guidelines",
          items: [
            "Trust grays absolutely — they are never swapped",
            "Replay green or yellow letters to detect swapped clues",
            "Prefer words that repeat a contested letter in a new position",
            "Discard a clue's literal reading once a contradiction appears",
            "Spend the last guesses confirming, not exploring"
          ]
        }
      },
      {
        heading: "How the solver models both readings",
        paragraphs: [
          "The Hardle solver's core loop is simple: for each clue, build the set of readings that candidate words could have produced, and keep every candidate that survives at least one full interpretation.",
          "As clues accumulate, the solver also tracks which clues are likely swapped. If a candidate requires clue three to be read as swapped but handles clue one and two literally, the solver notes that consistency and carries it forward.",
          "By the end of the game, the surviving candidates usually share a single coherent story: the word, plus which clues lied about their colors. That story is exactly what a perfect human player would reconstruct."
        ]
      },
      {
        heading: "The Hardle mindset: hold every interpretation",
        paragraphs: [
          "The players who lose Hardle are the ones who commit to a reading of an early clue and stop questioning it. The winning mindset is the opposite: every colored tile is a hypothesis, and hypotheses get confirmed or discarded by later evidence.",
          "The solver never commits. It keeps every candidate that any coherent interpretation allows, and it only narrows when the evidence genuinely rules readings out.",
          "Play with that patience and Hardle becomes a puzzle about deduction under uncertainty — which is harder than Wordle, but exactly as fair. The truth is always in there, recoverable from the clues you have."
        ]
      }
    ],
    faqHeading: "Hardle Solver FAQ",
    faqs: [
      {
        question: "What is Hardle?",
        answer:
          "Hardle is a Wordle variant where green and yellow clue tiles can be swapped on some guesses. A correctly placed letter may appear yellow, and a misplaced letter may appear green."
      },
      {
        question: "How many guesses do you get in Hardle?",
        answer:
          "Eight guesses, two more than standard Wordle, to compensate for the unreliable color feedback."
      },
      {
        question: "Are gray tiles always honest in Hardle?",
        answer:
          "Yes. Gray always means the letter is absent from the answer. It is the only fully trustworthy verdict, which is why the solver builds its deductions around grays first."
      },
      {
        question: "How does the Hardle solver handle swapped colors?",
        answer:
          "It keeps every candidate word that is consistent with at least one reading of each clue — literal or swapped — and only eliminates words that contradict every possible reading of a clue."
      },
      {
        question: "What is the best strategy for Hardle?",
        answer:
          "Probe: replay letters that returned green or yellow in earlier clues. When a repeated letter's verdict contradicts the first one, you have caught a swapped clue and can discard its misleading reading."
      },
      {
        question: "Is Hardle harder than Wordle?",
        answer:
          "Yes, by design. The unreliable colors reduce the information per guess, so the game grants two extra guesses and rewards careful cross-checking over raw intuition."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/fibble-solver", label: "Fibble Solver" },
      { href: "/warmle-solver", label: "Warmle Solver" },
      { href: "/woodle-solver", label: "Woodle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['woodle-solver'] = `  'woodle-solver': {
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
  }`;

ENTRIES['w-peaks-solver'] = `  'w-peaks-solver': {
    key: 'w-peaks-solver',
    eyebrow: 'Wordle Peaks Solver Guide',
    intro:
      "Wordle Peaks swaps letters for altitudes: instead of guessing letters, you guess a five-letter word and the game tells you, for each position, whether the true letter comes earlier or later in the alphabet than your guess. Every tile is a directional arrow — the answer letter is higher or lower than what you played. That makes Wordle Peaks a search problem rather than a vocabulary drill: each guess is a probe that cuts the alphabet in half at every position at once. The Wordle Peaks solver runs that binary search across the whole dictionary and shows you the word before you even realize the peaks are closing in.",
    sections: [
      {
        heading: "How the peaks feedback works",
        paragraphs: [
          "In Wordle Peaks you play a normal five-letter word, and each position comes back as one of three verdicts: the answer letter matches yours exactly, the answer letter is earlier in the alphabet than yours, or the answer letter is later.",
          "The directional verdict is the whole game. A tile that says earlier narrows that position's possible letters to everything below your guess; a tile that says later narrows it to everything above.",
          "With five positions active at once, every guess cuts five windows of the alphabet simultaneously. Played well, the answer emerges in a handful of turns because each position's window halves with every probe."
        ],
        callout: {
          title: "Five binary searches at once",
          body: "Every Wordle Peaks guess halves the alphabet window in each of the five positions. That is the whole game — the solver just does the halving faster."
        }
      },
      {
        heading: "The six-guess budget and the midpoint rule",
        paragraphs: [
          "Wordle Peaks gives you six guesses, the same as Wordle, and the math works out: each position's window starts at 26 letters and can be halved about four times before it collapses, so six guesses is exactly enough when you probe near the middle.",
          "The golden rule is to guess the midpoint of each position's remaining window. If the answer letter is later, you have discarded the lower half; if earlier, the upper half. Guessing near the edges wastes the halving.",
          "The solver always knows every position's remaining window and picks words whose letters sit at the midpoints — that is why its suggestions feel like they are reading the answer from the board."
        ],
        list: {
          title: "Wordle Peaks opening guidelines",
          items: [
            "Play letters near the alphabet's middle in most positions",
            "A word like ROUTE or POINT spreads mid-alphabet letters across all five positions",
            "Watch for green — an exact hit locks a position permanently",
            "Treat each earlier-or-later verdict as a half-alphabet elimination",
            "By guess four, most windows are down to a handful of letters"
          ]
        }
      },
      {
        heading: "Why the solver is nearly unbeatable here",
        paragraphs: [
          "Wordle Peaks is the most solver-friendly of all the wordle variants because its feedback is arithmetic. The solver maintains the exact letter window for each of the five positions, intersects those windows with the dictionary, and reports the remaining candidates.",
          "The ranking then applies the midpoint rule perfectly: among the surviving dictionary words, it prefers the one whose letters are closest to the centers of their windows, because that guess is guaranteed to eliminate the most letters regardless of the verdict.",
          "The result is a game where a six-guess budget almost always finishes the word — often with guesses to spare, because the midpoint strategy never wastes a turn on a lopsided probe."
        ]
      },
      {
        heading: "Reading the board like the solver does",
        paragraphs: [
          "You can beat Wordle Peaks without the solver by adopting its discipline. After each clue, write down the remaining window for each position — everything below or above your guess — and only consider dictionary words whose letters all fall inside their windows.",
          "The green tiles are anchors: once a position is exact, it is solved forever and its window is a single letter. The directional tiles are the movers, and they should be re-probed at their midpoints.",
          "The discipline that wins is never guessing a letter outside a window. Every guess inside the windows is productive; every guess outside is a wasted turn, and in a six-guess game there are no wasted turns to spare."
        ]
      },
      {
        heading: "The strategy in three phases",
        paragraphs: [
          "Phase one, guesses one and two: probe the middle of the alphabet in all five positions with a word like ROUTE, then another mid-alphabet word that uses letters the first probe did not cover.",
          "Phase two, guesses three and four: the windows have collapsed to a few letters each, so play dictionary words that fit all five windows at once. The solver lists exactly these words, usually a small set.",
          "Phase three, guesses five and six: confirm. With two or three candidates left, a single well-placed probe usually distinguishes them, and the solver's top suggestion is typically the answer itself."
        ]
      }
    ],
    faqHeading: "Wordle Peaks Solver FAQ",
    faqs: [
      {
        question: "What is Wordle Peaks?",
        answer:
          "Wordle Peaks is a Wordle variant where each tile tells you whether the answer letter is earlier or later in the alphabet than your guess, instead of showing a color for misplaced or absent letters."
      },
      {
        question: "How does Wordle Peaks feedback work?",
        answer:
          "Each position returns one of three verdicts: exact match, the answer letter is earlier in the alphabet, or the answer letter is later. Every non-exact verdict halves the remaining alphabet window for that position."
      },
      {
        question: "How many guesses do you get in Wordle Peaks?",
        answer:
          "Six guesses, the same as Wordle. The binary-search nature of the feedback makes six turns sufficient when you probe near the middle of each position's window."
      },
      {
        question: "How does the Wordle Peaks solver work?",
        answer:
          "It maintains the exact remaining letter window for every position, intersects those windows with the dictionary, and ranks candidate words by how close their letters are to the midpoints of their windows."
      },
      {
        question: "What is the best Wordle Peaks opening?",
        answer:
          "A word whose letters sit near the middle of the alphabet in all five positions, such as ROUTE or POINT, so the first verdict halves every window at once."
      },
      {
        question: "Can you solve Wordle Peaks without a solver?",
        answer:
          "Yes. Track each position's remaining window by hand, only play dictionary words whose letters fit every window, and always probe near the middle — the answer emerges in four to six guesses."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/warmle-solver", label: "Warmle Solver" },
      { href: "/xordle-solver", label: "Xordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-solver", label: "Quordle Solver" }
    ]
  }`;

ENTRIES['spotle-wordle-solver'] = `  'spotle-wordle-solver': {
    key: 'spotle-wordle-solver',
    eyebrow: 'Spotle Wordle Solver Guide',
    intro:
      "Spotle Wordle is the wordlebot's five-letter variant with rank-based feedback: every letter in your guess comes back as green, yellow, gray, or blank depending on where it sits in the answer, but with the twist that the verdicts are computed against a ranked letter model rather than plain position logic. The same page also covers Thirdle, the three-letter Wordle with three guesses, because the two games share the same solver engine. Whether you are untangling a five-letter Spotle Wordle or cracking a three-letter Thirdle, the solver filters the exact candidate pool your game uses. Here is how both modes work.",
    sections: [
      {
        heading: "Spotle Wordle feedback, explained",
        paragraphs: [
          "Spotle Wordle plays like Wordle with an extra verdict: each tile can be green, yellow, gray, or blank. The blank tile is the game's signature — it carries a different meaning from gray, and reading the difference is the first skill.",
          "Green means the letter is exactly right in that position. Yellow means the letter belongs to the answer but sits elsewhere. Gray rules the letter out. Blank is the rank-based signal that sets Spotle Wordle apart from standard Wordle.",
          "The solver accepts all four verdicts per tile, so whatever the game shows you, the candidate filter can consume it exactly as-is."
        ],
        callout: {
          title: "Four verdicts, one filter",
          body: "Spotle Wordle tiles come in green, yellow, gray, and blank. The solver consumes all four exactly as shown, so you never have to translate the game's feedback."
        }
      },
      {
        heading: "Thirdle: the three-letter sprint",
        paragraphs: [
          "Thirdle is Wordle compressed: three-letter words, three guesses, and no mercy. With only three turns, there is no room for a discovery phase — every guess must both test letters and position them.",
          "The solver treats Thirdle as its own mode because the dictionary and the strategy are different. Three-letter words repeat letters more often and share more letters with each other, so the overlap math is tighter.",
          "Your first Thirdle guess should be a high-frequency three-letter word that could plausibly be the answer, because in three guesses there is no second chance to sweep the alphabet."
        ],
        list: {
          title: "Thirdle essentials",
          items: [
            "Three guesses for a three-letter word",
            "Open with a common word that could be the answer itself",
            "Vowels are scarce — guess them early",
            "Repeated letters are common in three-letter words",
            "The solver narrows the three-letter dictionary with every clue"
          ]
        }
      },
      {
        heading: "One solver, two games",
        paragraphs: [
          "The same solver page handles both modes because both games filter the same way: feed in guesses and verdicts, and the engine eliminates every word that contradicts them. The difference is the dictionary and the budget.",
          "In Spotle Wordle mode the solver works against the five-letter pool with six guesses and the full four-verdict system. In Thirdle mode it switches to the three-letter dictionary with three guesses and standard green-yellow-gray logic.",
          "If you arrived at this page from an old Thirdle link, you are in the right place — the two games share this solver, and the interface lets you pick the mode before you start."
        ]
      },
      {
        heading: "The strategy that wins both modes",
        paragraphs: [
          "For Spotle Wordle, treat the blank verdict as your richest signal: a blank narrows the letter's possible meanings far more than a gray, so build your model of the answer around which positions came back blank.",
          "For Thirdle, speed is everything. Guess a common word first, then use the solver's candidate list to find a second guess that splits the survivors evenly — the third guess should be the answer itself.",
          "In both modes the solver's ranked suggestions do the heavy lifting: they tell you which word reveals the most information next, which is the difference between playing reactively and playing to win."
        ]
      },
      {
        heading: "How the solver ranks its suggestions",
        paragraphs: [
          "The ranking engine scores each candidate word by how evenly its possible feedback splits the remaining dictionary. A word that could plausibly return several different verdict patterns is more informative than one whose verdict is predictable.",
          "That is the same information-theory logic that powers the best Wordle solvers, adapted to the four-verdict system of Spotle Wordle and the compressed three-guess budget of Thirdle.",
          "The result is a suggestion list that reads like a pro player's thought process: first a word that splits the field, then the word that closes the remaining gap, then the answer."
        ]
      }
    ],
    faqHeading: "Spotle Wordle Solver FAQ",
    faqs: [
      {
        question: "What is Spotle Wordle?",
        answer:
          "Spotle Wordle is a five-letter Wordle variant with four verdicts per tile — green, yellow, gray, and blank — where the blank tile is a rank-based signal that standard Wordle does not have."
      },
      {
        question: "What is Thirdle?",
        answer:
          "Thirdle is a three-letter Wordle variant with just three guesses. It shares this solver page with Spotle Wordle, so you can pick either mode before you start."
      },
      {
        question: "What does the blank tile mean in Spotle Wordle?",
        answer:
          "The blank verdict is the game's rank-based signal, distinct from gray. The solver consumes it exactly as the game shows it, so you never need to translate the feedback yourself."
      },
      {
        question: "How many guesses do you get in each mode?",
        answer:
          "Spotle Wordle gives you six guesses for a five-letter word. Thirdle gives you three guesses for a three-letter word — a deliberately brutal sprint."
      },
      {
        question: "How does the solver work for both games?",
        answer:
          "It maintains the correct dictionary for the selected mode — five-letter words for Spotle Wordle, three-letter words for Thirdle — and eliminates every candidate that contradicts your guesses and verdicts."
      },
      {
        question: "I used an old Thirdle link. Am I in the right place?",
        answer:
          "Yes. Thirdle was merged into this solver page, which supports both the standard three-letter Thirdle rules and the Spotle Wordle five-letter mode. Pick the mode in the interface and enter your clues as usual."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/spotle-solver", label: "Spotle Solver" },
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/hardle-solver", label: "Hardle Solver" }
    ]
  }`;

ENTRIES['canuckle-solver'] = `  'canuckle-solver': {
    key: 'canuckle-solver',
    eyebrow: 'Canuckle Solver Guide',
    intro:
      "Canuckle is Canada's Wordle: a five-letter word, six guesses, and the same green-yellow-gray feedback, but the answer always comes from a Canadian word list and every puzzle is tied to a daily Canadian fact. The twist that trips up new players is the third color — Canuckle uses brown instead of yellow for misplaced letters, and the clue colors have their own Canadian flavor. The Canuckle solver draws from the same Canadian-words dataset the game uses, so every suggestion it makes is a legal daily answer. Here is how the game works, what the colors mean, and how to use the solver without breaking the game's spirit.",
    sections: [
      {
        heading: "The Canadian word list is the real twist",
        paragraphs: [
          "Canuckle's answers are drawn from a curated list of Canadian words — place names, hockey terms, foods, and everyday vocabulary with a distinctly Canadian flavor. That is the real difference from Wordle, more than the brown tile.",
          "A solver that used a generic English dictionary would suggest words that can never be Canuckle answers, which is why this solver loads the Canadian word list specifically.",
          "For players, the Canadian list changes the opening math slightly: certain letter combinations and word shapes appear more often than in the general English dictionary, and repeated exposure to the list teaches you the game's vocabulary habits."
        ],
        callout: {
          title: "Canadian words only",
          body: "Every Canuckle answer comes from a Canadian word list. The solver uses that same list, so its suggestions are always legal daily answers — never dictionary filler."
        }
      },
      {
        heading: "Brown, yellow, and green: the clue colors",
        paragraphs: [
          "Green means the letter is correct in that position, exactly as in Wordle. Yellow means the letter is in the answer but in a different position. Brown is Canuckle's version of gray — the letter is not in the answer at all.",
          "New players often misread brown as a second \"in the word\" color, which wrecks their deductions. Brown is a ban: that letter is out, full stop.",
          "The solver matches the game's exact coloring, so you tap the tiles to match what Canuckle showed you and the candidate filter does the rest."
        ],
        list: {
          title: "Canuckle color cheat sheet",
          items: [
            "Green: letter correct in that exact position",
            "Yellow: letter in the word, wrong position",
            "Brown: letter not in the word at all",
            "Each puzzle is tied to a daily Canadian fact",
            "The solver accepts all three colors exactly as shown"
          ]
        }
      },
      {
        heading: "The daily fact, the puzzle number, and the history",
        paragraphs: [
          "Every Canuckle puzzle is anchored to a real Canadian fact related to the answer word — a person, place, event, or piece of culture. The fact is not just trivia; it is a legitimate solving hint for players who know their Canada.",
          "Canuckle also numbers its puzzles. The sequence started in February 2022, paused, and restarted under a new schedule, so the puzzle number you see on the today page reflects the current daily sequence from the restart.",
          "The solver does not need the fact or the number to work — it filters on word evidence alone — but the page keeps both visible so you can confirm which puzzle you are solving and enjoy the fact after you win."
        ]
      },
      {
        heading: "How to use the Canuckle solver",
        paragraphs: [
          "Enter the guess you played, then tap each tile until it matches the brown, yellow, or green result you saw in the game. The solver eliminates impossible answers from the Canadian list and ranks the best next guesses.",
          "The ranked list is the payoff: the top suggestion is the word that would reveal the most information next, which is the difference between hoping and knowing in a six-guess game.",
          "You can also use the solver for archive puzzles — it works on any past Canuckle position, not just today's, so a stuck old puzzle is never more than a few taps from a solution."
        ]
      },
      {
        heading: "The strategy that wins Canuckle",
        paragraphs: [
          "Open with a common five-letter word that could plausibly be a Canadian answer — words like NORTH, LAKES, or MAPLE are both common and thematically on-brand, and they carry high-frequency letters.",
          "Respect the brown tiles absolutely: every brown bans a letter for the rest of the game, and the solver treats them as hard eliminations.",
          "Then let the solver's rankings drive: each turn, play the highest-ranked word that fits everything you know. Six guesses is enough for most Canuckle puzzles, and with the Canadian list loaded, the suggestions are always words the game could actually use."
        ]
      }
    ],
    faqHeading: "Canuckle Solver FAQ",
    faqs: [
      {
        question: "What is Canuckle?",
        answer:
          "Canuckle is a Canadian-themed Wordle variant: five-letter words, six guesses, and brown-yellow-green clue colors, with every answer drawn from a Canadian word list and tied to a daily Canadian fact."
      },
      {
        question: "What does brown mean in Canuckle?",
        answer:
          "Brown means the letter is not in the answer at all — it is Canuckle's version of Wordle's gray. Yellow means the letter is in the word but misplaced, and green means it is exactly right."
      },
      {
        question: "Does the Canuckle solver use the same word list as the game?",
        answer:
          "Yes. It draws from the same Canadian-words dataset that Canuckle uses, so any suggestion the solver makes is a valid daily answer."
      },
      {
        question: "How many guesses do you get in Canuckle?",
        answer:
          "Six guesses for a five-letter word, the same budget as Wordle."
      },
      {
        question: "Can I use the solver for archive puzzles?",
        answer:
          "Yes. The solver works on any Canuckle position, past or present — enter your guesses and their clue colors, and it will filter the Canadian list accordingly."
      },
      {
        question: "Why does Canuckle include a daily Canadian fact?",
        answer:
          "Each puzzle is tied to a real Canadian fact related to the answer word, giving the game an educational angle rooted in Canadian culture, geography, and history."
      }
    ],
    relatedLinks: [
      { href: "/canuckle-answer-today", label: "Canuckle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/quordle-solver", label: "Quordle Solver" }
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
