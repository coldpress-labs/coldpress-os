---
step_number: 3
step_name: "Requirements"
step_goal: "Define functional and non-functional requirements"
halts_for_input: true
next_step: "step-04-features.md"
partial_completion_id: "create_prd_step_03"
---

## Goal

Capture all functional and non-functional requirements that the product must satisfy.

## Instructions

1. **Functional requirements:**
   - Group by feature area or user flow
   - Each requirement: ID, description, priority (P0/P1/P2), acceptance criteria
   - Use format: "The system shall [verb] [object] [condition]"
   - Ensure traceability to product goals
   - **Guard against priority inflation** (VP2 O20): P0 = "v1 cannot ship without it." Every P0 forces a mandatory measurable outcome in the block-gated `outcomes.yaml`, so a bloated P0 set inflates the outcome contract. If more than ~half the FRs land at P0, re-examine: compliance/polish refinements layered on an already-P0 primitive are usually P1. Flag the P0 share to the user before finalizing.

2. **Non-functional requirements — derive from active baselines:**
   From `planning-scope active_baselines` (loaded in Step 0), each confirmed baseline generates mandatory NFRs:
   - `seo_aeo_llm: confirmed` → NFR: semantic HTML, sitemap, `public/llms.txt`, OG metadata on all pages
   - `accessibility: confirmed` → NFR: WCAG 2.1 AA, axe-core CI gate, keyboard nav, colour contrast
   - `security: confirmed` → NFR: dependabot, CSP headers, no secrets in client-side code, auth via {stack_pack pre-pick}
   - `future_proof: confirmed` → NFR: TypeScript strict, ESM-first, no deprecated APIs

   Also capture performance, scalability, reliability, and compatibility requirements for this specific product.

3. **Technical constraints:**
   - Technology stack constraints (from `tech-stack.md` ADRs — loaded in Step 0 graph)
   - Integration requirements (APIs, third-party services)
   - Infrastructure constraints (hosting, budget, free tiers)

### Supersede-Check Points

   For each requirement that could contradict prior artefacts, check:
   - **vs `context.md` problem statement:** if an NFR contradicts the project's stated constraints, flag it
   - **vs `tech-stack.md` locked decisions:** if a requirement implies a new dependency not in the ADRs, surface as a stack gap: *"This requirement seems to need [X], which isn't in the locked stack. Options: (A) Accept as implementation detail, (B) Flag for Phase 6 architecture, (C) Trigger Phase 3 stack-change workflow."*
   - **vs `coldpress.yaml baselines` opted-out:** if a requirement contradicts an opt-out (e.g., PRD says "must meet WCAG 2.1 AA" but accessibility was opted out), surface: *"This requirement contradicts the accessibility opt-out from Phase 3. Options: (A) Re-enable accessibility baseline, (B) Accept as PRD-override with explicit note."*

### Advanced-Elicitation (Tier 2 Router Bias)

   For any requirement where the user gives a vague or hedged answer (e.g., "it depends", "probably", "not sure yet"), apply advanced-elicitation triggers:
   - Reflect the ambiguity back: *"You mentioned [X] — can we be more specific? What would 'done' look like?"*
   - Offer the advanced-elicitation router: *"This seems complex. Would you like me to run a deeper elicitation exercise? (@analyst advanced-elicitation)"*

4. **Data requirements:**
   - Data entities and relationships (high level)
   - Data retention and privacy requirements
   - Import/export requirements

5. **Review with user:**
   - Walk through requirements by priority
   - Confirm nothing critical is missing
   - Validate priorities are correct

## Output

Requirements section drafted and approved. `step_3_complete: true`

## Navigation

-> Proceed to [step-04-features.md](step-04-features.md)
