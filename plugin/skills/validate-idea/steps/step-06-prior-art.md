---
step_number: 6
step_name: "Prior Art / OSS Landscape"
step_goal: "Quick scan — has this been built? OSS to build on? Disruption pattern?"
halts_for_input: true
next_step: "step-07-stakeholder-alignment.md"
---

## Instructions

### 1. Don't re-do domain-research

Step 6 is a **quick pass**, not a fresh research lane. Read `_context/planning/research/domain-*.md` + `market-*.md` for what's already been discovered. Build on them, don't duplicate.

If those research docs didn't cover the prior-art angle (common — they focus on audience and competitors, not on "has this been tried?"), do a targeted 20-30 minute scan. Not a deep dive.

### 2. Apply Tier 1 methods — mandatory

#### 2a. Disruptive Innovation Theory — `data/methods/innovation-frameworks.csv` (disruption)

Ask:
- Who are non-consumers of existing solutions? (They don't use current tools — why?)
- What's good enough for them?
- What incumbent weakness does this exploit?
- How could simple beat sophisticated?

Disruption opportunities live in under-served segments that existing tools ignore. If your idea is a better Jira, that's sustaining, not disruptive — and sustaining-innovation is still valid, just name it honestly.

#### 2b. Crossing the Chasm — `data/methods/innovation-frameworks.csv` (disruption)

- Who are the innovators + early adopters for v1?
- What's the beachhead market (narrow segment where v1 wins decisively)?
- What's the compelling reason this specific segment buys?
- What's the whole-product offering they need?
- How do you then cross to mainstream?

Beachhead identification is more important than mainstream planning at this phase. *"Everyone who does X"* is not a beachhead; *"mid-stage startup CTOs at 20-50 person companies running on Next.js"* is.

### 3. Scan for existing attempts

- **Direct prior art** — has someone built this exact thing? (GitHub search, Product Hunt, company-graveyard lists). If yes: why did they fail? Are those reasons still valid?
- **Adjacent prior art** — different framing, overlapping scope. What lessons transfer?
- **OSS building blocks** — what exists that v1 can use vs. build?

### 4. Score prior art signal

- **Gap** — nobody has built this; promising (but also: why hasn't anybody? check carefully)
- **Opportunity** — prior art exists, all failed for reasons that no longer apply, OR market has shifted
- **Saturated** — prior art exists, still running, well-funded — expect bruising competition

`prior_art_signal = saturated` + Step 3 `differentiation_strength = none` = critical weakness for Step 9.

### 5. Halt for user input

> Prior art: {gap/opportunity/saturated}. Beachhead candidate: {segment}. OSS to build on: {list}. Does this change anything about who we're for, or what we're building?

Iterate. Surprising prior-art findings sometimes reroute Step 2 / Step 3 — that's fine; re-enter those steps if needed.

### 6. Advanced-elicitation bias (optional)

When prior-art scan feels shallow:
- **#31 Literature Review Personas** — deeper source critique
- **#30 Genre Mashup** — cross-domain pollination (adjacent-industry lessons)

## Output

Prior art signal + beachhead + OSS scan. `step_6_complete: true`

## Navigation

→ **If `team_shape == solo`:** skip Steps 7 + 8 → proceed to [step-09-validation-summary.md](step-09-validation-summary.md)
→ **If `team_shape == team`:** proceed to [step-07-stakeholder-alignment.md](step-07-stakeholder-alignment.md); skip Step 8
→ **If `team_shape == client-project`:** proceed to [step-07-stakeholder-alignment.md](step-07-stakeholder-alignment.md)
