---
step_number: 1
step_name: "Gate Check"
step_goal: "Run evaluate-phase-gate for the outgoing phase; block transition on failure"
severity: "block"
halts_for_input: true
next_step: "step-02-graph-rebuild.md"
---

## Goal

Verify the outgoing phase's exit contract before the next phase starts. This is the last guard before handing over — it must pass cleanly.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, `phase-transition.from-phase-${fromPhase}.step-01-gate-check`);
```

### 2. Run the gate

Invoke `governance/evaluate-phase-gate` with `from_phase`:

```
@qa evaluate-phase-gate --phase {from_phase}
```

This reads `lifecycle/{from-phase}-*/gate.json`, evaluates all `acceptance_checks`, and emits a `GateEvaluation` JSON.

### 3. Evaluate result

#### All blocks green (overall: pass or pass-with-warnings)

- Surface any warnings to the user — do not silently suppress them.
- Continue to Step 2.

#### Block failures

Halt. Present the failing blocks with their `remediation` text from `gate.json`:

> Phase {from_phase} exit gate failed. The following issues must be resolved before transitioning to Phase {to_phase}:
>
> - [{check_id}] {description}: {remediation}

Do **not** mark the transition as started. Return control to the user.

#### Pending-human checks

Halt. List the pending sign-offs:

> The following Phase {from_phase} checks require human approval before we proceed:
>
> - [{check_id}] {description}: {human_approver} must sign off.
>
> Once signed off, re-run `phase-transition` and it will pick up from here.

### 4. Record gate outcome

Write a one-line marker to `.coldpress/local-config.yaml` under `transitions`:

```yaml
transitions:
  - from_phase: {from_phase}
    to_phase: {to_phase}
    gate_evaluated_at: "{ISO-8601}"
    gate_result: "pass" | "pass-with-warnings"
```

## Halts For Input

On any block severity failure or pending-human check. Does not halt on clean pass.

## Navigation

→ Proceed to [step-02-graph-rebuild.md](step-02-graph-rebuild.md) on pass.
→ Halt and return control to user on block or pending-human.
