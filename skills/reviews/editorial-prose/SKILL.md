---
name: "editorial-prose"
description: "Clinical copy-editor that reviews text for communication issues impeding comprehension"
type: "simple"
category: "reviews"
status: "wire-in-phase-2 wire-in-phase-4"
phases: [2, 4, 5, 6, 7, 8, 9, 11]
inputs:
  - "text content to review"
outputs:
  - artifact: "Editorial Prose Review"
    location: "_context/audit/reviews/editorial-prose-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Acts as a clinical copy-editor using the Microsoft Writing Style Guide as baseline. Reviews text for communication issues that impede reader comprehension — not style preferences, but genuine clarity problems.

## When to Use

- "review this text for clarity"
- "copy-edit this document"
- "editorial review prose"
- When documentation or user-facing text needs polish before publishing
- When text feels unclear but you can't pinpoint why

## Prerequisites

- Text content to review (minimum 3 words)
- Optional: `style_guide` — additional style rules beyond Microsoft baseline
- Optional: `reader_type` — "humans" (default) or "llm" (for AI-consumed docs)

## Process

1. **Receive and validate content.** Accept the text. If fewer than 3 words, halt — insufficient content for meaningful review.

2. **Determine reader type.** Default to human readers unless `reader_type: llm` is specified. This affects which issues to flag:
   - **Human readers:** Flag jargon density, sentence length, passive voice, ambiguous pronouns, buried ledes
   - **LLM readers:** Flag ambiguous instructions, undefined terms, implicit context, contradictory statements

3. **If custom `style_guide` provided**, read and internalize those rules. They override the Microsoft baseline where they conflict.

4. **Perform editorial review.** Scan the full text for:
   - Ambiguous pronoun references
   - Sentences exceeding 25 words without clear structure
   - Passive voice where active would be clearer
   - Jargon or acronyms used without definition
   - Redundant phrases ("in order to" → "to")
   - Buried key information (important facts in subordinate clauses)
   - Inconsistent terminology (same concept, different words)
   - Unclear antecedents or referents
   - Missing transitions between ideas
   - Nominalizations hiding the action ("implementation of" → "implement")

5. **Output findings** as a three-column table:

   | Original Text | Revised Text | Changes |
   |---------------|-------------|---------|
   | exact quote | suggested revision | what changed and why |

6. If no issues found, output: **"No editorial issues identified."**

## Output

A three-column comparison table showing original text, revised text, and explanation of changes. Or a clean bill of health if no issues found.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-editorial-review-prose, adapted to coldpress-os schema |
