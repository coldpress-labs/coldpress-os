---
workflow_version: "1.1"
output_file_full: "_context/planning/prd-validation-{date}.md"
output_file_sections: "_context/planning/prd-validation-amendment-{date}.md"
total_steps: 4
resume_from: "frontmatter"
modes: ["full", "sections"]
---

## Overview

Two modes:

- **Full mode** (default; entry from create-prd or unscoped re-validation): validate against six quality dimensions — completeness, consistency, testability, alignment, feasibility, implementability. Produces full validation report.
- **Sections mode** (`--sections=<list>`): lightweight, section-scoped re-validation triggered when downstream phases (5/6/7/8) accept a delta into the PRD via `accept_into_prd` reconciliation. Loads only the named sections + dependency anchors, runs scoped six-dimension checks, emits a prd-amendment validation report.

## Step Index

| Step | File | Description | Modes |
|------|------|-------------|-------|
| 0 | [step-00-graph-first.md](steps/step-00-graph-first.md) | Graph-first context load + existence checks | both |
| 1 | [step-01-load.md](steps/step-01-load.md) | Load PRD and supporting sacred documents | full |
| 2 | [step-02-validate.md](steps/step-02-validate.md) | Run six validation checks, score each dimension | full |
| 3 | [step-03-report.md](steps/step-03-report.md) | Generate validation report | full |
| 4 | [step-04-sections-mode.md](steps/step-04-sections-mode.md) | Sections-mode short-path: load only named sections + anchors, scoped check, emit amendment validation | sections |

## Mode Routing (after Step 0)

```
if flags.sections is null and flags.mode in [null, "auto", "full"]:
    proceed to Step 1 (full sweep)
elif flags.sections is non-empty list:
    proceed to Step 4 (sections-mode short-path)
elif flags.mode == "full":
    # explicit override — even with --sections set, run full
    proceed to Step 1
```

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All six validation dimensions assessed with pass/fail/warning
- Specific issues documented with section references
- Actionable recommendations provided for each issue
- Overall readiness verdict: READY / NEEDS REVISION / BLOCKED
- User has reviewed findings
