---
id: stack-packs/browser-extension/quickstart
name: Browser Extension Quickstart
version: "1.0"
category: "stack-packs/browser-extension"
description: "Step-by-step workflow to scaffold a WXT browser extension with Manifest V3, Tailwind, Vitest, and a GitHub Actions release pipeline."
inputs:
  - project_name
  - target_browsers
outputs:
  - wxt_project_scaffolded
  - tailwind_configured
  - vitest_configured
  - github_actions_release_workflow
agents:
  primary: "@developer"
---

## Purpose

Guides setup of a WXT browser extension project from zero to a working build that produces `.zip` (Chrome) and `.xpi` (Firefox) artefacts via GitHub Actions.

## Steps

See `workflow.md` for the step index and execution rules.
