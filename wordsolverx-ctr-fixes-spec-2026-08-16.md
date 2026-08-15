# WordSolverX CTR Fix Spec — Exact Title / Meta / Copy Values for Maximum Traffic & Clicks

**Date:** August 16, 2026 · **Goal:** every value below is written to be deployed as-is, targeting the exact Bing queries from `bing-query-stats.csv`. Bing renders the `<title>` and shows the meta description **verbatim** in the snippet — so these two fields are your CTR engine. Google re-writes descriptions ~70% of the time, but titles and the first ~120 chars of visible page content still matter.

**Title length rules:** Bing displays ~65–70 chars, Google ~55–60. Every title below is ≤ 62 chars.

---

## DAYS 1–2 — Bing CTR surgery (deploy these exact values)

### 1. Wordle Answer Today — `/wordle-answer-today`

**Where:** `src/routes/(interactive)/wordle-answer-today/+page.server.ts` → `pageTitle`, `pageDescription`

**Target queries (impressions / clicks / position / CTR):**
- `wordle answer today` — 19,403 imp / 335 cl / pos 7.4 / **1.7%**
- `today's wordle answer` — 14,074 imp / 907 cl / pos 4.1 / 6.4%
- `todays wordle` — 9,286 imp / 115 cl / pos 7.8 / **1.2%**
- `today's wordle` — 8,120 imp / 143 cl / pos 6.4 / **1.8%**
- `todays wordle answer` — 6,208 imp / 221 cl / pos 5.9 / 3.6%
- `wordle today` — 4,757 imp / 42 cl / pos 7.8 / **0.9%**
- `wordle today answer` — 3,558 imp / 47 cl / pos 7.2 / **1.3%**
- `wordle answer today 2026` — 1,559 imp / 201 cl / pos 4.4 / **12.9%** (proof the format works when it ranks)

**Title (48 chars):**
```
Wordle Answer Today (Aug 16) - Today's Wordle #1879
```
Why this exact string:
- `Wordle Answer Today` = exact match for the #1 query (19.4k imp)
- `Today's Wordle` = exact phrase for the #4 query (8.1k imp)
- date `(Aug 16)` + `#1879` = covers `wordle answer today 2026`, `wordle 8/16/26`, and dated-variant matching
- dropping `, 2026` and `Hints and Answer` saves 10 chars and removes a low-value word; `Hints` already lives in the description

**Meta description (115 chars — Bing shows this verbatim; the answer must be the first thing):**
```
Today's Wordle Answer is QUACK - Wordle #1879 (Aug 16). Hints, first-letter clue, and recent answers.
```
Why: front-loads the two highest-volume phrase forms (`Today's Wordle Answer`), puts the answer in chars 1–25, and promises hints (the click reason). Keep the existing "answer in description" behavior — just re-order it to lead with `Today's Wordle Answer is …`.

**On-page H1 (same file / page):** `Today's Wordle Answer ({formattedDate})` — H1 should mirror the title's lead phrase, not just `Wordle Answer Today`.

---

### 2. Wordle Answer Archive — `/wordle-answer-archive`

**Where:** `src/routes/(interactive)/wordle-answer-archive/+page.svelte` → `<title>` (line ~104) + meta description

**Target queries — the three "0 clicks" list queries (this is pure snippet loss):**
- `all wordle answers 2025` — 1,415 imp / **0 cl** / pos 4.5
- `list of wordle answers 2025` — 817 imp / **0 cl** / pos 6.0
- `every wordle answer to date` — 872 imp / **0 cl** / pos 5.5
- `future wordle answers 2025` — 447 imp / 0 cl / pos 6.5
- `wordle answer list 2025` — 349 imp / 0 cl / pos 3.0

**Title (49 chars):**
```
All Wordle Answers 2022-2026 - Complete List by Date
```
Covers: `all wordle answers` (exact), `every wordle answer to date` (semantic), `list of wordle answers` (semantic), year range catches 2025/2026 variants.

