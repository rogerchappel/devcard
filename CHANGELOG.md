# Changelog

All notable changes to this project will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and aims for semantic versioning once releases begin.

## [Unreleased]

## [0.1.1] - 2026-08-06

### Added

- Local-first TypeScript CLI and library for generating developer profile READMEs.
- Explicit validation modes for links and local assets.
- Fixture-backed tests and CLI smoke coverage.
- Project docs, examples, and contribution/security guidance.
- npm package allowlist now includes docs and support files needed to evaluate a
  release-candidate install.
- Package smoke coverage now installs the packed tarball and exercises both the
  installed CLI and the documented library API.

### Changed

- Tagged releases now publish the verified package to npm with provenance before
  retaining the tarball in the GitHub release.

## Release links

- Unreleased: <https://github.com/rogerchappel/devcard/compare/v0.1.1...HEAD>
- 0.1.1: <https://github.com/rogerchappel/devcard/compare/v0.1.0...v0.1.1>
- Latest release: <https://github.com/rogerchappel/devcard/releases/latest>
