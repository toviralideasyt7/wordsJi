// Batch 2: today-page articles with dated {var} injection.
// Run with: node scripts/add-articles-b2.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRIES = {};

ENTRIES['betweenle-answer-today'] = `  'betweenle-answer-today': {
    key: 'betweenle-answer-today',
    eyebrow: 'Betweenle Answer & Strategy Guide',
    intro:
      "Betweenle is the daily word game where the answer hides between two clue words — its letters, position, or category sit between the pair in a way you have to deduce. Every puzzle reveals a fresh answer, and players searching for the Betweenle answer for {date}, today's Betweenle solution, or Betweenle hints can find it all here. This guide covers today's answer, how the between-clue mechanic works, and the strategy that makes the puzzle click.",
    sections: [
      {
        heading: "The Betweenle answer for {date}",
        paragraphs: [
          "Today's Betweenle answer for {date} is revealed on this page, confirmed against the official puzzle. Players who search for the Betweenle answer for {date}, today's Betweenle word, or the Betweenle solution for {date} will find the same answer here, whether they are catching up on a missed puzzle or double-checking their own solve.",
          "The answer card at the top shows the solution along with the two clue words, so you can see exactly how the between relationship worked. If you are still solving, the hint section gives you the first letter and the category without spoiling the full word.",
          "Betweenle answers change daily, so the {date} puzzle has a single correct word — the same one across every mirror of the game. Bookmark this page and the daily answer will always be one click away."
        ],
        callout: {
          title: "Daily refresh",
          body: "A new Betweenle puzzle publishes each day. The answer for {date} is live now — and the page always updates to the current puzzle, so the URL stays the same while the answer rolls over."
        }
      },
      {
        heading: "How the between mechanic works",
        paragraphs: [
          "The heart of Betweenle is the relationship between two clue words and the answer. In some puzzles the answer falls alphabetically between the clues; in others it sits between them on a category spectrum, like a shade between two colors or a size between two extremes.",
          "The clues are chosen so that the between region is meaningful — not a tie, and not obvious. A good puzzle makes you think 'what sits between these two?' and rewards players who consider multiple kinds of betweenness: alphabetical, semantic, numeric, or positional.",
          "Once you internalize that the answer must relate to both clues, the puzzle becomes a two-constraint search rather than a guessing game. The answer has to make sense with the first clue and with the second, and the intersection of those two constraints is usually small."
        ]
      },
      {
        heading: "Betweenle strategy for faster solves",
        paragraphs: [
          "Start by naming the obvious between-candidates for the two clues. If the clues are low and high, list the midpoints; if they are two colors, name the blend; if they are two categories, name the bridge term. Your first answer should be the most central candidate you can think of.",
          "Then test the edges. If your midpoint is wrong, the answer is likely off-center — closer to one clue than the other. Move your guess toward the clue that feels underrepresented, and the feedback will confirm the direction.",
          "Keep the relationship loose early and tighten it as you go. The first guess rarely nails the exact rule, but it tells you which kind of betweenness is in play, and that alone halves the remaining candidates."
        ],
        list: {
          title: "Kinds of betweenness to check",
          items: [
            "Alphabetical: the answer sorts between the two clue words",
            "Semantic: the answer's meaning bridges the clues' meanings",
            "Numeric: the answer is a midpoint, mean, or median value",
            "Positional: the answer sits between the clues on a spectrum or scale"
          ]
        }
      },
      {
        heading: "Solving Betweenle with hints instead of spoilers",
        paragraphs: [
          "Many players want help without the full answer, and the hint section on this page is built for that: it reveals the first letter, the word length, and the category of the between-relationship without naming the word.",
          "Use the first-letter hint to prune your candidate list, then use the category hint to decide which kind of betweenness applies. Together they turn a blind guess into a reasoned deduction, and the satisfaction of the solve stays intact.",
          "If you are truly stuck, the full answer is always there — one more scroll down. There is no shame in the reveal; even Betweenle veterans check the answer on brutal days."
        ]
      },
      {
        heading: "Common mistakes in Betweenle",
        paragraphs: [
          "The most common mistake is assuming the betweenness is always alphabetical. Many puzzles use semantic or categorical relationships, and players who only think alphabetically get stuck on puzzles that are really about shades of meaning.",
          "The second mistake is ignoring one clue. A guess that relates beautifully to the first clue but ignores the second is almost always wrong, because the puzzle's whole point is that the answer sits between both.",
          "The third mistake is over-thinking. When the between region is genuinely small — two or three candidates — the fastest path is to guess all of them rather than agonize. The game rewards volume when the pool is tiny."
        ]
      },
      {
        heading: "Why this page ranks for Betweenle searches",
        paragraphs: [
          "Every day, players search for the Betweenle answer for the current date, and this page is written to answer that exact query with a clear reveal, dated correctly, and updated daily. The dated phrasing — 'Betweenle answer for {date}' — matches how people actually search.",
          "The page also serves learners: the strategy sections explain the between-mechanic in plain language, so it earns traffic from new players and curious solvers, not just people grabbing the answer.",
          "Because the answer is announced daily and the page is static and crawlable, search engines index it as the go-to Betweenle resource — exactly the setup that keeps a daily-answer page ranked and clicked."
        ]
      }
    ],
    faqHeading: "Betweenle FAQ",
    faqs: [
      {
        question: "What is the Betweenle answer for {date}?",
        answer:
          "The Betweenle answer for {date} is shown at the top of this page, confirmed against the official daily puzzle. The answer changes every day."
      },
      {
        question: "How does Betweenle work?",
        answer:
          "Betweenle gives you two clue words, and the answer is a word that sits between them — alphabetically, semantically, numerically, or positionally. You deduce the between-relationship and guess the answer."
      },
      {
        question: "Where can I find Betweenle hints?",
        answer:
          "This page includes a hint section with the first letter, word length, and relationship category, letting you solve without a full spoiler."
      },
      {
        question: "Is there an official Betweenle archive?",
        answer:
          "Many players track past answers in community archives. This page covers the current daily puzzle, and the Betweenle solver works for any past word too."
      },
      {
        question: "What does the between rule mean in practice?",
        answer:
          "It means the answer must relate to both clue words and sit between them in some measurable way — the intersection of two constraints that narrows the candidate list dramatically."
      }
    ],
    relatedLinks: [
      { href: "/betweenle-solver", label: "Betweenle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/squaredle-solver", label: "Squaredle Solver" },
      { href: "/phrazle-answer-today", label: "Phrazle Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" }
    ]
  }`;

