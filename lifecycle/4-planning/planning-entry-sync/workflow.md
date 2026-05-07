---
workflow_version: "1.0"
output_file: "_context/planning/planning-scope-v{N}.md"
total_steps: 5
resume_from: "coldpress.yaml planning_entry_sync_partial_completion"
---

## Overview

Establishes the Phase 4 planning context by loading the Phase 2+3 evidence bundle, detecting brownfield signals, selecting the PRD archetype mode, and emitting a validated planning-scope distillate for all downstream Phase 4 skills.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | step-00-graph-first.md | Graph-staleness check + graph-first Phase 2+3 context load |
| 1 | step-01-mode-detection.md | Detect PRD archetype mode (standard-pm / vibe-coder-lean / design-first) |
| 2 | step-02-baselines-summary.md | Load active baselines + flag architectural constraints |
| 3 | step-03-evidence-gaps.md | Surface missing or stale Phase 2+3 artefacts |
| 4 | step-04-scope-memo.md | Write planning-scope-v{N}.md + greeting + legacy trigger |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Step 0 always runs first.** Graph must be current before any queries.
4. **Halt at menus.** When a step presents options, wait for user input.
5. **Resumable.** On interruption, resume from `planning_entry_sync_partial_completion.step_id` in coldpress.yaml.

## Completion Criteria

- `_context/planning/planning-scope-v{N}.md` written and schema-valid
- Archetype mode recorded
- Active baselines with constraints listed
- Evidence gap status for all 7 Phase 2+3 artefacts
- Legacy files detected flag set
- User greeted and suggested next step
