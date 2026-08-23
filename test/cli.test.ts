import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs, runCli } from '../src/cli.js';

test('parseArgs resolves generate command options', () => {
  const options = parseArgs(['generate', '--config', './fixtures/basic/devcard.json', '--output', './tmp/README.md', '--validate', 'none'], '/repo');
  assert.equal(options.config, './fixtures/basic/devcard.json');
  assert.equal(options.output, './tmp/README.md');
  assert.equal(options.validationMode, 'none');
});

function captureIo() {
  let stdout = '';
  let stderr = '';
  return {
    io: {
      stdout: { write: (chunk: string | Uint8Array) => { stdout += String(chunk); return true; } },
      stderr: { write: (chunk: string | Uint8Array) => { stderr += String(chunk); return true; } },
    },
    output: () => ({ stdout, stderr }),
  };
}

for (const argv of [[], ['--help'], ['generate', '--help']]) {
  test(`runCli prints help successfully for ${argv.length === 0 ? 'no arguments' : argv.join(' ')}`, async () => {
    const capture = captureIo();
    assert.equal(await runCli(argv, '/repo', capture.io), 0);
    assert.match(capture.output().stdout, /^devcard\n\nUsage:/);
    assert.equal(capture.output().stderr, '');
  });
}

for (const argv of [['unknown'], ['generate', '--validate', 'invalid'], ['generate', '--output']]) {
  test(`runCli reports malformed invocation for ${argv.join(' ')}`, async () => {
    const capture = captureIo();
    assert.equal(await runCli(argv, '/repo', capture.io), 1);
    assert.equal(capture.output().stdout, '');
    assert.match(capture.output().stderr, /(?:Unknown command|Unsupported argument):/);
  });
}

test('runCli resolves local links from the nested config directory', async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), 'devcard-cli-'));
  t.after(async () => { await import('node:fs/promises').then(({ rm }) => rm(cwd, { recursive: true, force: true })); });
  await mkdir(join(cwd, 'config', 'assets'), { recursive: true });
  await writeFile(join(cwd, 'config', 'assets', 'avatar.txt'), 'avatar\n');
  await writeFile(join(cwd, 'config', 'devcard.json'), JSON.stringify({
    profile: {
      name: 'Example',
      tagline: 'A sufficiently descriptive tagline',
      location: 'Brisbane',
      website: 'https://example.com',
      links: [{ label: 'Avatar', url: './assets/avatar.txt' }],
    },
  }));

  const capture = captureIo();
  assert.equal(await runCli(['generate', '--config', './config/devcard.json', '--output', './result/README.md'], cwd, capture.io), 0);
  assert.match(capture.output().stdout, /Validation findings: 0/);
  assert.match(await readFile(join(cwd, 'result', 'README.md'), 'utf8'), /\.\/assets\/avatar\.txt/);
});

test('runCli reports a missing link relative to the nested config directory', async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), 'devcard-cli-missing-'));
  t.after(async () => { await import('node:fs/promises').then(({ rm }) => rm(cwd, { recursive: true, force: true })); });
  await mkdir(join(cwd, 'config'), { recursive: true });
  await writeFile(join(cwd, 'config', 'devcard.json'), JSON.stringify({
    profile: {
      name: 'Example',
      tagline: 'A sufficiently descriptive tagline',
      location: 'Brisbane',
      website: 'https://example.com',
      links: [{ label: 'Missing', url: './assets/missing.txt' }],
    },
  }));

  const capture = captureIo();
  assert.equal(await runCli(['generate', '--config', './config/devcard.json', '--output', './README.md'], cwd, capture.io), 2);
  assert.match(capture.output().stdout, /Validation findings: 1/);
});
