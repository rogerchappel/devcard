import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

test('documented source-checkout entrypoint generates a file', async () => {
  const outputDir = await mkdtemp(join(tmpdir(), 'devcard-source-cli-'));
  const outputPath = join(outputDir, 'README.generated.md');
  const result = spawnSync(process.execPath, ['bin/devcard.js', 'generate', '--config', 'fixtures/basic/devcard.json', '--output', outputPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Generated/);
  await access(outputPath);
});
