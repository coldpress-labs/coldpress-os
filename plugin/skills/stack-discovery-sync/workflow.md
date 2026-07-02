---
workflow_version: "1.0"
output_file: "_context/planning/stack-shortlist-v{N}.md"
total_steps: 6
resume_from: "frontmatter"
---

## Overview

Consolidates Phase 2 evidence into a versioned stack shortlist. Steps 0-4 run on first entry; Step 0 also handles re-entry routing. Re-runnable: if new vendor docs land mid-Phase-3, re-run produces `stack-shortlist-v{N+1}`.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-entry-check.md](steps/step-00-entry-check.md) | 6-branch entry decision tree (guard, resume, re-entry, first-entry) |
| 1 | [step-01-evidence-intake.md](steps/step-01-evidence-intake.md) | Read all Phase 2 inputs; invoke graph-staleness check; brownfield audit |
| 2 | [step-02-classify.md](steps/step-02-classify.md) | Classify product type + domain complexity from CSVs |
| 2b | [step-02b-pack-match.md](steps/step-02b-pack-match.md) | Score archetype-fit against available packs; propose best match |
| 3 | [step-03-derive-candidates.md](steps/step-03-derive-candidates.md) | Derive tiered candidates per decision-area (T1/T2/T3 ordering) |
| 4 | [step-04-shortlist.md](steps/step-04-shortlist.md) | Compile and write stack-shortlist-v{N}.md with 3 sections |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Step 0 is always the first step.** It determines the correct entry path.
3. **Complete each step fully** before proceeding.
4. **Halt at menus.** When a step presents options, wait for user input.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, Step 0 detects partial-completion state and resumes at the right sub-position.
7. **User input required.** Never generate content without user confirmation or input.
8. **Re-runnable.** Re-entry with new `_input/vendor/` content produces `v{N+1}` shortlist; does not overwrite prior version.

## Completion Criteria

- Phase 2 entry guard passed (phase_2_completed == true + context.md authored)
- All Phase 2 evidence read and consolidated
- Product type + domain complexity classified
- Pack match scored; user confirmed / rejected / skipped
- Per-area tiered candidates derived with evidence-bound rationale
- `stack-shortlist-v{N}.md` written and schema-valid
