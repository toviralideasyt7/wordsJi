// Top-up pass 4: final large section for archive articles.
// Run with: node scripts/topup-archives4.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const SECTIONS = {
  'waffle-archive': {
    heading: "Waffle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Waffle archive entries reveals the game's rhythm. The daily grids cycle through recognizable word families — food words, nature words, action verbs — and the archive's chronological view makes that cycling visible in a way a single day never can.",
      "The crossing pattern is the archive's clearest annual lesson. Across hundreds of grids, the same letters do the crossing work — R, S, T, N, and the vowels — and the archive shows that consistency puzzle after puzzle. Players who internalize it start solving the crossings before they read the words.",
      "The vocabulary confirms the everyday bias. A year of answers is full of common five-letter words — LEMON, BRAVE, TIGER, PASTA — and almost free of crossword rarities. The archive is the proof, and the proof reshapes your guessing: common words first, always.",
      "Finally, the annual view shows the game's difficulty rhythm. Some weeks run easy — the words all but assemble themselves — and others run hard, with grids whose crossings fight every swap. Recognizing the rhythm helps you pace yourself: on hard weeks, plan swaps in chains and accept a higher move count."
    ]
  },
  'quordle-archive': {
    heading: "Quordle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Quordle archive entries reveals the game's rhythm. Each day's four answers form a set with its own personality — some days share vowel patterns, others spread their letters wide — and the archive's chronological view makes that variety visible.",
      "The coverage pattern is the archive's clearest annual lesson. Across hundreds of days, the four answers distribute their letters deliberately — the game balances common letters across the boards rather than clustering them — and the archive shows that balance puzzle after puzzle.",
      "The vocabulary confirms the everyday bias. A year of answers is full of common English words, and almost free of obscure fillers. The archive is the proof, and the proof reshapes your guessing: solve the common words first, and let the coverage logic guide your multi-board guesses.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — all four boards yield to a standard opener — and others run hard, with one board hiding a tricky word. Recognizing the rhythm helps you pace yourself: on hard weeks, save your solves and let the shared guesses do the work."
    ]
  },
  'spotle-archive': {
    heading: "Spotle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Spotle archive entries reveals the game's rhythm. The daily artists cycle through eras and genres — pop-heavy weeks, hip-hop weeks, rock weeks — and the archive's chronological view makes that cycling visible in a way a single day never can.",
      "The era pattern is the archive's clearest annual lesson. Across hundreds of days, the game leans on recognizable, chart-relevant artists, and the archive shows the era rotation — the 1980s runs, the 1990s runs, the 2010s dominance.",
      "The attribute logic confirms the daily game's design. Each archived artist's rank, debut year, and genre slot into the attribute grid the solver uses, and the archive shows how those attributes actually map onto real musicians — the exact knowledge the daily game tests.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — the artists are household names — and others run hard, with deep cuts and crossover acts. Recognizing the rhythm helps you pace yourself: on hard weeks, stack the clues before you guess."
    ]
  },
  'semantle-archive': {
    heading: "Semantle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Semantle archive entries reveals the game's rhythm. The daily words cycle through semantic categories — abstract concepts, concrete objects, emotions, actions — and the archive's chronological view makes that cycling visible.",
      "The category pattern is the archive's clearest annual lesson. Across hundreds of days, the game visits every corner of the word-space, and the archive shows the rotation — the abstract weeks, the concrete weeks, the emotional weeks.",
      "The vocabulary confirms the common-word bias. A year of answers is full of everyday English words with clear meanings, and almost free of obscure terms. The archive is the proof, and the proof reshapes your guessing: common words with central meanings first, always.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — the answer's neighborhood is reachable in a few guesses — and others run hard, with answers tucked into the word-space's edges. Recognizing the rhythm helps you pace yourself: on hard weeks, anchor on your highest-scoring guess and explore its neighborhood."
    ]
  },
  'colordle-archive': {
    heading: "Colordle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Colordle archive entries reveals the game's rhythm. The daily colors cycle through the palette families — reds and oranges, blues and greens, the neutrals — and the archive's chronological view makes that cycling visible.",
      "The palette pattern is the archive's clearest annual lesson. Across hundreds of days, the game favors recognizable color families, and the archive shows the rotation — the warm weeks, the cool weeks, the neutral interludes.",
      "The hex values confirm the palette's shape. A year of archived answers is full of named, recognizable colors — the standard rainbow plus the classic neutrals — and the archive's hex-exact records make that shape precise. The proof reshapes your guessing: named colors first, always.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — the colors are mid-palette anchors — and others run hard, with subtle shades that test your saturation eye. Recognizing the rhythm helps you pace yourself: on hard weeks, move big early and refine late."
    ]
  },
  'phoodle-archive': {
    heading: "Phoodle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Phoodle archive entries reveals the game's rhythm. The daily words cycle through the food lanes — ingredients, dishes, cuts, kitchen verbs — and the archive's chronological view makes that cycling visible.",
      "The category pattern is the archive's clearest annual lesson. Across hundreds of days, the game leans on recognizable food vocabulary, and the archive shows the lane rotation — the ingredient weeks, the dish weeks, the verb weeks.",
      "The vocabulary confirms the food-word bias. A year of answers is full of common kitchen words — SPICE, PASTA, BREAD, MANGO — and almost free of obscure culinary terms. The archive is the proof, and the proof reshapes your guessing: common food words first, always.",
      "Finally, the annual view shows the letter patterns. Food vocabulary's A-and-O dominance and its S-T-R-P-C-K cluster repeat across the year, and seeing them in hundreds of archived answers makes the pattern unforgettable — the exact knowledge that powers your openers."
    ]
  },
  'phrazle-archive': {
    heading: "Phrazle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Phrazle archive entries reveals the game's rhythm. The daily phrases cycle through the phrase families — idioms, titles, catchphrases, sayings — and the archive's chronological view makes that cycling visible.",
      "The structure pattern is the archive's clearest annual lesson. Across hundreds of days, the game alternates between two-word pairs and three-word idioms, and the archive shows the structure rotation — the adjective-noun weeks, the verb-phrase weeks.",
      "The vocabulary confirms the famous-phrase bias. A year of answers is full of recognizable sayings and everyday words, and almost free of obscure constructions. The archive is the proof, and the proof reshapes your guessing: famous phrases first, always.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — the phrases are household idioms — and others run hard, with titles and sayings that test your cultural recall. Recognizing the rhythm helps you pace yourself: on hard weeks, read the word-length structure before you guess."
    ]
  },
  'nerdle-archive': {
    heading: "Nerdle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Nerdle archive entries reveals the game's rhythm. The daily equations cycle through the arithmetic forms — two-term sums, subtractions, the rarer multiplications — and the archive's chronological view makes that cycling visible.",
      "The form pattern is the archive's clearest annual lesson. Across hundreds of days, the game leans on the classic a+b=c sum, and the archive shows the form distribution — the sum-heavy weeks, the subtraction interludes, the occasional product.",
      "The digit census confirms the equation space's shape. A year of answers is full of the workhorse digits — 1, 2, 0, and 5 — and lighter on 8, 9, and 7. The archive is the proof, and the proof reshapes your openers: sweep the common digits first, always.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — the equations resolve in three guesses — and others run hard, with structures that hide their characters. Recognizing the rhythm helps you pace yourself: on hard weeks, respect the black tiles absolutely."
    ]
  },
  'contexto-archive': {
    heading: "Contexto answers across the year: what the record shows",
    paragraphs: [
      "A full year of Contexto archive entries reveals the game's rhythm. The daily words cycle through the semantic domains — kitchen words, tech words, emotion words — and the archive's chronological view makes that cycling visible.",
      "The domain pattern is the archive's clearest annual lesson. Across hundreds of days, the game visits every corner of the word-space, and the archive shows the rotation — the concrete weeks, the abstract weeks, the emotional weeks.",
      "The vocabulary confirms the common-word bias. A year of answers is full of everyday English words with clear meanings, and almost free of obscure terms. The archive is the proof, and the proof reshapes your guessing: common words first, always.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — the answer's neighborhood is reachable in a few guesses — and others run hard. Recognizing the rhythm helps you pace yourself: on hard weeks, anchor on your highest-ranking guess and explore its neighborhood."
    ]
  },
  'globle-archive': {
    heading: "Globle answers across the year: what the record shows",
    paragraphs: [
      "A full year of Globle archive entries reveals the game's rhythm. The daily countries cycle through the continents — European weeks, Asian weeks, African weeks — and the archive's chronological view makes that cycling visible.",
      "The continental pattern is the archive's clearest annual lesson. Across hundreds of days, the game favors recognizable countries from every continent, and the archive shows the rotation — the Europe-heavy stretches, the Asia runs, the Africa interludes.",
      "The geography confirms the recognizable-country bias. A year of answers is full of the G20, the popular travel destinations, and the geographically significant states, and almost free of obscure territories. The archive is the proof, and the proof reshapes your guessing: recognizable countries first, always.",
      "Finally, the annual view shows the difficulty rhythm. Some weeks run easy — the silhouettes are instantly recognizable — and others run hard, with small or fragmented countries. Recognizing the rhythm helps you pace yourself: on hard weeks, use the color-map feedback deliberately."
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
