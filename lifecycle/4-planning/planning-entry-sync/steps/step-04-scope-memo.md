---
step_number: 4
step_name: "Planning Scope Memo + Greeting"
step_goal: "Write planning-scope-v{N}.md, present to user, confirm mode, trigger legacy-assessment if needed"
halts_for_input: true
next_step: null
partial_completion_id: "planning_entry_sync_step_04"
---

## Goal

Write the `planning-scope-v{N}.md` distillate (schema-validated). Present it to the user. Confirm the archetype mode. Surface the legacy-assessment trigger if applicable. Suggest the next step.

## Instructions

### Write Planning Scope Memo

1. Write `_context/planning/planning-scope-v{N}.md` using the context assembled in Steps 0–3. Schema: `schemas/planning-artefacts/planning-scope.schema.json`.

   Required sections:
   ```markdown
   ---
   version: N
   phase: 4
   archetype_mode: standard-pm | vibe-coder-lean | design-first
   generated_at: {ISO timestamp}
   schema: "schemas/planning-artefacts/planning-scope.schema.json"
   ---

   ## Archetype Mode
   {mode} — {rationale}

   ## Recommended Skill Sequence
   {ordered list based on mode}

   ## Active Baselines
   {table: baseline | status | architectural constraint}

   ## Evidence Bundle
   {table: artefact | status | planning impact}

   ## Inherited Risks (from Phase 3)
   {list, or "None flagged" if empty}

   ## Brownfield
   legacy_files_detected: true | false
   legacy_assessment_deferred: false (default)
   ```

2. Validate against `schemas/planning-artefacts/planning-scope.schema.json` before presenting to user.

### Present to User

3. Present a concise summary (not the full memo — link to it):

   > "Phase 4 Planning is ready. Here's the planning scope for this project:
   >
   > **Mode:** {archetype_mode} — {one-sentence rationale}
   > **Active baselines:** {comma list}
   > **Evidence bundle:** {N}/7 artefacts present {⚠ N gaps noted if any}
   > **Inherited risks:** {count or "none"}
   >
   > Full scope memo: `_context/planning/planning-scope-v{N}.md`"

4. Ask user to confirm the archetype mode (or override):

   > "Does **{archetype_mode}** mode look right, or would you like to switch?
   > - **(A)** Yes, proceed with {archetype_mode}
   > - **(B)** Switch to standard-pm
   > - **(C)** Switch to vibe-coder-lean
   > - **(D)** Switch to design-first"

   [Wait for user input]

   If user switches mode: update planning-scope memo with new mode + rationale.

### Legacy Trigger

5. If `legacy_files_detected: true`:

   > "I found files in `_input/legacy/`. Before we begin planning, do you want to run `legacy-assessment` to assess these for migration?
   > (Recommended — the PRD and architecture will be informed by the migration decisions.)
   >
   > - **(A)** Yes, run legacy-assessment now
   > - **(B)** Defer — I'll run it manually later"

   [Wait for user input]

   - If **(A)**: dispatch `legacy-assessment` (auto-trigger). Resume after completion.
   - If **(B)**: write `legacy_assessment_deferred: true` to scope memo. Continue.

### Suggest Next Step

6. Present the suggested next step based on mode:
   - `standard-pm` or `vibe-coder-lean`: "Ready to start planning. When you're ready, say **'create PRD'** to begin authoring the Product Requirements Document."
   - `design-first`: "Ready to start planning. When you're ready, say **'create design brief'** to establish the visual and content direction first."

### Partial Completion Clear

7. On clean exit: clear `partial_completion` from `coldpress.yaml`.

## Output

- `_context/planning/planning-scope-v{N}.md` written and schema-valid
- User greeted and archetype mode confirmed
- Legacy trigger surfaced if applicable
- Suggested next step presented

## Navigation

`planning-entry-sync` is complete. Proceed to the first skill indicated by the recommended sequence in the scope memo.
