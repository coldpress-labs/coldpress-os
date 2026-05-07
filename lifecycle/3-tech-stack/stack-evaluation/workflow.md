---
workflow_version: "2.0"
output_file: "_context/planning/adrs/adr-{decision}-v{N}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Tier-aware single-area evaluation. Step 1 reads the shortlist tier annotation and branches: T1 takes a fast-path (pack pre-pick accepted, quick ADR written); T2 and T3 walk the full 6-dimension rubric. One workflow run = one decision-area = one ADR.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-tier-check.md](steps/step-01-tier-check.md) | Read shortlist tier; branch to fast-path (T1) or full rubric (T2/T3) |
| 2 | [step-02-rubric.md](steps/step-02-rubric.md) | 6-dim rubric walk + baseline-compat filter (T2/T3 path only) |
| 3 | [step-03-decide.md](steps/step-03-decide.md) | Recommendation + versioned ADR write + schema validation |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Step 1 determines the path.** T1 can skip to Step 3 directly; T2/T3 always go through Step 2.
3. **Complete each step fully** before proceeding.
4. **Halt at menus.** When a step presents options, wait for user input.
5. **State is tracked** in the ADR frontmatter.
6. **Resumable.** On interruption, resume from last completed step. Note: rubric walk data is NOT persisted between sessions — on resume at Step 2, the rubric walk restarts for the interrupted area (completed-area ADRs are final and not re-evaluated).
7. **User input required.** Never generate content without user confirmation or input.
8. **Run once per decision-area.** Re-invoke for each area in the shortlist.

## Completion Criteria

- Shortlist tier for this area read and honoured
- Candidates evaluated per tier (T1: fast-path; T2/T3: 6-dim rubric)
- ADR written at `_context/planning/adrs/adr-{decision}-v{N}.md`
- ADR schema-valid (includes `tier` + `rubric` fields)
- Supersede check fired if ADR choice conflicts with `_input/` claims
