---
step_number: 1
step_name: "Audit Setup"
step_goal: "Inventory existing test setup and CI configuration"
halts_for_input: true
next_step: "step-02-generate.md"
---

## Goal

Understand what test infrastructure exists before generating the pipeline.

## Instructions

1. **Detect test frameworks** in use (Vitest, Jest, Playwright, Cypress, etc.).
2. **Find test scripts** in package.json.
3. **Check for existing CI config** (.github/workflows/, .gitlab-ci.yml, etc.).
4. **Inventory test types** present: unit, integration, E2E, component.
5. **Detect coverage configuration** (istanbul, c8, etc.).
6. **Present findings** to user.

## User Interaction

"Found **{frameworks}** with **{N}** test scripts. Existing CI: **{yes/no}**. Proceed to generate quality pipeline?"

## Output

Test inventory in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-generate.md](step-02-generate.md)
