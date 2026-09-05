# Google Indexing Failure + Bing Growth Plan

**Site:** wordsolverx.com · **Data pulled:** 2026-08-30, live GSC + Bing Webmaster APIs
**Verdict:** Google has indexed **1 page**. Bing has indexed **1,363**. This is not a
technical blocking problem — it is a quality/authority problem, and the evidence
below narrows it precisely.

---

## Part 1 — The numbers, side by side

| | Google (90d) | Bing (~180d) |
|---|---|---|
| Clicks | **27** | **23,737** |
| Impressions | 3,304 | 565,865 |
| Clicks/day | 0.3 | ~110 (recent: 300-540) |
| Pages with ≥1 impression | **6** | **982** |
| Pages in index | **1** (homepage) | **1,363** |
| Avg position | 68.8 | ~6 |

Google sends you roughly **0.1%** of the traffic Bing does. Both crawlers see the
same site, the same robots.txt, the same sitemaps.

---

## Part 2 — Root cause of the Google indexing failure

### It is NOT any of these (ruled out with API data)

| Hypothesis | Evidence against |
|---|---|
| robots.txt blocking | `robotsTxtState: ALLOWED` on every URL inspected. Bing reports `BlockedByRobotsTxt: 0`. |
| noindex tag | `indexingState: INDEXING_ALLOWED` on every crawled URL. |
| Canonical conflicts | `googleCanonical == userCanonical` on all crawled pages. Self-canonical, correct. |
| Fetch failures | `pageFetchState: SUCCESSFUL`. |
| Sitemaps not submitted | Three sitemaps registered, all `errors: 0`, all downloaded successfully. |
| Sitemap parse errors | `submitted=100`, `submitted=1109`, `submitted=1888`. Google read them fine. |
| Site too new | Homepage indexed and crawled 2026-08-28. Google has been here for months. |
| CSP/JS blocking crawl | Pages are prerendered SSR HTML; content is in the source. Bing indexes them fine. |

### What the URL Inspection API actually reports

```
/                            Submitted and indexed        crawled 2026-08-28
/wordle-answer-today         Crawled - currently not indexed   crawled 2026-08-04
/wordle-answer-archive       Crawled - currently not indexed   crawled 2026-05-08
/today                       Crawled - currently not indexed
/quordle-answer-today        URL is unknown to Google     NEVER CRAWLED
/wordle-solver               URL is unknown to Google     NEVER CRAWLED
/nerdle-answer-today         URL is unknown to Google     NEVER CRAWLED
```

Two distinct failure modes, and they mean different things:

**A. "Crawled – currently not indexed"** — Google fetched the page, evaluated it,
and *chose* not to index. This is a quality judgment, not an error. There is no
technical fix; the page has to become more worth indexing.

**B. "URL is unknown to Google"** — never crawled at all, despite sitting in a
successfully-downloaded sitemap. Google read the sitemap and declined to spend
crawl budget on the URL. This happens when site-level trust is low: Google
rations crawl for domains it doesn't yet value.

### The smoking gun: sitemap indexed counts

```
sitemap.xml                    submitted=100    indexed=0
wordle-archive-sitemap.xml     submitted=1888   indexed=0
colordle-archive-sitemap.xml   submitted=1109   indexed=0
```

**3,097 URLs submitted, 0 indexed.** Google downloaded all three sitemaps without
error and indexed nothing from any of them. A zero across 3,097 URLs is not
noise — it is a site-level decision.

### Why (highest-confidence explanation)

Three factors compound:

1. **Near-zero backlinks.** `referringUrls: 0` on most pages, `1` on the
   homepage. Bing reports **207 inbound links** total for the whole domain.
   Google's crawl-budget allocation is driven heavily by external signals. With
   effectively no links, a 3,000-page site looks like an unvouched-for content
   farm, and Google rations crawl accordingly.

2. **Programmatic content at scale in a saturated niche.** 1,888 archive URLs +
   1,109 colordle URLs are template-generated. Google's spam policy on **scaled
   content abuse** targets exactly this shape: many pages generated at scale where
   each adds little unique value. You are competing with NYT, TechRadar, Tom's
   Guide, PCGamer for "wordle answer today" — all with massive authority. Google
   has no reason to index a 3,000th source.

