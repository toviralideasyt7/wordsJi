/**
 * Split long paragraphs in gamedle content pages into smaller ones.
 * Targets <p> tags with >100 words, splitting at sentence boundaries.
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAMEDLE_DIR = `${__dirname}/../src/routes/(content)`;

const GAMEDLE_PAGES = [
  'narutodle-answer-today-updated',
  'pokedle-answer-today-updated',
  'smashdle-answer-today-updated',
  'onepiecedle-answer-today-updated',
  'dotadle-answer-today-updated',
  'loldle-answer-today-updated',
];

function splitLongParagraph(html, maxWords = 80) {
  // Extract the full <p...> opening tag
  const openTagMatch = html.match(/^(<p\s+[^>]*>)/);
  if (!openTagMatch) return html;
  const openTag = openTagMatch[1];

  // Extract inner content between opening and closing tag
  const closeTag = '</p>';
  const innerStart = openTag.length;
  const innerEnd = html.length - closeTag.length;
  if (!html.endsWith(closeTag)) return html;

  let inner = html.slice(innerStart, innerEnd).trim();

  // Count words
  const plainText = inner.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plainText.split(/\s+/).filter(w => w.length > 0);
  if (words.length <= maxWords) return html;

  // Split at sentence boundaries (period + space + capital letter)
  // Be careful with HTML inside
  const sentences = [];
  let current = '';
  let inTag = false;

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (char === '<') inTag = true;
    if (char === '>') inTag = false;

    current += char;

    if (char === '.' && !inTag) {
      // Look ahead for space + capital letter or end
      const rest = inner.slice(i + 1);
      const trimmedRest = rest.trimStart();
      if (trimmedRest === '' || /^[A-Z]/.test(trimmedRest) || /^<\w/.test(trimmedRest)) {
        sentences.push(current.trim());
        current = '';
      }
    }
  }

  if (current.trim()) sentences.push(current.trim());
  if (sentences.length <= 1) return html;

  // Group sentences into paragraphs of ~maxWords each
  const paragraphs = [];
  let currentPara = '';
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
    if (currentWordCount + sentenceWords > maxWords && currentPara) {
      paragraphs.push(currentPara.trim());
      currentPara = sentence;
      currentWordCount = sentenceWords;
    } else {
      currentPara += (currentPara ? ' ' : '') + sentence;
      currentWordCount += sentenceWords;
    }
  }
  if (currentPara.trim()) paragraphs.push(currentPara.trim());

  if (paragraphs.length <= 1) return html;

  // Reconstruct with same opening tag for first, and simple <p class="..."> for rest
  const classMatch = openTag.match(/class="([^"]*)"/);
  const cls = classMatch ? classMatch[1] : '';
  // Remove mb- classes and add mb-4 for middle paragraphs
  const baseCls = cls.replace(/\bmb-\d+\b/g, '').trim();

  const result = paragraphs.map((para, i) => {
    const isLast = i === paragraphs.length - 1;
    const mbClass = cls.includes('mb-') ? (isLast ? 'mb-4' : 'mb-4') : '';
    const finalCls = [baseCls, mbClass].filter(Boolean).join(' ');
    const tag = finalCls ? `<p class="${finalCls}">` : '<p>';
    const indent = '        ';
    return `${indent}${tag}\n          ${para}\n        ${closeTag}`;
  }).join('\n');

  return result;
}

async function main() {
  let totalModified = 0;

  for (const dir of GAMEDLE_PAGES) {
    const filePath = `${GAMEDLE_DIR}/${dir}/+page.svelte`;
    try {
      let content = await readFile(filePath, 'utf-8');
      let modified = false;

      // Find all <p class="...">...</p> tags
      const paraRegex = /<p\s+class="[^"]*"[^>]*>[\s\S]*?<\/p>/g;
      const matches = [...content.matchAll(paraRegex)];

      for (const match of matches) {
        const original = match[0];
        const plainText = original.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;

        if (wordCount > 100) {
          const replacement = splitLongParagraph(original);
          if (replacement !== original) {
            content = content.replace(original, replacement);
            modified = true;
          }
        }
      }

      if (modified) {
        await writeFile(filePath, content, 'utf-8');
        totalModified++;
        console.log(`✅ Split paragraphs: ${filePath}`);
      }
    } catch (err) {
      console.log(`⚠️ Skipped ${dir}: ${err.message}`);
    }
  }

  console.log(`\n📊 Modified ${totalModified} of ${GAMEDLE_PAGES.length} gamedle files`);
}

main().catch(console.error);
