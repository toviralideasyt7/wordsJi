#!/usr/bin/env python3
import concurrent.futures
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROUTE_REGISTRY = PROJECT_ROOT / "src" / "lib" / "route-registry.js"
API_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
STRATEGIES = ("mobile", "desktop")
RETRYABLE_HTTP_STATUSES = {429, 500, 502, 503, 504}
RETRYABLE_ERROR_TEXT = (
    "unable to process request",
    "please wait a while",
    "something went wrong",
    "timed out",
    "temporarily unavailable",
)


def read_routes():
    source = ROUTE_REGISTRY.read_text(encoding="utf-8")
    routes = []
    for name in ("EVERGREEN_STATIC_ROUTES", "TODAY_STATIC_ROUTES", "ARCHIVE_STATIC_ROUTES"):
        match = re.search(rf"export const {name} = \[(.*?)\];", source, re.S)
        if not match:
            raise RuntimeError(f"Could not find {name} in {ROUTE_REGISTRY}")
        routes.extend(re.findall(r"'([^']+)'", match.group(1)))

    deduped = []
    seen = set()
    for route in routes:
        if route not in seen:
            seen.add(route)
            deduped.append(route)
    return deduped


def is_retryable_error(result):
    if result.get("ok"):
        return False
    if result.get("httpStatus") in RETRYABLE_HTTP_STATUSES:
        return True
    message = str(result.get("error", {}).get("message", "")).lower()
    return any(text in message for text in RETRYABLE_ERROR_TEXT)


def audit_url_once(base_url, route, strategy, api_key, timeout):
    page_url = urllib.parse.urljoin(base_url.rstrip("/") + "/", route.lstrip("/"))
    query = urllib.parse.urlencode(
        {
            "url": page_url,
            "strategy": strategy,
            "category": "performance",
            "key": api_key,
        }
    )
    request_url = f"{API_ENDPOINT}?{query}"
    request = urllib.request.Request(request_url, headers={"User-Agent": "WordSolverX PSI Script"})

    started = time.time()
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            payload = {"error": {"message": body}}
        return {
            "route": route,
            "url": page_url,
            "strategy": strategy,
            "ok": False,
            "httpStatus": error.code,
            "durationMs": round((time.time() - started) * 1000),
            "error": payload.get("error", payload),
        }
    except Exception as error:
        return {
            "route": route,
            "url": page_url,
            "strategy": strategy,
            "ok": False,
            "httpStatus": None,
            "durationMs": round((time.time() - started) * 1000),
            "error": {"message": str(error)},
        }

    lighthouse = payload.get("lighthouseResult")
    if not lighthouse:
        return {
            "route": route,
            "url": page_url,
            "strategy": strategy,
            "ok": False,
            "httpStatus": 200,
            "durationMs": round((time.time() - started) * 1000),
            "error": payload.get("error", {"message": "No lighthouseResult in PSI response"}),
        }

    audits = lighthouse.get("audits", {})
    categories = lighthouse.get("categories", {})
    performance = categories.get("performance", {})

    def metric(audit_id):
        audit = audits.get(audit_id, {})
        return {
            "displayValue": audit.get("displayValue"),
            "numericValue": audit.get("numericValue"),
            "score": audit.get("score"),
        }

    return {
        "route": route,
        "url": page_url,
        "strategy": strategy,
        "ok": True,
        "httpStatus": 200,
        "durationMs": round((time.time() - started) * 1000),
        "score": round(performance.get("score", 0) * 100) if performance.get("score") is not None else None,
        "fetchTime": lighthouse.get("fetchTime"),
        "finalUrl": lighthouse.get("finalDisplayedUrl") or lighthouse.get("finalUrl"),
        "metrics": {
            "fcp": metric("first-contentful-paint"),
            "lcp": metric("largest-contentful-paint"),
            "cls": metric("cumulative-layout-shift"),
            "tbt": metric("total-blocking-time"),
            "speedIndex": metric("speed-index"),
            "interactive": metric("interactive"),
        },
    }


def audit_url(base_url, route, strategy, api_key, timeout, retries):
    last_result = None
    for attempt in range(retries + 1):
        result = audit_url_once(base_url, route, strategy, api_key, timeout)
        result["attempt"] = attempt + 1
        last_result = result
        if not is_retryable_error(result) or attempt >= retries:
            return result
        time.sleep(min(60, 5 * (attempt + 1) ** 2))
    return last_result


