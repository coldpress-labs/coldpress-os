---
step_number: 2
step_name: "Pipeline Strategy"
step_goal: "Determine branching model, deployment targets, and required checks"
halts_for_input: true
next_step: "step-03-generate-pipeline.md"
---

## Goal

Establish the pipeline strategy based on team workflow and deployment requirements.

## Instructions

1. **Determine branching model.** Ask user:
   - **Trunk-based:** Single main branch, feature branches merge directly
   - **Git Flow:** main, develop, feature, release, hotfix branches
   - **GitHub Flow:** main + feature branches with PRs

2. **Identify deployment targets:**
   - Preview/staging on PR
   - Production on merge to main
   - Manual approval gates (if any)

3. **Define required checks:**
   - Type checking (tsc)
   - Linting (ESLint, Biome)
   - Unit tests
   - Integration/E2E tests
   - Build verification
   - Bundle size check
   - Security audit

4. **Determine CI platform.** Options based on hosting:
   - GitHub Actions (default)
   - GitLab CI
   - Azure Pipelines

5. **Present strategy summary** to user for approval.

## User Interaction

Present the proposed pipeline strategy and ask for confirmation or adjustments.

## Output

Update frontmatter with: `branching_model`, `deploy_targets`, `required_checks`, `ci_platform`, `step_2_complete: true`

## Navigation

→ On approval, proceed to [step-03-generate-pipeline.md](step-03-generate-pipeline.md)
