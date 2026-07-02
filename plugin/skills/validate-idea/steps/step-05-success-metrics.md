---
step_number: 5
step_name: "Success Metrics / North Star"
step_goal: "Name one North Star metric + 2-3 leading indicators using Measurement Framework"
halts_for_input: true
next_step: "step-06-prior-art.md"
---

## Instructions

### 1. Apply Tier 1 method — mandatory

#### Measurement Framework — `data/methods/design-thinking-methods.csv` (implement)

Three tiers of metric per the framework:

1. **North Star (one)** — the single metric that, if moved, proves the product is working. User-value-aligned (not revenue-aligned unless the product's core is payment). Examples: *weekly-active unique users completing the core task*, *median time-to-first-value*, *tasks completed per user per week*.
2. **Leading indicators (2-3)** — precede the North Star; tell you whether the North Star is trending before it moves. Examples: activation rate (for DAU), onboarding completion rate (for tasks/week), referral rate (for growth).
3. **Guardrails (optional)** — metrics to NOT regress. Examples: error rate, support-ticket volume, churn.

### 2. Anti-patterns to avoid

Name them explicitly so Butler doesn't produce weak answers:
- **Vanity metrics** — signups, pageviews, followers — unless they prove the North Star works, they don't belong
- **Lagging-only** — revenue / retention without leading indicators means the team has no steering wheel for the first 3-6 months
- **Too many metrics** — more than 4-5 total = nothing gets watched. Discipline: 1 North Star, 2-3 leading, 0-1 guardrail
- **Unmeasurable definitions** — *"user delight"* without operational definition is decoration, not metric

### 3. Phase 4 PRD handoff

This Step's output feeds **Phase 4 create-prd** acceptance criteria directly. The chosen metrics should be:
- Measurable in the planned stack (Phase 3 will confirm — e.g., event tracking infrastructure needs to exist)
- Computable within the first 30 days of launch for leading indicators

### 4. Halt for user input

> **North Star:** {candidate}. **Leading indicators:** {2-3 candidates}. **Guardrail:** {optional}. Does this feel like what you'd actually look at 90 days post-launch to decide whether v1 is working?

Iterate. If user keeps defaulting to vanity metrics, push back explicitly — *"That tells us people tried it. What tells us it worked?"*

### 5. Advanced-elicitation bias (optional)

When metrics feel vague or vanity-adjacent:
- **#32 Thesis Defense Simulation** — committee challenges each metric
- **#44 Expand or Contract for Audience** — stakeholder-appropriate metric depth

## Output

North Star + leading indicators (+ optional guardrail) with operational definitions. `step_5_complete: true`

## Navigation

→ Proceed to [step-06-prior-art.md](step-06-prior-art.md)
