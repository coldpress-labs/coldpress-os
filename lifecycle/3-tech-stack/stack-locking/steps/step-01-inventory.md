---
step_number: 1
step_name: "Inventory ADRs"
step_goal: "Read all ADRs and consolidate technology decisions"
halts_for_input: false
next_step: "step-02-document.md"
---

## Goal

Gather all Architecture Decision Records and build a complete picture of the technology choices made.

## Instructions

1. **Scan** `_context/planning/` for all `adr-*.md` files.
2. **Read each ADR** and extract:
   - Decision area (frontend, backend, database, etc.)
   - Chosen technology
   - Key rationale
   - Notable consequences or constraints
3. **Identify gaps** — are there decision areas not yet covered?
   - Required: frontend, backend, database
   - Recommended: auth, hosting, testing, CI/CD
4. **Present inventory** to user — list all decisions and flag any gaps.
5. **If gaps exist,** recommend running stack-evaluation for missing areas before proceeding.

## Output

Complete inventory of all technology decisions. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-document.md](step-02-document.md)
