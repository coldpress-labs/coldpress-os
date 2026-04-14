---
step_number: 2
step_name: "Assess Implementation"
step_goal: "Evaluate current implementation against each NFR"
halts_for_input: false
next_step: "step-03-report.md"
---

## Goal

Check the codebase for evidence that each NFR is addressed.

## Instructions

1. **For each NFR**, search the codebase for:
   - Implementation evidence (code that addresses the requirement)
   - Configuration evidence (settings, thresholds, limits)
   - Test evidence (tests that verify the NFR)
   - Documentation evidence (runbooks, monitoring setup)

2. **Rate each NFR:**
   - **Met** — Clear implementation + tests + documentation
   - **Partial** — Some implementation but gaps in coverage or testing
   - **Not Met** — No evidence of implementation
   - **Not Testable** — Cannot be verified in current setup

3. **Assess risk** for unmet/partial NFRs:
   - **Critical** — Could cause outage, data loss, or security breach
   - **High** — Significant user impact
   - **Medium** — Degraded experience
   - **Low** — Minor inconvenience

## Output

Assessment results appended to output. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-report.md](step-03-report.md)
