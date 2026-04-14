---
name: "advanced-elicitation"
description: "Push the LLM to reconsider and refine its recent output using structured elicitation methods"
type: "simple"
category: "utilities"
phases: [2, 4, 5, 6, 8]
inputs:
  - "recent LLM output to refine"
  - "../../data/methods/elicitation-methods.csv"
outputs:
  - artifact: "Refined Output"
    location: "inline (replaces or supplements prior output)"
    format: "markdown"
version: "1.0"
---

## Purpose

Pushes the LLM to go deeper on its most recent output using structured elicitation techniques. Selects from 50+ methods organized by category (collaboration, competitive, technical, creative, research, risk, core, learning, philosophical, retrospective) to challenge assumptions, surface hidden considerations, and produce a more thorough result.

## When to Use

- "go deeper on this"
- "challenge that output"
- "run elicitation"
- "refine this"
- When an LLM response feels shallow, obvious, or incomplete
- When you want a second-pass analysis from a different angle

## Prerequisites

- Recent output to refine must be available in conversation context
- Data asset: `../../data/methods/elicitation-methods.csv`

## Process

1. **Identify target output.** Determine which recent output to refine — default to the most recent substantive response unless user specifies otherwise.

2. **Load method registry** from `../../data/methods/elicitation-methods.csv`.

3. **Smart method selection.** Based on the content type and context:
   - **Technical content** → Rubber Duck Debugging, Architecture Decision Records, Algorithm Olympics
   - **Strategic content** → Pre-mortem Analysis, Red Team vs Blue Team, Shark Tank Pitch
   - **Creative content** → SCAMPER, Reverse Engineering, Exquisite Corpse
   - **Analysis content** → First Principles, Socratic Questioning, Comparative Analysis
   - **Risk assessment** → Failure Mode Analysis, Chaos Monkey, Critical Perspective
   - Select 1-3 complementary methods.

4. **Apply selected methods.** Run each method against the target output:
   - Reframe the content through the method's lens
   - Identify gaps, assumptions, and unexplored angles
   - Generate enhanced insights

5. **Present options to user:**
   - **(A) Accept refinement** — Replace original with refined version
   - **(M) Merge** — Combine best of original and refined
   - **(R) Run another method** — Try a different elicitation technique
   - **(D) Discard** — Keep original, discard refinement

## Output

A refined version of the target output, produced through structured elicitation. Delivered inline in conversation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-advanced-elicitation, adapted to coldpress-os schema |
