// Top-up batch 4: final push for the last 17 articles.
// Run with: node scripts/topup-b4.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const SECTIONS = {
  'soundmap-solver': {
    heading: "Soundmap solver settings and daily use",
    paragraphs: [
      "The Soundmap solver is built around the Artist Guesser's clue structure, and a little setup makes it exact. Enter each clue as the game gives it — era, genre, chart peak, nationality, collaborators — and the solver filters the artist pool with every addition.",
      "The clue-stacking discipline is the solver's core lesson. Each clue is a filter, and the order you enter them barely matters — what matters is entering them all before you guess an obscure artist. The solver never guesses without the full clue set, and neither should you.",
      "The daily partnership works best when you guess boldly and check often. Make your move, add the new clue, and let the solver update the pool — the candidate list after clue three is usually short enough to finish.",
      "Finally, use the solver's candidate list as a music-knowledge coach. Reading the artists that survive each filter teaches you the pool's shape — the eras, the genres, the crossover acts — and that awareness makes you faster even without the tool."
    ]
  },
  'colorfle-solver': {
    heading: "Colorfle solver settings and the daily partnership",
    paragraphs: [
      "The Colorfle solver is designed to partner with the daily puzzle. Make your guess, enter the feedback — warmer or cooler, lighter or darker, more or less saturated — and the solver tracks your position in color space and suggests the next move.",
      "The axis discipline is the solver's core lesson. It treats hue, saturation, and lightness as three separate tracks, and it never lets a 'lighter' verdict get lost in a hue argument. Players who copy that discipline — fixing one axis at a time — solve in half the guesses.",
      "The daily partnership works best with bold early moves. The solver's recommendations move big until the axes narrow, and following that rhythm — big directional jumps, then precise refinements — is the fastest path to the daily shade.",
      "Finally, use the solver as a color-theory coach. Watching it navigate the palette teaches you the hue wheel, the saturation scale, and the lightness axis in action — and that understanding makes you faster even without the tool."
    ]
  },
  'worgle-answer-today': {
    heading: "Worgle hint usage and the streak saver",
    paragraphs: [
      "Worgle's hint system exists to save streaks, and the hints on this page are designed for exactly that: the first letter, the word length, and the letter-frequency profile — enough to turn an open pattern into a solvable one.",
      "The first-letter hint is the highest-value rescue. A confirmed starting letter closes half the pattern space instantly, and combined with the length and frequency profile, it usually narrows the pool to a handful of everyday words.",
      "The hint-before-guessing discipline is the lesson. Players who check the hints after two failed guesses save more streaks than players who check them after five — the hints are a nudge, not a crutch, and using them early keeps the solve satisfying.",
      "Finally, the daily reveal is the ultimate streak saver. When the word simply will not come, the reveal settles the day, and the archive keeps the streak history one click away — so no word is ever worth losing a month of solves."
    ]
  },
  'kanoodle-solver': {
    heading: "Kanoodle solver settings and 3D orientation",
    paragraphs: [
      "The Kanoodle solver's 3D orientation handling is its most valuable feature. Pieces can be flipped, rotated, and inverted in space, and the solver explores every orientation — so its solutions often use placements you would never consider by hand.",
      "The orientation lesson is the transferable skill. Kanoodle's hardest puzzles are hard because a piece needs to be flipped in 3D, and watching the solver's solutions teaches you to see those flips — the top-down view that hides a piece's underside, the rotation that changes its footprint.",
      "The solver's backtracking discipline is the second lesson. It places pieces one at a time and retreats the moment a placement blocks completion — and players who copy that willingness to undo solve far more puzzles than players who force a bad piece.",
      "Finally, use the solver as a checker. Arrange your own solution, run the solver, and compare — the divergence is almost always an orientation you missed, and each comparison trains the spatial eye the game rewards."
    ]
  },
  'worldle-solver': {
    heading: "Worldle solver settings and the daily partnership",
    paragraphs: [
      "The Worldle solver is designed to partner with the daily puzzle. Enter your guess and its distance feedback — the kilometers and the direction — and the solver filters the country list to the candidates that match every clue.",
      "The distance-band discipline is the solver's core lesson. It reads 500 kilometers as a neighbor, 5,000 as another continent, and it never wastes a guess on a country the distance has ruled out. Players who copy that discipline solve in half the guesses.",
      "The daily partnership works best with deliberate jumps. The solver's recommendations leap continents when the distance demands it — and following that rhythm, rather than nudging out of habit, is the fastest path to the daily country.",
      "Finally, use the solver as a map-reading coach. Watching it filter by distance and direction teaches you the bands, the arrows, and the border logic in action — and that understanding makes you faster even without the tool."
    ]
  },
  'nerdle-solver': {
    heading: "Nerdle solver settings and operator coverage",
    paragraphs: [
      "The Nerdle solver is built around the equation space, and a little setup makes it precise. Enter the feedback from each guess — green, purple, black — and the solver filters the valid equation list with all eight verdicts at once.",
      "The operator coverage is the solver's core lesson. It knows that plus and minus dominate the equation space while multiply and divide are rarer, and it sweeps the common operators first — the same logic that makes 12+35=47 the community's favorite opener.",
      "The digit census is the second lesson. The solver favors the workhorse digits — 1, 2, 0, and 5 — in its suggestions, because they appear in far more valid equations than 8, 9, or 7.",
      "Finally, use the solver as an equation coach. Watching it filter the space teaches you the form distribution, the character census, and the feedback discipline in action — and that understanding makes you faster even without the tool."
    ]
  },
  'canuckle-answer-today': {
    heading: "Canuckle hints and the Canadian-word streak saver",
    paragraphs: [
      "Canuckle's hint system is generous, and the hints on this page are designed to save streaks: the first letter, the word length, and the Canadian theme category — enough to turn an open pattern into a solvable one.",
      "The theme hint is the highest-value rescue. Knowing the answer is a food, a city, a hockey term, or a uniquely Canadian word closes whole lanes of the vocabulary instantly, and combined with the first letter it usually narrows the pool to a handful of words.",
      "The Canadian-vocabulary discipline is the lesson. Canuckle answers are Canadian words, so the guesses that work are the ones that test Canadian vocabulary — MAPLE, TOQUE, POUTINE — rather than generic Wordle openers.",
      "Finally, the daily reveal is the ultimate streak saver. When the word will not come, the reveal settles the day, and the archive keeps the streak history one click away — so no word is ever worth losing a month of solves."
    ]
  },
  'all-wordle-solver': {
    heading: "Wordle solver glossary and feedback reference",
    paragraphs: [
      "A quick glossary makes the solver — and the game — clearer. Green locks a letter in place; yellow places it in the word but mislocates it; gray bans it entirely. The solver applies all three absolutely, and so should you.",
      "The candidate list is the solver's live dictionary: every word that matches your clues, ranked by likelihood. Reading it after each guess shows you exactly which letters are doing the work and which are still in play.",
      "The opener is your first guess — the information-gathering move that covers the common letters. The midgame is the narrowing phase, where each guess adds constraints. The endgame is the pattern-match, where the pool is short and the most common word usually wins.",
      "Finally, keep the variant in mind. Five-letter daily Wordle, six-letter variants, and multi-board Quordle all share the feedback rules but differ in dictionary size — and the solver adapts to each, exactly as your strategy should."
    ]
  },
  'loldle-solver': {
    heading: "LoLdle solver settings and the champion dictionary",
    paragraphs: [
      "The LoLdle solver is built around the champion roster, and a little setup makes it precise. Enter the attribute feedback — region, role, gender, species, resource — and the solver filters the full champion pool with every clue.",
      "The roster coverage is the solver's core strength. Its champion list includes every region of Runeterra, every role, and every species — so its candidates are always valid answers, and its filtering never misses a champion you have forgotten exists.",
      "The attribute hierarchy is the solver's lesson. It treats region as the strongest filter, then role, then species and gender — and players who copy that hierarchy — locking the region before anything else — solve in half the guesses.",
      "Finally, use the solver as a lore coach. Watching it filter the roster teaches you which champions live in which regions, which roles they play, and which species they belong to — and that knowledge makes you faster even without the tool."
    ]
  },
  'weaver-solver': {
    heading: "Weaver solver settings and the dictionary match",
    paragraphs: [
      "The Weaver solver is most accurate when its dictionary matches the game's. The standard English dictionary is right for the daily puzzle, but themed games — US English, UK English, a restricted word list — benefit from matching the solver's pool to the game's.",
      "The dictionary match matters because Weaver is a graph game: the solver's graph is built from its dictionary, and a graph built from the same words as the game produces ladders that always land. A mismatched dictionary might suggest a rung the game rejects.",
      "The word-length setting is the second adjustment. The daily puzzle is four letters, but the solver handles five- and six-letter ladders too — the graph just gets bigger and the paths longer.",
      "Finally, use the solver's path display as a teaching tool. Seeing the exact chain between two words — the vowel rotations, the consonant swaps, the bridge words — builds the ladder-building intuition that makes you faster even without the tool."
    ]
  },
  'light-out-solver': {
    heading: "Lights Out solver settings and board sizes",
    paragraphs: [
      "The Lights Out solver handles every board size from the classic 5×5 to the 3×3 mini boards and custom layouts. The linear algebra scales perfectly — the equations just get bigger — so the solver's answer is exact on any grid.",
      "The board-size difference is worth understanding. Small boards have fewer possible states, which makes them feel random; large boards have more structure, which makes the chase method more effective. The solver handles both, but your manual strategy should adapt to the size.",
      "The solver's no-solution detection is the honesty feature. Some boards genuinely cannot be solved, and the solver tells you instead of pressing forever — saving you from the classic trap of grinding on an impossible configuration.",
      "Finally, use the solver as a linear-algebra coach. Watching it convert a board into equations and solve them shows you the math behind the game — and that understanding transfers to the puzzle, the classroom, and every future Lights Out you meet."
    ]
  },
  'colorfle-answer-today': {
    heading: "Colorfle hex values and the color-exact culture",
    paragraphs: [
      "The Colorfle answer page's hex values anchor a color-exact culture that the rest of the daily-game world does not have. Where Wordle players say 'it was blue', Colorfle players say 'it was #3B7DD8' — and that precision changes how the community talks about the game.",
      "The hex lets you compare your final guess against the exact target, which is the sharpest possible feedback. A hex comparison shows you precisely where your color intuition drifted — two digits in the green channel, one in the blue — and each comparison sharpens that intuition.",
      "The hex also enables the archive's power. Past answers are recorded as exact values, so the archive is a searchable history of the palette — every color the game has ever chosen, in exact digital form.",
      "Finally, the hex-exact reveal makes the daily check satisfying. Whether you solved in four or needed the reveal, the answer page settles the day with a shade you can match precisely — no more 'close enough' color guessing."
    ]
  },
  'smashdle-solver': {
    heading: "Smashdle solver settings and the roster dictionary",
    paragraphs: [
      "The Smashdle solver is built around the Ultimate roster, and a little setup makes it precise. Enter the attribute feedback — universe, weight, jumps, Final Smash — and the solver filters the full roster with every clue.",
      "The roster coverage is the solver's core strength. Its fighter list includes every universe and every DLC addition — Kazuya, Sephiroth, Sora, Pyra/Mythra — so its candidates are always valid answers, and its filtering never misses a fighter you have forgotten.",
      "The mode awareness is the solver's second strength. It works across Classic, Emoji, Silhouette, Final Smash, and Kirby Copy — because the underlying roster logic is the same, only the clue type changes.",
      "Finally, use the solver as a roster coach. Watching it filter the fighters teaches you which universes hold which fighters, which weight classes cluster where, and which Final Smashes belong to whom — and that knowledge makes you faster even without the tool."
    ]
  },
  'worldle-answer-today': {
    heading: "Worldle hints and the geography streak saver",
    paragraphs: [
      "Worldle's hint system is built to save geography streaks, and the hints on this page are designed for exactly that: the continent, the region, and the silhouette description — enough to turn an open map into a solvable one.",
      "The continent hint is the highest-value rescue. Confirming the continent eliminates four-fifths of the map instantly, and combined with the region clue it usually narrows the world to a handful of countries.",
      "The distance-band discipline is the lesson. Reading 500 kilometers as 'a neighbor' and 5,000 as 'another continent' is the skill that separates four-guess solvers from six-guess scramblers — and each daily reveal is a worked example of that skill.",
      "Finally, the daily reveal is the ultimate streak saver. When the silhouette will not resolve, the reveal settles the day, and the archive keeps the streak history one click away — so no country is ever worth losing a month of solves."
    ]
  },
  'countryle-solver': {
    heading: "Countryle solver settings and the map dictionary",
    paragraphs: [
      "The Countryle solver is built around the world map, and a little setup makes it precise. Enter the feedback — continent, distance, neighbor signals — and the solver filters the country list to the candidates that match every clue.",
      "The map coverage is the solver's core strength. Its country list includes every recognized state, from the G20 giants to the island nations, so its candidates are always valid answers and its filtering never misses a country.",
      "The continent-first hierarchy is the solver's lesson. It treats the continent verdict as the strongest filter, then distance bands, then border chains — and players who copy that hierarchy solve in half the guesses.",
      "Finally, use the solver as a geography coach. Watching it filter the map teaches you the continental rhythm, the distance bands, and the neighbor chains in action — and that understanding makes you faster even without the tool."
    ]
  },
  'phrazle-answer-today': {
    heading: "Phrazle hints and the phrase streak saver",
    paragraphs: [
      "Phrazle's hint system exists to save phrase streaks, and the hints on this page are designed for exactly that: the phrase length, the word lengths, and the category — enough to turn an open phrase into a solvable one.",
      "The word-length structure is the highest-value rescue. Knowing the answer is a two-word adjective-noun pair or a three-word idiom closes whole phrase families instantly, and combined with the category it usually narrows the pool to a handful of famous phrases.",
      "The phrase-pool discipline is the lesson. Phrazle draws from famous phrases — idioms, titles, catchphrases — and the guesses that work are the ones that test that pool, not generic word-guessing.",
      "Finally, the daily reveal is the ultimate streak saver. When the phrase will not come, the reveal settles the day, and the archive keeps the streak history one click away — so no phrase is ever worth losing a month of solves."
    ]
  },
  'phoodle-answer-today': {
    heading: "Phoodle hints and the food-word streak saver",
    paragraphs: [
      "Phoodle's hint system is built to save food-word streaks, and the hints on this page are designed for exactly that: the first letter, the word length, and the food category — ingredient, dish, cut, or kitchen verb — enough to turn an open pattern into a solvable one.",
      "The category hint is the highest-value rescue. Knowing the answer is an ingredient rather than a kitchen verb closes whole lanes of the food vocabulary instantly, and combined with the first letter it usually narrows the pool to a handful of words.",
      "The food-lane discipline is the lesson. Phoodle answers are food words, so the guesses that work are the ones that test food vocabulary — STEAK, SPICE, PASTA — rather than generic Wordle openers.",
      "Finally, the daily reveal is the ultimate streak saver. When the food word will not come, the reveal settles the day, and the archive keeps the streak history one click away — so no word is ever worth losing a month of solves."
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

  const block = `      {\n        heading: ${JSON.stringify(section.heading)},\n        paragraphs: [\n${section.paragraphs.map((p) => `          ${JSON.stringify(p)}`).join(',\n')}\n        ]${section.list ? `,\n        list: {\n          title: ${JSON.stringify(section.list.title)},\n          items: [\n${section.list.items.map((i) => `            ${JSON.stringify(i)}`).join(',\n')}\n          ]\n        }` : ''}\n      }`;

  const next = src.slice(0, closeIdx) + block + ',\n' + src.slice(closeIdx);
  src = next;
  await writeFile(registryPath, next);
  count++;
  console.log(`TOPUP ${key}`);
}
console.log(`Total: ${count}`);
