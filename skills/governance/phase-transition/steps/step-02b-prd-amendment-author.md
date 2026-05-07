---
step_number: "2b"
step_name: "PRD Amendment Author (sub-step)"
step_goal: "Convert accept_into_prd deltas into a PRD v(N+1) lightweight amendment + validate + VC bump"
severity: "block"
halts_for_input: false
next_step: "<caller-defined>"
conditional: "called from step-02a §A.5 when accept_into_prd deltas exist"
---

## Goal

Authoritative PRD-amendment author. Decoupled from `step-02a-reconciliation.md` so the same logic can be invoked from any context where `accept_into_prd` deltas need to land in the PRD.

**Currently called from:**
- `step-02a-reconciliation.md` §A.5 — Phase 5 design-deltas reconciliation pass.

**Future callers (forward-carry chain):**
- Phase 7 `breakdown-entry-sync` Step 1 — architecture-deltas reconciliation, when user picks `accept_into_prd` for an architecture-surfaced PRD gap.
- Phase 8 implementation-deltas amendment loop — same when implementation-deltas surface a spec gap.

## Inputs (from caller)

| Field | Type | Description |
|---|---|---|
| `accept_deltas[]` | array | Deltas with `user_decision == accept_into_prd`; each has `id`, `prd_section`, `description`, `evidence`, `proposed_diff` (optional) |
| `source_phase` | int | Calling phase (5, 7, 8, ...) |
| `source_skill` | string | Calling skill (`phase-transition` / `breakdown-entry-sync` / ...) |
| `current_prd_version` | string | e.g., "1.4.0" |

## Instructions

### 1. Aggregate target_sections

Walk `accept_deltas[]`; collect unique `prd_section` values. This is the input list for the lightweight-amendment validator (`validate-prd --sections=<target_sections>`).

If aggregation yields zero sections (no deltas), return immediately with `amendment_skipped: true`.

### 2. Resolve the PRD amendment payload

For each accept_delta, produce a `prd_amendment` entry per `schemas/sacred-docs/prd-amendment.schema.json`:

```yaml
prd_amendment:
  schema: schemas/sacred-docs/prd-amendment.schema.json
  amendment_id: "<source_phase>-<source_skill>-<date>-<seq>"
  source_phase: <source_phase>
  source_skill: <source_skill>
  triggered_by_deltas: [<delta-id>, ...]
  target_sections: [<section-id>, ...]
  proposed_diffs:
    - section_id: <section-id>
      change_kind: additive | modifying | removing
      before: <quoted current text>
      after: <quoted proposed text>
      rationale: <one-line>
  vc_bump_target: minor | patch    # patch = single section single-line; minor = multi-section / structural
  authored_at: <ISO>
  status: draft
```

Save to `_context/planning/prd-amendment-{date}-{seq}.md` (markdown wrapper around the YAML payload).

### 3. Apply the diffs to the PRD

For each `proposed_diff`:
- Locate the section in `_context/sacred/prd.md` by `section_id` (heading match).
- Apply the change: additive (insert after existing content), modifying (replace `before` with `after`), removing (delete the matched span).
- For `change_kind: additive` or `modifying`: validate the new content is syntactically valid markdown.
- Surface any failure (heading not found, before-text mismatch, multiple matches) as a BLOCKING error before proceeding.

This step modifies the sacred PRD inline. The caller is responsible for invoking the `supersede-check` skill before this step if the PRD has been edited since the last validation.

### 4. Run validate-prd --sections

Invoke `validate-prd --sections=<comma-separated-target-sections>` (the lightweight section-scoped validator added in v0.3.0; see `lifecycle/4-planning/validate-prd/steps/step-04-sections-mode.md`).

Outputs `_context/planning/prd-validation-amendment-{date}.md`. Verdict is one of: READY / NEEDS_REVISION / BLOCKED.

| Verdict | Action |
|---|---|
| READY | Proceed to Step 5 (VC bump) |
| NEEDS_REVISION | Surface to user with section-level pass/fail. Either (a) revise PRD edits + re-run validation, or (b) revise the source delta's user_decision (e.g., switch from accept_into_prd to flag_for_architecture_ADR). |
| BLOCKED | Surface to user. Source-delta-vs-edit reconciliation failed (the edit doesn't actually address the delta's evidence). Caller's `accept_into_prd` decision was inappropriate; revise upstream. |

Do not proceed to Step 5 unless verdict is READY.

### 5. Bump PRD VC

Increment PRD version per `vc_bump_target`:
- `patch` (default): X.Y.Z → X.Y.(Z+1)
- `minor`: X.Y.Z → X.(Y+1).0

Append a new row to the PRD's Version Control panel:

```markdown
| <new-version> | <date> | <author-agent> | Amendment <amendment_id> — <one-line summary>. Triggered by <count> design-delta/architecture-delta/implementation-delta(s). Sections: <section-ids>. |
```

Save the PRD.

### 6. Update prd.meta.json sidecar

Update `_context/sacred/prd.meta.json`:

```json
{
  "prd_version": "<new-version>",
  "last_amendment_date": "<ISO>",
  "amendment_source": "<source_phase>-<source_skill>-reconciliation",
  "amendment_id": "<amendment_id>",
  "supersedes_validated_distillates": [
    "_context/planning/prd-validation-v*.md (full)"
  ]
}
```

The `supersedes_validated_distillates` field flags downstream validated-distillates as potentially-stale (next time they're consumed, the consumer checks).

### 7. Mark accept_deltas applied_at

For each delta in `accept_deltas[]`: set `applied_at: <ISO>` and `applied_artefacts: [<prd-amendment-path>, <prd-path>, <prd-meta-path>]`. Caller is responsible for writing this back to the originating WIP log.

### 8. Return to caller

Return:

```yaml
amendment_result:
  status: applied | skipped | blocked
  amendment_id: <id> | null
  prd_version_before: <X.Y.Z>
  prd_version_after: <X.Y.Z'> | null
  validate_prd_verdict: READY | NEEDS_REVISION | BLOCKED | n/a
  artefacts_written:
    - _context/planning/prd-amendment-<date>-<seq>.md
    - _context/sacred/prd.md
    - _context/sacred/prd.meta.json
  applied_at: <ISO> | null
```

## Halts For Input

Step 4 NEEDS_REVISION / BLOCKED verdicts halt for user input. Otherwise no halts.

## Output

- New `prd-amendment-{date}-{seq}.md` artefact under `_context/planning/`
- Updated `_context/sacred/prd.md` with applied diffs + VC row
- Updated `_context/sacred/prd.meta.json` sidecar
- Each accept_delta has `applied_at` set; caller writes back to WIP log
- `amendment_result` returned to caller for orchestration

## Schema

Output `prd-amendment-{date}-{seq}.md` conforms to `schemas/sacred-docs/prd-amendment.schema.json`.

## Navigation

→ Return to caller (typically step-02a §A.6 or breakdown-entry-sync Step 1 next sub-step).
