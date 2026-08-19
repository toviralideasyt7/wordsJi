    key: 'colordle-answer-today',
    eyebrow: 'Colordle answer today',
    intro:
      "Today's Colordle answer is {answer} ({hex}), day {dayNum} — the reveal card at the top of the page shows the exact shade. Below that is the part I care about: how the scoring actually works and the guessing order that fixed my game. Colordle gives you six tries to match a mystery color by mixing red, green, and blue, and every guess comes back with a similarity percentage. I lost three streaks before I understood what that percentage was telling me, so this page is my attempt to save you the same tuition.",
    sections: [
      {
        heading: 'I lost three Colordle streaks to the same mistake',
        paragraphs: [
          'The mistake was fine-tuning. I would get to 70-something percent, decide I was close, and start making tiny single-digit nudges to brightness. Six guesses is not a lot, and I was burning three of them on adjustments that moved the score half a point at a time. If you have lost a Colordle streak, I would bet money this is how.',
          'What finally clicked is that Colordle does not score raw RGB distance. The score is a perceptual similarity percentage — the game runs the colors through the same kind of color-difference math that image tools use, weighted toward how human eyes actually see. Green moves the score more than blue. Same numeric change, different perceptual punch, and if you do not know that, the feedback looks broken.',
          'The percentage is also a direction, not a grade. Sixty-two percent does not mean "bad." It means every channel change that got you there from your last guess was pointed the right way, and the next guess should keep going that direction, or reverse the one channel that made the score drop. Once I started reading it that way, Colordle stopped feeling like a Ouija board.'
        ]
      },
      {
        heading: 'The Colordle answer for {date} (day {dayNum})',
        paragraphs: [
          "The Colordle answer for {date} is {answer}, which lands as hex code {hex} on day {dayNum}. If you searched the date format, or the community's day-number format — colordle day {dayNum} answer — both resolve to this same color, and it matches every mirror of the official source.",
          'The answer card above shows {answer} rendered at its exact hex, so you can put your final mix next to it and see precisely where you landed. The percentage on your last attempt is the same number the solver uses to confirm {answer} is the target, which is a nice closed loop: the tool and the game speak the same math.',
          'One small thing that trips people up: the color name is the canonical name from the game\'s official list. Day {dayNum} is {answer}, full stop. If a friend insists it looked like a different shade on their screen, that is monitor calibration having opinions, not a second answer.'
        ],
        callout: {
          title: 'Day-number searches land here',
          body: "Colordle regulars search 'colordle day {dayNum}' more often than dates. This page is keyed to day {dayNum}, so either format gets you the same answer."
        }
      },
      {
        heading: 'Hue first, brightness later — the order that fixed my game',
        paragraphs: [
          'New players, including me for an embarrassingly long stretch, open by adjusting brightness and saturation because the sliders are right there. The fastest solvers lock the hue family first. Whether the mystery color leans red, green, blue, yellow, or purple collapses the search space more than any other single decision, and everything after that is bookkeeping.',
          'The opening sequence I use now: guess a pure primary, read the percentage, then guess a neighboring primary. Pure red scores 40, pure green scores 35, and the answer is somewhere between them — the orange or yellow families. Two guesses, and the palette has shrunk from everything to a slice.',
          'Brightness belongs to the middle game. Once the hue family is locked, small brightness and saturation changes are what carry a 70 percent to a 90-plus. Done in that order, six guesses feel generous. Done in reverse order, they feel like four.'
        ],
        list: {
          title: 'The narrowing order I follow every day',
          items: [
            'First guess: a pure primary — red, green, or blue — to establish direction',
            'Second guess: a neighboring primary, so the two percentages bracket the hue family',
            'Third guess: push the dominant channel toward whichever bracket scored higher',
            'Middle game: hue locked, now adjust brightness and saturation in small steps',
            'Above 90 percent: single-digit changes only — the answer is one nudge away, not one leap'
          ]
        }
      },
      {
        heading: 'Your score history is a map, not a report card',
        paragraphs: [
          'Colordle shows the percentage for every guess you have made, and that history is the actual puzzle. A rising sequence means you are moving the right channels the right way. A score that stalls while you adjust one channel means that channel is basically correct and a different one needs the work.',
          'The specific stall I hit constantly: sitting at 78 percent, nudging, still 78, nudging, still 78. That is not bad luck. That is the game telling you the hue is right but the ratio between two channels is off, and single-channel nudges will never fix a two-channel problem. Change both at once. The score finally moves, and you will feel slightly betrayed about the previous three guesses.',
          'When the history gets long and confusing, the solver on this page does the tedious version for you: feed it each guess and its percentage, and it filters the color space down to the candidates that match every score. I built it to think exactly like the game scores, so when the candidate list is short, the answer is on it. When the list is long, your newest guess was too similar to the last one to separate anything — which is itself useful information.'
        ]
      },
      {
        heading: 'Three mistakes I watch other players make',
        paragraphs: [
          'Over-adjusting. A 62 percent score invites a huge correction, and the huge correction overshoots into a 44. The right response to a mediocre score is a small, deliberate change on one channel, then read the delta. Small moves, big information.',
          'Treating the channels as equals. They are not, perceptually. The same change to blue moves the score less than it does to green, and players who expect symmetric behavior conclude the game is arbitrary. It is not arbitrary. It is weighted, and knowing the weighting is a free advantage.',
          'Grinding on a plateau instead of using the filter. If you are at 75 percent for three straight guesses, the honest move is to stop guessing blind and enumerate what still fits. The solver makes the short list visible. Some days I use it on turn two, some days I never need it, but pretending it does not exist has never once saved a streak.'
        ],
        callout: {
          title: 'The whole method in one line',
          body: 'Fix the hue, then fine-tune. Direction beats magnitude, and the percentage tells you the direction every single guess.'
        }
      },
      {
        heading: 'Practice in the archive, not on your streak',
        paragraphs: [
          'The Colordle archive on this site holds the color for every past day, which makes it a free practice gym: replay old days with the hue-first method, get instant feedback, and risk nothing. I ran two weeks of archived days when I was learning the bracketing opening, and it did more for my solve rate than any amount of reading.',
          'The habit that stuck: after each loss, note which guess stalled. Mine were nearly all fine-tuning-too-early losses, and that one observation changed how I play more than any color theory did.',
          'And use the solver as a sparring partner rather than an oracle. Solve the daily yourself first, then ask what the solver would have played on turns two and three. Where the two diverge is where your instincts are off, and in my experience it is the same divergence every time: hue first, brightness later.'
        ]
      },
      {
        heading: 'What a year of archived answers taught me about the color pool',
        paragraphs: [
          'The archive doubles as a study tool, and not only for practice runs. Reading down the list of past answers shows you the shape of the pool the game draws from: the standard rainbow families, the classic neutrals, a steady supply of recognizable named colors. The pool has a personality, and once you have seen a few months of it, your bracketing guesses get suspiciously good.',
          'The day numbers are worth paying attention to as well. Colordle puzzles run in an unbroken numbered sequence, and the community indexes answers by day — which is why the day-{dayNum} search format exists at all. Tracking the number means you can cross-reference an answer across sites and dates without ambiguity, the same trick the Wordle crowd uses with puzzle numbers.',
          'Whether you solved today\'s in three or needed the reveal, the day settles here: {answer}, {hex}, day {dayNum}, archived the moment it published. Tomorrow there is a new color, and the hue-first crew will be fine.'
        ]
      }
    ],
    faqHeading: 'Colordle questions, answered',
    faqs: [
      {
        question: 'What is the Colordle answer for {date}?',
        answer:
          '{answer} — hex code {hex}, day {dayNum}. One color per day, reset at midnight, identical across every source that mirrors the official feed.'
      },
      {
        question: 'How do you play Colordle?',
        answer:
          'Mix red, green, and blue to match a mystery color within six guesses. Each guess returns a similarity percentage, and the goal is the exact match before the attempts run out.'
      },
      {
        question: 'What does the Colordle percentage actually mean?',
        answer:
          'It is a perceptual similarity score — how close your mix looks to the target, weighted the way human vision weights color, not raw RGB distance. That is why the green channel moves the score more than blue.'
      },
      {
        question: 'What is the best first guess in Colordle?',
        answer:
          'A pure primary color: red, green, or blue. Follow with a neighboring primary so the two percentages bracket the hue family before you touch brightness. That pair of guesses does most of the work.'
      },
      {
        question: 'Does the Colordle solver work for past puzzles?',
        answer:
          'Yes. It filters the same color space the game scores against, so entering your guesses and percentages reconstructs any past day — including day {dayNum}.'
      }
    ],
    relatedLinks: [
      { href: '/colordle-solver', label: 'Colordle Solver' },
      { href: '/colorfle-answer-today', label: 'Colorfle Answer Today' },
      { href: '/spotle-answer-today', label: 'Spotle Answer Today' },
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/framed-answer-today', label: 'Framed Answer Today' },
      { href: '/colordle-answer-archive', label: 'Colordle Answer Archive' }
    ]
  },
