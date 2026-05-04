# devcard PRD

Status: building
Decision: proceed

## Product summary

`devcard` is a local-first CLI/library that generates a maintainable developer profile README from explicit local configuration.

It helps developers keep a personal landing page current without handing their identity over to a hosted service or a mysterious automation bot.

## Problem

Developer profile READMEs often fail in one of two ways:

1. They become stale because updating them is annoying.
2. They become over-automated and opaque, which makes maintainers stop trusting the output.

We want a middle path: plain local config in, readable Markdown out, with explicit validation and a lightweight upkeep checklist.

## Inspiration and differentiation

This project is inspired by the adjacent profile README idea space, including <https://github.com/vincentkoc/vincentkoc>, but it does **not** copy implementation. The differentiator is a calmer local-first workflow:

- config lives with the user
- rendering is deterministic
- validation is explicit and conservative
- output remains easy to hand-edit
- maintenance is supported with a checklist, not hidden automation

## Users

Primary users:

- developers who want a polished GitHub profile README
- maintainers who prefer local tooling over SaaS generators
- agents/scripts that need deterministic profile rendering in CI or local workflows

## V1 goals

- Load profile/project config from local JSON.
- Render useful README sections with readable Markdown.
- Validate links and local assets in an explicit `safe` mode.
- Produce an update checklist alongside the rendered content.
- Ship as a usable TypeScript library and CLI.

## Non-goals for V1

- Remote API fetching or auto-enrichment
- Publishing to GitHub or editing repositories automatically
- Telemetry or analytics
- Theming systems or template marketplaces
- Network link health checks

## CLI surface

```sh
devcard generate --config ./devcard.json --output ./README.md --validate safe
```

## Success criteria

- A user can generate a README from fixture config locally.
- Output includes projects, links, and checklist sections.
- Broken local references are surfaced in validation results.
- Docs clearly explain boundaries and safety behavior.
- Tests and smoke checks verify the happy path.

## Risks

- Users may expect remote link health checking; docs must clearly say that is out of scope.
- README preferences are subjective; the structure must remain easy to extend.
- Validation should remain conservative to avoid accidental network creep.

## Verification

- `npm test`
- `npm run check`
- `npm run build`
- `npm run smoke`
- `bash scripts/validate.sh`
