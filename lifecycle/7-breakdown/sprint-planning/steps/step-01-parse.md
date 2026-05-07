---
step_number: 1
step_name: "Parse Epics"
step_goal: "Extract all epics, stories, and work items from epics.md"
halts_for_input: false
next_step: "step-02-detect.md"
---

## Goal

Build a complete inventory of all work items.

## Pattern 7 transition (sub_phase_boundary entry)

This skill is owned by @scrum-master as a sub-persona dispatch from @pm (Phase 7 primary). On entry, append the `#8a` transition record to the Pattern 7 buffer at `_context/handoffs/pattern-7-transitions-wip-{date}.yaml`:

```yaml
- trigger: sub_phase_boundary
  from_agent: pm
  to_agent: scrum-master
  rationale: "Sprint planning is @scrum-master's specialist domain"
  warm_handoff: null
  resumes_to: pm
  recorded_at: <ISO>
```

If buffer file doesn't exist yet, create it with `phase: 7` + `created_at: <ISO>` + empty `transitions: []` then append. See `docs/cross-cutting/pattern-7-agent-personas.md` "Where transitions are recorded" for the buffer convention.

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
