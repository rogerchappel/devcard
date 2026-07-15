# Profile README Refresh Demo

This walkthrough shows how `devcard` turns a plain JSON profile into a
reviewable Markdown profile README without network calls or publishing steps.

## Use the checked-in fixture

Build the local CLI:

```sh
npm run build
```

Generate a disposable README from the bundled fixture:

```sh
node bin/devcard.js generate \
  --config fixtures/basic/devcard.json \
  --output .tmp/devcard-demo/README.generated.md \
  --validate safe
```

Confirm the output was written:

```sh
test -s .tmp/devcard-demo/README.generated.md
```

The generated Markdown includes the profile sections rendered by `devcard`,
the local validation summary, and the update checklist when the config enables
it.

## Repeat the demo in one command

```sh
bash demo/run-profile-readme-demo.sh
```

The script builds the CLI, writes `.tmp/devcard-demo/README.generated.md`, and
checks for fixture-backed text so the demo fails clearly if rendering changes.

## What to show

- The input is ordinary JSON in `fixtures/basic/devcard.json`.
- The output is editable Markdown, not a hosted page.
- `--validate safe` checks local file references and non-HTTPS links without
  fetching remote URLs.
- The checklist makes profile README maintenance repeatable.

## Boundaries

- Do not claim `devcard` publishes the README.
- Do not claim it validates remote URLs.
- Do not claim adoption or benchmark results.
