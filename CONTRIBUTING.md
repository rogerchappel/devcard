# Contributing to devcard

Thanks for helping make `devcard` more useful and less weird.

## Ground rules

- Keep changes small and reviewable.
- Prefer explicit behavior over clever hidden behavior.
- Preserve the local-first promise.
- Document user-visible behavior changes in README, docs, or tests.
- Do not introduce telemetry or network access without a very explicit design discussion.

## Setup

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
```

## Change types we especially like

- safer validation
- better README rendering
- clearer fixtures and examples
- test coverage for edge cases
- docs that help future maintainers move faster

## Pull requests

Please include:

- what changed
- why it changed
- how you verified it
- any tradeoffs or known follow-ups

If your change affects output shape, include a before/after example or fixture update.

## Commit style

Conventional Commits preferred:

- `feat:` new user-facing capability
- `fix:` bug fix
- `docs:` documentation only
- `test:` test-only change
- `refactor:` structure changes without behavior change
- `chore:` maintenance

## Safety expectations

Before merging changes, ask:

- Does this keep behavior deterministic?
- Does this avoid hidden network calls?
- Would a maintainer understand this from the docs and tests?
- Is validation still explicit and unsurprising?

## Verification

The smallest good verification bar for most changes is:

```sh
npm test
npm run check
npm run build
npm run smoke
```

For a fuller local gate:

```sh
bash scripts/validate.sh
```