ENTRIES['colorfle-answer-today'] = `  'colorfle-answer-today': {
    key: 'colorfle-answer-today',
    eyebrow: 'Colorfle Answer & Guide',
    intro:
      "Colorfle is the daily color puzzle where you guess a target color from a palette using distance feedback — each guess tells you how far your color is from the answer, in a warm or cool direction. Players looking for the Colorfle answer for {date}, today's Colorfle color, or Colorfle hints will find the daily reveal plus a complete strategy guide here. Here is today's answer and how to get better at the game.",
    sections: [
      {
        heading: "The Colorfle answer for {date}",
        paragraphs: [
          "Today's Colorfle answer for {date} is revealed on this page, confirmed against the official puzzle. The answer card shows the target color's name and its hex value, so you can match it exactly — and players searching for the Colorfle color for {date} or today's Colorfle answer will find the same result.",
          "Colorfle publishes one new color daily, and the {date} puzzle has a single target. The reveal card updates with the date, so the page always shows the current answer while keeping the same clean URL for bookmarks.",
          "If you are still solving, the hint section gives the color's family — warm, cool, or neutral — plus its general position on the palette, without giving away the exact shade."
        ],
        callout: {
          title: "Hex-exact reveals",
          body: "Every Colorfle answer on this page includes its exact hex value, so you can match the shade precisely — no more guessing whether the answer was this green or that green."
        }
      },
      {
        heading: "How Colorfle feedback works",
        paragraphs: [
          "Colorfle scores your guess by distance in color space: the game tells you whether the answer is warmer or cooler, lighter or darker, more saturated or less, relative to your guess. Each piece of feedback is a direction, not a verdict.",
          "That directional feedback is the key to solving. A 'warmer' answer means every subsequent guess should shift toward the red-orange side of the wheel; a 'darker' answer means you move down the lightness scale. The game is a guided search through color space.",
          "Understanding the color model matters: hue, saturation, and lightness are the three axes you are navigating. Fix two of them with early guesses and only one axis remains — that is when the puzzle gets easy."
        ]
      },
      {
        heading: "A Colorfle solving strategy",
        paragraphs: [
          "Open with a mid-palette color — something neutral, mid-lightness, mid-saturation — because its feedback is informative in every direction. A guess at the edge of the palette can only be 'warmer' or 'cooler' toward the center, wasting half the information.",
          "On your second guess, move boldly along the axes the feedback flagged. If the answer is warmer and darker, jump a meaningful distance in both directions rather than nudging — the feedback range is wide, and small moves burn guesses.",
          "By guess three or four you should be in the neighborhood. Now switch from big moves to precise ones: correct the remaining lightness, nudge saturation, and the answer falls within a few shades. Most Colorfle puzzles resolve in five or six guesses with this rhythm."
        ],
        list: {
          title: "The Colorfle opener checklist",
          items: [
            "Pick a mid-lightness, mid-saturation color",
            "Avoid palette edges — they waste directional feedback",
            "Include both warm and cool components so either verdict is useful",
            "Prefer a color whose name you know, so you can reason about its position"
          ]
        }
      },
      {
        heading: "Common mistakes in Colorfle",
        paragraphs: [
          "The biggest mistake is making tiny adjustments. Colorfle's feedback spans a wide range, and players who nudge one step at a time run out of guesses long before reaching the target. Move big early, refine late.",
          "The second mistake is ignoring one axis. If the game says 'darker' but you keep guessing equally-light colors with different hues, you are wasting every guess. Fix lightness before you fuss over hue.",
          "The third mistake is treating saturation feedback as unimportant. Saturation is often the last axis people check, but a grayish target with a vivid guess is extremely common — nailing saturation early collapses the final search."
        ]
      },
      {
        heading: "Why this page ranks for Colorfle searches",
        paragraphs: [
          "Colorfle players search for today's answer, yesterday's shade, and hints — all dated queries that this page answers directly with the {date} reveal, hex value, and strategy. The dated title and content match real search behavior.",
          "The guide also serves color-curious players who want to understand the game better: the feedback mechanics and strategy sections explain the puzzle in terms anyone can apply.",
          "Because the page updates daily and stays static and indexable, it is the natural first result for Colorfle answer queries — the exact setup that keeps daily-game pages ranked."
        ]
      }
    ],
    faqHeading: "Colorfle FAQ",
    faqs: [
      {
        question: "What is the Colorfle answer for {date}?",
        answer:
          "The Colorfle answer for {date} — including its name and exact hex value — is revealed at the top of this page. A new color publishes every day."
      },
      {
        question: "How do you play Colorfle?",
        answer:
          "You guess a color and the game tells you how far you are in each direction — warmer or cooler, lighter or darker, more or less saturated — until you land on the exact target."
      },
      {
        question: "How many guesses do you get in Colorfle?",
        answer:
          "Colorfle gives you a set number of guesses per day, typically around six, so big directional moves early and precise refinements late are the winning pattern."
      },
      {
        question: "What do the Colorfle hints on this page include?",
        answer:
          "The hint section gives the color family (warm, cool, or neutral), general position on the palette, and lightness level — enough to solve without the reveal."
      },
      {
        question: "Why does the Colorfle answer have a hex value?",
        answer:
          "The hex value is the exact digital definition of the color, which lets you match the shade precisely and compare it to your own guesses."
      }
    ],
    relatedLinks: [
      { href: "/colorfle-solver", label: "Colorfle Solver" },
      { href: "/colordle-answer-today", label: "Colordle Answer Today" },
      { href: "/colordle-solver", label: "Colordle Solver" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" }
    ]
  }`;

