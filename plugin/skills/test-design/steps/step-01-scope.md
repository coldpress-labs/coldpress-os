---
step_number: 1
step_name: "Define Scope"
step_goal: "Determine test scope and extract requirements to cover"
halts_for_input: true
next_step: "step-02-strategy.md"
---

## Goal

Establish what will be tested, at what level, and extract all requirements that need coverage.

## Instructions

1. **Determine scope level:**
   - **System-level:** Full project, all epics and requirements
   - **Epic-level:** Single epic and its stories

2. **Read source documents:**
   - PRD → Extract FRs and NFRs
   - Architecture → Extract technical constraints and quality attributes
   - Epics/Stories → Extract acceptance criteria

3. **Build requirements inventory:**
   - List all FRs with IDs
   - List all NFRs (performance, security, usability, reliability)
   - List all acceptance criteria by story
   - Note any implicit requirements from architecture

4. **Present scope** to user for confirmation.

## User Interaction

"I've identified **{N} functional requirements**, **{N} NFRs**, and **{N} acceptance criteria** across **{scope}**. Proceed with test planning?"

## Output

Requirements inventory in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-strategy.md](step-02-strategy.md)
