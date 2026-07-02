---
step_number: 1
step_name: "Select Mode"
step_goal: "Determine operation mode and gather workflow details"
halts_for_input: true
next_step: "step-02-build.md"
---

## Goal

Determine what kind of workflow operation to perform.

## Instructions

1. **Present mode options:**
   - **(B) Build** — Create a new workflow from scratch
   - **(C) Convert** — Convert a legacy workflow to coldpress-os format
   - **(A) Analyze** — Audit an existing workflow for integrity

2. **For Build:** Gather workflow purpose, steps, inputs, outputs.
3. **For Convert:** Identify source workflow files.
4. **For Analyze:** Identify target workflow to audit.

## Output

Mode and details in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-build.md](step-02-build.md)
