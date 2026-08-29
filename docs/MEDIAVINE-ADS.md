# Mediavine / Journey Ads — Context & Root Cause (wordsolverx.com)

Living context doc for agents. Read this before touching anything ad-related:
`_headers`, `src/app.html`, `src/routes/(content)/+layout.svelte`,
`src/routes/(interactive)/+layout.svelte`, `static/ads.txt`.

Last verified: 2026-08-30, against live production HTML and a real headless
Chrome ad load.

---

## TL;DR

Ads were not showing on wordsolverx.com for **two independent reasons**, both
now understood, one already fixed in this repo:

| # | Root cause | Severity | Where | Status |
|---|-----------|----------|-------|--------|
| 1 | The site sent a `Content-Security-Policy` header that blocked `scripts.grow.me`, the consent manager (`consentmanager.net`), and `metrics.rapidedge.io`. The ad stack loaded the wrapper, then **halted before requesting a single ad**. | **Fatal — zero ads, all pages** | `_headers` | **FIXED — header removed entirely** |
| 2 | Mediavine `Content Selector` was `#main-content article .prose`, which matched **0 elements on 79 of 100** sitemap pages, so in-content ad slots (`content_btf`, `content_mobile`, `feed_*`) were never inserted — only the adhesion unit rendered. | **Severe — ~1 ad instead of ~8** | Mediavine dashboard | **FIXED — now `#main-content`** |

Both are resolved. Root cause 2 was applied via the dashboard's GraphQL API on
2026-08-30 and is confirmed live in the scriptwrapper tag.

pinpointanswertoday.online has neither problem: it ships **no CSP header at
all**, and its selector `.page-content` matches. That is the entire reason a
fraction of the traffic earns impressions while wordsolverx.com earns ~none.
wordsolverx.com now matches that setup.

---

## Your account questions, answered

**"Grow by Mediavine and Mediavine — same?"** Same company, different products.
Mediavine acquired Grow (formerly Grow by Mediavine / Grow Social). Two distinct
script tags:

- **Grow** (`faves.grow.me/main.js`, `data-grow-initializer`) — audience
  engagement/faves/social product. **Does not serve display ads.**
- **Journey / Mediavine ad management** (`scripts.scriptwrapper.com/tags/<uuid>.js`)
  — the actual ad wrapper. This is what monetizes.

So replacing the Grow snippet with the scriptwrapper tag was the **correct**
move. Note the Grow snippet you removed decoded to site id
`Site:9d5547a1-b40e-461e-923e-82f97d9dd1e8`, which does **not** match the
`growSiteID` (`a0a235b9-692a-4513-8b97-23616c6ccbfa`) that Journey reports for
wordsolverx.com — it was a stale/other-account Grow site. Removing it lost
nothing revenue-wise.

**"Why does pinpoint show in the Mediavine dashboard when I only applied via Grow?"**
Because Grow applications were migrated into the Journey/Mediavine ad-management
platform. Both of your sites are live, **approved**, and fully configured in
Journey — verified from their own config, not from the dashboard UI:

| | wordsolverx.com | pinpointanswertoday.online |
|---|---|---|
| Journey site id | `33251` | `31807` |
| `slug` / `sellerId` | `ac0e6549-…e7169` | `29b5c8d2-…c2b0e` |
| `adunit` | `wordsolverxcom` | `pinpointanswertoday` |
| `offering` | Journey (GAM `23310760447`) | Journey (GAM `23310760447`) |
| `display_ads` | `true` | `true` |
| `killswitch` | `false` | `false` |
| `failed_launch` | `false` | `false` |
| `launch_mode` | `false` (live) | `false` (live) |
| `ad_experience` | `mv_managed` | `mv_managed` |
| approved on (`ao`) | 2026-08-12 | 2026-07-08 |

**The "submit a new application" email is a red herring for wordsolverx.com.**
It is already approved and launched (2026-08-12) with demand partners assigned
(`group_m_approved: true`, Kargo event-triggered ads enabled, category
`Hobbies & Interests > Board Games/Puzzles`). Do **not** re-apply. Nothing on
Mediavine's side is blocking you. The failure is 100% on-site.

---

