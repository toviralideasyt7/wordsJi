// Adds new static article entries to src/lib/content/registry.ts.
// Run with: node scripts/add-articles.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

// Each entry is a full TS object literal WITHOUT the trailing comma, keyed by route.
// NOTE: all prose strings are DOUBLE-QUOTED so apostrophes need no escaping.
const ENTRIES = {};

ENTRIES['phoodle-answer-today'] = `  'phoodle-answer-today': {
    key: 'phoodle-answer-today',
    eyebrow: 'Phoodle Strategy Guide',
    intro:
      "Phoodle is Wordle with a food twist: every answer is a food-related word, from ingredients to dishes to kitchen verbs. You get six guesses and the same green, yellow, gray feedback. This guide covers how the food-word constraint changes your strategy, why your opener should be different from Wordle's, and how to read the answer for {date} without spoiling the solve.",
    sections: [
      {
        heading: "The food constraint is your biggest advantage",
        paragraphs: [
          "Phoodle's word list is drawn from food vocabulary, which means the answer pool is far smaller than Wordle's. That is not a disadvantage — it is a filter you should exploit. The word must be food-related: an ingredient like SPICE, a dish like PASTA, a cut like STEAK, or a verb like BASTE.",
          "The practical effect is that some guesses that are great in Wordle are wasted in Phoodle. Words like CRANE or SLATE are food-neutral — they tell you nothing about the food lane. A Phoodle opener should bias toward letters that appear in food words: S, T, R, P, C, K, and the vowels.",
          "Once you know the answer is a food word, the candidate list collapses. A pattern like _A_ST_ is far more tractable when you know it is an ingredient or dish than when it could be anything. The constraint narrows the search exactly where Wordle players wish they had one."
        ]
      },
      {
        heading: "The Phoodle answer for {date}",
        paragraphs: [
          "Today's Phoodle answer is the food word for {date}, revealed on this page. Players searching for the Phoodle answer for {date}, today's Phoodle word, or Phoodle hints for {date} will find the answer here, confirmed from the official source.",
          "The answer card at the top shows the word with its food category — ingredient, dish, cut, or kitchen term — so you know exactly which lane the puzzle was testing. The {date} puzzle has one answer, and it is the same word across every mirror of the game.",
          "If you are still solving, the hint card gives you the category, the first letter, and the letter pattern without revealing the word. Finish the solve yourself, then check the reveal when you are ready."
        ],
        callout: {
          title: "The food-lane rule",
          body: "Every Phoodle guess should test letters that live in food vocabulary. SPICE, PASTA, STEAK, and BASTE are the anchors; guessing neutral words wastes the constraint."
        }
      },
      {
        heading: "Phoodle openers that actually help",
        paragraphs: [
          "A strong Phoodle opener covers the letters that dominate food words while staying valid: STEAK, SPICE, and PASTA are the community favorites. STEAK gives you S, T, E, A, K — four letters that appear across ingredients and dishes, plus the K that shows up in BAKED, STOCK, and KITCHEN-adjacent words.",
          "SPICE is the other classic because it tests the C that appears in nearly every food category and the P that shows up in PASTA, PEACH, and PEPPER. One guess, and you have bracketed a huge share of the food dictionary.",
          "The second guess should relocate yellows and test the remaining food-heavy letters. If your opener gave you yellow T and E, follow with a word that moves them while testing R, L, and N — the letters of STEW, ROAST, and LEMON."
        ],
        list: {
          title: "Food letters worth testing early",
          items: [
            "S and T: they open SPICE, STEAK, STEW, STOCK, and dozens more",
            "P and C: PASTA, PEACH, PICKLE, CREAM, CIDER, CUSTARD",
            "K: BAKED, STOCK, KITCHEN, KALE, SOUP-STARTERS",
            "The vowels A and E: they carry most food words",
            "Avoid Q, X, Z in the opener — rare in the food dictionary"
          ]
        }
      },
      {
        heading: "Common Phoodle mistakes",
        paragraphs: [
          "The most common mistake is playing Phoodle like Wordle. The food constraint is a gift, and players who ignore it burn guesses on letters that never appear in food words. Every gray Q, X, or Z you test is a guess the answer pool never needed.",
          "The second mistake is forgetting the kitchen verbs. Phoodle answers are not only ingredients — they include BAKE, BASTE, KNEAD, STEAM, and STIR. Players who only think of foods run out of guesses on verb answers that the constraint should have made obvious.",
          "The third mistake is ignoring the category once it is visible. If the pattern clearly fits an ingredient, stop considering dishes. The solver on this site models the whole food dictionary, which is exactly why its candidates always stay in the right lane."
        ]
      },
      {
        heading: "Practicing Phoodle with the archive",
        paragraphs: [
          "The archive keeps every past Phoodle answer, which makes it the best training ground for the food lane. Replay old puzzles and note which answers were verbs versus ingredients — the mix will surprise you, and knowing it changes your late-game guesses.",
          "A second habit: after each solve, list three other food words that fit the same pattern. It sounds simple, but it trains the brain to think in food-vocabulary, which is exactly what makes early guesses efficient.",
          "Finally, use the solver to check your lane discipline. If the solver's candidates are all food words while yours wander, the gap is your mental dictionary — and it fixes itself with practice."
        ]
      }
    ],
    faqHeading: "Phoodle Questions, Answered",
    faqs: [
      {
        question: "What is the Phoodle answer for {date}?",
        answer:
          "The Phoodle answer for {date} is revealed on this page — it is a food-related word, and it is the same across every source."
      },
      {
        question: "How do you play Phoodle?",
        answer:
          "Guess a five-letter word and get green, yellow, and gray feedback like Wordle, but every answer is food-related — ingredients, dishes, cuts, and kitchen verbs."
      },
      {
        question: "What is the best first word in Phoodle?",
        answer:
          "STEAK and SPICE are the community favorites. They cover the letters that dominate food vocabulary and produce useful feedback for the food lane."
      },
      {
        question: "Are Phoodle answers always food words?",
        answer:
          "Yes — the answer list is food vocabulary only. That includes ingredients, dishes, cuts, and kitchen verbs like BAKE and KNEAD."
      },
      {
        question: "Can I play old Phoodle puzzles?",
        answer:
          "Yes. The archive keeps past answers, and the Phoodle solver works on any of them for practice or verification."
      }
    ],
    relatedLinks: [
      { href: "/phoodle-solver", label: "Phoodle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/phrazle-answer-today", label: "Phrazle Answer Today" },
      { href: "/waffle-answer-today", label: "Waffle Answer Today" },
      { href: "/phoodle-answer-archive", label: "Phoodle Answer Archive" }
    ]
  }`;

