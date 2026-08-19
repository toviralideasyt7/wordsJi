# WordSolverX Human-Voice Rewrite Playbook (Aug 2026)

Synthesis of `human-wiriting/SKILL.md` + `claude-seo` E-E-A-T framework (Sept 2025 QRG),
built for the Aug 2026 full-registry rewrite. Every rewritten article MUST follow this.

## Why we're rewriting (audit findings, 2026-08-19)

- All 74 registry articles measure ≥1,500 words and have unique H2s — the *shell* is fine.
- The fatal flaw is **voice**: 1,500+ words of third-person instructional prose with 0–4
  first-person words. That is the #1 marker of scaled/AI content per the Sept 2025 QRG
  ("no first-hand experience signals", "repetitive structure", "generic phrasing").
- 28/74 articles contain literal AI-isms: "this guide covers", "in conclusion", "unlock",
  "separates X from Y", "the good news is".
- Google: only homepage indexed, everything else "Crawled – currently not indexed".
  Diagnosis (GSC-verified, see `wordsolverx-google-indexing-issues-2026-08-15.md`):
  quality/trust classifier rejecting scaled-content patterns. Voice + experience
  signals are the levers we control.

## The 8 rewrite rules

### 1. First person, actually lived
The editor (Preston Hayes) has played every game on this site daily for months.
Write as him. "I", "my", "I've lost streaks to this", "the mistake I made for weeks".
Target density: a first-person construction at least every 150–200 words (8–15+ per
article), woven into arguments — not bolted on.

Allowed experience material (modest, plausible, non-verifiable-invented):
- streaks lost/saved, panic guesses, the word/board that burned you
- habits formed ("I open with the same word every day; here's why")
- tool-building experience ("building the solver taught me X about the word list")
- time-of-day / routine details ("I solve at breakfast, badly")
NEVER invent: named third parties, quotes, fake studies, fake statistics, fake dates
of public events, fake version histories.

### 2. Kill the AI-isms (hard ban list)
Ban forever, site-wide: "this guide covers", "this article covers", "in this guide,
we'll", "let's dive", "whether you're a beginner or", "it's important to note",
"the key takeaway", "look no further", "elevate", "take your X to the next level",
"a comprehensive guide", "everything you need to know", "in conclusion",
"at the end of the day", "the good news is", "the bottom line", "game-changer",
"treasure trove", "delve", "unlock", "seamless", "robust", "myriad", "testament to",
"in the world of", "when it comes to", "happy solving", "separates X from Y",
"the X that separates Y from Z", em-dash-per-sentence cadence, rule-of-three abuse
("fast, fun, and free").

### 3. Vary the skeleton
Previous pass made H2s unique — but the *rhythm* is still identical (intro → "why this
game punishes X" → list → callout → FAQ). Break it per article:
- some articles open with a losing story, some with a hard opinion, some with the
  direct answer pattern, one with a question the reader is asking
- section lengths must be uneven (one 4-paragraph section, one single-paragraph
  punchy one, one with a list, one with a callout — different order every time)
- not every article gets callouts; not every article gets lists; ≥1 of each per
  article is NOT required
- paragraph lengths uneven: 1-sentence paragraphs are allowed and encouraged

### 4. Keep facts, cut filler
- Every game-mechanics fact in the current articles is accurate (written against the
  solver implementations). PRESERVE all mechanics facts exactly.
- Cut (or rewrite into lived advice): generic essays on "why puzzles matter",
  restatements of the obvious, sections that exist only to hit word count.
- If a section adds nothing a player would repeat to a friend, delete it and
  replace with something only a daily player would know.
- ≥1,500 words is a floor for coverage, NOT a target to pad toward. Land 1,550–1,850
  naturally; if content runs long because it's genuinely useful, fine.

### 5. Template variables are sacred
Sections containing `{date}`, `{answer}`, `{number}`, `{dayNum}`, `{hex}` etc. target
Bing dated queries and must keep the same variables with the same meaning. Keep those
sections (usually the last body section + 1–2 FAQs), but rewrite their prose to human
voice while keeping every variable token intact and correctly used.

### 6. Keywords: natural coverage, no stuffing
Each article has Bing-impression keywords to cover (see `tmp-rewrites/keywords.md`).
Cover them the way a person explains: primary phrase early + in one H2 or FAQ,
variants sprinkled where they'd honestly appear. Never force; never repeat a phrase
that reads wrong aloud.

### 7. E-E-A-T trust markers in-text
- Where a claim is checkable ("the answer above is confirmed from the official
  source"), say how it's verified — plainly, once, not as a boilerplate paragraph.
- Occasional honest limitation ("this won't help on hard mode boards below two
  greens") beats universal claims.
- No fake urgency, no "updated for 2026!" unless the content truly is.

### 8. FAQ answers in voice
Rewrite FAQ answers as if answering a friend: direct answer first sentence, one
specific detail, no marketing. Keep FAQ JSON-LD schema output identical in shape.

## Mechanical requirements (validated by script)

1. Word count ≥ 1,500 (measured on string literals).
2. Zero banned phrases (regex-checked).
3. First-person constructions ≥ 8.
4. All template variables preserved (set-equal to original).
5. H2 headings remain globally unique across the registry.
6. TypeScript compiles (`npm run check` 0 errors).
7. Keyword coverage: primary Bing keyword present in intro or first section.
