import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const interactiveDir = path.resolve(
  process.cwd(),
  'src',
  'routes',
  '(interactive)'
);

const GAMEDLE_PAGES = [
  'loldle-solver',
  'dotadle-solver',
  'narutodle-solver',
  'onepiecedle-solver',
  'pokedle-solver',
  'smashdle-solver'
];

const FAQ_SECTION_PAGES = ['colorfle-solver', 'hangman-solver', 'nerdle-solver', 'searchle-solver'];

const FAQ_SCHEMA_ONLY_PAGES = [
  'betweenle-solver',
  'boggle-solver',
  'colordle-solver',
  'countryle-solver',
  'kanoodle-solver',
  'light-out-solver',
  'minesweeper-solver',
  'phoodle-solver',
  'soundmap-solver',
  'squaredle-solver',
  'waffle-solver',
  'weaver-solver',
  'word-ladder-solver',
  'worldle-solver'
];

async function readLines(name) {
  const file = path.join(interactiveDir, name, '+page.svelte');
  const src = await readFile(file, 'utf8');
  return { file, src, lines: src.split(/\r?\n/) };
}

function writeLines({ file, lines }) {
  return writeFile(file, lines.join('\n'), 'utf8');
}

function removeFaqsBlock(lines) {
  const start = lines.findIndex((line) => /const faqs\s*=\s*\[/.test(line));
  if (start === -1) return 0;

  let end = -1;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\s*\];\s*$/.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (end === -1) {
    throw new Error(`Could not find closing ]; for faqs block starting at line ${start + 1}`);
  }

  lines.splice(start, end - start + 1);
  return end - start + 1;
}

function removeLinesMatching(lines, pattern) {
  let removed = 0;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (pattern.test(lines[i])) {
      lines.splice(i, 1);
      removed += 1;
    }
  }
  return removed;
}

function removeGenerateFaqSchemaCalls(lines) {
  return removeLinesMatching(lines, /^[ \t]*generateFAQSchema\(\s*faqs\s*\)\s*,?\s*$/);
}

function removeFaqSectionUsages(lines) {
  return removeLinesMatching(lines, /^[ \t]*<FAQSection\b[\s\S]*?\/\s*>$/);
}

function removeFaqSectionImport(lines) {
  return removeLinesMatching(
    lines,
    /^[ \t]*import\s+FAQSection\s+from\s+['"]\$lib\/components\/FAQSection\.svelte['"];?$/
  );
}

function removeGenerateFaqSchemaImport(lines) {
  // Multi-line import block style: "                generateFAQSchema," on its own line.
  let removed = 0;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (/^[ \t]*generateFAQSchema,\s*$/.test(lines[i])) {
      // Only remove when inside an import statement (previous non-empty-ish context has "import {").
      let insideImport = false;
      for (let j = i - 1; j >= 0; j -= 1) {
        const prev = lines[j];
        if (/from\s+['"]/.test(prev)) break;
        if (/import\s*\{/.test(prev)) {
          insideImport = true;
          break;
        }
        if (prev.trim() === '') break;
      }
      if (insideImport) {
        lines.splice(i, 1);
        removed += 1;
      }
    }
  }
  return removed;
}

const summary = {};

// 1. GameDle pages: remove the whole article <section> (5 <article> blocks + AuthorCard),
//    then re-append a standalone AuthorCard so author credit is preserved.
for (const name of GAMEDLE_PAGES) {
  const { file, src, lines } = await readLines(name);
  const sectionStart = lines.findIndex((line) =>
    /<section class="max-w-4xl mx-auto px-4 py-16">/.test(line)
  );
  if (sectionStart === -1) {
    summary[name] = 'SKIPPED (no article section found)';
    continue;
  }
  const removedCount = lines.length - sectionStart;
  lines.splice(sectionStart);
  lines.push('', '<div class="mx-auto max-w-4xl px-4 pb-16">');
  lines.push('  <AuthorCard');
  lines.push('    name={PRESTON_HAYES_AUTHOR_NAME}');
  lines.push('    image={PRESTON_HAYES_AUTHOR_IMAGE}');
  lines.push('    description={PRESTON_HAYES_AUTHOR_DESCRIPTION}');
  lines.push('  />');
  lines.push('</div>');
  await writeLines({ file, lines });
  summary[name] = `removed article section (${removedCount} lines), kept AuthorCard`;
}

// 2. FAQ section pages: remove FAQSection usage, faqs array, FAQPage schema, imports.
for (const name of FAQ_SECTION_PAGES) {
  const { file, src, lines } = await readLines(name);
  const removed = [];
  removed.push(`faqsArray=${removeFaqsBlock(lines)}`);
  removed.push(`faqSchemaCalls=${removeGenerateFaqSchemaCalls(lines)}`);
  removed.push(`faqSectionUsage=${removeFaqSectionUsages(lines)}`);
  removed.push(`faqSectionImport=${removeFaqSectionImport(lines)}`);
  removed.push(`faqSchemaImport=${removeGenerateFaqSchemaImport(lines)}`);
  await writeLines({ file, lines });
  summary[name] = removed.join(', ');
}

// 3. FAQ-schema-only pages: remove faqs array + FAQPage schema call + import.
for (const name of FAQ_SCHEMA_ONLY_PAGES) {
  const { file, src, lines } = await readLines(name);
  const removed = [];
  removed.push(`faqsArray=${removeFaqsBlock(lines)}`);
  removed.push(`faqSchemaCalls=${removeGenerateFaqSchemaCalls(lines)}`);
  removed.push(`faqSchemaImport=${removeGenerateFaqSchemaImport(lines)}`);
  await writeLines({ file, lines });
  summary[name] = removed.join(', ');
}

for (const [name, result] of Object.entries(summary)) {
  console.log(`${name}: ${result}`);
}
