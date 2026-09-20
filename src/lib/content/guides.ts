/**
 * Guide article registry for WordSolverX.
 *
 * These are evergreen strategy/help articles rendered at /guides/<slug>.
 * They target low-competition, steady-traffic informational queries (starting
 * words, letter-pattern lookups, per-game strategy) and link into the matching
 * solver and answer pages to build topical authority.
 *
 * Each article reuses the StaticArticleContent shape so it renders through
 * StaticArticle.svelte (TOC, FAQ schema, related links) with zero new UI.
 *
 * VOICE RULE (see registry.ts): instructional second person or neutral third
 * person only. No invented personal streaks, no fabricated numbers, no named
 * people. Claims must be checkable against game rules or the solver behavior.
 */

import type { StaticArticleContent } from './registry';
import { GUIDE_EXTRAS } from './guide-deep-dives';

export interface GuideArticle {
  slug: string;
  /** <title> and H1 */
  title: string;
  /** meta description, ~150 chars */
  description: string;
  /** Card label + icon on the /guides hub */
  cardTitle: string;
  icon: string;
  gradient: string;
  /** Primary long-tail keyword this guide targets */
  keyword: string;
  publishedDate: string; // YYYY-MM-DD
  modifiedDate: string; // YYYY-MM-DD
  /** Grouping used on the hub */
  group: 'Wordle Core' | 'Word Lists' | 'Multi-Board' | 'Non-Word Games' | 'Getting Better';
  body: StaticArticleContent;
  /**
   * Optional HowTo steps. Only procedural walkthroughs carry these — the route
   * emits HowTo JSON-LD only when the array is present. Each step must be an
   * instruction a reader can follow in the game, not a restatement of a claim.
   */
  howToSteps?: { name: string; text: string }[];
}

const PUBLISHED = '2026-09-20';
const MODIFIED = '2026-09-20';