3. **Prior AI-content history on this domain.** `archive/reports/wordsolverx-adsense-issues.md`
   documents that 6 of 7 daily answer pages previously carried fabricated
   first-person anecdotes describing *the wrong answers* — provably fake
   experience claims. That is a direct E-E-A-T violation. Whether or not it
   triggered anything formal, it is the kind of pattern that suppresses a domain.

**Check this manually — I cannot via API:** Search Console → **Security &
Manual actions → Manual actions**. If there's a "Thin content" or "Scaled content
abuse" action listed, that is the whole answer and nothing else matters until you
file a reconsideration request. The API does not expose this endpoint.

### Also fix: sitemap gap

Every inspected URL reported `sitemaps: NOT IN ANY SITEMAP`, including ones in
`sitemap.xml`. Meanwhile `sitemap.xml` has only **100 URLs** while the archive
sitemaps have 2,997.

**Correction (2026-08-30):** an earlier draft of this doc said `robots.txt`
referenced no sitemap. That was wrong — it referenced exactly one
(`/sitemap.xml`, covering 100 of 3,097 URLs). The two archive sitemaps holding
the other 2,997 were discoverable only via manual GSC submission. All three are
now declared in `static/robots.txt`.

### Also fix: 42 orphan pages

42 of your 100 sitemap URLs have **no internal link from the homepage** —
including `/canuckle-solver`, `/octordle-solver`, `/xordle-solver`,
`/dordle-solver`, `/hardle-solver`, `/warmle-solver`, `/woodle-solver`,
`/w-peaks-solver`, `/fibble-solver`, `/kanoodle-solver`, `/minesweeper-solver`.
Discovery for these depends entirely on the sitemap, which Google is ignoring.
Orphaned pages are the least likely to ever get crawled.

---

## Part 3 — Bing: 400/day → 1,000+/day

Bing already works. This is an optimization problem, not a repair job. Two levers,
in order of size.

### Lever 1 — CTR on queries you already rank for (biggest, fastest)

**149 queries sit at position 4-20 with ≥200 impressions each.** Combined:

```
115,720 impressions  ->  2,602 clicks  =  2.2% CTR
```

2.2% CTR at average position 6 is **badly** below expectation. Position 5-7 in Bing
should return 5-8%. You are leaving most of the traffic on the table at rankings
you already hold.

Look at the spread on the *same query*:

```
"today's wordle answer"   2527 impr   292 clk   pos 2   11.6% CTR   <- good
"today's wordle answer"   2493 impr   198 clk   pos 4    7.9% CTR
"wordle answer today"     4721 impr   105 clk   pos 6    2.2% CTR   <- bad
"wordle answer today"     4007 impr    50 clk   pos 7    1.2% CTR   <- bad
"todays wordle"           3128 impr    19 clk   pos 7    0.6% CTR   <- terrible
"wordle today"            2057 impr    10 clk   pos 7    0.5% CTR   <- terrible
```

Same page, same intent, 20x CTR difference driven by position. Every point of
position gained on the "wordle answer today" cluster is worth hundreds of clicks/day.

**Worst offenders — ranking but zero clicks, ever:**

```
901 impr  pos 9  "wordle 5 letter solver website"     0 clicks
812 impr  pos 3  "all wordle answers 2025"            0 clicks  <- pos 3 and zero!
621 impr  pos 9  "5 letter wordle without cheating"   0 clicks
603 impr  pos 6  "all wordle answers 2025"            0 clicks
564 impr  pos 6  "list of wordle answers 2025"        0 clicks
469 impr  pos 8  "wordle july 1 answer"               0 clicks
436 impr  pos 5  "wordle july 3 answer"               0 clicks
398 impr  pos 6  "smashdle"                           0 clicks
389 impr  pos 6  "every wordle answer to date"        0 clicks
387 impr  pos 9  "wordle solver 5 letters"            0 clicks
```

**Position 3 with 812 impressions and zero clicks is a title/snippet failure, not
a ranking failure.** Nobody is choosing your result. 50 queries share this pattern.

Fixes, in order:

