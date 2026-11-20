import fs from "node:fs";
import path from "node:path";

const targetsPath = process.env.INDEXING_TARGETS_PATH;
const artifactDir = path.resolve(
  process.cwd(),
  process.env.INDEXING_ARTIFACT_DIR || "artifacts/indexing",
);
const reportPath = path.join(artifactDir, "indexnow-report.json");
const indexNowKey = process.env.INDEXNOW_KEY || "";
const publicBaseUrl = (
  process.env.PUBLIC_BASE_URL || "https://wordauditor.com"
).replace(/\/$/, "");
const requestTimeoutMs = Number.parseInt(
  process.env.INDEXING_REQUEST_TIMEOUT_MS || "15000",
  10,
);
const effectiveRequestTimeoutMs =
  Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0
    ? requestTimeoutMs
    : 15000;

fs.mkdirSync(artifactDir, { recursive: true });

if (!targetsPath || !fs.existsSync(targetsPath)) {
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ status: "skipped", reason: "targets-missing" }, null, 2),
  );
  process.exit(0);
}

const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const urlList = Array.isArray(targets.indexNowUrls) ? targets.indexNowUrls : [];

if (!indexNowKey) {
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      { status: "skipped", reason: "missing-indexnow-key", submittedCount: 0 },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!urlList.length) {
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      { status: "skipped", reason: "no-urls", submittedCount: 0 },
      null,
      2,
    ),
  );
  process.exit(0);
}

const payload = {
  host: new URL(publicBaseUrl).host,
  key: indexNowKey,
  keyLocation: `${publicBaseUrl}/${indexNowKey}.txt`,
  urlList,
};

try {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(effectiveRequestTimeoutMs),
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        status: response.ok ? "submitted" : "failed",
        httpStatus: response.status,
        submittedCount: urlList.length,
        requestTimeoutMs: effectiveRequestTimeoutMs,
        body,
      },
      null,
      2,
    ),
  );

  console.log(
    `IndexNow ${response.ok ? "submitted" : "failed"} with status ${response.status}.`,
  );
} catch (error) {
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        status: "failed",
        submittedCount: urlList.length,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  console.warn(
    `IndexNow submit failed: ${error instanceof Error ? error.message : String(error)}`,
  );
}
