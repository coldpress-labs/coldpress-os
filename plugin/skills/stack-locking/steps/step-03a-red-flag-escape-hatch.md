---
step_number: "3a"
step_name: "Red-Flag Escape Hatch"
step_goal: "Aggregate risk signals; surface critical risks with pause/acknowledge/revise/party-mode menu; log outcome"
halts_for_input: true
next_step: "step-05a-baselines-confirmation.md"
---

## Goal

Before the sacred lock, check for critical risk signals across the composite stack. If critical signals exist, surface a "last cheap pivot" menu — mirrors `validate-idea` Step 9. Even if no critical signals, run the aggregation and log it.

**Phase 3 is the commit-point.** After lock: wrappers regen, env-provision sinks hours of install time, pivoting gets expensive. This step ensures the user knowingly commits.

## Tier 1 Core Methods

- **Pre-mortem Analysis:** "Imagine we're 6 months post-launch and this stack failed us. What went wrong?" — applied to the 2 highest lock-in choices and any team-familiarity cliff.
- **Failure Mode Analysis (T0):** Enumerate failure modes per critical risk signal.
- **Six Thinking Hats (T0):** Black hat pass on the composite stack — surface pessimistic but realistic concerns.

*(Source: `data/methods/problem-solving-methods.csv`)*

## Instructions

### 1. Aggregate risk signals

Check for the following signals across all ADRs + tech-stack.md draft:

| Signal | Threshold | Source |
|--------|-----------|--------|
| High lock-in cluster | ≥ 3 areas with `rubric.lock_in < 4` (scale 1-10, lower = more locked) | ADR rubric fields |
| Cost overshot | Any area where `rubric.cost < 5` AND budget_tier is `solo-hobby` or `solo-structured` | ADR rubric + local-config |
| Team-familiarity cliff | ≥ 2 areas with `rubric.team_familiarity < 4` | ADR rubric fields |
| Unresolved supersede | Any `supersedes:` entry in ADRs not yet logged to audit | ADR frontmatter |
| Low-scoring ADR | Any ADR with `rubric.weighted_total < 6.0` | ADR frontmatter |

**Critical threshold:** ≥ 2 of the above signals present simultaneously = critical risk.

### 2. If no critical signals

> **Risk check: no critical signals found.** ✓
>
> Stack summary:
> - Lock-in cluster: {N areas with lock_in < 4}
> - Cost alignment: {pass / 1 flag}
> - Team familiarity: {pass / 1 flag}
> - All ADRs score ≥ 6.0
>
> Logging outcome to `_context/audit/stack-lock-decisions-{date}.md`. Proceeding to baselines confirmation.

Log one row to audit file (format per `docs/stack-lock-decisions-log-spec.md`):
```
| {date} | user | none | proceed | No critical risk signals | tech-stack.md |
```

→ Auto-proceed to Step 5a.

### 3. If critical signals present — surface the escape hatch

> **⚠ Risk signals detected before lock:**
>
> {For each signal: name, affected areas, specific concern}
>
> **Phase 3 is the commit-point.** After locking, switching costs rise significantly. Options:
>
> 1. **Pause** — stop here; revisit the flagged areas before locking
> 2. **Acknowledge** — I'm aware of these risks; accept and proceed with documented rationale
> 3. **Revise** — I want to change one or more of the flagged decisions (routes back to stack-evaluation for the relevant area)
> 4. **Party-mode** — Have all 9 agents pressure-test the composite stack first (~10-15 min)

Wait for user input.

**On Pause:** HaltError — log `disposition: paused` to audit file. Provide clear re-entry instructions.

**On Acknowledge:** Prompt for rationale (1 sentence minimum). Log `disposition: acknowledged-risks` + rationale to audit file. Proceed to Step 5a.

**On Revise:** Note which area(s) to revisit. Route back to `stack-evaluation` for those areas. After revision: re-run Step 3 (full pre-lock review), then Step 3a again.

**On Party-mode:** Invoke `party-mode` skill. Transcript at `_context/planning/discussions/party-phase-3-{date}.md`. After party-mode completes: present summary findings; user decides Acknowledge / Revise from above.

**Invoked from `stack-locking` Step 3a (critical-risk branch):** Butler auto-offers party-mode as option 4 per the plan. Prose above matches this wire point.

### 4. Log outcome

Append one row to `_context/audit/stack-lock-decisions-{date}.md` (append-only, per `docs/stack-lock-decisions-log-spec.md`):

```markdown
| Date | Approver | Flags | Disposition | Rationale | Linked artefact |
| {date} | user | {flags list} | {proceed/paused/acknowledged} | {rationale} | tech-stack.md |
```

## Output

Risk aggregation complete; outcome logged. `step_3a_complete: true`

## Navigation

→ Proceed to [step-05a-baselines-confirmation.md](step-05a-baselines-confirmation.md)
