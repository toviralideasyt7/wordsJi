    key: 'searchle-solver',
    eyebrow: 'Searchle Solver Guide',
    intro:
      "Searchle is the daily game where you reverse-engineer a mystery search query: you guess a phrase, the game ranks it, and your job is to climb to the top by matching the target's words and intent. The Searchle solver studies the ranking feedback and suggests the phrasing that climbs fastest. Here is how it works, how search ranking thinks, and how to win the daily query game.",
    sections: [
      {
        heading: "How the Searchle solver reads the rankings",
        paragraphs: [
          "Searchle ranks your guessed query against the mystery query using search relevance: the closer your words and intent match the target, the higher your position. The solver watches how each guess moves the ranking and learns the target's vocabulary from that movement.",
          "A rank jump from 40 to 8 means your new words overlap the target; a flat ranking means your phrasing is pointed the wrong way. The solver treats every rank movement as a signal about which words the target contains.",
          "By combining several guesses' movements, the solver builds a model of the target query — its topic, its length, its structure — and recommends the next phrase most likely to top the chart."
        ],
        callout: {
          title: "Rank movement is the clue",
          body: "Searchle tells you where your query ranks after every guess. Big jumps mean you added the right kind of words; flat rankings mean your phrasing is off — read the movement, not just the position."
        }
      },
      {
        heading: "Thinking like a search engine",
        paragraphs: [
          "Search engines match intent, not just keywords. 'Best pizza' and 'pizza near me' are different queries with different intent, and Searchle ranks them apart. Before you guess, decide what the searcher is trying to do — find a recipe, a location, a definition, a comparison.",
          "Real search phrases are short: two to five words. The mystery query is almost always a realistic everyday search, so guess like a person typing into a search box, not like a writer composing a sentence.",
          "Modifiers carry meaning. 'How to', 'what is', 'best', 'free', and 'near me' are high-value words that shift ranking significantly. The solver's recommendations lean on these realistic modifiers."
        ],
        list: {
          title: "Query structures to test",
          items: [
            "How-to: 'how to bake sourdough'",
            "Question: 'what is the tallest mountain'",
            "Comparison: 'best budget phone 2026'",
            "Local: 'coffee shops near me'",
            "Definition: 'what does serendipity mean'"
          ]
        }
      },
      {
        heading: "A Searchle solving strategy the solver automates",
        paragraphs: [
          "Open with the broad topic — 'pizza', 'football', 'recipes' — to locate the neighborhood. Note your rank; it is the baseline for everything that follows.",
          "Then add one modifier at a time and watch the movement. If 'pizza' ranks 40 and 'pizza recipe' jumps to 12, the target is recipe-related; if 'best pizza' jumps instead, the target is comparison-related.",
          "Once you are in the top ten, the remaining task is precision: match the exact phrasing. The solver's model of the target's word order and length guides the final guesses."
        ]
      },
      {
        heading: "Common mistakes the Searchle solver fixes",
        paragraphs: [
          "The biggest mistake is guessing essay-length queries. Real searches are short, and long phrases almost always rank poorly against a concise target. The solver keeps guesses in the two-to-five-word range.",
          "The second mistake is ignoring intent. Adding keywords without changing intent — 'pizza delivery best pizza' — rarely jumps the ranking, because the target's intent is unchanged. The solver matches intent before words.",
          "The third mistake is repeating the same structure. If 'best X' keeps missing, the target is probably a question or a how-to. The solver changes the construction, not just the words."
        ]
      },
      {
        heading: "Why the Searchle solver page ranks in search",
        paragraphs: [
          "Searchle players search for the daily answer and hints, and the solver page serves the players who want to crack the query themselves — the rank-movement model and intent-first strategy are exactly what they need.",
          "The guide also earns traffic from SEO-curious players: the search-thinking sections explain real ranking logic that transfers directly to search marketing.",
          "Bookmark it for the days the target query is a head-scratcher. The solver will climb it, and the search-thinking strategy will make you faster on every puzzle after."
        ]
      },
      {
        heading: "Real search patterns the game mirrors",
        paragraphs: [
          "Searchle's mystery queries are modeled on real Google autocomplete, which means they follow patterns you already know from the search box. Question queries start with 'how to', 'what is', 'when did', or 'why do'; comparison queries lean on 'best', 'top', or 'vs'; local queries add 'near me' or a city name. Naming the pattern is half the solve.",
          "The second pattern is specificity creep. Real users start broad and refine — 'pasta' becomes 'pasta recipe' becomes 'easy pasta recipe for dinner'. Searchle rewards the same progression: if your broad guess ranks low, the target is probably one or two modifiers deeper than you are.",
          "The third pattern is the value of verbs. Search phrases with action verbs — 'make', 'cook', 'fix', 'learn', 'buy' — are more common than noun-only queries, and the game's ranking system rewards matching those verbs exactly. A guess that swaps 'make' for 'cook' can jump a dozen positions.",
          "The final pattern is time. Trending queries, seasonal searches, and year-stamped phrases ('best phone 2026') all show up as targets because they are what people actually type. When the topic feels current, add the year or the season to your guess and watch the rank climb."
        ]
      },
      {
        heading: "Advanced Searchle tactics from ranking data",
        paragraphs: [
          "Searchle's ranking feedback is dense with information if you read it right. A big rank jump means your new words overlap the target's vocabulary; a flat rank means your phrasing is orthogonal. The solver treats every movement as a signal, and you can too — before you add a word, predict whether it will jump the rank or hold it still.",
          "Word order matters more than players expect. 'best pizza near me' and 'pizza near me best' rank differently, and the game mirrors that. When two guesses use the same words but rank differently, the target's word order is telling you something about its phrasing.",
          "Stop-words are not stop-signals. Words like 'the', 'of', and 'for' appear in real search phrases and affect ranking — 'best of' and 'how to' are legitimate query fragments. The solver includes them in its model, and players who ignore them miss a whole class of targets.",
          "Finally, use the archive to study past answers. The pattern of mystery queries — how-to phrases, comparison phrases, local phrases — is consistent, and reviewing old puzzles builds the intuition for what the game considers a realistic search."
        ]
      },
      {
        heading: "Searchle solver settings and advanced usage",
        paragraphs: [
          "The Searchle solver is designed for the daily game, but a little setup makes it faster. Choose the topic mode if you know the target's domain — tech, food, travel, entertainment — and the solver's recommendations skew toward that vocabulary. The rank-movement logic works the same either way.",
          "For daily play, run the solver alongside your game: guess, read the rank, and let the solver model the target's vocabulary from the movement. The first two or three guesses establish the topic; the last two or three climb to the top.",
          "The solver's intent-first ranking is the advanced skill. It does not just match words — it matches query structure, so a how-to target gets how-to suggestions and a comparison target gets comparison suggestions. Players who learn to read the solver's reasoning internalize the same logic.",
          "Finally, use the archive for study. Reviewing past targets shows you the pool's shape — how-to phrases, question phrases, comparison phrases — and that pattern knowledge transfers directly to faster daily solves."
        ]
      },
      {
        heading: "Searchle answer variations, month by month",
        paragraphs: ["Searchle answers are place names and landmarks, and the puzzle changes its answer type over time — some months skew to cities, others to countries, others to famous landmarks. The solver handles every variant because it filters on the clues, not on a fixed category.","The variation is worth knowing before you play: a month of landmark answers behaves differently from a month of capital cities, and the solver’s filters adapt to whichever pool the game is using.","Either way, the same logic applies — every clue narrows the map, and the solver applies all of them at once."]
      }
    ],
    faqHeading: "Searchle Solver FAQ",
    faqs: [
      {
        question: "How does the Searchle solver work?",
        answer:
          "It watches how each guessed query moves in the rankings, builds a model of the target's vocabulary and intent, and recommends the phrasing most likely to rank first."
      },
      {
        question: "How is Searchle scored?",
        answer:
          "Your guessed query is ranked against the mystery query by search relevance — the closer your words and intent match, the higher you rank after each guess."
      },
      {
        question: "What is a good first guess in Searchle?",
        answer:
          "The broad topic alone — like 'pizza' or 'football' — establishes your baseline rank and tells you which neighborhood the target lives in."
      },
      {
        question: "How long is a typical Searchle answer?",
        answer:
          "Mystery queries are realistic everyday searches, usually two to five words, matching how people actually type into a search box."
      },
      {
        question: "Does the solver work for past Searchle puzzles?",
        answer:
          "Yes — the rank-movement logic applies to any Searchle puzzle, past or present."
      }
    ],
    relatedLinks: [
      { href: "/searchle-answer-today", label: "Searchle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/semantle-answer-today", label: "Semantle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" }
    ]
  },
