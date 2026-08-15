# WordSolverX Growth Analysis — How to Go From ~65 Clicks/Day to 1,000–1,500/Day

**Date:** August 16, 2026 · **Data:** Live Bing Webmaster API (90 days, pulled today) + Google Search Console (service account, 90 days)

---

## 1. The honest reality check (read this first)

Your goal is 1,000–1,500 clicks/day within 10 days. Here is what the APIs actually show today:

| Engine | Impressions (90d) | Clicks (90d) | ≈ Clicks/day | Diagnosis |
|---|---|---|---|---|
| **Bing** | 155,527 | 5,882 | ~65 | Ranking at positions 4–9 on huge queries, but CTR is 0–2% where it should be 8–25% |
| **Google** | 3,421 | 3 | ~0 | **Deindexed.** Only the homepage surfaces, at positions 32–94 — invisible |

Two completely different problems:

- **Bing: you rank, but nobody clicks.** You are at position 7.4 for "wordle answer today" (19,403 impressions!). The traffic is sitting there — the snippet, title, and position are losing the click.
- **Google: you don't exist.** 3,421 impressions total in 90 days vs 155,527 on Bing. This is the deindex you suspected, and it is the difference between "hundreds of clicks" and "thousands of clicks" per day. Google's search volume for these keywords is 3–5x Bing's.

**What is realistic in 10 days:** Bing-side fixes (titles, meta, answer-in-snippet, internal links) can plausibly lift you from ~65 to **150–300 clicks/day** within 10 days — those changes index in days on Bing. Google recovery (indexing requests + fixes) will take **2–6 weeks** before meaningful clicks arrive, because Google must re-crawl and re-rank after a deindex. The honest path to 1,000+/day is: Bing to 300+/day now (10 days) + Google recovery to 700+/day (weeks 3–8). I will not sell you a 10-day miracle — but I will give you the exact plan that compounds toward it.

---

## 2. The quantitative opportunity map (Bing, 90 days)

Every row below is a real query your site already ranks for, with the projected clicks if it reached position 2–3 (Bing benchmark CTR ~12%).

### Tier 1 — The Wordle cluster (≈ 90,000 impressions, the single biggest lever)

| Query | Imp | Clicks | CTR | Pos | Upside @pos3 |
|---|---|---|---|---|---|
| wordle answer today | 19,403 | 335 | 1.7% | 7.4 | **+1,993** |
| today's wordle answer | 14,074 | 907 | 6.4% | 4.1 | +782 |
| todays wordle | 9,286 | 115 | 1.2% | 7.8 | +999 |
| today's wordle | 8,120 | 143 | 1.8% | 6.4 | +831 |
| todays wordle answer | 6,208 | 221 | 3.6% | 5.9 | +524 |
| wordle today | 4,757 | 42 | 0.9% | 7.8 | +529 |
| wordle today answer | 3,558 | 47 | 1.3% | 7.2 | +380 |
| what is today's wordle answer | 2,396 | 75 | 3.1% | 4.8 | +213 |
| wordle answer | 1,619 | 11 | 0.7% | 8.8 | +183 |
| what is today's wordle | 1,580 | 53 | 3.4% | 5.6 | +137 |
| today wordle answer | 2,010 | 124 | 6.2% | 5.0 | +117 |
| whats todays wordle | 905 | 6 | 0.7% | 8.7 | +103 |
| what is the wordle today | 745 | 3 | 0.4% | 8.8 | +86 |
| what is todays wordle | 655 | 1 | 0.2% | 8.8 | +78 |
| daily wordle answer | 289 | 3 | 1.0% | 7.3 | +32 |

**Wordle cluster total upside at pos-3 CTR: ≈ +6,000 clicks/90d (~+67/day).** And this is *just* moving positions. The CTR lever (below) is additive.

### Tier 2 — Pages with impressions but broken CTR (fix the snippet, not the rank)

