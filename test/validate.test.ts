import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadConfig } from '../src/config.js';
import { validateConfig } from '../src/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

test('validateConfig reports warnings and errors for broken fixture', async () => {
  const config = await loadConfig('fixtures/broken/devcard.json', repoRoot);
  const report = await validateConfig(config, join(repoRoot, 'fixtures/broken'), 'safe');

  assert.equal(report.findings.some((finding) => finding.level === 'error'), true);
  assert.equal(report.findings.some((finding) => finding.message.includes('Prefer HTTPS')), true);
});
