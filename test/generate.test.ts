import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
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

test('generateFromConfig rejects unknown keys before writing output', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'devcard-generate-test-'));
  await writeFile(join(cwd, 'devcard.json'), JSON.stringify({
    profile: { name: 'Test User', tagline: 'Test profile', foucs: ['typo'] },
  }));

  await assert.rejects(
    generateFromConfig('./devcard.json', './README.md', { cwd }),
    /Unknown config key: profile\.foucs\./,
  );
  await assert.rejects(access(join(cwd, 'README.md')));
});

test('generateFromConfig rejects an invalid project status before writing output', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'devcard-generate-test-'));
  await writeFile(join(cwd, 'devcard.json'), JSON.stringify({
    profile: {
      name: 'Test User',
      tagline: 'Test profile',
      projects: [{ name: 'Project', description: 'Description', status: null }],
    },
  }));

  await assert.rejects(
    generateFromConfig('./devcard.json', './README.md', { cwd }),
    /Unsupported project status at profile\.projects\[0\]\.status/,
  );
  await assert.rejects(access(join(cwd, 'README.md')));
});