| Page | Imp | Clicks | CTR | Diagnosis |
|---|---|---|---|---|
| /5-letter-wordle-solver | 3,430 | 7 | **0.2%** | Query "wordle solver 5 letters" (2,169 imp, 0.4% CTR) lands on a page whose title was generic for most of the 90-day window. Title fix already shipped (see §6.4) — data lags. |
| /smashdle-answer-today | 4,873 | 14 | **0.3%** | Generic title "Smashdle Hints and Answers for Today". Query is just "smashdle" (4,763 imp) — snippet must promise the answer. |
| /colordle-answer-today | 14,759 | 1,217 | 8.2% | **Already your best performer.** "colordle answer" (3,771 imp @ 4.3, 11.3% CTR) + "colordle hint" (874 @ 4.5, 11.6%). Protect and extend. |
| /minesweeper-solver | 4,951 | 176 | 3.6% | "minesweeper solver" 4,922 imp @ 5.1. Moving to top-3 = +421 clicks. Second-biggest single keyword on the site. |
| /wordle-answer-archive | 10,306 | 225 | 2.2% | "all wordle answers 2025" (1,415 imp @ 4.5, **0 clicks**), "list of wordle answers 2025" (817 @ 6.0, **0 clicks**), "every wordle answer to date" (872 @ 5.5, **0 clicks**). The archive ranks but the snippet doesn't sell the list. |
| /globle-answer-today | 2,332 | 55 | 2.4% | "globle answer today" 1,694 imp @ 7.1. |
| /spotle-answer-today | 1,889 | 158 | 8.4% | Healthy. |
| /wordle-analyzer | 833 | 26 | 3.1% | "wordle analyzer" @ 3.7 — near-miss, title/meta polish. |
| /lights-out-solver | 1,136 | 82 | 7.2% | "lights out solver" @ 3.7. Strong. |
| /semantle-answer-today | 830 | 79 | 9.5% | Strong. |
| /betweenle-solver | 426 | 83 | 19.5% | Best CTR on site — demand is tiny but perfectly matched. |
| /waffle-archive | 820 | 25 | 3.0% | "waffle game archive" 481 @ 7.4. |

**Total modeled upside (all pos≥3 queries with ≥50 imp, at pos-3 CTR): ≈ 13,285 clicks/90d ≈ +148/day.**

---

## 3. The eight concrete issues found (with evidence)

### Issue 1 — Bing CTR disaster on the Wordle cluster (the #1 problem)
The site holds positions 5–8 for ~90,000 impressions/month of intent-rich queries, but CTR sits at 0.9–3.6% vs the 10–17% that positions 2–4 deliver in this niche. Two causes: (a) position, (b) snippet. Fixing the snippet alone typically adds 1.5–3x CTR at the same rank — that is 3,000–6,000 extra clicks/90d with zero rank movement.

### Issue 2 — Google deindex (the 10x problem)
3,421 impressions / 3 clicks in 90 days. The GSC data shows the site still surfaces for solver keywords ("wordle solver" 441 imp, "betweenle solver" 42 imp, "squaredle solver" 37 imp) **but at positions 32–94** — meaning Google re-crawled, kept the homepage, and dropped the inner pages. This is not a robots.txt problem (robots.txt correctly allows Googlebot). It is the *content-quality/template* penalty pattern the audit has been fixing — which is why the 75 unique articles matter. Recovery requires: clean content (done), **fresh indexing requests**, and time.

### Issue 3 — Archive pages rank but never sell the click ("all wordle answers 2025" = 0 clicks at position 4.5)
The archive holds top-5 positions for list-intent queries and converts at 0%. The searcher wants to *see the list* — the snippet must show "1,000+ answers, 2022–2026, complete table" and the page must put a year-filtered list above the fold. The article now targets these keywords; the meta and above-the-fold list are the missing pieces.

### Issue 4 — Solver pages leak impressions at 0.2–0.4% CTR
"wordle solver 5 letters" (2,169 imp), "wordle 5 letter solver website" (1,326), "5 letter wordle solver" (1,290), "5 letter wordle without cheating" (1,056) — combined ~5,800 impressions at ~0.3% CTR because the page title was generic for most of the window. The intent-driven title fix shipped, but the solver pages still lack per-length distinct titles, and "without cheating" queries need a "no cheating" assurance in the copy/title.

### Issue 5 — smashdle-answer-today: 4,873 impressions, 0.3% CTR
Generic title from `GameDleAnswerPage`: "Smashdle Hints and Answers for Today (date)". "Smashdle" searchers want the character revealed — the title/description must say it. Also worth a daily structured snippet.

### Issue 6 — Dated-keyword capture is partial
Bing rewards date-specific queries: "wordle june 26 answer" (776 imp), "wordle 7/15/26" (567), "wordle july 1 answer" (469), "wordle 6/24/26" (315), "future wordle answers 2025" (447). The wordle-answer-today page now injects {date} into its article, and the archive covers dated lookups — but these queries currently split between the archive and the today page, and neither title contains the format ("Wordle June 26 Answer"). A dedicated dated-keyword section + title pattern on both pages would capture the cluster.

### Issue 7 — Internal-link equity is still flat
The archive is the site's second-highest-impression page (10,306 imp) but the today page doesn't prominently link the archive for the "all wordle answers" intent, and the solver pages don't link the archive either. The 75 articles added internal-link hubs — but the *page-level* header/footer links (visible without scrolling) are the ones that matter most for crawl equity and for the "list of all answers" intent.

