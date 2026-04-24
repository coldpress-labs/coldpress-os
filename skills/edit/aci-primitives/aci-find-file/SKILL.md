---
name: "aci-find-file"
description: "Bounded file-discovery primitive — Glob with capped result count + structured output (path-per-line)"
type: "simple"
category: "edit"
agent: "developer"
phases: [6, 9]
tools: ["Glob"]
inputs:
  - "filename pattern (glob)"
  - "directory scope (defaults to project root)"
  - "result cap (default 25)"
outputs:
  - artifact: "Path list (one per line)"
    location: "stdout"
    format: "text"
version: "1.0"
---

## Purpose

Port SWE-agent's *find_file* primitive. Naïve `find` over a large repo can return thousands of paths; the agent's next-prompt budget can't absorb them. ACI find caps result count + emits one-path-per-line shape so the next step can pick a target without parsing.

Result ordering: matches Glob's modification-time order (newest first) — typically what the agent wants when chasing recent activity.

**Source decision:** plan §6.6.

## When to Use

- Discovering test files for a module (`*.test.ts` matching a name pattern).
- Locating config files (`tsconfig*.json`, `*.config.js`).
- Finding generated artefacts (`dist/**/*.js`, `_context/audit/**/*.json`).
- Resolving "where is X?" questions before `aci-scroll` reads it.

## When NOT to Use

- Searching file CONTENT. Use `aci-search-dir`.
- Looking up a known canonical path (you know it's at `_context/sacred/prd.md`). Use `Read` directly.
- Querying the graph (e.g. "all SacredDoc nodes"). Use `coldpress graph query`.

## Process

1. Invoke `Glob` with:
   - `pattern` (caller-supplied; supports `**` and brace-expansion)
   - `path` (caller-supplied; defaults to project root)
2. Apply the result cap (default 25); record total match count.
3. Emit one path per line.
4. Trailing line: `→ N matches (capped at <cap>; raise --cap to see more)` if truncated.

## Output

```
src/foo.ts
src/bar.ts
test/foo.test.ts
→ 3 matches
```

## Critical rules

- **Capped results.** Default 25; raise on demand. Same budget rationale as `aci-search-dir`.
- **Path-per-line shape.** No trailing metadata per line (no size, no mtime). The agent's next step decides which path matters.
- **Glob, not regex.** This is a path-shape primitive. For regex matches against paths, use `aci-search-dir` against `git ls-files`.

## Why interface, not the runtime

The existing `Glob` tool covers the runtime (modification-time-sorted output, glob semantics). This skill encodes the **discipline** (cap + one-path-per-line shape) so the discovery step plays well in the bounded-step ACI loop.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial ACI find-file primitive — Wave 6 Block HH §6.6. |
