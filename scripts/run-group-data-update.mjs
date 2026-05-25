import { spawnSync } from 'node:child_process';
import process from 'node:process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const runMode = String(process.env.RUN_DATA_UPDATE_MODE ?? 'full').trim().toLowerCase();

const scriptByMode = {
  full: ['run', 'data:update'],
  'retry-failed': ['run', 'data:update:retry-failed'],
  skip: null
};

function runNpm(args) {
  const result = spawnSync(npmCommand, args, {
    stdio: 'inherit',
    env: process.env
  });

  if (typeof result.status === 'number') {
    process.exit(result.status);
  }

  process.exit(1);
}

if (!(runMode in scriptByMode)) {
  console.error(
    `Unsupported RUN_DATA_UPDATE_MODE "${runMode}". Expected one of: ${Object.keys(scriptByMode).join(', ')}.`
  );
  process.exit(1);
}

if (scriptByMode[runMode] === null) {
  console.log(`Skipping data update because RUN_DATA_UPDATE_MODE=${runMode}.`);
  process.exit(0);
}

console.log(`Running data update mode "${runMode}".`);
runNpm(scriptByMode[runMode]);
