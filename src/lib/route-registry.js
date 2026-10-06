export const TODAY_STATIC_ROUTES = [
  '/today',
  '/batterup-answer-today',
  '/betweenle-answer-today',
  '/canuckle-answer-today',
  '/colorfle-answer-today',
  '/colordle-answer-today',
  '/contexto-answer-today',
  '/countryle-answer-today',
  '/dotadle-answer-today-updated',
  '/framed-answer-today',
  '/globle-answer-today',
  '/loldle-answer-today-updated',
  '/marveldle-answer-today',
  '/narutodle-answer-today-updated',
  '/nerdle-answer-today',
  '/onepiecedle-answer-today-updated',
  '/phoodle-answer-today',
  '/phrazle-answer-today',
  '/pokedle-answer-today-updated',
  '/quordle-answer-today',
  '/searchle-answer-today',
  '/semantle-answer-today',
  '/smashdle-answer-today-updated',
  '/spotle-answer-today',
  '/worgle-answer-today',
  '/waffle-answer-today',
  '/wordle-answer-today',
  '/worldle-answer-today'
];

export const EVERGREEN_STATIC_ROUTES = [
  '/',
  '/about',
  '/archive',
  '/guides/how-to-solve-wordle-in-3-guesses',
  '/guides/best-wordle-starting-words',
  '/guides/wordle-hard-mode-guide',
  '/guides/words-with-lots-of-vowels',
  '/guides/two-vowel-words-for-wordle',
  '/guides/words-with-double-letters',
  '/guides/5-letter-words-ending-in-e',
  '/guides/5-letter-words-starting-with-s',
  '/guides/how-to-win-quordle-every-time',
  '/guides/nerdle-strategy-guide',
  '/guides/how-to-play-betweenle',
  '/guides/globle-strategy-guide',
  '/guides/worldle-strategy-guide',
  '/guides/how-to-solve-a-waffle-puzzle',
  '/guides/how-to-play-contexto',
  '/guides/semantle-strategy-guide',
  '/guides/how-to-get-better-at-word-games',
  '/guides/are-wordle-solvers-cheating',
  '/guides/daily-word-games-like-wordle',
  '/guides/colordle-strategy-guide',
  '/betweenle-solver',
  '/boggle-solver',
  '/batterup-solver',
  '/colorfle-solver',
  '/colordle-solver',
  '/contact',
  '/countryle-solver',
  '/dmca-policy',
  '/disclaimer',
  '/dotadle-solver',
  '/editorial-policy',
  '/guides',
  '/hangman-solver',
  '/kanoodle-solver',
  '/light-out-solver',
  '/loldle-solver',
  '/marveldle-solver',
  '/minesweeper-solver',
  '/narutodle-solver',
  '/nonogram-solver',
  '/nerdle-solver',
  '/onepiecedle-solver',
  '/canuckle',
  '/canuckle-answer-today',
  '/canuckle-archive',
  '/canuckle-solver',
  '/phoodle-solver',
  '/pokedle-solver',
  '/privacy-policy',
  '/quordle-solver',
  '/dordle-solver',
  '/octordle-solver',
  '/hardle-solver',
  '/warmle-solver',
  '/woodle-solver',
  '/w-peaks-solver',
  '/xordle-solver',
  '/fibble-solver',
  '/searchle-solver',
  '/smashdle-solver',
  '/solver',
  '/soundmap-solver',
  '/spotle-wordle-solver',
  '/spotle-solver',
  '/squaredle-solver',
  '/terms-of-service',
  '/terminus-solver',
  '/waffle-solver',
  '/weaver-solver',
  '/word-ladder-solver',
  '/wordle-hardest-answers',
  '/wordle-solver',
  '/worldle-solver',
  '/3-letter-wordle-solver',
  '/4-letter-wordle-solver',
  '/6-letter-wordle-solver',
  '/7-letter-wordle-solver',
  '/8-letter-wordle-solver',
  '/9-letter-wordle-solver',
  '/10-letter-wordle-solver',
  '/11-letter-wordle-solver'
];

export const ARCHIVE_STATIC_ROUTES = [
  '/canuckle-archive',
  '/batterup-archive',
  '/colorfle-archive',
  '/colordle-archive',
  '/contexto-archive',
  '/countryle-archive',
  '/framed-archive',
  '/globle-archive',
  '/marveldle-archive',
  '/nerdle-archive',
  '/phoodle-archive',
  '/phrazle-archive',
  '/quordle-archive',
  '/searchle-archive',
  '/semantle-archive',
  '/spotle-archive',
  '/worgle-archive',
  '/waffle-archive',
  '/wordle-answer-archive',
  '/worldle-archive'
];

export const API_RUNTIME_ROUTES = [
  '/api/*',
  '/sitemap.xml',
  '/wordle-archive-sitemap.xml',
  '/colordle-archive-sitemap.xml'
];

export const SITEMAP_EXCLUDED_ROUTES = [
  '/canuckle'
];

export const PUBLIC_ROUTE_ENTRIES = [
  ...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES])
];

export const PAGES_FUNCTION_INCLUDE_ROUTES = [...new Set([...API_RUNTIME_ROUTES, '/wordle/*'])];

