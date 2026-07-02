---
step_number: 1
step_name: "Inventory ADRs"
step_goal: "Read all ADRs; check coverage against product-type-required categories"
halts_for_input: true
next_step: "step-02-document.md"
---

## Goal

Gather all Architecture Decision Records and verify the required category set is covered for this project's product type. No more hardcoded "frontend + backend + database at minimum" — required categories are derived from the project-types CSV.

## Tier 1 Core Methods

- **Gap Analysis:** Compare the ADR set against the required category list; surface any missing areas.
- **Constraint Identification:** Cross-check locked decisions against the constraint-research envelope (compliance, performance, budget).

*(Source: `data/methods/problem-solving-methods.csv`, analysis category)*

## Instructions

### 1. Read product-type category requirements

- Open `data/classification/project-types.csv`.
- Find the row matching `.coldpress/local-config.yaml product_type`.
- Extract `required_categories` and `recommended_categories` columns for this product type.

Examples by product type:
- **marketing-landing / portfolio:** required = `frontend, hosting, styling, package_manager`; recommended = `ci, source_control`
- **fullstack-web-app / saas-product:** required = `frontend, database, auth, hosting, package_manager`; recommended = `testing, ci, source_control, styling`
- **cli-tool / npm-package:** required = `runtime, build, package_manager, testing, ci`; recommended = `source_control`
- **browser-extension:** required = `frontend-framework, package_manager, testing, ci`; recommended = `source_control`

If product_type not found in CSV: use the default web-app set (frontend, database, auth, hosting) and flag the gap.

### 2. Scan `_context/planning/adrs/` for all `adr-*-v*.md` files

For each ADR: extract `decision_area`, `chosen` technology, `rubric.weighted_total`, `tier`, `supersedes` (if present).

### 3. Inventory and gap-check

Build the inventory table:

| Decision area | ADR | Chosen | Tier | Score | Status |
|---|---|---|---|---|---|
| frontend | adr-frontend-v1.md | Next.js | T1 | 10 | ✓ Required |
| database | adr-database-v1.md | Neon | T2 | 7.8 | ✓ Required |
| auth | — | — | — | — | ⚠ Required — MISSING |
| styling | adr-styling-v1.md | Tailwind | T1 | 10 | ✓ Recommended |

**Gap handling:**
- Missing required category → recommend running `stack-evaluation` for that area before proceeding. If user insists on proceeding without it: log as explicit gap in tech-stack.md with rationale.
- Missing recommended category → flag as informational; user can proceed.

### 4. Brownfield section (if `project_shape: brownfield`)

Add a "What changes" section to the inventory:
- **Carried over:** technologies retained from the legacy stack
- **New additions:** technologies introduced
- **Replaced:** legacy technologies being migrated away from

### 5. Present and confirm

Present the full inventory to the user. Confirm they're ready to consolidate into tech-stack.md.

## Output

Full ADR inventory with gap analysis. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-document.md](step-02-document.md)
