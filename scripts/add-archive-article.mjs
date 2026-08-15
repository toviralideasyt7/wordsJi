// Add the wordle-answer-archive article.
// Run with: node scripts/add-archive-article.mjs
import { readFile, writeFile } from 'node:fs/promises';

const registryPath = 'src/lib/content/registry.ts';

const ENTRY = `  'wordle-answer-archive': {
    key: 'wordle-answer-archive',
    eyebrow: 'Wordle Answer Archive',
    intro:
      "Every Wordle answer ever published, in one place: the complete archive of daily solutions from the very first puzzle in June 2021 through today, searchable by date, word, or puzzle number. Whether you are looking for all Wordle answers in 2025, the full list of Wordle answers 2024, a specific answer from months ago, or tomorrow's Wordle answer, this page has the complete, verified record — updated daily.",
    sections: [
      {
        heading: "Every Wordle answer, from puzzle #1 to today",
        paragraphs: [
          "Wordle has published a new answer every single day since June 19, 2021, and this archive holds the complete list — every word, every date, every puzzle number. The full table below is rendered on the page, not hidden behind clicks, so search engines and players alike can read the entire history.",
          "Looking for all Wordle answers in 2025? The archive is organized by date, so you can scroll to any year, any month, any day. The search box also finds any answer by word, date, or puzzle number — type a date like 2025-06-15, a word like STORM, or a number like 1356, and the list filters instantly.",
          "The archive is verified from the official Wordle source and updated daily, so the record is accurate and complete. Every answer you see here is the real daily solution — no guesswork, no fan lists, no editorializing."
        ],
        list: {
          title: "What the archive contains",
          items: [
            "Every daily Wordle answer since puzzle #1 (June 19, 2021)",
            "The date and puzzle number for every answer",
            "A searchable table — filter by date, word, or puzzle number",
            "All Wordle answers for 2021, 2022, 2023, 2024, 2025, and 2026",
            "The current daily answer, linked from today's page"
          ]
        }
      },
      {
        heading: "All Wordle answers 2025 and 2026",
        paragraphs: [
          "The 2025 and 2026 answer sets are the most searched-for years in the archive, and both are fully covered here. All Wordle answers 2025 — every daily solution from January 1, 2025 through December 31, 2025 — are listed in order, and the 2026 answers continue the sequence day by day.",
          "Many players search for the 2025 list to study patterns: which letters repeat, how often answers are verbs versus nouns, and how the word list cycles. The archive makes that study easy — read the year in order and the tendencies jump out.",
          "The 2026 answers are updated live, so this page is also the place to find today's Wordle answer, yesterday's Wordle answer, or the answer for any future date once the official puzzle publishes it. Bookmark the archive and the daily page together, and you never miss a solution again."
        ],
        callout: {
          title: "Archive + today, together",
          body: "Bookmark this archive for the full history and the wordle-answer-today page for the current daily answer. Between the two, every Wordle answer — past, present, and future — is one click away."
        }
      },
      {
        heading: "How to search the Wordle answer list",
        paragraphs: [
          "The archive table supports three search styles. Search by date with the format YYYY-MM-DD to jump straight to a specific day; search by word to find any solution ever used (type CRANE and every puzzle that used it appears); or search by puzzle number to pinpoint a specific puzzle in the sequence.",
          "The table is also scrollable as a plain chronological list, so you can browse the entire history year by year. Each row shows the puzzle number, the date, and the answer — the complete record in the cleanest possible format.",
          "For the daily flow, use the calendar view to click any date and load that puzzle's answer instantly. The calendar is the fastest way to answer 'what was the Wordle on my birthday?' or any other specific date question."
        ]
      },
      {
        heading: "Why the archive matters for Wordle players",
        paragraphs: [
          "The archive is more than a lookup tool — it is the reference that settles every Wordle argument. Did a word repeat this year? Was a specific answer used in 2024? What puzzle number was on a certain date? The archive answers all of them with verified data.",
          "For streak-keepers, the archive is the safety net. If you missed a day and want to reconstruct the sequence, or you want to confirm your memory of an old answer, the complete list is here.",
          "For students of the game, the archive is a dataset. The full answer list reveals Wordle's patterns — the common letters, the repeating structures, the everyday vocabulary — and studying it makes you a better guesser, whether you use the solver or not."
        ]
      },
      {
        heading: "The Wordle answer list, by the numbers",
        paragraphs: [
          "Wordle has published more than 1,800 daily answers since its debut, and the archive holds every one of them. That means more than 1,800 five-letter words, more than 1,800 dates, and a complete record of the puzzle's evolution.",
          "The list shows the puzzle's vocabulary habits in aggregate: answers are almost always common English words, letters like E, A, R, and T appear most often, and repeats are rare but not impossible — the archive is where you can verify exactly which words have appeared more than once.",
          "Whether you want the full Wordle answers list for a school project, a streak reconstruction, or just the answer for today, this archive is the single source of truth — complete, verified, and updated every day."
        ]
      },
      {
        heading: "Answers for today, yesterday, and tomorrow",
        paragraphs: [
          "The archive covers every date, so the daily questions are all answered here: today's Wordle answer is the last row of the list, yesterday's is right above it, and any future date's answer appears the moment the official puzzle publishes it.",
          "For today's answer specifically, the wordle-answer-today page gives you the reveal plus hints, the puzzle number, and the answer context — while this archive gives you the full history around it.",
          "Players searching for the Wordle answer for today, the Wordle answer yesterday, or any dated variant — 'wordle answer June 26', 'wordle 7/15/26', 'wordle answer today 2026' — will find the exact answer in this archive, formatted with the same date labels they searched with."
        ]
      },
      {
        heading: "Beyond Wordle: the answer archive family",
        paragraphs: [
          "Wordle started the daily-answer genre, but the site covers the whole family: Quordle's four-board answers, Nerdle's equations, Colordle's colors, and every other daily game each has its own answer page and archive. The internal links below take you to each one.",
          "Each game's archive follows the same model — complete history, searchable, verified, updated daily — so if you play more than one daily game, the archives are your one-stop record for all of them.",
          "Start with the Wordle archive to explore the full answer list, then branch out to the other games. Every daily puzzle's history is one click away."
        ]
      }
    ],
    faqHeading: "Wordle Answer Archive FAQ",
    faqs: [
      {
        question: "Where can I find all Wordle answers 2025?",
        answer:
          "The complete list of every 2025 Wordle answer is in this archive, listed in chronological order with dates and puzzle numbers, plus a search box that filters by word, date, or number."
      },
      {
        question: "How far back does the Wordle answer archive go?",
        answer:
          "The archive covers every daily answer since Wordle's first puzzle on June 19, 2021 — more than 1,800 solutions, updated daily."
      },
      {
        question: "Can I search the archive by date or word?",
        answer:
          "Yes — the search box filters by date (YYYY-MM-DD), by word (e.g. CRANE), or by puzzle number, and the calendar view lets you click any date to load its answer."
      },
      {
        question: "Is the archive the same as the daily answer page?",
        answer:
          "The archive holds the full history; the wordle-answer-today page shows today's answer with hints and context. They link to each other, so both are one click away."
      },
      {
        question: "Does the archive include future Wordle answers?",
        answer:
          "Future answers appear the moment the official puzzle publishes. The archive is updated daily from the official source, so the record is always current."
      }
    ],
    relatedLinks: [
      { href: "/wordle-answer-today", label: "Wordle Answer Today" },
      { href: "/quordle-answer-today", label: "Quordle Answer Today" },
      { href: "/nerdle-answer-today", label: "Nerdle Answer Today" },
      { href: "/colordle-answer-today", label: "Colordle Answer Today" },
      { href: "/phoodle-answer-today", label: "Phoodle Answer Today" },
      { href: "/wordle-solver", label: "Wordle Solver" }
    ]
  }`;

let src = await readFile(registryPath, 'utf8');

if (src.includes("'wordle-answer-archive':")) {
  console.log('SKIP: already present');
} else {
  const marker = '\n};\n';
  const idx = src.lastIndexOf(marker);
  const base = src.slice(0, idx).replace(/,\s*$/, '');
  const next = base + ',\n\n' + ENTRY + '\n' + src.slice(idx + 1);
  await writeFile(registryPath, next);
  console.log('ADD wordle-answer-archive');
}
