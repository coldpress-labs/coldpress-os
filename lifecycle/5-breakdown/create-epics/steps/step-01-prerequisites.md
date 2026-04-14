---
step_number: 1
step_name: "Prerequisites"
step_goal: "Validate PRD and architecture exist, load them for analysis"
halts_for_input: false
next_step: "step-02-decompose.md"
---

## Goal

Ensure all required artifacts exist and are loaded before beginning decomposition.

## Instructions

1. **Check for `_output/planning/prd.md`.** If missing, halt and inform user to complete Phase 4 first.
2. **Check for `_output/planning/architecture.md`.** If missing, halt and inform user.
3. **Load PRD.** Extract all Functional Requirements (FRs) and Non-Functional Requirements (NFRs).
4. **Load architecture.** Note key architectural decisions, component boundaries, and constraints.
5. **Summarize** what was found: FR count, NFR count, key architectural patterns.

## Output

Prerequisites validated. FRs and architecture loaded. `step_1_complete: true`

## Navigation

-> Proceed to [step-02-decompose.md](step-02-decompose.md)
