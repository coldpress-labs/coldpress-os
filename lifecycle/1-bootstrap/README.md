---
phase: 1
name: "Bootstrap"
description: "Zero-to-Butler — CLI scaffolds the project, Butler's orient + intake skills collect material and seed intent"
prerequisites: []
outputs:
  - "Scaffolded project (coldpress.yaml, .claude/, CLAUDE.md, _input/, _context/, secure/, scripts/)"
  - "Working development environment verified (`coldpress doctor`)"
  - "Graph index primed at .coldpress/graph/graph.json"
  - "Seed _context/sacred/context.md (one-sentence intent, status: seed)"
  - "Working-mode fields written to coldpress.yaml (user.preferred_ides, user.cadence, user.team_shape)"
  - "phase_1_completed: true recorded in .coldpress/local-config.yaml"
next_phase: "2-discovery"
---

# Phase 1: Bootstrap

> Get from zero to a project where Butler has a healthy scaffold, a graph-indexed `_input/` pile, a one-sentence intent, and working-mode preferences. Then hand off to Phase 2 Discovery.

## What happens here

Phase 1 is split across two surfaces — the CLI (pre-session) and Butler's lifecycle skills (in-session):

### Pre-session — `coldpress` CLI

| Command | Purpose |
|---------|---------|
| `coldpress doctor` | Verify Node ≥ 20, package manager, git ≥ 2.30, Claude Code CLI. `--stack` adds stack-pack checks once Phase 3 has locked a pack. |
| `coldpress init` | Scaffold the project: `coldpress.yaml` + `.claude/` + `CLAUDE.md` + `_input/{assets,vendor,raw,legacy,reference}/` + `_context/` + `secure/` + `scripts/`. Runs `git init` + seed commit + installs pre-commit secret scanner. Flags: `--yes` (non-interactive), `--retrofit` (layer onto existing repo), `--interop <set>` (filter IDE interop outputs), `--skip-doctor`. |
| `coldpress update` | Regenerate interop outputs (`AGENTS.md`, Cursor, Roo, OpenHands, Cline). `--post-phase-3` regens stack-pack-specific skill wrappers. |

### In-session — Butler's Phase 1 skills

Butler runs these at the start of the first session (and on any re-entry):

| Sub-skill | Type | Output |
|-----------|------|--------|
| [orient](orient/) | workflow | Scaffold health report + lifecycle intro + handoff to intake. Cheap; reads only. |
| [intake](intake/) | workflow | Six steps: material solicitation → shape determination → intent seed → working mode → graph prime → gate and route. Writes `context.md` seed, `coldpress.yaml` fields, primes the graph, hands off to Phase 2. |
| [codebase-onboarding](codebase-onboarding/) | workflow | **Conditional** — runs when `_input/legacy/code/` is populated OR on `coldpress init` of an existing repo OR on demand. Three artefacts: directory map, entry-points index, walkthrough (5-10 files in dependency-flow order). Auto-detects language manifest (npm / Python / Rust / Go / Maven / Bundler); emits Phase 3 tech-stack hint. Distinct from Phase 4 `legacy-assessment` (architecture-focused vs code-tour-focused). |

## Entry conditions

- User ran `coldpress init` (or `coldpress init --retrofit`) and the scaffold landed cleanly.
- Butler's `CLAUDE.md` + `.claude/SYSTEM.md` have been loaded for the session.

## Exit conditions

Enforced by the [gate.json](gate.json) contract — `evaluate-phase-gate` runs the 6 checks at the end of intake Step 6:

- **`phase-1-completed-flag`** (block) — `.coldpress/local-config.yaml phase_1_completed: true`
- **`working-mode-captured`** (block) — `user.preferred_ides`, `user.cadence`, `user.team_shape` set in `coldpress.yaml`
- **`butler-display-name-present`** (warn) — default `"Butler"` acceptable
- **`context-seed-authored`** (block) — `_context/sacred/context.md` exists
- **`context-seed-schema-valid`** (block) — frontmatter validates via `validate-schema`
- **`graph-primed`** (warn) — `.coldpress/graph/graph.json` exists; couples with `needs_graph_rebuild` flag for deferred retry
- **`input-subfolders-walked`** (warn) — each `_input/` subfolder has content or a `.intake-skip` marker

## Flow

```
coldpress doctor (pre-flight check)
          ↓
coldpress init [--retrofit] [--interop <set>] [--yes]
          ↓
[user opens Claude Code in the project]
          ↓
orient       — scaffold health, lifecycle intro (first session)
          ↓
intake       — 6 steps, produces context seed + yaml updates + graph
          ↓
gate.json    — 6 acceptance checks
          ↓
@analyst pre-project-interview (Phase 2 Discovery)
```

## Re-entry

- `intake` is `re_runnable: true`. Re-invoking Step 1 (material solicitation) from a later phase ingests new material without corrupting active-phase state. Steps 2-6 are skipped on re-run.
- Orient Step 1 reads `.coldpress/local-config.yaml partial_completion` and resumes intake at the recorded step on next session.
- Phase 3 stack-locking re-invokes intake Step 5 (graph-prime) to re-index with stack-pack-aware context — see [docs/handoff-registry.md](../../docs/handoff-registry.md) row 12.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 1 rewrite. Replaces the submodule-era `machine-setup` + `project-init` + `agent-scaffold` trio (retired in Wave 4) with the npm-era CLI surface (`coldpress doctor` + `coldpress init`) plus Butler's new `orient` + `intake` lifecycle skills (Waves 3.1 + 3.2). Sub-skills table updated. `templates/` reference dropped — the empty directory was removed (finding A5). Entry/exit conditions rewritten around the new 6-check `gate.json`. Pre-Phase-1 CLI note added so readers understand the CLI / in-session split. |
| 1.0 | 2026-04-08 | Alfred | Initial Phase 1 definition |
