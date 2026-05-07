---
step_number: 1
step_name: "Tier Check"
step_goal: "Read the shortlist entry for this decision area; determine tier; branch to fast-path (T1) or rubric (T2/T3)"
halts_for_input: true
next_step: "step-02-rubric.md"
---

## Goal

Before evaluating anything, check what the stack shortlist says about this decision-area. The tier annotation determines the evaluation path. T1 gets a fast-path; T2 and T3 walk the full rubric.

## Instructions

### 1. Identify the decision area

Ask the user which decision-area we're evaluating (or read from `partial_completion.sub_state.decision_area` if resuming).

> Which decision area are we evaluating? (e.g., frontend, database, auth, hosting, styling, package_manager, testing, ci, source_control)

Wait for input.

### 2. Read the shortlist entry

Open `_context/planning/stack-shortlist-v{N}.md` (latest version). Find the Section B entry for this area. Extract:
- **Tier annotation:** T1, T2, or T3
- **Candidates list** with evidence-bound rationale
- **Baseline compat notes** for each candidate
- **Pack_available flag** (if any pack's quickstart covers this area)
- **Supersede flags** (if any)

If no shortlist entry for this area: note it and proceed with T3 (independent evaluation, no prior evidence).

### 3. Branch per tier

#### Branch T1 — Pack pre-pick (fast-path)

**Condition:** `tier: T1` in shortlist entry (user confirmed a pack in step-02b, and this area is in `pack.pre_picked`)

**Present to user:**
> For **{area}**, the pack pre-selects **{chosen option}**.
>
> Why this fits: {one-line trade-off from pack catalog entry}
> Baselines coverage: {covered? / partially? / none?}
>
> Accept this pre-selection and write a quick ADR? Or would you like to evaluate alternatives?
>
> [Y] Accept → write quick ADR and move to next area
> [N] Override → evaluate this area with full rubric (Tier 2 path)

Wait for input.

- **On accept:** Skip Step 2. Proceed directly to Step 3 with `tier: T1` and the accepted choice. Write the ADR with `tier: T1` frontmatter. Rubric fields `fit/cost/etc.` can be populated from the catalog's `baselines_compat` data; `weighted_total` = 10 (shorthand for "pack-confirmed, no objections").
- **On override:** Proceed to Step 2 with `tier: T2` (catalog alternatives now become the candidate list).

#### Branch T2 — Catalog candidates

**Condition:** `tier: T2` in shortlist entry (pack uncovered for this area, or user chose pack-skip)

Proceed to Step 2 with the catalog's `curated_top` entries as the candidate list.

#### Branch T3 — Independent evaluation

**Condition:** `tier: T3` in shortlist entry (no catalog entry, or user rejected all T2 options)

Proceed to Step 2 with the graph-query + web-search candidate universe (from the shortlist evidence brief).

---

Invoke `advanced-elicitation` if user's answer about override is vague or contradictory. Trigger: `stack-evaluation > step-01-evidence-load`.

## Output

Tier determined; candidates ready for next step. `step_1_complete: true`

## Navigation

- T1 accept → skip to [step-03-decide.md](step-03-decide.md) with fast-path
- T1 override / T2 / T3 → [step-02-rubric.md](step-02-rubric.md)
