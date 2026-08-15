import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { randomInt } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const generatedDirPath = path.join(projectRoot, 'src', 'lib', 'generated');
const outputPath = path.join(generatedDirPath, 'daily-articles.json');
const perRouteStoreDirPath = path.join(generatedDirPath, 'artiples');
const skillPath = path.join(projectRoot, '.opencode', 'human-wiriting', 'SKILL.md');
const seoSkillPath = path.join(projectRoot, '.opencode', 'seo-skills', 'write-content', 'SKILL.md');
const colordleDataPath = path.join(projectRoot, 'static', 'colordle_data.json');

const WORDLE_API_BASE_URL =
  process.env.WORDLE_API_BASE_URL ?? 'https://api.wordsolverx.workers.dev';
const COLOR_ANSWERS_API_BASE =
  (process.env.COLOR_ANSWERS_API_BASE ?? 'https://color-answers-worker.colordle.workers.dev').replace(
    /\/+$/,
    ''
  );
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.ARTICLE_REQUEST_TIMEOUT_MS ?? '120000', 10);
const MAX_REQUEST_ATTEMPTS = Math.max(
  1,
  Number.parseInt(process.env.ARTICLE_MAX_ATTEMPTS ?? '3', 10) || 3
);
const MAX_CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.ARTICLE_MAX_CONCURRENCY ?? '6', 10) || 6
);
const MAX_OUTPUT_TOKENS = Math.max(
  512,
  Number.parseInt(process.env.ARTICLE_MAX_OUTPUT_TOKENS ?? '32768', 10) || 32768
);
const RATE_LIMIT_DELAY_MS = Math.max(
  0,
  Number.parseInt(process.env.ARTICLE_RATE_LIMIT_DELAY_MS ?? '500', 10) || 500
);
const STATUS_POLL_INTERVAL_MS = Math.max(
  250,
  Number.parseInt(process.env.ARTICLE_STATUS_POLL_INTERVAL_MS ?? '2500', 10) || 2500
);
const MAX_STORED_DATES_PER_ROUTE = Math.max(
  1,
  Number.parseInt(process.env.ARTICLE_MAX_STORED_DATES_PER_ROUTE ?? '45', 10) || 45
);
const ARTICLE_TOP_P = Number.parseFloat(process.env.ARTICLE_TOP_P ?? '0.92') || 0.92;
const ARTICLE_TOP_K = Math.max(1, Number.parseInt(process.env.ARTICLE_TOP_K ?? '40', 10) || 40);
const ARTICLE_PRESENCE_PENALTY =
  Number.parseFloat(process.env.ARTICLE_PRESENCE_PENALTY ?? '0.45') || 0.45;
const ARTICLE_REPETITION_PENALTY =
  Number.parseFloat(process.env.ARTICLE_REPETITION_PENALTY ?? '1.05') || 1.05;
const LOG_SNIPPET_LIMIT = 220;
const PRIMARY_MODEL = 'qwen/qwen3.5-397b-a17b';
const NVIDIA_MODEL_CHAIN = [
  PRIMARY_MODEL,
  'qwen/qwen3.5-122b-a10b',
  'minimaxai/minimax-m2.7'
];
const BATCH_GROUPS = ['site', 'gamedle', 'waffle'];

const TODAY_ARTICLE_REGISTRY = [
  {
    key: 'wordle-answer-today',
    gameName: 'Wordle',
    mode: 'wordle',
    groups: ['site', 'main']
  },
  {
    key: 'colordle-answer-today',
    gameName: 'Colordle',
    mode: 'colordle',
    groups: ['site', 'main']
  },
  {
    key: 'betweenle-answer-today',
    gameName: 'Betweenle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes:
      'Daily geography-style puzzle page with answer, clue cards, solver links, and archive navigation.'
  },
  {
    key: 'canuckle-answer-today',
    gameName: 'Canuckle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes:
      'Canadian Wordle-style answer page with reveal card, puzzle number, fact section, solver link, and archive link.'
  },
  {
    key: 'colorfle-answer-today',
    gameName: 'Colorfle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily color-mixing answer page with clue sections and supporting solver/archive links.'
  },
  {
    key: 'contexto-answer-today',
    gameName: 'Contexto',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily semantic guessing page with hints, answer reveal, and archive support.'
  },
  {
    key: 'countryle-answer-today',
    gameName: 'Countryle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily country answer page with directional and comparison hints.'
  },
  {
    key: 'dotadle-answer-today',
    gameName: 'Dotadle',
    mode: 'generic',
    groups: ['gamedle'],
    notes: 'Daily Dota answer page with multiple game modes and fan-focused trivia context.'
  },
  {
    key: 'framed-answer-today',
    gameName: 'Framed',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily movie answer page with archive and reveal-heavy browsing behavior.'
  },
  {
    key: 'globle-answer-today',
    gameName: 'Globle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily mystery country page with geography hints and archive links.'
  },
  {
    key: 'loldle-answer-today',
    gameName: 'LoLdle',
    mode: 'generic',
    groups: ['gamedle'],
    notes: 'Daily League of Legends answer page with multiple modes and character-focused hints.'
  },
  {
    key: 'narutodle-answer-today',
    gameName: 'Narutodle',
    mode: 'generic',
    groups: ['gamedle'],
    notes: 'Daily Naruto answer page with multiple trivia modes and answer sections.'
  },
  {
    key: 'nerdle-answer-today',
    gameName: 'Nerdle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily math puzzle answer page with equation-first solving guidance.'
  },
  {
    key: 'onepiecedle-answer-today',
    gameName: 'OnePiecedle',
    mode: 'generic',
    groups: ['gamedle'],
    notes: 'Daily One Piece answer page with fan-oriented quiz modes.'
  },
  {
    key: 'phoodle-answer-today',
    gameName: 'Phoodle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily food-word answer page with hints, answer reveal, and recent history.'
  },
  {
    key: 'phrazle-answer-today',
    gameName: 'Phrazle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily phrase page with morning and afternoon answers.'
  },
  {
    key: 'pokedle-answer-today',
    gameName: 'Pokedle',
    mode: 'generic',
    groups: ['gamedle'],
    notes: 'Daily Pokemon answer page with multiple themed modes and fan-readable explanations.'
  },
  {
    key: 'quordle-answer-today',
    gameName: 'Quordle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily multi-board word page with several modes like classic, chill, extreme, sequence, rescue, and weekly.'
  },
  {
    key: 'searchle-answer-today',
    gameName: 'Searchle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily search-query answer page with prompt-style hints and archive links.'
  },
  {
    key: 'semantle-answer-today',
    gameName: 'Semantle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily semantic-word page with clue widgets and answer explanation.'
  },
  {
    key: 'smashdle-answer-today',
    gameName: 'Smashdle',
    mode: 'generic',
    groups: ['gamedle'],
    notes: 'Daily Smash Bros answer page with multiple modes and trivia sections.'
  },
  {
    key: 'spotle-answer-today',
    gameName: 'Spotle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily music artist answer page with archive support and music-game context.'
  },
  {
    key: 'sportle-answer-today',
    gameName: 'Sportle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily sports-themed answer page.'
  },
  {
    key: 'worgle-answer-today',
    gameName: 'Worgle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily Welsh-language answer page with the current puzzle answer card, solver support, and archive links.'
  },
  {
    key: 'waffle-answer-today',
    gameName: 'Waffle',
    mode: 'generic',
    groups: ['waffle'],
    notes: 'Daily grid-word answer page with solved layout and supporting explanation.'
  },
  {
    key: 'worldle-answer-today',
    gameName: 'Worldle',
    mode: 'generic',
    groups: ['site', 'main'],
    notes: 'Daily country silhouette page with geography clues and archive lookup.'
  }
];

function parseKeyList(...values) {
  const keys = values
    .filter(Boolean)
    .flatMap((value) => String(value).split(/[\r\n,]+/))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(keys)];
}

function getVisibleDateForBoundary(now, { hourUtc, minuteUtc, visibleOffsetDays = 0 }) {
  const boundary = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hourUtc,
    minuteUtc,
    0,
    0
  );
  const visibleOffset = now.getTime() >= boundary ? visibleOffsetDays : visibleOffsetDays - 1;
  const targetDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + visibleOffset)
  );

  return targetDate.toISOString().slice(0, 10);
}

function getTargetDate(groupName = 'site', now = new Date()) {
  if (process.env.TARGET_DATE) {
    return process.env.TARGET_DATE;
  }

  if (groupName === 'gamedle') {
    return getVisibleDateForBoundary(now, {
      hourUtc: 6,
      minuteUtc: 2,
      visibleOffsetDays: 0
    });
  }

  if (groupName === 'waffle') {
    return getVisibleDateForBoundary(now, {
      hourUtc: 0,
      minuteUtc: 1,
      visibleOffsetDays: 0
    });
  }

  return getVisibleDateForBoundary(now, {
    hourUtc: 16,
    minuteUtc: 30,
    visibleOffsetDays: 1
  });
}

function getDateKeyFromFixedOffset(offsetMinutes, now = new Date()) {
  const localMs = now.getTime() + offsetMinutes * 60_000;
  const local = new Date(localMs);

  return `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}-${String(local.getUTCDate()).padStart(2, '0')}`;
}

const ARTICLE_TARGET_DATE_OVERRIDES = {
  'canuckle-answer-today': {
    type: 'utc-boundary',
    hourUtc: 5,
    minuteUtc: 0,
    visibleOffsetDays: 0
  },
  'colorfle-answer-today': {
    type: 'utc-boundary',
    hourUtc: 15,
    minuteUtc: 0,
    visibleOffsetDays: 1
  },
  'worgle-answer-today': {
    type: 'fixed-offset',
    offsetMinutes: 330
  }
};

function getTargetDateForEntry(entry, now = new Date()) {
  if (process.env.TARGET_DATE) {
    return process.env.TARGET_DATE;
  }

  const override = ARTICLE_TARGET_DATE_OVERRIDES[entry.key];
  if (!override) {
    return getTargetDate(getEntryGenerationGroup(entry), now);
  }

  if (override.type === 'fixed-offset') {
    return getDateKeyFromFixedOffset(override.offsetMinutes, now);
  }

  return getVisibleDateForBoundary(now, {
    hourUtc: override.hourUtc,
    minuteUtc: override.minuteUtc,
    visibleOffsetDays: override.visibleOffsetDays
  });
}