### Issue 8 — Google sitemap freshness signals
The sitemap exists, is complete, and lastmod now tracks puzzle dates correctly (verified in `routes/sitemap.xml/+server.ts`). But with 3 clicks/90 days on Google, **indexation, not the sitemap, is the bottleneck.** Priority: batch URL-inspection + indexing requests for all 75 article pages, then re-submit the sitemap.

---

## 4. The 10-day action plan (day by day)

### Days 1–2 — Bing CTR surgery (fastest clicks per hour)
1. **Rewrite the Wordle cluster titles** (`wordle-answer-today/+page.server.ts`):
   - Current: `Wordle Answer Today (Aug 16, 2026) - Hints and Answer #1879`
   - Target covers the 5 query variants: `Today's Wordle Answer (Aug 16) - Hints, Clues & #1879`
   - Keep the answer in the meta description (already done — Bing shows it verbatim).
2. **Archive meta**: title → `All Wordle Answers 2025-2026 - Complete List by Date` ; description must lead with "Every answer, 2022–today, in one searchable table."
3. **Smashdle meta** (in each GameDle page or `GameDleAnswerPage` default): title → `Smashdle Answer Today - Character Revealed (Classic, Emoji, Silhouette)`.
4. **Solver meta**: confirm the 5-letter title shipped; add the "no cheating / find the answer from your clues" phrasing to the 4/6/7-letter titles too.
5. Deploy. Bing recrawls fast; re-check CTR in 48h.

### Days 3–5 — Google recovery begins (the long game)
6. Use the GSC service account to run **URL inspections + indexing requests for all 75 article pages** in batches (the `gsc-audit.mjs` script already has the auth plumbing — extend it with a URL-inspection loop).
7. Re-submit `https://wordsolverx.com/sitemap.xml` in Search Console.
8. Fix any remaining `noindex`/coverage errors surfaced by the inspections.

### Days 6–8 — Rank push on the five highest-upside pages
9. **/minesweeper-solver** (pos 5.1, 4,922 imp): add the solver article's strategy sections to page copy above the fold + strong internal links from the today page. This single page = +421 clicks/90d at top-3.
10. **/5-letter-wordle-solver**: add a "no cheating" trust section and link the archive ("see the full answer list") — captures the 1,056-imp "without cheating" query.
11. **/wordle-answer-archive**: build the year-filtered answer table **above the fold** (jump links for 2022–2026), not only inside the article — this is the fix for the three 0-click list queries.
12. **Internal links**: today page ↔ archive ↔ solver cross-links in the visible header/footer area (not just the article hub).

### Days 9–10 — Dated keywords + measurement
13. Add the dated-keyword section (already in the Wordle article) + make the today-page FAQ answers date-formatted ("The Wordle answer for June 26, 2026 was…") so Bing surfaces the snippet for "wordle june 26 answer".
14. Re-pull `bing-query-stats.csv` and compare CTR before/after per query. Report which fixes moved the needle.

---

## 5. Realistic projections

| Scenario | Clicks/day (end of 10 days) | What it takes |
|---|---|---|
| **Bing CTR + snippet only** | 130–220 | Days 1–2, 5, 9–10 |
| **Bing CTR + rank push on top-5 pages** | 200–320 | Days 1–8 |
| **+ Google recovery starts** | +50–200 by day 10, compounding | Days 3–5 (indexing requests), then 2–6 weeks for Google to re-rank |
| **Full target: 1,000–1,500/day** | **Weeks 4–8, not 10 days** | Bing at 300–400/day + Google reindexed and climbing to 700–1,100/day |

The 1,000+/day number is achievable — but it is a **4–8 week** trajectory, not 10 days. Google's reindex-and-rerank cycle is the clock you cannot compress. Everything in this plan shortens that clock: the articles are already in place, the indexing requests are the trigger, and Bing pays you in the meantime.

---

## 6. Data appendix

- **Bing pull:** `scripts/pull-bing-full.mjs` → `bing-query-stats.csv` (1,597 queries, 90 days).
- **Opportunity model:** `scripts/analyze-opportunity.cjs` (query→page mapping + pos-3 CTR projection).
- **Google pull:** `GSC_CREDENTIALS_PATH=... node scripts/gsc-keywords.mjs` → `artifacts/gsc-keywords.json` (622 queries, 3,421 imp, 3 clicks).
- **Coverage audit:** `scripts/audit-articles.cjs` — every route now has an article (75 total).
