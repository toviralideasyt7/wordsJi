// Top-up batch 2A: second substantial section for 21 articles.
// Run with: node scripts/topup-b2.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const SECTIONS = {
  'loldle-solver': {
    heading: "Building your LoLdle attribute memory",
    paragraphs: [
      "The fastest way to improve at LoLdle is to build a mental table of the champion pool sorted by the attributes the game tests. Start with regions: Demacia, Noxus, Ionia, Piltover and Zaun, the Shadow Isles, Targon, the Void, and the rest. Being able to say 'that champion is from Ionia' on sight halves the pool before you ever see the feedback.",
      "Then layer roles on top of regions. Most regions have a recognizable cast of roles — Ionia has its duelists and mages, Noxus its brawlers and assassins, Piltover its inventors and marksmen. When a clue confirms a region, run through that region's role list and you are usually looking at a shortlist of five or six names.",
      "The third layer is species and gender, which players chronically underuse. Species — human, vastaya, spirit, void-born, undead — is a coarse filter that eliminates whole classes instantly. A human champion can never be a vastaya, and confirming 'not human' removes most of the pool in one verdict.",
      "Finally, learn the resource system: mana, energy, rage, and resource-less champions. It is the attribute that most resembles trivia — players know it less than they think — but it is also one of the most discriminating, because champions sharing a region and role rarely share a resource type."
    ]
  },
  'worldle-solver': {
    heading: "The map-reading habits that win Worldle",
    paragraphs: [
      "Worldle rewards players who think in map bands instead of country names. Before you guess, look at the silhouette and ask three questions: how big is it, where is it on the planet, and what does its coastline look like? The answers place you on the right continent and usually the right region before the first piece of feedback arrives.",
      "The distance feedback is the game's real teacher. Every miss tells you exactly how far you are, and players who internalize the scale — 500 kilometers is a neighbor, 2,000 is a region, 6,000 is a hemisphere — stop wasting guesses on random countries and start leaping deliberately.",
      "Direction arrows are the second teacher. A northeast arrow with a short distance means the answer is a country northeast of your guess; with a long distance it means a whole continent to the northeast. Reading the arrow and the number together is the skill that separates four-guess solvers from six-guess scramblers.",
      "Finally, practice with the archive. Every past Worldle silhouette is the same shape puzzle with a different answer, and running through old puzzles builds the shape vocabulary — Italy's boot, Chile's ribbon, Japan's arc — that makes the daily silhouette instantly recognizable."
    ]
  },
  'all-wordle-solver': {
    heading: "Wordle variants and how the solver adapts",
    paragraphs: [
      "The Wordle family is larger than most players realize: the daily five-letter original, the six- and seven-letter variants, the custom-length solvers, the quordle multi-board versions, and the endless practice modes all run on the same green-yellow-gray feedback. The one thing that changes is the dictionary size and the word length.",
      "Longer words change your opener strategy. In five-letter Wordle, a vowel-heavy opener like CRANE is ideal; in six letters, CRANES or SLATER covers the same letters plus a bonus; in seven, RANCETS or TRANCES extends the pattern. The principle — vowels plus common consonants, no repeats — scales to every length.",
      "Multi-board variants like Quordle change the information economy. With four boards, a single guess produces four sets of feedback, and the solver's job is to pick the word that helps the most boards at once. The solver treats all four verdicts as simultaneous constraints, which is exactly how a human player should think too.",
      "Practice modes are where the solver's real value shows. Endless play lets you test openers, compare strategies, and measure your average guess count — and running the solver alongside teaches you which of your habits cost you moves."
    ]
  },
  'colorfle-answer-today': {
    heading: "Why Colorfle answers are worth checking",
    paragraphs: [
      "Colorfle publishes one precise color per day, and the answer page is the only place you can confirm the exact shade — its name, its hex value, and its position on the wheel. Players who check the daily answer build a mental catalog of what Colorfle considers 'a color', and that catalog makes future solves dramatically faster.",
      "The hex value is the real gem. Most daily color games leave you with a vague memory of a hue; Colorfle's answer gives you the exact digital definition, so you can compare it against your guesses and see precisely where your color intuition drifted.",
      "The daily reveal also teaches the palette's structure. Over a week of answers, you notice the game favors recognizable families — the standard rainbow plus the classic neutrals — rather than obscure designer shades, and that knowledge reshapes your opener choices.",
      "And when the streak is on the line, the answer page is the safety net every player needs. A quick check beats a lost streak, and the page's dated reveal means the answer is always one click away, formatted for the exact day you are playing."
    ]
  },
  'smashdle-solver': {
    heading: "Learning the Smash roster like the solver does",
    paragraphs: [
      "Smashdle is won by players who can enumerate the roster by attribute instead of by memory. The most useful mental index is by universe: Mario, Zelda, Pokémon, Kirby, Fire Emblem, and the third-party guests each form a recognizable cluster, and being able to list a universe's fighters on demand turns a green universe verdict into a near-solve.",
      "Weight class is the second index. Ultimate's fighters span featherweight to super heavyweight, and knowing which fighters sit at the extremes — Jigglypuff at the light end, Bowser and K. Rool at the heavy end — lets a single weight verdict eliminate half the roster.",
      "Jump count is the secret weapon. Most fighters have one jump; a handful have two or more, and the multi-jump club — Kirby, Meta Knight, Pit, King Dedede — is small enough to enumerate from memory. A jump verdict that is not 'one' usually lands on a name instantly.",
      "Finally, learn the Final Smash roster. Every fighter's special is unique, and the Final Smash mode becomes a two-second solve for anyone who knows the iconic moves — the beam, the transformation, the cutscene-style finishers that the game loves to feature."
    ]
  },
  'canuckle-answer-today': {
    heading: "Canadian word strategy for Canuckle",
    paragraphs: [
      "Canuckle is Wordle with a Canadian vocabulary, and the twist changes your opener completely. Words like MAPLE, TOQUE, POUTINE, and CANOE carry the vowels and consonants that dominate Canadian vocabulary, so a Canuckle opener should test the letters that show up in hockey, geography, and food terms.",
      "The answer pool skews toward recognizable Canadian words — provinces, cities, foods, hockey terms, and uniquely Canadian vocabulary. When the pattern fits, brainstorm in that lane: a word with M-A-P-L-E letters is more likely MAPLE-adjacent than a generic wordle answer.",
      "The double-letter trap is real in Canuckle. Canadian vocabulary is full of doubled consonants — TOQUE, POUTINE, OUAIS — so a pattern with a doubled letter is more common here than in the original game, and players who assume no repeats miss whole families of answers.",
      "Finally, the hints are your friend. Canuckle's hint system is generous compared to most variants, and using the first-letter hint early — before you have wasted three guesses — turns an open pattern into a solvable one."
    ]
  },
  'soundmap-solver': {
    heading: "When to trust a clue versus when to guess",
    paragraphs: [
      "The skill that separates good Soundmap players from great ones is knowing when a clue set is complete enough to guess. Early clues are broad — a decade, a genre — and a guess made on them alone is a coin flip; late clues are specific — a collaborator, a signature album — and a guess made on them is usually a solve.",
      "A practical rule: guess boldly on the first clue if it is an era, because the feedback from a bold era-aligned guess teaches you more than a safe hedge. Then wait for the specific clues before committing to an obscure artist.",
      "Watch for the crossover tells. A clue that mentions two genres, or a nationality plus a genre, is the game hinting at a crossover act — and crossover acts are rare enough that naming the pool of them is usually enough to find the answer.",
      "Finally, never repeat a failed guess. The feedback after a miss almost always tells you why — wrong era, wrong genre, wrong scene — and a second guess of the same artist wastes a turn the solver would use to filter. Trust the filter and move."
    ]
  },
  'phrazle-answer-today': {
    heading: "How Phrazle answers are built",
    paragraphs: [
      "Phrazle answers are multi-word phrases — idioms, titles, song lyrics, famous sayings — and the multi-word structure changes everything about how you solve. Each word is guessed in its own row of tiles, and the feedback applies per word, so your opener should target the first word of the phrase, not the whole saying.",
      "The phrase structure is the biggest clue. A two-word answer with a three-letter first word and a six-letter second word is almost certainly an adjective-noun pair or a name; a three-word answer is often an idiom or a title. Reading the word-length pattern narrows the phrase family before you guess a single letter.",
      "Common phrases repeat across puzzles. Titles, idioms, and catchphrases form a finite pool, and players who build a mental list of famous phrases — 'time flies', 'piece of cake', 'breaking news' — solve faster because they recognize the pattern the game is drawing from.",
      "Finally, treat each word like a mini-Wordle. The first word's feedback teaches you letters that apply across the phrase, and the solver applies the same logic per word — so solving the first word well is solving half the puzzle."
    ]
  },
  'countryle-solver': {
    heading: "The country pool Countryle draws from",
    paragraphs: [
      "Countryle answers come from the community's country list, which skews toward recognizable states rather than obscure territories. The pool favors the UN members, the G20, the popular travel destinations, and the geopolitically significant countries — and knowing that bias saves you from chasing microstates that will never be the answer.",
      "The bias changes your guessing strategy. When you are down to two candidates — one famous, one obscure — the famous one wins almost every time. Players who ignore this bias waste guesses on countries like Andorra or Vanuatu when the answer is clearly France or Japan.",
      "The pool also includes a healthy share of island nations and landlocked countries, so the answer is never predictable from geography alone. But the recognizable states dominate, which means your first few guesses should always be famous countries whose feedback divides the map cleanly.",
      "Finally, the archive is a study tool. Browsing past Countryle answers shows you the pool's actual shape — which regions repeat, which continents appear most — and that pattern knowledge transfers directly to faster daily solves."
    ]
  },
  'worldle-answer-today': {
    heading: "The daily silhouette and how to read it",
    paragraphs: [
      "Every Worldle puzzle begins with a silhouette, and the players who solve fast read the shape before they read any feedback. The silhouette's outline is a fingerprint: Italy's boot, Chile's ribbon, the UK's jagged coast, Australia's solid mass are all recognizable within a second to a practiced eye.",
      "Size is the second read. A silhouette that nearly fills the frame is a large country — Russia, Canada, Brazil, China; a small silhouette is an island or a compact state. Comparing the silhouette to the frame instantly places the country in the big-versus-small band.",
      "Fragmented silhouettes are the tricky ones. Indonesia, Greece, Japan, and the Philippines are archipelagos whose scattered shapes mislead players into thinking of a single landmass. When the silhouette looks broken, start guessing island nations first.",
      "Finally, pair the silhouette with the distance feedback. The shape tells you the region, and the distance tells you how close you are — together they collapse the map to a shortlist, and the daily answer usually follows within two or three guesses."
    ]
  },
  'phoodle-answer-today': {
    heading: "The Phoodle answer pool, decoded",
    paragraphs: [
      "Phoodle's word list is curated food vocabulary, and knowing its shape makes you a faster solver. The pool leans toward common ingredients and dishes — SPICE, PASTA, BREAD, MANGO, TACOS — rather than obscure culinary terms, so when your pattern fits, the answer is usually a word you know from the kitchen, not a restaurant-menu rarity.",
      "The pool also includes kitchen verbs and food adjectives that catch players off guard. BAKE, FRY, STEAM, SPICY, TART, SAVORY all appear, and players who only brainstorm nouns miss a whole slice of the answer space. Keeping the verbs and adjectives in mind from the start widens your guess pool.",
      "Letter frequency in food words is your quiet advantage. Food vocabulary is heavy on A and O — PASTA, MANGO, TACOS, BANANA — and the S-T-R-P-C cluster that dominates ingredient names. An opener that tests those letters covers more of the pool than a generic Wordle opener ever would.",
      "Finally, the daily answer is confirmed on this page with its food category — ingredient, dish, cut, or kitchen term — so you can see exactly which lane the puzzle was testing. That category knowledge compounds: after a week of answers, you know which lanes the game favors."
    ]
  },
  'colorfle-solver': {
    heading: "Color models that make Colorfle click",
    paragraphs: [
      "Colorfle's feedback is built on a real color model, and understanding that model is the difference between guessing and navigating. The game moves you along hue, saturation, and lightness — the three axes that describe every color — and each verdict is a direction along one of those axes.",
      "The hue wheel is the axis players understand best: warmer means rotate toward red-orange, cooler means rotate toward blue-green. But saturation and lightness are where solvers actually win. A 'less saturated' verdict is the game telling you the answer is grayer, and a 'lighter' verdict is telling you the shade is a tint rather than a deep tone.",
      "Thinking in opposites is the hidden skill. Every verdict has a clear opposite — warmer versus cooler, lighter versus darker, more saturated versus less — and players who can name the opposite of their last guess can always make a productive move, even when they are far from the target.",
      "Finally, anchor yourself in landmarks. Mid-blue, mid-green, mid-red, and the neutrals are reference points you can reason from. When you know your guess is 'two steps warmer than mid-blue and much lighter', you are thinking in the same coordinate system as the solver."
    ]
  },
  'searchle-solver': {
    heading: "Advanced Searchle tactics from ranking data",
    paragraphs: [
      "Searchle's ranking feedback is dense with information if you read it right. A big rank jump means your new words overlap the target's vocabulary; a flat rank means your phrasing is orthogonal. The solver treats every movement as a signal, and you can too — before you add a word, predict whether it will jump the rank or hold it still.",
      "Word order matters more than players expect. 'best pizza near me' and 'pizza near me best' rank differently, and the game mirrors that. When two guesses use the same words but rank differently, the target's word order is telling you something about its phrasing.",
      "Stop-words are not stop-signals. Words like 'the', 'of', and 'for' appear in real search phrases and affect ranking — 'best of' and 'how to' are legitimate query fragments. The solver includes them in its model, and players who ignore them miss a whole class of targets.",
      "Finally, use the archive to study past answers. The pattern of mystery queries — how-to phrases, comparison phrases, local phrases — is consistent, and reviewing old puzzles builds the intuition for what the game considers a realistic search."
    ]
  },
  'hangman-solver': {
    heading: "Winning hangman without a dictionary",
    paragraphs: [
      "You do not need a solver to win hangman — you need the split strategy it uses. The core rule is simple: never guess a letter that appears in almost every word. E, T, A, and I are exciting guesses, but when they are present in most words, a miss barely narrows the list and a hit barely narrows it either.",
      "The winning pattern is to guess the letters that split the field: J, X, Z, Q, and the less common vowels. A letter that appears in a third of the words is worth more than a letter that appears in 90 percent, because it halves the list no matter how the game answers.",
      "Position matters once you have revealed letters. When the pattern is _O_E, the O and E are known, and the discriminating letters are the consonants that fit between them — R, M, N, D, C, L. Guessing those in order usually cracks the word in two or three moves.",
      "Finally, read the phrase structure. If the puzzle is a multi-word phrase, the word lengths are the first clue, and the solver's pattern filter — matching revealed letters across all words — is the exact logic you should apply by hand."
    ]
  },
  'searchle-answer-today': {
    heading: "Searchle answer patterns across the archive",
    paragraphs: [
      "The Searchle archive reveals consistent patterns in how daily answers are built. The most common structure is the how-to phrase — 'how to make', 'how to fix', 'how to lose' — followed by the comparison phrase — 'best', 'top', 'vs' — and the definition phrase — 'what is', 'meaning of'.",
      "The second pattern is topical clustering. Answers cluster around whatever people are searching that month: seasonal questions, trending news, evergreen how-tos. A player who follows the current search zeitgeist can predict the topic family before the prompt is even revealed.",
      "The third pattern is the grammatical slot. The prompt usually ends at a natural completion point — a preposition, a determiner, a verb — and the answer is the word that grammatically completes it. Reading the prompt's grammar narrows the answer to a part of speech before you think about content.",
      "Finally, the answers are almost always high-volume phrases — the kind of searches with real monthly traffic. The game wants recognizable completions, so the answer is rarely an obscure string; it is the phrase millions of people actually type."
    ]
  },
  'narutodle-solver': {
    heading: "How the Naruto story structure helps you solve",
    paragraphs: [
      "Narutodle answers are characters from the Naruto and Shippuden timeline, and the story's structure is a solving aid. Characters cluster by era — Part I, Shippuden, and the Boruto era — so a debut-era hint, when the game gives one, places the character in time before any other attribute is confirmed.",
      "The village system is the strongest organizational tool. Konoha, Suna, Kiri, Kumo, Iwa, and the Akatsuki each have a recognizable cast, and knowing which village a character calls home lets you jump straight to the right neighborhood of the roster.",
      "Clan knowledge is the next layer. Uchiha, Uzumaki, Hyuga, Nara, and the other clans are small enough to enumerate from memory, and a green clan verdict with a known village is usually a two-guess solve.",
      "Finally, remember the villains. The Akatsuki and the other antagonist groups are a distinct slice of the pool, and players who only brainstorm heroes get stuck when the answer is an Akatsuki member. The solver's roster includes every faction — and so should your mental list."
    ]
  },
  'waffle-solver': {
    heading: "The Waffle board, read like a crossword solver",
    paragraphs: [
      "Waffle is a crossword in disguise, and reading it like one unlocks the fastest solves. The grid holds six five-letter words — three across, three down — sharing twelve crossing letters, and the crossings are the key: a letter that belongs to two words is the junction where both get fixed.",
      "Start with the words that are closest to solved. Any row or column with four correct letters is a one-swap fix, and fixing it usually corrects the crossing word at the same time. The solver identifies these near-solves instantly, and so can you by scanning for rows that 'almost spell' a word.",
      "The swap economy is the real score. Waffle counts your moves, and a perfect game uses the minimum swaps — so before you move a tile, trace where its replacement comes from. A swap that fixes two words at once is worth two moves of progress in one.",
      "Finally, build your five-letter word vision. The more common five-letter words you can see in a scrambled row, the faster you solve. Practicing with the archive builds that vision, and the solver's suggested swaps show you the chains experts use."
    ]
  },
  'onepiecedle-solver': {
    heading: "One Piece arcs as a solving timeline",
    paragraphs: [
      "The One Piece story's arc structure is the best organizational tool for OnePieceDle. Characters cluster by debut arc — East Blue, Alabasta, Skypiea, Water 7, Marineford, Dressrosa, Wano — and placing a character in their debut arc eliminates everyone who appeared later.",
      "Arc knowledge also tells you the character's context. East Blue characters are the originals; Alabasta added the Baroque Works villains; Water 7 brought the CP9 agents; Marineford is the war arc's colossal cast. Naming the arc names the character's world.",
      "The crews are the second index. The Straw Hats, the Marines, the Yonko crews, the Warlords, and the Revolutionary Army each have a recognizable cast, and locking the crew with your first guess is the single highest-value move in the game.",
      "Finally, remember that the pool is not just heroes. Villains, side characters, and the great pirate captains are all answers, and players who only brainstorm protagonists get stuck on the antagonist-heavy puzzles."
    ]
  },
  'pokedle-solver': {
    heading: "Reading Pokedle feedback like a dex tracker",
    paragraphs: [
      "Pokedle's feedback is a dex-entry in motion: each verdict narrows the Pokédex toward the answer. The type verdict is the biggest filter, but the way it lands matters — a yellow type means the answer shares a type family, like fire for a fire-fighting dual type, and players who only read green and gray miss the family connections.",
      "The numeric attributes are precision tools. Height and weight come back with yellow proximity windows, and a yellow height is a band — the answer is within a set range of your guess. When the solver says 'close in height', the candidate list is small, and the answer is usually a Pokémon of similar stature.",
      "Generation is the era filter. Nine generations of Pokémon form distinct pools, and confirming the generation eliminates eight-ninths of the dex. Players who skip generation hints in favor of types are missing the second-best filter in the game.",
      "Finally, keep the form variants in mind. Alolan, Galarian, Hisuian, and Paldean forms share names with their originals but differ in type and stats — and the solver's dex includes them all, so a hint that 'fits' a Kanto Pokémon might actually point at its regional form."
    ]
  },
  'framed-answer-today': {
    heading: "Building the film knowledge Framed rewards",
    paragraphs: [
      "Framed tests visual memory, and the players who solve fast have built a mental gallery of iconic frames. The most useful knowledge is not plot — it is imagery: famous opening shots, distinctive locations, signature props, and the color palettes that identify a film in a single glance.",
      "Directors are the strongest index. Auteur films are over-represented in the answer pool because their frames are recognizable on their own — Wes Anderson's symmetry, Nolan's scale, Tarantino's compositions, the Coens' wide shots. Learning each director's visual signature pays off across dozens of puzzles.",
      "Era and genre are the second index. A frame with film grain and period cars is almost certainly a classic; a frame with neon and modern glass is a contemporary film. Naming the era and genre before you name the title turns a hard puzzle into a manageable one.",
      "Finally, use the frame count deliberately. The later frames exist to reveal the film, and if you are stuck on frame three, the answer is usually a film you know — the fourth or fifth frame will surface the face or the location that makes it click."
    ]
  },
  'dotadle-solver': {
    heading: "The Dota hero pool, indexed for solving",
    paragraphs: [
      "Dotadle rewards knowing the hero pool's structure, and the primary attribute split — strength, agility, intelligence — is the master index. Each third of the pool has a personality: strength heroes are the initiators and durable cores, agility heroes the carries and scaling attackers, intelligence heroes the supports and spellcasters.",
      "Lane identity is the second index. The safe lane, mid, off, and roaming positions each have a recognizable cast, and a lane verdict with a confirmed attribute usually leaves a shortlist. Learning which heroes call which lane home is the fastest way to turn feedback into a solve.",
      "Attack type is the cleanest binary in the game. Melee versus ranged splits the pool in half, and it is the attribute players enter last — a habit the solver breaks by treating it as an early filter.",
      "Finally, learn the eras. The original Dota roster, the early Dota 2 additions, and the modern patch heroes are distinct generations, and a release-era hint places the hero in time before any other attribute is confirmed."
    ]
  },
  'phoodle-solver': {
    heading: "Food-word openers that outperform Wordle openers",
    paragraphs: [
      "The biggest mistake in Phoodle is carrying your Wordle opener over unchanged. Words like CRANE and SLATE are food-neutral — they tell you nothing about the food lane — while STEAK, SPICE, and PASTA test the letters that dominate food vocabulary and produce feedback you can actually use.",
      "The food vocabulary's letter profile is your guide. Ingredients and dishes are heavy on S, T, R, P, C, and K, with A and O the dominant vowels. An opener covering those letters — STEAK gives you S, T, E, A, K — filters the food pool far faster than a generic opener ever could.",
      "The second opener principle is category coverage. A great Phoodle opener tests letters from multiple food lanes: a meat letter, an ingredient letter, a kitchen-verb letter. SPICE covers the spice lane and the verb lane at once, which is why it ranks among the community favorites.",
      "Finally, adapt after the first guess. The feedback tells you which food lane the answer lives in — an S and T with a K usually means a cut or a dish; an A and C with a P often means an ingredient. Read the lane, then brainstorm in it."
    ]
  },
  'waffle-answer-today': {
    heading: "Why Waffle answers are worth the daily check",
    paragraphs: [
      "Waffle publishes one daily grid, and checking the answer page serves two purposes: the confirmation and the lesson. Confirming the six words settles the daily grid, and studying how the words crossed teaches you the board patterns the game favors.",
      "The crossing pattern is the real lesson. Waffle grids are built so that the across and down words interlock densely, and each day's grid shows a new arrangement of shared letters. Players who study the daily answers internalize which letters the game likes to cross — R, S, T, N, and the vowels — and that knowledge speeds every future solve.",
      "The answer page also reveals the game's vocabulary bias. Waffle favors common five-letter words, and the daily answers confirm the pool's shape — everyday nouns and verbs rather than crossword rarities. Knowing the pool is common vocabulary reshapes your guesses from the start.",
      "Finally, the daily check builds streak continuity. Whether you solved the grid or needed the reveal, the answer page keeps your archive current, and the dated reveal means the daily answer is always one click away."
    ]
  },
  'boggle-solver': {
    heading: "The Boggle vocabulary that wins games",
    paragraphs: [
      "Boggle rewards vocabulary range, but not the way most players think — the winning words are the short and medium finds, not the obscure sevens. A strong player finds every four-letter word in the grid, and those common finds are where the points actually accumulate.",
      "The prefixes and suffixes are the hidden multiplier. Words like RUN extend to RUNS, RUNNER, and RUNNING when the neighboring letters allow, and each extension is a separate word worth its own points. Players who scan for extensions double their find rate without new vocabulary.",
      "Rare letters are the strategic gift. Q, X, J, Z, and K appear in few words, so the words containing them are contested less — and a word like QUIZ or JINX that the rest of the table misses is a pure point swing in your favor.",
      "Finally, learn the three- and four-letter backbone. The most common English trigrams and tetragrams — THE, AND, ING, ENT, ION — form the skeleton of the board, and players who can spot them instantly find words everywhere."
    ]
  },
  'word-ladder-solver': {
    heading: "Building ladders by hand, one rung at a time",
    paragraphs: [
      "Word ladders look like a memory game, but they are actually a search problem — and the search skill is learnable. The first habit is enumerating neighbors: for any word, list the words that differ by one letter. Players who can produce a neighbor list instantly never get stuck on the first step.",
      "The second habit is vowel-first thinking. Most ladder movement happens through vowel rotation — CAT to COT to CUT, or BAD to BED to BID — and the vowel chain is the spine of most ladders. Watch the vowel of every rung, and the next step usually reveals itself.",
      "The third habit is planning backward. The final rung before the target must share three letters with it, so listing the target's neighbors before you start gives you a landing zone to aim at — and the middle of the ladder becomes a route to that zone.",
      "Finally, avoid the dead ends. Words with rare letters or unusual patterns have few neighbors, and stepping onto them traps you. Good ladder-builders route around them — exactly the logic the solver's graph search applies."
    ]
  },
  'betweenle-answer-today': {
    heading: "The daily Betweenle pattern, week by week",
    paragraphs: [
      "Betweenle answers repeat structural patterns that a daily player learns to expect. Some weeks the puzzle leans alphabetical — the answer sorts between the clue words; other weeks it leans semantic, with the answer bridging the clues' meanings. Reading which pattern the day is using is half the solve.",
      "The clue selection is the tell. Two clue words from the same category — two animals, two colors, two sizes — almost always mean a categorical between; two clues from different categories mean the answer is a bridge between worlds. Naming the relationship before you guess the word turns the puzzle into a two-step deduction.",
      "The daily answers also reveal the game's vocabulary bias. Betweenle favors common words with clear midpoints, and the pool avoids the obscure — so when you are down to two candidates, the everyday word wins almost every time.",
      "Finally, track your own solves. The players who improve fastest at Betweenle are the ones who review their misses, because each miss teaches a new kind of betweenness — and the daily reveal is the perfect review tool."
    ]
  },
  'countryle-answer-today': {
    heading: "Building the geography sense Countryle rewards",
    paragraphs: [
      "Countryle is a geography quiz in disguise, and the daily answers are the fastest way to build the map sense it rewards. Each reveal shows you a country, its continent, and its region — and reviewing the daily answers builds the mental atlas that makes future solves faster.",
      "The continent-first habit is the foundation. Most players lose Countryle by ignoring continent feedback and staying in their home region; the players who solve fast switch continents the moment the game tells them they are wrong, and the daily answers reinforce that discipline.",
      "Borders are the second layer. Each daily answer is a chance to learn a country's neighbors, and the border chains — Brazil's ten, Germany's nine, the DRC's nine — are the endgame weapons that turn medium-distance feedback into a solve.",
      "Finally, the distance bands are the transferable skill. Reading 500 kilometers as 'a neighbor' and 5,000 as 'another continent' is a map-reading habit that transfers from Countryle to Worldle, Globle, and every geography game — and the daily answers train it."
    ]
  },
  'weaver-solver': {
    heading: "The word graph, understood",
    paragraphs: [
      "Weaver is a window into the graph of English words, and understanding that graph makes you a better solver. Every four-letter word is a node; every pair differing by one letter is an edge; and a Weaver puzzle is a path through that graph. The solver finds the shortest path — and you can learn to see paths too.",
      "The graph's structure has patterns. Words cluster around vowel cores, so most edges involve changing one consonant or one vowel while keeping the rest. Words with unusual patterns — QUIZ, JINX, ZANY — sit at the graph's edge with almost no neighbors, which is why they are dead ends.",
      "Bridge words are the hidden art. Some words connect regions that would otherwise be separate — a rare word like DORE or GITE can be the only bridge between two word neighborhoods. The solver uses them, and studying solver paths teaches you the bridges that recur.",
      "Finally, practice with the archive. Every past Weaver puzzle is a path through the graph, and reviewing the solver's routes builds your internal map of the word space — which words connect, which letters rotate freely, which routes are shortest."
    ]
  },
  'nerdle-solver': {
    heading: "The Nerdle equation census, memorized",
    paragraphs: [
      "Nerdle answers are eight-character equations, and the equation space has a structure you can learn. The most common form is the two-term sum — 12+34=46 — followed by subtraction, then multiplication and division. Knowing the form distribution tells you what to guess first.",
      "The digit census is the second lesson. Digits appear unevenly in valid equations: 1, 2, 0, and 5 are workhorses, while 8, 9, and 7 appear less often. An opener that sweeps the common digits — 12+35=47 — covers more of the space than an opener with a rare digit.",
      "The equals sign is the anchor. Every equation has exactly one, and its position splits the equation into left and right sides of specific lengths. A green equals sign locks the structure; a purple one tells you the split is different than you guessed.",
      "Finally, respect the black tiles. A blacked-out digit is banned for the rest of the game, and the fastest solvers are the ones who never reuse a banned character — a discipline the solver enforces on every single guess."
    ]
  },
  'light-out-solver': {
    heading: "The math that makes Lights Out tick",
    paragraphs: [
      "Lights Out is a math puzzle wearing a game's disguise, and understanding the math makes the game trivial. Every press toggles a tile and its neighbors, pressing a tile twice cancels out, and the order of presses never matters — properties that make the puzzle a linear system over a two-value algebra.",
      "That linear structure means every solvable board has a press set, and the solver finds it with Gaussian elimination — the same algorithm behind solving simultaneous equations. The math is the reason the solver is exact: no guessing, no heuristics, just the solution.",
      "The chase method is the manual version of the same logic. Clearing the board row by row, pushing the lights downward, and then solving the bottom row with top-row presses is a hand-computable form of the solver's elimination — and practicing it builds the intuition the math formalizes.",
      "Finally, the parity rule is worth internalizing. Some boards are unsolvable, and the solver detects them rather than pressing forever. Knowing that some configurations have no solution saves you from the classic trap of pressing tiles endlessly on an impossible board."
    ]
  },
  'globle-answer-today': {
    heading: "The world knowledge Globle rewards",
    paragraphs: [
      "Globle is Worldle's color-map cousin: each guess colors the map by distance, from green for the answer to red for the far side of the world. The daily answers are a geography education in one reveal per day — country, region, and the color map of your guesses.",
      "The color gradient is the key feedback. A guess that returns green-adjacent means you are in the neighborhood; a deep red means the far side of the planet. Reading the gradient like a heat map of distance is the skill that separates fast Globle solvers from wandering ones.",
      "The daily answers build the same map sense as any geography game: continent-first thinking, border chains, and the distance bands that translate color to kilometers. Each reveal reinforces those habits.",
      "Finally, the answer page's dated reveal makes it the perfect daily companion — confirm today's country, study the map, and let tomorrow's puzzle be a little easier than today's."
    ]
  },
  'semantle-answer-today': {
    heading: "Semantle answers and the word-space map",
    paragraphs: [
      "Semantle answers live in a semantic word space, and the daily reveals are a tour of that space. Each answer is a word that the game's model places near a target — and the daily reveal shows you which corner of the word-space the puzzle visited today.",
      "The similarity scores are the map. Your guesses return a number between 0 and 100 reflecting semantic closeness, and the highest-scoring guess is the trailhead: words near it in meaning are words near the answer. The players who solve fast use the top-scoring guess as a compass.",
      "The word-space structure has recognizable landmarks. Abstract concepts cluster together, emotions cluster together, and action words cluster together — so a high-scoring abstract word means the answer is likely abstract too. Reading the category of your best guess points you at the answer's neighborhood.",
      "Finally, the daily answers teach the game's vocabulary bias. Semantle favors common words with clear meanings, and the reveal page shows you exactly which words the model considers neighbors — building the semantic intuition that makes every future solve faster."
    ]
  },
  'minesweeper-solver': {
    heading: "The minesweeper logic the solver automates",
    paragraphs: [
      "Minesweeper is a logic game before it is a luck game, and the solver automates the logic that expert players apply by hand. The core rule is the boundary count: when a revealed number equals the number of unflagged adjacent cells, every one of those cells is a mine; when it equals the number of flagged cells, every remaining neighbor is safe.",
      "The pattern library is the second layer. Experienced players recognize recurring arrangements — the 1-2-1 corner, the 1-2-2-1 wall, the 2-2-3 cluster — and each pattern has a known deduction. The solver knows them all, and studying its moves teaches the library to you.",
      "Probability is the final layer. When logic stalls, the solver computes the safest guess — the cell with the lowest mine probability — rather than clicking randomly. Players who learn to estimate probabilities win far more games than players who click on instinct.",
      "Finally, the 50-50s are not failures. Some endgames genuinely reduce to a coin flip, and the solver handles them by picking the better side. Accepting that a perfect game can still lose to a 50-50 is the mindset that keeps streaks alive."
    ]
  },
  'betweenle-solver': {
    heading: "Reading Betweenle clues like a puzzle designer",
    paragraphs: [
      "Betweenle clues are designed, and reading them like a designer reveals the answer's shape. The two clue words are chosen so that the between-region is meaningful — not a tie, not trivial — and the designer's choice tells you which kind of betweenness is in play.",
      "Categorical clues are the most common. Two animals, two colors, two sizes, two categories — the answer sits between them on a scale or in a family. Naming the scale is the first step: is it size, time, heat, rank? The scale determines the midpoint, and the midpoint is usually the answer.",
      "Alphabetical clues are the trick to spot. Some puzzles are pure word-order betweenness — the answer sorts between the clues in the dictionary — and players who assume meaning miss them entirely. If the semantic between feels empty, check the alphabetical one.",
      "Finally, use the answer page's reveal as a study tool. Each daily answer shows the between-relationship in action, and reviewing the week's answers builds the pattern library — categorical, alphabetical, semantic — that makes the next puzzle click."
    ]
  },
  'squaredle-solver': {
    heading: "The word-finding habits that win Squaredle",
    paragraphs: [
      "Squaredle is Boggle's daily sibling: a grid of letters where you find as many words as possible, often with a theme word hidden in the mix. The solver finds every word, and studying its list reveals the habits that win: anchor on vowels, trace every adjacent path, and never skip the rare letters.",
      "The theme word is the daily prize. Most Squaredle grids hide a long theme word that connects the day's puzzle, and the solver's list surfaces it — along with the words that share its letters, which are usually the highest-value finds on the board.",
      "The grid's structure rewards systematic scanning. Words can snake in any direction, so a player who scans the board in a fixed pattern — row by row, then diagonal by diagonal — finds more words than a player who lets the eye wander. The solver's exhaustive search is that discipline, automated.",
      "Finally, the daily reveal teaches the grid's vocabulary bias. Squaredle favors common words with a few longer treasures, and knowing the pool's shape — everyday vocabulary plus a theme word — reshapes your guessing from the start."
    ]
  },
  'contexto-answer-today': {
    heading: "Contexto answers and the semantic distance game",
    paragraphs: [
      "Contexto ranks your guesses by semantic distance from a mystery word, and the daily answers are a lesson in how the game's word model thinks. Each reveal shows the mystery word and the guess rankings — a map of the semantic space around it.",
      "The ranking is the feedback. A guess that ranks 1,000 is far in meaning; a guess that ranks 50 is close; a guess that ranks 5 is nearly the answer. The players who solve fast use the rankings as a compass — climbing from far words toward the answer's neighborhood.",
      "The word-space has recognizable structure. Words cluster by domain — kitchen words, tech words, emotion words — and a high-ranking guess tells you the domain before it tells you the word. Naming the domain is the midpoint of every solve.",
      "Finally, the daily answers build the intuition. Each reveal shows which words the model considers close to the answer, and reviewing the daily reveals teaches you the model's sense of meaning — the exact sense the game rewards."
    ]
  },
  'quordle-solver': {
    heading: "Quordle tactics beyond the first guess",
    paragraphs: [
      "Quordle's four boards change the information economy, and the players who win think about board coverage, not just word quality. The best guesses are the ones that help the most boards at once — a word that produces useful feedback on three boards beats a word that solves one.",
      "The solver's ranking reflects that logic: it scores candidates by how much information they extract across all four boards, not by how close they are to any single answer. Players who copy that mindset — choosing the word that narrows the most boards — solve faster than players who chase one board.",
      "The shared-vowel trap is real. Four answers often share vowel patterns, so a vowel-heavy guess can produce uniform feedback that helps all four boards — or none. The solver balances the vowel and consonant coverage across the four answer patterns.",
      "Finally, save the solves for the end. When one board is nearly solved, lock it with a deliberate guess only when the guess also helps another board. Solving boards in isolation wastes the multi-board advantage that makes Quordle strategic."
    ]
  },
  'colordle-answer-today': {
    heading: "Reading the Colordle daily answer archive",
    paragraphs: [
      "The Colordle answer archive is a study tool hiding in plain sight. Each daily answer — the day's color — reveals the palette the game draws from, and reviewing the archive shows you the pool's shape: the standard rainbow, the classic neutrals, and the recognizable named colors.",
      "The palette knowledge transfers directly to solving. When you know the pool favors recognizable families, your guesses can target those families — and when the feedback says a component is yellow (near-miss), you can enumerate the nearby shades in the family you now know.",
      "The archive also teaches the day-numbering system. Colordle puzzles are numbered, and players who track the numbers can cross-reference answers across sites and dates — a habit that makes the daily reveal page the hub of the Colordle community.",
      "Finally, the daily reveal with its hex value is the exact confirmation every player wants. Whether you solved it or need the reveal, the answer page settles the day — and the archive keeps the streak history one click away."
    ]
  },
  'nerdle-answer-today': {
    heading: "The Nerdle daily rhythm, mastered",
    paragraphs: [
      "Nerdle's daily puzzle follows a rhythm that players learn to ride. The first guess should be a broad equation that sweeps common digits and the equals sign; the second should re-test the survivors in new positions; and by the third, the solver's candidate list is usually short enough to finish.",
      "The daily answers reveal the equation space's habits. Two-term sums dominate, subtraction appears regularly, and multiplication and division are rarer — so a first guess that targets the sum form is statistically the best opener.",
      "The feedback discipline is the real skill. Green locks a character, purple relocates it, black bans it — and the fastest solvers respect all three absolutely. Players who slip banned digits into later guesses waste moves the solver never wastes.",
      "Finally, the daily reveal is the learning loop. Checking today's answer after your solve shows you the equation's structure and the characters you misjudged — and each review sharpens the instincts that make tomorrow's puzzle faster."
    ]
  },
  'wordle-solver': {
    heading: "The Wordle solver as a daily coach",
    paragraphs: [
      "The solver is more than a crutch — it is a daily coach. Run your own guesses through it, compare its candidate list to your reasoning, and you will see exactly where your strategy costs you moves: the gray-letter repeats, the misplaced yellows, the early commitment to a single word.",
      "The solver's candidate ranking teaches the letter-frequency logic that separates good Wordle players from great ones. When the pool is short, the answer is usually the most common word fitting the pattern — and the solver's ranking makes that obvious in a way intuition never does.",
      "The opener advice is the daily lesson. A strong opener — vowels plus common consonants, no repeats — produces the most informative first feedback, and watching the solver's recommendations after your opener shows you whether it did its job.",
      "Finally, use the solver to study the archive. Running past answers through the solver teaches you the answer pool's tendencies — which vowels pair, how often letters repeat, how everyday the vocabulary is — and that knowledge compounds into faster daily solves."
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
