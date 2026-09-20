/**
 * Deep-dive content for the 20 /guides/<slug> articles.
 *
 * Kept separate from `guides.ts` so the original article bodies stay
 * byte-identical: `GUIDES` composes `BASE_GUIDES` with these extras, appending
 * new sections and FAQs and attaching `keyTakeaways` / `howToSteps`.
 *
 * ACCURACY RULE for everything in this file: a number is only allowed if it is
 *   (a) a published game rule — 6 Wordle guesses, 5 letters per guess, hard-mode
 *       hint reuse, 4 Quordle boards, 9 Quordle guesses, Nerdle's 8 characters,
 *       Waffle's 25 tiles, Betweenle's 1–9999 range, hex channels 0–255,
 *       Semantle's 0–100 similarity, or
 *   (b) arithmetic over words printed on the same page — counting distinct
 *       letters, vowels versus consonants, or guesses consumed.
 * No fabricated statistics, no modelled elimination percentages, and no
 * first-person experience (see AGENTS.md and docs/SEO-INDEXING.md Part 4).
 */

import type { StaticArticleContent, StaticArticleVisual } from './registry';
import type { GuideArticle } from './guides';

export interface GuideExtras {
  keyTakeaways?: string[];
  sections?: StaticArticleContent['sections'];
  faqs?: StaticArticleContent['faqs'];
  howToSteps?: GuideArticle['howToSteps'];
}

/** Small helper so a single visual is not wrapped in a one-element array. */
const only = (visual: StaticArticleVisual): StaticArticleVisual => visual;

