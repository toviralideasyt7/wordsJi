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
