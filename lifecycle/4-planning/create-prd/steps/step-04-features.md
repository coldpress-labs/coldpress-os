---
step_number: 4
step_name: "Features"
step_goal: "Define feature descriptions with user stories and acceptance criteria"
halts_for_input: true
next_step: "step-05-finalize.md"
partial_completion_id: "create_prd_step_04"
---

## Goal

Transform requirements into concrete feature descriptions with user stories, acceptance criteria, and implementation guidance.

## Instructions

1. **Feature inventory:**
   - List all features derived from requirements
   - Group by feature area or epic
   - Assign priority tier: P0 (must-have), P1 (should-have), P2 (nice-to-have)

2. **For each feature, define:**
   - **Name:** clear, descriptive feature name
   - **Description:** what the feature does and why it matters
   - **User stories:** write using `data/methods/story-types.csv` Tier 1 (wired-in — see below)
   - **Acceptance criteria:** specific, testable conditions for "done"
   - **Dependencies:** other features or systems this depends on (check legacy module nodes if brownfield)
   - **ADR references:** which Phase 3 ADRs constrain or enable this feature (from graph)
   - **Complexity estimate:** S/M/L/XL

### Story-Types Tier 1 Wire-In

   Before writing user stories, query `data/methods/story-types.csv` for the story types most relevant to this feature's category. The CSV has 26 types across 5 categories. Match by feature purpose:
   - **Core workflow features** → Epic Story, Use-Case Story, Job Story
   - **User-facing UI features** → Persona Story, Interaction Story
   - **API / data features** → Technical Story, Integration Story
   - **Constraint / compliance features** → Constraint Story, NFR Story
   - **Error / edge-case features** → Exception Story, Error-Recovery Story

   Apply the matched story type structure to each feature's user stories. Persona names should reference `personas-v{N}` archetypes from graph.

### Risky Assumption Check

   For each feature that touches an unresolved `idea-validation` risky assumption (from Step 0 graph):
   - Flag the assumption in the feature definition: *"This feature depends on the risky assumption: [assumption text]. Status: [open/resolved]."*
   - If open: offer — *"Would you like to add an explicit risk note, or route to Phase 2 additional validation first?"*

3. **Feature interactions:**
   - Map dependencies between features
   - Identify features that can be built independently
   - Note features that form critical paths

4. **MVP boundary:**
   - Draw a clear line: which features are in MVP vs. future phases
   - Justify any P0 features that seem large
   - Ensure MVP is coherent and delivers core value

5. **Review with user:**
   - Walk through features by priority
   - Confirm user stories reflect real needs
   - Validate MVP boundary

## Output

Features section drafted and approved. `step_4_complete: true`

## Navigation

-> Proceed to [step-05-finalize.md](step-05-finalize.md)
