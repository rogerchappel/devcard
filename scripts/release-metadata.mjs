import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function validateMetadata({ packageJson, packageLock, workflow, tag }) {
  const errors = [];
  const expected = `v${packageJson.version}`;
  if (packageLock.version !== packageJson.version) errors.push('package-lock.json version must match package.json');
  if (packageLock.packages?.['']?.version !== packageJson.version) errors.push('package-lock.json root package version must match package.json');
  if (tag !== undefined && tag !== expected) errors.push(`release tag must be exactly ${expected}; received ${tag}`);
  const preflight = workflow.indexOf('npm run release:preflight');
  const pack = workflow.indexOf('npm pack');
  const publish = workflow.indexOf('npm publish');
  if (!workflow.includes("- 'v*.*.*'")) errors.push('release workflow must trigger on version tags');
  if (preflight < 0) errors.push('release workflow must run npm run release:preflight');
  if (pack < 0 || publish < 0) errors.push('release workflow must pack and publish the package');
  if (preflight >= pack || pack >= publish) errors.push('release workflow must run preflight before pack and publish');
  return errors;
}

export function registryResult(status, name, version) {
  if (status === 404) return [];
  if (status >= 200 && status < 300) return [`${name}@${version} is already published`];
  return [`npm registry check failed with HTTP ${status}`];
}

async function main() {
  const args = process.argv.slice(2);
  const tagIndex = args.indexOf('--tag');
  const tag = tagIndex >= 0 ? args[tagIndex + 1] : undefined;
  const checkRegistry = args.includes('--registry');
  if (tagIndex >= 0 && !tag) throw new Error('--tag requires a value');
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  const errors = validateMetadata({ packageJson, packageLock, workflow, tag });
  if (checkRegistry) {
    if (!tag) errors.push('--registry requires --tag');
    else {
      const fixture = process.env.RELEASE_REGISTRY_STATUS;
      const status = fixture === undefined ? (await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageJson.name)}/${packageJson.version}`)).status : Number(fixture);
      if (!Number.isInteger(status)) errors.push('RELEASE_REGISTRY_STATUS must be an HTTP status code');
      else errors.push(...registryResult(status, packageJson.name, packageJson.version));
    }
  }
  if (errors.length) {
    console.error(`Release metadata check failed:\n- ${errors.join('\n- ')}`);
    process.exitCode = 1;
  } else console.log(`release metadata ok: ${packageJson.name}@${packageJson.version}${tag ? ` (${tag})` : ''}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