ENTRIES['countryle-answer-today'] = `  'countryle-answer-today': {
    key: 'countryle-answer-today',
    eyebrow: 'Countryle Answer & Guide',
    intro:
      "Countryle is the daily geography puzzle where you guess a country and the game shows you how close you are — distance, direction, and borders all give clues. Players searching for the Countryle answer for {date}, today's Countryle country, or Countryle hints will find the daily reveal plus a full geography strategy guide here. Here is today's answer and how to master the map.",
    sections: [
      {
        heading: "The Countryle answer for {date}",
        paragraphs: [
          "Today's Countryle answer for {date} is confirmed on this page, straight from the official daily puzzle. The answer card shows the country's name, flag, and continent, so players looking for the Countryle country for {date} or today's Countryle answer can check the reveal instantly.",
          "Countryle publishes one new country per day, and the {date} puzzle has a single target shared by every player worldwide. The reveal updates with the date while the URL stays constant, so this is the page to bookmark for daily answers.",
          "For players still solving, the hint section gives the continent, the first letter, and a region clue — enough to narrow the map without spoiling the country."
        ],
        callout: {
          title: "Daily geography reveal",
          body: "The Countryle answer for {date} is live now — country, flag, and continent, updated every day on this same URL."
        }
      },
      {
        heading: "How Countryle gives you clues",
        paragraphs: [
          "Countryle's core mechanic is distance: after each guess, the game tells you how far your country is from the answer, usually in kilometers, along with a direction arrow. That combination — distance plus bearing — is a powerful filter that no other daily game matches.",
          "Neighboring countries give the sharpest feedback. When you guess a country that borders the answer, the game often confirms it explicitly, collapsing the search to a handful of adjacent states.",
          "The distance readout is absolute, so every guess teaches you something even when it is far off. A 5,000-km miss still pins the answer to a hemisphere; a 200-km miss pins it to a region."
        ]
      },
      {
        heading: "Countryle strategy for geography fans",
        paragraphs: [
          "Open with a central country — something in the middle of a continent, like the DRC, Kazakhstan, or Brazil — because its distance feedback divides the world cleanly into directions. An island or peninsula answer makes central guesses less useful, so vary your openers.",
          "Then use distance bands to eliminate continents. A guess in South America that returns 8,000 km means the answer is nowhere near; a guess that returns 400 km means you are in the neighborhood and should switch to border logic.",
          "Once you are within a few hundred kilometers, think in borders: list the countries bordering your last guess and pick the one whose direction matches the arrow. Two or three border checks will usually land the answer."
        ],
        list: {
          title: "The geography quick-reference",
          items: [
            "Distance over 4,000 km: you are on the wrong continent — jump continents",
            "Distance under 1,000 km: think in borders and regions",
            "Distance under 200 km: check direct neighbors against the direction arrow",
            "A border confirmation is the strongest possible clue — act on it immediately"
          ]
        }
      },
      {
        heading: "Common mistakes in Countryle",
        paragraphs: [
          "The most common mistake is ignoring the direction arrow. Two countries can be the same distance away but in opposite directions, and players who only read the number wander the wrong way for several guesses.",
          "The second mistake is staying on one continent out of habit. If the feedback says your guess is 7,000 km away, the answer is almost certainly on another continent — jump, don't nudge.",
          "The third mistake is forgetting islands and microstates. Answers like Fiji, Malta, or Andorra look impossible when you are guessing mainland countries, but they follow the same distance logic — a small distance band around a tiny country is still a solvable region."
        ]
      },
      {
        heading: "Why this page ranks for Countryle searches",
        paragraphs: [
          "Geography players search for the Countryle answer for the current date every day, and this page answers with a clean reveal, correct date handling, and the country's continent and flag. The dated phrasing matches how people search.",
          "The strategy sections serve a second audience — players who want to improve at the game — so the page earns traffic beyond the daily reveal and ranks as a full Countryle resource.",
          "Daily updates on a static, indexable URL are exactly the pattern search engines trust, which is why this page is positioned to rank and stay ranked."
        ]
      }
    ],
    faqHeading: "Countryle FAQ",
    faqs: [
      {
        question: "What is the Countryle answer for {date}?",
        answer:
          "The Countryle answer for {date} — country name, flag, and continent — is revealed at the top of this page. A new country publishes daily."
      },
      {
        question: "How do you play Countryle?",
        answer:
          "You guess a country and the game tells you the distance to the answer plus a direction, narrowing the map until you land on the target country."
      },
      {
        question: "What do the Countryle hints include?",
        answer:
          "Hints give the continent, first letter, and region — enough to make an educated solve without spoiling the exact country."
      },
      {
        question: "Is the Countryle answer the same for everyone?",
        answer:
          "Yes. Countryle publishes one country per day, shared by all players worldwide, so the answer for {date} is identical everywhere."
      },
      {
        question: "What is the best first guess in Countryle?",
        answer:
          "A central country like Brazil, Kazakhstan, or the DRC, because its distance feedback divides the map into clear directions and eliminates continents quickly."
      }
    ],
    relatedLinks: [
      { href: "/worldle-answer-today", label: "Worldle Answer Today" },
      { href: "/globle-answer-today", label: "Globle Answer Today" },
      { href: "/countryle-solver", label: "Countryle Solver" },
      { href: "/worldle-solver", label: "Worldle Solver" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" }
    ]
  }`;

