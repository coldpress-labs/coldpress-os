---
name: cli-npm-publishable
description: Archetype-keyed starter pack for CLI tools, libraries, and npm packages (TypeScript + tsup + Vitest + GitHub Actions + changesets)
license: MIT
compatibility: Phase 3
version: "1.0"
---

## Purpose

The `cli-npm-publishable` pack provides a complete starting setup for CLI tools, libraries, and npm packages. Security (npm provenance) and future-proof (TypeScript strict + ES2022) baselines are covered out-of-box.

## Pack Contents

| Skill | Phase | Purpose |
|-------|-------|---------|
| [quickstart](quickstart/) | 3 | Initialize TypeScript project + tsup build + bin entry + Vitest + changesets + GitHub Actions release |

## Pre-Picked Stack

| Area | Choice | Rationale |
|------|--------|-----------|
| Build | tsup | Fast, zero-config TypeScript bundler with CJS + ESM dual output |
| Testing | Vitest | Fast, TypeScript-native, minimal config |
| Release | changesets | Semver + changelog management; works with pnpm |
| CI | GitHub Actions | Publish-on-tag workflow with npm provenance |

All decisions are `overrideable: true`. See `pack.yaml` for the full spec.
