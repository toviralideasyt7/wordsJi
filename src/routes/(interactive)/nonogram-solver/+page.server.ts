import type { StaticArticleContent } from '$lib/content/registry';

/**
 * Article data for the Nonogram solver page.
 *
 * NOTE (integration): once approved, move this object into
 * $lib/content/registry.ts under the key 'nonogram-solver' and change this
 * load() to return { article: ARTICLE_CONTENT['nonogram-solver'] }.
 * It is defined here only because the registry is a shared file we may not edit.
 */
const NONOGRAM_SOLVER_ARTICLE: StaticArticleContent = {
  key: 'nonogram-solver',
  eyebrow: 'Picross · Griddlers · Hanjie Solver',
  intro:
    'This nonogram solver takes your row and column clues and fills in the picture for you, cell by cell. Type the numbers from your puzzle into the clue fields, hit solve, and watch the grid resolve. It handles Picross, Griddlers and Hanjie puzzles up to 20 by 20, and the solving log shows every deduction it made along the way.',
  keyTakeaways: [
    'Enter row and column clues as space-separated numbers; 0 marks an empty line.',
    'Grids up to 20 by 20 solve in the background without freezing the page.',
    'The solving log replays every deduction, guess and backtrack step by step.'
  ],
  sections: [
    {
      heading: 'What a nonogram actually asks you to do',
      paragraphs: [
        'A nonogram gives you numbers beside every row and column instead of a picture. Each number tells you the length of one unbroken run of filled cells in that line, in order. A row marked "3 1" has a run of three filled cells, at least one blank, then a single filled cell somewhere after it.',
        'The skill is in the overlap: when several placements are possible, the cells that stay filled in all of them must be part of the answer. That is exactly what this solver computes, line by line, then repeats across the whole grid until nothing new can be deduced.'
      ]
    },
    {
      heading: 'Reading the solving log',
      paragraphs: [
        'Most puzzles fall to pure logic, and the log shows each of those deductions as it happens. When logic stalls, the solver makes its best guess on the most constrained cell, follows the consequences, and backtracks if it hits a contradiction.',
        'Scrub through the steps with the slider or press play to watch the replay. Cells decided by the current step are outlined in amber, so you can follow the reasoning instead of just accepting the finished picture.'
      ]
    },
    {
      heading: 'Getting clean results from your clues',
      paragraphs: [
        'The solver is only as good as the clues you type. Double-check any line it flags as impossible: a common slip is miscounting a run or forgetting that separate numbers need at least one blank cell between them.',
        'Very sparse clues on a large grid give the solver too many arrangements to enumerate, so the page caps grids at 20 by 20 and declines puzzles it cannot enumerate in reasonable time. If you see the "too complex" message, try a smaller version of the puzzle first.'
      ],
      callout: {
        title: 'Tip for paper puzzles',
        body: 'Work from the most constrained lines first: rows or columns where the numbers nearly fill the whole line. Those lock in cells fastest, and the same idea drives the solver\'s guessing order.'
      }
    }
  ],
  faqs: [
    {
      question: 'What is a nonogram?',
      answer:
        'A nonogram is a picture logic puzzle also sold as Picross, Griddlers or Hanjie. Numbers beside each row and column give the lengths of consecutive filled blocks; shading the correct cells reveals a hidden image.'
    },
    {
      question: 'How do I enter my puzzle into the nonogram solver?',
      answer:
        'Type each row and column clue as space-separated numbers, for example "3 1 2". Use 0 for a completely empty line. The fields turn red if a line contains anything that is not a whole number.'
    },
    {
      question: 'What size puzzles can the solver handle?',
      answer:
        'Grids up to 20 by 20. Larger or very loosely-clued puzzles make the line-by-line enumeration explode, so the solver refuses those with a plain-language message instead of freezing your tab.'
    },
    {
      question: 'Does the solver show how it reached the answer?',
      answer:
        'Yes. The solving log records every line deduction, guess and backtrack with a snapshot of the grid. Scrub through it with the slider or press play to watch the full replay.'
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
    article: NONOGRAM_SOLVER_ARTICLE
  };
}
