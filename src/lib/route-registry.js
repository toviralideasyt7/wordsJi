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
];

export const SITEMAP_EXCLUDED_ROUTES = [
  '/canuckle'
];

export const PUBLIC_ROUTE_ENTRIES = [
  ...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES])
];

export const PAGES_FUNCTION_INCLUDE_ROUTES = [...new Set([...API_RUNTIME_ROUTES, '/wordle/*', '/5-letter-wordle-solver'])];

// --- Wordle hints hub (/wordle-hints) ---
// One prerendered page carrying all 12 daily hint sections. It replaced the
// 12 /wordle-hints/* micro pages in the Phase 1 cleanup (2026-11-20); the old
// URLs 301 to the matching section anchors via EXACT_CANONICAL_REDIRECTS.
// The puzzle date is the puzzle-window date (getPuzzleDateForGame('wordle'))
// resolved in the page's server load, never the build date.
export const WORDLE_HINT_ROUTES = [
  '/wordle-hints'
];

export const PRERENDER_ENTRIES = [
  ...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES, ...WORDLE_HINT_ROUTES])
];

export const SITEMAP_ENTRIES = PRERENDER_ENTRIES.filter(
  (route) => !SITEMAP_EXCLUDED_ROUTES.includes(route)
);

// The main sitemap is the full public route set. The legacy dated
// answer families (-answer-for-) were removed in the Phase 1 cleanup
// (2026-11-20), along with their per-game archive/dated sitemaps.
export const MAIN_SITEMAP_ENTRIES = SITEMAP_ENTRIES;
