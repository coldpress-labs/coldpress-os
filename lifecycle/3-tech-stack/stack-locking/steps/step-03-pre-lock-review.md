---
step_number: 3
step_name: "Pre-Lock Review"
step_goal: "Present the full stack to the user; run adversarial-review; surface concerns before lock"
halts_for_input: true
next_step: "step-03a-red-flag-escape-hatch.md"
---

## Goal

Give the user a clear view of the complete stack before it's locked. This is the last comfortable moment to change a decision without re-running the full provision pipeline. Run `adversarial-review` to catch blind spots.

## Instructions

### 1. Present full stack

> **Full tech stack for review:**
>
> {Present tech-stack.md sections as a summary — one line per area with chosen technology and tier}
>
> Every choice above was derived from your Phase 2 research. Anything you'd like to revisit?

Wait for user input. If they flag a concern: route back to `stack-evaluation` for that area, then re-run from Step 1.

### 2. Run adversarial-review

Invoke `adversarial-review` with the tech-stack.md draft as input. Prompt it for:
- Lock-in blind spots (any cluster of high-lock-in choices?)
- Cost risks (any combination that exceeds the project's budget tier?)
- Team-familiarity cliffs (any area where `team_familiarity` score was < 5?)
- Missing decision areas (any required area still not covered?)

Present the adversarial-review findings to the user. For each concern: user can acknowledge / revise / dismiss with rationale.

### 3. Team-shape signoff checkpoints

**If `team_shape = team`:** Prompt for a stakeholder alignment note:
> Any stakeholder alignment needed before locking? Brief note (or "n/a"):

Record in the tech-stack.md frontmatter as `stakeholder_note` or proceed without it.

**If `team_shape = client-project`:** Add a client-signoff checkpoint:
> Before locking the stack, confirm that the client has reviewed and approved these choices. Log to `_context/audit/client-signoffs/` (format: `| {date} | {client-slug} | stack-lock | {names} | approved |`).

Do not proceed to Step 3a until client-signoff is logged. If client is unavailable, prompt user: "Proceed without client signoff?" — log decision in audit file with rationale.

### 4. Party-mode offer

**If** `team_shape = client-project` OR `user.cadence = verbose`:

> Want all 9 agents to pressure-test the composite stack before lock? This catches lock-in blind spots before the commit. (~10-15 min)
>
> [Y] Run party-mode → invokes `party-mode` skill; transcript at `_context/planning/discussions/party-phase-3-{date}.md`
> [N] Continue to risk-check

Party-mode never runs without explicit user opt-in.

## Output

User has reviewed and confirmed (or revised) the stack. `step_3_complete: true`

## Navigation

→ Proceed to [step-03a-red-flag-escape-hatch.md](step-03a-red-flag-escape-hatch.md)
