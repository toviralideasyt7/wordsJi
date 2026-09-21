# WordSolverX — Performance Audit (solver + today pages)

Generated 2026-09-21 07:54 UTC. Covers every solver route and every "today" route in
`src/lib/route-registry.js`, plus the archive pages that share their shell.

> **Read this first.** The site's own code is a small part of the measured cost.
> On the worst page, `/wordle-solver`, main-thread script evaluation was
> **12,987 ms**, and third-party ad/consent/analytics scripts accounted for the
> large majority of it. This document separates what this repository controls
> from what it does not, so effort is not spent in the wrong place.

---

## 1. How to reproduce the measurement

PageSpeed Insights, mobile strategy, against the live site:

```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed\
?url=https%3A%2F%2Fwordsolverx.com%2Fwordle-solver\
&key=$PSI_KEY&strategy=mobile&category=PERFORMANCE"
```

**Never commit `PSI_KEY`.** Pass it through the environment. The key used for
this audit was supplied in chat in a masked (unusable) form, and the API
began rejecting it partway through (`400 API_KEY_INVALID`), so only the pages in
section 2 were measured with the API. The rest of this document is derived from
the built output, which is measured precisely and is stated as such.

**Scores vary enormously between runs** because ad auctions differ. The same URL
scored 63 and then 86 (homepage), and 32 and then 54 (`/wordle-solver`), minutes
apart with no code change. Treat any single score as a sample, never as the
result. Compare medians of three runs, and compare **byte counts and request
counts**, which are stable.

---

## 2. Measured baseline (PageSpeed Insights, mobile)

| URL | Perf (2 runs) | LCP | TBT | CLS | SI | Bytes | Requests |
|---|---|---|---|---|---|---|---|
| `/` | 63 → 86 | 2.9–6.7 s | 240 ms | 0.034 | 4.1–4.5 s | 877–996 KB | 62–79 |
| `/wordle-solver` | 32 → 54 | 3.5–4.8 s | **1,150–5,220 ms** | **0.111** | 11.2–14.1 s | 2.7–3.8 MB | **1,143–1,168** |
| `/wordle-answer-today` | not captured | — | 300 ms flagged | — | — | — | — |

### Where the `/wordle-solver` main thread actually goes

```
Script Evaluation            12,987 ms
Other                         8,048 ms
Garbage Collection            1,474 ms
Style & Layout                1,205 ms
Script Parsing & Compilation  1,085 ms
```

### The longest tasks, by owner

```
738 ms  eus.rubiconproject.com/usync.js            third party (ad)
623 ms  usync.ingage.tech                          third party (ad)
526 ms  Unattributable
432 ms  scripts.journeymv.com/tags/3688/...         third party (ad)
      (also: pagead2.googlesyndication.com, socialcanvas-cdn.kargo.com,
       eu-us-cdn.consentmanager.net, scripts.clarity.ms)
```

```
/wordle-solver        1,168 requests total
  wordsolverx.com        56
  scripts.journeymv.com  26 + keywords/exchange.journeymv.com 28
  static.cloudflareinsights.com 7
```

**Conclusion: the page score is dominated by the ad stack.** Removing that stack
would raise the score and remove most of the revenue. This document therefore
does not propose doing so, and section 5 lists what must not be touched.

---

## 3. Root causes and fixes

Each item states the evidence, the mechanism, the fix, the risk, and the
expected effect. Items marked **DONE** are already in `main`.

### RC1 — Ad, consent and analytics stack (largest, partly out of scope)

* **Evidence.** Long tasks above; 1,100+ requests, of which ~1,110 are not ours.
* **Mechanism.** Journey/Mediavine loads a wrapper, then consent management, then
  header-bidding partners (Rubicon, Kargo, Ingage, DoubleClick), then the ads.
  Each is a separate origin with its own DNS, TLS and main-thread cost.
* **Fix.** Stay with the site's current deferred-loading strategy and let the ad
  partner manage it. Options that are safe: ask Mediavine to enable lazy-loaded
  or event-driven ad slots; keep the existing deferred Clarity/GA loading.
* **Do not**: remove the ad tag, block a partner, or add a CSP — the repository
  documents that a `_headers` CSP change once removed 100% of ad revenue.
* **Expected effect.** Little unless the partner changes configuration.

### RC2 — Deployed fixes were invisible for hours (DONE)

