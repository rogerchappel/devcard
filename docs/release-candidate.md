# Release candidate readiness

Target version: 0.1.1

## Local verification

- [ ] `npm ci`
- [ ] `npm run release:check`
- [ ] `bash scripts/validate.sh`
- [ ] ReleaseBox readiness check in the release workflow

## ReleaseBox notes

The release workflow publishes the verified package to npm with provenance and
attaches the same tarball to the GitHub release. `releasebox.config.json` must
therefore keep both npm publishing and GitHub release creation enabled.

After the `v0.1.1` tag workflow succeeds, run
`npm view devcard@0.1.1 version` and confirm that it returns `0.1.1`.

## Reviewer checklist

- [ ] Confirm package metadata and repository links are correct.
- [ ] Confirm README/usage docs match the current CLI/API surface.
- [ ] Confirm release notes/changelog are ready for the intended version.
- [ ] Re-run the release checks in CI or locally before tagging.
