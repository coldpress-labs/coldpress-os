# Subagent Customization Guide — coldpress-os

> How to configure, override, and extend the 8 default subagents for your project.

---

## How Modes Work

Subagent behavior is controlled by **modes** set in `coldpress.yaml`. Butler reads the mode and passes it to the subagent in the task prompt. The subagent adapts its behavior accordingly.

### Default Mode Configuration

```yaml
# coldpress.yaml
agents:
  analyst:
    mode: "full"        # full | brief | creative | strategic
  developer:
    mode: "standard"    # standard | quick
  ux-designer:
    mode: "standard"    # standard | full-spec
```

### What Each Mode Does

**Analyst:**

| Mode | Behavior |
|------|----------|
| `full` | Complete interview + deep research. 10-15 questions. Produces comprehensive `context.md`. |
| `brief` | Product brief + trigger map only. 5 questions. Fast context capture for well-understood projects. |
| `creative` | Brainstorming / design thinking / problem solving mode. Uses techniques from `data/methods/`. |
| `strategic` | Innovation strategy, blue ocean analysis. Long-form strategic thinking. |

**Developer:**

| Mode | Behavior |
|------|----------|
| `standard` | Story-driven. TDD. Full ceremony — reads story spec, creates implementation plan, writes tests first, implements, runs tests, creates handoff artifact. |
| `quick` | Lean spec. Rapid implementation. Minimal docs. For well-understood tasks where ceremony adds overhead. |

**Verifier:**

The verifier has no user-facing modes. It is read-only and structurally-independent — dispatched only by Butler with the spec, acceptance criteria, diff, and run access, never the developer's reasoning. It confirms a story meets its spec and cannot edit code, so there is nothing to tune via `coldpress.yaml`.

**UX Designer:**

| Mode | Behavior |
|------|----------|
| `standard` | UX spec from PRD — wireframes, component breakdown, interaction patterns. |
| `full-spec` | WDS flow — scenarios, sketches, Object IDs, full design system. For design-heavy projects. |

### Changing Modes

Edit `coldpress.yaml`. The change takes effect on the next subagent dispatch — no restart needed.

```yaml
# Switch developer to quick mode for rapid prototyping
agents:
  developer:
    mode: "quick"
```

---

## Overriding an Existing Subagent

To change a subagent's system prompt, model, or tools for your project:

### 1. Edit the Agent File Directly

Agent definitions live in your project at `.claude/agents/{slug}.md`. They're copies, not symlinks — you can edit them freely.

```yaml
---
name: architect
model: sonnet              # Changed from opus to sonnet (cost savings)
tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit                   # Added: let architect create ADR files directly
  - Write
maxTurns: 30               # Increased from 20
---

# Architect — {Your Project}

You are the Architect — the project's technical authority.

[... your customized system prompt ...]
```

### 2. Common Overrides

| Override | Why | How |
|----------|-----|-----|
| **Change model** | Cost or capability | Edit `model:` in frontmatter (`sonnet`, `opus`, `haiku`) |
| **Add tools** | Agent needs to write files | Add `Edit`, `Write` to `tools:` array |
| **Increase maxTurns** | Complex tasks hit the limit | Increase `maxTurns:` value |
| **Customize system prompt** | Project-specific expertise | Edit the markdown body |
| **Add domain context** | Agent needs project-specific knowledge | Add a "Project Context" section to the system prompt |

### 3. What Not to Override

- **Don't change `name:`** — it must match the filename and Butler's routing table
- **Don't remove core tools** like `Read` and `Grep` — agents need them to read the codebase
- **Don't add cross-agent communication** — subagents return results to Butler, they don't call each other

---

## Adding a Custom Subagent

For specialized needs not covered by the 8 defaults.

### Step 1: Create the Agent File

Create `.claude/agents/{slug}.md`:

```yaml
---
name: data-engineer
model: sonnet
tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
color: cyan
maxTurns: 25
---

# Data Engineer

You are the Data Engineer — the project's authority on data pipelines, 
ETL processes, and database optimization.

## Expertise

- Database schema design and optimization
- Data pipeline architecture (batch and streaming)
- Query performance tuning
- Data validation and quality checks

## Context You Need

Always read:
- `coldpress.yaml` — project config
- `_context/sacred/tech-stack.md` — locked technology decisions

Read when available:
- `_context/sacred/architecture.md` — system architecture
- Database schema files

## Artifacts You Produce

| Artifact | Location |
|----------|----------|
| Data model documentation | `_context/planning/data-model.md` |
| Migration scripts | `migrations/` |
| Performance reports | `_context/testing/db-performance.md` |

## Boundaries

- You design and implement data layer code
- You do NOT make product decisions (defer to @pm)
- You do NOT design UI (defer to @ux-designer)
- You DO collaborate with @architect on system-level data decisions

## Handoff Protocol

When done, report: what was built, what was tested, any schema changes, 
recommended next steps. Include file paths for all artifacts produced.
```

### Step 2: Update Butler's Routing

Add the new agent to `.claude/SYSTEM.md`'s routing table:

```markdown
| @data-engineer | Database design, data pipelines, query optimization, migrations |
```

### Step 3: Reference in Skills (Optional)

If you create skills that dispatch to this agent, set `agent: "data-engineer"` in the skill's SKILL.md frontmatter.

