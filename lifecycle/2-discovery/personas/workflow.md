---
workflow_version: "1.0"
output_file: "_context/planning/research/personas-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Produces user archetypes with journey maps and accessibility/device/locale targets. Uses four discipline-specific design-thinking and innovation methods as mandatory sub-routines — not optional router invocations — because personas without them isn't really doing personas.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-archetype-extraction.md](steps/step-01-archetype-extraction.md) | Extract 2-3 user archetypes using User Interviews + Empathy Mapping + Jobs to be Done |
| 2 | [step-02-journey-map.md](steps/step-02-journey-map.md) | Map the primary archetype's journey using Journey Mapping + Diary Studies |
| 3 | [step-03-accessibility-targets.md](steps/step-03-accessibility-targets.md) | Capture WCAG / device / locale / offline targets with rationale |
| 4 | [step-04-synthesize.md](steps/step-04-synthesize.md) | Synthesise using Affinity Clustering; flag primary archetype; write the final doc |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Tier 1 methods are mandatory** — do not skip User Interviews / Empathy Mapping / JTBD / Journey Mapping / Diary Studies / Affinity Clustering.
4. **State is tracked** in the output document's YAML frontmatter.
5. **Resumable.** On interruption, resume from the last completed step.
6. **User input required** for archetype confirmation, primary-flag, and accessibility/locale targets.

## Completion Criteria

- 2-3 archetype profiles produced with empathy-map content
- Each archetype has a clear jobs-to-be-done statement
- Primary archetype flagged
- At least one journey map per primary archetype
- Accessibility (WCAG level), device, and locale targets captured with rationale
- Output doc written to `_context/planning/research/personas-{date}.md`