ENTRIES['phrazle-answer-today'] = `  'phrazle-answer-today': {
    key: 'phrazle-answer-today',
    eyebrow: 'Phrazle Strategy Guide',
    intro:
      "Phrazle is the daily game where you guess a common phrase instead of a single word — you solve multiple words at once with Wordle-style color feedback, and the daily puzzle runs two sessions: morning and afternoon. This guide covers multi-word guessing, how to read feedback across several words, and the exact answer for {date} when you need it.",
    sections: [
      {
        heading: "Multi-word guessing changes everything",
        paragraphs: [
          "Phrazle replaces the single five-letter target with a phrase of two or three words, and every guess must be a phrase of the same shape. That one change rewrites the strategy: you are no longer hunting letters, you are hunting word boundaries and common collocations.",
          "The feedback still works per letter, but it now spans several words. A yellow letter in word two tells you something different from a yellow in word one, because the phrase structure constrains where words can go. The guess that teaches you the most is often the one that tests a common phrase shape, not the one that tests the most letters.",
          "The practical upshot: vocabulary still matters, but collocation knowledge matters more. Players who read and hear English constantly have an edge that raw word-list memory cannot match, because phrases like 'big deal', 'hard time', and 'first thing' are the answer pool."
        ]
      },
      {
        heading: "The Phrazle answer for {date}",
        paragraphs: [
          "Today's Phrazle answers for {date} — both the morning and afternoon sessions — are revealed on this page. Players searching for the Phrazle answer for {date}, today's Phrazle, or the Phrazle morning and afternoon answers will find both phrases here, confirmed from the official source.",
          "The answer cards at the top show each session's phrase separately, so you can check the morning puzzle without spoiling the afternoon one. Both answers are the same across every mirror of the game.",
          "If you are still solving the morning session, the hint card gives you the phrase length, the first word, and the key letters without revealing the whole phrase."
        ],
        callout: {
          title: "Two sessions, two answers",
          body: "Phrazle runs morning and afternoon puzzles every day. {date} has both answers on this page — check the session you are playing, not the other one."
        }
      },
      {
        heading: "How to guess a phrase before you know the words",
        paragraphs: [
          "The opening move in Phrazle is not a clever phrase — it is a structural probe. Guess a phrase that fills common word slots: a two-word opener like 'large tree' or 'first time' tests the most common letters across both positions, and the feedback tells you which word carries the action.",
          "Once one word starts resolving, use its letters to disambiguate the phrase type. A green first letter with a common article position points to a two-word collocation, while a mid-sentence structure points to a three-word idiom. The phrase shape is half the puzzle.",
          "The solver on this page does the heavy lifting by modeling common phrases: it filters the phrase dictionary by your feedback and ranks candidates by how much they narrow the field. Its top suggestion on turn three is usually the actual phrase, because collocations resolve fast once the shape is known."
        ],
        list: {
          title: "Phrase shapes that resolve quickly",
          items: [
            "Article + noun: 'the end', 'a lot', 'the way'",
            "Adjective + noun: 'big deal', 'new year', 'hard time'",
            "Verb + noun: 'make sense', 'take care', 'give up'",
            "Two-word idioms: 'right now', 'all day', 'good luck'",
            "Three-word idioms: 'by the way', 'in the end', 'out of time'"
          ]
        }
      },
      {
        heading: "Common Phrazle mistakes",
        paragraphs: [
          "The most common mistake is playing it like Wordle and guessing single words, which the game rejects — every guess must match the phrase shape. Players waste their first two turns learning this and spend the rest catching up.",
          "The second mistake is ignoring common small words. Articles, prepositions, and pronouns carry most phrases, and guessing 'the' early is not a waste — it resolves the phrase structure faster than any content word.",
          "The third mistake is fixating on the content word while the glue words stay unknown. A phrase like 'in the end' is solved by its structure, not its nouns. The solver demonstrates this every game: its guesses prioritize phrase shape over raw letter coverage."
        ]
      },
      {
        heading: "Practicing Phrazle for faster solves",
        paragraphs: [
          "The archive keeps both sessions for past days, which makes it the best place to learn phrase patterns. Replay a week of puzzles and note how often the answer was a two-word collocation you already knew — the game is recognition, not recall.",
          "A second habit: after each solve, write down the phrase shape. A few weeks of this and you will see the same skeletons repeating, which makes your first guesses dramatically better.",
          "Finally, use the solver to check your structure reads. If the solver suggests a phrase shape you did not see, that is the gap in your collocation intuition — and it closes fast with practice."
        ]
      }
    ],
    faqHeading: "Phrazle Questions, Answered",
    faqs: [
      {
        question: "What is the Phrazle answer for {date}?",
        answer:
          "Phrazle runs two sessions daily. The {date} answers — morning and afternoon — are both revealed on this page."
      },
      {
        question: "How do you play Phrazle?",
        answer:
          "Guess a phrase that matches the puzzle's word structure. Each guess returns green, yellow, and gray feedback per letter, and you solve all the words of the phrase within the guess limit."
      },
      {
        question: "What is the best first guess in Phrazle?",
        answer:
          "A structural probe like 'first time' or 'large tree' — a common phrase shape that tests the most frequent letters across both word positions."
      },
      {
        question: "Does Phrazle have two puzzles a day?",
        answer:
          "Yes. Phrazle publishes a morning and an afternoon session, each with its own phrase and its own answer."
      },
      {
        question: "Can I play past Phrazle puzzles?",
        answer:
          "Yes. The archive keeps both sessions for past days, and the Phrazle solver works on any of them."
      }
    ],
    relatedLinks: [
      { href: "/phrazle-solver", label: "Phrazle Solver" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/waffle-answer-today", label: "Waffle Answer Today" },
      { href: "/phrazle-answer-archive", label: "Phrazle Answer Archive" }
    ]
  }`;

