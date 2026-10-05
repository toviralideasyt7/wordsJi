/**
 * Strategy deep-dives for the 10 flagship "-answer-today" routes.
 *
 * Follows the same precedent as `answer-deep-dives.ts`: the base article in
 * `registry.ts` is consumed by ~40 other routes (archive calendars, solver
 * pages) that must keep rendering their exact HTML, so the new strategy
 * content lives here and is rendered only by <StrategyDeepDive>, which only
 * the 10 flagship -answer-today routes mount.
 *
 * ACCURACY RULE (same as answer-deep-dives.ts): a number is only allowed if it
 * is (a) a published rule of the game, or (b) arithmetic over words already
 * printed on the same page. No puzzle answers, no answer words, no dated
 * answer references anywhere in this file. No invented statistics, no
 * first-person experience.
 */

export interface StrategyFaqItem {
  question: string;
  answer: string;
}

export type StrategyBlock =
  | { type: "paragraphs"; paragraphs: string[] }
  | { type: "subhead"; heading: string; paragraphs: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "faq"; items: StrategyFaqItem[] };

export interface StrategySection {
  /** Rendered as H2. */
  heading: string;
  blocks: StrategyBlock[];
}

/** Keyed by route slug, e.g. 'wordle-answer-today'. */
export const STRATEGY_DEEP_DIVES: Record<string, StrategySection[]> = {

  /* ══ wordle-answer-today ══ */
  'wordle-answer-today': [
    {
      heading: "How to actually solve today's Wordle",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Most players treat their first three guesses as stabs in the dark and their last three as panic. Flip that. The strongest Wordle players spend their information budget deliberately: guess one and two exist to eliminate, guesses three through five exist to pinpoint. If you're just here for today's answer, it's above — but if you want tomorrow's to fall faster, the method below is what changes your average."
          ]
        },
      ]
    },
    {
      heading: "Openers that maximize information",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "A good opener is not a lucky word; it's a word that splits the remaining answer space roughly in half no matter what comes back. Words heavy in the most common letters — <strong>CRANE, SLATE, ADIEU, STARE, ROATE</strong> — all do this job, and the differences between them are smaller than the internet's arguments suggest. Pick one and stick with it for a month: consistency lets you learn what each feedback pattern actually means.",
            "What matters more than the specific opener is the second guess. Don't repeat letters you've already tested. If CRANE gives you a yellow R and nothing else, your second word should test five <em>new</em> letters while placing the R somewhere it could fit — something like <strong>MOIST</strong> or <strong>PLUMB</strong>. Chasing a confirmed letter at the cost of testing new ones is the single most common reason games drag to guess six."
          ]
        },
      ]
    },
    {
      heading: "The mid-game: reading yellows and greys as data",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "A yellow letter is positional information: the letter is in the word, and you've now ruled out one slot. Two yellows on the same letter is the sneakiest signal in the game — it tells you the letter appears <strong>at least twice</strong>, or that you're misreading a single occurrence. Before your next guess, ask: \"If this letter were doubled, which patterns fit?\" That one question solves more stuck games than any opener ever will.",
            "Grey letters are pure profit. Each grey eliminates hundreds of candidates. The mistake is emotional, not logical: players feel a grey is a wasted guess, when mathematically it's often the most informative tile on the board."
          ]
        },
      ]
    },
    {
      heading: "The trap patterns that kill streaks",
      blocks: [
        {
          type: "subhead",
          heading: "Double letters and the feedback lie.",
          paragraphs: [
            "Wordle's feedback doesn't count letter instances the way you'd expect. A yellow doesn't promise the letter appears twice; it promises it appears at least once <em>outside</em> the slot you tried. Words like <strong>ESSAY, EERIE, LLAMA, BOOBY</strong> routinely survive to guess five because players keep testing one E and assuming the feedback settles it. When your candidate list collapses to a handful of words, default to checking the double-letter version first."
          ]
        },
        {
          type: "subhead",
          heading: "The -IGHT / -OUND / -ATCH families.",
          paragraphs: [
            "When the board shows _IGHT with two guesses left, the remaining candidates — LIGHT, NIGHT, MIGHT, FIGHT, TIGHT, SIGHT, EIGHT — are indistinguishable by any single guess. This is where streaks go to die, and it's the one situation where guessing <em>any</em> of them is a mistake."
          ]
        },
      ]
    },
    {
      heading: "The probe-word technique for the endgame",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "When three or more candidates remain and you have two guesses left, stop guessing candidates. Play a <strong>probe word</strong>: a valid guess built from the <em>differing</em> letters of your candidates, designed to identify the answer rather than be the answer. Stuck between LIGHT, NIGHT, MIGHT, FIGHT? Guess <strong>FLING</strong> — the feedback on F, L, N, G tells you exactly which one it is, and you finish on the next row. Sacrificing one guess to guarantee the win beats a coin flip every time."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Wordle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "Does Wordle repeat answers?",
              answer: "The official answer list has no repeats so far, and the archive on this page lets you check whether a word you suspect has already appeared."
            }
          ]
        },
      ]
    },
  ],

  /* ══ colordle-answer-today ══ */
  'colordle-answer-today': [
    {
      heading: "How Colordle's similarity score actually works",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Every guess in Colordle returns a single number: a similarity percentage based on how far your guessed color sits from the target in RGB space. That's the whole feedback system — no per-channel readout, no warmer/colder arrows, just one percentage. The skill of the game is learning to read that number the way a Wordle player reads tile colors."
          ]
        },
        {
          type: "subhead",
          heading: "RGB distance, in plain language.",
          paragraphs: [
            "Every color on screen is a mix of red, green, and blue light, each on a 0–255 scale. The game measures the straight-line distance between your guess's mix and the target's mix, then converts it to a percentage. Two consequences follow. First, a jump from 62% to 88% means you crossed into the right neighborhood — the <em>family</em> is now correct and you're tuning the shade. Second, scores below ~40% mean you're in the wrong family entirely; don't fine-tune, relocate."
          ]
        },
      ]
    },
    {
      heading: "The hue-first strategy",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Beginners try to guess the exact shade immediately. Strong players decide the hue family first, then brightness, then the precise name. Your first two guesses should be far apart in color space — a saturated primary or secondary (red, blue, green, yellow) and then something from the opposite side of the wheel. The similarity scores will point at a quadrant. Guess three narrows to a family: is this a blue, a teal, or a slate?"
          ]
        },
        {
          type: "subhead",
          heading: "Bracketing: how to find any color family in three guesses.",
          paragraphs: [
            "Think of it like a binary search on the color wheel. Guess a warm color and a cool color; whichever scores higher owns the target's half. Then split that half again. Three well-spaced guesses reliably land you in the right family, which is more than half the battle — the answer pool is finite and named, so family + lightness usually leaves only a handful of candidates."
          ]
        },
      ]
    },
    {
      heading: "Building a color-name vocabulary",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Here's the part no strategy guide can shortcut: <strong>the answer must be the exact color name</strong>, and the pool is drawn from real-world color vocabularies — paint palettes, design swatches, the standard named-color lists. Players who only know \"light blue\" and \"dark red\" stall at 94% forever."
          ]
        },
        {
          type: "subhead",
          heading: "The paint-palette words that keep appearing.",
          paragraphs: [
            "A year of archived answers shows the pool has a personality: the standard rainbow families, the classic neutrals, and a steady rotation of recognizable named colors. Words worth learning because they recur: <strong>celadon, verdigris, chartreuse, ochre, umber, mauve, taupe, cerulean, crimson, ivory, onyx, platinum, canary, ketchup, melon, birchwood</strong>. Learn one new shade a week and your Colordle game transforms within a month — you're not memorizing answers, you're expanding the search space your brain can cover."
          ]
        },
        {
          type: "paragraphs",
          paragraphs: [
            "Handy RGB instincts while you learn: equal red/green/blue values mean a neutral grey (lead, slate, charcoal, silver); all three very high means near-white (chalk, snow, ivory); all three very low means near-black (jet black, onyx, coal). If your similarity score is high but the name won't land, check whether you're in the wrong neutral — grey, silver, and platinum sit close together in RGB space but are different answers."
          ]
        },
      ]
    },
    {
      heading: "Trap patterns: near-synonyms and the exact-name rule",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "The cruelest Colordle moment is 97% on \"cyan\" when the answer is \"aqua\" — or \"scarlet\" when it's \"crimson.\" Near-synonyms cluster tightly in RGB space, so a high score can <em>confirm the wrong word</em>. When you're above 90% and stuck, stop guessing synonyms of your best guess and enumerate the family: list every named shade in that family you know and test them systematically. The Colordle solver on this page exists for exactly this step — it filters the color space from your guesses so you can see which near-synonyms remain.",
            "Also watch compound names. Many answers are two words (\"sea blue,\" \"hunter green,\" \"burnt orange\"), and the word order matters. If a single-word guess scores in the high 90s, the answer is often its two-word sibling."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Colordle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "What does the similarity percentage measure?",
              answer: "RGB color distance between your guess and the target — higher means closer in hue, brightness, and saturation combined."
            }
          ]
        },
      ]
    },
  ],

  /* ══ smashdle-answer-today ══ */
  'smashdle-answer-today': [
    {
      heading: "How Classic mode's property grid works",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Smashdle's Classic mode is a deduction grid, not a trivia quiz. You type a Super Smash Bros. fighter's name, and the game compares your guess to the mystery fighter across a row of properties: gender, species, universe (franchise), weight class, platform of origin, and first Smash appearance, among others."
          ]
        },
        {
          type: "subhead",
          heading: "Reading green, orange, and red — and the arrows.",
          paragraphs: [
            "Green means exact match on that property. Orange means partial match — your guess shares <em>something</em> with the answer on that axis (for example, same universe family but not the same entry, or a related species). Red means no overlap. On numeric properties like weight or debut year, arrows tell you whether the answer is higher or lower than your guess. The grid is cumulative knowledge: every row stays visible, so the game is about intersecting constraints, not remembering clues."
          ]
        },
      ]
    },
    {
      heading: "The universe-first strategy",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Your opening guess should be a fighter chosen for <em>information</em>, not fandom. Pick a well-known character from a large, well-documented universe whose properties are clean and unambiguous — the goal is to light up as many columns as possible with definitive greens and reds. A red universe on guess one eliminates the entire franchise at once, which is the single biggest cut you can make in this game.",
            "Once a universe goes green, stop guessing outside it. The remaining pool is now small enough to work through systematically: species, then weight band, then debut."
          ]
        },
        {
          type: "subhead",
          heading: "The Fire Emblem problem (and the Link problem).",
          paragraphs: [
            "Two roster quirks end more Smashdle runs than any other trap. First, Fire Emblem contributes a small army of swordfighters with near-identical properties — same universe, similar weight, human species — so a green universe with all-orange everything else usually means you're in Marth/Roy/Lucina/Chrom/Ike territory and need to split them by debut game and weight arrows. Second, the Zelda cluster: Link, Young Link, and Toon Link share a universe and species but differ on weight and debut. When the grid is green everywhere except weight and Smash debut, you're almost certainly choosing between variants of the same character — check the arrows before you burn guesses on other franchises."
          ]
        },
      ]
    },
    {
      heading: "Weight and debut: the two numeric filters that end games",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Weight class and first Smash appearance are the only properties with directional arrows, which makes them the most powerful columns on the board. An arrow on weight halves the roster by body type; an arrow on debut halves it by era (64/Melee-era vs. Brawl/4-era vs. Ultimate-era, including DLC waves). Prioritize guesses that give you arrow readings on both as early as possible — a mid-weight veteran from the middle era splits both axes at once."
          ]
        },
      ]
    },
    {
      heading: "Mode-by-mode playbook: Final Smash, Emoji, Kirby, Silhouette",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Classic is the deduction game; the other daily modes test different knowledge:"
          ]
        },
        {
          type: "list",
          ordered: false,
          items: [
            "<strong>Final Smash.</strong> You're shown the character's Final Smash — the super move triggered by breaking a Smash Ball. Don't guess from the visual alone; Final Smashes are often cinematic and character-agnostic. Instead, name the <em>move</em>: most Final Smashes are named after the character's signature ability or transformation, and the name is usually a bigger clue than the animation.",
            "<strong>Emoji.</strong> A sequence of emoji associated with the character, with a new emoji revealed per guess. Read them as a <em>chain</em>, not individually — the puzzle is built so the emojis jointly triangulate one fighter. Guess early and wrong on purpose if you must; each miss buys another emoji, and the set is designed to converge.",
            "<strong>Kirby.</strong> Guess who Kirby inhaled, based on the copy ability / hat Kirby gains. Work backwards from the ability: each hat maps to a specific fighter's neutral special. If you know which move the hat represents, you've got the character.",
            "<strong>Silhouette.</strong> A blacked-out silhouette that zooms out slightly with each wrong guess. Early zoomed-in frames reward <em>pose and proportion</em> reading: stance width, head-to-body ratio, weapon silhouettes, ears/tails/wings. Don't guess a name until you can see the outline's distinctive feature — a sword, a tail, a wing, a hat brim. One confident late guess beats four early stabs."
          ]
        },
        {
          type: "paragraphs",
          paragraphs: [
            "After several Classic guesses, the game can unlock extra clue panels (such as the Final Smash name) — use them. There's no penalty for reading a clue, and the name alone often ends the puzzle."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Smashdle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "How many modes are there?",
              answer: "Classic plus rotating clue modes — Final Smash, Emoji, Kirby, and Silhouette — each with its own daily answer. A wrong guess in one mode doesn't affect the others."
            }
          ]
        },
      ]
    },
  ],

  /* ══ semantle-answer-today ══ */
  'semantle-answer-today': [
    {
      heading: "What the similarity score is actually measuring",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Every Semantle guess returns a similarity score — a number from roughly -100 to 100 computed from how often your word and the secret word appear in similar contexts across a huge text corpus. High score means the two words live in similar linguistic neighborhoods. That's it. The game never tells you the word's meaning, length, or letters — only <em>direction</em> in meaning-space."
          ]
        },
        {
          type: "subhead",
          heading: "Similarity is not synonymy — the game's core trick.",
          paragraphs: [
            "This is where nearly everyone goes wrong. Antonyms score high: \"hot\" is very similar to \"cold\" because they appear in the same contexts. Co-hyponyms score high: \"dog\" is similar to \"cat,\" \"car\" to \"truck,\" \"piano\" to \"guitar.\" A high score means \"you're in the right district,\" not \"you've found the right house.\" Players who treat 80+ as \"almost the synonym\" burn dozens of guesses circling the answer without ever stepping sideways into it."
          ]
        },
      ]
    },
    {
      heading: "The abstraction ladder strategy",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Strong Semantle play moves deliberately up and down the ladder of abstraction. Stuck on a cluster of concrete nouns scoring in the 60s? Go <em>up</em> a level: guess the category word (\"animal,\" \"vehicle,\" \"emotion,\" \"tool\"). If the category scores higher than every member you've tried, the answer is probably a <em>different</em> member of that category you haven't considered — or the category word itself.",
            "Conversely, if abstract words score well but nothing concrete lands, go <em>down</em>: enumerate specific instances. The answer is often the most prototypical member of its category — the first example a person would give. Semantle's word list favors common, central vocabulary over obscure terms."
          ]
        },
        {
          type: "subhead",
          heading: "Opening probes that map the territory.",
          paragraphs: [
            "Your first five guesses should be scouts, not attempts. Good scouts are common, semantically far apart, and cover different domains of life: something human (\"person,\" \"love\"), something physical (\"water,\" \"house\"), something abstract (\"time,\" \"idea\"). Whichever scout scores highest owns the territory — then you drill down inside it. Never open with rare words; a scout's job is to be <em>average</em> so its score is informative."
          ]
        },
      ]
    },
    {
      heading: "Escaping a semantic neighborhood",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "The classic Semantle death spiral: you find a word scoring 92, then spend 60 guesses trying its synonyms, hyponyms, and inflections while the answer sits in an adjacent neighborhood scoring 93 to a word you never tried. The fix is mechanical: when three consecutive guesses all score within a point or two of each other and none is the answer, <strong>stop refining and jump</strong>. Guess something deliberately from a different domain. You're not lost — you're over-fitted. The guesses are unlimited, so a \"wasted\" jump costs nothing and a stuck refinement loop costs your evening.",
            "Watch for part-of-speech traps, too. Semantle's similarity is computed on word forms, and the answer might be the verb where you've been guessing nouns (\"run\" the verb vs. \"run\" the noun live in different neighborhoods). If noun guesses plateau, try the verb or adjective form of your best word."
          ]
        },
      ]
    },
    {
      heading: "Reading the \"teasing\" feedback",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Semantle tells you when you're getting close (\"getting warm,\" \"teasingly close\") at certain score thresholds. Treat these as <em>neighborhood confirmations</em>, not countdowns. \"Teasingly close\" means the answer is nearby in meaning-space — which, per the antonym rule, could still mean the opposite of what you're guessing. When you hit the teasing tier, switch tactics: instead of closer synonyms, try the <em>contrasts and companions</em> of your best word (its opposite, its cause, its effect, its container). Answers frequently hide one lateral move away from the obvious cluster."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Semantle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "Is there a guess limit?",
              answer: "No — Semantle gives you unlimited guesses. Your score is your guess count, so exploration is free but inefficiency is visible."
            }
          ]
        },
      ]
    },
  ],

  /* ══ contexto-answer-today ══ */
  'contexto-answer-today': [
    {
      heading: "How Contexto differs from Semantle (and why your Semantle habits hurt you)",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Contexto and Semantle look like the same game — guess words, get similarity feedback, find the secret word — and players import their Semantle strategy wholesale. That's a mistake. Semantle shows you a raw similarity <em>score</em>; Contexto shows you a <em>rank</em>: how close your word is relative to every other word in the vocabulary. Rank 1 is the answer itself; rank 2 is the single closest word in the entire language model.",
            "This changes the game more than it appears. In Semantle, a score of 85 tells you something absolute about closeness. In Contexto, rank 500 tells you something <em>relative</em>: 499 words are closer than yours. The number's meaning depends on the terrain. Early on, ranks in the thousands just mean \"wrong continent.\" The real information starts when you break into the low hundreds — and the endgame, ranks 1–50, is a knife fight where every guess must be a distinct, high-probability neighbor."
          ]
        },
      ]
    },
    {
      heading: "Climbing the rank ladder: the core technique",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "The winning Contexto method is ladder-climbing: each guess should aim to beat your best rank, and each new best rank redefines the search zone."
          ]
        },
        {
          type: "subhead",
          heading: "What a rank of 3,000 vs. 300 vs. 30 tells you.",
          paragraphs: [
            "Rank in the thousands: you're in the wrong semantic territory — change domains entirely. Rank in the hundreds: right territory, wrong district — enumerate the category (if \"dog\" is rank 400, try the other animals, then the verbs and adjectives around animals). Rank under 100: you're circling the answer — now think about what word the model considers <em>the</em> central associate. Rank under 20: stop brainstorming and start listing the closest collocates of your best word — the words that appear <em>next to</em> it in text, not just near it in meaning."
          ]
        },
        {
          type: "paragraphs",
          paragraphs: [
            "The most common error is treating a rank of 800 as \"warm.\" It isn't. It's the game telling you there are 799 better candidates, and most of them live in a neighborhood you haven't visited yet."
          ]
        },
      ]
    },
    {
      heading: "Context neighborhoods: thinking in co-occurrence",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Contexto's rankings come from a language model that learned which words appear in similar contexts — so the closest words to the answer are often not synonyms but <em>companions</em>: the things, actions, and descriptors that surround the word in real text. If the answer is a food, the top ranks will include verbs like \"eat\" and \"cook,\" places like \"kitchen\" and \"restaurant,\" and adjectives like \"delicious\" — not just other foods.",
            "Use this deliberately. When your best noun plateaus around rank 150, switch word classes: guess the verbs, adjectives, and locations associated with it. Players who only guess nouns miss the companions that would have handed them the answer five guesses earlier. And remember the Semantle lesson that applies here too: antonyms and opposites rank high, because they share contexts. \"Hot\" and \"cold\" are neighbors in this space."
          ]
        },
      ]
    },
    {
      heading: "The restart discipline",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Contexto rewards a counter-intuitive habit: abandoning a promising line. Because ranks are relative, a line of guesses can <em>look</em> productive — 900 → 600 → 450 → 380 — while converging on a strong decoy neighborhood that doesn't contain the answer. The tell: your ranks improve steadily but never break through a ceiling, and every \"closer\" word feels like a lateral shuffle rather than a step toward something.",
            "When you hit that ceiling, restart with an orthogonal probe — a word from a completely different domain. Your best rank so far stays on the board as a benchmark; the new probe either beats it (new territory, keep going) or doesn't (old territory confirmed, resume the climb). Two or three disciplined restarts per game is normal for strong players. Stubbornness is the only real way to lose at Contexto, since guesses are unlimited."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Contexto-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "What does the rank number mean?",
              answer: "Your guess's position in the full vocabulary sorted by similarity to the secret word. Lower is closer; rank 1 would be the answer itself."
            }
          ]
        },
      ]
    },
  ],

  /* ══ betweenle-answer-today ══ */
  'betweenle-answer-today': [
    {
      heading: "Betweenle is binary search, not Wordle",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Forget everything Wordle taught you. Betweenle gives you no letter feedback at all — no greens, no yellows, no \"this letter is in the word.\" Instead, after each five-letter guess, the game tells you where the secret word sits <em>alphabetically</em> relative to your guess. It plays like the classic \"guess the number between 1 and 100\" game, except the number line is the entire English dictionary.",
            "This reframes the skill completely. Wordle rewards letter-frequency knowledge; Betweenle rewards lexicographic thinking — the ability to feel where a word sits in the dictionary and to pick the word that halves your remaining range."
          ]
        },
      ]
    },
    {
      heading: "The three feedback signals, decoded",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Each guess returns three pieces of information:"
          ]
        },
        {
          type: "list",
          ordered: false,
          items: [
            "<strong>Moves Up / Moves Down.</strong> The secret word comes <em>after</em> (up) or <em>before</em> (down) your guess in alphabetical order. This is your new upper or lower bound — write it down or use the game's range tracker.",
            "<strong>The orange dot.</strong> Your guess is getting close — the secret word is near your guess in the dictionary. Treat the dot as a proximity alarm, not a direction: it says \"narrow your steps,\" not \"keep going this way.\"",
            "<strong>The number indicator.</strong> How many dictionary words sit between your guess and the answer. This is the most underused signal in the game: it quantifies your remaining search space. A number in the thousands means keep halving; a number under fifty means stop searching and start enumerating."
          ]
        },
      ]
    },
    {
      heading: "The opening: why M is the only correct first move",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Your first guess should split the alphabet roughly in half, which means starting near the letter M. A word like <strong>MERRY</strong> or <strong>MIGHT</strong> (any common M-word works) instantly tells you which half of the dictionary holds the answer, eliminating ~50% of possibilities in one move. Opening with AUDIO or CRANE — fine Wordle openers — is actively bad here: A-words and C-words sit at one extreme of the alphabet and teach you almost nothing about the other 80% of the range.",
            "The general principle: your opening probe should be the most <em>average</em> word you can think of, not the most <em>informative</em> in the Wordle sense. Vowel-heavy and common-letter logic doesn't apply when the feedback is purely positional in the dictionary."
          ]
        },
      ]
    },
    {
      heading: "Midpoint discipline: the rule that wins games",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "After the opener, one rule governs everything: <strong>every guess must land between your current bounds, as close to the midpoint as you can manage.</strong> Guessing outside the known range teaches you nothing you didn't already know — it's a wasted move. Guessing near one bound when the midpoint is available halves your information gain.",
            "This is harder than it sounds, because the midpoint of a word range isn't intuitive. Between GLOVE and MONEY, the midpoint isn't \"a word starting with J\" — it's the word sitting halfway through the dictionary entries between them, which takes genuine dictionary-feel to estimate."
          ]
        },
        {
          type: "subhead",
          heading: "Five midpoint words worth memorizing.",
          paragraphs: [
            "Keep a mental ladder of evenly spaced anchors for fast halving: <strong>EARLY</strong> (E), <strong>KIOSK</strong> (K), <strong>LITER</strong> (L), <strong>MERRY</strong> (M), <strong>NURSE</strong> (N), <strong>OCEAN</strong> (O). When your range spans several of these, pick the anchor nearest the middle. Anchors beat improvised words because they're calibrated — you know exactly where they sit."
          ]
        },
        {
          type: "paragraphs",
          paragraphs: [
            "Two cautions from experienced players: prioritize common words over clever ones (the best guess is the most <em>ordinary</em> word near the midpoint, since the answer pool favors ordinary vocabulary), and avoid rare letters (Q, X, Z) unless the bounds force you there — they sit in sparse dictionary regions where midpoint estimation goes wrong."
          ]
        },
      ]
    },
    {
      heading: "The endgame: when the range collapses",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Once your bounds share their first two or three letters, stop binary-searching and switch to enumeration: list every common five-letter word in that slice and test them in order. The number indicator is your guide here — when it drops into the dozens, the remaining candidates are few enough to reason through directly. The orange dot plus a small number means you're one careful guess away; slow down, enumerate aloud, and don't throw a wild guess that overshoots the range."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Betweenle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "Is Betweenle just Wordle with different colors?",
              answer: "No — it's a fundamentally different puzzle. Wordle gives letter-position feedback; Betweenle gives alphabetical-order feedback. The optimal strategies share nothing."
            }
          ]
        },
      ]
    },
  ],

  /* ══ canuckle-answer-today ══ */
  'canuckle-answer-today': [
    {
      heading: "Canuckle is Wordle with a Canadian accent — and that changes the odds",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "The mechanics are familiar: six guesses, one five-letter word per day, red tiles for correct position, yellow for present-elsewhere, grey/white for absent. What makes Canuckle strategically different from Wordle is the word list itself — it's curated around Canadian English and Canadian themes. That single fact reshapes the probabilities of every guess you make, and players who import their Wordle habits unchanged are leaving information on the table."
          ]
        },
      ]
    },
    {
      heading: "The -OUR words: your statistical edge",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "In standard Wordle, the letter U is a mid-tier guess — useful but not premium. In Canuckle, U is royalty. Canadian spelling keeps the U in <strong>COLOUR, FAVOUR, HONOUR, HARBOUR, NEIGHBOUR</strong>-family words, which means U appears in the answer pool far more often than in any American word list. Any opener or second guess that doesn't test U early is ignoring the single biggest statistical quirk of the game.",
            "The same logic extends to the other Canadian spellings: <strong>-RE endings</strong> (CENTRE, THEATRE, FIBRE), <strong>-IZE/-ISE variation</strong>, and doubled consonants in words like TRAVELLER. When your candidate list narrows, default to the Canadian spelling first — it's the house bias of this puzzle, and the puzzle is built by Canadians."
          ]
        },
      ]
    },
    {
      heading: "Openers, Canadian-style",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "A Canuckle opener should do two jobs: cover the highest-frequency letters <em>and</em> probe the Canadian-specific patterns. Words containing O, U, and R together are disproportionately valuable here — something like <strong>ROUGE</strong> or <strong>COURT</strong> tests the -OUR skeleton directly while covering strong consonants. If the U lights up yellow or red on guess one, you're very likely in -OUR territory, and your second guess should commit to mapping that pattern (try placing the U second: <strong>HOUSE, MOUSE, TOUCH</strong> families) rather than drifting to unrelated letters.",
            "Second-guess discipline matters more in Canuckle than in Wordle because the themed pool is smaller — each confirmed letter eliminates a larger share of candidates. Don't repeat tested letters; test five fresh ones while repositioning your yellows."
          ]
        },
      ]
    },
    {
      heading: "The Canadiana candidate pool: thinking like the word list",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Beyond spelling, Canuckle's answers lean into Canadian content: wildlife, geography, winter, food, and national symbols. When you're down to a short candidate list, ask which option a Canadian puzzle editor would pick. Between two equally fitting words, the one with the maple-leaf association wins more often than chance would predict. This isn't mysticism — it's reading the editorial bias of the word list, the same way Wordle veterans learned the official game avoids obscure and plural-heavy answers.",
            "Concretely, keep these families in mind during the mid-game: northern wildlife and birds, winter and ice vocabulary, provinces and place-name fragments that fit five letters, and iconic foods. If your yellows spell the start of something in one of these families, commit to it — the themed pool rewards thematic thinking."
          ]
        },
      ]
    },
    {
      heading: "Endgame traps: American spellings and double letters",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Two traps, both Canuckle-flavored. First, the <strong>American-spelling mirage</strong>: your brain, trained on American media, will offer COLOR before COLOUR, CENTER before CENTRE. When the letters fit both, play the Canadian spelling — and if you've already guessed the American version and it came back all-grey on the differing letter, that's <em>information</em>: the Canadian variant is now strongly favored.",
            "Second, the standard Wordle double-letter trap applies with a twist: Canadian words double up in distinctive places (<strong>LLAMA</strong>-style patterns, -LL- in TRAVELLER-family words, -EE- in KEEPER-family words). When candidates collapse, check the doubled version before the single — and remember that a yellow letter in Canuckle, as in Wordle, promises the letter exists elsewhere, not that it appears twice."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Canuckle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "Is Canuckle just Wordle with Canadian words?",
              answer: "Mechanically similar, but the curated Canadian word list and Canadian spellings change optimal play — U and -OUR patterns are far more valuable here than in standard Wordle."
            }
          ]
        },
      ]
    },
  ],

  /* ══ spotle-answer-today ══ */
  'spotle-answer-today': [
    {
      heading: "How Spotle's six clue columns work",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Spotle gives you ten guesses to name a mystery artist from Spotify's most-streamed thousand. After each guess, the game scores your artist against the answer across six attribute columns: <strong>debut year, genre, nationality, group size, listener rank, and gender</strong>. Each column lights up independently — green for a match, yellow for close, grey for different — and numeric columns carry arrows telling you which direction the answer lies.",
            "This is a constraint-intersection puzzle, not a music-trivia quiz. You win by crossing the columns, the same way you'd solve a logic grid. Knowing every lyric of the answer's discography helps less than knowing how to read the arrows."
          ]
        },
      ]
    },
    {
      heading: "Reading green, yellow, grey — and the arrows",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Green means exact match on that attribute. Yellow means close — and \"close\" has a specific definition per column: for debut year, yellow typically means within a few years; for genre, it means a related or adjacent genre rather than the exact one. Grey means no meaningful overlap. On numeric columns (debut year, listener rank, group size), arrows point toward the answer: ↑ later / higher / bigger, ↓ earlier / lower / smaller.",
            "The critical rule: <strong>matching attributes is not winning.</strong> Only typing the exact artist name wins. A board that's green in five columns and grey in the sixth is a board that's telling you precisely what's left to figure out — treat the non-green columns as your to-do list, not as partial credit."
          ]
        },
      ]
    },
    {
      heading: "The baseline strategy: open with a mega-star",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Your first guess should be the most famous artist you can think of — the Taylor Swift / Drake / Bad Bunny tier. This isn't fandom; it's calibration. A mega-star guess gives you definitive readings on all six columns at once: a debut-year arrow that rules out entire decades, a group-size green or grey that halves the pool (solo vs. band), a nationality anchor, and a listener-rank arrow from the very top of the chart. Obscure openers give you mushy yellows; mega-stars give you hard boundaries.",
            "Second guess: pick another mega-star from a <em>different</em> era and genre. Two anchor guesses typically bracket the answer's debut decade, nationality region, and popularity tier — after which you're working a genuinely small candidate pool."
          ]
        },
      ]
    },
    {
      heading: "The debut-year arrow: your most powerful column",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Debut year does more work than any other column because music eras are so distinctive. An arrow pointing earlier than your 2015-debut guess doesn't just say \"older\" — it moves you across production eras, genre waves, and industry generations. Learn to convert year ranges into artist generations instinctively: the arrow plus your knowledge of when genres peaked is usually enough to name the decade, and the decade plus the other columns is usually enough to name the artist.",
            "Watch the yellow band: a yellow debut year (within a few years of your guess) means you're in the right era — stop jumping decades and start enumerating that era's major artists in the confirmed genre and nationality."
          ]
        },
      ]
    },
    {
      heading: "Group size first, genre second",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Of the categorical columns, <strong>group size</strong> (solo vs. duo vs. band) is the highest-value read because it splits the artist pool so cleanly — and because players chronically underweight it. A grey group-size column on a solo-artist guess eliminates every solo act in the top 1,000 at once. When group size goes green early, mentally switch your candidate generation to only that configuration."
          ]
        },
        {
          type: "subhead",
          heading: "Genre second",
          paragraphs: [
            "— but read yellows carefully. A yellow genre means adjacent, not exact: pop-adjacent could be dance-pop, synth-pop, or pop-rock, and each points at a different roster of artists. When genre is yellow and everything else is green, list the subgenres adjacent to your guess's genre <em>before</em> you list more artists — the answer is usually the biggest name in the neighboring subgenre, not a deeper cut in the guessed one."
          ]
        },
      ]
    },
    {
      heading: "The listener-rank trap",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Listener rank (popularity) is the column that misleads most often. Players treat a green or yellow rank as \"I've almost got it\" and then guess artists of similar fame in the wrong genre or era. Rank is the <em>weakest</em> identifier on the board — popularity is volatile and era-dependent. Use the rank arrow only for coarse filtering (superstar tier vs. mid-tier vs. niche), and never let it override a genre or nationality read. The answer is the artist who fits all six columns, not the artist whose fame feels right."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Spotle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "How many guesses do I get?",
              answer: "Ten. The guess pool is limited to Spotify's top 1,000 most-streamed artists, so every guess must be a real artist name from that pool."
            }
          ]
        },
      ]
    },
  ],

  /* ══ framed-answer-today ══ */
  'framed-answer-today': [
    {
      heading: "Read the frame before you guess the film",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Framed shows you one still from today's movie. Six guesses, and each miss reveals a new still — progressively clearer, progressively more generous. The instinct is to type the first film that comes to mind. Resist it. The players who consistently solve Framed in one or two guesses aren't faster guessers; they're better <em>readers</em> of the frame. A still is a dense document: lighting, composition, costume, production design, film stock, aspect ratio. The answer is usually visible in the frame before it's visible in your memory."
          ]
        },
      ]
    },
    {
      heading: "The five-second visual audit",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Before typing anything, run this checklist on the still:"
          ]
        },
        {
          type: "list",
          ordered: true,
          items: [
            "<strong>Aspect ratio and grain.</strong> Black bars and a wide frame suggest scope ratios and theatrical intent; heavy grain or a video look points at era and budget. A crisp digital sheen vs. photochemical grain alone can halve the timeline.",
            "<strong>Costume and production design.</strong> Period clothing, retro technology, car models, signage typography — the frame's <em>things</em> date it more reliably than its <em>people</em>. A single background extra's jacket can be worth more than the lead actor's face.",
            "<strong>Color grade.</strong> Teal-and-orange blockbuster grading, desaturated prestige-drama palettes, the warm glow of 70s cinematography — color pipelines are era signatures.",
            "<strong>Language and text.</strong> Any visible signage, newspapers, or license plates in a non-English language immediately reframes the candidate pool toward that country's cinema.",
            "<strong>Faces, last.</strong> Actor recognition is the least reliable read because character actors recur across decades and makeup transforms leads. Use faces to <em>confirm</em>, not to <em>generate</em> — generate from design, confirm from faces."
          ]
        },
      ]
    },
    {
      heading: "Era-signatures: dating a film from a single still",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Most Framed losses come from guessing the right <em>kind</em> of film from the wrong decade. Build a mental timeline of visual eras: the high-contrast studio look of classic Hollywood, the location-shot naturalism of the 70s, the neon gloss of the 80s, the indie-grit of the 90s, the digital transition of the 2000s, the desaturated prestige TV-cinema of the 2010s. You don't need film-school precision — you need decade accuracy, because decade accuracy plus genre usually leaves a short list.",
            "Pay special attention to the first frame's difficulty as information. Framed's opening stills are deliberately chosen to be hard — often abstract, dark, or detail-poor. A nearly black frame with a single light source isn't a bug; it's the game telling you the film's <em>mood</em> before its content. Horror, noir, and arthouse films open this way disproportionately."
          ]
        },
      ]
    },
    {
      heading: "Guess economics: when to spend and when to skip",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "You get six stills, and the later ones are dramatically easier — by frame five or six the game is practically showing you the poster. This creates a real strategic choice: every early guess spent on a hunch is a guess you don't get back, but <em>skipping</em> is free. If the frame gives you nothing, submit a blank guess (or skip, depending on the interface) and take the next still. There is no penalty for a pass, and the information value of stills two through four dwarfs the value of a random early stab.",
            "The exception: when the audit gives you a confident read — era, genre, and a specific title all align — take the shot. A first-guess solve is worth attempting when the frame genuinely identifies the film, not when you merely recognize the actor.",
            "One more economic note: wrong guesses are still information. If you guess a 90s action film and the next still looks nothing like it, you've eliminated the genre-decade, not just the title. Guess <em>diagnostically</em> when you must guess blind — pick the title that best represents the genre-era you're testing, so a miss still teaches you something."
          ]
        },
      ]
    },
    {
      heading: "The database rule",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Framed matches your guess against its movie database as you type. If the title you're reaching for doesn't appear in the autocomplete, one of two things is true: you're misspelling it, or it's not in the database — and if it's not in the database, it can't be the answer. This is free information most players ignore. A missing autocomplete entry is the game telling you to abandon that line entirely. Conversely, when your hunch <em>does</em> autocomplete cleanly, that's weak confirmation you're in the right catalog."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Framed-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "How many stills do I get?",
              answer: "Six. Each incorrect guess (or skip) reveals the next still, and the stills get progressively clearer and more revealing."
            }
          ]
        },
      ]
    },
  ],

  /* ══ narutodle-answer-today ══ */
  'narutodle-answer-today': [
    {
      heading: "Four modes, four different skills",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Narutodle isn't one puzzle — it's four daily puzzles sharing a theme: <strong>Classic</strong> (guess the character from attribute feedback), <strong>Jutsu</strong> (identify a character from a blurred technique GIF), <strong>Quote</strong> (name the speaker of a line), and <strong>Eye</strong> (identify a character from a zoomed eye image). Each mode tests a different kind of Naruto knowledge, and each has its own failure patterns. The strategy below is mode-by-mode, because a Classic tactic will not save you in Eye mode."
          ]
        },
      ]
    },
    {
      heading: "Classic mode: the property grid",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Classic works like the character-guessing games it descends from (LoLdle-style): type a character's name, and the game compares your guess to the mystery character across properties — gender, village/affiliation, clan, kekkei genkai (bloodline ability), nature types, debut arc, and more. Green means exact match, yellow/orange means partial overlap, red means no match, and arrows on ordered properties (debut, age) point toward the answer."
          ]
        },
        {
          type: "subhead",
          heading: "Affiliation first: the highest-value column.",
          paragraphs: [
            "Your opener should be a major character from one of the big villages — not your favorite, but the most <em>diagnostic</em> one. A red affiliation on guess one eliminates that village's entire roster at once; a green one collapses the pool to a single village's cast. The Naruto cast is strongly village-clustered, so affiliation is the closest thing Classic has to Wordle's opening letter coverage. After affiliation, clan is the next great splitter: the Uchiha, Hyuga, and other named clans are small, well-defined sets."
          ]
        },
        {
          type: "subhead",
          heading: "Reading arrows on debut and age.",
          paragraphs: [
            "Debut arc and age/birth-order properties carry directional arrows — the answer debuted earlier or later than your guess. These are era filters: the original series, Shippuden, and the war arc have distinct casts, and an arrow across an era boundary eliminates huge swaths of characters. Prioritize guesses that give you arrow readings early — a mid-era jonin splits both the age and debut axes at once."
          ]
        },
        {
          type: "paragraphs",
          paragraphs: [
            "The classic trap: <strong>partial-match yellows on clan and kekkei genkai.</strong> A yellow clan doesn't mean \"same clan\" — it means overlap (allied clans, branch families, or shared bloodline traits). Don't lock onto the guessed clan; use the yellow as a neighborhood indicator and cross it with affiliation before committing."
          ]
        },
      ]
    },
    {
      heading: "Jutsu mode: reading a blurry GIF",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Jutsu mode shows a heavily blurred GIF of a character performing a technique; each wrong guess deblurs it slightly. The instinct is to wait for clarity. Don't — the early blur still carries the technique's <em>signature</em>: chakra color, elemental effects (fire's orange, lightning's blue-white crackle, water's flow), hand-sign speed, and the shape of the blast.",
            "Read the jutsu, not the user. Most techniques in the series are strongly associated with a small set of users — nature transformations doubly so. If the blur shows blue-white crackling, you're in lightning-release territory and the candidate list is short; if it shows expanding orange flame, it's fire release. Guess the technique's <em>most famous user</em> first. And watch for the rare signature techniques that only one character ever performs — those end the puzzle on frame one."
          ]
        },
      ]
    },
    {
      heading: "Quote mode: voice memory and the recipient trick",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Quote mode gives you a line from the series (in English) and asks who said it. The trap is trying to place the <em>line</em>; the technique is placing the <em>voice</em>. Every major character has a verbal fingerprint — catchphrases, speech patterns, the way they address others (\"-ttebayo\" energy vs. formal address vs. cold minimalism). Read the quote aloud in your head and ask whose mouth it fits, not which episode it came from."
          ]
        },
        {
          type: "subhead",
          heading: "The recipient trick.",
          paragraphs: [
            "When the game offers hints about who the quote was <em>addressed to</em> or which <em>arc</em> it's from, use them backwards: instead of searching your memory for the line, list the characters who talk to that recipient in that arc. The intersection is usually two or three names. Quote mode is a process-of-elimination puzzle wearing a trivia costume."
          ]
        },
      ]
    },
    {
      heading: "Eye mode: dojutsu patterns and the zoom economy",
      blocks: [
        {
          type: "paragraphs",
          paragraphs: [
            "Eye mode shows an extreme close-up of a character's eye; wrong guesses zoom out gradually. Like Framed's stills, the early frames reward <em>pattern</em> reading over guessing. The Naruto universe has a small set of distinctive eye designs, and they are the fastest solve vector in the mode:"
          ]
        },
        {
          type: "list",
          ordered: false,
          items: [
            "<strong>Sharingan</strong> (red iris, tomoe marks) — Uchiha clan, immediately.",
            "<strong>Byakugan</strong> (pale, pupil-less) — Hyuga clan, immediately.",
            "<strong>Rinnegan</strong> (concentric ripples) — a very short list of wielders."
          ]
        },
        {
          type: "paragraphs",
          paragraphs: [
            "If the eye shows a dojutsu, you've solved the clan in one look — the remaining work is picking <em>which</em> member, and that's where zoom-outs showing headbands, hair, and facial marks earn their keep. If the eye is normal, read the <em>surrounding</em> details in the zoom: headband village symbol, face paint, wrinkles (age), distinctive markings. And respect the zoom economy like Framed's stills: a blind early guess buys little, but each zoom level is free information — spend wrong guesses deliberately to purchase zoom when you're truly stuck, not to throw names at the wall."
          ]
        },
      ]
    },
    {
      heading: "FAQ (Narutodle-specific)",
      blocks: [
        {
          type: "faq",
          items: [
            {
              question: "How many modes does Narutodle have?",
              answer: "Four daily modes — Classic, Jutsu, Quote, and Eye — each with its own answer. Solving one doesn't affect the others."
            }
          ]
        },
      ]
    },
  ],

};
