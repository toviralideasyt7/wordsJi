import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const wranglerEntrypoint = path.resolve(projectRoot, 'node_modules/wrangler/bin/wrangler.js');
const deployConfigDir = path.join(projectRoot, '.wrangler', 'deploy');
const deployConfigPath = path.join(deployConfigDir, 'config.json');
const relativePagesConfigPath = path.relative(deployConfigDir, path.join(projectRoot, 'wrangler.pages.jsonc'));

async function withPagesConfigRedirect(run) {
	await mkdir(deployConfigDir, { recursive: true });
	let previousConfig = null;

	try {
		previousConfig = await readFile(deployConfigPath, 'utf8');
	} catch (error) {
		if (error?.code !== 'ENOENT') {
			throw error;
		}
	}

	await writeFile(
		deployConfigPath,
		`${JSON.stringify({ configPath: relativePagesConfigPath.replace(/\\/g, '/') }, null, 2)}\n`,
		'utf8'
	);

	try {
		return await run();
	} finally {
		if (previousConfig !== null) {
			await writeFile(deployConfigPath, previousConfig, 'utf8');
		} else {
			await rm(deployConfigPath, { force: true });
		}
	}
}

const extraArgs = process.argv.slice(2);

const exitCode = await withPagesConfigRedirect(async () => {
	const result = spawnSync(
		process.execPath,
		[
			wranglerEntrypoint,
			'pages',
			'deploy',
			'build/pages',
			'--project-name',
			'wordauditor',
			...extraArgs
		],
		{
			cwd: projectRoot,
			stdio: 'inherit',
			env: process.env
		}
	);

	return typeof result.status === 'number' ? result.status : 1;
});

process.exit(exitCode);
