---
step_number: 4
step_name: "Verify Failure"
step_goal: "Run tests and confirm they fail for the right reasons"
halts_for_input: true
next_step: "complete"
---

## Goal

Ensure generated tests fail because the feature isn't implemented, not because of syntax or setup errors.

## Instructions

1. **Run the generated tests.**
2. **Analyze failures:**
   - **Expected failures** — "function not found", "element not found", assertion failures → Good
   - **Unexpected failures** — syntax errors, import errors, config issues → Fix these
3. **Fix any unexpected failures** and rerun.
4. **Present results** showing each test and its failure reason.

## User Interaction

"All **{N}** tests fail correctly. They're ready as implementation targets. Begin implementing?"

## Output

Verified failing tests ready for TDD cycle. Workflow complete.

## Navigation

→ Workflow complete.
