import assert from 'node:assert/strict';
import test from 'node:test';
import { registryResult, validateMetadata } from '../scripts/release-metadata.mjs';

const packageJson = { name: 'devcard', version: '0.1.1' };
const packageLock = { version: '0.1.1', packages: { '': { version: '0.1.1' } } };
const workflow = "- 'v*.*.*'\nrun: npm run release:preflight\nrun: npm pack\nrun: npm publish *.tgz";

test('accepts matching metadata and tag', () => {
  assert.deepEqual(validateMetadata({ packageJson, packageLock, workflow, tag: 'v0.1.1' }), []);
});

test('rejects mismatched and malformed tags', () => {
  for (const tag of ['v0.2.0', '0.1.1', 'v0.1.1-beta.1', 'release-v0.1.1']) {
    assert.match(validateMetadata({ packageJson, packageLock, workflow, tag }).join('\n'), /exactly v0\.1\.1/);
  }
});

test('rejects inconsistent lock metadata and unsafe workflow ordering', () => {
  const badLock = { version: '0.1.0', packages: { '': { version: '0.1.0' } } };
  const badWorkflow = "- 'v*.*.*'\nrun: npm publish\nrun: npm pack\nrun: npm run release:preflight";
  assert.equal(validateMetadata({ packageJson, packageLock: badLock, workflow: badWorkflow }).length, 3);
});

test('registry permits 404, refuses published versions, and fails closed', () => {
  assert.deepEqual(registryResult(404, 'devcard', '0.1.1'), []);
  assert.match(registryResult(200, 'devcard', '0.1.1')[0], /already published/);
  assert.match(registryResult(503, 'devcard', '0.1.1')[0], /HTTP 503/);
});