ENTRIES['framed-answer-today'] = `  'framed-answer-today': {
    key: 'framed-answer-today',
    eyebrow: 'Framed Answer & Movie Guide',
    intro:
      "Framed is the daily movie-guessing game where each frame reveals a little more of a mystery film, and you have six chances to name it. Players searching for the Framed answer for {date}, today's Framed movie, or Framed hints will find the daily reveal plus a full movie-identification strategy guide here. Here is today's answer and how to recognize films frame by frame.",
    sections: [
      {
        heading: "The Framed answer for {date}",
        paragraphs: [
          "Today's Framed answer for {date} is confirmed on this page from the official daily puzzle. The reveal card shows the movie title, its release year, and the director, so players looking for the Framed movie for {date} or today's Framed answer can check the reveal instantly.",
          "Framed publishes one new movie per day, and the {date} puzzle is the same film for every player. The reveal updates daily on a fixed URL, so bookmark this page for the fastest daily answer.",
          "If you are still playing, the hint section gives the decade, the genre, and a famous scene description — enough to steer your guess without naming the film."
        ],
        callout: {
          title: "Daily movie reveal",
          body: "The Framed answer for {date} is live now — title, year, and director, updated every day on this same page."
        }
      },
      {
        heading: "How Framed rewards film knowledge",
        paragraphs: [
          "Framed shows you a sequence of frames from a movie, each one progressively more revealing. The first frame is usually a wide shot or an establishing image; the later frames show faces, props, and recognizable scenes.",
          "The game is a test of visual memory plus deduction. Recognizing an actor, a location, or a distinctive prop early is the difference between a first-frame solve and a sixth-frame scramble.",
          "Directors with strong visual signatures — Wes Anderson's symmetry, Christopher Nolan's IMAX scale, Tarantino's compositions — are deliberately common answers because their frames are recognizable on their own."
        ]
      },
      {
        heading: "A Framed solving strategy",
        paragraphs: [
          "On the first frame, name any strong visual element: an actor you recognize, an iconic building, a distinctive costume, a famous color palette. Write down everything, because the answer usually connects to at least one early element.",
          "Use the frame count as information. Movies that solve in one frame are visually iconic; movies that need six frames are often obscure or have generic-looking scenes. Adjust your guessing accordingly.",
          "Think in genres and decades. If the frames show film grain and vintage cars, narrow to the era before you narrow to the title. Combining era, genre, and one recognizable element usually produces the answer by frame three or four."
        ],
        list: {
          title: "Clues to extract from every frame",
          items: [
            "Actors and their recognizable faces",
            "Locations — cities, landmarks, distinctive sets",
            "Era cues — costumes, cars, film stock, aspect ratio",
            "Props and objects the film is famous for",
            "Color grading and visual style"
          ]
        }
      },
      {
        heading: "Common mistakes in Framed",
        paragraphs: [
          "The biggest mistake is guessing too early without committing to clues. One frame with a familiar actor can mislead if you do not check the era and genre — a modern actor in a period film is a different movie entirely.",
          "The second mistake is ignoring the sequence. Later frames are deliberately more revealing, so if you are stuck on frame three, the answer is probably a movie you know but cannot place from its opening — the fourth or fifth frame will fix that.",
          "The third mistake is guessing sequels without evidence. Players often name the sequel when the clue points to the original, or vice versa. Verify the specific movie — its year and director — before you commit."
        ]
      },
      {
        heading: "Why this page ranks for Framed searches",
        paragraphs: [
          "Movie fans search for the Framed answer for the current date every day, and this page delivers with a clean reveal, the correct date, and the film's year and director. The dated phrasing matches real search behavior.",
          "The guide also serves casual players who want to improve: the frame-reading strategy and film-knowledge tips apply to every daily puzzle, making this a full Framed resource rather than just an answer dump.",
          "A daily-updated, static, indexable page is exactly what search engines keep ranked — which is why this page is positioned to hold its spot for Framed answer queries."
        ]
      }
    ],
    faqHeading: "Framed FAQ",
    faqs: [
      {
        question: "What is the Framed answer for {date}?",
        answer:
          "The Framed answer for {date} — movie title, release year, and director — is revealed at the top of this page. A new film publishes daily."
      },
      {
        question: "How do you play Framed?",
        answer:
          "Framed shows you progressively revealing frames from a mystery movie. You have six chances to name the film, with each new frame giving more visual clues."
      },
      {
        question: "What hints does this page give without spoiling?",
        answer:
          "The hint section gives the decade, genre, and a scene description — enough to guide your solve without revealing the title."
      },
      {
        question: "How many guesses do you get in Framed?",
        answer:
          "You get six guesses per daily puzzle, matching the six frames. Each wrong guess moves you to the next, more revealing frame."
      },
      {
        question: "What is the best strategy for Framed?",
        answer:
          "Extract every clue — actors, locations, era, props, style — from the first frame, then combine era and genre with one recognizable element to narrow the film."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/framed-archive", label: "Framed Archive" },
      { href: "/searchle-answer-today", label: "Searchle Answer Today" },
      { href: "/globle-answer-today", label: "Globle Answer Today" }
    ]
  }`;

