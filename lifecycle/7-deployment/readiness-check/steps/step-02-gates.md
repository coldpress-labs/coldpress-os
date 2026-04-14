---
step_number: 2
step_name: "Execute Gates"
step_goal: "Run all 8 quality gates against the scoped code"
halts_for_input: false
next_step: "step-03-report.md"
---

## Instructions

Execute these gates in order:

1. **Gate 1: Acceptance Criteria** — All AC items marked Done in story file.
2. **Gate 2: TypeScript/Compile** — `tsc --noEmit` passes with no errors.
3. **Gate 3: Secrets Safety** — No hardcoded API keys, passwords, or env values in source.
4. **Gate 4: Error Handling** — try/catch present, promises awaited, .catch() handlers exist.
5. **Gate 5: Debug Code** — No unguarded `console.log`, no `debugger` statements.
6. **Gate 6: Open TODOs** — Inventory all TODO/FIXME comments, flag critical ones.
7. **Gate 7: Accessibility** — UI components have labels, images have alt text.
8. **Gate 8: Build Verification** — Full build completes successfully.

**Every gate gets a PASS or FAIL** with findings documented.

## Output

All gates executed. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-report.md](step-03-report.md)
