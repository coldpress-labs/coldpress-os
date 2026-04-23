---
step_number: 1
step_name: "Parse Epics"
step_goal: "Extract all epics, stories, and work items from epics.md"
halts_for_input: false
next_step: "step-02-detect.md"
---

## Goal

Build a complete inventory of all work items.

## Instructions

1. **Read `_context/planning/epics.md`** and parse all epics and stories.
2. **Extract for each epic:** Number, title, stories list.
3. **Extract for each story:** Key (e.g., "1.1"), title, acceptance criteria count.
4. **Convert story IDs to kebab-case:** "Epic 1, Story 1: User Login" → `1-1-user-login`
5. **Build work item list** with epic entries, story entries, and retrospective entries.

## Output

Work item inventory built. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-detect.md](step-02-detect.md)
