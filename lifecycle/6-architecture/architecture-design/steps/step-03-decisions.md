---
step_number: 3
step_name: "Architecture Decisions"
step_goal: "Record key ADRs, define patterns and anti-patterns"
halts_for_input: true
next_step: "step-04-finalize.md"
---

## Goal

Every non-obvious architectural choice needs a recorded decision with rationale. These become the ADRs that prevent future developers (human or AI) from re-debating settled questions.

## Instructions

### 3a. Identify Key Decisions

Review the design from Step 2. For each choice that isn't self-evident, create an inline ADR:

1. **Which decisions need ADRs?** Anything where:
   - A reasonable person might choose differently
   - The "why" isn't obvious from the "what"
   - Changing this decision later would be expensive
   - An AI agent implementing code needs to know "use X, not Y"

2. **Common ADR topics** (check which apply to this project):
   - Data storage strategy (why this DB pattern over alternatives)
   - Authentication approach (why this auth provider/method)
   - State management (client-side, server-side, hybrid)
   - Real-time strategy (polling, WebSocket, subscriptions)
   - File/media handling (upload, storage, CDN)
   - Error handling philosophy (fail fast, graceful degradation, retry)
   - Caching strategy (what, where, TTL)
   - Deployment topology (single region, multi-region, edge)

### 3b. Write Inline ADRs

For each decision, use this format within the architecture document:

```markdown
### ADR: {Decision Title}

**Status:** Accepted
**Context:** {What problem or choice prompted this?}
**Decision:** {What we decided}
**Rationale:** {Why — the key reasons}
**Consequences:** {What this means for implementation — both positive and negative}
**Alternatives Considered:** {What we didn't pick and why}
```

Keep ADRs concise — 5-10 lines each. The goal is clarity, not length.

### 3c. Define Patterns

1. **Coding patterns** — conventions all implementers must follow:
   - File structure patterns (where things live)
   - Naming conventions (files, functions, components, DB fields)
   - Error handling pattern (how to handle errors consistently)
   - Data fetching pattern (how to load data in the UI)

2. **Integration patterns** — how external services are used:
   - API client patterns
   - Environment variable conventions
   - Secret management approach

### 3d. Define Anti-Patterns

1. **What NOT to do** — explicit prohibitions:
   - Technologies/libraries NOT to use (and why)
   - Architectural shortcuts that would cause debt
   - Patterns that conflict with the chosen stack

2. **These matter more for AI agents than for humans.** An AI agent will follow instructions literally — if the architecture says "never use X," it won't. If it doesn't say that, the AI might default to X from its training data.

### 3e. Review with User

- Walk through each ADR: "Here's what I decided and why"
- Present patterns: "Here's how implementation should work"
- Present anti-patterns: "Here's what to avoid"
- "Any decisions you disagree with? Any patterns missing?"

## Anti-Patterns (Meta)

- Do NOT record obvious decisions as ADRs (e.g., "we chose React because tech-stack.md says React")
- Do NOT leave rationale vague — "it's better" is not a reason
- Do NOT skip anti-patterns — they're more valuable than patterns for AI consistency

## Output

ADRs, patterns, and anti-patterns defined. `step_3_complete: true`

## Navigation

-> On user approval, proceed to [step-04-finalize.md](step-04-finalize.md)
