---
name: "incident-response"
description: "Drive incident from detection to resolution to postmortem. Distinct from retrospective (Phase 11): incident-response is in-flight (Phase 10 mid-incident); retrospective is after-action across many incidents. Emits incident-runbook + postmortem doc + ops-deltas (if user-impact / repeat-pattern)."
type: "workflow"
category: "lifecycle"
phase: 10
agent: "devops"
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "previous incident-* nodes (pattern matching)"
    - "ArchitectureComponent nodes (impact mapping)"
  cold_file_reads:
    - "_context/operations/observability-v{latest}.md (alert that triggered)"
    - "_context/audit/deploy-log-v{latest}.md (recent deploys correlation)"
    - "_context/sacred/architecture.md (NFR + critical-component refs)"
    - "_context/audit/incident-{slug}-v{N}.md (priors, if pattern detected)"
  existence_checks:
    - "Active alert / observable user-impact signal"
outputs:
  - artifact: "Incident timeline (live, append-only during incident)"
    location: "_context/audit/incident-{slug}-{date}-timeline.md"
    format: "markdown"
    sacred: false
  - artifact: "Postmortem"
    location: "_context/audit/incident-{slug}-{date}-postmortem.md"
    format: "markdown"
    sacred: false
  - artifact: "Runbook entries (lessons codified)"
    location: "_context/operations/runbooks/{slug}.md"
    format: "markdown"
    sacred: false
  - artifact: "Ops-deltas (if pattern / user-impact)"
    location: "_context/handoffs/phase-10-ops-deltas-wip-{date}.md"
    format: "markdown"
    sacred: false
    schema_ref: "schemas/handoffs/ops-delta.schema.json"
---

## Purpose

Phase 10 in-flight skill that drives an incident from **detection → triage → mitigation → resolution → postmortem**. Distinct from Phase 11 `retrospective` (after-action, multi-incident, sprint/iteration scope) — this skill is for the active or just-concluded single incident.

Five outputs across the incident lifecycle: timeline (live), mitigation actions, postmortem, runbook codification, ops-deltas. The runbook entry feeds future incidents (search-first reduces MTTR). The postmortem feeds Phase 11 retrospective. The ops-deltas forward-carry for product-evolution / immediate-corrective-action.

## When to Use (Proactive Triggers)

1. Pager-duty / SLO-breach alert fires (skill auto-invoked by alert routing if wired)
2. User-reported incident ("X is broken in production")
3. User says "incident on X" / "open an incident" / "we have an outage"
4. Post-mitigation — to codify runbook + write postmortem
5. Pattern-match on existing incident (similar slug / same component) — cross-reference priors

## Output Artifacts

1. **Incident timeline** at `_context/audit/incident-{slug}-{date}-timeline.md` — append-only during incident: detected_at, alert_source, first_responder, hypothesis_1, action_1, observation_1, ..., mitigated_at, resolved_at
2. **Postmortem** at `_context/audit/incident-{slug}-{date}-postmortem.md` — structured: summary, impact (users + duration + revenue if applicable), timeline (clean version), root cause, contributing factors, what-went-well, what-didn't, action-items
3. **Runbook entry** at `_context/operations/runbooks/{slug}.md` — codified resolution steps for next time (search-first shortcut)
4. **Ops-deltas** at `_context/handoffs/phase-10-ops-deltas-wip-{date}.md` (per `schemas/handoffs/ops-delta.schema.json`) — if user-impact significant or repeat pattern, forward-carry to Phase 11 retrospective
5. **Action-items list** — assignable items for @developer / @qa / @architect / @pm depending on root-cause class

## Prerequisites

- An active or just-concluded incident (skill is invoked, not pro-actively run)
- For pattern matching: prior `_context/audit/incident-*-postmortem.md` files searchable
- For impact assessment: `observability-v{latest}.md` SLO definitions (computes blast radius vs. SLO)

## Process

→ See [workflow.md](workflow.md) for full process. **Phase-aware**: skill behaves differently in three sub-modes.

### Sub-mode A — In-flight (incident active)

1. Initialise timeline file with detected_at + alert_source + on-call responder
2. Search prior incidents for matching slug/component → surface "have we seen this before?"
3. Suggest hypotheses ranked by recent-deploy correlation + alert pattern + similar-incident base rates
4. Each action taken: append to timeline (action + expected_outcome + actual_observation)
5. On mitigation: log mitigated_at; on full resolution: log resolved_at

### Sub-mode B — Post-mitigation (write postmortem)

6. Compile clean timeline from append-only log (deduplicate; remove debug-noise)
7. Author postmortem template fields: summary, impact (users / duration / SLO-burn), root cause, contributing factors, what-went-well, what-didn't, action-items
8. Cross-reference: did a recent deploy (`deploy-log-v{N}.md`) correlate? Was an existing alert insufficient?

### Sub-mode C — Codify (runbook + ops-deltas)

9. Extract resolution steps → `runbooks/{slug}.md` (so next responder finds answer in 30s, not 30min)
10. Decide ops-delta disposition per `ops-delta.schema.json`:
    - `immediate_corrective_action` — already done in Sub-mode A; no further work
    - `accept_into_phase_11_retrospective` — pattern needs root-cause analysis at iteration close
    - `accept_into_phase_11_product_evolution` — bug or UX-friction surfaced; backlog item for next iteration
    - `park_for_phase_11` — pattern unclear; revisit later
11. Append delta to phase-10-ops-deltas-wip-{date}.md

## Activation-Gate Checklist

- [ ] Timeline file initialised at incident detection
- [ ] All actions during incident logged with timestamp + observation
- [ ] mitigated_at and resolved_at set before postmortem
- [ ] Postmortem fields all filled (no `TBD` in summary / root_cause / action-items)
- [ ] Runbook entry written if resolution is reproducible
- [ ] Ops-delta disposition chosen + appended to WIP log
- [ ] Action-items have owner agents assigned

## Output

Five artefacts across incident lifecycle. Postmortem feeds Phase 11 retrospective. Runbook reduces MTTR for similar future incidents. Ops-delta forward-carries to Phase 11 reconciliation per the forward-carry quartet.

## Distinction from `retrospective` (Phase 11)

| Aspect | This skill | retrospective |
|---|---|---|
| Phase | 10 (in-flight + post-mitigation) | 11 (iteration close) |
| Scope | Single incident | All ops-deltas + multi-incident pattern analysis |
| Owner | @devops | @reviewer |
| Trigger | Alert / user report | User-invoked iteration end |
| Output | Timeline + postmortem + runbook + ops-delta | Cross-incident retrospective + product-evolution backlog |

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `incident-response` and `incident-commander` skills. Implementation original to coldpress-os; complements existing `correct-course` (Phase 10) + integrates with forward-carry quartet via ops-delta schema.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U12) | Initial incident-response skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). Three sub-modes (in-flight / post-mitigation / codify); distinct from Phase 11 retrospective. |
