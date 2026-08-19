    key: 'nerdle-answer-today',
    eyebrow: 'Nerdle today',
    intro:
      "Nerdle is Wordle for people who trust arithmetic more than the alphabet: six tries to guess an eight-character equation, with green, purple, and black tiles grading every character. I lost embarrassingly often during my first month, always to equations I could have verified in my head, and the reason was the same every time — I guessed complete equations on turn one instead of gathering information. The Nerdle answer today is in the reveal card up top if you want it; the rest of this page is the method that took my average from five-plus guesses to a boring three or four, and the traps that still catch me when I get cocky.",
    sections: [
      {
        heading: 'The month I lost to arithmetic I could do asleep',
        paragraphs: [
          'The temptation on turn one is to type something plausible like 12+34=46 and hope. The math is brutal: tens of thousands of equations are valid, and a full-equation miss tells you almost nothing about the structure you actually need to know. I knew this, read about it, ignored it, and paid for it daily for weeks. Hope is not a census.',
          'The players who solve Nerdle consistently spend their first two guesses counting the room: cover as many digits and operators as possible, in positions that reveal where things belong. By guess three they usually know the operator, half the digits, and the rough shape of the equation. Only then does a real solve attempt make sense — and by then it barely counts as an attempt, because the candidates fit on one hand.',
          'The lesson generalizes to every game on this site, which is why I keep writing it: a guess is a question. Ask boring, complete questions early, and the interesting ones answer themselves.'
        ]
      },
      {
        heading: 'Green, purple, black — and the purple lie',
        paragraphs: [
          'Green means the character is correct and correctly placed. Purple means it belongs in the equation somewhere else. Black means it is not in the equation at all. So far, so Wordle-with-symbols.',
          'The wrinkle that ruins streaks: Nerdle lights only one tile per matching character. Guess a digit in two positions, and if the answer contains two copies, you might still see a single purple — the second copy stays dark. I call it the purple lie, and it cost me a long streak before I named it. A single purple is never proof that only one copy exists.',
          'The corollary is that purple is positional gold when you respect it. A purple 4 in slot three means the answer owns a 4, elsewhere. The right response is a valid equation that relocates every purple character at once — same discipline as moving yellow letters in Wordle, and equally mechanical once it is a habit.'
        ]
      },
      {
        heading: 'Two census openers, and why the equals sign never moves',
        paragraphs: [
          'The community openers are 9-8*7=56 and 12+35=47. Between them, every digit from 1 through 9 gets tested, plus minus, multiplication, and addition. You do not have to use those exact guesses — any pair that covers nine or ten distinct digits and at least two operators does the same job. What you must not do is open with something like 11+22=33, which burns tiles on repeats and tests a single operator while claiming to be information.',
          'The equals sign is structural: the result always sits on the right as a one- or two-digit number, which locks equals into position six of eight. A purple equals is impossible — it is green or the equation was malformed. That fixed shape is a gift: every guess is really about the five characters before the equals and the two after it, and planning around that skeleton shrinks the board faster than any clever digit trick.'
        ],
        callout: {
          title: 'The census rule',
          body: 'First two guesses: every digit once, both likely operators. Information beats correctness until the operator, the digits, and the result shape are all known.'
        }
      },
      {
        heading: 'When nothing fits, probe the doubles',
        paragraphs: [
          'Repeated characters are far more common in Nerdle than repeated letters are in Wordle. The archive is full of equations like 22+33=55, 11*9=99, 84/2=42 — doubles doing real work in the answer, quietly unlit by your single-purple feedback.',
          'Here is the concrete version of the trap. The answer is 55+11=66. You guess 51+12=63. The board shows one purple 5, one purple 1, one purple 6 — and no hint that the answer holds two of each. If your candidates keep failing and the board is littered with single purples, the next guess should deliberately test doubles: something like 66+11=77, which either lights greens or clears the double hypothesis entirely.',
          'I treat it as a scheduled suspicion now. The moment elimination has narrowed the digit pool and the remaining candidates all feel a tile short of valid, doubles are the next hypothesis — probed on purpose, not stumbled into on guess six when the streak is already dying.'
        ]
      },
      {
        heading: 'The tidy-equation trap',
        paragraphs: [
          'The board shows green 2 and green 4 in the opening slots, and your brain serves you 24+16=40 because it looks clean. Every Nerdle player has paid this tax. Clean-looking arithmetic is not likely arithmetic — the actual answers lean on boring, structurally ordinary equations, and elegance is a bias, not a signal.',
          'The fix is mechanical: rank candidate equations by how many constraints they satisfy, never by their beauty. A candidate that relocates two purples, tests one fresh digit, and keeps your greens is worth more than a pretty equation that ignores half your feedback. Beauty gets zero votes.',
          'One structural weight worth memorizing: the result side is almost always two digits, and the first operand is usually two digits as well. Single-digit-operand answers exist but are the minority, so when you must choose between candidate shapes, the two-digit-first-operand family is the statistically safer probe.'
        ],
        list: {
          title: 'Board signals that should change your next guess',
          items: [
            'A purple digit you keep re-placing where it already failed: move it somewhere genuinely new',
            'All purples, no greens by guess four: stop solving, run one more census equation',
            'Green equals: treat the five characters left of it and the two right of it as separate mini-puzzles',
            'Two greens on the result: the answer is a specific number, build candidates around it',
            'A black operator: gone from every future candidate, no exceptions, no nostalgia'
          ]
        }
      },
      {
        heading: 'Hard mode, speed mode, and knowing which game you are playing',
        paragraphs: [
          "Nerdle's hard mode forces every guess to reuse your greens and purples. It sounds like a handicap and it is, in the way a weighted bat is a handicap in batting practice. Census guesses late in the game stop being available, so you learn to extract full value from every equation — and normal mode afterwards feels spacious.",
          'Speed mode flips the objective entirely: solving fast means deliberately riskier second guesses to bank early wins when the board is friendly. That is correct speed strategy and terrible streak strategy. I played speed habits into my streak games for a week and could not work out why my losses clustered on guess two. Decide which mode you are playing before you submit the first equation; the games share a board and almost nothing else.',
          'For plain improvement, the loop that worked for me: replay old puzzles from the archive, and after each loss write one line — which operator did I fail to test, or which digit did I misplace. My losses were almost always one of those two, which is simultaneously humbling and useful, because a two-item checklist is a fixable problem.'
        ],
        callout: {
          title: 'The whole method in one line',
          body: 'Solve the shape before the equation: census first, doubles on schedule, and never vote for a candidate because it is pretty.'
        }
      },
      {
        heading: 'What a stretch of archived equations taught me about the pool',
        paragraphs: [
          'The Nerdle archive is quietly a statistics lesson. Read a month of past equations and the distribution is unmistakable: two-term sums dominate, subtraction shows up regularly, multiplication and division are the minority. A first guess aimed at the sum form is not superstition — it is the statistically best opening, and the archive is the receipt.',
          'The digit census is the second lesson. Some digits work hard — 1, 2, 0, and 5 appear constantly — while 7, 8, and 9 ride the bench more than you would guess. My openers drifted toward the workhorses over time, and my guess counts dropped accordingly. I did not discover this; I read it off the archive like everyone else who bothers to look.',
          'The daily reveal closes the loop. After each solve, the answer card shows the equation\'s full structure, and thirty seconds of comparing it against your guess sequence shows exactly which character you misjudged. Tomorrow\'s puzzle starts slightly easier every time you bother to look — that compounding is the entire reason my average fell, and it costs less time than the coffee it accompanies.'
        ]
      }
    ],
    faqHeading: 'Nerdle questions, answered',
    faqs: [
      {
        question: 'What do the colors mean in Nerdle?',
        answer:
          'Green: correct character, correct position. Purple: in the equation, wrong position. Black: not in the equation. Only one tile per matching character lights up, so a single purple can hide a second copy.'
      },
      {
        question: 'What is the best first guess in Nerdle?',
        answer:
          'A census opener like 9-8*7=56 or 12+35=47 — together they test every digit plus several operators. The goal of guess one is coverage, not a solve; mine cut my average by nearly two guesses.'
      },
      {
        question: 'Why do I keep losing Nerdle one digit short?',
        answer:
          'Almost certainly the duplicate trap: reading one purple as proof of one copy. When candidates stop fitting, deliberately probe repeated digits — doubles are common in Nerdle answers.'
      },
      {
        question: 'Can the equals sign be in a different position?',
        answer:
          'No. The result is always a one- or two-digit number on the right, which fixes equals at position six of eight. A purple equals is impossible by construction.'
      },
      {
        question: 'What are the Nerdle variants?',
        answer:
          'The family covers sizes and stakes: Mini Nerdle is a shorter six-character board, Maxi Nerdle expands to ten, Bi-Nerdle runs two puzzles at once, and Instant Nerdle is a one-shot version. The census method scales to all of them.'
      },
      {
        question: 'How is Nerdle different from Wordle?',
        answer:
          'Wordle guesses letters; Nerdle guesses the characters of a valid arithmetic equation, adds purple for misplaced characters, and repeated digits behave differently than repeated letters — doubles hide.'
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
