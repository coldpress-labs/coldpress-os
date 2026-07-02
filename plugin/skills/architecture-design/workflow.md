---
workflow_version: "2.0"
output_file: "_context/sacred/architecture.md"
total_steps: 7
resume_from: "frontmatter"
---

## Overview

Phase 6 architecture authoring. Reads PRD + UX-spec + brand-guidelines + tech-stack + flagged-deltas from Phase 5 handoff; produces sacred architecture document + sidecar + ADRs (incl. REQUIRED ADRs for flagged deltas).

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + staleness check + existence_checks (NEW) |
| 1 | [step-01-flagged-deltas-intake.md](steps/step-01-flagged-deltas-intake.md) | Consume `architecture_adrs_required[]` from phase-5-to-6 handoff; queue required ADRs (NEW — silent-divergence guard) |
| 2 | [step-02-overview.md](steps/step-02-overview.md) | System overview + component identification (brainstorming + design-thinking + advanced-elicitation Tier-1) |
| 3 | [step-03-data-flow.md](steps/step-03-data-flow.md) | Data flow + integration boundaries + supersede-check on UX-flow + tech-stack imports |
| 4 | [step-04-nfr.md](steps/step-04-nfr.md) | NFR implementation strategy (a11y / perf / SEO / observability) — baselines + persona scale + idea-validation riskiest-assumptions driven |
| 5 | [step-05-adr.md](steps/step-05-adr.md) | ADR authoring — organic ADRs PLUS REQUIRED ADRs for flagged deltas (each with `resolves_design_delta` field) |
| 6 | [step-06-emit.md](steps/step-06-emit.md) | architecture.md emit + sidecar + adversarial-review + editorial |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Step 1 is CRITICAL** — silent-divergence guard. Phase 6 cannot exit without flagged-delta ADRs.
3. **Halt at user-input prompts** (architectural choices, ADR decisions).
4. **Partial-completion mechanic** active in every step.
5. **Graph-first.** Step 0 loads; subsequent steps consult graph for derived facts.
6. **Sacred-doc supersede-check.** Step 6 emit runs supersede-check on full architecture.md vs (PRD, UX-spec, tech-stack, brand-guidelines).
7. **Architecture-deltas (forward-carry).** If Phase 6 surfaces PRD/UX gaps, surface as `architecture_delta` in handoff log; route through reconciliation pass at Phase 6 exit (mechanism deferred — see SKILL.md).

## Outputs

- `_context/sacred/architecture.md` (sacred; supersede-check governed)
- `_context/sacred/architecture.meta.json` (sidecar; schema-validated)
- `_context/planning/adrs/adr-NNN-*.md` (multiple; includes REQUIRED ADRs for flagged deltas)
