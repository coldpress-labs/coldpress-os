---
name: bmad-import
description: One-way inbound adapter that translates a BMAD module directory (config.yaml + agents/ + workflows/ + templates/) into coldpress-os-shaped equivalents
license: MIT
compatibility: Invoked by @butler
version: "1.0"
---

## Purpose

Translate a [BMAD](https://github.com/bmadcode/BMAD-METHOD) module (orchestrator agents + workflows + templates packaged as a directory) into coldpress-os-shaped equivalents so a BMAD user can carry over the structural investment when adopting coldpress-os.

**Explicit non-goal: full behavioural fidelity.** BMAD's runtime orchestration (task-file dispatch, inter-agent message passing, `<commands>` blocks) does not carry over. Imported outputs are structural placeholders with the original prose preserved; **review + port step-level behaviour manually** before relying on them.

**Source decision:** [tier3-positioning-brief-2026-04-22.md §8.3](../../../lab-hq-projects/hq-p001-coldpress-os/docs/tier3-positioning-brief-2026-04-22.md) — the bmad-import bridge is strategic: it gives BMAD users a one-time off-ramp into coldpress-os without forcing them to re-author from scratch.

## When to Use

- A user is adopting coldpress-os and has existing BMAD modules (CIS, WDS, BMAD's `bmm` core, or a custom module) whose structure they want preserved.
- You want to audit what a BMAD module "is" in coldpress-os terms — the adapter's output makes the structural translation concrete.

## Prerequisites

- `coldpress` CLI on PATH (adapter ships with the core package; no separate install).
- A BMAD module directory accessible on the local filesystem. Must contain `config.yaml`.
- Intent to hand-review the output — **this is not a push-button migration**.

## Process

1. Run the CLI from the project root:
   ```bash
   coldpress import bmad <path-to-bmad-module>
   ```
   Options:
   - `--module-slug <slug>` — override the module slug (default: from `config.yaml` `id` field, falling back to directory basename).
   - `--overwrite` — overwrite existing files in the target. Default: **refuse** (collisions land in `ATTRIBUTION.md`'s `dropped[]` list so you can reconcile).

2. The adapter reads the BMAD module:
   - **`config.yaml`** → module metadata (id / name / version / licence).
   - **`agents/<name>.md`** → `.claude/agents/bmad-<module>-<name>.md`. The persona body is preserved as-is; frontmatter is synthesised (default model `sonnet`, standard tool set, `color: purple` to visually flag imports). Any original BMAD frontmatter is preserved in a collapsed `<details>` block for reference.
   - **`workflows/<name>/`** → `coldpress-os/skills/meta/bmad-imports/<module>/<name>/SKILL.md`. One skill per workflow. Step files are listed as opaque references — the adapter **does not** fake step logic in coldpress-os Process-section form. The original `workflow.yaml` is preserved in a fenced block.
   - **`templates/`** → `coldpress-os/templates/imports/<module>/`. Straight file copy; text files get a `@coldpress-os:imported-from=bmad` comment header (Markdown HTML comment, YAML/CSV `#` comment). Binary files copy verbatim.

3. Writes `ATTRIBUTION.md` at `coldpress-os/skills/meta/bmad-imports/<module>/ATTRIBUTION.md` listing:
   - Source module path + metadata
   - Every agent / workflow / template imported (source → target mapping)
   - Every dropped item with the reason (almost always: "target exists; --overwrite not set")
   - Known non-translating concerns (runtime orchestration, `<commands>` blocks, `module-help.csv`)
   - Licence note (BMAD terms apply to imported material; coldpress-os does not re-licence)
   - Review checklist before the imports go into commits

4. Exits `0` on success (including partial imports where collisions were skipped), `1` on fatal errors (no `config.yaml`, unreadable source).

## The lossy-translation contract

- **What the adapter WILL do:** preserve prose, preserve file structure, preserve original BMAD frontmatter, mark imports clearly with `@coldpress-os:imported-from=bmad`, list everything in `ATTRIBUTION.md`.
- **What the adapter WON'T do:** synthesise coldpress-os Process logic from BMAD step files, translate BMAD `<commands>` blocks into coldpress-os skills, port `module-help.csv` into coldpress-os structure, re-licence imported material, overwrite existing files without `--overwrite`.

## Tested against

- `test/fixtures/bmad-minimal/` — hand-authored BMAD-shaped fixture exercising each transformation (agents with + without frontmatter, workflow with + without `workflow.yaml`, templates, `module-help.csv` presence).
- **Real-module validation** against CIS, WDS, and BMAD's `bmm` core is **deferred** pending local fixture availability — Block Y scanner-install precedent. Call this out explicitly because the adapter's heuristics may need tweaking for real-world BMAD conventions.

## What this skill does NOT do

- **MetaGPT inbound** — explicitly out of scope. Per the BMAD-family positioning brief §Q5, MetaGPT is adapter-hostile (Python classes with inline prompts, not declarative). Deferred indefinitely.
- **Outbound export** (coldpress-os → BMAD) — not planned. coldpress-os's canonical subfolder mapping + phase-gate protocol don't have BMAD equivalents to export into.
- **Bi-directional sync** — this is a one-time off-ramp, not a continuous bridge.

## Licence

BMAD upstream licence terms apply to all imported material. coldpress-os's adapter code (`src/imports/bmad.ts`) is MIT. Review BMAD's specific terms before redistributing the imported artefacts.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial BMAD-import bridge — part of Wave 5 Block Z §5.3. Wired as `coldpress import bmad` CLI subcommand. Tested against `test/fixtures/bmad-minimal/`. Real-module (CIS/WDS/bmm) validation deferred pending local fixture availability. |
