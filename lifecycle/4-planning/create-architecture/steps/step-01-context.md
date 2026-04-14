---
step_number: 1
step_name: "Context Loading"
step_goal: "Load all planning artifacts and understand system requirements"
halts_for_input: true
next_step: "step-02-design.md"
---

## Goal

Build a complete picture of what the system needs to do before making any architectural decisions. Architecture follows requirements — never the reverse.

## Instructions

1. **Load required documents:**
   - `_output/planning/prd.md` — product requirements (SACRED, required)
   - `docs/tech-stack.md` — approved technology decisions (SACRED, required)
   - `docs/context.md` — project context and constraints (SACRED, required)

2. **Load recommended documents:**
   - `_output/planning/product-brief.md` — strategic context
   - `_output/design/ux-design-spec.md` — interface contracts (if exists)
   - `_output/planning/trigger-map.md` — user psychology drivers (if exists)
   - Any ADRs from `_output/planning/adrs/` (if tech-stack phase produced them)

3. **Extract architectural drivers:**
   - **Functional requirements** — what the system must do (from PRD)
   - **Non-functional requirements** — performance, security, scalability, reliability targets (from PRD)
   - **Technical constraints** — approved stack, hosting limits, budget constraints, free-tier boundaries (from tech-stack.md and context.md)
   - **Integration requirements** — third-party APIs, auth providers, payment systems (from PRD)
   - **Data requirements** — entities, relationships, privacy, retention (from PRD)

4. **Identify key tensions:**
   - Where do requirements conflict? (e.g., real-time updates vs. free-tier limits)
   - Where does the tech stack constrain the design? (e.g., Convex's document model vs. relational needs)
   - Where are requirements underspecified? Flag these for user discussion.

5. **Present summary to user:**
   - "Here's what I understand the system needs to do: {summary}"
   - "These are the key tensions I see: {tensions}"
   - "Before I design, are there constraints I'm missing?"

## Anti-Patterns

- Do NOT start designing before fully understanding requirements
- Do NOT assume requirements that aren't in the PRD — ask
- Do NOT ignore non-functional requirements — they drive architecture more than features do

## Output

Context loaded, architectural drivers extracted, tensions identified. `step_1_complete: true`

## Navigation

-> On user confirmation, proceed to [step-02-design.md](step-02-design.md)
