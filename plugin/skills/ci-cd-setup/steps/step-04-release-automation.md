---
step_number: 4
step_name: "Release Automation"
step_goal: "Generate version bumping, changelog, and release note automation"
halts_for_input: true
next_step: "step-05-rollback.md"
---

## Goal

Set up automated release workflows for versioning, changelog generation, and git tagging.

## Instructions

1. **Determine versioning strategy:**
   - Semantic versioning (semver) — default
   - Calendar versioning (calver) — if user prefers
   - Manual versioning — if user wants full control

2. **Generate release workflow** that:
   - Bumps version in package.json (or equivalent)
   - Generates changelog from commit messages
   - Creates git tag
   - Creates GitHub/GitLab release with notes

3. **Present and write** after user approval.

## User Interaction

Ask which versioning strategy to use, then present generated workflow.

## Output

Release automation workflow file. Update frontmatter: `step_4_complete: true`

## Navigation

→ Proceed to [step-05-rollback.md](step-05-rollback.md)
