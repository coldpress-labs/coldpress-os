---
step_number: 4
step_name: "Architecture Documentation"
step_goal: "Document architecture, components, APIs, and data flows"
halts_for_input: false
next_step: "step-05-dev-guide.md"
---

## Goal

Analyze and document the project's architectural patterns, component structure, API surface, and data flows.

## Instructions

1. **Identify architectural patterns:**
   - MVC, MVVM, Clean Architecture, Hexagonal
   - Microservices, monolith, serverless
   - Event-driven, request-response, pub-sub

2. **Document components** (scope varies by scan level):
   - **Quick:** Key components only (entry points, main features)
   - **Deep:** All major components with interfaces
   - **Exhaustive:** Every component with full signature inventory

3. **Document APIs** if applicable:
   - Routes/endpoints with methods and parameters
   - Request/response schemas
   - Authentication requirements
   - Rate limiting and pagination

4. **Map data flows:**
   - User input → processing → storage → output
   - External API integrations
   - State management patterns
   - Database schema relationships

5. **For exhaustive scans:** Create deep-dive documents for each major area (API routes, features, UI components, services).

6. **Write `_output/docs/architecture.md`** immediately. For exhaustive scans, also write per-area deep-dive files.

## Output

Architecture documentation written. Update frontmatter: `step_4_complete: true`

## Navigation

→ Auto-proceed to [step-05-dev-guide.md](step-05-dev-guide.md)
