---
step_number: 1
step_name: "Synthesize Research"
step_goal: "Consolidate all Phase 2 research + validation inputs into a versioned synthesis artefact before drafting the brief"
halts_for_input: true
next_step: "step-02-intent.md"
---

## Goal

Before understanding brief intent (Step 2), consolidate everything Phase 2 has produced so far — authored `context.md`, all research outputs (domain / market / constraint / personas), and the latest `idea-validation-v{N}.md` — into one versioned synthesis artefact: `_context/planning/research-synthesis-v{N}.md`. This step produces its own graph-queryable node so Phase 3 and Phase 4 skills can read the synthesis directly rather than cross-consuming 4+ research fragments, but it lives inside `product-brief` (not a separate skill) so synthesis and distillation aren't split across two entry points for the same job.

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

Note coverage gaps (input docs with <3 findings; axes `context.md` implied but no research covered; research that doesn't map to any `context.md` claim) and any `_context/audit/supersessions-*.md` entries relevant to Phase 2 — those supersessions are decisions already made and shouldn't be re-litigated.

### 3. Apply Tier 1 methods — mandatory

#### 3a. Systems Thinking — `data/methods/problem-solving-methods.csv` (diagnosis)

Treat the findings table as a system. Ask:
- **Feedback loops** — do any findings reinforce each other? (e.g., "users distrust the incumbent" + "regulatory audit trail required" → both push toward transparency as a core product theme)
- **Leverage points** — which finding, if addressed, resolves multiple others?
- **Unintended consequences** — does optimising for one finding break another?
- **Boundaries** — where does the system under study end? What lies outside scope?

Systems Thinking is how we avoid the *"long list of unrelated research findings"* failure mode.

#### 3b. Morphological Analysis — `data/methods/problem-solving-methods.csv` (synthesis)

Lay out the solution-space as a matrix — rows are dimensions the research revealed (audience, deployment model, data residency, accessibility floor, primary journey…), columns are candidate values per dimension. This exposes combinatorial tensions: some cell-combinations are incoherent (e.g., audience=enterprise × deployment=offline-first × residency=any is a contradiction). Surface these as **tensions** — places where Phase 3 / Phase 4 must *pick*, not defer.

### 4. Produce the three synthesis structures

**Themes** — 3-7 cross-cutting patterns. Each theme cites 2+ input docs as evidence.

**Tensions** — 1-5 conflicts where research pulls in opposite directions. Format:
> *"{Source A}* says X; *{Source B}* says Y. Resolution owner: {Phase 3 stack | Phase 4 architecture | Phase 4 UX | Phase 4 PRD}."

Tensions are **not conclusions** — they're routed decisions.

**Convergent vs divergent signals** — which findings agree across sources (high-confidence → trust in downstream phases) vs which show divergence (lower-confidence → may need more research or an explicit pick).

### 5. Present for user review — halt

> Here are the themes I'm seeing: {list}. The tensions worth flagging: {list}. Any that feel off, or anything I'm missing?

Iterate with user. Never finalise without explicit signoff on tensions (they drive downstream decisions).

**Advanced-elicitation bias:** when themes feel murky, unclear, or contested, `advanced-elicitation` biases toward **#11 Tree of Thoughts**, **#12 Graph of Thoughts**, and **#14 Self-Consistency Validation** per `data/methods/method-defaults.yaml`. Not mandatory — mandatory methods are Step 3 above.

### 6. Invoke `distillator`

Skill location: [`skills/utilities/distillator/`](../../../skills/utilities/distillator/). Pass the confirmed themes/tensions/signals for lossless LLM-optimised compression — redundant phrasing collapsed, structure preserved, citations retained. Do this before critique: critique on a compact draft surfaces real bias and weak structure; critique on a verbose one surfaces prose nits. The distilled form must retain source citations, tension resolution-owner tags, and confidence markers — re-invoke with an explicit preserve instruction if the distillator output strips any of these.

### 7. Invoke `adversarial-review`

Skill location: [`skills/reviews/adversarial-review/`](../../../skills/reviews/adversarial-review/). Cynical-critic pass against the distilled synthesis: bias (favouring one source over contradicting ones without rationale), missing counter-evidence, shallow generic takes, unsurfaced tensions the Step 4 pass missed. User may skip if the synthesis is clearly on target, but default is run.

### 8. Invoke `editorial`

Skill location: [`skills/reviews/editorial/`](../../../skills/reviews/editorial/). Structural polish — section ordering, header hierarchy, paragraph cohesion — not prose-level editing (that's `editorial`, which wires into `intake` Step 11, not here). The synthesis needs to read well for Phase 3/4 skills consuming it programmatically as much as for humans.

### 9. Party-mode — opt-in offer

Offer **only** when `user.cadence = verbose` OR `team_shape = client-project`:

> Tensions in this synthesis — want all 8 agents to weigh in on which matter most? 10-15 extra minutes. Party-mode catches cross-perspective blind spots before we hand off to Phase 3.

On confirm: invoke [`skills/utilities/party-mode/`](../../../skills/utilities/party-mode/); output lands at `_context/planning/discussions/party-phase-2-{date}.md`. On decline: proceed to write. **Never auto-run.**

### 10. Determine output version number and write

Scan `_context/planning/` for `research-synthesis-v*.md`: none exist → write `v1`; latest is `v{N}` → write `v{N+1}`. Never overwrite, never append to a prior version.

Target path: `_context/planning/research-synthesis-v{N}.md`. Frontmatter per the research-output schema:

```yaml
---
name: research-synthesis
topic: <short label derived from context.md>
phase_authored: 2
status: final
supersedes: []           # supersede-check may add paths
sources:                 # URLs consulted during research
  - ...
derived_from:
  - _context/sacred/context.md
  - _context/planning/research/domain-<date>.md
  - ...
version: "1.0"
synthesis_version: N     # integer, bumped per regeneration
---
```

Body structure:

```markdown
# Research Synthesis — <project name> (v{N})

## Themes

1. **<Theme A>** — <one-paragraph>
   - Evidence: <citations from research docs>
2. **<Theme B>** — …

## Tensions requiring downstream resolution

1. **<Tension>** — <source A says X, source B says Y>.
   - Resolution owner: **Phase 3 stack**.
2. …

## Convergent signals (high confidence)

- …

## Divergent signals (decision points)

- …

## Handoff — what Phase 3 should read first

- <pointer list>

## Handoff — what Phase 4 should read first

- <pointer list>
```

## Output

`_context/planning/research-synthesis-v{N}.md` — versioned, user-confirmed. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-intent.md](step-02-intent.md), which drafts the executive brief that reads this synthesis directly.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `synthesize-research` skill (4 steps: consolidate, identify-tensions, distil, critique) per Phase II Part 2 Wave 2.2. |
| 2.0 | 2026-07-02 | Butler | Merged into `product-brief` as its Step 1 (WS5-B, §8 item 6 — the plan's stated reason for `synthesize-research` as a separate skill, "so synthesis iteration doesn't churn the executive brief," no longer holds now that both live in one re-runnable multi-step skill; re-running Step 1 alone still doesn't touch Steps 2-5). Dropped the dead `.coldpress/graph/graph.json` input (WS0 §8 item 1 removed Graphify) and the `graph_hits` frontmatter field. `pre-project-interview` reference corrected to `intake` Step 11 (WS5-B). Subagent count 9→8 (WS4 roster surgery). |
