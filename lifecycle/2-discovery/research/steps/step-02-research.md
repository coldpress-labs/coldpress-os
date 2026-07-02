---
step_number: 2
step_name: "Execute Research"
step_goal: "Gather findings from verified sources, per focus"
halts_for_input: false
next_step: "step-03-synthesize.md"
---

## Goal

Gather information from reliable sources — web search, plus any pre-loaded `_input/` material already scoped in Step 1.

## Instructions

### §Domain

1. **Search** for domain-specific information using web search.
2. **Verify sources** — prefer official publications, research papers, industry reports.
3. **Cover key areas:** industry overview, key players, trends, regulations, terminology, market size.
4. **Document citations** for every factual claim.

### §Market

1. **Research competitors:** features, pricing, positioning, strengths/weaknesses.
2. **Research market:** size, growth, trends, customer segments.
3. **Research customers:** needs, pain points, buying behavior, reviews.
4. **Document with citations.**

### §Constraints

1. **Consult authoritative sources per applicable axis:** regulatory bodies (HIPAA.gov, EU GDPR, ADA), standards (WCAG 2.2, RFCs, ISO), vendor compliance pages, SDK specs for integration partners.
2. **Capture hard limits:** specific numbers (max latency, throughput floors, data-residency boundaries, audit-trail retention windows), specific classifications (AAA/AA/A), specific obligations (breach notification windows, consent requirements, log retention).
3. **Document with citations** — every constraint should trace to an authoritative source (URL + retrieval date, or `_input/` path).

### All foci — depth modulation

At `depth: standard`, cover the primary axes/areas listed above at moderate thoroughness (enough sources to support each claim, not exhaustive). At `depth: deep`, widen source count, actively cross-check conflicting claims across sources, and note where evidence is thin rather than papering over gaps.

**Write findings as you go** — append to the output document; don't hold everything for Step 3.

## Output

Raw findings documented with citations. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-synthesize.md](step-03-synthesize.md)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 to 2026-04-24 | Alfred, Cadbury-hq | Original per-skill Step 2s. |
| 2.0 | 2026-07-02 | Butler | Merged into `research` Step 2 with focus branches + `depth` modulation (WS5-B, §8 item 6). |
