---
step_number: 3
step_name: "Report"
step_goal: "Generate environment report and recommend next steps"
halts_for_input: true
next_step: null
---

## Goal

Compile all check results into an environment report. Give the user a clear overall status and actionable next steps.

## Instructions

1. **Generate the environment report:**

```markdown
# Environment Setup Report — {project.name or "New Project"}

**Date:** {date}
**Machine:** {OS name and version}
**Shell:** {bash/zsh}

## Overall Status: {READY / ACTION NEEDED}

## Core Tools

| Tool | Status | Version |
|------|--------|---------|
| Node.js | ✓/✗ | {version} |
| {Package manager} | ✓/✗ | {version} |
| Git | ✓/✗ | {version} |
| Git identity | ✓/✗ | {name} <{email}> |
| Claude Code | ✓/✗ | {version} |

## Stack Tools

| Tool | Status | Version | Required By |
|------|--------|---------|-------------|
| {stack-specific entries} |

## Actions Required

{List any missing or outdated tools with installation commands}

## Ready For

- [x] coldpress-os project init
- [x/] {stack-specific setup}
- [x/] Development
```

2. **Write report** to `_output/tracking/machine-setup-{date}.md`

3. **Determine next steps:**
   - **All PASS:** "Environment is ready. Run `project-init` to scaffold your project."
   - **Core tools missing:** "Install the missing tools listed above, then re-run machine-setup."
   - **Stack tools missing:** "Core tools are ready. You can proceed with `project-init` and install stack tools before Phase 3 (Tech Stack)."

4. **Present to user** with clear verdict.

## Output

Environment report written. `step_3_complete: true`

## Navigation

Workflow complete. -> Suggest `project-init` if environment is ready.
