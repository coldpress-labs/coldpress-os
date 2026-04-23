---
name: "edge-case-hunter"
description: "Walk every branching path and boundary condition to find unhandled edge cases"
type: "simple"
category: "reviews"
phases: [4, 5, 6]
inputs:
  - "code diff, full file, or function to analyze"
outputs:
  - artifact: "Edge Case Findings"
    location: "_context/audit/reviews/edge-cases-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Performs exhaustive path tracing through code to identify every branching path, boundary condition, and edge case. Reports only **unhandled** cases — situations where the code has no guard, no fallback, and no explicit design decision covering the scenario.

## When to Use

- "hunt edge cases"
- "find unhandled paths"
- "trace all branches in this code"
- During code review as a specialized sub-review
- Before finalizing a feature for QA

## Prerequisites

- Code to analyze must be provided (diff, file, or function)
- The code must contain logic worth tracing (not pure data or config)

## Process

1. **Receive content.** Accept the code input. Determine input type:
   - **Diff** — Focus on changed/added paths only
   - **Full file** — Trace all branching logic in the file
   - **Function** — Deep trace of a single function's paths

2. **Exhaustive path analysis.** For every branching construct (`if/else`, `switch`, `try/catch`, `?.`, `??`, ternaries, early returns, loops, async/await boundaries):
   - Map all possible execution paths
   - Identify boundary conditions (null, undefined, empty, zero, negative, overflow, max-length)
   - Check type coercion edge cases
   - Check async race conditions
   - Check collection edge cases (empty array, single item, duplicates)

3. **Filter to unhandled only.** Remove any edge case that:
   - Has an explicit guard or check
   - Is handled by a catch block
   - Is prevented by type system guarantees
   - Has a documented design decision to ignore it

4. **Validate completeness.** Review your findings — have you traced EVERY branch? Re-examine for paths you may have missed.

5. **Output findings** as a structured list. Each finding includes:
   - **Location** — File and line/function reference
   - **Trigger condition** — Exact input or state that triggers the edge case
   - **Guard snippet** — Suggested code to handle it (if applicable)
   - **Potential consequence** — What happens if this edge case is hit in production

6. **Present to user** with summary count and severity distribution.

## Output

A structured findings document with:
- Analysis metadata (scope, input type, date)
- Findings list with location, trigger, guard snippet, and consequence
- Summary statistics
- Recommendation on which findings are highest priority to address

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-review-edge-case-hunter, adapted to coldpress-os schema |
