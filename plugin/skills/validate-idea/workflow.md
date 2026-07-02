---
workflow_version: "1.0"
output_file: "_context/planning/idea-validation-v{N}.md"
total_steps: 9
resume_from: "frontmatter"
versioned: true
gate_severity: "warn"
---

## Overview

Last cheap-pivot window before Phase 3 commits to a stack. 6 core steps (always run) + 2 conditional steps (fire on `user.team_shape`) + Step 9 red-flag summary (always runs). Pressure-tests the idea against evidence, assumptions, differentiation, fit, metrics, and prior art.

## Step Index

| Step | File | Condition | Description |
|------|------|-----------|-------------|
| 1 | [step-01-problem-validation.md](steps/step-01-problem-validation.md) | always | Problem Statement Refinement + Five Whys + Is/Is Not → score evidence confidence |
| 2 | [step-02-hypotheses-and-risks.md](steps/step-02-hypotheses-and-risks.md) | always | Lean Startup + Risk Matrix → tag riskiest 1-3 assumptions |
| 3 | [step-03-differentiation.md](steps/step-03-differentiation.md) | always | Blue Ocean + Positioning Map + Value Proposition Canvas |
| 4 | [step-04-problem-solution-fit.md](steps/step-04-problem-solution-fit.md) | always | Jobs to be Done + Gap Analysis → walk primary persona's journey |
| 5 | [step-05-success-metrics.md](steps/step-05-success-metrics.md) | always | Measurement Framework → North Star + leading indicators |
| 6 | [step-06-prior-art.md](steps/step-06-prior-art.md) | always | Disruptive Innovation + Crossing the Chasm → gap vs saturated |
| 7 | [step-07-stakeholder-alignment.md](steps/step-07-stakeholder-alignment.md) | `team_shape != solo` | Surface internal stakeholder disagreement |
| 8 | [step-08-client-alignment.md](steps/step-08-client-alignment.md) | `team_shape == client-project` | Formal client signoff |
| 9 | [step-09-validation-summary.md](steps/step-09-validation-summary.md) | always | Aggregate signals; red-flag escape hatch; write versioned output |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Tier 1 methods are mandatory** in every step. Advanced-elicitation bias methods are optional.
4. **Conditional steps fire on Butler-passed flags** (not on skill-internal config reads). Butler invokes `condition-reader` at dispatch and passes `team_shape` as an input flag.
5. **Output is versioned** — never overwrite. Re-run from Step 9 "revise" produces `v{N+1}`.
6. **Step 9 always runs.** Even if Steps 1-6 look clean, the summary + audit-log entry are structural — the log proves the skill was exercised and captures the decision trail.
7. **Party-mode is opt-in only.** Surfaced at Step 9 critical-weakness branch. User confirms; never auto-runs.

## Completion Criteria

- All applicable steps completed per `team_shape` rule
- Each step's Tier 1 methods applied (not skipped)
- Frontmatter populated with all confidence / strength / signal fields
- `_context/planning/idea-validation-v{N}.md` written
- `_context/audit/validation-decisions-{date}.md` row appended
- (If `team_shape = client-project`) `_context/audit/client-signoffs/validation-{date}.md` produced

## Versioning logic

Butler checks `_context/planning/` for existing `idea-validation-v*.md` files:
- No prior versions → write `idea-validation-v1.md`
- Latest is `v{N}` → write `idea-validation-v{N+1}.md`
- On "revise" from Step 9 → same bump-one-version pattern

## Red-flag criteria (Step 9 routing)

Critical weakness triggers the escape-hatch branch when ANY of:
- Step 1 problem evidence = **weak**
- Step 2 riskiest assumption = **untestable** (no cheap experiment in scope)
- Step 3 differentiation = **none** AND Step 6 prior art = **saturated**

On critical weakness: Step 9 offers pause / acknowledge / revise / party-mode. User picks; disposition logged.
