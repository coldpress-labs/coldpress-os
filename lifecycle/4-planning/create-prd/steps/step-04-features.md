---
step_number: 4
step_name: "Features"
step_goal: "Define feature descriptions with user stories and acceptance criteria"
halts_for_input: true
next_step: "step-05-finalize.md"
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
   - **User stories:** "As a [user], I want to [action], so that [benefit]"
   - **Acceptance criteria:** specific, testable conditions for "done"
   - **Dependencies:** other features or systems this depends on
   - **Complexity estimate:** S/M/L/XL

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
