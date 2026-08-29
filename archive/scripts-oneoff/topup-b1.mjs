// Top-up batch 1: append one unique section to each of the shortest articles.
// Run with: node scripts/topup-b1.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

// key -> new section (inserted before faqHeading)
const SECTIONS = {
  'colorfle-solver': {
    heading: "Colorfle hint patterns worth memorizing",
    paragraphs: [
      "Veteran Colorfle players learn to read the game's verdicts in pairs. 'Warmer and lighter' together almost always means the answer lives in the yellow-orange corner of the wheel; 'cooler and darker' points at the blues and deep greens. When saturation is also moving, the answer is usually a vivid accent color rather than a neutral.",
      "The single most useful pattern to recognize is the near-miss: a guess that comes back with every axis correct except one small push, like 'just a touch lighter'. That verdict is the game telling you to nudge one axis a single step — and the answer is almost always the exact shade your guess becomes after that nudge.",
      "A second pattern that catches everyone is the complementary trap. Two guesses that both return 'wrong direction' can still be on opposite sides of the target, so the solver's axis tracking matters more than your intuition about where the palette 'feels' warm. Trust the numbers: each verdict moves the search, and the solver shows you the cumulative picture that your short-term memory loses after three guesses.",
      "The final habit worth building is treating the palette like a map with landmarks. Mid-blue, mid-green, and mid-red are the three anchors most players can reason from, and every other shade is a step from one of them. When you know your guess is 'two steps warmer than mid-blue', you are thinking like the solver — and the answer is never far away."
    ],
    list: {
      title: "Verdict pairs and what they mean",
      items: [
        "Warmer + lighter → the yellow-orange family",
        "Cooler + darker → the blue-green family",
        "Lighter + less saturated → a pastel near the center of the wheel",
        "Darker + more saturated → a deep accent color"
      ]
    }
  },
  'soundmap-solver': {
    heading: "The music knowledge that wins Soundmap",
    paragraphs: [
      "Soundmap's Artist Guesser is won in the margins of music knowledge: debut decades, genre homes, and the collaborators who define an artist's sound. The players who solve fastest are the ones who can say 'this clue set describes someone who blew up in the 2010s with a pop-rap crossover' and start naming candidates from that description alone.",
      "Build your mental index around eras first. Every decade has a short list of defining acts — the 1980s have their stadium giants, the 1990s their alterna-rock icons, the 2000s their pop machine. When a clue names a decade, your first guess should come from that era's shortlist, not from a name you happen to like.",
      "Genre crossovers are the next layer. An artist described as 'country with pop production' or 'hip-hop with rock guitar' narrows the field dramatically, because crossover acts are rarer than pure genre acts. The solver's filter handles these overlaps precisely, but your recognition of 'this sounds like a crossover act' is what makes the top candidate click.",
      "Collaborators are the final, sharpest clue. When a hint names a producer, a duet partner, or a label family, you are usually one step from the answer. Learning the common collaborator pairs — the super-producers and their signature artists — turns the last clue from a hint into a reveal."
    ]
  },
  'countryle-solver': {
    heading: "Geography facts that shortcut every solve",
    paragraphs: [
      "A handful of geography facts collapse most Countryle puzzles before they start. Landlocked countries cluster in recognizable bands — Central Asia, the Sahel, the Andean interior — so a landlocked hint points at a region, not a mystery. Archipelagos are their own world: Indonesia, the Philippines, and Japan are answer-sized and unmistakable once the feedback says 'island nation'.",
      "The equator is your best friend. Countries straddling it — Ecuador, Kenya, Indonesia, Brazil — are central guesses whose feedback divides the map into clean north and south hemispheres. If your first guess hugs the equator and the answer is elsewhere, the distance reading tells you which hemisphere to flee to.",
      "Borders are the endgame weapon. Once you are within a thousand kilometers, the fastest play is to list the neighbors of your last guess and pick the one the direction arrow favors. Players who memorize border chains — Brazil's ten neighbors, Germany's nine, the DRC's nine — turn the last phase of every solve into a formality.",
      "Finally, remember the shape of the feedback itself: a small distance with a consistent direction almost always means a direct neighbor, while a medium distance with a shifting direction means the answer is a few countries over. Reading that distinction separates players who solve in four guesses from players who wander to six."
    ]
  },
  'searchle-solver': {
    heading: "Real search patterns the game mirrors",
    paragraphs: [
      "Searchle's mystery queries are modeled on real Google autocomplete, which means they follow patterns you already know from the search box. Question queries start with 'how to', 'what is', 'when did', or 'why do'; comparison queries lean on 'best', 'top', or 'vs'; local queries add 'near me' or a city name. Naming the pattern is half the solve.",
      "The second pattern is specificity creep. Real users start broad and refine — 'pasta' becomes 'pasta recipe' becomes 'easy pasta recipe for dinner'. Searchle rewards the same progression: if your broad guess ranks low, the target is probably one or two modifiers deeper than you are.",
      "The third pattern is the value of verbs. Search phrases with action verbs — 'make', 'cook', 'fix', 'learn', 'buy' — are more common than noun-only queries, and the game's ranking system rewards matching those verbs exactly. A guess that swaps 'make' for 'cook' can jump a dozen positions.",
      "The final pattern is time. Trending queries, seasonal searches, and year-stamped phrases ('best phone 2026') all show up as targets because they are what people actually type. When the topic feels current, add the year or the season to your guess and watch the rank climb."
    ]
  },
  'worgle-answer-today': {
    heading: "What to do when today's Worgle is hard",
    paragraphs: [
      "Every daily-word player hits the wall: a Worgle answer that refuses to emerge from your constraint set. The first rescue move is to stop guessing and list. Write down the confirmed letters, the positions that are ruled out, and the letters you know are absent — then read the list as a pattern and brainstorm five-letter words that fit it.",
      "The second move is to test a deliberately common word even if it feels unlikely. Daily puzzles favor everyday vocabulary, and a word you consider 'too boring' is often exactly right. If your confirmed letters are A, R, and E with R in position two, the answer is probably a familiar word like GRAPE or BRAVE, not a crossword rarity.",
      "The third move is to use the hint system deliberately. The first letter is the highest-value hint because it turns an open pattern into a closed one — 'starts with B, contains A and R' is a puzzle, while 'contains A and R' is a needle in a haystack.",
      "And when the streak is on the line, remember that the reveal is not a failure. Checking today's answer after a genuine attempt teaches you the word list's tendencies — which vowels pair, which letters repeat, how often the answer is an everyday verb — and those lessons make tomorrow's solve faster."
    ]
  },
  'searchle-answer-today': {
    heading: "How the daily Searchle prompt works",
    paragraphs: [
      "Each day's Searchle puzzle pairs a prompt — the start of a Google autocomplete phrase — with the answer that completes it. Understanding the prompt-answer relationship is the real skill: the prompt sets the topic and the intent, and the answer is the word or phrase the search engine actually completes it with.",
      "The best players read the prompt like a sentence fragment and predict the most likely completion. 'how to make' most often completes with a food or craft; 'what is the best' completes with a product category or destination; 'why is my' completes with a problem and its object. Genre-guessing the completion is the fastest route to the answer.",
      "The prompt also tells you the answer's part of speech. A prompt ending in 'the' wants a noun; one ending in 'to' wants a verb; one ending in 'my' wants a noun-phrase. Watching that grammatical slot narrows the answer from the entire dictionary to a single part of speech.",
      "When you are stuck, work the other direction: think of famous completions for the prompt, then check which one feels like something thousands of people actually search. The daily answer is almost always a high-volume, recognizable completion — the kind of phrase that appears in autocomplete drop-downs everywhere."
    ]
  },
  'narutodle-solver': {
    heading: "Naruto roster knowledge that solves fast",
    paragraphs: [
      "Narutodle rewards knowing the ninja world's organization chart. The villages are the biggest filter — Konoha holds the main cast, Suna holds the sand siblings, Kiri the swordsmen, Kumo the jinchuriki hosts — so associating a village with its famous shinobi lets you jump straight to the right neighborhood.",
      "Clans are the next layer of shorthand. Uchiha, Uzumaki, Hyuga, Nara, Akimichi, and Inuzuka each have a handful of members, and knowing which clan belongs to which village collapses the candidate list immediately. A green clan verdict with a known village is often a one-guess solve.",
      "Rank is the coarse tier everyone forgets. Genin, Chunin, Jonin, Kage, and the special classes like Anbu split the roster into clear bands, and confirming the rank eliminates everyone outside it. Players who never consider rank are missing a filter that works on every single puzzle.",
      "Finally, keep the era in mind. Characters from Part I, Shippuden, and the Boruto era are distinct sets, and a 'debut era' hint — when the game gives one — halves the roster before any other attribute. The solver tracks all of it, but your recognition of 'this is an old-school Part I character' makes the final guess feel effortless."
    ]
  },
  'waffle-solver': {
    heading: "Why Waffle answers hide in plain sight",
    paragraphs: [
      "Waffle puzzles feel harder than they are because the grid scrambles your word vision: six words share twelve crossing letters, so every tile is part of two words at once. The way out is to read the grid as six word slots instead of sixty tiles — pick a row, ignore its crossings for a moment, and ask which five-letter word the letters almost spell.",
      "The crossing letters are actually your biggest hint. A letter that sits at a junction belongs to both an across word and a down word, so a letter that 'looks wrong' for the row is probably correct for the column — and fixing it fixes both. Expert players treat crossings as anchors, not obstacles.",
      "Vocabulary is the quiet advantage. Waffle uses common words, but the crossing constraints can hide words you know: 'LEMON' becomes invisible when its L is shared with a down word you have not solved. Read the grid aloud as possible words, and the hidden ones surface.",
      "Finally, use the move economy. Waffle scores your minimum swaps, so before you move a tile, trace where its replacement comes from. A swap that fixes a row but breaks a column is a wash; a swap that fixes both is gold. The solver plans these chains — and once you start planning them too, your scores drop fast."
    ]
  },
  'onepiecedle-solver': {
    heading: "The One Piece roster, organized for solving",
    paragraphs: [
      "OnePieceDle is won by knowing the pirate world's structure, not by reciting trivia. The biggest divide is crew: the Straw Hats, the Marines, the Yonko crews, the Seven Warlords, and the revolutionary army are the five buckets most answers fall into, and naming the bucket with your first guess is half the puzzle.",
      "Within the Straw Hats alone, the roles are a fast filter: captain, swordsman, navigator, cook, doctor, shipwright, musician, archeologist, and sniper. A green crew verdict plus a yellow role verdict usually leaves two or three candidates from the ten-person crew — and one more attribute finishes it.",
      "The Marines and the Yonko crews reward a different kind of knowledge: hierarchy. Knowing that the Admirals, the Vice Admirals, and the Yonko commanders form named ranks lets you use a 'rank' hint to jump straight to the right tier of the organization.",
      "Finally, arcs are the timeline filter. A character's debut arc — East Blue, Alabasta, Skypiea, Water 7, Marineford, Dressrosa, Wano — places them in the story, and confirming the arc eliminates every character who appeared later. Players who know the arc order solve obscure characters in half the guesses."
    ]
  },
  'pokedle-solver': {
    heading: "Pokémon facts that end Pokedle quickly",
    paragraphs: [
      "Pokedle rewards the kind of Pokédex knowledge that sits at the intersection of type and shape. The fastest players think in type families first: the starters, the fossil lines, the legendaries, the Eeveelutions each form recognizable groups, and a confirmed type plus a generation hint usually lands inside one of those groups.",
      "Height and weight are the underused precision tools. Most players know that Onix is tall and Snorlax is heavy, but the game's yellow windows make the numbers precise: a yellow height is a band, not a vibe. When the solver says the answer is within a few centimeters of your guess, the candidate list is down to a handful of similar-sized Pokémon.",
      "Evolution stage is the cleanest binary you are ignoring. Basic, middle, and final forms split the dex into three bands, and confirming the stage eliminates two-thirds of all Pokémon in one verdict. Players who check stage early solve faster than players who only chase types.",
      "Finally, remember that regional forms and cross-generation evolutions exist. A hint that fits a Kanto Pokémon might actually point at its Hisuian or Galarian form — the solver's dex includes all of them, and knowing they exist keeps you from discarding the right answer."
    ]
  },
  'framed-answer-today': {
    heading: "Films that appear in Framed again and again",
    paragraphs: [
      "Framed's daily answer pool favors films with instantly recognizable frames — and knowing which movies those are is the single biggest edge. Iconic opening shots, famous locations, and distinctive color palettes make certain films appear more often than their box office would suggest.",
      "The pattern is strongest with auteur directors. Wes Anderson's symmetrical compositions, Tarantino's trunk shots, Nolan's IMAX cityscapes, and the Coens' wide establishing frames are all visually distinctive enough to identify from a single frame — and Framed leans on them.",
      "Period and genre films are also over-represented, because their production design makes frames unmistakable: a 1970s police procedural, a 1950s musical, or a sci-fi film with a signature spaceship interior identifies itself faster than a modern drama with neutral lighting.",
      "When the first frame stumps you, name the era and the genre out loud before you guess. A film with film grain, vintage cars, and period costumes is almost certainly a classic — and once you know it is a classic, the answer is usually a famous title you have seen a dozen times, just not in the last five minutes."
    ]
  },
  'dotadle-solver': {
    heading: "Dota hero knowledge that ends the game early",
    paragraphs: [
      "Dotadle is solved by knowing the hero pool's skeleton: the primary attributes, the lanes, and the eras. Strength heroes cluster in the initiators and the durable cores; agility heroes own the carries and the attack-speed scaling; intelligence heroes dominate the supports and the nukers. Naming the attribute narrows the pool by a third instantly.",
      "Lane identity is the next filter. Safe lane, mid, off, and roaming each have a recognizable cast — the mids are the flashy spellcasters, the offs are the tanky disruptors, the safes are the farm-heavy carries. A lane verdict with a confirmed attribute usually leaves a short list.",
      "Release era is the fine discriminator that players forget. The original Dota roster, the early Dota 2 additions, and the modern patch heroes are distinct generations, and a year hint — when the game gives one — places the hero in time before any other attribute is confirmed.",
      "Finally, melee versus ranged is the cleanest binary in the game, and it is the attribute players enter last. A quick melee check halves the remaining pool, and combining it with attribute and lane usually produces the answer by guess four."
    ]
  },
  'phoodle-solver': {
    heading: "Food vocabulary every Phoodle player needs",
    paragraphs: [
      "Phoodle's answer pool runs deeper than ingredients — it includes dishes, cuts, herbs, kitchen verbs, and food adjectives — and the players who solve fastest are the ones who can brainstorm in every lane. When your pattern fits an ingredient, think SPICE, STOCK, and STEAK; when it fits a dish, think PASTA, TACOS, and BREAD; when it fits a verb, think BASTE, BRAISE, and BROIL.",
      "The vowel structure of food words is your quiet ally. Food vocabulary is heavy on A and O — PASTA, TACOS, MANGO, BANANA — and light on the double-E constructions common in abstract words. A pattern with two A's is almost certainly an ingredient or dish, not a concept.",
      "Herbs and spices are the sneaky winners. Words like CUMIN, THYME, SAGE, and OREGANO are common answers, and they test the letters — C, M, Y — that generic openers never cover. A clue that includes a rare consonant usually points at this lane.",
      "Finally, remember the kitchen verbs and adjectives. BAKE, FRY, STEAM, SPICY, TART, and SAVORY all appear, and players who only brainstorm nouns miss a whole slice of the pool. The solver includes the full food vocabulary — and once you start listing verbs too, your solves speed up noticeably."
    ]
  },
  'countryle-answer-today': {
    heading: "Reading Countryle feedback like a map reader",
    paragraphs: [
      "Countryle's feedback is pure cartography: distance, direction, and borders. The players who solve fastest read the numbers like a map reader rather than a gamer — a 2,000-kilometer reading with a northeast arrow means 'same continent, northern half', and the answer is usually a country you can name from that band alone.",
      "The continent check is the biggest lever. Most Countryle formats tell you when you are on the right continent, and honoring that single verdict — switching continents the moment you are wrong — is worth more than any other habit. Players who stay in their home region out of comfort lose two or three guesses every puzzle.",
      "Borders are the endgame. Once you are inside a thousand kilometers, the fastest play is neighbor logic: list the countries bordering your last guess and pick the one the arrow favors. The distance band around a border chain is tiny, and a neighbor confirmation is effectively a solve.",
      "Finally, learn the shape of the answer pool. Countryle answers skew toward recognizable countries — the G20, the popular travel destinations, the geopolitically significant states — not the obscure microstates. When you are guessing between a famous country and an obscure one, the famous one wins almost every time."
    ]
  },
  'word-ladder-solver': {
    heading: "Word ladder classics and the routes between them",
    paragraphs: [
      "Every word-ladder player has their favorite transformations: COLD to WARM, LOVE to HATE, MORE to LESS, BLACK to WHITE. The routes between these classics teach the transferable skills — the near-neighbor lists, the bridge words, the dead-end traps — that make every other ladder faster.",
      "The classic COLD-to-WARM route passes through CORD, WORD, WORM, and WARM, and the lesson is vowel rotation: stepping through the vowels (O to A, and the U-O pair) is the most common way ladders move. Watch the vowel of every rung, and the next step usually reveals itself.",
      "The other transferable trick is consonant chains. Words like LOVE, LORE, MORE, MODE, MADE chain through single-consonant swaps, and the same chain structure appears in dozens of ladders. When you are stuck, try changing the first letter, then the last, then the middle — the consonants rotate more freely than the vowels.",
      "Finally, learn which words are dead ends. Words with unusual letter patterns — QUIZ, JINX, ZANY — have almost no neighbors, and stepping onto them traps you. Good ladder-builders route around the rare-letter words and save them for the final approach, exactly as the solver's graph search does."
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
  // find the section array close: "    ],\n    faqHeading:" — insert before the closing of sections array
  const faqIdx = src.indexOf('faqHeading:', start);
  if (faqIdx === -1) { console.log(`NO FAQ ${key}`); continue; }
  // find the last "    ]," before faqIdx
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
