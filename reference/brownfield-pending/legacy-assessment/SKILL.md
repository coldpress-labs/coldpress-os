---
name: legacy-assessment
slug: legacy-assessment
phase: 4
type: workflow
agent: architect
description: "Brownfield artefact evaluation — assess legacy code/data in `_input/legacy/`, assign keep/refactor/scaffold/reference decisions, copy to `_sandbox/`, emit migration plan"
status: "wire-in-phase-4"
trigger: "auto-entry | auto-reconfirm | manual"
idempotent: true
---

# legacy-assessment

> Standalone brownfield skill — invoked when `_input/legacy/` is non-empty. Assesses each legacy module against the locked tech stack, resolves conflicts, copies modules to `_sandbox/` with decisions, and emits a versioned migration plan. Idempotent: safe to re-run when new files are added.

---

## Invocation triggers

| Trigger | Mechanism | Timing |
|---------|-----------|--------|
| **Auto — entry** | Phase 1 `intake` Step 6 (shape determination) already set `project_shape: brownfield` in `.coldpress/local-config.yaml`; Phase 4 entry routes here when that flag is set | Phase 4 entry, before PRD authoring |
| **Auto — re-confirm** | `create-prd` Step 0 reads `project_shape: brownfield` with no `legacy-migration-plan-v{N}.md` present and resurfaces the suggestion | Mid-Phase 4, if entry was deferred |
| **Manual** | User invokes `@architect legacy-assessment` directly | Any point post-Phase 3 lock |

---

## Inputs

```yaml
graph_queries:
  - "Legacy module nodes (if any prior assessment run — for idempotent re-run)"
  - "Stack decision nodes + ADR summaries"
  - "Baseline confirmation nodes"

cold_file_reads:
  - "_context/sacred/tech-stack.md"             # locked stack decisions (required)
  - "coldpress.yaml"                             # stack_pack, baselines
  - "_context/planning/planning-scope-v{N}.md"  # if exists (archetype mode, evidence bundle)

direct_file_access:
  - "_input/legacy/"                             # legacy files — read for assessment; NEVER modified

existence_checks:
  - "_context/sacred/tech-stack.md"             # required — gate blocks if missing
  - "coldpress.yaml"                             # required
  - "_input/legacy/"                             # required — nothing to assess if empty
```

---

## Outputs

```yaml
outputs:
  - artifact: "Legacy Migration Plan"
    location: "_context/planning/legacy-migration-plan-v{N}.md"
    tier: "validated-distillate"
    sacred: false
    versioned: true
    schema: "schemas/planning-artefacts/legacy-migration-plan.schema.json"

  - artifact: "Sandbox copies"
    location: "_sandbox/legacy/{decision}/{module}/"
    note: "Copies only — _input/legacy/ stays intact as immutable source of truth"

  - artifact: "Legacy Manifest"
    location: "_sandbox/legacy-manifest.md"
    note: "Decision record per file/folder. Updated on each re-run."
```

---

## `_sandbox/` structure

```
_sandbox/
  legacy/
    keep/         # compatible modules — used as-is in Phase 7 implementation
    refactor/     # modules to migrate to locked stack in Phase 6
    scaffold/     # modules to wrap behind an interface (Phase 6 architect designs contract)
  reference/
    legacy/       # read-only reference — schemas, data exports, docs (never modified)
  legacy-manifest.md
```

---

## Migration decision table

| Decision | When to use | Sandbox path | Phase 6 treatment |
|---|---|---|---|
| **keep** | Compatible with locked stack; no migration needed | `_sandbox/legacy/keep/{module}/` | `@developer` consumes as-is |
| **refactor** | Needs updating to work with locked stack | `_sandbox/legacy/refactor/{module}/` | `@developer` rewrites; `_input/legacy/` is the reference |
| **scaffold** | Stays, but needs an interface wrapper so the rest of the codebase doesn't couple to legacy tech | `_sandbox/legacy/scaffold/{module}/` | `@architect` designs interface contract (Phase 6); `@developer` implements wrapper |
| **reference** | Read-only — schemas, data exports, documentation only | `_sandbox/reference/legacy/{module}/` | Accessible for PRD + architecture spec; never modified |

---

## Conflict resolution table