1. **Rewrite titles for the zero-click queries.** `"all wordle answers 2025"` and
   `"list of wordle answers 2025"` and `"every wordle answer to date"` all point at
   `/wordle-answer-archive` — which gets **3,630 impressions and 1 click**. That
   page's title/description is not matching searcher intent. It should say
   something like "Every Wordle Answer Ever — Complete List (Updated Daily)" with
   a description stating the count and date range.
2. **Put the answer in the meta description** for daily pages. Bing shows
   descriptions prominently; searchers wanting today's answer will click the
   result that looks like it already has it.
3. **Add `Article`/`FAQPage` structured data** with `datePublished`/`dateModified`.
   Bing weights freshness signals visibly in SERP display.
4. **Dedicated pages for date-specific queries.** `"wordle july 1 answer"`,
   `"wordle july 3 answer"`, `"wordle june 26 answer"` have 400-800 impressions each
   and zero clicks. These are landing on the wrong page. You already have 1,888
   archive URLs — they just aren't titled to match `"wordle {month} {day} answer"`.

Conservative arithmetic: lifting that 149-query cluster from 2.2% to a realistic
6% CTR = **~6,900 clicks** vs the current 2,602. That alone roughly triples Bing
traffic without a single new ranking.

### Lever 2 — 1-2 backlinks (helps Bing AND unblocks Google)

You have **207 inbound links** total. This is the binding constraint on both
engines. Highest-value targets for a puzzle-solver site:

1. **Reddit** — r/wordle, r/NYTWordle, r/puzzles. Not spam drops; answer questions
   where the solver genuinely helps. Bing indexes Reddit aggressively and weights
   it. Note the "5 letter wordle without cheating" query (621 impr, 0 clicks) —
   that is a Reddit-flavoured intent.
2. **Wikipedia external links** — the Wordle article and "list of word games" have
   external-link sections. A solver tool is a legitimate entry. High bar, huge payoff.
3. **GitHub** — you already have a public repo. A well-documented repo with the
   site linked in the README earns a real dofollow link from a maximally-trusted domain.
4. **Free tool directories** — AlternativeTo, Product Hunt, ToolFinder. Low effort,
   real links.
5. **The other domains in your own portfolio** — `crosswordanswer.dev`,
   `cryptowalletsx.com`, `wordsolver.tech`, `wendanswertoday.me`, and
   `pinpointanswertoday.online` are all yours and verified in Bing/GSC. Cross-link
   them *sparingly and contextually* — a footer link farm across five owned domains
   is a footprint Google recognizes and penalizes. One relevant in-content link
   from the most established property is worth more than five sitewide footer links.

### Lever 3 — content depth on pages Bing already likes

Bing page data shows concentration:

```
/wordle-answer-today    51,306 impr   1,985 clicks   <- your entire business
/today                   3,913 impr     155 clicks
/5-letter-wordle-solver  3,879 impr       2 clicks   <- 0.05% CTR, broken
/wordle-answer-archive   3,630 impr       1 click    <- 0.03% CTR, broken
/colordle-solver         2,325 impr     111 clicks
/contexto-answer-today   2,086 impr     140 clicks
```

`/5-letter-wordle-solver` and `/wordle-answer-archive` together pull 7,500
impressions and produce **3 clicks**. Fix those two pages' titles and descriptions
before doing anything else — it is the single highest-leverage hour of work available.

Also: `"colordle"` gets 1,456 + 1,312 + 283 impressions at position 6-7 with
2/4/0 clicks. You rank for a game name and convert nobody. `/colordle-solver`
converts fine (111-200 clicks), so the *brand-name* query is landing somewhere wrong.

---

## Part 4 — Fix plan, ordered by return per hour

### Done (2026-08-30)

| # | Action | Where |
|---|---|---|
| ✅ | `Sitemap:` directives for all three sitemaps | `static/robots.txt` — previously declared only `/sitemap.xml` (100 of 3,097 URLs) |
| ✅ | Title + meta rewrite on `/wordle-answer-archive` | now leads with `All Wordle Answers: 2026, 2025 …`; the old title contained neither "all" nor a year, against 1,415 impressions / 0 clicks for "all wordle answers 2025" |
| ✅ | Removed fabricated first-person experience claims site-wide | `src/lib/content/registry.ts` — 1,195 strings, see below |
| ✅ | Stopped advertising the redirecting solver URL | `static/llms.txt`, `static/llms-full.txt` listed `/5-letter-wordle-solver`, which 301s. Both now point at `/wordle-solver` |

