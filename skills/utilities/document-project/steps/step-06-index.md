---
step_number: 6
step_name: "Generate Index"
step_goal: "Create master documentation index linking all generated docs"
halts_for_input: true
next_step: "complete"
---

## Goal

Generate a master index that ties all documentation together and provides easy navigation.

## Instructions

1. **Inventory all generated documents** in `_context/audit/docs/`.

2. **Generate `_context/audit/docs/index.md`** with:
   - Project overview (name, type, tech stack summary)
   - Quick reference section
   - Links to all generated documentation with one-line descriptions
   - Links to any existing project documentation (README, CONTRIBUTING, etc.)
   - Getting started section (pointing to dev guide)
   - AI-assisted development guidance (how to use these docs with AI tools)

3. **Generate completion summary** for user:
   - Total documents generated
   - Total words/approximate tokens
   - Scan level used
   - Areas that may benefit from deeper analysis
   - Suggestions for keeping documentation up to date

4. **Present to user** with the index location.

## User Interaction

Present the completion summary and ask if any areas need deeper documentation.

## Output

Master index at `_context/audit/docs/index.md`. Workflow complete.

## Navigation

→ Workflow complete.
