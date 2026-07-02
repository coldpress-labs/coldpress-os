---
step_number: 1
step_name: "Problem Validation"
step_goal: "Revisit the problem statement, collect evidence, score confidence, flag weak-evidence branches"
halts_for_input: true
next_step: "step-02-hypotheses-and-risks.md"
---

## Instructions

### 1. Revisit the problem statement

Read `_context/sacred/context.md` §Problem space (authored by Phase 1 `intake`). Extract the claim about what problem this product solves.

### 2. Apply Tier 1 methods — mandatory

#### 2a. Problem Statement Refinement — `data/methods/problem-solving-methods.csv` (diagnosis)

Tighten the stated problem. Collapse vague scope, surface hidden actors, name the specific moment the problem bites. If the current context.md problem statement is *"users struggle with task management,"* refinement looks like *"mid-career PMs lose 30-60 min/day reconciling tool overlap between Jira, Slack, and Notion."* Specificity makes validation possible.

#### 2b. Five Whys Root Cause — Tier 0 (appears in elicitation-methods, brainstorming, problem-solving)

Drill from the symptom to the cause:
- *Why does this happen?* → surface reason 1
- *Why does reason 1 happen?* → reason 2
- … five levels deep, or until a root emerges

Stop when the "why" hits a genuine environmental / structural / economic / cultural root — not when Butler runs out of patience. Shallow five-whys is a common failure mode.

#### 2c. Is/Is Not Analysis — `data/methods/problem-solving-methods.csv` (diagnosis)

Explicit scoping via twin lists:

| IS | IS NOT |
|---|---|
| The problem is … | The problem is not … |
| This happens to … | This doesn't happen to … |
| This happens when … | This doesn't happen when … |

The "IS NOT" column is the whole point — it surfaces the boundary where the validation claim stops applying. Vague scope ("helps everyone with productivity") collapses under Is/Is Not; focused scope survives.

### 3. Collect evidence

For the refined problem statement, collect supporting evidence:
- **Graph query first** — `_input/raw/` (user-loaded briefs, interview transcripts, AI-chat exports): does the user already have direct evidence?
- **Research docs** — do `_context/planning/research/domain-*.md` or `market-*.md` cite the problem?
- **`_input/reference/`** — third-party reading that corroborates or contradicts
- **Direct user voice** — quotes from interviews, if `personas` ran with direct research

### 4. Score evidence confidence

Single-call assignment:
- **Strong** — ≥3 independent sources (different research method or different audience) AND direct user quotes
- **Moderate** — 2-3 sources with partial user voice
- **Weak** — 0-1 sources OR all second-hand (no direct voice)

Weak-evidence branches feed Step 9's red-flag logic. Don't soften — "weak" is a signal, not a failure.

### 5. Flag with user — halt

> Refined problem: *"{refined statement}"*. Evidence: {strong / moderate / weak} — {N} sources, {direct quotes? yes/no}. Is this how you'd describe the problem? Anything missing in the evidence trail?

User confirms or iterates. Log final `problem_evidence_confidence` to working frontmatter.

### 6. Advanced-elicitation bias (optional)

If user's answers in Step 5 are shallow or hedging, `advanced-elicitation` biases toward these methods per `data/methods/method-defaults.yaml` Wave 3.10:
- **#40 Five Whys** (reinforcing Tier 1)
- **#39 First Principles Thinking** (Tier 0)

Invoked only on trigger, not by default.

## Output

Refined problem statement + evidence + confidence score. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-hypotheses-and-risks.md](step-02-hypotheses-and-risks.md)
