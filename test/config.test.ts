import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { loadConfig } from '../src/config.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

test('loadConfig parses fixture config', async () => {
  const config = await loadConfig('fixtures/basic/devcard.json', repoRoot);
  assert.equal(config.profile.name, 'Forge Example');
  assert.equal(config.profile.projects?.[0]?.name, 'devcard');
  assert.equal(config.profile.links?.length, 2);
});

async function writeConfig(options: unknown): Promise<{ cwd: string; path: string }> {
  const cwd = await mkdtemp(join(tmpdir(), 'devcard-config-test-'));
  const path = 'devcard.json';
  await writeFile(join(cwd, path), JSON.stringify({
    profile: { name: 'Test User', tagline: 'Test profile' },
    options,
  }));
  return { cwd, path };
}

test('loadConfig preserves explicitly false output options', async () => {
  const fixture = await writeConfig({ includeChecklist: false, includeValidationSummary: false });
  const config = await loadConfig(fixture.path, fixture.cwd);
  assert.deepEqual(config.options, { includeChecklist: false, includeValidationSummary: false });
});

test('loadConfig rejects non-boolean output options', async () => {
  const fixture = await writeConfig({ includeChecklist: 'false' });
  await assert.rejects(
    loadConfig(fixture.path, fixture.cwd),
    /Expected options\.includeChecklist to be a boolean\./,
  );
});

test('loadConfig rejects a non-object options value', async () => {
  const fixture = await writeConfig('invalid');
  await assert.rejects(loadConfig(fixture.path, fixture.cwd), /Expected options to be an object\./);
});
