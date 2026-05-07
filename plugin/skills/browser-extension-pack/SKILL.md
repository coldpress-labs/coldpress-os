---
name: browser-extension-pack
description: Stack pack for browser extensions — WXT + Manifest V3 + Tailwind + Vitest + GitHub Actions release producing .zip (Chrome) and .xpi (Firefox).
license: MIT
compatibility: Reusable across phases
version: "1.0"
---

## Purpose

Applies the browser-extension stack to a new project. Sets up WXT with Manifest V3, Tailwind styling, Vitest for unit tests, and a GitHub Actions workflow that produces a `.zip` for Chrome and `.xpi` for Firefox on each release.

## When to Use

Dispatched during `env-provision` when `stack_pack: "browser-extension"` is selected at stack-locking. Suitable for productivity tools, devtools extensions, or any Chromium/Firefox extension.

## Pack Stack

| Layer | Choice |
|-------|--------|
| Framework | WXT |
| Manifest | v3 (Chrome + Firefox compatible) |
| Styling | Tailwind CSS |
| Testing | Vitest |
| Release | GitHub Actions → .zip + .xpi |
| Package manager | pnpm |

## Quickstart

Run the quickstart workflow at `quickstart/workflow.md`. Five steps: init WXT project → configure manifest v3 → add Tailwind → add Vitest → verify build + pack.
