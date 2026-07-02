---
phase: 1
name: "Bootstrap"
description: "Zero-to-Butler — CLI scaffolds the project, Butler's intake skill collects material and authors the project's context"
prerequisites: []
outputs:
  - "Scaffolded project (coldpress.yaml, .claude/, CLAUDE.md, _input/, _context/, secure/, scripts/)"
  - "Working development environment verified (`coldpress doctor`)"
  - "Fully authored _context/sacred/context.md (status: authored, sacred-signed-off)"
  - "Working-mode fields written to coldpress.yaml (user.preferred_ides, user.cadence, user.team_shape)"
  - "phase_1_completed: true recorded in .coldpress/local-config.yaml"
next_phase: "2-discovery"
---

# Phase 1: Bootstrap

> Get from zero to a project where Butler has a healthy scaffold, a walked `_input/` pile, and a fully authored `context.md`. Then hand off to Phase 2 Discovery.

## What happens here

Phase 1 is split across two surfaces — the CLI (pre-session) and Butler's lifecycle skill (in-session):

### Pre-session — `coldpress` CLI

| Command | Purpose |
|---------|---------|
| `coldpress doctor` | Verify Node ≥ 20, package manager, git ≥ 2.30, Claude Code CLI. `--stack` adds stack-pack checks once Phase 3 has locked a pack. |
| `coldpress init` | Scaffold the project: `coldpress.yaml` + `.claude/` + `CLAUDE.md` + `_input/{assets,vendor,raw,legacy,reference}/` + `_context/` + `secure/` + `scripts/`. Runs `git init` + seed commit + installs pre-commit secret scanner. Flags: `--yes` (non-interactive), `--retrofit` (layer onto existing repo), `--interop <set>` (filter IDE interop outputs), `--skip-doctor`. |
| `coldpress update` | Regenerate interop outputs (`AGENTS.md`, Cursor, Roo, OpenHands, Cline). `--post-phase-3` regens stack-pack-specific skill wrappers. |

### In-session — Butler's Phase 1 skill

Butler runs this at the start of the first session (and on any re-entry):

| Sub-skill | Type | Output |
|-----------|------|--------|
| [intake](intake/) | workflow | Thirteen steps: mode detect → greeting → sanity check → lifecycle intro → material solicitation → shape determination → intent seed → vision → users → constraints → synthesize → working mode → gate and route. Writes a fully authored `context.md`, `coldpress.yaml` fields, hands off to Phase 2. |
| [codebase-onboarding](codebase-onboarding/) | workflow | **Conditional** — runs when `_input/legacy/code/` is populated OR on `coldpress init` of an existing repo OR on demand. Three artefacts: directory map, entry-points index, walkthrough (5-10 files in dependency-flow order). Auto-detects language manifest (npm / Python / Rust / Go / Maven / Bundler); emits Phase 3 tech-stack hint. Distinct from Phase 4 `legacy-assessment` (architecture-focused vs code-tour-focused). |

## Entry conditions

- User ran `coldpress init` (or `coldpress init --retrofit`) and the scaffold landed cleanly.
- Butler's `CLAUDE.md` + `.claude/SYSTEM.md` have been loaded for the session.

## Exit conditions

Enforced by the [gate.json](gate.json) contract — `evaluate-phase-gate` runs the checks at the end of intake Step 13:

- **`phase-1-completed-flag`** (block) — `.coldpress/local-config.yaml phase_1_completed: true`
- **`working-mode-captured`** (block) — `user.preferred_ides`, `user.cadence`, `user.team_shape` set in `coldpress.yaml`
- **`butler-display-name-present`** (warn) — default `"Butler"` acceptable
- **`context-authored`** (block) — `_context/sacred/context.md` exists with frontmatter `status: authored` (not merely `seed`)
- **`context-schema-valid`** (block) — frontmatter validates via `validate-schema`
- **`input-subfolders-walked`** (warn) — each `_input/` subfolder has content or a `.intake-skip` marker

## Flow

```
coldpress doctor (pre-flight check)
          ↓
coldpress init [--retrofit] [--interop <set>] [--yes]
          ↓
[user opens Claude Code in the project]
          ↓
intake — 13 steps: check-in → material → shape → context.md (seed → authored) → working mode
          ↓
gate.json — acceptance checks
          ↓
@analyst research (Phase 2 Discovery)
```

## Re-entry

- `intake` is `re_runnable: true`. Re-invoking at Step 5 (material solicitation) from a later phase ingests new material without corrupting active-phase state. Steps 6-13 are skipped on re-run.
- Step 1 (mode detect) reads `.coldpress/local-config.yaml partial_completion` and resumes intake at the recorded step on next session.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-02 | Butler | WS5-B (§8 item 6) — `orient` and `pre-project-interview` absorbed into `intake` (13 steps, one entry skill). `context.md` now reaches `status: authored` within Phase 1 itself; removed the dead graph-prime exit condition (`coldpress graph rebuild` was deleted in WS0 §8 item 1). Flow diagram, exit-condition list, and sub-skill table updated to match. |
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 1 rewrite. Replaces the submodule-era `machine-setup` + `project-init` + `agent-scaffold` trio (retired in Wave 4) with the npm-era CLI surface (`coldpress doctor` + `coldpress init`) plus Butler's new `orient` + `intake` lifecycle skills (Waves 3.1 + 3.2). Sub-skills table updated. `templates/` reference dropped — the empty directory was removed (finding A5). Entry/exit conditions rewritten around the new 6-check `gate.json`. Pre-Phase-1 CLI note added so readers understand the CLI / in-session split. |
| 1.0 | 2026-04-08 | Alfred | Initial Phase 1 definition |
