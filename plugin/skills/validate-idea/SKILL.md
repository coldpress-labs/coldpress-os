---
name: validate-idea
description: Last cheap-pivot window before Phase 3 commits — problem validation / riskiest assumptions / differentiation / fit / metrics / prior art + conditional stakeholder/client alignment + red-flag escape hatch
license: MIT
compatibility: Invoked by @analyst in Phase 2
version: "1.0"
---

## Purpose

Phase 2 is ~60% "setting up the idea" and ~15% "validating it." Before Phase 3 commits to a stack — expensive to pivot afterward — `validate-idea` is the last cheap-pivot window. Six core steps pressure-test the idea systematically: problem evidence, riskiest assumptions, differentiation, problem-solution fit, success metrics, prior art. Two conditional steps scale by team shape. Step 9 surfaces red flags if the validation reveals critical weakness.

## Gate severity

**Warn**, not block. Solo vibe-coders may legitimately skip `validate-idea` if they've validated outside the tool (e.g., shipped earlier versions to users, have direct domain knowledge). The framework surfaces the gap; it doesn't police governance.

For team + client-project shapes, the skill gains weight (Steps 7 + 8 unlock), but gate stays warn. Client signoff lives in `_context/audit/client-signoffs/`, not the gate.

## Versioning

Output is versioned — `idea-validation-v{N}.md`. Re-running (e.g., after Step 9 routes to "revise") produces `v{N+1}`, not overwrite. Each version stays for traceability; `product-brief` (Steps 1 and 3) reads the latest `v{N}`.

## Conditional step rules

| `user.team_shape` | Steps that fire |
|---|---|
| `solo` | 1-6 core + 9 summary (8 steps total) |
| `team` | 1-6 core + 7 stakeholder + 9 summary (9 steps total) |
| `client-project` | 1-6 core + 7 stakeholder + 8 client + 9 summary (10 steps total) |

Butler reads `team_shape` at skill dispatch (via `condition-reader` helper, Wave 3.9) and passes the conditional flags as skill inputs. Skills don't re-read local-config.

## When to Use

- "validate idea"
- "before Phase 3"
- "pressure test"
- After parallel research + (optional) `personas` complete
- Before `product-brief` — validation signals feed its Step 1 synthesis

## Prerequisites

- `_context/sacred/context.md` has `status: authored`
- At least one research doc in `_context/planning/research/`
- (Recommended but not required) `personas-*.md` exists — Step 4 fit-check walks a persona's journey

## Tier 1 — Core methods wired in

Per Phase II deep-dive v1.4 §Tier 1 (round 3, FP22):

| Step | Core methods | Source CSV |
|---|---|---|
| 1 Problem validation | **Problem Statement Refinement**, **Five Whys Root Cause** (Tier 0), **Is/Is Not Analysis** | `data/methods/problem-solving-methods.csv` (diagnosis) |
| 2 Hypotheses + riskiest | **Lean Startup Methodology**, **Risk Assessment Matrix** | `data/methods/innovation-frameworks.csv` (strategic) + `data/methods/problem-solving-methods.csv` (evaluation) |
| 3 Differentiation | **Blue Ocean Strategy**, **Competitive Positioning Map**, **Value Proposition Canvas** | `data/methods/innovation-frameworks.csv` (disruption + business_model + market_analysis) |
| 4 Problem-solution fit | **Jobs to be Done** (Tier 0), **Gap Analysis** | `data/methods/innovation-frameworks.csv` (disruption) + `data/methods/problem-solving-methods.csv` (analysis) |
| 5 Success metrics | **Measurement Framework** | `data/methods/design-thinking-methods.csv` (implement) |
| 6 Prior art | **Disruptive Innovation Theory**, **Crossing the Chasm** | `data/methods/innovation-frameworks.csv` (disruption) |

Each method is a mandatory sub-routine, not "optionally available via router."

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

### Primary — `_context/planning/idea-validation-v{N}.md`

Frontmatter (research-output schema, Wave 4.6):

```yaml
---
name: idea-validation
topic: <short label>
phase_authored: 2
status: final
problem_evidence: strong | moderate | weak
riskiest_assumptions: [list]
riskiest_assumption_testable: bool
north_star_metric: "<metric>"
leading_indicators: [list]
differentiation_strength: strong | moderate | weak | none
prior_art_signal: gap | saturated | opportunity
supersedes: []
version: "1.0"
validation_version: N
---
```

### Step 9 — `_context/audit/validation-decisions-{date}.md`

Append-only log. One row per invocation:

| Date | Approver | Flags | Disposition | Rationale | Linked artefact |
|---|---|---|---|---|---|

### Step 8 (conditional) — `_context/audit/client-signoffs/validation-{date}.md`

Formal client signoff per engagement. Required only for `team_shape = client-project`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial validate-idea skill per Phase II Part 2 Wave 2.4 (FP11 + FP14). 6 core steps + 2 conditional (team_shape-scaled) + Step 9 always-runs red-flag escape hatch. Warn-severity at gate — solo vibe-coders may legitimately skip. Versioned output. Tier 1 methods wired across problem-solving / innovation / D-T CSVs (~25 distinct methods across 9 steps — the densest methodological skill in Phase 2 by design). Step 9 writes to `_context/audit/validation-decisions-{date}.md`; Step 8 (conditional) to `_context/audit/client-signoffs/`. |