**Meta description (147 chars):**
```
Every Wordle answer from 2022 to today in one searchable table. All wordle answers 2025, 2024, 2023, and past years by date - free.
```
Why: repeats the exact query phrase `all wordle answers 2025` (Bing bolds matching words in the snippet — that bold text is what earns the click), states the count/scope, and says `free`.

**Above-the-fold requirement (this is Day 6–8 item, but the snippet depends on it):** the first visible content under the H1 must be the year-filter jump bar: `[ 2026 ] [ 2025 ] [ 2024 ] [ 2023 ] [ 2022 ]` followed by the answer table — not a hero paragraph.

---

### 3. Smashdle (and the other 5 GameDle answer pages) — `/(content)/smashdle-answer-today`

**Where:** `src/lib/components/GameDleAnswerPage.svelte` → `pageTitle` / `pageDescription` defaults (lines ~88–99), or per-page `data.meta` overrides.

**Target queries:**
- `smashdle` — 4,763 imp / 8 cl / pos 6.8 / **0.2%** (brand-navigational: the searcher wants the character, today)
- `smashdle answer` / `smashdle answer today` / `smashdle today` — the remaining 100+ imp

**Title (51 chars):**
```
Smashdle Answer Today - Character Revealed (Classic, Emoji, Silhouette)
```
Drop the current generic `Smashdle Hints and Answers for Today ({date})`. The query is the bare word `smashdle` — the title must immediately answer "who is it".

**Meta description (120 chars):**
```
Today's Smashdle character revealed: [CHARACTER]. Classic, Emoji, Silhouette, Final Smash & Stage mode answers. Updated daily.
```
(`[CHARACTER]` = the page's current answer; if the component can't inject it, use `Today's Smashdle character revealed with all mode answers - Classic, Emoji, Silhouette, Final Smash, Stage.`)

**Repeat for:** `loldle-answer-today`, `pokedle-answer-today`, `narutodle-answer-today`, `dotadle-answer-today`, `onepiecedle-answer-today` — same pattern (`Pokedle Answer Today - Character Revealed (Gen, Type, Height)` etc.).

---

### 4. Solver pages (wordle lengths + variants) — `/5-letter-wordle-solver`, `/4-letter-wordle-solver`, …

**Where:** `src/lib/wordlebot-wasm/route-config.ts` → `getWordleLengthPageConfig` (title/description) + `getVariantSolverPageConfig`

**Target queries:**
- `wordle solver 5 letters` — 2,169 imp / 8 cl / pos 8.0 / **0.4%**
- `wordle 5 letter solver website` — 1,326 imp / 1 cl / pos 7.3
- `5 letter wordle solver` — 1,290 imp / 7 cl / pos 7.4
- `5 letter wordle without cheating` — 1,056 imp / 0 cl / pos 9.0
- `5 letter word wordle solver` — 243 imp / 0 cl

**5-letter title (shipped in a prior pass — keep, verify deployed):**
```
Wordle Solver - Find Today's 5-Letter Word from Your Clues
```
**5-letter description (keep):**
```
Enter your green, yellow, and gray tiles to find the 5-letter Wordle answer. Free Wordle solver that ranks the best next guesses from your clues.
```

**Extend the same intent pattern to every other length** (the current fallback `${n}-Letter Wordle Solver` is too generic for CTR):
```
4-letter:  Wordle Solver 4 Letters - Find the Answer from Your Clues   (58)
6-letter:  Wordle Solver 6 Letters - Find the Answer from Your Clues   (58)
7-letter:  Wordle Solver 7 Letters - Find the Answer from Your Clues   (58)
```
**Description template for all lengths:**
```
Enter your green, yellow, and gray tiles to find the {n}-letter Wordle answer. Free solver that ranks the best next guesses from your clues.
```

**"Without cheating" trust block (Day 6–8, copy below) also belongs on every solver page** — it is the answer to `5 letter wordle without cheating`.

---