| Conflict type | Resolution options | Needs Phase 3 re-entry? |
|---|---|---|
| **Compatible tech, minor version** (e.g., legacy Node 18 vs. tech-stack Node 20 LTS) | Accept — compatible at runtime | No |
| **Compatible tech, major version** (e.g., legacy React 16 class components vs. React 18) | Accept + refactor note — migration work in Phase 6 | No |
| **New library dependency** needed (e.g., legacy uses a library absent from tech-stack.md) | Lightweight change-workflow: new ADR adds library to tech-stack.md | No |
| **Incompatible paradigm — wrappable** (e.g., legacy Redux vs. locked Zustand) | Option A: scaffold — wrap legacy behind store interface; no tech-stack change. Option B: lightweight change-workflow to add alongside. | No (Option A) / Lightweight ADR (Option B) |
| **Infrastructure conflict** (e.g., legacy requires server sessions; tech-stack locks edge-only runtime) | Always surface explicitly. Options: (1) scaffold — legacy stays isolated, (2) lightweight change-workflow if supplementable, (3) **full Phase 3 re-entry** if hosting choice is invalidated. | **Yes — option 3 only** |
| **Database paradigm conflict** (e.g., legacy PostgreSQL schemas vs. locked Convex document model) | Always surface explicitly — data model conflicts are high blast radius. Options: (1) reference — legacy DB read-only, new DB writes, (2) scaffold abstraction layer, (3) **full Phase 3 re-entry** if data requirements are dominant. | **Yes — option 3 only** |

---

## Lightweight change-workflow vs. full Phase 3 re-entry

**Lightweight** (most conflicts — targeted amendment, no stack re-evaluation):

1. Butler proposes an amendment ADR: `adr-legacy-{slug}-v1.md` — documents legacy constraint, accommodation decision, and why it doesn't invalidate the existing stack choice.
2. User confirms.
3. Butler edits `tech-stack.md`: adds/amends the relevant decision area, increments version, updates governance metadata.
4. Graph updated with amended decision nodes.
5. Does NOT re-run `stack-evaluation` or `stack-locking`.

**Full Phase 3 re-entry** (fundamental invalidation — locked stack cannot accommodate the legacy reality):

1. Butler pauses `legacy-assessment` at Step 3.
2. User routed to Phase 3 change-workflow: `governance/change-workflows/tech-stack.md` — re-evaluates the affected decision area via `stack-evaluation` + `stack-locking` Steps 3–5.
3. On Phase 3 re-completion: `legacy-assessment` resumes at Step 3 with updated `tech-stack.md`.

---

## How legacy-assessment informs downstream phases

After completion, graph legacy-module nodes are available to all subsequent skills:

- **`create-prd`** — may reference legacy modules in requirements (e.g., "Import existing data" feature depends on the reference-category legacy DB module). Step 4 queries graph for legacy module nodes when writing feature scope.
- **`create-architecture`** (Phase 6) — Step 0 checks for `legacy_migration_plan` graph node. Architecture §Legacy Compatibility section populated from graph legacy nodes. Scaffold decisions become Interface Contract specs.
- **Phase 7 `create-epics`** — `refactor` modules generate "migrate legacy {module}" epics. `scaffold` modules generate interface-design epics.

---

## Partial-completion behaviour

Re-runnable (idempotent):
- Steps 1–4 re-evaluate all modules in `_input/legacy/` on each run.
- Step 5: only copies modules not already present in `_sandbox/` (no duplicate copies on re-run).
- Step 6: writes a new versioned `legacy-migration-plan-v{N+1}.md` if prior version exists and decisions changed.

If interrupted mid-run, Butler resumes at the last incomplete step via `partial_completion` marker in `.coldpress/local-config.yaml`.

---

## Workflow

See [`workflow.md`](workflow.md).

---

## See also

- [`docs/cross-cutting/phase-reentry-patterns.md`](../../../docs/cross-cutting/phase-reentry-patterns.md) — Phase-N re-entry decision table
- [`schemas/planning-artefacts/legacy-migration-plan.schema.json`](../../../schemas/planning-artefacts/legacy-migration-plan.schema.json) — output schema
- [`governance/change-workflows/tech-stack.md`](../../../governance/change-workflows/tech-stack.md) — full Phase 3 re-entry workflow

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 7 (task 7.1). Initial legacy-assessment SKILL.md per deep-dive §7 spec. Three invocation triggers (auto-entry / auto-reconfirm / manual). Graph-first inputs with direct_file_access to _input/legacy/. Outputs: legacy-migration-plan-v{N}.md + _sandbox/ copies + legacy-manifest.md. Sandbox structure, migration decision table, conflict resolution table, lightweight vs. full Phase 3 re-entry spec. Idempotent design. Downstream phase consumption notes. |