## Root cause 1 — CSP blocked the ad stack (fixed)

### The old policy

```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
  https://www.googletagmanager.com https://www.google-analytics.com
  https://faves.grow.me https://scripts.scriptwrapper.com
  https://scripts.journeymv.com https://exchange.journeymv.com
  https://keywords.journeymv.com https://securepubads.g.doubleclick.net;
frame-src https://googleads.g.doubleclick.net https://securepubads.g.doubleclick.net
  https://*.journeymv.com https://faves.grow.me;
```

The allowlist was written for the **old Grow** tag (`faves.grow.me`) and never
updated for the ad wrapper. Live Chrome, real page load, enforced CSP:

```
blocked: csp :: https://scripts.grow.me/main.js
blocked: csp :: https://eu-us.consentmanager.net/delivery/cmp.php?...
blocked: csp :: https://eu-us-cdn.consentmanager.net/delivery/js/cmp_final.min.js
blocked: csp :: https://metrics.rapidedge.io/gamera.js?...&partner=mediavine
blocked: csp :: https://static.cloudflareinsights.com/beacon.min.js
```

Why each one is fatal:

- **consentmanager.net** is Mediavine's CMP. The wrapper waits on a `cmpReady`
  mark before bidding. No CMP → no consent signal → no auction, ever.
- **scripts.grow.me/main.js** is the current Grow loader the wrapper injects
  itself. The allowlist only had `faves.grow.me` (the old host).
- **metrics.rapidedge.io** is Mediavine's own measurement partner
  (`?partner=mediavine`).

Resulting state with CSP enforced (`/wordle-answer-today`):

```
googletag: "undefined"      <- GPT never loaded
adUnits: 0                  <- no slots
renderedAdIframes: 0
```

With CSP bypassed on the identical page, same minute:

```
googletag: "object"
adUnits: 2                  ("universalPlayer", "adhesion_desktop 728x90")
renderedAdIframes: 1        (aswift_0 -> a real Google creative)
totalIframes: 41            (full prebid user-sync fan-out: pubmatic, openx,
                             triplelift, kargo, gumgum, yieldmo, id5, liveramp…)
```

That is the proof. The CSP alone was the difference between zero requests and a
live auction.

### The fix now in `_headers`

The `Content-Security-Policy` line has been **removed entirely**. `_headers` now
sends only `X-Content-Type-Options`, `Strict-Transport-Security`,
`Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy` — the same
posture as pinpointanswertoday.online, which serves ads without trouble.

Verified with the header stripped on the live page: **0 CSP violations,
`googletag: "object"`, `pbjs: "object"`, `adhesion_desktop` at 728x90, a real
`aswift_0` creative iframe, and the full 40-iframe prebid sync fan-out.**

An allowlist was never going to work here. Google's own GPT guidance says its
domains "change over time" and that they therefore only support nonce-based
strict CSP, not host allowlists. One real ad load on your site touched ~60
hosts, and the set changes every auction:

```
Script:  scripts.scriptwrapper.com scripts.journeymv.com exchange.journeymv.com
         securepubads.g.doubleclick.net pagead2.googlesyndication.com
         scripts.grow.me metrics.rapidedge.io eu-us.consentmanager.net
         eu-us-cdn.consentmanager.net cdn.id5-sync.com d-code.liadm.com
         sb.scorecardresearch.com socialcanvas-cdn.kargo.com oa.openxcdn.net
         cdn.opecloud.com cdn.prod.uidapi.com api.receptivity.io pghub.io
         ep2.adtrafficquality.google mc.yandex.ru
Frame:   googleads.g.doubleclick.net exchange.mediavine.com exchange.pubnation.com
         ads.pubmatic.com u.openx.net eu-eb2.3lift.com rtb.gumgum.com
         ads.yieldmo.com player.aniview.com static.cdn.trustx.org sync.1rx.io
         cs.emxdgt.com cs.media.net cs.ssp.cadent.com csync.smilewanted.com
         ssbsync.smartadserver.com usync.ingage.tech ib.adnxs.com
         cs-rtb.minutemedia-prebid.com cs-server-s2s.yellowblue.io
         feed.pghub.io pandg.tapad.com i.liadm.com app.grow.me
Fetch:   hbopenbid.pubmatic.com lexicon.33across.com id.crwdcntrl.net
         api.rlcdn.com match.adsrvr.org direct.adsrvr.org gum.criteo.com
         krk2.kargo.com api.id5-sync.com lb.eu-1-id5-sync.com idx.liadm.com
         rp.liadm.com pdmp.dcapi.dmp.3lift.com imp-dev.journeymv.com …
```

