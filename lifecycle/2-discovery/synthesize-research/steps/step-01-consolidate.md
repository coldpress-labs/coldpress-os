---
step_number: 1
step_name: "Consolidate"
step_goal: "Load all Phase 2 research + validation inputs and extract raw findings per document"
halts_for_input: false
next_step: "step-02-identify-tensions.md"
---

## Instructions

### 1. Enumerate inputs

Read in this order — later docs supersede earlier where they overlap:

1. `_context/sacred/context.md` (status: authored) — the anchoring artefact
2. `_context/planning/research/domain-*.md` — domain deep-dive
3. `_context/planning/research/market-*.md` — competitive landscape
4. `_context/planning/research/constraint-*.md` — binding envelope
5. `_context/planning/research/personas-*.md` — archetypes + journey + accessibility
6. `_context/planning/idea-validation-v{N}.md` — latest validation pass (if `validate-idea` ran)

Handle missing docs gracefully: warn which research lane the user skipped, don't block. Synthesis with 2 research docs is still synthesis — just thinner.

### 2. Extract raw findings per document

For each input doc, extract:
- **Top 3-5 findings** (the claims or conclusions the doc makes)
- **Evidence strength** per finding (strong / moderate / weak — based on source count, recency, direct user quotes)
- **Downstream-phase tag** per finding (→ Phase 3 / Phase 4 arch / Phase 4 UX / Phase 4 PRD)
- **Source list** per finding (citations from the doc)

Structure internally as a table per doc. No user halt yet — this is machine-side consolidation.

### 3. Surface coverage gaps

Before moving on, note:
- Input docs that produced <3 findings (shallow research — Step 4 critique will flag)
- Missing axes the `context.md` implied but no research covered (e.g., context mentions regulatory but no constraint doc exists)
- Research topics that don't map to any `context.md` claim (drift — finding something nobody asked for)

Log gaps to the working internal table; Step 2 uses them.

### 4. Check supersession signals

If any `_context/audit/supersessions-*.md` entries exist for Phase 2: note which `_input/` material was already superseded by sacred-doc updates. Those supersessions are "decisions already made" — synthesis shouldn't re-litigate them.

## Output

Internal findings table populated across all input docs; coverage gaps noted; supersessions flagged. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-identify-tensions.md](step-02-identify-tensions.md)
