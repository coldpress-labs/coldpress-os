---
step_number: 3
step_name: "Iteration (design-thinking prototype + test)"
step_goal: "Iterate on prototype per user/agent feedback; method-playbook design_thinking prototype + test stages"
halts_for_input: true
next_step: "step-04-validate.md"
partial_completion_id: "prototype_step_03"
---

## Goal

Iterate on the prototype. Method playbook Tier-1: `design_thinking` prototype stage (build) + test stage (gather feedback / observe).

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "prototype_step_03", sub_skill: "iterate", at: "started" }`.

### 2. Design-thinking prototype stage

For each screen authored in Step 2: confirm:
- Persona × task coverage (does this prototype let persona complete primary task?)
- A11y present (focus order, landmarks, aria-labels)
- Brand tokens applied consistently
- Edge cases (empty/loading/error) addressed

### 3. Design-thinking test stage

Pick top-2 riskiest user stories (from idea-validation `riskiest_assumptions`). Walk through prototype:

> **Test walk-through.** Persona: <name>; Task: <task from US-X>.
>
> Step-by-step: walk through prototype as the persona. Note:
> - Friction points
> - Missing affordances
> - Confusion / ambiguity
> - Token issues (contrast, hierarchy, motion)
>
> *Tier-1 method: `problem-solving` (scenario-walkthrough)*

Halt for user/agent input.

### 4. Capture friction as design-deltas

For each friction point that implies a PRD or UX-spec gap:

```yaml
- id: delta-XXX
  source_skill: prototype
  source_step: step-03-iteration
  prd_section: "User Stories US-<N> AC-<M>" OR "Interaction Patterns"
  delta_type: additive|modifying|conflicting
  description: <friction point>
  evidence: "Test walk-through with persona <name> revealed: <observation>"
  reconciliation_options: [accept_into_prd, reject, flag_for_architecture_ADR, park_for_phase_11]
  recommendation: <one>
```

Append to `_context/handoffs/phase-5-design-deltas-wip-{date}.md`.

### 5. Iterate prototype files

Update artefact files per accepted findings. Update manifest.

### 6. Partial-completion clean

`at: "iterated"`.

## Output

- Prototype iterated; friction points captured as design-deltas
- Updated artefact files

## Navigation

→ Next: [step-04-validate.md](step-04-validate.md)