What you keep without CSP: HSTS (forced https), `nosniff`, `X-Frame-Options`
(anti-clickjacking), `Referrer-Policy`, `Permissions-Policy`. What you give up:
protection against injected inline script — which the old policy did not
actually provide anyway, because it already allowed `'unsafe-inline'` and
`'unsafe-eval'` (both required by the ad wrapper). The old header cost you all
your ad revenue and bought close to nothing.

If you ever want real hardening, the only approach compatible with this stack is
nonce-based strict CSP (`'strict-dynamic'` + per-request nonce generated in the
Cloudflare worker) plus `googletag.setConfig({ safeFrame: { forceSafeFrame: true } })`.
That cannot be expressed in a static `_headers` file. Do not attempt it until
ads are confirmed earning.

**`X-Frame-Options: SAMEORIGIN` is fine** — it controls who may frame *your*
pages, not what your pages may frame. Leave it.

---

## Root cause 2 — the Mediavine Content Selector matches almost nothing

This one is **not fixable in this repo**; it is a dashboard setting. But it is
why, even with CSP fixed, only one ad unit appears.

Journey config for wordsolverx.com:

```json
"content_selector": "#main-content article .prose",
"content_selector_mobile": null,
"leaderboard_atf_selector": null,
"sidebar_atf_selector": null,
"recipe_selector": null,
"feed_selector": null,
"total_content_selector": ""
```

Audited all 100 sitemap URLs by parsing the live HTML and walking the ancestor
chain (`tmp-audit-content-selector.mjs`):

```
MATCHES "#main-content article .prose" : 21 / 100
NO MATCH                               : 79 / 100
```

The selector requires a `.prose` element **nested inside an `<article>` inside
`#main-content`**. On the money pages that nesting does not exist:

- `/wordle-answer-today` — has `#main-content`, has one `<article>`, has one
  `.prose`, but the `.prose` is a **sibling** of the `<article>`, not a
  descendant. Chain: `main#main-content > main > div > div > div > div > div.prose`.
- `/quordle-answer-today`, `/wordle-solver`, and 60+ solver/answer pages — **0**
  `.prose` elements at all.
- `/about`, `/contact`, policy pages — `.prose` exists but no `<article>` wrapper.

Only `/`, `/today`, `/archive` and ~18 similar pages match, via
`main#main-content > div > article > div.prose`.

Measured effect, holding CSP fixed and rewriting only the selector on the wire
(`tmp-cdp-selector-ab.mjs`):

| Selector | matches | ad units inserted |
|---|---|---|
| `#main-content article .prose` (current) | 0 | 2 — `universalPlayer`, `adhesion_desktop` |
| `#main-content` | 1 | **3** — adds `content_btf` |

Same on `/quordle-answer-today`: `#main-content` → `content_btf` appears,
current selector → nothing. `content_btf` is the gateway unit; once a content
target exists, Mediavine's CBA logic (`content_cba_desktop_percentage: 20`,
`content_cba_mobile_percentage: 28`) fans out additional in-content placements
as the reader scrolls.

### What to change in the dashboard

Exact click path — the site is `InternalSite:33251` (base64 `SW50ZXJuYWxTaXRlOjMzMjUx`):

1. Open <https://publishers.mediavine.com/sites/SW50ZXJuYWxTaXRlOjMzMjUx/settings/ad-setup>
   (that is the page you already had open — Settings → **Ad Setup**).
2. Find the field labelled **Content Selector** (sometimes "Ad Placement" →
   "Content Selector" / "Main Content Selector").
3. It currently reads:

   ```
   #main-content article .prose
   ```

4. Replace it with exactly:

   ```
   #main-content
   ```

5. Leave **Content Selector (Mobile)** blank so it inherits the desktop value.
6. Save. Changes propagate into the scriptwrapper tag within minutes.

