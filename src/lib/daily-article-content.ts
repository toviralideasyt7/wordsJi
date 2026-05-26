import dailyArticlesJson from '$lib/generated/daily-articles.json';
import { compactGeneratedArticleParagraphs } from '$lib/generated-article-links';

export type DailyArticleGame = 'wordle' | 'colordle';
export type TodayArticleKey =
  | 'betweenle-answer-today'
  | 'canuckle-answer-today'
  | 'colordle-answer-today'
  | 'colorfle-answer-today'
  | 'contexto-answer-today'
  | 'countryle-answer-today'
  | 'dotadle-answer-today'
  | 'framed-answer-today'
  | 'globle-answer-today'
  | 'loldle-answer-today'
  | 'narutodle-answer-today'
  | 'nerdle-answer-today'
  | 'onepiecedle-answer-today'
  | 'phoodle-answer-today'
  | 'phrazle-answer-today'
  | 'pokedle-answer-today'
  | 'quordle-answer-today'
  | 'searchle-answer-today'
  | 'semantle-answer-today'
  | 'smashdle-answer-today'
  | 'spotle-answer-today'
  | 'sportle-answer-today'
  | 'worgle-answer-today'
  | 'waffle-answer-today'
  | 'wordle-answer-today'
  | 'worldle-answer-today';

export interface DailyArticleMeta {
  provider?: string;
  model?: string;
  fallbackUsed?: boolean;
  generatedAt?: string;
  wordCount?: number;
}

export interface DailyArticleContent {
  game?: DailyArticleGame;
  articleKey?: TodayArticleKey;
  date: string;
  title?: string;
  summary?: string;
  bonusHints?: string[];
  contentGuideHtml?: string;
  articleHtml?: string;
  meta?: DailyArticleMeta;
}

interface DailyArticleBundle {
  generatedAt: string | null;
  articles: Partial<Record<string, DailyArticleContent>>;
}

interface RouteArticleStore {
  articleKey?: string;
  generatedAt?: string | null;
  byDate?: Partial<Record<string, DailyArticleContent>>;
}

const dailyArticles = dailyArticlesJson as DailyArticleBundle;
const routeArticleStores = Object.entries(
  import.meta.glob('./generated/artiples/*.json', { eager: true, import: 'default' }) as Record<
    string,
    RouteArticleStore
  >
).reduce<Record<string, RouteArticleStore>>((stores, [filePath, store]) => {
  const routeKey = filePath.split('/').pop()?.replace(/\.json$/i, '');
  if (routeKey) {
    stores[routeKey] = store;
  }
  return stores;
}, {});

