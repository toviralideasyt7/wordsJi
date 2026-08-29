/**
 * Split large paragraphs in content route pages into smaller ones.
 * Targets paragraphs with text-lg class that have >120 words.
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

function splitParagraph(html, maxWords = 100) {
  // Extract the class attribute
  const classMatch = html.match(/class="([^"]*)"/);
  const classAttr = classMatch ? classMatch[1] : 'text-lg text-slate-600 mb-6 leading-relaxed';
  
  // Extract the inner content
  const innerMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (!innerMatch) return html;
  
  let inner = innerMatch[1].trim();
  
  // Count words (rough estimate by splitting on whitespace)
  const wordCount = inner.split(/\s+/).length;
  if (wordCount <= maxWords) return html;
  
  // Split at sentence boundaries (period followed by space and capital letter, or end of string)
  // We need to be careful with HTML inside
  const sentences = [];
  let current = '';
  let inTag = false;
  let inExpression = false;
  
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    const nextChar = inner[i + 1];
    
    if (char === '<') inTag = true;
    if (char === '>') inTag = false;
    if (char === '{' && !inTag) inExpression = true;
    if (char === '}' && !inTag) inExpression = false;
    
    current += char;
    
    // Split at sentence end: . followed by space or end
    if (char === '.' && !inTag && !inExpression) {
      const rest = inner.slice(i + 1).trimStart();
      if (rest === '' || rest[0] === ' ' || rest[0] === '\n' || rest[0] === '<') {
        sentences.push(current.trim());
        current = '';
      }
    }
  }
  
  if (current.trim()) sentences.push(current.trim());
  
  if (sentences.length <= 1) return html; // Can't split
  
  // Group sentences into paragraphs of ~maxWords each
  const paragraphs = [];
  let currentPara = '';
  let currentWords = 0;
  
  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;
    if (currentWords + sentenceWords > maxWords && currentPara) {
      paragraphs.push(currentPara.trim());
      currentPara = sentence;
      currentWords = sentenceWords;
    } else {
      currentPara += (currentPara ? ' ' : '') + sentence;
      currentWords += sentenceWords;
    }
  }
  if (currentPara.trim()) paragraphs.push(currentPara.trim());
  
  if (paragraphs.length <= 1) return html;
  
  // Generate new paragraphs with same class but mb-4 instead of mb-6 for middle ones
  const result = paragraphs.map((para, i) => {
    const mb = i === paragraphs.length - 1 ? 'mb-6' : 'mb-4';
    const cls = classAttr.replace(/mb-\d+/, mb);
    return `        <p class="${cls}">\n          ${para}\n        </p>`;
  }).join('\n');
  
  return result;
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
    let content = await readFile(file, 'utf-8');
    let modified = false;
    
    // Find paragraphs with text-lg class (the big paragraphs in content pages)
    const paraRegex = /<p\s+class="[^"]*text-lg[^"]*"[^>]*>[\s\S]*?<\/p>/g;
    const matches = [...content.matchAll(paraRegex)];
    
    for (const match of matches) {
      const original = match[0];
      const wordCount = original.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
      
      if (wordCount > 100) {
        const replacement = splitParagraph(original);
        if (replacement !== original) {
          content = content.replace(original, replacement);
          modified = true;
        }
      }
    }
    
    if (modified) {
      await writeFile(file, content, 'utf-8');
      totalModified++;
      console.log(`✅ Split paragraphs: ${file}`);
    }
  }
  
  console.log(`\n📊 Modified ${totalModified} of ${files.length} content files`);
}

main().catch(console.error);
