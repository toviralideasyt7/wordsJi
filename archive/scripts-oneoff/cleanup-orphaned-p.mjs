/**
 * Remove orphaned </p> tags that were incorrectly added by the fix-content-paragraphs script.
 * An </p> is orphaned if there's no matching <p> opening tag before it.
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

function removeOrphanedPTags(content) {
  const lines = content.split('\n');
  const result = [];
  let pDepth = 0;
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count <p> and </p> tags on this line
    // Simple approach: track <p ...> openings and </p> closings
    const openMatches = line.match(/<p\s+class=/g) || [];
    const closeMatches = line.match(/<\/p>/g) || [];
    
    // Adjust depth
    pDepth += openMatches.length;
    
    // If this line has a </p> and pDepth would go negative, it's orphaned
    if (closeMatches.length > 0) {
      if (pDepth < closeMatches.length) {
        // Remove orphaned </p> tags
        let newLine = line;
        const orphansToRemove = closeMatches.length - pDepth;
        for (let j = 0; j < orphansToRemove; j++) {
          newLine = newLine.replace(/<\/p>/, '');
        }
        result.push(newLine);
        pDepth = 0;
        modified = true;
        continue;
      }
      pDepth -= closeMatches.length;
    }
    
    result.push(line);
  }

  return { content: result.join('\n'), modified };
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
    const result = removeOrphanedPTags(content);
    
    if (result.modified) {
      await writeFile(file, result.content, 'utf-8');
      totalModified++;
      console.log(`✅ Fixed orphaned </p> tags: ${file}`);
    }
  }

  console.log(`\n📊 Fixed ${totalModified} of ${files.length} content files`);
}

main().catch(console.error);
