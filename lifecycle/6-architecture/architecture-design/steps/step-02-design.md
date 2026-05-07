---
step_number: 2
step_name: "System Design"
step_goal: "Design system architecture, data model, and API contracts"
halts_for_input: true
next_step: "step-03-decisions.md"
---

## Goal

Translate requirements into a concrete system design. Work through components, data model, and API layer. Every decision must trace to a requirement or constraint identified in Step 1.

## Instructions

### 2a. System Architecture

1. **Identify system boundaries:**
   - What runs in the browser? What runs on the server? What's a third-party service?
   - Draw the boundary diagram (Mermaid graph TD)

2. **Define components:**
   - For each major functional area in the PRD, identify the component(s) responsible
   - Table: Component | Responsibility | Technology (from tech-stack.md)
   - Keep components coarse — this is architecture, not implementation

3. **Define communication patterns:**
   - How do components talk? (REST, GraphQL, WebSocket, real-time subscriptions, RPC)
   - What's synchronous vs asynchronous?
   - Where are the network boundaries?

4. **Present to user:** "Here's the component breakdown. Does this match your mental model?"

### 2b. Data Model

1. **Identify core entities** from the PRD's data requirements:
   - Table: Entity | Description | Key Fields | Storage
   - Note which entities are user-facing vs internal

2. **Define relationships:**
   - One-to-one, one-to-many, many-to-many
   - Reference patterns (foreign keys, embedded docs, joins)
   - Adapt to the actual storage technology (e.g., Convex document model ≠ SQL relational model)

3. **Data access patterns:**
   - What queries will be most frequent? Design indexes for these.
   - What data needs real-time subscriptions?
   - What data is read-heavy vs write-heavy?

4. **Present to user:** "Here's the data model. Any entities missing? Any relationships wrong?"

### 2c. API Design

1. **Define endpoints/functions** from PRD features:
   - Table: Endpoint/Function | Method | Purpose | Auth Required
   - Group by feature area

2. **Authentication & authorization:**
   - Who can access what? Role-based? Row-level?
   - Auth provider integration (from tech-stack.md)

3. **API contracts:**
   - Input/output shapes for critical endpoints
   - Error handling patterns
   - Pagination strategy (if applicable)

4. **Present to user:** "Here are the API endpoints. Missing anything?"

## Anti-Patterns

- Do NOT design for hypothetical scale — design for stated requirements
- Do NOT pick technologies not in tech-stack.md — that document is sacred
- Do NOT skip the data model — it's the foundation everything else rests on
- Do NOT over-engineer — prefer boring patterns that work over clever patterns that might not

## Output

System architecture, data model, and API design drafted. `step_2_complete: true`

## Navigation

-> On user approval, proceed to [step-03-decisions.md](step-03-decisions.md)
