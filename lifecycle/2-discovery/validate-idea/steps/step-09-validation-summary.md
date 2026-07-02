---
step_number: 9
step_name: "Validation Summary & Red-Flag Escape Hatch"
step_goal: "Aggregate signals; surface critical weakness if present; write versioned output + audit row"
halts_for_input: true
next_step: "complete"
---

## Instructions

Step 9 **always runs**, regardless of `team_shape`. The audit-log row and the versioned output are structural — they prove the skill was exercised and capture the decision trail.

### 1. Aggregate signals across Steps 1-6 (+ 7/8)

Collect the confidence / strength / signal fields produced during execution:

| Step | Field | Value |
|---|---|---|
| 1 | problem_evidence | strong / moderate / weak |
| 2 | riskiest_assumption_testable | true / false |
| 3 | differentiation_strength | strong / moderate / weak / none |
| 4 | problem_solution_fit | strong / moderate / weak / unverified |
| 5 | metric_clarity | strong / moderate / weak |
| 6 | prior_art_signal | gap / opportunity / saturated |
| 7 (if ran) | blocking_stakeholder_deltas | list (may be empty) |
| 8 (if ran) | client_signoff | confirmed / revise / rejected |

### 2. Evaluate red-flag criteria

**Critical weakness = any of:**
- `problem_evidence == weak`, OR
- `riskiest_assumption_testable == false`, OR
- `differentiation_strength == none` AND `prior_art_signal == saturated`, OR
- `client_signoff == rejected` (if Step 8 ran)

Also **warn-level flags** (surface but don't trigger escape hatch):
- `problem_solution_fit == weak`
- `metric_clarity == weak`
- Any `blocking_stakeholder_deltas`

### 3a. Clean-summary branch (no critical weakness)

Present a concise summary to user:

> Validation complete. Problem evidence: {value}. Riskiest assumption: *"{list[0]}"* — {testable}. Differentiation: {value}. Fit: {value}. North Star: {metric}. Prior art: {value}.
>
> Warn-level flags: {list if any}.
>
> Ready to proceed to Phase 3 tech stack selection?

On user confirm: proceed to Step 4 (write output).

### 3b. Critical-weakness branch (escape hatch)

Surface explicitly, prose per the deep-dive §Step 9:

> ⚠ Before we move to Phase 3 (where pivoting gets expensive), I want to flag what I found:
> - Problem evidence: **weak** — {details}
> - Riskiest assumption: **"\[list[0]\]"** — **untestable** — {details}
> - Prior art: **saturated**, differentiation: **none** — {details}
>
> This is a high-stakes moment. Four options:
> 1. **Pause** — gather more evidence, come back later
> 2. **Acknowledge & proceed** — I'll note you proceeded knowing these risks
> 3. **Revise** — go back to a specific step to strengthen
> 4. **Run party-mode** (opt-in) — all 9 agents pressure-test this before we proceed. Heavy but catches cross-perspective blind spots.

Halt. User picks.

#### Option 1 — Pause

- Write `_context/audit/validation-decisions-{date}.md` row: disposition = `pause`, rationale = user's stated reason
- Do NOT write the final validation artefact (skill re-enters later at Step 1 or Step 2)
- Exit with clear note on what to return with

#### Option 2 — Acknowledge & proceed

- Write validation-decisions row: disposition = `proceed`, rationale = user's acknowledgement ("Aware of risks; building exploratory prototype" or similar)
- Proceed to Step 4 (write versioned output with the weakness flags in frontmatter)

#### Option 3 — Revise

- Ask user which step to revise
- Re-enter that step; on re-completion, return to Step 9
- Bump `validation_version` on the final write (this becomes `v{N+1}`)

#### Option 4 — Run party-mode

Invoke [`skills/utilities/party-mode/`](../../../skills/utilities/party-mode/). All 9 subagents weigh in on the validation findings. Output lands at `_context/planning/discussions/party-phase-2-{date}.md`.

After party-mode: re-present Step 9 choices (pause / proceed / revise) with party-mode findings in hand. Party-mode is informational — doesn't automatically route.

### 4. Write the audit-log row

Append to `_context/audit/validation-decisions-{date}.md` (create if missing; append if exists):

```markdown
| Date | Approver | Flags | Disposition | Rationale | Linked artefact |
|---|---|---|---|---|---|
| <ISO> | <user|team-lead|client> | <comma-separated flag list> | <pause|proceed|revise|party-mode> | <one-line rationale> | idea-validation-v{N}.md |
```

### 5. Write the versioned validation output

Only if disposition is **proceed** or **revise (completed)**. Target: `_context/planning/idea-validation-v{N}.md` (bumped per Step 9 routing).

Frontmatter per the shared research-output schema (Wave 4.6):

```yaml
---
name: idea-validation
topic: <short label>
phase_authored: 2
status: final
problem_evidence: strong | moderate | weak
riskiest_assumptions:
  - "<hypothesis 1>"
  - "<hypothesis 2>"
  - "<hypothesis 3>"
riskiest_assumption_testable: true | false
north_star_metric: "<metric>"
leading_indicators: [<list>]
differentiation_strength: strong | moderate | weak | none
differentiation_statement: "<one sentence>"
problem_solution_fit: strong | moderate | weak | unverified
prior_art_signal: gap | opportunity | saturated
stakeholder_deltas: [<list>]
client_signoff: confirmed | revise | rejected | null
red_flag_disposition: null | proceed | pause | revise | party-mode
supersedes: []
version: "1.0"
validation_version: N
---
```

Body structure:

```markdown
# Idea Validation — <project name> (v{N})

## Problem validation (Step 1)
<refined statement + evidence + confidence>

## Riskiest assumptions (Step 2)
<ordered list + testability + proposed experiments>

## Competitive differentiation (Step 3)
<Blue Ocean + Positioning Map + VPC + unfair-advantage statement>

## Problem-solution fit (Step 4)
<JTBD + Gap Analysis + journey walk + fit score>

## Success metrics (Step 5)
<North Star + leading indicators + guardrails>

## Prior art (Step 6)
<signal + beachhead + OSS scan>

## Stakeholder alignment (Step 7 — if ran)
<deltas + resolution owners>

## Client alignment (Step 8 — if ran)
<status + any revision notes>

## Summary
{clean summary or red-flag summary per branch}

## Decision (Step 9)
{disposition + rationale + flag set}

## Downstream handoff
- **→ Phase 3 tech stack:** <metrics-measurability notes, constraint-impact from validation>
- **→ Phase 4 PRD:** <North Star + leading indicators become acceptance criteria>
- **→ Phase 5 Breakdown:** <riskiest-assumption experiments to plan>
```

### 6. Final halt — signoff

Show final file + audit row. Confirm:

> Validation v{N} written. Decision: {disposition}. Ready for `product-brief` to consume? Or anything else to tune first?

On confirm: workflow complete.

## Output

Versioned validation doc + audit-log row (+ optional party-mode transcript) written. Workflow complete.

## Navigation

→ Workflow complete.