function formatLongDate(dateKey) {
  return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function stripHtml(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeWhitespace(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(html) {
  const text = stripHtml(html);
  if (!text) {
    return 0;
  }

  return text.split(' ').length;
}

function truncateForLog(value, limit = LOG_SNIPPET_LIMIT) {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    return '';
  }

  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function sanitizeModelJson(raw) {
  const text = String(raw ?? '').trim();
  if (!text) {
    throw new Error('Model returned an empty response.');
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error(
      `Model response did not contain a JSON object. Snippet: ${truncateForLog(candidate)}`
    );
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}

function rotateList(items, offset) {
  if (!items.length) {
    return items;
  }

  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  if (normalizedOffset === 0) {
    return items;
  }

  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

function getGenerationGroupName() {
  const raw = String(process.env.GROUP_NAME ?? 'site').trim().toLowerCase();
  return raw || 'site';
}

function getArticleScope() {
  const raw = String(process.env.ARTICLE_SCOPE ?? 'current-group').trim().toLowerCase();
  return raw || 'current-group';
}

// Generation is DISABLED as of 2026-08-15 via the master switch in
// .github/workflows/publish-pages.yml (ENABLE_DAILY_ARTICLE_GENERATION is forced to
// 'false' there). All of this writing logic is kept intact for the planned
// human-written static articles; delete the workflow override to re-enable.
function shouldGenerateArticles() {
  return String(process.env.ENABLE_DAILY_ARTICLE_GENERATION ?? 'false').toLowerCase() === 'true';
}

function getRequestedRouteKeys() {
  return new Set(
    String(process.env.ARTICLE_ROUTE_KEYS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function getConfiguredArticleGroups(groupName) {
  const configuredGroups = String(process.env.ARTICLE_GROUPS_TO_GENERATE ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (configuredGroups.length > 0) {
    return [...new Set(configuredGroups)];
  }

  if (getArticleScope() === 'all-current-windows') {
    return [...BATCH_GROUPS];
  }

  return [groupName];
}

function getSelectedEntries(groupSelection) {
  const requestedRouteKeys = getRequestedRouteKeys();
  const selectedKeys = new Set();
  const groups = Array.isArray(groupSelection)
    ? groupSelection
    : groupSelection === 'all-current-windows'
      ? [...BATCH_GROUPS]
      : [groupSelection];

  return TODAY_ARTICLE_REGISTRY.filter((entry) => {
    const matchesGroup = groups.some((group) => entry.groups.includes(group));
    if (!matchesGroup || selectedKeys.has(entry.key)) {
      return false;
    }

    if (requestedRouteKeys.size > 0 && !requestedRouteKeys.has(entry.key)) {
      return false;
    }

    selectedKeys.add(entry.key);
    return true;
  });
}

function shouldSkipExistingArticles() {
  return String(process.env.ARTICLE_SKIP_EXISTING ?? 'false').toLowerCase() === 'true';
}

function getEntryGenerationGroup(entry) {
  if (entry.groups.includes('waffle')) {
    return 'waffle';
  }
  if (entry.groups.includes('gamedle')) {
    return 'gamedle';
  }
  if (entry.groups.includes('site') || entry.groups.includes('main')) {
    return 'site';
  }

  return entry.groups[0] ?? 'site';
}

function shuffleList(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

async function readSkillText() {
  try {
    const raw = await readFile(skillPath, 'utf8');
    if (!raw.trim()) {
      throw new Error(`Human writing skill file is empty: ${skillPath}`);
    }
    return raw.trim();
  } catch (error) {
    console.warn(
      `Unable to read the human writing skill at ${skillPath}. Article generation will be skipped for this run.`,
      error
    );
    return null;
  }
}

async function readSeoSkillText() {
  try {
    const raw = await readFile(seoSkillPath, 'utf8');
    if (!raw.trim()) {
      console.warn(`SEO skill file is empty: ${seoSkillPath}. Continuing without SEO skill.`);
      return '';
    }
    return raw.trim();
  } catch (error) {
    console.warn(
      `Unable to read the SEO skill at ${seoSkillPath}. Continuing without SEO skill.`,
      error.message
    );
    return '';
  }
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WordSolverX Daily Article Builder',
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }

  return response.json();
}

async function getWordleContext(targetDate) {
  let payload = null;

  try {
    payload = await fetchJson(`${WORDLE_API_BASE_URL}/api/date/${targetDate}?simple=true`);
  } catch (error) {
    console.warn(`Unable to fetch Wordle worker payload for ${targetDate}: ${error}`);
  }

  if (!payload?.solution) {
    const nytPayload = await fetchJson(`https://www.nytimes.com/svc/wordle/v2/${targetDate}.json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 WordSolverX Daily Article Builder'
      }
    });

    payload = {
      id: nytPayload.days_since_launch ?? null,
      date: targetDate,
      solution: nytPayload.solution,
      editor: nytPayload.editor ?? null,
      days_since_launch: nytPayload.days_since_launch ?? null
    };
  }

  let recentAnswers = [];

  try {
    const latestPayload = await fetchJson(`${WORDLE_API_BASE_URL}/api/today?simple=true`);
    recentAnswers = Array.isArray(latestPayload?.recent_answers)
      ? latestPayload.recent_answers.slice(0, 5)
      : [];
  } catch (error) {
    console.warn(`Unable to fetch recent Wordle answers: ${error}`);
  }

  const solution = String(payload.solution ?? '').toLowerCase();
  if (!solution) {
    throw new Error(`Missing Wordle solution for ${targetDate}.`);
  }

  const letters = solution.split('');
  const vowelCount = letters.filter((letter) => 'aeiou'.includes(letter)).length;
  const hasRepeatedLetter = new Set(letters).size !== letters.length;

  return {
    date: targetDate,
    formattedDate: formatLongDate(targetDate),
    solution,
    solutionUpper: solution.toUpperCase(),
    wordleNumber: payload.id ?? payload.days_since_launch ?? null,
    editor: payload.editor ?? null,
    vowelCount,
    hasRepeatedLetter,
    firstLetter: solution[0]?.toUpperCase() ?? '',
    lastLetter: solution.at(-1)?.toUpperCase() ?? '',
    recentAnswers: recentAnswers
      .filter((entry) => entry?.solution && entry?.date)
      .map((entry) => ({
        date: entry.date,
        solution: String(entry.solution).toUpperCase()
      }))
  };
}

function getHueFamilyFromHex(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) {
    return 'neutral';
  }

  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta < 0.1) {
    return max < 0.3 ? 'dark-neutral' : max > 0.7 ? 'light-neutral' : 'neutral';
  }

  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue = ((hue * 60) + 360) % 360;

  if (hue < 30 || hue >= 330) return 'red';
  if (hue < 70) return 'orange';
  if (hue < 90) return 'yellow';
  if (hue < 160) return 'green';
  if (hue < 200) return 'cyan';
  if (hue < 260) return 'blue';
  if (hue < 300) return 'purple';
  return 'pink';
}

async function getColordleContext(targetDate) {
  const raw = await readFile(colordleDataPath, 'utf8');
  const dataset = JSON.parse(raw);
  const entries = Array.isArray(dataset.entries) ? dataset.entries : [];
  const exactEntry = entries.find((candidate) => candidate.date === targetDate) ?? null;

  let entry = exactEntry;
  let actualDate = targetDate;
  let fallbackReason = null;

  if (!entry) {
    try {
      const liveEntry = await fetchJson(`${COLOR_ANSWERS_API_BASE}/api/colordle/date/${targetDate}`);
      if (liveEntry?.color_name && liveEntry?.color_hex) {
        entry = {
          date: String(liveEntry.date ?? targetDate),
          dayNum: liveEntry.day_number ?? null,
          color: {
            name: String(liveEntry.color_name),
            hex: String(liveEntry.color_hex).toUpperCase()
          }
        };
        actualDate = entry.date;
        fallbackReason = 'live-api';
      }
    } catch (error) {
      console.warn(
        `Colordle live API lookup failed for ${targetDate}. Falling back to local dataset only.`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  if (!entry && entries.length > 0) {
    const latestOnOrBefore = [...entries]
      .reverse()
      .find((candidate) => candidate.date <= targetDate);

    if (latestOnOrBefore) {
      entry = latestOnOrBefore;
      actualDate = latestOnOrBefore.date;
      fallbackReason = 'after-end';
    } else {
      entry = entries[0];
      actualDate = entry.date;
      fallbackReason = 'before-start';
    }
  }

  if (!entry?.color?.name || !entry?.color?.hex) {
    throw new Error(`Missing Colordle entry for ${targetDate}.`);
  }

  const recentEntries = entries
    .filter((candidate) => candidate.date <= actualDate)
    .slice(-5);
  if (entry && !recentEntries.some((candidate) => candidate.date === actualDate)) {
    recentEntries.push(entry);
  }

  return {
    requestedDate: targetDate,
    requestedFormattedDate: formatLongDate(targetDate),
    date: actualDate,
    formattedDate: formatLongDate(actualDate),
    exactMatch: actualDate === targetDate,
    fallbackReason,
    dayNum: entry.dayNum ?? null,
    colorName: String(entry.color.name),
    colorHex: String(entry.color.hex).toUpperCase(),
    hueFamily: getHueFamilyFromHex(String(entry.color.hex)),
    recentColors: recentEntries
      .slice()
      .reverse()
      .map((candidate) => ({
        date: candidate.date,
        colorName: String(candidate.color.name),
        colorHex: String(candidate.color.hex).toUpperCase()
      }))
  };
}

// Expanded banned phrases list from superseo-skills anti-slop ruleset
// Tier 1: Always remove — these are the highest-signal AI tells
const BANNED_PHRASES = [
  // Original banned phrases
  'welcome to today',
  'welcome to the',
  'your daily guide',
  "if you're here, you've probably",
  "if you're landing on this page",
  "that's exactly what this page is for",
  "let's get you sorted",
  "let's dive in",
  "you're in the right place",
  "this page is built to",
  "this page is designed to",
  "whether you're a",
  "here's what you need to know",
  "here's the thing:",
  'resonates deeply',
  'resonates powerfully',
  'cultural touchstone',
  'shared daily experience',
  'one of the most unique',
  'one of the most popular',
  'one of the most beloved',
  'one of the most comprehensive',
  'fascinating dataset',
  'fascinating window',
  'fascinating resource',
  'fascinating patterns',
  'incredible depth',
  'incredible breadth',
  'incredible historical depth',
  'ai-powered',
  'ai-assisted',
  'machine learning',
  'language model',
  'mastering the',
  'what makes this game distinctive',
  'not officially affiliated',
  // Anti-slop Tier 1 additions from superseo-skills
  'delve',
  'tapestry',
  'realm of',
  'landscape', // metaphorical use
  'multifaceted',
  'testament',
  'cutting-edge',
  'revolutionary',
  'game-changer',
  'unlock potential',
  'harness',
  'endeavour',
  'embark',
  'navigate', // metaphorical
  'pivotal',
  'intricate',
  'seamless',
  'robust',
  'transformative',
  'meticulous',
  'facilitate',
  'utilize',
  'commence',
  'paramount',
  'plethora',
  'myriad',
  'culminate',
  'underscore',
  'bolster',
  'spearhead',
  'vibrant',
  'innovative',
  // Banned phrases from anti-slop
  "it's worth noting",
  "in today's",
  'furthermore',
  'moreover',
  'additionally',
  "without further ado",
  'in conclusion',
  'in summary',
  'in essence',
  "it's important to note",
  'stands as a testament',
  'plays a vital role',
  'plays a crucial role',
  'plays a pivotal role',
  'in the realm of',
  'it goes without saying',
  'buckle up',
  'strap in',
  'ever-evolving landscape',
  'marking a pivotal moment',
  'showcase',
  'streamline',
  'comprehensive'  // as adjective
];

const AUTO_PHRASE_REPLACEMENTS = [
  [/\bin today's\b/gi, 'for this'],
  [/\bin today’s\b/gi, 'for this'],
  [/\badditionally\b/gi, 'also'],
  [/\bfurthermore\b/gi, 'also'],
  [/\bmoreover\b/gi, 'also'],
  [/\bit's worth noting\b/gi, 'keep in mind'],
  [/\bit is worth noting\b/gi, 'keep in mind'],
  [/\bwithout further ado\b/gi, ''],
  [/\bmastering the\b/gi, 'solving'],
  [/\bmachine learning\b/gi, 'semantic similarity'],
  [/\blandscape\b/gi, 'field'],
  [/\bshowcase\b/gi, 'highlight'],
  [/\bstreamline\b/gi, 'simplify'],
  [/\bcomprehensive\b/gi, 'detailed']
];

const AUTO_PERSONAL_VOICE_REPLACEMENTS = [
  [
    /\bI (burned|guessed|opened|started|missed|needed|stared|wasted|hesitated|plugged|spotted|noticed|kept|played|solved|tracked|logged|use|used|figured|checked|lost)\b/gi,
    'players $1'
  ],
  [/\bI['â€™]ve (logged|tracked|kept|played|solved|noticed)\b/gi, 'players have $1'],
  [/\bmy (streak|guess|guesses|path|notes|spreadsheet|sheet|brain|rule|tracking|opener|play|morning)\b/gi, 'the $1']
];

function containsBannedPhrases(html) {
  const lower = String(html ?? '').toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      return phrase;
    }
  }
  return null;
}

function autoCleanGeneratedHtml(html) {
  let cleaned = String(html ?? '');
  for (const [pattern, replacement] of AUTO_PHRASE_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  cleaned = cleaned.replace(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    if (findDisallowedPersonalVoice(block)) {
      return '';
    }

    let cleanedBlock = block;
    for (const [pattern, replacement] of AUTO_PERSONAL_VOICE_REPLACEMENTS) {
      cleanedBlock = cleanedBlock.replace(pattern, replacement);
    }
    return cleanedBlock;
  });

  for (const [pattern, replacement] of AUTO_PERSONAL_VOICE_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned
    .replace(/\s{2,}/g, ' ')
    .replace(/> +</g, '><')
    .trim();
}

function normalizeHintList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  for (const entry of value) {
    const hint = normalizeWhitespace(entry);
    if (!hint) {
      continue;
    }

    const key = hint.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(hint);
  }

  return normalized;
}

function ensureMinimumHints(existingHints, fallbackHints, minimum = 4) {
  const normalized = normalizeHintList(existingHints);

  for (const hint of normalizeHintList(fallbackHints)) {
    if (normalized.length >= minimum) {
      break;
    }

    const key = hint.toLowerCase();
    if (!normalized.some((entry) => entry.toLowerCase() === key)) {
      normalized.push(hint);
    }
  }

  return normalized.slice(0, Math.max(minimum, normalized.length));
}

function buildWordleFallbackHints(context) {
  const vowelText = context.vowelCount === 1 ? '1 vowel' : `${context.vowelCount} vowels`;
  return [
    `The answer starts with ${context.firstLetter}.`,
    `The answer ends with ${context.lastLetter}.`,
    `It contains ${vowelText}.`,
    context.hasRepeatedLetter ? 'One letter appears more than once.' : 'No letters repeat.',
    'Think of a common household word rather than a niche term.'
  ];
}

function buildColordleFallbackHints(context) {
  return [
    `The target sits in the ${context.hueFamily} family.`,
    `The hex code begins ${context.colorHex.slice(0, 4)}.`,
    'The color name is a familiar everyday label, not a technical pigment term.',
    'Closer guesses usually come from changing hue first, then brightness and saturation.',
    'Big score jumps usually mean the dominant channel moved in the right direction.'
  ];
}

const BANNED_PHRASE_LIST_LINES = [
  'BANNED PHRASES — never use any of these, even paraphrased:',
  '- "Welcome to today\'s..." or "Welcome to [game]..."',
  '- "Your daily guide to..."',
  '- "If you\'re here, you\'ve probably..." or "If you\'re landing on this page..."',
  '- "That\'s exactly what this page is for"',
  '- "Let\'s get you sorted" or "Let\'s dive in"',
  '- "Either way, you\'re in the right place"',
  '- "This page is built/designed to help you..."',
  '- "Whether you\'re a [X] or a [Y]..."',
  '- "Here\'s what you need to know"',
  '- "Here\'s the thing:"',
  '- "Furthermore", "Moreover", "Additionally", "It is worth noting", "In conclusion"',
  '- "resonates [deeply/powerfully] with"',
  '- "cultural touchstone", "shared daily experience"',
  '- "one of the most [unique/popular/beloved/comprehensive]"',
  '- "fascinating [dataset/window/resource/patterns]"',
  '- "incredible [depth/breadth/historical depth]"',
  '- "Master/Mastering [Game]" as a phrase',
  '- "AI-powered", "AI-assisted", "machine learning", "language model"',
  '- Any sentence that could appear on a different game\'s page with just the name swapped',
  '',
  'EXPANDED BANNED WORDS (anti-slop from superseo-skills):',
  '- NEVER use: delve, tapestry, realm, landscape (metaphorical), multifaceted, nuanced, testament,',
  '  cutting-edge, revolutionary, comprehensive (adjective), crucial, compelling, vibrant, game-changer,',
  '  leverage (verb), unlock potential, harness, endeavour, embark, navigate (metaphorical), pivotal,',
  '  intricate, innovative, seamless, robust, transformative, meticulous, facilitate, utilize, commence,',
  '  paramount, plethora, myriad, culminate, underscore, bolster, spearhead, showcase, streamline',
  '- NEVER use: "It\'s worth noting", "In today\'s [anything]", "Let\'s dive in", "In conclusion",',
  '  "plays a crucial/vital/pivotal role", "It goes without saying", "In the realm of"',
  '- AVOID: rule-of-three groupings (use 2 or 4 items instead)',
  '- AVOID: synonym cycling (repeat the right word rather than finding alternatives)',
  '- AVOID: em-dash chains (max 1-2 per 1000 words)',
  '- AVOID: binary contrasts ("it\'s not X, it\'s Y")',
  '- AVOID: participial tack-ons ("...highlighting the importance of X")',
  '- AVOID: clustering of: however, notably, essentially, that said, arguably',
  '',
  'REQUIRED WRITING STYLE:',
  '- Start directly with something specific about today\'s puzzle or answer. No warm-up paragraph.',
  '- Write like an experienced editor reviewing today\'s verified puzzle data, not like a diary entry.',
  '- Vary sentence length: some short and punchy, some longer and explanatory.',
  '- Include at least one specific, opinionated observation per section.',
  '- End sections with a useful tip or next step, not a summary.',
  '- Never repeat the same information in multiple sections.',
  '- Do not write encyclopedic background about the game — the reader already plays it.',
  '- Do not write a "Why fans love this game" section — that is filler.',
  '- Vary paragraph structure. Not every paragraph should be 3 sentences.',
  '- Use contractions: "doesn\'t" not "does not."',
  '- Show, don\'t just state. Use puzzle-specific observations instead of generic scene-setting.',
  '- Break the topic-sentence-support pattern. Start some paragraphs with an example or question.',
  '',
  'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) REQUIREMENTS:',
  '- Do not claim you personally played, solved, logged, tracked, or reviewed the puzzle unless that evidence is explicitly provided.',
  '- Include internal links only when they genuinely help the reader reach a solver, archive, or related answer page.',
  '- Be transparent about limitations: if the data supplied is thin, say less instead of inventing details.',
  '- Use specific, concrete observations from the puzzle data provided — no generic filler',
  '- Every factual claim must be supportable from the puzzle data given or stable game rules.',
  '- Never invent percentages, difficulty ratings, private spreadsheets, Discord chatter, or long-term tracking.',
  '- Show experience without fake first-person claims: describe what a careful daily player would notice from the answer card, clue widget, archive, or solver flow.',
  '- Make freshness visible. Anchor at least one observation to the supplied date or the current puzzle context instead of writing an evergreen article that could run any day.',
  '- Avoid repeating the same section rhythm across routes. Mix short paragraphs, one compact list when it helps, and direct FAQ answers only where they add value.',
  '- Write in Preston Hayes\' editorial voice without pretending to narrate Preston\'s personal gameplay.',
  '',
  'SEO STRUCTURE REQUIREMENTS:',
  '- Place a 40-60 word direct answer immediately after the first H2 — targets featured snippets',
  '- Weave 2-3 People Also Ask questions into the article as H2/H3 headings with direct answers',
  '- Include 3-5 internal links per 1000 words. Use descriptive anchor text — never "click here"',
  '- Front-load value. The first screen is the highest-value real estate. No preamble paragraphs',
  '- Primary keyword should appear in H1, first 100 words, and 2-3 H2s'
];

function buildWordlePrompt(skillText, context, seoSkillText = '') {
  const seoSection = seoSkillText
    ? [
        '',
        'SEO writing rules to follow (from superseo-skills):',
        seoSkillText,
        ''
      ]
    : [];

  return [
    'You are writing a daily Wordle answer page for a real site. Return JSON only.',
    '',
    'Write in Preston Hayes\' editorial voice for WordSolverX. Sound experienced and specific, but do not claim first-hand gameplay, private logs, or biography details that were not supplied.',
    '',
    'Human writing rules to follow:',
    skillText,
    ...seoSection,
    ...BANNED_PHRASE_LIST_LINES,
    '',
    'Output shape:',
    '{',
    '  "title": "string",',
    '  "summary": "18-30 words",',
    '  "bonusHints": ["string", "string", "string", "string"],',
    '  "contentGuideHtml": "valid HTML fragment" ',
    '}',
    '',
    'Critical rules:',
    '- `contentGuideHtml` must target 820-1200 words after HTML tags are stripped.',
    '- Do not use markdown fences.',
    '- Do not sound like generic AI or SEO filler.',
    '- `bonusHints` must contain exactly 4 distinct strings.',
    '- Do not use first-person gameplay anecdotes such as "I guessed", "I burned", or "my streak".',
    '- Do not invent personal stories, test results, private knowledge, or fake long-term tracking.',
    '- Use concrete observations from the word itself and the recent answers provided.',
    '- Never use the phrase "in today\'s". Prefer "for this puzzle", "on this board", or a direct noun phrase.',
    '- Keep the first 5 hints spoiler-safe. Do not reveal the answer before the reveal section.',
    '- Use straightforward American English.',
    '- Keep links internal to wordsolverx.com only when you actually need a link.',
    '- Avoid fake etymology or dictionary trivia unless you are highly confident from general knowledge.',
    '- Prefer fuller, human paragraphs: usually 2-4 sentences, with a single-sentence paragraph only when it lands a sharp takeaway.',
    '- Vary sentence length naturally. Avoid machine-like runs of tiny sentences, but also avoid bloated walls of text.',
    '- Never place two H2 headings back to back. Every H2 must earn at least one substantial paragraph before the next section begins.',
    '',
    'Required exact section order inside `contentGuideHtml`:',
    '1. `<h2>5 Hints for Today\'s Wordle</h2>` followed by `<ul class="hints-list">...</ul>`',
    '2. `<h2>Today\'s Wordle Answer Revealed</h2>` followed by one reveal paragraph',
    '3. `<h2>Why This Word Fits Today\'s Puzzle</h2>`',
    '4. `<h2>Meaning and Everyday Use</h2>`',
    '5. `<h2>How to Work Toward the Answer</h2>`',
    '6. `<h2>Best Starter Ideas for This Puzzle</h2>`',
    '7. `<h2>Recent Wordle Pattern Notes</h2>`',
    '8. `<h2>Extra Tips for Keeping a Streak Alive</h2>`',
    '9. `<h2>Frequently Asked Questions</h2>` with at least 4 `<h3>` question headings',
    '',
    'Wordle facts for this page:',
    `- Date: ${context.formattedDate} (${context.date})`,
    `- Answer: ${context.solutionUpper}`,
    `- Puzzle number: ${context.wordleNumber ?? 'unknown'}`,
    `- Editor: ${context.editor ?? 'unknown'}`,
    `- Vowel count: ${context.vowelCount}`,
    `- Has repeated letters: ${context.hasRepeatedLetter ? 'yes' : 'no'}`,
    `- Starts with: ${context.firstLetter}`,
    `- Ends with: ${context.lastLetter}`,
    `- Recent answers: ${context.recentAnswers.map((entry) => `${entry.solution} (${entry.date})`).join(', ') || 'none supplied'}`,
    '',
    'Make the summary and bonus hints useful but concise. Bonus hints should feel like fresh extra clues, not copies of the main five hints.'
  ].join('\n');
}

function buildColordlePrompt(skillText, context, seoSkillText = '') {
  const seoSection = seoSkillText
    ? [
        '',
        'SEO writing rules to follow (from superseo-skills):',
        seoSkillText,
        ''
      ]
    : [];

  return [
    'You are writing a daily Colordle answer page for a real site. Return JSON only.',
    '',
    'Write in Preston Hayes\' editorial voice for WordSolverX. Sound experienced and specific, but do not claim first-hand gameplay, private logs, or biography details that were not supplied.',
    '',
    'Human writing rules to follow:',
    skillText,
    ...seoSection,
    ...BANNED_PHRASE_LIST_LINES,
    '',
    'Output shape:',
    '{',
    '  "title": "string",',
    '  "summary": "18-30 words",',
    '  "bonusHints": ["string", "string", "string", "string"],',
    '  "articleHtml": "valid HTML fragment"',
    '}',
    '',
    'Critical rules:',
    '- `articleHtml` must target 760-1100 words after HTML tags are stripped.',
    '- Do not use markdown fences.',
    '- `bonusHints` must contain exactly 4 distinct strings.',
    '- Do not use first-person gameplay anecdotes or made-up scoring data.',
    '- The site already has logic-based color clues and a logic-based guess path. Your job is to write the surrounding human article text only.',
    '- Keep the writing grounded in the supplied color name, hex code, hue family, and recent history.',
    '- Never use the phrase "in today\'s". Prefer "for this puzzle", "on this board", or a direct noun phrase.',
    '- Use valid HTML with clear headings and normal paragraphs.',
    '- Prefer fuller, human paragraphs: usually 2-4 sentences, with a single-sentence paragraph only when it lands a sharp takeaway.',
    '- Vary sentence length naturally. Avoid machine-like runs of tiny sentences, but also avoid bloated walls of text.',
    '- Never place two H2 headings back to back. Every H2 must earn at least one substantial paragraph before the next section begins.',
    '',
    'Required section order inside `articleHtml`:',
    '1. `<h2>Today\'s Colordle answer at a glance</h2>`',
    '2. `<h2>What kind of color this is</h2>`',
    '3. `<h2>How to narrow your guesses toward it</h2>`',
    '4. `<h2>Where players usually go wrong</h2>`',
    '5. `<h2>How the score logic actually helps</h2>`',
    '6. `<h2>Questions players keep asking</h2>` with at least 4 `<h3>` question headings',
    '',
    'Colordle facts for this page:',
    `- Date: ${context.formattedDate} (${context.date})`,
    `- Day number: ${context.dayNum ?? 'unknown'}`,
    `- Color name: ${context.colorName}`,
    `- Hex code: ${context.colorHex}`,
    `- Hue family: ${context.hueFamily}`,
    `- Recent colors: ${context.recentColors.map((entry) => `${entry.colorName} ${entry.colorHex} (${entry.date})`).join(', ') || 'none supplied'}`,
    '',
    'Make the bonus hints feel like extra nudges a human editor would add after checking the answer page.'
  ].join('\n');
}

function getGameGroup(key) {
  if (key.startsWith('loldle') || key.startsWith('dotadle') || key.startsWith('narutodle') ||
      key.startsWith('onepiecedle') || key.startsWith('pokedle') || key.startsWith('smashdle')) {
    return 'gamedle';
  }
  if (key.startsWith('globle') || key.startsWith('worldle') || key.startsWith('countryle')) {
    return 'geography';
  }
  if (key.startsWith('phoodle') || key.startsWith('phrazle') || key.startsWith('semantle') ||
      key.startsWith('contexto') || key.startsWith('searchle') || key.startsWith('quordle')) {
    return 'word';
  }
  if (key.startsWith('framed') || key.startsWith('colordle') || key.startsWith('colorfle') ||
      key.startsWith('waffle') || key.startsWith('spotle')) {
    return 'visual';
  }
  return 'other';
}

const temperatureMap = {
  wordle: 0.78,
  colordle: 0.8,
  gamedle: 0.76,
  geography: 0.78,
  word: 0.78,
  visual: 0.8,
  other: 0.77
};

const ROUTE_SECTION_BLUEPRINTS = {
  'betweenle-answer-today': [
    "<h2>Betweenle answer today: what to notice before the reveal</h2>",
    "<h2>How the alphabetical gap tightens</h2>",
    "<h2>When the clue cards do the real work</h2>",
    "<h2>Fast way to solve tomorrow's Betweenle</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'canuckle-answer-today': [
    "<h2>Canuckle answer today: what stands out first</h2>",
    "<h2>Why the Canadian angle matters on this board</h2>",
    "<h2>Where players overguess the pattern</h2>",
    "<h2>Simple way to play the next Canuckle cleaner</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'colordle-answer-today': [
    "<h2>Colordle answer today: what the shade family tells you first</h2>",
    "<h2>How to read percentage feedback without fooling yourself</h2>",
    "<h2>Why near-miss colors waste more guesses than they seem</h2>",
    "<h2>How to tighten the next Colordle more calmly</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'colorfle-answer-today': [
    "<h2>Colorfle answer today: how the mix should be read</h2>",
    "<h2>What the source colors are telling you</h2>",
    "<h2>Why additive color logic beats random mixing</h2>",
    "<h2>Easy adjustment path for the next Colorfle</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'contexto-answer-today': [
    "<h2>Contexto answer today: what the rank pattern usually means</h2>",
    "<h2>When to pivot categories instead of forcing synonyms</h2>",
    "<h2>Why broad words beat clever words here</h2>",
    "<h2>How to cut tomorrow's guess count</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'globle-answer-today': [
    "<h2>Globle answer today: what the heat clues point to first</h2>",
    "<h2>How to read warm guesses without rushing</h2>",
    "<h2>Where the map logic usually breaks down</h2>",
    "<h2>Better way to triangulate the next Globle</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'countryle-answer-today': [
    "<h2>Countryle answer today: which clue should lead the solve</h2>",
    "<h2>How population, area, and continent clues work together</h2>",
    "<h2>What usually sends players to the wrong country</h2>",
    "<h2>How to narrow tomorrow's Countryle faster</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'framed-answer-today': [
    "<h2>Framed answer today: what the opening still usually gives away</h2>",
    "<h2>How genre beats exact movie recall early</h2>",
    "<h2>Where a single memorable frame can mislead you</h2>",
    "<h2>How to clean up tomorrow's Framed in fewer reveals</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'quordle-answer-today': [
    "<h2>Quordle answer today: what the boards are asking first</h2>",
    "<h2>How to split attention across four grids</h2>",
    "<h2>Which guesses pull double duty best</h2>",
    "<h2>How to finish the next Quordle with fewer panicked guesses</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'nerdle-answer-today': [
    "<h2>Nerdle answer today: what the equation structure is hinting at</h2>",
    "<h2>How operators and digit coverage do the heavy lifting</h2>",
    "<h2>When a tidy-looking equation is still the wrong branch</h2>",
    "<h2>How to solve tomorrow's Nerdle more efficiently</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'phoodle-answer-today': [
    "<h2>Phoodle answer today: what kind of kitchen word it feels like first</h2>",
    "<h2>How to separate ingredient, dish, and technique clues</h2>",
    "<h2>Where familiar food words become the wrong guess</h2>",
    "<h2>How to make the next Phoodle easier</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'phrazle-answer-today': [
    "<h2>Phrazle answer today: what the phrase structure is telling you</h2>",
    "<h2>How to read color feedback across multiple words</h2>",
    "<h2>Why good single words can still make bad phrase guesses</h2>",
    "<h2>How to approach tomorrow's Phrazle with less chaos</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'searchle-answer-today': [
    "<h2>Searchle answer today: what the prompt is really asking</h2>",
    "<h2>How autocomplete logic narrows the answer</h2>",
    "<h2>Why obvious phrasing usually wins</h2>",
    "<h2>How to read tomorrow's Searchle faster</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'semantle-answer-today': [
    "<h2>Semantle answer today: what the warm scores are pointing toward</h2>",
    "<h2>How to explore a semantic lane on purpose</h2>",
    "<h2>When simple words do more than precise ones</h2>",
    "<h2>How to reset without wasting twenty guesses</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'spotle-answer-today': [
    "<h2>Spotle answer today: which clue should matter first</h2>",
    "<h2>How genre, country, and era work together</h2>",
    "<h2>What usually causes the wrong artist guess</h2>",
    "<h2>Best way to solve the next Spotle faster</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'waffle-answer-today': [
    "<h2>Waffle answer today: how to read the solved grid</h2>",
    "<h2>Which swaps usually unlock two words at once</h2>",
    "<h2>Where players leak moves they did not need to spend</h2>",
    "<h2>How to finish tomorrow's Waffle more cleanly</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'worgle-answer-today': [
    "<h2>Worgle answer today: what the Welsh letter pattern is hinting at</h2>",
    "<h2>How to read common Welsh digraphs without overforcing them</h2>",
    "<h2>Where English guessing habits break the solve</h2>",
    "<h2>How to handle tomorrow's Worgle more smoothly</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'worldle-answer-today': [
    "<h2>Worldle answer today: what the silhouette should suggest first</h2>",
    "<h2>How direction and distance clues narrow the shape</h2>",
    "<h2>Why neighboring countries become the easy wrong answer</h2>",
    "<h2>How to finish tomorrow's Worldle with fewer detours</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'dotadle-answer-today': [
    "<h2>Dotadle answer today: which hero clues carry the most weight</h2>",
    "<h2>How to cut the Dota roster faster</h2>",
    "<h2>When roles help and when they mislead</h2>",
    "<h2>Smarter way to approach tomorrow's Dotadle</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'loldle-answer-today': [
    "<h2>LoLdle answer today: what the champion clues narrow first</h2>",
    "<h2>How to separate universe, role, and release-year signals</h2>",
    "<h2>Which mode usually breaks the streak</h2>",
    "<h2>How to guess tomorrow's LoLdle more efficiently</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'narutodle-answer-today': [
    "<h2>Narutodle answer today: which filters matter most</h2>",
    "<h2>How village, rank, and chakra clues work together</h2>",
    "<h2>Where Naruto knowledge gaps usually show up</h2>",
    "<h2>How to solve tomorrow's Narutodle with fewer wild guesses</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'onepiecedle-answer-today': [
    "<h2>OnePiecedle answer today: what the clue stack narrows first</h2>",
    "<h2>How crew, bounty, and ability clues separate the field</h2>",
    "<h2>Why familiar names can still be wrong here</h2>",
    "<h2>How to clean up the next OnePiecedle faster</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'pokedle-answer-today': [
    "<h2>Pokedle answer today: what the strongest attribute signal is</h2>",
    "<h2>How generation, type, and stage narrow the pool</h2>",
    "<h2>Where players confuse similar Pokemon lines</h2>",
    "<h2>How to approach tomorrow's Pokedle more cleanly</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ],
  'smashdle-answer-today': [
    "<h2>Smashdle answer today: which fighter clue matters first</h2>",
    "<h2>How universe and movement stats split the roster</h2>",
    "<h2>Why DLC fighters cause so many misses</h2>",
    "<h2>How to tighten the next Smashdle faster</h2>",
    "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
  ]
};

function getGenericSections(entry) {
  const routeBlueprint = ROUTE_SECTION_BLUEPRINTS[entry.key];
  if (routeBlueprint) {
    return routeBlueprint;
  }

  const sectionSets = {
    geography: [
      "<h2>[GAME] answer today: what the location clues imply first</h2>",
      "<h2>How to read the directional and distance pressure</h2>",
      "<h2>Where the easy geography guesses go wrong</h2>",
      "<h2>How to solve the next [GAME] faster</h2>",
      "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
    ],
    word: [
      "<h2>[GAME] answer today: what the clue pattern is pushing toward</h2>",
      "<h2>How to read the clue pressure without rushing</h2>",
      "<h2>When to stop guessing and start narrowing</h2>",
      "<h2>How to make tomorrow's [GAME] easier</h2>",
      "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
    ],
    visual: [
      "<h2>[GAME] answer today: what stands out before the reveal</h2>",
      "<h2>How to read the visual signal instead of chasing noise</h2>",
      "<h2>Common wrong reads that slow the board down</h2>",
      "<h2>How to solve the next [GAME] more smoothly</h2>",
      "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
    ],
    gamedle: [
      "<h2>[GAME] answer today: what the mode cards are confirming</h2>",
      "<h2>Which attributes deserve your attention first</h2>",
      "<h2>Where players burn guesses on the wrong branch</h2>",
      "<h2>When the solver genuinely saves time</h2>",
      "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
    ],
    other: [
      "<h2>[GAME] answer today: what matters most on this page</h2>",
      "<h2>What to pay attention to before you reveal anything else</h2>",
      "<h2>Mistakes that usually cost the clean solve</h2>",
      "<h2>How to play the next [GAME] more efficiently</h2>",
      "<h2>Questions players keep asking</h2> with at least 4 <h3> question headings"
    ]
  };

  const group = getGameGroup(entry.key);
  const sections = sectionSets[group] || sectionSets.other;
  return sections.map(s => s.replace('[GAME]', entry.gameName));
}

const GAME_CUSTOM_INSTRUCTIONS = {
  'loldle-answer-today': 'Focus on champion attributes (gender, position, species). League has 170+ champions — emphasize how the solver helps narrow from that massive pool.',
  'dotadle-answer-today': 'Dota 2 heroes have flexible lane assignments and primary attributes. Mention Strength/Agility/Intelligence/Universal hero differences.',
  'nerdle-answer-today': 'Nerdle uses equations, not words. Focus on digit coverage, operator placement, and equals sign positioning. Give specific equation-building advice.',
  'quordle-answer-today': 'Quordle is four Wordle boards sharing guesses. Key insight: guesses must serve all four boards simultaneously.',
  'worldle-answer-today': 'Worldle shows country silhouettes with directional/percentage hints. Discuss how continent knowledge beats raw geography trivia.',
  'canuckle-answer-today': 'Canadian-themed words. Answer pool is smaller than Wordle (~2,300 words). Canadian geography, slang, and bilingual terms show up often.',
  'contexto-answer-today': 'Contexto ranks by semantic similarity, not letter matching. Think about word associations and categories, not letter positions.',
  'semantle-answer-today': 'Semantle uses Word2vec similarity scores 0-100. The 1000th-closest word usually scores ~10-15. If you hit 30+, you are getting warm.',
  'betweenle-answer-today': 'Betweenle tells you if the answer comes before or after your guess alphabetically. Treat it like a binary search.',
  'searchle-answer-today': 'Searchle shows Google autocomplete predictions. Pop culture, current events, and evergreen questions dominate.',
  'framed-answer-today': 'Framed shows movie stills one frame at a time. Genre recognition matters more than specific film knowledge early on.',
  'spotle-answer-today': 'Spotle gives clues about a music artist — genre, debut year, group size, gender, nationality.',
  'colorfle-answer-today': 'Guess the three RGB colors that mix to create a target. Understanding additive color mixing (not paint mixing) is key.',
  'countryle-answer-today': 'Hints about continent, hemisphere, population, area, temperature, and coordinates. Continent is your strongest first filter.',
  'globle-answer-today': 'Heat map shows how close your guess is. Start with a central country on each continent to triangulate.',
  'phoodle-answer-today': 'Food-related words only. Think cooking terms, ingredients, cuisines, and kitchen tools.',
  'phrazle-answer-today': 'Guess a phrase, not a single word. Common idioms, proverbs, and pop culture quotes dominate.',
  'waffle-answer-today': 'Rearrange letters into crossing words. Focus on the green (correct) letters first to anchor your solve.',
  'worgle-answer-today': 'Welsh-language Wordle. W, Y, and DD are very common in Welsh vocabulary.',
  'colordle-answer-today': 'Guess a named color. Score reflects perceptual distance in color space. Knowing color families narrows faster than random guessing.',
  'pokedle-answer-today': 'Pokemon answers. Generation, type, evolution stage, and habitat are the key attributes.',
  'narutodle-answer-today': 'Naruto characters. Village, rank, chakra nature, and debut arc are the strongest filters.',
  'onepiecedle-answer-today': 'One Piece characters. Crew affiliation, bounty range, devil fruit status, and haki type are key discriminators.',
  'smashdle-answer-today': 'Smash Bros fighters. Universe, weight class, and jump count are the most reliable filters.',
  'sportle-answer-today': 'Sports-themed words. Think equipment, positions, venues, and sports terminology.'
};

function buildGenericPrompt(skillText, entry, targetDate, seoSkillText = '') {
  const formattedDate = formatLongDate(targetDate);
  const customInstruction = GAME_CUSTOM_INSTRUCTIONS[entry.key];

  const seoSection = seoSkillText
    ? [
        '',
        'SEO writing rules to follow (from superseo-skills):',
        seoSkillText,
        ''
      ]
    : [];

  const lines = [
    'You are writing a daily answer-page article for a real puzzle website. Return JSON only.',
    '',
    'Write in Preston Hayes\' editorial voice for WordSolverX. Sound experienced and specific, but do not claim first-hand gameplay, private logs, or biography details that were not supplied.',
    '',
    'Human writing rules to follow:',
    skillText,
    ...seoSection,
    ...BANNED_PHRASE_LIST_LINES,
    '',
    'Output shape:',
    '{',
    '  "title": "string",',
    '  "summary": "18-30 words",',
    '  "articleHtml": "valid HTML fragment" ',
    '}',
    '',
    'Critical rules:',
    '- `articleHtml` must target 780-1200 words after HTML tags are stripped.',
    '- Do not use markdown fences.',
    '- Do not mention AI, prompts, models, or automation.',
    '- Do not use first-person gameplay anecdotes such as "I guessed", "I burned", or "my streak".',
    '- Do not make up private stats, fake test runs, first-hand experiences, difficulty ratings, or percentages unless they were explicitly provided in the page facts.',
    '- Use simple, everyday U.S. English. Sound like a sharp daily editor, not a professor or a marketer.',
    '- Keep a short evergreen explanation of what the game is, but do not let the whole article become static filler.',
    '- Make the article feel like a real daily update tied to the current date and the page purpose.',
    '- Keep the tone natural, specific, and non-corporate.',
    '- Never use the phrase "in today\'s". Prefer "for this puzzle", "on this board", or a direct noun phrase.',
    '- Prefer fuller, human paragraphs: usually 2-4 sentences, with a single-sentence paragraph only when it lands a sharp takeaway.',
    '- Vary sentence length naturally. Avoid machine-like runs of tiny sentences, but also avoid bloated walls of text.',
    '- Never place two H2 headings back to back. Every H2 must earn at least one substantial paragraph before the next section begins.',
    '- After the first H2, write a direct 40-60 word paragraph that gives immediate value to the reader.',
    '- Make that first paragraph quote-ready and self-contained so it works for featured snippets and AI citations.',
    '- Let one section read like a believable post-game takeaway from a skilled editor: "A careful player usually notices..." is fine. Fake "I played this" language is not.',
    '- Treat the answer card, clue widgets, archive links, and solver links on the page as verified context. Use them instead of padding the article with broad game history.',
    '- Make each route feel structurally different. Follow the exact heading blueprint below instead of recycling one universal outline.',
    '- Explain how a careful player would read the puzzle data, but do not pretend you personally played or solved it.',
    '- You do not have verified answer-specific facts for this route unless they appear explicitly in the page facts below.',
    '- Do not name the exact answer, country, movie title, color, puzzle number, silhouette detail, or board-specific clue unless it appears in verified facts.',
    '- If exact answer facts are not supplied, refer to "the answer above", "the reveal card", "today\'s page", or "the archive/solver on this page" instead of inventing specifics.',
    '- Pass Google\'s Who/How/Why test in tone: make it obvious the page exists to help a player verify the answer quickly, understand the solve path, and move to the right on-site tool if needed.',
    '- Show how the write-up was built from visible page elements only: answer card, hint widgets, archive history, solver links, and other verified page data. Do not mention prompts, models, or hidden workflow.',
    '- Use internal links sparingly and only when they clearly help, usually to the solver, archive, or a closely related answer resource on WordSolverX.',
    '',
    'Required sections inside `articleHtml` (use these exact headings):',
    ...getGenericSections(entry).map((s, i) => `${i + 1}. ${s}`),
    '',
    'Page facts:',
    `- Game: ${entry.gameName}`,
    `- Route key: ${entry.key}`,
    `- Date: ${formattedDate} (${targetDate})`,
    `- Page notes: ${entry.notes}`,
    '',
    'Keep the copy useful for someone landing on an "answer today" page. Mention hints, reveal behavior, archive links, or solver links when that makes sense for the page type.'
  ];

  if (customInstruction) {
    lines.push(
      '',
      'Game-specific writing guidance (use this to make the article feel genuinely tied to this game, not a template):',
      customInstruction
    );
  }

  return lines.join('\n');
}

function extractMessageContent(choice) {
  if (typeof choice === 'string') {
    return choice;
  }

  if (Array.isArray(choice)) {
    return choice
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (typeof item?.text === 'string') {
          return item.text;
        }
        if (typeof item?.content === 'string') {
          return item.content;
        }
        if (typeof item?.value === 'string') {
          return item.value;
        }
        return '';
      })
      .join('')
      .trim();
  }

  if (choice && typeof choice === 'object') {
    if (typeof choice.content === 'string') {
      return choice.content;
    }
    if (typeof choice.text === 'string') {
      return choice.text;
    }
  }

  return '';
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfter(headerValue) {
  if (!headerValue) {
    return null;
  }

  const deltaSeconds = Number.parseInt(headerValue, 10);
  if (!Number.isNaN(deltaSeconds) && deltaSeconds > 0 && deltaSeconds < 3600) {
    return deltaSeconds * 1000;
  }

  const dateValue = new Date(headerValue);
  if (Number.isNaN(dateValue.getTime())) {
    return null;
  }

  const delayMs = dateValue.getTime() - Date.now();
  return delayMs > 0 ? delayMs : null;
}

function extractAsyncRequestId(response, payload) {
  const headerRequestId =
    response.headers.get('nvcf-reqid') ??
    response.headers.get('x-request-id') ??
    response.headers.get('request-id');

  if (headerRequestId) {
    return headerRequestId;
  }

  if (payload && typeof payload === 'object') {
    return payload.requestId ?? payload.request_id ?? payload.id ?? null;
  }

  return null;
}

function buildModelRequestSettings(model) {
  const normalizedModel = String(model ?? '').toLowerCase();
  const baseSettings = {
    top_p: ARTICLE_TOP_P,
    top_k: ARTICLE_TOP_K,
    presence_penalty: ARTICLE_PRESENCE_PENALTY,
    repetition_penalty: ARTICLE_REPETITION_PENALTY
  };

  if (normalizedModel.includes('qwen3.5-397b-a17b') || normalizedModel.includes('qwen3.5-122b-a10b')) {
    return {
      ...baseSettings,
      chat_template_kwargs: {
        enable_thinking: false
      }
    };
  }

  if (normalizedModel.includes('minimax-m2.7')) {
    return {
      ...baseSettings
    };
  }

  return baseSettings;
}

async function fetchWithDeadline(url, init, deadlineAt) {
  const remainingMs = deadlineAt - Date.now();
  if (remainingMs <= 0) {
    throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), remainingMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractCompletionText(raw) {
  const payload = JSON.parse(raw);
  const content = extractMessageContent(payload?.choices?.[0]?.message?.content);
  if (content) {
    return content;
  }

  throw new Error('Model response did not include a usable message content field.');
}

async function pollPendingChatCompletion({ baseUrl, apiKey, requestId, deadlineAt }) {
  const statusUrl = `${baseUrl}/status/${requestId}`;

  while (Date.now() < deadlineAt) {
    await delay(Math.min(STATUS_POLL_INTERVAL_MS, Math.max(250, deadlineAt - Date.now())));

    const response = await fetchWithDeadline(
      statusUrl,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
          'User-Agent': 'WordSolverX Daily Article Builder'
        }
      },
      deadlineAt
    );

    const raw = await response.text();

    if (response.status === 202) {
      continue;
    }

    if (response.status === 429) {
      const retryAfterMs =
        parseRetryAfter(response.headers.get('retry-after')) ?? STATUS_POLL_INTERVAL_MS;
      await delay(Math.min(retryAfterMs, Math.max(250, deadlineAt - Date.now())));
      continue;
    }

    if (!response.ok) {
      throw new Error(`Status polling failed for ${requestId}: ${response.status} ${raw}`);
    }

    return extractCompletionText(raw);
  }

  throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
}

async function callChatCompletion({ baseUrl, apiKey, model, prompt, temperature = 0.6 }) {
  if (RATE_LIMIT_DELAY_MS > 0) {
    await delay(RATE_LIMIT_DELAY_MS);
  }

  const deadlineAt = Date.now() + DEFAULT_TIMEOUT_MS;

  try {
    const requestBody = {
      model,
      temperature,
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: {
        type: 'json_object'
      },
      messages: [
        {
          role: 'system',
          content:
            'You write for a puzzle answer site in an experienced editor voice. No fluff, no filler, no corporate speak, no "welcome to" intros, and no first-person gameplay diaries. Vary sentence length, keep the pacing human, and make each section feel grounded in visible page facts. Never claim personal playtesting, streaks, or private tracking unless the prompt explicitly provides them. You must return strictly valid JSON matching the requested shape.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      ...buildModelRequestSettings(model)
    };

    const response = await fetchWithDeadline(
      `${baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'WordSolverX Daily Article Builder'
        },
        body: JSON.stringify(requestBody)
      },
      deadlineAt
    );

    const raw = await response.text();

    if (response.status === 202) {
      let pendingPayload = null;
      try {
        pendingPayload = JSON.parse(raw);
      } catch {
        pendingPayload = null;
      }

      const requestId = extractAsyncRequestId(response, pendingPayload);
      if (!requestId) {
        throw new Error('Model request was accepted for async processing but no request ID was returned.');
      }

      return pollPendingChatCompletion({
        baseUrl,
        apiKey,
        requestId,
        deadlineAt
      });
    }

    if (response.status === 429) {
      const retryAfterMs =
        parseRetryAfter(response.headers.get('retry-after')) ?? RATE_LIMIT_DELAY_MS * 3;
      await delay(Math.min(retryAfterMs, Math.max(250, deadlineAt - Date.now())));
      throw new Error(`Rate limited (429). Retry after ${retryAfterMs}ms.`);
    }

    if (!response.ok) {
      throw new Error(`${response.status} ${raw}`);
    }

    return extractCompletionText(raw);
  } catch (error) {
    throw error;
  }
}

function summarizeProviders(providers) {
  return providers
    .map(
      (provider) =>
        `${provider.provider} models=${provider.models.join(',')} keys=${provider.apiKeys.map((entry) => entry.label).join(',')}`
    )
    .join(' | ');
}

function summarizeArticle(article) {
  const html = article.contentGuideHtml ?? article.articleHtml ?? '';
  return {
    title: String(article.title ?? '').trim(),
    wordCount: countWords(html),
    summaryWords: countWords(article.summary ?? ''),
    bonusHintCount: Array.isArray(article.bonusHints) ? article.bonusHints.length : 0
  };
}

const DISALLOWED_PERSONAL_VOICE_PATTERNS = [
  /\bI (?:burned|guessed|opened|started|missed|needed|stared|wasted|hesitated|plugged|spotted|noticed|kept|played|solved|tracked|logged|use|used|figured|checked|lost)\b/i,
  /\bI (?:saw|recommend|recommended|usually|watched|found|realized|thought|tried|ran|run|reviewed|keep)\b/i,
  /\bI(?:'ll|’ll| am|'m|’m| was| got| have| had| did(?:n't)?| do(?:n't)?| admit| almost| paused?| watched| looked| keep| know| think| prefer| started| stopped| spent| forced| landed| locked| talked)\b/i,
  /\bmy (?:(?:first|second|third|fourth|fifth|sixth|last|final)\s+guess|streak|guess|guesses|path|notes|spreadsheet|sheet|brain|mind|head|grid|keyboard|rule|tracking|opener|play|morning)\b/i,
  /\bI have been (?:tracking|watching|seeing)\b/i,
  /\bI personally\b/i,
  /\bI['’]ve (?:logged|tracked|kept|played|solved|noticed)\b/i,
  /\bBack tomorrow\b/i,
  /\bPlace your bets\b/i,
  /\bcoffee in hand\b/i,
  /\b500\+\s+daily\b/i
];

const DISALLOWED_UNVERIFIED_SPECIFIC_PATTERNS = [
  /\b(?:the answer|today(?:'|’)s answer|the correct answer|the solution|the target|the movie hidden behind|the hidden movie|the country hidden behind|the color hidden behind|the word hidden behind)\b[^.?!]{0,140}\b(?:is|was|belongs to)\b/i,
  /\b(?:puzzle|board|worldle|framed|worgle|canuckle|betweenle|countryle|phoodle|colorfle|spotle|globle|searchle|quordle|semantle)\s*#\d{3,}\b/i
];

const TEMPLATE_PLACEHOLDER_PATTERNS = [
  /#[_a-z0-9-]+#/i,
  /\{\{[^}]+\}\}/i,
  /\b(?:todo|placeholder)\b/i
];

function findDisallowedPersonalVoice(html) {
  const text = stripHtml(html);
  for (const pattern of DISALLOWED_PERSONAL_VOICE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[0]) {
      return match[0];
    }
  }

  return null;
}

function findUnsupportedSpecificClaim(html) {
  const text = stripHtml(html);
  for (const pattern of DISALLOWED_UNVERIFIED_SPECIFIC_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[0]) {
      return match[0];
    }
  }

  return null;
}

function containsTemplatePlaceholder(html) {
  const text = stripHtml(html);
  return TEMPLATE_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text));
}

function isStoredArticleReusable(article, expectedDate) {
  if (!isRecord(article)) {
    return false;
  }

  const articleDate = toDateKey(article.date);
  if (!articleDate || articleDate !== expectedDate) {
    return false;
  }

  const html = String(article.articleHtml ?? article.contentGuideHtml ?? '');
  if (!html.trim()) {
    return false;
  }

  if (containsBannedPhrases(html)) {
    return false;
  }

  if (containsTemplatePlaceholder(html)) {
    return false;
  }

  if (findDisallowedPersonalVoice(html)) {
    return false;
  }

  if (article.game !== 'wordle' && article.game !== 'colordle' && findUnsupportedSpecificClaim(html)) {
    return false;
  }

  return true;
}

function validateArticlePayload(game, payload, targetDate) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Model payload was not an object.');
  }

  if (game === 'wordle') {
    const html = autoCleanGeneratedHtml(String(payload.contentGuideHtml ?? ''));
    if (!html.includes("<h2>5 Hints for Today's Wordle</h2>")) {
      throw new Error('Wordle HTML is missing the required hints heading.');
    }
    if (!html.includes("<h2>Today's Wordle Answer Revealed</h2>")) {
      throw new Error('Wordle HTML is missing the required reveal heading.');
    }
    if (!html.includes(targetDate) && !html.includes(formatLongDate(targetDate))) {
      throw new Error('Wordle HTML does not include the target date.');
    }
    if (countWords(html) < 420) {
      throw new Error('Wordle HTML did not reach the minimum word count (420).');
    }
    if (countWords(html) > 980) {
      throw new Error('Wordle HTML exceeded the maximum word count (980).');
    }
    const bannedPhrase = containsBannedPhrases(html);
    if (bannedPhrase) {
      throw new Error(`Wordle HTML contains banned phrase: "${bannedPhrase}".`);
    }
    const personalVoice = findDisallowedPersonalVoice(html);
    if (personalVoice) {
      throw new Error(`Wordle HTML contains first-person gameplay claim: "${personalVoice}".`);
    }
    return {
      title: normalizeWhitespace(payload.title),
      summary: normalizeWhitespace(payload.summary),
      bonusHints: normalizeHintList(payload.bonusHints),
      contentGuideHtml: html
    };
  }

  const html = autoCleanGeneratedHtml(String(payload.articleHtml ?? ''));

  if (game === 'generic') {
    if (countWords(html) < 280) {
      throw new Error('Generic article HTML did not reach the minimum word count (280).');
    }
    if (countWords(html) > 900) {
      throw new Error('Generic article HTML exceeded the maximum word count (900).');
    }
    const bannedPhrase = containsBannedPhrases(html);
    if (bannedPhrase) {
      throw new Error(`Generic article HTML contains banned phrase: "${bannedPhrase}".`);
    }
    const personalVoice = findDisallowedPersonalVoice(html);
    if (personalVoice) {
      throw new Error(`Generic article HTML contains first-person gameplay claim: "${personalVoice}".`);
    }
    const unsupportedSpecificClaim = findUnsupportedSpecificClaim(
      [payload.summary, html].filter(Boolean).join(' ')
    );
    if (unsupportedSpecificClaim) {
      throw new Error(
        `Generic article HTML contains unsupported answer-specific detail: "${unsupportedSpecificClaim}".`
      );
    }
    return {
      title: normalizeWhitespace(payload.title),
      summary: normalizeWhitespace(payload.summary),
      bonusHints: [],
      articleHtml: html
    };
  }

  if (!html.includes("<h2>Today's Colordle answer at a glance</h2>")) {
    throw new Error('Colordle HTML is missing the required opening section.');
  }
  if (!html.includes(targetDate) && !html.includes(formatLongDate(targetDate))) {
    throw new Error('Colordle HTML does not include the target date.');
  }
  if (countWords(html) < 360) {
    throw new Error('Colordle HTML did not reach the minimum word count (360).');
  }
  if (countWords(html) > 980) {
    throw new Error('Colordle HTML exceeded the maximum word count (980).');
  }
  const bannedPhrase = containsBannedPhrases(html);
  if (bannedPhrase) {
    throw new Error(`Colordle HTML contains banned phrase: "${bannedPhrase}".`);
  }
  const personalVoice = findDisallowedPersonalVoice(html);
  if (personalVoice) {
    throw new Error(`Colordle HTML contains first-person gameplay claim: "${personalVoice}".`);
  }
  return {
    title: normalizeWhitespace(payload.title),
    summary: normalizeWhitespace(payload.summary),
    bonusHints: normalizeHintList(payload.bonusHints),
    articleHtml: html
  };
}

function buildProviderConfigs() {
  const nvidiaKeys = parseKeyList(process.env.NVIDIA_API_KEYS, process.env.NVIDIA_API_KEY);
  if (!nvidiaKeys.length) {
    return [];
  }

  return [
    {
      provider: 'nvidia',
      baseUrl: NVIDIA_BASE_URL,
      models: NVIDIA_MODEL_CHAIN,
      apiKeys: shuffleList(
        nvidiaKeys.map((value, index) => ({
          value,
          label: `key${index + 1}`
        }))
      ),
      keyCursor: randomInt(nvidiaKeys.length),
      modelCursor: 0
    }
  ];
}

function takeProviderKeyOrder(provider) {
  if (!provider.apiKeys.length) {
    return [];
  }

  const startOffset = provider.keyCursor % provider.apiKeys.length;
  provider.keyCursor = (provider.keyCursor + 1) % provider.apiKeys.length;
  return rotateList(provider.apiKeys, startOffset);
}

function classifyProviderError(message) {
  const normalized = String(message).toLowerCase();
  if (
    normalized.includes('rate limited') ||
    normalized.includes('too many requests') ||
    normalized.includes('429')
  ) {
    return 'rate_limit';
  }

  if (
    normalized.includes('model returned an empty response') ||
    normalized.includes('model response did not contain a json object') ||
    normalized.includes('model response did not include a usable message content field') ||
    normalized.includes('model payload was not an object') ||
    normalized.includes('payload must include at least') ||
    normalized.includes('html is missing') ||
    normalized.includes('html does not include the target date') ||
    normalized.includes('html did not reach the minimum word count') ||
    normalized.includes('html exceeded the maximum word count') ||
    normalized.includes('html contains banned phrase') ||
    normalized.includes('html contains first-person gameplay claim')
  ) {
    return 'route_model_failure';
  }

  return 'provider_model_failure';
}

function advanceProviderModel(provider, modelIndex, routeKey, laneIndex, reason) {
  const currentIndex = provider.modelCursor ?? 0;
  if (modelIndex !== currentIndex) {
    return false;
  }

  if (currentIndex >= provider.models.length - 1) {
    console.warn(
      `[lane ${laneIndex + 1}] [${routeKey}] ${provider.provider}:${provider.models[currentIndex]} hit a hard failure, but no further fallback models remain.`
    );
    return false;
  }

  const nextIndex = currentIndex + 1;
  provider.modelCursor = nextIndex;
  console.warn(
    `[lane ${laneIndex + 1}] [${routeKey}] Promoting ${provider.provider} from ${provider.models[currentIndex]} to ${provider.models[nextIndex]} for the rest of this run because of a hard failure: ${truncateForLog(reason, 160)}`
  );
  return true;
}

async function generateWithProviders({ game, prompt, targetDate, providers, routeKey, laneIndex, entryKey }) {
  const failures = [];
  const gameGroup = game === 'wordle' ? 'wordle' : game === 'colordle' ? 'colordle' : getGameGroup(entryKey || '');
  const temperature = temperatureMap[gameGroup] ?? 0.6;

  for (const provider of providers) {
    const preferredStart = provider.modelCursor ?? 0;
    const modelOrder = rotateList(
      provider.models.map((model, index) => ({ model, index })),
      preferredStart
    );

    for (const { model, index: modelIndex } of modelOrder) {
      const rotatedKeys = takeProviderKeyOrder(provider);
      let moveToNextRouteModel = false;

      for (const apiKeyEntry of rotatedKeys) {
        const keyLabel = `${provider.provider}:${model}:${apiKeyEntry.label}`;

        for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt += 1) {
          const startedAt = Date.now();
          try {
            console.log(
              `[lane ${laneIndex + 1}] [${routeKey}] Generating ${game} article with ${keyLabel} (attempt ${attempt}/${MAX_REQUEST_ATTEMPTS})`
            );
            const raw = await callChatCompletion({
              baseUrl: provider.baseUrl,
              apiKey: apiKeyEntry.value,
              model,
              prompt,
              temperature
            });
            const parsed = sanitizeModelJson(raw);
            const validated = validateArticlePayload(game, parsed, targetDate);
            const articleSummary = summarizeArticle(validated);
            const elapsedMs = Date.now() - startedAt;

            console.log(
              `[lane ${laneIndex + 1}] [${routeKey}] Success with ${keyLabel} in ${elapsedMs}ms (words=${articleSummary.wordCount}, summaryWords=${articleSummary.summaryWords}, hints=${articleSummary.bonusHintCount}, title="${truncateForLog(articleSummary.title, 120)}")`
            );

            if ((provider.modelCursor ?? 0) !== modelIndex) {
              console.log(
                `[lane ${laneIndex + 1}] [${routeKey}] Promoting ${provider.provider} to ${model} for the rest of this run because this model succeeded cleanly.`
              );
              provider.modelCursor = modelIndex;
            }

            return {
              ...validated,
              meta: {
                provider: provider.provider,
                model,
                fallbackUsed: model !== PRIMARY_MODEL,
                fallbackSource: 'stored',
                generatedAt: new Date().toISOString(),
                wordCount: countWords(validated.contentGuideHtml ?? validated.articleHtml ?? ''),
                editorialVersion: 2
              }
            };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            failures.push(`${keyLabel} [attempt ${attempt}] -> ${message}`);
            console.warn(
              `[lane ${laneIndex + 1}] [${routeKey}] Failed with ${keyLabel} (attempt ${attempt}/${MAX_REQUEST_ATTEMPTS}): ${message}`
            );

            const errorType = classifyProviderError(message);
            if (errorType === 'provider_model_failure') {
              advanceProviderModel(provider, modelIndex, routeKey, laneIndex, message);
              moveToNextRouteModel = true;
              break;
            }

            if (errorType === 'route_model_failure') {
              console.warn(
                `[lane ${laneIndex + 1}] [${routeKey}] Moving from ${provider.provider}:${model} to the next fallback model for this route only because the generated output was invalid: ${truncateForLog(message, 160)}`
              );
              moveToNextRouteModel = true;
              break;
            }
          }
        }

        if (moveToNextRouteModel) {
          break;
        }
      }

      if (moveToNextRouteModel) {
        continue;
      }
    }
  }

  throw new Error(`All configured providers failed for ${game} article generation.\n${failures.join('\n')}`);
}

async function readExistingBundle() {
  try {
    const raw = await readFile(outputPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      generatedAt: parsed.generatedAt ?? null,
      articles: parsed.articles ?? {}
    };
  } catch {
    return {
      generatedAt: null,
      articles: {}
    };
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toDateKey(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function sanitizeStoredArticle(article) {
  if (!isRecord(article)) {
    return null;
  }

  const sanitized = { ...article };

  if (typeof sanitized.title === 'string') {
    sanitized.title = normalizeWhitespace(sanitized.title);
  }

  if (typeof sanitized.summary === 'string') {
    const normalizedSummary = normalizeWhitespace(sanitized.summary);
    sanitized.summary =
      normalizedSummary &&
      !containsBannedPhrases(normalizedSummary) &&
      !containsTemplatePlaceholder(normalizedSummary) &&
      !(
        sanitized.game !== 'wordle' &&
        sanitized.game !== 'colordle' &&
        findUnsupportedSpecificClaim(normalizedSummary)
      ) &&
      !findDisallowedPersonalVoice(normalizedSummary)
        ? normalizedSummary
        : undefined;
  }

  if (typeof sanitized.contentGuideHtml === 'string') {
    sanitized.contentGuideHtml = autoCleanGeneratedHtml(sanitized.contentGuideHtml);
  }

  if (typeof sanitized.articleHtml === 'string') {
    sanitized.articleHtml = autoCleanGeneratedHtml(sanitized.articleHtml);
  }

  if (Array.isArray(sanitized.bonusHints)) {
    sanitized.bonusHints = normalizeHintList(sanitized.bonusHints);
  }

  const combinedHtml = String(sanitized.articleHtml ?? sanitized.contentGuideHtml ?? '');
  if (
    !combinedHtml.trim() ||
    containsBannedPhrases(combinedHtml) ||
    containsTemplatePlaceholder(combinedHtml) ||
    findDisallowedPersonalVoice(combinedHtml) ||
    ((sanitized.game !== 'wordle' && sanitized.game !== 'colordle') &&
      findUnsupportedSpecificClaim(combinedHtml))
  ) {
    return null;
  }

  if (isRecord(sanitized.meta)) {
    sanitized.meta = {
      ...sanitized.meta,
      wordCount: countWords(String(sanitized.articleHtml ?? sanitized.contentGuideHtml ?? ''))
    };
  }

  return sanitized;
}

function sanitizeByDateMap(byDate) {
  if (!isRecord(byDate)) {
    return {};
  }

  const sortedDateKeys = Object.keys(byDate)
    .map((key) => toDateKey(key))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, MAX_STORED_DATES_PER_ROUTE);

  const trimmed = {};
  for (const dateKey of sortedDateKeys) {
    const article = byDate[dateKey];
    const sanitizedArticle = sanitizeStoredArticle(article);
    if (sanitizedArticle) {
      trimmed[dateKey] = sanitizedArticle;
    }
  }

  return trimmed;
}

function routeStorePathForKey(routeKey) {
  return path.join(perRouteStoreDirPath, `${routeKey}.json`);
}

function normalizeRouteStore(routeKey, parsed) {
  const safeRouteKey =
    typeof parsed?.articleKey === 'string' && parsed.articleKey.trim().length > 0
      ? parsed.articleKey.trim()
      : routeKey;

  return {
    articleKey: safeRouteKey,
    generatedAt: typeof parsed?.generatedAt === 'string' ? parsed.generatedAt : null,
    byDate: sanitizeByDateMap(parsed?.byDate)
  };
}

async function readRouteStore(routeKey) {
  try {
    const raw = await readFile(routeStorePathForKey(routeKey), 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeRouteStore(routeKey, parsed);
  } catch {
    return {
      articleKey: routeKey,
      generatedAt: null,
      byDate: {}
    };
  }
}

async function writeRouteStore(routeKey, routeStore) {
  await mkdir(perRouteStoreDirPath, { recursive: true });
  await writeFile(
    routeStorePathForKey(routeKey),
    `${JSON.stringify(normalizeRouteStore(routeKey, routeStore), null, 2)}\n`,
    'utf8'
  );
}

async function readAllRouteStores() {
  const stores = new Map();

  try {
    const files = await readdir(perRouteStoreDirPath, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.json')) {
        continue;
      }

      const routeKey = file.name.slice(0, -'.json'.length);
      if (!routeKey) {
        continue;
      }

      const store = await readRouteStore(routeKey);
      stores.set(routeKey, store);
    }
  } catch {
    return stores;
  }

  return stores;
}

async function persistNormalizedRouteStores(routeStores) {
  for (const [routeKey, routeStore] of routeStores.entries()) {
    await writeRouteStore(routeKey, routeStore);
  }
}

async function seedRouteStoresFromBundle(bundle, routeStores) {
  let seededCount = 0;

  for (const [routeKey, article] of Object.entries(bundle?.articles ?? {})) {
    const articleDate = toDateKey(article?.date);
    if (!articleDate || !isRecord(article)) {
      continue;
    }

    const existingStore = routeStores.get(routeKey) ?? (await readRouteStore(routeKey));
    if (!isRecord(existingStore.byDate[articleDate])) {
      existingStore.byDate[articleDate] = article;
      existingStore.byDate = sanitizeByDateMap(existingStore.byDate);
      existingStore.generatedAt = new Date().toISOString();
      await writeRouteStore(routeKey, existingStore);
      seededCount += 1;
    }

    routeStores.set(routeKey, existingStore);
  }

  return seededCount;
}

function buildBundleFromRouteStores(routeStores) {
  const articles = {};
  let generatedAt = null;

  for (const [routeKey, store] of routeStores.entries()) {
    const latestDate = Object.keys(store.byDate).sort((a, b) => b.localeCompare(a))[0];
    if (latestDate && isRecord(store.byDate[latestDate])) {
      articles[routeKey] = store.byDate[latestDate];
    }

    if (typeof store.generatedAt === 'string' && (!generatedAt || store.generatedAt > generatedAt)) {
      generatedAt = store.generatedAt;
    }
  }

  return {
    generatedAt,
    articles
  };
}

async function writeBundleFromRouteStores(routeStores) {
  const bundle = buildBundleFromRouteStores(routeStores);
  await writeBundle(bundle);
  return bundle;
}

async function persistRouteArticle(routeStores, routeKey, article) {
  const routeStore = routeStores.get(routeKey) ?? (await readRouteStore(routeKey));
  const articleDate = toDateKey(article?.date);
  if (!articleDate) {
    throw new Error(`Cannot persist article for ${routeKey} because date is missing.`);
  }

  routeStore.articleKey = routeKey;
  routeStore.byDate[articleDate] = article;
  routeStore.byDate = sanitizeByDateMap(routeStore.byDate);
  routeStore.generatedAt = new Date().toISOString();

  await writeRouteStore(routeKey, routeStore);
  routeStores.set(routeKey, routeStore);
}

async function writeBundle(bundle) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
}

async function runConcurrent(entries, concurrency, worker) {
  const total = Math.min(concurrency, entries.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: total }, (_, laneIndex) =>
      (async () => {
        while (true) {
          const currentIndex = cursor;
          cursor += 1;

          if (currentIndex >= entries.length) {
            return;
          }

          await worker(entries[currentIndex], laneIndex);
        }
      })()
    )
  );
}

async function main() {
  const groupName = getGenerationGroupName();
  const requestedGroups = getConfiguredArticleGroups(groupName);
  const requestedGroupLabel =
    getArticleScope() === 'all-current-windows' ? 'all-current-windows' : requestedGroups.join(',');
  const selectedEntries = getSelectedEntries(requestedGroups);
  const targetDatesByGroup = {
    site: getTargetDate('site'),
    main: getTargetDate('site'),
    gamedle: getTargetDate('gamedle'),
    waffle: getTargetDate('waffle')
  };
  const targetDate = targetDatesByGroup[groupName] ?? getTargetDate(groupName);
  const requestedDateLabel = `site=${targetDatesByGroup.site}, gamedle=${targetDatesByGroup.gamedle}, waffle=${targetDatesByGroup.waffle}`;
  const existingBundle = await readExistingBundle();
  const routeStores = await readAllRouteStores();
  const seededCount = await seedRouteStoresFromBundle(existingBundle, routeStores);

  if (seededCount > 0) {
    console.log(`Seeded ${seededCount} persisted route file(s) from the existing daily article bundle.`);
  }

  await persistNormalizedRouteStores(routeStores);
  await writeBundleFromRouteStores(routeStores);

  if (!shouldGenerateArticles()) {
    console.log(
      `Daily article generation skipped because ENABLE_DAILY_ARTICLE_GENERATION is false for group ${requestedGroupLabel}. Rebuilt bundle from persisted route files.`
    );
    return;
  }

  if (!selectedEntries.length) {
    console.log(`No daily article entries are assigned to group ${requestedGroupLabel}.`);
    return;
  }

  console.log(
    `Preparing daily articles for workflow group ${groupName} using article scope ${requestedGroupLabel} and target date ${requestedDateLabel}.`
  );

  const providers = buildProviderConfigs();
  if (!providers.length) {
    console.warn('No NVIDIA keys were provided. Kept previously persisted per-route daily articles.');
    await writeBundleFromRouteStores(routeStores);
    if (!buildBundleFromRouteStores(routeStores).generatedAt) {
      console.warn('No existing article bundle was found yet. The frontend will fall back to built-in content.');
    }
    return;
  }

  const skillText = await readSkillText();
  if (!skillText) {
    console.warn('Human writing skill is unavailable. Keeping the existing daily article bundle.');
    return;
  }

  const seoSkillText = await readSeoSkillText();
  if (seoSkillText) {
    console.log('SEO skill loaded successfully. E-E-A-T and SEO rules will be applied to article generation.');
  }

  console.log(
    `Article generation settings: concurrency=${MAX_CONCURRENCY}, timeoutMs=${DEFAULT_TIMEOUT_MS}, maxAttempts=${MAX_REQUEST_ATTEMPTS}, maxOutputTokens=${MAX_OUTPUT_TOKENS}, rateLimitDelayMs=${RATE_LIMIT_DELAY_MS}, statusPollIntervalMs=${STATUS_POLL_INTERVAL_MS}, keys=${providers[0]?.apiKeys?.length ?? 0}, models=${providers[0]?.models?.join(' -> ') ?? 'none'}.`
  );
  console.log(`Configured providers: ${summarizeProviders(providers)}`);
  console.log(
    `Selected ${selectedEntries.length} route(s) for group ${requestedGroupLabel}: ${selectedEntries.map((entry) => entry.key).join(', ')}`
  );

  let wordleContext = null;
  let colordleContext = null;
  const siteTargetDate = targetDatesByGroup.site;

  if (selectedEntries.some((entry) => entry.mode === 'wordle')) {
    try {
      wordleContext = await getWordleContext(siteTargetDate);
      console.log(
        `Prepared Wordle context for requested date ${siteTargetDate}: answer=${wordleContext.solutionUpper}, puzzle=${wordleContext.wordleNumber ?? 'unknown'}, recentAnswers=${wordleContext.recentAnswers.length}.`
      );
    } catch (error) {
      console.warn(`Unable to prepare Wordle article context for ${siteTargetDate}:`, error);
    }
  }

  if (selectedEntries.some((entry) => entry.mode === 'colordle')) {
    try {
      colordleContext = await getColordleContext(siteTargetDate);
      console.log(
        `Prepared Colordle context for requested date ${siteTargetDate}: actualDate=${colordleContext.date}, exactMatch=${colordleContext.exactMatch}, fallbackReason=${colordleContext.fallbackReason ?? 'none'}, color=${colordleContext.colorName} ${colordleContext.colorHex}.`
      );
    } catch (error) {
      console.warn(`Unable to prepare Colordle article context for ${siteTargetDate}:`, error);
    }
  }

  const failedEntries = [];
  const completedEntries = [];
  let persistenceQueue = Promise.resolve();
  const concurrency = Math.min(
    MAX_CONCURRENCY,
    selectedEntries.length,
    Math.max(...providers.map((provider) => provider.apiKeys.length))
  );

  console.log(`Running article generation with ${concurrency} concurrent lane(s).`);

  await runConcurrent(selectedEntries, concurrency, async (entry, laneIndex) => {
    try {
      let article;
      const entryTargetDate = getTargetDateForEntry(entry);
      let articleDate = entry.mode === 'colordle' && colordleContext ? colordleContext.date : entryTargetDate;

      console.log(
        `[lane ${laneIndex + 1}] [${entry.key}] Starting route generation (mode=${entry.mode}, requestedDate=${entryTargetDate}).`
      );

      const existingRouteStore = routeStores.get(entry.key);
      if (shouldSkipExistingArticles() && isStoredArticleReusable(existingRouteStore?.byDate?.[articleDate], articleDate)) {
        const existingArticle = existingRouteStore.byDate[articleDate];
        const existingWordCount = countWords(
          String(existingArticle.articleHtml ?? existingArticle.contentGuideHtml ?? '')
        );
        completedEntries.push(
          `${entry.key} -> articleDate=${articleDate}, provider=stored, model=existing, words=${existingWordCount}`
        );
        console.log(
          `[lane ${laneIndex + 1}] [${entry.key}] Skipping article generation because a reusable stored article already exists for ${articleDate}.`
        );
        return;
      }

      if (entry.mode === 'wordle') {
        if (!wordleContext) {
          throw new Error('Wordle context was not available.');
        }

        article = await generateWithProviders({
          game: 'wordle',
          prompt: buildWordlePrompt(skillText, wordleContext, seoSkillText),
          targetDate: entryTargetDate,
          providers,
          routeKey: entry.key,
          laneIndex
        });

        const routeArticle = {
          articleKey: entry.key,
          game: 'wordle',
          date: entryTargetDate,
          ...article,
          bonusHints: ensureMinimumHints(article.bonusHints, buildWordleFallbackHints(wordleContext)),
          articleHtml: article.contentGuideHtml
        };
        persistenceQueue = persistenceQueue.then(async () => {
          await persistRouteArticle(routeStores, entry.key, routeArticle);
          await writeBundleFromRouteStores(routeStores);
        });
        await persistenceQueue;
      } else if (entry.mode === 'colordle') {
        if (!colordleContext) {
          throw new Error('Colordle context was not available.');
        }

        article = await generateWithProviders({
          game: 'colordle',
          prompt: buildColordlePrompt(skillText, colordleContext, seoSkillText),
          targetDate: articleDate,
          providers,
          routeKey: entry.key,
          laneIndex
        });

        const routeArticle = {
          articleKey: entry.key,
          game: 'colordle',
          date: articleDate,
          ...article,
          bonusHints: ensureMinimumHints(article.bonusHints, buildColordleFallbackHints(colordleContext))
        };
        persistenceQueue = persistenceQueue.then(async () => {
          await persistRouteArticle(routeStores, entry.key, routeArticle);
          await writeBundleFromRouteStores(routeStores);
        });
        await persistenceQueue;
      } else {
        article = await generateWithProviders({
          game: 'generic',
          prompt: buildGenericPrompt(skillText, entry, entryTargetDate, seoSkillText),
          targetDate: entryTargetDate,
          providers,
          routeKey: entry.key,
          laneIndex
        });

        const routeArticle = {
          articleKey: entry.key,
          date: entryTargetDate,
          title: article.title,
          summary: article.summary,
          articleHtml: article.articleHtml,
          bonusHints: article.bonusHints,
          meta: article.meta
        };
        persistenceQueue = persistenceQueue.then(async () => {
          await persistRouteArticle(routeStores, entry.key, routeArticle);
          await writeBundleFromRouteStores(routeStores);
        });
        await persistenceQueue;
      }

      completedEntries.push(
        `${entry.key} -> articleDate=${articleDate}, provider=${article.meta?.provider ?? 'unknown'}, model=${article.meta?.model ?? 'unknown'}, words=${article.meta?.wordCount ?? 0}`
      );
      console.log(`[lane ${laneIndex + 1}] [${entry.key}] Saved article for ${articleDate}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failedEntries.push(`${entry.key}: ${message}`);
      console.warn(`[lane ${laneIndex + 1}] [${entry.key}] Skipping article generation: ${message}`);
    }
  });

  await persistenceQueue;
  await writeBundleFromRouteStores(routeStores);

  if (completedEntries.length > 0) {
    console.log('Successful daily article routes:');
    for (const line of completedEntries) {
      console.log(`- ${line}`);
    }
  }

  if (failedEntries.length > 0) {
    console.warn(
      `Daily article generation finished with ${failedEntries.length} skipped route(s). The site will still deploy and those pages will simply hide the article block for the requested date window.`
    );
    for (const line of failedEntries) {
      console.warn(`- ${line}`);
    }
  }

  console.log(
    `Daily articles ready for ${requestedDateLabel} across ${selectedEntries.length - failedEntries.length}/${selectedEntries.length} routes in scope ${requestedGroupLabel}.`
  );
}

main().catch((error) => {
  console.error(
    'Daily article generation failed unexpectedly. Keeping deployment non-blocking so the site can still publish answers without the article sections.',
    error
  );
});
