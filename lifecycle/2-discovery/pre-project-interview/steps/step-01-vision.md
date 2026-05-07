---
step_number: 1
step_name: "Project Vision"
step_goal: "Warm-start from the intake seed; confirm, enrich, don't re-author"
halts_for_input: true
next_step: "step-02-users.md"
---

## Goal

Read the intent seed Phase 1 intake already captured in `_context/sacred/context.md`. Confirm it with the user, then enrich into the full vision. **Don't re-ask the one-sentence intent question** — that's re-work from a submodule-era cold-start design.

## Instructions

### 1. Read the intake seed

Open `_context/sacred/context.md`.

- **Frontmatter `status: seed`** — intake ran, intent seeded. Extract the Intent section.
- **Frontmatter `status: authored`** (defensive — shouldn't happen on first Phase 2 run) — skip the skill with a warning: *"context.md is already authored. Re-running `pre-project-interview` would overwrite. Run [governance/change-workflows/context.md](../../../governance/context-change/) instead."*
- **File missing or empty** (Phase 1 intake was skipped) — fall back to the cold-start question: *"What are you building? (one sentence)"*. Flag in output tracking as `phase_1_intake_skipped: true`.

### 2. Confirm the seed with the user

Present the seed intent verbatim:

> Your intake captured: *"{seed intent}"*. Let's build the bigger vision around that. Does this still match what you're after, or has anything shifted since Phase 1?

- **Confirmed** → extend (Step 3).
- **Shifted** → this is a supersede event. If `_input/` contains a document that expresses the old intent (e.g., an original brief or pitch deck), invoke the supersede-check:

  **Supersede-check (Wave 4.4):**
  Present the conflict to the user:
  > The vision in `_input/{source-file}` says: *"{old intent}"*. Your current direction says: *"{new intent}"*. Shall I mark the original brief as superseded by the updated `context.md`? This records the decision in `.coldpress/graph/graph.json` and the audit log.

  Butler calls `promptSupersede` (see `src/governance/supersede.ts`) with:
  - `inputPath`: path to the conflicting `_input/` file
  - `sacredDocPath`: `_context/sacred/context.md`
  - `decisionContext`: `"pre-project-interview Step 1 — vision shift from seed to current direction"`
  - `confirmed`: true if user accepts, false otherwise

  If no `_input/` file is the conflict source (user is just elaborating the seed), no supersede event — continue enrichment normally.

### 3. Enrich into full vision

Ask, building on the seed — not restarting from zero:

- **"Why does this need to exist?"** — the problem it solves (feeds Step 2 Users, Step 3 Constraints)
- **"What does success look like in 6 months?"** — framing that shapes later `validate-idea` Step 5 metrics
- **"What's definitely IN scope for v1? What's OUT?"** — boundary
- **"Any hard deadlines or external events forcing timing?"**

### 4. Capture motivation context

- Personal project / startup / client work / internal tool? (cross-check `user.team_shape` from `.coldpress/local-config.yaml` — already captured by Phase 1 intake; confirm rather than re-ask)
- Revenue or purpose model?
- Scale expectations (10 users / 10k / 10M)?

### 5. Document findings to the working draft

Write into the working context.md draft. **Do not overwrite the Intent section** — that's Phase 1 provenance, preserved verbatim into Step 4. Append / enrich other sections.

## User Interaction

Conversational interview — ask one question at a time, build on answers. Be a curious peer, not a form-filler.

**Advanced-elicitation bias (Wave 3.8 + 3.10 heuristics):** if user answers are shallow (<10 words) or hedge-heavy (`"maybe"`, `"not sure"`, `"I guess"`), Butler may invoke `advanced-elicitation` biased toward **#41 Socratic Questioning** and **#40 Five Whys Deep Dive** per `data/methods/method-defaults.yaml`.

## Output

Vision section populated in the working context.md draft; seed Intent preserved verbatim. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-users.md](step-02-users.md)
