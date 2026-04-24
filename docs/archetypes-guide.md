---
name: archetypes-guide
description: Project archetypes specialise the framework within the 9-phase spine — never fork it. Schema + 4 v1 manifests (app-build / data-heavy / infrastructure / research) + loader, with override-application deferred until init.ts settles
version: "1.0"
---

# Project Archetypes (§6.3)

> Coldpress-os ships one canonical 9-phase lifecycle, ten subagents, and a global skill registry. But not every project is a user-facing app — some are data pipelines, some are IaC, some are research. Forking the lifecycle for each variant would balloon maintenance and fragment best-practice. Archetypes solve this by **specialising the framework within the 9-phase spine** — different subagents at specific phases, different skill palettes, different template presets — without forking the spine itself.

**Source decision:** plan §6.3, sourced from BMAD-family positioning brief + MetaGPT Data Interpreter pattern.

---

## Hard rule — never fork the spine

The 9 phases (`1-bootstrap` through `9-evolve`) are universal. Every phase has the same canonical exit gate, the same sacred-doc lineage, the same wave structure. An archetype:

- ✅ Swap which subagent owns a specific phase (e.g. `data-heavy` swaps `@developer` for `data-interpreter` at Phase 6).
- ✅ Disable / enable specific skills from the global registry.
- ✅ Override template presets (different PRD shape for research vs. app-build).
- ❌ Add or remove phases.
- ❌ Change the phase-gate JSON schema.
- ❌ Change the sacred-doc identity (PRD is always `_context/sacred/prd.md` regardless of archetype shape).
- ❌ Bypass governance (sacred-doc protection applies to all archetypes).

If a project's needs genuinely don't fit the spine, that's not an archetype — that's a different framework. Archetypes are tuning knobs, not escape hatches.

---

## The 4 v1 archetypes

Shipped at [`install/archetypes/`](../install/archetypes/):

| id | Status | Status quo | What it changes |
|----|--------|-----------|-----------------|
| `app-build` | stable | Default. No overrides. | The reference contract for "default coldpress-os". |
| `data-heavy` | experimental | Phase 6 owned by `data-interpreter` (variant of @developer). | PRD template leads with Hypothesis / Dataset / Success Metrics. Disables `quick-dev`. |
| `infrastructure` | experimental | Phase 4 owned by `@architect` directly (collapses @pm). | PRD template leads with Topology / SLO / Cost-target. Architecture template adds Network Diagram + Failure Modes + DR sections. |
| `research` | experimental | Phase 6 owned by `@analyst` (research-as-impl). | PRD leads with Research Question / Hypotheses. Disables `quick-dev`, `deploy`, `readiness-check`, `env-check`. |

**Adding the 5th:** drop `install/archetypes/<slug>.yaml`, add the slug to `SHIPPED_ARCHETYPES` in [`schemas/archetype.schema.ts`](../schemas/archetype.schema.ts), update the table here. The disk↔registry coverage test (`test/archetypes.test.ts`) catches drift.

---

## Manifest shape

Schema at [`schemas/archetype.schema.ts`](../schemas/archetype.schema.ts):

```yaml
schema_version: 1
id: my-archetype                  # kebab-case; must match filename
name: "Human title"
description: >
  One-paragraph what-this-archetype-is-for.
status: experimental | stable
priority: 30                      # 0-100 (default 0); reserved for future smart-detect

subagent_overrides:               # phase-specific subagent swaps
  - phase: 6                      # 1-9
    replace: developer
    replace_with: data-interpreter
    reason: "one-line rationale"

skill_overrides:
  disable: [skill-slug, ...]      # opt out of universal skills
  enable:  [skill-slug, ...]      # opt in to archetype-specific skills (rare)

template_overrides:
  - template: prd                 # canonical template id from templates/documents/
    source: archetypes/<id>/prd.md  # path under install/, resolved at apply time
    reason: "one-line rationale"

notes: |
  Free-form, not consumed programmatically.
```

Validation invariants:
- `phase` ∈ 1..9.
- `id` must match the YAML filename basename.
- `disable` and `enable` cannot overlap (a skill is in one list or the other, never both).
- `priority` ∈ 0..100.
- `schema_version` pinned to literal `1`; future bumps require a migration.

