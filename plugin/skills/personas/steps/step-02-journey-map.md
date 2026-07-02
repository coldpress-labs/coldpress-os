---
step_number: 2
step_name: "Journey Map"
step_goal: "Map the primary archetype's journey using Tier 1 empathize methods"
halts_for_input: true
next_step: "step-03-accessibility-targets.md"
---

## Instructions

### 1. Pick the primary archetype

Ask the user which archetype matters most for v1:

> Of the 2-3 archetypes, which one should Phase 4 UX optimise for first? (Others still get considered, but primary drives defaults.)

Flag the chosen archetype as `primary: true` in the output frontmatter. Multi-journey mapping for all archetypes is cheap to defer; ship primary now, optionally add more later on user request.

### 2. Apply Tier 1 methods — mandatory

#### 2a. Journey Mapping — `data/methods/design-thinking-methods.csv` (empathize)

*Document the complete user experience across touchpoints to identify pain points and opportunities.*

Facilitation prompts: *"What's their starting point?"* / *"What steps do they take?"* / *"Where do they struggle?"* / *"What delights them?"* / *"What's the emotional arc?"*

Map stages end-to-end. Canonical structure:

| Stage | User action | Touchpoints | Thinking | Emotional arc (1-5) | Pain points | Opportunities |
|---|---|---|---|---|---|---|

Stages depend on the product. Examples:
- **SaaS tool:** Awareness → Sign-up → First-run → Daily-use → Renewal
- **Marketplace:** Discover → Compare → Transact → Receive → Re-engage
- **Internal tool:** Onboard → Task-flow → Escalate → Report → Handover

### 2b. Diary Studies — `data/methods/design-thinking-methods.csv` (empathize)

*Users document experiences over time to capture authentic moments and evolving needs.*

Facilitation prompts: *"What did you experience today?"* / *"How did you feel?"* / *"What worked or didn't?"* / *"What surprised you?"*

Use diary data when journey mapping from a single interview risks being too clean. If `_input/raw/` has diary-style content (user journals, Notion export, Slack thread) — synthesise longitudinal patterns into the journey map. If not, skip diary-studies content but leave the method name cited in output frontmatter for method-audit.

### 3. Annotate the journey

Every pain point gets tagged with downstream-phase impact:
- **`→ phase-3`** — suggests a stack decision (e.g., offline resilience, real-time sync)
- **`→ phase-4-ux`** — suggests a UX decision (information architecture, affordance)
- **`→ phase-4-prd`** — suggests a functional requirement

This tagging is what makes the journey useful to the next phase, not just decorative.

### 4. Confirm with user

Present the journey + annotations. Halt:

> Does this match the path you see this user taking? Any stages missing? Pain points I've exaggerated or missed?

Iterate.

## Output

Journey map for primary archetype with stage-level pain points tagged to downstream phases. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-accessibility-targets.md](step-03-accessibility-targets.md)
