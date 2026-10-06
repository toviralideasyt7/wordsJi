# Bing Re-measure Checklist (monthly)

Purpose: track whether the Bing ranking plan is working, per query. Run on the
first Monday of each month using the bing-webmaster skill CLI at
`~/workspace/skills/bing-webmaster/bin/bing.py` (property `https://wordsolverx.com/`).

## 1. Pull fresh data

```bash
cd ~/workspace/skills/bing-webmaster
./bin/bing.py query-stats --days 30 > /tmp/bing-queries.txt
./bin/bing.py page-stats --days 30 > /tmp/bing-pages.txt
```

(Bing data lags ~2-3 days; note the exact date range the API returns.)

## 2. Build the position-vs-CTR matrix

For each money query (`wordle answer today`, `wordle today`, `todays wordle`,
`today's wordle answer`, `wordle answer`, `wordle solver`, `wordle solver 5 letters`,
`colordle answer today`, `contexto answer today`, `semantle answer today`,
`spotle answer today`, `globle answer today`, `wordle hints today`), record:

| Query | Impressions | Clicks | CTR | Avg position | vs last month |
|---|---|---|---|---|---|

For each flagship page (`/wordle-answer-today`, `/wordle-solver`,
`/colordle-answer-today`, `/contexto-answer-today`, `/semantle-answer-today`),
record the same.

## 3. Diagnose per the CTR framework

- **Position held + CTR fell** = snippet problem. Check the live SERP: is the
  title/date stamp current? Did a competitor add a fresher-looking snippet? Did
  Bing start showing an answer box / Copilot panel for the query?
- **Position fell** = ranking problem. Check: did the page's "last updated"
  stamp go stale (build/deploy gap)? Any new strong competitor in top 5?
  Check BWT crawl stats for the URL.
- **Impressions grew + CTR fell** = surface mix shift. Bing blends web + Copilot
  + news + images. Check BWT for which surface grew before rewriting snippets.

## 4. Spot-check live SERPs (signed out, bing.com)

For the top 5 queries, record the top 10 organic results: does wordsolverx.com
still hold its position? Any new competitor? Is our title showing the current
date (not stale)? Is there a direct-answer box now?

## 5. Verify freshness pipeline

- Pick 3 answer pages, view source: does `<title>` carry today's puzzle date?
- Is the "Page last updated" stamp today's date?
- Did `scripts/generate-ai-hints.mjs` run in the last scheduled publish?
  (Check the Publish Pages workflow logs.)
- Spot-check one `src/lib/data/ai-hints/<game>.json`: does it have an entry
  for the current puzzle date?

## 6. Decide next actions

- Double down on queries/pages that moved up (expand the winning pattern to
  sibling pages).
- For queries that slipped: one targeted change at a time (title, stamp,
  hint block), then re-measure next month.
- Warning from the community corpus: early Bing wins can fade after a few
  months — a slip after gains is normal; respond with freshness + links,
  not redesigns.

## Baseline (2026-10-06, before plan implementation)

- Site: ~72-79k impressions/week, CTR 2.03% (was 4.5% in July), ~1,473 clicks/week.
- `/wordle-answer-today`: 267,637 imp / 4,719 clicks / 1.76% CTR / pos 6.0.
- Live positions: "wordle answer today" #8, "todays wordle" #6,
  "today's wordle answer" #7, "wordle answer" #10, "colordle answer today" #2,
  "contexto answer today" #8, "semantle answer today" #1. Absent: "wordle today",
  "wordle solver", "wordle hints today".
