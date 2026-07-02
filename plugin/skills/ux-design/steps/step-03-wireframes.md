---
step_number: 3
step_name: "Key Screens + Interaction Patterns"
step_goal: "Author Section 4 (Key Screens) + Section 5 (Interaction Patterns); design-thinking ideate + scenario-planning + problem-solving (edge_case_hunter); advanced-elicitation on vague_interaction_pattern"
halts_for_input: true
next_step: "step-04-spec.md"
partial_completion_id: "ux_design_step_03"
---

## Goal

Author key screen concepts (one per primary flow step) and interaction patterns (gestures, transitions, feedback). Method playbook Tier-1: `design_thinking` ideate stage (heavy); `problem_solving` `edge_case_hunter` (medium); `advanced_elicitation` on vague triggers.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "ux_design_step_03", sub_skill: "screens_interactions", at: "started" }`.

### 2. Identify key screens

From Section 3 flows: every flow step that requires substantial UI gets a screen entry. Group similar steps into shared screen patterns where appropriate.

### 3. Per-screen authoring

For each screen:

```
### Screen: <Name>

**Purpose:** 1-sentence purpose statement
**Used by flows:** <flow list with persona × task>
**Primary content:**
- <element> — <rationale grounded in persona/PRD>
- <element> — <rationale>

**Layout concept:** (header/main/sidebar/etc.; references brand-guidelines layout patterns when ready)

**Interactions:**
- <input> → <feedback> — <rationale>
- Edge: <state> — <handling>

**A11y notes:**
- Keyboard nav: <flow>
- Screen reader: <landmark / heading / aria-label rules>
- Contrast: see brand-guidelines (a11y baseline = <level>)
```

### 4. Tier-1 method invocations

For ambiguous screens or complex content choices:
- Invoke `design_thinking` ideate stage — generate 3+ screen alternatives, compare against persona pain-points
- Invoke `problem-solving` `edge_case_hunter` — enumerate edge cases (empty state, error state, loading state, offline state, slow network, no permissions)

### 5. Advanced-elicitation on vague interaction patterns

Detect patterns like "intuitive", "natural", "familiar". On match, invoke `advanced-elicitation` (method `scenario-walkthrough`) — drill: "walk through how persona X completes this in 30 seconds; what gestures / clicks / decisions?"

### 6. Section 5 — Interaction Patterns

Authoring level: app-wide patterns (not per-screen specifics). Examples:
- Loading affordances: skeleton / spinner / progressive
- Error handling: inline / toast / banner / modal
- Form feedback: real-time vs submit-time
- Confirmation: toast / inline / modal threshold
- Animation/motion: respects motion-reduce when a11y-AAA opt-in (or always — recommend default-on)

### 7. Edge-case design-deltas

Edge cases discovered in Step 4 (problem-solving) often surface PRD gaps: missing acceptance criteria for failure modes, undefined empty states, etc. Surface as design-deltas with `delta_type: additive`, `recommendation: accept_into_prd`.

### 8. Partial-completion clean

`at: "screens_interactions_drafted"`.

## Output

- Section 4 (Key Screens) drafted
- Section 5 (Interaction Patterns) drafted
- Edge cases enumerated; gaps as design-deltas
- design-thinking ideate + problem-solving + advanced-elicitation invocations logged in meta

## Navigation

→ Next: [step-04-spec.md](step-04-spec.md)
