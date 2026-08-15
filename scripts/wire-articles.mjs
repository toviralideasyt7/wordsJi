// Wire StaticArticle into every remaining today/solver page.
// Run with: node scripts/wire-articles.mjs
import { readFile, writeFile } from 'node:fs/promises';

const INTERACTIVE = 'src/routes/(interactive)/';
const CONTENT = 'src/routes/(content)/';

// page file, article key, vars expression (or null)
const PAGES = [
  // today pages with dated vars
  { path: `${INTERACTIVE}betweenle-answer-today/+page.svelte`, key: 'betweenle-answer-today', vars: `{ date: data.todaySeoDate, answer: data.todayAnswer.word.toUpperCase() }` },
  { path: `${INTERACTIVE}colorfle-answer-today/+page.svelte`, key: 'colorfle-answer-today', vars: `{ date: data.formattedDate, answer: data.answer ?? '' }` },
  { path: `${INTERACTIVE}countryle-answer-today/+page.svelte`, key: 'countryle-answer-today', vars: `{ date: data.formattedDate, answer: data.today?.country.country ?? '' }` },
  { path: `${INTERACTIVE}framed-answer-today/+page.svelte`, key: 'framed-answer-today', vars: `{ date: data.formattedDate, answer: data.entries?.[0]?.answer ?? '' }` },
  { path: `${INTERACTIVE}searchle-answer-today/+page.svelte`, key: 'searchle-answer-today', vars: `{ date: todayLabel, answer: todayPuzzle.answer.toUpperCase() }` },
  { path: `${INTERACTIVE}worgle-answer-today/+page.svelte`, key: 'worgle-answer-today', vars: `{ date: data.formattedDate, answer: data.todayEntry.word.toUpperCase() }` },

  // standalone solver pages (no vars)
  { path: `${INTERACTIVE}colordle-solver/+page.svelte`, key: 'colordle-solver', vars: null },
  { path: `${INTERACTIVE}spotle-solver/+page.svelte`, key: 'spotle-solver', vars: null },
  { path: `${INTERACTIVE}weaver-solver/+page.svelte`, key: 'weaver-solver', vars: null },
  { path: `${INTERACTIVE}light-out-solver/+page.svelte`, key: 'light-out-solver', vars: null },
  { path: `${INTERACTIVE}kanoodle-solver/+page.svelte`, key: 'kanoodle-solver', vars: null },
  { path: `${INTERACTIVE}hangman-solver/+page.svelte`, key: 'hangman-solver', vars: null },
  { path: `${INTERACTIVE}boggle-solver/+page.svelte`, key: 'boggle-solver', vars: null },
  { path: `${INTERACTIVE}nerdle-solver/+page.svelte`, key: 'nerdle-solver', vars: null },
  { path: `${INTERACTIVE}worldle-solver/+page.svelte`, key: 'worldle-solver', vars: null },
  { path: `${INTERACTIVE}countryle-solver/+page.svelte`, key: 'countryle-solver', vars: null },
  { path: `${INTERACTIVE}colorfle-solver/+page.svelte`, key: 'colorfle-solver', vars: null },
  { path: `${INTERACTIVE}waffle-solver/+page.svelte`, key: 'waffle-solver', vars: null },
  { path: `${INTERACTIVE}phoodle-solver/+page.svelte`, key: 'phoodle-solver', vars: null },
  { path: `${INTERACTIVE}searchle-solver/+page.svelte`, key: 'searchle-solver', vars: null },
  { path: `${INTERACTIVE}word-ladder-solver/+page.svelte`, key: 'word-ladder-solver', vars: null },
  { path: `${INTERACTIVE}soundmap-solver/+page.svelte`, key: 'soundmap-solver', vars: null },

  // GameDle solver wrappers
  { path: `${INTERACTIVE}smashdle-solver/+page.svelte`, key: 'smashdle-solver', vars: null },
  { path: `${INTERACTIVE}loldle-solver/+page.svelte`, key: 'loldle-solver', vars: null },
  { path: `${INTERACTIVE}pokedle-solver/+page.svelte`, key: 'pokedle-solver', vars: null },
  { path: `${INTERACTIVE}narutodle-solver/+page.svelte`, key: 'narutodle-solver', vars: null },
  { path: `${INTERACTIVE}dotadle-solver/+page.svelte`, key: 'dotadle-solver', vars: null },
  { path: `${INTERACTIVE}onepiecedle-solver/+page.svelte`, key: 'onepiecedle-solver', vars: null },
];

for (const p of PAGES) {
  let src = await readFile(p.path, 'utf8');
  const already = src.includes(`ARTICLE_CONTENT['${p.key}']`);
  if (already) {
    console.log(`SKIP ${p.key}: already wired`);
    continue;
  }

  // 1. add imports right after the AuthorCard import line
  const importLine = `import AuthorCard from '$lib/components/AuthorCard.svelte';`;
  if (!src.includes(importLine)) throw new Error(`${p.key}: AuthorCard import not found`);
  if (!src.includes("import StaticArticle from '$lib/components/StaticArticle.svelte';")) {
    src = src.replace(
      importLine,
      `${importLine}\n  import StaticArticle from '$lib/components/StaticArticle.svelte';\n  import { ARTICLE_CONTENT } from '$lib/content/registry';`
    );
  }

  // 2. insert the component before <AuthorCard
  const varsAttr = p.vars ? ` vars={{ ${p.vars} }}` : '';
  const component = `<StaticArticle content={ARTICLE_CONTENT['${p.key}']}${varsAttr} />`;

  // GameDle wrappers use 2-space indent; others vary. Detect the indent of the AuthorCard line.
  const cardMatch = src.match(/^(\s*)<AuthorCard/m);
  if (!cardMatch) throw new Error(`${p.key}: <AuthorCard not found`);
  const indent = cardMatch[1];

  src = src.replace(
    /^(\s*)<AuthorCard/m,
    `${indent}${component}\n\n${indent}<AuthorCard`
  );

  await writeFile(p.path, src);
  console.log(`WIRED ${p.key}`);
}
