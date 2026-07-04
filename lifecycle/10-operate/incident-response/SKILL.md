---
name: "incident-response"
description: "Drive incident from detection to resolution to postmortem. Distinct from retrospective (Phase 11): incident-response is in-flight (Phase 10 mid-incident); retrospective is after-action across many incidents. Emits incident-runbook + postmortem doc + ops-deltas (if user-impact / repeat-pattern)."
type: "workflow"
category: "lifecycle"
phase: 10
agent: "devops"
license: "MIT"
version: "1.2"
updated: "2026-07-03"
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
6. **CVE high/critical from `ops-check`** — a re-scan of the shipped lockfile that surfaces a high+ advisory **auto-creates an incident** (WS8)

## Output Artifacts

1. **Incident timeline** at `_context/audit/incident-{slug}-{date}-timeline.md` — append-only during incident: detected_at, alert_source, first_responder, hypothesis_1, action_1, observation_1, ..., mitigated_at, resolved_at
2. **Postmortem — forensic case-file shape** at `_context/audit/incident-{slug}-{date}-postmortem.md` (D10 adopt 4a). The postmortem is authored as a **case file**, not a narrative, so a later reader (or `coldpress evolve`) can audit the reasoning as evidence, not recollection:
   - **Case header** — `case_id` (= incident slug + date), `classification` (failure-taxonomy class from `data/failure-taxonomy.yaml`), `severity`, `status` (open / resolved / monitoring), `first_responder`, `blast_radius` (users + duration + SLO-burn + revenue if applicable).
   - **Evidence register** — a numbered table `[E1, E2, …]` with, per row: `evidence_id`, `source` (log line / dashboard panel / deploy-log entry / alert payload / graph node), `collected_at`, `link_or_path`, `what_it_shows`. This is the chain-of-custody: every downstream claim cites an `E#`.
   - **Hypotheses ledger** — every hypothesis considered, each marked `confirmed` / `rejected` / `inconclusive` **with the evidence id(s) that decided it**. Rejected hypotheses stay in the file (they're the forensic value — they stop the next responder re-walking a dead end).
   - **Root-cause determination** — the confirmed cause, stated as a finding that cites its evidence (`root cause: X, per E3 + E7`). Contributing factors likewise cited.
   - **Findings & action-items** — what-went-well / what-didn't, then assignable action-items (owner agent + the `E#` that motivates each).
3. **Runbook entry** at `_context/operations/runbooks/{slug}.md` — codified resolution steps for next time (search-first shortcut)
4. **Ops-deltas** at `_context/handoffs/phase-10-ops-deltas-wip-{date}.md` (per `schemas/handoffs/ops-delta.schema.json`) — if user-impact significant or repeat pattern, forward-carry to Phase 11 retrospective
5. **Action-items list** — assignable items for @developer / @verifier / @architect / @pm depending on root-cause class
6. **Failure-taxonomy tag** (WS8 → WS7 loop) — the postmortem tags the root cause with a `data/failure-taxonomy.yaml` class id (e.g. `secret-exposure`, `hidden-dependency`, `schema-violation`). The tag rides the ops-delta / run-log so **`coldpress evolve`** counts it and the **valet-loop** can turn a recurring incident into a golden eval + fix. Every incident must also add a **pinning test** before its fix merges (test-integrity).

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
7. **Assemble the forensic case-file** (not a prose narrative): build the **evidence register** first (each artefact you actually looked at becomes a numbered `E#` with source + link + what-it-shows), then the **hypotheses ledger** (every hypothesis confirmed/rejected/inconclusive, each citing the `E#`(s) that decided it — rejected ones stay in), then the **root-cause determination** stated as an evidence-cited finding. Author the case header (case_id, classification, severity, status, blast_radius) up top.
8. Cross-reference as evidence: did a recent deploy (`deploy-log-v{N}.md`) correlate? — capture it as an `E#`, not a sentence. Was an existing alert insufficient? — that's a finding with an owner.

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
- [ ] Case-file assembled: header + evidence register (≥1 `E#`) + hypotheses ledger (every hypothesis dispositioned) + root-cause determination
- [ ] Root cause and every action-item cite the evidence id(s) that support them (no uncited claims)
- [ ] Rejected hypotheses retained in the file (not deleted)
- [ ] Postmortem fields all filled (no `TBD` in header / root_cause / action-items)
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
| 1.2 | 2026-07-03 | Butler (v0.4 D10 adopt 4a — BMAD forensic case-file) | Postmortem reshaped from prose narrative into a **forensic case-file**: case header (case_id / classification / severity / status / blast_radius) + numbered **evidence register** (chain-of-custody `E#` per artefact) + **hypotheses ledger** (every hypothesis confirmed/rejected/inconclusive citing the deciding `E#`; rejected ones retained) + evidence-cited **root-cause determination**. Sub-mode B steps 7–8 + activation-gate checklist updated to enforce uncited-claim-free, evidence-first authoring. Makes incident reasoning auditable by `coldpress evolve` / valet-loop, not recollected. |
| 1.1 | 2026-07-03 | Butler (v0.4 WS8) | Wired into the WS7/WS8 loop: (6th trigger) CVE high+ from `ops-check` **auto-creates an incident**; (6th output) the postmortem carries a **failure-taxonomy tag** (`data/failure-taxonomy.yaml`) that rides the ops-delta/run-log → `coldpress evolve` counts it + the valet-loop can graduate a recurring incident into a golden eval; every incident adds a pinning test before its fix merges. |
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U12) | Initial incident-response skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). Three sub-modes (in-flight / post-mitigation / codify); distinct from Phase 11 retrospective. |