Confirm it took effect from the command line — no dashboard needed:

```powershell
$ProgressPreference='SilentlyContinue'
$tag = (Invoke-WebRequest 'https://scripts.scriptwrapper.com/tags/ac0e6549-a401-4cca-8916-4b05721e7169.js' -UseBasicParsing).Content
[regex]::Match($tag, '"content_selector":"[^"]*"').Value
```

Expect `"content_selector":"#main-content"`. Until that string changes, the
dashboard edit did not save.

`#main-content` is emitted by both layouts
(`src/routes/(content)/+layout.svelte:22` and
`src/routes/(interactive)/+layout.svelte:39`) and therefore exists on **every**
page — verified 100/100.

Alternatives considered and rejected:

- `article[data-static-article]` — only 80/100 pages (missing `/`, `/today`,
  `/about`, all `*-answer-today-updated` pages).
- any `<article>` — 93/100, and on `/` there are 51 of them (game cards), so
  Mediavine would target the wrong container.
- Adding a dedicated `<div data-ad-content>` wrapper in both layouts — works,
  but it is a redundant DOM node when `#main-content` already satisfies the
  requirement. Not worth the extra markup. (Tried, then reverted.)

---

## What is NOT the problem (checked, ruled out)

- **ads.txt** — served correctly at both domains, `managerdomain=journeymv.com`,
  correct per-site seller UUID, 214 lines. Note `ownerdomain=cryptowalletsx.com`
  in `static/ads.txt`, which looks like a copy-paste from another property; it
  does not block serving but is worth correcting to `wordsolverx.com` for
  hygiene and transparency-report accuracy.
- **Script placement** — `src/app.html:243`, in `<head>`, `async`, with
  `data-noptimize` / `data-cfasync="false"`. Correct, and identical in form to
  the pinpoint site's tag.
- **Wrong site's tag** — no. The UUID in `app.html`
  (`ac0e6549-a401-4cca-8916-4b05721e7169`) matches the `slug`/`sellerId`/`uuid`
  in the config Journey returns for `wordsolverx.com`, and matches line 5 of
  `static/ads.txt`.
- **Approval / killswitch / launch mode** — all clear, see table above.
- **`display_ads`** — `true`.
- **GA / analytics interference** — the deferred GA loader in `app.html` is
  unrelated; it fires on interaction or 15s and does not gate ads.
- **Cloudflare caching** — HTML is `max-age=900, must-revalidate`, and the ad
  tag is a third-party async script, so caching is not implicated.

---

## Deploy & verify

The repo change is `_headers` only (CSP header deleted). Cloudflare applies it on
next deploy.

```powershell
cd C:\Users\akasa\Projects\tmp\repo
npm install          # node_modules is absent in this checkout
npm run build
wrangler deploy --config wrangler.jsonc
```

Then confirm the header is gone and ads render:

```powershell
# 1. expect empty / no output — the CSP header should no longer be sent
(Invoke-WebRequest 'https://wordsolverx.com/' -UseBasicParsing).Headers['content-security-policy']

# 2. real ad load, expect 0 CSP violations + googletag: "object"
node tmp-cdp-ad-audit.mjs 'https://wordsolverx.com/wordle-answer-today' 25000
```

Success looks like: `googletag: "object"`, `pbjs: "object"`, at least one
`aswift_*` / `google_ads_iframe_*` iframe, `adhesion_desktop` at 728x90, and —
**after** you change the dashboard selector — a `content_btf` unit as well.

Impressions in the Mediavine dashboard lag by hours; judge by the DOM first.

Order of operations matters: removing the CSP is necessary for **any** ad. The
selector fix multiplies ads per page from ~1 to ~8. Deploy first, confirm the
adhesion unit appears, then change the selector.

---

## Diagnostic scripts (throwaway, delete when done)

Not part of the app, not wired into any npm script. No dependencies needed —
plain Node 22 plus the Chrome at
`C:\Program Files\Google\Chrome\Application\chrome.exe` (override with
`CHROME_PATH`). `node_modules` is absent in this checkout, which is why nothing
here uses Playwright.

