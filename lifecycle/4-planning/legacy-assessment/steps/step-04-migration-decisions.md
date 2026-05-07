---
step: 4
name: "Migration Decisions"
skill: legacy-assessment
agent: architect
---

# Step 4 — Migration Decisions

## Purpose

For each module (post-conflict-resolution): assign a migration decision from the keep / refactor / scaffold / reference table. Record decision + rationale for each.

---

## Actions

### 4.1 Propose decisions

For each module (including `compatible` modules from Step 2 and all resolved-conflict modules from Step 3), propose a migration decision using the migration decision table:

| Decision | When to use |
|---|---|
| **keep** | Compatible with locked stack; no migration needed |
| **refactor** | Needs updating to work with locked stack |
| **scaffold** | Stays, but needs an interface wrapper so the codebase doesn't couple to legacy tech |
| **reference** | Read-only — schemas, data exports, documentation only |

Present proposal:

```
Migration decision proposals:

Module: `auth-module`
  Technology: TypeScript / Node 18 with server sessions
  Resolution: scaffold — wrap behind auth interface; existing sessions isolated from new edge runtime
  Proposed: scaffold

Module: `legacy-db-schema.sql`
  Technology: PostgreSQL schema
  Resolution: reference — use as schema specification for Convex data model design
  Proposed: reference

Module: `components/`
  Technology: React 16 / Redux / styled-components
  Resolution: refactor — migrate to React 18 + Zustand + Tailwind in Phase 7
  Proposed: refactor

Confirm all, or choose different decisions for specific modules:
```

### 4.2 User confirmation

Present all proposed decisions for batch confirmation. Allow per-module overrides.

For `scaffold` decisions, additionally ask:
> "Do you want to spec the scaffold interface now (add to architecture notes) or defer to Phase 6?"

For `refactor` decisions, note the migration work will become explicit epics in Phase 7.

### 4.3 Record decisions

For each module, record in `legacy-manifest.md`:
- `decision`: keep / refactor / scaffold / reference
- `rationale`: one sentence (from the conflict resolution notes or the decision reasoning above)
- `interface_spec_deferred`: true/false (scaffold only)
- `phase_8_action`: for scaffold decisions, what Phase 8 @architect will design; for refactor, what @developer will migrate

---

## Output

- All modules have a confirmed migration decision
- `legacy-manifest.md` updated with decisions + rationale + phase annotations
- Decision list forwarded to Step 5 for copying

---

## Mark partial-completion

Write `partial_completion: { skill: "legacy-assessment", step_id: "step-04" }` at start. Clear on clean exit.
