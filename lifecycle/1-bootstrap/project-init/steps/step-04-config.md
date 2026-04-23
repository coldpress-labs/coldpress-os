---
step_number: 4
step_name: "Generate Configuration"
step_goal: "Create coldpress.yaml with Phase-1 fields only. Everything else is written back by later phases."
halts_for_input: true
next_step: "complete"
---

## Goal

Generate the project configuration file with **only the Phase-1 fields**. Phase-2+ fields are written back by their owning phases as the lifecycle progresses. See [coldpress-yaml-schema.md](../../../../docs/coldpress-yaml-schema.md) for the full schema and per-field ownership.

## Instructions

1. **Generate `coldpress.yaml`** with the bare Phase-1 shape:
   ```yaml
   # coldpress.yaml — Project Configuration

   project:
     name: "{project_name}"
     slug: "{project_slug}"

   user:
     name: "{user_name}"
     communication_language: "English"
     document_output_language: "English"
   ```

   Do **not** write `project.type`, `project.domain`, `project.pattern`, `stack_pack`, `agents.*`, `sacred_docs.*`, or `output.*` at init. Those fields are owned by later phases and remain unset until their owning skill runs.

2. **Generate `CLAUDE.md`** from the template with project-specific values (name, slug).

3. **Verify** all directories exist and the yaml parses.

4. **Present summary** to user:
   - Project name and location
   - coldpress-os status (submodule or local)
   - Next step: run `agent-scaffold` to generate Butler wrappers for the non-stack-pack skills. (Stack-pack wrappers will be re-generated after Phase 3 stack-locking completes.)

## User Interaction

Present the configuration and confirm. "Your project is initialized with the Phase-1 config. Stack, agents, and lifecycle paths will fill in as you move through the phases. Run agent scaffold next to generate Butler wrappers?"

## Output

Configuration generated. Workflow complete. Recommend proceeding to `agent-scaffold`.

## Navigation

→ Workflow complete. Recommend: `agent-scaffold`
