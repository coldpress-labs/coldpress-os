---
step_number: "2b"
step_name: "Pack Match"
step_goal: "Score available starter packs for archetype fit; propose best match; get user confirmation"
halts_for_input: true
next_step: "step-03-derive-candidates.md"
---

## Goal

Walk all available starter packs (`skills/stack-packs/*/pack.yaml`), score each against the classified signals, and propose the best-fit pack to the user. User can confirm, reject, pick an alternative, or skip packs entirely.

## Instructions

### 1. Discover packs

Glob `skills/stack-packs/*/pack.yaml` at runtime. Load all found files. Record: `name`, `archetype_fits`, `pre_picked`, `baselines_out_of_box`, `quickstart_skill`.

If no packs found: record `matched_pack_name: null`; skip to Step 3 (independent evaluation recommended). Note to user: "No starter packs are available — we'll evaluate each decision area independently."

### 2. Score each pack

For each pack, compute a similarity score against the classified signals:

**Scoring dimensions:**
1. **Product type match:** Does the project's `product_type` appear in `pack.archetype_fits.product_types`? — 0.4 weight
2. **Domain complexity match:** Does the project's `domain_complexity` appear in `pack.archetype_fits.domain_complexity`? — 0.25 weight
3. **Functional profile overlap:** Keyword overlap between `pack.archetype_fits.functional_profile` and signals extracted from evidence package (value prop, constraints, persona characteristics). Score = matched_keywords / max(pack_profile_count, 3) — 0.35 weight

**Final score = sum of weighted dimensions (0.0 – 1.0)**

### 3. Apply threshold rules

| Score | Label | Proposal |
|-------|-------|---------|
| ≥ 0.7 | Strong match | Propose to user; recommend acceptance |
| 0.4 – 0.69 | Partial match | Propose with explicit note that it's a partial fit; require user confirmation |
| < 0.4 | No match | Do not propose; note "no strong pack match found" |

Take the **top-scoring pack** (if ≥ 0.4) as the proposal. If two packs tie within 0.05 of each other, list both.

### 4. Surface baselines coverage

For the proposed pack, show:
- `baselines_out_of_box` — which baseline categories the pack provides for free
- Which baseline categories would still need env-provision activation (the gaps)

### 5. Present proposal and get confirmation

> **Pack match result:**
>
> I found a starter pack that matches your project well:
> **{pack_name}** (match score: {score})
>
> This pack pre-selects:
> {list: area → choice for each pre_picked entry}
>
> Baselines covered out-of-box by this pack: {list}
> Baselines needing env-provision activation: {list}
>
> **Options:**
> 1. ✓ Accept this pack — I'll use these as T1 default candidates; you can override any choice during stack-evaluation
> 2. Use as partial reference — I'll suggest these choices but treat them as T2 (you review each)
> 3. Pick a different pack — I'll show you all {N} available packs
> 4. Skip packs entirely — full independent evaluation for all areas

Halt for user input.

**On option 1 (confirm):** Record `matched_pack_name: "{name}"`, `match_score: {score}`, `user_confirmed: true`. Each pre_picked area is now Tier 1.

**On option 2 (partial):** Record `user_confirmed: true`, note T2 treatment. Pack pre-picks will appear as top T2 candidates.

**On option 3 (pick alternative):** List all packs with scores. User picks by name. Record chosen pack.

**On option 4 (skip):** Record `matched_pack_name: null`, `user_confirmed: true` (explicit "no-pack accepted"). All areas proceed to T2/T3.

### 6. Write pack_match to shortlist frontmatter

Record in the in-progress shortlist draft:
```yaml
pack_match:
  matched_pack_name: "{name or null}"
  match_score: {0.0–1.0}
  user_confirmed: {true|false}
  uncovered_areas: [areas not covered by pack.pre_picked]
```

## Output

Pack match scored, user decision recorded. `step_2b_complete: true`

## Navigation

→ Proceed to [step-03-derive-candidates.md](step-03-derive-candidates.md)
