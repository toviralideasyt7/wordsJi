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
  fallbackSource?: 'runtime' | 'stored';
  generatedAt?: string;
  wordCount?: number;
  editorialVersion?: number;
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

const ARTICLE_DISPLAY_NAME_MAP: Record<TodayArticleKey, string> = {
  'betweenle-answer-today': 'Betweenle',
  'canuckle-answer-today': 'Canuckle',
  'colordle-answer-today': 'Colordle',
  'colorfle-answer-today': 'Colorfle',
  'contexto-answer-today': 'Contexto',
  'countryle-answer-today': 'Countryle',
  'dotadle-answer-today': 'Dotadle',
  'framed-answer-today': 'Framed',
  'globle-answer-today': 'Globle',
  'loldle-answer-today': 'LoLdle',
  'narutodle-answer-today': 'Narutodle',
  'nerdle-answer-today': 'Nerdle',
  'onepiecedle-answer-today': 'OnePiecedle',
  'phoodle-answer-today': 'Phoodle',
  'phrazle-answer-today': 'Phrazle',
  'pokedle-answer-today': 'Pokedle',
  'quordle-answer-today': 'Quordle',
  'searchle-answer-today': 'Searchle',
  'semantle-answer-today': 'Semantle',
  'smashdle-answer-today': 'Smashdle',
  'spotle-answer-today': 'Spotle',
  'sportle-answer-today': 'Sportle',
  'waffle-answer-today': 'Waffle',
  'wordle-answer-today': 'Wordle',
  'worldle-answer-today': 'Worldle',
  'worgle-answer-today': 'Worgle'
};

const EDITORIAL_RUNTIME_FALLBACK_KEYS = new Set<TodayArticleKey>([
  'betweenle-answer-today',
  'canuckle-answer-today',
  'colordle-answer-today',
  'colorfle-answer-today',
  'contexto-answer-today',
  'countryle-answer-today',
  'dotadle-answer-today',
  'globle-answer-today',
  'loldle-answer-today',
  'narutodle-answer-today',
  'onepiecedle-answer-today',
  'pokedle-answer-today',
  'quordle-answer-today',
  'searchle-answer-today',
  'semantle-answer-today',
  'smashdle-answer-today',
  'spotle-answer-today',
  'waffle-answer-today'
]);

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

