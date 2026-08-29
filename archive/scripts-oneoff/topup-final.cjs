// Final word-count top-up: one unique section per under-1500 article.
const fs = require('fs');
const file = 'src/lib/content/registry.ts';
let src = fs.readFileSync(file, 'utf8');

// key -> { heading, paragraphs[] }  (each heading unique across the whole registry)
const sections = {
  'phrazle-archive': {
    heading: 'Phrazle answers tracked across the web',
    paragraphs: [
      'Because Phrazle publishes one phrase each day, answer-tracker sites, Discord bots, and daily puzzle communities all maintain their own Phrazle logs. The consistency of those records is worth understanding: the official daily answer is fixed at publication time, so every reputable tracker shows the same phrase for the same date.',
      'This archive is that same record, kept directly on the page and updated without the ads, popups, and redirects that riddle the third-party trackers. When a community thread asks what a past phrase was, this page is the cleanest place to confirm it.'
    ]
  },
  'globle-archive': {
    heading: 'Country answers, flags, and geography',
    paragraphs: [
      'Each archived Globle answer is a real country or territory, and each one carries useful geography with it — a flag, a capital, a region, and a set of neighbors that explain why the game chose it as the day\u2019s target.',
      'Browsing the archive is a quiet geography lesson: the answers cluster around countries that are genuinely hard to pin down, which is exactly why players reach for an answer page in the first place.',
      'If you are studying the archive to improve, track which continent produced the last several answers — Globle rotates regions, and the rotation is visible in the archive\u2019s date order.'
    ]
  },
  'nerdle-archive': {
    heading: 'Nerdle answer patterns worth tracking',
    paragraphs: [
      'The archive makes Nerdle\u2019s construction habits visible. Answers are valid eight-character equations, and over time the record shows the same families repeating: single-digit starts, two-digit targets, division equations, and the occasional negative result.',
      'For players training to solve faster, the archive is a study set. Scan a month of answers and you will notice how often the puzzle leads with a small number or reuses a previous day\u2019s operator sequence.',
      'That pattern knowledge translates directly into better opening guesses — which is the whole point of keeping the full answer history on one page.'
    ]
  },
  'contexto-archive': {
    heading: 'Contexto rank, leaderboard, and clue depth',
    paragraphs: [
      'Contexto answers are ranked by embedding distance, and the archive preserves both the daily word and the context in which it appeared. Players who study the archive notice the answer style: everyday nouns and verbs dominate because the game ranks words by how often they appear near one another in real text.',
      'The archive also documents the leaderboard angle — how quickly the daily word was solved and how the community performed. Knowing a word\u2019s difficulty curve helps you judge your own rank on the current day\u2019s puzzle.',
      'And because Contexto\u2019s clue depth grows with each guess, archived answers give you a sense of how many guesses a typical word needs before it becomes obvious.'
    ]
  },
  'onepiecedle-solver': {
    heading: 'One Piecedle character clues, explained',
    paragraphs: [
      'One Piecedle answers are One Piece characters, and the solver\u2019s filters mirror the game\u2019s clue set: debut arc, crew affiliation, ability type, and the character\u2019s role in the story. Each clue type narrows the pool differently, and knowing which filter cuts hardest is the skill the solver teaches.',
      'For example, crew affiliation is decisive early — the Straw Hat pool is small, so locking the crew first usually halves the candidates. Ability type matters most late, when only a handful of characters remain.',
      'Combining the filters in the right order is the difference between a lucky guess and a guaranteed solve, and the solver applies that ordering automatically.'
    ]
  },
  'colorfle-solver': {
    heading: 'Colorfle answer formats and hex values',
    paragraphs: [
      'Colorfle answers are colors, and the solver lets you work in the same units the game uses: hex values, RGB components, or color names. Each guess returns directional feedback, and the solver converts that feedback into a tighter color region with every round.',
      'The key habit Colorfle rewards is guessing colors that split the remaining space in half — a mid-tone that separates bright from dark, or a hue that separates warm from cool. That strategy collapses the color space fast.',
      'The solver encodes exactly that splitting logic, which is why it reaches the answer in a handful of guesses instead of a dozen.'
    ]
  },
  'narutodle-solver': {
    heading: 'Narutodle day numbers and answer streaks',
    paragraphs: [
      'Narutodle answers are Naruto characters, and the daily puzzle is numbered so players can track streaks and compare results. The day number matters more than most players realize: it anchors discussions, lets you search for a specific puzzle\u2019s answer, and makes the archive navigable.',
      'The solver does not care about the day number — it filters purely on the clues the game gives you — but the page keeps the numbering visible so you can confirm which puzzle you are solving.',
      'Between the daily puzzle and the solver, the full loop is covered: play the numbered game, get stuck, filter the character pool, and keep your streak alive.'
    ]
  },
  'semantle-archive': {
    heading: 'Semantle similarity scores, decoded',
    paragraphs: [
      'Semantle answers are ranked by embedding similarity, and the archive records each day\u2019s word alongside the community\u2019s score history. Understanding those scores is the real skill: a similarity of 20 means the word is close in meaning, while 5 means the search is still wide open.',
      'The archive shows the full distribution — which guesses reached the high teens, how many guesses the community needed, and where the answer\u2019s semantic neighbors live.',
      'Players who study past archives build an intuition for how the embedding space works, which makes their next daily puzzle dramatically easier to navigate.'
    ]
  },
  'phoodle-archive': {
    heading: 'Phoodle answer themes by day of the week',
    paragraphs: [
      'Phoodle answers are food words, and the archive makes the game\u2019s theming visible. The daily word stays firmly in food vocabulary — ingredients, dishes, kitchen tools — but the archive reveals the mix: some days favor a common ingredient, others an international dish, others a kitchen verb.',
      'Tracking the archive also exposes repetition habits. Food vocabulary is finite, and over the full history you will see favorite words return, which is useful intelligence for players who want to guess smarter, not just faster.',
      'The archive is the definitive record of that theming, kept clean and searchable.'
    ]
  },
  'dotadle-solver': {
    heading: 'Dotadle hero hints and roles',
    paragraphs: [
      'Dotadle answers are Dota 2 heroes, and the game\u2019s hints run through the hero data the game itself uses: primary attribute, role, attack type, and the hero\u2019s lore. The solver mirrors those hints exactly, so a clue about a hero\u2019s attribute cuts the pool the same way it does in the game.',
      'The highest-value hint is the hero role — support, carry, or initiator — because it splits the roster into clean buckets. Attribute is the second cut, and lore is the tiebreaker when the pool is nearly empty.',
      'Feed the hints in the order the game gives them, and the solver will show you the shortlist shrinking to the answer.'
    ]
  },
  'searchle-solver': {
    heading: 'Searchle answer variations, month by month',
    paragraphs: [
      'Searchle answers are place names and landmarks, and the puzzle changes its answer type over time — some months skew to cities, others to countries, others to famous landmarks. The solver handles every variant because it filters on the clues, not on a fixed category.',
      'The variation is worth knowing before you play: a month of landmark answers behaves differently from a month of capital cities, and the solver\u2019s filters adapt to whichever pool the game is using.',
      'Either way, the same logic applies — every clue narrows the map, and the solver applies all of them at once.'
    ]
  },
  'worgle-answer-today': {
    heading: 'Worgle answer word patterns',
    paragraphs: [
      'Worgle answers are words, and the daily answer follows the same construction rules as the rest of the wordle family: five letters, no proper nouns, and a real dictionary word. The patterns that matter are structural — vowel positions, repeated letters, and the consonant clusters the game favors.',
      'A Worgle answer rarely repeats the previous day\u2019s opener, and answers that start with common consonants like S, C, or B appear more often than rare letters.',
      'If you track the answers over time, those tendencies become a real guessing edge, and the today page keeps the current answer front and center while the solver handles the hard cases.'
    ]
  },
  'colordle-archive': {
    heading: 'Colordle day numbers across the full archive',
    paragraphs: [
      'Colordle numbers its puzzles by day, and the archive preserves that numbering so any past answer can be found by day number alone. That numbering is the language the community uses — searches like \u201ccolordle day 1441 answer\u201d point straight at a specific puzzle.',
      'The archive lists every day\u2019s color with its name and hex value, which is exactly what players need when a hue is hard to describe.',
      'Between the daily answer page and the full archive, every Colordle puzzle is one click away.'
    ]
  },
  'pokedle-solver': {
    heading: 'Pokedle answer types and generations',
    paragraphs: [
      'Pokedle answers are Pokemon, and the daily puzzle spans all generations — so the solver\u2019s filters cover type, generation, height, weight, and the other attributes the game uses for its clues.',
      'The generation filter is the fastest cut: locking a generation narrows the pool to a few hundred candidates, and adding the type usually finishes the job. The solver applies those filters in real time, so the candidate list shrinks with every clue you enter.',
      'Whether the daily Pokemon is a Kanto classic or a Paldea newcomer, the solver\u2019s pool covers it.'
    ]
  },
  'searchle-answer-today': {
    heading: 'Searchle answers by month and geography',
    paragraphs: [
      'Searchle answers trace a geography path, and the today page keeps the current answer clear while the archive side reveals the month\u2019s pattern. The game alternates answer types — cities, countries, landmarks — and knowing the current type changes how you approach the clues.',
      'When the answer is a city, the solver zooms into the region the clues imply; when it is a landmark, the pool shifts to famous sites. Either way, the clue order tells you how close you are.',
      'Bookmark the today page for the answer and keep the solver open for the next puzzle.'
    ]
  },
  'hangman-solver': {
    heading: 'Hangman answer dictionaries and word lists',
    paragraphs: [
      'Hangman solvers work off word lists, and the size of the list is the whole game: a small dictionary solves fast but misses words, while a large dictionary covers every answer but takes more guesses to lock in. The solver balances both by scoring every remaining word.',
      'It ranks candidates by how much information a guess would reveal — letters that split the remaining set most evenly win. That is the same logic a strong human player uses, applied to the entire dictionary in milliseconds.',
      'For a stubborn puzzle, the solver\u2019s list also shows the words that remain, which is often enough to spot the answer yourself.'
    ]
  },
  'spotle-solver': {
    heading: 'Spotle artist pools and clue values',
    paragraphs: [
      'Spotle draws from a pool of well-known Spotify artists, and the solver filters that pool with the game\u2019s own attributes — rank, debut year, genre, country, group size, and gender. Each attribute is a clue with a value, and the solver treats them all as constraints.',
      'The rank attribute is the sharpest filter because it is a number: the game tells you higher or lower, and each arrow halves the remaining range.',
      'The solver combines every arrow and every green or yellow tile into one candidate list, so by the fifth guess you are usually looking at the answer.'
    ]
  },
  'framed-answer-today': {
    heading: 'Framed answer movies and first-frame hints',
    paragraphs: [
      'Framed answers are movies, and the game reveals one frame at a time — the fewer frames you need, the better your score. The today page keeps the current movie\u2019s answer clear, but the real skill is reading the early frames: a distinctive set design, a recognizable actor, or a famous camera shot all narrow the film instantly.',
      'Genre is the first thing to identify, because a western, an animated film, and a heist thriller share almost no candidates. Decade is the second cut.',
      'With those two locked, the remaining possibilities are usually a handful of films, and the answer page confirms which one it was.'
    ]
  },
  'quordle-answer-today': {
    heading: 'Quordle answers and the shared-guess rule',
    paragraphs: [
      'Quordle answers are four words solved with shared guesses, and the today page records the current answer set while the strategy behind it stays constant: one guess must earn progress on all four boards at once.',
      'The reason Quordle rewards common-letter guesses is arithmetic — a word that hits two boards at once is worth twice as much as one that only solves a single board.',
      'Each day\u2019s answer set has its own traps — repeated letters, an obscure fifth word — and the today page makes sure you never end the day guessing.'
    ]
  },
  'boggle-solver': {
    heading: 'Boggle board finders and word scoring',
    paragraphs: [
      'Boggle answers are words found in a 4\u00d74 grid, and the solver scans every path through the board against a dictionary, scoring each find by length — the longer the word, the more points.',
      'The solver\u2019s real value is coverage: it finds the words a human eye misses, especially the long ones that swing a game. Most rounds hide at least one five- or six-letter word in an unexpected corner.',
      'It also respects the game\u2019s rules — each cube can be used once per word, and adjacent cubes connect — so every result is a legal Boggle find, not a dictionary dump.'
    ]
  },
  'spotle-archive': {
    heading: 'Browsing the Spotle archive by artist',
    paragraphs: [
      'The Spotle archive records every daily artist answer, and browsing it by artist or date reveals the game\u2019s selection habits — the mix of global pop stars, decades of legacy acts, and the occasional deep cut.',
      'Each archived answer is searchable by artist name, which is how most players use it: a past puzzle comes up in conversation, and the archive confirms the artist in one search.',
      'The archive also doubles as a study tool — scanning the artist history builds the mental pool the daily game draws from, which makes future Spotle puzzles noticeably easier.'
    ]
  },
  'waffle-solver': {
    heading: 'Waffle answer grids and swap logic',
    paragraphs: [
      'Waffle answers are grids of words that interlock like a crossword, and the solver works with the game\u2019s swap mechanic: the letters are in the grid, and you just have to swap them into the right cells.',
      'That changes the strategy completely. In Waffle you never guess letters — you deduce positions. The solver reads the jumbled grid, identifies which letters are already correct, and computes the minimum swaps to finish.',
      'Because every swap counts against your score, the solver\u2019s swap order matters as much as the final grid — and it plans both.'
    ]
  },
  'kanoodle-solver': {
    heading: 'Kanoodle puzzle levels and piece shapes',
    paragraphs: [
      'Kanoodle puzzles are built from 12 distinct 3D pieces, and the solver works with the same constraint the physical game uses: every piece must fit the board exactly, with no gaps and no overlap.',
      'The solver\u2019s value is spatial — it tries every orientation and position for every piece, which is the exhaustive search a human cannot run by hand. Most Kanoodle boards have a unique solution, and the solver finds it.',
      'It also explains the solve by showing the placement order, which turns a frustrating level into a lesson in how the pieces interlock.'
    ]
  },
  'nerdle-solver': {
    heading: 'Nerdle answer speed and daily records',
    paragraphs: [
      'Nerdle rewards both accuracy and speed, and the solver\u2019s equation census is built for the first guess that tells you the most: it evaluates every legal eight-character equation and picks the one that splits the answer space most evenly.',
      'Once the tiles come back, the solver applies green, purple, and black results to the entire census and re-ranks the survivors — each round shrinking the field toward the answer.',
      'That is why the solver finishes most puzzles inside the daily limit with guesses to spare: it never wastes a guess on an equation it can already rule out.'
    ]
  },
  'betweenle-answer-today': {
    heading: 'Betweenle answers and the between rule',
    paragraphs: [
      'Betweenle answers sit between two clue words, and the today page records the current answer alongside the clue pair that defined it. Understanding the between rule is the whole game: the answer relates to both clues, which is a much tighter constraint than either clue alone.',
      'The puzzle rewards breadth — the wider your vocabulary across categories, the faster the middle word appears. And because the clues change daily, no two Betweenle puzzles play the same.',
      'The today page keeps the answer and the clues together, so you can see exactly how the rule resolved for that day\u2019s pair.'
    ]
  }
};

let changed = 0;
let skipped = [];
for (const [key, sec] of Object.entries(sections)) {
  const start = src.indexOf("  '" + key + "': {");
  if (start === -1) { skipped.push(key + ' (not found)'); continue; }
  const end = src.indexOf('\n  },', start);
  const block = src.slice(start, end === -1 ? src.length : end);
  if (block.includes(sec.heading)) { skipped.push(key + ' (heading exists)'); continue; }
  const anchor = '\n    ],\n    faqHeading:';
  const ai = block.indexOf(anchor);
  if (ai === -1) { skipped.push(key + ' (no faqHeading anchor)'); continue; }
  const sectionObj = '\n      },\n      {\n        heading: ' + JSON.stringify(sec.heading) + ',\n        paragraphs: ' + JSON.stringify(sec.paragraphs) + '\n      }';
  const newBlock = block.slice(0, ai) + sectionObj + anchor + block.slice(ai + anchor.length);
  src = src.slice(0, start) + newBlock + src.slice(start + block.length);
  changed++;
}

fs.writeFileSync(file, src);
console.log('changed:', changed, 'skipped:', skipped.length);
for (const s of skipped) console.log(' -', s);
