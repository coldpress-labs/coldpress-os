---
step_number: 4
step_name: "NFR Implementation Strategy"
step_goal: "Author Section 5 (NFRs) — strategies for a11y / perf / SEO / observability / security; baselines + persona-scale + idea-validation-driven"
halts_for_input: true
next_step: "step-05-adr.md"
partial_completion_id: "architecture_design_step_04"
---

## Goal

Author Section 5 — NFR implementation strategy. Each NFR axis from PRD must have an architectural strategy. Driven by:
- `coldpress.yaml baselines` — a11y / perf / SEO / observability / security
- `personas` scale targets (concurrent users, geographic distribution, device range)
- `idea-validation` riskiest_assumptions — architecture must enable testing them

Method playbook Tier-1: `problem_solving` heavy (scenario_planning, failure_mode_analysis); `advanced-elicitation` on vague_nfr_strategy.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "architecture_design_step_04", sub_skill: "nfr_strategy", at: "started" }`.

### 2. NFR axes inventory

From PRD `nfr_axes` + `coldpress.yaml baselines`:

| NFR Axis | Source | Baseline Level |
|----------|--------|----------------|
| Accessibility | PRD + baselines.a11y_axis | WCAG-AA / WCAG-AAA |
| Performance | PRD + baselines.perf_axis | TBD |
| SEO | PRD + baselines.seo_axis | TBD |
| Observability | baselines.observability_axis | TBD |
| Security | PRD + baselines.security_axis | TBD |
| Scalability | personas scale targets | TBD |

### 3. Per-axis strategy authoring

For each NFR axis, prompt:

> **{Axis} Implementation Strategy.** Baseline: {level}. Persona scale: {scale}.
>
> - **Approach:** <high-level — e.g., "edge-cached static + dynamic API per-user">
> - **Architectural mechanisms:** <which components / patterns deliver this NFR>
> - **Trade-offs:** <what's sacrificed; what's prioritised>
> - **Verification:** <how Phase 8/9 will measure this NFR is met>
>
> *Tier-1 method: `problem_solving` (scenario_planning) — walk through worst-case + nominal scenarios.*
> *Tier-1 method: `advanced-elicitation` on vague answers like "scalable", "performant", "secure".*

### 4. Riskiest-assumption coverage

For each `idea-validation.riskiest_assumptions` entry: verify architecture enables testing it. E.g., if assumption is "users will reach 1k concurrent during launch", architecture must enable load-testing 1k concurrent. Surface gaps as architecture-deltas.

### 5. Brand-guidelines architectural feedback

Read `brand-guidelines-v{N}.md` motion block + tokens:
- If motion tokens demand animations beyond CSS (e.g., spring physics): architecture must include animation library (e.g., Framer Motion, React Spring) — verify in tech-stack.dependencies.
- If a11y baseline = WCAG-AAA AND brand-guidelines tokens cleared the elevated contrast minimums: architecture should embed token-validation in CI (Phase 8).

### 6. Write into draft

Append `## 5. NFRs` section with per-axis strategy block.

### 7. Partial-completion clean

`at: "nfr_drafted"`.

## Output

- Section 5 (NFRs) drafted with per-axis architectural strategy
- Riskiest-assumption coverage verified
- Brand-guidelines architectural implications captured

## Navigation

→ Next: [step-05-adr.md](step-05-adr.md)
