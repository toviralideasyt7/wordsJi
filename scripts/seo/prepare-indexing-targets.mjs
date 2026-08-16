import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  ARCHIVE_STATIC_ROUTES,
  TODAY_STATIC_ROUTES,
} from "../../src/lib/route-registry.js";

const repoRoot = process.cwd();
const artifactDir = path.resolve(
  repoRoot,
  process.env.INDEXING_ARTIFACT_DIR || "artifacts/indexing",
);
const outputPath = path.join(artifactDir, "updated-urls.json");
const githubOutput = process.env.GITHUB_OUTPUT;
const publicBaseUrl = (
  process.env.PUBLIC_BASE_URL || "https://wordsolverx.com"
).replace(/\/$/, "");
const eventName = process.env.GITHUB_EVENT_NAME || "";
const groupName = process.env.GROUP_NAME || "site";
const sourceName = process.env.SOURCE_NAME || "manual";
const targetDate = process.env.TARGET_DATE || "";
const enableGoogleInspection = !/^(0|false|no)$/i.test(
  process.env.ENABLE_GOOGLE_INSPECTION || "true",
);
const inspectionLimit = Number.parseInt(
  process.env.GOOGLE_INSPECTION_LIMIT || (enableGoogleInspection ? "30" : "0"),
  10,
);

const alwaysPaths = ["/", "/today", "/solver"];
const globalSeoPaths = [
  "/",
  "/today",
  "/solver",
  "/archive",
  "/about",
  "/contact",
];
const gamedlePaths = [
  "/narutodle-answer-today-updated",
  "/loldle-answer-today-updated",
  "/dotadle-answer-today-updated",
  "/pokedle-answer-today-updated",
  "/smashdle-answer-today-updated",
  "/onepiecedle-answer-today-updated",
];
const wafflePaths = ["/waffle-answer-today", "/waffle-archive"];
const mainPaths = [
  ...TODAY_STATIC_ROUTES.filter(
    (route) =>
      !["/today", "/waffle-answer-today", ...gamedlePaths].includes(route),
  ),
  ...ARCHIVE_STATIC_ROUTES.filter((route) => route !== "/waffle-archive"),
];

const globalTriggerPatterns = [
  /^src\/app\.html$/,
  /^src\/lib\/seo\.ts$/,
  /^src\/lib\/authors\.ts$/,
  /^src\/lib\/components\/SiteDefaultsHead\.svelte$/,
  /^src\/lib\/components\/ContentNavigation\.svelte$/,
  /^src\/lib\/components\/Footer\.svelte$/,
  /^src\/lib\/components\/Breadcrumbs\.svelte$/,
  /^src\/routes\/\+error\.svelte$/,
  /^src\/routes\/sitemap\.xml\/\+server\.(ts|js)$/,
  /^static\/robots\.txt$/,
  /^static\/404\.html$/,
  /^_headers$/,
];

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function toAbsoluteUrls(paths) {
  return unique(paths).map((routePath) => `${publicBaseUrl}${routePath}`);
}

function routeFileToUrl(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.startsWith("src/routes/")) return null;
  if (
    normalized.endsWith("/+error.svelte") ||
    normalized === "src/routes/+error.svelte"
  )
    return null;

  const relativePath = normalized.slice("src/routes/".length);
  const segments = relativePath.split("/");
  const routeSegments = [];

  for (const segment of segments) {
    if (segment.startsWith("(") && segment.endsWith(")")) continue;
    if (segment.startsWith("+")) break;
    routeSegments.push(segment);
  }

  const routePath = `/${routeSegments.join("/")}`.replace(/\/+/g, "/");
  if (routePath === "/sitemap.xml") return null;
  return routePath === "/" ? "/" : routePath.replace(/\/$/, "");
}

function getChangedFiles() {
  if (eventName !== "push") return [];

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) return [];

  const eventPayload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const before = eventPayload.before;
  const after = eventPayload.after || process.env.GITHUB_SHA;

  if (!before || !after || /^0+$/.test(before)) return [];

  try {
    return execFileSync("git", ["diff", "--name-only", before, after], {
      cwd: repoRoot,
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.warn(
      `Unable to read changed files from git diff: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
}

function getGroupPaths(group) {
  switch (group) {
    case "main":
      return mainPaths;
    case "waffle":
      return wafflePaths;
    case "gamedle":
      return gamedlePaths;
    case "site":
    default:
      return [];
  }
}

const changedFiles = getChangedFiles();
const changedRoutePaths = changedFiles.map(routeFileToUrl).filter(Boolean);
const globalPaths = changedFiles.some((filePath) =>
  globalTriggerPatterns.some((pattern) =>
    pattern.test(filePath.replace(/\\/g, "/")),
  ),
)
  ? globalSeoPaths
  : [];
const groupPaths = getGroupPaths(groupName);

const indexNowPaths = unique([
  ...alwaysPaths,
  ...groupPaths,
  ...globalPaths,
  ...changedRoutePaths,
]);
const inspectionPaths =
  enableGoogleInspection &&
  Number.isFinite(inspectionLimit) &&
  inspectionLimit > 0
    ? unique([
        ...alwaysPaths,
        ...groupPaths,
        ...globalPaths,
        ...changedRoutePaths,
      ]).slice(0, inspectionLimit)
    : [];

const report = {
  generatedAt: new Date().toISOString(),
  eventName,
  groupName,
  sourceName,
  targetDate,
  publicBaseUrl,
  googleInspectionEnabled: enableGoogleInspection,
  googleInspectionLimit:
    enableGoogleInspection &&
    Number.isFinite(inspectionLimit) &&
    inspectionLimit > 0
      ? inspectionLimit
      : 0,
  sitemapUrl: `${publicBaseUrl}/sitemap.xml`,
  changedFiles,
  indexNowUrls: toAbsoluteUrls(indexNowPaths),
  inspectionUrls: toAbsoluteUrls(inspectionPaths),
};

fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

if (githubOutput) {
  fs.appendFileSync(githubOutput, `targets_path=${outputPath}\n`);
  fs.appendFileSync(githubOutput, `artifact_dir=${artifactDir}\n`);
  fs.appendFileSync(
    githubOutput,
    `indexnow_count=${report.indexNowUrls.length}\n`,
  );
  fs.appendFileSync(
    githubOutput,
    `inspection_count=${report.inspectionUrls.length}\n`,
  );
}

console.log(
  `Prepared ${report.indexNowUrls.length} IndexNow URL(s) and ${report.inspectionUrls.length} Google inspection URL(s).`,
);
