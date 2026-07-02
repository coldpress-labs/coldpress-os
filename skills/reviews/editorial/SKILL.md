---
name: "editorial"
description: "Editorial review in two passes — prose (clinical copy-edit for comprehension) and structure (cuts/merges/reorganization for value density). Select with pass: prose|structure|both."
type: "simple"
category: "reviews"
status: "wire-in-phase-2 wire-in-phase-3 wire-in-phase-4"
phases: [2, 3, 4, 5, 6, 7, 8, 9, 11]
inputs:
  - "text or document content to review"
outputs:
  - artifact: "Editorial Review"
    location: "_context/audit/reviews/editorial-{date}.md"
    format: "markdown"
version: "2.0"
---

## Purpose

Editorial review for any framework or user-facing text, in two complementary passes:

- **`prose`** — a clinical copy-editor (Microsoft Writing Style Guide baseline) that flags communication issues impeding comprehension — genuine clarity problems, not style preferences.
- **`structure`** — a structural editor that maximizes value density and brevity: which sections to cut, merge, move, or condense, and how to reorganize for impact.

One skill, two passes — select with the `pass` parameter.

## When to Use

- "review this text for clarity" / "copy-edit this document" → `pass: prose`
- "is this document well organized?" / "review the structure" → `pass: structure`
- "editorial review" (unspecified) → `pass: both` (default — structure first, then prose on the reorganized result)
- Documentation or user-facing text needs polish before publishing.

## Prerequisites

- Text/document content to review (prose pass: minimum 3 words).
- Optional: `pass` — `prose` | `structure` | `both` (default `both`).
- Optional: `reader_type` — `humans` (default) or `llm` (AI-consumed docs).
- Optional (prose): `style_guide` — additional rules beyond the Microsoft baseline.
- Optional (structure): `purpose`, `target_audience`, `length_target`.

## Process

Run the passes selected by `pass`. When `both`, run **structure first** (reorganize), then **prose** on the result (polish the final wording).

### Pass A — Structure (`pass: structure|both`)

1. **Receive content and parameters** (purpose, audience, length targets).
2. **Determine reader type** and select structural model:
   - **Human-reader principles:** scannable headers, bullets/tables over prose; front-load key info, progressive disclosure; logical narrative arc + clear transitions.
   - **LLM-reader principles:** unambiguous section boundaries + explicit relationships; no filler (every sentence carries information); consistent, predictable formatting.
3. **Select structural model** by document type: Tutorial (step-by-step), Reference (lookup-optimized), Explanation (conceptual narrative), Prompt/Task (instruction-optimized), Strategic/Context (decision-support).
4. **Analyze structure:** section organization/hierarchy; information density per section; cross-section redundancy; missing sections for the model; sections violating the stated purpose; ordering logic.
5. **Generate recommendations** (prioritized). Each: **Action** (CUT/MERGE/MOVE/CONDENSE/QUESTION/PRESERVE) · **Target** section(s) · **Rationale** · **Estimated word savings**.
6. **Output summary:** current word/section count + model; prioritized recommendations; projected word count; top-3 highest-impact changes first.

### Pass B — Prose (`pass: prose|both`)

1. **Receive and validate content.** If fewer than 3 words, halt — insufficient content.
2. **Determine reader type** — affects what to flag:
   - **Humans:** jargon density, sentence length, passive voice, ambiguous pronouns, buried ledes.
   - **LLM:** ambiguous instructions, undefined terms, implicit context, contradictory statements.
3. **If custom `style_guide` provided**, internalize it (overrides the Microsoft baseline on conflict).
4. **Perform review.** Scan for: ambiguous pronoun references; sentences >25 words without clear structure; passive voice where active is clearer; undefined jargon/acronyms; redundant phrases ("in order to" → "to"); buried key information; inconsistent terminology; unclear antecedents; missing transitions; nominalizations hiding the action ("implementation of" → "implement").
5. **Output findings** as a three-column table:

   | Original Text | Revised Text | Changes |
   |---------------|-------------|---------|
   | exact quote | suggested revision | what changed and why |

6. If no issues found: **"No editorial issues identified."**

## Output

`_context/audit/reviews/editorial-{date}.md` — a structural review section (summary + prioritized recommendations + projected impact) and/or a prose three-column comparison table, per the passes run. A clean bill of health when no issues found.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-07-02 | Butler (v0.4 WS5-B) | Merged `editorial-prose` + `editorial-structure` → one `editorial` skill with a `pass: prose\|structure\|both` parameter (default `both`; structure-then-prose). Both processes preserved verbatim as Pass A/B. Union of phase wire-ins [2,3,4,5,6,7,8,9,11]; output path `editorial-{date}.md`. Canonical-count reduction (2 → 1) per the WS5 counting basis. |
| 1.0 | 2026-04-08 | Alfred | (as `editorial-prose` + `editorial-structure`) Migrated from bmad-editorial-review-{prose,structure}, adapted to coldpress-os schema. |