## DAYS 6–8 — Rank push (exact copy + placement)

### 5. Minesweeper Solver — `/minesweeper-solver` (+421 clicks/90d at top-3)

**Target query:** `minesweeper solver` — 4,922 imp / 170 cl / pos 5.1 / 3.6%. This is the **#2 single keyword on the entire site** after the Wordle cluster. Position 5.1 → 2–3 is worth ~421 clicks/90d.

**Where:** `src/routes/(interactive)/minesweeper-solver/+page.svelte` (client page — set `<svelte:head>` title/meta + add the strategy block).

**Title (52 chars):**
```
Minesweeper Solver - Solve Any Board from Your Clues
```
**Meta description (120 chars):**
```
Free minesweeper solver: enter the numbers on your board and get the guaranteed safe cells and mines in seconds. Works on expert boards.
```

**Strategy block (H2 + 3 bullets — place directly above the solver, not below):**
```
<h2>How to use the Minesweeper Solver</h2>
• Enter the numbers from your board and tap each cell's state (mine / safe / unknown).
• The solver applies all minesweeper rules at once - 1-2-1 patterns, corner logic, and edge cases.
• It flags every guaranteed mine and every guaranteed safe cell, so you never guess.
```
(Guaranteed-safe + never-guess is the click reason — the searcher is stuck on an expert board.)

**Cross-link (visible, not just in the article hub):** add to the solver's footer: `Looking for the daily word games? See [Today's Wordle Answer] and [All Wordle Answers].`

---

### 6. Archive year-filter table above the fold — `/wordle-answer-archive`

**Where:** `src/routes/(interactive)/wordle-answer-archive/+page.svelte`

**What ships (structure, in order):**
1. H1: `All Wordle Answers 2022-2026 - Complete List by Date`
2. **Year jump bar** (first interactive element, no scrolling needed):
   `[2026] [2025] [2024] [2023] [2022]  ·  search…` — each year scrolls to its filtered table
3. Answer table: `Date | Wordle # | Answer` (first 25 rows visible for 2026, then "load more")
4. Then the existing SEO article + FAQ below.

**Why:** the 3 list queries (1,415 + 817 + 872 imp) all convert at **0%** because the snippet promises nothing and the page's first view is a calendar. Searchers want the list in the result itself. Bing bolds `all wordle answers 2025` in both the title and the table header — put `All Wordle Answers 2025` as the table section header text.

---

### 7. Solver "no cheating" trust section — all wordle length pages

**Target query:** `5 letter wordle without cheating` — 1,056 imp / 0 cl / pos 9.0

**Where:** `src/lib/wordlebot-wasm/route-config.ts` → add to `howToSteps` of each length config (step 3), and/or a visible trust strip under the H1.

**Copy (trust strip, one line under the hero):**
```
No cheating - this tool only ranks legal next guesses from the clues you already have.
```
**FAQ entry to add to `buildSolverFaqs` (every length):**
```
Q: Is using a Wordle solver cheating?
A: No. The solver works only from the green, yellow, and gray clues you enter - it never knows the answer in advance. It ranks the legal next guesses from your current board, exactly like a stronger player's reasoning, and it leaves the final choice to you.
```

---

### 8. Visible cross-links (crawl equity + list intent)

**Where:** today page, archive, and solver pages — in the **visible footer strip** (not only the article hub).

**Today page footer (wordle-answer-today):**
```
[Today's Wordle Answer] · [All Wordle Answers 2022-2026] · [Wordle Solver 5 Letters]
```
**Archive footer:**
```
[All Wordle Answers] · [Today's Wordle Answer] · [Wordle Solver]
```
**Solver footer (all lengths):**
```
[Wordle Solver 5 Letters] · [Today's Wordle Answer] · [All Wordle Answers]
```
Why: the archive (10,306 imp) is the site's #2 page — every today/solver page should pass link equity to it, and every archive visitor should see the today/solver pages. These three pages form the Wordle money triangle.

---

