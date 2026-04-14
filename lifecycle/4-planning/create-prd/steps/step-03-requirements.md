---
step_number: 3
step_name: "Requirements"
step_goal: "Define functional and non-functional requirements"
halts_for_input: true
next_step: "step-04-features.md"
---

## Goal

Capture all functional and non-functional requirements that the product must satisfy.

## Instructions

1. **Functional requirements:**
   - Group by feature area or user flow
   - Each requirement: ID, description, priority (P0/P1/P2), acceptance criteria
   - Use format: "The system shall [verb] [object] [condition]"
   - Ensure traceability to product goals

2. **Non-functional requirements:**
   - **Performance:** load times, response times, throughput
   - **Security:** authentication, authorization, data protection
   - **Accessibility:** WCAG level, screen reader support, keyboard navigation
   - **Scalability:** expected load, growth projections
   - **Reliability:** uptime requirements, error handling
   - **Compatibility:** browser/device support matrix (from design brief)

3. **Technical constraints:**
   - Technology stack constraints (from tech-stack.md)
   - Integration requirements (APIs, third-party services)
   - Infrastructure constraints (hosting, budget, free tiers)

4. **Data requirements:**
   - Data entities and relationships (high level)
   - Data retention and privacy requirements
   - Import/export requirements

5. **Review with user:**
   - Walk through requirements by priority
   - Confirm nothing critical is missing
   - Validate priorities are correct

## Output

Requirements section drafted and approved. `step_3_complete: true`

## Navigation

-> Proceed to [step-04-features.md](step-04-features.md)