* **Evidence.** `/wordle-solver` served `cf-cache-status: HIT`, `Age: 12667`,
  while a cache-busted fetch of the same URL returned the **new** markup
  (`solver-frame` and the attribution line present). The origin was correct the
  whole time.
* **Mechanism.** `hooks.server.ts` stores rendered HTML in Cloudflare's Cache API
  under a path-keyed entry. `html:static:/wordle-solver` carried a 7-day
  `s-maxage`, so the entry outlived the deployment that changed the page. Every
  push looked like it had not worked.
* **Fix.** Cache keys are now namespaced by the SvelteKit build version, so a new
  deployment produces new keys and can never read the previous deployment's HTML.
* **Risk.** None material: old entries simply stop being read.
* **Expected effect.** Deploys become visible immediately. This is why several
  earlier "it did not work" reports were wrong — including the width complaint.

### RC3 — 8–12 KB of uncacheable inline CSS in every document (DONE)

* **Evidence.** Measured per document: 8,227–12,016 bytes of `<style>` before,
  1,799 after.
* **Mechanism.** `inlineStyleThreshold: 4096` inlined the page stylesheet into
  the HTML. Inline CSS is re-sent on **every navigation** and can never be cached,
  so the cost repeated per page view on a repeat visit.
* **Fix.** `inlineStyleThreshold: 0`; the app-shell rules moved from `app.html`
  into the cached `theme.css`, leaving only genuinely paint-critical rules inline.
* **Risk.** One extra request on a cold cache; the CSS is then cached for a year.
* **Expected effect.** −6.4 to −10.2 KB per document, on every navigation.

### RC4 — ~0.9 MB of solver assets downloaded speculatively (DONE)

* **Evidence.** `solver_len5_bg.wasm` 569,559 B + `word-data-len5.json` 341,211 B
  (for a 9-letter solve the pair is 749,847 + 521,515 B).
* **Mechanism.** `WordlebotWasmClient` started the engine on idle ~2.5 s after
  load and preloaded the assets on idle, for **every** visitor, including the
  majority who never touch the solver.
* **Fix.** Assets load only on real intent — `pointerenter`, `focusin`, or the
  first key press — and the app mounts on `pointerdown`, so the click lands on an
  in-flight download. A related double-fetch bug was fixed at the same time: the
  dataset cache stored the resolved value rather than the promise.
* **Risk.** A cold mobile tap now starts the fetch instead of finding it cached.
  This is a deliberate trade: better for everyone who does not use the tool,
  neutral-to-slightly-worse for the first tap on a cold phone.
* **Expected effect.** ~0.9 MB (and two requests) removed from the initial load of
  every solver page for non-users.

### RC5 — CLS 0.111 on solver pages (DONE)

* **Evidence.** PSI reports CLS 0.111 on `/wordle-solver`; the placeholder was a
  full-width board while the mounted app is a narrow column, so mounting moved
  everything below it.
* **Fix.** The placeholder and the mounted engine now share one grid cell inside a
  region whose `min-height` is reserved up front (per game, plus extra per
  additional board), and the placeholder is sized like the app.
* **Caveat.** The reserved heights (`SOLVER_FRAME_FLOOR_PX = 1050`, etc.) are
  documented in the source as measured in headless Chromium, but no browser
  backend was available during this work, so **those constants are unverified**.
  If they are too small, CLS returns; too large, the page carries extra
  whitespace. Verify with a real run before trusting them.
* **Expected effect.** CLS toward 0 on the solver routes.

### RC6 — Unused JavaScript, ~500–720 KB reported

* **Evidence.** PSI `unused-javascript`: 503,907 B on `/`, 716,993 B on
  `/wordle-solver`, 646,525 B on `/wordle-answer-today`.
* **Mechanism.** Partly ours (SvelteKit chunks reachable from the route graph but
  unused before interaction — the solver engine is the biggest single item), partly
  third-party (ad and consent bundles).
* **Fix.** Already reduced: the engine no longer loads before intent (RC4), and two
  modulepreload leaks were closed earlier (the 39 KB answer-content module and
  `date-fns` were being pulled into all 45 solver pages; preloaded JS on
  `/wordle-solver` fell from 978,232 to 864,923 B).
* **Open.** The main `app.js` and route chunk graph have not been analysed
  per-module. That is the next real reduction available inside our control.