ENTRIES['searchle-answer-today'] = `  'searchle-answer-today': {
    key: 'searchle-answer-today',
    eyebrow: 'Searchle Answer & Guide',
    intro:
      "Searchle is the daily game where you reverse-engineer a search query: you guess a search phrase and the game ranks it, telling you how close you are to the mystery query. Players looking for the Searchle answer for {date}, today's Searchle query, or Searchle hints will find the daily reveal plus a full search-thinking strategy guide here. Here is today's answer and how to think like a search engine.",
    sections: [
      {
        heading: "The Searchle answer for {date}",
        paragraphs: [
          "Today's Searchle answer for {date} is confirmed on this page from the official puzzle. The reveal shows the exact query, its topic, and why it ranks the way it does, so players searching for the Searchle query for {date} or today's Searchle answer can check it instantly.",
          "Searchle publishes one new query per day, and the {date} puzzle is the same search phrase for everyone. The reveal updates daily on a fixed URL, so this is the page to bookmark.",
          "For players still solving, the hint section gives the topic category and the approximate word count of the query — enough to steer your phrasing without spoiling it."
        ],
        callout: {
          title: "Daily query reveal",
          body: "The Searchle answer for {date} is live now — the exact search query, updated every day on this same URL."
        }
      },
      {
        heading: "How Searchle scoring works",
        paragraphs: [
          "Searchle ranks your guessed query against the mystery query using search relevance — the closer your words match the target's intent, the higher you rank. You see your position after every guess, which is the feedback loop the whole game runs on.",
          "The game rewards understanding search intent, not just keywords. 'Best pizza' and 'pizza near me' are different queries, and Searchle will rank them apart because their intent differs.",
          "Search engines treat word order, phrasing, and specificity as signals. The game mirrors that: a precise query like 'best italian pizza recipe' ranks closer to the target than the vague 'pizza' ever will."
        ]
      },
      {
        heading: "A Searchle solving strategy",
        paragraphs: [
          "Start broad and specific at the same time: guess the general topic first — 'football', 'recipes', 'history' — to locate the neighborhood, then add modifiers on the next guesses to climb the ranking.",
          "Watch how your rank moves. If a guess jumps you from position 40 to position 8, you added the right kind of words; if the rank barely moves, your phrasing is pointed the wrong way.",
          "Think about how people actually search the topic. The mystery query is usually a realistic, everyday search phrase, not an academic string — so 'how to' constructions, question formats, and common modifiers are high-probability guesses."
        ],
        list: {
          title: "High-value query modifiers",
          items: [
            "'how to' constructions for how-to queries",
            "Question formats ('what is', 'when did')",
            "Specificity words ('best', 'top', 'free', 'easy')",
            "Location words for local intent ('near me', city names)",
            "Year or time qualifiers when the query is trending"
          ]
        }
      },
      {
        heading: "Common mistakes in Searchle",
        paragraphs: [
          "The biggest mistake is guessing essay-length queries. Real search phrases are short — two to five words is the sweet spot — and long queries almost always rank poorly against the target.",
          "The second mistake is ignoring intent shifts. Adding a word that changes the meaning ('pizza' vs 'pizza recipe') is a different query, and Searchle will rank it accordingly. Match intent before you match keywords.",
          "The third mistake is repeating the same phrasing pattern. If 'best X' keeps missing, the target is probably phrased as a question or a how-to — change the construction, not just the words."
        ]
      },
      {
        heading: "Why this page ranks for Searchle searches",
        paragraphs: [
          "Searchle players search for the daily answer and hints, and this page delivers both with the correct date handling and a clean reveal. The dated phrasing matches how people search for daily-game answers.",
          "The guide also serves players who want to understand the search logic behind the game — the intent and phrasing sections explain Searchle in a way that transfers directly to SEO and real search behavior.",
          "A daily-updated, static, indexable page with genuine utility is the pattern search engines reward, positioning this page to rank and stay ranked for Searchle queries."
        ]
      }
    ],
    faqHeading: "Searchle FAQ",
    faqs: [
      {
        question: "What is the Searchle answer for {date}?",
        answer:
          "The Searchle answer for {date} — the exact search query — is revealed at the top of this page. A new query publishes daily."
      },
      {
        question: "How do you play Searchle?",
        answer:
          "You guess a search query and the game ranks your guess against the mystery query, showing how close your phrasing is to the target."
      },
      {
        question: "What hints does the Searchle page give?",
        answer:
          "The hint section gives the topic category and approximate query length, letting you steer your phrasing without spoiling the answer."
      },
      {
        question: "How is Searchle scored?",
        answer:
          "Searchle scores by search relevance: the closer your query's words and intent match the target, the higher your rank after each guess."
      },
      {
        question: "What is the best strategy for Searchle?",
        answer:
          "Start with the broad topic, watch how your rank moves, and add realistic search modifiers — 'how to', questions, and specificity words — to climb toward the target."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/searchle-solver", label: "Searchle Solver" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" }
    ]
  }`;

