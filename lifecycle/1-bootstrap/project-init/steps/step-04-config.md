---
step_number: 4
step_name: "Generate Configuration"
step_goal: "Create coldpress.yaml with all project details"
halts_for_input: true
next_step: "complete"
---

## Goal

Generate the project configuration file and verify everything is ready.

## Instructions

1. **Generate `coldpress.yaml`** from gathered details:
   ```yaml
   project:
     name: "{project_name}"
     type: "{project_type}"
     domain: "{domain}"
   user:
     name: "{user_name}"
     communication_language: "English"
     document_output_language: "English"
   stack_pack: "{stack_pack}"
   sacred_docs:
     tech_stack: "docs/tech-stack.md"
     context: "docs/context.md"
     architecture: "_output/planning/architecture.md"
     prd: "_output/planning/prd.md"
     pert: "_output/tracking/pert-chart.md"
   output:
     planning: "_output/planning/"
     design: "_output/design/"
     implementation: "_output/implementation/"
     testing: "_output/testing/"
     tracking: "_output/tracking/"
   ```

2. **Generate `CLAUDE.md`** from template with project-specific values.

3. **Verify** all directories exist and config is valid.

4. **Present summary** to user:
   - Project name and location
   - coldpress-os status (submodule or local)
   - Stack pack configured
   - Next step: run `agent-scaffold` to generate Butler wrappers

## User Interaction

Present the configuration and confirm. "Your project is initialized. Run agent scaffold next to generate Butler wrappers?"

## Output

Configuration generated. Workflow complete. Recommend proceeding to `agent-scaffold`.

## Navigation

→ Workflow complete. Recommend: `agent-scaffold`