// --- Wordle dated answer pages (/wordle-answer-for-month-day-year) ---
// Wordle launched 2021-06-19. We prerender one page per past date up to YESTERDAY
// only — "today" always lives on /wordle-answer-today, so we never generate a page
// for the current puzzle. The Wordle rollover is 16:30 UTC (+30s grace); after that
// boundary the visible puzzle date advances by one day (visibleDateOffsetDays = 1).
const WORDLE_MONTH_NAMES = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

function buildWordleDatedAnswerRoutes(now = new Date()) {
	const routes = [];
	const rolloverBoundary = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
		16,
		30,
		30,
		0
	);
	const offsetDays = now.getTime() >= rolloverBoundary ? 1 : 0;
	const todayPuzzle = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays)
	);
	const end = new Date(todayPuzzle);
	end.setUTCDate(end.getUTCDate() - 1);

	const cursor = new Date(Date.UTC(2021, 5, 19)); // Wordle #1
	while (cursor <= end) {
		routes.push(
			`/wordle-answer-for-${WORDLE_MONTH_NAMES[cursor.getUTCMonth()]}-${cursor.getUTCDate()}-${cursor.getUTCFullYear()}`
		);
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return routes;
}

export const WORDLE_DATED_ANSWER_ROUTES = buildWordleDatedAnswerRoutes();

// --- Colordle dated answer pages (/colordle-answer-for-month-day-year) ---
// Colordle launched 2023-08-07. One page per past date up to YESTERDAY - "today"
// always lives on /colordle-answer-today. Colordle uses the same 16:30 UTC rollover
// as Wordle (visibleDateOffsetDays = 1).
function buildColordleDatedAnswerRoutes(now = new Date()) {
	const routes = [];
	const rolloverBoundary = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
		16,
		30,
		30,
		0
	);
	const offsetDays = now.getTime() >= rolloverBoundary ? 1 : 0;
	const todayPuzzle = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays)
	);
	const end = new Date(todayPuzzle);
	end.setUTCDate(end.getUTCDate() - 1);

	const cursor = new Date(Date.UTC(2023, 7, 7)); // Colordle #1
	while (cursor <= end) {
		routes.push(
			`/colordle-answer-for-${WORDLE_MONTH_NAMES[cursor.getUTCMonth()]}-${cursor.getUTCDate()}-${cursor.getUTCFullYear()}`
		);
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return routes;
}

export const COLORDLE_DATED_ANSWER_ROUTES = buildColordleDatedAnswerRoutes();


// --- Wordle letter-hint micro pages (/wordle-hints/*) ---
// Static, prerendered daily-hint pages. The puzzle date is the puzzle-window
// date (getPuzzleDateForGame('wordle')) resolved in each page's server load,
// never the build date.
export const WORDLE_HINT_ROUTES = [
  '/wordle-hints/first-letter',
  '/wordle-hints/first-two-letters',
  '/wordle-hints/middle-letter',
  '/wordle-hints/last-two-letters',
  '/wordle-hints/last-letter',
  '/wordle-hints/vowel-count',
  '/wordle-hints/consonant-count',
  '/wordle-hints/repeating-letters',
  '/wordle-hints/letter-pattern',
  '/wordle-hints/unique-letters',
  '/wordle-hints/starts-with-vowel',
  '/wordle-hints/word-definition'
];

export const PRERENDER_ENTRIES = [
  ...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES, ...WORDLE_HINT_ROUTES, ...WORDLE_DATED_ANSWER_ROUTES, ...COLORDLE_DATED_ANSWER_ROUTES])
];

export const SITEMAP_ENTRIES = PRERENDER_ENTRIES.filter(
  (route) => !SITEMAP_EXCLUDED_ROUTES.includes(route)
);

// Split the sitemap into two files:
//  - MAIN_SITEMAP_ENTRIES: everything except dated answer pages (served at /sitemap.xml)
//  - WORDLE_ARCHIVE_SITEMAP_ENTRIES: only /wordle-answer-for-{month}-{day}-{year} pages (served at /wordle-archive-sitemap.xml)
// Dated families (wordle, colordle + the 10 rolling families) are excluded from
// the main sitemap and served by their own per-game dated sitemaps instead.
const DATED_SITEMAP_PREFIXES = [
  '/wordle-answer-for-',
  '/colordle-answer-for-',
  '/semantle-answer-for-',
  '/searchle-answer-for-',
  '/betweenle-answer-for-',
  '/phrazle-answer-for-',
  '/worgle-answer-for-',
  '/worldle-answer-for-',
  '/canuckle-answer-for-',
  '/spotle-answer-for-',
  '/batterup-answer-for-',
  '/marveldle-answer-for-'
];

export const MAIN_SITEMAP_ENTRIES = SITEMAP_ENTRIES.filter(
  (route) => !DATED_SITEMAP_PREFIXES.some((prefix) => route.startsWith(prefix))
);

export const WORDLE_ARCHIVE_SITEMAP_ENTRIES = SITEMAP_ENTRIES.filter(
  (route) => route.startsWith('/wordle-answer-for-')
);

export const COLORDLE_ARCHIVE_SITEMAP_ENTRIES = SITEMAP_ENTRIES.filter(
  (route) => route.startsWith('/colordle-answer-for-')
);
