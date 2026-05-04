import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const outputDir = await mkdtemp(join(tmpdir(), 'devcard-smoke-'));
const outputPath = join(outputDir, 'README.generated.md');

const exitCode = await new Promise((resolve, reject) => {
  const child = spawn('node', ['bin/devcard.js', 'generate', '--config', 'fixtures/basic/devcard.json', '--output', outputPath, '--validate', 'safe'], {
    cwd,
    stdio: 'inherit',
  });
  child.on('error', reject);
  child.on('exit', (code) => resolve(code ?? 1));
});

if (exitCode !== 0) {
  throw new Error(`Smoke command failed with exit code ${exitCode}`);
}

const rendered = await readFile(outputPath, 'utf8');
if (!rendered.includes('# Forge Example')) {
  throw new Error('Smoke output missing expected heading');
}

await rm(outputDir, { recursive: true, force: true });
console.log('Smoke check passed');
