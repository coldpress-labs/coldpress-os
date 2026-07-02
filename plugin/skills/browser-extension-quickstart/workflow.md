---
workflow_version: "1.0"
output_file: "./"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Sets up a WXT browser extension with Manifest V3, Tailwind CSS, Vitest, and a GitHub Actions release workflow that produces `.zip` (Chrome) and `.xpi` (Firefox) artefacts.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | step-01-init-wxt.md | Init WXT project + choose popup/content-script/background scaffolds |
| 2 | step-02-manifest-v3.md | Configure Manifest V3 with minimal permissions |
| 3 | step-03-tailwind.md | Add Tailwind CSS |
| 4 | step-04-vitest-actions.md | Add Vitest + GitHub Actions release workflow (.zip + .xpi) |
| 5 | step-05-verify.md | Verify dev, build, and artefact output |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **State is tracked** in the output document's YAML frontmatter.
5. **Resumable.** On interruption, resume from the last completed step.

## Completion Criteria

- `pnpm dev` launches a hot-reload dev build
- `pnpm build` exits 0 — produces `.output/chrome-mv3/` and `.output/firefox-mv3/`
- `pnpm zip` exits 0 — produces `.output/<name>-chrome.zip` and `.output/<name>-firefox.xpi`
- Vitest passes
- `.github/workflows/release.yml` present, producing `.zip` + `.xpi` artefacts
