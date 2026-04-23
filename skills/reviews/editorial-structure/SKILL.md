---
name: "editorial-structure"
description: "Structural editor that proposes cuts, merges, and reorganization for high-value density"
type: "simple"
category: "reviews"
phases: [2, 4, 5, 8]
inputs:
  - "document content to review"
outputs:
  - artifact: "Structural Review"
    location: "_context/reviews/editorial-structure-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Acts as a structural editor focused on maximizing value density and brevity. Evaluates document organization, identifies sections that should be cut, merged, moved, or condensed, and proposes reorganization for maximum impact.

## When to Use

- "review the structure of this document"
- "is this document well organized?"
- "editorial review structure"
- When a document feels too long or poorly organized
- Before publishing documentation that needs to be scannable and efficient

## Prerequisites

- Document content to review
- Optional: `purpose` — what the document is trying to accomplish
- Optional: `target_audience` — who will read this
- Optional: `reader_type` — "humans" (default) or "llm"
- Optional: `length_target` — desired word count or reduction percentage

## Process

1. **Receive content and parameters.** Accept the document and any optional context about purpose, audience, and length targets.

2. **Determine reader type** and select structural model:

   **Human-reader principles:**
   - Visuals: scannable headers, bullet lists, tables over prose
   - Engagement: front-load key information, use progressive disclosure
   - Flow: logical narrative arc, clear section transitions

   **LLM-reader principles:**
   - Precision: unambiguous section boundaries, explicit relationships
   - Density: no filler, every sentence carries information
   - Structure: consistent formatting, predictable patterns

3. **Select structural model** based on document type:
   - **Tutorial** — Step-by-step learning progression
   - **Reference** — Lookup-optimized, alphabetical or categorical
   - **Explanation** — Conceptual narrative, builds understanding
   - **Prompt/Task** — Instruction-optimized, clear directives
   - **Strategic/Context** — Decision-support, trade-offs and rationale

4. **Analyze document structure.** Evaluate:
   - Section-level organization and hierarchy
   - Information density per section
   - Redundancy across sections
   - Missing sections for the structural model
   - Sections that violate the document's own stated purpose
   - Ordering logic (chronological, priority, dependency, alphabetical)

5. **Generate recommendations** as prioritized list. Each recommendation includes:
   - **Action** — CUT, MERGE, MOVE, CONDENSE, QUESTION, or PRESERVE
   - **Target** — Which section(s)
   - **Rationale** — Why this change improves the document
   - **Estimated word savings** — How much shorter the document becomes

6. **Output summary** with:
   - Document overview (current word count, section count, structural model)
   - Prioritized recommendations
   - Projected word count after all changes
   - Top 3 highest-impact changes to make first

## Output

A structural review document with document summary and prioritized structural recommendations with estimated impact.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-editorial-review-structure, adapted to coldpress-os schema |
