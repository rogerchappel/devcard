import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadConfig } from '../src/config.js';
import { renderReadme } from '../src/render.js';
import { validateConfig } from '../src/validate.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

test('renderReadme creates expected sections', async () => {
  const config = await loadConfig('fixtures/basic/devcard.json', repoRoot);
  const validation = await validateConfig(config, join(repoRoot, 'fixtures/basic'), 'safe');
  const output = renderReadme(config, validation);

  assert.match(output, /# Forge Example/);
  assert.match(output, /## Projects/);
  assert.match(output, /## Update checklist/);
});
