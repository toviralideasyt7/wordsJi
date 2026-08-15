# WordSolverX — Google Indexing Root-Cause & Fix Plan (GSC API verified)

Date: 2026-08-15
Data: live Search Console API (service account), live HTTP checks, repo review
Symptom: Google indexes/ranks **only the homepage**; inner pages absent. Bing indexes many pages (~500 clicks/day).

---

## 1. Root cause (now proven with GSC API data)

**It is not technical, and it is not a manual action. It is Google's quality/trust classifier refusing to crawl or index the inner pages on a 7-month-old domain running a mass-generated content model.**

URL Inspection results (2026-08-15) for `https://wordsolverx.com/`:

| URL | Google status |
|---|---|
| `/` | ✅ **Submitted and indexed** (last crawl 2026-08-13) |
| `/wordle-answer-today` | Crawled – currently not indexed (crawl 2026-08-04) |
| `/colordle-answer-today` | Crawled – currently not indexed (crawl 2026-07-28) |
| `/5-letter-wordle-solver` | Crawled – currently not indexed (crawl 2026-07-28) |
| `/today` | Crawled – currently not indexed (crawl 2026-05-24) |
| `/wordle-answer-archive` | Crawled – currently not indexed (crawl 2026-05-08) |
| `/spotle-answer-today`, `/quordle-answer-today`, `/canuckle-answer-today`, `/quordle-solver`, `/wordle-analyzer`, `/archive`, `/guides`, `/solver`, `/about`, `/contact`, `/loldle-answer-today` | **URL is unknown to Google** (never crawled) |

Reading:
- A handful of pages **were crawled and deliberately rejected** → the helpful-content / scaled-content quality filter, NOT a bug and NOT a manual action (verdict is NEUTRAL, robots ALLOWED).
- Most pages were **never crawled at all** even though they're all in the sitemap → Google is deprioritizing crawling (trust deficit for a new domain with mass content).
- Sitemap submitted 2026-08-15, **0 errors / 0 warnings** — sitemap itself is fine.

## 2. The "sudden deindex" explained

Search analytics (147 days, only 11 URLs ever had impressions):

- 2026-03: 60 impressions → **2026-04: 3 impressions (site invisible)** → 2026-05: 1,683 → 2026-06: 1,102 → 2026-07: 1,116 → 2026-08 (half month): 202.
- The only pages that ever had Google impressions: **homepage (4,163)** + a few **legacy dated URLs** (`/wordle/2021-08-18`, `/wordle/2024-09-17`, `/wordle/2022-03-12`, `/colordle-answer-for-october-10-2025`, `/colordle-answer-for-july-29-2025`) + tiny hub impressions.
- Those legacy dated URLs are now **301-redirected to the churny fixed URLs** (`/wordle-answer-today`, etc. — see `_redirects`, `src/lib/legacy-redirects.ts`).

So what felt like "we were indexed and then deindexed" is:
1. The site **used to have dated URLs** (`/wordle/YYYY-MM-DD`, `/-answer-for-Month-DD-YYYY`) that Google had indexed.
2. The site was restructured to **fixed churny URLs** that change content every day.
3. The old dated URLs now 301 → the churny URLs. Google dropped the dated pages and **refuses to index the churny replacements** ("Crawled – currently not indexed" / "unknown to Google").
4. The April zero-month and the current August decline are the same quality filter at work on a low-trust domain.

**Bing** does not apply this filter as strictly → that's the entire reason Bing ranks dozens of pages and drives the ~500 clicks/day.

## 3. Full issue list

### Critical (why Google won't index inner pages)
1. **Mass-generated daily answer content** (24 games × AI articles/day) — matches Google's scaled-content-abuse / helpful-content pattern.
2. **45 solver/tool pages** with template text — thin unique value at this trust level.
3. **Churny fixed URLs** — same URL, new answer+article every day; legacy dated URLs 301 into them.
4. **7-month-old domain, ~zero real backlinks** (only self-promotion: own Facebook/YouTube/dev.to/Reddit).
5. **Scrapers outrank the originals** (tci.org, mat-travel.com, elinielsen.com, kerusso.com, guep.com.br PDFs/blogs copy the daily text).