**The E-E-A-T fix, in detail.** The August rewrite (`7c71355`, `d3644dd`, `aa1c0fa`)
replaced third-person AI prose with invented first-person anecdotes, per a playbook
that explicitly permitted "non-verifiable-invented" experience. That converted one
violation into another: `/wordle-answer-archive` claimed a 2022 argument with a friend
about REBUS, while `/about` disclosed the copy as model-drafted. Google's guidance
weighs the "who" and "how" of content; a page that contradicts its own disclosure is
worse than plain prose.

Method (three model-assisted passes plus manual repair):

1. Machine audit of all 74 articles to enumerate unverifiable claims. Validated
   against the pre-cleanup file first — the auditor had to catch the known
   fabrications before its "clean" verdicts meant anything.
2. Per-string rewrite, one string in / one string out, with hard guards: template
   variables (`{answer}`, `{date}`, `{dayNum}`) must survive, HTML tags must survive,
   and any output still containing first person was discarded rather than applied.
3. Manual repair of what automation broke — three literals where the model answered
   conversationally and emitted embedded newlines into single-line strings, plus
   over-escaped quotes in the Searchle prompt examples.

Result: **1,195 strings rewritten** across 74 articles. `\bI \b` occurrences in
`registry.ts` fell from 2,238 to 51, and `\bmy \b` from 673 to 7 — the remainder are
FAQ `question:` fields, where first person is the reader's voice ("How do I stop
losing my Wordle streak?") and correct.

What was removed:

- **139 headings and list titles** converted to instructional voice
  ("What the archive taught me" → "What the archive reveals").
- **All named third parties** — the friend who swore about REBUS, the partner who
  called Betweenle a phone book game, the friend who insisted Minesweeper is a coin
  flip, the group chat that could not agree on a Semantle answer. None existed.
- **All counted streaks and personal metrics** — the 200-day Wordle streak, the
  61-day Semantle streak, the 612-guess solve, the 23-day Betweenle streak,
  "my average dropped from seven to four", "took the average from six guesses to three".
- **All dated personal history and routine detail** — "back in 2022", "I play at
  breakfast before coffee", "my first month".
- **Author-claim eyebrow labels** — "From a Daily Four-Board Player", "built by a
  daily player", and four others.

What was kept, deliberately: solver-derived expertise. "The solver ranks candidates by
expected eliminations", "Colordle scores perceptual similarity rather than RGB
distance", the Gaussian-elimination explanation on lights-out. These are checkable
against `src/lib/wordlebot-wasm/` and are the strongest genuine E-E-A-T signal the
site has. Deleting them would have made the pages worse.

`/about` now states that article copy does not claim personal gameplay experience, so
the disclosure and the pages agree.

Verified: `npm run check` 0 errors, `npm test` 10/10, `npm run build` clean, and a
scan of all **3,118 prerendered HTML pages** returns zero hits for the removed
anecdote patterns.

### Still open

| # | Action | Where | Why |
|---|---|---|---|
| 1 | Check **Security & Manual actions** in GSC | GSC UI (not API-exposed) | If there's a manual action, everything else is wasted effort until it's lifted |
| 2 | Decide canonical for `/5-letter-wordle-solver` | `_redirects` line 2 | Confirmed live: the URL returns **301 → /wordle-solver**, and `/wordle-solver` self-canonicalizes with the already-correct title. Bing gives the redirecting URL 16,558 impressions and the target only 669, so Bing has not transferred the ranking. Options: (a) leave it and wait, (b) serve the page at `/5-letter-wordle-solver` and canonicalize the other way. Owner's call |
| 3 | Build a sitemap **index** referencing all three sitemaps | `scripts/generate-sitemap-lastmod.mjs` | Cleaner than three flat declarations |
| 4 | `noindex` decision on the thinnest archive tiers | `wordle-archive-sitemap.xml/+server.ts` + dated page head | 2,997 template URLs against ~100 real pages. Removes URLs from index eligibility — owner's call |
| 5 | Rewrite titles for the remaining zero-click Bing queries | route metadata | Biggest remaining traffic lever |

