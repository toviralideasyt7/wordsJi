    key: 'colordle-archive',
    eyebrow: 'Colordle archive',
    intro:
      "Every daily Colordle answer ever published, in one browsable list: the date, the day number, the color's name, and its exact hex value on every row. I keep this archive for the same reason I keep the Wordle one — arguments about what an old answer was are unwinnable without a record, and Colordle arguments are worse because two people can look at the same color and swear it is different shades. Below the table is how I use the archive day to day, what a year of rows taught me about the game's palette, and how to pair it with the solver for free practice.",
    sections: [
      {
        heading: 'Why a color game needs an archive: the day numbers',
        paragraphs: [
          'Colordle numbers its puzzles sequentially — day 1, day 2, onward — and the community has fully adopted that numbering. Search "colordle day 1441 answer" and you are asking about one specific puzzle, on one specific date, with one specific color. The archive is built around that cross-reference: every row carries the day number and the date together, so numbered searches and dated searches both land on the same answer.',
          'The numbering is also the cleanest way to talk about the game across sites and time zones. "Yesterday" is ambiguous at midnight; day 1441 is day 1441 everywhere. When the daily page tells me today is a specific day number, checking the history of nearby days takes one search, and the sequence never has gaps.',
          'Each day\'s row appears here the moment the puzzle publishes, so the newest entry is always current. I still check it with my coffee, which says something about either the archive or me.'
        ]
      },
      {
        heading: 'What every row records, and why hex makes it exact',
        paragraphs: [
          'Three things per row: the date, the day number, and the answer — the color\'s canonical name plus its exact hex value. The hex is the part other archives skip and the part I care about most. A color name is an interpretation; a hex code is a fact you can put on any screen and reproduce.',
          'That precision settles the monitor arguments. When a friend swears last Tuesday\'s color was teal and I remember turquoise, we are both describing hexes in the same neighborhood, and the row tells us exactly which one ran. No more "well it looked greener on my laptop."',
          'It also makes the archive a dataset. Hundreds of hexes in chronological order is a map of the game\'s palette, and reading that map changed how I guess on the daily puzzle.'
        ],
        list: {
          title: 'Each archive row gives you',
          items: [
            'The date the puzzle ran',
            'The day number, for community-style searches',
            'The color\'s canonical name from the game\'s list',
            'The exact hex value, reproducible on any display'
          ]
        }
      },
      {
        heading: 'What a year of Colordle rows taught me about the palette',
        paragraphs: [
          'The first thing the year view shows is that the game favors recognizable colors. The standard rainbow families, the classic neutrals, the named shades everyone knows — day after day, the answers are colors with names, not anonymous in-between tints. That single observation is worth guesses: when the solver hands me a candidate list, I read the plausible-sounding names first.',
          'The second thing is rhythm. Reading the archive chronologically, there are warm weeks and cool weeks, stretches of neutrals, then a run of saturated anchors. I will not claim the rotation is predictable — I have tried, humbly, and it is not — but knowing the palette has habits keeps me from wasting early guesses on shades the game almost never picks.',
          'The third is subtler: the hard days cluster around saturation, not hue. The puzzles that eat my guesses are barely-different neighbors — the hexes a few points apart — not exotic hues. So on the days my first percentage comes back in the high eighties, I already know the danger: the answer is named, familiar, and sitting in a crowd of near-twins.',
          'If you want to run the same study, the method is simple: pick a month, read it top to bottom, and write down the family of each answer before checking the next. Two months of that and you will start calling the families before the reveal, which is exactly the instinct the daily game rewards. I did this with the archive\'s first year out of curiosity and it quietly rebuilt my opener choices — I stopped opening with exotic shades the palette had barely ever visited.'
        ]
      },
      {
        heading: 'Reconstructing a missed day, or a missed month',
        paragraphs: [
          'Life interrupts streaks. A flight, a dead phone, a week of forgetting, and suddenly the sequence has a hole in it. The archive is how I fill those holes: find the date, read the row, and the gap closes. The day numbers make even messy gaps navigable, because the sequence is unbroken — if I know I last played day 1420 and today is 1434, the fourteen rows between them are the complete record of what I missed.',
          'It works forwards too. When someone in the group chat asks "what did we all get on that impossible one last month," the archive answers in two searches: find the date, find the row, done. No scrolling through chat history, no contradicting memories.',
          'And for the honest streak-keepers among us, there is a small comfort in the record. The days I lost are right there in the archive, hexes intact, and reviewing them is how I found the pattern in my own losses — almost all of them fine-tuning errors on near-twin colors, which is precisely the mistake the practice loop trains away.'
        ]
      },
      {
        heading: 'Three ways to look up an old answer',
        paragraphs: [
          'By date, when you know the day. Dates work in the search box, and the calendar view is there for people who would rather click through a month than type.',
          'By day number, when the number is all you have. This is the format the community uses in searches and group chats, and every number resolves straight to its row.',
          'By color name, when the question runs backwards: has the game ever used a particular shade, and when. Type the name, get every day it ran. This is my favorite of the three, purely for the arguments it ends.'
        ]
      },
      {
        heading: 'The practice loop: archive plus solver',
        paragraphs: [
          'Every archived day is a replayable puzzle with the same percentage scoring as the live game, which makes the archive a free practice gym. Load an old date, run the triangulation loop — central opener, distant second guess, confirm — and see how few guesses it takes. Then do it again on a day you never played.',
          'The habit that stuck for me is solve-today, replay-yesterday. The daily page carries today\'s color; the archive gives me a cold replay of yesterday\'s in the same sitting. Two puzzles, ten minutes, and after a couple of weeks the percentage feedback starts reading like plain language.',
          'Replays are also where the hex record earns its keep. When my final guess lands at 97 percent, I can compare my guess\'s hex against the archived answer\'s hex and see exactly which channel drifted. That is a level of post-game honesty most puzzle games cannot offer, and Colordle can, because the record is exact.'
        ],
        callout: {
          title: 'The pairing that works',
          body: 'Daily page for today\'s color, this archive for every day before it, solver for the days your eye needs help. All three speak the same hex-exact language.'
        }
      },
      {
        heading: 'The ground-truth page, when memories disagree',
        paragraphs: [
          'Every Colordle group has the same recurring fight: what color ran last week. Human memory of color is genuinely unreliable — it compresses, it shifts toward categories, it argues. The archive does none of those things. The row for any day is what ran that day, name and hex, verifiable on any screen.',
          'So this is the page I send people when the dispute starts. Not because I keep it, but because it is the only version of the conversation that ends with both people looking at the same hex and agreeing.',
          'And when a new day publishes, the row simply appears. Tomorrow\'s argument is already scheduled; the archive will be ready for that one too.'
        ]
      }
    ],
    faqHeading: 'Colordle archive questions',
    faqs: [
      {
        question: 'Where is the full Colordle archive?',
        answer:
          'Here — the color answer for every daily Colordle puzzle, with the date, day number, name, and hex value on every row, searchable and browsable.'
      },
      {
        question: 'How far back does the Colordle archive go?',
        answer:
          'To the beginning of the game\'s daily run, with no gaps in the sequence. Each new day is added the moment its puzzle publishes.'
      },
      {
        question: 'Can I search Colordle answers by day number?',
        answer:
          'Yes. Every row cross-references the day number with its date, so community-style searches like colordle day 1441 answer resolve directly to the right puzzle.'
      },
      {
        question: 'Does the archive include hex values?',
        answer:
          'Every color is recorded with its exact hex, which makes each row reproducible on any display and settles the inevitable screen-calibration arguments.'
      },
      {
        question: 'Can I practice with old Colordle puzzles?',
        answer:
          'Yes — archived days replay with the same percentage scoring as the live game. Pair them with the solver\'s triangulation loop for streak-risk-free practice.'
      }
    ],
    relatedLinks: [
      { href: '/colordle-answer-today', label: 'Colordle Answer Today' },
      { href: '/wordle-answer-archive', label: 'Wordle Answer Archive' },
      { href: '/colordle-solver', label: 'Colordle Solver' },
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/colorfle-answer-today', label: 'Colorfle Answer Today' },
      { href: '/wordle-solver', label: 'Wordle Solver' }
    ]
  },
