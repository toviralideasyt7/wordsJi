import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { readUpdateStatus } from './lib/update-status.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const GAME_RUNNERS = {
  canuckle: 'scripts/update-canuckle-data.mjs',
  colordle: 'scripts/update-colordle-data.mjs',
  countryle: 'scripts/update-countryle-data.mjs',
  framed: 'scripts/update-framed-data.mjs',
  spotle: 'scripts/update-spotle-data.mjs'
};

const excludedGames = new Set(
  (process.env.UPDATE_RETRY_EXCLUDE ?? 'gamedle')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

function runNodeScript(relativeScriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(projectRoot, relativeScriptPath)], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${relativeScriptPath} exited with code ${code ?? 'unknown'}`));
    });
  });
}

async function main() {
  const status = await readUpdateStatus(projectRoot);
  const retryableGames = Object.entries(status.games ?? {})
    .filter(([gameKey, gameStatus]) => {
      return Boolean(gameStatus?.needsRetry) && !excludedGames.has(gameKey);
    })
    .map(([gameKey]) => gameKey)
    .filter((gameKey) => GAME_RUNNERS[gameKey]);

  if (retryableGames.length === 0) {
    console.log('No previously failed dataset refreshes are waiting for retry.');
    return;
  }

  console.log(
    `Retrying failed dataset refreshes for: ${retryableGames.join(', ')}. Excluding: ${[...excludedGames].join(', ')}.`
  );

  for (const gameKey of retryableGames) {
    await runNodeScript(GAME_RUNNERS[gameKey]);
  }
}

main().catch((error) => {
  console.error('Unable to retry failed dataset refreshes:', error);
  process.exit(1);
});
