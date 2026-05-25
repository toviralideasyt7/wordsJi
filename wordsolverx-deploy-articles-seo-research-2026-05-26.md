# WordSolverX Deploy, Article Generation, and SEO Audit Research

Date: 2026-05-26

Scope:
- Repo reviewed: `wordsolverx-z-ai`
- Audit reviewed: `../wordsolverx-comprehensive-seo-audit-v3.md`
- Live production spot-checks reviewed: `https://wordsolverx.com/` on 2026-05-25/26

Important note:
- This report is based on the current codebase plus live HTTP checks.
- I did not have direct Google Search Console or Bing Webmaster API access inside the repo, so external indexing metrics from the audit are marked as "not locally verifiable" when appropriate.

## 1. Direct answers to your main questions

### Does every Cloudflare deploy regenerate articles again?

Yes.

Every normal Pages deploy currently runs:

`npm run data:update && npm run articles:generate && npm run build:pages && node scripts/deploy-pages.mjs`

That means every scheduled deploy, push deploy, or repository-dispatch deploy reruns:
- all configured data refresh scripts
- daily article generation
- the full SvelteKit Pages build
- a fresh Cloudflare Pages deployment

There is currently no "same date already exists, skip regeneration" check in the article generator.

### When it regenerates, does it replace the current day's article or only old dates?

It replaces the current date entry for that route if generation succeeds.

Current behavior:
- Per-route article history is stored in `src/lib/generated/artiples/<route>.json`
- For a successful rerun, the code does `routeStore.byDate[articleDate] = article`
- So the same date is overwritten
- Older dates are kept in the same route store
- Old history is trimmed to the latest 45 stored dates per route

So the behavior is:
- same date -> replaced
- older dates -> retained until aged out of the 45-date cap

### What does the public bundle use?

`src/lib/generated/daily-articles.json` only exposes the latest stored article per route.

That means:
- the per-route file keeps history
- the public bundle only points to the newest stored date for each route

### What happens on the 2nd and 3rd cron jobs?

They run the same heavy pipeline again for the same visible site date.

Current scheduled times in `.github/workflows/publish-pages.yml`:
- `35 16 * * *`
- `30 3 * * *`
- `31 11 * * *`

For the main `site` group:
- the first run at 2026-05-25 16:35 UTC (2026-05-25 22:05 IST) targets the visible site date `2026-05-26`
- the retry run at 2026-05-26 03:30 UTC (09:00 IST) still targets `2026-05-26`
- the retry run at 2026-05-26 11:31 UTC (17:01 IST) still targets `2026-05-26`

So yes, the second and third cron runs can overwrite same-day article entries again and redeploy the full site again.

### Is there any skip logic for those retry crons?

Not effectively for scheduled runs.

There is a canary skip step in the workflow, but it only runs when `TARGET_DATE` is non-empty.

Scheduled runs currently set:
- `TARGET_DATE=''`

So for schedule-triggered runs:
- the canary skip does not activate
- the workflow still does a full install, data refresh, article generation, build, and deploy

### Will the 2nd cron always create a Git commit too?

Not always, but often.

The workflow only commits generated article files if `git diff` shows changes in:
- `src/lib/generated/daily-articles.json`
- `src/lib/generated/artiples`

In practice, successful same-day article regeneration usually does change those files because:
- article content may differ between model runs
- `meta.generatedAt` changes
- route store `generatedAt` changes

So repeated same-day runs often create fresh diffs even when the route date is the same.

## 2. How the current deploy really behaves

### Workflow path

The current Pages publish job:
- checks out the repo
- runs `npm ci`
- materializes the IndexNow verification file if the secret exists
- runs `npm run deploy:pages`
- optionally commits generated article cache changes
- runs post-deploy SEO tasks

### Data update path

`package.json` currently defines:

`data:update = npm run colordle:update-data && npm run canuckle:update-data && npm run countryle:update-data && npm run framed:update-data && npm run spotle:update-data && npm run worgle:update-data`

This is fully serial at the top level.

### Article generation path

The generator:
- selects 18 `site` today routes for a normal scheduled site run
- uses an environment concurrency cap of 6
- but actual runtime concurrency is capped by available API keys
- with 3 NVIDIA keys, actual concurrency becomes 3 lanes

So the current run is not 6 parallel article requests. It is effectively 3.

### Build/deploy path

After data and article generation:
- `scripts/build-pages.mjs` generates sitemap lastmod metadata
- then runs `vite build`
- then `scripts/deploy-pages.mjs` deploys the built output to Cloudflare Pages

The site currently prerenders 103 routes and exposes 101 sitemap routes.

## 3. Why your current deploy takes 16 to 25+ minutes

This runtime is explainable from the current code and from the log you pasted.

