import type { StaticArticleContent } from '$lib/content/registry';

/**
 * Article data for the Terminus solver page.
 *
 * NOTE (integration): once approved, move this object into
 * $lib/content/registry.ts under the key 'terminus-solver' and change this
 * load() to return { article: ARTICLE_CONTENT['terminus-solver'] }.
 * It is defined here only because the registry is a shared file we may not edit.
 */
const TERMINUS_SOLVER_ARTICLE: StaticArticleContent = {
  key: 'terminus-solver',
  eyebrow: 'BO6 Zombies Easter Egg Calculator',
  intro:
    'The Terminus code calculator turns the three symbols on the Research Office whiteboard into the three terminal codes in one step. Pick the matching X, Y and Z symbols below and the page runs the 2X + 11, (2Z + Y) - 5 and |Y + Z - X| formulas for you, so you keep the 5,000 Essence the terminal charges for the answer.',
  keyTakeaways: [
    'Read the X, Y and Z symbols off the whiteboard in the Research Office.',
    'Match each symbol on this page; the three codes appear instantly.',
    'The calculator is free and works in any match, no sign-up needed.'
  ],
  sections: [
    {
      heading: 'Where to find the X, Y and Z symbols',
      paragraphs: [
        'Start in the Research Office on the Terminus map and look for the whiteboard on the wall. It shows three symbols, each labeled X, Y or Z. The set is randomized every match, which is why the codes change each game.',
        'Compare each whiteboard symbol to the reference chart below. The value under every glyph is its digit from 0 to 9. Select the three matching symbols and the calculator handles the rest.'
      ]
    },
    {
      heading: 'The three Terminus formulas, explained',
      paragraphs: [
        'The game builds the terminal codes from the same three formulas every time. Knowing them helps you sanity-check a code before you type it into the terminal.'
      ],
      list: {
        title: 'What the calculator computes',
        items: [
          'First code: 2X + 11. Doubles the X digit and adds eleven.',
          'Second code: (2Z + Y) - 5. Doubles the Z digit, adds Y, then subtracts five.',
          'Third code: |Y + Z - X|. Adds Y and Z, subtracts X, and drops any minus sign.'
        ]
      }
    },
    {
      heading: 'Using the calculator in a match',
      paragraphs: [
        'Read the symbols, pick the three matches on this page, and copy the combined code with the copy button. Walk to the computer terminal in the Research Office and enter the three numbers in order.',
        'Entering them yourself instead of buying the answer keeps 5,000 Essence in your pocket, which buys a lot of wall buys early in a match. If the symbols look different next game, that is normal. Read them fresh each time.'
      ],
      callout: {
        title: 'Quick check before you type',
        body: 'The first code is always between 11 and 29, the second between -5 and 22, and the third between 0 and 18. If your results fall outside those ranges, double-check the symbols you picked.'
      }
    }
  ],
  faqs: [
    {
      question: 'Where do I find the X, Y and Z symbols in Terminus?',
      answer:
        'In the Research Office on the Terminus map. The whiteboard on the wall shows three symbols labeled X, Y and Z. Match each one to the symbol chart on this page to get its digit.'
    },
    {
      question: 'What are the Terminus code formulas?',
      answer:
        'Code 1 is 2X + 11, code 2 is (2Z + Y) - 5, and code 3 is the absolute value of (Y + Z) - X. This calculator runs all three automatically once you pick the symbols.'
    },
    {
      question: 'How much Essence does the Terminus calculator save?',
      answer:
        'The terminal charges 5,000 Essence to reveal the codes. Reading the whiteboard symbols and running them through this calculator costs nothing.'
    },
    {
      question: 'Do the Terminus symbols change every game?',
      answer:
        'Yes. The three symbols are randomized each match, so the codes are different every game. Read the whiteboard fresh and calculate again.'
    }
  ],
  relatedLinks: [
    { href: '/solver', label: 'All puzzle solvers' },
    { href: '/minesweeper-solver', label: 'Minesweeper solver' },
    { href: '/light-out-solver', label: 'Lights Out solver' }
  ]
};

export function load() {
  return {
    article: TERMINUS_SOLVER_ARTICLE
  };
}
