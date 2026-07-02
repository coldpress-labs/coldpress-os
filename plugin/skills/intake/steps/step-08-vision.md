---
step_number: 8
step_name: "Project Vision"
step_goal: "Warm-start from the intent seed; confirm, enrich, don't re-author"
halts_for_input: true
next_step: "step-09-users.md"
---

## Goal

Read the intent seed Step 7 just captured in `_context/sacred/context.md`. Confirm it with the user, then enrich into the full vision. **Don't re-ask the one-sentence intent question** — Step 7 already asked it.

## Instructions

### 1. Read the seed

Open `_context/sacred/context.md`.

- **Frontmatter `status: seed`** — Step 7 ran, intent seeded. Extract the Intent section.
- **Frontmatter `status: authored`** (defensive — shouldn't happen this early in a fresh run) — skip the skill with a warning: *"context.md is already authored. Re-running this step would overwrite. Run the `sacred-change` skill instead."*
- **File missing or empty** (Step 7 was somehow skipped) — fall back to the cold-start question: *"What are you building? (one sentence)"*.

### 2. Confirm the seed with the user

Present the seed intent verbatim:

> You said: *"{seed intent}"*. Let's build the bigger vision around that. Does this still match what you're after, or has anything shifted?

- **Confirmed** → extend (Step 3 below).
- **Shifted** → this is a supersede event. If `_input/` contains a document that expresses the old intent (e.g., an original brief or pitch deck), invoke the supersede-check:

  **Supersede-check:**
  Present the conflict to the user:
  > The vision in `_input/{source-file}` says: *"{old intent}"*. Your current direction says: *"{new intent}"*. Shall I mark the original brief as superseded by the updated `context.md`? This records the decision in the audit log.

  Butler calls `promptSupersede` (see `src/governance/supersede.ts`) with:
  - `inputPath`: path to the conflicting `_input/` file
  - `sacredDocPath`: `_context/sacred/context.md`
  - `decisionContext`: `"intake Step 8 (vision) — vision shift from seed to current direction"`
  - `confirmed`: true if user accepts, false otherwise

  If no `_input/` file is the conflict source (user is just elaborating the seed), no supersede event — continue enrichment normally.

### 3. Enrich into full vision

Ask, building on the seed — not restarting from zero:

- **"Why does this need to exist?"** — the problem it solves (feeds Step 9 Users, Step 10 Constraints)
- **"What does success look like in 6 months?"** — framing that shapes later `validate-idea` metrics
- **"What's definitely IN scope for v1? What's OUT?"** — boundary
- **"Any hard deadlines or external events forcing timing?"**

### 4. Capture motivation context

- Personal project / startup / client work / internal tool? (cross-check `user.team_shape` once Step 12 captures it — confirm rather than re-ask if already known from a prior session)
- Revenue or purpose model?
- Scale expectations (10 users / 10k / 10M)?

### 5. Document findings to the working draft

Write into the working context.md draft. **Do not overwrite the Intent section** — that's Step 7 provenance, preserved verbatim into Step 11. Append / enrich other sections.

## User Interaction

Conversational interview — ask one question at a time, build on answers. Be a curious peer, not a form-filler.

**Advanced-elicitation bias:** if user answers are shallow (<10 words) or hedge-heavy (`"maybe"`, `"not sure"`, `"I guess"`), Butler may invoke `advanced-elicitation` biased toward **#41 Socratic Questioning** and **#40 Five Whys Deep Dive** per `data/methods/method-defaults.yaml`.

## Output

Vision section populated in the working context.md draft; seed Intent preserved verbatim. `step_8_complete: true`

## Navigation

→ Proceed to [step-09-users.md](step-09-users.md)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-generate-project-context as `pre-project-interview` Step 1. |
| 2.0 | 2026-07-02 | Butler | Renumbered to Step 8 inside `intake` (WS5-B, §8 item 6 — `pre-project-interview` merged into Phase 1 `intake`, replacing the deleted `governance/context-change/` reference with the `sacred-change` skill). |