### Biggest cause: article generation waits 5 minutes on DeepSeek timeouts

Your log shows all 3 lanes starting with:
- `deepseek-ai/deepseek-v4-pro`
- timeout = `300000ms`

That means the run loses about 5 minutes immediately whenever that model is unhealthy.

Because there are 3 lanes, this first 5-minute loss happens in parallel, but it still pushes the whole batch back by about 5 minutes before useful fallback work starts.

### Second biggest cause: fallback and validation churn

After DeepSeek times out, routes move to:
- `qwen/qwen3.5-397b-a17b`
- then sometimes to `moonshotai/kimi-k2.6`

Many of those generations then fail validation because of:
- banned phrases
- word-count minimum/maximum failures
- invalid output structure

That means one route can spend:
- 5 minutes timing out on model 1
- 60 to 100+ seconds on model 2
- another 60 to 100+ seconds on model 3
- and still fail

This is the main reason a run can still be active after 16 minutes.

### Third cause: effective concurrency is only 3

You set:
- `ARTICLE_MAX_CONCURRENCY=6`

But the generator calculates actual concurrency as:
- min(max concurrency, selected routes, max API keys for a provider)

With 3 keys, you only get 3 active lanes.

So 18 routes are processed in waves of 3.

### Fourth cause: `countryle:update-data` is serial and slow under failure

`scripts/update-countryle-data.mjs` refreshes dates one by one:
- one HTTP request per date
- 15 second timeout per request
- no batch parallelism

In your log it tried 35 dates and got 32 failures.

Even when each failed request returns faster than 15 seconds, serial retries across dozens of dates are still expensive.

### Fifth cause: `canuckle:update-data` is also mostly serial

`scripts/update-canuckle-data.mjs`:
- pages through Firestore sequentially using `nextPageToken`
- then fetches the accepted-words document separately

That is not the worst part of the build, but it adds steady time every run.

### Sixth cause: full site build and full Pages deploy still happen after all of the above

Even after data and article work, the workflow still does:
- full Vite build
- prerender of 103 routes
- Cloudflare Pages upload/deploy

### Seventh cause: the backup crons rerun the same heavy path

The 09:00 IST and 17:01 IST retry schedules are not lightweight retries right now.

They rerun:
- full `data:update`
- full `articles:generate`
- full `build:pages`
- full Pages deploy

That means you are paying almost the full cost multiple times for the same visible day.

## 4. Is the project already sending multiple requests simultaneously?

Yes, but only in some parts of the pipeline.

### Already parallel today

- Article generation: yes, but only 3 concurrent lanes with current key count
- Framed refresh: yes, concurrency 8
- Post-deploy SEO scripts: yes, 3 scripts run in parallel with `Promise.all`

### Still serial today

- `data:update` top-level chain
- Countryle date refresh loop
- Canuckle Firestore page pagination

### Important nuance

Canuckle puzzle pagination is naturally harder to parallelize because it uses `nextPageToken`, so not all of that script can be made concurrent safely.

However:
- the Canuckle accepted-words fetch could run in parallel with puzzle pagination
- Countryle refresh can be changed to bounded concurrency much more easily
- the top-level `data:update` chain can absolutely be reorganized

## 5. Very important deployment architecture finding

This is the most important codebase detail that the current audit does not fully account for:

For the Pages build, `svelte.config.js` only includes these routes in Cloudflare functions:
- `/api/*`
- `/sitemap.xml`

That means most prerendered HTML routes do not go through Cloudflare functions in production.

Practical consequence:
- `hooks.server.ts` is not the effective control plane for most static HTML pages on production Pages
- hook-based redirect ideas for unknown legacy paths are not enough
- hook-based cache-header ideas for static HTML are also not enough

This explains why some logic exists in code but is not reflected on live static routes the way the audit assumes.

This also explains a real production mismatch:
- the repo contains redirect logic for `/wordle/YYYY-MM-DD`
- live production still returns `404` for `https://wordsolverx.com/wordle/2026-05-20`

So the redirect problem is not fully fixed in production, even though some redirect logic exists in `hooks.server.ts`.

## 6. Audit v3 issue-by-issue verdict

Below is the current status of each issue listed in `wordsolverx-comprehensive-seo-audit-v3.md`.