---

## Loader API

```ts
import {
  loadArchetype,
  loadShippedArchetypes,
  isShippedArchetype,
  ArchetypeNotFoundError,
  ArchetypeManifestError,
} from "@coldpress/core/archetypes";

const data = await loadArchetype("data-heavy");
//   ↑ ArchetypeManifest — fully validated

const all = await loadShippedArchetypes();
//   ↑ ArchetypeManifest[] in registry order

isShippedArchetype("research"); // true
isShippedArchetype("notreal");  // false
```

Errors are typed: `ArchetypeNotFoundError` (slug not on disk) and `ArchetypeManifestError` (YAML parse failure / schema-violation / id↔filename mismatch). Both surface specific issue paths for human-readable error messages.

---

## CLI wiring — DEFERRED

`coldpress init --archetype <name> my-project` selection at scaffold time is part of plan §6.3 but **deferred from Block FF**. Rationale: `src/commands/init.ts` is in active flux (init-non-interactive flow + git-init + pre-commit-hook setup) at Block FF time; layering `--archetype` on top would collide and risk breaking the in-flight refactor.

**Block FF ships the substrate** (schema + manifests + loader + tests + this doc) so the CLI integration is a small follow-up commit once init.ts settles. The substrate is sufficient for any consumer (CLI, dashboard, smart-detect) to read manifests today.

When the CLI lands, the apply-time logic will:
1. Resolve the archetype (default `app-build` if no `--archetype`).
2. After `copyTemplate(...)` runs, walk `subagent_overrides[]` and replace `.claude/agents/<replace>.md` with the variant.
3. Walk `skill_overrides.disable` and skip wrapper generation for those skills under `.claude/skills/`.
4. Walk `template_overrides[]` and replace the targeted templates with the archetype's variants.
5. Print the override list to the user with each `reason` so they understand what changed and why.
6. Write the resolved archetype to `coldpress.yaml` `archetype: <slug>` so future `coldpress` commands see it.

---

## What the data-interpreter / IaC / research-impl variants look like

The `data-heavy.yaml` and `research.yaml` manifests reference subagent variants (`data-interpreter`, `analyst-as-impl`) that are NOT shipped in v1. Variants will land alongside the CLI wiring follow-up. Until then:
- The schema validates structurally — you can author + load these manifests.
- Apply-time will surface a clear error ("subagent variant `data-interpreter` not found in `.claude/agents/`") when the CLI tries to swap a missing variant.

Authoring a variant: drop `template/.claude/agents/<variant-slug>.md` with the same frontmatter shape as the canonical agent it replaces. Persona text is the only thing that diverges.

---

## What's NOT in this protocol

- **Multi-archetype composition.** A project picks one archetype at init time. No `--archetype data-heavy --archetype infrastructure` mashups in v1; layered overrides get conflict-resolution-shaped fast.
- **Runtime archetype switching.** Once a project is scaffolded, `coldpress.yaml.archetype` is fixed. Migration to a different archetype is a manual reproject.
- **Smart auto-detection.** `priority` is reserved for future "if no `--archetype` flag, sniff the project (presence of `*.tf`? notebook files? research-y prose?) and pick the highest-priority archetype". Not implemented in v1 — explicit `--archetype` always wins.
- **Project-local archetype overrides.** Users can't ship a `_local-archetype.yaml` v1. Custom needs → fork the canonical YAML into `install/archetypes/local-<name>.yaml` (project-local archetype override loading is a follow-up).

---

## See also

- [`schemas/archetype.schema.ts`](../schemas/archetype.schema.ts) — the typed contract.
- [`subagent-phase-matrix.md`](subagent-phase-matrix.md) — the canonical 10-subagent × 9-phase matrix (the "before" state archetypes specialise from).
- [`phase-gate-protocol.md`](phase-gate-protocol.md) — phase exit criteria; archetypes don't change the gate JSON schema, only the skills that satisfy it.
- [`reviewer-subagent.md`](reviewer-subagent.md) — Block EE sibling; the `@reviewer` slot is universal (no archetype overrides it).
