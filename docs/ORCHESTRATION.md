# devcard orchestration

Owner: isolated OpenClaw sub-agent for the 2026-05-05 OSS factory run.

## Objective

Ship a complete local-first MVP with verifiable docs, fixtures, tests, packaging, and publish steps.

## Workstreams

1. Define scope and safety boundaries in the PRD.
2. Implement the TypeScript library modules for config, validation, rendering, and generation.
3. Add CLI entrypoint and smoke coverage.
4. Add fixtures, examples, and contributor-facing docs.
5. Verify locally, initialize git, create atomic commits, publish, and attempt branch protection.

## Guardrails

- Work only in this repository.
- No hidden network calls in product code.
- Publishing is explicit and manual at the repo level only.
- Preserve attribution to inspiration without copying implementation.
