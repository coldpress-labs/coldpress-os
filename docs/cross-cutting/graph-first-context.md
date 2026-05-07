---
name: graph-first-context
description: Convention spec for graph-first context loading in skill Step 0 files. Codifies how SKILL.md `graph_queries:` declarations translate into concrete `coldpress graph query` CLI invocations, where to cache results, how to handle staleness, and what fallback behaviour applies.
version: "1.0"
---

# Graph-First Context Loading

> Convention for translating SKILL.md `graph_queries:` declarations into runtime `coldpress graph query` invocations. **Audit punch-list #6** — `coldpress graph query` exists but no step file invokes it; this doc closes that gap and is the wire-in convention for Phase 4+ Step 0 files.

---

## Why graph-first

Skills declare context they need. Pre-graph-first, every step cold-read every artefact (`_context/sacred/prd.md`, `_context/planning/personas-v3.md`, ...). With 9-25 graph_queries per skill × 21 graph-aware skills, cold reads dominate the context budget.

**Graph-first** swaps cold-read for query-result. The `coldpress graph query` CLI returns indexed slices of the graph (only what was asked for) rather than full artefact bodies. Step 0 runs all the queries in one batch, caches the JSON, and downstream steps read the cache.

The catch: the graph is built by `coldpress graph rebuild`, which runs offline. If the graph is stale, queries return outdated content. The **graph-staleness helper** (system review §5.3) is the watchdog.

---

## The contract: `graph_queries:` in SKILL.md frontmatter

Every Phase 4+ skill declares its graph dependencies in frontmatter:

```yaml
inputs:
  graph_queries:
    - "PRD content summary (sections, requirements, features)"
    - "Personas — primary archetypes"
    - "Tech-stack lock + ADR index"
  cold_file_reads:
    - "_context/handoffs/phase-N-to-(N+1)-{date}.md"
  existence_checks:
    - "_context/sacred/prd.md"
```

Three blocks:
- **`graph_queries:`** — what to fetch from the graph (natural-language descriptions). Each entry maps to ≥1 `coldpress graph query` invocation.
- **`cold_file_reads:`** — what to read directly from disk (not in the graph, e.g. handoff logs that change every phase boundary).
- **`existence_checks:`** — gate-blocking presence + status checks (e.g. `prd.locked == true`).

Step 0 of the skill runs all three blocks at the start, in order: graph queries first (cheapest; cached), then cold reads (heavier), then existence checks (decides whether to proceed).

---

## Translation: natural-language → CLI flags

The `coldpress graph query` CLI offers these flags (per `src/cli.ts:109-138`):

```
--node-type <type>       SacredDoc, CodeModule, PrdSection, AdrRecord, Persona, ...
--dir-role <role>        _context/sacred, _context/planning, sandbox, live, ...
--env-tag <tag>          sandbox | live | both | neither
--relation <relation>    implements, descends_from, references, ...
--id <id>                exact node id lookup
--neighbors <id>         list neighbours of <id>
--limit <n>              cap result count
--format <format>        json | pretty (json is default for non-TTY)
```

Translation rules — common patterns:

| Natural-language `graph_queries:` entry | CLI invocation(s) |
|---|---|
| "PRD content summary (sections, requirements, features)" | `coldpress graph query --node-type=PrdSection --format=json` |
| "Personas — primary archetypes" | `coldpress graph query --node-type=Persona --format=json` |
| "Tech-stack lock + ADR index" | `coldpress graph query --node-type=AdrRecord --format=json` + `coldpress graph query --node-type=TechStackLock --format=json` |
| "Architecture components + integration boundaries" | `coldpress graph query --node-type=ArchitectureComponent --format=json` |
| "Brand-guidelines tokens (colour, type, spacing, motion)" | `coldpress graph query --node-type=BrandToken --format=json` |
| "Wave status (Phase 8)" | `coldpress graph query --id=wave-status-v{latest} --format=json` |
| "ADRs related to {component-id}" | `coldpress graph query --neighbors=adr-{slug} --relation=references --format=json` |

**Translation principle:** if the natural-language description names a concrete graph node-type (PrdSection, Persona, AdrRecord, ArchitectureComponent, ...), use `--node-type`. If it names a specific artefact, use `--id`. If it asks for related-to-X, use `--neighbors` + optional `--relation`.

If translation is ambiguous, the step file MUST list the chosen invocations explicitly so future maintainers don't re-derive them.

---

## Cache layout

Results land in:

```
_context/.cache/graph/
  ├── <skill-name>-<step-id>-<query-id>.json
  ├── <skill-name>-<step-id>-<query-id>.meta.json
  └── ...
```

- `<query-id>` is a stable slug derived from the natural-language description (`prd-content-summary`, `personas-primary-archetypes`).
- `.meta.json` sidecar holds: invoked CLI command (verbatim), `cached_at` (ISO), `resume_token` (the same hash from partial-completion), `graph_rebuild_at` (mtime of `.coldpress/graph/index.json`), `result_count`.

`_context/.cache/` is `.gitignore`d (runtime state, not source). The cache is local to one project, one machine, one session.

---

## Cache invalidation

Cache is invalid when ANY of:

1. `graph_rebuild_at` (when the graph was last built) is older than any `derived_from[]` artefact mtime — graph is stale.
2. `resume_token` changed — different inputs (different prd_version, different phase boundary, etc.).
3. `cached_at` is older than 24 hours — TTL guard against forgetting to invalidate.

