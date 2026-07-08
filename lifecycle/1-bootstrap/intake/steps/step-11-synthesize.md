---
step_number: 11
step_name: "Synthesize Context"
step_goal: "Flesh the context.md seed from seed → authored; don't overwrite"
halts_for_input: true
next_step: "step-12-working-mode.md"
---

## Goal

Transform `_context/sacred/context.md` from `status: seed` → `status: authored`. Step 7 created the seed (frontmatter + one-line Intent + placeholder sections); Steps 8-10 gathered the content. This step merges and commits, validates, and captures sacred-doc signoff.

## Instructions

### 1. Read existing seed

Open `_context/sacred/context.md`. Expect:
- Frontmatter: `status: seed`, `phase_owned: 1`
- Intent section (one-line, Step 7 provenance — preserve verbatim)
- Placeholder sections: *Problem space*, *Users*, *Constraints* (marked for Steps 8-10 to fill)

If the file is missing (Step 7 was somehow skipped), create from the working draft directly. Do not error out.

### 2. Preserve the Intent section verbatim

Do not rewrite the Intent. Step 7 captured it; attribution matters for the audit trail.

If Step 8 revealed the intent has shifted since Step 7 (noted as a supersede signal):
- Invoke the supersede-check (`src/governance/supersede.ts`); on confirm, update Intent + log a `_context/audit/supersessions-{date}.md` row + add the path to frontmatter `supersedes:` array.

### 3. Fill the placeholder sections from Steps 8-10

- **Problem space** — from Step 8 (vision + problem statement + scope boundaries)
- **Users** — from Step 9 (user types + value prop + pain points + brownfield legacy-user notes if applicable)
- **Constraints** — from Step 10 (technical + non-technical 5-question checklist + brownfield legacy carry-over if applicable + business rules + non-obvious rules)

Writing style:
- Dense bullets over prose
- Preserve direct user quotes (gold for Phase 4 PRD)
- Keep numbers, thresholds, and specific requirements exact
- No conversational residue or filler

### 4. Update frontmatter

Fields to set:
- `status: seed` → `status: authored`
- `governance: "draft"` → `governance: "locked"` — **this is the signoff that engages `sacred-guard`.** Once locked, further edits require the `sacred-change` workflow (a draft doc is freely editable during authoring; a locked one is not). Keep `sacred: true` and `workflowType: "context"` from the seed.
- `phase_owned: 1` stays (context.md is a Phase 1 artefact end-to-end)
- Bump `version: "0.1"` → `version: "1.0"`
- `supersedes: []` (empty unless the supersede-check above added paths)
- Add `authored_at: <ISO>` timestamp
- Add `project_shape: greenfield | brownfield | ambiguous` (mirrors `.coldpress/local-config.yaml`)

### 5. Invoke `validate-schema` before commit

Skill: [validate-schema](../../../skills/governance/validate-schema/)

Validate context.md against `schemas/sacred-docs/context.schema.json`. If validation fails, surface errors to user and halt — do not write.

### 6. Invoke `editorial`

Skill: [editorial](../../../skills/reviews/editorial/)

Final prose polish before sacred-doc signoff. Sacred-docs deserve a clean final read — this is the last touch before the governance door shuts.

### 7. Present for sacred signoff — halt

**Review-in-file, not in-chat** (VP2 O5): the authored doc is already on disk as `_context/sacred/context.md` (`governance: draft`, so still editable). Do **not** paste the full body into the conversation — point the user at the file to read and redline in place. The reviewed artifact should be the committed artifact.

> I've written the authored `context.md` to `_context/sacred/context.md` — please open it and review. This is a **sacred document**: on your signoff I lock it (`governance: draft → locked`), after which edits require the `sacred-change` workflow (enforced by `sacred-guard`), not direct edits.

User confirms or iterates (edit the on-disk draft directly while it's `draft`). Never auto-lock. On signoff:
- Flip `_context/sacred/context.md` frontmatter `governance: draft → locked` (§4 already set the other fields)
- Append to the intake report noting sacred signoff captured

### 8. Clean exit

```ts
await clearStepMarker(projectRoot);
```

## User Interaction

This is the signoff moment for a sacred document. Treat it accordingly — no auto-advance, no "assume the user agrees." Direct prompt + wait for explicit confirmation.

## Output

`_context/sacred/context.md` with `status: authored` + all sections populated + Intent preserved verbatim + schema-validated + sacred signoff captured.

## Navigation

→ `step-12-working-mode.md`. Once Phase 1 exits, Phase 2 Discovery opens directly with `research` (no separate interview skill — `validate-idea` runs after; `product-brief` (which absorbs the former `synthesize-research`) distils last).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-generate-project-context as `pre-project-interview` Step 4. |
| 2.0 | 2026-07-02 | Butler | Renumbered to Step 11 inside `intake`; `phase_owner: 2` dropped (context.md is now authored entirely within Phase 1 — see ledger plan delta); the deleted `governance/context-change/` reference replaced with `sacred-change` (WS1-G already retired the five prose change-workflows; this was the specific residual ref D11 deferred to WS5); "graph-pending" note removed (`coldpress graph rebuild` no longer exists, WS0 §8 item 1) (WS5-B, §8 item 6). |
