/**
 * Fix mobile padding in article sections.
 * 1. Changes section p-8 to p-5 sm:p-8 inside <article> blocks for more mobile text width.
 * 2. Removes redundant inner max-w-4xl containers nested inside max-w-5xl.
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = `${__dirname}/../src/routes`;

async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(path);
    } else {
      yield path;
    }
  }
}

function fixPaddingInArticles(content) {
  let changed = false;
  
  // Split by <article to process each article block separately
  const parts = content.split(/(<article[\s\S]*?<\/article>)/g);
  
  const processed = parts.map((part, index) => {
    // Even indices (0, 2, 4...) are outside article blocks
    // Odd indices (1, 3, 5...) are inside article blocks
    if (index % 2 === 0) {
      return part;
    }
    
    // Inside article block: change p-8 to p-5 sm:p-8 for sections
    // Only for sections that have bg-white and rounded classes (article content sections)
    return part.replace(
      /(<section\s+class="[^"]*(?:bg-white|bg-slate-50)[^"]*\b)(p-8)(\b[^"]*")/g,
      (match, prefix, p8, suffix) => {
        changed = true;
        return `${prefix}p-5 sm:p-8${suffix}`;
      }
    );
  });
  
  return { content: processed.join(''), changed };
}

function fixNestedMaxWidth(content) {
  let changed = false;
  let result = content;

  // Pattern: <div class="mx-auto max-w-5xl ..."> ... <div class="mx-auto max-w-4xl space-y-8">
  // Remove mx-auto max-w-4xl from the inner div
  const nestedPattern = /<div\s+class="mx-auto max-w-5xl[^"]*">[\s\S]*?<div\s+class="mx-auto max-w-4xl\s+space-y-8"/g;
  
  result = result.replace(nestedPattern, (match) => {
    changed = true;
    return match.replace('mx-auto max-w-4xl ', '');
  });

  return { content: result, changed };
}

async function main() {
  const files = [];
  for await (const path of walkDir(ROUTES_DIR)) {
    if (extname(path) === '.svelte' && path.includes('+page')) {
      files.push(path);
    }
  }

  let modifiedCount = 0;
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    
    const padResult = fixPaddingInArticles(content);
    const maxResult = fixNestedMaxWidth(padResult.content);
    
    if (padResult.changed || maxResult.changed) {
      await writeFile(file, maxResult.content, 'utf-8');
      modifiedCount++;
      console.log(`✅ Fixed in: ${file}`);
    }
  }

  console.log(`\n📊 Modified ${modifiedCount} of ${files.length} files`);
}

main().catch(console.error);
