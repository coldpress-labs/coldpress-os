---
workflow_version: "1.0"
output_file: "./"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Sets up a TypeScript CLI / library project with tsup build, Vitest, changesets, and a GitHub Actions release pipeline.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | step-01-init-ts.md | Initialize TypeScript project + `package.json` fields |
| 2 | step-02-tsup.md | Configure tsup + CJS/ESM dual build |
| 3 | step-03-bin-clack.md | Set up bin entry + CLI framework (clack/commander/yargs) |
| 4 | step-04-vitest-changesets.md | Add Vitest + changesets + GitHub Actions release workflow |
| 5 | step-05-verify.md | Verify `npm run build` + `npm test` + `npm pack --dry-run` |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **State is tracked** in the output document's YAML frontmatter.
5. **Resumable.** On interruption, resume from the last completed step.

## Completion Criteria

- `pnpm run build` exits 0 — produces `dist/` with CJS + ESM outputs
- `pnpm test` exits 0 — Vitest passes
- `npm pack --dry-run` exits 0 — tarball includes `dist/` and `README.md`
- `.changeset/` initialized
- `.github/workflows/release.yml` present