### RC7 — Request count (1,143–1,168 on solver pages)

* **Evidence.** ~1,110 of those requests are third-party.
* **Mechanism.** Header bidding fans out to many partner origins.
* **Fix.** Not ours to fix directly; see RC1.

### RC8 — Remaining page classes not yet reviewed

* **Game-dle answer pages** (`*-answer-today-updated`, 6 routes) and the
  **game-dle solver shells** (narutodle, pokedle, smashdle, loldle, dotadle,
  onepiecedle, nerdle, searchle, waffle, colordle, colorfle, countryle, worldle):
  these use `GameDleAnswerPage` / `GameDleSolverPage` rather than the
  StaticArticle shell, so they did **not** receive the answer-page improvements
  (larger type scale, figures, key takeaways, attribution line). Their copy and
  their look are the outstanding work, and their performance profile is unmeasured.
* **Archive pages**: `wordle-answer-archive` measured ~8,994 words in one sample —
  the largest documents on the site. Worth measuring separately.

---

## 4. Page inventory

### 4.1 Today routes (26)

| Route | Page class | PSI measured |
|---|---|---|
| `/betweenle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/canuckle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/colordle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/colorfle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/contexto-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/countryle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/dotadle-answer-today-updated` | Game-dle answer (-updated) | not measured |
| `/framed-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/globle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/loldle-answer-today-updated` | Game-dle answer (-updated) | not measured |
| `/narutodle-answer-today-updated` | Game-dle answer (-updated) | not measured |
| `/nerdle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/onepiecedle-answer-today-updated` | Game-dle answer (-updated) | not measured |
| `/phoodle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/phrazle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/pokedle-answer-today-updated` | Game-dle answer (-updated) | not measured |
| `/quordle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/searchle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/semantle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/smashdle-answer-today-updated` | Game-dle answer (-updated) | not measured |
| `/spotle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/today` | Hub (static) | not measured |
| `/waffle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/wordle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/worgle-answer-today` | Answer page (StaticArticle shell) | not measured |
| `/worldle-answer-today` | Answer page (StaticArticle shell) | not measured |
`/today` is the hub; the rest render the daily answer article.

### 4.2 Solver routes (45)

| Route | Page class | PSI measured |
|---|---|---|
| `/10-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/11-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/3-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/4-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/6-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/7-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/8-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/9-letter-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/betweenle-solver` | Game-dle solver shell | not measured |
| `/boggle-solver` | Game-dle solver shell | not measured |
| `/canuckle-solver` | Wordlebot (Canuckle family) | not measured |
| `/colordle-solver` | Game-dle solver shell | not measured |
| `/colorfle-solver` | Game-dle solver shell | not measured |
| `/countryle-solver` | Game-dle solver shell | not measured |
| `/dordle-solver` | Wordlebot variant (WASM engine) | not measured |
| `/dotadle-solver` | Game-dle solver shell (character games) | not measured |
| `/fibble-solver` | Wordlebot variant (WASM engine) | not measured |
| `/hangman-solver` | Game-dle solver shell | not measured |
| `/hardle-solver` | Wordlebot variant (WASM engine) | not measured |
| `/kanoodle-solver` | Game-dle solver shell | not measured |
| `/light-out-solver` | Game-dle solver shell | not measured |
| `/loldle-solver` | Game-dle solver shell (character games) | not measured |
| `/minesweeper-solver` | Game-dle solver shell | not measured |
| `/narutodle-solver` | Game-dle solver shell (character games) | not measured |
| `/nerdle-solver` | Game-dle solver shell | not measured |
| `/octordle-solver` | Wordlebot variant (WASM engine) | not measured |
| `/onepiecedle-solver` | Game-dle solver shell (character games) | not measured |
| `/phoodle-solver` | Game-dle solver shell | not measured |
| `/pokedle-solver` | Game-dle solver shell (character games) | not measured |
| `/quordle-solver` | Game-dle solver shell | not measured |
| `/searchle-solver` | Game-dle solver shell | not measured |
| `/smashdle-solver` | Game-dle solver shell (character games) | not measured |
| `/soundmap-solver` | Game-dle solver shell | not measured |
| `/spotle-solver` | Game-dle solver shell | not measured |
| `/spotle-wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/squaredle-solver` | Game-dle solver shell | not measured |
| `/w-peaks-solver` | Wordlebot variant (WASM engine) | not measured |
| `/waffle-solver` | Game-dle solver shell | not measured |
| `/warmle-solver` | Wordlebot variant (WASM engine) | not measured |
| `/weaver-solver` | Game-dle solver shell | not measured |
| `/woodle-solver` | Wordlebot variant (WASM engine) | not measured |
| `/word-ladder-solver` | Game-dle solver shell | not measured |
| `/wordle-solver` | Wordlebot (WASM engine) | not measured |
| `/worldle-solver` | Game-dle solver shell | not measured |
| `/xordle-solver` | Wordlebot variant (WASM engine) | not measured |