Any one of these → re-run the query. Otherwise → reuse the cache.

Cache invalidation logic lives in `src/graph/staleness.ts` (already exists per system review).

---

## Step 0 canonical shape (graph-aware)

Every Phase 4+ skill's Step 0 follows this shape:

```markdown
---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load full Phase {N} context; staleness check; existence_checks"
halts_for_input: false
next_step: "step-01-...md"
partial_completion_id: "{skill_name}_step_00"
---

## Goal

{Phase} {entry/exit}. Single-point context load for downstream steps.

## Instructions

### 1. Partial-completion write
`partial_completion: { step_id: "{skill_name}_step_00", at: "started", resume_token: "<hash>" }`.
Hash inputs: skill_name + step_id + relevant version pins + phase boundary handoff path.

### 2. Graph queries (run + cache)
For each `graph_queries:` entry in SKILL.md:
   - Run `coldpress graph query <flags>` (translation per `docs/cross-cutting/graph-first-context.md`).
   - Pipe stdout to `_context/.cache/graph/<skill>-<step>-<query-id>.json`.
   - Write `.meta.json` sidecar with command + cached_at + resume_token + graph_rebuild_at + result_count.
   - If cache exists + valid (per cache-invalidation rules): SKIP query, reuse.

Concrete invocations:
- `coldpress graph query --node-type=PrdSection --format=json` → `_context/.cache/graph/{skill}-step-00-prd-content-summary.json`
- `coldpress graph query --node-type=Persona --format=json` → `_context/.cache/graph/{skill}-step-00-personas.json`
- ...

### 3. Cold file reads
- `<path>` — full content for downstream skill reference

### 4. Existence checks (block on failure)
- `<path>.locked == true` — block

### 5. Graph-staleness check ({Nth}-consumer)
Compare {key artefact}.last_modified vs `.coldpress/graph/index.json` mtime.
If artefact newer: WARN — stale graph; run `coldpress graph rebuild`.

### 6. {Skill-specific notes}

### 7. Partial-completion clean
`at: "graph_loaded"`.

## Output
- N graph queries cached at `_context/.cache/graph/`
- Cold reads loaded
- Existence checks passed; staleness checked

## Navigation
→ Next: [step-01-...md](step-01-...md)
```

The **boldface** parts are the new mechanical wire-ins. Everything else is the existing Step 0 shape.

---

## Fallback when graph empty / unbuildable

If `coldpress graph query` fails (graph index missing, corrupt, not yet built):

1. Step 0 emits a warn to user: "Graph not available — falling back to cold reads. Run `coldpress graph rebuild` to enable graph-first context."
2. Step 0 cold-reads each artefact named in the `graph_queries:` description (best-effort interpretation).
3. Continues normally — graph-first is an optimisation, not a hard prerequisite.

This guarantees the framework runs end-to-end even on a fresh project before the first `coldpress graph rebuild`.

---

## Retrofit status (as of 2026-05-03)

21 skill files declare `graph_queries:` blocks (per audit punch-list #6 inventory). Step 0 wire-in retrofit is **incremental** — each skill is retrofitted when its phase is next touched.

### Retrofitted (sentinel example)

- `lifecycle/7-breakdown/breakdown-entry-sync/steps/step-00-context.md` — Step 2 rewritten with concrete `coldpress graph query` invocations + cache layout. Use as the canonical reference shape.

### Pending retrofit (20 skills)

Phase 4: `create-prd`, `validate-prd`, `planning-entry-sync`, `legacy-assessment`
Phase 6: `architecture-design`
Phase 7: `create-epics`, `create-stories`, `parallelization-strategy`, `sprint-planning`, `implementation-readiness`
Phase 8: `wave-orchestration`
Phase 9: `readiness-check`
Phase 10: `sprint-status`
Phase 11: `retrospective`

Plus Phase 5 skills (design-brief, ux-design, brand-guidelines, prototype, narrative, legacy-ui-assessment) — graph_queries blocks present per Phase 5 deep-dive §7b.

### Retrofit cadence

No sweep wave scheduled. Refine when each phase is next touched for content reasons. Sentinel example demonstrates the pattern.

---

## See also

- [`pattern-7-agent-personas.md`](pattern-7-agent-personas.md) — agent transition emission convention (parallel pattern: convention + buffer + flush + retrofit incrementally)
- [`cross-cutting-skills.md`](cross-cutting-skills.md) — canonical-vs-router pattern for cross-cutting skills
- [`../system-review-2026-05-02.md`](../system-review-2026-05-02.md) §5.2 — original audit finding
- [`../../src/cli.ts`](../../src/cli.ts) lines 81-160 — `coldpress graph` CLI command tree
- [`../../src/commands/graph.ts`](../../src/commands/graph.ts) — query implementation
- [`../../src/graph/staleness.ts`](../../src/graph/staleness.ts) — graph-staleness helper

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (autonomous queue unit #25.1) | Initial graph-first context loading convention spec. Closes audit punch-list #6 (graph CLI documented but unused). Translation rules + cache layout + invalidation + Step 0 canonical shape + fallback + retrofit status. Sentinel example: `lifecycle/7-breakdown/breakdown-entry-sync/steps/step-00-context.md`. Per-skill retrofit deferred (incremental, decision-log #50). |
