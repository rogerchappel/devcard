import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
});

const [pack] = JSON.parse(output);
const packedFiles = new Set(pack.files.map((file) => file.path));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

const requiredFiles = [
  'package.json',
  'bin/devcard.js',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/cli.js',
  'examples/devcard.json',
  'fixtures/basic/devcard.json',
  'fixtures/basic/assets/avatar.txt',
  'fixtures/broken/devcard.json',
  'docs/release-candidate.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md',
];

const missing = requiredFiles.filter((file) => !packedFiles.has(file));
if (missing.length > 0) {
  console.error(`Package smoke failed; missing files:\n${missing.join('\n')}`);
  process.exit(1);
}

const declaredBins = Object.values(packageJson.bin ?? {}).map((binPath) =>
  binPath.replace(/^.\//, ''),
);
const missingBins = declaredBins.filter((binPath) => !packedFiles.has(binPath));
if (missingBins.length > 0) {
  console.error(`Package smoke failed; missing declared bins:\n${missingBins.join('\n')}`);
  process.exit(1);
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files`);

const installDirectory = mkdtempSync(join(tmpdir(), 'devcard-package-smoke-'));
let packedPath;

try {
  const packedFilename = execFileSync('npm', ['pack', '--silent'], {
    encoding: 'utf8',
  }).trim();
  packedPath = resolve(packedFilename);

  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', packedPath],
    { cwd: installDirectory, stdio: 'inherit' },
  );

  const outputPath = join(installDirectory, 'README.generated.md');
  execFileSync(
    join(installDirectory, 'node_modules', '.bin', 'devcard'),
    [
      'generate',
      '--config',
      resolve('fixtures/basic/devcard.json'),
      '--output',
      outputPath,
      '--validate',
      'safe',
    ],
    { stdio: 'inherit' },
  );

  if (!readFileSync(outputPath, 'utf8').includes('# Forge Example')) {
    throw new Error('Installed devcard binary did not generate the expected fixture output');
  }

  const installedEntry = join(installDirectory, 'node_modules', 'devcard', 'dist', 'index.js');
  const { generateFromConfig } = await import(pathToFileURL(installedEntry));
  if (typeof generateFromConfig !== 'function') {
    throw new Error('Installed package does not export generateFromConfig');
  }

  console.log('package install smoke ok: installed CLI and generateFromConfig API work');
} finally {
  if (packedPath) rmSync(packedPath, { force: true });
  rmSync(installDirectory, { recursive: true, force: true });
}
