---
step_number: 5
step_name: "Finalize"
step_goal: "Review, validate, and write the sacred PRD document"
halts_for_input: true
next_step: null
---

## Goal

Compile all sections into the final PRD, validate internal consistency, and write the sacred document.

## Instructions

1. **Compile the PRD:**
   - Assemble all sections: Vision, Requirements, Features
   - Add table of contents
   - Include YAML frontmatter with sacred document metadata:
     ```yaml
     sacred: true
     version: "1.0"
     created: "{date}"
     last_modified: "{date}"
     governance: "requires-review"
     workflowType: "prd"
     stepsCompleted: ["step-00", "step-01", "step-02", "step-03", "step-04", "step-05"]
     adr_references: ["{ADR-NNNN}", ...]
     ```

2. **Internal consistency check:**
   - Every requirement traces to a goal
   - Every feature traces to a requirement
   - No contradictions between sections
   - Scope boundaries are respected
   - All ADR references are valid (from Phase 3 `_context/planning/adrs/`)

3. **Quality check:**
   - All requirements have acceptance criteria
   - All features have user stories (using story-types Tier 1)
   - NFRs are specific and traceable to active baselines or explicit product decisions
   - No TBD or placeholder content remains

4. **Optional review passes (offer before locking):**

   > "Before we lock this as a sacred document, I can offer:"
   > - **(A)** Adversarial review — challenge the PRD's assumptions and flag blind spots (`@analyst adversarial-review`)
   > - **(B)** Editorial prose pass — improve clarity and readability (`@analyst editorial-prose`)
   > - **(C)** Editorial structure pass — check section coherence and flow (`@analyst editorial-structure`)
   > - **(D)** Skip — lock the PRD as-is

   [Wait for user input — multiple options may be selected; run each in sequence]

5. **Final review with user:**
   - Present the complete PRD (or summary if long)
   - "Does this fully capture what you want to build?"
   - "Any final changes before this becomes a sacred document?"

6. **Write to disk:**
   - Save as `_context/sacred/prd.md`
   - Mark as `sacred: true` in frontmatter

7. **Emit `prd.meta.json` sidecar:**
   ```json
   {
     "prd_version": "1.0",
     "feature_count": {N},
     "nfr_axes": ["performance", "accessibility", "security", ...],
     "adr_references": ["ADR-NNNN", ...],
     "baselines_active": ["accessibility", "security", ...],
     "brownfield_modules_count": {N},
     "generated_at": "{ISO timestamp}"
   }
   ```
   Save to `_context/sacred/prd.meta.json`. Validate against `schemas/handoffs/prd-to-architecture.schema.ts`.

   `feature_count` = count of P0 + P1 features.
   `brownfield_modules_count` = 0 unless `legacy-assessment` ran — read from legacy module graph nodes.

8. **Partial Completion Clear:**
   Clear `partial_completion` from `coldpress.yaml`.

9. **Signal completion:**
   - Confirm PRD + meta sidecar written
   - Suggest next steps: `validate-prd`

## Output

- `_context/sacred/prd.md` written (sacred)
- `_context/sacred/prd.meta.json` written (schema-valid)

## Navigation

Workflow complete. -> Proceed to `validate-prd`.
