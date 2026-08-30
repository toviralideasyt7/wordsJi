# AGENTS.md

Puzzle-solver and daily-answer site. SvelteKit 2 + Svelte 5 runes, Tailwind 4,
deployed to Cloudflare Workers. Monetized with Journey/Mediavine display ads.

## Commands

```
npm install            # node_modules is absent in fresh checkouts
npm run dev
npm run check          # svelte-check
npm test               # vitest --run
npm run build
```

## Rules

- Svelte 5 runes only: `$props`, `$derived`, `$state`, `$effect`. Never `export let` or `$:`.
- Tabs in `.mjs`/`.js`/`.ts`. Spaces in `.svelte`. Match the file you're editing.
- Two route groups: `src/routes/(content)/` (prose, answers) and
  `src/routes/(interactive)/` (solvers). Each has its own `+layout.svelte`.
- Prerendered routes are listed in `src/lib/route-registry.js`, not crawled.
- Secrets come from env: `GSC_KEY_FILE`, `BING_KEY`, `MONID_KEY`. Never hardcode.
- **Never write invented first-person experience into page copy.** No streaks, no
  named friends or family, no dated personal history, no routines. Article copy in
  `src/lib/content/registry.ts` explains mechanics and solver behaviour in
  instructional voice. Claims must be checkable against the implementation or the
  game's rules. This was cleaned up on 2026-08-30 after two prior passes made it
  worse — see [docs/SEO-INDEXING.md](docs/SEO-INDEXING.md) Part 4.

## Do not change without reading the linked doc

| Thing | Doc |
|---|---|
| `_headers` CSP — a CSP here once blocked 100% of ad revenue | [docs/MEDIAVINE-ADS.md](docs/MEDIAVINE-ADS.md) |
| `<main id="main-content">` in either `+layout.svelte` — Mediavine's ad selector target | [docs/MEDIAVINE-ADS.md](docs/MEDIAVINE-ADS.md) |
| Ad tag in `src/app.html` — site-specific UUID | [docs/MEDIAVINE-ADS.md](docs/MEDIAVINE-ADS.md) |
| `static/robots.txt`, sitemap generation — Google indexing is currently broken | [docs/SEO-INDEXING.md](docs/SEO-INDEXING.md) |

## Never read these (large, zero signal)

`static/*.json` · `static/data/` · `static/squaredle/` · `src/lib/wordle/data/` ·
`src/lib/wordlebot-wasm/assets/` · `src/lib/searchle/` · `src/lib/data/semantle-words.ts` ·
`package-lock.json` · `archive/`

They are multi-megabyte word lists and puzzle datasets. Grep them if you must;
never open them. A single one can exceed a whole context window.

## Finding things

`docs/MAP.md` lists every route and where its code lives. Read that instead of
listing directories.
