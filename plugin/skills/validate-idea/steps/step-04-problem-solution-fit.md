---
step_number: 4
step_name: "Problem-Solution Fit"
step_goal: "Walk the primary persona's journey; verify the solution lands; identify gaps"
halts_for_input: true
next_step: "step-05-success-metrics.md"
---

## Instructions

### 1. Apply Tier 1 methods — mandatory

#### 1a. Jobs to be Done — Tier 0 (innovation-frameworks.csv disruption + design-thinking-methods.csv define)

Revisit the JTBD from the primary persona (if `personas` ran): *"When \[situation\], I want to \[motivation\], so I can \[expected outcome\]."*

If `personas` didn't run, author the JTBD now from `context.md` + research. Single sentence, canonical form.

The JTBD is what the product is *hired for*. If the proposed solution doesn't do that job better than alternatives (including the user's current workaround), fit is loose.

#### 1b. Gap Analysis — `data/methods/problem-solving-methods.csv` (analysis)

Compare the current state (how users solve this today) to the target state (with the proposed solution):

| Stage of the job | Current state — how users solve today | Target state — with our solution | Gap — what we'd need to deliver |
|---|---|---|---|

Gap column surfaces the concrete features / UX / technical work required for fit. Empty "gap" column cells = fit is easy = likely under-differentiated. Lots of gap = rich fit opportunity, but check whether the gap is fillable in v1.

### 2. Walk the journey

If `personas-*.md` exists, load the primary archetype's journey map. At each stage:
- Does the proposed solution serve the user at this stage?
- Which journey pain point does it relieve?
- Are there stages where the solution *doesn't* show up? (That's fine — but name them explicitly rather than pretending they're covered.)

If no journey map: walk an imagined primary user through end-to-end usage in narrative form. Look for the moments where the solution has to deliver.

### 3. Score fit

- **Strong** — solution clearly lands on 3+ journey pain points; gap analysis has concrete fillable work in v1
- **Moderate** — solution lands on 1-2 pain points; some gaps deferred to v2+
- **Weak** — solution is tangential to the JTBD; user would use it ad-hoc, not as primary tool
- **Unverified** — no persona / journey to walk through; skipping to Step 5

### 4. Halt for user input

> Walking this through the primary user's journey: solution lands on {pain points}. Gaps in v1: {list}. Fit: {strong/moderate/weak}. Does this match where you see the product showing up in the user's day?

Iterate. Fit-check can reveal that the framing is off — early pivot signal.

### 5. Advanced-elicitation bias (optional)

When fit feels loose or unverified, `advanced-elicitation` biases toward:
- **#36 Challenge from Critical Perspective** — devil's advocate
- **#47 Occam's Razor** — simplest-sufficient check (if the user's current workaround is 90% as good, fit is weak)

## Output

JTBD + Gap Analysis + journey walk + fit score. `step_4_complete: true`

## Navigation

→ Proceed to [step-05-success-metrics.md](step-05-success-metrics.md)
