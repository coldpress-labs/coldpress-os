---
step_number: 1
step_name: "Intent"
step_goal: "Understand why the user is here and detect the type of brief needed"
halts_for_input: true
next_step: "step-02-discover.md"
---

## Goal

Determine the user's intent and the type of product brief to create. Detect activation mode (Guided, Autonomous, Yolo) and load any existing context.

## Instructions

1. **Detect activation mode:**
   - Check for `-A` flag (Autonomous) or `--yolo` flag
   - Default to Guided mode if no flags present

2. **Understand intent:**
   - "What kind of product are you building?" (new product, feature, pivot, etc.)
   - "Who needs to read this brief?" (internal team, investors, stakeholders)
   - "What decisions should this brief enable?"

3. **Load existing context:**
   - Check for `_context/sacred/context.md` — expect `status: authored` (pre-project-interview ran)
   - Check for the latest `_context/planning/research-synthesis-v{N}.md` — the primary upstream input
   - Check for discovery outputs in `_context/planning/research/` (domain, market, constraint, personas)
   - Check for `_context/planning/idea-validation-v{N}.md` if validate-idea ran
   - Check `_context/tracking/intake-{date}.md` for material inventory Phase 1 already captured
   - Summarize what's already known

4. **Confirm scope:**
   - Present what you've gathered and confirm the brief type
   - In Autonomous/Yolo mode: proceed with loaded context

## Output

Intent understood, activation mode set, existing context loaded. `step_1_complete: true`

## Navigation

-> Proceed to [step-02-discover.md](step-02-discover.md)
