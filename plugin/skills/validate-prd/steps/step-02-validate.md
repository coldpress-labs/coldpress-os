---
step_number: 2
step_name: "Validate"
step_goal: "Run six validation checks and score each dimension"
halts_for_input: false
next_step: "step-03-report.md"
partial_completion_id: "validate_prd_step_02"
---

## Goal

Systematically validate the PRD across six dimensions. For each dimension, produce a verdict (PASS / WARNING / FAIL) and list specific issues with section references.

## Instructions

### Check 1: Completeness

Verify all required PRD sections are present and substantive:

- [ ] Product vision and goals defined (not placeholder)
- [ ] Target users / personas identified
- [ ] Functional requirements listed with IDs and acceptance criteria
- [ ] Non-functional requirements specified (performance, security, accessibility, scalability, reliability)
- [ ] Feature descriptions with user stories and priorities
- [ ] Scope boundaries defined (what's in, what's out)
- [ ] Success metrics defined
- [ ] No TBD, TODO, or placeholder content remains

**Verdict:** PASS (all present), WARNING (minor gaps), FAIL (missing sections or significant placeholders)

### Check 2: Consistency

Verify internal coherence — no section contradicts another:

- [ ] Features align with stated goals (every feature traces to a goal)
- [ ] Requirements don't contradict each other
- [ ] Scope boundaries match feature list (nothing out-of-scope is described as a feature)
- [ ] Priority levels are consistent (P0 items support core goals, not nice-to-haves)
- [ ] Terminology is consistent throughout (same thing isn't called different names)

**Verdict:** PASS / WARNING / FAIL

### Check 3: Testability

Verify requirements can be objectively verified:

- [ ] Every functional requirement has acceptance criteria
- [ ] Acceptance criteria are specific and measurable (not vague like "fast" or "user-friendly")
- [ ] Non-functional requirements have numeric targets (e.g., "< 2s load time" not "fast")
- [ ] Success metrics are measurable
- [ ] Edge cases are addressed or explicitly deferred

**Verdict:** PASS / WARNING / FAIL

### Check 4: Alignment

Verify PRD aligns with upstream strategic documents:

- [ ] Vision statement aligns with context.md project vision
- [ ] Target users match context.md audience
- [ ] Goals align with product-brief strategic objectives (if available)
- [ ] No scope creep beyond what context.md defines
- [ ] Constraints from context.md are reflected in PRD constraints

**Verdict:** PASS / WARNING / FAIL

### Check 5: Feasibility

Verify requirements are realistic given the approved tech stack:

- [ ] Features are implementable with tech-stack.md technologies
- [ ] Performance targets are achievable with chosen infrastructure
- [ ] Free-tier / budget constraints respected (if applicable)
- [ ] Third-party integrations are available and compatible
- [ ] Data model requirements are compatible with chosen database
- [ ] No requirements that implicitly require technologies not in tech-stack.md

**Verdict:** PASS / WARNING / FAIL

### Check 6: Implementability

Verify the PRD gives enough detail for an AI agent (@developer) to implement:

- [ ] Requirements are specific enough to code from (no ambiguous "the system should handle..." without saying how)
- [ ] User flows are describable (not just features in isolation)
- [ ] Data relationships are clear enough to model
- [ ] Auth/permission requirements are explicit (who can do what)
- [ ] Error states and edge cases are addressed (what happens when X fails)

**Verdict:** PASS / WARNING / FAIL

## Output

Six validation verdicts with specific issues noted. `step_2_complete: true`

## Navigation

-> Proceed directly to [step-03-report.md](step-03-report.md)
