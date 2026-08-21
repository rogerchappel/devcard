# devcard

A local-first README generator for developers who want a profile page that stays editable, reviewable, and a little less embarrassing over time.

`devcard` reads a plain JSON profile file, renders maintainable Markdown sections, performs **explicit** validation, and leaves you with an update checklist instead of a magical black box.

> Inspired by the idea space around profile README generators, including <https://github.com/vincentkoc/vincentkoc>. This project is a fresh implementation focused on local-first workflows, explicit safety boundaries, and maintainable output.

## Why this exists

Profile READMEs rot fast. They start sincere, then quietly become a museum of last year's priorities.

`devcard` keeps things simple:

- local config in your repo or dotfiles
- deterministic Markdown output
- no hidden network calls
- explicit validation mode choices
- a checklist so updating your card becomes a repeatable ritual instead of a shame spiral

## Install

`devcard` is not yet available from the npm registry. Until `v0.1.1` is
published, install and run it from a source checkout:

```sh
npm ci
npm run build
node dist/cli.js generate --config fixtures/basic/devcard.json --output ./README.generated.md
```

After `v0.1.1` is published, install the CLI with
`npm install --global devcard`, or add `devcard` as a project dependency when
using the library API.

## Quickstart

1. Copy `examples/devcard.json` into your project or dotfiles.
2. Edit your profile data.
3. Generate Markdown:

```sh
devcard generate --config ./devcard.json --output ./README.md --validate safe
```

### Validation modes

- `safe` — validates website, writing, project, and email targets; checks local paths used by custom links; and warns on HTTP links.
- `none` — skip validation entirely.

This tool **does not** fetch remote URLs, scrape services, publish anything, or phone home.

## Config shape

```json
{
  "profile": {
    "name": "Your Name",
    "tagline": "What you build and why it matters.",
    "website": "https://your-site.example",
    "focus": ["What you care about right now"],
    "projects": [
      {
        "name": "Project name",
        "description": "Short summary",
        "repo": "https://github.com/yourname/project",
        "status": "active"
      }
    ]
  }
}
```

See `examples/devcard.json` and `fixtures/basic/devcard.json` for fuller examples.

For a fixture-backed walkthrough that generates a disposable profile README,
see [docs/tutorials/profile-readme-refresh.md](docs/tutorials/profile-readme-refresh.md)
or run:

```sh
bash demo/run-profile-readme-demo.sh
```

## Output sections

`devcard` currently renders:

- intro
- focus
- now
- stack
- links
- projects
- writing
- notes
- validation summary
- update checklist

The output is meant to be readable Markdown you can keep editing by hand if you want.

## Library usage

```ts
import { generateFromConfig } from 'devcard';

await generateFromConfig('./devcard.json', './README.generated.md', {
  validationMode: 'safe',
});
```

## Safety notes

- Local-first by default.
- No telemetry.
- No automatic publishing.
- No hidden network validation.
- Validation is intentionally conservative and explicit.

If you want remote link checking later, make it opt-in and obvious.

Promotion-safe copy and video angles are drafted in
[docs/promo/social-hooks.md](docs/promo/social-hooks.md).

## Development

```sh
npm install
npm run audit:dependencies
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

## Releases

Pushing a semantic-version tag such as `v0.2.0` runs the full
`npm run release:check`, publishes the resulting package to npm with provenance,
and attaches the same tarball to a GitHub release. The tag version must match
the version in `package.json`. The local check also verifies both root versions
in `package-lock.json` and the workflow ordering. On a tagged run,
`npm run release:preflight` fails before packing if the tag is not exactly
`v<package.json version>`, npm is unavailable, or the version already exists.

Publishing uses npm trusted publishing rather than a long-lived npm token. The
npm package must configure this GitHub repository and the
`.github/workflows/release.yml` workflow as a trusted publisher. The GitHub
Actions environment needs `id-token: write`; no `NPM_TOKEN` secret is required.

For the next release, merge the release-readiness change and tag the resulting
commit as `v0.1.1`. After the workflow succeeds, verify the registry before
announcing the release:

```sh
npm view devcard@0.1.1 version
```

The command must return `0.1.1`.

## Contributing

Small, verified changes are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT
