import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateFromConfig } from '../src/generate.js';

test('generateFromConfig accepts an explicit local-link validation base', async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), 'devcard-library-'));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  await mkdir(join(cwd, 'config'), { recursive: true });
  await mkdir(join(cwd, 'shared'), { recursive: true });
  await writeFile(join(cwd, 'shared', 'avatar.txt'), 'avatar\n');
  await writeFile(join(cwd, 'config', 'devcard.json'), JSON.stringify({
    profile: {
      name: 'Example',
      tagline: 'A sufficiently descriptive tagline',
      location: 'Brisbane',
      website: 'https://example.com',
      links: [{ label: 'Avatar', url: './avatar.txt' }],
    },
  }));

  const result = await generateFromConfig('./config/devcard.json', './README.md', {
    cwd,
    validationBase: './shared',
  });

  assert.deepEqual(result.validation.findings, []);
});
