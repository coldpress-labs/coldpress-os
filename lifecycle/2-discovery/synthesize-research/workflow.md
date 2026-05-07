---
workflow_version: "1.0"
output_file: "_context/planning/research-synthesis-v{N}.md"
total_steps: 4
resume_from: "frontmatter"
versioned: true
---

## Overview

Consolidates Phase 2 research + validation into a single versioned synthesis artefact. Four steps: consolidate → identify tensions → distil → critique. The output feeds `product-brief` directly and becomes a graph node Phase 3 and Phase 4 can query.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-consolidate.md](steps/step-01-consolidate.md) | Load all Phase 2 research + validation inputs; extract raw findings |
| 2 | [step-02-identify-tensions.md](steps/step-02-identify-tensions.md) | Themes + tensions using Systems Thinking + Morphological Analysis |
| 3 | [step-03-distil.md](steps/step-03-distil.md) | Invoke `distillator` — compress to LLM-optimised form |
| 4 | [step-04-critique.md](steps/step-04-critique.md) | `adversarial-review` + `editorial-structure`; optional party-mode; write versioned output |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Tier 1 methods are mandatory** in Step 2 — don't skip Systems Thinking or Morphological Analysis.
4. **Utility wire-ins run as invocations**, not inline — Steps 3 and 4 hand off to dedicated skills then resume.
5. **Output is versioned.** Never overwrite `v{N}`. Always produce `v{N+1}` on re-run.
6. **Party-mode is opt-in only** — Butler proposes, user confirms. Never auto-run.

## Completion Criteria

- Themes surfaced (3-7 cross-cutting patterns)
- Tensions explicitly flagged with resolution owner (Phase 3 stack / Phase 4 arch / Phase 4 UX)
- Convergent + divergent signals separated
- `distillator` pass complete
- `adversarial-review` + `editorial-structure` passes complete
- Output written to `_context/planning/research-synthesis-v{N}.md` with schema-valid frontmatter

## Versioning logic

Before writing, Butler checks `_context/planning/` for existing `research-synthesis-v*.md` files:
- No prior versions → write `research-synthesis-v1.md`
- Latest is `v{N}` → write `research-synthesis-v{N+1}.md`
- Never overwrite, never append to a prior version
