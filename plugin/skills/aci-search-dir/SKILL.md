---
name: aci-search-dir
description: "Bounded directory-scoped search primitive — Grep with capped result count + structured output (file:line:snippet)"
license: MIT
compatibility: Invoked by @developer in Phase 6
allowed-tools: "Grep"
version: "1.0"
---

## Purpose

Port SWE-agent's *search_dir* primitive. Naïve grep over a large repo returns hundreds of matches the next prompt drowns in. ACI search caps result count + emits `file:line:snippet` shape (one match per line) so the next step can pick a target without re-parsing.

**Source decision:** plan §6.6.

## When to Use

- Locating call sites before editing a function (pair with `aci-edit`).
- Finding how a symbol is used across the codebase before refactor.
- Discovering test files that reference a module under change.

## When NOT to Use

- Finding a single specific file by name. Use `aci-find-file`.
- Whole-repo statistics (count occurrences across N files). Use `Grep` with `output_mode: count`.
- Querying the derived trace graph instead of disk. Use `coldpress trace` (`why` / `impact` / `orphans`).

## Process

1. Invoke `Grep` with:
   - `pattern` (caller-supplied; regex)
   - `path` (caller-supplied; defaults to project root)
   - `output_mode: "content"`, `-n: true` (line numbers always on)
   - `head_limit` (caller-supplied result cap, default 50)
2. Parse each result line as `path:line:content`.
3. Truncate each snippet to ~120 chars (drop trailing whitespace; replace embedded newlines with `\n`).
4. Trailing line: `→ N matches (capped at <cap>; raise --cap to see more)` if truncated.

## Output

```
src/foo.ts:42:export function frob(x: number) {
src/foo.ts:88:  frob(42);
test/foo.test.ts:14:  expect(frob(0)).toBe(...);
→ 3 matches
```

Designed for the next prompt to scan visually + pick a target file:line.

## Critical rules

- **Capped results.** Default 50; raise on demand. Never return unbounded — it kills the agent's next-prompt budget.
- **Snippet is one line.** Multi-line matches collapse with `\n` for visual one-per-row scan.
- **No false-positive culling.** This skill returns raw grep output; semantic filtering ("is this a real call site or a comment?") is the next step's job.

## Why interface, not the runtime

The existing `Grep` tool covers the runtime (ripgrep with line numbers, output modes, head limits, type filters). This skill encodes the **discipline** (cap result count + structured one-line-per-match shape) so the search step plays well in the bounded-step ACI loop.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial ACI search-dir primitive — Wave 6 Block HH §6.6. |