const BASE_GUIDES: GuideArticle[] = [
  {
    slug: 'how-to-solve-wordle-in-3-guesses',
    title: 'How to Solve Wordle in 3 Guesses (Step-by-Step Method)',
    description:
      'A repeatable three-guess Wordle method: a fixed opener, an information-first second guess, and a disciplined third that closes the board.',
    cardTitle: 'Solve Wordle in 3 Guesses',
    icon: '🎯',
    gradient: 'from-teal-500 to-teal-600',
    keyword: 'how to solve wordle in 3 guesses',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Wordle Core',
    body: {
      key: 'how-to-solve-wordle-in-3-guesses',
      eyebrow: 'Wordle Method',
      intro:
        'Solving Wordle in three guesses is a process, not luck. Open with a fixed high-coverage word, spend guess two testing brand-new letters instead of chasing a hunch, then let guess three close a board that is already narrowed to two or three candidates. Here is the exact sequence.',
      sections: [
        {
          heading: 'Guess one: pick one opener and never change it',
          paragraphs: [
            'The three-guess method starts before you type anything. Choose one opener with two vowels and three common consonants, and use it every single day. The reason is memory, not magic: after a week you already know what two gray tiles on that word rule out, so the same feedback tells you more than it would on a word you have never opened with.',
            'SLATE, CRANE, and TRACE all fit. They carry E, A, and a workhorse consonant like S, R, or T, and none of them waste a tile on a repeated letter. Repeats in the opener are the quiet mistake: opening with EERIE spends a slot on a second E that can teach you nothing.'
          ],
          list: {
            title: 'What a good opener needs',
            items: [
              'Two vowels, so at least one usually lands',
              'Three of the frequent consonants: S, T, R, L, N',
              'Zero repeated letters, so every tile does separate work',
              'A word you will reuse daily to build a feedback baseline'
            ]
          }
        },
        {
          heading: 'Guess two: chase information, not the answer',
          paragraphs: [
            'This is the guess that decides the game. If the opener came back all gray, do not narrow yet. Play a second word that tests five completely new letters, heavy on the vowels you have not seen. Something like POUND or CURIO after SLATE sweeps O, U, and fresh consonants in one line.',
            'If the opener returned a green or a yellow, guess two should keep the confirmed letter, move every yellow to a new slot, and introduce the two most likely remaining consonants. You are not trying to win here. You are trying to make guess three obvious.'
          ],
          callout: {
            title: 'The trap that ends three-guess runs',
            body: 'The board shows _R_IN and your hand types BRINE because it arrived first. BRINE is legal, but PRION or GRIND test more unseen letters. While the field is wide, take information. Only pin the answer once two or three candidates remain.'
          }
        },
        {
          heading: 'Guess three: close a board you have already narrowed',
          paragraphs: [
            'By guess three you should be choosing between a short list, not brainstorming. Write out the letters you have confirmed and their positions, then run the common endings: -ER, -LY, -TY, -LE, -CK. Most five-letter answers resolve on one of those frames once you have four letters placed.',
            'If two candidates remain and you cannot separate them logically, the safe play depends on your goal. Chasing the three-guess win, guess the more common word. Protecting a streak, play a word that tests the letters that differ between the two candidates, even if it costs you the third-guess finish.'
          ]
        },
        {
          heading: 'Where the solver fits',
          paragraphs: [
            'When a board stalls, the Wordle solver on this site ranks every remaining word by how much of the answer pool it eliminates, so you can see whether your instinct actually was the highest-information guess. Use it to practice, not just to finish: after a few days you start making the solver\'s pick on your own.'
          ]
        }
      ],
      faqHeading: 'Three-guess Wordle questions',
      faqs: [
        {
          question: 'Is it realistic to solve Wordle in 3 guesses every day?',
          answer:
            'Every day, no. The average solve sits closer to four guesses because some answers share too many letters to separate early. A fixed opener plus an information-first second guess makes three-guess solves common rather than rare.'
        },
        {
          question: 'What is the single best Wordle starting word?',
          answer:
            'There is no one best word, but SLATE and CRANE consistently rank at the top for eliminating the most remaining answers. Pick one and reuse it so you learn its feedback patterns.'
        },
        {
          question: 'Should I guess a word I know is wrong to gather letters?',
          answer:
            'Yes, while the field is wide. A guess that tests five new letters is often worth more than a guess that could be right but only tests one. Switch to answer-hunting once two or three candidates remain.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/wordle-answer-today', label: "Today's Wordle Answer" },
        { href: '/guides/best-wordle-starting-words', label: 'Best Wordle Starting Words' },
        { href: '/guides/wordle-hard-mode-guide', label: 'Wordle Hard Mode Guide' }
      ]
    }
  },
  {
    slug: 'best-wordle-starting-words',
    title: 'Best Wordle Starting Words (Ranked by Letter Coverage)',
    description:
      'The strongest Wordle openers ranked by how many answers they eliminate, plus why repeated letters and rare consonants weaken a starting word.',
    cardTitle: 'Best Wordle Starting Words',
    icon: '🔤',
    gradient: 'from-emerald-500 to-teal-600',
    keyword: 'best wordle starting words',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Wordle Core',
    body: {
      key: 'best-wordle-starting-words',
      eyebrow: 'Wordle Openers',
      intro:
        'The best Wordle starting words maximize letter coverage: two vowels, three frequent consonants, and no repeats. SLATE, CRANE, TRACE, SLANT, and CRATE all clear large chunks of the answer pool on turn one. The word matters less than reusing the same one every day.',
      sections: [
        {
          heading: 'Why coverage beats cleverness',
          paragraphs: [
            'A starting word has one job: tell you which letters are in play before you commit to a shape. That means testing the letters that appear most often in five-letter answers. E, A, R, O, T, L, I, S, N, and C cover the vast majority of solutions, so an opener built from that set does the most work.',
            'Cleverness usually costs coverage. QUICK feels bold but burns two tiles on Q and K, letters that appear in a tiny slice of answers. You learn almost nothing on a normal board.'
          ]
        },
        {
          heading: 'Five openers ranked by eliminations',
          list: {
            title: 'Top starting words',
            items: [
              'SLATE: S, L, A, T, E. The all-round leader; two vowels and three of the most common consonants.',
              'CRANE: C, R, A, N, E. The frequency pick, since R and N appear in a large share of answers.',
              'TRACE: T, R, A, C, E. Same strong letters, different order; a fine daily default.',
              'SLANT: S, L, A, N, T. Consonant-heavy; pairs well with a vowel-rich second guess.',
              'CRATE: C, R, A, T, E. Reliable coverage with an -ATE ending you will see often.'
            ]
          },
          paragraphs: [
            'These five sit at the top because they eliminate the most remaining answers on average. The gap between them is small. What is not small is the gap between any of them and a random word with a repeated letter.'
          ]
        },
        {
          heading: 'The repeated-letter mistake',
          callout: {
            title: 'One rule that raises every opener',
            body: 'Never open with a repeated letter. MUMMY, EERIE, and GEESE each waste a tile confirming a letter you already tested. On turn one you want five separate questions, not four.'
          },
          paragraphs: [
            'A repeated letter in the opener throws away information you cannot get back. Save doubles for later, when the board actually points to them.'
          ]
        },
        {
          heading: 'Should you use two fixed openers?',
          paragraphs: [
            'Some players lock two words: an opener and a fixed second guess that covers the letters the first one misses. SLATE then CORGI, for example, tests ten distinct high-value letters across two turns before you ever react to feedback. It is a strong system for consistency, though it gives up a little flexibility when the opener returns several greens.'
          ]
        }
      ],
      faqHeading: 'Starting word questions',
      faqs: [
        {
          question: 'What is the best Wordle starting word overall?',
          answer:
            'SLATE ranks at or near the top for eliminating the most possible answers. CRANE is nearly identical. Either is an excellent default.'
        },
        {
          question: 'Is ADIEU a good starting word?',
          answer:
            'ADIEU tests four vowels, which sounds strong, but it leaves only one consonant slot and wastes coverage on U, a rarer vowel. A balanced word like SLATE usually outperforms it.'
        },
        {
          question: 'Does changing my starting word each day help?',
          answer:
            'No. Rotating openers stops you from learning what a given feedback pattern means. A fixed opener builds a mental library that makes guess two faster.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' },
        { href: '/guides/words-with-lots-of-vowels', label: 'Words With Lots of Vowels' },
        { href: '/wordle-answer-today', label: "Today's Wordle Answer" }
      ]
    }
  },
  {
    slug: 'wordle-hard-mode-guide',
    title: 'Wordle Hard Mode: Rules, Strategy, and Why It Makes You Better',
    description:
      'What Wordle hard mode changes, the strategy shift it forces, and why a month of hard mode sharpens your normal-mode solving.',
    cardTitle: 'Wordle Hard Mode Guide',
    icon: '🔒',
    gradient: 'from-slate-600 to-slate-800',
    keyword: 'wordle hard mode strategy',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Wordle Core',
    body: {
      key: 'wordle-hard-mode-guide',
      eyebrow: 'Wordle Hard Mode',
      intro:
        'Wordle hard mode forces every guess to reuse the greens and yellows you have already revealed. It removes throwaway guesses, which sounds limiting but actually trains sharper play. Turn it on in settings; here is how strategy changes and why it helps.',
      sections: [
        {
          heading: 'What hard mode actually changes',
          paragraphs: [
            'In normal mode you can play any valid word at any time, including a guess that ignores your clues to test fresh letters. Hard mode forbids that. Any green must stay in place, and any yellow must appear somewhere in your next guess. You cannot burn a turn on pure information.',
            'That single restriction changes the math. Every guess now has to both use what you know and try to learn something new, so word choice matters more on each line.'
          ]
        },
        {
          heading: 'The strategy shift',
          list: {
            title: 'How to play well under the constraint',
            items: [
              'Front-load information in guess one and two, before the constraint tightens.',
              'When a yellow appears, pick a reuse word that also moves that yellow to a new slot.',
              'Watch for letter traps: shared-stem words like BATCH, CATCH, HATCH, LATCH, MATCH, PATCH, WATCH can eat several guesses.',
              'Prefer words that place a confirmed letter and still test two new ones.'
            ]
          },
          paragraphs: [
            'The trap families are the real danger. When four letters lock and only the first slot is open across many candidates, hard mode can force you to guess them one at a time. Spot those early and, before the constraint bites, test the differentiating consonants.'
          ]
        },
        {
          heading: 'Why it makes you better',
          callout: {
            title: 'The handicap that trains you',
            body: 'Because you cannot lean on throwaway guesses, hard mode makes every line do double duty: use a clue and gather a new one. Do it for a month and normal mode starts to feel generous.'
          },
          paragraphs: [
            'Hard mode punishes lazy positional thinking. It teaches you to keep yellows floating and to plan a guess that satisfies the constraint while still narrowing the field, which is exactly the discipline that lowers your average in either mode.'
          ]
        }
      ],
      faqHeading: 'Hard mode questions',
      faqs: [
        {
          question: 'Is Wordle hard mode actually harder?',
          answer:
            'It is more restrictive, not necessarily harder to win. It removes the option to spend a guess on pure information, so trap families of similar words become the main risk.'
        },
        {
          question: 'Does hard mode change the answer?',
          answer:
            'No. The daily answer is identical in both modes. Hard mode only limits which guesses you are allowed to play.'
        },
        {
          question: 'Should beginners use hard mode?',
          answer:
            'Try it once you are comfortable with openers and reading yellows. It accelerates learning by forcing disciplined, information-rich guesses.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-answer-today', label: "Today's Wordle Answer" },
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' },
        { href: '/wordle-answer-archive', label: 'Wordle Answer Archive' }
      ]
    }
  },
  {
    slug: 'words-with-lots-of-vowels',
    title: 'Words With Lots of Vowels (Best Options for Wordle Openers)',
    description:
      'Five-letter words packed with vowels, when they help in Wordle, and why the most vowel-heavy word is not always the smartest opener.',
    cardTitle: 'Words With Lots of Vowels',
    icon: '🅰️',
    gradient: 'from-amber-500 to-orange-600',
    keyword: 'words with lots of vowels',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Word Lists',
    body: {
      key: 'words-with-lots-of-vowels',
      eyebrow: 'Vowel Words',
      intro:
        'The most useful vowel-heavy five-letter words include ADIEU, AUDIO, OUIJA, AUREI, and MIAOU. They test four vowels in a single guess, which quickly tells you which vowels the answer uses. Just know the trade-off: more vowels means fewer consonant slots.',
      sections: [
        {
          heading: 'Five-letter words with four vowels',
          list: {
            title: 'Four-vowel words worth knowing',
            items: [
              'ADIEU: A, I, E, U plus D. The classic vowel-tester.',
              'AUDIO: A, U, I, O plus D. Covers four different vowels cleanly.',
              'OUIJA: O, U, I, A plus J. Rare J, but strong vowel spread.',
              'AUREI: A, U, E, I plus R. Adds a common consonant, R.',
              'MIAOU: I, A, O, U plus M. Unusual but valid in many word lists.'
            ]
          },
          paragraphs: [
            'Words like AUREI stand out because they pair four vowels with R, one of the highest-frequency consonants. That combination learns more than a pure vowel dump.'
          ]
        },
        {
          heading: 'When vowel-heavy words help',
          paragraphs: [
            'A four-vowel word shines as a second guess after a consonant-heavy opener. Play SLATE or SLANT first, then AUDIO, and across two turns you have tested almost every high-value letter in the language. That is a strong, repeatable two-word system.',
            'They also help on boards where your opener returned all gray vowels, telling you the answer leans on the vowels you have not tried yet.'
          ]
        },
        {
          heading: 'The trade-off to respect',
          callout: {
            title: 'More vowels, fewer consonants',
            body: 'A four-vowel opener only tests one consonant. If the answer hinges on which consonants it uses, you learn less than a balanced word would. Vowel bombs are a tool, not a default.'
          },
          paragraphs: [
            'Use vowel-heavy words with intent. As a pure opener they can underperform a balanced word like CRANE, because most answers are separated by their consonants, not their vowels.'
          ]
        }
      ],
      faqHeading: 'Vowel word questions',
      faqs: [
        {
          question: 'What 5-letter word has the most vowels?',
          answer:
            'Words like AUDIO, ADIEU, OUIJA, and AUREI each contain four vowels, the practical maximum for a useful five-letter guess. EUOUAE (six vowels) exists but is not a standard Wordle guess.'
        },
        {
          question: 'Should I open Wordle with a vowel-heavy word?',
          answer:
            'It works better as a second guess. As an opener, a balanced word with two vowels and three common consonants usually eliminates more answers.'
        },
        {
          question: 'Is Y a vowel in these words?',
          answer:
            'Y acts as a vowel sound in words like GYPSY or NYMPH. For opener planning, treat Y as a bonus letter rather than one of your main vowels.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/best-wordle-starting-words', label: 'Best Wordle Starting Words' },
        { href: '/guides/two-vowel-words-for-wordle', label: 'Two-Vowel Words for Wordle' },
        { href: '/guides/5-letter-words-ending-in-e', label: '5-Letter Words Ending in E' }
      ]
    }
  },
  {
    slug: 'two-vowel-words-for-wordle',
    title: 'Two-Vowel Words for Wordle (The Balanced Opener List)',
    description:
      'The best two-vowel five-letter words for Wordle, why two vowels is the sweet spot for openers, and a ready-to-use list.',
    cardTitle: 'Two-Vowel Words for Wordle',
    icon: '⚖️',
    gradient: 'from-lime-500 to-emerald-600',
    keyword: 'two vowel words for wordle',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Word Lists',
    body: {
      key: 'two-vowel-words-for-wordle',
      eyebrow: 'Balanced Openers',
      intro:
        'Two-vowel words are the sweet spot for Wordle openers: enough vowel coverage to place a letter, enough consonant slots to separate answers. SLATE, CRANE, TRACE, ROAST, and PLIER all fit. Here is why two vowels beats three or four for a first guess.',
      sections: [
        {
          heading: 'Why two vowels is the sweet spot',
          paragraphs: [
            'Answers are usually separated by their consonants, not their vowels. A two-vowel word keeps three slots free for the high-frequency consonants that actually split the answer pool, while still testing enough vowels to place one early.',
            'That balance is why solver rankings are dominated by two-vowel words. They eliminate the most remaining answers on average.'
          ]
        },
        {
          heading: 'A ready two-vowel list',
          list: {
            title: 'Strong two-vowel words',
            items: [
              'SLATE, CRANE, TRACE: top-tier all-rounders.',
              'ROAST, TOWER, LINER: good follow-ups that shift the vowels.',
              'PLIER, DRAIN, SNORE: cover R, N, and different vowel pairs.',
              'CLOSE, HEART, MOUND: useful when your opener came back mostly gray.'
            ]
          }
        },
        {
          heading: 'Pairing openers for coverage',
          callout: {
            title: 'A two-word system',
            body: 'Lock a two-vowel opener and a second word that covers the letters it misses, for example CRANE then MOIST. Ten distinct high-value letters in two guesses, every day, with no decision fatigue.'
          },
          paragraphs: [
            'This is the most reliable way to keep your average low: remove the guesswork from the first two lines so your brainpower goes into the endgame.'
          ]
        }
      ],
      faqHeading: 'Two-vowel word questions',
      faqs: [
        {
          question: 'Why not use a word with three vowels?',
          answer:
            'Three vowels leaves only two consonant slots, and consonants are what usually separate answers. Two vowels balances placing a vowel with testing enough consonants.'
        },
        {
          question: 'What are the best two-vowel openers?',
          answer:
            'SLATE, CRANE, and TRACE lead the rankings. They combine two vowels with three of the most common consonants and no repeats.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/best-wordle-starting-words', label: 'Best Wordle Starting Words' },
        { href: '/guides/words-with-lots-of-vowels', label: 'Words With Lots of Vowels' },
        { href: '/guides/words-with-double-letters', label: 'Words With Double Letters' }
      ]
    }
  },
  {
    slug: 'words-with-double-letters',
    title: 'Words With Double Letters (Why They Break Wordle Streaks)',
    description:
      'Five-letter words with double letters, why players miss them, and how to test a doubles family when the board stalls.',
    cardTitle: 'Words With Double Letters',
    icon: '🔁',
    gradient: 'from-rose-500 to-pink-600',
    keyword: 'words with double letters',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Word Lists',
    body: {
      key: 'words-with-double-letters',
      eyebrow: 'Double Letters',
      intro:
        'Double-letter answers end more Wordle streaks than rare words do. Common examples: SPEED, SILLY, LLAMA, FLOSS, BERRY. When four letters lock and nothing single fits, the answer is often hiding a repeat. Here is how to catch it.',
      sections: [
        {
          heading: 'Why doubles break streaks',
          paragraphs: [
            'Most players internalize that Wordle "rarely" repeats letters, so on turn five they cycle single-letter candidates and run out of guesses. Repeats are common enough to matter, and the assumption that they are rare is the actual failure.',
            'A gray tile on a doubled letter is also misread constantly. If the answer is PROXY and you guess LOOSE, one O turns green and the other turns gray, because PROXY has only one O. The gray does not mean O is absent. It means that copy had nothing to match.'
          ]
        },
        {
          heading: 'Common double-letter words',
          list: {
            title: 'Doubles worth testing',
            items: [
              'Double-E: SPEED, GREEN, CHEER, SLEEP, QUEEN',
              'Double-L: SILLY, HELLO, SKILL, TROLL, SPELL',
              'Double-O: FLOOR, BLOOD, SPOOK, BROOM, SCOOP',
              'Double-S: FLOSS, CROSS, GLASS, DRESS, BLISS',
              'Others: LLAMA, BERRY, PUPPY, KITTY, ADDER'
            ]
          }
        },
        {
          heading: 'How to test a doubles family',
          callout: {
            title: 'When the board stalls',
            body: 'Four letters placed, one slot open, and every single-letter guess fails? Deliberately test a doubles family: try SPEED, then SEEDY, then a double-L or double-S word. The answer is often a repeat you never considered.'
          },
          paragraphs: [
            'The solver on this site keeps doubled-letter candidates in its ranked list, so if a repeat is likely it will surface near the top instead of getting mentally filtered out.'
          ]
        }
      ],
      faqHeading: 'Double-letter questions',
      faqs: [
        {
          question: 'How common are double letters in Wordle answers?',
          answer:
            'Common enough to plan for. A meaningful share of answers repeat a letter, especially E, L, O, and S. Treating repeats as rare is a frequent cause of lost streaks.'
        },
        {
          question: 'What does a gray tile mean on a doubled letter?',
          answer:
            'It only rules out that copy of the letter, not the letter entirely. If you guess two of a letter and one is green, a gray on the other means the answer contains just one.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' },
        { href: '/guides/two-vowel-words-for-wordle', label: 'Two-Vowel Words for Wordle' },
        { href: '/wordle-answer-today', label: "Today's Wordle Answer" }
      ]
    }
  },
  {
    slug: '5-letter-words-ending-in-e',
    title: '5-Letter Words Ending in E (Wordle Endgame List)',
    description:
      'A practical list of five-letter words ending in E for Wordle endgames, plus why -E endings are so common in answers.',
    cardTitle: '5-Letter Words Ending in E',
    icon: '🔤',
    gradient: 'from-sky-500 to-blue-600',
    keyword: '5 letter words ending in e',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Word Lists',
    body: {
      key: '5-letter-words-ending-in-e',
      eyebrow: 'Endgame Lists',
      intro:
        'Words ending in E are everywhere in Wordle because -E closes so many common frames: -ATE, -IVE, -ONE, -URE, -OSE. When your board shows a final-slot E, this list gets you unstuck fast. Common picks: TRACE, STONE, DRIVE, CURVE, HOUSE.',
      sections: [
        {
          heading: 'Why -E endings dominate',
          paragraphs: [
            'English builds enormous numbers of five-letter words on E-final frames. -ATE alone yields PLATE, GRATE, SLATE, CRATE, STATE. Add -IVE, -ONE, -OSE, -URE, and -IZE and you cover a huge slice of the answer pool.',
            'That is why a green E in slot five is good news: it points you straight at a small set of high-probability frames instead of leaving the ending open.'
          ]
        },
        {
          heading: 'A working list by frame',
          list: {
            title: 'Five-letter -E words by ending',
            items: [
              '-ATE: PLATE, GRATE, SLATE, CRATE, STATE, SKATE',
              '-IVE: DRIVE, ALIVE, NAIVE, OLIVE, WAIVE',
              '-ONE: STONE, PHONE, ALONE, PRONE, DRONE',
              '-OSE: CLOSE, PROSE, THOSE, CHOSE, GOOSE',
              '-URE: CURVE, NURSE, PURGE, SURGE, VERSE'
            ]
          }
        },
        {
          heading: 'Turning the list into a guess',
          callout: {
            title: 'Match the frame to your greens',
            body: 'Once E is locked in slot five, look at your other placed letters and pick the frame that fits. A green T in slot one plus E at the end points hard at -ATE words like TRACE-adjacent shapes; use the solver to rank the survivors.'
          },
          paragraphs: [
            'Do not brute-force the whole alphabet into slot one. Match your confirmed letters to a frame first, then let the Wordle solver rank the remaining -E words by frequency.'
          ]
        }
      ],
      faqHeading: 'Words-ending-in-E questions',
      faqs: [
        {
          question: 'What are common 5-letter words ending in E?',
          answer:
            'TRACE, STONE, DRIVE, CLOSE, HOUSE, and CURVE are among the most common. -ATE and -ONE frames alone cover a large set of answers.'
        },
        {
          question: 'Why is E the most common last letter in Wordle?',
          answer:
            'E closes many productive English frames like -ATE, -IVE, and -ONE, so a large share of valid five-letter words end in E.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/best-wordle-starting-words', label: 'Best Wordle Starting Words' },
        { href: '/guides/5-letter-words-starting-with-s', label: '5-Letter Words Starting With S' },
        { href: '/wordle-answer-today', label: "Today's Wordle Answer" }
      ]
    }
  },
  {
    slug: '5-letter-words-starting-with-s',
    title: '5-Letter Words Starting With S (Wordle Reference List)',
    description:
      'A Wordle-focused list of five-letter words starting with S, grouped by second letter, for when your opener locks an S in slot one.',
    cardTitle: '5-Letter Words Starting With S',
    icon: '📝',
    gradient: 'from-cyan-500 to-teal-600',
    keyword: '5 letter words starting with s',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Word Lists',
    body: {
      key: '5-letter-words-starting-with-s',
      eyebrow: 'Starting-Letter Lists',
      intro:
        'S is the most common first letter among five-letter words, so a green S in slot one still leaves a big field. Group the candidates by second letter to narrow fast: SH-, SC-, SL-, SP-, ST-, SW-, and vowel-second words like SAINT or SOUND.',
      sections: [
        {
          heading: 'Why an S-start is not enough',
          paragraphs: [
            'Because so many words begin with S, locking S in slot one barely dents the field. The useful move is to split by the second letter, which is what actually separates the candidates.'
          ]
        },
        {
          heading: 'S-words grouped by second letter',
          list: {
            title: 'Second-letter buckets',
            items: [
              'SH-: SHARE, SHINE, SHORE, SHAME, SHELF',
              'SC-/SK-: SCARE, SCOPE, SKATE, SKILL, SCALE',
              'SL-/SM-/SN-: SLATE, SLIDE, SMART, SMOKE, SNORE',
              'SP-/ST-: SPACE, SPINE, STONE, STARE, STORM',
              'SW- and vowel-second: SWEAR, SWORD, SAINT, SOUND, SUGAR'
            ]
          }
        },
        {
          heading: 'Use the second guess to split buckets',
          callout: {
            title: 'Test the divider letters',
            body: 'With S locked, play a guess that tests H, C, L, P, and T in the second slot area, so the next line tells you which S-family the answer belongs to.'
          },
          paragraphs: [
            'Once you know the second letter, the field usually drops to a handful of words. Feed your placed letters into the solver to rank what remains.'
          ]
        }
      ],
      faqHeading: 'S-word questions',
      faqs: [
        {
          question: 'How many 5-letter words start with S?',
          answer:
            'Hundreds are valid Wordle guesses, more than any other starting letter, which is why grouping by the second letter matters so much.'
        },
        {
          question: 'Is starting with an S word a good Wordle strategy?',
          answer:
            'S appears often at the start and end of words, so S-heavy openers like SLATE are strong. But a green S alone leaves a wide field; the second letter is what narrows it.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/5-letter-words-ending-in-e', label: '5-Letter Words Ending in E' },
        { href: '/guides/best-wordle-starting-words', label: 'Best Wordle Starting Words' },
        { href: '/wordle-answer-today', label: "Today's Wordle Answer" }
      ]
    }
  },
  {
    slug: 'how-to-win-quordle-every-time',
    title: 'How to Win Quordle (The Board-Allocation Method)',
    description:
      'A repeatable Quordle strategy: fixed opener pair, an allocation habit that stops the fourth board from eating your endgame, and when to commit.',
    cardTitle: 'How to Win Quordle',
    icon: '🔷',
    gradient: 'from-blue-500 to-indigo-600',
    keyword: 'how to win quordle',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Multi-Board',
    body: {
      key: 'how-to-win-quordle-every-time',
      eyebrow: 'Quordle Method',
      intro:
        'Quordle is not four Wordles. You get nine guesses shared across four boards, so the winning skill is allocation, not raw solving. Open with a fixed two-word pair, then always feed the board with the fewest confirmed letters. Here is the full method.',
      sections: [
        {
          heading: 'The ignored-board trap',
          paragraphs: [
            'Most Quordle losses share one shape: you solve three boards by guess five, feel comfortable, then watch the fourth board swallow your last four guesses because you stopped feeding it after round two.',
            'The fix is mechanical. After every guess, find the board with the fewest confirmed letters and make sure your next guess gives it information. Not a solve, just data.'
          ]
        },
        {
          heading: 'A fixed opener pair',
          list: {
            title: 'Two words, ten letters',
            items: [
              'Guess 1: SLATE (S, L, A, T, E)',
              'Guess 2: CORNI or MOUND (adds O, R, N, C or M, U, D)',
              'Together they test ten high-frequency letters before you react to any board.',
              'Reuse the same pair daily so you read all four boards at a glance after guess two.'
            ]
          },
          paragraphs: [
            'By spending the first two guesses on coverage across all four grids, you usually enter guess three with real footholds on every board instead of one solved board and three blanks.'
          ]
        },
        {
          heading: 'When to commit a board',
          callout: {
            title: 'Solve the surest, feed the weakest',
            body: 'Commit a full guess to finishing a board only when it is down to one or two candidates. Otherwise your guess should serve the weakest board while nudging the others.'
          },
          paragraphs: [
            'The Quordle solver on this site tracks all four boards at once and ranks guesses by combined information, which is the fastest way to see which board is starving.'
          ]
        }
      ],
      faqHeading: 'Quordle questions',
      faqs: [
        {
          question: 'How many guesses do you get in Quordle?',
          answer:
            'Nine guesses shared across all four boards. Every guess appears on all four, so allocation between boards is the core skill.'
        },
        {
          question: 'What is the best Quordle strategy?',
          answer:
            'Use a fixed two-word opener to cover ten letters, then always feed the board with the fewest confirmed letters. Only commit a full guess to finishing a board when it is down to one or two candidates.'
        }
      ],
      relatedLinks: [
        { href: '/quordle-solver', label: 'Quordle Solver' },
        { href: '/quordle-answer-today', label: "Today's Quordle Answer" },
        { href: '/guides/best-wordle-starting-words', label: 'Best Wordle Starting Words' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' }
      ]
    }
  },
  {
    slug: 'nerdle-strategy-guide',
    title: 'Nerdle Strategy: How to Solve the Math Game Fast',
    description:
      'A Nerdle strategy guide covering the best starting equations, how the color feedback works, and the arithmetic constraints that narrow the answer.',
    cardTitle: 'Nerdle Strategy Guide',
    icon: '➕',
    gradient: 'from-teal-500 to-teal-600',
    keyword: 'nerdle strategy',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Multi-Board',
    body: {
      key: 'nerdle-strategy-guide',
      eyebrow: 'Nerdle Method',
      intro:
        'Nerdle is Wordle with equations: eight tiles, digits 0-9, the operators + - * /, and one =. The winning approach front-loads digits and operators, then leans on arithmetic to eliminate impossible combinations. A strong opener tests common digits and at least two operators.',
      sections: [
        {
          heading: 'How the tiles and rules work',
          paragraphs: [
            'Every guess must be a valid equation with an equals sign, and the number after = has to be the actual result. Green means the tile is correct and placed, purple (Nerdle\'s yellow) means the symbol is in the equation but elsewhere, and black rules it out.',
            'The equals sign has to appear, and standard order of operations applies, so multiplication and division resolve before addition and subtraction. That constraint is a tool: it rules out huge numbers of arrangements automatically.'
          ]
        },
        {
          heading: 'Strong starting equations',
          list: {
            title: 'Openers that test the most symbols',
            items: [
              'Test two operators early, for example a guess using both + and *.',
              'Cover common low digits (0, 1, 2) and a mid digit, since they appear often.',
              'Keep the result plausible so the = placement teaches you something.',
              'Reuse a fixed opening equation to learn its feedback, just like a Wordle opener.'
            ]
          }
        },
        {
          heading: 'Let arithmetic do the elimination',
          callout: {
            title: 'The math is a constraint, not a guess',
            body: 'Once you know which digits and operators are in play, only a small set of equations actually balance. Compute, do not brute-force: if the answer contains * and a known product, most arrangements are already impossible.'
          },
          paragraphs: [
            'The Nerdle solver on this site supports every mode from Micro to Maxi and filters candidate equations against your color feedback, so it only shows equations that are both symbol-valid and arithmetically true.'
          ]
        }
      ],
      faqHeading: 'Nerdle questions',
      faqs: [
        {
          question: 'What is a good starting equation for Nerdle?',
          answer:
            'Use an equation that tests two operators and several common digits while staying arithmetically valid. Reuse it daily so you learn what its feedback rules out.'
        },
        {
          question: 'Does order of operations matter in Nerdle?',
          answer:
            'Yes. Multiplication and division resolve before addition and subtraction, and the number after = must be the true result. That constraint eliminates most invalid arrangements for you.'
        }
      ],
      relatedLinks: [
        { href: '/nerdle-solver', label: 'Nerdle Solver' },
        { href: '/nerdle-answer-today', label: "Today's Nerdle Answer" },
        { href: '/guides/how-to-win-quordle-every-time', label: 'How to Win Quordle' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' }
      ]
    }
  },
  {
    slug: 'how-to-play-betweenle',
    title: 'How to Play Betweenle (Rules and Strategy)',
    description:
      'What Betweenle is, how the upper and lower word bounds work, and a binary-search strategy that finds the hidden word fast.',
    cardTitle: 'How to Play Betweenle',
    icon: '↕️',
    gradient: 'from-indigo-500 to-fuchsia-700',
    keyword: 'how to play betweenle',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Multi-Board',
    body: {
      key: 'how-to-play-betweenle',
      eyebrow: 'Betweenle Rules',
      intro:
        'Betweenle hides a secret word and tells you whether each guess falls alphabetically before or after it. The secret is that this is a binary search: every guess should cut the remaining alphabetical range roughly in half, not chase a hunch.',
      sections: [
        {
          heading: 'How the bounds work',
          paragraphs: [
            'Each guess updates an upper and lower bound. Guess a word and Betweenle tells you the answer is alphabetically higher or lower, tightening the window. Your job is to shrink that window efficiently.',
            'Treating it like Wordle is the mistake. There are no letter-position clues, only ordering, so the skill is range management.'
          ]
        },
        {
          heading: 'The binary-search strategy',
          list: {
            title: 'Cut the range in half',
            items: [
              'Start near the middle of the alphabet, around M or N words.',
              'After each result, guess a word near the midpoint of the new range.',
              'Pay attention to the first two letters; they carry most of the ordering.',
              'As the window narrows, shift to matching the third and fourth letters.'
            ]
          },
          paragraphs: [
            'Halving the range each turn means even a huge dictionary collapses in a handful of guesses. Guessing familiar words at random wastes the ordering information the game hands you.'
          ]
        },
        {
          heading: 'Closing the window',
          callout: {
            title: 'Let the bounds pick the word',
            body: 'When the upper and lower bounds share the first three letters, you are close. The Betweenle solver on this site tracks both bounds and suggests a midpoint word so you never overshoot.'
          },
          paragraphs: [
            'The final guesses are about precision: match as many leading letters as the bounds share, and the answer usually falls out within one or two tries.'
          ]
        }
      ],
      faqHeading: 'Betweenle questions',
      faqs: [
        {
          question: 'What is Betweenle?',
          answer:
            'A daily word game where each guess tells you whether the secret word comes alphabetically before or after it. You narrow an upper and lower bound until you land on the answer.'
        },
        {
          question: 'What is the best Betweenle strategy?',
          answer:
            'Binary search. Start in the middle of the alphabet and always guess a word near the midpoint of the remaining range, focusing on the first two letters first.'
        }
      ],
      relatedLinks: [
        { href: '/betweenle-solver', label: 'Betweenle Solver' },
        { href: '/betweenle-answer-today', label: "Today's Betweenle Answer" },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' },
        { href: '/guides/how-to-win-quordle-every-time', label: 'How to Win Quordle' }
      ]
    }
  },
  {
    slug: 'globle-strategy-guide',
    title: 'Globle Strategy: How to Find the Country in Fewer Guesses',
    description:
      'How Globle color proximity works and a continent-first strategy that turns each guess into a distance clue toward the mystery country.',
    cardTitle: 'Globle Strategy Guide',
    icon: '🌍',
    gradient: 'from-sky-500 to-blue-600',
    keyword: 'globle strategy',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Non-Word Games',
    body: {
      key: 'globle-strategy-guide',
      eyebrow: 'Globle Method',
      intro:
        'Globle colors each country you guess by how close it is to the mystery country: warmer means closer. The efficient approach guesses one country per continent first, reads which region runs warmest, then closes in on neighbors. Distance is the only clue, so use it deliberately.',
      sections: [
        {
          heading: 'How proximity coloring works',
          paragraphs: [
            'Every guessed country is shaded from cool to hot based on its distance to the target. A near-white guess is far away; a deep red guess borders or contains the answer. There are no letter clues, only geography.',
            'That means a wrong guess is still valuable if it tells you which part of the world is warm. Random guessing throws away that signal.'
          ]
        },
        {
          heading: 'The continent-first opening',
          list: {
            title: 'Map the globe in four or five guesses',
            items: [
              'Guess a large country on each continent: Canada, Brazil, Nigeria, Russia, Australia.',
              'Whichever runs warmest tells you the region to focus on.',
              'Then guess that region\'s big neighbors to triangulate direction.',
              'Finish by testing the specific bordering countries around the hottest guess.'
            ]
          }
        },
        {
          heading: 'Triangulating the answer',
          callout: {
            title: 'Use two warm guesses to point',
            body: 'Two warm countries on different sides of the target point you at the answer between them. Guess the country that sits between your two warmest results.'
          },
          paragraphs: [
            'Knowing which countries border which is the real Globle skill. Once two guesses are warm, the answer is almost always a shared neighbor, and the daily Globle answer page confirms it if you get stuck.'
          ]
        }
      ],
      faqHeading: 'Globle questions',
      faqs: [
        {
          question: 'How does Globle tell you if you are close?',
          answer:
            'It colors each guessed country by distance to the target. Warmer colors mean closer; a deep red guess is adjacent to or is the answer.'
        },
        {
          question: 'What is the best first guess in Globle?',
          answer:
            'Any large country works; the goal is to sample a continent. Guessing one big country per continent quickly shows which region runs warmest.'
        }
      ],
      relatedLinks: [
        { href: '/globle-answer-today', label: "Today's Globle Answer" },
        { href: '/worldle-solver', label: 'Worldle Solver' },
        { href: '/countryle-solver', label: 'Countryle Solver' },
        { href: '/guides/worldle-strategy-guide', label: 'Worldle Strategy Guide' }
      ]
    }
  },
  {
    slug: 'worldle-strategy-guide',
    title: 'Worldle Strategy: How to Guess Countries From Their Shape',
    description:
      'How Worldle distance and direction arrows work, plus a strategy for reading country outlines and closing in on the daily answer.',
    cardTitle: 'Worldle Strategy Guide',
    icon: '🗺️',
    gradient: 'from-teal-500 to-cyan-600',
    keyword: 'worldle strategy',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Non-Word Games',
    body: {
      key: 'worldle-strategy-guide',
      eyebrow: 'Worldle Method',
      intro:
        'Worldle shows a country outline and, after each guess, the distance and direction to the target plus a percentage match. The skill is combining shape recognition with the direction arrows: identify the region from the outline, then let the arrows walk you to the exact country.',
      sections: [
        {
          heading: 'Reading the outline and the arrows',
          paragraphs: [
            'The silhouette narrows the continent immediately for distinctive shapes: Italy, Chile, and Norway are giveaways. After a guess, Worldle gives you the distance in kilometers, a direction arrow, and a proximity percentage.',
            'Treat the arrow as a compass. A guess 2,000 km to the east with an arrow pointing west means the answer is well west of your guess. Two guesses from different directions pin it quickly.'
          ]
        },
        {
          heading: 'A shape-first strategy',
          list: {
            title: 'From outline to answer',
            items: [
              'Identify the continent from the silhouette size and coastline.',
              'Guess a well-known country in that region to get a distance and arrow.',
              'Follow the arrow with a second guess to triangulate.',
              'Use the percentage match to confirm you are adjacent before finalizing.'
            ]
          }
        },
        {
          heading: 'When the shape is ambiguous',
          callout: {
            title: 'Let direction override doubt',
            body: 'Small island nations and similar shapes are hard to read. When unsure, guess any country in the likely region and trust the direction arrow more than the outline.'
          },
          paragraphs: [
            'The Worldle solver on this site helps match outlines and tracks the direction clues, and the daily Worldle answer page confirms the country if the shape stays ambiguous.'
          ]
        }
      ],
      faqHeading: 'Worldle questions',
      faqs: [
        {
          question: 'How do the arrows in Worldle work?',
          answer:
            'After each guess Worldle shows the distance, a direction arrow pointing toward the target, and a proximity percentage. Following the arrow from two different guesses pinpoints the country.'
        },
        {
          question: 'How is Worldle different from Globle?',
          answer:
            'Worldle shows a country outline and gives distance plus direction arrows. Globle gives only proximity coloring on a globe with no shape or direction.'
        }
      ],
      relatedLinks: [
        { href: '/worldle-solver', label: 'Worldle Solver' },
        { href: '/worldle-answer-today', label: "Today's Worldle Answer" },
        { href: '/guides/globle-strategy-guide', label: 'Globle Strategy Guide' },
        { href: '/countryle-solver', label: 'Countryle Solver' }
      ]
    }
  },
  {
    slug: 'how-to-solve-a-waffle-puzzle',
    title: 'How to Solve a Waffle Puzzle in Minimum Swaps',
    description:
      'A Waffle strategy for solving the grid in the fewest swaps: read the green anchors, plan multi-letter swaps, and protect your star rating.',
    cardTitle: 'How to Solve a Waffle',
    icon: '🧇',
    gradient: 'from-amber-500 to-yellow-600',
    keyword: 'how to solve a waffle puzzle',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Non-Word Games',
    body: {
      key: 'how-to-solve-a-waffle-puzzle',
      eyebrow: 'Waffle Method',
      intro:
        'Waffle gives you a scrambled grid of six overlapping words and 15 swaps to fix it, but the star rating rewards solving in 10 or fewer. The trick is planning swaps that fix two letters at once, working from the green anchors outward.',
      sections: [
        {
          heading: 'Read the anchors first',
          paragraphs: [
            'Green tiles are already correct. Because the grid overlaps, each intersection tile belongs to two words, so a locked green at a crossing constrains both the row and column. Start by mapping which letters are fixed.',
            'Yellow tiles belong elsewhere in the grid, not just the current word, which is the difference from Wordle. A yellow could need to move across the grid entirely.'
          ]
        },
        {
          heading: 'Plan double-fix swaps',
          list: {
            title: 'Get two greens per swap',
            items: [
              'Look for two tiles that are each in the other\'s correct spot, then swap them for two greens at once.',
              'Prioritize the center intersections; they affect the most words.',
              'Solve the corners last, since they only belong to two words and are easy to place once the middle is set.',
              'Count your swaps: 10 or fewer keeps the full star rating.'
            ]
          }
        },
        {
          heading: 'Protecting the star rating',
          callout: {
            title: 'Every wasted swap costs a star',
            body: 'You have 15 swaps but only 10 for a perfect score. Never swap a tile into a non-final position just to see what happens; plan the whole sequence before touching a tile.'
          },
          paragraphs: [
            'The Waffle solver on this site computes the minimum-swap solution, so you can check whether your plan hits the 10-swap target before you commit.'
          ]
        }
      ],
      faqHeading: 'Waffle questions',
      faqs: [
        {
          question: 'How many swaps do you get in Waffle?',
          answer:
            'Fifteen swaps total, but solving in 10 or fewer earns the full five-star rating. Efficient double-fix swaps are how you stay under the limit.'
        },
        {
          question: 'What do yellow tiles mean in Waffle?',
          answer:
            'The letter belongs somewhere else in the grid, not necessarily the same word. Because words overlap, a yellow may need to move to a different row or column entirely.'
        }
      ],
      relatedLinks: [
        { href: '/waffle-solver', label: 'Waffle Solver' },
        { href: '/waffle-answer-today', label: "Today's Waffle Answer" },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' },
        { href: '/guides/words-with-double-letters', label: 'Words With Double Letters' }
      ]
    }
  },
  {
    slug: 'how-to-play-contexto',
    title: 'How to Play Contexto (Semantic Guessing Explained)',
    description:
      'How Contexto ranks your guesses by meaning, why the number matters more than the word, and a strategy for climbing from 5,000 to 1.',
    cardTitle: 'How to Play Contexto',
    icon: '🧩',
    gradient: 'from-violet-500 to-fuchsia-600',
    keyword: 'how to play contexto',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Non-Word Games',
    body: {
      key: 'how-to-play-contexto',
      eyebrow: 'Contexto Method',
      intro:
        'Contexto ranks every guess by how close it is in meaning to the secret word, using a language model. Rank 1 is the answer; rank 5,000 is barely related. The skill is semantic triangulation: use low-ranked guesses to figure out the topic, then close in by theme.',
      sections: [
        {
          heading: 'Why the rank matters, not the letters',
          paragraphs: [
            'Contexto ignores spelling entirely. It scores guesses by semantic similarity, so CAT and KITTEN sit close together while CAT and CONCRETE sit far apart. A guess ranked 300 is thematically warm even if it looks nothing like the answer.',
            'That flips normal word-game instincts. You are not hunting letters; you are hunting meaning.'
          ]
        },
        {
          heading: 'A theme-first strategy',
          list: {
            title: 'Climb the ranking',
            items: [
              'Open with broad, common nouns from different domains: OCEAN, MONEY, FAMILY, MACHINE.',
              'Whichever ranks best reveals the topic area.',
              'Guess synonyms and related words within that theme to climb.',
              'When you reach the low double digits, test very close synonyms and word forms.'
            ]
          }
        },
        {
          heading: 'Breaking through a plateau',
          callout: {
            title: 'Change the angle, not just the word',
            body: 'Stuck around rank 50? You are probably near the theme but wrong on nuance. Switch between the concept, its category, and its opposite to find which direction warms up.'
          },
          paragraphs: [
            'The daily Contexto answer page shows the solution if you run out of patience, but the game rewards persistence: most words are reachable by following the ranking up one theme at a time.'
          ]
        }
      ],
      faqHeading: 'Contexto questions',
      faqs: [
        {
          question: 'How does Contexto rank guesses?',
          answer:
            'A language model scores each guess by semantic similarity to the secret word. Rank 1 is the answer, and higher numbers mean the meaning is further away.'
        },
        {
          question: 'What is a good Contexto strategy?',
          answer:
            'Start with broad nouns from different topics to find the theme, then guess related words within that theme to climb the ranking toward rank 1.'
        }
      ],
      relatedLinks: [
        { href: '/contexto-answer-today', label: "Today's Contexto Answer" },
        { href: '/semantle-answer-today', label: "Today's Semantle Answer" },
        { href: '/guides/semantle-strategy-guide', label: 'Semantle Strategy Guide' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' }
      ]
    }
  },
  {
    slug: 'semantle-strategy-guide',
    title: 'Semantle Strategy: How to Use Similarity Scores to Win',
    description:
      'How Semantle similarity scores work, what word vectors mean for your guesses, and a strategy for narrowing to the secret word.',
    cardTitle: 'Semantle Strategy Guide',
    icon: '🧠',
    gradient: 'from-cyan-500 to-teal-600',
    keyword: 'semantle strategy',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Non-Word Games',
    body: {
      key: 'semantle-strategy-guide',
      eyebrow: 'Semantle Method',
      intro:
        'Semantle scores each guess by cosine similarity to the secret word using a word2vec model. Unlike Contexto\'s rank, you see a raw similarity number and, when you get close, a "getting warm" temperature. The skill is following the gradient of meaning uphill.',
      sections: [
        {
          heading: 'What the similarity number means',
          paragraphs: [
            'The score is how aligned your guess is with the secret word in vector space. A high positive number means closely related meaning; near zero means unrelated. The scale is not linear, so early gains feel small and the last few points are the hard part.',
            'The word2vec model learned meaning from context, so it groups words that appear in similar sentences. DOCTOR and NURSE score close; DOCTOR and GRAVEL do not.'
          ]
        },
        {
          heading: 'Following the gradient',
          list: {
            title: 'Climb toward the answer',
            items: [
              'Open with a spread of unrelated common words to find any thread.',
              'When one scores higher, guess its synonyms and associated words.',
              'Watch the number: rising means warmer, so keep pushing that direction.',
              'Near the top, test word forms and very close synonyms one at a time.'
            ]
          }
        },
        {
          heading: 'Escaping a dead end',
          callout: {
            title: 'A high score can still mislead',
            body: 'Words can be close in the model for surprising reasons. If synonyms stop helping, jump to a related but different concept to see if the gradient points elsewhere.'
          },
          paragraphs: [
            'The daily Semantle answer page confirms the word, but the game is most satisfying when you follow the similarity gradient patiently from a cold start to the solve.'
          ]
        }
      ],
      faqHeading: 'Semantle questions',
      faqs: [
        {
          question: 'How does Semantle measure closeness?',
          answer:
            'It uses cosine similarity between your guess and the secret word in a word2vec model. Higher numbers mean the meanings are more closely related.'
        },
        {
          question: 'How is Semantle different from Contexto?',
          answer:
            'Semantle shows a raw similarity score and a warmth indicator near the top. Contexto shows only a rank from 1 upward. Both reward following meaning rather than spelling.'
        }
      ],
      relatedLinks: [
        { href: '/semantle-answer-today', label: "Today's Semantle Answer" },
        { href: '/contexto-answer-today', label: "Today's Contexto Answer" },
        { href: '/guides/how-to-play-contexto', label: 'How to Play Contexto' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' }
      ]
    }
  },
  {
    slug: 'how-to-get-better-at-word-games',
    title: 'How to Get Better at Word Games (Habits That Actually Work)',
    description:
      'Practical habits that improve your word-game solving: elimination over guessing, using archives to practice, and reading feedback the right way.',
    cardTitle: 'Get Better at Word Games',
    icon: '📈',
    gradient: 'from-emerald-500 to-teal-600',
    keyword: 'how to get better at word games',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Getting Better',
    body: {
      key: 'how-to-get-better-at-word-games',
      eyebrow: 'Skill Building',
      intro:
        'Getting better at word games comes down to a few transferable habits: treat every guess as a question, favor elimination over hope, and practice with archives where there is no streak on the line. These carry across Wordle, Quordle, and most daily puzzles.',
      sections: [
        {
          heading: 'Elimination beats hope',
          paragraphs: [
            'The biggest single improvement is refusing to guess the answer while the field is still wide. A guess that removes 200 possible words is usually worth more than a guess that might be right but only removes 10. Panic guesses feel like action; they are just hope wearing a costume.',
            'Reframe each guess as a question you are asking the board. What will this tell me that I do not already know? If the answer is "almost nothing," pick a different word.'
          ]
        },
        {
          heading: 'Read feedback without anchoring',
          list: {
            title: 'Habits that lower your average',
            items: [
              'Keep yellows floating: a yellow letter has several possible slots until it goes green.',
              'Never assume letters cannot repeat; test doubles families when singles fail.',
              'Use a fixed opener so you learn what each feedback pattern rules out.',
              'Track the letters you have not tested yet, not just the ones you have.'
            ]
          }
        },
        {
          heading: 'Practice with archives',
          callout: {
            title: 'Drill without streak pressure',
            body: 'Archives let you replay old puzzles with nothing on the line. Play a week of old boards and your losses usually reveal one repeated pattern: a guess made on hope where elimination was available.'
          },
          paragraphs: [
            'The archive pages and solver tools on this site are built for exactly this: replay old answers, run your guesses through the solver, and see whether your instinct matched the highest-information play. That feedback loop is how the habit sticks.'
          ]
        }
      ],
      faqHeading: 'Improvement questions',
      faqs: [
        {
          question: 'What is the fastest way to improve at Wordle?',
          answer:
            'Adopt a fixed opener, spend early guesses on elimination rather than answer-hunting, and replay archived puzzles to practice reading feedback without streak pressure.'
        },
        {
          question: 'Do word-game skills transfer between games?',
          answer:
            'Yes. Elimination-first thinking, not anchoring on early clues, and using feedback deliberately improve your play across Wordle, Quordle, Nerdle, and most daily puzzles.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/wordle-answer-archive', label: 'Wordle Answer Archive' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' },
        { href: '/guides/wordle-hard-mode-guide', label: 'Wordle Hard Mode Guide' }
      ]
    }
  },
  {
    slug: 'are-wordle-solvers-cheating',
    title: 'Are Wordle Solvers Cheating? An Honest Answer',
    description:
      'Whether using a Wordle solver counts as cheating, how solvers actually work, and how to use them to improve instead of just finishing.',
    cardTitle: 'Are Wordle Solvers Cheating?',
    icon: '🤔',
    gradient: 'from-slate-500 to-slate-700',
    keyword: 'are wordle solvers cheating',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Getting Better',
    body: {
      key: 'are-wordle-solvers-cheating',
      eyebrow: 'Solver Ethics',
      intro:
        'Is using a Wordle solver cheating? It depends entirely on why you use it. As an answer vending machine, sure, it ends the puzzle. As a training tool that shows you the highest-information guess after you are stuck, it makes you measurably better. Here is the honest breakdown.',
      sections: [
        {
          heading: 'What a solver actually does',
          paragraphs: [
            'A Wordle solver holds the full valid word list and filters it against your feedback: greens fix positions, yellows require a letter elsewhere, grays remove letters. It then ranks the survivors by how many remaining answers each would eliminate.',
            'It is not magic and it is not connected to the game. It is applied probability, the same reasoning strong players run in their heads, just faster and without human error.'
          ]
        },
        {
          heading: 'When it helps versus when it hollows out the game',
          list: {
            title: 'Two ways to use a solver',
            items: [
              'Training: get stuck, guess your best, then check whether the solver agreed. Learn from the gap.',
              'Finishing: paste in clues and copy the top word. Fast, but you learn nothing.',
              'Verifying: confirm an answer after solving to settle a debate.',
              'Recovering: rescue a streak on a genuinely brutal trap-word day.'
            ]
          }
        },
        {
          heading: 'Using solvers to improve',
          callout: {
            title: 'Compare, do not copy',
            body: 'The players who improve with a solver make their own guess first, then compare it to the solver\'s ranked list. Over a few weeks you start making the solver\'s pick before you check.'
          },
          paragraphs: [
            'There is no scoreboard and no referee in Wordle. It is a single-player puzzle, so "cheating" only means cheating yourself out of practice. Used as a coach rather than a crutch, the solver is one of the fastest ways to get better.'
          ]
        }
      ],
      faqHeading: 'Solver questions',
      faqs: [
        {
          question: 'Is using a Wordle solver against the rules?',
          answer:
            'Wordle has no competitive ruleset or anti-cheat. It is single-player, so using a solver only affects your own experience. Whether it counts as cheating is a personal call.'
        },
        {
          question: 'Can a solver help me get better at Wordle?',
          answer:
            'Yes, if you make your own guess first and compare it to the solver\'s ranked suggestions. That feedback loop trains you to spot the highest-information guess on your own.'
        }
      ],
      relatedLinks: [
        { href: '/wordle-solver', label: '5-Letter Wordle Solver' },
        { href: '/guides/how-to-get-better-at-word-games', label: 'Get Better at Word Games' },
        { href: '/guides/how-to-solve-wordle-in-3-guesses', label: 'Solve Wordle in 3 Guesses' },
        { href: '/wordle-answer-today', label: "Today's Wordle Answer" }
      ]
    }
  },
  {
    slug: 'daily-word-games-like-wordle',
    title: 'Daily Word Games Like Wordle (20+ Alternatives Worth Playing)',
    description:
      'A tour of the best daily games like Wordle, grouped by type: word variants, math, geography, and character-guessing puzzles, each with a solver.',
    cardTitle: 'Games Like Wordle',
    icon: '🎮',
    gradient: 'from-fuchsia-500 to-pink-600',
    keyword: 'daily word games like wordle',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Getting Better',
    body: {
      key: 'daily-word-games-like-wordle',
      eyebrow: 'Game Roundup',
      intro:
        'If you have finished today\'s Wordle and want more, dozens of daily puzzles use the same one-a-day, guess-and-narrow format. They split into four families: word variants, math, geography, and character guessing. Here is a guided tour with where to find each answer and solver.',
      sections: [
        {
          heading: 'Word variants',
          paragraphs: [
            'These keep the letter-guessing core but change the shape. Quordle runs four boards at once; Waffle scrambles overlapping words; Betweenle hides a word behind alphabetical bounds; Phoodle and Canuckle are themed five-letter games.'
          ],
          list: {
            title: 'Word-based picks',
            items: [
              'Quordle: four Wordle boards, nine shared guesses.',
              'Waffle: fix a scrambled grid in minimum swaps.',
              'Betweenle: binary-search a hidden word by alphabetical order.',
              'Phoodle and Canuckle: themed five-letter dailies.'
            ]
          }
        },
        {
          heading: 'Math, geography, and characters',
          list: {
            title: 'Beyond words',
            items: [
              'Nerdle: Wordle for equations, with color feedback on digits and operators.',
              'Worldle and Globle: guess countries from shape or proximity.',
              'Countryle: identify a country from continent, area, and population clues.',
              'LoLdle, Pokedle, Narutodle, Smashdle: guess characters from franchise clues.'
            ]
          },
          paragraphs: [
            'Each of these rewards a different skill: arithmetic, geography, or fandom knowledge. The guessing loop is familiar even when the subject is not.'
          ]
        },
        {
          heading: 'Where to find answers and solvers',
          callout: {
            title: 'One hub for all of them',
            body: 'Every game above has an answer-today page and, in most cases, a dedicated solver on this site. Start at the Today hub for answers or the Solver hub to work a puzzle step by step.'
          },
          paragraphs: [
            'The point of playing several is variety without decision fatigue: the same guess-and-narrow instinct transfers, so you improve at all of them at once.'
          ]
        }
      ],
      faqHeading: 'Games-like-Wordle questions',
      faqs: [
        {
          question: 'What daily games are most like Wordle?',
          answer:
            'Quordle, Waffle, and Betweenle keep the letter-guessing core closest. Nerdle applies the same idea to math, while Worldle and Globle apply it to geography.'
        },
        {
          question: 'Are there solvers for these games?',
          answer:
            'Yes. This site has dedicated solvers for most of them, plus daily answer pages, so you can either work the puzzle with hints or check the solution.'
        }
      ],
      relatedLinks: [
        { href: '/today', label: "Today's Answers Hub" },
        { href: '/solver', label: 'All Solver Tools' },
        { href: '/guides/how-to-win-quordle-every-time', label: 'How to Win Quordle' },
        { href: '/guides/nerdle-strategy-guide', label: 'Nerdle Strategy Guide' }
      ]
    }
  },
  {
    slug: 'colordle-strategy-guide',
    title: 'Colordle Strategy: How to Guess the Hex Code Faster',
    description:
      'How Colordle feedback works with RGB and hex values, and a channel-by-channel strategy for narrowing the daily color in fewer guesses.',
    cardTitle: 'Colordle Strategy Guide',
    icon: '🎨',
    gradient: 'from-pink-500 to-purple-600',
    keyword: 'colordle strategy',
    publishedDate: PUBLISHED,
    modifiedDate: MODIFIED,
    group: 'Non-Word Games',
    body: {
      key: 'colordle-strategy-guide',
      eyebrow: 'Colordle Method',
      intro:
        'Colordle asks you to guess a hidden color as a six-digit hex code, with feedback on how close each red, green, and blue channel is. The efficient approach treats each channel as its own mini-puzzle and narrows them one pair at a time instead of guessing whole colors blind.',
      sections: [
        {
          heading: 'How hex and channel feedback work',
          paragraphs: [
            'A hex code is three pairs: RR for red, GG for green, BB for blue, each from 00 to FF. Colordle tells you whether each channel is too high, too low, or correct, so you get three independent directional clues per guess.',
            'That means you should not think in color names. Think in three numbers, each of which you are pushing up or down toward a target.'
          ]
        },
        {
          heading: 'A channel-by-channel strategy',
          list: {
            title: 'Narrow each channel',
            items: [
              'Start with a mid-gray like 808080 to get a direction on all three channels at once.',
              'For each channel, move halfway toward the indicated direction, a binary search per channel.',
              'Lock channels as they turn correct and keep adjusting the others.',
              'Remember FF is max and 00 is min; do not overshoot past the ends.'
            ]
          }
        },
        {
          heading: 'Converging on the color',
          callout: {
            title: 'Three binary searches at once',
            body: 'Because each channel gives independent high/low feedback, you are really running three simultaneous binary searches. Halving each channel range per guess lands most colors in a handful of tries.'
          },
          paragraphs: [
            'The Colordle solver on this site tracks each channel\'s bounds and suggests the next hex to test, and the daily Colordle answer page reveals the exact code if you want to check your work.'
          ]
        }
      ],
      faqHeading: 'Colordle questions',
      faqs: [
        {
          question: 'How does Colordle tell you if you are close?',
          answer:
            'It gives per-channel feedback on the red, green, and blue values, telling you whether each is too high, too low, or correct. That is three directional clues per guess.'
        },
        {
          question: 'What is the best first guess in Colordle?',
          answer:
            'A mid-gray like 808080 is efficient because it returns a clear high or low direction on all three channels at once, letting you binary-search each toward the target.'
        }
      ],
      relatedLinks: [
        { href: '/colordle-solver', label: 'Colordle Solver' },
        { href: '/colordle-answer-today', label: "Today's Colordle Answer" },
        { href: '/colorfle-solver', label: 'Colorfle Solver' },
        { href: '/guides/how-to-get-better-at-word-games', label: 'Get Better at Word Games' }
      ]
    }
  }
];

/**
 * The published guide list: the hand-written article bodies above, composed
 * with the deep-dive additions from guide-deep-dives.ts (key takeaways, extra
 * sections with figure blocks, extra FAQs and HowTo steps). The split keeps
 * every original section and paragraph byte-identical while the long-form
 * additions stay reviewable in one file.
 */
export const GUIDES: GuideArticle[] = BASE_GUIDES.map((guide) => {
  const extra = GUIDE_EXTRAS[guide.slug];
  if (!extra) return guide;
  return {
    ...guide,
    howToSteps: extra.howToSteps,
    body: {
      ...guide.body,
      keyTakeaways: extra.keyTakeaways,
      sections: [...guide.body.sections, ...(extra.sections ?? [])],
      faqs: [...guide.body.faqs, ...(extra.faqs ?? [])]
    }
  };
});

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug);
export const GUIDE_ROUTES = GUIDES.map((g) => `/guides/${g.slug}`);

export function getGuide(slug: string): GuideArticle | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
