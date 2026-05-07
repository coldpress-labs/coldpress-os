---
step_number: 1
step_name: "Document Discovery"
step_goal: "Find and inventory all project planning documents"
halts_for_input: true
next_step: "step-02-prd-analysis.md"
---

## Goal

Build a complete inventory of what documents exist.

## Instructions

1. **Search for all document types:** PRD, Architecture, UX Spec, Epics, Context, Tech Stack.
2. **Check both whole files and sharded formats.**
3. **Flag critical issues:** Missing required documents, duplicates.
4. **Initialize readiness report** with document inventory.
5. **Present findings** to user.

## Output

Document inventory complete. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-prd-analysis.md](step-02-prd-analysis.md)
