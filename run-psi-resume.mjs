import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const API_KEY = 'AIzaSyCEm8D4dkg4FmfnGwR3sQInFlptk4RxcOI';
const BASE = 'https://wordsolverx-z-ai.pages.dev';
const OUTDIR = 'c:\\Users\\akasa\\Projects\\websites\\wordsolverx\\wordsolverx-z-ai\\before-opti';

const EVERGREEN_STATIC_ROUTES = [
  '/','/about','/archive','/betweenle-solver','/boggle-solver','/colorfle-solver',
  '/colordle-solver','/contact','/countryle-solver','/disclaimer','/dotadle-solver',
  '/guides','/hangman-solver','/kanoodle-solver','/light-out-solver','/loldle-solver',
  '/minesweeper-solver','/narutodle-solver','/nerdle-solver','/onepiecedle-solver',
  '/canuckle','/canuckle-answer-today','/canuckle-archive','/canuckle-solver',
  '/phoodle-solver','/pokedle-solver','/privacy-policy','/quordle-solver',
  '/dordle-solver','/octordle-solver','/thirdle-solver','/hardle-solver',
  '/warmle-solver','/woodle-solver','/w-peaks-solver','/xordle-solver',
  '/fibble-solver','/spotle-wordle-solver','/searchle-solver','/smashdle-solver',
  '/solver','/soundmap-solver','/spotle-solver','/squaredle-solver','/terms-of-service',
  '/waffle-solver','/weaver-solver','/word-ladder-solver','/wordle-analyzer',
  '/wordle-solver','/worldle-solver','/3-letter-wordle-solver','/4-letter-wordle-solver',
  '/5-letter-wordle-solver','/6-letter-wordle-solver','/7-letter-wordle-solver',
  '/8-letter-wordle-solver','/9-letter-wordle-solver','/10-letter-wordle-solver',
  '/11-letter-wordle-solver'
];

const TODAY_STATIC_ROUTES = [
  '/today','/betweenle-answer-today','/canuckle-answer-today','/colorfle-answer-today',
  '/colordle-answer-today','/contexto-answer-today','/countryle-answer-today',
  '/dotadle-answer-today-updated','/framed-answer-today','/globle-answer-today',
  '/loldle-answer-today-updated','/narutodle-answer-today-updated','/nerdle-answer-today',
  '/onepiecedle-answer-today-updated','/phoodle-answer-today','/phrazle-answer-today',
  '/pokedle-answer-today-updated','/quordle-answer-today','/searchle-answer-today',
  '/semantle-answer-today','/smashdle-answer-today-updated','/spotle-answer-today',
  '/worgle-answer-today','/waffle-answer-today','/worldle-answer-today'
];

const ARCHIVE_STATIC_ROUTES = [
  '/canuckle-archive','/colorfle-archive','/colordle-archive','/contexto-archive',
  '/countryle-archive','/framed-archive','/globle-archive','/nerdle-archive',
  '/phoodle-archive','/phrazle-archive','/quordle-archive','/searchle-archive',
  '/semantle-archive','/spotle-archive','/worgle-archive','/waffle-archive',
  '/wordle-answer-archive','/worldle-archive'
];

const all = [...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES])];

function slugify(url) {
  return url.replace(/^\//, '').replace(/\//g, '-') || 'index';
}

const remaining = all.filter(url => !existsSync(join(OUTDIR, `${slugify(url)}.json`)));
console.error(`Resuming: ${remaining.length} pages remaining`);

async function runPSI(url) {
  const fullUrl = BASE + url;
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=mobile&category=performance&key=${API_KEY}`;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(120000) });
    if (!res.ok) {
      const errText = await res.text();
      return { page: url, error: `HTTP ${res.status}: ${errText.slice(0,200)}` };
    }
    const data = await res.json();
    const slug = slugify(url);
    writeFileSync(join(OUTDIR, `${slug}.json`), JSON.stringify(data, null, 2));
    const lr = data.lighthouseResult;
    if (!lr) return { page: url, error: 'No lighthouse result', saved: `${slug}.json` };
    const audits = lr.audits;
    const perf = lr.categories?.performance?.score;
    return {
      page: url,
      perfScore: perf !== null && perf !== undefined ? Math.round(perf * 100) : null,
      saved: `${slug}.json`
    };
  } catch(e) {
    return { page: url, error: e.message };
  }
}

const summary = [];
const batchSize = 3;
for (let i = 0; i < remaining.length; i += batchSize) {
  const batch = remaining.slice(i, i + batchSize);
  const batchResults = await Promise.all(batch.map(runPSI));
  summary.push(...batchResults);
  const done = Math.min(i + batchSize, remaining.length);
  process.stderr.write(`Progress: ${done}/${remaining.length}\n`);
  if (done < remaining.length) {
    await new Promise(r => setTimeout(r, 3000));
  }
}

process.stdout.write(JSON.stringify({ totalRemaining: remaining.length, completed: summary.filter(s => !s.error).length, errors: summary.filter(s => s.error).length }, null, 2));
