---
name: validate-prd
description: "Validate existing PRD against quality standards. Two modes: full (default — six-dimension sweep) and sections (targeted re-validation of named sections, used by the lightweight-amendment path that downstream phases trigger when delta reconciliation lands a PRD edit)."
license: MIT
compatibility: Invoked by @pm in Phase 4
version: "1.2"
---

## Purpose

Validates an existing PRD against quality standards. Reads the PRD and checks for completeness, internal consistency, testability of requirements, alignment with context.md and tech-stack.md, and overall readiness for implementation.

## When to Use

**Full mode (default):**
- "validate PRD"
- "check the PRD"
- "is the PRD ready?"
- After create-prd produces a PRD
- Before proceeding to Phase 5 (Design)
- Whenever the PRD has been significantly edited

**Sections mode (`--sections=<list>`):**
- Phase 5 → 6 design-deltas reconciliation: user accepts a delta into the PRD; the affected sections need re-validation only.
- Phase 7 architecture-deltas reconciliation (first real consumer): user accepts an architecture-surfaced PRD gap; affected sections re-validate.
- Phase 8 implementation-deltas amendment loop: spec gap surfaced during implementation gets accepted into PRD; section-scoped re-validation only.
- Any post-Phase-4 lightweight amendment loop where a full re-sweep would be wasteful.

## Prerequisites

- `_context/sacred/prd.md` exists
- `_context/sacred/context.md` available for alignment check
- `_context/sacred/tech-stack.md` available for feasibility check

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

- **Full mode:** `_context/planning/prd-validation-{date}.md` — validation report with section-by-section assessment, issues found, and recommendations.
- **Sections mode:** `_context/planning/prd-validation-amendment-{date}.md` — lightweight amendment validation. Contains: sections re-validated, dependency anchors checked, six-dimension scores scoped to sections, pass/fail per section, recommendation to merge into PRD as v(N+1) or block. Conforms to `schemas/sacred-docs/prd-amendment.schema.json`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2 | 2026-05-02 | Andy-coldpress-os (autonomous queue unit #21c) | Added `--sections=<list>` flag for lightweight section-scoped re-validation (audit punch-list #5 — first real consumer is Phase 7 breakdown-entry-sync architecture-deltas reconciliation; also used by Phase 5 → 6 design-deltas reconciliation and any post-Phase-4 amendment loop). Two modes: full (default; preserves prior behaviour) and sections (new). Sections mode emits `prd-validation-amendment-{date}.md` instead of full report; conforms to prd-amendment schema. New step-04-sections-mode.md authored. |
| 1.1 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 2. Graph-first inputs block. prd.meta.json existence check added. |
| 1.0 | 2026-04-08 | Alfred | Initial validate-prd skill definition |
