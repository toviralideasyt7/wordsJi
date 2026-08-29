/**
 * Script to split overly long paragraphs into two for better mobile readability.
 * Finds <p> tags with text-lg leading-8 text-slate-600 classes that exceed ~350 chars
 * and splits them at a sentence boundary into two paragraphs.
 */
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, extname } from 'path';

import { dirname } from 'path';
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

function splitParagraph(text) {
  // Remove <p...> and </p> tags to get inner content
  const openTagMatch = text.match(/^(<p[^>]*>)([\s\S]*?)(<\/p>)$/);
  if (!openTagMatch) return text;

  const [, openTag, inner, closeTag] = openTagMatch;
  const cleanInner = inner.trim();

  // Only split if content is long enough
  if (cleanInner.length < 320) return text;

  // Find sentence boundary near the middle
  const mid = Math.floor(cleanInner.length / 2);
  // Look for sentence endings (. ) after the midpoint, or before it
  let splitIndex = -1;

  // First try finding a sentence end after midpoint
  const afterMid = cleanInner.slice(mid);
  const afterMatch = afterMid.match(/\.\s+/);
  if (afterMatch) {
    splitIndex = mid + afterMatch.index + afterMatch[0].length;
  }

  // If not found or too close to end, try before midpoint
  if (splitIndex === -1 || splitIndex > cleanInner.length - 50) {
    const beforeMid = cleanInner.slice(0, mid);
    const beforeMatches = [...beforeMid.matchAll(/\.\s+/g)];
    if (beforeMatches.length > 0) {
      const lastMatch = beforeMatches[beforeMatches.length - 1];
      splitIndex = lastMatch.index + lastMatch[0].length;
    }
  }

  if (splitIndex <= 0 || splitIndex >= cleanInner.length - 20) {
    return text; // Can't find good split point
  }

  const first = cleanInner.slice(0, splitIndex).trim();
  const second = cleanInner.slice(splitIndex).trim();

  return `${openTag}\n          ${first}\n        ${closeTag}\n        ${openTag}\n          ${second}\n        ${closeTag}`;
}

function processContent(content) {
  // Match <p class="...text-lg leading-8 text-slate-600...">...</p> blocks
  // The paragraph may span multiple lines
  const paragraphRegex = /<p\s+class="[^"]*(?:text-lg\s+leading-8\s+text-slate-600|text-base\s+leading-7\s+text-slate-600)[^"]*"[^>]*>[\s\S]*?<\/p>/g;

  let changed = false;
  const result = content.replace(paragraphRegex, (match) => {
    // Count approximate text length (excluding tags)
    const textOnly = match.replace(/<[^>]+>/g, '').trim();
    if (textOnly.length >= 320) {
      const replacement = splitParagraph(match);
      if (replacement !== match) {
        changed = true;
        return replacement;
      }
    }
    return match;
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
    const { content: newContent, changed } = processContent(content);
    if (changed) {
      await writeFile(file, newContent, 'utf-8');
      modifiedCount++;
      console.log(`✅ Fixed paragraphs in: ${file}`);
    }
  }

  console.log(`\n📊 Modified ${modifiedCount} of ${files.length} files`);
}

main().catch(console.error);
