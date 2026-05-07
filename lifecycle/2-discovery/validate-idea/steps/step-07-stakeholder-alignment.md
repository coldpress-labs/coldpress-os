---
step_number: 7
step_name: "Stakeholder Alignment"
step_goal: "Surface internal disagreement before Phase 3 commits"
halts_for_input: true
condition: "user.team_shape != solo"
next_step: "step-08-client-alignment.md"
---

## Instructions

### 1. Fires only for team + client-project

If `team_shape == solo`, Butler routes past this step per Step 6 navigation. This file is not read in solo mode. The skill's Butler-orchestration layer (per Wave 3.9 condition-reader) handles the routing.

### 2. Identify stakeholders

Who has sign-off power or strong opinions on this project? Typical list:
- Product lead / PM
- Engineering lead / architect
- Design lead
- Founder / CEO (if early-stage)
- Investor or exec sponsor (if mid-stage)
- Key customer (if product-led)

Butler doesn't need to talk to all of them — but the user should confirm alignment with each before Phase 3.

### 3. Surface disagreement across Steps 1-6

Present the working validation artefact to the user. For each stakeholder on the list, ask:

> Has \[stakeholder\] seen this validation? Would they agree with:
> - the problem statement + evidence (Step 1)?
> - the riskiest assumptions (Step 2)?
> - the differentiation statement (Step 3)?
> - the fit assessment (Step 4)?
> - the North Star metric (Step 5)?
> - the prior-art take (Step 6)?

Where user says "they'd probably push back on X" — flag. Where user says "I don't actually know" — also flag.

### 4. Document the deltas

Produce a short section in the working validation artefact:

```markdown
## Stakeholder alignment deltas

- **{Stakeholder}** — agrees with Steps 1, 3, 5; pushing back on Step 2 riskiest-assumption framing (prefers to test \[alt\] first).
- **{Stakeholder}** — haven't shown yet; expected concern: \[concern\].
```

Deltas become Phase 3 pre-reading for whichever stakeholder reviews the stack proposal first.

### 5. Guidance on resolution path

Resolution is **outside this skill's scope** — Butler doesn't schedule stakeholder meetings. But the skill should identify:
- Which deltas are **blocking** (Phase 3 can't proceed cleanly without resolution)
- Which are **informational** (proceed; stakeholder will see it during Phase 4 PRD review)

Log resolution-owner for each blocking delta.

### 6. Halt for user input

> Stakeholder deltas: {list}. Blocking before Phase 3: {subset}. Want to resolve these before we proceed, or proceed with the deltas logged?

On "proceed with deltas logged" — accepted; note in validation-decisions audit log (Step 9).
On "resolve first" — pause the skill; user reconvenes with stakeholders; re-enters at Step 9 on return.

## Output

Stakeholder delta log embedded in working validation artefact. `step_7_complete: true`

## Navigation

→ **If `team_shape == client-project`:** proceed to [step-08-client-alignment.md](step-08-client-alignment.md)
→ **If `team_shape == team`:** skip Step 8 → proceed to [step-09-validation-summary.md](step-09-validation-summary.md)
