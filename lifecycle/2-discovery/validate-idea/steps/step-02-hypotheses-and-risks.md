---
step_number: 2
step_name: "Hypotheses + Riskiest Assumptions"
step_goal: "Enumerate bets, order by risk, tag the riskiest 1-3, check testability"
halts_for_input: true
next_step: "step-03-differentiation.md"
---

## Instructions

### 1. Apply Tier 1 methods — mandatory

#### 1a. Lean Startup Methodology — `data/methods/innovation-frameworks.csv` (strategic)

Frame the product as a set of hypotheses, not certainties. *"For this to work, X, Y, Z must be true."* Explicit hypotheses = testable hypotheses. Implicit hypotheses die quietly in production.

Canonical hypothesis form: *"We believe that \[segment\] experiencing \[problem\] will \[behaviour\] because of \[insight\]. We'll know we're right when \[observable signal\]."*

Generate 5-10 hypotheses. Cover:
- **User / segment hypotheses** — about who will use this
- **Problem hypotheses** — about what's really broken (may mirror Step 1)
- **Solution hypotheses** — about what will fix it
- **Value / willingness hypotheses** — about what users will do (sign up, pay, switch)
- **Channel hypotheses** — about how they'll find the product

### 1b. Risk Assessment Matrix — `data/methods/problem-solving-methods.csv` (evaluation)

Rank each hypothesis on two axes:

| | Low probability of being wrong | High probability of being wrong |
|---|---|---|
| **Low cost if wrong** | Deprioritise — test later | Test cheaply, later |
| **High cost if wrong** | Nice — but test anyway | **RISKIEST — test FIRST** |

The top-right cell is where "riskiest assumptions" live. Tag the **top 1-3** hypotheses that land here.

### 2. Check riskiest-assumption testability

For each tagged riskiest assumption, ask:

> Is there a cheap experiment (under ~1 week, under ~$500) that would give us enough signal to decide?

- **Testable** — the experiment exists (landing page, fake door, user interview, prototype walk-through, landing-page ad test). Phase 5 Breakdown will plan it.
- **Untestable** — no cheap experiment. Either it requires a full build to test, or the signal is only available post-launch.

`riskiest_assumption_testable: false` is a critical weakness feeding Step 9's red-flag logic. Don't soften.

### 3. Halt for user input

> Riskiest assumptions I'd test first: {list}. Each tagged {testable | untestable}. Any I'm over-worried about? Any riskier ones I missed?

Iterate. The list should feel sharp, not exhaustive.

### 4. Advanced-elicitation bias (optional)

When user's hypothesis list feels cheap or obvious, `advanced-elicitation` biases toward:
- **#34 Pre-mortem Analysis** — imagine the product failed; work backward
- **#35 Failure Mode Analysis** (Tier 0)
- **#37 Identify Potential Risks**

## Output

Ordered hypothesis list + top 1-3 riskiest assumptions + testability flag per riskiest. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-differentiation.md](step-03-differentiation.md)
