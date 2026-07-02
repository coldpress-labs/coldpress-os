---
step_number: 2
step_name: "6-Dimension Rubric"
step_goal: "Score candidates against the 6-dimension rubric; apply baseline-compat filter; recommend top choice"
halts_for_input: true
next_step: "step-03-decide.md"
---

## Goal

Walk each candidate through the 6-dimension rubric. Weights are tuned per `team_shape` + `project_shape` + `product_type`. Flag baseline-compat issues. Surface a recommendation backed by scores, not just intuition.

## Tier 1 Core Methods

- **Decision Matrix:** Structured scoring across all 6 dimensions per candidate.
- **Cost Benefit Analysis:** Applied to the `cost` and `lock_in` dimensions explicitly.
- **Risk Assessment Matrix:** Applied to `lock_in` and `fit` dimensions (what breaks if we get this wrong?).

*(Source: `data/methods/problem-solving-methods.csv`, evaluation category)*

## Instructions

### 1. Read conditions

From `.coldpress/local-config.yaml` (or shortlist evidence package):
- `team_shape` — determines dimension weights
- `project_shape` — brownfield vs greenfield affects team-familiarity and lock-in weights
- `product_type` — affects fit weight priority

### 2. Set dimension weights

Default weights (adjust per conditions):

| Dimension | Default | solo-hobby/structured | team/client-project | brownfield |
|-----------|---------|----------------------|---------------------|------------|
| Fit | 0.35 | 0.35 | 0.30 | 0.25 |
| Cost | 0.15 | 0.20 | 0.15 | 0.10 |
| Team-familiarity | 0.15 | 0.10 | 0.20 | 0.30 |
| Ecosystem-maturity | 0.15 | 0.15 | 0.15 | 0.10 |
| Lock-in | 0.10 | 0.10 | 0.10 | 0.20 |
| Vibe-fit | 0.10 | 0.10 | 0.10 | 0.05 |

For `project_shape: brownfield`, raise team-familiarity weight (continuity advantage for matching legacy stack) and lock-in weight (migration cost from legacy matters more).

### 3. Score each candidate on 6 dimensions (0-10)

For each candidate, score and note evidence for each dimension:

**Fit (0–10, heaviest weight):**
- Evidence-bound: does this candidate serve the product-brief value prop + North Star?
- Apply persona filters: penalty if candidate fails any persona accessibility target (e.g., heavy JS runtime on low-powered devices fails accessibility/performance persona)
- Apply constraint envelope: penalty for any hard constraint violation (compliance, budget, browser-support)
- Vague user input here → invoke `advanced-elicitation` (trigger: `stack-evaluation > step-02-rubric`)

**Cost (0–10):**
- Qualitative tier guidance (no dollar calculator in v0.3):
  - `solo-hobby`: free tier required → score reflects free-tier capability
  - `solo-structured`: < $50/month acceptable → score reflects value at that tier
  - `team-bootstrap`: < $200/month → score reflects team-plan pricing
  - `team-funded`: < $1k/month → more latitude
  - `client-project`: pass-through; client pays → score reflects vendor stability / contractability
- Higher score = better cost fit for the project's budget tier

**Team-familiarity (0–10):**
- Reads `user.team_shape` + `_input/legacy/` signal (brownfield only)
- Explicit 0-10 scoring: 10 = team has shipped production with this; 5 = some experience / comparable tool; 0 = no experience / very different paradigm
- Ask the user directly if the signal is ambiguous

**Ecosystem-maturity (0–10):**
- Community size, docs quality, plugin ecosystem, npm download trends
- Higher score = larger community, better docs, active maintenance, strong plugin story

**Lock-in / vendor-risk (0–10 — lower is higher lock-in):**
- Exit cost if we want to switch in 12-24 months
- 10 = standard open format / easy migration; 1 = proprietary data model / very expensive to leave
- For brownfield: factor migration cost from legacy stack to this candidate

**Vibe-fit (0–10):**
- Qualitative, surfaced honestly — not hidden in other dimensions
- Does using this tool daily feel productive and pleasant for this team's style?
- Note: this dimension is not weighted away; it's a real signal, not aesthetic noise

### 4. Baseline-compat filter

For each candidate, check `data/stack-catalog/{area}.yaml` `baselines_compat` field (if available).

If a candidate fails a confirmed baseline (e.g., a pure client-rendered SPA for an seo_aeo_llm-confirmed project):
- Prompt user: *"**{Candidate}** has weak SEO/LLM compat (client-rendering only). Options: (1) Accept with caveat — Phase 4 architecture handles SSR/prerendering; (2) Substitute with {stronger-compat-alternative}; (3) Research a plugin/workaround."*
- Wait for user decision. Record outcome in rubric notes.

### 5. Compute weighted totals

`weighted_total = sum(dimension_score × dimension_weight)` for each candidate. Present comparison table:

> | Candidate | Fit | Cost | Team | Ecosystem | Lock-in | Vibe | **Total** |
> |---|---|---|---|---|---|---|---|
> | {A} | 8 | 7 | 6 | 9 | 5 | 8 | **7.25** |
> | {B} | 7 | 8 | 9 | 7 | 8 | 7 | **7.50** |

Flag if any candidate's `weighted_total < 6.0` — this feeds the red-flag escape hatch in stack-locking.

### 6. Surface recommendation

Present the top-scored candidate as the recommendation. Explain trade-offs honestly — especially lock-in risks and anything vibe-fit flagged.

Invoke `advanced-elicitation` if user response to the recommendation is hedged or contradictory. Trigger: `stack-evaluation > step-02-rubric`.

## Output

Candidates scored; comparison table built; recommendation surfaced. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-decide.md](step-03-decide.md)