function formatLongDate(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
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

function findDisallowedPersonalVoice(text: string): string | null {
  const stripped = stripHtml(text);
  for (const pattern of DISALLOWED_ARTICLE_PATTERNS) {
    const match = stripped.match(pattern);
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

export function getTodayArticleDisplayName(articleKey: TodayArticleKey): string {
  return ARTICLE_DISPLAY_NAME_MAP[articleKey];
}

export function getTodayArticleHeading(articleKey: TodayArticleKey): string {
  return `${getTodayArticleDisplayName(articleKey)} Answer Today with Explanation and Meaning`;
}

type FallbackSection = {
  heading: string;
  paragraphs: string[];
};

function buildSections(definitions: Array<[string, string, string]>): FallbackSection[] {
  return definitions.map(([heading, first, second]) => ({
    heading,
    paragraphs: [first, second]
  }));
}

function renderFallbackArticleHtml(sections: FallbackSection[]): string {
  return sections
    .map(
      (section) =>
        `<h2>${section.heading}</h2>${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}`
    )
    .join('');
}

function getFallbackGroup(articleKey: TodayArticleKey):
  | 'gamedle'
  | 'geography'
  | 'search'
  | 'semantic'
  | 'visual'
  | 'word' {
  if (
    articleKey === 'dotadle-answer-today' ||
    articleKey === 'loldle-answer-today' ||
    articleKey === 'narutodle-answer-today' ||
    articleKey === 'onepiecedle-answer-today' ||
    articleKey === 'pokedle-answer-today' ||
    articleKey === 'smashdle-answer-today'
  ) {
    return 'gamedle';
  }

  if (
    articleKey === 'betweenle-answer-today' ||
    articleKey === 'countryle-answer-today' ||
    articleKey === 'globle-answer-today' ||
    articleKey === 'worldle-answer-today'
  ) {
    return 'geography';
  }

  if (articleKey === 'searchle-answer-today') {
    return 'search';
  }

  if (articleKey === 'contexto-answer-today' || articleKey === 'semantle-answer-today') {
    return 'semantic';
  }

  if (
    articleKey === 'colordle-answer-today' ||
    articleKey === 'colorfle-answer-today' ||
    articleKey === 'framed-answer-today' ||
    articleKey === 'spotle-answer-today' ||
    articleKey === 'waffle-answer-today'
  ) {
    return 'visual';
  }

  return 'word';
}

function buildFallbackSections(articleKey: TodayArticleKey, date: string): FallbackSection[] {
  const displayName = getTodayArticleDisplayName(articleKey);
  const formattedDate = formatLongDate(date);

  if (articleKey === 'betweenle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: what the page is actually showing you`,
        `The reveal card above settles the ${formattedDate} answer fast, but Betweenle is really about the gap around that answer. Once you know the target word, the useful review is asking why that alphabetical slot was tighter than it first looked.`,
        `That is why the clue cards matter more than a plain spoiler. First letter, last letter, length, and repeat-letter pressure usually tell you whether the board wanted a familiar everyday word or something sitting in a trickier dictionary lane.`
      ],
      [
        `How the alphabetical gap does most of the solving`,
        `Strong Betweenle players do not guess by theme. They guess by range. If the board is squeezing you between two neighbors that share a prefix or suffix, the answer pool gets small very quickly even before the word itself is obvious.`,
        `The mistake is treating every in-between word as equally likely. A tighter gap usually favors ordinary spellings and common endings, which is why checking the pattern on this page after the reveal helps tomorrow's board feel less random.`
      ],
      [
        `Where players lose clean guesses on this game`,
        `Most misses come from staying too attached to the first decent guess. If a word lands on the wrong side of the gap, the better move is usually a bigger alphabetical jump rather than another near-neighbor that preserves the same bad assumption.`,
        `Repeat letters can also slow people down because the board feels like a vocabulary test when it is really an ordering test. Once the gap is narrow, structure beats cleverness almost every time.`
      ],
      [
        `Simple way to make tomorrow's Betweenle easier`,
        `Use the clue cards first, then test one middle-range word before you start making tiny adjustments. That gives you better information than hopping around the same small patch of the alphabet.`,
        `If the gap still looks wide, the <a href="/betweenle-solver">Betweenle solver</a> and the recent answers on this page are the practical next step. They are most useful as a narrowing tool, not as a first move.`
      ]
    ]);
  }

  if (articleKey === 'canuckle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: why the fact card matters early`,
        `The answer card above confirms the ${formattedDate} word, but Canuckle usually opens up once the fact box starts making sense. That extra context often tells you whether the grid is leaning toward geography, culture, food, sport, or a plain word with a Canadian link.`,
        `That is the difference from standard Wordle. You are still solving a five-letter pattern, but the page is also giving you a theme signal that can save two or three wasted guesses if you respect it early enough.`
      ],
      [
        `How the Canadian angle changes the solve path`,
        `Players who treat Canuckle exactly like Wordle often over-test generic openers after the theme is already visible. Once the board clearly points toward a regional term, a French-root word, or a hockey-adjacent clue, broad filler guesses stop paying off.`,
        `The stronger habit is to let the theme narrow the answer list while the letters narrow the spelling. That two-track approach is why Canuckle often feels easier after the second or third clue than it does on the first look.`
      ],
      [
        `What usually causes the wrong guess streak`,
        `The common miss is assuming every Canadian-flavored board wants an iconic word. Sometimes it does. Other times the puzzle uses a normal English word and lets the fact card do the Canadian work around it.`,
        `Another trap is forcing slang too early. If the pattern is still wide open, save the niche guesses for later and keep the board readable first.`
      ],
      [
        `Best way to handle the next Canuckle board`,
        `Read the fact card before guess three, even if you prefer solving cold. It does not spoil the board by itself, but it does stop you from wasting turns in the wrong lane.`,
        `If the grid still feels broad after that, the <a href="/canuckle-solver">Canuckle solver</a> and the archive links on this page are the right next move because they keep the process focused on the Canadian answer pool.`
      ]
    ]);
  }

  if (articleKey === 'colordle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: what the color panel tells you first`,
        `The color name and hex code above are the final check for ${formattedDate}, but the real lesson is how quickly Colordle rewards broad hue control. The page already gives you the exact target once you are ready, so the useful review is how a careful player would have moved toward that shade.`,
        `That usually starts with family, not precision. If the target lives in a warm, cool, muted, or neutral lane, your early guesses should confirm that before you start fussing over tiny percentage changes.`
      ],
      [
        `Why broad hue beats tiny shade changes early`,
        `Players lose time when they make a nearly identical second guess just because the first percentage looked promising. A 40 percent color and a 48 percent color can still be hiding the same wrong assumption about hue or lightness.`,
        `The smarter move is to test direction first. Once the board confirms the family, then the small refinements finally start to matter.`
      ],
      [
        `Where the score can be misleading`,
        `A decent percentage often tricks people into thinking they are one step away when the board is really asking for a different value or saturation level. That is why the guess path on this page is useful after the reveal. It shows which moves actually narrowed the answer and which ones only looked close.`,
        `Names can mislead too. Some color words sound intuitive while their hex value sits further from your mental image than expected. In Colordle, the numbers win.`
      ],
      [
        `How to clean up the next Colordle faster`,
        `Start with a broad anchor, then pivot across the wheel if the score stays flat. That gives cleaner signal than inching along the same color family without proof.`,
        `If you want a second look after the round, the recent history and <a href="/colordle-solver">Colordle solver</a> on this site are better for building pattern memory than trying to memorize isolated shade names.`
      ]
    ]);
  }

  if (articleKey === 'colorfle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: how the mix should be read`,
        `The answer panels above do more than reveal the ${formattedDate} colors. They show the actual structure of the puzzle. Colorfle is easiest when you stop thinking about paint mixing and start reading the board as additive light.`,
        `That shift matters because a color that looks darker or muddier in your head may still come from bright component colors once the weights are doing the heavy lifting.`
      ],
      [
        `What the source colors are telling you`,
        `Normal and hard mode often teach the same lesson in different ways. If both mixes lean toward one hue family, the remaining work is usually balance, not discovery. The question becomes how much of each source color is doing the job.`,
        `That is why the reveal on this page helps after a real attempt. You can compare the final mix with the component colors and see whether the board was hiding a clean complement, a close neighbor, or a small accent color that changed everything.`
      ],
      [
        `Why random mixing burns time here`,
        `Players lose speed when they throw in familiar colors without checking how the target is leaning. A red-heavy guess does not help much if the board is actually missing lightness or blue weight rather than warmth.`,
        `The second mistake is ignoring mode differences. Hard mode is not just more of the same. That extra color changes the logic because one balancing color can soften or redirect the whole target.`
      ],
      [
        `Easy routine for tomorrow's Colorfle`,
        `Call the likely hue family first, then test whether the target needs brightness, neutrality, or contrast. That keeps each guess informative instead of decorative.`,
        `If you want to study patterns after the solve, the <a href="/colorfle-archive">Colorfle archive</a> and <a href="/colorfle-solver">Colorfle solver</a> are more useful than replaying the same instincts over and over.`
      ]
    ]);
  }

  if (articleKey === 'countryle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: which clues deserve attention first`,
        `The reveal block above confirms the ${formattedDate} country, but Countryle becomes much easier once you rank the clue types correctly. Continent and hemisphere do the biggest early filtering. Population, area, and temperature only become truly useful after the region is already tight.`,
        `That is why this game feels harder when every clue is treated the same. It is not a trivia quiz first. It is a narrowing puzzle with geography wrapped around it.`
      ],
      [
        `How comparison clues narrow the map`,
        `A clue about north versus south or warmer versus colder is most helpful when it is paired with one broad anchor. Once you know the continent lane, every comparison stops being abstract and starts behaving like a real filter.`,
        `The fastest solvers are usually not the people who know the most flags. They are the people who know which clue will cut the map in half right now.`
      ],
      [
        `Common Countryle mistakes that waste turns`,
        `The easy mistake is overcommitting to the first country that feels close on one metric. Similar population does not matter much if the hemisphere clue already rules it out.`,
        `Another trap is guessing only famous countries. Countryle often becomes easier when you are willing to test a smaller regional fit instead of circling the same household names.`
      ],
      [
        `Better way to solve the next Countryle board`,
        `Start with a broad continent check, then use one comparison-heavy guess to split the likely region. That gives much cleaner signal than chasing flag memory or capital-city recall.`,
        `If you want support after that point, the <a href="/countryle-solver">Countryle solver</a> is most useful once the board has already told you the geographic lane.`
      ]
    ]);
  }

  if (articleKey === 'globle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: what the heat clues point to first`,
        `The answer on this page closes the ${formattedDate} board quickly, but Globle is really solved by reading heat movement well. A warm guess is not just encouragement. It tells you where the next split should happen.`,
        `That is why strong Globle solves often look calm. The best players are not guessing more countries. They are choosing countries that divide the remaining map more clearly.`
      ],
      [
        `How to triangulate without wandering`,
        `The first useful shift usually comes from moving across regions instead of hopping between neighbors too early. Once one part of the map turns warm, the next guess should tighten direction, not merely test another famous country nearby.`,
        `Small countries and coastal edge cases only become good guesses after the broad lane is already clear. Before that, they often hide information rather than reveal it.`
      ],
      [
        `Where players misread the heat map`,
        `A very warm guess does not always mean the answer sits right next door. It can also mean your region is correct while your position is still off by a few borders, a sea crossing, or a long north-south stretch.`,
        `That is the trap on boards that involve long, thin countries or tightly packed regions. The color looks close, but the map logic still needs one more disciplined split.`
      ],
      [
        `How to make tomorrow's Globle cleaner`,
        `Use one broad opener, one regional correction, and only then the tighter local guess. That rhythm keeps the puzzle from turning into a list of near-misses.`,
        `The <a href="/globle-archive">Globle archive</a> is useful because it lets you compare how different regions heat up. A few reviewed boards teach more than another blind streak of guesses.`
      ]
    ]);
  }

  if (articleKey === 'quordle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: what the four boards usually demand first`,
        `The answers above are the quick check for ${formattedDate}, but Quordle rarely falls apart because one word is impossible. It usually falls apart because one early guess helps only one board while the other three stay vague.`,
        `That is why the opening matters more here than in a single-grid game. Every guess needs to carry two jobs: make progress on the easiest board and pull information from the stubborn ones.`
      ],
      [
        `How to split attention without losing the board`,
        `A board that looks almost solved can trick you into spending a whole turn for one clean finish. Sometimes that is right. Often it is not. If another board is still foggy, the stronger guess is the one that keeps both boards moving.`,
        `Quordle rewards balanced pressure. A clean solve usually comes from staying useful everywhere until one board becomes impossible to ignore.`
      ],
      [
        `Which guesses are actually worth the risk`,
        `Good Quordle guesses test structure, not just letters. If two boards are both hinting at common endings, a well-chosen probe can settle both at once. If the boards are pulling in different directions, the guess should cover the leftover unknowns rather than chase a lucky finish.`,
        `The common mistake is panicking once one board looks awkward. That is the moment to widen information again, not to swing harder at the same half-solved pattern.`
      ],
      [
        `How to finish tomorrow's Quordle with fewer scrambles`,
        `Think in pairs. Which board is nearly solved, and which board can benefit from the same probe word? That question usually saves more guesses than trying to clear the prettiest grid first.`,
        `If the board still jams, the <a href="/quordle-solver">Quordle solver</a> and <a href="/quordle-archive">Quordle archive</a> on this site help most after you have already narrowed the letter pool.`
      ]
    ]);
  }

  if (articleKey === 'dotadle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: which hero clues do the real narrowing`,
        `The answer cards above confirm the ${formattedDate} hero across each mode, but Dotadle usually turns on a small set of meaningful filters. Role, attribute, and signature associations do more work than a flashy quote or cosmetic clue until the roster is already tight.`,
        `That is why this page is most useful after a genuine attempt. You can compare the final hero with the clue stack and see which filter was actually carrying the board.`
      ],
      [
        `How to cut the Dota roster without chasing flavor text`,
        `The smartest first move is usually a hero with a clean attribute profile, not a fan favorite. Strength, Agility, Intelligence, and Universal splits trim the field much faster than guessing by vibe.`,
        `Once the main bucket is clear, the supporting clues finally start making sense. Before that point they often feel louder than they are.`
      ],
      [
        `When players stick to the wrong branch`,
        `A near miss in Dotadle can be dangerous because the Dota roster has enough overlap to make one wrong assumption feel almost correct for too long. A role clue that looks close may still hide the wrong attribute lane underneath it.`,
        `That is the moment to branch out, not double down. If the clue stack is only half-agreeing with you, it is probably disagreeing in the place that matters most.`
      ],
      [
        `Smarter way to approach tomorrow's Dotadle`,
        `Use the first clues to separate the roster broadly, then save the narrow lore reads for the endgame. That order keeps the board practical instead of turning it into a memory contest too early.`,
        `If you want backup after the rough shape is clear, the Dotadle solver on WordSolverX is most helpful once you already know the likely hero class or attribute lane.`
      ]
    ]);
  }

  if (articleKey === 'loldle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: what the champion clues narrow first`,
        `The reveal cards above verify the ${formattedDate} answers, but LoLdle is usually solved by reading champion identity in layers. Position, species, resource type, universe, and release-year clues all matter, though not at the same time.`,
        `That is why one half-correct champion guess can still waste a turn. If the clue that matters most is wrong, the rest of the board only looks close.`
      ],
      [
        `How to separate role clues from universe clues`,
        `Role clues are often the quickest early splitter because they cut the roster into workable groups. Universe and skin or splash context help later, when the shortlist is already small enough for those details to mean something.`,
        `A careful player usually asks which clue changes the pool the most right now. In LoLdle, that question is often better than asking which champion feels familiar.`
      ],
      [
        `Where the board usually steals guesses`,
        `The trap is leaning too hard on fandom memory. Many champions share broad traits, but only a few fit the exact clue combination on the page. That is why a champion that seems obvious can still be the wrong branch.`,
        `Quote and emoji modes can create the same problem. They feel specific, yet the stronger early read often comes from the quieter profile clues sitting next to them.`
      ],
      [
        `How to guess tomorrow's LoLdle more efficiently`,
        `Start with a champion that splits the roster cleanly, then let the side modes confirm or break that lane. That keeps the puzzle readable even when one mode feels noisy.`,
        `When you need a second check, the LoLdle solver on this site works best after you already know whether the board is leaning toward a certain role, species, or release era.`
      ]
    ]);
  }

  if (articleKey === 'narutodle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: which filters matter most first`,
        `The answer area above confirms the ${formattedDate} character and mode results, but Narutodle usually becomes manageable once the board gives you one strong anchor such as village, rank, or nature type. Until that happens, lore details can feel bigger than they are.`,
        `That is why a page like this helps after a real attempt. You can see which clue narrowed the field for real and which one only looked dramatic in the moment.`
      ],
      [
        `How village, rank, and chakra clues work together`,
        `Village clues cut the cast broadly. Rank and ability clues then tell you whether you are looking at a front-line shinobi, a specialist, or a character who only shares one visible trait with your guess.`,
        `The smartest read is usually the least flashy one. A simple affiliation clue often does more work than a cool jutsu reference until the shortlist is already small.`
      ],
      [
        `Where Naruto knowledge can still mislead you`,
        `Fans lose guesses when they follow a memorable scene instead of the full clue stack. Narutodle rewards breadth more than momentary recognition. If the age, village, or technique family is off, the dramatic similarity does not save the guess.`,
        `That is especially true on quote-heavy boards where several characters feel plausible for a while.`
      ],
      [
        `How to solve the next Narutodle with fewer wild guesses`,
        `Open by cutting the cast into a clean faction or village lane, then use the sharper ability clues only after that base is set. The solve gets calmer as soon as the universe around the character is clear.`,
        `If you get stuck between two similar names, the Narutodle solver works best after those broad filters are already locked.`
      ]
    ]);
  }

  if (articleKey === 'onepiecedle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: what the clue stack narrows first`,
        `The reveal cards above give the ${formattedDate} answer set quickly, but OnePiecedle usually tightens through crew, bounty, arc, and ability clues long before the exact name becomes obvious. The best review question is which one of those filters cut the field the fastest.`,
        `That is why a plain spoiler is only half the value. The stronger takeaway is how the page's clue stack sorted a very large cast into one believable lane.`
      ],
      [
        `How crew, bounty, and ability clues separate the cast`,
        `Crew or faction clues do the broad separation first. Bounty and power details usually matter next because they split characters who might share the same rough story role.`,
        `Players move faster once they stop treating every anime memory equally. In OnePiecedle, the cast is too large for that. The cleaner solve comes from respecting the filters in order.`
      ],
      [
        `Why familiar names can still be wrong here`,
        `A recognizable character can match half the board and still miss the one clue that actually matters. That is the trap on franchises with huge rosters. The guess feels right because the story memory is strong, not because the full clue set agrees.`,
        `The safest way out is to keep asking which detail would truly eliminate the current favorite, then test that first.`
      ],
      [
        `How to clean up the next OnePiecedle faster`,
        `Use one broad faction guess to settle the cast lane, then let bounty or ability details do the cleanup. That approach usually saves more turns than opening with a famous top-tier name.`,
        `When you need help, the OnePiecedle solver is most practical after you already know whether the board is pointing toward a pirate crew, marine, or arc-specific group.`
      ]
    ]);
  }

  if (articleKey === 'pokedle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: what the strongest attribute signal is`,
        `The answer cards above verify the ${formattedDate} result, but Pokedle is usually won by respecting one hard filter early. Generation, typing, evolution stage, and silhouette-like cues do not pull equal weight on every board.`,
        `That is why a near hit can still be misleading. If the strongest attribute is off, the rest of the similarity only burns turns.`
      ],
      [
        `How generation, type, and stage narrow the pool`,
        `Generation is often the cleanest broad split because it removes huge parts of the dex at once. Type and stage then tell you whether the board wants a starter line, a single-stage Pokemon, or something whose move and stat profile keeps fooling the same guesses.`,
        `The solve usually gets easier the moment those clues are treated like filters instead of trivia facts.`
      ],
      [
        `Where similar lines cause the wrong guess`,
        `Pokedle punishes people who stay inside one family tree too long. If the first evolution line feels close but the stage clue does not line up, the right move is often to leave the line completely instead of polishing the same idea.`,
        `Typing can create the same trap because several lines share a familiar pair while behaving very differently once region or generation is considered.`
      ],
      [
        `How to approach tomorrow's Pokedle more cleanly`,
        `Start with a Pokemon that gives a clean generation and type split, then use stage or form clues to narrow. That keeps the board readable without forcing you into deep dex memory too early.`,
        `If you are down to a short list, the Pokedle solver is best used after the broad filters are already settled.`
      ]
    ]);
  }

  if (articleKey === 'smashdle-answer-today') {
    return buildSections([
      [
        `${displayName} answer today: which fighter clue matters first`,
        `The answer reveal above confirms the ${formattedDate} fighter and mode results, but Smashdle normally tightens through universe and roster logic before movement or attack details become decisive. That first split is where most clean solves begin.`,
        `Once the franchise lane is right, the rest of the page feels smaller. Until then, several fighters can look almost perfect for the wrong reasons.`
      ],
      [
        `How universe clues and roster details work together`,
        `Universe is usually the best broad separator because it strips out most of the roster immediately. After that, weight class, movement feel, Final Smash, or stage associations finally become sharp enough to matter.`,
        `That order matters because Smashdle is full of characters with overlapping combat vibes. The franchise clue usually tells the truth first.`
      ],
      [
        `Why DLC and crossover memory can mislead you`,
        `The board often feels hardest when a crossover fighter seems obvious but the secondary details do not quite fit. DLC fighters are especially good at creating that illusion because their identity is so memorable that players forgive the wrong clues for too long.`,
        `The better move is to trust the strict clue mismatch and branch out earlier than your instinct wants to.`
      ],
      [
        `How to tighten the next Smashdle faster`,
        `Lock the likely universe first, then use one clue that clearly separates similar fighters instead of guessing another fan favorite from the same series.`,
        `If you want a support tool, the Smashdle solver is most helpful once you already know the likely roster lane and just need the last clean split.`
      ]
    ]);
  }

  if (articleKey === 'searchle-answer-today') {
    return [
      {
        heading: `${displayName} answer today: what the prompt is really asking`,
        paragraphs: [
          `The answer box above is the fastest way to confirm the ${formattedDate} Searchle result, but the useful part is the prompt itself. Searchle rewards pattern recognition, not trivia, so the strongest solve path is usually to ask what an ordinary Google user would finish first rather than what sounds smartest.`,
          `That also explains why short, obvious completions tend to beat clever guesses. If the phrase above feels broad, the winning word is often the one that sounds most everyday, most searchable, and easiest to type on instinct.`
        ]
      },
      {
        heading: `How to narrow autocomplete guesses without overthinking`,
        paragraphs: [
          `Start with intent. Is the prompt a health question, a fix-it search, a relationship question, or a pop-culture lookup? Once the intent is clear, the answer space gets much smaller because most autocomplete phrases follow familiar patterns.`,
          `The next filter is tone. People search in plain language, especially when they are rushed, confused, or curious. A simple completion usually fits better than a formal one, which is why checking the wording on this page before you jump matters.`
        ]
      },
      {
        heading: `Common Searchle misses that waste the first few tries`,
        paragraphs: [
          `Players lose time when they answer the prompt like a teacher instead of a searcher. Searchle is built around real query behavior, so the best guess is often the most common phrasing, not the most precise phrasing.`,
          `Another common miss is ignoring how broad the query feels. If the prompt could fit thousands of topics, the answer is usually a high-frequency word. Save niche completions for moments when the wording already points at a very specific category.`
        ]
      },
      {
        heading: `Easy way to solve future Searchle boards faster`,
        paragraphs: [
          `Use the <a href="/searchle-archive">Searchle archive</a> to study old prompt shapes. A few minutes there teaches you which verbs, emotions, and complaint words come up again and again.`,
          `If the prompt still feels too open, the <a href="/searchle-solver">Searchle solver</a> is the cleaner next step. It keeps the process focused without turning the page into a wall of guess-and-check.`
        ]
      }
    ];
  }

  if (articleKey === 'waffle-answer-today') {
    return [
      {
        heading: `${displayName} answer today: how to read the solved board above`,
        paragraphs: [
          `The solved grid on this page matters because Waffle is a swap puzzle, not a hidden-word puzzle. Once you can see where each letter ended up, the real lesson is the path the board wanted rather than the word list by itself.`,
          `That is why the answer grid and definitions together are more useful than a bare spoiler. They show which crossings locked the puzzle and which rows probably looked misleading before the last few swaps.`
        ]
      },
      {
        heading: `Where most Waffle swaps get wasted`,
        paragraphs: [
          `The biggest leak is chasing edge letters before the crossings are settled. A corner square may look urgent, but the central intersections control two words at once and usually create the fastest cascade of correct placements.`,
          `The second leak is moving a letter that is already earning strong color feedback just because another row looks messy. Waffle punishes impatience. If a letter is almost home, solve around it instead of resetting the whole lane.`
        ]
      },
      {
        heading: `A cleaner routine for tomorrow's Waffle`,
        paragraphs: [
          `Start by freezing every obvious anchor and then trace the letters that must serve two words. That turns the board from six separate word problems into one connected routing problem, which is the easier way to think about it.`,
          `After that, look for swaps that improve two lines at once. Single-line cleanups feel productive, but the efficient solves usually come from moves that fix an across word and a down word together.`
        ]
      },
      {
        heading: `When the archive or solver is actually worth using`,
        paragraphs: [
          `The <a href="/waffle-archive">Waffle archive</a> is helpful when you want to compare board shapes and see how often certain crossing patterns repeat. That kind of review builds pattern memory much faster than random replay.`,
          `If a grid completely jams you, the <a href="/waffle-solver">Waffle solver</a> is most useful after you have already found the anchors. At that point it becomes a learning tool instead of just a bailout button.`
        ]
      }
    ];
  }

  if (articleKey === 'contexto-answer-today') {
    return [
      {
        heading: `${displayName} answer today: what the ranking pattern usually means`,
        paragraphs: [
          `The answer reveal above closes the puzzle, but the better takeaway is how Contexto squeezes players through meaning instead of spelling. A low rank is not just a hint that you are close. It tells you the category around the target is finally narrowing in a useful way.`,
          `That is why the first strong hit matters more than the first dozen weak ones. Once a guess lands in the right semantic neighborhood, the page becomes less about hunting for the exact word and more about choosing the next branch carefully.`
        ]
      },
      {
        heading: `When to pivot categories instead of forcing synonyms`,
        paragraphs: [
          `Players get stuck when they keep rewriting the same idea with slightly different words. If a cluster stops improving, the better move is to step one level up or sideways and test the neighboring concept instead.`,
          `Broad nouns and everyday verbs do a better job of reopening the map than clever niche guesses. Contexto usually rewards simple category control long before it rewards precision.`
        ]
      },
      {
        heading: `Why broad words usually beat smart-sounding words`,
        paragraphs: [
          `The strongest early guesses are plain because they cover more ground. A word like "tool," "feeling," or "place" can shift the board much more than a specialized term that only tests one tiny lane of meaning.`,
          `That does not make the puzzle shallow. It means the game wants structure first and detail second, which is exactly why fast solvers look calm even when the answer itself is not obvious.`
        ]
      },
      {
        heading: `Best way to practice without flattening the challenge`,
        paragraphs: [
          `Use the <a href="/contexto-archive">Contexto archive</a> to review how older answers pulled guesses toward them. Seeing those patterns side by side is the quickest way to improve your feel for rank movement.`,
          `If you want outside help, use it after you have already identified a likely category. That keeps the page useful as a learning aid instead of turning every puzzle into a blind copy exercise.`
        ]
      }
    ];
  }

  if (articleKey === 'semantle-answer-today') {
    return [
      {
        heading: `${displayName} answer today: what the score is pushing you toward`,
        paragraphs: [
          `Semantle feels loose until one guess suddenly gets warm. That warm score matters because it tells you not just that you are near the answer, but which cluster of meaning is now worth exploring.`,
          `The reveal on this page is the finish line. The better lesson is how quickly the board changes once a category word finally lands with real weight.`
        ]
      },
      {
        heading: `The difference between wandering and exploring`,
        paragraphs: [
          `Wandering is throwing unrelated guesses at the model and hoping something spikes. Exploring is testing a family of related words on purpose so each score teaches you what branch to follow next.`,
          `That distinction is why patient solvers improve. Semantle rewards controlled movement through meaning, not random flashes of vocabulary.`
        ]
      },
      {
        heading: `Why ordinary words are often the right reset`,
        paragraphs: [
          `When the board stalls, the smartest reset is usually an ordinary word instead of a more technical one. Common language sits closer to the center of many semantic groups, so it gives clearer feedback about direction.`,
          `That is also why a simple noun or verb can outperform a fancy near-synonym. The model often wants the broad concept before it gives you the exact edge of it.`
        ]
      },
      {
        heading: `How to build better instincts for the next puzzle`,
        paragraphs: [
          `The <a href="/semantle-archive">Semantle archive</a> helps because it shows how different answers pull scores in very different ways even when the final word seems familiar.`,
          `Use older boards to study category jumps, not just final solutions. That habit makes tomorrow's guesses cleaner and keeps your first 20 tries far more deliberate.`
        ]
      }
    ];
  }

  if (articleKey === 'spotle-answer-today') {
    return [
      {
        heading: `${displayName} answer today: how the clue stack is supposed to help`,
        paragraphs: [
          `Spotle becomes much easier once the clue stack is read in the right order. Genre and country normally do the heaviest filtering first, while debut year and group size clean up the shortlist after that.`,
          `That is why the answer card above is more useful than a plain artist name. It shows the surrounding metadata you would want to learn from if the puzzle nearly slipped away.`
        ]
      },
      {
        heading: `Why genre is usually stronger than track recognition`,
        paragraphs: [
          `Most players chase the song title too early, but genre is the faster filter because it cuts the database before memory has to do the hard work. Once the style of artist is clear, the rest of the clues stop feeling random.`,
          `Country and group size matter more than they look. A solo act from one market and a five-member group from another can share a surface vibe while still belonging to completely different answer lanes.`
        ]
      },
      {
        heading: `Common Spotle mistakes that slow the finish`,
        paragraphs: [
          `The biggest mistake is guessing only artists you already love. Spotle often rewards roster logic more than fandom memory, so familiar names are useful only when their attributes teach you something clean.`,
          `The second mistake is ignoring era. If the debut year clue points one way, let it break the tie instead of forcing a modern artist into a classic slot or the other way around.`
        ]
      },
      {
        heading: `How to practice without making every puzzle feel the same`,
        paragraphs: [
          `The <a href="/spotle-archive">Spotle archive</a> is the right place to study recurring countries, genres, and eras. A short archive review builds better instinct than replaying the same few household names.`,
          `If the clue mix still feels too broad, the <a href="/spotle-solver">Spotle solver</a> is useful once you already know the likely genre lane. That keeps the page practical without flattening the challenge.`
        ]
      }
    ];
  }

  const group = getFallbackGroup(articleKey);

  if (group === 'gamedle') {
    return [
      {
        heading: `${displayName} answer today: what the mode cards confirm first`,
        paragraphs: [
          `The answer cards above already give the fastest confirmation, but the useful part is seeing how each mode narrows the same roster in a different way. One mode rewards character memory, another rewards icon recognition, and another rewards tiny attribute differences that only start to matter once the pool is small.`,
          `That is why this kind of page works best as a verification pass after a real attempt. The answer itself is only half the value. The clue logic behind it is what helps on the next board.`
        ]
      },
      {
        heading: `Which clue bucket matters most on this game`,
        paragraphs: [
          `The strongest clue is usually the one that slices the roster, not the one that looks flashy. Universe, region, role, release era, or affiliation will usually cut deeper than a cosmetic detail because those attributes split the board into meaningful groups right away.`,
          `Once that main filter is clear, the secondary clues stop feeling noisy. Instead of asking who looks right, the better question becomes which remaining name still fits every locked attribute on the page.`
        ]
      },
      {
        heading: `How to shrink the roster without rushing`,
        paragraphs: [
          `The most common mistake is staying too close to the first guess. If one clue lane turns red or clearly misses, move to a different branch instead of trying a near-neighbor that preserves the same weak assumptions.`,
          `That is also the moment when the answer page becomes useful. Looking at how the winning character sits inside the final clue set teaches you which filters were worth trusting and which ones were just noise.`
        ]
      },
      {
        heading: `When the solver is the smarter move`,
        paragraphs: [
          `The <a href="/${articleKey.replace('-answer-today', '-solver')}">${displayName} solver</a> is most helpful after two or three clean clue reads. At that point the puzzle is constrained enough that the remaining candidates actually teach you something.`,
          `If you want pattern review, the neighboring answer pages and archive links on WordSolverX do the rest. Studying solved boards in batches is usually faster than trying to memorize the whole roster cold.`
        ]
      }
    ];
  }

  if (group === 'geography') {
    return [
      {
        heading: `${displayName} answer today: what the answer block is really confirming`,
        paragraphs: [
          `The answer or reveal panel above is the quick finish, but the real value is how the page frames the geography clues around it. Distance, direction, continent, and comparison data are all different ways of shrinking the same map.`,
          `That is why strong geography solvers rarely guess randomly for long. Once the region is implied, every extra clue should tighten the search instead of restarting it.`
        ]
      },
      {
        heading: `How to read the clue pressure instead of just the clue text`,
        paragraphs: [
          `A clue is only useful if it changes the map. Continent clues carve the broadest space first, while direction and proximity usually matter more once you are already in the right part of the world.`,
          `Players get faster when they stop treating every clue as equal. The best next guess is the one that will split the remaining map most cleanly, not the one that feels most famous.`
        ]
      },
      {
        heading: `Where easy geography guesses go sideways`,
        paragraphs: [
          `The common trap is overcommitting to a neighboring country too early. One warm signal does not always mean the answer sits right beside your last guess. It can also mean the region is correct while the scale is still off.`,
          `Another trap is ignoring small countries and edge cases. Those answers are what punish a solve routine that depends only on major capitals and big map shapes.`
        ]
      },
      {
        heading: `How to close out the next board faster`,
        paragraphs: [
          `Use the archive and solver tools on WordSolverX as pattern study, not just as spoiler shortcuts. Seeing how past boards tightened from broad guesses into clean finishes is what turns geography trivia into repeatable solving.`,
          `The next time the answer feels close but not obvious, slow down and pick the guess that gives the best split. That single habit does more than memorizing another list of capitals.`
        ]
      }
    ];
  }

  if (group === 'visual') {
    return [
      {
        heading: `${displayName} answer today: what stands out on the page first`,
        paragraphs: [
          `Visual puzzle pages reward observation before speed. The reveal block above settles the answer, but the stronger lesson is how the board presents contrast, shape, color, or composition before anything is spelled out directly.`,
          `That is why a good explanation page focuses on the signal the puzzle gave you, not just the name it was hiding. Once the signal is clear, future guesses get much cleaner.`
        ]
      },
      {
        heading: `How to use the visual clue without chasing noise`,
        paragraphs: [
          `The best first read is usually the broadest one. Is the board asking for shape, value, palette, framing, or pattern? Once that is settled, smaller details become useful instead of distracting.`,
          `Players lose time when they lock onto one dramatic detail and build the whole solve around it. The safer move is to confirm the broad visual lane first and only then use the finer cues to finish.`
        ]
      },
      {
        heading: `Why random guesses feel especially expensive here`,
        paragraphs: [
          `Visual games punish random swings because every weak guess usually leaves the same ambiguity in place. A board that wants careful narrowing does not suddenly become easier because the guesses come faster.`,
          `That is also why the reveal page matters. Looking back at the winning visual pattern after the fact helps more than simply knowing the answer name ever could.`
        ]
      },
      {
        heading: `Simple way to make the next board easier`,
        paragraphs: [
          `Use the related archive or solver links on this site to compare a few recent boards side by side. That kind of review trains your eye to spot recurring clue shapes much faster than one isolated solve.`,
          `When the next puzzle loads, call the broad lane first, then make your refinement guess. That habit keeps visual puzzles from turning into pure trial and error.`
        ]
      }
    ];
  }

  return [
    {
      heading: `${displayName} answer today: what this page helps you verify`,
      paragraphs: [
        `The answer on this page is here for speed, but the explanation matters because daily puzzle pages are most useful when they show why the solve tightened up. A direct reveal saves time. A good breakdown saves future guesses.`,
        `That is the balance WordSolverX is aiming for on answer pages like this one: fast verification first, then a short explanation of what clue pattern or solve habit mattered most.`
      ]
    },
    {
      heading: `How to read the clue pressure instead of guessing on autopilot`,
      paragraphs: [
        `Most daily games become easier once the strongest clue type is identified early. Sometimes that is letter structure, sometimes category fit, and sometimes a visual or comparison signal that rules out huge chunks of the board.`,
        `The fastest solves come from respecting that primary clue and letting the weaker clues confirm it, not the other way around.`
      ]
    },
    {
      heading: `The mistake that burns the most time`,
      paragraphs: [
        `Players usually lose time by making near-duplicate guesses that preserve the same bad assumption. If a clue lane already looks weak, switch lanes instead of polishing the wrong idea.`,
        `That is also why review pages help. They make it easier to see where the solve should have pivoted before the final answer became obvious.`
      ]
    },
    {
      heading: `A cleaner routine for the next daily board`,
      paragraphs: [
        `Check the archive and solver links on this site when you want pattern practice, not just the spoiler. A few deliberate reviews teach more than a pile of rushed guesses.`,
        `The next board usually gets easier once you identify the strongest clue first, make one split guess, and only then narrow. That simple rhythm works across most daily puzzle formats.`
      ]
    }
  ];
}

