---
step_number: 2
step_name: "Persona-Grounded User Flows + IA"
step_goal: "Author information architecture + user flows grounded in personas; supersede-check on stack feasibility"
halts_for_input: true
next_step: "step-03-wireframes.md"
partial_completion_id: "ux_design_step_02"
---

## Goal

Author Section 2 (Information Architecture) and Section 3 (User Flows). Persona-grounded — each flow traces back to a specific persona × user-task pair from PRD. Stack-feasibility supersede-check on flow claims that imply tech capabilities (offline, real-time, multi-window, etc.).

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "ux_design_step_02", sub_skill: "ia_flows", at: "started" }`.

### 2. Information Architecture — site map / app structure

Prompt user (or @ux-designer agent):

> **Information Architecture.** Based on PRD feature list and personas:
>
> - Top-level sections / app areas (3–7)
> - Per section: primary purpose + which persona uses it most
> - Navigation pattern (top nav / side nav / tab bar / drawer / no-nav single-page)
> - Cross-section relationships (e.g., "Profile" referenced from "Dashboard" + "Settings")

Halt for user input. Author into draft Section 2.

### 3. User Flows — one per primary persona × task

For each persona, identify primary tasks from PRD user-stories. For each persona × top-task pair, author a flow:

```
### Flow: <Persona Name> — <Task>

**Persona:** <name> (link to Section 1.2)
**PRD User Stories:** US-<N>, US-<M> (cite IDs)
**Riskiest Assumption tested:** <quote from idea-validation, if applicable>

**Steps:**
1. Entry — <where they enter from>
2. <Action> → <System response>
3. <Action> → <System response>
   - Edge: <alternative path>
4. Success state — <observable result>

**Decision points:** <branching / error / retry behaviour>
**Friction risks:** <identified by problem-solving Step 3, if any>
```

### 4. Supersede-check on flow capabilities

For each flow, scan for capabilities that imply tech requirements:
- "user works offline" → service worker / local storage required → check tech-stack
- "real-time updates" → websockets / SSE → check tech-stack
- "multi-window sync" → BroadcastChannel / shared workers → check tech-stack
- "haptic feedback" → mobile-only or PWA → check tech-stack target

If flow claims a capability the stack doesn't support, surface as design-delta:

```yaml
- id: delta-XXX
  source_skill: ux-design
  source_step: step-02-flows
  prd_section: "User Stories US-<N>"
  delta_type: conflicting
  description: "Flow X requires <capability>; tech-stack does not currently include the supporting library."
  evidence: "<flow snippet>; tech-stack.md says <stack>."
  reconciliation_options: [accept_into_prd, reject, flag_for_architecture_ADR, park_for_phase_11]
  recommendation: flag_for_architecture_ADR
```

Append to `phase-5-design-deltas-wip-{date}.md`.

### 5. Coverage check

Verify every PRD user-story-ID maps to at least one flow step OR an explicit "out-of-scope-for-Phase-5-this-version" note. Surface uncovered stories as design-deltas (additive recommendation).

### 6. Partial-completion clean

`at: "ia_flows_drafted"`.

## Output

- Section 2 (IA) drafted
- Section 3 (User Flows) drafted with persona-grounded flows
- Stack-feasibility supersede-check run; conflicts as design-deltas
- PRD user-story coverage check complete

## Navigation

→ Next: [step-03-wireframes.md](step-03-wireframes.md)
