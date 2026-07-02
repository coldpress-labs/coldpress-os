---
name: "observability-designer"
description: "Design the observability surface for a deploy: SLOs/SLIs, alerts, dashboards, log retention, trace sampling. Wraps the existing observability-setup.md doc into an interactive skill that emits a per-deploy observability spec."
type: "workflow"
category: "lifecycle"
phase: 9
agent: "devops"
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "ArchitectureComponent nodes (NFR targets)"
    - "Baseline nodes (observability-axis)"
  cold_file_reads:
    - "_context/sacred/architecture.md"
    - "_context/handoffs/phase-8-to-9-{date}.md"
    - "coldpress.yaml (baselines.observability)"
    - "coldpress-os/docs/observability-setup.md"
  existence_checks:
    - "_context/sacred/architecture.md (NFRs section)"
    - "coldpress.yaml baselines.observability defined"
outputs:
  - artifact: "Observability spec"
    location: "_context/operations/observability-v{N}.md"
    format: "markdown"
    sacred: false
    schema_ref: null
  - artifact: "Alert / dashboard config drafts"
    location: "_context/operations/observability-config-v{N}/"
    format: "yaml"
    sacred: false
---

## Purpose

Phase 9 design step that turns NFR targets (architecture.md) + baseline policy (coldpress.yaml) into a concrete observability spec for the about-to-deploy version. Emits SLOs, SLIs, alerts, dashboards, log retention, trace sampling rules. Drafts vendor-neutral; deferred to user to wire into chosen backend (Honeycomb / Datadog / OTEL collector / etc.).

## When to Use (Proactive Triggers)

1. Phase 9 entry — once per deploy, before `deploy` skill runs
2. User says "design observability" / "set up SLOs" / "draft alerts"
3. NFR change in architecture.md (incremental observability re-design)
4. Post-incident — design new alert(s) from incident-response runbook output

## Output Artifacts

1. **Observability spec** at `_context/operations/observability-v{N}.md` — SLO table (per service / endpoint) + SLI definitions + alert thresholds + dashboard layout + log retention + trace sampling
2. **Alert config drafts** at `_context/operations/observability-config-v{N}/alerts.yaml` — vendor-neutral alert definitions (name, condition, threshold, severity, routing)
3. **Dashboard drafts** at `_context/operations/observability-config-v{N}/dashboards.yaml` — panel layout (vendor-neutral; can compile to Grafana JSON / Datadog YAML downstream)
4. **Trace sampling spec** at `_context/operations/observability-config-v{N}/sampling.yaml` — head-based + tail-based rules (e.g., 100% on errors, 1% on success)

## Prerequisites

- `_context/sacred/architecture.md` has NFR section (latency / throughput / availability targets)
- `coldpress.yaml` has `baselines.observability` block (log retention policy, alert routing destinations, OTEL endpoint if any)
- `coldpress-os/docs/observability-setup.md` is the underlying reference doc

## Process

→ See [workflow.md](workflow.md) for the full 5-step process.

1. **Step 1 — Read NFR targets** from architecture.md; baseline policy from coldpress.yaml
2. **Step 2 — Derive SLOs/SLIs** per service/endpoint (latency-95th, error-rate, availability, saturation)
3. **Step 3 — Draft alerts** from SLO breach conditions (multi-window multi-burn-rate alerts; not single-threshold)
4. **Step 4 — Draft dashboards** (golden-signals layout: latency / traffic / errors / saturation)
5. **Step 5 — Emit spec + configs** to `_context/operations/observability-v{N}.*`

## Activation-Gate Checklist

- [ ] Every architecture component with public-facing surface has at least one SLO
- [ ] Every SLO has at least one alert with multi-window multi-burn-rate condition
- [ ] Log retention policy aligns with `baselines.observability` setting
- [ ] Trace sampling rules cover both head-based (operations) and tail-based (errors)
- [ ] Vendor-neutral output — no Honeycomb/Datadog-specific syntax in spec
- [ ] User confirms spec before deploy proceeds

## Output

Observability spec + alert/dashboard/sampling config drafts at `_context/operations/observability-v{N}*`. User wires into chosen vendor backend post-skill (Phase 10 operate). Pre-deploy gate (`readiness`) verifies spec exists; does not verify wiring.

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `observability-designer` skill. Wraps coldpress-os's existing `coldpress-os/docs/observability-setup.md` reference into an interactive workflow. Implementation original.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U03) | Initial observability-designer skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). |
