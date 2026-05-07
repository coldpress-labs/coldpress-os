---
step: 6
name: "Output + Graph Update"
skill: legacy-assessment
agent: architect
---

# Step 6 — Output + Graph Update

## Purpose

Write the versioned `legacy-migration-plan-v{N}.md` (schema-validated), update the graph with legacy module decision nodes, and signal completion to the calling context.

---

## Actions

### 6.1 Determine version number

Check `_context/planning/` for existing `legacy-migration-plan-v*.md` files. Version N = highest existing + 1 (or 1 if none exists). If prior plan decisions have not changed, version is unchanged and the existing file is confirmed current.

### 6.2 Write `legacy-migration-plan-v{N}.md`

Write to `_context/planning/legacy-migration-plan-v{N}.md`. Validate against `schemas/planning-artefacts/legacy-migration-plan.schema.json` before saving.

Document structure:

```markdown
---
schema: legacy-migration-plan
version: {N}
generated_at: {ISO-8601}
produced_by: legacy-assessment
module_count: {total}
decisions:
  keep: {count}
  refactor: {count}
  scaffold: {count}
  reference: {count}
phase_3_reentries: {count}   # how many conflicts required Phase 3 re-entry
adr_amendments: [list of new ADR paths, if any]
---

# Legacy Migration Plan v{N}

## Summary

{N} legacy modules assessed against tech-stack.md locked decisions.
{keep/refactor/scaffold/reference breakdown}.
{If phase_3_reentries > 0}: {N} conflicts required Phase 3 re-entry — tech-stack.md was amended.

## Module Decisions

{Full table: module / decision / rationale / sandbox path / phase 6 action}

## Conflict Resolutions

{List of conflicts and how each was resolved, or "No conflicts."}

## Phase 7 Impact

**Refactor epics:** {list of refactor modules → becomes "Migrate legacy {module}" epics}
**Scaffold epics:** {list of scaffold modules → becomes "Implement {module} interface wrapper" epics}
```

### 6.3 Update graph

Update graph with:
- One node per legacy module: `type: legacy_module`, `decision`, `rationale`, `sandbox_path`, `phase_8_action`
- One node for the migration plan: `type: legacy_migration_plan`, `version: N`, `module_count`, `decision_summary`
- If ADRs were added: update ADR nodes in graph

### 6.4 Signal completion

**If invoked from `planning-entry-sync`:** return to `planning-entry-sync` Step 5 greeting — resume warm-handoff. The scope memo will now include `legacy_migration_plan` evidence.

**If invoked from `create-prd` re-confirm trigger:** return to `create-prd` Step 0 — legacy module graph nodes are now available for PRD feature authoring.

**If invoked manually:** present summary:

```
Legacy assessment complete.

{N} modules assessed:
  keep: {count} — ready for Phase 7 implementation as-is
  refactor: {count} — will generate migration epics in Phase 7
  scaffold: {count} — @architect will design interface contracts in Phase 6
  reference: {count} — available for PRD + architecture reference

Written:
  _context/planning/legacy-migration-plan-v{N}.md (schema-validated)
  _sandbox/legacy-manifest.md (updated)
  _sandbox/legacy/{decision}/ directories (all modules copied)

{If ADR amendments}: {N} ADR(s) added to _context/planning/adrs/

Suggested next step: create-prd (Phase 4 PRD authoring; legacy module nodes loaded in graph)
```

---

## Output

- `_context/planning/legacy-migration-plan-v{N}.md` — schema-validated migration plan
- Graph: legacy module nodes + migration plan node updated
- Completion signal + routing to calling context

---

## Mark partial-completion

Write `partial_completion: { skill: "legacy-assessment", step_id: "step-06" }` at start. Clear on clean exit.
