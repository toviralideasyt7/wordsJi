    key: 'nerdle-answer-today',
    eyebrow: 'Nerdle Strategy Guide',
    intro:
      'Nerdle is Wordle with arithmetic instead of letters: you have six tries to guess an eight-character equation, and every tile comes back green, purple, or black. Most players lose because they guess full equations too early. This guide explains how to read the color feedback like a logic grid, cover operators on purpose, and stop missing the tidy-equation trap.',
    sections: [
      {
        heading: 'Why guessing full equations is the most common mistake',
        paragraphs: [
          'Nerdle answers are eight-character equations — a two-digit number, an operator, another number, equals, and a result. The temptation is to guess 12+34=46 on turn one and hope. The math is against you: there are tens of thousands of possible equations, and a full-equation guess that misses reveals almost nothing about the structure you actually need.',
          'The players who solve Nerdle consistently do the opposite. They treat the first two guesses as census-taking: cover as many digits and operators as possible, in positions that tell you where things go. By guess three, they usually know the operator, half the digits, and the rough shape of the equation — which is when a real solve attempt becomes possible.',
          'The feedback colors add a wrinkle Wordle does not have. Green means the character is correct and in the right position. Purple means the character is in the equation but in a different spot — note that Nerdle only marks one purple per character, so a repeated digit can hide a second copy. Black means the character does not appear at all.',
          'That last rule is the trap. If you guess 5 in two positions and only one comes back purple, the answer might still contain a second 5 — the game only lights up one. Never read a single purple as "one copy only."'
        ]
      },
      {
        heading: 'The census openers that cover the board',
        paragraphs: [
          'A good Nerdle opener does three jobs at once: tests the most common digits, tests both operators you expect, and produces a valid equation. The classic community openers are 9-8*7=56 and 12+35=47. Between them, they cover every digit from 1 to 9, plus plus, minus, and multiply.',
          'You do not need to use the community openers — you need to understand what they are doing. Any two guesses that together cover nine or ten distinct digits and at least two operators give you the same information. What you should avoid is an opener like 11+22=33, which wastes tiles on repeated digits and only tests one operator.',
          'The equals sign deserves special attention. It is always the sixth character of the equation — Nerdle equations are always formatted with the result as a one- or two-digit number on the right. Knowing that, a purple equals is impossible; it is either green or black, and if it is black your equation is malformed, which the game rejects.',
          'That constraint is your friend. Because equals is locked in position six, every guess is really about the five characters before it and the two after it. Plan around that shape and the board shrinks fast.'
        ],
        callout: {
          title: 'The census rule',
          body: 'Your first two guesses should test every digit once and both likely operators. Information beats correctness until the shape of the equation is clear.'
        }
      },
      {
        heading: 'Reading purple tiles and the duplicate-digit problem',
        paragraphs: [
          'Purple feedback in Nerdle is positional information, exactly like yellow in Wordle. A purple 4 in the third slot means the answer has a 4, but not there. The efficient response is to guess a valid equation that moves every purple character to a new position at once.',
          'The duplicate-digit problem deserves a warning of its own. Because Nerdle lights only one tile per matching character, an answer like 55+11=66 can make a guess of 51+12=63 show a single purple 5, a single purple 1, and a single purple 6 — even though the answer contains two of each. If your candidate equations keep failing and the board is full of single purples, start testing doubles.',
          'Repeated digits are far more common in Nerdle than repeated letters are in Wordle. Answers like 22+33=55, 11*9=99, and 84/2=42 all lean on doubles. When elimination has narrowed the digit pool and nothing fits, doubles are the next thing to probe — deliberately, with a guess like 66+11=77.'
        ]
      },
      {
        heading: 'The tidy-equation trap and why pretty answers lose',
        paragraphs: [
          'Every Nerdle player has done this: the board shows green 2 and 4 in the first two slots, and your brain jumps straight to 24+16=40 because it looks clean. That is the tidy-equation trap. Clean-looking arithmetic is not the same as likely arithmetic, and the most common Nerdle answers are built on boring facts like 12+34=46 and 9*8=72.',
          'The fix is to weigh candidates by how many of your constraints they satisfy, not by how elegant they look. A candidate that uses two purple digits in new positions, tests one new digit, and keeps your greens is worth more than a pretty equation that ignores half your feedback.',
          'There is also a structural tell worth knowing: the result side (positions seven and eight) is almost always a two-digit number, and the first operand is often two digits as well. Answers with single-digit operands exist but are rarer. Weight your guesses toward two-digit-first-operand shapes and you eliminate a huge share of the candidate space early.'
        ],
        list: {
          title: 'Signals that should change your next guess',
          items: [
            'A purple digit you keep replaying in the same position: move it, do not repeat it',
            'All purples and no greens by guess four: stop solving, run one more census guess',
            'A green equals sign: treat positions one through five and seven through eight as separate puzzles',
            'Two greens on the result side: the answer is a specific two-digit number, weight candidates around it',
            'A black operator early: eliminate that operator from every future candidate'
          ]
        }
      },
      {
        heading: 'Hard mode, speed runs, and the fastest way to improve',
        paragraphs: [
          'Nerdle\'s hard mode forces you to reuse purple and green characters in every subsequent guess, which sounds restrictive and is — in exactly the way that trains better habits. Hard mode makes it impossible to lean on throwaway census guesses late in the game, so you have to learn to extract maximum information from every equation.',
          'Speed runs change the goal from solving to solving fast, which changes the strategy again: speed solvers deliberately play slightly riskier second guesses to bank an early solve when the board is friendly. That is a fine habit for speed mode and a bad habit for streak mode. Decide which you are playing before you submit.',
          'For pure improvement, replay old puzzles and log one line after each loss: which operator did you fail to test, and which digit did you misplace? The pattern is almost always one of those two. Nerdle rewards disciplined elimination more than arithmetic speed — the math is the puzzle, not the bottleneck.'
        ],
        callout: {
          title: 'The one-sentence Nerdle philosophy',
          body: 'Solve the shape before you solve the equation. Every guess is a census until the operator, the digits, and the result structure are all known.'
        }
      },
      {
        heading: "The Nerdle daily rhythm, mastered",
        paragraphs: [
          "Nerdle's daily puzzle follows a rhythm that players learn to ride. The first guess should be a broad equation that sweeps common digits and the equals sign; the second should re-test the survivors in new positions; and by the third, the solver's candidate list is usually short enough to finish.",
          "The daily answers reveal the equation space's habits. Two-term sums dominate, subtraction appears regularly, and multiplication and division are rarer — so a first guess that targets the sum form is statistically the best opener.",
          "The feedback discipline is the real skill. Green locks a character, purple relocates it, black bans it — and the fastest solvers respect all three absolutely. Players who slip banned digits into later guesses waste moves the solver never wastes.",
          "Finally, the daily reveal is the learning loop. Checking today's answer after your solve shows you the equation's structure and the characters you misjudged — and each review sharpens the instincts that make tomorrow's puzzle faster."
        ]
      },
      {
        heading: "The Nerdle daily archive and the equation coach",
        paragraphs: [
          "The Nerdle archive is an equation coach that updates daily, and its lessons compound. Each entry shows the daily equation, its structure, and the characters it used — and reviewing the archive builds the equation-space intuition the game tests.",
          "The form distribution is the archive's clearest lesson. Two-term sums dominate, subtraction appears regularly, and multiplication and division are rarer — so the archive confirms that a sum-form first guess is the statistically best opener.",
          "The character census is the second lesson. The archive shows which digits and operators recur — the workhorse 1, 2, 0, and 5, the rarer 8, 9, and 7 — and that census shapes every opener you choose.",
          "Finally, the archive is the practice gym. Every past equation is a puzzle you can replay, and running through old entries builds the feedback discipline — green locks, purple relocates, black bans — that makes the daily game faster."
        ]
      },
    ],
    faqHeading: 'Nerdle Questions, Answered',
    faqs: [
      {
        question: 'What do the colors mean in Nerdle?',
        answer:
          'Green means the character is correct and in the right position. Purple means it is in the equation but in a different position. Black means it is not in the equation. Only one tile per matching character is lit, so doubles can hide.'
      },
      {
        question: 'What is the best first guess in Nerdle?',
        answer:
          'A census opener like 9-8*7=56 or 12+35=47 that tests many digits and two operators. The goal of guess one is information coverage, not a solve.'
      },
      {
        question: 'Why do I keep losing Nerdle with one digit left?',
        answer:
          'You are probably reading a single purple as proof there is only one copy. Test doubles deliberately — repeated digits are common in Nerdle answers.'
      },
      {
        question: 'Can the equals sign be in a different position?',
        answer:
          'No. Nerdle equations always put the result as a one- or two-digit number on the right, so the equals sign is always the sixth character.'
      },
      {
        question: 'How is Nerdle different from Wordle?',
        answer:
          'Wordle guesses letters of a word; Nerdle guesses the characters of a valid arithmetic equation. Nerdle also adds purple feedback, and repeated characters behave differently.'
      }
    ],
    relatedLinks: [
      { href: '/wordle-answer-today', label: 'Wordle Answer Today' },
      { href: '/quordle-answer-today', label: 'Quordle Answer Today' },
      { href: '/nerdle-solver', label: 'Nerdle Solver' },
      { href: '/phoodle-answer-today', label: 'Phoodle Answer Today' },
      { href: '/betweenle-answer-today', label: 'Betweenle Answer Today' },
      { href: '/semantle-answer-today', label: 'Semantle Answer Today' }
    ]
  },
