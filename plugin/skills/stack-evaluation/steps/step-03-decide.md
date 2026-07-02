---
step_number: 3
step_name: "Decide and Write ADR"
step_goal: "Get user decision; write versioned schema-validated ADR to _context/planning/adrs/"
halts_for_input: true
next_step: null
---

## Goal

Present the recommendation and get user sign-off. Write a versioned, schema-validated ADR to `_context/planning/adrs/`. Fire supersede-check if the decision overrides any `_input/` claim.

## Tier 1 Core Methods

- **Architecture Decision Records method:** Surface the hidden decision and make it explicit — context, options, decision, consequences, derived_from trail.
- **Force Field Analysis:** For the chosen technology, name the driving forces (why it wins) and restraining forces (what we're trading away) — keeps the ADR honest about trade-offs.

*(Source: `data/methods/problem-solving-methods.csv`)*

## Instructions

### 1. Present recommendation

> **Recommendation for {area}:** **{chosen option}** (weighted total: {score}/10)
>
> Why: {1-2 sentence evidence-bound justification from rubric}
> Key trade-offs: {what we gain} vs {what we give up — lock-in, migration risk, etc.}
> Baseline compat: {compat status from rubric step}
>
> Do you agree with this decision?

Wait for user input. Invoke `advanced-elicitation` if answer is hedged or contradictory. Trigger: `stack-evaluation > step-03-decide`.

On disagreement: note the concern; offer to substitute a candidate or change a rubric weight; re-run Step 2 for the contested dimension. When resolved, return here.

### 2. Determine ADR version number

Check `_context/planning/adrs/` for existing `adr-{decision}-v*.md` files. Increment `N` for the new version.

### 3. Write `_context/planning/adrs/adr-{decision}-v{N}.md`

**Frontmatter:**
```yaml
---
name: "adr"
decision_area: "{area}"
phase_authored: 3
status: "accepted"
version: "{N}.0"
tier: "{T1|T2|T3}"
derived_from:
  - "_context/planning/stack-shortlist-v{N}.md"
  - "_context/planning/product-brief-v{N}.md"
  - "_context/sacred/context.md"
supersedes: []  # populated if this decision overrides an _input/ claim
options:
  - "{option A}"
  - "{option B}"
  - "{option C (if present)}"
chosen: "{chosen option}"
rubric:
  fit: {score}
  cost: {score}
  team_familiarity: {score}
  ecosystem: {score}
  lock_in: {score}
  vibe_fit: {score}
  weighted_total: {score}
---
```

**Body sections:**

```markdown
# ADR-{NNN}: {Decision Area} — {Chosen Option}

**Status:** Accepted | **Date:** {date} | **Tier:** {T1|T2|T3}

## Context

{Why this decision was needed — 2-3 sentences from the evidence package}

## Options Considered

| Option | Weighted Total | Key advantage | Key risk |
|--------|---------------|---------------|----------|
| {A} | {score} | {advantage} | {risk} |
| {B} | {score} | ... | ... |

## Decision

**{Chosen option}** — {1 paragraph justification using rubric evidence}

Driving forces: {list from Force Field Analysis}
Restraining forces (trade-offs accepted): {list}

## Consequences

**Positive:** {what improves}
**Negative / accepted trade-offs:** {what we give up or watch carefully}

## References

{Sources consulted: vendor docs, graph query results, catalog entry, etc.}
```

### 4. Supersede check

If any `_input/raw/` or `_input/vendor/` file contains a conflicting assumption (e.g., brief assumes Supabase but we chose Neon):
- Invoke `src/governance/supersede.ts` helper.
- Populate `supersedes:` array in frontmatter with the `_input/` path.
- Write supersede row to `_context/audit/supersessions-{date}.md` (append-only format).

### 5. Validate schema

Run `validate-schema` against `schemas/planning-artefacts/adr.schema.json`. If invalid: fix before proceeding. Ensure `tier` field is present (required per extended schema).

### 6. Confirm completion

> ADR written: `_context/planning/adrs/adr-{area}-v{N}.md` ✓
> Schema: valid ✓
> {If supersede fired:} Supersede logged: `_context/audit/supersessions-{date}.md` ✓
>
> Run `stack-evaluation` again for the next decision area, or move to `stack-locking` when all areas are covered.

## Output

ADR written, validated, and confirmed. `step_3_complete: true`

## Navigation

→ Workflow complete. Run stack-evaluation again for the next decision, or proceed to stack-locking when all areas from the shortlist have ADRs.