### This month

| # | Action | Why |
|---|---|---|
| 6 | Internal-link the 42 orphan pages from `/solver` and `/guides` hubs | Crawl discovery; they currently depend on an ignored sitemap |
| 7 | Land 1-2 genuine backlinks (GitHub README, Reddit, a directory) | 207 inbound links is the binding constraint on both engines |
| 8 | Title date-specific archive pages as `Wordle Answer for {Month} {Day}, {Year}` | 400-800 impressions each, zero clicks, wrong page ranking |
| 9 | Add `datePublished`/`dateModified` structured data to daily pages | Freshness display in Bing SERPs |
| 10 | Expand `/nerdle-archive` (350 words) and `/canuckle-archive` (479 words) | Below Mediavine's 700-word RPM target and Google's quality bar |

### Google-specific, and be realistic about it

Do **not** expect Google traffic soon. The honest read: Google has evaluated
3,097 URLs and indexed zero. That reverses only with genuine authority signals,
and it takes months. Priority order:

1. Confirm no manual action.
2. Reduce programmatic surface area. 2,997 template archive URLs against ~100
   real pages is the exact ratio that reads as scaled content abuse. Consider
   `noindex` on the thinnest archive tiers and let the strong pages compete.
   Fewer, better-indexed pages beat 3,000 ignored ones.
3. ~~Fix the E-E-A-T damage.~~ **Done 2026-08-30** — see Part 4. Note for future
   agents: the fix is *removing* unverifiable claims, not generating better ones.
   Two prior passes failed because each one replaced fabricated experience with
   differently-worded fabricated experience.
4. Earn links. Nothing else moves the needle at this stage.
5. Request indexing on your 5 best pages via GSC UI — one round, then stop.
   Repeated requests don't help.

**Realistic ceiling:** you will not out-rank NYT/TechRadar/Tom's Guide for
"wordle answer today" on Google. Your Google opportunity is the long tail —
the obscure games (`worgle`, `canuckle`, `betweenle`, `phrazle`, `smashdle`)
where competition is thin and a genuinely good solver can win. That is also
where Bing already rewards you.

---

## Part 5 — Reproducing this analysis

Scripts live in `tmp/` (gitignored). Credentials come from env vars, never files in
the repo.

```powershell
cd C:\Users\akasa\Projects\tmp\repo
$env:GSC_KEY_FILE = 'C:\path\to\service-account.json'
$env:BING_KEY     = '<bing webmaster key>'
$env:MONID_KEY    = '<monid.ai key>'

node tmp/tmp-gsc-report.mjs           # clicks/impressions trend, pages with impressions
node tmp/tmp-gsc-inspect.mjs          # URL Inspection: why each page is/isn't indexed
node tmp/tmp-gsc-sitemaps.mjs         # sitemap submitted-vs-indexed counts
node tmp/tmp-gsc-dimensions.mjs       # country / device / query breakdown
node tmp/tmp-bing-report.mjs          # Bing traffic + crawl stats + index size
node tmp/tmp-bing-queries.mjs         # striking-distance + zero-click query analysis
node tmp/tmp-bing-pages.mjs           # per-page Bing performance
node tmp/tmp-audit-internal-links.mjs # orphan-page detection
node tmp/tmp-research.mjs "query"     # TinyFish web search via monid.ai
```

### API notes for future agents

- **GSC URL Inspection** (`searchconsole.googleapis.com/v1/urlInspection/index:inspect`)
  is the only authoritative source for index status. `coverageState` distinguishes
  "Crawled - currently not indexed" (quality) from "URL is unknown to Google"
  (crawl budget). Rate-limited to ~2,000/day.
- **Manual actions are not in any API.** Must be checked in the GSC UI.
- **Bing `GetQueryStats`** returns per-query-per-week rows, so the same query text
  appears many times. Don't dedupe blindly — the repetition is the time series.
- **Bing `GetChildrenUrlTrafficInfo`** returns `SiteUriSchemeIsNotSupported` for
  `https://` properties. Use `GetPageStats` instead.
- Service-account JWT auth needs scope `https://www.googleapis.com/auth/webmasters`
  (read-write) for URL Inspection; `.readonly` is enough for Search Analytics.


