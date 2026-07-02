---
workflow_version: "2.0"
output_pattern: "_context/implementation/stories/story-NNN-<slug>-v{N}.md"
output_index: "_context/implementation/stories-index.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Phase 7 story authoring. Per-archetype granularity. Per-story files + index.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + existence_checks |
| 1 | [step-01-select.md](steps/step-01-select.md) | Per-epic story selection + archetype-conditional granularity decision |
| 2 | [step-02-analyze.md](steps/step-02-analyze.md) | Per-story analysis: file scope + test coverage + acceptance criteria (BDD or AC per archetype) + UX-screen + brand-tokens + prototype-manifest refs |
| 3 | [step-03-context.md](steps/step-03-context.md) | Per-story write to `_context/implementation/stories/story-NNN-<slug>-v{N}.md`; story_types Tier-1 |
| 4 | [step-04-finalize.md](steps/step-04-finalize.md) | Stories-index emit; supersede-check on PRD/UX/architecture coverage; editorial; emit distillates |

## Execution Rules

1. **Per-story files** (not monolithic).
2. **Archetype-conditional** granularity at Step 1.
3. Halt at user prompts (story shape).
4. Partial-completion per story.
5. Supersede-check on coverage at Step 4.

## Outputs

- `_context/implementation/stories/story-NNN-<slug>-v{N}.md` (multiple — one per story)
- `_context/implementation/stories-index.md` (index)
