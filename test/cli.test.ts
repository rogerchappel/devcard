import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/cli.js';

test('parseArgs resolves generate command options', () => {
  const options = parseArgs(['generate', '--config', './fixtures/basic/devcard.json', '--output', './tmp/README.md', '--validate', 'none'], '/repo');
  assert.equal(options.config, './fixtures/basic/devcard.json');
  assert.equal(options.output, './tmp/README.md');
  assert.equal(options.validationMode, 'none');
});
