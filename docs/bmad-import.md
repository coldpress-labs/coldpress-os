---
name: bmad-import
description: One-way inbound adapter translating BMAD modules into coldpress-os-shaped equivalents; strategic off-ramp, not a continuous bridge
version: "1.0"
---

# BMAD-import bridge (§5.3)

> BMAD (`BMAD-METHOD`) and coldpress-os are adjacent frameworks with overlapping intent and divergent conventions. Users who've invested in BMAD modules — CIS, WDS, `bmm`, or custom — shouldn't have to re-author from scratch when switching. This doc specifies a one-way, lossy, auditable off-ramp.

**Source decision:** [tier3-positioning-brief-2026-04-22.md §8.3](../../../lab-hq-projects/hq-p001-coldpress-os/docs/tier3-positioning-brief-2026-04-22.md) + [bmad-family-positioning-brief-2026-04-23.md](../../../lab-hq-projects/hq-p001-coldpress-os/docs/bmad-family-positioning-brief-2026-04-23.md) §Q5.

---

## Principles

1. **One-way.** There is no outbound coldpress-os → BMAD adapter. coldpress-os's canonical subfolder mapping + phase-gate protocol have no BMAD equivalents to target.
2. **Lossy and auditable.** Every import produces an `ATTRIBUTION.md` listing what was translated, what was dropped, and a review checklist. Users must review before relying on outputs.
3. **Structural, not behavioural.** BMAD runtime orchestration (task-file dispatch, message passing, `<commands>` blocks) does not translate. The adapter translates shape, preserves prose, and flags imports.
4. **Collision-safe by default.** The adapter refuses to overwrite existing target files unless `--overwrite` is passed. Collisions land in `ATTRIBUTION.md` `dropped[]` so they can be reconciled.
5. **Not extended to MetaGPT.** Per the BMAD-family positioning brief §Q5, MetaGPT is adapter-hostile (Python classes with inline prompts, not declarative). Deferred indefinitely.

---

## The CLI

```bash
coldpress import bmad <path-to-bmad-module>
```

Run from the coldpress-os project root. Options:

- `--module-slug <slug>` — override the imported module's slug (default: `config.yaml` `id`, falling back to dirname).
- `--overwrite` — overwrite existing target files (default: refuse; collisions → `dropped[]`).

Exit codes:
- `0` — success (including partial imports with dropped collisions).
- `1` — fatal error (missing `config.yaml`, unreadable source, filesystem errors).

---

## The translation matrix

| BMAD artefact | Coldpress-os target | Transformation |
|---------------|---------------------|----------------|
| `config.yaml` | Module metadata (no file emitted) | Parsed for id / name / version / licence. |
| `agents/<name>.md` | `.claude/agents/bmad-<module>-<name>.md` | Body preserved verbatim; synthesised frontmatter (model, tools, colour); original BMAD frontmatter preserved in a `<details>` block. |
| `workflows/<name>/workflow.yaml` + step files | `coldpress-os/skills/meta/bmad-imports/<module>/<name>/SKILL.md` | SKILL.md frontmatter synthesised; step files **listed as opaque references** (no logic synthesis); original YAML preserved in a fenced block. |
| `templates/**/*` | `coldpress-os/templates/imports/<module>/**/*` | Text files get `@coldpress-os:imported-from=bmad` header; binary files copy verbatim. |
| `module-help.csv` | _(not parsed)_ | Referenced in `ATTRIBUTION.md` "known non-translating concerns"; port manually. |
| Runtime task-file dispatch | _(not translatable)_ | Flagged in `ATTRIBUTION.md`. |

---

## The `@coldpress-os:imported-from=bmad` marker

