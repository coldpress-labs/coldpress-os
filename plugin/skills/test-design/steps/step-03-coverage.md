---
step_number: 3
step_name: "Coverage Mapping"
step_goal: "Map every requirement to specific test cases"
halts_for_input: false
next_step: "step-04-plan.md"
---

## Goal

Create a coverage matrix that maps each requirement to planned test cases.

## Instructions

1. **For each functional requirement**, define:
   - Test type (unit, integration, E2E)
   - Test case outline (what to verify)
   - Priority (P1 = must have, P2 = should have, P3 = nice to have)
   - Estimated effort

2. **For each NFR**, define:
   - How it will be verified (automated test, manual check, monitoring)
   - Acceptance threshold (e.g., "page load < 2s")
   - Test approach

3. **For acceptance criteria**, ensure each has:
   - At least one corresponding test case
   - Happy path and primary error path covered

4. **Build coverage matrix** linking requirements → test cases.

## Output

Coverage matrix appended to output document. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-plan.md](step-04-plan.md)