const DISALLOWED_ARTICLE_PATTERNS = [
  /\bI (?:burned|guessed|opened|started|missed|needed|stared|wasted|hesitated|plugged|spotted|noticed|kept|played|solved|tracked|logged|use|used|figured|checked|lost|saw|recommend|recommended|usually|watched|found|realized|thought|tried|ran|run|reviewed|keep)\b/i,
  /\bI(?:'ll|’ll| am|'m|’m| was| got| have| had| did(?:n't)?| do(?:n't)?| admit| almost| paused?| watched| looked| keep| know| think| prefer| started| stopped| spent| forced| landed| locked| talked)\b/i,
  /\bmy (?:(?:first|second|third|fourth|fifth|sixth|last|final)\s+guess|streak|guess|guesses|path|notes|spreadsheet|sheet|brain|mind|head|grid|keyboard|rule|tracking|opener|play|morning)\b/i,
  /\bI(?:'|’|â€™)ve (?:logged|tracked|kept|played|solved|noticed|seen)\b/i,
  /\bI(?:'|’|â€™)ve been (?:tracking|watching|seeing)\b/i,
  /\bI personally\b/i,
  /\bBack tomorrow\b/i,
  /\bPlace your bets\b/i,
  /\bcoffee in hand\b/i,
  /\b500\+\s+daily\b/i
];
const ARTICLE_TEMPLATE_PATTERNS = [
  /#[_a-z0-9-]+#/i,
  /\{\{[^}]+\}\}/i,
  /\b(?:todo|placeholder)\b/i
];
const DISALLOWED_UNSUPPORTED_SPECIFIC_PATTERNS = [
  /\b(?:the answer|today(?:'|â€™)s answer|the correct answer|the solution|the target|the movie hidden behind|the hidden movie|the country hidden behind|the color hidden behind|the word hidden behind)\b[^.?!]{0,140}\b(?:is|was|belongs to)\b/i,
  /\b(?:puzzle|board|worldle|framed|worgle|canuckle|betweenle|countryle|phoodle|colorfle|spotle|globle|searchle|quordle|semantle)\s*#\d{3,}\b/i
];
const MAX_SUMMARY_WORDS = 24;

const AUTO_PERSONAL_VOICE_REPLACEMENTS: Array<[RegExp, string]> = [
  [
    /\bI (burned|guessed|opened|started|missed|needed|stared|wasted|hesitated|plugged|spotted|noticed|kept|played|solved|tracked|logged|use|used|figured|checked|lost)\b/gi,
    'players $1'
  ],
  [/\bI(?:'|’|â€™)ve (logged|tracked|kept|played|solved|noticed)\b/gi, 'players have $1'],
  [/\bmy (streak|guess|guesses|path|notes|spreadsheet|sheet|brain|rule|tracking|opener|play|morning)\b/gi, 'the $1']
];

function stripHtml(html: string): string {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(value: string): number {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).length : 0;
}

function cleanPersonalVoice(text: string): string {
  let cleaned = String(text ?? '').replace(/â€™|’/g, "'");

  for (const [pattern, replacement] of AUTO_PERSONAL_VOICE_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}

function containsTemplatePlaceholder(text: string): boolean {
  return ARTICLE_TEMPLATE_PATTERNS.some((pattern) => pattern.test(text));
}

function findUnsupportedSpecificClaim(text: string): string | null {
  for (const pattern of DISALLOWED_UNSUPPORTED_SPECIFIC_PATTERNS) {
    const match = stripHtml(text).match(pattern);
    if (match?.[0]) {
      return match[0];
    }
  }

  return null;
}

function truncateWordCount(text: string, maximumWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maximumWords) {
    return text.trim();
  }

  const truncated = words.slice(0, maximumWords).join(' ').replace(/[,:;]+$/g, '').trim();
  return /[.!?]$/.test(truncated) ? truncated : `${truncated}.`;
}

function stripDisallowedBlocks(html: string): string {
  return String(html ?? '').replace(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    const text = stripHtml(cleanPersonalVoice(block));
    return DISALLOWED_ARTICLE_PATTERNS.some((pattern) => pattern.test(text)) ? '' : block;
  });
}

function sanitizeArticleHtml(html: string): string {
  const cleaned = stripDisallowedBlocks(cleanPersonalVoice(html))
    .replace(/\s{2,}/g, ' ')
    .replace(/> +</g, '><')
    .trim();

  if (containsTemplatePlaceholder(cleaned)) {
    return '';
  }

  return compactGeneratedArticleParagraphs(cleaned);
}

function sanitizeArticleSummary(
  summary: string | undefined,
  options: { strictGeneric?: boolean } = {}
): string | undefined {
  const cleaned = cleanPersonalVoice(summary ?? '').trim();
  if (!cleaned) {
    return undefined;
  }

  if (containsTemplatePlaceholder(cleaned)) {
    return undefined;
  }

  if (options.strictGeneric && findUnsupportedSpecificClaim(cleaned)) {
    return undefined;
  }

  return DISALLOWED_ARTICLE_PATTERNS.some((pattern) => pattern.test(cleaned))
    ? undefined
    : truncateWordCount(cleaned, MAX_SUMMARY_WORDS);
}

function buildRenderableArticle(
  article: DailyArticleContent | null,
  expectedDate?: string,
  options: { allowStaleDate?: boolean } = {}
): DailyArticleContent | null {
  if (!article) {
    return null;
  }

  if (expectedDate && article.date !== expectedDate && !options.allowStaleDate) {
    return null;
  }

  const rawHtml = article.articleHtml ?? article.contentGuideHtml ?? '';
  const rawCombined = [article.summary ?? '', rawHtml].join(' ');
  const strictGeneric = article.game !== 'wordle' && article.game !== 'colordle';

  if (containsTemplatePlaceholder(rawCombined)) {
    return null;
  }

  if (strictGeneric && findUnsupportedSpecificClaim(rawCombined)) {
    return null;
  }

  const html = sanitizeArticleHtml(rawHtml);
  if (!html.trim()) {
    return null;
  }

  return {
    ...article,
    summary: sanitizeArticleSummary(article.summary, { strictGeneric }),
    articleHtml: article.articleHtml ? html : article.articleHtml,
    contentGuideHtml: article.contentGuideHtml ? html : article.contentGuideHtml
  };
}

function getMatchingArticle(
  key: string,
  date?: string,
  options: { allowStaleDate?: boolean } = {}
): DailyArticleContent | null {
  const latestBundleArticle = buildRenderableArticle(dailyArticles.articles?.[key] ?? null, date, options);
  if (latestBundleArticle) {
    return latestBundleArticle;
  }

  const routeStore = routeArticleStores[key];
  const byDate = routeStore?.byDate ?? {};

  if (date && byDate[date]) {
    return buildRenderableArticle(byDate[date] ?? null, date, options);
  }

  if (!options.allowStaleDate) {
    return null;
  }

  const fallbackDateKey = Object.keys(byDate)
    .filter((entryDate) => !date || entryDate <= date)
    .sort((left, right) => right.localeCompare(left))[0]
    ?? Object.keys(byDate).sort((left, right) => right.localeCompare(left))[0];

  return fallbackDateKey
    ? buildRenderableArticle(byDate[fallbackDateKey] ?? null, date, { allowStaleDate: true })
    : null;
}

export function getDailyArticleBundle(): DailyArticleBundle {
  return dailyArticles;
}

export function getWordleDailyArticle(date: string): DailyArticleContent | null {
  return getMatchingArticle('wordle-answer-today', date);
}

export function getColordleDailyArticle(date: string): DailyArticleContent | null {
  return getMatchingArticle('colordle-answer-today', date);
}

export function getTodayPageArticle(
  articleKey: TodayArticleKey,
  date: string,
  options: { allowStaleDate?: boolean } = {}
): DailyArticleContent | null {
  return getMatchingArticle(articleKey, date, options);
}