Every file the adapter writes carries this marker (as a comment appropriate to the file's syntax):

- Markdown: `<!-- @coldpress-os:imported-from=bmad -->`
- YAML / CSV / TXT: `# @coldpress-os:imported-from=bmad module=<slug> file=<filename>`
- JSON: _(no comment syntax; marker is skipped)_

Markers let skill-index tooling filter imports out of coldpress-os-native listings, and give humans a clear "this came from elsewhere" signal. Once a file has been hand-reviewed and finalised as coldpress-os-native, the marker can be removed.

---

## The `ATTRIBUTION.md` manifest

Written at `coldpress-os/skills/meta/bmad-imports/<module>/ATTRIBUTION.md` on every import:

- **Source** — original module path (at import time), id, name, version, licence.
- **What was imported** — agents × skills × templates tables with source → target mappings.
- **What was dropped** — every file the adapter refused to overwrite, with the reason.
- **Known non-translating concerns** — runtime orchestration, `<commands>`, `module-help.csv` — documented per import so downstream reviewers know what to port manually.
- **Licence note** — BMAD upstream terms apply; coldpress-os does not re-licence imported material.
- **Review checklist** — the gate for taking imports into production.

---

## Known non-translating concerns

- **BMAD runtime orchestration** (task-file dispatch, inter-agent messaging) uses a different paradigm than coldpress-os's phase-gate + subagent dispatch model. Imported workflows are structural placeholders.
- **BMAD agent `<commands>` blocks** — coldpress-os agents don't have a named-command slot. Refactor these into individual skills.
- **`module-help.csv`** — not parsed; reference manually when porting.
- **Agent model / tool choices** — the adapter picks conservative defaults (`sonnet`, standard tool set). Tighten per agent based on role.

---

## Testing

- **Unit fixture:** `test/fixtures/bmad-minimal/` — hand-authored minimal BMAD shape. Covers: agents with + without original frontmatter, a workflow with `workflow.yaml` + step files, a template, and a `module-help.csv`. 12 tests in `test/bmad-import.test.ts` exercise every transformation, collision semantics, slug override, and error paths.
- **Real-module validation** against CIS, WDS, and BMAD's `bmm` core is **deferred** pending local fixture availability. When that lands, add a fixture per module under `test/fixtures/` and a corresponding smoke-test asserting ≥N agents / skills / templates import cleanly.

---

## Why not MetaGPT import

Per the [BMAD-family positioning brief §Q5](../../../lab-hq-projects/hq-p001-coldpress-os/docs/bmad-family-positioning-brief-2026-04-23.md), MetaGPT encodes agents as Python classes with inline prompts and hard-coded orchestration. It is adapter-hostile: there is no declarative surface to translate. Porting would require a full Python-class-to-coldpress-agent semantic transpiler, which is out of scope and likely always will be. **MetaGPT inbound is deferred indefinitely.**

Separately, MetaGPT's valuable ideas (prompt patterns, `<NEED_INFO>` style dehallucination) are ported as discrete patterns, not as a wholesale import bridge — see Block AA (`<NEED_INFO>` protocol, §5.4) and the prompt-pattern migrations in Wave 6.

---

## Extending

### Handling a BMAD module convention the adapter misses

If a real BMAD module uses a file layout or naming convention our minimal fixture doesn't cover:

1. Add a fixture under `test/fixtures/bmad-<variant>/` exercising the new convention.
2. Add a test in `test/bmad-import.test.ts` asserting the expected output.
3. Update `src/imports/bmad.ts` to handle the new case.
4. Update the translation matrix table above.

### Changing defaults for imported agents

Edit `renderAgent()` in `src/imports/bmad.ts`. Current defaults (model `sonnet`, standard tool set, `color: purple`, `maxTurns: 20`, `effort: medium`) are conservative and intended to be tightened by the reviewer — not to be silently "correct".

---

## See also

- [skill-index.md](skill-index.md) — global skill registry; imported skills appear under `skills/meta/bmad-imports/`.
- [templates-registry.md](templates-registry.md) — global template registry; imported templates appear under `templates/imports/`.
- [agent-skills-compatibility.md](agent-skills-compatibility.md) — coldpress-os's outbound agent-format generator (the reverse direction: coldpress-os → AGENTS.md / Cursor / etc.).
