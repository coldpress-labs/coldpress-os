---
step_number: 3
step_name: "Verify"
step_goal: "Confirm deployment is working and log results"
halts_for_input: true
next_step: "complete"
---

## Instructions

1. **Verify deployment** — check the deployed URL/service responds correctly.
2. **Run smoke tests** if available.
3. **Write deployment log** with: target, timestamp, version, status, URL.
4. **Present summary** to user.

## Output

Deployment verified and logged. Workflow complete.

## Navigation

→ Workflow complete. → Phase 8: Operate (in-flight monitoring) or Phase 9: Evolve (post-release learning).
