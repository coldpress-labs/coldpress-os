---
step_number: 4
step_name: "Generate Report"
step_goal: "Finalize and present the research report (domain/market) or binding constraint envelope (constraints)"
halts_for_input: true
next_step: "complete"
---

## Goal

Produce the final document, in whichever shape the selected `focus` calls for.

## Instructions

### §Domain

1. **Structure the report:** Executive Summary, Industry Overview, Key Findings, Implications for Project, Terminology, Sources.
2. Write to `_context/planning/research/domain-{topic}-{date}.md`.

### §Market

1. **Structure the report:** Executive Summary, Competitive Landscape, Market Sizing, Customer Segments, Positioning Opportunity, Sources.
2. Write to `_context/planning/research/market-{topic}-{date}.md`.

### §Constraints

1. **Structure the envelope:** Summary · Scope & axes · Blocking constraints (source + downstream impact) · Preferred constraints · Aspirational targets · Conflicts flagged for Phase 3 · Sources.
2. **Present to user** — confirm severity tagging and flagged conflicts before writing. User may override severities for project-specific context.
3. Write to `_context/planning/research/constraint-{topic}-{date}.md`. Phase 3 stack evaluation will honour the blocking set.

### All foci

**Present to user** for review before considering the workflow complete.

## Output

Domain research report, market research report, or binding constraint envelope, matching `focus`. Workflow complete.

## Navigation

→ Workflow complete. Recommend `personas` (if not already run) and `validate-idea` next in the Phase 2 flow; `product-brief` (Step 1) consolidates all research last.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 to 2026-04-24 | Alfred, Cadbury-hq | Original per-skill Step 4s (`domain-research`/`market-research` "Generate Report", `constraint-research` "Report Binding Envelope"). |
| 2.0 | 2026-07-02 | Butler | Merged into `research` Step 4 with focus branches (WS5-B, §8 item 6). Navigation updated to point at `product-brief` (which absorbed `synthesize-research`, WS5-B batch 2) rather than the deleted `synthesize-research`. |
