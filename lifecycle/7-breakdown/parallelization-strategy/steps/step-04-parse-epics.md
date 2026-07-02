---
step_number: 4
step_name: "Parse Epics"
step_goal: "Extract all epics, stories, and work items from epics.md"
halts_for_input: false
next_step: "step-05-detect-statuses.md"
---

## Goal

Build a complete inventory of all work items, as the basis for the sprint-status tracking file that `create-stories`/`dev-story`/`implementation-readiness`/`retrospective` read.

## Instructions

1. **Read `_context/planning/epics.md`** and parse all epics and stories.
2. **Extract for each epic:** Number, title, stories list.
3. **Extract for each story:** Key (e.g., "1.1"), title, acceptance criteria count.
4. **Convert story IDs to kebab-case:** "Epic 1, Story 1: User Login" → `1-1-user-login`
5. **Build work item list** with epic entries, story entries, and retrospective entries.

## Output

Work item inventory built. `step_4_complete: true`

## Navigation

→ Auto-proceed to [step-05-detect-statuses.md](step-05-detect-statuses.md)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Original `sprint-planning` Step 1. |
| 2.0 | 2026-07-02 | Butler | Folded into `parallelization-strategy` as Step 4 (WS5-B, §8 item 6 — `sprint-planning`'s @scrum-master sub-persona ceremony retired; dropped the Pattern 7 `#8a` sub_phase_boundary transition entirely, since this now runs in @pm's own scope with no agent hand-off). |