### Step 4: Test

```
Ask @data-engineer to review the current database schema
```

Verify Butler dispatches correctly and the agent runs with the right model and tools.

---

## Model Selection Tips

| Consideration | Recommendation |
|---------------|---------------|
| **Cost-sensitive project** | Use `sonnet` for all agents. It handles most tasks well. |
| **Architecture-heavy project** | Keep `architect` on `opus` for deeper reasoning. |
| **Fast iteration / prototyping** | Use `sonnet` broadly; reserve `opus` (architect, reviewer) for deep reasoning. |
| **Complex multi-step reasoning** | Consider `opus` for agents doing long-form analysis (analyst in strategic mode). |

### Model Capabilities

| Model | Strengths | Weaknesses |
|-------|-----------|------------|
| `opus` | Deep reasoning, complex architecture, nuanced analysis | Slower, higher cost |
| `sonnet` | Balanced — good reasoning, fast, cost-effective | May miss subtle architectural tradeoffs |
| `haiku` | Very fast, great for formatting and organization | Shallower reasoning, not for complex decisions |

---

## Tool Permission Patterns

| Pattern | Tools | Use For |
|---------|-------|---------|
| **Read-only** | `Read, Grep, Glob` | Reviewers, analyzers, verifier |
| **Read + execute** | `Read, Grep, Glob, Bash` | Researchers, architects (running tests/checks) |
| **Full write** | `Read, Grep, Glob, Bash, Edit, Write` | Developers, PMs (producing documents), DevOps |
| **Minimal** | `Read` | Lightweight advisory agents |

Be deliberate. An agent with `Write` access can create files — only grant it when the agent's job requires producing artifacts.

---

## Advanced: Parallel Dispatch

Butler can dispatch multiple subagents concurrently when their work is independent. This is configured in Butler's routing logic, not in individual agent files.

Safe parallel pairs:
- `@architect` + `@ux-designer` (different domains, same phase)
- `@developer` + `@developer` (different stories in the same wave)
- `@reviewer` + `@verifier` (independent read-only passes over the same code)

Unsafe (sequential required):
- `@pm` then `@architect` (architecture depends on PRD)
- `@developer` then `@verifier` (verification depends on implementation)

---

## Advanced: Graph-first context gathering

Starting in v0.3, skills that gather project context (sacred docs, code modules, reviews) prefer the Graphify-built knowledge graph over direct filesystem reads when it's warm. The pattern is small and reproducible — if you're authoring a new skill or customising an existing one, follow it.

### The three-step contract

Skills that need project context shell out to `coldpress graph query` via the Bash tool, then fall back to direct reads on exit code `2` (no graph yet):

```bash
# Step 1 — try the graph.
coldpress graph query --node-type SacredDoc --format json > /tmp/q.json
RC=$?

if [ $RC -eq 0 ]; then
    # Step 2 — use the graph result. data[].source_file is the canonical
    # path list; each hit carries enriched metadata (env_tag, dir_role,
    # community id) you'd otherwise re-derive.
    jq -r '.data[].source_file' /tmp/q.json | while read path; do
        # ... process path ...
    done

elif [ $RC -eq 2 ]; then
    # Step 3 — no graph yet; fall back to direct scan.
    ls _context/sacred/*.md | while read path; do
        # ... same processing ...
    done

else
    # Exit 1 = schema error / unexpected failure. Don't fall back — surface
    # the error to the user so they can fix the graph, not paper over it.
    echo "coldpress graph query failed (exit $RC)" >&2
    exit 1
fi
```

**Why exit code 2 vs 1 matters:** skills use the `2` signal as a soft "not warmed up yet — do it the slow way." Exit `1` means something broke and guessing would produce bad output. Keep the distinction; don't collapse them into "anything non-zero means fall back."

### When to migrate a skill to graph-first

- **Yes:** the skill enumerates project artefacts (sacred docs, code modules, reviews) — graph queries are orders of magnitude faster than glob + read.
- **Yes:** the skill composes a cross-artefact query (code implementing a story, tests covering a module) — the graph's edge data gives you that for free.
- **No:** the skill writes or edits a specific known file (e.g., `create-prd` writing `_context/sacred/prd.md`) — graph adds nothing; direct write is correct.
- **No:** the skill needs real-time file content (not just enumeration) — the graph carries metadata, not file bodies.

### Skills currently using the pattern

- `skills/utilities/index-docs` — graph-first for `_context/*` enumeration; falls back to direct scan.
- `skills/reviews/code-audit` — graph-first scope derivation via `--neighbors <story> --relation implements`; falls back to git-diff / ls.

Additional migrations land as we identify context-gathering skills that benefit. See [`docs/graph-query.md`](graph-query.md) for the full query API.

### Pattern documentation

`docs/graph-query.md` is the authoritative reference for the command surface and output shape. When you add a new skill that uses graph-first, list it in `docs/graph-query.md` §"Graph-first pattern — who uses it."

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2026-04-23 | ColdPress Labs | Added "Advanced: Graph-first context gathering" section — documents the `coldpress graph query` exit-code fallback pattern used by `index-docs` + `code-audit`. Part of Wave 4 Block V. |
| 1.0 | 2026-04-13 | ColdPress Labs | Initial subagent customization guide — modes, overrides, custom agents, model selection |
