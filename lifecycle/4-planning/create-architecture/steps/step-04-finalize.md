---
step_number: 4
step_name: "Finalize"
step_goal: "Compile, validate, and write the sacred architecture document"
halts_for_input: true
next_step: null
---

## Goal

Assemble all sections into the final architecture document, verify internal consistency, and write the sacred document.

## Instructions

1. **Load the output template:**
   - Read `coldpress-os/templates/documents/architecture.md`
   - Use it as the structural scaffold — fill every section from Steps 2-3

2. **Compile the architecture document:**
   - Section 1: Overview (system purpose + key decision summary table)
   - Section 2: System Architecture (diagram + component table from Step 2a)
   - Section 3: Data Model (entities + relationships from Step 2b)
   - Section 4: API Design (endpoints + auth from Step 2c)
   - Section 5: Infrastructure (environments, deployment strategy)
   - Section 6: Security (threat model, data protection)
   - Section 7: Performance (targets from PRD NFRs, scaling strategy)
   - Section 8: Cross-Cutting Concerns (logging, error handling from Step 3c)
   - Inline ADRs after relevant sections (from Step 3b)
   - Patterns and Anti-Patterns as appendix or inline (from Steps 3c-3d)

3. **Add sacred document metadata:**
   ```yaml
   ---
   sacred: true
   version: "1.0"
   created: "{date}"
   last_modified: "{date}"
   governance: "requires-review"
   ---
   ```

4. **Internal consistency check:**
   - Every component traces to a PRD feature area
   - Every data entity traces to a PRD data requirement
   - Every API endpoint traces to a PRD functional requirement
   - ADR decisions align with tech-stack.md (no contradictions)
   - Performance targets match PRD NFRs
   - No TBD or placeholder content remains

5. **AI-readiness check:**
   - Could an AI agent (@developer) read this document and make correct implementation choices without guessing?
   - Are patterns explicit enough that code generation will be consistent?
   - Are anti-patterns clear enough to prevent common AI mistakes?

6. **Final review with user:**
   - Present the complete architecture document
   - "This is about to become a sacred document. Once locked, changes require a governance workflow."
   - "Is there anything you want to change before we finalize?"

7. **Write to disk:**
   - Save as `_output/planning/architecture.md`
   - Mark as sacred in frontmatter
   - Add version control panel

8. **Signal completion:**
   - Confirm sacred document written
   - Recommend next steps:
     - If UX not done: `create-ux-design`
     - If all Phase 4 complete: Phase 5 `create-epics`
     - Consider `adversarial-review` on the architecture before proceeding

## Output

Sacred architecture document written to `_output/planning/architecture.md`. `step_4_complete: true`

## Navigation

Workflow complete. -> Suggest proceeding to Phase 5 Breakdown or remaining Phase 4 skills.
