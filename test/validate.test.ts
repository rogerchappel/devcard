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

function configWith(overrides: Record<string, unknown>) {
  return { profile: { name: 'Example', tagline: 'A sufficiently descriptive tagline', location: 'Brisbane', website: 'https://example.com', ...overrides } };
}

test('validateConfig none mode suppresses every finding while safe mode retains warnings', async () => {
  const config = configWith({
    location: undefined,
    website: undefined,
    email: 'invalid',
    links: [{ label: 'Missing', url: './does-not-exist' }],
  });

  const none = await validateConfig(config, repoRoot, 'none');
  const safe = await validateConfig(config, repoRoot, 'safe');

  assert.deepEqual(none, { mode: 'none', findings: [] });
  assert.equal(safe.findings.some((finding) => finding.message.includes('website is optional')), true);
  assert.equal(safe.findings.some((finding) => finding.message.includes('location is optional')), true);
  assert.equal(safe.findings.some((finding) => finding.level === 'error'), true);
});

test('validateConfig rejects malformed and unsupported web targets as links', async () => {
  const report = await validateConfig(configWith({
    website: 'https:// ',
    links: [{ label: 'FTP', url: 'ftp://example.com/file' }],
    writing: [{ title: 'Broken', url: 'not a URL' }],
    projects: [{ name: 'Project', description: 'Example', repo: 'git@example.com:owner/repo.git' }],
  }), repoRoot, 'safe');

  assert.equal(report.findings.length, 4);
  assert.equal(report.findings.every((finding) => finding.kind === 'link' && finding.level === 'error'), true);
  assert.match(report.findings[0]!.message, /website URL/);
  assert.match(report.findings[1]!.message, /Unsupported link URL scheme/);
  assert.match(report.findings[2]!.message, /writing URL/);
  assert.match(report.findings[3]!.message, /project repository URL/);
  assert.equal(report.findings.some((finding) => finding.message.includes('Local asset path')), false);
});

test('validateConfig validates email addresses with or without mailto', async () => {
  const invalid = await validateConfig(configWith({ email: 'missing-at.example.com' }), repoRoot, 'safe');
  assert.match(invalid.findings[0]!.message, /Invalid profile email/);
  for (const email of ['person@example.com', 'mailto:person@example.com']) {
    const valid = await validateConfig(configWith({ email }), repoRoot, 'safe');
    assert.deepEqual(valid.findings, []);
  }
});

test('validateConfig retains HTTPS, HTTP warnings, and local link paths', async () => {
  const report = await validateConfig(configWith({
    website: 'https://example.com',
    links: [{ label: 'Insecure', url: 'http://example.com' }, { label: 'Local asset', url: './fixtures/basic/assets/avatar.txt' }],
    writing: [{ title: 'Post', url: 'https://example.com/post' }],
    projects: [{ name: 'Project', description: 'Example', repo: 'https://github.com/example/project' }],
  }), repoRoot, 'safe');

  assert.equal(report.findings.length, 1);
  assert.equal(report.findings[0]!.level, 'warning');
  assert.match(report.findings[0]!.message, /Prefer HTTPS/);
});
