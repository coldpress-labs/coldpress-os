---
name: "distillator"
description: "Lossless LLM-optimized compression of source documents into dense distillates"
type: "simple"
category: "utilities"
phases: [2, 4, 5, 6, 8]
inputs:
  - "source document(s) to compress"
outputs:
  - artifact: "Distillate"
    location: "_context/distillates/{source-name}-distillate.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Compresses documents into token-efficient distillates while preserving every fact, decision, constraint, and relationship. Produces output optimized for LLM consumption — maximum information density with zero data loss.

## When to Use

- "distill this document"
- "compress this for context"
- "create a distillate"
- When loading large documents into LLM context and token budget is tight
- When creating portable summaries for cross-agent handoffs
- When archiving decisions for future reference

## Prerequisites

- Source document(s) must be provided (file path, inline content, or glob pattern)
- Documents should contain substantive content (not just templates or boilerplate)

## Process

1. **Receive and analyze source(s).** Determine:
   - Single document or multiple sources
   - Document type (PRD, architecture, meeting notes, research, etc.)
   - Approximate token count
   - Whether splitting is needed (>5K tokens → consider fan-out)

2. **Apply compression rules:**

   **Strip:**
   - Transitional phrases ("As mentioned above", "It's worth noting that")
   - Rhetorical questions and filler
   - Self-referential meta-text ("This document describes...")
   - Common knowledge that the consumer would already know
   - Hedging language ("perhaps", "it might be", "arguably")

   **Preserve (never remove):**
   - Numbers, dates, measurements, thresholds
   - Named entities (people, systems, APIs, tools)
   - Decisions and their rationale
   - Constraints and requirements
   - Relationships and dependencies

   **Transform:**
   - Prose paragraphs → dense bullet lists
   - "The system will need to handle authentication using JWT tokens" → "Auth: JWT"
   - Verbose conditionals → compact if/then notation

   **Deduplicate:**
   - When the same information appears in multiple sections, keep one instance
   - When sources conflict, note the conflict explicitly

3. **For large documents (>5K tokens),** apply semantic splitting:
   - Identify natural section boundaries
   - Produce a root distillate with orientation and cross-cutting items
   - Create self-contained section distillates (3K-5K tokens each)

4. **Format output** with frontmatter:
   ```yaml
   ---
   source: "{original file}"
   distilled: "{date}"
   token_estimate: {N}
   compression_ratio: "{X}:1"
   ---
   ```

5. **Validate** — mentally reconstruct the source from the distillate. If any fact cannot be recovered, the compression was lossy. Add it back.

## Output

A markdown distillate file with frontmatter metadata, optimized for LLM consumption. For split documents: a root distillate plus section files.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-distillator, adapted to coldpress-os schema |
