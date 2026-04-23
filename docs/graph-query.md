---
name: graph-query
description: The coldpress graph query CLI surface — what skills call when they want context from the graph instead of scanning the filesystem
version: "1.0"
---

# `coldpress graph query`

> Skills that need to gather project context (sacred docs, code modules, audits, etc.) prefer the graph when it's available and fall back to direct file reads when it isn't. `coldpress graph query` is the CLI surface for that preference.

**When graph data is available**, skills get deterministic, enriched results — every hit carries `coldpress.{node_type, env_tag, dir_role}` metadata, community ids, edge relations — without opening any files.

**When graph data is stale or absent**, the command exits with code `2` and a machine-readable `{ error: "no_graph" }` payload. Skills detect this and fall back to the direct-file-read path they shipped with.

---

## Usage

```bash
coldpress graph query [options]
```

### Options

| Flag | Purpose |
|------|---------|
| `--node-type <type>` | Filter nodes by `coldpress.node_type` — `SacredDoc` / `Document` / `Artefact` / `CodeModule` / `CodeSymbol` / `CredentialName` / `Input`. |
| `--dir-role <role>` | Filter nodes by `coldpress.dir_role` — `_context/sacred` / `_context/planning` / `sandbox` / `live` / etc. |
| `--env-tag <tag>` | Filter nodes by `coldpress.env_tag` — `sandbox` / `live` / `both` / `neither`. |
| `--relation <rel>` | Filter edges by relation — `implements` / `descends_from` / `imports_from` / etc. |
| `--id <id>` | Look up a specific node by id. |
| `--neighbors <id>` | List neighbours of the given node. Combines with `--relation` to scope to one edge type. |
| `--limit <n>` | Cap the number of results returned. |
| `--format <fmt>` | Output format — `json` (default when stdout is non-TTY, consumed by skills) or `pretty` (default when stdout is a TTY, human-readable). |

### Filter composition

Node filters (`--node-type`, `--dir-role`, `--env-tag`) compose via AND. Example: "sacred docs in the planning phase that were promoted to live":

```bash
coldpress graph query --node-type SacredDoc --dir-role _context/sacred --env-tag live
```

`--relation` is an edge-only filter. It can combine with `--neighbors <id>` to restrict neighbourhood queries by edge type.

`--id` and `--neighbors` are mutually exclusive with node filters (exact-lookup / neighbourhood-lookup vs. bulk-filter). When multiple categories are passed, precedence is: `--id` > `--neighbors` > `--relation` > node filters.

---

## Exit codes

| Code | Meaning | Skill response |
|------|---------|----------------|
| `0` | Query ran successfully. May return an empty set — that's still a successful query. | Use the result. |
| `2` | No graph found (`.coldpress/graph/graph.json` missing). | Fall back to direct file reads. |
| `1` | Schema-invalid graph or query error. | Surface the error to the user; **do not** fall back — the user should fix the graph. |

Skills rely on the `2` vs `1` distinction to decide between graceful fallback and user-visible failure.

---

## Output shape

JSON mode emits a single object per invocation:

```jsonc
{
  "kind": "nodes",                      // "nodes" | "edges" | "node" | "stats"
  "query": { "nodeType": "SacredDoc" }, // echo of the flags, for logs / trace
  "data": [ /* Node | Edge | Node[] | null */ ],
  "count": 3,                           // total matches (pre-limit)
  "graph_path": "/abs/path/.coldpress/graph/graph.json"
}
```

`count` is the **total** match count before `--limit` trims; `data.length` may be smaller if a limit was applied. This lets a skill report "showing 10 of 142 matches" without extra round-trips.

When `--id` is passed, `kind` is `"node"` and `data` is either a single `Node` object or `null` for not-found.

---

## Idiomatic skill pattern

A skill that needs "all sacred docs in the current project" looks like this at the step-file level:

```markdown
## Step 1 — Gather sacred docs

**Graph-first path** (preferred):

```bash
coldpress graph query --node-type SacredDoc --format json
```

Parse the JSON. If `$?` == 0, use `data[].source_file` — these are the
project-relative paths of every sacred doc the graph knows about.

If `$?` == 2 (no graph yet), fall back to the glob path:

```bash
ls _context/sacred/*.md
```

If `$?` == 1, report the error to the user and halt — don't silently
guess at the file set.
```

The CLI command is designed to be consumed by these prose instructions — Butler (or any subagent with `Bash` access) runs it, reads the JSON, and continues.

---

## Examples

### "Which subagent handoff schemas exist?"

```bash
coldpress graph query --dir-role _context/sacred --format json \
  | jq '.data[] | { id, label, source_file }'
```

### "All code modules in live/ implementing the auth story"

```bash
# 1. Find the auth story node.
STORY_ID=$(coldpress graph query --node-type Document --dir-role _context/planning --format json \
  | jq -r '.data[] | select(.label | test("auth")) | .id' | head -1)

# 2. Find live code modules that implement it.
coldpress graph query --neighbors "$STORY_ID" --relation implements --format json \
  | jq '.data[] | select(.coldpress.env_tag == "live")'
```

### "What does this code module depend on?"

```bash
coldpress graph query --neighbors auth --relation imports_from
```

### Pretty-print on a terminal

```bash
coldpress graph query --node-type CodeModule --limit 20
```

Pretty mode emits one line per item with node type + id + label — good for eyeballing a project's shape without drilling into JSON.

---

## Performance

- **Graph-load + validate**: <100 ms for graphs up to ~10k nodes (JSON parse + in-memory Zod validation).
- **Filter by node_type / dir_role / env_tag**: O(n) over nodes, ~1 ms on typical corpora.
- **Neighbour traversal**: O(degree) after a one-time edge index build (lazy, cached for the command's lifetime).

These numbers make `coldpress graph query` cheaper than re-globbing and re-reading a project's prose files, which is the rationale for graph-first over direct-read. When a graph is unavailable or stale, direct reads remain correct (just slower and without enrichment).

Performance at >10k nodes degrades — that's the point where the deferred SQLite + `sqlite-vec` layer earns its keep (recursive CTEs, FTS5, vector retrieval). For v0.3 the in-memory JSON path is sufficient.

---

## Graph-first pattern — who uses it

Skills migrated to the graph-first pattern (growing list):

- [`skills/utilities/index-docs`](../skills/utilities/index-docs/SKILL.md) — enumerates project docs; graph-first, falls back to filesystem scan.
- [`skills/reviews/code-audit`](../skills/reviews/code-audit/SKILL.md) — derives audit scope; graph-first for code-module enumeration, falls back to explicit file list.

Additional migrations land in Wave 4 (Lifecycle Alignment) — every context-gathering skill should prefer the graph when it's warm.

---

## See also

- [`docs/graph-schema.md`](graph-schema.md) — node types, relations, the coldpress extension namespace.
- [`src/graph/index.ts`](../src/graph/index.ts) — the `Graph` class underpinning the CLI.
- [`src/commands/graph.ts`](../src/commands/graph.ts) — the CLI implementation.
