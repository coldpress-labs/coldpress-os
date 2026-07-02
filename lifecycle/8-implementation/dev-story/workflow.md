---
workflow_version: "2.0"
output_file: "_context/implementation/stories/ST-*.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Implements ONE story red-to-green inside its packet boundary: load the story + handoff packet (plan mode; Butler approval for risk:high), gather scoped context, red-green-refactor the acceptance stubs without weakening them, validate (full suite + styleguide-conformance self-check for UI), and complete → hand a clean diff to the clean-room `@verifier`. Hooks (boundary-guard, test-integrity, quality-gate) enforce the boundary/stub/green guarantees throughout.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-load.md](steps/step-01-load.md) | Find and load the next ready story |
| 2 | [step-02-context.md](steps/step-02-context.md) | Load project context and developer guardrails |
| 3 | [step-03-implement.md](steps/step-03-implement.md) | Red-green-refactor cycle for each task |
| 4 | [step-04-validate.md](steps/step-04-validate.md) | Run all tests and validation checks |
| 5 | [step-05-complete.md](steps/step-05-complete.md) | Mark story complete and update tracking |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the story file's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed task.
7. **Continue until COMPLETE.** Do not stop for milestones or session boundaries.

## Completion Criteria

- All acceptance criteria satisfied; the story's acceptance stubs are **green (and un-weakened** — test-integrity)
- All edits stayed inside the packet's `owns` boundary (boundary-guard); out-of-scope needs parked as **DLT records**
- Full suite passes — **quality-gate blocks completion while red**
- UI stories: styleguide-conformance self-check passes (components match tokens.json + the `/styleguide` route)
- Story record updated with File List, Change Log, Dev Agent Record; Status → `review`
- Clean diff ready for the **clean-room `@verifier`** hand-off (dev-story never self-verifies)
