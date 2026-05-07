---
step: 5
name: "Copy to _sandbox/"
skill: legacy-assessment
agent: architect
---

# Step 5 — Copy to `_sandbox/`

## Purpose

Copy each module from `_input/legacy/` to the appropriate `_sandbox/` subdirectory based on its migration decision. `_input/legacy/` is NEVER modified — it is the immutable source of truth.

---

## Actions

### 5.1 Ensure `_sandbox/` structure exists

Create directories as needed (idempotent — skip if already present):

```
_sandbox/
  legacy/
    keep/
    refactor/
    scaffold/
  reference/
    legacy/
  legacy-manifest.md  ← already written in prior steps
```

### 5.2 Copy modules by decision

For each module with a confirmed decision from Step 4:

| Decision | Source | Destination |
|---|---|---|
| keep | `_input/legacy/{module}/` | `_sandbox/legacy/keep/{module}/` |
| refactor | `_input/legacy/{module}/` | `_sandbox/legacy/refactor/{module}/` |
| scaffold | `_input/legacy/{module}/` | `_sandbox/legacy/scaffold/{module}/` |
| reference | `_input/legacy/{module}/` | `_sandbox/reference/legacy/{module}/` |

**Copy, never move.** `_input/legacy/` retains every file at all times.

**Idempotent behaviour (re-run):** If destination already exists and the source has not changed (file hash comparison), skip the copy and log `status: skipped (unchanged)` in the manifest. If source has changed: overwrite with `status: updated` in the manifest.

### 5.3 Update `legacy-manifest.md`

For each copied module, update or add an entry:

```markdown
## {module}

- **Decision:** {keep / refactor / scaffold / reference}
- **Source:** `_input/legacy/{module}/`
- **Sandbox:** `_sandbox/{decision-path}/{module}/`
- **Rationale:** {one sentence}
- **Conflict resolution:** {brief description or "none"}
- **Phase 6 action:** {what @architect or @developer will do, or "none"}
- **Copy timestamp:** {ISO-8601}
- **Status:** copied / updated / skipped (unchanged)
```

### 5.4 Validate copies

Spot-check: confirm file counts at source vs. destination match. If mismatch: report discrepancy and offer to re-copy the affected module.

---

## Output

- All modules copied to `_sandbox/` with correct decision-based paths
- `_sandbox/legacy-manifest.md` fully updated with copy records

---

## Mark partial-completion

Write `partial_completion: { skill: "legacy-assessment", step_id: "step-05" }` at start. Clear on clean exit.
