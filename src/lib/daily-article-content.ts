import dailyArticlesJson from '$lib/generated/daily-articles.json';

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

const dailyArticles = dailyArticlesJson as DailyArticleBundle;

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

function cleanPersonalVoice(text: string): string {
  let cleaned = String(text ?? '').replace(/â€™|’/g, "'");

  for (const [pattern, replacement] of AUTO_PERSONAL_VOICE_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}

function stripDisallowedBlocks(html: string): string {
  return String(html ?? '').replace(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    const text = stripHtml(cleanPersonalVoice(block));
    return DISALLOWED_ARTICLE_PATTERNS.some((pattern) => pattern.test(text)) ? '' : block;
  });
}

function sanitizeArticleHtml(html: string): string {
  return stripDisallowedBlocks(cleanPersonalVoice(html))
    .replace(/\s{2,}/g, ' ')
    .replace(/> +</g, '><')
    .trim();
}

function sanitizeArticleSummary(summary: string | undefined): string | undefined {
  const cleaned = cleanPersonalVoice(summary ?? '').trim();
  if (!cleaned) {
    return undefined;
  }

  return DISALLOWED_ARTICLE_PATTERNS.some((pattern) => pattern.test(cleaned)) ? undefined : cleaned;
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

  const html = sanitizeArticleHtml(article.articleHtml ?? article.contentGuideHtml ?? '');
  if (!html.trim()) {
    return null;
  }

  return {
    ...article,
    summary: sanitizeArticleSummary(article.summary),
    articleHtml: article.articleHtml ? html : article.articleHtml,
    contentGuideHtml: article.contentGuideHtml ? html : article.contentGuideHtml
  };
}

function getMatchingArticle(
  key: string,
  date?: string,
  options: { allowStaleDate?: boolean } = {}
): DailyArticleContent | null {
  const article = dailyArticles.articles?.[key] ?? null;
  return buildRenderableArticle(article, date, options);
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
