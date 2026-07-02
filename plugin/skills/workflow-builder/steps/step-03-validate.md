---
step_number: 3
step_name: "Validate"
step_goal: "Verify step chain integrity and write files"
halts_for_input: true
next_step: "complete"
---

## Goal

Ensure the workflow is internally consistent and complete.

## Instructions

1. **Validate step chain:** step-01 → step-02 → ... → complete. No broken links.
2. **Validate frontmatter:** All required fields present in every file.
3. **Validate step count** matches workflow.md `total_steps`.
4. **Write all files** to target directory.
5. **Present validation results.**

## Output

Validated workflow written. Workflow complete.

## Navigation

→ Workflow complete.