def load_existing_results(output):
    if not output.exists():
        return {}
    try:
        report = json.loads(output.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}

    existing = {}
    for route_item in report.get("routes", []):
        for strategy in STRATEGIES:
            result = route_item.get(strategy)
            if result and result.get("ok"):
                existing[(result.get("route"), result.get("strategy"))] = result
    return existing


def main():
    api_key = os.environ.get("PAGESPEED_API_KEY")
    if not api_key:
        print("Missing PAGESPEED_API_KEY", file=sys.stderr)
        return 1

    base_url = os.environ.get("PAGESPEED_BASE_URL", "https://wordsolverx-z-ai.pages.dev")
    output = Path(os.environ.get("PAGESPEED_SCORE_OUTPUT", "after-deploy/pagespeed-scores.json"))
    timeout = int(os.environ.get("PAGESPEED_TIMEOUT", "120"))
    workers = int(os.environ.get("PAGESPEED_WORKERS", "3"))
    retries = int(os.environ.get("PAGESPEED_RETRIES", "2"))
    force = os.environ.get("PAGESPEED_FORCE", "").lower() in {"1", "true", "yes"}
    routes = read_routes()
    tasks = [(route, strategy) for route in routes for strategy in STRATEGIES]

    output.parent.mkdir(parents=True, exist_ok=True)
    existing_results = {} if force else load_existing_results(output)
    pending_tasks = [task for task in tasks if task not in existing_results]
    results = list(existing_results.values())
    started_at = datetime.now(timezone.utc).isoformat()

    if existing_results:
        print(f"Reusing {len(existing_results)} successful existing results from {output}")
    print(f"Running {len(pending_tasks)} PageSpeed requests")

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, workers)) as executor:
        future_to_task = {
            executor.submit(audit_url, base_url, route, strategy, api_key, timeout, retries): (route, strategy)
            for route, strategy in pending_tasks
        }
        for index, future in enumerate(concurrent.futures.as_completed(future_to_task), start=1):
            route, strategy = future_to_task[future]
            result = future.result()
            results.append(result)
            if result.get("ok"):
                print(f"[{index}/{len(pending_tasks)}] {strategy:7} {route:35} score={result.get('score')}")
            else:
                message = result.get("error", {}).get("message", "unknown error")
                print(f"[{index}/{len(pending_tasks)}] {strategy:7} {route:35} ERROR {message}")

    by_route = []
    for route in routes:
        mobile = next((item for item in results if item["route"] == route and item["strategy"] == "mobile"), None)
        desktop = next((item for item in results if item["route"] == route and item["strategy"] == "desktop"), None)
        by_route.append(
            {
                "route": route,
                "url": urllib.parse.urljoin(base_url.rstrip("/") + "/", route.lstrip("/")),
                "mobileScore": mobile.get("score") if mobile else None,
                "desktopScore": desktop.get("score") if desktop else None,
                "mobile": mobile,
                "desktop": desktop,
            }
        )

    passing_both = sum(
        1
        for item in by_route
        if (item.get("mobileScore") or 0) >= 90 and (item.get("desktopScore") or 0) >= 90
    )
    errored = [
        item
        for item in by_route
        if not item.get("mobile", {}).get("ok") or not item.get("desktop", {}).get("ok")
    ]
    failed = [
        item
        for item in by_route
        if item not in errored and ((item.get("mobileScore") or 0) < 90 or (item.get("desktopScore") or 0) < 90)
    ]

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "startedAt": started_at,
        "baseUrl": base_url,
        "routeCount": len(routes),
        "resultCount": len(results),
        "okResultCount": sum(1 for item in results if item.get("ok")),
        "errorResultCount": sum(1 for item in results if not item.get("ok")),
        "passingBothCount": passing_both,
        "failingTargetCount": len(failed),
        "erroredRouteCount": len(errored),
        "target": "90+ mobile and desktop PageSpeed performance",
        "routes": by_route,
        "worstRoutes": sorted(
            by_route,
            key=lambda item: min(item.get("mobileScore") or -1, item.get("desktopScore") or -1),
        )[:25],
    }

    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"\nSaved score report to {output}")
    print(f"Passing both 90+: {passing_both}/{len(routes)}")
    print(f"Failing target: {len(failed)}")
    print(f"Routes with PSI errors: {len(errored)}")
    return 0 if not failed and not errored else 2


if __name__ == "__main__":
    raise SystemExit(main())
