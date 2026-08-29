/**
 * Fix all remaining issues:
 * 1. bg-slate-900 text-white buttons with dark: variants -> replace bg-slate-900 with visible colors
 * 2. Content page nested container divs
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

// Fix 1: Replace problematic bg-slate-900 + text-white + dark:bg- buttons
function fixButtons(content) {
  let changed = false;
  let result = content;

  // Pattern: bg-slate-900 ... text-white ... dark:bg-amber-600
  // Replace bg-slate-900 with bg-teal-600 (consistent site color)
  const buttonPatterns = [
    // betweenle-answer-today style
    {
      regex: /class="([^"]*)bg-slate-900([^"]*)text-white([^"]*)dark:bg-amber-600([^"]*)"/g,
      replacement: 'class="$1bg-teal-600$2text-white$3hover:bg-teal-500$4"'
    },
    // searchle-answer-today style  
    {
      regex: /class="([^"]*)bg-slate-900([^"]*)text-white([^"]*)dark:bg-amber-600([^"]*)"/g,
      replacement: 'class="$1bg-teal-600$2text-white$3hover:bg-teal-500$4"'
    },
    // worldle-answer-today style
    {
      regex: /class="([^"]*)bg-slate-900([^"]*)text-white([^"]*)dark:bg-sky-600([^"]*)"/g,
      replacement: 'class="$1bg-teal-600$2text-white$3hover:bg-teal-500$4"'
    },
    // worgle-answer-today style (reveal button)
    {
      regex: /class="([^"]*)bg-slate-900([^"]*)text-white([^"]*)"/g,
      replacement: (match, p1, p2, p3) => {
        // Only replace if it's a button/link, not a tile display
        if (match.includes('rounded-full') || match.includes('rounded-xl') || match.includes('rounded-2xl')) {
          changed = true;
          return `class="${p1}bg-teal-600${p2}text-white${p3}"`.replace('hover:bg-slate-800', 'hover:bg-teal-500').replace('hover:bg-slate-700', 'hover:bg-teal-500');
        }
        return match;
      }
    }
  ];

  for (const pattern of buttonPatterns) {
    if (typeof pattern.replacement === 'string') {
      result = result.replace(pattern.regex, (match) => {
        changed = true;
        return match.replace(/bg-slate-900/g, 'bg-teal-600')
                    .replace(/dark:bg-amber-600/g, '')
                    .replace(/dark:hover:bg-amber-500/g, '')
                    .replace(/dark:bg-sky-600/g, '')
                    .replace(/dark:hover:bg-sky-500/g, '')
                    .replace(/hover:bg-slate-800/g, 'hover:bg-teal-500')
                    .replace(/hover:bg-slate-700/g, 'hover:bg-teal-500');
      });
    } else {
      result = result.replace(pattern.regex, pattern.replacement);
    }
  }

  return { content: result, changed };
}

// Fix 2: Content pages nested containers
function fixContentContainers(content) {
  let changed = false;
  let result = content;

  // Pattern: <article class="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
  // Change to: <article class="space-y-8">
  // But only for content route pages that have this pattern
  const articlePattern = /<article\s+class="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">/g;
  if (articlePattern.test(result)) {
    result = result.replace(articlePattern, '<article class="space-y-8">');
    changed = true;
  }

  // Also fix the preceding div if it has the same container classes
  // Pattern: </div> followed by <article class="space-y-8">
  // We need to merge them - remove the closing </div> before the article
  // and add it after the closing </article>
  const splitPattern = /(<\/div>\s*)(<article class="space-y-8">[\s\S]*?<\/article>)/g;
  result = result.replace(splitPattern, (match, closingDiv, article) => {
    changed = true;
    return article + closingDiv;
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
    
    const btnResult = fixButtons(content);
    const containerResult = fixContentContainers(btnResult.content);
    
    if (btnResult.changed || containerResult.changed) {
      await writeFile(file, containerResult.content, 'utf-8');
      modifiedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  }

  console.log(`\n📊 Modified ${modifiedCount} of ${files.length} files`);
}

main().catch(console.error);