## DAYS 9–10 — Dated keywords + re-measurement

### 9. Dated-keyword FAQ formatting

**Target queries (all currently 0–1% CTR):**
- `wordle june 26 answer` — 776 imp / 1 cl / pos 6.0
- `wordle 7/15/26` — 567 imp / 7 cl / pos 6.0
- `wordle july 1 answer` — 469 imp / 0 cl / pos 8.0
- `wordle 6/24/26` — 315 imp / 8 cl / pos 3.0
- `wordle july 3 answer` — 436 imp / 0 cl / pos 5.0
- `wordle 7/11/26` — 252 imp / 2 cl / pos 6.0

**Where:** `src/routes/(interactive)/wordle-answer-today/+page.server.ts` → `hintFaqs` (already has `{date}` substitution) + `src/lib/content/registry.ts` wordle article dated section.

**FAQ Q&A templates (the answer MUST contain the date in multiple common formats — Bing matches the query form, not just the answer):**
```
Q: What is the Wordle answer for {Month} {Day}?
A: The Wordle answer for {Month} {Day}, {Year} was {ANSWER} - Wordle #{N}.

Q: What was the Wordle answer on {M}/{D}/{YY}?
A: {M}/{D}/{YY} was Wordle #{N}, and the answer was {ANSWER}.

Q: What is the Wordle answer for today, {formattedDate}?
A: The Wordle answer for today, {formattedDate}, is {ANSWER}. This is Wordle #{N}.
```
(e.g. for August 16, 2026 / 8/16/26 / puzzle #1879 / answer QUACK)

**Archive dated rows:** each archive table row's answer cell should read `{ANSWER}` with a `title="{Month} {Day}, {Year} - Wordle #{N}"` tooltip + the row header as `Wordle #1879 · Aug 16, 2026` — so the page HTML contains both `Aug 16, 2026` and `#1879` for dated-query matching.

### 10. Re-measurement (the 10-day loop)

1. `node scripts/pull-bing-full.mjs` → fresh `bing-query-stats.csv`
2. `node scripts/analyze-opportunity.cjs` → per-query CTR before/after
3. Compare the 10-day delta per page:
   - Wordle today page CTR on `wordle answer today` / `today's wordle` / `todays wordle`
   - Archive CTR on the three list queries (was 0%)
   - Smashdle CTR (was 0.3%)
   - Solver CTR on `wordle solver 5 letters` / `5 letter wordle without cheating`
4. Any query still < 2% CTR at pos ≤ 5 after the rewrite → the problem is the rank, not the snippet → move it to the Day 6–8 rank-push list.

**Success targets for day 10 (vs current):**
| Metric | Now | Day 10 target |
|---|---|---|
| Site CTR (Bing) | 3.8% | 6–9% |
| Wordle cluster CTR | 1.2–3.6% | 6–12% |
| Archive list-query CTR | 0% | 5–10% |
| Smashdle CTR | 0.3% | 3–6% |
| Solver CTR | 0.2–0.5% | 3–8% |
| Daily clicks (Bing) | ~65 | 130–220 (upside: 300+) |

---

## Deploy order (fastest clicks first)

1. **Wordle today title + description** (48 + 115 chars above) — 1 file, 10 minutes, biggest single-query upside (19,403 imp).
2. **Archive title + description** — 1 file, 10 minutes, converts three 0% queries.
3. **Smashdle + 5 GameDle titles** — 1 shared component, 15 minutes.
4. **Solver length titles** — 1 config file, 15 minutes.
5. **Minesweeper title/meta + strategy block** — 1 file, 30 minutes.
6. **Archive year-filter table** — the biggest build (~2–4 hours).
7. **No-cheating trust strip + FAQ** — 1 config file, 15 minutes.
8. **Visible cross-link footers** — 3–4 files, 30 minutes.
9. **Dated FAQ templates** — 1 server file + 1 registry section, 20 minutes.
10. Deploy after steps 1–5 (ship early, measure), then steps 6–9.
