---
description: "Legacy module decision record — written and updated by legacy-assessment. One entry per module assessed from _input/legacy/."
status: empty
---

# Legacy Manifest

> Written by `legacy-assessment` (Phase 4). Each entry records a legacy module's migration decision, rationale, sandbox destination, and phase annotation.
>
> **Do not edit manually.** Re-run `@architect legacy-assessment` to update.

---

## Modules

*(No modules assessed yet. Entries are added when `legacy-assessment` runs.)*

---

## Template — entry format

Each module entry looks like:

```markdown
## {module-name}

- **Decision:** keep | refactor | scaffold | reference
- **Source:** `_input/legacy/{module}/`
- **Sandbox:** `_sandbox/{decision-path}/{module}/`
- **Rationale:** One sentence explaining the decision.
- **Conflict resolution:** Brief description of any conflict resolved, or "none".
- **Phase 6 action:** What @architect or @developer will do — or "none".
- **Copy timestamp:** YYYY-MM-DDTHH:MM:SSZ
- **Status:** copied | updated | skipped (unchanged) | deferred
```