ENTRIES['canuckle-answer-today'] = `  'canuckle-answer-today': {
    key: 'canuckle-answer-today',
    eyebrow: 'Canuckle Strategy Guide',
    intro:
      "Canuckle is Canada's daily word game — same green, yellow, gray feedback as Wordle, but the answer pool is Canadian English, which means spelling differences and hockey-adjacent vocabulary show up more than you expect. You also get a Canadian fact with every puzzle. This guide covers the spelling differences that trip up non-Canadians and the answer for {date}.",
    sections: [
      {
        heading: "The Canadian-English pool changes your guess list",
        paragraphs: [
          "Canuckle answers come from Canadian English, which shares most of its vocabulary with American English but carries real differences: colour-style spellings, hockey and geography words, and everyday terms that lean British. The pool is smaller than Wordle's, and that is the lever.",
          "The spelling differences matter most. Canadian English keeps the U in colour, flavour, and honour, and uses -re endings in words like centre and theatre. If your pattern shows a possible -OR or -ER ending, consider the Canadian variant — it may be the difference between the answer and a rejected guess.",
          "The game also leans into Canadian culture: hockey terms, provinces, and uniquely Canadian words appear more often than random chance would suggest. Players who know the pool spend fewer guesses on words that would be strong Wordle guesses but weak Canuckle ones."
        ]
      },
      {
        heading: "The Canuckle answer for {date}",
        paragraphs: [
          "Today's Canuckle answer for {date} is revealed on this page. Players searching for the Canuckle answer for {date}, today's Canuckle, or the Canuckle word of the day will find the answer here, confirmed from the official source, along with the daily Canadian fact.",
          "The answer card at the top shows the word, its puzzle number, and the fact the game attached to it — the fact is a fun check that you found the right source. The {date} puzzle has one answer, and it is the same across every mirror of the game.",
          "If you are still solving, the hint card gives you the Canadian angle — whether the word leans hockey, geography, spelling, or everyday vocabulary — without revealing the answer."
        ],
        callout: {
          title: "The U-in-colour rule",
          body: "When a pattern could end in -OR or -ER, test the Canadian spelling first. ColouR-style answers appear often enough to matter, and the solver models the Canadian pool exactly."
        }
      },
      {
        heading: "Openers tuned for the Canuckle pool",
        paragraphs: [
          "The best Canuckle openers overlap with Wordle but bias toward Canadian vocabulary: STARE and CRANE still work, but adding a C early pays off because Canadian words lean on C (CANADA, CANOE, COAST, CAPITAL). An opener like SCARE tests C, S, A, R, E in one shot.",
          "The second guess should probe the Canadian markers: a U, an H, or a K. Words like TOUGH or MOUNT test the spellings and hockey-adjacent vocabulary that distinguish the pool. One early probe saves the late-game confusion that costs non-Canadian players their streaks.",
          "The key is to treat Canuckle as its own game, not as Wordle with a flag. The feedback rules are identical; the answer pool is not. Players who internalize that difference solve in five guesses instead of missing at six."
        ],
        list: {
          title: "Canadian markers worth probing early",
          items: [
            "C: appears across Canada-themed answers and everyday words",
            "U: colour, flavour, honour — the spelling difference that matters",
            "H: hockey, harvest, harbour, and other H-heavy answers",
            "K: skating-adjacent and short Canadian words",
            "Skip Q, X, Z until the pattern demands them"
          ]
        }
      },
      {
        heading: "Common Canuckle mistakes",
        paragraphs: [
          "The most common mistake is guessing American spellings. If the pattern fits both 'flavor' and 'flavour', the Canadian pool almost always wants the U version — and players who insist on the American spelling burn the final guess.",
          "The second mistake is ignoring the fact. The daily Canadian fact is a clue, not decoration: a hockey fact points to a hockey-adjacent word, a geography fact points to a province or landmark. The solver treats the fact as part of the input, and you should too.",
          "The third mistake is over-correcting. Not every answer is hockey or a U-word — most Canuckle answers are ordinary English words shared with Wordle. The Canadian bias sharpens your odds; it does not replace the standard wordplay."
        ]
      },
      {
        heading: "Practicing Canuckle with the archive",
        paragraphs: [
          "The archive keeps every past Canuckle answer, and replaying it is the fastest way to learn the pool. Note which answers were Canadian-specific versus shared vocabulary — the ratio will sharpen your opener choices.",
          "A second habit: after each solve, check whether an American spelling of the answer exists. Words with both spellings are the single biggest source of Canuckle losses, and listing them builds the exact mental map the game rewards.",
          "Finally, use the Canuckle solver to verify your pool read. If the solver's candidates are Canadian words while yours wandered into American-English territory, you have found the gap — and the fix is just familiarity."
        ]
      }
    ],
    faqHeading: "Canuckle Questions, Answered",
    faqs: [
      {
        question: "What is today's Canuckle answer?",
        answer:
          "Today's Canuckle answer for {date} is revealed on this page, with the daily Canadian fact. It is the same word across every source."
      },
      {
        question: "How do you play Canuckle?",
        answer:
          "Same rules as Wordle — six guesses, green/yellow/gray feedback — but the answer pool is Canadian English, including U-spellings and Canadian culture words."
      },
      {
        question: "What is the best first word in Canuckle?",
        answer:
          "SCARE is a strong opener because it tests C, S, A, R, E — covering the Canadian C-bias and the most common letters in one guess."
      },
      {
        question: "Does Canuckle use American or British spellings?",
        answer:
          "Canadian English, which keeps the U in colour and flavour and uses -re endings in words like centre. The differences matter more than most players expect."
      },
      {
        question: "Can I play past Canuckle puzzles?",
        answer:
          "Yes. The archive keeps past answers and facts, and the solver works on any of them."
      }
    ],
    relatedLinks: [
      { href: "/canuckle-solver", label: "Canuckle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/worgle-answer-today", label: "Worgle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/canuckle-answer-archive", label: "Canuckle Answer Archive" }
    ]
  }`;

