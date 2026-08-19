    key: 'colordle-solver',
    eyebrow: 'Colordle solver, explained by its author',
    intro:
      "This Colordle solver exists because I got tired of losing streaks to colors I could not name. You make a guess in the game, note the similarity percentage it gives you, enter the color and the percentage here, and the solver filters thousands of named colors down to the ones that produce exactly that score against your guess. Add a second guess and the list collapses to a handful. Add a third and the answer is usually staring at you. Below is how the filtering works, the workflow I use on the daily puzzle, and the habits that keep a Colordle streak alive.",
    sections: [
      {
        heading: 'How the Colordle solver actually works (I wrote the filter)',
        paragraphs: [
          'The solver runs the same color math the game does. When Colordle scores your guess, it converts your color and the target into Lab color space, computes a Delta E difference (the CIEDE2000 formula, the same one image-editing tools use), and shows you 100 minus that difference as your percentage. Two colors that look nearly identical score in the nineties; opposite ends of the spectrum score near zero.',
          'The solver inverts that process. Every candidate color in the named-color list gets the same Delta E computation against your guess, and any candidate whose computed score does not match the percentage you observed is eliminated. Not ranked lower. Eliminated. The tolerance is two hundredths of a point, because the game displays two decimals and the math has to land inside that window.',
          'That exactness is the whole trick, and it is why I trust the output more than my own eye on a bad monitor. If the solver says a color cannot produce 34.71 against your guess, it cannot. Your display might lie to you; the arithmetic does not.'
        ]
      },
      {
        heading: 'One percentage is worth more than it looks',
        paragraphs: [
          'A single guess-plus-percentage pair does something geometric: it defines a shell around your guess. Every color sitting at that exact perceptual distance survives; everything closer or farther is out. On its own, one shell still leaves a lot of candidates, which surprises people who expect one guess to nearly solve the puzzle.',
          'The second guess is where it gets unfair. A second shell, centered somewhere else, intersects the first one, and the surviving set is the intersection. In practice that means two decent guesses routinely cut thousands of named colors down to a list that fits on screen. Three guesses usually end the puzzle.',
          'I think of it as triangulation, because that is essentially what it is. Each percentage is a distance measurement to an unknown point, and two or three distance measurements from different positions pin the point down. Sailors navigated by this for centuries; Colordle players can too.'
        ],
        callout: {
          title: 'The rule that matters most',
          body: 'Enter every guess, not just the ones where you felt stuck. The filter is cumulative — a guess you made on a whim early often does more narrowing than the careful one you made late.'
        }
      },
      {
        heading: 'The exact workflow I run on the daily puzzle',
        paragraphs: [
          'Guess one, I play in the game itself: a named color chosen to split the space, something central rather than an exotic edge shade. The game hands me a percentage, say 19.69. I type the color name into the solver, select it from the dropdown, enter 19.69, and filter.',
          'The candidate list that comes back is my palette for guess two. I pick the candidate furthest from my first guess — distance between guesses is what makes the second shell intersect the first usefully — play it in the game, and bring its percentage back. Two rows in, the list is usually short enough that I can read every remaining name.',
          'Guess three is confirmation. If two candidates survived both rows, one of them is the answer, and the third guess settles it. If the list is somehow still long, the cause is almost always the same: my two guesses were too similar. The fix is not more guessing. The fix is a third guess chosen to be genuinely far from both.'
        ],
        list: {
          title: 'The loop, in five lines',
          items: [
            'Guess a central named color in the game and note the percentage',
            'Enter the color name and the exact percentage into the solver, then filter',
            'Pick the surviving candidate farthest from your previous guesses for the next guess',
            'Add each new percentage immediately — every row compounds',
            'When two or three candidates remain, guess the most common-sounding name first'
          ]
        }
      },
      {
        heading: 'Picking guesses that split the color space',
        paragraphs: [
          'Not all guesses filter equally. A guess at the extreme edge of color space — a neon saturation, a near-black shade — produces percentages that eliminate a lot for some answers and almost nothing for others. Central, balanced colors split the space more evenly, which means every possible answer learns something from them.',
          'The second consideration is naming. The solver speaks in named colors, so guesses you can name exactly beat guesses you can only approximate. "Salmon" is a better tool than "that pinkish-orange I am seeing," and the game itself draws from the same kind of named palette, so the vocabulary transfers both directions.',
          'If you want the fuller strategy — hue families first, brightness later, how to bracket with primaries — the answer page covers it in detail. The solver is the calculator; that page is the method. Together they are considerably better than either one alone.'
        ]
      },
      {
        heading: 'Where the solver beats intuition (and where it does not)',
        paragraphs: [
          'Intuition drifts. Late at night, on an uncalibrated screen, after three losses, my color judgment is noticeably worse than it thinks it is. The solver applies the same Delta E arithmetic to every row with the same two-hundredths tolerance, every day, regardless of mood. For consistency alone it earns its place.',
          'It also does the tedious part flawlessly: holding every constraint from every previous guess at once. When five percentages are in play, I can hold maybe three of them in my head honestly. The solver holds all five and never guesses a color that contradicts an earlier row, which is precisely the error tired players make on turn five.',
          'What it does not do is feel like a win. Solving by triangulation is satisfying the way filing taxes correctly is satisfying. So here is my honest recommendation, from someone who plays both ways: solve the daily yourself first when you have the time, and use the solver when a streak is on the line or when you want to check whether your instincts were even close. The gap between the two is usually educational.'
        ]
      },
      {
        heading: 'The palette, the tolerance, and the edge cases',
        paragraphs: [
          'The candidate pool is a large fixed list of named colors, and the solver pre-computes nothing about your specific puzzle — it filters live from your inputs, so it works on any Colordle-style puzzle that scores with the same percentage system. Old daily puzzles included. The archive and the solver together make a decent practice gym: replay a past day, run the loop, and watch how fast three guesses collapse the space.',
          'The edge case worth knowing: very high percentages. When you score in the high nineties, you are inside a tight cluster of visually adjacent names, and the candidate list can stay stubbornly long because many colors sit almost the same distance from your guess. The escape is a guess from a different part of the palette entirely, even one you know is wrong. A deliberately wrong guess at distance still produces a shell, and its intersection with your near-miss shell is tiny.',
          'The other edge case: rounding. The game shows two decimals; enter them both. 19.7 and 19.69 are different filters, and the stricter you are, the fewer false candidates survive. The solver enforces the tolerance — your job is just to read the number off the screen faithfully.'
        ],
        callout: {
          title: 'Streak on the line?',
          body: 'Do not panic-guess. Two candidates left means one guess settles it with certainty; enter your latest percentage, read the two names, and play the more likely one. Certainty beats hope at fifty-fifty odds.'
        }
      }
    ],
    faqHeading: 'Colordle solver questions',
    faqs: [
      {
        question: 'How does the Colordle solver work?',
        answer:
          'Enter the color you guessed and the exact similarity percentage the game showed. The solver computes the same Delta E color difference the game uses and keeps only the named colors that would produce your score against that guess. Every row you add narrows the list further.'
      },
      {
        question: 'Can the Colordle solver find today\'s answer?',
        answer:
          'Yes — two or three guess-plus-percentage entries usually reduce thousands of named colors to a short list that contains the daily answer. For the straight reveal, the Colordle answer today page has it with hints.'
      },
      {
        question: 'Does the solver work for old Colordle puzzles?',
        answer:
          'It filters live from your inputs rather than from a stored daily answer, so it works on any past day from the archive and any puzzle that scores guesses as percentages.'
      },
      {
        question: 'Why do some percentages leave a long candidate list?',
        answer:
          'You are usually too close to the target — many named colors sit nearly the same distance away. Add a guess from a different part of the palette; its shell intersects your near-miss shell and the list collapses.'
      },
      {
        question: 'How many guesses should Colordle take with a solver?',
        answer:
          'Three to four for most puzzles: one central opener, one distant second guess to intersect the shells, and a confirmation. Done carefully, the sixth guess is almost never needed.'
      }
    ],
    relatedLinks: [
      { href: '/colordle-answer-today', label: 'Colordle Answer Today' },
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/colorfle-answer-today', label: 'Colorfle Answer Today' },
      { href: '/colorfle-solver', label: 'Colorfle Solver' },
      { href: '/spotle-answer-today', label: 'Spotle Answer Today' },
      { href: '/wordle-solver', label: 'Wordle Solver' }
    ]
  },
