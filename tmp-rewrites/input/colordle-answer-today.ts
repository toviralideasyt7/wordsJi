    key: 'colordle-answer-today',
    eyebrow: 'Colordle Strategy Guide',
    intro:
      "Colordle gives you six tries to guess a mystery color by mixing red, green, and blue, and each guess returns a score that tells you how close your mix is. Today's Colordle answer is {answer} ({hex}), day {dayNum}. This guide explains how the scoring actually works, why hue matters more than brightness, and how to turn a color puzzle into a narrowing search.",
    sections: [
      {
        heading: "How Colordle scoring works under the hood",
        paragraphs: [
          "Colordle compares your guess to the target color using a perceptually weighted color difference, not a naive RGB distance. That is why two guesses with the same raw RGB error can score very differently: the model weights how humans actually see color, which means the green channel dominates perception more than the blue channel does.",
          "The score you see after each guess is a similarity percentage — the closer to 100, the closer your mix is to the answer. The practical takeaway is that the percentage is a direction, not just a grade. A score of 62 percent tells you to keep moving in the same direction; a score that drops tells you to reverse one of the channels.",
          "This is the same logic the Colordle solver on this site uses, which is why it narrows so fast: it models the scoring rule exactly and filters candidate colors by the percentages you feed it. Understanding the rule makes the tool feel less like magic and more like a calculator."
        ]
      },
      {
        heading: "The Colordle answer for {date} (day {dayNum})",
        paragraphs: [
          "Today's Colordle answer is {answer}, which comes down as hex code {hex} on day {dayNum}. Players searching for the Colordle answer for {date} — or the Colordle day {dayNum} answer, which is the format the community uses — will find the same color on this page and everywhere that mirrors the official source.",
          "The answer card at the top of this page shows {answer} with its exact hex value, so you can compare it against your own mix and see exactly where your guess landed. The percentage score from your final attempt is the same number the solver would use to confirm {answer} is correct.",
          "If you are here because you already solved it and want to check the official spelling, note that Colordle's color names follow the official list — {answer} is the canonical name for day {dayNum}, and the hex {hex} is the exact target value."
        ],
        callout: {
          title: "Day-number search tip",
          body: "Colordle players often search 'colordle day {dayNum}' or 'colordle day {dayNum} answer' instead of a date. This page is keyed to day {dayNum}, so both formats land here."
        }
      },
      {
        heading: "Why hue beats brightness in the first three guesses",
        paragraphs: [
          "New Colordle players start by adjusting brightness and saturation, which feels natural but wastes guesses. The fastest solvers fix the hue first. Hue is the dominant perceptual axis — whether the color leans red, green, blue, yellow, purple, or cyan — and getting it roughly right collapses the search space more than any other single adjustment.",
          "The efficient opening sequence is: guess a pure primary color, read the percentage, then guess a neighboring primary. If pure red scores 40 and pure green scores 35, the answer sits somewhere between red and green — an orange or yellow family. That single insight narrows the palette to a fraction of the possibilities.",
          "Brightness adjustments belong in the middle game. Once the hue family is locked, small brightness and saturation changes produce the fine-tuning that takes a 70 percent score to 90 plus. Players who jump straight to fine-tuning never learn where the hue actually is."
        ],
        list: {
          title: "The color-narrowing order that works",
          items: [
            "Guess a primary color (pure red, green, or blue) to establish direction",
            "Guess a second primary to find the hue family — the two percentages bracket it",
            "Adjust the dominant channel toward the higher-scoring guess",
            "Lock the hue, then fine-tune brightness and saturation",
            "Once above 90 percent, make single-digit changes — the answer is one small nudge away"
          ]
        }
      },
      {
        heading: "Reading your score history like a map",
        paragraphs: [
          "Colordle gives you the score history for every guess, and the history is the real puzzle. A rising sequence of scores means you are moving the right direction on the right channel. A score that stalls while you change one channel tells you that channel is close to correct and a different one needs work.",
          "The classic stall pattern: your mix is 78 percent and every small change leaves it at 78. That is the signal to stop nudging and start rebalancing — the hue is right but the ratio between two channels is off, so change both at once rather than one at a time.",
          "The solver on this page turns the history into a candidate list. Feed it each guess and its percentage, and it filters the color space down to the colors that match every score. When the list is short, the answer is visible; when it is long, your last guess was too similar to the previous one to separate the candidates."
        ]
      },
      {
        heading: "Common Colordle mistakes that kill streaks",
        paragraphs: [
          "The most common mistake is over-adjusting. A 62 percent score tempts players to make huge changes, when the correct response is a small, deliberate shift on one channel. Big swings overshoot the target and waste the guess.",
          "The second mistake is treating the channels as equal. Red, green, and blue are not perceived equally, and the scoring weights them differently. A change to blue moves the score less than the same change to green, which confuses players who expect symmetric behavior.",
          "The third mistake is ignoring the solver when the percentage stops moving. Players grind out guess after guess on a 75 percent plateau instead of feeding the scores into the solver and letting the filter find the handful of colors that match. Every plateau has a short answer list; the solver just makes it visible."
        ],
        callout: {
          title: "The one-line Colordle philosophy",
          body: "Fix the hue, then fine-tune. The percentage is a direction, and direction beats magnitude every time."
        }
      },
      {
        heading: "How to practice without burning your streak",
        paragraphs: [
          "The fastest way to get better at Colordle is to replay old puzzles. The archive on this site keeps the color for every past day, so you can practice the hue-first method on days you already know the answer to — the feedback loop is instant and the stakes are zero.",
          "A second habit: after each loss, write down which guess stalled. The losing pattern is almost always the same — fine-tuning too early, before the hue family is locked. Watching for that one mistake fixes more streaks than any color theory.",
          "Finally, use the solver as a sparring partner, not a crutch. Solve the daily puzzle yourself, then check whether the solver would have guessed differently on turns two and three. The divergence is the lesson, and it is usually the same one every time: hue first, brightness later."
        ]
      },
      {
        heading: "Reading the Colordle daily answer archive",
        paragraphs: [
          "The Colordle answer archive is a study tool hiding in plain sight. Each daily answer — the day's color — reveals the palette the game draws from, and reviewing the archive shows you the pool's shape: the standard rainbow, the classic neutrals, and the recognizable named colors.",
          "The palette knowledge transfers directly to solving. When you know the pool favors recognizable families, your guesses can target those families — and when the feedback says a component is yellow (near-miss), you can enumerate the nearby shades in the family you now know.",
          "The archive also teaches the day-numbering system. Colordle puzzles are numbered, and players who track the numbers can cross-reference answers across sites and dates — a habit that makes the daily reveal page the hub of the Colordle community.",
          "Finally, the daily reveal with its hex value is the exact confirmation every player wants. Whether you solved it or need the reveal, the answer page settles the day — and the archive keeps the streak history one click away."
        ]
      },
      {
        heading: "The Colordle daily rhythm and the streak system",
        paragraphs: [
          "Colordle's daily puzzle follows the daily-game rhythm, and the streak system is the engine that keeps players coming back. The daily reveal page is the record of that streak — the current answer, the day number, and the archive of every past color.",
          "The day-numbering system is worth understanding. Colordle puzzles are numbered sequentially, and the numbers let players cross-reference answers across sites and dates — the same habit that powers the Wordle community's daily discussions.",
          "The daily reveal with its hex value is the confirmation every solve needs. Whether you solved in four or needed the reveal, the answer page settles the day — and the hex lets you compare your final guess against the exact shade.",
          "Finally, the archive is the practice gym. Every past answer is the same palette and the same rules, and running through old puzzles builds the component-filtering intuition — green locks, yellow steers, gray bans — that makes the daily game faster."
        ]
      },
    ],
    faqHeading: "Colordle Questions, Answered",
    faqs: [
      {
        question: "What is the Colordle answer for {date}?",
        answer:
          "The Colordle answer for {date} is {answer} — hex code {hex}, day {dayNum}. It is the same color across every source; the game resets at midnight with a new color."
      },
      {
        question: "How do you play Colordle?",
        answer:
          "You mix red, green, and blue values to match a mystery color in six guesses. Each guess returns a similarity score, and the goal is to reach the exact target before you run out of attempts."
      },
      {
        question: "What does the Colordle percentage mean?",
        answer:
          "It measures how perceptually close your mix is to the target color. Higher is closer, and the score is weighted toward how humans actually see color rather than raw RGB distance."
      },
      {
        question: "What is the best first guess in Colordle?",
        answer:
          "A pure primary color — red, green, or blue — to establish direction. Follow it with a neighboring primary to bracket the hue family before adjusting brightness."
      },
      {
        question: "Does the Colordle solver work for past puzzles?",
        answer:
          "Yes. The solver filters the same color space used by the game, so you can reconstruct any past answer, including day {dayNum}, by entering your guesses and scores."
      }
    ],
    relatedLinks: [
      { href: "/colordle-solver", label: "Colordle Solver" },
      { href: "/colorfle-answer-today", label: "Colorfle Answer Today" },
      { href: "/spotle-answer-today", label: "Spotle Answer Today" },
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/framed-answer-today", label: "Framed Answer Today" },
      { href: "/colordle-answer-archive", label: "Colordle Answer Archive" }
    ]
  },