ENTRIES['worldle-answer-today'] = `  'worldle-answer-today': {
    key: 'worldle-answer-today',
    eyebrow: 'Worldle Strategy Guide',
    intro:
      "Worldle shows you a country's silhouette and asks you to guess it from the shape alone, with direction and distance hints after each guess. Today's Worldle country is {country}. This guide covers silhouette reading, the distance-and-direction system, and how to cut your average solve from eight guesses to four.",
    sections: [
      {
        heading: "The silhouette is the first and best clue",
        paragraphs: [
          "Worldle's opening move is pure geography: one country's outline, no name, and six guesses to identify it. The silhouette is more informative than players think — coastlines, peninsulas, and border shapes are the fingerprint of a country, and the strongest players read those features before touching the map.",
          "Start with the shape's biggest features. Is the silhouette long and thin like Chile or Norway? Is it compact and landlocked like Austria? Does it have a distinctive peninsula, an island chain, or a gulf? Two or three shape features usually narrow the world to a handful of candidates.",
          "The game's own hint system — the direction arrow and distance in kilometers — takes over after the first guess. But the players who win in four guesses are the ones who used the silhouette to make that first guess count, so the distance hint lands in the right region."
        ]
      },
      {
        heading: "The Worldle answer for {date}",
        paragraphs: [
          "Today's Worldle country is {country}, the answer for {date}. Players searching for the Worldle answer for {date}, today's Worldle country, or the Worldle solution will find it here, confirmed from the official source.",
          "The answer card at the top shows the country, its flag, and its region, so you can verify your silhouette read and check which feature should have given it away. The {date} puzzle has one answer, and it is the same country across every mirror of the game.",
          "If you are still solving, the hint card gives you the region, the direction from your current guess, and the silhouette features — enough to close in without the full reveal."
        ],
        callout: {
          title: "Shape over name",
          body: "Worldle rewards reading the outline before the map. Chile, Norway, and Italy have signatures; learn the silhouettes and the distance hints do the rest."
        }
      },
      {
        heading: "The distance-and-direction system, decoded",
        paragraphs: [
          "After each guess, Worldle tells you the direction from your guess to the answer and the distance in kilometers. Together they are a vector: direction says which way to move on the map, distance says how far. A single good guess gives you a vector, and two guesses give you a triangulation.",
          "The direction arrow points from your guessed country toward the target. If you guess France and the arrow points east with a distance under a thousand kilometers, the answer is a neighboring eastern country — Germany, Switzerland, or Italy territory.",
          "Distance bands matter as much as the numbers. Under 500 kilometers means a neighbor; 500 to 2,000 means the same region; over 5,000 means another continent. Reading the band before the exact number saves the mental math and speeds every solve.",
          "The Worldle solver on this site automates the triangulation: enter your guesses with their distances and directions, and it ranks every country by how well it matches all your readings. Its top candidate is the answer more often than not."
        ],
        list: {
          title: "The distance bands to memorize",
          items: [
            "Under 500 km: the answer shares a border or a small sea with your guess",
            "500–2,000 km: same region, possibly across one or two borders",
            "2,000–5,000 km: same continent, different region",
            "Over 5,000 km: another continent entirely — triangulate with a second guess"
          ]
        }
      },
      {
        heading: "Common Worldle mistakes",
        paragraphs: [
          "The most common mistake is guessing famous countries instead of useful ones. A large central country like Kazakhstan or Algeria returns a cleaner vector than a famous island like Iceland, because the distance reading from a central landmass points more precisely at the target.",
          "The second mistake is ignoring the silhouette once the game starts. The outline is available the whole game, and players who switch to pure map-guessing abandon the one clue that never changes.",
          "The third mistake is over-thinking the exact kilometers. The game's distances are great-circle approximations, and the numbers move with every guess. Read the band, not the digits, and the solver will confirm the same habit."
        ]
      },
      {
        heading: "Practicing Worldle into real geography",
        paragraphs: [
          "Worldle is the best silhouette teacher on the internet, and the archive makes it a drill. Replay past puzzles and try to name the country from the outline alone before looking at the hints — a minute of pure shape-reading per day compounds fast.",
          "A second habit: after each solve, draw the country's shape from memory the next morning. Players who do this develop a mental atlas of coastlines, and the daily silhouette starts answering itself.",
          "Finally, use the solver to check your vector reads. If the solver triangulates to the answer while your guesses wandered, the gap is distance-band intuition — and it closes within a week of deliberate practice."
        ]
      }
    ],
    faqHeading: "Worldle Questions, Answered",
    faqs: [
      {
        question: "What is today's Worldle answer?",
        answer:
          "Today's Worldle country is {country}. It is the answer for {date}, and it is the same country across every source."
      },
      {
        question: "How do you play Worldle?",
        answer:
          "Guess a country from its silhouette. After each guess the game shows the direction and distance to the answer, and you narrow it down within six guesses."
      },
      {
        question: "What is the best first guess in Worldle?",
        answer:
          "A large central country like Kazakhstan, Algeria, or Brazil. Central guesses return cleaner distance vectors than famous edge countries."
      },
      {
        question: "What do the distance numbers mean?",
        answer:
          "They are the great-circle distance from your guessed country to the answer. Read them as bands — under 500 km means a neighbor, over 5,000 km means another continent."
      },
      {
        question: "Can I play old Worldle puzzles?",
        answer:
          "Yes. The archive keeps past answers and silhouettes, and the Worldle solver works on any of them."
      }
    ],
    relatedLinks: [
      { href: "/worldle-solver", label: "Worldle Solver" },
      { href: "/globle-answer-today", label: "Globle Answer Today" },
      { href: "/countryle-answer-today", label: "Countryle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/worldle-answer-archive", label: "Worldle Answer Archive" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" }
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
