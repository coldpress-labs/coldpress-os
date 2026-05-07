---
step_number: 4
step_name: "Synthesize Context"
step_goal: "Flesh the context.md seed from seed → authored; don't overwrite"
halts_for_input: true
next_step: "complete"
---

## Goal

Transform `_context/sacred/context.md` from `status: seed` → `status: authored`. Phase 1 intake created the seed (frontmatter + one-line Intent + placeholder sections); Steps 1-3 of this skill gathered the content. This step merges and commits, validates, and captures sacred-doc signoff.

## Instructions

### 1. Read existing seed

Open `_context/sacred/context.md`. Expect:
- Frontmatter: `status: seed`, `phase_authored: 1`
- Intent section (one-line, Phase 1 provenance — preserve verbatim)
- Placeholder sections: *Problem space*, *Users*, *Constraints* (marked for Phase 2 to fill)

If the file is missing (Phase 1 intake was skipped — flagged in Step 1), create from the working draft directly. Do not error out.

### 2. Preserve the Intent section verbatim

Do not rewrite the Intent. Phase 1 captured it; attribution matters for the audit trail.

If Step 1 revealed the intent has shifted since Phase 1 (noted as a supersede signal in Step 1):
- **Wave 4 path (when `src/governance/supersede.ts` helper lands):** invoke supersede-check; on confirm, update Intent + log `_context/audit/supersessions-{date}.md` row + add path to frontmatter `supersedes:` array.
- **Pre-Wave 4 stub (now):** leave Intent unchanged; add a comment near the Intent section flagging the shift so Wave 4 can backfill once the helper exists.

### 3. Fill the placeholder sections from Steps 1-3

- **Problem space** — from Step 1 (vision + problem statement + scope boundaries)
- **Users** — from Step 2 (user types + value prop + pain points + brownfield legacy-user notes if applicable)
- **Constraints** — from Step 3 (technical + non-technical 5-question checklist + brownfield legacy carry-over if applicable + business rules + non-obvious rules)

Writing style:
- Dense bullets over prose
- Preserve direct user quotes (gold for Phase 4 PRD)
- Keep numbers, thresholds, and specific requirements exact
- No conversational residue or filler

### 4. Update frontmatter

Fields to set:
- `status: seed` → `status: authored`
- `phase_authored: 1` stays (Intent is still Phase 1's)
- Add `phase_owner: 2` (Phase 2 is the active authoring phase for the non-Intent sections)
- Add `version: "1.0"`
- Add `supersedes: []` (empty unless Wave 4 supersede-check added paths)
- Add `authored_at: <ISO>` timestamp
- Add `project_shape: greenfield | brownfield | ambiguous` (mirrors `.coldpress/local-config.yaml`)

### 5. Invoke `validate-schema` before commit

Skill: [validate-schema](../../../skills/governance/validate-schema/)

Validate context.md against `schemas/sacred-docs/context.schema.json`. If validation fails, surface errors to user and halt — do not write.

### 6. Invoke `editorial-prose` (Wave 3.7 wire-in)

Skill: [editorial-prose](../../../skills/reviews/editorial-prose/)

Final prose polish before sacred-doc signoff. Sacred-docs deserve a clean final read — this is the last touch before the governance door shuts.

### 7. Present for sacred signoff — halt

> Here's the authored `context.md`. This is a **sacred document** — it becomes the foundation for all downstream work. Post-signoff edits require the change-workflow ([governance/context-change/](../../../governance/context-change/)), not direct edits. Review carefully.

User confirms or iterates. Never auto-write. On signoff:
- Write `_context/sacred/context.md`
- Append to `_context/tracking/phase-2-{date}.md` noting sacred signoff captured

### 8. Log to graph-pending list

Note in `_context/tracking/phase-2-{date}.md` that context.md has been authored and needs to enter the graph on next rebuild. The `phase-transition` skill (Wave 4.5) picks this up at Phase 2 → 3 exit.

## User Interaction

This is the signoff moment for a sacred document. Treat it accordingly — no auto-advance, no "assume the user agrees." Direct prompt + wait for explicit confirmation.

## Output

`_context/sacred/context.md` with `status: authored` + all sections populated + Intent preserved verbatim + schema-validated + sacred signoff captured. Workflow complete.

## Navigation

→ Workflow complete. Recommend: domain-research, market-research, constraint-research, personas (parallel lane). `validate-idea` runs after research lane; `synthesize-research` consolidates; `product-brief` distils last.