Two dynamic families expand from these: `/[wordLength]-letter-wordle-solver`
(3–11 letters) and `/[variant]-solver`, both also Wordlebot (WASM engine).

### 4.3 Archive routes (18)

| Route | Page class | PSI measured |
|---|---|---|
| `/canuckle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/colordle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/colorfle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/contexto-archive` | Archive (calendar + StaticArticle) | not measured |
| `/countryle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/framed-archive` | Archive (calendar + StaticArticle) | not measured |
| `/globle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/nerdle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/phoodle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/phrazle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/quordle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/searchle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/semantle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/spotle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/waffle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/wordle-answer-archive` | Archive (calendar + StaticArticle) | not measured |
| `/worgle-archive` | Archive (calendar + StaticArticle) | not measured |
| `/worldle-archive` | Archive (calendar + StaticArticle) | not measured |

### 4.4 Other static routes (14)

`/`, `/about`, `/archive`, `/canuckle`, `/canuckle-answer-today`, `/canuckle-archive`, `/contact`, `/disclaimer`, `/dmca-policy`, `/editorial-policy`, `/guides`, `/privacy-policy`, `/solver`, `/terms-of-service`

---

## 5. What must not be changed (would cause harm)

| Surface | Why |
|---|---|
| `static/_headers` | A CSP here once blocked 100% of ad revenue. Read `docs/MEDIAVINE-ADS.md` before touching it. |
| The Mediavine tag in `src/app.html` | Site-specific seller UUID; losing it loses ad serving. |
| `<main id="main-content" class="wordsolverx-content site-main flex-grow">` | This class list is the ad content selector. Adding a `max-width` here once clamped the whole site to 800 px. |
| `static/robots.txt`, sitemap generation | Indexing depends on them; `docs/SEO-INDEXING.md` covers the history. |
| `inlineStyleThreshold: 0` | Reverting it puts 8–12 KB back into every document. |
| The ad stack itself | It is the revenue. Optimise around it, not through it. |

---

## 6. Next actions, ordered by value per unit of risk

1. **Verify RC5's reserved heights in a real browser** (zero risk, removes an
   unverified assumption). Load a solver page on a slow connection and watch CLS.
2. **Measure the unmeasured classes** — the 6 game-dle answer pages, the
   game-dle solver shells, and the archive pages. One PSI call each, three runs,
   record the median.
3. **Audit the route chunk graph for unused JS** (RC6). This is the largest
   remaining item inside our control.
4. **Game-dle copy and look pass** (RC8) — align those pages with the answer-page
   standard already applied to the Wordlebot family.
5. **Re-measure after each change** using byte counts and request counts, not
   scores.

---

---

## 6b. Speed work that costs nothing visually and has no downside

Everything in this section either ships no visual change at all, or changes only
markup that is never seen. Items marked **SHIPPED** are already in `main` with the
measured effect recorded. The rest are ranked by value per unit of risk.

### Already shipped

| Change | Measured effect | Visual impact |
|---|---|---|
| Externalise page CSS (`inlineStyleThreshold: 0`) | 8,227–12,016 B of inline `<style>` per document → **1,799 B**; CSS is now cached across navigations | None |
| Move the app-shell rules out of `app.html` into cached `theme.css` | Contributes to the above; only paint-critical rules stay inline | None |
| Namespace edge-cache keys by build version | Deploys take effect immediately instead of up to 7 days later | None |
| Load solver WASM + dictionary on intent only | ~**0.9 MB** and 2 requests removed from the initial load of every solver page for visitors who never open the tool | Placeholder is unchanged; the engine appears on the same click |
| Cache the in-flight dataset promise, not the resolved value | Removes a duplicate fetch of the same 341 KB file | None |
| Close the two modulepreload leaks (answer content + `date-fns` in solver routes) | Preloaded JS on `/wordle-solver` **978,232 → 864,923 B** (−11.6%) | None |
| Server-side loaders for the three solver route families | Removes ~128 KB of `route-config` from each solver page's client graph | None |
| Reserve the solver frame height, share one grid cell | Fixes the 0.111 CLS on solver pages | Placeholder and app occupy one box; no visible shift |
| Replace emoji mode icons and flags with text | Removes 10–15 glyphs per page from the render path | Deliberate, already reviewed |