ENTRIES['worgle-answer-today'] = `  'worgle-answer-today': {
    key: 'worgle-answer-today',
    eyebrow: 'Worgle Answer & Guide',
    intro:
      "Worgle is the daily word game with its own twist on the classic formula, and players searching for the Worgle answer for {date}, today's Worgle word, or Worgle hints will find the daily reveal plus a complete strategy guide here. Here is today's answer and how to crack the Worgle rule set.",
    sections: [
      {
        heading: "The Worgle answer for {date}",
        paragraphs: [
          "Today's Worgle answer for {date} is confirmed on this page from the official daily puzzle. The reveal card shows the word, its letter pattern, and its puzzle number, so players looking for the Worgle word for {date} or today's Worgle answer can check the reveal instantly.",
          "Worgle publishes one new word per day, and the {date} puzzle is the same word for every player. The reveal updates daily on a fixed URL, so bookmark this page for the fastest daily answer.",
          "If you are still solving, the hint section gives the word's first letter, length, and letter-frequency profile — enough to narrow the possibilities without spoiling the word."
        ],
        callout: {
          title: "Daily word reveal",
          body: "The Worgle answer for {date} is live now — word, pattern, and puzzle number, updated every day on this same URL."
        }
      },
      {
        heading: "How Worgle differs from Wordle",
        paragraphs: [
          "Worgle keeps the daily-five-letter core but changes the feedback rules — the exact difference varies by version, and understanding your version's rule set is the first step to solving. Some versions give positional feedback, others weight letter frequency, and others reward specific patterns.",
          "The daily format is the same as Wordle: one puzzle per day, one answer, a streak to protect. That shared structure is why Worgle answers are searched for with the same dated queries.",
          "The key skill is noticing which feedback rule your version uses. Play a practice word, read the verdicts carefully, and adapt — the rule set determines which openers and strategies actually work."
        ]
      },
      {
        heading: "A Worgle solving strategy",
        paragraphs: [
          "Open with a word that covers the most common letters — the same logic that works in Wordle applies: vowels plus frequent consonants like R, S, T, N. A strong opener gives you information about five letters at once.",
          "Use the feedback to build a constraint set: letters in the word, letters in the right position, letters to avoid. Every guess should add at least one new letter to your picture of the answer.",
          "When you have two or three confirmed letters, switch from information-gathering to pattern-matching: list the five-letter words that fit the confirmed pattern and guess the most likely one. The answer is usually a common word, so familiarity beats obscurity."
        ],
        list: {
          title: "The Worgle opener checklist",
          items: [
            "Two or three vowels, including a high-frequency vowel",
            "Common consonants: R, S, T, N, L",
            "No repeated letters in your first guess",
            "A word whose pattern you can reason about if it scores well"
          ]
        }
      },
      {
        heading: "Common mistakes in Worgle",
        paragraphs: [
          "The most common mistake is ignoring the rule differences. Players who assume Worgle is Wordle exactly will misread the feedback and chase the wrong letters — always confirm the rule set first.",
          "The second mistake is repeating letters too early. Duplicates waste information in the first two guesses, when every tile should be teaching you about a new letter.",
          "The third mistake is guessing obscure words. Worgle answers, like Wordle's, are almost always common English words — if you are guessing 'quixotic', you are probably overthinking a simple five-letter answer."
        ]
      },
      {
        heading: "Why this page ranks for Worgle searches",
        paragraphs: [
          "Worgle players search for the daily answer and hints, and this page delivers both with correct date handling and a clean reveal. The dated phrasing — 'Worgle answer for {date}' — matches how daily-game players actually search.",
          "The strategy guide serves a second audience of players who want to improve, so the page earns traffic beyond the daily reveal and ranks as a full Worgle resource.",
          "Daily updates on a static, indexable page are the pattern search engines trust, positioning this page to rank and stay ranked."
        ]
      }
    ],
    faqHeading: "Worgle FAQ",
    faqs: [
      {
        question: "What is the Worgle answer for {date}?",
        answer:
          "The Worgle answer for {date} — the exact word and puzzle number — is revealed at the top of this page. A new word publishes daily."
      },
      {
        question: "How do you play Worgle?",
        answer:
          "Worgle follows the daily-word format with its own feedback rules. You guess the daily word using the verdicts the game gives you, one puzzle per day."
      },
      {
        question: "What hints does the Worgle page give?",
        answer:
          "The hint section gives the first letter, word length, and letter-frequency profile, letting you solve without the full reveal."
      },
      {
        question: "Is Worgle the same as Wordle?",
        answer:
          "Worgle shares Wordle's daily format but has its own feedback rule set, so check the specific version you are playing before you commit to a strategy."
      },
      {
        question: "What is the best Worgle opener?",
        answer:
          "A common five-letter word with two or three vowels, no repeats, and frequent consonants like R, S, T, and N — the same information-maximizing logic that works in Wordle."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/nerdle-answer-today", label: "Nerdle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/phrazle-answer-today", label: "Phrazle Answer Today" },
      { href: "/canuckle-answer-today", label: "Canuckle Answer Today" }
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
