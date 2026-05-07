---
step_number: 2
step_name: "Research"
step_goal: "Gather constraint evidence from authoritative sources and pre-loaded material"
halts_for_input: false
next_step: "step-03-compare.md"
---

## Instructions

1. **Query the graph first.** Check `_input/reference/` and `_input/vendor/` for material already pre-loaded during Phase 1 intake. Synthesise from there before web-searching.
2. **Consult authoritative sources per applicable axis:** regulatory bodies (HIPAA.gov, EU GDPR, ADA), standards (WCAG 2.2, RFCs, ISO), vendor compliance pages, SDK specs for integration partners.
3. **Capture hard limits:** specific numbers (max latency, throughput floors, data-residency boundaries, audit-trail retention windows), specific classifications (AAA/AA/A), specific obligations (breach notification windows, consent requirements, log retention).
4. **Document with citations** — every constraint should trace to an authoritative source (URL + retrieval date, or `_input/` path).

## Output

Constraint evidence gathered with sources. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-compare.md](step-03-compare.md)