export const GUIDE_EXTRAS: Record<string, GuideExtras> = {
  /* ══ 1. how-to-solve-wordle-in-3-guesses ═══════════════════════════════════
     Blocks: tiles, bars, steps, stats                                          */
  'how-to-solve-wordle-in-3-guesses': {
    keyTakeaways: [
      'Three guesses is a budget decision, not a lucky guess: guess one and two are spent on <strong>information</strong>, and only guess three is spent on the answer.',
      'A fixed opener is worth more than a clever one because you learn what its two gray tiles rule out.',
      'SLATE, POUND and GRIND between them test <strong>13 of the 26 letters</strong> without repeating a tile.',
      'The method rarely fails on the answer — it fails when guess two chases a hunch instead of testing five new letters.'
    ],
    sections: [
      {
        heading: 'A worked three-guess board, read line by line',
        paragraphs: [
          'The fastest way to see the method is to watch it run. The board below is illustrative — not a daily answer — but every row is a legal Wordle guess and every colour follows from the row above it.',
          'Read the first row as a statement about the alphabet, not about the answer. Five gray tiles do not mean you were wrong; they mean five letters are now free. That is the most valuable result an opener can produce, and it is the result players most often misread as a bad start.',
          'By the third row the board is no longer a search. Two greens have already fixed positions four and five, so the only question left is which letters fill the first three slots — and the two earlier rows have removed eight candidates from consideration.'
        ],
        visual: only({
          type: 'tiles',
          title: 'Three guesses, ten letters tested, no tile wasted',
          rows: [
            { word: 'SLATE', states: ['absent', 'absent', 'absent', 'absent', 'absent'], note: 'Five letters ruled out in one row.' },
            { word: 'POUND', states: ['absent', 'absent', 'absent', 'correct', 'correct'], note: 'N and D lock into slots four and five.' },
            { word: 'GRIND', states: ['correct', 'correct', 'correct', 'correct', 'correct'], note: 'Guess three closes the board.' }
          ],
          caption: 'Illustrative board. Every state follows from the row above it; no tile repeats a letter already ruled out.'
        })
      },
      {
        heading: 'How the three guesses divide their work',
        paragraphs: [
          'A Wordle round gives you six guesses, which means the three-guess method is really a plan for spending three of them and banking three. Guess one is a fixed cost. Guess two is the information purchase. Guess three is the only guess that is allowed to be an answer attempt.',
          'The bar chart below counts something you can check by reading the three words above: how many letters each guess tests for the first time. The first two rows are perfectly efficient — ten tiles, ten new letters. The third row is deliberately inefficient, because by then information has stopped being the scarce resource and the answer is.',
          'That is the whole shape of the method. Efficiency matters while the field is wide, and it stops mattering the moment two or three candidates remain. Players who keep buying information after the board is narrow are the ones who reach guess six with four greens on the board.'
        ],
        visual: only({
          type: 'bars',
          title: 'Letters tested for the first time, by guess',
          max: 5,
          unit: ' letters',
          bars: [
            { label: 'Guess 1 — SLATE', value: 5, tone: 'primary', note: 'S, L, A, T, E all new.' },
            { label: 'Guess 2 — POUND', value: 5, tone: 'primary', note: 'P, O, U, N, D all new.' },
            { label: 'Guess 3 — GRIND', value: 3, tone: 'success', note: 'Only G, R and I are new; N and D were already placed.' }
          ],
          caption: 'Across the three rows, 13 of the 26 letters have been tested.'
        })
      },
      {
        heading: 'The three mistakes that cost you the third guess',
        paragraphs: [
          'Almost every failed three-guess attempt traces back to one of three habits, and all three are habits rather than knowledge problems. The steps below are the corrections.',
          'The first is treating a yellow tile as a positional clue too early. A yellow tells you a letter is present and not where you put it — that is all. Players who immediately build their second guess around moving that one letter forward usually spend the guess testing one letter instead of five.',
          'The second is repeating an eliminated letter. If a tile came back gray, putting that letter in the next guess buys nothing at all. The third is refusing to commit. Once two candidates remain and you can separate them logically, the information-first strategy has already done its job, and guessing is no longer a gamble but the correct next move.'
        ],
        visual: [
          only({
            type: 'steps',
            title: 'The corrections, in order',
            steps: [
              { title: 'Treat yellow as presence, not position', body: 'A yellow tile confirms the letter exists. Move every yellow to a fresh slot in the next guess rather than rebuilding the guess around one of them.' },
              { title: 'Never re-test a gray letter', body: 'A gray tile is a permanent exclusion. Reusing that letter spends a tile that could have tested a new one.' },
              { title: 'Switch from information to answer once two candidates remain', body: 'While the field is wide, take information. Once the field is two words wide, the highest-information guess and the answer are the same guess.' }
            ]
          }),
          only({
            type: 'stats',
            title: 'The method in numbers',
            stats: [
              { value: '6', label: 'Guesses per round', note: 'The budget the method works inside.' },
              { value: '5', label: 'Letters per guess', note: 'Every row tests five positions at once.' },
              { value: '13', label: 'Letters tested by three guesses', note: 'Counting the SLATE / POUND / GRIND sequence above.' },
              { value: '3', label: 'Guesses left in reserve', note: 'Six minus three — the margin if the board splits.' }
            ]
          })
        ]
      }
    ],
    faqs: [
      {
        question: 'Does the three-guess method work on any starting word?',
        answer:
          'It works with any opener that tests five distinct letters, but the second-guess decisions change. A word with repeated letters tests fewer than five, so the first row does less work and you start the second guess with a wider field.'
      },
      {
        question: 'What should I do if all five tiles come back gray?',
        answer:
          'That is the best possible first row. Five letters are excluded, so the second guess should test five more with no repeats. Two all-gray guesses narrow the field further than most players realise, and there are still four guesses left to use the exclusions.'
      },
      {
        question: 'Is a three-guess solve the same as a two-guess solve?',
        answer:
          'No. A two-guess solve needs one candidate to be the only word matching your feedback. A three-guess solve only needs the board to be narrow enough that a single further guess separates the remaining candidates.'
      }
    ],
    howToSteps: [
      { name: 'Choose one opener and reuse it every day', text: 'Pick a five-letter word with no repeated letters that tests two vowels and three frequent consonants, such as SLATE, CRANE or TRACE, and open with it every game so its gray tiles always rule out the same letters.' },
      { name: 'Read the first row as a set of exclusions', text: 'Write down which letters came back gray. Those letters cannot appear anywhere in the answer, so they must not appear in your second guess.' },
      { name: 'Spend guess two on letters you have not tested', text: 'Build the second guess from five letters that have not appeared yet. If the opener returned a green or yellow, keep that letter and move any yellow to a different position, then fill the remaining slots with new letters.' },
      { name: 'Move every yellow to a fresh slot', text: 'A yellow tile confirms the letter is in the answer but not in that position. In the next guess, place it somewhere else rather than rebuilding the guess around the slot you already tried.' },
      { name: 'Narrow to a candidate list before guess three', text: 'Combine the confirmed letters, their positions and the excluded letters, then write out every common word that fits. Aim to finish this guess with two or three candidates rather than a long list.' },
      { name: 'Commit on guess three once the field is narrow', text: 'When two or three candidates remain, guess the word you consider most likely. If two candidates cannot be separated logically, play the guess that distinguishes them and accept that it may take a fourth attempt.' }
    ]
  },

  /* ══ 2. best-wordle-starting-words ══════════════════════════════════════════
     Blocks: bars, tiles, table                                                 */
  'best-wordle-starting-words': {
    keyTakeaways: [
      'A starting word is good when its <strong>five tiles test five different letters</strong>; a repeated letter makes two tiles do the work of one.',
      'Gray tiles are the most common first-row result, so pick an opener whose exclusions you are happy to live with all game.',
      'EERIE carries five tiles but only three distinct letters, which is why it looks stronger than it is.',
      'Pick one opener and keep it. The value comes from reading its feedback pattern the same way every day.'
    ],
    sections: [
      {
        heading: 'Counting the letters an opener actually tests',
        paragraphs: [
          'Ranking openers is easier once you separate what a word looks like from what its tiles actually test. Five tiles can test as few as three letters if the word repeats one, and every repeat is a tile that cannot tell you anything new about the alphabet.',
          'Count distinct letters, not tiles. SLATE, CRANE and SOARE each carry five different letters, so a single row either confirms or excludes five of the twenty-six. ADIEU also tests five distinct letters, four of which are vowels, which makes it a strong vowel probe and a weak consonant one.',
          'EERIE is the instructive case. It uses five tiles on three letters, so its ceiling is three pieces of information instead of five. In a game where the first row is the only row that is guaranteed to test letters you know nothing about, that shortfall is expensive.'
        ],
        visual: only({
          type: 'bars',
          title: 'Distinct letters carried by each opener',
          max: 5,
          unit: ' letters',
          bars: [
            { label: 'SLATE', value: 5, tone: 'success', note: 'S, L, A, T, E — no repeats.' },
            { label: 'CRANE', value: 5, tone: 'success', note: 'C, R, A, N, E — no repeats.' },
            { label: 'SOARE', value: 5, tone: 'success', note: 'S, O, A, R, E — no repeats.' },
            { label: 'ADIEU', value: 5, tone: 'primary', note: 'A, D, I, E, U — four of the five are vowels.' },
            { label: 'BANAL', value: 4, tone: 'neutral', note: 'A appears twice, so one tile is spent on a letter you already know about.' },
            { label: 'EERIE', value: 3, tone: 'accent', note: 'E appears three times: five tiles, three letters.' }
          ],
          caption: 'Distinct letters is arithmetic on the word itself — the same five tiles, read as a count of new information.'
        })
      },
      {
        heading: 'What you actually learn when the whole row goes gray',
        paragraphs: [
          'The all-gray row is the single most common first result and the one players plan for least. Because it feels like failure, it gets treated as a reason to change openers — which throws away the only advantage a fixed opener provides.',
          'The table below reads five openers the way the first row would read them if every tile came back gray. This is the exact list of letters you would carry as exclusions into guess two, and it is checkable by reading each word.',
          'Notice how much the choice matters. The five-distinct-letter openers remove five letters from the answer pool in one row. EERIE removes three, and two of its tiles were spent on letters you had already eliminated by the second E.'
        ],
        visual: only({
          type: 'table',
          title: 'Letters excluded by an all-gray first row',
          headers: ['Opener', 'What the gray row rules out'],
          rows: [
            { label: 'SLATE', value: 'S, L, A, T and E — five letters gone.', highlight: true },
            { label: 'CRANE', value: 'C, R, A, N and E — five letters gone.', highlight: true },
            { label: 'SOARE', value: 'S, O, A, R and E — five letters gone.', highlight: true },
            { label: 'ADIEU', value: 'A, D, I, E and U — five letters gone, but no consonant coverage.', highlight: true },
            { label: 'BANAL', value: 'B, A, N and L — only four, because A repeats.' },
            { label: 'EERIE', value: 'E, R and I — only three, so two tiles taught you nothing.' }
          ],
          caption: 'Same five tiles in every row; the difference is how many distinct letters they can exclude.'
        })
      },
      {
        heading: 'Planning the second row before you need it',
        paragraphs: [
          'The opener and the second guess are a single decision made in two instalments. If you know which five letters your opener tests, you already know which letters are left to test in the second row — and you can pick a second word whose tiles do not overlap.',
          'The board below is the pairing most three-guess attempts reduce to. SLATE covers S, L, A, T and E. POUND covers P, O, U, N and D. Ten tiles, ten different letters, no overlap, and between them they place or exclude ten of the twenty-six letters before the third guess is typed.',
          'The rule that falls out of this is simple: the second guess should be chosen so that no letter in it appeared in the first. If your opener is ADIEU, the second guess should be heavy on consonants rather than on the vowels ADIEU already tested.'
        ],
        visual: only({
          type: 'tiles',
          title: 'An opener and a second row with no overlapping letters',
          rows: [
            { word: 'SLATE', states: ['absent', 'absent', 'absent', 'absent', 'absent'], note: 'Ten letters covered by two rows, zero repeats.' },
            { word: 'POUND', states: ['absent', 'absent', 'absent', 'correct', 'correct'], note: 'P, O, U, N and D are all new; N and D land green.' }
          ],
          caption: 'Illustrative rows. The point is that the two words share no letters, which is the property to look for in a pair.'
        })
      }
    ],
    faqs: [
      {
        question: 'How many starting words should I know?',
        answer:
          'One. A second opener is useful only for a different purpose, such as testing vowels after a consonant-heavy first row. Rotating between several openers costs you the feedback baseline that makes a fixed opener valuable.'
      },
      {
        question: 'Are words with repeated letters ever good openers?',
        answer:
          'They are not good information openers, because two tiles test one letter. A double-letter word becomes useful later, when you already know the answer contains that letter and need to find out whether it appears twice.'
      }
    ]
  },

  /* ══ 3. wordle-hard-mode-guide ══════════════════════════════════════════════
     Blocks: table, tiles, stats                                                */
  'wordle-hard-mode-guide': {
    keyTakeaways: [
      'Hard mode does not add difficulty by hiding information — it removes your ability to spend a guess on <strong>five fresh letters</strong> once you have a hit.',
      'Greens lock a position. Yellows lock a letter and forbid the slot you already tried.',
      'The mode hurts most on words that share an ending, because keeping the pattern means each guess can only test one remaining gap.',
      'The six-guess budget is unchanged, so the cost of hard mode is paid in information, not in guesses.'
    ],
    sections: [
      {
        heading: 'The hard-mode rules, stated plainly',
        paragraphs: [
          'Hard mode is easier to play well once you stop thinking of it as a difficulty setting and start thinking of it as a constraint on your next guess. The rules are small in number and all of them act on the same thing: what you are permitted to type next.',
          'The table below lists what each rule does to your options. None of them change the answer pool, the number of guesses, or the way colours are calculated. They only remove the option of ignoring a hint you have already been given.',
          'One subtlety is worth stating because it trips people up: hard mode tracks letters, not counts. If a single yellow E is showing, your next guess must include an E — but the mode does not demand that you type two of them unless you have evidence that two Es are in the answer.'
        ],
        visual: only({
          type: 'table',
          title: 'What hard mode changes about your next guess',
          headers: ['Rule', 'Effect on the next guess'],
          rows: [
            { label: 'Revealed letters must be reused', value: 'You cannot spend a guess on letters that ignore a green or yellow tile.', highlight: true },
            { label: 'Green tiles must stay put', value: 'A confirmed letter is locked to its position.' },
            { label: 'Yellow tiles must move', value: 'The letter must appear again, in a different slot from the one you tried.' },
            { label: 'Grays stay unusable', value: 'An eliminated letter cannot be reintroduced in a later guess.' },
            { label: 'Letter counts are not enforced', value: 'One yellow E must recur once; hard mode does not require a second E.' },
            { label: 'Six guesses, unchanged', value: 'The budget is identical to standard mode.' }
          ],
          caption: 'Every rule restricts the next guess. None of them change the answer list or the guess count.'
        })
      },
      {
        heading: 'The _IGHT squeeze, worked through',
        paragraphs: [
          'The clearest demonstration of the hard-mode cost is a word family that shares an ending. In standard mode you would abandon the pattern, play five fresh letters, and separate the candidates. In hard mode the pattern is locked, so each guess can only resolve the one gap that is still open.',
          'The board below shows how the squeeze develops. The first row returns four yellows, which locks four letters. The second row converts those into four greens and a gray, which means the pattern is fixed and only the first letter is unknown.',
          'At that point the counting turns against you. The common words matching the pattern are EIGHT, FIGHT, LIGHT, MIGHT, SIGHT and TIGHT — six candidates, and hard mode forces you to guess inside the pattern, so each guess can only try one of the six possible first letters. The honest conclusion is not that hard mode makes the puzzle unsolvable; it is that this board shape is where the mode costs the most, and the way to handle it is to avoid arriving there with a wide field.'
        ],
        visual: only({
          type: 'tiles',
          title: 'A locked pattern with five guesses left',
          rows: [
            {
              word: 'THING',
              states: ['present', 'present', 'present', 'absent', 'present'],
              note: 'T, H, I and G are all in the answer and none is in the right slot; N is out.'
            },
            {
              word: 'RIGHT',
              states: ['absent', 'correct', 'correct', 'correct', 'correct'],
              note: 'Four greens, but R is ruled out — so the pattern is fixed and the first letter is still open.'
            }
          ],
          caption: 'Illustrative board. The candidates left matching the pattern are EIGHT, FIGHT, LIGHT, MIGHT, SIGHT and TIGHT.'
        })
      },
      {
        heading: 'Playing hard mode without walking into traps',
        paragraphs: [
          'Hard mode rewards a different first-guess policy. In standard mode the opener is chosen purely for coverage. In hard mode it is worth choosing an opener whose letters, if they all come back yellow, do not immediately lock you into a word family you cannot escape.',
          'The practical habit is to count your remaining candidates after every row, not just after the first. A row that produces four greens feels like progress and is often the moment your options collapse — because four greens plus a locked pattern can leave you with a handful of words and one guess per candidate.',
          'Finally, remember what hard mode is protecting. It keeps you from pretending that a guess made with ignored hints was a real solve, which is why its boards tend to produce honest fours and fives rather than lucky threes.'
        ],
        visual: only({
          type: 'stats',
          title: 'The hard-mode budget',
          stats: [
            { value: '6', label: 'Guesses per round', note: 'Identical to standard mode.' },
            { value: '2', label: 'Hint kinds that bind', note: 'Greens lock a position; yellows lock a letter.' },
            { value: '5', label: 'Slots a yellow can still occupy', note: 'Five slots minus the one you already tried.' },
            { value: '6', label: 'Candidates in the worked _IGHT board', note: 'EIGHT, FIGHT, LIGHT, MIGHT, SIGHT, TIGHT.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Does hard mode make the answer harder to guess?',
        answer:
          'No. The answer pool and the colour rules are the same. Hard mode restricts which guesses you are allowed to submit, which removes your ability to gather information on letters you have already seen hinted.'
      },
      {
        question: 'Is hard mode the same as playing without a solver?',
        answer:
          'They are different constraints. Hard mode is enforced by the game and limits your next guess. Solver use is a personal choice and is not detected or blocked. A hard-mode board played with a solver is still a solver-assisted board.'
      }
    ]
  },

  /* ══ 4. words-with-lots-of-vowels ═══════════════════════════════════════════
     Blocks: table, tiles, bars                                                 */
  'words-with-lots-of-vowels': {
    keyTakeaways: [
      'A five-letter word can carry at most <strong>four</strong> vowels, because five vowels would mean no consonant at all.',
      'Four-vowel words are vowel probes, not openers: they leave every consonant untested.',
      'Three-vowel words such as ROUTE and JUICE give you vowel coverage and two consonants at the same time.',
      'After a vowel-heavy row, the next guess should be consonants only — the vowels are already accounted for.'
    ],
    sections: [
      {
        heading: 'Four vowels is the ceiling, and here is why',
        paragraphs: [
          'Wordle answers are five letters long and there are five vowel letters, so a five-letter word built only from vowels would have no consonant in it. That is not how English works, which puts the practical ceiling at four vowels and one consonant.',
          'Very few words sit at that ceiling, and the ones that do are unusual. The table below lists them with their vowel and consonant counts written out, so you can verify the count by reading each row rather than trusting a label.',
          'The pattern that matters is what the single consonant does. In AUDIO, ADIEU and OUIJA the consonant is D or J — letters that are rare in answers. A four-vowel row therefore tells you a great deal about the vowels and almost nothing about the letters you are most likely to need next.'
        ],
        visual: only({
          type: 'table',
          title: 'Vowel-heavy five-letter words, counted',
          headers: ['Word', 'Vowels and consonants'],
          rows: [
            { label: 'AUDIO', value: 'A, U, I, O — four vowels, consonant D', highlight: true },
            { label: 'ADIEU', value: 'A, I, E, U — four vowels, consonant D', highlight: true },
            { label: 'OUIJA', value: 'O, U, I, A — four vowels, consonant J', highlight: true },
            { label: 'LOUIE', value: 'O, U, I, E — four vowels, consonant L', highlight: true },
            { label: 'ROUTE', value: 'O, U, E — three vowels, consonants R and T' },
            { label: 'JUICE', value: 'U, I, E — three vowels, consonants J and C' },
            { label: 'MOUSE', value: 'O, U, E — three vowels, consonants M and S' },
            { label: 'SERAI', value: 'E, A, I — three vowels, consonants S and R' }
          ],
          caption: 'Counted with A, E, I, O and U as the vowels; every row can be checked by reading the word.'
        })
      },
      {
        heading: 'Following a four-vowel row forward',
        paragraphs: [
          'The point of a vowel-heavy word is to split the answer pool on a single dimension very early. If you open with AUDIO and the row comes back with two yellows, you have located two vowels and excluded three letters in one move.',
          'The board below continues from that row. The second guess deliberately includes no new vowels, because the vowels have been tested; it spends its tiles on consonants instead, and three of them land in the right slots.',
          'This is the habit that separates a vowel probe from a wasted guess. A four-vowel opener is only worth playing if you commit to the follow-up: consonants in the second row, positioned using the vowel feedback you just bought.'
        ],
        visual: only({
          type: 'tiles',
          title: 'From vowel probe to solved board',
          rows: [
            {
              word: 'AUDIO',
              states: ['absent', 'present', 'absent', 'absent', 'present'],
              note: 'O and U are in the answer; A, D and I are out.'
            },
            {
              word: 'ROUTE',
              states: ['absent', 'correct', 'correct', 'absent', 'correct'],
              note: 'Consonants only for the fresh tiles: R and T are both ruled out, but O, U and E sit in the right slots.'
            },
            {
              word: 'MOUSE',
              states: ['correct', 'correct', 'correct', 'correct', 'correct'],
              note: 'Guess three closes the board.'
            }
          ],
          caption: 'Illustrative board, not a daily answer. Two rows locate three vowels and three positions.'
        })
      },
      {
        heading: 'How many vowels should a word have?',
        paragraphs: [
          'The useful number is three, not four. A three-vowel word such as ROUTE, JUICE or MOUSE tests three of the five vowels and two consonants at the same time, which keeps the row balanced across both halves of the alphabet.',
          'A four-vowel word trades all of its consonant coverage for a fourth vowel. That is a reasonable trade only when you already suspect the answer is vowel-rich — for example after a first row that returned grays on the consonants you consider most likely.',
          'The bar chart below shows the trade directly. Four-vowel rows sit at the top of the vowel scale and at the very bottom of the consonant scale, which is the same fact viewed from the other side.'
        ],
        visual: only({
          type: 'bars',
          title: 'Vowels per word, out of five tiles',
          max: 5,
          unit: ' vowels',
          bars: [
            { label: 'AUDIO', value: 4, tone: 'accent', note: 'One consonant tile.' },
            { label: 'ADIEU', value: 4, tone: 'accent', note: 'One consonant tile.' },
            { label: 'OUIJA', value: 4, tone: 'accent', note: 'One consonant tile.' },
            { label: 'ROUTE', value: 3, tone: 'success', note: 'Two consonant tiles.' },
            { label: 'MOUSE', value: 3, tone: 'success', note: 'Two consonant tiles.' },
            { label: 'SERAI', value: 3, tone: 'success', note: 'Two consonant tiles.' },
            { label: 'CRANE', value: 2, tone: 'primary', note: 'Three consonant tiles.' }
          ],
          caption: 'Four vowels leaves one tile for consonants; three vowels leaves two.'
        })
      }
    ],
    faqs: [
      {
        question: 'Can a Wordle answer have no vowels at all?',
        answer:
          'Only if Y is doing the work, as in a word like NYMPH. The game does not require a letter from A, E, I, O or U, which is one reason a row that rules out all five tells you less than it appears to.'
      },
      {
        question: 'Should a four-vowel word be my opening guess?',
        answer:
          'Usually not as a permanent opener. It tests four vowels and one consonant, so it tells you nothing about the consonants that appear in most answers. It is better used as a second guess when the first row has already ruled out consonants.'
      }
    ]
  },

  /* ══ 5. two-vowel-words-for-wordle ══════════════════════════════════════════
     Blocks: tiles, table, steps                                                */
  'two-vowel-words-for-wordle': {
    keyTakeaways: [
      'Two vowels across five tiles leaves <strong>three tiles for consonants</strong>, which is the balance most answers actually have.',
      'The useful unit is the vowel pair: knowing which two vowels the answer carries splits the field faster than knowing how many.',
      'Every pair from A+E through U+I has a family of common answers, and the table below names them.',
      'Treat the pair as a filter: read the yellow tiles, name the pair, then work the consonants.'
    ],
    sections: [
      {
        heading: 'The vowel pairs and the words that carry them',
        paragraphs: [
          'Two-vowel words are worth organising by which pair they use rather than by how many vowels they contain. There are ten unordered pairs of the five vowel letters, and each pair has a recognisable family of five-letter answers.',
          'The table below maps each pair to common words. Every row can be checked by reading the word and counting: each entry contains exactly two vowels and no repeated vowel.',
          'This is the list to keep in mind when a row returns two yellow vowel tiles. Naming the pair turns a vague sense that the answer is vowel-ish into a concrete filter you can apply to every candidate you write down.'
        ],
        visual: only({
          type: 'table',
          title: 'Ten vowel pairs, with common five-letter words',
          headers: ['Vowel pair', 'Words that carry exactly that pair'],
          rows: [
            { label: 'A + E', value: 'CRANE, SLATE, PLACE, SHARE, GRACE', highlight: true },
            { label: 'A + I', value: 'TRAIN, PLAIN, CHAIR, BRAID', highlight: true },
            { label: 'A + O', value: 'CLOAK, BROAD, COAST, ROAST' },
            { label: 'A + U', value: 'CAULK, VAULT' },
            { label: 'E + I', value: 'PRICE, SPINE, CHIME' },
            { label: 'E + O', value: 'STONE, CLOSE, PHONE' },
            { label: 'E + U', value: 'PLUME' },
            { label: 'I + O', value: 'PILOT, MINOR' },
            { label: 'I + U', value: 'BUILD, GUILT' },
            { label: 'O + U', value: 'COURT, DOUBT' }
          ],
          caption: 'Each entry has two vowels and no vowel repeated, so the pair fully describes its vowel content.'
        })
      },
      {
        heading: 'A two-vowel board worked through',
        paragraphs: [
          'The board below shows the pair filter in action. The opener comes back with a single yellow, which is the ordinary result and the one that tells you least. The second row is where the method earns its keep: it keeps the confirmed letter and spends its other tiles on letters that have not been tried.',
          'Two yellows after the second row name the pair. From there the remaining question is only which consonants fill the gaps, and the vowels can be left alone entirely.',
          'Notice that the solved answer carries O and U — one pair from the table above. Boards that reach guess three with two vowels confirmed are usually boards where the pair was named early and the consonants were worked from the exclusions.'
        ],
        visual: only({
          type: 'tiles',
          title: 'Naming the pair, then working the consonants',
          rows: [
            { word: 'SLATE', states: ['absent', 'absent', 'absent', 'present', 'absent'], note: 'Only T is present; S, L, A and E are out.' },
            { word: 'PILOT', states: ['absent', 'absent', 'absent', 'present', 'present'], note: 'O joins T. The pair is O plus one more vowel, and P, I and L are out.' },
            { word: 'COURT', states: ['correct', 'correct', 'correct', 'correct', 'correct'], note: 'O and U is the pair; the consonants fall into place.' }
          ],
          caption: 'Illustrative board. Two rows confirm the vowel pair and rule out three letters per row.'
        })
      },
      {
        heading: 'Working a two-vowel board in order',
        paragraphs: [
          'The order matters more than the individual guesses. Vowels first, pair second, consonants third — reversing that order is what produces boards with four greens and no idea which vowel is missing.',
          'The steps below are the sequence for a board that has already produced vowel feedback. Each step uses only the information from the row above it.',
          'The reason consonants come last is that there are more of them, so a consonant guess is likelier to come back gray, and grays are the cheapest exclusions to collect. Spending the third guess on vowels instead leaves the larger half of the alphabet untested exactly when you need it most.'
        ],
        visual: only({
          type: 'steps',
          title: 'The order to work in',
          steps: [
            { title: 'Test vowels with a balanced opener', body: 'Open with a word carrying two vowels and three consonants, such as CRANE or SLATE, so the first row has a chance of touching both halves of the alphabet.' },
            { title: 'Name the vowel pair from the yellow tiles', body: 'Use the table above. One yellow vowel plus a ruled-out vowel narrows the pair considerably; two yellows usually name it outright.' },
            { title: 'Move yellows and add fresh consonants', body: 'In the next guess, relocate every yellow vowel to a different slot and fill the remaining tiles with consonants that have not been excluded.' },
            { title: 'Stop testing vowels once the pair is known', body: 'After the pair is confirmed, further vowel tiles are wasted. Spend every remaining tile on consonants and positions.' },
            { title: 'Commit once two candidates remain', body: 'When the pair and two consonants are placed, write out the words that fit and guess the most likely one rather than continuing to gather information.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Is A + E the most useful vowel pair to test first?',
        answer:
          'It is the pair with the largest family of common answers, which makes it a sensible default, and both letters appear in many five-letter words. That is a statement about how often the pair is useful to have tested, not a claim about how often it appears in any particular answer.'
      },
      {
        question: 'What if the game returns one vowel and four grays?',
        answer:
          'That is a strong result. Four grays plus one yellow vowel means four letters are excluded and one vowel is confirmed. The next guess should test three fresh consonants and relocate the confirmed vowel.'
      }
    ]
  },

  /* ══ 6. words-with-double-letters ═══════════════════════════════════════════
     Blocks: tiles, table, bars                                                 */
  'words-with-double-letters': {
    keyTakeaways: [
      'A repeated letter means two tiles test <strong>one</strong> letter, so double-letter words narrow the field less than they appear to.',
      'The trap is one-sided: you find the repeated letter, place it once, and never consider that it appears twice until the board stalls.',
      'When a board shows four greens and a single yellow, the missing piece is often a second copy of a letter you have already confirmed.',
      'FLUFF spends five tiles on three letters; BELLY spends five tiles on four.'
    ],
    sections: [
      {
        heading: 'How many letters a double-letter word really tests',
        paragraphs: [
          'Every five-letter word with a repeated letter tests fewer than five distinct letters. That is arithmetic, not opinion, and it is the whole reason a double-letter word is weaker as a probe than it looks.',
          'The bar chart below counts distinct letters for words you can read in the table above it. A word like FLUFF looks busy, but five tiles carrying three letters leaves two letters completely untested — and those two untested letters are the reason the board stalls later.',
          'This does not make double-letter words bad. It makes them specialist tools: excellent once you already know the answer contains that letter, and wasteful before then.'
        ],
        visual: only({
          type: 'bars',
          title: 'Distinct letters in five-tile double-letter words',
          max: 5,
          unit: ' letters',
          bars: [
            { label: 'BELLY', value: 4, tone: 'success', note: 'B, E, L, Y — one tile repeats L.' },
            { label: 'GRASS', value: 4, tone: 'success', note: 'G, R, A, S — one tile repeats S.' },
            { label: 'COMMA', value: 4, tone: 'success', note: 'C, O, M, A — one tile repeats M.' },
            { label: 'QUEEN', value: 4, tone: 'success', note: 'Q, U, E, N — one tile repeats E.' },
            { label: 'HAPPY', value: 4, tone: 'success', note: 'H, A, P, Y — one tile repeats P.' },
            { label: 'FLUFF', value: 3, tone: 'accent', note: 'F, L, U — two tiles repeat F, so five tiles test three letters.' }
          ],
          caption: 'Counted directly from the words in the table below. A repeat costs one tile of coverage.'
        })
      },
      {
        heading: 'Reading the repeated letter out of the colours',
        paragraphs: [
          'Wordle shows you colours per tile, not per letter, which is what makes doubles hard to read. A single yellow E tells you an E exists in the answer. It does not tell you whether a second E exists, and it never will until you place one and the board refuses to close.',
          'The table below pairs each example word with the letter it repeats, so the two can be read side by side. Use it as a reference when a board produces four greens and a stubborn yellow.',
          'The practical test is this: when you have placed every confirmed letter and the board still shows a yellow, stop looking for new letters and ask whether one of the confirmed ones appears twice.'
        ],
        visual: only({
          type: 'table',
          title: 'Doubles and where they sit',
          headers: ['Word', 'The repeated letter'],
          rows: [
            { label: 'SPEED', value: 'E appears twice, in slots three and four', highlight: true },
            { label: 'QUEEN', value: 'E appears twice, in slots three and four', highlight: true },
            { label: 'BELLY', value: 'L appears twice, in slots three and four' },
            { label: 'GRASS', value: 'S appears twice, in slots four and five' },
            { label: 'PRESS', value: 'S appears twice, in slots four and five' },
            { label: 'COMMA', value: 'M appears twice, in slots three and four' },
            { label: 'HAPPY', value: 'P appears twice, in slots three and four' },
            { label: 'FLUFF', value: 'F appears three times, in slots one, four and five' }
          ],
          caption: 'Every count here can be checked by reading the word, so the list doubles as a spot-check on your own board reads.'
        })
      },
      {
        heading: 'A board that a hidden double letter stalls',
        paragraphs: [
          'The board below is the classic double-letter stall. Two rows place one letter and reveal another, and both rows are reasonable guesses — nothing about either is a mistake. The problem is that neither row considers the possibility of a repeated letter.',
          'After the second row you know N sits in slot five and E exists somewhere, and yet the board still looks almost empty. The answer is not a word with five new letters; it is a word where the E you already found appears twice.',
          'The fix is not a different opener. It is a habit, applied at the top of every guess: before writing a word, ask whether any letter you have already confirmed could be doing double duty.'
        ],
        visual: only({
          type: 'tiles',
          title: 'Two reasonable rows and one hidden second letter',
          rows: [
            { word: 'SLATE', states: ['absent', 'absent', 'absent', 'absent', 'present'], note: 'One yellow E — and no evidence for or against a second E.' },
            { word: 'TRAIN', states: ['absent', 'absent', 'absent', 'absent', 'correct'], note: 'N locks into slot five, but the E from row one still has no slot.' },
            { word: 'QUEEN', states: ['correct', 'correct', 'correct', 'correct', 'correct'], note: 'The E was hiding a second E in the next slot.' }
          ],
          caption: 'Illustrative board. Neither of the first two rows was a bad guess; the double letter was simply never considered.'
        })
      }
    ],
    faqs: [
      {
        question: 'Should I guess a double-letter word early?',
        answer:
          'Only when you have a reason. Before any letter is confirmed, a double costs you a tile of coverage. After a letter is confirmed, testing whether it repeats is one of the highest-value questions left on the board.'
      },
      {
        question: 'How can I tell a letter appears twice from the colours alone?',
        answer:
          'You generally cannot, from a single row. A green followed by a yellow of the same letter is strong evidence: the letter is definitely in the answer and the yellow says at least one more copy exists that you have not placed.'
      }
    ]
  },

  /* ══ 7. 5-letter-words-ending-in-e ══════════════════════════════════════════
     Blocks: table, tiles, stats                                                */
  '5-letter-words-ending-in-e': {
    keyTakeaways: [
      'Placing an E in slot five settles the final tile and leaves <strong>four</strong> positions to work out.',
      'The E ending consumes a vowel, so most of these answers have exactly one other vowel.',
      'Working by ending frame — -AKE, -ONE, -IDE — converts a long candidate list into short, testable families.',
      'When a board shows a green E in slot five, the next guess should test consonants in the four open slots.'
    ],
    sections: [
      {
        heading: 'Sorting E-endings by frame',
        paragraphs: [
          'An E in the last slot is the single most useful green tile to receive, because it turns the problem into a four-letter one. The fastest way to use it is to sort candidates by their ending frame rather than by their first letter.',
          'The table below groups common E-ending answers by the three letters that precede the E. Each frame is a small, closed family, which is exactly what you want when you are trying to decide between candidates rather than brainstorm them.',
          'Reading down the frames is also a way to notice that the answer usually carries one other vowel. Frames like -ONE, -IDE and -OSE supply it themselves; frames like -AKE need it from the open slots.'
        ],
        visual: only({
          type: 'table',
          title: 'Common E-ending frames',
          headers: ['Frame', 'Words in the family'],
          rows: [
            { label: '-AKE', value: 'BRAKE, FLAKE, SNAKE, STAKE', highlight: true },
            { label: '-ONE', value: 'STONE, PHONE, ATONE', highlight: true },
            { label: '-IDE', value: 'PRIDE, SLIDE, GUIDE' },
            { label: '-OSE', value: 'CLOSE, THOSE, CHOSE' },
            { label: '-ITE', value: 'WHITE, WRITE, SMITE' },
            { label: '-AVE', value: 'BRAVE, GRAVE, SHAVE' },
            { label: '-ALE', value: 'WHALE, SCALE, STALE' }
          ],
          caption: 'Each frame is a closed set of five-letter words whose final tile is E.'
        })
      },
      {
        heading: 'From a green E to a solved board',
        paragraphs: [
          'The board below shows what the E ending buys you. The first row places the final tile and confirms a second letter, which is a large amount of information for one guess — the closing E is worth more than a middle green because it also fixes the shape of the ending.',
          'The second row spends its tiles in the four open slots. The answer falls out without any further vowel work, because the frame narrowed the field to a handful of words and two of them were excluded by letters already ruled out.',
          'Keep the ending frames in mind as candidate groups, not as guesses. Guessing a frame word like SNAKE when you have no evidence for that frame is a coin flip; guessing it after the exclusions have removed the rest of the family is arithmetic.'
        ],
        visual: only({
          type: 'tiles',
          title: 'A green E in slot five, read forward',
          rows: [
            { word: 'SLATE', states: ['present', 'absent', 'correct', 'absent', 'correct'], note: 'A locks into slot three and E closes the word; S is present but not in slot one.' },
            { word: 'CHIME', states: ['correct', 'correct', 'absent', 'absent', 'correct'], note: 'C and H take the open slots; I and M are ruled out.' },
            { word: 'CHASE', states: ['correct', 'correct', 'correct', 'correct', 'correct'], note: 'The -ASE frame was the only one left standing.' }
          ],
          caption: 'Illustrative board. Slot five is settled first, then the four open slots are tested with consonants.'
        })
      },
      {
        heading: 'What an E ending saves you',
        paragraphs: [
          'Counting is the reason E-ending answers are comfortable to solve. A five-letter word has five positions; once E occupies the fifth, four remain. The E also supplies one of the answer vowels in most cases, which means the remaining four tiles can be spent almost entirely on consonants.',
          'The cheapest way to use the ending is to stop testing vowels after it is placed. A second vowel probe after a green E is a guess that spends tiles on a question you have largely answered.',
          'That habit is worth stating as a rule, because the instinct runs the other way. Players who see a green tile often treat the row as nearly finished and reach for a word built around the letters they can see, which usually means reusing the vowel they just placed. A green tile is a closed question, and closed questions do not need a second guess spent on them.',
          'The numbers below are worth keeping in mind, because they explain why a green E feels like a large gift: it removes a fifth of the unknown positions in a single tile.'
        ],
        visual: only({
          type: 'stats',
          title: 'What a placed E in slot five leaves open',
          stats: [
            { value: '5', label: 'Positions per word', note: 'Wordle answers are five letters long.' },
            { value: '1', label: 'Positions the E settles', note: 'Slot five is closed off entirely.' },
            { value: '4', label: 'Positions still open', note: 'Five minus the settled slot.' },
            { value: '6', label: 'Guesses available', note: 'Unchanged by where the green tile falls.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Why do so many five-letter words end in E?',
        answer:
          'The silent final E is a common English spelling pattern that marks a long vowel earlier in the word, as in BRAKE and SLIDE. That pattern is what makes the -AKE and -IDE frames feel familiar even when the specific answer is not.'
      },
      {
        question: 'Does an E ending mean the answer has only one vowel?',
        answer:
          'Usually, but not always. ATONE carries A, O and E. Placing the E tells you where one vowel sits; it does not cap how many vowels the answer contains, so treat that as a tendency rather than a rule.'
      }
    ]
  },

  /* ══ 8. 5-letter-words-starting-with-s ═════════════════════════════════════
     Blocks: table, bars, tiles                                                 */
  '5-letter-words-starting-with-s': {
    keyTakeaways: [
      'An S in slot one is a starting point, not a plan — the second letter is what splits the candidate list.',
      'Grouping S-words by the letter that follows S turns one long list into eight small, testable families.',
      'S is a frequent opener letter, so a gray S removes a great deal of the candidate field at once.',
      'Most of the S-starting words opposite finish with E, which pairs this guide with the E-ending frames.'
    ],
    sections: [
      {
        heading: 'Sorting S-words by their second letter',
        paragraphs: [
          'The first tile of a word tells you less than the second, which is a useful thing to know about S-starting answers specifically. Once you know the answer begins with S, the letter in slot two is the decision point that separates a long list into short groups.',
          'The table below organises common S-starting words that way. Each row is a family defined by its second letter, and each family is small enough to hold in your head while you check which letters you have already excluded.',
          'This is also the reason a second guess that shares no letters with S is worth playing. Knowing the answer begins with S tells you nothing about slots two through five, so the fastest route to the second letter is to test five fresh letters rather than to guess another S-word.'
        ],
        visual: only({
          type: 'table',
          title: 'S-words grouped by the letter in slot two',
          headers: ['Second letter', 'Common answers'],
          rows: [
            { label: 'S + C', value: 'SCALE, SCENE, SCOPE, SCOUT', highlight: true },
            { label: 'S + H', value: 'SHARE, SHINE, SHORE, SHOUT', highlight: true },
            { label: 'S + L', value: 'SLATE, SLIDE, SLOPE, SLEEP', highlight: true },
            { label: 'S + P', value: 'SPACE, SPINE, SPOKE, SPORT' },
            { label: 'S + T', value: 'STONE, STARE, STAIR, STORM' },
            { label: 'S + A', value: 'SAUCE, SALAD, SAINT' },
            { label: 'S + M', value: 'SMILE, SMOKE, SMART' },
            { label: 'S + N', value: 'SNAKE, SNORE, SNEAK' }
          ],
          caption: 'Five families of four and three of three: twenty-nine answers, each readable from the table.'
        })
      },
      {
        heading: 'Where the S-starting families tend to end',
        paragraphs: [
          'There is a second pattern inside these lists that is worth counting. Read the endings column-wise and most of the words finish on E: SCALE, SCENE, SCOPE, SHARE, SHINE, SHORE, SLATE, SLIDE, SLOPE, SPACE, SPINE, SPOKE, STONE, STARE, SAUCE, SMILE, SMOKE, SNAKE and SNORE.',
          'Nineteen of the twenty-nine words listed above end in E, and ten do not. That is a fact about the words on this page rather than a law of English, but it is a strong enough tendency to shape how you play an S-starting board: a green S in slot one plus a green E in slot five leaves three positions and two or three frames.',
          'Counting it out is the point. Patterns like this are cheap to verify by reading the list, and they are the difference between a candidate list you remember and one you have to rebuild from scratch every game.'
        ],
        visual: only({
          type: 'bars',
          title: 'How the twenty-nine listed S-words end',
          max: 19,
          unit: ' words',
          bars: [
            { label: 'Final tile is E', value: 19, tone: 'success', note: 'SCALE, SCENE, SCOPE, SHARE, SHINE and fourteen more.' },
            { label: 'Final tile is something else', value: 10, tone: 'neutral', note: 'SCOUT, SHOUT, SLEEP, SPORT, STAIR, STORM, SALAD, SAINT, SMART, SNEAK.' }
          ],
          caption: 'Both counts come from the table above; both can be verified by reading it.'
        })
      },
      {
        heading: 'Playing an S-starting board',
        paragraphs: [
          'The board below shows an S-starting answer resolved with three guesses. The first row confirms the S and the E immediately, which means the answer is already inside one of the families above.',
          'The second row tests the open middle slots with letters that have not been used, and two of them land. By the third row the candidate list is short enough to commit.',
          'The habit that makes this work is resisting the urge to guess another S-word on the second row. When S is confirmed, every other tile in your second guess should be spent on letters you have not seen, because the S no longer tells you anything new.',
          'There is a related trap in the third row. Once two letters are placed, the temptation is to guess a whole word from the families above rather than a word that tests something. That is fine when the family is down to two or three members and wrong when it still has four, which is exactly the situation the bars above describe.'
        ],
        visual: only({
          type: 'tiles',
          title: 'An S-starting answer in three rows',
          rows: [
            { word: 'SLATE', states: ['correct', 'absent', 'absent', 'present', 'correct'], note: 'S and E are confirmed; T is present but sits in the wrong slot.' },
            { word: 'SPOUT', states: ['correct', 'absent', 'correct', 'absent', 'present'], note: 'O takes slot three; P and U are ruled out.' },
            { word: 'STONE', states: ['correct', 'correct', 'correct', 'correct', 'correct'], note: 'T moves into slot two to close the board.' }
          ],
          caption: 'Illustrative board. The second row shares only one letter with the first, which is the point.'
        })
      }
    ],
    faqs: [
      {
        question: 'Why does a gray S matter so much?',
        answer:
          'A gray S is one of the most informative single tiles you can receive, because S begins a large share of five-letter words. Ruling it out removes that whole family, and the same applies to a green S narrowing you into one.'
      },
      {
        question: 'Should my second guess start with S after an S is confirmed?',
        answer:
          'No. Once S is confirmed in slot one, a second S-word spends its first tile repeating something you already know. Spend that tile on a fresh letter instead, and use later guesses to test the families above.'
      }
    ]
  },

  /* ══ 9. how-to-win-quordle-every-time ══════════════════════════════════════
     Blocks: steps, tiles, stats                                                */
  'how-to-win-quordle-every-time': {
    keyTakeaways: [
      'Quordle gives you <strong>nine guesses for four words</strong>, which is thirty-six tiles of feedback rather than five.',
      'Buy information that serves all four boards: a letter ruled out on one board is ruled out on every board.',
      'Never spend a guess on a single board while the other three still have untested letters.',
      'Commit to individual boards only when a board is down to two candidates and the others are already close.'
    ],
    sections: [
      {
        heading: 'Why four boards change how you open',
        paragraphs: [
          'A Wordle guess tests five letters against one answer. A Quordle guess tests the same five letters against four answers simultaneously, so every elimination is worth up to four times as much. That single fact is what separates a good Quordle strategy from a Wordle strategy played four times over.',
          'The opening should therefore be built for breadth rather than for any one board. Two openers that share no letters give you ten distinct letters of feedback across all four boards before you have to make a single board-specific decision.',
          'The steps below are the order of operations. They are written to keep all four boards moving at the same time, because a Quordle run is lost by finishing one board early and then running out of guesses on the other three.'
        ],
        visual: only({
          type: 'steps',
          title: 'The order of operations across four boards',
          steps: [
            { title: 'Open broad, not deep', body: 'First guess: one fixed word with five distinct letters. Second guess: a word that shares none of those letters. Ten letters of feedback across four boards.' },
            { title: 'Read all four boards before choosing the third guess', body: 'Write down which letters each board has confirmed and which it has excluded. A letter excluded on a board is excluded permanently on that board.' },
            { title: 'Keep buying shared information while three boards are open', body: 'A guess that tests four fresh letters across the open boards is worth more than a guess that tries to finish one board. Keep spending until at least two boards are near-solved.' },
            { title: 'Solve the closest board first, but only when it is close', body: 'Once a board is down to two candidates, commit. Finishing it removes a board from your working memory and frees the remaining guesses for the rest.' },
            { title: 'Finish in order of certainty, not in order of position', body: 'Work from the most constrained board to the least. The last board is often solved by elimination rather than by a fresh guess.' }
          ]
        })
      },
      {
        heading: 'One row, four answers',
        paragraphs: [
          'The board below shows what makes Quordle feel different: a single guess produces four independent colour readings. The same word is simultaneously wrong on one board and nearly right on another.',
          'Reading those four results efficiently is the skill. The useful output of a row is a short list — letters confirmed per board, letters excluded per board — and a letter only needs one board to still be viable for you to keep using it.',
          'Notice how much of the value is in the exclusions. On the illustrative row below, three of the ten letters tested are ruled out across boards, and each exclusion narrows four candidate lists at once.'
        ],
        visual: only({
          type: 'tiles',
          title: 'The same guess, read four ways',
          rows: [
            { word: 'BOARD 1 — SLATE', states: ['absent', 'absent', 'present', 'absent', 'correct'], note: 'L and E are live here.' },
            { word: 'BOARD 2 — SLATE', states: ['correct', 'absent', 'absent', 'absent', 'absent'], note: 'S is locked in slot one; L, A, T and E are out.' },
            { word: 'BOARD 3 — SLATE', states: ['absent', 'present', 'present', 'present', 'absent'], note: 'L, A and T are present; none is in the right slot.' },
            { word: 'BOARD 4 — SLATE', states: ['absent', 'absent', 'absent', 'absent', 'absent'], note: 'Five letters removed from this board in one row.' }
          ],
          caption: 'Illustrative readings of a single guess against four boards. Note how different the four results are for the same word.'
        })
      },
      {
        heading: 'The arithmetic behind nine guesses',
        paragraphs: [
          'Quordle hands you four boards and nine guesses, which is thirty-six tiles of feedback — seven times the tiles a single Wordle round gives you. The trap is that it is also four times the problem, and the ratio only works in your favour if the early guesses serve every board.',
          'Counting this way makes the strategy obvious. If your first two guesses share no letters, you have tested ten letters on all four boards. If instead you spend guesses two and three on board one, you have tested ten letters on one board and five on the others.',
          'The numbers below are the ones to keep in view when a single board looks tempting. Nine guesses is generous only while the boards are being solved together.'
        ],
        visual: only({
          type: 'stats',
          title: 'The Quordle budget',
          stats: [
            { value: '4', label: 'Boards per puzzle', note: 'Each with its own answer.' },
            { value: '9', label: 'Guesses per puzzle', note: 'Shared across all four boards.' },
            { value: '36', label: 'Tiles of feedback', note: 'Nine guesses times four boards.' },
            { value: '10', label: 'Letters covered by two openers', note: 'Two five-letter openers sharing no letters.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Can I use the same opener in Quordle as in Wordle?',
        answer:
          'Yes, and you generally should. A fixed opener with five distinct letters is the right first move on four boards for the same reason it is right on one, and keeping the same word makes its feedback pattern familiar.'
      },
      {
        question: 'What if one board is solved early?',
        answer:
          'That is the good case. A solved board is information you no longer need to hold, and the remaining guesses should be split between the boards with the fewest live candidates rather than rotated evenly.'
      }
    ],
    howToSteps: [
      { name: 'Open with one fixed five-letter word', text: 'Play a single opener containing five distinct letters, such as SLATE or CRANE, against all four boards at once so every board receives the same first reading.' },
      { name: 'Play a second word that shares no letters with the first', text: 'Choose a second guess whose five letters were absent from the opener, so that after two guesses ten different letters have been tested on all four boards.' },
      { name: 'Record the exclusions per board', text: 'Write down, for each of the four boards, which letters are confirmed and which are excluded. Exclusions are permanent, and they narrow four candidate lists at once.' },
      { name: 'Keep testing shared letters while three boards are open', text: 'Resist finishing one board early. While three boards still have untested letters, a guess that tests new letters on all of them is worth more than a guess that could finish one.' },
      { name: 'Commit to the most constrained board first', text: 'When a board is reduced to two or three candidates, guess the most likely one. Solving it frees the remaining guesses for the other boards.' },
      { name: 'Finish the last board by elimination', text: 'On the final board, list every word consistent with the confirmed letters, the excluded letters and the positions already placed, then work from the most common candidate.' }
    ]
  },

  /* ══ 10. nerdle-strategy-guide ═════════════════════════════════════════════
     Blocks: tiles (equation variant), steps, bars                              */
  'nerdle-strategy-guide': {
    keyTakeaways: [
      'A Nerdle equation is <strong>eight characters</strong>: six digits, one operator and one equals sign.',
      'The equals sign and the operator are the highest-value early confirmations, because they constrain the whole structure rather than a single digit.',
      'Digits repeat far more often in equations than letters repeat in words, so a green digit does not mean you have found a unique character.',
      'Work from structure to digits: confirm the operator and the equals sign, then narrow the numbers on each side.'
    ],
    sections: [
      {
        heading: 'Reading an equation as eight tiles',
        paragraphs: [
          'Nerdle is a Wordle-shaped game with a different alphabet. A valid equation is exactly eight characters long, and those eight characters are six digits, one operator from the four arithmetic signs, and one equals sign.',
          'That fixed shape is a large gift, because it means your first guess can be evaluated as structure before it is evaluated as arithmetic. A guess that confirms the operator and the equals sign has already told you which kind of equation you are solving, regardless of which digits come back green.',
          'The tile row below shows an eight-character guess read character by character. The operator and the equals sign land correct, one digit is confirmed in place, and one digit is ruled out entirely — which is a normal first-row result and already a large amount of structure.'
        ],
        visual: only({
          type: 'tiles',
          variant: 'equation',
          title: 'An eight-character guess, read character by character',
          rows: [
            {
              word: '12+34=46',
              states: ['present', 'present', 'correct', 'correct', 'absent', 'correct', 'absent', 'present'],
              note: 'The operator and the equals sign are both correct; 4 is ruled out; 1, 2 and 6 are present.'
            },
            {
              word: '25+36=61',
              states: ['correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'correct'],
              note: 'Second row closes the board.'
            }
          ],
          caption: 'Illustrative equations. Both are eight characters and both are arithmetically valid; the second is the answer here.'
        })
      },
      {
        heading: 'Splitting eight characters by role',
        paragraphs: [
          'Six of the eight characters in a Nerdle equation are digits. That leaves only two structural characters, and they are the two that carry the most information, because the operator determines what kind of relationship holds between the two numbers.',
          'Counting the roles is a quick way to see where a guess is spending its tiles. A guess with six digits and no operator still tests six digits, but it cannot confirm structure — and structure is the cheaper thing to confirm because there are only a handful of possibilities.',
          'The bar chart below splits the eight characters of the illustrative equation by role. It is a reminder that a Nerdle guess is not six independent facts; it is a small structure with six digit slots hanging off it.'
        ],
        visual: only({
          type: 'bars',
          title: 'The eight characters of 12+34=46, by role',
          max: 8,
          unit: ' characters',
          bars: [
            { label: 'Digits', value: 6, tone: 'primary', note: '1, 2, 3, 4, 4 and 6.' },
            { label: 'Operator', value: 1, tone: 'accent', note: 'The + sign, in slot three.' },
            { label: 'Equals sign', value: 1, tone: 'success', note: 'The = sign, in slot six.' }
          ],
          caption: 'Six digits plus one operator plus one equals sign is eight characters, always.'
        })
      },
      {
        heading: 'Working from structure to digits',
        paragraphs: [
          'The efficient order in Nerdle runs opposite to the order in Wordle. In Wordle you start by testing letters; in Nerdle you start by confirming which arithmetic operation you are looking at, because that single character tells you how the two sides of the equation relate.',
          'Once the operator and the equals sign are placed, the problem becomes two independent number tasks: what the left side evaluates to, and which digits produce that value. Those two tasks are much easier than the original because they no longer interact.',
          'The steps below are the sequence. They assume a first guess that produces the usual mix of greens, yellows and grays rather than a lucky solve.'
        ],
        visual: only({
          type: 'steps',
          title: 'Structure first, digits second',
          steps: [
            { title: 'Play a balanced first equation', body: 'Use a valid equation that includes one of each structural character plus six different digits, so the first row tests both structure and digits at once.' },
            { title: 'Place the operator and the equals sign', body: 'Treat a green operator as the most valuable result on the board. It tells you whether the equation adds, subtracts, multiplies or divides before you know any number.' },
            { title: 'Rule out digits rather than confirming them', body: 'A gray digit is permanently excluded. Because equations repeat digits often, an exclusion is worth more than a single green confirmation.' },
            { title: 'Solve each side as a number', body: 'With the operator known, work out what the right-hand side must be, then find digits that produce it on the left. The two sides can be handled separately.' },
            { title: 'Check your arithmetic before submitting', body: 'A Nerdle guess must be a true equation to be accepted. Verify the calculation after placing your tiles, not before, so a wrong guess is not wasted.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'How long is a Nerdle equation?',
        answer:
          'Eight characters: six digits, one operator and one equals sign. Exactly one equals sign appears, and it always sits between the two sides rather than at either end.'
      },
      {
        question: 'Are repeated digits allowed in Nerdle?',
        answer:
          'Yes, and they are common. An equation such as 12+34=46 contains two 4s, so a single green 4 does not mean you have accounted for every 4 in the answer.'
      }
    ]
  },

  /* ══ 11. how-to-play-betweenle ════════════════════════════════════════════
     Blocks: steps, bars, stats                                                 */
  'how-to-play-betweenle': {
    keyTakeaways: [
      'Betweenle gives you one clue per guess — <strong>higher or lower</strong> in alphabetical order — and nothing about letters.',
      'The optimal move is always a word near the middle of the surviving range, not a word you like.',
      'Every guess should cut the range roughly in half; that is what makes a large dictionary collapse in a few turns.',
      'Track the upper and lower bounds explicitly. The window, not the last guess, is the thing you are solving.'
    ],
    sections: [
      {
        heading: 'Why halving beats guessing',
        paragraphs: [
          'Betweenle hands you exactly one bit of information per guess: the answer is alphabetically above your word or below it. A binary search makes that bit worth the maximum possible amount, because it discards half of the surviving range every time.',
          'The arithmetic is what makes the strategy non-optional. Take any starting range and imagine it halved repeatedly. After one guess the window is half its original size; after two, a quarter; after ten, roughly a thousandth. That is the difference between a problem that sounds impossible and one that closes in a handful of turns.',
          'The counter-move to avoid is guessing a familiar word because it is familiar. A word near the start of the alphabet when the window sits in the middle of it throws away most of the range you could have discarded.'
        ],
        visual: only({
          type: 'bars',
          title: 'A halving window, starting from 1,024 words',
          max: 512,
          unit: ' words',
          bars: [
            { label: 'After 1 guess', value: 512, tone: 'primary', note: 'Half the range discarded.' },
            { label: 'After 2 guesses', value: 256, tone: 'primary', note: 'A quarter of the original range remains.' },
            { label: 'After 3 guesses', value: 128, tone: 'primary', note: 'An eighth.' },
            { label: 'After 4 guesses', value: 64, tone: 'success', note: 'A sixteenth — small enough to read off by eye.' },
            { label: 'After 5 guesses', value: 32, tone: 'success', note: 'A thirty-second.' }
          ],
          caption: 'Illustrative halving from a 1,024-word range. Every bar is the previous one divided by two; ten halvings take 1,024 down to a single word.'
        })
      },
      {
        heading: 'The order of operations',
        paragraphs: [
          'The strategy is short enough to state as a sequence, and the sequence matters because the later steps only work if the earlier ones were followed. Guessing a word you like before establishing a midpoint window means the bounds you record afterwards are not actually centred.',
          'The single most important step is the third one. Betweenle rewards looking up the midpoint rather than recalling it, because a word that is close to the middle of the window and a word that feels like the middle of the window are often not the same word.'
        ],
        visual: only({
          type: 'steps',
          title: 'Working the window',
          steps: [
            { title: 'Start near the middle of the alphabet', body: 'A word beginning with M or N sits at the centre of the full dictionary, so the first guess cuts the range in half whichever way the answer falls.' },
            { title: 'Record both bounds after every guess', body: 'The upper bound is the lowest word you have been told is too high; the lower bound is the highest word you have been told is too low. Write both down rather than remembering the last guess.' },
            { title: 'Guess the midpoint of the surviving window', body: 'Not the midpoint of the alphabet and not a favourite word. The useful guess is the one closest to the middle of the range the bounds describe.' },
            { title: 'Switch to letters once the bounds share a prefix', body: 'When both bounds begin with the same three letters, the first letters have stopped discriminating. Move to matching the fourth letter, then the fifth.' },
            { title: 'Let the bounds choose the final answer', body: 'Near the end, the remaining candidates are usually adjacent entries in the dictionary. Pick the word between the two bounds rather than guessing a word from memory.' }
          ]
        })
      },
      {
        heading: 'What the game is and is not telling you',
        paragraphs: [
          'Betweenle is unusual among daily puzzles because its clue has nothing to do with spelling. A guess that shares four letters with the answer tells you no more than a guess that shares none, unless it also happens to sit at a better position in the alphabet.',
          'That single fact accounts for most of the mistakes new players make. Letter overlap feels like progress, and in Betweenle it is not. The only measurement that matters is where your guess sits inside the surviving window.'
        ],
        visual: only({
          type: 'stats',
          title: 'The Betweenle information budget',
          stats: [
            { value: '2', label: 'Bounds tracked', note: 'An upper bound and a lower bound, tightened after every guess.' },
            { value: '1', label: 'Clue per guess', note: 'Higher or lower in alphabetical order — nothing about letters.' },
            { value: '10', label: 'Halvings to pass 1,024 words', note: 'Two to the power of ten is 1,024, so ten midpoint guesses reduce a thousand-word range to one word.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Does guessing a word with the same first letter as the answer help in Betweenle?',
        answer:
          'Only if it also lands near the middle of the surviving range. Betweenle compares words alphabetically, so sharing letters with the answer is irrelevant unless it moves the bound in a useful direction.'
      },
      {
        question: 'What is the best first guess in Betweenle?',
        answer:
          'A word beginning with M or N, because it sits near the centre of the dictionary and therefore halves the range on the first guess whichever answer it produces.'
      }
    ],
    howToSteps: [
      { name: 'Make your first guess near the middle of the alphabet', text: 'Type a word beginning with M or N so that the first higher-or-lower result discards close to half of the possible words.' },
      { name: 'Record the upper and lower bound separately', text: 'Keep two numbers or two words: the lowest guess you have been told is too low, and the highest guess you have been told is too high. The answer sits between them.' },
      { name: 'Choose a word near the midpoint of the surviving window', text: 'Estimate where the middle of your current range falls alphabetically and guess a real word close to that point, rather than a word you find memorable.' },
      { name: 'Keep halving until the bounds share a prefix', text: 'Repeat the midpoint guess, updating one bound each time. When both bounds begin with the same two or three letters, those letters are settled.' },
      { name: 'Shift from first letters to later letters', text: 'Once the shared prefix is fixed, compare the next letter instead, moving forward one position each time the bounds agree.' },
      { name: 'Pick the word between the last two bounds', text: 'When the remaining candidates are adjacent in the alphabet, name the word that sits between your final upper and lower bound instead of guessing from memory.' }
    ]
  },

  /* ══ 12. globle-strategy-guide ════════════════════════════════════════════
     Blocks: table, steps, stats                                                */
  'globle-strategy-guide': {
    keyTakeaways: [
      'Globle returns a <strong>proximity reading</strong> per guess instead of a distance, so each guess is a hot-or-cold signal rather than a measurement.',
      'Open with one large, obvious country from a different continent each time until the map turns warm.',
      'Two warm readings from different directions bracket the target far faster than two warm readings from the same neighbourhood.',
      'Once you are hot, stop naming large countries and start working the immediate neighbours.'
    ],
    sections: [
      {
        heading: 'Opening by region instead of by country',
        paragraphs: [
          'The first Globle guess is not trying to be right; it is trying to establish which part of the map is warm. That makes large, unambiguous countries the useful opening moves, because a proximity reading on a large country covers more ground than the same reading on a small island.',
          'The table below lists large countries by region. One guess per region tells you which continent you are working in, and after that the large countries are no longer useful — you want the ones next door.',
          'This is the stage where new players waste guesses. Naming small countries before the region is known produces a cold reading that narrows almost nothing, because a small country being cold does not tell you much about its neighbours.'
        ],
        visual: only({
          type: 'table',
          title: 'Large countries to test the map with',
          headers: ['Region', 'Large countries worth testing first'],
          rows: [
            { label: 'North America', value: 'Canada, United States, Mexico', highlight: true },
            { label: 'South America', value: 'Brazil, Argentina, Peru', highlight: true },
            { label: 'Europe', value: 'France, Germany, Spain, Sweden', highlight: true },
            { label: 'Africa', value: 'Algeria, Egypt, Nigeria, South Africa', highlight: true },
            { label: 'Asia', value: 'Russia, India, China, Kazakhstan', highlight: true },
            { label: 'Oceania', value: 'Australia, New Zealand, Papua New Guinea' }
          ],
          caption: 'One guess from each region establishes the continent; after that, work the neighbours rather than the largest countries.'
        })
      },
      {
        heading: 'Bracketing the target from two directions',
        paragraphs: [
          'A single warm reading tells you that you are close and nothing about which way to move. Two warm readings from different directions do something a single reading cannot: they intersect.',
          'The procedure is to hold one warm country fixed as an anchor and move in one direction until the reading goes cold, then move back and try a different direction from the same anchor. Three or four readings around one anchor surround the target much more tightly than five readings scattered across a continent.',
          'The same logic applies to islands and coastlines. A coastline reading is ambiguous in one direction — out to sea — so a coastal guess effectively gives you fewer directions to search than an inland one.'
        ],
        visual: only({
          type: 'steps',
          title: 'From warm reading to answer',
          steps: [
            { title: 'Establish the region with a large country', body: 'Guess one large country per region until a reading comes back warm. That identifies the continent you are working in.' },
            { title: 'Choose the warmest guess as your anchor', body: 'Take the country that produced the strongest proximity reading and stop moving across the map. Everything from here happens around this anchor.' },
            { title: 'Move one step in one direction until it cools', body: 'Guess a neighbour, then that neighbour\'s neighbour, in a single direction. Stop as soon as the reading drops — you have found an edge of the warm zone.' },
            { title: 'Return to the anchor and try a different direction', body: 'Repeat the outward walk on a different side. Two edges found from the same anchor bracket the target between them.' },
            { title: 'Search the intersection, not the coast', body: 'Once two directions have cooled, the paper target lies between them. Work the inland countries at that intersection before trying coastal ones.' }
          ]
        })
      },
      {
        heading: 'Reading proximity without numbers',
        paragraphs: [
          'Globle does not hand you a distance in kilometres, which changes how you should record each guess. What you get is a colour-coded closeness signal, so the useful record is not a measurement but a set of directions: which neighbours are warmer, which are colder, and roughly where the warm zone ends.',
          'That makes the notebook more useful than the memory. Two readings from opposite sides of the target define a band; a third reading from a different angle turns the band into an area.',
          'The figures below describe what a guess costs and what it returns, which is the accounting that makes opening by region worthwhile.'
        ],
        visual: only({
          type: 'stats',
          title: 'What each guess costs and returns',
          stats: [
            { value: '1', label: 'Country per guess', note: 'Exactly one country is named each turn.' },
            { value: '1', label: 'Proximity reading per guess', note: 'A closeness signal, not a distance in kilometres.' },
            { value: '2', label: 'Directions to bracket the target', note: 'Two warm readings from opposite sides place the target between them.' },
            { value: '0', label: 'Numbers to memorise', note: 'The map shows warmth, so track directions rather than measurements.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'What is the best opening guess in Globle?',
        answer:
          'A large country in a region you have not tested yet. Opening moves exist to find out which part of the map is warm, and a large country produces a reading that covers more ground than a small one.'
      },
      {
        question: 'Should I guess the country next to my warmest guess?',
        answer:
          'Yes, but only to find the edge of the warm zone. Walk outward in one direction until the reading cools, then return to the anchor and walk a different direction, so two edges bracket the target.'
      }
    ]
  },

  /* ══ 13. worldle-strategy-guide ═══════════════════════════════════════════
     Blocks: steps, table, stats                                                */
  'worldle-strategy-guide': {
    keyTakeaways: [
      'Worldle returns <strong>three</strong> clues per guess: distance in kilometres, a direction arrow and a shape-proximity percentage.',
      'The outline identifies the region; the arrow and distance do the closing.',
      'A high proximity percentage with a large distance is a strong signal that you are on the right landmass.',
      'Two guesses from different directions bracket the target far more tightly than two guesses from the same side.'
    ],
    sections: [
      {
        heading: 'What each clue constrains',
        paragraphs: [
          'Worldle is unusual in returning three independent clues at once, and each one constrains a different thing. Mixing them up is the main reason a solve stalls: players treat the distance as if it were the proximity percentage, or ignore the arrow because the outline looked familiar.',
          'The table below separates the three. The outline is a regional clue — it tells you where in the world you probably are before you know anything about distance. The distance and arrow are both positional clues and only become useful once you have a rough region. The percentage is a shape clue and works alongside the outline rather than replacing it.',
          'Reading them in that order is what keeps a guess productive. A guess outside the region suggested by the outline spends a turn producing a large distance and a pointless arrow.'
        ],
        visual: only({
          type: 'table',
          title: 'The three Worldle clues and what each one narrows',
          headers: ['Clue', 'What it constrains'],
          rows: [
            { label: 'Country outline', value: 'The region — coastline shape and overall proportions identify the continent first.', highlight: true },
            { label: 'Distance in kilometres', value: 'How far your guess is from the target, not which country the target is.' },
            { label: 'Direction arrow', value: 'Which way to move from the country you just guessed.' },
            { label: 'Proximity percentage', value: 'How similar the two outlines are, which confirms or contradicts your regional read.' }
          ],
          caption: 'Outline first, then arrow and distance, with the percentage used as a check on the regional read.'
        })
      },
      {
        heading: 'Closing with the arrow',
        paragraphs: [
          'The arrow is the clue that finishes a Worldle board, because it converts a distance into a direction. A guess that sits far away with an arrow pointing west tells you the target is west of a country you have already ruled out — that is a large step in one move.',
          'The sequence below orders the guesses. The important habit is the third step: changing direction from the same anchor rather than starting a fresh search from a new country every turn.'
        ],
        visual: only({
          type: 'steps',
          title: 'From outline to answer',
          steps: [
            { title: 'Name the region from the outline', body: 'Before typing anything, decide which continent the silhouette suggests. Distinctive coastlines resolve this immediately; ambiguous ones at least narrow it to two.' },
            { title: 'Guess a large country in that region', body: 'Use the first guess to confirm the region rather than to be right. A large country gives a distance and arrow that cover more ground than a small one.' },
            { title: 'Follow the arrow from the same anchor', body: 'Keep your last guess as an anchor and move a step in the direction the arrow points. Do not restart from a different country each turn.' },
            { title: 'Change direction once the distance grows', body: 'If moving one way increases the distance, the target is on the other side of the anchor. Reverse the direction instead of continuing.' },
            { title: 'Use the percentage to break ties', body: 'When two candidates are similarly distant, the outline percentage usually separates them, because one shares more coastline shape with the target.' }
          ]
        })
      },
      {
        heading: 'The budget for a Worldle board',
        paragraphs: [
          'Worldle gives you a fixed number of guesses, which makes the ordering above a budget question rather than a matter of taste. The first guess is almost always spent on the region, and the last two are spent closing once the arrow has narrowed things down.',
          'That division is worth committing to before the first guess rather than deciding mid-board. A player who has spent three guesses identifying the region has already lost the flexibility that makes the last two guesses effective, because closing a board requires trying candidates rather than gathering clues.',
          'Counting the clues makes this concrete. Each guess returns three readings, so a three-guess sequence gives you nine readings to work with — which is why an early misread of the outline is expensive rather than fatal.'
        ],
        visual: only({
          type: 'stats',
          title: 'The Worldle budget',
          stats: [
            { value: '6', label: 'Guesses per round', note: 'The standard Worldle allowance.' },
            { value: '3', label: 'Clues returned per guess', note: 'Distance, direction and shape proximity.' },
            { value: '1', label: 'Country named per guess', note: 'One guess, one country, three readings.' },
            { value: '2', label: 'Directions to bracket the target', note: 'Two guesses on opposite sides place the target between them.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'What does the percentage in Worldle measure?',
        answer:
          'It measures how closely the outline of your guess matches the outline of the target country. It is a shape similarity reading, not a measure of distance, so a high percentage with a large distance is possible.'
      },
      {
        question: 'Should I guess large countries first in Worldle?',
        answer:
          'For the first guess or two, yes. A large country covers more ground, so its distance and direction readings are more informative than the same readings from a small one once you have narrowed the region.'
      }
    ]
  },

  /* ══ 14. how-to-solve-a-waffle-puzzle ═════════════════════════════════════
     Blocks: tiles, steps, stats                                                */
  'how-to-solve-a-waffle-puzzle': {
    keyTakeaways: [
      'Waffle allows <strong>15 swaps</strong> but every puzzle can be solved in a minimum of 10, and you earn a star for each swap you have left.',
      'Green tiles are fixed and constrain both the word across and the word down through that cell.',
      'A yellow tile belongs somewhere else in the grid, not merely elsewhere in the same word — that is the main difference from Wordle.',
      'Plan the whole swap sequence before touching a tile; every exploratory swap costs a star.'
    ],
    sections: [
      {
        heading: 'Reading a scrambled grid, state by state',
        paragraphs: [
          'Waffle uses a smaller colour vocabulary than Wordle, and the difference matters. Green means the tile is already in its final position. Yellow means the letter belongs somewhere else in the grid — not simply elsewhere in the word you are looking at, which is where most of the confusion comes from.',
          'The rows below show what that looks like in practice. The first row is mostly yellow, which is the ordinary starting state: the letters exist in the puzzle, they are simply in the wrong cells. The second row is mostly green, which is what a nearly finished grid looks like.',
          'Because green tiles are fixed and each lies at the crossing of a word across and a word down, a single green constrains two words at once. Reading the greens first, before looking at any yellow, is what keeps a swap plan coherent.'
        ],
        visual: only({
          type: 'tiles',
          legend: false,
          title: 'What green and yellow mean in a Waffle grid',
          rows: [
            { word: 'CRANE', states: ['present', 'present', 'correct', 'present', 'absent'], note: 'Mostly yellow: these letters belong elsewhere in the grid.' },
            { word: 'STONE', states: ['correct', 'correct', 'present', 'correct', 'correct'], note: 'Four greens: the word is nearly in place.' }
          ],
          caption: 'Green means the tile is already correct. Yellow means the letter belongs in a different cell somewhere in the grid, which may be a different row or column entirely.'
        })
      },
      {
        heading: 'Swapping for two greens at a time',
        paragraphs: [
          'The difference between a 15-swap solve and a 10-swap solve is almost entirely about how many tiles each swap fixes. A swap moves two tiles, so the best possible swap turns two yellows into two greens — and those are the swaps you should be hunting for before anything else.',
          'The second best class of swap fixes one tile and moves another into a cell where it will be correct after one more swap. Worse than that, a swap that fixes one tile and displaces another is usually a swap you should not make yet.',
          'The steps below are the plan for a board where you cannot see any double-fix swaps immediately, which is the normal case.'
        ],
        visual: only({
          type: 'steps',
          title: 'A swap plan that protects the star rating',
          steps: [
            { title: 'Map every green before moving anything', body: 'Write down which cells are already correct. Each green cell belongs to two words, so it constrains both of them and cannot be moved.' },
            { title: 'Find swaps where two tiles are in each other\'s correct cells', body: 'Those swaps turn two yellows into two greens at once. They are the highest-value moves on the board and should be taken first.' },
            { title: 'Work the crossings before the edges', body: 'A cell at a crossing belongs to two words, so fixing it helps twice. Cells at the ends belong to one word only and are cheapest to leave until last.' },
            { title: 'Move a letter toward its crossing, not its word', body: 'A yellow letter may need to reach a different row entirely. Trace where it belongs in the grid rather than where it belongs in the word you spotted it in.' },
            { title: 'Count swaps before you commit', body: 'You have 15 swaps and a star for each one you have left, so a 10-swap solve is full marks. If a plan needs more than 10, look for a swap that fixes two tiles instead.' }
          ]
        })
      },
      {
        heading: 'The swap arithmetic',
        paragraphs: [
          'Waffle is scored by what you have left, which turns the puzzle into a small optimisation problem rather than a pure word puzzle. The allowance is 15 swaps and the guaranteed solution length is 10, so the gap between those two numbers is exactly the margin you are protecting.',
          'That margin is five swaps, which is also the number of stars available. Framing it as a budget makes the planning habit feel natural: you are not trying to solve the grid, you are trying to solve it inside a fixed number of moves.',
          'The numbers below come from the game\'s own rules. There is no hidden scoring beyond them.'
        ],
        visual: only({
          type: 'stats',
          title: 'Waffle\'s swap allowance',
          stats: [
            { value: '15', label: 'Swaps allowed', note: 'The hard limit for a puzzle.' },
            { value: '10', label: 'Swaps in a minimum solution', note: 'Every Waffle can be solved within this many.' },
            { value: '5', label: 'Swaps of margin', note: 'Fifteen minus ten — the room a plan has to spare.' },
            { value: '5', label: 'Stars available', note: 'You earn a star for every swap remaining, so ten swaps leaves all five.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'How many swaps do you need for five stars in Waffle?',
        answer:
          'Ten or fewer. You are given 15 swaps and earn one star per swap remaining, and every puzzle has a solution within 10 swaps, so a planned 10-swap solve earns all five stars.'
      },
      {
        question: 'What does a yellow tile mean in Waffle?',
        answer:
          'The letter belongs somewhere else in the grid, not just elsewhere in the word where you found it. Because the words cross, a yellow tile may need to move to a different row or column entirely.'
      },
      {
        question: 'Is it ever worth making a swap that fixes nothing?',
        answer:
          'Only as part of a planned sequence where a later swap fixes two tiles. A swap made purely to see what happens costs a star and cannot be undone, which is why the plan should be complete before the first move.'
      }
    ],
    howToSteps: [
      { name: 'Map the green tiles first', text: 'Identify every tile that is already green and write down its cell. Green tiles are fixed, and because words cross each green constrains two words at once.' },
      { name: 'Note which letters are yellow and where they could belong', text: 'A yellow tile means the letter exists in the grid but in the wrong cell. Work out which row or column cell it actually belongs in rather than assuming it stays inside the word you spotted it in.' },
      { name: 'Find swaps that make two greens at once', text: 'Look for two tiles sitting in each other\'s correct cells. Swapping them turns two yellows into two greens in a single move, which is the most efficient move available.' },
      { name: 'Prioritise cells where words cross', text: 'A crossing cell belongs to two words, so fixing it improves both. Leave tiles at the ends of words until last, because they belong to only one word.' },
      { name: 'Plan the full sequence before swapping', text: 'Write out the order of swaps needed to finish the grid. Because you earn a star for every swap remaining, an unplanned exploratory swap costs score directly.' },
      { name: 'Keep the plan within ten swaps', text: 'Every Waffle is solvable in a minimum of ten swaps out of the fifteen allowed. If your plan needs more than ten, look again for a swap that fixes two tiles at once.' }
    ]
  },

  /* ══ 15. how-to-play-contexto ═════════════════════════════════════════════
     Blocks: steps, table, stats                                                */
  'how-to-play-contexto': {
    keyTakeaways: [
      'Contexto ranks every guess by meaning: <strong>rank 1 is the answer</strong>, and larger numbers are less related.',
      'The rank tells you how close you are; it does not tell you which direction to move, so you learn by comparing guesses.',
      'Low-ranked guesses are genuinely useful — they map the neighbourhood of the target rather than wasting a turn.',
      'When the rank stops improving, change the sense of the word rather than the topic.'
    ],
    sections: [
      {
        heading: 'Reading the rank as a distance, not a score',
        paragraphs: [
          'Contexto reports a single number per guess: the rank of your word among all candidate words, ordered by how close each one is in meaning to the secret word. Because the secret word itself occupies rank 1, smaller numbers mean closer and larger numbers mean less related.',
          'Treating that number as a distance is what makes it usable. Each guess is a point in meaning space, and the rank tells you how far that point is from the target. Two guesses with ranks close together are neighbours in that space even if the words look nothing alike.',
          'The table below describes what each part of the rank axis tends to mean. These are qualitative bands over the game\'s own ordering, not score thresholds, and the useful signal is always the movement between your last two guesses rather than the absolute value of either.'
        ],
        visual: only({
          type: 'table',
          title: 'Reading a Contexto rank',
          headers: ['Where the rank sits', 'What it usually means'],
          rows: [
            { label: 'Rank 1', value: 'The answer. Contexto places the secret word at rank 1 by definition.', highlight: true },
            { label: 'Very low single digits', value: 'A near-synonym or a different form of the same idea.', highlight: true },
            { label: 'Low tens to low hundreds', value: 'Same topic, different sense of the word, or a closely related concept.' },
            { label: 'High hundreds to low thousands', value: 'Related only by broad category — you have the theme but not the idea.' },
            { label: 'Very high ranks', value: 'Essentially unrelated in meaning, however similar the letters look.' }
          ],
          caption: 'Qualitative bands over Contexto\'s own ordering. The rank improves when your guess moves closer in meaning, so compare consecutive ranks rather than reading one in isolation.'
        })
      },
      {
        heading: 'Triangulating by meaning',
        paragraphs: [
          'Because the rank gives distance but not direction, you cannot follow a gradient the way you would in a game that shows you which way to move. What you can do is sample the neighbourhood: make a guess, then make a guess that differs from it in one specific way, and read which rank came back closer.',
          'That is what makes low-ranked guesses valuable. A guess at rank several thousand is not a wasted turn if it tells you that the whole category is wrong — a result that rules out more territory than a guess that inches forward by a few places.',
          'The sequence below is the working loop. The third step is the one that separates rapid progress from wandering: change exactly one thing at a time so the rank difference is interpretable.'
        ],
        visual: only({
          type: 'steps',
          title: 'The semantic search loop',
          steps: [
            { title: 'Guess a broad, common word to find the topic', body: 'Start with a word that sits in the middle of a large conceptual area. Its rank tells you whether the target is in that area at all.' },
            { title: 'Follow the direction the rank moves, not the word you liked', body: 'Compare the new rank with the previous one. If it improved, stay in that semantic neighbourhood; if it worsened, move back and try a different neighbour.' },
            { title: 'Change one property of the guess at a time', body: 'Keep the topic fixed and adjust a single dimension — an object rather than a person, a verb rather than a noun, a different register. Changing several things at once makes the rank difference unreadable.' },
            { title: 'Use dead ends as exclusions', body: 'A guess with a very high rank rules out its whole category. Record it, so you do not drift back into the same area several guesses later.' },
            { title: 'Refine the sense once the topic is fixed', body: 'When the rank stops improving, the topic is probably right and the meaning is wrong. Switch from changing the topic to changing the sense of the word.' },
            { title: 'Guess the answer when the rank is very low', body: 'Once a guess sits in the low single digits, the answer is a near-synonym. Guess the most likely candidate rather than continuing to sample.' }
          ]
        })
      },
      {
        heading: 'What one rank reading does and does not tell you',
        paragraphs: [
          'A single rank is a distance and nothing more. It does not say whether the target is more abstract or more concrete, more general or more specific, or whether you are in the right part of speech. That is why Contexto rewards a deliberate comparison loop rather than a long list of guesses.',
          'The cost of a guess is also worth stating. Contexto does not limit how many guesses you make, so the resource being spent is attention rather than attempts — and attention is what a systematic loop protects.'
        ],
        visual: only({
          type: 'stats',
          title: 'The Contexto loop in numbers',
          stats: [
            { value: '1', label: 'Rank of the answer', note: 'The secret word is always rank 1.' },
            { value: '1', label: 'Number reported per guess', note: 'A single semantic rank, with no letter or position clues.' },
            { value: '1', label: 'Property to change per guess', note: 'Adjusting one thing at a time keeps the rank difference readable.' },
            { value: '2', label: 'Readings to compare', note: 'The movement between the last two ranks is the useful signal, not either rank alone.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'What does a rank of 1 mean in Contexto?',
        answer:
          'You have found the answer. Contexto orders every candidate word by how close it is in meaning to the secret word, and the secret word itself occupies rank 1.'
      },
      {
        question: 'Is a guess with a very high rank a waste?',
        answer:
          'No. A high rank rules out an entire conceptual area, which can be more informative than a guess that moves a few places closer. Record it so you do not revisit the same territory later.'
      }
    ],
    howToSteps: [
      { name: 'Open with a broad, common word', text: 'Guess a word that covers a wide conceptual area rather than a specific one, so its rank tells you whether the target is anywhere near that topic.' },
      { name: 'Compare the new rank with your previous rank', text: 'Contexto reports a rank per guess where rank 1 is the answer. The direction the number moves is the signal: a lower number means you moved closer in meaning.' },
      { name: 'Change one property of the word at a time', text: 'Keep the topic the same and alter a single dimension, such as a person instead of an object or a verb instead of a noun, so the change in rank can be attributed to that one change.' },
      { name: 'Record the areas that came back with high ranks', text: 'A guess with a very high rank rules out its whole category. Write it down so that later guesses do not wander back into the same area.' },
      { name: 'Switch from topic to sense once the rank stops improving', text: 'If repeated guesses in the same neighbourhood return similar ranks, the topic is likely right and the meaning is wrong. Change how the word is being used rather than what it is about.' },
      { name: 'Guess the answer once a rank lands in the low single digits', text: 'A rank that low means your guess is a near-synonym of the answer. Name the most likely candidate instead of continuing to sample.' }
    ]
  },

  /* ══ 16. semantle-strategy-guide ══════════════════════════════════════════
     Blocks: bars, steps, table                                                 */
  'semantle-strategy-guide': {
    keyTakeaways: [
      'Semantle reports a <strong>similarity score</strong>, not a rank: higher is closer, and the answer\'s own score is the top of the scale.',
      'A rising score means you are moving in the right direction in meaning. A falling score means change the topic, not the wording.',
      'Scores that barely move when you change the word usually mean the topic is right and the sense is wrong.',
      'Follow the gradient of meaning rather than the shape of the word — spelling is irrelevant to the score.'
    ],
    sections: [
      {
        heading: 'What the score measures',
        paragraphs: [
          'Semantle compares your guess with the secret word using a word-embedding model, which represents every word as a position in a high-dimensional meaning space. The score you see is how closely aligned those two positions are.',
          'The endpoints of the scale are definitional rather than arbitrary. The secret word compared with itself sits at the top of the scale, and a word with no relationship to the target sits at the bottom, near zero. Everything you guess lands somewhere in between.',
          'Unlike Contexto, Semantle reports the score itself rather than a rank among all candidates. That is the more useful of the two readings for following a gradient, because the score of a single guess tells you something on its own — a rank only means something in comparison.'
        ],
        visual: only({
          type: 'bars',
          title: 'The endpoints of the similarity scale',
          max: 100,
          unit: '%',
          bars: [
            { label: 'The secret word compared with itself', value: 100, tone: 'success', note: 'The top of the scale: identical meaning.' },
            { label: 'A word unrelated to the target', value: 0, tone: 'neutral', note: 'The bottom of the scale: no relationship in meaning.' }
          ],
          caption: 'The two ends of the scale are fixed by definition. Every real guess lands between them, and the movement between guesses is the useful signal.'
        })
      },
      {
        heading: 'Reading a score that will not move',
        paragraphs: [
          'The frustrating part of Semantle is not the low scores, it is the scores that stay put. A guess that scores almost exactly the same as the previous one is telling you something specific: you have found the right area of meaning and the wrong word within it.',
          'That is a different problem from being in the wrong area, and it needs a different response. Changing topic when the score is stuck wastes the position you have built; changing the sense of the word when the score is stuck is what breaks the plateau.',
          'The table below maps each pattern of movement to the change it calls for. Read it as a decision table applied after every guess, not as a description of the scale.'
        ],
        visual: only({
          type: 'table',
          title: 'What the movement between scores tells you to change',
          headers: ['Reading', 'What to change next'],
          rows: [
            { label: 'Score rises', value: 'You are moving the right way. Stay in this area of meaning and refine the word rather than the topic.', highlight: true },
            { label: 'Score falls', value: 'Wrong direction. Move back toward the previous guess and try a different neighbour instead of pushing further.' },
            { label: 'Score barely moves', value: 'Same concept, wrong sense. Change the part of speech or the specific meaning, not the subject.' },
            { label: 'Score close to zero', value: 'Unrelated domain. Abandon the current topic entirely and pick a different starting word.' }
          ],
          caption: 'A decision table for the step after each guess. The direction of movement is more informative than the absolute value.'
        })
      },
      {
        heading: 'Following the gradient uphill',
        paragraphs: [
          'Semantle rewards a hill-climbing loop: keep the guess that scored better and vary one thing about it, then keep whichever variation improves the score again. Because the score is a number rather than a rank, each step is directly comparable with the last.',
          'The steps below are that loop written out. The discipline that makes it work is varying one property at a time — a synonym swap, a change of register, a move from a general term to a specific one.',
          'The trap to avoid is guessing a word because it looks like the target. The score does not read letters, so a near-miss spelling scores no better than an unrelated word of the same length.'
        ],
        visual: only({
          type: 'steps',
          title: 'Hill-climbing the similarity score',
          steps: [
            { title: 'Open with a common, high-frequency word', body: 'A frequent word usually has a well-populated neighbourhood, so its score gives you a usable starting direction rather than a flat zero.' },
            { title: 'Keep the better-scoring word as your new base', body: 'After two guesses, discard the worse one and treat the better one as the position to improve from. Do not average the two or split the difference.' },
            { title: 'Vary one property at a time', body: 'Change a single dimension — synonym, specificity, part of speech, register — and compare the new score with the base. One change at a time is what makes the score difference readable.' },
            { title: 'When the score stalls, change the sense', body: 'A plateau means the topic is right and the meaning is wrong. Look for a different sense of the same idea rather than a different idea.' },
            { title: 'Guess the answer once the score is very high', body: 'At the top of the scale the remaining candidates are near-synonyms. Name the most likely one instead of continuing to climb.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Why does a Semantle guess that looks similar score low?',
        answer:
          'The score compares meaning, not spelling. A word that looks like the target but means something different sits far away in the embedding space, so it scores near the bottom of the scale no matter how similar the letters are.'
      },
      {
        question: 'What does it mean when two different guesses score almost the same?',
        answer:
          'That they occupy nearly the same place in meaning space. You have found the right topic and the wrong word within it, so the next guess should change the sense of the word rather than the subject.'
      }
    ]
  },

  /* ══ 17. how-to-get-better-at-word-games ══════════════════════════════════
     Blocks: stats, steps, table                                                */
  'how-to-get-better-at-word-games': {
    keyTakeaways: [
      'The habit that transfers between games is asking what a guess <strong>rules out</strong>, not what it might be.',
      'Practice on archives, where there is no streak to protect, and the same decision costs nothing to get wrong.',
      'Different games constrain different things — letters, positions, order, meaning — so identify the constraint before choosing a strategy.',
      'Reviewing a finished board teaches more than playing an extra one.'
    ],
    sections: [
      {
        heading: 'Every daily game constrains something different',
        paragraphs: [
          'It is tempting to treat puzzle games as one skill with different skins. They are not. Each game constrains a different property of the answer, and the strategy that works in one is wasted in another where the constraint is unrelated to letters.',
          'The table below sets out what each common game actually gives you feedback about. Once you can name the constraint, the strategy follows: if the feedback is about position, you are solving a placement problem; if it is about meaning, you are solving a search problem.',
          'This is the reason a strong Wordle player can be weak at Semantle. The transferable skill is not letter knowledge — it is the habit of asking what the last piece of feedback eliminated.'
        ],
        visual: only({
          type: 'table',
          title: 'What each game actually tells you about',
          headers: ['Game', 'The constraint its feedback describes'],
          rows: [
            { label: 'Wordle', value: 'Letters and their positions in a five-letter word.', highlight: true },
            { label: 'Quordle', value: 'The same letter-and-position constraint, but against four answers at once.' },
            { label: 'Waffle', value: 'The placement of letters across a grid of crossing words.' },
            { label: 'Betweenle', value: 'Alphabetical order only — no letter or position feedback at all.' },
            { label: 'Nerdle', value: 'The structure and digits of an arithmetic equation.' },
            { label: 'Globle and Worldle', value: 'Geographic proximity and direction.' },
            { label: 'Contexto and Semantle', value: 'Meaning, with no reference to spelling.' },
            { label: 'Colordle', value: 'Three independent numeric colour channels.' }
          ],
          caption: 'Name the constraint before choosing a strategy: the same elimination habit applies, but to a different property.'
        })
      },
      {
        heading: 'The habits that transfer',
        paragraphs: [
          'Across all of them, four habits do the work. None of them is a trick, and all of them are things you can practise deliberately on today\'s board.',
          'The first is elimination before commitment. The second is reading feedback as a set of exclusions rather than as a hint about the answer. The third is keeping the board\'s constraint in mind rather than the game\'s theme. The fourth is practising where mistakes are free.',
          'The steps below turn those into a routine you can apply to any daily puzzle you play.'
        ],
        visual: only({
          type: 'steps',
          title: 'A routine that carries across games',
          steps: [
            { title: 'Name the constraint before you guess', body: 'Decide whether the feedback you receive will be about letters, positions, order, numbers or meaning. The answer determines what a good first guess even is.' },
            { title: 'Write down what each guess eliminated', body: 'Keep a short list of exclusions rather than a memory of guesses. Eliminations are permanent and they are the part you can actually reason from.' },
            { title: 'Prefer information while the field is wide', body: 'Early guesses should buy knowledge. Only switch to guessing the answer when the remaining candidates are few enough to enumerate.' },
            { title: 'Practise on archives, not on streaks', body: 'Archive puzzles carry no record, so a deliberate mistake costs nothing. Use them to test an approach you would not risk on today\'s board.' },
            { title: 'Review one finished game before starting another', body: 'Look at which guess contributed least and why. Identifying the weak guess is more informative than playing an additional puzzle.' }
          ]
        })
      },
      {
        heading: 'The arithmetic underneath every daily puzzle',
        paragraphs: [
          'Almost every game in this family is built from the same two numbers: how many guesses you are given, and how many slots each guess tests. Those two numbers define the entire information budget you are working inside.',
          'Knowing them changes how you spend early guesses. A game that gives you four boards and nine guesses is asking for broadly useful guesses; a game that gives you six guesses at five slots each is asking you to spend the first two buying information and the rest closing.'
        ],
        visual: only({
          type: 'stats',
          title: 'The budgets of the most common daily games',
          stats: [
            { value: '6', label: 'Wordle guesses', note: 'Five letters tested per guess.' },
            { value: '9', label: 'Quordle guesses', note: 'Shared across four boards.' },
            { value: '4', label: 'Quordle boards', note: 'Nine guesses times four boards is thirty-six tiles of feedback.' },
            { value: '8', label: 'Nerdle characters', note: 'Six digits, one operator and one equals sign.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Do skills from one daily word game transfer to another?',
        answer:
          'The habit of eliminating before committing transfers to every game. Letter knowledge does not: in Betweenle the feedback is alphabetical order, and in Contexto or Semantle it is meaning, so spelling is irrelevant.'
      },
      {
        question: 'How long should I spend on a puzzle before giving up?',
        answer:
          'That is a preference rather than a rule, but there is a useful signal: if you have no new information to act on, more thinking will not produce any. At that point a solver check tells you what you missed, which is more useful than staring at the board.'
      }
    ],
    howToSteps: [
      { name: 'Identify what the game gives feedback about', text: 'Before the first guess, decide whether the feedback will describe letters and positions, alphabetical order, arithmetic, geography or meaning. That determines what a useful first guess is.' },
      { name: 'Open with a guess built for coverage', text: 'Choose a first guess that tests as many different things as the game allows — distinct letters in Wordle, a central position in Betweenle, a broad category in Contexto — rather than one that feels like a likely answer.' },
      { name: 'Write down what each guess eliminated', text: 'Keep a running list of what has been ruled out. Exclusions are permanent and can be reasoned from, whereas a remembered list of guesses cannot.' },
      { name: 'Keep buying information while the field is wide', text: 'Play guesses that test several new things at once until the remaining candidates are few enough to list. Guessing the answer before then wastes the guess.' },
      { name: 'Enumerate the candidates and narrow them', text: 'When the field is small, write out every candidate consistent with the feedback you have, then find the guess that separates them rather than the one you find most appealing.' },
      { name: 'Practise on archive puzzles and review one board', text: 'Use archive puzzles for deliberate practice, since they carry no streak. After finishing, identify which guess contributed the least and why before starting another.' }
    ]
  },

  /* ══ 18. are-wordle-solvers-cheating ══════════════════════════════════════
     Blocks: table, stats, bars                                                 */
  'are-wordle-solvers-cheating': {
    keyTakeaways: [
      'A solver does two things: it <strong>filters</strong> the word list against your feedback, then <strong>ranks</strong> the survivors.',
      'Whether that is cheating depends on when you consult it, not on the tool itself.',
      'Checking the top-ranked guess after you are stuck shows you where your instinct diverged, which is the point of practice.',
      'Wordle does not detect or prevent solver use, so the honest answer is a question about your own goal rather than about the game\'s rules.'
    ],
    sections: [
      {
        heading: 'What you are actually asking a solver to do',
        paragraphs: [
          'The word "solver" covers several different actions, and treating them as one thing is why the cheating question feels slippery. A solver is a filter over the valid answer list, and a ranker over what survives. How you use those two functions is what determines whether the puzzle is still yours.',
          'The table below separates the ways people actually use one, and what each does to the puzzle. Only the first row removes the game; the others change who chose the word rather than who solved the board.'
        ],
        visual: only({
          type: 'table',
          title: 'Ways people use a solver, and what each one changes',
          headers: ['How it is used', 'Effect on the puzzle'],
          rows: [
            { label: 'Reveal the answer before guessing', value: 'The puzzle is over. Nothing about the board is learned.', highlight: true },
            { label: 'Check the top-ranked guess after you are stuck', value: 'You keep solving, and you see exactly where your reasoning diverged.' },
            { label: 'Review the board after finishing', value: 'You identify which guess contributed least, with no effect on the result.' },
            { label: 'Borrow an opener from the solver', value: 'One word is chosen for you; the remaining guesses are still your decisions.' },
            { label: 'Play hard mode with a solver open', value: 'Hard mode still constrains which guesses are legal, but the answer came from outside.' }
          ],
          caption: 'The tool is the same in every row. The variable is whether you still have to reason about the board.'
        })
      },
      {
        heading: 'Why the honest answer is about your goal',
        paragraphs: [
          'Wordle has no rule against consulting a solver and no way to detect it. The game is a private daily puzzle with a personal streak, so the only thing at stake is what you wanted out of it.',
          'If the goal is to finish the board, a solver is the fastest route and the question is pointless. If the goal is to get better, a solver used at the right moment is the most informative feedback available — it shows the guess you did not consider and, more importantly, how many candidates your guess actually eliminated compared with the best alternative.',
          'That second use is what makes solvers a training tool rather than a shortcut. The information you gain is specific to the board you just played, which is the kind of feedback a puzzle alone rarely gives you.'
        ],
        visual: only({
          type: 'stats',
          title: 'What a solver works with',
          stats: [
            { value: '6', label: 'Guesses per Wordle round', note: 'The budget the filter operates inside.' },
            { value: '5', label: 'Letters per guess', note: 'Every constraint the solver checks is per position.' },
            { value: '2', label: 'Steps a solver performs', note: 'Filter the answer list by your feedback, then rank what survives.' },
            { value: '1', label: 'Ranking criterion', note: 'How much of the remaining list each candidate would eliminate.' }
          ]
        })
      },
      {
        heading: 'How much of the alphabet two guesses can settle',
        paragraphs: [
          'The reason a solver\'s suggestions feel surprising is usually that they cover more ground than the guess you wanted to play. Two openers with no shared letters test ten distinct letters, which is close to two fifths of the alphabet, and they do it in the two guesses where coverage matters most.',
          'That comparison is the useful thing to take away. You do not need a solver to play a high-coverage opener; you need to know how many letters your guess is testing, which is arithmetic you can do while typing.',
          'The bar chart below compares those counts directly. The gap between a coverage-first opening pair and a single repeated-letter guess is the whole argument for opening broadly.'
        ],
        visual: only({
          type: 'bars',
          title: 'Distinct letters covered by different openings',
          max: 26,
          unit: ' letters',
          bars: [
            { label: 'One opener, five distinct letters', value: 5, tone: 'primary', note: 'A quarter of the alphabet in one guess.' },
            { label: 'An opener with a repeated letter', value: 4, tone: 'accent', note: 'One tile is spent on a letter already tested.' },
            { label: 'Two openers sharing no letters', value: 10, tone: 'success', note: 'Two fifths of the alphabet before the board is even narrow.' },
            { label: 'Letters in the alphabet', value: 26, tone: 'neutral', note: 'The ceiling every coverage claim is measured against.' }
          ],
          caption: 'Coverage is arithmetic on the words you type, which is why a solver\'s opening suggestion is usually one you could have reasoned to yourself.'
        })
      }
    ],
    faqs: [
      {
        question: 'Does Wordle ban the use of solvers?',
        answer:
          'No. Wordle has no rule about outside help and no mechanism to detect it. Whether to use one is a personal choice about what you want from the puzzle, not a question of the game\'s rules.'
      },
      {
        question: 'What is the most useful way to use a solver?',
        answer:
          'Checking it after you are already stuck. At that point you have made all your own decisions, and seeing the guess it preferred shows you which reasoning step you missed rather than handing you the answer.'
      }
    ]
  },

  /* ══ 19. daily-word-games-like-wordle ═════════════════════════════════════
     Blocks: table, stats, bars                                                 */
  'daily-word-games-like-wordle': {
    keyTakeaways: [
      'Almost every Wordle-like game keeps the one-a-day format and changes <strong>what the feedback describes</strong>.',
      'Feedback can be about letters, positions, alphabetical order, arithmetic, geography, colour channels or meaning.',
      'The games with more slots — Quordle\'s four boards, Nerdle\'s eight characters — reward opening guesses built for coverage.',
      'Waffle is the outlier: it counts swaps rather than guesses, so its budget works differently.'
    ],
    sections: [
      {
        heading: 'The whole family, by what it scores',
        paragraphs: [
          'The useful way to compare these games is not by theme but by what their feedback describes. Every one of them narrows the field by returning an ordered signal, and the signal is what makes one game feel like a word game and another feel like a search problem.',
          'The table below sets out each game alongside the constraint it returns feedback on. Once you read it that way, the family stops looking like twenty variations on Wordle and starts looking like a small number of distinct puzzle types wearing different skins.',
          'It also explains why the games are not interchangeable in difficulty. A game that reports a numeric similarity gives you something you can follow; a game that reports only higher-or-lower gives you a single bit per turn.'
        ],
        visual: only({
          type: 'table',
          title: 'Daily games and the constraint each one reports on',
          headers: ['Game', 'What its feedback describes'],
          rows: [
            { label: 'Quordle', value: 'Letters and positions, scored against four separate answers at once.', highlight: true },
            { label: 'Waffle', value: 'Placement of scrambled letters across a grid of crossing words.', highlight: true },
            { label: 'Betweenle', value: 'Alphabetical order only: higher or lower, with no letter clue.', highlight: true },
            { label: 'Nerdle', value: 'The digits, operator and equals sign of an arithmetic equation.' },
            { label: 'Globle', value: 'Geographic proximity to a target country, shown as warmth.' },
            { label: 'Worldle', value: 'Country outline, distance in kilometres and direction.' },
            { label: 'Contexto', value: 'A rank by meaning, where rank 1 is the answer.' },
            { label: 'Semantle', value: 'A similarity score by meaning, with no reference to spelling.' },
            { label: 'Colordle', value: 'Three independent colour channels with high-or-low feedback.' }
          ],
          caption: 'Group by the constraint, not by the theme: that is what determines the strategy worth using.'
        })
      },
      {
        heading: 'Comparing the budgets',
        paragraphs: [
          'The other axis worth comparing is how much room each game gives you. Wordle gives six guesses, Quordle gives nine across four boards, Nerdle gives six for an eight-character equation, and Waffle gives fifteen swaps but awards its full rating only for ten.',
          'Those numbers decide how much of a game you can spend on information. Six guesses at five letters is tight enough that the first two are almost entirely informational. Quordle\'s nine guesses spread over four boards are only generous if your early guesses serve all four.',
          'The chart below puts the allowances side by side. Waffle is deliberately shown with its swap count, which is a different unit to a guess — the caption says so, because mixing the two would make the comparison misleading.'
        ],
        visual: only({
          type: 'bars',
          title: 'Moves allowed per game',
          max: 15,
          unit: '',
          bars: [
            { label: 'Wordle', value: 6, tone: 'primary', note: 'Six guesses, five letters each.' },
            { label: 'Nerdle', value: 6, tone: 'primary', note: 'Six guesses, eight characters each.' },
            { label: 'Worldle', value: 6, tone: 'primary', note: 'Six guesses, one country each.' },
            { label: 'Quordle', value: 9, tone: 'success', note: 'Nine guesses shared across four boards.' },
            { label: 'Waffle', value: 15, tone: 'accent', note: 'Fifteen swaps — a swap is not a guess, but it is the game\'s move count.' }
          ],
          caption: 'Guess allowances for every game except Waffle, which counts swaps. Waffle awards full marks for finishing within ten.'
        })
      },
      {
        heading: 'The numbers worth remembering',
        paragraphs: [
          'Four figures cover most of what you need to know before picking up any of these games. Two of them describe Quordle, which is the only game in the list that multiplies the problem rather than changing its shape.',
          'The other two describe Nerdle, which goes the other way: it does not add boards, it changes what a tile is. Eight characters of arithmetic means the feedback is about digits and structure, so a player who brings word-game instincts to it will spend the first guess testing letters that do not exist.',
          'Keeping the multiplication in mind matters because it is the trap of the family. Four boards sounds like four times the difficulty; with nine guesses each providing four readings, it is closer to four times the reward, provided the opening guesses are shared.'
        ],
        visual: only({
          type: 'stats',
          title: 'The numbers behind the roundup',
          stats: [
            { value: '4', label: 'Boards in Quordle', note: 'Four answers, one shared guess list.' },
            { value: '9', label: 'Guesses in Quordle', note: 'Nine guesses across all four boards.' },
            { value: '36', label: 'Quordle tiles of feedback', note: 'Nine guesses times four boards.' },
            { value: '8', label: 'Characters in a Nerdle equation', note: 'Six digits, one operator and one equals sign.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'Which daily game is closest to Wordle?',
        answer:
          'Canuckle and Phoodle keep the letter-and-position feedback and change the word list. Quordle keeps the same feedback but multiplies it across four boards, which changes the strategy rather than the mechanics.'
      },
      {
        question: 'Are any of these games limited to one puzzle a day?',
        answer:
          'The daily versions are, which is what gives them the shared-answer format. Several of them also offer archives or practice modes where the puzzle count is not limited, which is what makes them useful for deliberate practice.'
      }
    ]
  },

  /* ══ 20. colordle-strategy-guide ══════════════════════════════════════════
     Blocks: swatches, table, steps                                             */
  'colordle-strategy-guide': {
    keyTakeaways: [
      'A hex code is three independent numbers: <strong>RR</strong>, <strong>GG</strong> and <strong>BB</strong>, each from 00 to FF.',
      'Each guess returns a high-or-low direction for every channel, so you get three separate clues per attempt.',
      'Narrow one channel at a time to convergence rather than trying to move all three at once.',
      'Converting the colour you see into channel numbers is the skill; the game itself never asks you to name a colour.'
    ],
    sections: [
      {
        heading: 'Three channels, each 256 values wide',
        paragraphs: [
          'Colordle is not a colour-naming game, it is three numeric searches running in parallel. A six-digit hex code splits into three two-digit pairs, one per channel, and each pair runs from 00 to FF — which is 256 possible values per channel.',
          'That is the whole structure. The feedback you receive is directional per channel: your red is too high, your green is too low, your blue is exactly right. Three independent reads per guess, and no reading is affected by the other two.',
          'The table below sets out the three channels with their ranges, plus the size of the whole code space, which is what makes a blind guess hopeless and a channel-by-channel approach workable.'
        ],
        visual: only({
          type: 'table',
          title: 'The three channels of a hex code',
          headers: ['Channel', 'Range and what the feedback says'],
          rows: [
            { label: 'RR — red', value: '00 to FF, told whether your red value is too high, too low or exact.', highlight: true },
            { label: 'GG — green', value: '00 to FF, same independent high-or-low read.', highlight: true },
            { label: 'BB — blue', value: '00 to FF, same independent high-or-low read.', highlight: true },
            { label: 'Whole code', value: 'Three channels of 256 values each: 16,777,216 possible colours.' }
          ],
          caption: '256 values per channel comes from 00 to FF in hexadecimal; 256 × 256 × 256 is 16,777,216.'
        })
      },
      {
        heading: 'Watching a channel converge',
        paragraphs: [
          'The swatches below show a sequence of guesses against the same target, read left to right as progress. Each chip is a colour you could type; the label describes what the feedback on that guess would tell you.',
          'Read the sequence as three separate tracks rather than as one colour getting warmer. The red channel settles first, then green, then blue — and the labels mark which channel is still open at each step.',
          'This is why the strategy is to converge one channel at a time. A guess that moves all three channels at once produces three directional reads that are harder to act on than one read that closes a channel completely.'
        ],
        visual: only({
          type: 'swatches',
          title: 'A code converging one channel at a time',
          caption: 'Illustrative progression. The ring colour marks how much of the code is aligned: red ring for mostly unresolved, amber for partially resolved, green for a channel that has converged.',
          swatches: [
            { hex: '#ff0000', state: 'absent', label: 'Red far too high' },
            { hex: '#800000', state: 'absent', label: 'Red still too high, green and blue too low' },
            { hex: '#7f3f00', state: 'present', label: 'Red settled, blue still too low' },
            { hex: '#7f3fff', state: 'correct', label: 'All three channels aligned' }
          ]
        })
      },
      {
        heading: 'Converging each channel in turn',
        paragraphs: [
          'The order of operations follows directly from the feedback being independent. Move one channel at a time toward its target, and leave the other two wherever they are, until the first one comes back exact.',
          'The steps below are that procedure. The discipline that makes it fast is the fourth step: once a channel is exact, never move it again, even if the overall colour looks wrong. Every subsequent guess should hold that value fixed.',
          'Reading the target colour off a screenshot and converting it to numbers is optional but useful practice. The channels are the answer space; the colour on screen is just the rendering of three numbers.'
        ],
        visual: only({
          type: 'steps',
          title: 'Channel-by-channel convergence',
          steps: [
            { title: 'Start from the middle of each channel', body: 'Guess 80 for red, green and blue rather than 00 or FF. A midpoint guess halves the remaining range in every channel at once, whichever direction each read points.' },
            { title: 'Read the three directions separately', body: 'Write down one direction per channel: red high or low, green high or low, blue high or low. Three independent reads per guess, six bits of information in one attempt.' },
            { title: 'Pick one channel and converge it', body: 'Choose one channel and keep halving its remaining range while leaving the other two alone. Closing a channel completely removes it from the search.' },
            { title: 'Never move a channel once it reads exact', body: 'An exact channel is finished. Hold that value in every later guess, so the remaining feedback is purely about the channels still open.' },
            { title: 'Halve the remaining range each time', body: 'Apply the same midpoint logic to each open channel. Two-digit hexadecimal values are a range, and a midpoint guess discards half of it regardless of which direction the feedback points.' },
            { title: 'Commit once all three channels are exact', body: 'When every channel reports exact, the code is the one you typed. Submit it rather than continuing to refine.' }
          ]
        })
      }
    ],
    faqs: [
      {
        question: 'How many colours can a hex code represent?',
        answer:
          '16,777,216. Each of the three channels runs from 00 to FF, which is 256 values, and 256 multiplied by itself three times is 16,777,216.'
      },
      {
        question: 'Do I need to know hex values to play Colordle?',
        answer:
          'No, but it helps. The game only needs three numbers, and every feedback line tells you whether one of those numbers is too high or too low. Reading hex fluently just saves you converting the target colour in your head.'
      }
    ]
  }
};
