---
step_number: 3
step_name: "Competitive Differentiation"
step_goal: "Explicit unfair-advantage statement via Blue Ocean + Positioning Map + VPC"
halts_for_input: true
next_step: "step-04-problem-solution-fit.md"
---

## Instructions

### 1. Apply Tier 1 methods — mandatory

#### 1a. Blue Ocean Strategy — `data/methods/innovation-frameworks.csv` (disruption)

Classic 4-action framework:
- **Eliminate** — which factors that the industry takes for granted should we eliminate?
- **Reduce** — which factors should we reduce well below the industry standard?
- **Raise** — which factors should we raise well above the industry standard?
- **Create** — which factors should we create that the industry has never offered?

If all four columns come back with thin content, the market probably isn't blue ocean — honest answer. Don't force-fit.

#### 1b. Competitive Positioning Map — `data/methods/innovation-frameworks.csv` (market_analysis)

Two-axis map. Pick axes that matter for *this* market:
- Price × Sophistication
- Speed × Depth
- Integrated × Specialised
- Enterprise × Solo

Place 3-5 existing competitors on the map (from `_context/planning/research/market-*.md`). Place the proposed product. The position should be *empty* or *differentiated* — otherwise differentiation is likely weak.

#### 1c. Value Proposition Canvas — `data/methods/innovation-frameworks.csv` (business_model)

Match customer **jobs × pains × gains** (from personas, if ran) against proposed **products × pain-relievers × gain-creators**:

| Customer side | Product side |
|---|---|
| Jobs — what user is trying to accomplish | Products & services — what you offer |
| Pains — frustrations, obstacles, risks | Pain relievers — how your product removes specific pains |
| Gains — desired outcomes, aspirations | Gain creators — how your product delivers specific wins |

Rich VPC = clear value proposition. Sparse VPC on the product side = "we're building something, we'll see who wants it" — flag.

### 2. Synthesise — unfair-advantage statement

Single sentence, declarative:

> *"We win because \[specific differentiator\] that \[incumbents or substitutes\] can't replicate without \[specific cost or constraint\]."*

Or honest negation:

> *"We don't have a clear unfair advantage — our bet is on execution speed / distribution / specific market insight / luck."*

Fake-confident differentiation statements are worse than honest negation. If the user can't name the specific thing that's hard to copy, `differentiation_strength = none` and we proceed — Step 9 will surface it if combined with saturated prior art.

### 3. Score differentiation strength

- **Strong** — clear, specific, hard to copy within 6 months, backed by VPC richness
- **Moderate** — some advantage, may erode with well-funded competitor
- **Weak** — advantage exists but small; commoditisation risk high
- **None** — no specific advantage; bet is on execution

### 4. Halt for user input

> Unfair advantage: *"{statement}"*. Strength: {strong/moderate/weak/none}. Does this ring true? Anything I'm claiming we can do that we can't?

Iterate. The unfair-advantage statement is load-bearing for product-brief's positioning section.

### 5. Advanced-elicitation bias (optional)

When differentiation claim feels weak or boilerplate, `advanced-elicitation` biases toward:
- **#17 Red Team vs Blue Team** — adversarial stress-test
- **#18 Shark Tank Pitch** — skeptical-investor pressure

## Output

Blue Ocean actions + Positioning Map + VPC + unfair-advantage statement + differentiation strength score. `step_3_complete: true`

## Navigation

→ Proceed to [step-04-problem-solution-fit.md](step-04-problem-solution-fit.md)
