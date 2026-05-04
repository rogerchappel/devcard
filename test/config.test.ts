import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadConfig } from '../src/config.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

test('loadConfig parses fixture config', async () => {
  const config = await loadConfig('fixtures/basic/devcard.json', repoRoot);
  assert.equal(config.profile.name, 'Forge Example');
  assert.equal(config.profile.projects?.[0]?.name, 'devcard');
  assert.equal(config.profile.links?.length, 2);
});
