---
step_number: 1
step_name: "Archetype Extraction"
step_goal: "Extract 2-3 user archetypes using Tier 1 empathize + disruption methods"
halts_for_input: true
next_step: "step-02-journey-map.md"
---

## Instructions

### 1. Load existing audience signal

Read `_context/sacred/context.md` Users section + any Phase 2 research docs (`_context/planning/research/market-*.md`, `domain-*.md`) for audience shape already captured.

### 2. Apply Tier 1 methods — mandatory

Three methods, applied in order. Source CSVs cited so `@ux-designer` can look up facilitation prompts directly.

#### 2a. User Interviews — `data/methods/design-thinking-methods.csv` (empathize)

*Deep conversations to understand user needs, experiences, and pain points through active listening.*

Facilitation prompts: *"What brings you here today?"* / *"Walk me through a recent experience."* / *"What frustrates you most?"* / *"What would make this easier?"* / *"Tell me more about that."*

- If the user has prior user-research material in `_input/raw/` (interview transcripts, surveys, diary exports): synthesise from there. Graph-first.
- If no material exists AND `team_shape = client-project`: ask whether the client has prior user research Butler should consult.
- If no material exists AND `team_shape = solo`: surface this as a gap — *"We don't have direct user voice. Want to skip personas for a prototype, or do 30-min interviews with 3-5 users first?"* Honour user's call.
- If the user is Butler's only audience signal: use second-person targeted questions about *who* they're building for, with the understanding that personas-from-proxy are weaker than personas-from-research and flag this in the output frontmatter as `source: proxy`.

#### 2b. Empathy Mapping — `data/methods/design-thinking-methods.csv` (empathize)

*Visual representation of what users Say / Think / Do / Feel.*

Facilitation prompts: *"What did they say?"* / *"What might they be thinking?"* / *"What actions did they take?"* / *"What emotions surfaced?"*

For each emerging archetype, fill all 4 quadrants. A weak empathy map = an archetype too thin to drive design.

#### 2c. Jobs to be Done — `data/methods/innovation-frameworks.csv` (disruption)

*Uncover customer jobs and the solutions they hire to make progress.*

Facilitation prompts: *"What job are customers hiring this for?"* / *"What progress do they seek?"* / *"What alternatives do they use?"* / *"What frustrations exist?"* / *"What would fire this solution?"*

For each archetype, produce a single-sentence JTBD statement in the canonical form: *"When \[situation\], I want to \[motivation\], so I can \[expected outcome\]."*

### 3. Draft 2-3 archetypes

Each archetype needs:
- **Name + one-line summary** (e.g., *"Morgan — mid-career PM who evaluates tools on Friday afternoons"*)
- **Demographics + context** (industry, role, seniority, team shape)
- **Empathy map** (Says / Thinks / Does / Feels)
- **Jobs to be Done** (the canonical sentence)
- **Representative quote** (from interview or synthesised if `source: proxy`)

Avoid generic personas ("Tech-savvy millennial"). If an archetype reads like a marketing deck cliché, it's too thin — pressure-test with more empathy-map detail.

### 4. Confirm with user

Present archetype drafts. Halt for input:

> Here are 2-3 archetypes. Do these match the users you're building for? Any missing? Any that collapse into one another?

Iterate before moving on. Never auto-advance.

## Output

2-3 confirmed archetypes with empathy maps + JTBD. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-journey-map.md](step-02-journey-map.md)
