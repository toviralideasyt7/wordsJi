// Top-up pass 2: second substantial section for archive articles.
// Run with: node scripts/topup-archives2.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const SECTIONS = {
  'waffle-archive': {
    heading: "Replaying the archive: the minimal-swap trainer",
    paragraphs: [
      "The Waffle archive is the best minimal-swap trainer in the genre, because every archived grid is a puzzle you can replay with move-count goals. Load an old date, set a target — can you solve it in fewer swaps than your last attempt? — and the archive becomes a personal practice mode.",
      "The crossing logic is what replaying teaches. Every archived grid shows how the six words share their letters, and replaying the same grid a second time reveals the crossings you missed the first pass — the junctions where fixing one word fixed another.",
      "The vocabulary vision is the second benefit. Waffle grids favor common five-letter words, and replaying archived grids builds the ability to see those words in scrambled rows — the 'almost LEMON' recognition that makes the daily game faster.",
      "Finally, the archive lets you study the game's construction. Browsing how across and down words interlock across hundreds of grids shows you the letters the game uses as crossings — R, S, T, N, and the vowels — and knowing the crossings reshapes your swaps from the first move."
    ]
  },
  'quordle-archive': {
    heading: "Replaying the archive: the multi-board trainer",
    paragraphs: [
      "The Quordle archive is the best multi-board trainer in the genre, because every archived day is a four-board challenge you can replay with the daily guess economy. Load an old date, cover the answers, and practice solving all four boards in nine guesses or fewer.",
      "The shared-vowel logic is what replaying teaches. Quordle's four daily answers often share vowel patterns, and replaying archived days shows you how a vowel-heavy opener helps multiple boards at once — the coverage thinking that separates good Quordle players from great ones.",
      "The coverage balance is the second benefit. Replaying archived days trains you to choose guesses that narrow the most boards, not just the board you are closest to — the multi-board priority the solver uses and the archive makes visible.",
      "Finally, the archive lets you study the answer-selection habits. Browsing hundreds of days of four-answer sets shows you how the game balances letter coverage across the boards, and that understanding reshapes your opener choices from the first guess."
    ]
  },
  'spotle-archive': {
    heading: "Replaying the archive: the attribute trainer",
    paragraphs: [
      "The Spotle archive is the best attribute-reading trainer in the genre, because every archived day is an artist puzzle you can replay with the ten-guess economy. Load an old date and try to identify the artist from the same rank, debut-year, genre, country, and group-size clues the daily game gives.",
      "The attribute logic is what replaying teaches. Every archived artist shows you how rank, era, and genre map onto real musicians, and replaying builds the mental index — which artists debuted when, which genres they live in, which countries they come from — that makes the daily game faster.",
      "The clue-stacking discipline is the second benefit. Replaying archived days trains you to act on the first clue immediately and stack the rest before guessing obscure artists — the discipline that separates fast solvers from wanderers.",
      "Finally, the archive lets you study the selection habits. Browsing the artist history shows you which eras and genres the game favors, and that knowledge lets you pre-load the right era before the first clue lands."
    ]
  },
  'semantle-archive': {
    heading: "Replaying the archive: the similarity trainer",
    paragraphs: [
      "The Semantle archive is the best similarity-reading trainer in the genre, because every archived day is a word puzzle you can replay with the same scoring system. Load an old date and try to reach the mystery word using the similarity scores, exactly as the daily game works.",
      "The compass logic is what replaying teaches. Every archived word shows you which guesses scored high and which scored low, and replaying builds the semantic intuition — which word families cluster, which categories the game favors — that makes the daily game faster.",
      "The high-score anchor discipline is the second benefit. Replaying archived days trains you to anchor on your highest-scoring guess and explore its semantic neighborhood, rather than jumping between unrelated guesses — the discipline that separates fast solvers from random walkers.",
      "Finally, the archive lets you study the selection habits. Browsing the word history shows you the abstract-versus-concrete rhythm, and that knowledge lets you pre-load the right category before the first guess lands."
    ]
  },
  'colordle-archive': {
    heading: "Replaying the archive: the palette trainer",
    paragraphs: [
      "The Colordle archive is the best palette-reading trainer in the genre, because every archived day is a color puzzle you can replay with the same component logic. Load an old date and try to reach the color using the green-yellow-gray feedback, exactly as the daily game works.",
      "The palette logic is what replaying teaches. Every archived color shows you the exact shade with its hex value, and replaying builds the palette knowledge — which families the game favors, which neutrals it mixes in — that makes the daily game faster.",
      "The hex-exact discipline is the second benefit. Every archived answer is recorded precisely, so replaying lets you compare your final guess against the exact target and see precisely where your color intuition drifted.",
      "Finally, the archive lets you study the day-number system. Browsing the color history shows you how the puzzles are numbered and cross-referenced, and that knowledge makes the community-style searches — 'colordle day 1441 answer' — work directly."
    ]
  },
  'phoodle-archive': {
    heading: "Replaying the archive: the food-lane trainer",
    paragraphs: [
      "The Phoodle archive is the best food-vocabulary trainer in the genre, because every archived day is a food-word puzzle you can replay with the same feedback rules. Load an old date and try to solve the word using the green-yellow-gray tiles, exactly as the daily game works.",
      "The food-lane logic is what replaying teaches. Every archived word shows you the ingredient, dish, cut, or kitchen verb that was the answer, and replaying builds the vocabulary — which lanes the game favors, which letters dominate food words — that makes the daily game faster.",
      "The category discipline is the second benefit. Replaying archived days trains you to brainstorm in the right food lane — ingredient versus dish versus verb — rather than guessing generically, the discipline that separates fast solvers from wanderers.",
      "Finally, the archive lets you study the letter patterns. Browsing the word history shows you the vowel-heavy structure of food vocabulary — the A and O dominance, the S-T-R-P-C-K cluster — and that knowledge reshapes your openers from the first guess."
    ]
  },
  'phrazle-archive': {
    heading: "Replaying the archive: the phrase trainer",
    paragraphs: [
      "The Phrazle archive is the best phrase-recognition trainer in the genre, because every archived day is a multi-word puzzle you can replay with the same word-by-word feedback. Load an old date and try to solve the phrase exactly as the daily game works.",
      "The phrase-pool logic is what replaying teaches. Every archived answer shows you the idiom, title, or catchphrase that was the solution, and replaying builds the recognition — which phrase families the game favors, which structures repeat — that makes the daily game faster.",
      "The word-length discipline is the second benefit. Replaying archived days trains you to read the phrase structure — the two-word adjective-noun pairs, the three-word idioms — before guessing a single letter, the discipline that separates fast solvers from scramblers.",
      "Finally, the archive lets you study the vocabulary. Browsing the phrase history shows you the common words the game favors, and that knowledge reshapes your guessing from the first word."
    ]
  },
  'nerdle-archive': {
    heading: "Replaying the archive: the equation trainer",
    paragraphs: [
      "The Nerdle archive is the best equation-solving trainer in the genre, because every archived day is an eight-character equation you can replay with the same green-purple-black feedback. Load an old date and try to solve it exactly as the daily game works.",
      "The equation-space logic is what replaying teaches. Every archived answer shows you the equation's structure — the two-term sums, the operator choices, the equals-sign split — and replaying builds the intuition that makes the daily game faster.",
      "The feedback discipline is the second benefit. Replaying archived days trains you to respect the green-purple-black verdicts absolutely — never reusing a banned digit, always relocating a purple character — the discipline the solver enforces and the archive reinforces.",
      "Finally, the archive lets you study the digit census. Browsing the equation history shows you which digits and operators recur, and that knowledge reshapes your opener choices from the first guess."
    ]
  },
  'contexto-archive': {
    heading: "Replaying the archive: the ranking trainer",
    paragraphs: [
      "The Contexto archive is the best ranking-reading trainer in the genre, because every archived day is a word puzzle you can replay with the same ranking feedback. Load an old date and try to reach the mystery word using the ranking numbers, exactly as the daily game works.",
      "The compass logic is what replaying teaches. Every archived word shows you which guesses ranked high and which ranked low, and replaying builds the semantic intuition — which domains the game favors, which words cluster — that makes the daily game faster.",
      "The anchor discipline is the second benefit. Replaying archived days trains you to anchor on your highest-ranking guess and explore its semantic neighborhood, rather than jumping between unrelated guesses — the discipline that separates fast solvers from random walkers.",
      "Finally, the archive lets you study the domain rhythm. Browsing the word history shows you the kitchen-words, tech-words, emotion-words rotation, and that knowledge lets you pre-load the right domain before the first guess lands."
    ]
  },
  'globle-archive': {
    heading: "Replaying the archive: the geography trainer",
    paragraphs: [
      "The Globle archive is the best geography trainer in the genre, because every archived day is a country puzzle you can replay with the same color-map feedback. Load an old date and try to reach the country using the distance-to-color gradient, exactly as the daily game works.",
      "The map-reading logic is what replaying teaches. Every archived country shows you the color gradient your guesses produced, and replaying builds the distance-to-color intuition — the green-is-close, red-is-far mapping that makes the daily game faster.",
      "The continent-first discipline is the second benefit. Replaying archived days trains you to lock the continent with your first guess and switch the moment the feedback says you are wrong, the discipline that separates four-guess solvers from six-guess scramblers.",
      "Finally, the archive lets you study the continental rhythm. Browsing the country history shows you which continents the game visits week to week, and that knowledge lets you pre-load the right region before the first guess lands."
    ]
  },
};

let src = await readFile(registryPath, 'utf8');

let count = 0;
for (const [key, section] of Object.entries(SECTIONS)) {
  const needle = `'${key}': {\n    key: '${key}'`;
  const start = src.indexOf(needle);
  if (start === -1) { console.log(`MISS ${key}`); continue; }
  if (src.includes(section.heading)) { console.log(`SKIP ${key}: already topped up`); continue; }
  const faqIdx = src.indexOf('faqHeading:', start);
  if (faqIdx === -1) { console.log(`NO FAQ ${key}`); continue; }
  const closeIdx = src.lastIndexOf('    ],', faqIdx);
  if (closeIdx === -1 || closeIdx < start) { console.log(`NO CLOSE ${key}`); continue; }

  const block = `      {\n        heading: ${JSON.stringify(section.heading)},\n        paragraphs: [\n${section.paragraphs.map((p) => `          ${JSON.stringify(p)}`).join(',\n')}\n        ]\n      }`;

  const next = src.slice(0, closeIdx) + block + ',\n' + src.slice(closeIdx);
  src = next;
  await writeFile(registryPath, next);
  count++;
  console.log(`TOPUP ${key}`);
}
console.log(`Total: ${count}`);
