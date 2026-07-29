export const TODAY_STATIC_ROUTES = [
  '/today',
  '/betweenle-answer-today',
  '/canuckle-answer-today',
  '/colorfle-answer-today',
  '/colordle-answer-today',
  '/contexto-answer-today',
  '/countryle-answer-today',
  '/dotadle-answer-today',
  '/framed-answer-today',
  '/globle-answer-today',
  '/loldle-answer-today',
  '/narutodle-answer-today',
  '/nerdle-answer-today',
  '/onepiecedle-answer-today',
  '/phoodle-answer-today',
  '/phrazle-answer-today',
  '/pokedle-answer-today',
  '/quordle-answer-today',
  '/searchle-answer-today',
  '/semantle-answer-today',
  '/smashdle-answer-today',
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
  '/betweenle-solver',
  '/boggle-solver',
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
  '/minesweeper-solver',
  '/narutodle-solver',
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
  '/waffle-solver',
  '/weaver-solver',
  '/word-ladder-solver',
  '/wordle-analyzer',
  '/wordle-solver',
  '/worldle-solver',
  '/3-letter-wordle-solver',
  '/4-letter-wordle-solver',
  '/5-letter-wordle-solver',
  '/6-letter-wordle-solver',
  '/7-letter-wordle-solver',
  '/8-letter-wordle-solver',
  '/9-letter-wordle-solver',
  '/10-letter-wordle-solver',
  '/11-letter-wordle-solver'
];

export const ARCHIVE_STATIC_ROUTES = [
  '/canuckle-archive',
  '/colorfle-archive',
  '/colordle-archive',
  '/contexto-archive',
  '/countryle-archive',
  '/framed-archive',
  '/globle-archive',
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
  '/sitemap.xml'
];

export const SITEMAP_EXCLUDED_ROUTES = [
  '/canuckle',
  '/wordle-solver'
];

export const PUBLIC_ROUTE_ENTRIES = [
  ...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES])
];

export const PAGES_FUNCTION_INCLUDE_ROUTES = [...new Set([...API_RUNTIME_ROUTES])];

export const PRERENDER_ENTRIES = [
  ...new Set([...EVERGREEN_STATIC_ROUTES, ...TODAY_STATIC_ROUTES, ...ARCHIVE_STATIC_ROUTES])
];

export const SITEMAP_ENTRIES = PRERENDER_ENTRIES.filter(
  (route) => !SITEMAP_EXCLUDED_ROUTES.includes(route)
);
