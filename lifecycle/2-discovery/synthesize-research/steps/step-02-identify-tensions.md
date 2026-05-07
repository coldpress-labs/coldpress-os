---
step_number: 2
step_name: "Identify Themes & Tensions"
step_goal: "Apply Tier 1 methods to produce themes + tensions + convergent/divergent signals"
halts_for_input: true
next_step: "step-03-distil.md"
---

## Instructions

### 1. Apply Tier 1 methods — mandatory

#### 1a. Systems Thinking — `data/methods/problem-solving-methods.csv` (diagnosis)

Treat the findings table from Step 1 as a system. Ask:
- **Feedback loops** — do any findings reinforce each other? (e.g., "users distrust the incumbent" + "regulatory audit trail required" → both push toward transparency as a core product theme)
- **Leverage points** — which finding, if addressed, resolves multiple others?
- **Unintended consequences** — does optimising for one finding break another?
- **Boundaries** — where does the system under study end? What lies outside scope?

Systems Thinking is how we avoid the *"long list of unrelated research findings"* failure mode. If the synthesis reads like a bulleted list rather than a connected system, apply harder.

#### 1b. Morphological Analysis — `data/methods/problem-solving-methods.csv` (synthesis)

Lay out the solution-space as a matrix:
- **Rows** = dimensions the research revealed (e.g., *audience*, *deployment model*, *data residency*, *accessibility floor*, *primary journey*)
- **Columns** = candidate values per dimension (what domain/market/constraint/personas research surfaced)

This exposes combinatorial tensions: some cell-combinations are incoherent (e.g., audience=enterprise × deployment=offline-first × residency=any is a contradiction). Surface these as **tensions** in the synthesis — places where Phase 3 / Phase 4 must *pick*, not defer.

### 2. Produce the three synthesis structures

**Themes** — 3-7 cross-cutting patterns. Each theme cites 2+ input docs as evidence.

**Tensions** — 1-5 conflicts where research pulls in opposite directions. Format:
> *"{Source A}* says X; *{Source B}* says Y. Resolution owner: {Phase 3 stack | Phase 4 architecture | Phase 4 UX | Phase 4 PRD}."

Tensions are **not conclusions** — they're routed decisions. Naming the resolution owner is the whole point of surfacing them here.

**Convergent vs divergent signals** — which findings agree across sources (high-confidence → trust in downstream phases) vs which show divergence (lower-confidence → may need more research or an explicit pick).

### 3. Present for user review — halt

> Here are the themes I'm seeing: {list}. The tensions worth flagging: {list}. Any that feel off, or anything I'm missing?

Iterate with user. Re-surface the findings table if the user challenges a theme. Never finalise without explicit signoff on tensions (they drive downstream decisions).

### 4. Optional — advanced-elicitation bias

When themes feel murky, unclear, or contested, `advanced-elicitation` biases toward three methods for this step (per `data/methods/method-defaults.yaml` Wave 3.10):
- **#11 Tree of Thoughts** — multi-path reasoning
- **#12 Graph of Thoughts** — network patterns
- **#14 Self-Consistency Validation** — independent-approach comparison

Butler invokes these when triggers fire (see advanced-elicitation heuristics). They're not mandatory — mandatory methods are Tier 1 above.

## Output

Themes + tensions + convergent/divergent signals — user-confirmed. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-distil.md](step-03-distil.md)