### Available next — still no visual change

| # | Improvement | Why it helps | Risk / caveat |
|---|---|---|---|
| 1 | **Check `word-data.json` (3.02 MB) is unreachable from any route graph** | The runtime uses the per-length files (87–510 KB), so the 3 MB bundle copy is pure dead weight if any chunk still imports it | None if it is genuinely unreferenced; a build-graph check decides it, not a guess |
| 2 | **Add `width`/`height` (or `aspect-ratio`) to the 1–2 images per answer page** | Removes the last layout-shift source on those pages | None; the images already have known dimensions in the markup |
| 3 | **Add `preconnect` for at most 2–3 of the third-party origins already in the critical path** (consent manager, ad wrapper) | Saves a DNS + TLS round trip before the ad stack can start | Too many preconnects is counterproductive — cap it, and only for origins that always load |
| 4 | **Self-host the Plus Jakarta Sans subset** | Removes a third-party round trip and a render-blocking-capable stylesheet from the critical path | Moderate: needs a subsetted woff2 committed and the `app.html` blocks repointed; must be done carefully or the font flashes |
| 5 | **Paginate or lazily render the archive calendars** | Archive pages are the heaviest documents on the site (one sample measured ~8,994 words of rendered text) | Low: needs `content-visibility` or a paged view; must keep the links crawlable for SEO |
| 6 | **Audit the route chunk graph for unused JavaScript** | PSI reports 503–717 KB of unused JS; the largest single item is the solver engine, which is already deferred | Low but real work: it needs per-chunk analysis, and over-splitting adds requests |
| 7 | **Inline the small Above-the-fold CSS for answer pages only** | Recovers a few ms of first paint without reintroducing per-navigation cost, if limited to genuinely critical rules | Low; must stay well under 2 KB or it re-creates the old problem |
| 8 | **Serve the per-length JSON with `immutable` cache headers** | They are content-addressed in practice and never change within a build | None — `_headers` already covers `/generated/per-length/*`; verify the wordlebot path too |

### Do not do these

| Anti-improvement | Why not |
|---|---|
| Remove, defer further, or block any part of the ad/consent stack | It is the revenue. On `/wordle-solver` it is ~11 of the 13 seconds of main-thread work, but that is the business, not a bug. |
| Add or tighten a CSP in `_headers` | Documented in `docs/MEDIAVINE-ADS.md`: a CSP here once removed 100% of ad revenue. |
| Re-inline the whole stylesheet | That is the 8–12 KB per document this work removed. |
| Preload every chunk | Modulepreload is already large (865 KB on solver pages); adding more trades TTFB for bandwidth. |
| Chase a single PageSpeed score | The same URL scored 32 and 54 within minutes on unchanged code. Compare bytes and request counts instead. |

### How to verify any of this

Use byte counts and request counts, not scores. The two commands that matter:

```bash
# 1. document + asset weight for a URL (stable, reproducible)
python .openclaw/tmp/perf_final.py      # or the equivalent measuring <link href> totals

# 2. one PageSpeed run per change, three times, take the median
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<url>&key=$PSI_KEY&strategy=mobile"
```

A change is real when the document bytes or the request count moves and the three-run
median score does not regress. Anything else is noise.

## 7. Honest limitations of this audit

* The PSI key was rejected partway through, so only `/`, `/wordle-solver` and
  `/wordle-answer-today` were measured with the API. Everything else here is
  derived from the built output or from code inspection, and is labelled as such.
* No browser backend was available, so **no layout, LCP or CLS figure in this
  document was observed visually**. They are reported from PSI or from source
  comments, and the two are distinguished.
* Scores fluctuate ±30 points between runs on unchanged code. Any single number
  quoted here is a sample.
* The `SOLVER_FRAME_*` constants are documented as measured in headless Chromium
  but could not be re-verified here.
