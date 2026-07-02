---
step_number: 8
step_name: "Client Alignment Checkpoint"
step_goal: "Formal client signoff on validation findings before Phase 3"
halts_for_input: true
condition: "user.team_shape == client-project"
next_step: "step-09-validation-summary.md"
---

## Instructions

### 1. Fires only for client-project

If `team_shape != client-project`, Butler routes past this step. This file is not read otherwise.

### 2. Why formal client signoff here

Client engagements carry stake asymmetry — the client is paying for decisions they didn't make. Validating the idea without explicit client signoff means Phase 3 stack decisions get challenged later in the project when the cost of pivoting is high. Formal checkpoint at end of Phase 2 = decision captured, audit trail exists.

This is not heavyweight — it's a page-long summary + client email or document signoff. But it must happen, not be assumed.

### 3. Produce the client-facing summary

Different audience than the internal validation doc. Clients care about:
- **Problem** — refined statement + why it matters (Step 1)
- **Riskiest assumption** — what we're most uncertain about + how we'll find out (Step 2)
- **Differentiation** — one paragraph on the unfair advantage (Step 3)
- **Success criteria** — North Star + leading indicators (Step 5)
- **Prior-art finding + beachhead** — one paragraph (Step 6)
- **Stakeholder deltas** — only if the client is a stakeholder or connected to one (Step 7)

Skip internal jargon. Use prose, not canvas artefacts. Client should be able to read it in under 10 minutes.

### 4. Produce the signoff artefact

Target path: `_context/audit/client-signoffs/validation-{date}.md`

Structure:

```markdown
---
name: client-signoff-validation
project: <project name>
client: <client name>
date: <ISO>
validation_version: N
status: pending | confirmed | rejected | revise
---

# Phase 2 Validation — Client Signoff

## Summary for client
{the page-long summary from Step 3}

## Explicit asks

Please confirm before we proceed to Phase 3 (tech stack selection):

1. Problem as stated: **confirmed / revise: \[your note\]**
2. Riskiest assumption as stated: **confirmed / revise: \[your note\]**
3. Unfair-advantage claim: **confirmed / revise: \[your note\]**
4. Success metrics — North Star + leading indicators: **confirmed / revise: \[your note\]**
5. Proceed to Phase 3? **Yes / Not yet, resolve: \[your note\]**

## Method + process notes
Methods applied: Problem Statement Refinement, Five Whys, Is/Is Not, Lean Startup, Risk Matrix, Blue Ocean, Positioning Map, VPC, JTBD, Gap Analysis, Measurement Framework, Disruptive Innovation, Crossing the Chasm.

Full internal validation: `_context/planning/idea-validation-v{N}.md`
```

### 5. Send for client review — halt

> Client signoff artefact written to `_context/audit/client-signoffs/validation-{date}.md`. Ready to send to {client}? I'll wait for confirmed/revise before we write Step 9.

User sends externally; re-enters the skill when response lands. Butler updates `status: confirmed | revise | rejected` based on response, plus captures any revision notes.

### 6. Handle client response

- **Confirmed** — proceed to Step 9 with `client_signoff: confirmed`
- **Revise** — note revisions; re-enter relevant prior steps; bump `validation_version` on re-run
- **Rejected** — flag as critical weakness for Step 9; Step 9 red-flag branch fires

## Output

Client signoff artefact + client response captured. `step_8_complete: true`

## Navigation

→ Proceed to [step-09-validation-summary.md](step-09-validation-summary.md)