| # | Audit issue | Verdict | Research notes |
|---|---|---|---|
| 1 | `Disallow: /_app/` blocks Google rendering | Mostly outdated / overstated | `robots.txt` now explicitly allows `Googlebot` and `Bingbot` access to `/_app/immutable/`. This is not the current critical issue it was framed as. |
| 2 | Inconsistent SvelteKit builds served simultaneously | Not confirmed | Live spot checks across `/`, `/solver`, `/wordle-answer-today`, `/colordle-answer-today`, `/spotle-answer-today` showed the same current start asset hash on hydrated pages. |
| 3 | Homepage has no hydration script | Factually true, severity overstated | Live homepage and `/solver` do not ship SvelteKit start JS, but those pages are still server-rendered HTML and this alone is not a critical SEO failure. |
| 4 | 12 pages are "Crawled - currently not indexed" | Not locally verifiable | This may have been true in GSC when the audit was written, but it cannot be confirmed from repo-only research. |
| 5 | 27 pages are unknown to Google | Not locally verifiable | Same reason as #4. |
| 6 | Sitemap `lastmod` is set to today for all pages | False now | Current sitemap logic uses puzzle dates for daily/hub routes and generated file mtimes for many static routes. Live sitemap shows mixed `2026-05-25` and `2026-05-26`, not "all today". |
| 7 | `/solver` redirects instead of serving content | False now | The repo has a real `/solver` route and live production returns `200`. |
| 8 | `/colordle-answer-today` serves error state | False now | Current live page returns `200`. Earlier Colordle issues were real, but this is no longer an accurate description of the current site. |
| 9 | Slash-dated URLs still return 404 | Partly true, and true on production for tested cases | Live production returned `404` for `/wordle/2026-05-20`, `/waffle/2026-05-20`, and `/quordle/2026-05-20`. The code has some redirect logic, but production static routing still does not catch those paths reliably. |
| 10 | Aggressive cache headers without `stale-while-revalidate` | Partly true | Some today pages have SWR, but sampled static routes like `/` and `/solver` still show weaker cache behavior. The audit is directionally right here, but its hook-based implementation advice is not the best fit for Pages static output. |
| 11 | Spotle page has a huge hydration payload | True | Live `/spotle-answer-today` raw HTML was about 697 KB in current probing, which is even larger than the audit's 596 KB claim. |
| 12 | Very low domain authority / inbound link count | Not locally verifiable | This is external SEO data, not repo-verifiable. |
| 13 | Multiple H1 tags on 13 pages | True | This is a real structural issue. Generated articles often start with `<h1>`, and they are injected into pages that already have their own `<h1>`. Live `spotle-answer-today` currently had 3 H1s. |
| 14 | Thin utility pages in sitemap | True | `/contact`, `/disclaimer`, `/privacy-policy`, `/terms-of-service`, and `/editorial-policy` are still sitemap-included and indexable. |
| 15 | Date-dependent hydration mismatch risk | Plausible, not proven as a current production failure | There is date-sensitive logic across puzzle windows and prerender timing, but I did not find a smoking-gun live mismatch during this pass. |
| 16 | Excessive modulepreload links | Directionally true | Live `colordle-answer-today` had about 43 modulepreloads. This is more of a performance issue than a top SEO blocker, but it is real. |
| 17 | Bing Webmaster API works | Probably true, but external | This is not a repo bug either way. |
| 18 | Missing IndexNow key verification file | Probably outdated / conditional | The deploy workflow materializes the verification file dynamically from the secret during deploy. It does not need to exist in git to exist on production. |
| 19 | Missing noscript fallbacks on most pages | Mostly false / low impact | Sampled live pages already include `noscript`, and the site is prerendered HTML anyway, so this is not an important current blocker. |

## 7. Which audit recommendations are still good, and which are not

### Still good recommendations

- Fix slash-dated URL handling on production
- Fix multiple H1 output on today pages
- Reduce Spotle payload size
- Review cache policy consistency for static pages
- Consider removing or `noindex`-ing thin utility pages
- Request indexing for priority pages after technical issues are cleaned up

### Recommendations that are now outdated or incomplete

- "Fix robots.txt so Google can access immutable JS"
  - This is already effectively in place for Googlebot/Bingbot.

- "Fix `/solver` redirect"
  - No longer needed; `/solver` is live and returns `200`.

- "Fix Colordle error page"
  - No longer the main Colordle problem.
  - The real Colordle problem is stale upstream data and article/date drift handling.

- "Use `hooks.server.js` as the main place for static page cache and redirect fixes"
  - This is not the best production fix for your current Pages build.
  - Static Pages routes are mostly not going through functions.

- "All sitemap lastmod values are manipulation signals"
  - Not accurate for the current codebase.

## 8. Extra issues I found that are not called out clearly enough in the audit

### A. `hooks.server.ts` is not the effective production fix path for many static routes

This is the biggest architecture mismatch in the repo right now.

Because the Pages build includes only `/api/*` and `/sitemap.xml` in functions:
- most prerendered HTML pages bypass hook logic in production
- hook-based unknown-route redirects do not reliably fix old legacy URLs
- hook-based cache control does not reliably become the live static-page header policy