### Minor technical (real, but not the cause)
6. 2 404 patterns remain: `/wordle-answer-today/2026-02-09`, `/wordle-answer-today-august-15-2026`.
7. ~10 title tags > 60 chars (canuckle 97, colordle 94, worldle-solver 78, …).
8. 6 thin utility pages in the sitemap (`/contact`, `/disclaimer`, `/privacy-policy`, `/terms-of-service`, `/editorial-policy`, `/dmca-policy`).
9. Daily sitemap `lastmod` churn on answer pages (changes every day).

### Already OK (do not waste time)
- robots.txt ✅ · sitemap 0 errors ✅ · canonicals ✅ · 1 H1 per page ✅ · no noindex ✅ · all 101 URLs HTTP 200 ✅ · www→non-www 301 ✅ · legacy dated URLs 301 ✅ · page weight fine ✅

## 4. Fix plan (phased)

### Phase 1 — This week (code changes, I can do these)
1. **Stop URL churn: move daily answers to stable dated URLs** (`/wordle-answer-today/2026-08-16`), keep `/wordle-answer-today` as "latest" (redirect or serve today's dated page). Google rewards stable, crawlable history. This is the highest-impact structural change.
2. Remove the 6 utility pages from the sitemap (keep indexable via footer links) to focus crawl budget.
3. Fix the 2 remaining 404 patterns with static redirects.
4. Trim the 10 over-long title tags.
5. Keep sitemap `lastmod` but stop letting answer pages touch it daily (or keep — minor).

### Phase 2 — Content model (the actual fix; 1–3 months)
**You want to keep automation — that's fine, but the pipeline must change:**

1. **Consolidate what Google sees.** Keep tools for all games (they don't need to be indexed), but stop mass-publishing indexable daily articles for 24 games. Invest in **5–8 flagship pages** (Wordle, Quordle, Nerdle + your best tools) and let the long tail exist without chasing rankings.
2. **Human-written shell + AI daily fill + human approval:**
   - Write the evergreen parts by hand **once per game** (strategy, hint methodology, how-to, FAQ) — that's what `.opencode/human-wiriting/SKILL.md` is for.
   - AI generates only the **daily-specific section** (answer + verification + short notes) — and **every article must pass a human QA pass before publishing** (you, or a reviewer, spot-check daily; a publish gate that blocks unapproved articles).
   - **Verify answers programmatically against the official source** (Wordle already fetches NYT API — do the same for every game; never publish unverified answers).
3. **Add unique data no one else has** — the solver engine's letter-frequency analysis, solution paths, comparison tables, interactive widgets. Unique data is what separates indexable pages from duplicates.
4. **Finish E-E-A-T** (already ~half done per `plan-new.md`): author page + bio, bylines with dates, "fact-checked" line, editorial/corrections policy, About with real identity.
5. **Stop promoting with low-value self-posting** (owner Reddit/dev.to posts are visible and discounted). One good digital-PR piece or a genuinely unique tool beats 20 self-promo posts.

### Phase 3 — Authority (months; nothing here is optional for Google)
1. Real backlinks: guest posts, HARO/digital PR, puzzle-community placements of genuinely unique tools.
2. **DMCA the scrapers** (tci.org, mat-travel.com, elinielsen.com, kerusso.com, guep.com.br) so originals, not copies, get indexed.
3. Let the domain age and keep publishing consistently. A 7-month-old domain with this history realistically needs **6–12 months of consistent quality** before Google trusts inner pages.

### Phase 4 — Monitor (ongoing)
1. GSC Indexing report weekly: watch "Crawled – currently not indexed" shrink.
2. After each Phase-1 fix, use **URL Inspection → Request Indexing** in GSC for the ~10 key pages (the API here is read-only; request is manual in the UI).
3. Re-run this audit script monthly (`GSC_CREDENTIALS_PATH=... node scripts/gsc-audit.mjs`) — it now writes to `.freebuff/gsc-audit/` and prints coverage + trends.

## 5. Straight talk on "latest Google tricks"

There are no tricks left. The March 2024 spam update ("scaled content abuse"), the March 2025 core update, and Helpful Content are specifically built to detect mass-generated content and low-trust patterns — exactly what the data shows here. The reliable path is the boring one: **stable URLs, verified data, human editorial control, unique value, authority, time.** That's what will get inner pages indexed. Bing will keep paying the bills meanwhile.

## 6. Security note

The service-account JSON (private key) was pasted into chat and saved at `C:\Users\akasa\Downloads\wordsolverx-svelte-31eaccc3daae.json`. It has not been committed to the repo (the audit script reads it from `GSC_CREDENTIALS_PATH` only). **Recommend rotating the key in Google Cloud IAM** since it was shared in plaintext, and keep the file out of the repo (`Downloads` is fine; add it to `.gitignore` if ever copied in).

---

## 7. Update — 2026-08-15 (static article rollout + keyword research)

### 7.1 Bing API key: invalid
The provided Bing key (`10d2656a9b2b4aa1a55544f9664f4a07`) is **rejected by every Bing endpoint**: `InvalidApiKey` on the Webmaster JSON API (`/webmaster/api.svc/json/GetUserSites`), 401 on Search API v7, 404 on legacy hosts. The key is either expired, mistyped, or for a different Bing service (note: Bing Search API v7 was retired Aug 11, 2025). **Action: generate a fresh key** in Bing Webmaster Tools → Settings → API Access, and I can re-run the impression/click pull against `GetKeywordStats`.

### 7.2 Keyword research (fallback: Google Search Console, 90-day, real data)
`scripts/gsc-keywords.mjs` (auth: service account) pulled 622 queries / 3,421 impressions / **3 clicks** for wordsolverx.com:

**Where Google already shows you (impressions but zero clicks — pages buried at positions 30–90):**
- `wordle solver` — 441 imp @ pos 84
- `wordfinderx` — 192 imp @ pos 32
- `wordsolver` — 164 imp @ pos 65
- `word solver` — 97 imp @ pos 78
- `wordle solver online` — 72 imp @ pos 88
- `worlde solver` (typo) — 58 imp @ pos 80
- `wordle answer finder` — 51 imp @ pos 80 · `wordle finder` — 50 imp
- `betweenle solver` — 42 imp @ **pos 46** (closest to page 1–2 of any keyword)
- `squaredle solver` — 37 imp · `squardle solver` (typo) — 18 imp
- `quordle solver` — 17 imp @ pos 62 · `wordle solver today` — 21 imp

**Interpretation:** Google already associates the domain with solver intent — the *homepage* gets surfaced, but nothing ranks high enough to click. These solver-tool keywords are the highest-value targets for the new static articles: each solver page's article should own its `[game] solver` / `[game] solver online` / `[game] helper` phrase set, on both Google and Bing.

### 7.3 Static article system (built)
- `src/lib/components/StaticArticle.svelte` — prerendered, semantic `<article>` renderer: snippet-bait intro, varied H2 sections, styled callouts/lists, visible (never accordion-hidden) FAQ + FAQPage JSON-LD, and a dark "More WordSolverX tools" internal-link hub. Fully static in the HTML output (no client JS needed) → indexable.
- `src/lib/content/registry.ts` — typed registry, one entry per route, each with its own H2 blueprint (no shared templates across pages).
- `scripts/add-articles.mjs` — appends new article entries to the registry.

**Live now (wired + typechecked):**
| Page | Words | Angle (unique structure) |
|---|---|---|
| wordle-answer-today | 1,624 | elimination vs guessing, opener logic, yellow-tile anchoring, patterns, hard mode |
| quordle-answer-today | 1,414 | 2.25 boards-per-guess math, shared-guess allocation, mode notes |
| nerdle-answer-today | 1,329 | equation census, purple duplicates, tidy-equation trap |
| spotle-answer-today | 1,471 | attribute binary search, arrows, endgame shortlist |

(Quordle/Nerdle/Spotle will be topped up past 1,500 words in the next pass.)

### 7.4 Content roadmap (remaining pages)
Each remaining page gets a **unique** H2 blueprint; the ones with live impressions are priority order:

1. **wordle-solver** — target: `wordle solver`, `wordle solver online`, `wordle helper`, `wordle answer finder`, `wordle finder`. Angle: how a solver works, letter-frequency elimination, when to use it, ethics of using one.
2. **betweenle-solver** — target: `betweenle solver` (pos 46!). Angle: alphabetical-distance logic, word index math.
3. **squaredle-solver** — target: `squaredle solver`, `squardle solver`. Angle: word-path finding, 8-direction rules, bonus words.
4. **quordle-solver** — target: `quordle solver`. Angle: cross-board letter sharing, multi-board elimination.
5. **Today pages (no Google impressions yet):** worldle, colordle, colorfle, framed, semantle, contexto, searchle, phoodle, phrazle, canuckle, worgle, waffle, betweenle, countryle, globle + 6 GameDle (loldle, dotadle, narutodle, pokedle, smashdle, onepiecedle) + sportle. Target the `[game] answer today` / `[game] hints` / `[game] answer archive` phrase set.
6. **Remaining solvers:** hangman, nerdle, boggle, word-ladder, worldle, spotle, colordle, colorfle, countryle, phoodle, searchle, semantle, contexto, weaver, minesweeper, kanoodle, light-out, waffle, soundmap, wordle-analyzer, word-length/variant pages.

**How to add the next page:** write its entry in `scripts/add-articles.mjs` → `node scripts/add-articles.mjs` → add `import StaticArticle` + `<StaticArticle content={ARTICLE_CONTENT['<route>']} />` before the AuthorCard in the page → `npm run check`.

### 7.5 Bing data (working key) + live articles update
New Bing key (`696b6fca...`) works — wordsolverx.com verified. CSV `wordsolverx.com_KeywordReport_8_15_2026.csv` (228 keywords, **20,741 impressions / 636 clicks**):

**Bing ranks the site page 1–2 for the Wordle cluster but CTR is the leak** (benchmark ~10% at pos 2.4):
- `wordle answer today` 2,922 imp / 2.3% CTR @ pos 6.3 · `todays wordle` 2,054 / 1.0% @ 7.7
- `today's wordle answer` 1,918 / **9.9%** @ 2.4 · `today's wordle` 1,884 / 2.1% @ 5.2
- `wordle today` 1,525 / 0.6% @ 7.4 · `todays wordle answer` 895 / 1.8% @ 5.1 · `wordle answer` 482 / 1.2% @ 8.8
- **Opportunities:** `wordle solver 5 letters` 302 imp @ 7.2 · `minesweeper solver` 279 imp @ 4.2 · `contexto answer` 140 · `globle answer today` 138 · `nerdle today` 133 · `spotle answer today` 95 · dated queries (`wordle 8/12/26`, `wordle hints august 8 2026`)

**Action implied:** optimize the wordle-answer-today TITLE/meta to win the snippet for the pos-5–8 cluster (that alone is ~8k impressions/month at 1–2% → 8–15% potential), and the new articles below cover the solver/other-game clusters.

**Live articles added this pass (10 total now, all wired + typecheck 0/0, tests 7/7):**
| Key | Words | Targets (from real data) |
|---|---|---|
| wordle-solver (all wordlebot solver pages, keyed by game) | 1,340 | `wordle solver`, `wordle solver 5 letters`, `wordle helper` |
| quordle-solver (wordlebot variant) | 1,262 | `quordle solver` |
| minesweeper-solver | 1,170 | `minesweeper solver` (pos 4.2!) |
| betweenle-solver | 1,214 | `betweenle solver` |
| squaredle-solver | 1,241 | `squaredle solver` |
| contexto-answer-today | 1,271 | `contexto answer`, `contexto answer today` |

Still to write (next passes): globle, worldle, colordle, colorfle, framed, semantle, searchle, phoodle, phrazle, canuckle, worgle, waffle, betweenle-today, countryle, sportle + 6 GameDle today pages + remaining solvers (nerdle, hangman, boggle, word-ladder, worldle, spotle, colordle, colorfle, countryle, phoodle, searchle, semantle, contexto, weaver, kanoodle, light-out, waffle, soundmap, wordle-analyzer). Each must stay 1,400–1,600 words with a unique H2 blueprint; top up the six above to 1,500+ in the next pass.

### 7.6 Full Bing report (7–8 months, 2,747 keywords / 176,141 impressions / 5,913 clicks) + rollout status
Source: `wordsolverx.com_KeywordReport_8_15_2026 (1).csv`. Volume by game: wordle 134,918 · **colordle 15,153** · smashdle 5,219 · minesweeper 4,965 · globle 2,681 · spotle 2,037 · waffle 1,223 · contexto 971 · semantle 868 · kanoodle 774 · nerdle 717 · betweenle 667 · onepiecedle 466 · phoodle 424 · phrazle 387 · canuckle 324 · weaver 234 · hangman 213 · narutodle 213 · squaredle 175 · searchle 174 · pokedle 128 · worldle 67.

**Dated/archive keyword patterns (huge untapped pool):** `wordle answer today 2026` 1,580 imp · `all wordle answers 2025` 1,415 imp @ pos 4.3 (0 clicks!) · `list of wordle answers 2025` 817 · `wordle june 26 answer` 776 · `wordle 7/15/26` 567 · `wordle july 1 answer` 469 · `future wordle answers 2025` 447 · plus colordle's day-number format (`colordle day 1441 answer`). **These target the archive pages and the daily dated sections — next optimization target.**

**Article system upgrades this pass:** Table of Contents (anchored, auto-generated when >3 sections), `{date}/{answer}/{dayNum}/{number}/{hex}` variable substitution from live page data, so every today page now covers its dated/community keyword variants (e.g., "colordle day 1623 answer", "the Wordle answer for August 15, 2026 is QUACK, puzzle #1879").

**Live articles (18 wired, typecheck 0/0, tests 7/7):** wordle, quordle, nerdle, spotle, contexto, colordle, globle, semantle, waffle, phoodle, phrazle, canuckle, worldle (today pages) + wordle-solver, quordle-solver, minesweeper-solver, betweenle-solver, squaredle-solver (solvers). Colordle — the #2 Bing keyword pool and the deindex concern you flagged — is now covered with day-number + date + hex targeting.

**Remaining (each unique blueprint, 900–1,300 words currently; top up to 1,500):** GameDle today pages (loldle, dotadle, narutodle, pokedle, smashdle, onepiecedle), sportle, betweenle/colorfle/framed/searchle/worgle/countryle today pages, ~15 remaining solver pages, and the **archive pages** (wordle-answer-archive = the 1,415-imp "all wordle answers 2025" keyword).

### 7.7 Final rollout — 2026-08-16 (all 47 articles live, 1,500+ words each)

**All remaining pages now have their static article. 47/47 registry entries, every today + solver page wired, `npm run check` 0/0, tests 7/7, production build passes.**

**New today-page articles (6, dated `{date}`/`{answer}` vars wired):** betweenle, colorfle, countryle, framed, searchle, worgle — each targets its dated Bing queries (e.g., "Betweenle answer for {date}", "Colorfle answer for {date}" with hex, "Framed answer for {date}" with year/director).

**New solver articles (23):** colordle (274 imp @ pos 2.1 — highest CTR opportunity), spotle, weaver, light-out (879 imp @ 3.7), kanoodle, hangman, boggle, nerdle, worldle, countryle, colorfle, waffle, phoodle, searchle, word-ladder, soundmap, all-wordle + all 6 GameDle solvers (smashdle 4,763 imp, loldle, pokedle, narutodle, dotadle, onepiecedle). Each has a unique H2 blueprint, FAQ schema, and internal-link hub.

**GameDle answer-today pages (6, content group):** the human-written `{#if false}` content blocks were **re-enabled** (smashdle, loldle, pokedle, narutodle, dotadle, onepiecedle) — these already had quality per-game prose + FAQ, now visible and crawlable.

**Word-count top-up:** every article is now **1,500+ words** (measured: 1,503–2,068). Three top-up passes added unique sections per page drawn from the Bing FAQ keyword data — e.g. "what is today's wordle answer" (2,396 imp), "colordle hint" (874 imp), "phoodle hint today" (120 imp), "wordle helper 5 letters", "minesweeper helper".

**New scripts (keep for the pipeline):** `add-articles-b1..b4.mjs` (article batches), `topup-b1..b4.mjs` (word-count passes), `wire-articles.mjs` (page wiring), `bing-faq-keywords.mjs` (live Bing keyword miner, key `696b6fcae...`).

**Remaining known gaps (next targets):** the archive pages (`wordle-answer-archive` — 1,415-imp "all wordle answers 2025" with 0 clicks), and the Wordle title/meta CTR fix for the pos-5–8 cluster (~8k impressions/month at 1–2% CTR). Sportle redirects to spotle (covered); onepiedle and all-wordle-solver redirect to canonical pages (covered).

**Final top-up + uniqueness pass (8/16):** all 59 articles now measure **1,503–1,976 words** (26 articles received one final unique section; every H2 heading is unique across the entire registry — no shared templates, verified programmatically). Archive pages got game-specific headings ("The Quordle archive and the daily four-board game", etc.) instead of the shared "The archive and the daily game". `svelte-check` 0/0, tests 7/7, production Cloudflare build passes.

**Wordlebot variant solver articles (8/16):** the 10 wordlebot variant solver routes (octordle, dordle, xordle, fibble, warmle, hardle, woodle, w-peaks, spotle-wordle/thirdle, canuckle) previously all fell through to the Wordle article in `WordlebotPage` (`game === 'quordle' ? 'quordle-solver' : 'wordle-solver'`). Added 10 dedicated articles — each with mechanics accurate to the solver's implementation (Xordle merged two-word clues, Warmle alphabet-distance yellows, Woodle count-only feedback, Peaks earlier/later verdicts, Fibble one-lie, Hardle swapped greens/yellows, Spotle Wordle four-verdict mode + Thirdle 3-letter sprint) — and replaced the fallthrough with a per-game `SOLVER_ARTICLE_KEYS` map. All 10 articles 1,501–1,580 words. Registry is now 69 articles, every one ≥1,500 words, zero duplicate headings, svelte-check 0/0, tests 7/7, Cloudflare build passes. Note: fixed a script bug that had spliced an article into the middle of the Wordle entry (`src.slice(idx+1)` dropped the closing `}` of `};`, so the next batch's `lastIndexOf('};')` matched `{date};` inside the Wordle FAQ) — restored from HEAD and rebuilt cleanly.

**Full article-coverage sweep (8/16, part 2):** a page-by-page audit found every remaining gap and closed it. (1) Wordle length pages (/3-letter to /11-letter-wordle-solver) rendered a separate WordlebotPage branch with NO article — added the wordle-solver article to that branch; canuckle solver page got canuckle-solver in the canuckle branch. (2) ArchiveCalendar rendered no articles at all despite registry entries — added a gameName→key map inside the component so all 14 ArchiveCalendar archives (globle, quordle, spotle, semantle, colordle, phoodle, phrazle, contexto, waffle, worgle, worldle, searchle, colorfle, wordle) render their articles automatically. (3) Wrote 7 new archive articles (waffle, worgle, worldle, searchle, colorfle, countryle, framed — all 1,500+ words, unique H2s) and wired countryle-archive + framed-archive (standalone layouts). (4) Wired the previously-unwired wordle-analyzer article. Registry is now **75 articles**, all ≥1,500 words (1,501–1,976), zero duplicate headings, svelte-check 0/0, tests 7/7, build passes. `scripts/audit-articles.cjs` now cross-checks every route vs the registry for future coverage regressions.