function buildFallbackArticle(articleKey: TodayArticleKey, date: string): DailyArticleContent {
  return {
    articleKey,
    date,
    title: getTodayArticleHeading(articleKey),
    summary: `A clear ${getTodayArticleDisplayName(articleKey)} explanation for ${formatLongDate(date)}, focused on clue reading, solve flow, and cleaner daily strategy.`,
    articleHtml: renderFallbackArticleHtml(buildFallbackSections(articleKey, date)),
    meta: {
      fallbackUsed: true,
      fallbackSource: 'runtime',
      editorialVersion: 2
    }
  };
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
  const isRuntimeFallback = article.meta?.fallbackSource === 'runtime';
  const strictGeneric =
    article.game !== 'wordle' &&
    article.game !== 'colordle' &&
    !isRuntimeFallback;
  const htmlWordCount = countWords(rawHtml);

  if (containsTemplatePlaceholder(rawCombined)) {
    return null;
  }

  if (!isRuntimeFallback && article.meta?.fallbackUsed) {
    return null;
  }

  if (strictGeneric && findDisallowedPersonalVoice(rawCombined)) {
    return null;
  }

  if (strictGeneric && (htmlWordCount < 260 || htmlWordCount > 950)) {
    return null;
  }

  if (strictGeneric && /<h1\b/i.test(rawHtml)) {
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
  const runtimeFallback =
    date && key in ARTICLE_DISPLAY_NAME_MAP
      ? buildRenderableArticle(buildFallbackArticle(key as TodayArticleKey, date), date, options)
      : null;
  const prefersEditorialRuntimeFallback =
    date &&
    EDITORIAL_RUNTIME_FALLBACK_KEYS.has(key as TodayArticleKey);

  const latestBundleArticle = buildRenderableArticle(dailyArticles.articles?.[key] ?? null, date, options);
  if (
    prefersEditorialRuntimeFallback &&
    runtimeFallback &&
    latestBundleArticle?.meta?.editorialVersion !== 2
  ) {
    return runtimeFallback;
  }
  if (latestBundleArticle) {
    return latestBundleArticle;
  }

  const routeStore = routeArticleStores[key];
  const byDate = routeStore?.byDate ?? {};

  if (date && byDate[date]) {
    const exactArticle = buildRenderableArticle(byDate[date] ?? null, date, options);
    if (
      prefersEditorialRuntimeFallback &&
      runtimeFallback &&
      exactArticle?.meta?.editorialVersion !== 2
    ) {
      return runtimeFallback;
    }
    if (exactArticle) {
      return exactArticle;
    }
  }

  if (runtimeFallback) {
    return runtimeFallback;
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
