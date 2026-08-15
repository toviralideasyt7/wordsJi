// Batch 5a: wordlebot variant solver articles (octordle, dordle, xordle, fibble, warmle).
// Run with: node scripts/add-articles-b5a.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['octordle-solver'] = `  'octordle-solver': {
    key: 'octordle-solver',
    eyebrow: 'Octordle Solver Guide',
    intro:
      "Octordle is Wordle played eight times at once: eight five-letter words share one 13-guess budget, and every guess you type appears on all eight boards at the same time. That single shared budget is what makes Octordle genuinely different from Wordle — you are not solving eight puzzles, you are solving one allocation problem with eight answers. The Octordle solver treats it exactly that way: it filters all eight candidate lists in parallel and shows you which words earn progress on the most boards. Here is how the math works and the strategy that finishes most Octordle grids inside the limit.",
    sections: [
      {
        heading: "Why eight boards change everything",
        paragraphs: [
          "In Wordle you have six guesses for one word. In Octordle you have 13 guesses for eight words — which sounds generous until you notice the trade-off. A guess that only helps one board costs a turn the other seven boards also needed, and a guess that helps several boards is worth several turns at once.",
          "That is the core Octordle skill: every guess should earn progress on as many boards as possible. The solver ranks every candidate by how much information it would reveal across all eight remaining word lists, so a solid common word beats a clever narrow one every time.",
          "The 13-guess budget works out to roughly one to two guesses per board, but the real arithmetic is different: three or four opening guesses that sweep the alphabet, then one or two targeted guesses per unresolved board."
        ],
        callout: {
          title: "Shared guesses, multiplied value",
          body: "A guess that hits three boards is worth three turns. That is the whole game — spend the opening sweeping letters, then finish boards with targeted words."
        }
      },
      {
        heading: "The opening salvo: three guesses, twenty letters",
        paragraphs: [
          "The strongest Octordle opening is a sequence of common words that covers as many distinct high-frequency letters as possible. Because every guess plays on every board, the first three guesses can expose more than twenty different letters across the eight answers.",
          "A typical salvo uses words built from the most common English letters — E, A, R, I, O, T, N, S, L, C, U, D — arranged so that each guess's letters barely repeat. The solver surfaces the best salvo automatically, but the principle is what matters: maximize distinct letters per guess.",
          "After the salvo you will have a rough picture of every board. Some will already show one or two green letters; others will still be a sea of gray. That uneven picture tells you exactly where to aim next."
        ],
        list: {
          title: "What a good Octordle salvo does",
          items: [
            "Covers 20+ distinct letters in three guesses",
            "Favors E, A, R, I, O, T, N, S, L, C, U, D over rare letters",
            "Leaves every board with at least one visible clue",
            "Sets up the second wave of targeted guesses",
            "Costs only three of your 13 turns"
          ]
        }
      },
      {
        heading: "The second wave: finish the boards that are almost done",
        paragraphs: [
          "After the salvo, score each board by how close it looks. A board with two or three green letters is close; a board with nothing but grays is still wide open. The solver shows this pressure directly in its ranked suggestions.",
          "The efficient order is usually to finish the two or three most advanced boards first, because the words that solve them are short and information-rich — each one also reveals more letters for the stuck boards.",
          "Every time you solve a board, stop guessing its letters and let it ride. From that point your guesses are free to focus entirely on the remaining boards, which is exactly how strong players climb out of the middle of the game."
        ]
      },
      {
        heading: "When to pivot into vertical mode",
        paragraphs: [
          "Octordle players describe two phases: horizontal, where every guess sweeps all boards, and vertical, where you commit to solving one board at a time. The switch happens when the remaining boards have too few candidates to share a common guess.",
          "The solver flags that moment. When its suggestions start converging on a single board rather than spreading across several, the shared-guess phase is over — pick the most solvable board and drive it to completion.",
          "Vertical mode is also where the 13-guess budget gets tight. Each board still open costs one to two targeted guesses, and the solver's ranking tells you which board can be closed with the fewest of them."
        ],
        callout: {
          title: "Read the convergence",
          body: "When ranked suggestions stop spreading across boards, stop spreading your guesses too. Commit to the closest board and close it."
        }
      },
      {
        heading: "Scoring the final boards without wasting turns",
        paragraphs: [
          "The last two or three boards are where Octordle games are lost. With three boards open and four guesses left, you cannot afford a guess that helps only one of them.",
          "Look for a word that could plausibly be the answer to two boards at once — if a single guess finishes two boards, it effectively buys you a free turn. The solver's scoring weighs exactly this kind of double-value word ahead of single-board candidates.",
          "And when you truly have no shared word left, choose the board with the fewest remaining candidates and take it down with the most informative guess — a word that rules out the maximum number of possibilities even if it cannot be the answer itself."
        ]
      }
    ],
    faqHeading: "Octordle Solver FAQ",
    faqs: [
      {
        question: "What is Octordle?",
        answer:
          "Octordle is a Wordle variant with eight hidden words played at once. Every guess applies to all eight boards, and you have 13 guesses total to solve all of them."
      },
      {
        question: "How many guesses do you get in Octordle?",
        answer:
          "Thirteen guesses for eight boards. The daily Octordle also offers extra lives that give you more chances, but the core 13-guess budget is the standard game."
      },
      {
        question: "Is Octordle eight separate Wordle games?",
        answer:
          "Not quite. Each board is a normal five-letter Wordle puzzle, but the guesses are shared, which turns the game into an allocation problem: every guess must earn progress on as many boards as possible."
      },
      {
        question: "What is the best Octordle opening?",
        answer:
          "A three-word salvo built from high-frequency letters, like CRANE, SLOTH, and BUILD. Each guess should add mostly new letters so the first three turns cover 20 or more distinct letters across the eight boards."
      },
      {
        question: "How does the Octordle solver work?",
        answer:
          "The solver maintains a candidate list for each of the eight boards, filters all eight in parallel as you enter feedback, and ranks the next guess by how much progress it earns across every remaining list."
      },
      {
        question: "Can I use the solver for past Octordle puzzles?",
        answer:
          "Yes. The solver works on any position, not just today's puzzle — enter your guesses and the clue colors you saw, and it will filter the candidate lists regardless of the date."
      }
    ],
    relatedLinks: [
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/dordle-solver", label: "Dordle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  }`;

ENTRIES['dordle-solver'] = `  'dordle-solver': {
    key: 'dordle-solver',
    eyebrow: 'Dordle Solver Guide',
    intro:
      "Dordle is Wordle doubled: two five-letter words, one shared guess per turn, and seven attempts to solve both boards. Seven guesses sounds like a lot until you remember that a single guess that only helps one board effectively costs both boards a turn. The Dordle solver filters the two candidate lists in parallel and ranks every suggestion by how much it reveals on both boards at once — which is the only way to win reliably inside seven turns. Here is how the game's budget works and the strategy the solver encodes.",
    sections: [
      {
        heading: "The seven-guess budget, split two ways",
        paragraphs: [
          "Dordle's arithmetic is simple: seven guesses, two answers. If you treat it as two separate Wordle games you need twelve guesses and you lose. If you treat it as one shared game, seven turns is enough — but only when most guesses earn progress on both boards.",
          "The solver's ranking encodes that math. A candidate word is scored by how much information it reveals across both candidate lists combined, not on a single board, so the suggestions naturally favor words that work for both puzzles.",
          "Early in the game the two boards are nearly identical — both are full five-letter dictionaries. That is the moment when shared guesses are cheapest and most valuable, which is why the opening matters more in Dordle than in Wordle."
        ],
        callout: {
          title: "One guess, two boards",
          body: "A guess that reveals letters on both boards is worth two turns. Spend the first few guesses on words with high-value letters, and the budget stops being tight."
        }
      },
      {
        heading: "Openers that hit both boards",
        paragraphs: [
          "The same opening logic that works in Wordle works in Dordle, with one twist: you want the opening word to be a plausible answer to either board, so its feedback is useful in both columns.",
          "Classic five-letter openers like CRANE, SLATE, or ADIEU are strong because they cover common vowels and consonants without repeating letters. Any green or yellow you get applies to a word that could appear on either board.",
          "A two-word opening — CRANE then a word using the uncovered letters — usually leaves you with a good shape of both boards by turn two, with five turns left and plenty of information to work with."
        ],
        list: {
          title: "Signs a Dordle opening is working",
          items: [
            "The first guess returns feedback on both boards",
            "Most letters in the opening are common ones",
            "By turn two, each board shows at least one colored tile",
            "You still have five guesses for two partially solved boards"
          ]
        }
      },
      {
        heading: "Reading two feedback grids at once",
        paragraphs: [
          "The unique skill in Dordle is reading two grids simultaneously. One guess produces two feedback rows — one per board — and they rarely agree. A letter that is green on board one can be gray on board two.",
          "The solver removes the mental load: you tap the colors for each board, and it keeps two completely separate candidate lists. Your job is just to enter what you saw; the solver handles the bookkeeping of what is true on which board.",
          "The discipline that matters is not mixing them up. A letter's color on board one has zero bearing on board two, and players who let one board's feedback bleed into their mental model of the other are the ones who run out of turns."
        ]
      },
      {
        heading: "When one board is solved and the other is stuck",
        paragraphs: [
          "The most common Dordle failure is the asymmetric endgame: board one solved by turn four, board two still a mystery with three turns left. That is winnable, but only with maximum-information guesses.",
          "Once a board is solved, every remaining guess is a single-board game with a shrinking budget. Use each guess to eliminate as many candidates as possible, even if the word you type is not the answer — the solver ranks candidates by elimination power for exactly this situation.",
          "If two guesses remain and the board still has several candidates, look for a word that could be the answer itself rather than an elimination play. The solver balances both options and tells you which is safer."
        ]
      },
      {
        heading: "The solver's double-board scoring, explained",
        paragraphs: [
          "Behind the scenes, the Dordle solver scores each candidate word against both remaining lists and reports a combined value. A word that is a plausible answer on board one and reveals strong letters on board two scores far higher than a word that only solves one board.",
          "That combined score is why the solver's suggestions sometimes look odd — a word that is not the answer to either board can still be the best guess because of what it reveals across both.",
          "It also explains the solver's endgame behavior. When the two boards share almost no candidates, the ranking switches to single-board mode automatically, exactly as a strong human player would."
        ]
      }
    ],
    faqHeading: "Dordle Solver FAQ",
    faqs: [
      {
        question: "What is Dordle?",
        answer:
          "Dordle is a Wordle variant with two hidden five-letter words. You make one guess per turn and receive feedback on both boards, with seven total guesses to solve both words."
      },
      {
        question: "How many guesses do you get in Dordle?",
        answer:
          "Seven guesses for two boards. Because guesses are shared, the effective budget per board is about three and a half turns — which is why shared-letter openers matter so much."
      },
      {
        question: "Can one guess help both Dordle boards?",
        answer:
          "Yes, and that is the entire strategy. A guess that reveals letters on both boards is effectively two turns in one, so the solver ranks words by their combined value across both candidate lists."
      },
      {
        question: "What is the best Dordle opening word?",
        answer:
          "The same high-value openers that work in Wordle, like CRANE or SLATE, work in Dordle because they cover common letters and could plausibly be either answer."
      },
      {
        question: "Does the Dordle solver keep the boards separate?",
        answer:
          "Yes. It maintains an independent candidate list for each board and filters them separately as you enter each board's feedback, so a green on board one never contaminates board two's candidates."
      },
      {
        question: "Is Dordle harder than Wordle?",
        answer:
          "The words are equally common, but the shared-guess mechanic makes it harder: a guess that only helps one board wastes half its value, so you must think about both answers with every turn."
      }
    ],
    relatedLinks: [
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/octordle-solver", label: "Octordle Solver" },
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  }`;

ENTRIES['xordle-solver'] = `  'xordle-solver': {
    key: 'xordle-solver',
    eyebrow: 'Xordle Solver Guide',
    intro:
      "Xordle is the Wordle variant that hides two words behind one row of feedback. You type a normal five-letter guess, and each position comes back showing the merged result of two hidden letters — one from each of the two secret words. Decoding that merged clue is the whole game, and it is exactly what the Xordle solver does for you: it keeps candidate lists for both hidden words, tries every possible split of the merged feedback, and tells you which words are still alive after each guess. Here is how the merge works and how to read it.",
    sections: [
      {
        heading: "How the Xordle merge works",
        paragraphs: [
          "In Xordle, two five-letter words are hidden, and each of your guesses is scored against both of them at once. The feedback row you see merges the two results position by position, so a single colored tile can represent two different letters.",
          "The solver's job starts with decoding: for every position, it enumerates the possible hidden letters that could have produced the tile you saw, and then it intersects that possibility set with both candidate dictionaries.",
          "That decoding is where human players lose. A green tile means at least one of the two hidden words has that exact letter in that position, but you cannot tell which word — and a yellow tile is even more ambiguous, because it could come from either hidden word in either position."
        ],
        callout: {
          title: "One tile, two truths",
          body: "Every Xordle tile is a merge of two verdicts. The solver enumerates every split, so you never have to guess which word produced the color."
        }
      },
      {
        heading: "The nine-guess budget and the two-word picture",
        paragraphs: [
          "Xordle gives you nine guesses, which is generous compared with Wordle's six — but the information per guess is genuinely murkier, because the merge hides which word is which.",
          "The first two or three guesses should be ordinary high-frequency openers, exactly like Wordle. The merge is hardest to read early, when both candidate lists are still huge, and a normal salvo narrows both lists at once.",
          "The solver's ranked suggestions in the opening look like normal Wordle openers for the same reason: with both dictionaries full, the best move is still to sweep the most common letters."
        ],
        list: {
          title: "Reading the merged clues correctly",
          items: [
            "A green tile means one of the two words has that letter in that spot",
            "A yellow tile means the letter exists somewhere in one of the two words",
            "A gray tile means the letter is in neither word — the only unambiguous verdict",
            "Double green on a position means both words have that letter there",
            "The same guess is scored against both words, so every tile is two verdicts in one"
          ]
        }
      },
      {
        heading: "Why gray tiles are your best friends",
        paragraphs: [
          "The only fully unambiguous Xordle feedback is gray: it means the letter is absent from both hidden words. Every gray you collect removes that letter from both dictionaries at once, which is why a guess full of common letters is still the right play even though the colors are hard to read.",
          "The solver leans on grays heavily in its scoring. A candidate guess that would confirm or deny a high-value letter in both lists scores better than one that only probes a single board.",
          "As the game progresses, the balance shifts: once you have a decent picture of both words, greens and yellows start to dominate the ranking because they finally have enough context to pin down specific words."
        ]
      },
      {
        heading: "The endgame: resolving the split",
        paragraphs: [
          "With a few guesses left, the ambiguity concentrates in the split itself — you may know the exact set of letters but not which word owns which. That is when the solver's candidate enumeration earns its keep.",
          "It maintains two separate filtered lists and reports them side by side, so you can see the two words converging. When a word appears on both lists, the solver flags it: that word is consistent with every clue for both hidden answers.",
          "The final guesses in Xordle are often confirmations rather than discoveries — you play words that distinguish the two remaining candidates, and the solver tells you which word the feedback points to."
        ]
      },
      {
        heading: "The strategy that wins Xordle",
        paragraphs: [
          "Phase one, guesses one to three: sweep common letters with standard openers and let the solver decode the merged rows into two live candidate lists. Phase two, guesses four to six: probe the letters the merge left ambiguous, using words that would split the candidates cleanly.",
          "Phase three, guesses seven to nine: resolve the two words. By then the solver usually has each word narrowed to a handful of candidates, and the feedback from your probe guesses identifies which is which.",
          "The discipline that wins Xordle is never trying to out-think the merge. Enter the feedback exactly as shown, let the solver enumerate every split, and spend your guesses on words the solver ranks — the merge is decodable, but only systematically."
        ]
      }
    ],
    faqHeading: "Xordle Solver FAQ",
    faqs: [
      {
        question: "What is Xordle?",
        answer:
          "Xordle is a Wordle variant where two hidden five-letter words share one feedback row per guess. Each colored tile merges the verdicts from both hidden words, so a single tile can hide two different letters."
      },
      {
        question: "How many guesses do you get in Xordle?",
        answer:
          "Nine guesses, compared with six in Wordle. The extra turns compensate for the ambiguity of the merged feedback."
      },
      {
        question: "How does merged feedback work in Xordle?",
        answer:
          "Every position of your guess is scored against both hidden words at once and the results are merged into one tile. A green tile means at least one hidden word has that letter in that position; only a gray tile is fully unambiguous."
      },
      {
        question: "What does the Xordle solver do differently?",
        answer:
          "It keeps separate candidate lists for the two hidden words, enumerates every possible split of each merged tile, and filters both lists against all of them — decoding the merge exhaustively instead of by intuition."
      },
      {
        question: "What is the best Xordle opening?",
        answer:
          "Standard high-frequency openers like CRANE or SLATE work well because they narrow both hidden word lists at once and produce the most readable early merge."
      },
      {
        question: "Can the solver handle any Xordle position?",
        answer:
          "Yes. It works for any puzzle date and any word length the game uses — enter your guesses and the merged colors, and it maintains both candidate lists from there."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/dordle-solver", label: "Dordle Solver" },
      { href: "/quordle-solver", label: "Quordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/w-peaks-solver", label: "Wordle Peaks Solver" }
    ]
  }`;

ENTRIES['fibble-solver'] = `  'fibble-solver': {
    key: 'fibble-solver',
    eyebrow: 'Fibble Solver Guide',
    intro:
      "Fibble is the Wordle variant with a liar problem: in every clue you receive, one tile is deliberately wrong. The game shows you the usual green, yellow, and gray verdicts, but exactly one of them is a fib, and figuring out which one — without being able to ask — is what makes Fibble genuinely harder than Wordle. The Fibble solver handles the deception the only reliable way: instead of trusting any single clue, it keeps every candidate word that is consistent with all but one tile of every clue. Here is how the lie mechanic works and how the solver thinks about it.",
    sections: [
      {
        heading: "The one-lie rule, exactly as it works",
        paragraphs: [
          "In Fibble, each of your clues contains exactly one false tile. The other four verdicts are honest. You never know which position lied — the game simply guarantees that exactly one of the five tiles in each clue row is not the real verdict.",
          "That guarantee is what makes Fibble solvable at all. If the game could lie any number of times, the information would be worthless; with exactly one lie per clue, the truth is always a single correction away.",
          "The practical effect is a branching problem: every clue suggests five possible corrected versions, one per position, and the real answer must satisfy one of them — while also satisfying similar corrected versions of every other clue you have."
        ],
        callout: {
          title: "One correction per clue",
          body: "Every Fibble clue is one flip away from the truth. The solver tracks every possible correction at once, so the real answer can never hide behind the lie."
        }
      },
      {
        heading: "Why this breaks a normal Wordle solver",
        paragraphs: [
          "A standard Wordle solver assumes every tile is true, so a single lie filters out the real answer and leaves only wrong words. That is why Fibble needs its own logic: the candidate filter has to tolerate one contradiction per clue.",
          "The Fibble solver's rule is simple to state and powerful in practice: a word stays alive if, for each clue, it contradicts at most one tile of that clue. Words that contradict two or more tiles of a single clue are eliminated, because a clue can only contain one lie.",
          "Running that rule across several clues narrows the field dramatically. Each new clue must be consistent with the answer except for one position, which is a far tighter constraint than it sounds."
        ]
      },
      {
        heading: "The nine-guess budget buys room to probe",
        paragraphs: [
          "Fibble gives you nine guesses instead of Wordle's six, and that extra room exists precisely because the lies eat information. The solver treats guesses as probes: each turn is designed to either reveal the answer or shrink the ambiguity about which tiles lied.",
          "A well-chosen probe word deliberately uses letters whose verdicts are informative even if one is wrong. Because you get nine turns, you can afford the redundancy of probing a letter twice — a repeated letter whose verdict changes tells you which clue lied.",
          "The solver's ranking reflects this: it scores words by how well they would distinguish the remaining candidates under every possible lie placement, not just under the honest reading."
        ],
        list: {
          title: "How to probe a suspected lie",
          items: [
            "Replay a letter that returned green or yellow in an earlier clue",
            "If the second verdict contradicts the first, one of the two clues lied",
            "Use a word that repeats the contested letter in a different position",
            "Keep probing until exactly one reading remains consistent with every clue",
            "Let the solver show which candidates survive each interpretation"
          ]
        }
      },
      {
        heading: "How the solver tracks every possible truth",
        paragraphs: [
          "The heart of the Fibble solver is its consistency check. For every candidate word in the dictionary, it counts how many tiles of each clue the word contradicts. A candidate survives a clue if that count is zero or one, and it survives the game only if it survives every clue that way.",
          "As clues accumulate, the solver also reasons about where the lies could have been: if a candidate matches a clue exactly except for one flipped position, the solver notes that position as a possible lie site. Across many candidates, the lie sites converge.",
          "By the end of the game, the solver usually has the answer pinned with one clear lie identified per clue — the same information a perfect human player would have deduced by careful cross-checking, but reached in seconds."
        ]
      },
      {
        heading: "The Fibble mindset: trust patterns, not tiles",
        paragraphs: [
          "The biggest mistake Fibble players make is treating a clue as gospel. One tile per clue is wrong by design, so the winning mindset is to look for the interpretation that makes everything else consistent.",
          "The solver embodies that mindset: it never commits to a reading of a clue, it keeps every reading alive until the evidence eliminates it, and it only surfaces candidates that survive all of the surviving readings.",
          "Play with that discipline and Fibble is a puzzle about consistency rather than luck. The lies stop being traps and become just another constraint — the one that makes the game interesting."
        ]
      }
    ],
    faqHeading: "Fibble Solver FAQ",
    faqs: [
      {
        question: "What is Fibble?",
        answer:
          "Fibble is a Wordle variant where every clue contains exactly one deliberately wrong tile. You see the usual green, yellow, and gray verdicts, but one position in each clue is a lie."
      },
      {
        question: "How many lies are in each Fibble clue?",
        answer:
          "Exactly one per clue. The game guarantees one false tile per row, which makes the puzzle solvable: every clue is one correction away from the truth."
      },
      {
        question: "How many guesses do you get in Fibble?",
        answer:
          "Nine guesses, three more than standard Wordle. The extra turns are there to compensate for the information lost to the lies."
      },
      {
        question: "How does the Fibble solver deal with the lies?",
        answer:
          "Instead of trusting any single tile, the solver keeps every word that contradicts at most one tile per clue. A candidate is eliminated only if it contradicts two or more tiles of a single clue."
      },
      {
        question: "Can I beat Fibble without a solver?",
        answer:
          "Yes, by probing: replay contested letters in later guesses and cross-check verdicts. When a repeated letter's verdict changes, one of the clues lied, and the consistent reading eventually pins the answer."
      },
      {
        question: "Does the solver work for every Fibble puzzle?",
        answer:
          "Yes, for any date and word length. Enter each guess and its clue, and the solver maintains the full set of lie-tolerant candidates from start to finish."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/hardle-solver", label: "Hardle Solver" },
      { href: "/warmle-solver", label: "Warmle Solver" },
      { href: "/xordle-solver", label: "Xordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['warmle-solver'] = `  'warmle-solver': {
    key: 'warmle-solver',
    eyebrow: 'Warmle Solver Guide',
    intro:
      "Warmle is the Wordle variant where yellow means something completely different: instead of \"right letter, wrong position,\" a yellow tile means the letter is alphabetically close to the answer letter in that same position. The game literally tells you when you are getting warm. That small rule change turns Warmle into a game about the alphabet — every yellow tile is a directional hint, and a gray tile means the answer letter is far away rather than absent. The Warmle solver applies that logic to a full dictionary, ranking guesses by how much alphabetic distance they reveal. Here is how the mechanic works and how to use it.",
    sections: [
      {
        heading: "Yellow means close, not misplaced",
        paragraphs: [
          "In standard Wordle a yellow tile means the letter exists elsewhere in the word. In Warmle a yellow tile means the letter you guessed is alphabetically near the true letter in the same position — usually within a small distance threshold that the solver lets you set.",
          "That flips the meaning of the board completely. A yellow on the first letter means the answer's first letter is close to yours in the alphabet, not that your letter appears somewhere else.",
          "The practical upshot: a Warmle board reads like a set of five mini-riddles, each one a position where the alphabet has been narrowed to a small window around your guess."
        ],
        callout: {
          title: "Warmth is positional",
          body: "Warmle's yellow is about one position only: it says the true letter in that exact spot sits close to your letter in the alphabet. Use it to walk toward the letter, position by position."
        }
      },
      {
        heading: "Reading the three verdicts in Warmle",
        paragraphs: [
          "Green works exactly as in Wordle: the letter is correct in that position. Yellow means alphabetically close in that same position. Gray means the true letter is far away alphabetically — and crucially, it does not mean the letter is absent from the word.",
          "The gray nuance matters more than any other detail in Warmle. A gray on a common letter like A in the first position tells you the answer's first letter is far from A — toward the other end of the alphabet — but says nothing about whether A appears elsewhere.",
          "Because distance is relative, the same tile means different things depending on your guess. The solver standardizes this by computing, for every candidate word, the exact alphabetic distance between your guessed letter and the candidate's letter at each position."
        ]
      },
      {
        heading: "The distance threshold, and why it matters",
        paragraphs: [
          "Warmle defines \"close\" with a distance threshold — commonly around three or four positions in the alphabet. The Warmle solver exposes that setting so your feedback matches the game's exact rule.",
          "If the game uses a threshold of three, a guessed letter within three alphabet steps of the true letter counts as yellow, and anything farther is gray. Getting the threshold wrong makes every subsequent deduction wrong, which is why the solver lets you tune it.",
          "The threshold also shapes strategy: with a larger threshold, yellow tiles are easy to get but weak as hints; with a smaller one, yellows are rarer but each one pins the letter to a very tight window."
        ],
        list: {
          title: "Warmle clue-reading checklist",
          items: [
            "Green: exact match in that position — lock it",
            "Yellow: the true letter is alphabetically near yours in that spot",
            "Gray: the true letter is alphabetically far — walk the other way",
            "Gray does NOT remove your letter from the word entirely",
            "Match the solver's distance setting to the game's threshold"
          ]
        }
      },
      {
        heading: "How the solver walks the alphabet",
        paragraphs: [
          "The Warmle solver treats each position independently. For every candidate word it computes how your guess's letter compares with the candidate's letter at each position, then keeps only the candidates whose distances match every verdict you entered.",
          "The ranking then rewards guesses that split the alphabet cleanly. A probe letter near the middle of a position's remaining window reveals the most information whether the verdict is yellow or gray.",
          "That is why the solver's suggestions sometimes look like odd words: in Warmle, a word full of mid-alphabet letters in the right positions is far more valuable than a common word with extreme letters."
        ]
      },
      {
        heading: "The winning Warmle strategy",
        paragraphs: [
          "Open with a word that spreads letters across the alphabet rather than clustering them — you want a first clue that tells you about the extremes and the middle of the alphabet at once.",
          "When a position returns yellow, your next guess for that position should be a letter a couple of steps toward where the true letter might be, effectively walking toward it. The solver shows the remaining window for each position, so you always know which direction to walk.",
          "And when a position returns gray, do not waste a guess trying letters near your first choice — jump to the opposite end of the window. Each gray cuts the alphabet in half for that position, which is exactly the elimination the solver counts on."
        ]
      }
    ],
    faqHeading: "Warmle Solver FAQ",
    faqs: [
      {
        question: "What is Warmle?",
        answer:
          "Warmle is a Wordle variant where yellow tiles mean the guessed letter is alphabetically close to the true letter in the same position, rather than meaning the letter is misplaced."
      },
      {
        question: "What does yellow mean in Warmle?",
        answer:
          "Yellow means the answer letter in that exact position is alphabetically near your guessed letter, usually within a small distance threshold. It is a warmth hint, not a misplaced-letter hint."
      },
      {
        question: "What does gray mean in Warmle?",
        answer:
          "Gray means the true letter in that position is alphabetically far from your guess. Unlike Wordle, it does not mean your letter is absent from the word."
      },
      {
        question: "How does the Warmle solver work?",
        answer:
          "It computes the alphabetic distance between your guessed letters and every candidate word's letters at each position, keeps only the candidates consistent with all verdicts, and ranks guesses by how much alphabetic information they would reveal."
      },
      {
        question: "Why is there a distance setting in the solver?",
        answer:
          "The game defines \"close\" with a threshold. The solver's distance setting lets you match that threshold exactly so its deductions line up with the feedback you actually received."
      },
      {
        question: "What is the best Warmle opening?",
        answer:
          "A word whose letters are spread across the alphabet, so your first clue maps the extremes and the middle at once. Clustered letters waste the warmth mechanic."
      }
    ],
    relatedLinks: [
      { href: "/wordle-solver", label: "Wordle Solver" },
      { href: "/hardle-solver", label: "Hardle Solver" },
      { href: "/woodle-solver", label: "Woodle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" }
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
