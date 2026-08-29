# WordSolverX

SvelteKit site of puzzle solvers and daily answer pages for word games.
Deployed to Cloudflare. Monetized with Journey/Mediavine display ads.

**Agents: read [`docs/AGENTS.md`](docs/AGENTS.md) first.** It is the short map of
stack, layout, conventions, and the files you must not change blindly.

## Docs

| Doc | Contents |
|---|---|
| [`docs/AGENTS.md`](docs/AGENTS.md) | Repo map, stack, conventions, what to skip when reading |
| [`docs/MEDIAVINE-ADS.md`](docs/MEDIAVINE-ADS.md) | Ad stack: why a CSP once killed all revenue, ad selector config, diagnostics |
| [`docs/SEO-INDEXING.md`](docs/SEO-INDEXING.md) | Google indexing failure root cause, Bing growth plan, GSC/Bing API recipes |

## Develop

```bash
npm install
npm run dev            # vite dev
npm run check          # svelte-check
npm test               # vitest --run
npm run build          # production build
```

## Deploy

Push to `main` â€” `.github/workflows/publish-pages.yml` builds and deploys to
Cloudflare automatically.

Manual:

```bash
npm run build
wrangler deploy --config wrangler.jsonc
```

## Structure

```
src/routes/(content)/       prose + daily answer pages
src/routes/(interactive)/   solver tools
src/lib/                    components, data, route registry
scripts/                    build, daily data updates, SEO automation
static/                     robots.txt, ads.txt, word lists, wasm
_headers, _redirects        Cloudflare edge config
docs/                       long-form context (start here)
archive/                    gitignored: superseded scripts and dated reports
```

Both route groups render `<main id="main-content">`. That id is the Mediavine ad
targeting selector â€” renaming it breaks in-content ads. See `docs/MEDIAVINE-ADS.md`.

## License

MIT
