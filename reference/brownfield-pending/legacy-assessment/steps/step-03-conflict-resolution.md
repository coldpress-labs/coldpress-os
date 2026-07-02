---
step: 3
name: "Conflict Resolution"
skill: legacy-assessment
agent: architect
---

# Step 3 — Conflict Resolution

## Purpose

Present each conflict from Step 2 with a resolution table. Resolve all conflicts before proceeding to migration decisions. Do NOT proceed to Step 4 until all conflicts are resolved or explicitly accepted.

---

## Actions

### 3.1 Skip if no conflicts

If the conflicts list from Step 2 is empty (all modules `compatible`): skip this step; proceed directly to Step 4.

### 3.2 Present each conflict

For each `conflicting` or `unknown` module, present the conflict with the applicable resolution options from the conflict resolution table (see SKILL.md):

```
⚠ Conflict detected in `{module}`:
  Legacy: {technology / paradigm / dependency}
  Locked tech stack: {what tech-stack.md says}

Resolution options:
  A — {option A description}
  B — {option B description}
  [C — full Phase 3 re-entry (if fundamental infrastructure or DB paradigm conflict)]

Choose a resolution:
```

### 3.3 Apply resolution

**For most resolutions (A, B — no Phase 3 re-entry):**

If resolution requires a lightweight change-workflow (new ADR):
1. Draft `adr-legacy-{slug}-v1.md` — documents legacy constraint, accommodation decision, and why it doesn't invalidate the existing stack.
2. Present draft to user for confirmation.
3. On confirmation: write ADR to `_context/planning/adrs/`; append new decision area to `_context/sacred/tech-stack.md` (increment version + update governance metadata).
4. Update graph with amended decision nodes.

**For Phase 3 re-entry resolutions (option C):**
1. Pause `legacy-assessment` at this step.
2. Write `partial_completion: { skill: "legacy-assessment", step_id: "step-03", paused_at: "phase-3-re-entry", module: "{module}", conflict: "{description}" }` to `.coldpress/local-config.yaml`.
3. Present:

```
This conflict requires reviewing the locked stack decisions before we can proceed.

Routing to Phase 3 change-workflow: governance/change-workflows/tech-stack.md

On completion, run `@architect legacy-assessment` and I will resume from this conflict.
```

4. Exit cleanly. When re-invoked after Phase 3 re-entry: read the updated `tech-stack.md`, verify the conflict is resolved, continue with remaining conflicts.

### 3.4 Record resolutions

For each resolved conflict: update `legacy-manifest.md` with conflict description + resolution chosen + rationale.

---

## Output

- All conflicts resolved or escalated (no unresolved conflicts pass to Step 4)
- Any new ADRs written to `_context/planning/adrs/`
- `_context/sacred/tech-stack.md` amended if lightweight change-workflow ran
- `legacy-manifest.md` updated with conflict resolutions

---

## Mark partial-completion

Write `partial_completion: { skill: "legacy-assessment", step_id: "step-03" }` at start. Clear on clean exit (or write `paused_at: "phase-3-re-entry"` on Phase 3 re-entry pause).
