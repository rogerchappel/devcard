# devcard Promotion Hooks

## Grounded facts

- `devcard` reads a local JSON profile file.
- It renders deterministic Markdown profile sections.
- It supports explicit `safe` or `none` validation modes.
- It does not fetch remote URLs, publish files, phone home, or run telemetry.
- The bundled fixture can generate a disposable profile README for demos.

## Short posts

1. Profile READMEs rot because they are edited from memory. `devcard` keeps the
   source in JSON, renders Markdown locally, and leaves an update checklist.
2. A profile README generator should not need a hosted account. `devcard`
   builds one from a local file and keeps the result reviewable.
3. Demo angle: JSON profile in, Markdown profile README out, with a validation
   summary and no remote URL fetching.

## Video outline

1. Open `fixtures/basic/devcard.json`.
2. Run `bash demo/run-profile-readme-demo.sh`.
3. Show `.tmp/devcard-demo/README.generated.md`.
4. Point out the validation summary and update checklist.
5. Close with the boundary: local generation only, no publishing.
