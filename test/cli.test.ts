import test from 'node:test';
import assert from 'node:assert/strict';
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
