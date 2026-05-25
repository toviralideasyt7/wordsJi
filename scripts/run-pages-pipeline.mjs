import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

function runNodeScript(relativeScriptPath) {
  const result = spawnSync(process.execPath, [path.join(projectRoot, relativeScriptPath)], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env
  });

  if (typeof result.status === 'number') {
    if (result.status !== 0) {
      process.exit(result.status);
    }
    return;
  }

  process.exit(1);
}

runNodeScript('scripts/run-group-data-update.mjs');
runNodeScript('scripts/generate-daily-articles.mjs');
runNodeScript('scripts/build-pages.mjs');
runNodeScript('scripts/deploy-pages.mjs');
