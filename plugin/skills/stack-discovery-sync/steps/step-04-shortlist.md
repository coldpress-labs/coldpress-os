---
step_number: 4
step_name: "Compile Shortlist"
step_goal: "Write stack-shortlist-v{N}.md with three sections; validate against schema"
halts_for_input: true
next_step: null
---

## Goal

Write the versioned stack shortlist document. Three sections structure it cleanly for stack-evaluation consumption. Validate against schema. Present to user and get confirmation before proceeding to stack-evaluation.

## Instructions

### 1. Determine version number

Check existing `_context/planning/stack-shortlist-v*.md` files. Increment `N` for the new version.

### 2. Write `_context/planning/stack-shortlist-v{N}.md`

**Frontmatter:**
```yaml
---
name: "stack-shortlist"
phase_authored: 3
status: "draft"
version: "{N}.0"
derived_from:
  - "_context/sacred/context.md"
  - "_context/planning/product-brief-v{N}.md"
  - "_context/planning/idea-validation-v{N}.md"
  - "_context/handoffs/phase-2-to-3-{date}.md"
supersedes: []  # populated if brief.md assumptions were overridden
pack_match:
  matched_pack_name: "{name or null}"
  match_score: {score}
  user_confirmed: {bool}
  uncovered_areas: [areas]
baselines_applicability:
  seo_aeo_llm: "{covered-by-pack|needs-env-provision|pack-partial}"
  accessibility: "{covered-by-pack|needs-env-provision|pack-partial}"
  security: "{covered-by-pack|needs-env-provision|pack-partial}"
  future_proof: "{covered-by-pack|needs-env-provision|pack-partial}"
---
```

**Section A — Pack-match verdict:**
```markdown
## Section A: Pack Match Verdict

**Proposed pack:** {pack_name} (score: {X.XX}) — [confirmed by user / no-match → independent recommended]

Pre-picks:
| Decision area | T1 choice | Overrideable |
|---|---|---|
| frontend | Next.js | yes |
| ... | ... | yes |

Baselines covered out-of-box: {list}
Baselines needing env-provision activation: {list}
```

If no pack: "No starter pack match (top score: {score} < 0.4). All decision-areas will use T2 catalog or T3 independent evaluation."

**Section B — Per-area tiered candidates:**

For each decision-area:
```markdown
### {Area} (Tier {1|2|3})

| Candidate | Source | Key fit signal | Baseline compat | Pack_available |
|---|---|---|---|---|
| {name} [T1 default] | pack pre-pick | {rationale from evidence} | {compat} | {true/false} |
| {name} [T2 alt] | catalog | {rationale} | {compat} | — |

**Evidence binding:** {1-2 sentence rationale tied to product-brief / persona / constraint finding}
**Supersede flag:** {if applicable — what _input/ claim this conflicts with}
```

**Section C — Baselines applicability:**
```markdown
## Section C: Baselines Applicability

| Baseline category | Pack covers? | Env-provision actions needed? | Any T1/T2 candidate failing this? |
|---|---|---|---|
| seo_aeo_llm | {yes/no/partial} | {list actions or "none"} | {candidate name + gap or "none"} |
| accessibility | ... | ... | ... |
| security | ... | ... | ... |
| future_proof | ... | ... | ... |
```

### 3. Validate against schema

Run `validate-schema` against `schemas/planning-artefacts/stack-shortlist.schema.json` (Wave 4.1). If validation fails: fix the document before presenting.

### 4. Mark status final and present

Update frontmatter `status: "final"`. Present summary to user:

> **Stack shortlist ready** (v{N})
>
> Pack match: {pack_name} ({score}) — {confirmed/skipped/no-match}
> Decision areas covered: {N areas}
> Baselines summary: {N covered by pack} / 4
>
> Review the full shortlist at `_context/planning/stack-shortlist-v{N}.md`. Ready to start `stack-evaluation` for each decision area?

Halt for confirmation. Shortlist becomes the input for stack-evaluation.

## Output

`_context/planning/stack-shortlist-v{N}.md` written, schema-valid, and confirmed. `step_4_complete: true`

## Navigation

→ Phase 3 continues with `stack-evaluation` (run once per decision area from the shortlist).
