---
name: sprint-planning
description: Phase 7 — generate sprint-status from PERT chart waves + stories. Owned by @scrum-master sub-persona (Pattern 7 sub_phase_boundary transitions #8a + #8b from @pm).
license: MIT
compatibility: Invoked by @pm in Phase 7
version: "2.0"
---

## Purpose

Phase 7 — assign each story to a wave per PERT chart; emit sprint-status tracking file. Owned by **@scrum-master** sub-persona (Pattern 7 sub_phase_boundary internal transition from @pm).

## When to Use

- Phase 7 — invoked after `parallelization-strategy` (PERT chart) completes.

## Prerequisites

- PERT chart sacred + locked
- stories-index complete

## Process

3-step workflow (graph-first + wave-to-story-assignment + sprint-status emit).

→ See [workflow.md](workflow.md).

## Output

`_context/tracking/sprint-status-v{N}.md` — wave-by-wave story assignment with status tracking columns.

## Pattern 7

Sprint-planning entry triggers @pm → @scrum-master sub_phase_boundary (transition #8a). Sprint-planning exit triggers @scrum-master → @pm (transition #8b). Both logged in handoff log's `agent_transitions:` section.

## Cross-cutting wire-ins

- `brainstorming` (round_robin for capacity-trade-off discussion)

## Method playbook

Per `phase_7:`: brainstorming medium.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #9 Wave 7.4) | Phase 7 rewrite. Inputs converted to graph-first. Owner formalised as @scrum-master (Pattern 7 sub-persona transition from @pm — #8a entry / #8b exit). 3-step workflow. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial sprint-planning skill |
