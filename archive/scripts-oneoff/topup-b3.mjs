// Top-up batch 3: final closing section for the remaining 34 articles.
// Run with: node scripts/topup-b3.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const SECTIONS = {
  'kanoodle-solver': {
    heading: "Kanoodle pieces and their personalities",
    paragraphs: [
      "Each of Kanoodle's twelve pieces has a personality, and knowing them makes the game dramatically easier. The long bars are the planners — they have the fewest placements and lock the board's structure early. The L-shaped pieces are the corner-kings, hugging the edges. The chunky blocks are the fillers that anchor the center once the perimeter is set.",
      "The twisty small pieces are the finishers. They have the most orientations, which makes them the hardest to place blind — but also the most flexible, which is why expert players save them for the final fill. When you see a puzzle that looks impossible, it is almost always because a small piece needs to be flipped or rotated in a way you have not tried.",
      "Color-coding your physical set helps: assign each piece a color in your mind, and 'see' the board as twelve colored regions instead of twelve shapes. That mental recolor is exactly how the solver displays its solutions, and it is the fastest way to translate a solved layout to your physical board.",
      "Finally, practice the notorious cards. Puzzle 148 and the other late-game challenges exist to teach the unconventional orientations — and once you have seen one piece flipped in 3D, you start seeing the possibility everywhere."
    ]
  },
  'worgle-answer-today': {
    heading: "How to check yesterday's Worgle answer",
    paragraphs: [
      "The Worgle archive on this page keeps the full history of daily answers, so checking yesterday's word — or any past puzzle — is one click away. The archive is the perfect tool for the player who missed a day, wants to confirm a streak, or is studying the word list's tendencies.",
      "Reviewing past answers is the fastest way to learn the pool. A week of Worgle answers shows you which letters repeat, how often the answer is a common verb versus a noun, and which vowel pairs the game favors — knowledge that makes each new puzzle slightly easier than the last.",
      "The archive also settles disputes. When the group cannot agree on what yesterday's word was, the dated archive entries are the ground truth, formatted with the same date labels you saw while playing.",
      "Finally, use the archive as a practice tool. Pick a past puzzle you never solved, open it, and solve it now — the practice is identical to the daily game, and the archive gives you unlimited puzzles instead of one per day."
    ]
  },
  'worldle-solver': {
    heading: "Worldle answer patterns across the archive",
    paragraphs: [
      "The Worldle archive reveals the answer pool's shape, and that shape is a solving advantage. The pool skews toward recognizable countries — the G20, the popular travel destinations, the geographically significant states — rather than obscure territories, so the daily answer is almost always a country you have heard of.",
      "The pool also has a continental rhythm. Some weeks lean European, others Asian or African, and players who track the pattern can pre-load the right region before the silhouette even loads. The archive is the record of that rhythm.",
      "Island nations appear regularly, which makes the fragmented-silhouette skill essential — Indonesia, Japan, Greece, and the Philippines are recurring answers whose scattered shapes mislead players into mainland guesses.",
      "Finally, the distance-band habit transfers perfectly. Reading 500 kilometers as 'a neighbor' and 5,000 as 'another continent' is the same skill in the archive as in the daily game — and the archive gives you unlimited reps to build it."
    ]
  },
  'loldle-solver': {
    heading: "The LoLdle daily rhythm, mastered",
    paragraphs: [
      "LoLdle's daily puzzle follows a rhythm that players learn to ride. The first guess should be a champion you know in detail — the feedback on a familiar champion is easy to read, and the region verdict is the strongest filter. The second guess should come from the confirmed region with a different role or species. The third usually lands on a shortlist.",
      "The daily answers also reveal the pool's bias. League's roster is huge, but the daily puzzle tends to feature recognizable champions — the popular, the iconic, the recently reworked — rather than deep-cut fillers. When you are down to two candidates, the famous champion wins almost every time.",
      "The modes rotate, and each mode rewards a different knowledge. Classic tests attributes; Ability tests kit memory; Emoji tests lore; Splash Art tests art recognition. Players who practice all four modes build the complete champion knowledge that makes every mode faster.",
      "Finally, the daily reveal is the learning loop. Checking today's champion after your solve shows you the attributes you misjudged — and each review sharpens the roster knowledge that compounds into faster solves."
    ]
  },
  'all-wordle-solver': {
    heading: "Wordle solver setup for your exact variant",
    paragraphs: [
      "The solver works out of the box for every Wordle variant, but a little setup makes it faster. Set your word length first — five, six, seven, or custom — so the dictionary matches your game. Then choose your mode: daily, practice, or archive. The filtering logic is identical; only the pool changes.",
      "For daily play, run the solver alongside your game: make your guess, enter the feedback, and let it suggest the next move. Most players solve in three or four guesses with this rhythm, and the solver's candidate list teaches you which openers earn their keep.",
      "For practice mode, use the solver as a sparring partner. Solve as far as you can on your own, then compare your reasoning to the solver's candidate list — the divergence is almost always a lesson about letter frequency or pattern matching.",
      "Finally, use the archive for study. Running past answers through the solver reveals the pool's tendencies — the common vowels, the everyday vocabulary, the repeat letters — and that knowledge transfers directly to faster daily solves."
    ]
  },
  'canuckle-answer-today': {
    heading: "The Canuckle community and daily discussions",
    paragraphs: [
      "Canuckle has a small but passionate daily community, and the answer page is where that community converges. Players compare solve counts, debate openers, and commiserate over brutal words — and the daily reveal is the shared reference point for all of it.",
      "The community's opener debate is genuinely useful. Players who track their average solve count across different openers have found that Canadian-vocabulary openers — words that test the letters common in hockey, geography, and food terms — outperform generic Wordle openers on Canuckle's pool.",
      "The archive discussions teach the pool's shape. Seasoned players have mapped which letters repeat, how often the answer is a uniquely Canadian word, and which clue categories the game favors — and that collective knowledge is available to anyone who reads the daily discussion.",
      "Finally, the daily reveal keeps the streak culture alive. Whether you solved in three or needed the reveal, the answer page is the record of your streak — and the community's shared daily ritual makes even the lost days worth coming back for."
    ]
  },
  'colorfle-answer-today': {
    heading: "Colorfle hints and the art of the near-solve",
    paragraphs: [
      "Colorfle's hint system exists to turn a hard puzzle into a satisfying one, and the hints on this page are designed for exactly that: the color family, the position on the palette, and the lightness level — enough to steer your solve without spoiling the shade.",
      "The near-solve is where the skill lives. When every axis is nearly right — the family correct, the lightness close, only the saturation slightly off — the answer is usually the exact shade your guess becomes after one small nudge. Recognizing that moment and making the tiny correction is the mark of a strong Colorfle player.",
      "The daily reveal with its hex value is the confirmation every near-solve needs. Compare the hex to your final guess and you will see precisely where your color intuition drifted — a lesson that compounds into faster future solves.",
      "Finally, the archive is the practice gym. Past answers are the same palette and the same rules, and running through old puzzles builds the axis intuition — hue, saturation, lightness — that the daily game tests."
    ]
  },
  'smashdle-solver': {
    heading: "Smashdle daily answers and the roster's habits",
    paragraphs: [
      "The Smashdle daily answers reveal the roster's habits, and those habits are a solving advantage. The daily puzzle tends to feature recognizable fighters — the iconic, the popular, the recently added — rather than obscure echo fighters, so when you are down to two candidates, the famous fighter wins almost every time.",
      "The modes rotate through the week, and each mode rewards a different kind of knowledge. Classic tests attributes; Emoji and Silhouette test visual recognition; Final Smash tests move memory; Kirby Copy tests ability knowledge. Players who practice all five modes build the complete roster knowledge that makes every mode faster.",
      "The universe bias is worth tracking. Some weeks lean Nintendo-heavy, others lean third-party — and players who follow the pattern can pre-load the right franchise before the first clue lands.",
      "Finally, the daily reveal is the learning loop. Checking today's fighter after your solve shows you the attributes you misjudged, and each review sharpens the roster knowledge that compounds into faster solves."
    ]
  },
  'countryle-solver': {
    heading: "Countryle community wisdom and daily patterns",
    paragraphs: [
      "The Countryle community has distilled years of play into a few hard-won rules, and they all converge on the same advice: continent first, borders second, distance bands third. Players who follow that order solve in four or five guesses; players who ignore it wander to six and beyond.",
      "The community's second rule is the famous-country bias. The daily answer is almost always a recognizable state, so when the candidate list contains one famous country and one obscure one, the famous one is the answer. Ignoring that bias is the most common way players waste their final guesses.",
      "The third rule is the neighbor-chain skill. The endgame is won by players who can list a country's neighbors from memory — Brazil's ten, Germany's nine, the DRC's nine — because the final phase of every solve is a border check.",
      "Finally, the daily reveal is the community's shared reference. Whether you solved in four or needed the reveal, the answer page is where the daily discussion converges — and the archive is the record of every pattern the community has mapped."
    ]
  },
  'worldle-answer-today': {
    heading: "Worldle daily answers and the distance game",
    paragraphs: [
      "Worldle's daily answers are a daily geography lesson, and the distance game is the lesson's core. Each reveal shows you the country and the feedback your guesses produced — a record of how close you came and where your map sense led you astray.",
      "The daily pattern teaches the distance bands better than any textbook. A week of Worldle answers shows you what 500 kilometers feels like, what 2,000 means, and what 6,000 says about continents — and that feel is the skill the game tests every day.",
      "The silhouette archive is the second teacher. Each daily silhouette is a shape puzzle, and reviewing the archive builds the shape vocabulary — the boots, the ribbons, the arcs — that makes the next silhouette instantly recognizable.",
      "Finally, the daily reveal keeps the streak culture alive. Whether you solved in two or needed the reveal, the answer page is the record of your streak — and the archive keeps every past puzzle one click away for practice."
    ]
  },
  'phrazle-answer-today': {
    heading: "Phrazle phrases worth knowing by heart",
    paragraphs: [
      "Phrazle draws from a pool of famous phrases, and a mental list of them is the fastest solving tool in the game. Idioms like 'time flies', 'piece of cake', and 'break the ice'; titles like 'the great gatsby' and 'star wars'; catchphrases and song lyrics — each one is a potential answer, and recognizing the pattern is half the solve.",
      "The word-length structure is the tell. A two-word answer with a three-and-four-letter split is usually an adjective-noun pair; a three-word answer is often an idiom or a title. Reading the lengths before you guess a single letter narrows the phrase family immediately.",
      "The phrase pool repeats across puzzles. The game favors phrases that are famous enough to be recognizable — the everyday idioms and the cultural touchstones — and players who build the list solve faster because they can match the pattern to a known phrase.",
      "Finally, treat each word as a mini-puzzle. The first word's feedback teaches you letters that apply across the phrase, and solving the first word well is solving half the puzzle — the same logic the solver applies per word."
    ]
  },
  'phoodle-answer-today': {
    heading: "The Phoodle daily reveal and the food-word coach",
    paragraphs: [
      "The Phoodle daily reveal is more than an answer — it is a food-word coach. Each day's answer shows you the exact word, its food category, and the pattern it came from, and reviewing the daily reveals builds the food vocabulary the game tests.",
      "The category breakdown is the lesson. Some days the answer is an ingredient, others a dish, a cut, or a kitchen verb — and tracking the categories across a week shows you which lanes the game favors and which you should practice.",
      "The pattern review is the second lesson. Each reveal shows the letters that repeated, the vowels that dominated, and the structure the answer followed — and those patterns are exactly what your next opener should test.",
      "Finally, the daily reveal keeps the food-word streak alive. Whether you solved in three or needed the reveal, the answer page is the record of your streak — and the food-lane strategy above makes each new puzzle slightly easier than the last."
    ]
  },
  'onepiecedle-solver': {
    heading: "The OnePieceDle daily rhythm and community lore",
    paragraphs: [
      "OnePieceDle's daily puzzle follows the same rhythm as its sibling games: a familiar first guess, a crew confirmation, and a shortlist by guess three. The daily answers also reveal the pool's bias — recognizable characters from the major crews appear far more often than deep-cut side characters.",
      "The community has mapped the roster's habits, and the wisdom converges on the same rules: crew first, arc second, role third. Players who follow that order solve in four or five guesses; players who guess by favorite-character instinct wander.",
      "The arc timeline is the community's shared reference. Knowing which characters debuted in East Blue versus Wano is the difference between a shortlist of five and a roster-wide search — and the daily reveals keep that timeline fresh.",
      "Finally, the daily reveal is the learning loop. Checking today's character after your solve shows you the attributes you misjudged, and each review sharpens the One Piece knowledge that compounds into faster solves."
    ]
  },
  'searchle-solver': {
    heading: "Searchle solver settings and advanced usage",
    paragraphs: [
      "The Searchle solver is designed for the daily game, but a little setup makes it faster. Choose the topic mode if you know the target's domain — tech, food, travel, entertainment — and the solver's recommendations skew toward that vocabulary. The rank-movement logic works the same either way.",
      "For daily play, run the solver alongside your game: guess, read the rank, and let the solver model the target's vocabulary from the movement. The first two or three guesses establish the topic; the last two or three climb to the top.",
      "The solver's intent-first ranking is the advanced skill. It does not just match words — it matches query structure, so a how-to target gets how-to suggestions and a comparison target gets comparison suggestions. Players who learn to read the solver's reasoning internalize the same logic.",
      "Finally, use the archive for study. Reviewing past targets shows you the pool's shape — how-to phrases, question phrases, comparison phrases — and that pattern knowledge transfers directly to faster daily solves."
    ]
  },
  'narutodle-solver': {
    heading: "Narutodle daily answers and the ninja world's habits",
    paragraphs: [
      "Narutodle's daily answers reveal the ninja world's habits, and those habits are a solving advantage. The daily puzzle tends to feature recognizable characters — the main cast, the iconic villains, the popular side characters — rather than background filler, so when you are down to two candidates, the famous character wins almost every time.",
      "The village bias is worth tracking. Some weeks lean Konoha-heavy, others lean Akatsuki — and players who follow the pattern can pre-load the right faction before the first clue lands.",
      "The clan knowledge is the community's shared reference. Knowing which clans belong to which villages is the difference between a shortlist of five and a roster-wide search — and the daily reveals keep that knowledge fresh.",
      "Finally, the daily reveal is the learning loop. Checking today's character after your solve shows you the attributes you misjudged, and each review sharpens the Naruto knowledge that compounds into faster solves."
    ]
  },
  'searchle-answer-today': {
    heading: "The Searchle daily rhythm and the answer check",
    paragraphs: [
      "Searchle's daily puzzle follows a rhythm: guess the broad topic, read the rank, add a modifier, climb. The players who solve fastest are the ones who treat the rank like a compass — a big jump means the target's vocabulary is nearby, and a flat rank means the phrasing needs to change.",
      "The daily answers reveal the pool's bias. Mystery queries are realistic everyday searches — how-to phrases, comparison phrases, question phrases — rather than academic strings, so guessing like a person typing into a search box is the winning instinct.",
      "The answer check is the learning loop. Reviewing today's target after your solve shows you the phrase structure you misjudged — the word order, the modifiers, the intent — and each review sharpens the search-thinking the game rewards.",
      "Finally, use the archive for practice. Past puzzles are the same format and the same logic, and reviewing old targets builds the pattern library — the query structures, the modifier clusters, the intent families — that makes each new puzzle faster."
    ]
  },
  'dotadle-solver': {
    heading: "Dotadle daily answers and the hero pool's habits",
    paragraphs: [
      "Dotadle's daily answers reveal the hero pool's habits, and those habits are a solving advantage. The daily puzzle tends to feature recognizable heroes — the iconic, the popular, the recently added — rather than obscure fillers, so when you are down to two candidates, the famous hero wins almost every time.",
      "The attribute rhythm is worth tracking. Some weeks lean strength-heavy, others agility or intelligence — and players who follow the pattern can pre-load the right attribute before the first clue lands.",
      "The lane knowledge is the community's shared reference. Knowing which heroes call which lane home is the difference between a shortlist of five and a pool-wide search — and the daily reveals keep that knowledge fresh.",
      "Finally, the daily reveal is the learning loop. Checking today's hero after your solve shows you the attributes you misjudged, and each review sharpens the Dota knowledge that compounds into faster solves."
    ]
  },
  'hangman-solver': {
    heading: "Hangman solver settings and word-list selection",
    paragraphs: [
      "The Hangman solver is most accurate when its word list matches the game you are playing. The common-English default is right for most hangman games, but if you are playing a themed game — animals, cities, foods, sports — switch the solver's list to match the theme and its guesses improve dramatically.",
      "The list selection matters because hangman is a filter game: the solver's candidate pool is its whole world, and a pool that matches the game's dictionary produces near-perfect guesses while a mismatched pool wastes moves on words that can never be the answer.",
      "For classroom or party games, the common-English list is the safe choice — most hangman games draw from it, and its frequency structure is what the split strategy is built for.",
      "Finally, use the solver's candidate display as a learning tool. Reading the surviving word list after each guess teaches you the dictionary's shape — which letters cluster, which patterns dominate — and that awareness makes you a better guesser even without the tool."
    ]
  },
  'framed-answer-today': {
    heading: "The Framed daily reveal and the movie-memory coach",
    paragraphs: [
      "The Framed daily reveal is more than an answer — it is a movie-memory coach. Each day's reveal shows you the film, its year, its director, and the frames that led to it, and reviewing the daily reveals builds the visual-memory library the game tests.",
      "The director index is the lesson. Auteur films appear regularly because their frames are recognizable on their own, and tracking which directors the game favors — Anderson, Nolan, Tarantino, the Coens — tells you which visual signatures to study.",
      "The era-genre review is the second lesson. Each reveal shows a film's era and genre, and tracking them across a week reveals the pool's rhythm — the classic-heavy weeks, the genre rotations — that pre-loads your guessing.",
      "Finally, the daily reveal keeps the streak alive. Whether you solved on frame one or needed all six, the answer page is the record of your streak — and the frame-reading strategy above makes each new puzzle slightly easier than the last."
    ]
  },
  'boggle-solver': {
    heading: "Boggle solver settings and game variants",
    paragraphs: [
      "The Boggle solver supports the game's variants, and a little setup makes it accurate. The standard 4×4 board is the default, but the solver also handles the Big Boggle 5×5 and the 3×3 mini boards — the logic is identical, only the grid size and dictionary change.",
      "Minimum word length is a setting worth checking. Official Boggle counts three-letter words, but house rules often start at four, and the solver lets you match your table's rule so its list matches your scoring.",
      "The dictionary selection matters for themed play. The standard English dictionary is right for most games, but a themed list — animals, geography, science — makes the solver's finds match the game's vocabulary.",
      "Finally, use the solver's path display as a learning tool. Seeing the exact cell-path of a word you missed teaches you the diagonal connections your eye skips — and that awareness transfers directly to faster manual play."
    ]
  },
  'pokedle-solver': {
    heading: "Pokedle daily answers and the dex's habits",
    paragraphs: [
      "Pokedle's daily answers reveal the Pokédex's habits, and those habits are a solving advantage. The daily puzzle tends to feature recognizable Pokémon — the iconic, the popular, the recently featured — rather than obscure dex fillers, so when you are down to two candidates, the famous Pokémon wins almost every time.",
      "The type rhythm is worth tracking. Some weeks lean fire and water, others psychic and ghost — and players who follow the pattern can pre-load the right type before the first clue lands.",
      "The generation bias is the community's shared reference. Knowing which generations the game favors tells you where to guess first, and the daily reveals keep that knowledge fresh.",
      "Finally, the daily reveal is the learning loop. Checking today's Pokémon after your solve shows you the attributes you misjudged, and each review sharpens the dex knowledge that compounds into faster solves."
    ]
  },
  'countryle-answer-today': {
    heading: "The Countryle daily archive and its lessons",
    paragraphs: [
      "The Countryle archive is a geography textbook that updates daily, and its lessons compound. Each entry shows a country, its continent, its region, and the feedback pattern of the solve — and reviewing the archive builds the map sense the game tests.",
      "The continental rhythm is the archive's clearest lesson. The daily answers rotate through the continents, and players who track the rhythm can pre-load the right region — European weeks, African weeks, Asian weeks — before the first clue lands.",
      "The border chains are the second lesson. Each archive entry is a chance to learn a country's neighbors, and the border knowledge — Brazil's ten, Germany's nine, the DRC's nine — is the endgame weapon that turns medium-distance feedback into a solve.",
      "Finally, the archive is the practice gym. Every past answer is a puzzle you can replay, and running through old entries builds the distance-band intuition — the 500-kilometer neighbor feel — that makes the daily game faster."
    ]
  },
  'waffle-answer-today': {
    heading: "Waffle daily answers and the swap game's rhythm",
    paragraphs: [
      "Waffle's daily answers follow a rhythm that players learn to ride. The first phase is reconnaissance: find the already-solved words and lock them. The second is the near-miss hunt: fix the rows and columns one or two letters off. The third is the crossing finish: resolve the junctions that tie the remaining words together.",
      "The daily answers reveal the grid's construction habits. Waffle grids interlock densely, with the common letters — R, S, T, N, and the vowels — doing most of the crossing work, and knowing that the crossings favor common letters reshapes your swaps.",
      "The swap economy is the daily lesson. Each answer shows the minimum-swap solution, and studying it teaches you the chain logic — this tile out, that tile in — that keeps your move count low.",
      "Finally, the daily reveal keeps the streak alive. Whether you solved in twenty moves or forty, the answer page is the record of your streak — and the crossing strategy above makes each new grid slightly easier than the last."
    ]
  },
  'waffle-solver': {
    heading: "Waffle solver settings and accuracy tips",
    paragraphs: [
      "The Waffle solver is designed for the daily grid, and a little setup makes it exact. Enter the board exactly as the game shows it — every tile, every letter — and the solver will analyze the twelve word slots with complete accuracy.",
      "The solver's minimal-swap suggestions are the daily lesson. Each recommended swap chain shows you the crossing logic — fixing a row often fixes the column it crosses — and studying the chains builds the swap planning that lowers your move count.",
      "The vocabulary note matters: Waffle uses common five-letter words, and the solver's dictionary matches the game's pool, so its suggestions are always valid placements.",
      "Finally, use the solver as a checker, not a crutch. Arrange your own swaps, run the solver, and see whether the board resolves — when it does not, the solver's corrections show you exactly which crossing you misjudged."
    ]
  },
  'word-ladder-solver': {
    heading: "Word ladder variants and solver settings",
    paragraphs: [
      "Word ladders come in variants, and the solver handles the main ones. The classic four-letter ladder is the default, but the same logic applies to five-, six-, and seven-letter ladders — the graph just gets bigger and the paths longer.",
      "Dictionary selection matters. The standard English dictionary is right for most puzzles, but some games use a themed or restricted list, and matching the solver's dictionary to the game's makes every rung valid.",
      "The shortest-path guarantee is the solver's superpower: because it uses breadth-first search, the ladder it returns is provably minimal. No human shortcut exists for a shorter chain — a fact that settles the 'can you do it in fewer steps?' debate instantly.",
      "Finally, use the solver's paths as a learning tool. Studying the routes between classic pairs — COLD to WARM, LOVE to HATE — teaches the vowel rotations, the consonant chains, and the bridge words that make you a better ladder-builder by hand."
    ]
  },
  'betweenle-answer-today': {
    heading: "The Betweenle archive and the pattern library",
    paragraphs: [
      "The Betweenle archive is a pattern library that updates daily, and its lessons compound. Each entry shows the answer, the two clues, and the between-relationship — and reviewing the archive builds the pattern recognition the game tests.",
      "The relationship types are the archive's clearest lesson. Some answers sit alphabetically between their clues, others semantically, others numerically — and tracking the types across a week shows you which the game favors and which you should practice.",
      "The vocabulary bias is the second lesson. Betweenle favors common words with clear midpoints, and the archive confirms the pool's shape — everyday vocabulary rather than obscure terms — so the famous candidate wins when you are down to two.",
      "Finally, the archive is the practice gym. Every past answer is a puzzle you can replay, and running through old entries builds the betweenness intuition — the scale-naming, the midpoint-finding, the relationship-reading — that makes the daily game faster."
    ]
  },
  'phoodle-solver': {
    heading: "Phoodle solver settings and the food dictionary",
    paragraphs: [
      "The Phoodle solver is built around a food-specific dictionary, and that is its superpower: every candidate it suggests is a real food word, so its filtering is far tighter than a generic Wordle solver's. The food lane is the whole game, and the solver never leaves it.",
      "The solver's food-word letter frequencies drive its recommendations. It knows that ingredients and dishes are heavy on S, T, R, P, C, and K, with A and O the dominant vowels — so its suggested guesses cover the letters that actually appear in food vocabulary.",
      "For daily play, run the solver alongside the game: make your guess, enter the feedback, and let it filter the food pool. Most daily puzzles narrow to a handful of candidates within three guesses.",
      "Finally, use the solver's candidate list as a vocabulary coach. Reading the food words that survive each filter teaches you the pool's shape — the ingredients, the dishes, the kitchen verbs — and that vocabulary makes you faster even without the tool."
    ]
  },
  'globle-answer-today': {
    heading: "The Globle daily reveal and the color-map lesson",
    paragraphs: [
      "The Globle daily reveal is more than an answer — it is a color-map lesson. Each reveal shows you the country and the color gradient your guesses produced, and reviewing the daily reveals builds the distance-to-color intuition the game tests.",
      "The gradient reading is the core skill. A green-adjacent guess means you are in the neighborhood; a deep red means the far side of the planet — and each daily reveal is a worked example of that mapping, from first guess to final answer.",
      "The continental rhythm is the second lesson. Globle answers rotate through the continents, and players who track the pattern can pre-load the right region before the first guess lands.",
      "Finally, the daily reveal keeps the streak alive. Whether you solved in two or needed the full six, the answer page is the record of your streak — and the color-map strategy above makes each new puzzle slightly easier than the last."
    ]
  },
  'semantle-answer-today': {
    heading: "The Semantle daily reveal and the word-space lesson",
    paragraphs: [
      "The Semantle daily reveal is a word-space lesson in one entry per day. Each reveal shows the mystery word and the similarity scores of the guesses that led to it — a map of the semantic neighborhood the game constructed.",
      "The ranking lesson is the core skill. A guess that scored high tells you the answer lives in its semantic neighborhood; a guess that scored low tells you nothing. Each daily reveal is a worked example of that mapping, from first guess to final answer.",
      "The word-category rhythm is the second lesson. Some days the answer is abstract, others concrete, others emotional — and tracking the categories across a week shows you the semantic space's shape and which corners the game visits.",
      "Finally, the daily reveal keeps the streak alive. Whether you solved in twenty guesses or needed all hundred, the answer page is the record of your streak — and the similarity-compass strategy above makes each new puzzle slightly easier than the last."
    ]
  },
  'minesweeper-solver': {
    heading: "Minesweeper solver use cases beyond the game",
    paragraphs: [
      "The minesweeper solver is more than a game tool — it is a logic-teaching instrument. Students learning deduction see the boundary-count rule applied instantly, and the solver's moves demonstrate exactly how each revealed number constrains its neighbors.",
      "The pattern library is the second teaching value. The solver recognizes the 1-2-1 corners, the 1-2-2-1 walls, and the cluster patterns that recur across boards — and watching it apply them builds the same pattern recognition in the player.",
      "The probability calculation is the third lesson. When logic stalls, the solver computes the safest guess rather than clicking randomly, and that expected-value thinking transfers to any decision under uncertainty.",
      "Finally, use the solver to verify your own deductions. Solve a board as far as you can, then run the solver and compare — the divergence is almost always a pattern you missed, and each comparison sharpens the logic you bring to the next board."
    ]
  },
  'betweenle-solver': {
    heading: "Betweenle solver use cases and the daily partnership",
    paragraphs: [
      "The Betweenle solver is designed to partner with the daily puzzle. Open the game, read the two clues, and let the solver generate the between-candidates — then make the most central guess and read the feedback. The solver narrows the relationship; you name the word.",
      "The solver's candidate generation teaches the betweenness types. Watching it produce alphabetical midpoints, semantic bridges, and numeric means in the same puzzle shows you the full space of possible answers — and that awareness makes you a better solver even without the tool.",
      "The archive mode is the practice gym. Run the solver on past puzzles and compare its candidates to the actual answers — the divergence is almost always a relationship type you would not have considered.",
      "Finally, use the solver as a dispute settler. When two players disagree about whether a word 'sits between' the clues, the solver's candidate list — generated from every betweenness type — is the ground truth."
    ]
  },
  'squaredle-solver': {
    heading: "Squaredle solver settings and daily practice",
    paragraphs: [
      "The Squaredle solver is built for the daily grid, and a little setup makes it complete. Enter the grid exactly as the game shows it — every letter in every cell — and the solver will find every valid word, including the hidden theme word.",
      "The theme word is the daily prize, and the solver's list surfaces it along with its letter-sharing companions. Studying those words teaches you the grid's construction — how the theme word's letters anchor the other finds — and that awareness improves your manual scanning.",
      "The solver's exhaustive search is the discipline lesson. It never skips a diagonal, never misses a rare letter, never abandons a path early — and watching its complete list shows you exactly which finds your own scan skips.",
      "Finally, use the solver as a daily checker. Find as many words as you can on your own, run the solver, and compare — the words you missed are the ones your eye pattern does not see, and each comparison sharpens your scanning."
    ]
  },
  'contexto-answer-today': {
    heading: "The Contexto daily reveal and the ranking lesson",
    paragraphs: [
      "The Contexto daily reveal is a semantic-distance lesson in one entry per day. Each reveal shows the mystery word and the ranking of the guesses that led to it — a map of the semantic space the game constructed.",
      "The ranking lesson is the core skill. A guess that ranked 5 tells you the answer is nearly its neighbor; a guess that ranked 1,000 tells you nothing. Each daily reveal is a worked example of that mapping, from first guess to final answer.",
      "The domain rhythm is the second lesson. Some days the answer is a kitchen word, others a tech word, others an emotion — and tracking the domains across a week shows you the word-space's shape and which corners the game visits.",
      "Finally, the daily reveal keeps the streak alive. Whether you solved in ten guesses or needed all six, the answer page is the record of your streak — and the ranking-compass strategy above makes each new puzzle slightly easier than the last."
    ]
  },
  'quordle-solver': {
    heading: "Quordle solver settings and multi-board tactics",
    paragraphs: [
      "The Quordle solver is built for the four-board reality, and a little setup makes it precise. Enter the feedback from all four boards — the solver treats them as simultaneous constraints, which is exactly how a human player should think too.",
      "The multi-board information economy is the solver's core lesson. It scores candidates by how much information they extract across all four boards, not by how close they are to any single answer — and players who copy that mindset solve faster than players who chase one board at a time.",
      "The coverage balance is the second lesson. Four answers often share vowel patterns, so the solver balances vowel and consonant coverage across the four patterns — teaching you to read the shared structure of the four boards.",
      "Finally, use the solver as a daily coach. Solve as far as you can on your own, then compare your next-guess choice to the solver's — the divergence is almost always a board-coverage calculation you missed."
    ]
  },
  'colordle-answer-today': {
    heading: "The Colordle daily rhythm and the streak system",
    paragraphs: [
      "Colordle's daily puzzle follows the daily-game rhythm, and the streak system is the engine that keeps players coming back. The daily reveal page is the record of that streak — the current answer, the day number, and the archive of every past color.",
      "The day-numbering system is worth understanding. Colordle puzzles are numbered sequentially, and the numbers let players cross-reference answers across sites and dates — the same habit that powers the Wordle community's daily discussions.",
      "The daily reveal with its hex value is the confirmation every solve needs. Whether you solved in four or needed the reveal, the answer page settles the day — and the hex lets you compare your final guess against the exact shade.",
      "Finally, the archive is the practice gym. Every past answer is the same palette and the same rules, and running through old puzzles builds the component-filtering intuition — green locks, yellow steers, gray bans — that makes the daily game faster."
    ]
  },
  'nerdle-answer-today': {
    heading: "The Nerdle daily archive and the equation coach",
    paragraphs: [
      "The Nerdle archive is an equation coach that updates daily, and its lessons compound. Each entry shows the daily equation, its structure, and the characters it used — and reviewing the archive builds the equation-space intuition the game tests.",
      "The form distribution is the archive's clearest lesson. Two-term sums dominate, subtraction appears regularly, and multiplication and division are rarer — so the archive confirms that a sum-form first guess is the statistically best opener.",
      "The character census is the second lesson. The archive shows which digits and operators recur — the workhorse 1, 2, 0, and 5, the rarer 8, 9, and 7 — and that census shapes every opener you choose.",
      "Finally, the archive is the practice gym. Every past equation is a puzzle you can replay, and running through old entries builds the feedback discipline — green locks, purple relocates, black bans — that makes the daily game faster."
    ]
  },
  'wordle-solver': {
    heading: "Wordle solver settings and the daily partnership",
    paragraphs: [
      "The Wordle solver is designed to partner with the daily game, and a little setup makes it precise. Set your word length, choose your mode, and run it alongside your play: make your guess, enter the feedback, and let it suggest the next move.",
      "The daily partnership works best when you solve first and check second. Make your guess, then compare it to the solver's top pick — the divergence is almost always a letter-frequency or pattern-matching lesson, and each comparison sharpens your own strategy.",
      "The solver's candidate ranking teaches the decision rules: lock greens, relocate yellows, ban grays, and when the pool is short, guess the most common word. Those rules are the entire game, made visible.",
      "Finally, use the archive for study. Running past answers through the solver reveals the pool's tendencies — the common vowels, the everyday vocabulary — and that knowledge compounds into faster daily solves, day after day."
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
