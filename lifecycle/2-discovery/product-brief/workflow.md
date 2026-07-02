---
workflow_version: "3.0"
output_file: "_context/planning/product-brief-v{N}.md"
total_steps: 5
resume_from: "frontmatter"
versioned: true
---

## Overview

Consolidates Phase 2 research into a versioned synthesis, then creates a concise 1-2 page executive product brief through four further phases: understanding intent, contextual discovery, drafting, and review. Supports Guided (default), Autonomous (-A), and Yolo (--yolo) activation modes for Steps 2-5.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-synthesize-research.md](steps/step-01-synthesize-research.md) | Consolidate all Phase 2 research + validation into a versioned `research-synthesis-v{N}.md` (themes, tensions, convergent/divergent signals) |
| 2 | [step-02-intent.md](steps/step-02-intent.md) | Understand why user is here, detect brief type |
| 3 | [step-03-discover.md](steps/step-03-discover.md) | Contextual discovery from existing docs + user interview |
| 4 | [step-04-draft.md](steps/step-04-draft.md) | Draft the product brief |
| 5 | [step-05-review.md](steps/step-05-review.md) | Review, refine, finalize, offer distillate |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Tier 1 methods are mandatory** in Step 1 — don't skip Systems Thinking or Morphological Analysis.
4. **Halt at menus.** When a step presents options, wait for user input.
5. **No skipping.** Every step exists for a reason.
6. **State is tracked** in the output document's YAML frontmatter.
7. **Resumable.** On interruption, resume from the last completed step.
8. **User input required.** Never generate content without user confirmation or input.
9. **Both outputs are versioned.** Step 1 never overwrites a prior `research-synthesis-v{N}.md`; Step 5 never overwrites a prior `product-brief-v{N}.md`. Re-running the skill (e.g., after new research lands) produces `v{N+1}` for both.

## Completion Criteria

- Research synthesized into themes, tensions, and convergent/divergent signals (Step 1)
- Product vision and strategy clearly articulated
- Target users and value proposition defined
- Key features and success metrics captured
- Brief is 1-2 pages, executive-readable
- User has approved the final brief

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 1.3 — four-step Intent/Discover/Draft/Review workflow. |
| 3.0 | 2026-07-02 | Butler | Absorbed `synthesize-research`'s 4 steps into one new Step 1 (WS5-B, §8 item 6). Total steps 4 → 5. |
