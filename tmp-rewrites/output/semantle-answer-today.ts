    key: 'semantle-answer-today',
    eyebrow: 'Semantle Answer and Hints',
    intro:
      "Semantle is the only game in my daily lineup that punishes you for having a vocabulary. There are no letters, no colors, and no guess limit. You type a word, and you get back a similarity score from 0 to 100 saying how close it is in meaning to the secret word, and that is the entire interface. Today's puzzle is number {number}, and the answer and hints are on this page. I have played Semantle daily for over a year, my worst solve ran well past six hundred guesses, and the game is exactly as brutal as its reputation. Here is how I read the scores, and how I hunt the word down.",
    sections: [
      {
        heading: "What the Semantle score is actually measuring",
        paragraphs: [
          "Every guess scores between 0 and 100 based on semantic similarity to the answer, computed by a word-embedding model — word2vec, trained on billions of sentences of ordinary text. Similarity here means the words show up in similar contexts, not that they share a dictionary definition or any letters. Spelling is irrelevant to the model entirely.",
          "So a 41 is not 41 percent of the way to the answer. It means your guess lives in a neighborhood that overlaps the answer's neighborhood. I stopped reading the number as a grade and started reading it as a compass bearing, and that shift alone changed my whole game.",
          "The trap I fell into for my first month: seeing a 50 and grinding synonyms of the same wrong word for eighty straight guesses. A 50 tells you the answer is in this lane. It does not tell you the lane is short.",
          "And the guess counter runs forever, because unlimited guesses is the design, not a mercy. Semantle is famous for solves that take hundreds of guesses. My personal worst is 612, and the answer was a word I had typed within two guesses of, twice, and skipped past both times."
        ]
      },
      {
        heading: "The Semantle answer for {date} (puzzle {number})",
        paragraphs: [
          "Today's Semantle is puzzle {number}, and the answer is revealed on this page — the same word across every mirror of the game, checked against the official source rather than scraped out of a forum thread. If you searched the Semantle answer for {date} or semantle answer today, the card at the top of the page is your word.",
          "If you are mid-solve and want to keep the solve honest, the hint card gives you the semantic family, the part of speech, and the first letter. That is my usual off-ramp: one hint, then back to guessing. The answer card sits right there for when you are done fighting.",
          "One note on how people trade these: the community shares answers by puzzle number more often than by date, which is why {number} is the reliable key for {date}. Search either format and you land on the same word."
        ],
        callout: {
          title: "What 'close' actually means",
          body: "Semantle flags a guess as close when it ranks among the thousand words nearest the answer in the model's space. The first close after a run of 3s and 8s means you have found the lane — stop probing new families and start expanding this one."
        }
      },
      {
        heading: "My Semantle probing routine: three broad words, then commit",
        paragraphs: [
          "The opening that works is boring on purpose. I probe three lanes with broad, everyday words — an emotion, a substance, an activity, roughly love, water, work — because dense, common words return informative scores from anywhere in the space. A rare word can score near zero against half the dictionary and teach you nothing.",
          "When one guess crosses 40, I stop probing and commit to that lane. Expanding a lane means guessing near-synonyms of the best word, then its relatives: causes, effects, actions, opposites. Opposites are underrated here — hot and cold sit close together in embedding space, because they share contexts.",
          "If a guess drops the score, I backtrack to the best word and branch differently instead of doubling down on the miss. And above 85, the game becomes listing. The answer is usually a direct relation of your best guess, so I write the near-synonyms on paper and burn down the list.",
          "The opener matters less than people think, but the discipline matters enormously. I ran the same three probes for a month straight to make them a reflex, and now I spend exactly three guesses before committing anywhere. Before that routine I would open with whatever word was rattling around my head from the news, and those guesses were worse than useless — a random topical word anchors you to a lane you never actually chose."
        ]
      },
      {
        heading: "The 70s trap that ended my longest Semantle streak",
        paragraphs: [
          "Every long Semantle streak ends the same way, and mine was no exception: a pile of guesses in the 70s and 80s, all near-synonyms of each other, none of them the answer. That cluster is a local maximum — words genuinely close to the answer, but not on it — and every guess inside it scores well enough to keep you digging.",
          "The streak in question ran 61 days, and I lost it to a Tuesday answer that sat one step more abstract than my entire cluster. I had seven words over 80 at the end. The lesson I took from the wreckage: when four guesses all score high and all fail, the answer is not inside the cluster, it is above it — more general, more abstract, one rung up the ladder.",
          "The escape is changing kind, not topic. If your best word is a noun, guess its verb. Guess the opposite, the container, the thing it does. The answer is very often one step removed from the cluster rather than one more synonym inside it, and the day I finally believed that, my average solve dropped by over a hundred guesses.",
          "The solver on this page escapes automatically because it models the neighborhood instead of chasing the single best score. When candidates stop improving, it proposes words near the cluster but outside it — which is exactly the move I fail to make on my own at 11 p.m."
        ]
      },
      {
        heading: "Why I take a Semantle hint instead of the answer",
        paragraphs: [
          "A hint keeps you playing; an answer ends the round. The hint card leads with the semantic family, then the part of speech, then the first letter, and that is usually enough to re-aim a stalled solve without handing you the word. My rule is one hint per puzzle, taken only after the probing routine has failed twice.",
          "It matters because Semantle gives you nothing else to work with. No letter feedback exists in this game at all — no greens, no yellows — so a fair hint has to be semantic. A first letter feels like a lot, but with unlimited guesses it barely shortens the hunt. The family is the real lever.",
          "After taking a family hint, re-probe that family with its broadest members, not its edge cases. If the family is weather, guess weather itself before you guess anything specific — broad members of the right family move the score fast, and the movement tells you whether you are closing in or merely adjacent. An edge-case word can score nicely while pointing nowhere, which is the hint-taker's version of the local maximum."
        ]
      },
      {
        heading: "Proper nouns and other Semantle turns I regret",
        paragraphs: [
          "Names waste turns. Proper nouns live in sparse corners of the embedding model and return junk scores, so guessing a celebrity is the fastest way to learn nothing about the answer. I keep to common nouns, verbs, and adjectives, and my probing list barely changes from month to month.",
          "Keep your best guesses physically visible while you play. Five words in the 60s that all describe the same idea is a signal to branch, not to keep digging, and you cannot see that signal in your head. I keep a running list beside the keyboard, which is also exactly what the solver automates."
        ]
      },
      {
        heading: "Replaying old Semantle puzzles as a daily drill",
        paragraphs: [
          "Because the solver models the same word space the game uses, it can replay any past puzzle: enter your old guesses and scores, and it resumes the hunt mid-game. I run last week's puzzle on the train as a two-minute drill, and the drill compounds — probe, commit, expand, escape, solve.",
          "A year in, my median solve sits around 60 guesses, which sounds impressive until I admit it was over 200 before I stopped guessing clever words. The game's reputation for marathon solves is earned almost entirely by people who treat the score as a grade. Treat it as a compass and Semantle shrinks to a solvable puzzle."
        ]
      }
    ],
    faqHeading: 'Semantle questions I still get asked weekly',
    faqs: [
      {
        question: 'What is the Semantle answer for {date}?',
        answer:
          "The answer card on this page holds the word — puzzle {number}'s answer, identical across every mirror of the game. The hint card sits beside it if you would rather not spoil the whole solve."
      },
      {
        question: 'How does Semantle scoring work?',
        answer:
          "Every guess scores 0 to 100 based on meaning similarity, computed by a word2vec model trained on billions of sentences. Higher means closer in context, not closer in spelling."
      },
      {
        question: 'What is the best first guess in Semantle?',
        answer:
          "A broad, common word — love, time, water, work. My opening three are an emotion, a substance, and an activity, one probe per lane, because common words return useful scores from anywhere in the space."
      },
      {
        question: 'Why am I stuck in the 70s and 80s?',
        answer:
          "You are in a local maximum: a cluster of near-synonyms that sits close to the answer but not on it. Guess a different form of your best word — its verb, its opposite — instead of another synonym."
      },
      {
        question: 'Can the Semantle solver help with past puzzles?',
        answer:
          "Yes. It models the same semantic space, so entering your guesses and scores resumes any old game mid-solve, including {number} if you want to re-check that neighborhood."
      }
    ],
    relatedLinks: [
      { href: "/semantle-solver", label: "Semantle Solver" },
      { href: "/contexto-answer-today", label: "Contexto Answer Today" },
      { href: "/searchle-answer-today", label: "Searchle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/semantle-answer-archive", label: "Semantle Answer Archive" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" }
    ]
  },
