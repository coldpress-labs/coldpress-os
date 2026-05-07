---
name: quickstart
description: "Initialize a cli-npm-publishable project: TypeScript + tsup + bin entry + Vitest + changesets + GitHub Actions release workflow"
license: MIT
compatibility: Invoked by @developer in Phase 3
version: "1.0"
---

## Purpose

Scaffolds a TypeScript CLI or library project with a production-ready build pipeline, test setup, and npm release workflow via changesets + GitHub Actions.

## When to Use

- `stack_pack: "cli-npm-publishable"` is set in `coldpress.yaml`
- env-provision Step 0 dispatches to this skill (pack-branch)

## Process

→ See [workflow.md](workflow.md) for the full process.

## Output

- `package.json` with `type: "module"`, `bin`, `exports`, `files` fields set
- `tsup.config.ts` — CJS + ESM dual build
- `src/index.ts` + `src/cli.ts` entry points
- `vitest.config.ts` + sample test
- `.changeset/` directory initialized
- `.github/workflows/release.yml` — publish on changeset tag with npm provenance
- `npm run build`, `npm test`, `npm pack --dry-run` all pass
