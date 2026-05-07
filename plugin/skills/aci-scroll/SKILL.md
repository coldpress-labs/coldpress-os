---
name: aci-scroll
description: Bounded read primitive — read a fixed window of a file and report the cursor position so subsequent steps don't re-read the whole file
license: MIT
compatibility: Invoked by @developer in Phase 6
version: "1.0"
---

## Purpose

Port SWE-agent's *scroll* primitive. Long files exceed Claude Code's per-tool-call line caps (default 2000 lines on `Read`). Naïve responses re-read large windows; ACI scroll reads exactly one bounded window, reports the cursor at the bottom, and lets the next step decide whether to scroll further or jump.

Crucially, the cursor is **explicit** — every scroll's output ends with `→ cursor at line N` so the next step doesn't have to recompute.

**Source decision:** plan §6.6.

## When to Use

- Files that exceed ~500 lines, where the task asks about a specific section.
- Iterative code-walk: read window, decide, read next window.
- After `aci-find-file` resolves a path but you only need a localised section.

## When NOT to Use

- Files known to be small (< 200 lines). Use `Read` directly.
- Bulk understanding tasks where you need to internalise the whole file. `Read` with limit raised is more efficient.
- Searching for a string. Use `aci-search-dir`.

## Process

1. Compute the window range:
   - If input is a line number `N`: read lines `[N, N + windowSize - 1]`.
   - If input is a symbol name: search the file for the symbol's first occurrence, set the start to one line above it (so the signature shows above the body).
2. Use `Read` with `offset` + `limit` set to that window.
3. Format the output with line-number prefixes (the `Read` tool does this natively).
4. Append a single trailer line: `→ cursor at line <last-line-shown>; file ends at line <total>`.

## Output

The window's text + a one-line cursor-position trailer. Designed for the next prompt to consume directly without parsing.

## Critical rules

- **Window is a hard cap.** Don't auto-extend if you "just need a few more lines". The agent's next step decides.
- **Cursor is explicit.** Always emit the trailer so the next step doesn't recompute.
- **Symbol anchors are first-match-only.** Don't enumerate every site; that's `aci-search-dir` territory.

## Why interface, not the runtime

Same rationale as `aci-edit`: the existing `Read` tool with `offset`/`limit` provides the runtime; this skill encodes the discipline (bounded window + explicit cursor) that makes multi-step file-walks tractable.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial ACI scroll primitive — Wave 6 Block HH §6.6. |
