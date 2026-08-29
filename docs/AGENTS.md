# AGENTS.md — read this first

Machine-oriented map of this repo. Written so an agent can orient in one file
instead of crawling 770. Keep it short; if it grows past ~150 lines, split it.

## What this is

`wordsolverx.com` — a SvelteKit 2 site of puzzle solvers and daily answer pages,
deployed to Cloudflare. Monetized by Journey/Mediavine display ads.

## Stack

| | |
|---|---|
| Framework | SvelteKit 2, **Svelte 5 runes** (`$props`, `$derived`, `$effect`) — not legacy `export let` |
| Styling | Tailwind 4 via `@tailwindcss/postcss`; two entry sheets, `src/content.css` and `src/interactive.css` |
| Deploy | Cloudflare Workers via `@sveltejs/adapter-cloudflare`; CI in `.github/workflows/publish-pages.yml` on push to `main` |
| Tests | Vitest + `@testing-library/svelte`, jsdom |
| Node | 22 |

## Layout

```
src/
  app.html              <head>, GA loader, Mediavine ad tag (line ~243)
  routes/
    (content)/          prose/answer pages   -> +layout.svelte wraps in #main-content
    (interactive)/      solver tools         -> +layout.svelte wraps in #main-content
  lib/
    components/         shared Svelte components
    content/registry.ts static article content
    route-registry.js   PRERENDER_ENTRIES + Pages function includes
    data/, wordle/      word lists, puzzle datasets
scripts/                build + daily-data + SEO automation (referenced by package.json)
static/                 ads.txt, robots.txt, word JSON, wasm
_headers, _redirects    Cloudflare edge config, copied into build
docs/                   long-form context docs (this file, MEDIAVINE-ADS.md, SEO-INDEXING.md)
archive/                gitignored: superseded one-off scripts and dated reports
```

Both route groups emit `<main id="main-content">`. That id is load-bearing —
Mediavine's ad targeting selector points at it. Don't rename it.

## Commands

```
npm run dev            vite dev
npm run build          production build (scripts/build-cloudflare.mjs)
npm run check          svelte-check
npm test               vitest --run
npm run deploy         data update + articles + build + wrangler deploy
```

`node_modules` is absent in fresh checkouts — run `npm install` first.

## Conventions

- Tabs in `.mjs`/`.js`/`.ts`; the Svelte files use spaces. Match the file you're in.
- Svelte 5 runes only. No `export let`, no `$:`.
- Data files live in `static/` or `src/lib/*/data/` as JSON; don't inline large arrays.
- Prerendered routes are enumerated in `src/lib/route-registry.js`, not crawled.

## Don't touch without reading the doc first

| Thing | Why | Doc |
|---|---|---|
| `_headers` CSP | A CSP here previously blocked all ad revenue | `docs/MEDIAVINE-ADS.md` |
| `#main-content` in either layout | Mediavine ad selector target | `docs/MEDIAVINE-ADS.md` |
| Ad tag in `src/app.html` | Site-specific UUID | `docs/MEDIAVINE-ADS.md` |
| `static/robots.txt`, sitemap generation | Indexing is currently broken on Google | `docs/SEO-INDEXING.md` |

## Credentials

Never commit keys. Scripts that need them read from env:

- `GSC_KEY_FILE` — path to the Google service-account JSON
- `BING_KEY` — Bing Webmaster API key
- `MONID_KEY` — monid.ai gateway key (TinyFish search/fetch)

`.gitignore` blocks `*service-account*.json`, `*credentials*.json`, `gsc-key*.json`.

## Working efficiently in this repo

Reading whole directories here is expensive — `static/` and `src/lib/wordle/data/`
hold multi-megabyte word lists that carry no signal.

- Skip: `static/*.json`, `static/data/`, `src/lib/wordle/data/`, `src/lib/wordlebot-wasm/assets/`, `package-lock.json`, `archive/`
- Grep before reading. Use targeted search over broad file reads.
- For a task touching one route, read that route + its `+layout.svelte` and stop.
