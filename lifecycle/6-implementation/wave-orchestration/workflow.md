---
workflow_version: "1.0"
output_file: "_context/tracking/wave-status.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Orchestrates wave execution through: wave identification, execution tracking, and gate management.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-identify.md](steps/step-01-identify.md) | Read PERT chart and identify current wave |
| 2 | [step-02-execute.md](steps/step-02-execute.md) | Track parallel story execution within wave |
| 3 | [step-03-gate.md](steps/step-03-gate.md) | Manage wave completion gate and advance |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the wave status document.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Current wave identified from PERT chart
- Parallelizable stories presented
- Wave completion tracked
- Human gate managed before next wave
