/**
 * Fix content page paragraphs:
 * 1. Change text-lg to text-base for better mobile readability
 * 2. Change mb-6 to mb-4 for tighter spacing
 * 3. Add space-y-4 wrapper div around paragraphs in sections
 * 4. Fix missing </p> tags before <h2> or </section>
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = `${__dirname}/../src/routes/(content)`;

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

function fixContent(content) {
  let result = content;
  let modified = false;

  // 1. Fix paragraphs: change text-lg to text-base, mb-6 to mb-4
  // Match <p class="...text-lg...mb-6..."> or similar variations
  result = result.replace(
    /<p\s+class="([^"]*)text-lg([^"]*)mb-6([^"]*)"\s*>/g,
    (match, p1, p2, p3) => {
      modified = true;
      return `<p class="${p1}text-base${p2}mb-4${p3}">`;
    }
  );

  // Also handle mb-6 before text-lg
  result = result.replace(
    /<p\s+class="([^"]*)mb-6([^"]*)text-lg([^"]*)"\s*>/g,
    (match, p1, p2, p3) => {
      modified = true;
      return `<p class="${p1}mb-4${p2}text-base${p3}">`;
    }
  );

  // Handle leading-relaxed without mb-6 (just text-lg -> text-base)
  result = result.replace(
    /<p\s+class="([^"]*)text-lg([^"]*)leading-relaxed"\s*>/g,
    (match, p1, p2) => {
      modified = true;
      return `<p class="${p1}text-base${p2}leading-relaxed">`;
    }
  );

  // 2. Fix missing </p> tags - find <p>...</p\n\s*<h2> or similar
  // Pattern: closing </p> tag that is immediately followed by opening tag without proper newline
  // Fix: <p...>content\n        <h2> -> <p...>content</p>\n        <h2>
  result = result.replace(
    /(<p\s+class="[^"]*">[\s\S]*?)(\n\s*)(<[hH][2-6]|\n\s*<h[2-6])/g,
    (match, pContent, newline, nextTag) => {
      // Check if the p tag is already closed
      const lastClose = pContent.lastIndexOf('</p>');
      const lastOpen = pContent.lastIndexOf('<p');
      if (lastClose > lastOpen) return match; // Already closed
      
      modified = true;
      return pContent + '</p>' + newline + nextTag;
    }
  );

  return { content: result, modified };
}

async function main() {
  const files = [];
  for await (const path of walkDir(CONTENT_DIR)) {
    if (extname(path) === '.svelte' && path.includes('+page')) {
      files.push(path);
    }
  }

  let totalModified = 0;
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const result = fixContent(content);
    
    if (result.modified) {
      await writeFile(file, result.content, 'utf-8');
      totalModified++;
      console.log(`✅ Fixed: ${file}`);
    }
  }

  console.log(`\n📊 Modified ${totalModified} of ${files.length} content files`);
}

main().catch(console.error);