### B. The retry cron is not a true retry workflow

The repo already has:
- `npm run data:update:retry-failed`
- `scripts/update-retry-failed-data.mjs`

But the scheduled retry runs are not using it.

That means the repo already contains the start of a lighter retry strategy, but the workflow still chooses the heaviest path.

### C. Article generation has no "already generated for this date" skip

This is the single most expensive logic gap in the current article system.

Today it always tries again for the same visible date even when:
- the route already has a same-day article
- the backup cron is only meant as a source retry
- nothing about the answer changed

### D. The generator logs say failed routes will hide article blocks, but the shared helper can still return stale fallback content

`src/lib/daily-article-content.ts` deliberately returns the latest article even when the requested date does not match.

That means:
- failed same-day generation does not necessarily mean "no article shown"
- some routes can still show a stale article from a prior date

This behavior may be desirable for uptime, but it is important to be aware of it because it can blur answer-date accuracy.

### E. The missing SEO skill file warning is real configuration drift

The article generator logs:
- missing `.opencode/seo-skills/write-content/SKILL.md`

This does not crash the run, but it means every generation is running with one intended prompt supplement missing.

Inference:
- this may be contributing to banned-phrase and formatting failures, though that is not proven directly

### F. Colordle source freshness is still a real problem

`scripts/update-colordle-data.mjs` currently marks the source as stale when it lags the expected JST date.

Your pasted log showed:
- Colordle dataset ready through `2026-05-18` using stale source data

That means the current Colordle content path is still vulnerable to stale-day output unless the worker/API path fully replaces that dependency everywhere it matters.

## 9. Best solution path after all the research

If I had to choose the best overall fix strategy, it would be this order:

### Priority 1: Stop same-day full regeneration on retry schedules

Best ROI by far.

What to change conceptually:
- 1st daily run: full deploy for the new visible day
- 2nd and 3rd retry runs: only retry failed datasets and missing articles, not all routes again

Why this is the best fix:
- cuts runtime the most
- reduces same-day article churn
- reduces unnecessary commits
- reduces Pages deploy frequency for unchanged content
- matches the actual stated purpose of the backup cron

### Priority 2: Remove the 5-minute DeepSeek tax

Best immediate runtime win after Priority 1.

Conceptual options:
- reorder the model chain so Qwen or Kimi starts first
- reduce the first-model timeout from 300s to something like 90-120s
- preflight/health-check the primary provider before launching the full batch

Why:
- your current log already proves the first model can burn 5 minutes before useful work begins

### Priority 3: Use targeted retries instead of full `data:update`

The repo already contains a retry-only path.

Best practical direction:
- use `data:update:retry-failed` on backup cron windows
- especially for sources like Countryle and Colordle that are the ones actually failing

### Priority 4: Fix production redirect and cache behavior using the real Pages control surface

Because this is a static Pages build, prefer:
- static redirect rules
- Cloudflare redirect configuration
- `_headers`
- prerender-time page headers
- or widening the Pages function include set if you intentionally want runtime HTML handling

Do not assume `hooks.server.ts` alone will solve unknown-route production behavior on static HTML Pages routes.

### Priority 5: Fix the real remaining SEO issues

The real remaining site issues are:
- multiple H1s from generated article HTML
- huge Spotle SSR payload
- utility pages in sitemap
- incomplete slash-dated legacy redirects on production
- inconsistent cache posture for static HTML routes

### Priority 6: Stabilize article quality and reduce retry waste

Best direction:
- skip regeneration if the requested route/date already exists and no force refresh is requested
- tighten prompts so banned-phrase failures become rarer
- either restore the missing SEO skill input or fold those rules directly into the main prompt path

## 10. My final judgment

### The biggest true problems right now

- backup cron runs are too expensive because they rerun full deploy logic for the same visible day
- article generation is slowed heavily by a 5-minute primary-model timeout plus validation retries
- production legacy redirects are still incomplete despite code that appears to address them
- Spotle payload size and multiple H1s are real current issues
- thin utility pages in the sitemap are still real

### The audit is not fully wrong, but it is no longer fully current

The audit has several still-useful findings, but some of its highest-severity claims are now outdated:
- robots.txt is no longer the critical blocker it was framed as
- `/solver` is not redirecting anymore
- sitemap lastmod is not "all today"
- Colordle is not currently serving the old hard error state described there

### The single best overall solution

If you only fix one strategic thing first, make it this:

Change the backup cron behavior so the second and third daily runs do not regenerate all same-day articles and do not rerun the full heavy deploy path unless something is actually missing or stale.

That one change would give you the biggest gain across:
- runtime
- unnecessary content churn
- article replacement noise
- deploy frequency
- operational clarity