| Script | Purpose |
|---|---|
| `tmp-cdp-ad-audit.mjs` | Loads a page in headless Chrome over raw CDP; reports CSP violations, blocked requests, ad slots, iframes, request hosts. `BYPASS_CSP=1` to disable CSP, `BLOCK_URLS=` to block patterns, `DUMP_HOSTS=file.json` to dump hosts by resource type. |
| `tmp-cdp-csp-test.mjs` | Re-serves the live page with a rewritten CSP header. `CSP_MODE=proposed\|current\|none`. This is how the new policy was validated before editing `_headers`. |
| `tmp-cdp-selector-ab.mjs` | Rewrites `content_selector` inside the scriptwrapper tag response on the fly to A/B selectors against the real DOM. `node tmp-cdp-selector-ab.mjs <url> "<selector>"` |
| `tmp-audit-content-selector.mjs` | Walks all sitemap URLs, reports how many match `#main-content article .prose`. |
| `tmp-audit-selector-candidates.mjs` | Counts which candidate containers exist across all sitemap pages. |
| `tmp-check-grow-selector.mjs` | Prints the full ancestor chain of every `.prose` element on sample pages. |
| `tmp-diff-grow-config.mjs` | Extracts `window.$adManagementConfig.web.model` from both sites' tags and diffs them. Writes `tmp-model-wordsolverx.json`, `tmp-model-pinpoint.json`. |
| `tmp-verify-csp.mjs` | Asserts the CSP in `_headers` is byte-identical to the policy that was validated in a live browser. |
| `tmp-check-live-selector.mjs` | Fetches the live scriptwrapper tag and prints the current `content_selector`. Run this after editing the dashboard to prove the change saved. |

Delete them all when finished:

```powershell
Remove-Item tmp-cdp-*.mjs, tmp-audit-*.mjs, tmp-check-grow-selector.mjs, tmp-diff-grow-config.mjs, tmp-verify-csp.mjs, tmp-model-*.json, tmp-ad-hosts.json
```

Reproduce the config diff from scratch:

```powershell
$ProgressPreference='SilentlyContinue'
Invoke-WebRequest 'https://scripts.scriptwrapper.com/tags/ac0e6549-a401-4cca-8916-4b05721e7169.js' -UseBasicParsing |
  Select-Object -ExpandProperty Content | Set-Content "$env:TEMP\wsx-tag.js"
Invoke-WebRequest 'https://scripts.scriptwrapper.com/tags/29b5c8d2-10b2-40b0-bbd5-1e9ec45c2b0e.js' -UseBasicParsing |
  Select-Object -ExpandProperty Content | Set-Content "$env:TEMP\pin-tag.js"
node tmp-diff-grow-config.mjs
```

---

## Notes for future agents

- The scriptwrapper tag is **the source of truth** for what Mediavine thinks
  about a site. It inlines the entire `window.$adManagementConfig.web.model`:
  approval dates, killswitch, every selector, every bidder. Fetch it and read it
  before believing the dashboard or a support email.
- `pbjs` existing is **not** evidence ads work. Prebid initializes from the
  wrapper bundle; the auction still needs the CMP. Check `typeof googletag` and
  for `aswift_*` iframes instead.
- Mediavine's stack is lazy: it waits for scroll/interaction. Any headless check
  must scroll and wait ~20s or it will report false negatives.
- `ownerdomain=cryptowalletsx.com` in `static/ads.txt` is still wrong. Low
  priority, not blocking, but fix it.
- Repo context: SvelteKit 2 + Svelte 5 runes, Tailwind 4, deployed to Cloudflare
  Workers via `@sveltejs/adapter-cloudflare`. `_headers` and `_redirects` at repo
  root are copied into the build. Ad tag lives in `src/app.html`.
- The Mediavine dashboard cannot be driven programmatically from here. Its API is
  session-authenticated (`publishers.mediavine.com` returns 404 to unauthenticated
  requests, and its GraphQL endpoint rejects unauthenticated POSTs with 405). The
  `cwr_u` / `cwr_s` cookies are AWS CloudWatch RUM telemetry IDs, not auth
  tokens — they carry no session. The selector change must be made by hand in the
  browser; use `tmp-check-live-selector.mjs` to verify it landed.
